import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonRun,compareBalance} from '../scripts/compare-balance.mjs';

test('balance comparison starts both versions with the same cards and random state',()=>{
  for(const seed of [1,7,31]){
    const old=comparisonRun(seed,2),current=comparisonRun(seed,3);
    assert.deepEqual(old.inventory,current.inventory);
    assert.equal(old.rng,current.rng);
    assert.equal(old.enemies.length,current.enemies.length);
    assert.equal(old.enemies[0].hp,19);
    assert.equal(current.enemies[0].hp,18);
    assert.equal(old.enemies[0].difficultyDamage,0);
    assert.equal(current.enemies[0].difficultyDamage,-1);
  }
});

test('same modest policy gains kills, surviving health and clears on the new introductory encounters',()=>{
  const report=compareBalance(20,[0]);
  const [old,current]=report.groups;
  assert.ok(current.wins>old.wins,'the fixed policy should clear more seeds');
  assert.ok(current.meanFinalHp>old.meanFinalHp+10,'survival should leave more room for mistakes');
  assert.ok(current.meanWinnerHp>old.meanWinnerHp,'successful runs should also have more health left');
  assert.ok(current.meanKills>old.meanKills*1.25,'more fragile targets should create noticeably more kills');
  assert.ok(current.rows.every(row=>row.saveChecks>0),'all campaigns must exercise save restore');
});
