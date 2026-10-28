import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/campaign.js';
import {TALENTS,BULLETS,BULLET_MAP,ENCHANTMENT_MAP} from '../src/catalog.js';
import {getTalentNode} from '../src/talent-tree.js';
import {saveGame,loadGame,GAME_STORAGE_KEY} from '../src/storage.js';
import {simulateCampaign} from '../scripts/simulate.mjs';

const trained=talents=>({...G.createMeta(),points:200,earned:200,talents});
const next=(run,action)=>{const out=G.act(run,action);assert.equal(out.error,null);return out.run;};
function emptyRound(run){run.offers=null;run.pending=[];run.enemies=[];run=next(run,{type:'load'});run.magazine.fill(null);return next(run,{type:'execute'});}
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};

test('thirty talents form a positioned DAG and cost fifteen complete victories',()=>{
  assert.equal(TALENTS.length,30);
  assert.equal(TALENTS.reduce((n,t)=>n+t.costs.reduce((a,b)=>a+b,0),0),130);
  let meta=trained({});
  for(let pass=0;pass<10;pass++)for(const t of TALENTS)meta=G.buyTalent(meta,t.id);
  assert.equal(Object.keys(meta.talents).length,30);
  assert.equal(meta.points,70);
  assert.equal(G.resetTalents(meta).points,200);
  for(const t of TALENTS){const n=getTalentNode(t.id);assert.equal(n.position.length,2);for(const p of n.requires)assert.ok(getTalentNode(p).position[0]<n.position[0]);}
  assert.equal(11+13*9<130,true);assert.equal(11+14*9>=130,true);
});
test('field care only heals completed third batches and never cleanup',()=>{
  let run=G.newRun(21,trained({fieldCare:1}));run.hp=50;run.batch=3;
  run=emptyRound(run);assert.equal(run.hp,54);
  run=emptyRound(run);assert.equal(run.hp,54);
  run.batch=18;run.isCleanup=true;run=emptyRound(run);assert.equal(run.hp,54);
});
test('boss ward is granted when a boss batch arrives, not on every cleanup',()=>{
  let run=G.newRun(22,trained({wardReserve:1}));run.batch=5;
  run=emptyRound(run);assert.equal(run.batch,6);assert.equal(run.shield,6);
  run=emptyRound(run);assert.equal(run.shield,6);
});
test('camp overheal becomes capped ward and skipped bonds heal at most three times',()=>{
  let run=G.newRun(23,trained({safeCamp:1,renewal:1}));
  run.hp=95;run.offers={kind:'event',source:'test-camp',cards:[{id:'heal25'}]};
  run=next(run,{type:'choose',index:0});assert.equal(run.hp,100);assert.equal(run.shield,8);
  run.hp=60;
  for(let i=0;i<4;i++){run.offers={kind:'bond',source:`test-bond-${i}`,cards:['S01']};run=next(run,{type:'skip'});}
  assert.equal(run.hp,72);assert.equal(run.talentState.renewalUses,3);
});
test('last light recovers once after lethal enemy phase and persists through saving',()=>{
  const meta=trained({lastLight:1}),storage=memory();let run=G.newRun(24,meta);
  const lethal=()=>{run.offers=null;run.pending=[];run=next(run,{type:'load'});run.magazine.fill(null);run.hp=1;run.shield=0;run.enemies[0].position=0;};
  lethal();let out=G.act(run,{type:'execute'});assert.equal(out.error,null);run=out.run;
  assert.equal(run.hp,15);assert.equal(run.phase,'supply');assert.equal(run.talentState.lastLightUsed,true);
  assert.equal(out.frames.at(-1).board.hp,15);
  assert.equal(saveGame(run,meta,storage),null);run=loadGame(storage).run;
  lethal();run=next(run,{type:'execute'});assert.equal(run.phase,'ended');assert.equal(run.outcome,'defeat');
});
test('first standard and double draft quality guarantees persist only on their own offer',()=>{
  let run=G.newRun(25,trained({scout:1,scholar:1}));run.resources.draft=1000;run.resources.refresh=100;
  for(const [cost,floor,key] of [[100,1,'scoutUsed'],[200,2,'scholarUsed']]){
    run=next(run,{type:'draft',cost});assert.equal(run.talentState[key],true);
    assert.ok(BULLET_MAP[run.offers.cards[0]].rarity>=floor);
    run=next(run,{type:'refresh'});assert.ok(BULLET_MAP[run.offers.cards[0]].rarity>=floor);
    run=next(run,{type:'skip'});run=next(run,{type:'draft',cost});assert.equal(run.offers.talentFloor,0);run=next(run,{type:'skip'});
  }
});

