import test from 'node:test';
import assert from 'node:assert/strict';
import * as campaign from '../src/campaign.js';
import {BULLETS,BULLET_MAP,BONDS,BOND_MAP,ENCHANTMENT_MAP,EVENTS} from '../src/catalog.js';
import {saveGame,loadGame,GAME_STORAGE_KEY} from '../src/storage.js';

const ELEMENTS=['fire','water','lightning','wind','earth'];
const {newRun,createMeta,act}=campaign;
const next=(run,action)=>{const out=act(run,action);assert.equal(out.error,null,`${action.type}: ${out.error}`);return out.run;};
const trained=talents=>({...createMeta(),talents});
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const legalBullet=(id,ban)=>assert.notEqual(BULLET_MAP[id]?.element,ban,`${id} entered ${ban}-banned pool`);
function legalBond(id,ban){const b=BOND_MAP[id];assert.ok(b,id);assert.ok(!b.requirements[ban],`${id} requires ${ban}`);if(b.targetId)legalBullet(b.targetId,ban);}
function legalOffer(run,ban){
  assert.ok(run.offers?.cards.length,'a reward must retain choices');
  for(const id of run.offers.cards){
    if(run.offers.kind==='bond')legalBond(id,ban);
    else if(typeof id==='string'){
      if(BULLET_MAP[id])legalBullet(id,ban);
      else assert.notEqual(ENCHANTMENT_MAP[id]?.element,ban,`${id} enchanted banned element`);
    }
  }
}
function queue(run,descriptor){
  run.offers={kind:'scroll',source:'placeholder',cards:[run.bannedElement==='water'?'C08':'C04']};
  run.pending=[descriptor];
  return next(run,{type:'skip'});
}
function allAllowedInventory(run,ban){
  run.inventory=BULLETS.filter(b=>b.element!==ban&&b.trigger!=='consumable').map((b,i)=>({uid:`b${i+100}`,typeId:b.id,counter:b.counter||0,mark:null,temp:{}}));
  run.nextUid=1000;
  return run;
}

test('the random ban offer is stable, covers all five elements and does not alter new-run RNG',()=>{
  assert.equal(typeof campaign.rollElementBan,'function');
  const found=new Set();
  for(let seed=1;seed<=250;seed++){
    const before=newRun(seed),a=campaign.rollElementBan(seed),b=campaign.rollElementBan(seed);
    assert.equal(a,b);assert.ok(ELEMENTS.includes(a));found.add(a);
    const after=newRun(seed);assert.equal(before.rng,after.rng);
  }
  assert.equal(found.size,5);
});

test('every ban filters initial bullets and the optional starter reroll while retaining starter guarantees',()=>{
  for(const ban of ELEMENTS)for(let seed=1;seed<=35;seed++){
    let run=newRun(seed,trained({reroll:1}),0,ban);
    assert.equal(run.bannedElement,ban);
    for(let attempt=0;attempt<2;attempt++){
      assert.equal(run.inventory.length,4);
      const defs=run.inventory.map(b=>BULLET_MAP[b.typeId]);
      defs.forEach(b=>legalBullet(b.id,ban));
      assert.ok(defs.every(b=>b.rarity===0&&b.trigger!=='consumable'));
      assert.ok(defs.filter(b=>b.trigger==='shot').length>=3);
      assert.ok(new Set(defs.map(b=>b.element)).size>=2);
      assert.ok(ELEMENTS.every(e=>defs.filter(b=>b.element===e).length<=2));
      if(attempt===0)run=next(run,{type:'rerollStart'});
    }
  }
});

test('all recruitment tiers, focus and refresh stay within the four allowed elements',()=>{
  for(const ban of ELEMENTS)for(let seed=1;seed<=18;seed++)for(const batch of [1,4,13])for(const cost of [100,200,300].filter(c=>c!==300||batch===13)){
    let run=newRun(seed,trained({focus:1}),0,ban);
    run.batch=batch;run.resources.draft=cost;run.resources.refresh=100;
    const focus=BULLET_MAP[run.inventory[0].typeId].element;
    run=next(run,{type:'draft',cost,focus});
    for(let refresh=0;refresh<3;refresh++){
      legalOffer(run,ban);assert.equal(run.offers.cards.length,3);
      assert.equal(new Set(run.offers.cards).size,3);
      assert.equal(BULLET_MAP[run.offers.cards[0]].element,focus);
      run=next(run,{type:'refresh'});
    }
    run=next(run,{type:'choose',index:0});run.inventory.forEach(b=>legalBullet(b.typeId,ban));
  }
});

test('normal, core and evolution bonds exclude every requirement and source in the banned element',()=>{
  const seenEvolutions=new Set();
  for(const ban of ELEMENTS)for(let seed=1;seed<=12;seed++)for(const batch of [2,4,6,9,12,15,17]){
    let run=allAllowedInventory(newRun(seed,createMeta(),0,ban),ban);
    run.batch=batch;run.resources.refresh=50;
    run=queue(run,{kind:'bond',source:`bond-${batch}`,core:[6,12].includes(batch)});
    for(let refresh=0;refresh<3;refresh++){
      legalOffer(run,ban);assert.equal(run.offers.cards.length,3);
      for(const id of run.offers.cards)if(BOND_MAP[id].grade==='evolution')seenEvolutions.add(`${ban}:${id}`);
      run=next(run,{type:'refresh'});
    }
    run=next(run,{type:'choose',index:0});run.bonds.forEach(id=>legalBond(id,ban));
  }
  for(const ban of ELEMENTS)assert.ok([...seenEvolutions].some(x=>x.startsWith(`${ban}:`)),`${ban} retains evolution offers`);
});

