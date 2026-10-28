import test from 'node:test';
import assert from 'node:assert/strict';
import {Combat,combatPresentationFrames,resolveRound} from '../src/combat.js';
import {effects} from '../src/combat-effects.js';
import {BULLETS,BULLET_MAP} from '../src/catalog.js';
import {newRun} from '../src/campaign.js';

function setup(id,positions=[3],hp=500){
  const run=newRun(420);run.inventory=[{uid:'spell',typeId:id,counter:BULLET_MAP[id].counter,mark:null,temp:{}}];
  run.magazine=Array(12).fill(null);run.magazine[0]='spell';run.bonds=[];run.summons=[];run.shield=0;run.resources.draft=0;
  run.enemies=positions.map((position,i)=>({uid:`e${i}`,typeId:'walker',position,lane:i%3,hp,maxHp:hp,shield:0,wet:0,burn:0,burnTurns:0,controlledAt:-2,slow:false,attackCount:0,boost:0}));
  const c=new Combat(run);c.slot=0;c.current=c.layout[0];c.currentDef=BULLET_MAP[id];c.hitTargets=[];return c;
}

test('a small explosion hits every crowded target inside its inclusive radius once',()=>{
  const positions=[3,...Array(10).fill(3),2,4,1,5];
  const c=setup('F08',positions);c.s.selectedTarget='e0';effects.F08(c);
  assert.deepEqual(c.s.enemies.map(e=>500-e.hp),[6,...Array(12).fill(4),0,0]);
  assert.equal(c.frames.filter(f=>f.hpDamage>0).length,13);
  const before=structuredClone(c.frames),frames=combatPresentationFrames({frames:c.frames});
  assert.deepEqual(c.frames,before);assert.equal(frames.length,1);
  assert.equal(frames[0].type,'explosion');assert.equal(frames[0].blast.victims.length,13);
  assert.equal(frames[0].blast.radius,1);assert.equal(frames[0].blast.center.position,3);
  assert.equal(frames[0].hpDamage,54);
});

test('killing the explosion center preserves its footprint; kill blasts cannot recursively detonate',()=>{
  const c=setup('F10',[3,3,4,5],5);c.s.selectedTarget='e0';effects.F10(c);
  assert.deepEqual(c.s.enemies.map(e=>e.hp),[0,0,0,5]);
  assert.equal(c.s.stats.kills,3);assert.equal(c.s.resources.draft,30);
  const frames=combatPresentationFrames({frames:c.frames});
  assert.equal(frames.filter(f=>f.type==='explosion').length,1);
  assert.equal(frames.at(-1).secondary,true);
  assert.equal(frames.at(-1).blast.victims.length,2);
});

test('explosion snapshots include burn and crowd control on every surviving victim',()=>{
  for(const id of ['F06','H13']){
    const c=setup(id,Array(12).fill(3));effects[id](c);
    const frame=combatPresentationFrames({frames:c.frames})[0];
    assert.equal(frame.blast.victims.length,12);
    for(const {target} of frame.blast.victims)assert.equal(id==='F06'?target.burn:target.slow,id==='F06'?3:true);
    for(const enemy of frame.board.enemies)assert.equal(id==='F06'?enemy.burn:enemy.slow,id==='F06'?3:true);
  }
});

test('legendary detonation locks a single footprint and consumes burn independently per victim',()=>{
  const c=setup('F14',[0,1,2,3,4,5,6]);c.s.enemies[3].burn=3;
  effects.F14(c);
  assert.deepEqual(c.s.enemies.map(e=>500-e.hp),[60,60,60,78,60,60,60]);
  assert.ok(c.s.enemies.every(e=>e.burn===0));
  assert.equal(combatPresentationFrames({frames:c.frames})[0].blast.center.uid,'e3');
});

test('only five large finishers retain three-load charge cycles',()=>{
  assert.deepEqual(BULLETS.filter(d=>d.trigger==='timer'&&d.counter===3).map(d=>d.id),['F13','F14','L13','L21','R21']);
  for(const id of ['H01','R01']){
    const result=resolveRound(setup(id).s);
    assert.ok(result.frames.some(f=>f.action==='summon'&&f.sourceId===id));
    assert.equal(result.state.inventory[0].counter,1);
  }
});

test('green summons keep two-load cycles with frontloaded tide-spirit payoff',()=>{
  for(const id of ['H03','R03']){
    let result=resolveRound(setup(id,[6]).s);
    assert.equal(result.state.inventory[0].counter,1);assert.equal(result.state.summons.length,0);
    result=resolveRound(result.state);
    assert.equal(result.state.inventory[0].counter,2);assert.equal(result.state.summons.length,1);
    assert.equal(result.state.stats.damage,12);
    if(id==='H03')assert.equal(result.state.summons[0].life,2);
  }
});

