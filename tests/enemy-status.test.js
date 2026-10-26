import test from 'node:test';
import assert from 'node:assert/strict';
import {enemyStatusList} from '../src/enemy-status.js';
import {newRun} from '../src/campaign.js';
import {Combat,resolveRound} from '../src/combat.js';

const enemy=overrides=>({uid:'enemy',typeId:'walker',hp:100,maxHp:100,position:6,shield:0,burn:0,burnTurns:0,wet:0,slow:false,boost:0,controlledAt:-2,attackCount:0,...overrides});
const ids=e=>enemyStatusList(e).map(s=>s.id);
function combat(overrides={}){
  const run=newRun(123);run.enemies=[enemy(overrides)];run.magazine.fill(null);
  return new Combat(run);
}
function loadedRun(types,enemies=[enemy()]){
  const run=newRun(123);run.enemies=enemies;
  run.inventory=types.map((typeId,i)=>({uid:`b${i}`,typeId,counter:0,mark:null,temp:{}}));
  run.magazine=Array.from({length:12},(_,i)=>run.inventory[i]?.uid||null);
  return run;
}

test('all active statuses use the shared pixel icon names and precise detail labels',()=>{
  const list=enemyStatusList(enemy({burn:3,burnTurns:2,wet:2,slow:true,shield:6,windMark:'b1',boost:2}));
  assert.deepEqual(list.map(s=>s.id),['burn','wet','slow','shield','windMark','boost']);
  assert.equal(list[0].count,3);assert.match(list[0].label,/燃烧.*3.*层.*2.*回合/);
  assert.match(list[0].label,/敌人行动前/);
  assert.equal(list[1].count,undefined);assert.match(list[1].label,/潮湿.*2.*回合/);
  assert.match(list[2].label,/缓行.*移动.*1/);
  assert.equal(list[3].count,6);assert.match(list[3].label,/护盾.*6/);
  assert.match(list[4].label,/风标/);assert.match(list[4].label,/本夹/);
  assert.equal(list[5].count,2);assert.match(list[5].label,/鼓舞.*下次攻击.*2/);
  assert.deepEqual(list.map(s=>s.icon),['fire','water','timer','shield','wind','talent']);
});

test('empty, expired, malformed and defeated enemies never gain fictitious states',()=>{
  for(const input of [undefined,null,{},enemy(),enemy({hp:0,burn:2,burnTurns:2,wet:1}),
    enemy({burn:2,burnTurns:0}),enemy({burn:0,burnTurns:2}),
    enemy({burn:NaN,burnTurns:2,wet:-1,shield:Infinity,boost:-2,slow:false,windMark:''}),
    enemy({burn:'2',burnTurns:2,wet:'1',shield:'6',boost:true,slow:'yes',windMark:false})])assert.deepEqual(enemyStatusList(input),[]);
});

test('each list is derived only from its supplied snapshot without mutating it',()=>{
  const before=Object.freeze(enemy({burn:2,burnTurns:1,wet:1,slow:true,shield:3,windMark:'b1',boost:2}));
  const baseline=structuredClone(before),first=enemyStatusList(before);
  const expired=Object.freeze({...before,burn:0,burnTurns:0,wet:0,slow:false,shield:0,windMark:undefined,boost:0});
  assert.equal(first.length,6);assert.deepEqual(enemyStatusList(expired),[]);
  assert.deepEqual(before,baseline);assert.deepEqual(enemyStatusList(before),first);
  first[0].label='modified';assert.notEqual(enemyStatusList(before)[0].label,'modified');
});

test('actual combat application and turn expiry are visible from the correct frame',()=>{
  const c=combat();const target=c.s.enemies[0];
  c.burn(target,2);c.wet(target);c.control(target,'slow');
  c.current={uid:'b1'};c.mark(target);c.frame('status','状态快照');
  const applied=c.frames.at(-1).board.enemies[0];
  assert.deepEqual(ids(applied),['burn','wet','slow','windMark']);
  target.burnTurns=1;target.wet=1;
  const result=c.execute();
  assert.deepEqual(enemyStatusList(result.state.enemies[0]),[]);
  assert.deepEqual(ids(applied),['burn','wet','slow','windMark'],'previous frame retains its own active statuses');
});

