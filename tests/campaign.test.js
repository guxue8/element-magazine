import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,act,createMeta,getCounts,applyRunReward,buyTalent,resetTalents} from '../src/campaign.js';
import {BULLET_MAP,BULLETS} from '../src/catalog.js';

const doAction=(run,action)=>{
  const result=act(run,action);
  assert.equal(result.error,null,result.error);
  return result.run;
};
test('100 random starts obey the small mixed starting deck constraints',()=>{
  for(let seed=1;seed<=100;seed++){
    const r=newRun(seed,createMeta());
    assert.equal(r.inventory.length,4);
    assert.equal(new Set(r.inventory.map(x=>x.typeId)).size,4);
    assert.ok(r.inventory.every(x=>BULLET_MAP[x.typeId].rarity===0));
    assert.ok(r.inventory.filter(x=>BULLET_MAP[x.typeId].trigger==='shot').length>=3);
    assert.ok(Math.max(...Object.values(getCounts(r)))<=2);
    assert.equal(r.enemies.length,1);
  }
});
test('skipping a paid draft preserves fees and offers cannot be reclaimed',()=>{
  const original=newRun(10);
  const paid=doAction(original,{type:'draft',cost:100});
  assert.equal(original.resources.draft,100);
  assert.equal(paid.resources.draft,0);
  assert.equal(new Set(paid.offers.cards.map(id=>BULLET_MAP[id].element)).size,3);
  const skipped=doAction(paid,{type:'skip'});
  assert.equal(skipped.resources.draft,0);
  assert.equal(skipped.inventory.length,4);
  assert.equal(skipped.offers,null);
  assert.ok(act(skipped,{type:'choose',index:0}).error);
});
test('loading once uses all four entities with eight empty slots',()=>{
  const loaded=doAction(newRun(8),{type:'load'});
  assert.equal(loaded.magazine.filter(Boolean).length,4);
  assert.equal(new Set(loaded.magazine.filter(Boolean)).size,4);
  assert.deepEqual(loaded.magazine.slice(4),Array(8).fill(null));
  assert.ok(act(loaded,{type:'load'}).error);
  assert.ok(act(loaded,{type:'draft',cost:100}).error);
});
test('deletion removes only one permanent instance and respects the three-card floor',()=>{
  let r=doAction(newRun(11),{type:'load'});
  const uid=r.magazine[0];
  r=doAction(r,{type:'remove',slot:0});
  assert.equal(r.inventory.length,3);
  assert.equal(r.inventory.some(x=>x.uid===uid),false);
  assert.equal(r.magazine[0],null);
  r.resources.remove=100;
  assert.ok(act(r,{type:'remove',slot:1}).error);
});
test('swap costs ten and preserves counters and inventory',()=>{
  let r=doAction(newRun(22),{type:'load'});
  const prior=structuredClone(r);
  r=doAction(r,{type:'swap',a:0,b:7});
  assert.equal(r.magazine[7],prior.magazine[0]);
  assert.equal(r.magazine[0],null);
  assert.equal(r.resources.swap,prior.resources.swap-10);
  assert.deepEqual(r.inventory,prior.inventory);
});
test('third price tier is locked before batch thirteen',()=>{
  const r=newRun(23);r.resources.draft=1000;
  assert.ok(act(r,{type:'draft',cost:300}).error);
  r.batch=13;
  const next=doAction(r,{type:'draft',cost:300});
  assert.equal(next.resources.draft,700);
  assert.ok(next.offers.cards.every(id=>BULLET_MAP[id].rarity>=1));
});
test('old enemies remain while the next batch enters without a clear requirement',()=>{
  let r=doAction(newRun(31),{type:'load'});
  r.magazine.fill(null);
  const old=r.enemies[0].uid;
  const result=act(r,{type:'execute'});
  assert.equal(result.error,null);
  assert.equal(result.run.batch,2);
  assert.equal(result.run.enemies.length,3);
  assert.equal(result.run.enemies.find(x=>x.uid===old).position,5);
  assert.equal(result.run.offers.kind,'bond');
  const skipped=doAction(result.run,{type:'skip'});
  assert.equal(skipped.bonds.length,0);
  assert.equal(skipped.resources.draft,result.run.resources.draft);
});
test('same saved state produces the same draw and resolution',()=>{
  let r=newRun(44);r.resources.draft=400;
  r=doAction(r,{type:'draft',cost:200});
  const cloned=JSON.parse(JSON.stringify(r));
  const a=doAction(doAction(r,{type:'choose',index:0}),{type:'load'});
  const b=doAction(doAction(cloned,{type:'choose',index:0}),{type:'load'});
  assert.deepEqual(a,b);
  assert.deepEqual(act(a,{type:'execute'}).run,act(b,{type:'execute'}).run);
});
test('meta payouts are once per run and talents refund their actual costs',()=>{
  const run=newRun(55);run.phase='ended';run.outcome='victory';run.completedBatches=18;run.stats.bossKills=3;
  const meta=applyRunReward(createMeta(),run);
  assert.equal(meta.points,11);
  assert.deepEqual(applyRunReward(meta,run),meta);
  const upgraded=buyTalent(meta,'body');
  assert.equal(upgraded.points,10);
  assert.equal(upgraded.talents.body,1);
  assert.equal(resetTalents(upgraded).points,11);
});
test('weighted draws still cannot repeat a physical instance',()=>{
  let r=newRun(70);
  r.inventory=Array.from({length:30},(_,i)=>({uid:`b${i}`,typeId:BULLETS.filter(x=>x.trigger!=='consumable')[i].id,counter:2,mark:i===0?'M01':null,temp:{}}));
  r=doAction(r,{type:'load'});
  assert.equal(new Set(r.magazine).size,12);
});
test('attack marks reject pure summons while allowing ordinary earth attacks',()=>{
  for(const typeId of ['H01','H03','H05','R01','R03','R05','R02','R04']){
    const r=newRun(71);
    r.inventory[0].typeId=typeId;
    r.offers={kind:'enchant',source:'test-anvil',cards:['M03','M04']};
    for(let index=0;index<2;index++){
      const result=act(r,{type:'choose',index,target:r.inventory[0].uid});
      assert.equal(Boolean(result.error),!['R02','R04'].includes(typeId),typeId);
    }
  }
});