test('a lethal self-detonation consumes the bomber before last light revives the player',()=>{
 let run=G.newRun(44,trained({lastLight:1}));
 run=next(run,{type:'load'});run.magazine.fill(null);run.hp=1;run.shield=0;
 run.enemies=[{...run.enemies[0],uid:'lethal-bomber',typeId:'bomber',position:0,hp:42,maxHp:42,shield:0,burn:0,burnTurns:0}];
 const kills=run.stats.kills;run=next(run,{type:'execute'});
 assert.equal(run.hp,15);assert.equal(run.talentState.lastLightUsed,true);
 assert.equal(run.enemies.some(e=>e.uid==='lethal-bomber'),false);
 assert.equal(run.stats.kills,kills,'self-destruction is not a player kill');
});
test('fresh ink prefers an unowned third spell within the sampled tier and element',()=>{
  for(let seed=1;seed<=50;seed++){
    let run=G.newRun(seed,trained({freshInk:1}));
    // Own every ordinary spell except one per element: the third choice must
    // still find the missing one whenever that element/tier has a legal option.
    run.inventory=BULLETS.filter(b=>b.trigger!=='consumable'&&b.rarity===0&& !['F01','H01','L01','W01','R01'].includes(b.id)).map((b,i)=>({uid:`own${i}`,typeId:b.id,counter:b.counter||0,mark:null,temp:{}}));
    run=next(run,{type:'draft',cost:100});const chosen=BULLET_MAP[run.offers.cards[2]];
    if(chosen.rarity===0){const missing=BULLETS.filter(b=>b.element===chosen.element&&b.rarity===0&&!run.inventory.some(i=>i.typeId===b.id));if(missing.length)assert.ok(missing.some(b=>b.id===chosen.id));}
  }
});
test('scroll merchant grants only for accepted double or triple drafts, twice per run',()=>{
  let run=G.newRun(26,trained({scrollMerchant:1}));run.resources.draft=1000;
  run=next(next(run,{type:'draft',cost:200}),{type:'skip'});assert.equal(run.talentState.scrollMerchantUses,0);
  for(let i=0;i<3;i++)run=next(next(run,{type:'draft',cost:200}),{type:'choose',index:0});
  assert.equal(run.inventory.filter(i=>BULLET_MAP[i.typeId].trigger==='consumable').length,2);
  assert.equal(run.talentState.scrollMerchantUses,2);
});
test('deep study unlocks triple draft at batch ten and not before',()=>{
  let run=G.newRun(27,trained({deepStudy:1}));run.resources.draft=300;run.batch=9;
  assert.equal(G.getEliteDraftBatch(run),10);assert.ok(G.act(run,{type:'draft',cost:300}).error);
  run.batch=10;run=next(run,{type:'draft',cost:300});assert.equal(run.resources.draft,0);
  assert.equal(G.getEliteDraftBatch(G.newRun(27)),13);
});
test('prepared sigil honors element bans; patient study shortens acquisition only',()=>{
  for(const banned of ['fire','water','lightning','wind','earth']){
    let run=G.newRun(28,trained({preparedSigil:1,patientStudy:1}),0,banned);
    assert.ok(run.slots[0].engraving);assert.notEqual(ENCHANTMENT_MAP[run.slots[0].engraving].element,banned);
    const def=BULLETS.find(b=>b.trigger==='timer'&&b.counter>1&&b.element!==banned);
    run.offers={kind:'bullet',cost:100,source:'test-timer',cards:[def.id]};run=next(run,{type:'choose',index:0});
    assert.equal(run.inventory.at(-1).counter,def.counter-1);
    run=next(run,{type:'load'});assert.equal(run.inventory.at(-1).counter,def.counter-1);
  }
});
test('deletion recycles charges twice and passes one ember imprint to a legal spell',()=>{
  let run=G.newRun(29,trained({recycleCharge:1,succession:1}));run.resources.remove=90;run.resources.refresh=0;
  run.inventory=Array.from({length:7},(_,i)=>({uid:`x${i}`,typeId:'F01',counter:0,mark:null,temp:{},...(i===0?{imprints:{ember:3}}:{})}));
  run=next(run,{type:'load'});let slot=run.magazine.indexOf('x0');run=next(run,{type:'remove',slot});
  assert.equal(run.resources.refresh,10);assert.equal(run.inventory.find(i=>i.uid==='x1').imprints.ember,1);
  for(let i=0;i<2;i++)run=next(run,{type:'remove',slot:run.magazine.findIndex(Boolean)});
  assert.equal(run.resources.refresh,20);assert.equal(run.talentState.recycleUses,2);
});
test('quiet slot supports one reversible rest without activating empty-slot bonds',()=>{
  let run=G.newRun(30,trained({quietSlot:1}));run=next(run,{type:'load'});
  assert.equal(G.canRest(run),true);assert.equal(G.getActiveBonds(run).includes('Q05'),false);
  const uid=run.magazine[0];run=next(run,{type:'rest',slot:0});assert.equal(run.magazine[0],null);assert.equal(run.rest.uid,uid);
  assert.ok(G.act(run,{type:'rest',slot:1}).error);run=next(run,{type:'undoRest'});assert.equal(run.magazine[0],uid);
});
test('legacy bookkeeping gets defaults without resetting prior uses; invalid new counters are rejected',()=>{
  const meta=trained({freeRefresh:1}),storage=memory();let run=G.newRun(31,meta);
  run.talentState={freeSwapRound:0,freeRefreshUsed:true,skipRefunds:2,rescueGranted:true,scrollBatches:[6]};
  storage.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run,meta}));run=loadGame(storage).run;
  run=next(run,{type:'draft',cost:100});assert.equal(run.talentState.freeRefreshUsed,true);assert.equal(run.talentState.skipRefunds,2);assert.equal(run.talentState.lastLightUsed,false);
  assert.equal(saveGame(run,meta,storage),null);
  for(const bad of [{renewalUses:4},{lastLightUsed:'false'},{scrollMerchantUses:3},{recycleUses:3},{scoutUsed:1}])assert.ok(saveGame({...run,talentState:{...run.talentState,...bad}},meta,storage));
});
test('quality guarantees, capped recovery and timer resets survive reload without repeated benefits',()=>{
  const meta=trained({scout:1,safeCamp:1,patientStudy:1}),storage=memory();let run=G.newRun(32,meta);
  run=next(run,{type:'draft',cost:100});assert.equal(saveGame(run,meta,storage),null);run=loadGame(storage).run;
  run=next(run,{type:'refresh'});assert.ok(BULLET_MAP[run.offers.cards[0]].rarity>=1);
  run=next(run,{type:'skip'});run.shield=19;run.hp=100;run.offers={kind:'event',source:'cap-camp',cards:[{id:'heal25'}]};
  run=next(run,{type:'choose',index:0});assert.equal(run.shield,20);
  run.offers={kind:'bullet',cost:100,source:'test-timer-reset',cards:['R03']};run=next(run,{type:'choose',index:0});
  const uid=run.inventory.at(-1).uid;assert.equal(run.inventory.at(-1).counter,1);
  run=next(run,{type:'load'});run.magazine.fill(null);run.magazine[0]=uid;run.enemies=[];run=next(run,{type:'execute'});
  assert.equal(run.inventory.find(i=>i.uid===uid).counter,BULLET_MAP.R03.counter);
});
test('all talents complete seeded campaigns with action-by-action save validation across every element ban',()=>{
  const meta=trained(Object.fromEntries(TALENTS.map(t=>[t.id,t.costs.length])));
  for(const [i,ban] of [null,'fire','water','lightning','wind','earth'].entries()){
    const result=simulateCampaign(100+i,{startRun:G.newRun(100+i,meta,0,ban)});
    assert.equal(result.run.phase,'ended');assert.equal(result.actions,result.saveChecks);
    assert.ok(result.run.inventory.every(item=>BULLET_MAP[item.typeId].element!==ban));
  }
});
