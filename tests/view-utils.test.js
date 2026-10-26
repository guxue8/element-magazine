import test from 'node:test';
import assert from 'node:assert/strict';
import {chargeSegments,enemyPoint} from '../src/view-utils.js';
test('charge bars represent full uses and partial recharge without a fourth slot',()=>{
  assert.deepEqual(chargeSegments(25,10),[1,1,.5]);
  assert.deepEqual(chargeSegments(100,30),[1,1,1]);
  assert.deepEqual(chargeSegments(0,10),[0,0,0]);
  assert.deepEqual(chargeSegments(150,100,2),[1,.5]);
  assert.deepEqual(chargeSegments(250,100,3),[1,1,.5]);
});
test('side-view enemies share one ground line and keep stable horizontal overlap',()=>{
  const enemies=Array.from({length:20},(_,i)=>({uid:`e${i+1}`,position:6,lane:1}));
  const points=enemies.map(enemyPoint);
  assert.equal(new Set(points.map(p=>`${p.x},${p.y}`)).size,20);
  assert.ok(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))<5);
  assert.equal(new Set(points.map(p=>p.y)).size,1);
  assert.equal(enemyPoint({...enemies[0],lane:0}).y,enemyPoint({...enemies[0],lane:2}).y);
  assert.deepEqual(enemyPoint(enemies[9]),enemyPoint(structuredClone(enemies[9])));
  assert.ok(enemyPoint({...enemies[0],position:5}).x<points[0].x);
});
