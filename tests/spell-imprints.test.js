import test from 'node:test';
import assert from 'node:assert/strict';
import {BULLET_MAP} from '../src/catalog.js';
import {newRun,createMeta,act,getDrawWeight} from '../src/campaign.js';
import {resolveRound} from '../src/combat.js';
import {loadGame,saveGame} from '../src/storage.js';
import {imprintSpell,imprintDamageBonus,imprintDrawFlags,validSpellImprints,spellImprintLabels} from '../src/spell-imprints.js';

const item=(typeId,uid=typeId)=>({uid,typeId,counter:BULLET_MAP[typeId].counter,mark:null,temp:{}});
function fixture(ids){
  const run=newRun(70);
  run.inventory=ids.map((id,i)=>item(id,`b${i}`));
  run.magazine=Array.from({length:12},(_,i)=>run.inventory[i]?.uid||null);
  run.phase='prepare';run.pending=[];run.offers=null;
  run.enemies[0].hp=run.enemies[0].maxHp=1000;
  return run;
}
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};

test('fire imprints affect only the chosen damage spell and stop at three stacks',()=>{
  const target=item('F15'),sameName=item('F15','other');
  for(let i=0;i<3;i++)assert.equal(imprintSpell(target,'ember'),true);
  assert.equal(imprintSpell(target,'ember'),false);
  assert.equal(imprintDamageBonus(target),.6);
  assert.equal(imprintDamageBonus(sameName),0);
  for(const id of ['C01','F19','H01','R03'])assert.equal(imprintSpell(item(id),'ember'),false,id);
  assert.ok(spellImprintLabels(target).some(label=>label.includes('60%')));
});

test('fire scroll is consumed but its bonus survives subsequent rounds and saving',()=>{
  let run=fixture(['F15','C01','F15','F15']);
  run.magazine[2]=run.magazine[3]=null;
  const first=resolveRound(run);
  assert.equal(first.frames.find(f=>f.sourceId==='F15'&&f.hpDamage)?.amount,19);
  run=first.state;
  assert.deepEqual(run.inventory[0].imprints,{ember:1});
  assert.equal(run.inventory.some(b=>b.typeId==='C01'),false);
  const store=memory();assert.equal(saveGame(run,createMeta(),store),null);
  run=loadGame(store).run;assert.ok(run);
  run.round++;
  assert.equal(resolveRound(run).frames.find(f=>f.sourceId==='F15'&&f.hpDamage)?.amount,19);
  assert.equal(run.inventory[1].imprints,undefined);
});

test('fire imprints are kept while a timer is still charging',()=>{
  let run=fixture(['L11','C01','F15','F15']);
  run.inventory[0].counter=3;run.magazine[2]=run.magazine[3]=null;
  run=resolveRound(run).state;
  assert.deepEqual(run.inventory[0].imprints,{ember:1});
  assert.equal(run.inventory[0].counter,2);
  run.round++;run.inventory[0].counter=1;
  const enhanced=resolveRound(run).frames.find(f=>f.sourceId==='L11'&&f.hpDamage);
  const ordinary=structuredClone(run);delete ordinary.inventory[0].imprints;
  const base=resolveRound(ordinary).frames.find(f=>f.sourceId==='L11'&&f.hpDamage);
  assert.equal(enhanced.amount,Math.round(base.amount*1.2));
});

test('magnetic and lurking scrolls persist across repeated loads; duplicate sources do not multiply',()=>{
  let run=fixture(['F15','C07','F15','F15','C06']);
  const first=resolveRound(run);
  assert.equal(first.frames.find(f=>f.sourceId==='F15'&&f.hpDamage)?.amount,16,'new lurking starts next load');
  run=first.state;
  const target=run.inventory.find(b=>b.uid==='b0');
  assert.deepEqual(imprintDrawFlags(target),{magnet:true,lurk:true});
  assert.equal(getDrawWeight(run,target),1);
  assert.equal(imprintSpell(target,'magnet'),false);
  const store=memory();assert.equal(saveGame(run,createMeta(),store),null);
  run=loadGame(store).run;assert.ok(run);
  for(let i=0;i<3;i++){
    run.phase='supply';run.pending=[];run.offers=null;
    const result=act(run,{type:'load'});assert.equal(result.error,null);
    run=result.run;
    const loaded=run.inventory.find(b=>b.uid==='b0');
    assert.deepEqual(loaded.imprints,{lurk:true,magnet:true});
    assert.equal(loaded.temp.loadedLurk,true);
    assert.equal(getDrawWeight(run,loaded),1);
    loaded.mark='M01';assert.equal(getDrawWeight(run,loaded),1);
  }
});

test('magnetic scroll marks both vertical neighbours while preserving other marks',()=>{
  const run=fixture(['F15','F15','F15','F15','C06','F15','F15','F15','H01']);
  run.inventory[0].mark='M03';
  const result=resolveRound(run).state;
  assert.equal(result.inventory.find(b=>b.uid==='b0').imprints.magnet,true);
  assert.equal(result.inventory.find(b=>b.uid==='b8').imprints.magnet,true);
  assert.equal(result.inventory.find(b=>b.uid==='b0').mark,'M03');
  assert.equal(result.inventory.find(b=>b.uid==='b1').imprints,undefined);
});

test('permanent draw flags preserve opposite weights and do not affect consumables',()=>{
  const run=fixture(['F15','F15','F15']);
  const a=run.inventory[0],b=run.inventory[1];
  imprintSpell(a,'magnet');imprintSpell(b,'lurk');
  assert.equal(getDrawWeight(run,a),2);assert.equal(getDrawWeight(run,b),.5);
  assert.equal(imprintSpell(item('C08'),'magnet'),false);
  assert.equal(imprintSpell(item('C08'),'lurk'),false);
});

test('persistent damage enhances all native repeat hits but not echo or derived damage',()=>{
  const run=fixture(['W01','C01','W04','F15']);
  run.magazine[3]=null;
  const result=resolveRound(run);
  const native=result.frames.filter(f=>f.sourceId==='W01'&&!f.secondary&&Number.isFinite(f.hpDamage));
  assert.deepEqual(native.map(f=>f.amount),[7,7]);
  // W04 follows the consumed scroll slot, so use a fresh round with adjacent echo.
  const next=result.state;
  next.round++;next.magazine[1]='b2';next.magazine[2]=null;
  const repeated=resolveRound(next);
  const echoes=repeated.frames.filter(f=>f.sourceId==='W01'&&f.secondary&&Number.isFinite(f.hpDamage));
  assert.deepEqual(echoes.map(f=>f.amount),[3,3]);
});

test('old saves omit imprints; malformed or out-of-range persistent imprints are rejected',()=>{
  assert.equal(validSpellImprints(undefined),true);
  for(const value of [null,[],{ember:4},{ember:-1},{ember:.2},{magnet:1},{lurk:'true'},{unknown:true}]){
    assert.equal(validSpellImprints(value),false,JSON.stringify(value));
    const run=fixture(['F15','F15','F15']);run.inventory[0].imprints=value;
    assert.ok(saveGame(run,createMeta(),memory()));
  }
  const run=fixture(['F15','F15','F15']);
  assert.equal(saveGame(run,createMeta(),memory()),null);
});
