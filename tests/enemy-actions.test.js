import test from 'node:test';
import assert from 'node:assert/strict';
import * as combatModule from '../src/combat.js';
import {newRun} from '../src/campaign.js';

const enemy=(uid,overrides={})=>({uid,typeId:'walker',hp:100,maxHp:100,position:6,shield:0,burn:0,burnTurns:0,wet:0,slow:false,boost:0,controlledAt:-2,attackCount:0,...overrides});
function run(enemies,overrides={}){
  const state=newRun(123);
  state.inventory=[];state.magazine.fill(null);state.bonds=[];state.enemies=enemies;
  state.hp=100;state.maxHp=100;state.shield=0;state.traits={};
  return Object.assign(state,overrides);
}
const resolve=(enemies,overrides)=>combatModule.resolveRound(run(enemies,overrides));
const movement=f=>f.movements?.map(({uid,from,to})=>({uid,from,to}));

test('presentation groups actual movement around intervening attacks without changing raw resolution',()=>{
  const input=run([enemy('first'),enemy('attacker',{position:0}),enemy('last',{typeId:'runner',position:5})]);
  const before=structuredClone(input),result=combatModule.resolveRound(input);
  assert.deepEqual(input,before);
  assert.equal(result.state.hp,94);assert.equal(result.state.rng,input.rng);
  assert.deepEqual(result.frames.map(f=>f.action),['move','melee','move']);
  assert.deepEqual(result.frames.map(f=>f.board.enemies.map(e=>e.position)),[[5,0,5],[5,0,5],[5,0,3]]);
  assert.deepEqual(result.enemyPhase.startBoard.enemies.map(e=>e.position),[6,0,5]);
  const [moves,attack]=result.presentationFrames;
  assert.equal(moves.action,'move');assert.equal(moves.duration,600);
  assert.deepEqual(movement(moves),[{uid:'first',from:6,to:5},{uid:'last',from:5,to:3}]);
  assert.equal(moves.board.hp,100,'movement never previews the later attack damage');
  assert.equal(attack.action,'melee');assert.equal(attack.duration,480);
  assert.equal(attack.board.hp,94);assert.deepEqual(attack.board.enemies.map(e=>e.position),[5,0,3]);
  assert.equal(result.presentationFrames.length,2);
});

test('slow and boss minimum movement expose real endpoints without inventing travel',()=>{
  const result=resolve([enemy('stopped',{slow:true}),enemy('runner',{typeId:'runner',slow:true}),enemy('boss',{typeId:'boss3',slow:true})]);
  assert.deepEqual(result.state.enemies.map(e=>e.position),[6,5,5]);
  assert.equal(result.frames[0].action,'wait');assert.deepEqual(result.frames[0].movements,[]);
  const moves=result.presentationFrames.find(f=>f.action==='move');
  assert.deepEqual(movement(moves),[{uid:'runner',from:6,to:5},{uid:'boss',from:6,to:5}]);
  assert.ok(result.presentationFrames.at(-1).board.enemies.every(e=>e.slow===false));
});

test('enemy attacks expose shooter, attack kind, damage and absorption independently of later state',()=>{
  const result=resolve([enemy('melee',{position:0,boost:2}),enemy('ranged',{typeId:'spear',position:3}),enemy('blast',{typeId:'bomber',position:0})],{shield:5});
  assert.deepEqual(result.frames.map(f=>f.action),['melee','ranged','explode']);
  assert.deepEqual(result.frames.map(f=>f.actor.uid),['melee','ranged','blast']);
  assert.deepEqual(result.frames.map(f=>[f.amount,f.absorbed,f.playerDamage]),[[8,5,3],[4,0,4],[10,0,10]]);
  assert.equal(result.frames[0].actor.boost,2,'actor records the attack windup, including consumed boost');
  assert.equal(result.state.enemies[0].boost,0);assert.equal(result.state.hp,83);
  assert.equal(result.state.stats.kills,0,'bomber self-destruction is not a player kill');
  assert.ok(!result.presentationFrames.at(-1).board.enemies.some(e=>e.uid==='blast'));
});