test('amplified explosion preserves empowered feedback after merging',()=>{
  const c=setup('F08',[3,3]);c.current.imprints={ember:1};effects.F08(c);
  const frame=combatPresentationFrames({frames:c.frames})[0];
  assert.equal(frame.empowered,true);assert.equal(frame.hpDamage,12);
});

test('blast playback never resurrects a victim killed by the first-hit hook',()=>{
  const c=setup('F08',[3,3,3],5);
  c.firstHit=()=>{c.derived(c.s.enemies[1],5,'lightning');c.wet(c.s.enemies[2]);};
  effects.F08(c);
  const frame=combatPresentationFrames({frames:c.frames})[0];
  assert.deepEqual(frame.board.enemies.map(e=>e.uid),['e2']);
  assert.equal(frame.board.enemies[0].hp,1);assert.equal(frame.board.enemies[0].wet,2);
  const dead=frame.blast.victims.find(v=>v.target.uid==='e1');
  assert.equal(dead.hpDamage,5);assert.equal(dead.killed,true);assert.equal(dead.target.hp,0);
  assert.equal(c.s.stats.kills,2);assert.equal(c.s.resources.draft,20);
});

test('permanent base improvement still works after normal synergy bonuses reach their cap',()=>{
  const c=setup('F15');c.bonds.multiplier=()=>1.5;c.current.imprints={ember:3};
  effects.F15(c);assert.equal(c.frames[0].amount,31); // round(12 * (1 + capped 1 + 0.6))
  assert.equal(c.frames[0].empowered,true);
  const conditional=setup('F11');conditional.bonds.multiplier=()=>1;conditional.current.imprints={ember:1};
  conditional.s.enemies[0].burn=2;effects.F11(conditional);
  assert.equal(conditional.frames[0].amount,50); // round(8 * 2.2 + 16 * 2): inscription never amplifies consumed burn
});

test('three-load fire finisher waits twice then delivers large primary and uncapped area payoff',()=>{
  let run=setup('F13',Array(10).fill(6),1000).s;
  for(const remaining of [2,1]){
    const result=resolveRound(run);run=result.state;run.round++;
    assert.equal(run.inventory[0].counter,remaining);assert.equal(run.stats.damage,0);
    assert.ok(result.presentationFrames.some(f=>f.action==='charge'&&f.counter===remaining));
  }
  const result=resolveRound(run),blast=result.presentationFrames.find(f=>f.type==='explosion');
  assert.equal(blast.blast.victims[0].hpDamage,100);
  assert.ok(blast.blast.victims.slice(1).every(v=>v.hpDamage===48));
  assert.equal(blast.hpDamage,532);assert.equal(result.state.inventory[0].counter,3);
});

test('charged lightning excess becomes a capped spatial explosion, not wasted overkill',()=>{
  const c=setup('L13',[3,3,4,5]);c.s.selectedTarget='e0';c.s.enemies[0].hp=10;
  effects.L13(c);
  assert.deepEqual(c.s.enemies.map(e=>e.hp),[0,440,440,500]);
  const blast=combatPresentationFrames({frames:c.frames}).find(f=>f.type==='explosion');
  assert.equal(blast.hpDamage,120);assert.equal(blast.element,'lightning');
});

test('ready charge stays banked without targets, while off-grid spells never advance',()=>{
  const c=setup('L08',[]);c.s.inventory[0].counter=1;
  let result=resolveRound(c.s);assert.equal(result.state.inventory[0].counter,0);
  result.state.magazine[0]=null;result.state.inventory[0].counter=2;
  result=resolveRound(result.state);assert.equal(result.state.inventory[0].counter,2);
});

test('evolved lightning charge improves reset from two loads to one without an extra cast',()=>{
  const c=setup('L11',[6],1000);c.s.inventory[0].counter=1;
  c.s.inventory.push(...Array.from({length:5},(_,i)=>({uid:`extra${i}`,typeId:'L15',counter:0,mark:null,temp:{}})));
  c.s.bonds=['E04'];c.s.evolutions.E04={progress:5};
  const result=resolveRound(c.s);assert.equal(result.state.inventory[0].counter,1);
  assert.equal(result.frames.filter(f=>f.sourceId==='L11'&&f.type==='shot').length,1);
});
