import test from 'node:test';
import assert from 'node:assert/strict';
import {TALENTS,BULLET_MAP} from '../src/catalog.js';
import {TALENT_BRANCHES,getTalentNode,getTalentPurchaseState,canBuyTalent,isFreeSwapAvailable,isFreeRefreshAvailable} from '../src/talent-tree.js';
import {createMeta,newRun,buyTalent,resetTalents,act} from '../src/campaign.js';
import {saveGame,loadGame,GAME_STORAGE_KEY} from '../src/storage.js';

const next=(run,action)=>{const out=act(run,action);assert.equal(out.error,null);return out.run;};
const trained=traits=>({...createMeta(),points:100,earned:100,talents:traits});
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
function peaceful(run){run.enemies=[];run.offers=null;run.pending=[];return next(run,{type:'load'});}
function emptyRound(run){run=peaceful(run);run.magazine.fill(null);return next(run,{type:'execute'});}

test('talent tree has three complete branches and five new non-stat mechanics',()=>{
  assert.equal(TALENT_BRANCHES.length,3);
  for(const branch of TALENT_BRANCHES)assert.equal(TALENTS.filter(t=>getTalentNode(t.id)?.branch===branch.id).length,5);
  for(const id of ['freeSwap','freeRefresh','skipRefresh','scrollCache','rescueScroll'])assert.ok(getTalentNode(id));
  for(const t of TALENTS)for(const parent of getTalentNode(t.id).requires)assert.ok(TALENTS.some(t=>t.id===parent));
});
test('talent purchase enforces prerequisites without stripping legacy ranks',()=>{
  const blank=trained({});
  assert.equal(canBuyTalent(blank,'freeSwap'),false);
  assert.deepEqual(getTalentPurchaseState(blank,'freeSwap').missing,['swap']);
  assert.deepEqual(buyTalent(blank,'freeSwap'),blank);
  const unlocked=buyTalent(buyTalent(blank,'swap'),'freeSwap');
  assert.equal(unlocked.talents.freeSwap,1);
  assert.equal(unlocked.points,96);
  assert.equal(canBuyTalent(unlocked,'freeSwap'),false);
  assert.equal(canBuyTalent(blank,'missing'),false);
  const legacy=trained({repair:1});
  assert.deepEqual(buyTalent(legacy,'repair'),legacy);
  assert.equal(newRun(1,legacy).traits.repair,1);
  assert.equal(resetTalents(legacy).points,101);
});
test('reset refunds every purchased old and new rank exactly',()=>{
  let meta=trained({});
  for(const id of ['body','body','repair','medicine','emergency','rescueScroll','supply','refresh','freeRefresh','skipRefresh','focus','swap','remove','reroll','freeSwap','scrollCache'])meta=buyTalent(meta,id);
  assert.ok(Object.keys(meta.talents).length===15);
  const reset=resetTalents(meta);
  assert.deepEqual(reset.talents,{});
  assert.equal(reset.points,100);
});
test('first valid swap is free each magazine, and failed swaps do not consume it',()=>{
  let run=peaceful(newRun(2,trained({freeSwap:1})));
  run.resources.swap=0;
  assert.ok(act(run,{type:'swap',a:10,b:11}).error);
  assert.equal(isFreeSwapAvailable(run),true);
  run=next(run,{type:'swap',a:0,b:7});
  assert.equal(run.resources.swap,0);
  assert.equal(isFreeSwapAvailable(run),false);
  assert.ok(act(run,{type:'swap',a:7,b:0}).error);
  run=next(run,{type:'execute'});
  run=peaceful(run);
  run.resources.swap=0;
  assert.equal(isFreeSwapAvailable(run),true);
  run=next(run,{type:'swap',a:0,b:7});
  assert.equal(run.resources.swap,0);
});
test('first eligible refresh is free once per run and survives save/reload',()=>{
  let run=newRun(3,trained({freeRefresh:1}));
  run.resources.refresh=0;
  assert.ok(act(run,{type:'refresh'}).error);
  assert.equal(isFreeRefreshAvailable(run),true);
  run=next(run,{type:'draft',cost:100});
  run=next(run,{type:'refresh'});
  assert.equal(run.resources.refresh,0);
  assert.equal(isFreeRefreshAvailable(run),false);
  const storage=memory(),meta=trained({freeRefresh:1});
  assert.equal(saveGame(run,meta,storage),null);
  run=loadGame(storage).run;
  assert.equal(isFreeRefreshAvailable(run),false);
  assert.ok(act(run,{type:'refresh'}).error);
});
test('paid recruitment skips refund five refresh only twice and never refund recruitment cost',()=>{
  let run=newRun(4,trained({skipRefresh:1}));
  run.resources.draft=400;run.resources.refresh=0;
  for(let i=0;i<3;i++){run=next(run,{type:'draft',cost:100});run=next(run,{type:'skip'});}
  assert.equal(run.resources.refresh,10);
  assert.equal(run.resources.draft,100);
  run.offers={kind:'bond',source:'test-bond',cards:['S01']};
  run=next(run,{type:'skip'});
  assert.equal(run.resources.refresh,10);
  const plain=newRun(4);plain.resources.refresh=0;
  assert.equal(next(next(plain,{type:'draft',cost:100}),{type:'skip'}).resources.refresh,0);
});
test('travel scroll cache rewards completed batches 6/12/18 only, never cleanup repeats',()=>{
  let run=newRun(5,trained({scrollCache:1}));
  run.batch=6;run.completedBatches=5;
  run=emptyRound(run);
  assert.equal(run.inventory.filter(x=>BULLET_MAP[x.typeId].trigger==='consumable').length,1);
  const afterSix=run.inventory.length;
  run=emptyRound(run);
  assert.equal(run.inventory.length,afterSix);
  run.batch=12;
  run=emptyRound(run);
  assert.equal(run.inventory.length,afterSix+1);
  run.batch=18;run.isCleanup=false;
  run=emptyRound(run);
  const afterEighteen=run.inventory.length;
  assert.equal(afterEighteen,afterSix+2);
  run=emptyRound(run);
  assert.equal(run.inventory.length,afterEighteen);
  const plain=newRun(5);plain.batch=6;
  assert.equal(emptyRound(plain).inventory.filter(x=>BULLET_MAP[x.typeId].trigger==='consumable').length,0);
});
test('emergency medicine yields one water scroll after surviving its trigger',()=>{
  let run=newRun(6,trained({emergency:1,rescueScroll:1}));
  run=next(run,{type:'load'});run.magazine.fill(null);run.hp=31;
  run.enemies=[{...run.enemies[0],position:0,typeId:'walker',damage:4}];
  run=next(run,{type:'execute'});
  assert.equal(run.emergencyUsed,true);
  assert.equal(run.inventory.filter(x=>x.typeId==='C04').length,1);
  run=emptyRound(run);
  assert.equal(run.inventory.filter(x=>x.typeId==='C04').length,1);
  let fatal=newRun(6,trained({emergency:1,rescueScroll:1}));
  fatal=next(fatal,{type:'load'});fatal.magazine.fill(null);fatal.hp=1;fatal.enemies[0].position=0;
  fatal=next(fatal,{type:'execute'});
  assert.equal(fatal.phase,'ended');
  assert.equal(fatal.inventory.filter(x=>x.typeId==='C04').length,0);
});
test('old saves without tree bookkeeping retain their existing talents',()=>{
  const meta=trained({focus:1,repair:2}),run=newRun(7,meta),storage=memory();
  delete run.talentState;
  storage.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run,meta}));
  const loaded=loadGame(storage);
  assert.deepEqual(loaded.meta.talents,meta.talents);
  assert.equal(loaded.run.traits.focus,1);
  assert.equal(loaded.run.traits.repair,2);
});
test('new talent purchases apply to the next run and numeric roots match their displayed per-rank values',()=>{
  let meta=trained({swap:1});
  const current=newRun(8,meta);
  meta=buyTalent(meta,'freeSwap');
  assert.equal(current.traits.freeSwap,undefined);
  assert.equal(newRun(8,meta).traits.freeSwap,1);
  const roots=newRun(9,trained({body:1,supply:1}));
  assert.equal(roots.maxHp,105);
  assert.equal(roots.resources.draft,125);
});
test('malformed talent usage cannot overwrite a valid save or reset one-use counters',()=>{
  const storage=memory(),meta=trained({freeRefresh:1}),run=newRun(10,meta);
  assert.equal(saveGame(run,meta,storage),null);
  const before=storage.getItem(GAME_STORAGE_KEY);
  for(const invalid of [{...run.talentState,skipRefunds:3},{...run.talentState,freeRefreshUsed:'false'},{...run.talentState,scrollBatches:[6,6]},{...run.talentState,freeSwapRound:99}]){
    assert.ok(saveGame({...run,talentState:invalid},meta,storage));
    assert.equal(storage.getItem(GAME_STORAGE_KEY),before);
  }
});
