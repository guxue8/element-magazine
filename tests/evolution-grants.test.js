import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createMeta,getActiveBonds,newRun} from '../src/campaign.js';
import {BULLETS,BULLET_MAP,BONDS} from '../src/catalog.js';
import {loadGame,saveGame} from '../src/storage.js';

const evolutions=BONDS.filter(b=>b.grade==='evolution');
const next=(run,action)=>{const result=act(run,action);assert.equal(result.error,null,result.error);return result.run;};
const instance=(id,uid)=>({uid,typeId:id,counter:BULLET_MAP[id].counter||0,mark:null,temp:{}});
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
function readyFor(bond,{hasTarget=false,bannedElement=null}={}){
  const run=newRun(701,createMeta(),0,bannedElement);
  run.batch=4;run.inventory=[];run.nextUid=100;
  for(const [element,count] of Object.entries(bond.requirements)){
    const filler=BULLETS.find(b=>b.element===element&&b.id!==bond.targetId&&b.trigger!=='consumable');
    for(let i=0;i<count;i++)run.inventory.push(instance(filler.id,`b${run.nextUid++}`));
  }
  if(hasTarget)run.inventory[0]=instance(bond.targetId,run.inventory[0].uid);
  return run;
}
function offer(run,bond){run.offers={kind:'bond',source:'bond-4',cards:[bond.id]};return run;}
function generateOffer(run,bond){
  // Owning the other evolutions makes the selected evolution the only eligible one.
  run.bonds=evolutions.filter(b=>b.id!==bond.id).map(b=>b.id);
  run.offers={kind:'scroll',source:'placeholder',cards:['C04']};
  run.pending=[{kind:'bond',source:`bond-${run.batch}`,core:[6,12].includes(run.batch)}];
  return next(run,{type:'skip'});
}

test('all eight evolutions can be offered when elements qualify but the core bullet is missing',()=>{
  assert.equal(evolutions.length,8);
  for(const bond of evolutions)for(const batch of [4,9,15]){
    const before=readyFor(bond);before.batch=batch;
    const run=generateOffer(before,bond);
    assert.ok(run.offers.cards.includes(bond.id),`${bond.id} must be offered without ${bond.targetId}`);
    assert.deepEqual(run.inventory,before.inventory,'opening an offer must not grant bullets');
    assert.equal(run.nextUid,before.nextUid);
    const refreshed=next(run,{type:'refresh'});
    assert.ok(refreshed.offers.cards.includes(bond.id));
    assert.deepEqual(refreshed.inventory,before.inventory,'refreshing an offer must not grant bullets');
    assert.equal(refreshed.nextUid,before.nextUid);
  }
});

test('evolution offers still require the current elemental counts and retain milestone restrictions',()=>{
  for(const bond of evolutions){
    const short=readyFor(bond);short.inventory.pop();
    assert.ok(!generateOffer(short,bond).offers.cards.includes(bond.id),bond.id);
    for(const batch of [2,6,12,17]){
      const run=readyFor(bond);run.batch=batch;
      assert.ok(!generateOffer(run,bond).offers.cards.includes(bond.id),`${bond.id} at batch ${batch}`);
    }
  }
});

test('choosing every evolution grants one normal missing core instance and activates the bond',()=>{
  for(const bond of evolutions){
    const before=offer(readyFor(bond),bond),uid=`b${before.nextUid}`;
    const run=next(before,{type:'choose',index:0});
    assert.equal(run.inventory.length,before.inventory.length+1,bond.id);
    assert.deepEqual(run.inventory.at(-1),instance(bond.targetId,uid),bond.id);
    assert.equal(run.nextUid,before.nextUid+1);
    assert.equal(new Set(run.inventory.map(b=>b.uid)).size,run.inventory.length);
    assert.deepEqual(run.inventory.slice(0,-1),before.inventory);
    assert.deepEqual(run.evolutions[bond.id],{progress:0});
    assert.ok(getActiveBonds(run).includes(bond.id));
    assert.equal(run.offers,null);assert.ok(run.handled.includes('bond-4'));
    assert.equal(before.inventory.some(b=>b.typeId===bond.targetId),false,'actions retain immutable input');
  }
});