test('shield depletion and the actual boosted attack remove their indicators',()=>{
  const c=combat({position:0,shield:6,boost:2}),target=c.s.enemies[0];
  c.damage(target,4,'fire');
  assert.equal(enemyStatusList(c.frames.at(-1).board.enemies[0]).find(s=>s.id==='shield').count,2);
  c.damage(target,2,'fire');
  assert.deepEqual(ids(c.frames.at(-1).board.enemies[0]),['boost']);
  c.enemyPhase();
  assert.deepEqual(enemyStatusList(c.frames.at(-1).board.enemies[0]),[]);
});

test('real fire, water and wind bullets show their new state on the applying hit, before a later kill',()=>{
  for(const [bullet,status,damage] of [['F01','burn',8],['H16','wet',8],['W15','windMark',9]]){
    const run=loadedRun(['H15',bullet,'F15'],[enemy({hp:32,maxHp:32})]),before=structuredClone(run);
    const result=resolveRound(run),hit=result.frames.find(f=>f.sourceId===bullet);
    assert.deepEqual(ids(hit.board.enemies[0]),[status],`${bullet} applies on its own hit frame`);
    assert.deepEqual(ids(hit.target),[status],`${bullet} target snapshot stays in sync`);
    assert.deepEqual(ids(result.frames[0].board.enemies[0]),[],'preceding hit stays untouched');
    assert.equal(hit.amount,damage);assert.equal(hit.hpDamage,damage);
    assert.equal(hit.target.hp,20-damage);assert.equal(hit.target.position,6);
    assert.equal(result.frames.length,3,'status attachment adds no playback delay frames');
    assert.equal(result.state.enemies.length,0);assert.equal(result.state.stats.damage,32);
    assert.equal(result.state.stats.kills,1);assert.deepEqual(run,before,'input run remains immutable');
  }
});

test('F02 applies burn to its living neighbor without changing the killed hit target',()=>{
  const run=loadedRun(['F02'],[enemy({uid:'front',hp:6,maxHp:6,position:5}),enemy({uid:'neighbor',position:6})]);
  const result=resolveRound(run),hit=result.frames.find(f=>f.sourceId==='F02');
  assert.equal(hit.killed,true);assert.equal(hit.amount,6);
  assert.equal(hit.target.uid,'front');assert.equal(hit.target.hp,0);assert.equal(hit.target.burn,0);
  const neighbor=hit.board.enemies.find(e=>e.uid==='neighbor');
  assert.equal(neighbor.hp,100);assert.equal(neighbor.position,6);
  assert.deepEqual(ids(neighbor),['burn']);assert.equal(neighbor.burn,2);assert.equal(neighbor.burnTurns,2);
  assert.equal(result.state.enemies[0].hp,96);assert.equal(result.state.enemies[0].burnTurns,1);
});

test('status snapshot updates touch only latest-frame status fields, never health or coordinates',()=>{
  const c=combat(),target=c.s.enemies[0];
  c.damage(target,1,'fire');const previous=structuredClone(c.frames[0]);
  c.damage(target,2,'water');const latest=c.frames.at(-1),before=structuredClone(latest);
  target.position=3;c.current={uid:'marker'};
  c.burn(target,2);c.wet(target);c.mark(target);
  assert.deepEqual(c.frames[0],previous);
  const withoutNewStatus=f=>{
    const copy=structuredClone(f);
    for(const snapshot of [...copy.board.enemies,copy.target])if(snapshot){
      snapshot.burn=0;snapshot.burnTurns=0;snapshot.wet=0;delete snapshot.windMark;
    }
    return copy;
  };
  assert.deepEqual(withoutNewStatus(latest),before);
  assert.equal(latest.target.position,6);assert.equal(latest.target.hp,97);
  assert.deepEqual(ids(latest.target),['burn','wet','windMark']);assert.equal(c.frames.length,2);
  c.replay=true;const frozenFrame=structuredClone(latest),frozenState=structuredClone(c.s);
  c.burn(target,3);c.wet(target);c.mark(target);
  assert.deepEqual(latest,frozenFrame);assert.deepEqual(c.s,frozenState,'echo applies no status or snapshot changes');
});
