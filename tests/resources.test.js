import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,act,createMeta} from '../src/campaign.js';
import {resolveRound} from '../src/combat.js';
import {saveGame,loadGame,GAME_STORAGE_KEY} from '../src/storage.js';

const action=(run,input)=>{const result=act(run,input);assert.equal(result.error,null);return result.run;};
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),values};};
const supplies=(run,id)=>{
  run.phase='supply';run.pending=[];
  run.offers={kind:'event',source:`supplies-${id}`,cards:[{id,name:id,description:'补给'}]};
  return action(run,{type:'choose',index:0});
};

test('starting talents cannot store more than three swaps',()=>{
  const meta=createMeta();meta.talents={remove:1,swap:2};
  const run=newRun(20,meta);
  assert.equal(run.resources.remove,60);
  assert.equal(run.resources.swap,30);
});

test('each swap talent level adds half a charge and remains useful within the cap',()=>{
  for(const [level,expected] of [[0,20],[1,25],[2,30]]){
    const meta=createMeta();meta.talents={swap:level};
    assert.equal(newRun(20,meta).resources.swap,expected,`swap talent level ${level}`);
  }
});

test('round and event grants clamp to three charges without capping other currencies',()=>{
  let run=newRun(21);run.batch=3;run.resources={draft:2300,refresh:100,remove:85,swap:28};
  run=action(run,{type:'load'});run.magazine.fill(null);
  run=action(run,{type:'execute'});
  assert.deepEqual(run.resources,{draft:2400,refresh:102,remove:90,swap:30});
  run=supplies(run,'remove30');assert.equal(run.resources.remove,90);
  run=supplies(run,'swap20');assert.equal(run.resources.swap,30);
  run=supplies(run,'refresh10');assert.equal(run.resources.refresh,112);
});

test('partial charges remain exact and spending frees capacity for future grants',()=>{
  let run=newRun(22);run.resources.remove=90;run.resources.swap=25;
  run=action(run,{type:'load'});
  run=action(run,{type:'swap',a:0,b:5});assert.equal(run.resources.swap,15);
  const slot=run.magazine.findIndex(Boolean);
  run=action(run,{type:'remove',slot});assert.equal(run.resources.remove,60);
  run=supplies(run,'swap20');assert.equal(run.resources.swap,30);
  run=supplies(run,'remove30');assert.equal(run.resources.remove,90);
});

test('special-bullet removal gains stop at capacity and retain input immutability',()=>{
  let run=newRun(23);run=action(run,{type:'load'});
  run.inventory[0].typeId='R17';run.inventory[0].counter=0;
  run.magazine=[run.inventory[0].uid,...Array(11).fill(null)];
  run.enemies[0].hp=100;run.enemies[0].maxHp=100;run.resources.remove=90;
  const before=structuredClone(run);
  const result=resolveRound(run);
  assert.equal(result.state.resources.remove,90);
  assert.deepEqual(run,before);
});

test('old valid over-cap saves migrate with original backup and unchanged run progress',()=>{
  const storage=memory(),run=newRun(24),meta=createMeta();
  run.resources={draft:3000,refresh:123,remove:150,swap:105};
  const original=JSON.stringify({version:1,run,meta});storage.setItem(GAME_STORAGE_KEY,original);
  const restored=loadGame(storage);
  assert.ok(restored.run);assert.equal(restored.run.id,run.id);
  assert.deepEqual(restored.run.resources,{draft:3000,refresh:123,remove:90,swap:30});
  assert.deepEqual(restored.run.inventory,run.inventory);assert.equal(restored.run.rng,run.rng);
  assert.ok([...storage.values.entries()].some(([key,value])=>key.includes('backup')&&value===original));
  assert.equal(saveGame(restored.run,meta,storage),null);
  assert.equal(loadGame(storage).warning,null);
});

test('saving over-cap state preserves a backup and serializes bounded values without mutating input',()=>{
  const storage=memory(),run=newRun(25),meta=createMeta();run.resources.remove=120;run.resources.swap=50;
  const before=structuredClone(run);
  assert.equal(saveGame(run,meta,storage),null);
  const persisted=JSON.parse(storage.getItem(GAME_STORAGE_KEY));
  assert.equal(persisted.run.resources.remove,90);assert.equal(persisted.run.resources.swap,30);
  assert.deepEqual(run,before);
  assert.ok([...storage.values.entries()].some(([key,value])=>key.includes('backup')&&JSON.parse(value).run.resources.remove===120));
});
