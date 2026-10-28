import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonRun,compareBalance} from '../scripts/compare-balance.mjs';

test('balance comparison starts both versions with the same cards and random state',()=>{
  for(const seed of [1,7,31]){
    const old=comparisonRun(seed,3),current=comparisonRun(seed,4);
    assert.deepEqual(old.inventory,current.inventory);
    assert.equal(old.rng,current.rng);
    assert.equal(old.enemies.length,current.enemies.length);
    assert.equal(old.enemies[0].hp,18);
    assert.equal(current.enemies[0].hp,18);
    assert.equal(old.enemies[0].difficultyDamage,-1);
    assert.equal(current.enemies[0].difficultyDamage,-2);
  }
});

test('same modest policy sees more kills without losing introductory clears or survival margin',()=>{
  const report=compareBalance(20,[0]);
  const [old,current]=report.groups;
  // The accompanying spell changes can bring both encounter versions to 100%
  // clears. A strict increase is impossible at that ceiling; the deterministic
  // per-wave health/attack budget tests separately verify the actual easing.
  assert.ok(current.wins>=old.wins,'more bodies must not lower the clear count');
  assert.ok(current.meanWinnerHealthPercent>=old.meanWinnerHealthPercent-5,'extra targets must preserve survival margin');
  assert.ok(current.meanKills>old.meanKills*1.4,'more fragile targets should create noticeably more kills');
  assert.ok(current.rows.every(row=>row.saveChecks>0),'all campaigns must exercise save restore');
});
