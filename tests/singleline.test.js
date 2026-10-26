import test from 'node:test';
import assert from 'node:assert/strict';
import {Combat,distance} from '../src/combat.js';
import {effects} from '../src/combat-effects.js';
import {newRun} from '../src/campaign.js';
import {BULLET_MAP} from '../src/catalog.js';
function combat(id,positions=[4],lanes=positions.map((_,i)=>i%3)){
 const run=newRun(71);run.inventory=[{uid:'bullet',typeId:id,temp:{},mark:null}];
 run.magazine=Array(12).fill(null);run.magazine[0]='bullet';run.bonds=[];run.summons=[];
 run.enemies=positions.map((position,i)=>({uid:`e${i}`,typeId:'walker',position,lane:lanes[i],hp:100,maxHp:100,shield:0,wet:0,burn:0}));
 const c=new Combat(run);c.slot=0;c.current=c.layout[0];c.currentDef=BULLET_MAP[id];c.hitTargets=[];return c;
}
const damage=c=>c.s.enemies.map(e=>100-e.hp);
const cases=[['F08',[6,4,4,0]],['H02',[10,0,0,0]],['L01',[6,5,5,0]],['W08',[6,6,6,0]],['R02',[8,0,0,0]]];
for(const [id,expected] of cases){
 test(`${id}: intended isolated damage and overlap targets independent of legacy lanes`,()=>{
  const solo=combat(id);effects[id](solo);assert.deepEqual(damage(solo),[expected[0]]);
  const group=combat(id,[4,4,4,4]);effects[id](group);assert.deepEqual(damage(group),expected);
  const flat=combat(id,[4,4,4,4],[0,0,0,0]);effects[id](flat);assert.deepEqual(damage(group),damage(flat));
 });
 test(`${id}: no target produces no damage`,()=>{const c=combat(id,[]);effects[id](c);assert.equal(c.s.stats.damage,0);});
}
test('distance ignores lane and missing legacy lane values',()=>{
 assert.equal(distance({position:3,lane:0},{position:4,lane:2}),1);
 assert.equal(distance({position:3},{position:3}),0);
});
test('piercing includes overlap and behind across lanes, excludes closer enemies',()=>{
 const c=combat('W08',[4,3,4,5,6],[0,0,2,1,0]);c.s.selectedTarget='e0';effects.W08(c);
 assert.deepEqual(damage(c),[6,0,6,6,0]);
});
test('chain can advance horizontally but never revisit or exceed two jumps',()=>{
 const c=combat('L01',[1,3,5,6]);effects.L01(c);assert.deepEqual(damage(c),[6,5,5,0]);
});
test('splash respects horizontal radius and captures targets before primary death',()=>{
 const c=combat('F08',[3,4,5]);c.s.enemies[0].hp=1;effects.F08(c);
 assert.equal(c.s.enemies[0].hp,0);assert.equal(c.s.enemies[1].hp,96);assert.equal(c.s.enemies[2].hp,100);
});
test('H02 wets only its surviving primary target when a spring exists',()=>{
 const c=combat('H02',[4,4,4,4]);c.s.summons=[{kind:'spring'}];effects.H02(c);
 assert.deepEqual(c.s.enemies.map(e=>e.wet),[2,0,0,0]);
 const dry=combat('H02',[4,4]);effects.H02(dry);assert.deepEqual(dry.s.enemies.map(e=>e.wet),[0,0]);
});
test('R02 removes shield and damages only its primary target',()=>{
 const c=combat('R02',[4,4]);c.s.enemies.forEach(e=>e.shield=6);effects.R02(c);
 assert.deepEqual(damage(c),[8,0]);assert.deepEqual(c.s.enemies.map(e=>e.shield),[0,6]);
});
test('W10 selects one nearby enemy without requiring a hidden lane',()=>{
 const c=combat('W10',[4,4,4],[0,0,0]);effects.W10(c);assert.deepEqual(damage(c),[10,6,0]);
});
test('new campaigns keep compatible lane fields on one ground line',()=>{
 const r=newRun(11);assert.ok(r.waveLanes.flat().every(l=>l===0));assert.ok(r.enemies.every(e=>e.lane===0));
});
