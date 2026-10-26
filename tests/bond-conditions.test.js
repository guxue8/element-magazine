import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRound} from '../src/combat.js';
import {BONDS,BOND_MAP,BULLET_MAP} from '../src/catalog.js';

function runWith(ids,bond,enemy={},slots=ids.map((_,i)=>i)) {
  const inventory=ids.map((typeId,i)=>({uid:`b${i}`,typeId,counter:0,mark:null,temp:{}}));
  const filler={fire:'F15',water:'H15',lightning:'L15',wind:'W01',earth:'R15'};
  for(const [element,n] of Object.entries(BOND_MAP[bond].requirements)) {
    while(inventory.filter(b=>BULLET_MAP[b.typeId].element===element).length<n)
      inventory.push({uid:`extra${inventory.length}`,typeId:filler[element],counter:0,mark:null,temp:{}});
  }
  const magazine=Array(12).fill(null);
  slots.forEach((slot,i)=>magazine[slot]=`b${i}`);
  return {version:1,round:1,batch:1,phase:'prepare',rng:123,hp:100,maxHp:100,shield:0,
    resources:{draft:0,refresh:0,remove:0,swap:0},inventory,magazine,
    slots:Array.from({length:12},()=>({engraving:null,charge:0,recycleRound:0})),
    enemies:[{uid:'e0',typeId:'walker',hp:1000,maxHp:1000,shield:0,lane:0,position:6,
      burn:0,burnTurns:0,wet:0,slow:false,controlledAt:-2,attackCount:0,boost:0,...enemy}],
    summons:[],bonds:[bond],evolutions:{},pending:[],logs:[],stats:{kills:0,bossKills:0,damage:0,turns:0},
    defeatedBosses:[],traits:{},nextUid:100};
}
const shotAmounts=result=>result.frames.filter(f=>f.type==='shot').map(f=>f.amount);

test('火苗初燃 only fans existing burns, at most three times per magazine',()=>{
  const dry=resolveRound(runWith(['F15','F15','F15','F15'],'S01'));
  assert.deepEqual(shotAmounts(dry),[12,12,12,12]);
  assert.equal(dry.state.enemies[0].burn,0);
  const lit=resolveRound(runWith(['F15','F15','F15','F15'],'S01',{burn:1,burnTurns:2}));
  assert.deepEqual(shotAmounts(lit),[12,12,12,12]);
  assert.equal(lit.state.enemies[0].burn,4);
});
test('涓流护身 requires a pre-existing wet target and caps at two grants',()=>{
  assert.equal(resolveRound(runWith(['H15','H15','H15'],'S04')).state.shield,0);
  assert.equal(resolveRound(runWith(['H15','H15','H15'],'S04',{wet:2})).state.shield,6);
  // A water bullet applying wet after its own hit cannot grant its own shield.
  assert.equal(resolveRound(runWith(['H16'],'S04')).state.shield,0);
});
test('电荷追击 boosts later lightning bullets, never its own returning jump',()=>{
  const repeated=resolveRound(runWith(['L15','L15'],'S07'));
  assert.deepEqual(shotAmounts(repeated),[12,15]);
  const r=runWith(['L05'],'S07');
  r.enemies.push({...r.enemies[0],uid:'e1',position:5});
  const bounce=resolveRound(r);
  assert.deepEqual(shotAmounts(bounce),[8,6,6]);
});
test('电荷追击 records secondary lightning targets and resets next magazine',()=>{
  const r=runWith(['L01','L01'],'S07');
  r.enemies.push({...r.enemies[0],uid:'e1',position:5});
  const result=resolveRound(r);
  assert.deepEqual(shotAmounts(result),[6,5,8,6]);
  result.state.magazine[1]=null;
  const next=resolveRound(result.state);
  assert.deepEqual(shotAmounts(next),[6,5]);
});
test('轻风起势 requires a hit from the left neighboring slot in the same row',()=>{
  const adjacent=resolveRound(runWith(['F15','W08'],'S10'));
  assert.deepEqual(shotAmounts(adjacent),[12,7]);
  assert.deepEqual(shotAmounts(resolveRound(runWith(['W08'],'S10'))),[6]);
  assert.deepEqual(shotAmounts(resolveRound(runWith(['F15','W08'],'S10',{},[0,2]))),[12,6]);
  assert.deepEqual(shotAmounts(resolveRound(runWith(['F15','W08'],'S10',{},[3,4]))),[12,6]);
});
test('岩石弹头 is a themed earth damage bonus, without the old free shield',()=>{
  const result=resolveRound(runWith(['R15','F15'],'S13'));
  assert.deepEqual(shotAmounts(result),[14,12]);
  assert.equal(result.state.shield,0);
});
test('basic bond descriptions expose the condition and keep only one generic elemental damage bonus',()=>{
  const singles=BONDS.filter(b=>b.id.startsWith('S'));
  assert.equal(singles.filter(b=>/^[火水雷风岩]弹直接伤害 \+\d+%。$/.test(b.description)).length,1);
  for(const id of ['S01','S04','S07','S10'])assert.match(BOND_MAP[id].description,/：/);
});
