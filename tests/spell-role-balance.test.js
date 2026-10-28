import test from 'node:test';
import assert from 'node:assert/strict';
import {Combat} from '../src/combat.js';
import {effects} from '../src/combat-effects.js';
import {BULLET_MAP} from '../src/catalog.js';
import {newRun} from '../src/campaign.js';

function cast(id, positions=[3], typeId='walker'){
  const state=newRun(502);
  state.inventory=[{uid:'spell',typeId:id,counter:0,mark:null,temp:{}}];
  state.magazine=Array(12).fill(null);state.magazine[0]='spell';
  state.bonds=[];state.summons=[];state.shield=0;
  state.selectedTarget='e0';
  state.enemies=positions.map((position,i)=>({uid:`e${i}`,typeId,position,lane:0,hp:1000,maxHp:1000,shield:0,wet:0,burn:0,burnTurns:0,controlledAt:-2,slow:false,attackCount:0,boost:0}));
  const c=new Combat(state);c.slot=0;c.current=c.layout[0];c.currentDef=BULLET_MAP[id];c.hitTargets=[];
  effects[id](c);
  return {c,damage:c.s.enemies.map(e=>1000-e.hp),total:c.s.stats.damage};
}

test('white direct magic wins a focused hit; an eight-enemy blast earns its crowd role',()=>{
  const single=cast('F15').total;
  assert.equal(single,16);
  assert.ok(single>cast('F08',[3,3,3]).total);
  assert.ok(single<cast('F08',Array(8).fill(3)).total);
});

test('charged focus beats blast against one or three bodies, blast wins against eight',()=>{
  const focus=cast('L11').total;
  assert.equal(focus,104);
  assert.ok(focus>cast('F12').total);
  assert.ok(focus>cast('F12',Array(3).fill(3)).total);
  assert.ok(focus<cast('F12',Array(8).fill(3)).total);
});

test('blast outer ring halves splash while preserving every target at the boundary',()=>{
  assert.deepEqual(cast('F13',[3,3,2,4,1,5,6]).damage,[80,20,20,20,10,10,0]);
});

test('single target finishers retain a large three-load payoff',()=>{
  assert.ok(cast('L13').total>=160);
  assert.ok(cast('R21').damage[0]>=150);
  assert.ok(cast('L13').total>cast('F13',Array(3).fill(3)).total);
  assert.ok(cast('L13').total<cast('F13',Array(8).fill(3)).total);
});

test('focused magic keeps its advantage against a boss and an armored enemy',()=>{
  for(const type of ['boss1','shield']){
    assert.ok(cast('L11',[3],type).total>cast('F12',[3],type).total);
    assert.ok(cast('F15',[3],type).total>cast('F08',[3],type).total);
  }
});

test('isolation rewards choosing a distant target rather than dominating reliable single magic',()=>{
  assert.equal(cast('L02').total,22);
  assert.ok(cast('L02').total>cast('L15').total);
  assert.ok(cast('L02',[3,3,3]).total<cast('L15',[3,3,3]).total);
});
