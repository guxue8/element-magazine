import test from 'node:test';
import assert from 'node:assert/strict';
import {BONDS} from '../src/catalog.js';
import {pixelBondIcon} from '../src/bond-pixels.js';

const elementColors={fire:'#ffac4a',water:'#7bd7e5',lightning:'#e1bcff',wind:'#a6e1bc',earth:'#e5bc7a'};
function read(id){
  const uri=pixelBondIcon(id);
  assert.ok(uri.startsWith('data:image/svg+xml,'));
  const svg=decodeURIComponent(uri.slice(uri.indexOf(',')+1));
  const occupied=new Set();
  for(const m of svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[\da-f]+)"\/>/g)){
    const [x,y,w,h]=m.slice(1,5).map(Number);
    assert.ok(x>=1&&y>=1&&x+w<=31&&y+h<=31,`${id}: bounded pixels`);
    for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++)occupied.add(`${col},${row}`);
  }
  return {uri,svg,mask:[...occupied].sort().join(';'),occupied};
}
test('every bond has a complete local 32-pixel fantasy emblem',()=>{
  const images=[];
  for(const bond of BONDS){
    const {uri,svg,occupied}=read(bond.id);images.push(uri);
    assert.match(svg,/width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges"/);
    assert.match(svg,/<\/svg>$/);
    assert.ok(occupied.size>=90,bond.id);
    assert.doesNotMatch(svg,/<(?:image|script|foreignObject)|\son\w+=|url\(|href=/);
    assert.equal(pixelBondIcon(bond.id),uri,'stable cached output');
  }
  assert.equal(new Set(images).size,BONDS.length,'no repeated emblem assets');
});
test('mechanism silhouettes differ within every bond family, beyond element recoloring',()=>{
  for(const prefix of ['S','D','T','Q','A','E']){
    const family=BONDS.filter(b=>b.id.startsWith(prefix));
    assert.equal(new Set(family.map(b=>read(b.id).mask)).size,family.length,prefix);
  }
});
test('emblems retain every required element color across single through five-element bonds',()=>{
  const counts=new Set();
  for(const bond of BONDS){
    const {svg}=read(bond.id);
    const elements=Object.keys(bond.requirements);counts.add(elements.length);
    for(const e of elements)assert.ok(svg.includes(elementColors[e]),`${bond.id}: ${e}`);
  }
  assert.deepEqual([...counts].sort(),[1,2,3,4,5]);
});
test('evolution emblems carry a growth crest and malformed ids use a safe fallback',()=>{
  for(const b of BONDS.filter(b=>b.grade==='evolution'))assert.match(read(b.id).svg,/fill="#f7d788"/);
  const fallback=read('missing');
  assert.equal(pixelBondIcon('<script>alert(1)</script>'),fallback.uri);
  assert.equal(pixelBondIcon(null),fallback.uri);
  assert.equal(pixelBondIcon('__proto__'),fallback.uri);
  assert.ok(!BONDS.some(b=>pixelBondIcon(b.id)===fallback.uri));
});