test('healing and priest buffs retain ordered target selection and boosted damage',()=>{
  const result=resolve([enemy('healer',{typeId:'healer',position:3,heal:9}),enemy('priest',{typeId:'boss2',position:3,attackCount:1}),enemy('ally',{position:0,hp:50})]);
  const [heal,buff,attack]=result.frames;
  assert.equal(heal.action,'heal');assert.equal(heal.actor.uid,'healer');assert.equal(heal.targetId,'ally');assert.equal(heal.amount,9);
  assert.equal(heal.board.enemies.find(e=>e.uid==='ally').hp,59);
  assert.equal(buff.action,'buff');assert.equal(buff.actor.uid,'priest');assert.deepEqual(buff.affectedIds,['ally','healer']);
  assert.equal(attack.amount,8);assert.equal(result.state.hp,92);
  assert.equal(result.state.enemies.find(e=>e.uid==='ally').boost,0);
});

test('drummer movement is recorded without changing whether its ally attacks this turn',()=>{
  const result=resolve([enemy('drummer',{typeId:'drummer',position:4}),enemy('ally',{typeId:'runner',position:1})]);
  assert.deepEqual(result.frames.map(f=>f.action),['move','melee']);
  assert.equal(result.state.hp,95,'drummer moves ally into range before ally acts');
  assert.equal(result.frames[0].board.enemies[1].position,1,'raw frame keeps its original earlier snapshot');
  assert.deepEqual(movement(result.presentationFrames[0]),[{uid:'drummer',from:4,to:3},{uid:'ally',from:1,to:0}]);
  const support=result.presentationFrames.find(f=>f.action==='buff');
  assert.equal(support.actor.uid,'drummer');assert.deepEqual(support.affectedIds,['ally']);
  assert.equal(result.presentationFrames.find(f=>f.action==='melee').actor.position,0);
});

test('boss shield support has an animation while retaining the original movement frame and log',()=>{
  const result=resolve([enemy('boss',{typeId:'boss1'}),enemy('ally',{position:4,shield:2})]);
  assert.equal(result.frames.length,2);assert.equal(result.state.logs.length,2);
  assert.ok(Array.isArray(result.presentationFrames));
  const support=result.presentationFrames.find(f=>f.action==='buff');
  assert.equal(support.actor.uid,'boss');assert.deepEqual(support.affectedIds,['ally']);
  assert.equal(support.board.enemies.find(e=>e.uid==='ally').shield,6);
  assert.equal(result.presentationFrames[0].board.enemies.find(e=>e.uid==='ally').shield,2,'movement starts before support takes effect');
});

test('counter splash kills a later enemy before it can move and stays after the initiating attack',()=>{
  const c=new combatModule.Combat(run([enemy('attacker',{position:0}),enemy('victim',{position:1,hp:4})]));
  c.active.add('E08');c.s.evolutions.E08={progress:5};c.counterPool.push('R11');
  const result=c.execute();
  assert.equal(result.state.hp,94);assert.deepEqual(result.state.enemies.map(e=>e.uid),['attacker']);
  assert.deepEqual(result.frames.map(f=>f.type),['enemy','shot','status','shot']);
  assert.ok(Array.isArray(result.presentationFrames));
  assert.ok(!result.presentationFrames.some(f=>f.movements?.some(m=>m.uid==='victim')));
  assert.equal(result.presentationFrames[0].action,'melee');
  assert.equal(result.presentationFrames.find(f=>f.killed).targetId,'victim');
});

test('lethal attacks stop later movement, counters and bomber self-destruction as before',()=>{
  const c=new combatModule.Combat(run([enemy('blast',{typeId:'bomber',position:0}),enemy('later',{wet:1,slow:true})],{hp:5}));
  c.counterPool.push('R11');const result=c.execute();
  assert.equal(result.frames.length,1);assert.equal(result.frames[0].action,'explode');
  assert.equal(result.state.hp,0);assert.equal(result.state.enemies[0].hp,100);
  assert.equal(result.state.enemies[1].position,6);assert.equal(result.state.enemies[1].wet,0);assert.equal(result.state.enemies[1].slow,false);
  assert.ok(!result.presentationFrames.some(f=>f.action==='move'));
  assert.deepEqual(result.presentationFrames.at(-1).board,result.enemyPhase.endBoard);
});