test('every event, scroll reward, scroll-box and their refreshes retain legal usable choices',()=>{
  for(const ban of ELEMENTS)for(let seed=1;seed<=25;seed++){
    for(const event of EVENTS){
      let run=newRun(seed,createMeta(),0,ban);run.resources.refresh=30;
      run=queue(run,{kind:'event',source:`event-${event.id}`,eventId:event.id});
      legalOffer(run,ban);
      for(let index=0;index<run.offers.cards.length;index++){
        const id=run.offers.cards[index],enchant=ENCHANTMENT_MAP[id];
        const target=enchant?.kind==='slot'?0:run.inventory.find(b=>BULLET_MAP[b.typeId].trigger==='shot').uid;
        let chosen=next(run,{type:'choose',index,target});
        if(chosen.offers){legalOffer(chosen,ban);chosen=next(chosen,{type:'refresh'});legalOffer(chosen,ban);chosen=next(chosen,{type:'choose',index:0});}
        chosen.inventory.forEach(b=>{legalBullet(b.typeId,ban);if(b.mark)assert.notEqual(ENCHANTMENT_MAP[b.mark].element,ban);});
        chosen.slots.filter(s=>s.engraving).forEach(s=>assert.notEqual(ENCHANTMENT_MAP[s.engraving].element,ban));
      }
    }
    let scroll=newRun(seed,createMeta(),0,ban);scroll.resources.refresh=30;
    scroll=queue(scroll,{kind:'scroll',source:'boss-scroll'});
    for(let i=0;i<3;i++){legalOffer(scroll,ban);assert.equal(scroll.offers.cards.length,3);scroll=next(scroll,{type:'refresh'});}
  }
});

test('emergency and travel talents only grant legal elemental scrolls, once at each milestone',()=>{
  for(const ban of ELEMENTS)for(let seed=1;seed<=10;seed++){
    let run=newRun(seed,trained({emergency:1,rescueScroll:1,scrollCache:1}),0,ban);
    run=next(run,{type:'load'});run.magazine.fill(null);run.hp=31;run.enemies[0].position=0;
    run=next(run,{type:'execute'});
    const rescue=run.inventory.filter(b=>BULLET_MAP[b.typeId].trigger==='consumable');
    assert.deepEqual(rescue.map(b=>b.typeId),[ban==='water'?'C08':'C04']);
    for(const batch of [6,12,18]){
      run.batch=batch;run.isCleanup=false;run.offers=null;run.pending=[];run.enemies=[];
      run=next(run,{type:'load'});run.magazine.fill(null);run=next(run,{type:'execute'});
      run.inventory.forEach(b=>legalBullet(b.typeId,ban));
    }
    assert.equal(run.inventory.filter(b=>BULLET_MAP[b.typeId].trigger==='consumable').length,4);
    assert.deepEqual(run.talentState.scrollBatches,[6,12,18]);
  }
});

test('ban saves round-trip; legacy saves default to no ban without touching inventory or RNG',()=>{
  const storage=memory(),meta=createMeta();
  for(const ban of [...ELEMENTS,null]){
    const run=newRun(51,meta,0,ban);
    assert.equal(saveGame(run,meta,storage),null);
    assert.deepEqual(loadGame(storage).run,run);
  }
  const legacy=newRun(52,meta);delete legacy.bannedElement;
  storage.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run:legacy,meta}));
  const loaded=loadGame(storage);
  assert.equal(loaded.warning,null);assert.equal(loaded.run.bannedElement,null);
  assert.deepEqual(loaded.run.inventory,legacy.inventory);assert.equal(loaded.run.rng,legacy.rng);
});

test('invalid bans and incompatible inventories, bonds, enchantments and candidate cards cannot overwrite a save',()=>{
  assert.throws(()=>newRun(1,createMeta(),0,'void'),/元素|element/i);
  const storage=memory(),meta=createMeta(),run=newRun(61,meta,0,'fire');
  assert.equal(saveGame(run,meta,storage),null);const original=storage.getItem(GAME_STORAGE_KEY);
  const cases=[{...run,bannedElement:'void'},{...run,inventory:[...run.inventory,{uid:'illegal',typeId:'F01',counter:0,mark:null,temp:{}}]},
    {...run,bonds:['S01']},{...run,offers:{kind:'bullet',source:'bad',cost:100,cards:['F01']}},
    {...run,offers:{kind:'bond',source:'bad',cards:['A01']}},
    {...run,offers:{kind:'enchant',source:'bad',cards:['M03']}}];
  const marked=structuredClone(run);marked.inventory[0].mark='M03';cases.push(marked);
  const engraved=structuredClone(run);engraved.slots[0].engraving='G01';cases.push(engraved);
  for(const bad of cases){assert.ok(saveGame(bad,meta,storage));assert.equal(storage.getItem(GAME_STORAGE_KEY),original);}
});

test('skipping the ban preserves the original five-element seeded draft',()=>{
  let run=newRun(901,createMeta(),0,null);run=next(run,{type:'draft',cost:100});
  assert.equal(run.bannedElement,null);
  assert.deepEqual({inventory:run.inventory.map(b=>b.typeId),offers:run.offers.cards,eventOrder:run.eventOrder,rng:run.rng},
    {inventory:['F02','F01','R02','H02'],offers:['F09','R10','L15'],eventOrder:['anvil','camp','circuit','supplies'],rng:3658368279});
});
