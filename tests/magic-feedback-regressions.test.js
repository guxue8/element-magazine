import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun} from '../src/campaign.js';
import {resolveRound} from '../src/combat.js';
import {battleFeedback,spellProfile} from '../src/battle-feedback.js';

function runWithSpell(typeId){
  const run=newRun(109);
  run.inventory=[{uid:'spell',typeId,counter:0,mark:null,temp:{}}];
  run.magazine=['spell',...Array(11).fill(null)];
  run.enemies[0].hp=run.enemies[0].maxHp=1000;
  return run;
}

test('summon creation and summon attacks have distinct visible feedback',()=>{
  for(const typeId of ['H01','R03']){
    const result=resolveRound(runWithSpell(typeId));
    const created=result.presentationFrames.find(f=>f.type==='summon'&&f.action==='summon');
    const attacked=result.presentationFrames.find(f=>f.type==='summon'&&Number.isFinite(f.hpDamage));
    assert.ok(created,typeId);assert.ok(attacked,typeId);
    assert.match(battleFeedback(created),/summoning-seal/);
    const hit=battleFeedback(attacked);
    assert.match(hit,/impact-flare/);assert.match(hit,/combat-number/);
    assert.doesNotMatch(hit,/summoning-seal|casting-seal|rune-projectile/);
    assert.equal(spellProfile(attacked).cast,false);
  }
});

test('permanent enhancement survives blast aggregation and gets an amplified impact',()=>{
  const normal=runWithSpell('F08'),enhanced=structuredClone(normal);
  enhanced.inventory[0].imprints={ember:1};
  const blast=run=>resolveRound(run).presentationFrames.find(f=>f.type==='explosion');
  const first=blast(normal),second=blast(enhanced);
  assert.ok(second.hpDamage>first.hpDamage);
  assert.equal(spellProfile(first).resonance,false);
  assert.equal(spellProfile(second).resonance,true);
  assert.doesNotMatch(battleFeedback(first),/greater-impact/);
  assert.match(battleFeedback(second),/fx-resonance/);
  assert.match(battleFeedback(second),/greater-impact/);
});
