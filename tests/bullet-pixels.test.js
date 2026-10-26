import test from 'node:test';
import assert from 'node:assert/strict';
import {BULLETS} from '../src/catalog.js';
import {pixelBulletIcon} from '../src/bullet-pixels.js';

function pixels(id){
  const uri=pixelBulletIcon(id),svg=decodeURIComponent(uri.slice(uri.indexOf(',')+1)),mask=new Set();
  for(const match of svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/g)){
    const [,xs,ys,ws,hs]=match,[x,y,w,h]=[xs,ys,ws,hs].map(Number);
    assert.ok(x>=1&&y>=1&&x+w<=31&&y+h<=31,`${id}: pixels must leave an unclipped border`);
    for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++)mask.add(`${col},${row}`);
  }
  return {uri,svg,mask};
}
const distance=(a,b)=>1-[...a].filter(x=>b.has(x)).length/new Set([...a,...b]).size;

test('every bullet has a complete bounded 32-pixel illustration',()=>{
  const uris=[];
  for(const bullet of BULLETS){
    const {uri,svg,mask}=pixels(bullet.id);uris.push(uri);
    assert.match(svg,/viewBox="0 0 32 32"/);
    assert.match(svg,/<\/svg>$/);
    assert.ok(mask.size>=65,bullet.id);
  }
  assert.equal(new Set(uris).size,BULLETS.length);
  assert.equal(pixelBulletIcon('missing'),'');
});

test('same-element bullets differ in main silhouettes, not only tiny rune marks',()=>{
  for(const element of ['fire','water','lightning','wind','earth']){
    const cards=BULLETS.filter(b=>b.element===element&&b.trigger!=='consumable');
    const masks=cards.map(b=>pixels(b.id).mask),distances=[];
    for(let i=0;i<masks.length;i++)for(let j=i+1;j<masks.length;j++){
      const d=distance(masks[i],masks[j]);distances.push(d);
      assert.ok(d>=.12,`${cards[i].id}/${cards[j].id}: silhouette difference ${d.toFixed(3)}`);
    }
    const average=distances.reduce((n,d)=>n+d,0)/distances.length;
    assert.ok(average>.45,`${element}: average silhouette difference ${average.toFixed(3)}`);
  }
});
