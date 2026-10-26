import test from 'node:test';
import assert from 'node:assert/strict';
import {loadGame,saveGame,GAME_STORAGE_KEY} from '../src/storage.js';
import {newRun,createMeta} from '../src/campaign.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map};};
test('save roundtrip preserves RNG, queued choices and individual counters',()=>{
  const storage=memory(),run=newRun(144),meta=createMeta();
  run.phase='locked';run.magazine=run.inventory.map(x=>x.uid).concat(Array(8).fill(null));
  assert.equal(saveGame(run,meta,storage),null);
  assert.deepEqual(loadGame(storage),{run,meta,warning:null});
});
test('corrupt run does not discard valid meta progress',()=>{
  const storage=memory(),meta=createMeta();meta.points=7;meta.earned=7;
  storage.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run:{broken:true},meta}));
  const result=loadGame(storage);
  assert.equal(result.run,null);assert.equal(result.meta.points,7);assert.ok(result.warning);
  assert.ok([...storage.map.keys()].some(k=>k.includes('backup')));
});
test('unavailable browser storage is reported without crashing',()=>{
  const storage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  assert.ok(loadGame(storage).warning);
  assert.ok(saveGame(newRun(33),createMeta(),storage));
});
test('invalid nonfinite resource values are not serialized as valid saves',()=>{
  const storage=memory(),run=newRun(1);run.resources.draft=NaN;
  assert.ok(saveGame(run,createMeta(),storage));
  assert.equal(storage.getItem(GAME_STORAGE_KEY),null);
});
test('incomplete render-critical state is backed up while valid talents survive',()=>{
  for(const field of ['evolutions','logs','eventOrder','stats']){
    const storage=memory(),run=newRun(2),meta=createMeta();meta.points=4;meta.earned=4;
    run.bonds=['S01'];delete run[field];
    storage.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run,meta}));
    const result=loadGame(storage);
    assert.equal(result.run,null,field);assert.equal(result.meta.points,4);
    assert.ok(result.warning);assert.ok([...storage.map.keys()].some(k=>k.includes('backup')));
    assert.ok(saveGame(run,meta,storage));
  }
});
test('unknown saved candidates are rejected before rendering or selection',()=>{
  const storage=memory(),run=newRun(3);
  run.offers={kind:'bond',source:'bond-2',cards:['missing']};
  assert.ok(saveGame(run,createMeta(),storage));
});