test('presentation conversion is repeatable and cannot mutate raw snapshots or player hit frames',()=>{
  const state=run([enemy('first'),enemy('second')]);
  state.inventory=[{uid:'bullet',typeId:'F15',counter:0,mark:null,temp:{}}];state.magazine[0]='bullet';
  const result=combatModule.resolveRound(state),raw=structuredClone(result.frames),phase=structuredClone(result.enemyPhase);
  assert.equal(typeof combatModule.combatPresentationFrames,'function');
  const presentation=combatModule.combatPresentationFrames(result);
  assert.deepEqual(presentation,result.presentationFrames);assert.deepEqual(presentation[0],raw[0]);
  presentation[0].target.hp=0;presentation.find(f=>f.action==='move').movements[0].to=99;
  assert.deepEqual(result.frames,raw);assert.deepEqual(result.enemyPhase,phase);
});

test('multiple drummers keep the per-ally boost limit and combine repeated movement endpoints',()=>{
  const result=resolve([enemy('d1',{typeId:'drummer',position:6}),enemy('d2',{typeId:'drummer',position:5}),enemy('ally',{position:4})]);
  assert.deepEqual(result.state.enemies.map(e=>e.position),[4,4,2]);
  assert.deepEqual(movement(result.presentationFrames[0]),[
    {uid:'d1',from:6,to:4},{uid:'ally',from:4,to:2},{uid:'d2',from:5,to:4}
  ]);
  assert.deepEqual(result.presentationFrames.filter(f=>f.action==='buff').map(f=>f.affectedIds),[['ally'],['d1']]);
  for(const frame of result.presentationFrames)assert.deepEqual(frame.board.enemies.map(e=>e.position),[4,4,2]);
});

test('counter push remains after the attack instead of joining the enemy advance animation',()=>{
  const c=new combatModule.Combat(run([enemy('attacker',{position:0}),enemy('walker')],{shield:6}));
  c.active.add('D19');const result=c.execute();
  assert.deepEqual(movement(result.presentationFrames.find(f=>f.action==='move')),[{uid:'walker',from:6,to:5}]);
  const attack=result.presentationFrames.find(f=>f.action==='melee'),push=result.presentationFrames.find(f=>f.text==='击退');
  assert.equal(attack.actor.position,0);assert.equal(attack.board.enemies[0].position,0);
  assert.equal(push.board.enemies[0].position,1);
  assert.equal(result.state.enemies[0].hp,88);assert.equal(result.state.enemies[0].position,1);
});

test('counter push creates a boundary before a drummer can advance the same enemy again',()=>{
  const c=new combatModule.Combat(run([
    enemy('early',{position:5}),enemy('attacker',{position:0}),
    enemy('drummer',{typeId:'drummer',position:6}),enemy('later',{typeId:'runner'})
  ],{shield:6}));
  c.active.add('D19');const result=c.execute(),raw=structuredClone(result.frames);
  const frames=result.presentationFrames,pushIndex=frames.findIndex(f=>f.text==='击退');
  const push=frames[pushIndex];
  assert.equal(push.board.enemies.find(e=>e.uid==='attacker').position,1,'the counter displacement must remain visible');
  const moves=frames.filter(f=>f.action==='move');
  assert.equal(moves.length,2,'only movement on the same side of the displacement can be grouped');
  assert.deepEqual(movement(moves[0]),[{uid:'early',from:5,to:4}]);
  assert.deepEqual(movement(moves[1]),[
    {uid:'drummer',from:6,to:5},{uid:'attacker',from:1,to:0},{uid:'later',from:6,to:4}
  ]);
  assert.ok(frames.indexOf(moves[0])<pushIndex);assert.ok(frames.indexOf(moves[1])>pushIndex);
  assert.equal(moves[1].board.enemies.find(e=>e.uid==='attacker').hp,88,'the second group starts after counter damage');
  assert.equal(moves[1].board.enemies.find(e=>e.uid==='attacker').position,0);
  assert.equal(moves[1].board.shield,0);
  assert.deepEqual(result.frames,raw,'presentation segmentation must not edit the raw timeline');
  assert.deepEqual(combatModule.combatPresentationFrames(result),frames,'segmentation stays deterministic');
  assert.deepEqual(frames.at(-1).board,result.enemyPhase.endBoard);
});
