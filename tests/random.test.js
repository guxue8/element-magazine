import test from 'node:test';
import assert from 'node:assert/strict';
import { random, sample, shuffle } from '../src/random.js';

test('seeded randomness replays after JSON round-trip', () => {
  const a={rng:123},b=JSON.parse(JSON.stringify(a));
  const draws=Array.from({length:100},()=>random(a));
  assert.deepEqual(draws,Array.from({length:100},()=>random(b)));
  assert.ok(draws.every(x=>x>=0&&x<1));
  assert.ok(new Set(draws).size>90);
});
test('weighted sampling never repeats an entity or mutates the pool', () => {
  const pool=Array.from({length:20},(_,i)=>({uid:i,weight:i===0?3:.25}));
  const result=sample({rng:51},pool,12,x=>x.weight);
  assert.equal(result.length,12);
  assert.equal(new Set(result.map(x=>x.uid)).size,12);
  assert.equal(pool.length,20);
  assert.deepEqual(new Set(sample({rng:2},pool,100)),new Set(pool));
});
test('shuffling preserves exactly the input multiset',()=>{
  const source=[1,2,3,4];
  assert.deepEqual(shuffle({rng:44},source).sort(),source);
  assert.deepEqual(source,[1,2,3,4]);
});
