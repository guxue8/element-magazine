import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../src/catalog.js';
test('catalog has complete unique content and valid references',()=>{
 assert.equal(c.BULLETS.length,113); assert.equal(new Set(c.BULLETS.map(x=>x.id)).size,113);
 for(const element of Object.keys(c.ELEMENTS)) { const cards=c.BULLETS.filter(x=>x.element===element&&x.trigger!=='consumable'); assert.equal(cards.length,21); assert.deepEqual([0,1,2,3,4].map(r=>cards.filter(x=>x.rarity===r).length),[5,5,5,3,3]); }
 for(const x of c.BULLETS) { assert.ok(x.description.length>5); assert.ok(c.ELEMENTS[x.element]); assert.equal(c.BULLET_MAP[x.id],x); assert.ok(['shot','timer','passive','consumable'].includes(x.trigger)); }
 assert.equal(c.BONDS.length,61); assert.equal(new Set(c.BONDS.map(x=>x.id)).size,61); assert.equal(c.BONDS.filter(x=>x.grade==='core').length,12);
 for(const b of c.BONDS) { for(const k of Object.keys(b.requirements)) assert.ok(c.ELEMENTS[k]); if(b.grade==='evolution'){assert.ok(c.BULLET_MAP[b.targetId]);assert.equal(b.stages.length,3);} }
 assert.equal(c.BOND_MAP.T06.whiteRequired,8); assert.equal(c.ENCHANTMENTS.length,10); assert.equal(Object.keys(c.ENEMIES).length,11);
 assert.equal(c.WAVES.length,18); assert.equal(c.WAVES.flat().length,53); for(const id of c.WAVES.flat()) assert.ok(c.ENEMIES[id]);
 const hp=c.WAVES.reduce((sum,w,i)=>sum+w.reduce((n,id)=>n+(id.startsWith('boss')?c.ENEMIES[id].hp:Math.ceil(c.ENEMIES[id].hp*(i<6?1:i<12?1.6:2.4))),0),0); assert.equal(hp,3954);
 assert.equal(c.TALENTS.length,30); assert.equal(c.TALENTS.reduce((n,t)=>n+t.costs.reduce((a,b)=>a+b,0),0),130); assert.equal(c.EVENTS.length,4);
 assert.equal(c.TALENTS.slice(0,10).reduce((n,t)=>n+t.costs.reduce((a,b)=>a+b,0),0),26);
 for(const t of c.TALENTS){assert.ok(t.costs.length>0);assert.ok(t.costs.every(n=>Number.isInteger(n)&&n>0));}
});
test('approved IDs preserve card identity, modes and evolution targets',()=>{
 assert.equal(new Set(c.BULLETS.map(x=>x.name)).size,113);
 for(const prefix of ['F','H','L','W','R']) for(let i=1;i<=21;i++) assert.ok(c.BULLET_MAP[`${prefix}${String(i).padStart(2,'0')}`]);
 assert.deepEqual(['H01','H18','R03','R11','L08','W07'].map(id=>[id,c.BULLET_MAP[id].name,c.BULLET_MAP[id].trigger,c.BULLET_MAP[id].counter]),[['H01','泉种弹','timer',1],['H18','回潮弹','shot',0],['R03','礁种弹','timer',2],['R11','碎石弹','shot',0],['L08','电容弹','timer',2],['W07','复调风眼','timer',2]]);
 assert.deepEqual(c.BONDS.filter(x=>x.grade==='evolution').map(x=>x.targetId),['F16','F11','H18','L11','L14','W03','R03','R11']);
 for(const x of c.ENCHANTMENTS) assert.equal(c.ENCHANTMENT_MAP[x.id],x);
 for(const kind of ['mark','slot']) assert.equal(new Set(c.ENCHANTMENTS.filter(x=>x.kind===kind).map(x=>x.element)).size,5);
 assert.deepEqual(c.TALENTS.slice(0,15).map(x=>x.id),['body','repair','supply','refresh','remove','swap','emergency','focus','medicine','reroll','freeSwap','freeRefresh','skipRefresh','scrollCache','rescueScroll']);
 assert.deepEqual(c.TALENTS.slice(10,15).map(x=>[x.id,x.costs]),[['freeSwap',[3]],['freeRefresh',[2]],['skipRefresh',[3]],['scrollCache',[3]],['rescueScroll',[3]]]);
 assert.deepEqual([c.BOND_MAP.S13.name,c.BOND_MAP.S13.requirements],['岩石弹头',{earth:3}]);
 assert.deepEqual(c.EVENTS.map(x=>x.id),['anvil','circuit','supplies','camp']);
});