test('an existing core anywhere in the backpack is retained without a duplicate or reset',()=>{
  for(const bond of evolutions){
    const before=offer(readyFor(bond,{hasTarget:true}),bond);
    Object.assign(before.inventory[0],{counter:1,mark:'M01',temp:{loadedWeight:2}});
    const run=next(before,{type:'choose',index:0});
    assert.deepEqual(run.inventory,before.inventory,bond.id);
    assert.equal(run.nextUid,before.nextUid);
    assert.equal(run.inventory.filter(b=>b.typeId===bond.targetId).length,1);
    assert.deepEqual(run.evolutions[bond.id],{progress:0});
  }
});

test('skipping or rejecting a repeated evolution choice never grants another core',()=>{
  for(const bond of evolutions){
    const before=offer(readyFor(bond),bond),skipped=next(before,{type:'skip'});
    assert.deepEqual(skipped.inventory,before.inventory,bond.id);
    assert.equal(skipped.nextUid,before.nextUid);assert.deepEqual(skipped.bonds,[]);
    assert.deepEqual(skipped.evolutions,{});
    const chosen=next(before,{type:'choose',index:0});
    const repeated=act(chosen,{type:'choose',index:0});
    assert.ok(repeated.error);assert.deepEqual(repeated.run,chosen);
    offer(chosen,bond);
    const duplicate=act(chosen,{type:'choose',index:0});
    assert.ok(duplicate.error);assert.deepEqual(duplicate.run,chosen);
  }
});

test('banned-element evolution offers and stale choices cannot grant forbidden cores',()=>{
  for(const bond of evolutions){
    const bannedElement=BULLET_MAP[bond.targetId].element;
    const blocked=readyFor(bond);blocked.bannedElement=bannedElement;
    assert.ok(!generateOffer(structuredClone(blocked),bond).offers.cards.includes(bond.id),bond.id);
    offer(blocked,bond);
    const result=act(blocked,{type:'choose',index:0});
    assert.match(result.error,/禁用/);assert.deepEqual(result.run,blocked);
    assert.ok(!result.run.inventory.some(b=>b.typeId===bond.targetId));
  }
});

test('activation still requires both the element threshold and the core after selection',()=>{
  for(const bond of evolutions){
    const run=next(offer(readyFor(bond),bond),{type:'choose',index:0});
    run.inventory=run.inventory.filter(b=>b.typeId!==bond.targetId);
    assert.ok(!getActiveBonds(run).includes(bond.id),`${bond.id} requires its core`);
    run.inventory=[instance(bond.targetId,'b999')];
    assert.ok(!getActiveBonds(run).includes(bond.id),`${bond.id} requires its elements`);
  }
});

test('offers and granted cores survive storage round trips without additional grants or UID changes',()=>{
  for(const bond of evolutions){
    const storage=memory(),meta=createMeta(),before=offer(readyFor(bond),bond);
    assert.equal(saveGame(before,meta,storage),null);
    const pending=loadGame(storage);assert.equal(pending.warning,null);
    const chosen=next(pending.run,{type:'choose',index:0});
    assert.equal(chosen.inventory.filter(b=>b.typeId===bond.targetId).length,1,bond.id);
    assert.equal(saveGame(chosen,meta,storage),null);
    const loaded=loadGame(storage);assert.equal(loaded.warning,null);
    assert.deepEqual(loaded.run,chosen);
    const prepared=next(loaded.run,{type:'load'});
    assert.equal(prepared.inventory.filter(b=>b.typeId===bond.targetId).length,1);
    assert.ok(prepared.magazine.includes(chosen.inventory.at(-1).uid));
    assert.equal(prepared.nextUid,chosen.nextUid);
  }
});
