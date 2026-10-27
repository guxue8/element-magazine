import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,act,createMeta,applyRunReward} from '../src/campaign.js';
import {saveGame,loadGame} from '../src/storage.js';
import {simulateCampaign,memoryStorage,chooseAction} from '../scripts/simulate.mjs';

test('twenty natural campaigns finish and every action survives validated storage',()=>{
  const outcomes=new Set();
  let saves=0;
  for(let seed=1;seed<=20;seed++){
    const result=simulateCampaign(seed);
    const {run,meta}=result;
    outcomes.add(run.outcome);saves+=result.saveChecks;
    assert.equal(run.phase,'ended');
    assert.ok(run.round<60,'campaign must not stall indefinitely');
    assert.equal(result.saveChecks,result.actions);
    assert.ok(Number.isFinite(run.stats.damage));
    assert.deepEqual(applyRunReward(meta,run),meta,'settlement must not duplicate after repeated loading');
    if(run.outcome==='victory'){
      assert.equal(run.completedBatches,18);
      assert.equal(run.enemies.length,0);
      assert.equal(run.stats.bossKills,3);
      assert.equal(meta.points,11,'first complete victory gives 9 earned points and 2 first-win points');
    }else {assert.equal(run.outcome,'defeat');assert.equal(run.hp,0);}
  }
  assert.ok(saves>1500);
  assert.ok(outcomes.has('victory'),'the introductory smoke strategy reaches the final victory path');
});

test('a deterministic lethal encounter covers defeat and its saved settlement independently of balance',()=>{
  const startRun=newRun(1,{...createMeta(),unlockedDifficulty:10},10);
  startRun.phase='prepare';startRun.hp=1;startRun.enemies[0].position=0;
  startRun.magazine.fill(null);
  const result=simulateCampaign(1,{startRun});
  assert.equal(result.run.phase,'ended');
  assert.equal(result.run.outcome,'defeat');
  assert.equal(result.run.hp,0);
  assert.equal(result.run.completedBatches,0);
  assert.equal(result.saveChecks,1);
  assert.equal(result.meta.points,0);
  assert.deepEqual(applyRunReward(result.meta,result.run),result.meta);
});

test('mid-campaign JSON restoration preserves offers, draws and the eventual result',()=>{
  let checkpoint;
  const original=simulateCampaign(1,{onStep:({run})=>{
    if(!checkpoint&&run.batch===9&&run.phase==='supply')checkpoint=JSON.parse(JSON.stringify(run));
  }});
  assert.ok(checkpoint?.offers,'checkpoint includes an unresolved stage reward');
  const resumed=simulateCampaign(1,{startRun:checkpoint});
  assert.deepEqual(resumed.run,original.run);
  assert.deepEqual(resumed.meta,original.meta);
});

test('saved locked magazine recovers the identical combat and next-stage choices',()=>{
  let run=newRun(12);
  for(let guard=0;run.phase!=='prepare'&&guard<20;guard++){
    const result=act(run,chooseAction(run));
    assert.equal(result.error,null);run=result.run;
  }
  assert.equal(run.phase,'prepare');
  const expected=act(run,{type:'execute'});
  const locked=structuredClone(run);locked.phase='locked';
  const storage=memoryStorage();
  assert.equal(saveGame(locked,createMeta(),storage),null);
  const restored=loadGame(storage);
  assert.equal(restored.warning,null);
  const recovered=act(restored.run,{type:'execute'});
  assert.equal(recovered.error,null);
  assert.deepEqual(recovered.run,expected.run);
  assert.deepEqual(recovered.frames,expected.frames);
});

test('final batch enters cleanup until every enemy dies, without extra reinforcement income',()=>{
  let sawFinalSurvivors=false,cleanupTurns=0;
  const result=simulateCampaign(1,{onStep:({before,action,run})=>{
    if(action.type!=='execute')return;
    if(before.batch===18&&run.enemies.length&&run.hp>0){
      sawFinalSurvivors=true;
      assert.equal(run.phase,'supply');
      assert.equal(run.isCleanup,true);
      assert.equal(run.batch,18);
    }
    if(before.isCleanup){
      cleanupTurns++;
      assert.equal(run.resources.draft-before.resources.draft,(run.stats.kills-before.stats.kills)*10,'cleanup gives kill rewards only');
      assert.equal(run.resources.swap,before.resources.swap,'no repeat batch swap grant');
      assert.equal(run.completedBatches,18);
      assert.equal(run.batch,18);
      assert.ok(run.enemies.length<=before.enemies.length,'cleanup never spawns a fresh batch');
    }
  }});
  assert.ok(sawFinalSurvivors);
  assert.ok(cleanupTurns>0);
  assert.equal(result.run.outcome,'victory');
  assert.equal(result.run.enemies.length,0);
});
