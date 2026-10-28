import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun} from '../src/campaign.js';
import {resolveRound} from '../src/combat.js';
import {battleFeedback,feedbackDuration,spellProfile,spellVictims} from '../src/battle-feedback.js';

function cast(typeId,crowd=false){
 const run=newRun(109);
 run.inventory=[{uid:'spell',typeId,counter:0,mark:null,temp:{}}];
 run.magazine=['spell',...Array(11).fill(null)];
 const base={...run.enemies[0],hp:1000,maxHp:1000,position:4};
 run.enemies=crowd?Array.from({length:8},(_,i)=>({...base,uid:`crowd-${i}`,position:3.6+i*.15})):[base];
 return resolveRound(run).presentationFrames.filter(frame=>frame.sourceId===typeId);
}

test('actual powerful casts use a native arrival instead of a generic flying bolt',()=>{
 for(const [id,form] of [['L13','thunder'],['H07','dragon'],['H21','dragon'],['R13','avatar'],['R21','avatar'],['F13','meteor'],['H13','tide'],['W06','vortex'],['F14','eruption']]){
  const frame=cast(id).find(f=>Number.isFinite(f.hpDamage)&&!f.secondary);
  assert.ok(frame,`${id} produces a primary impact`);
  const html=battleFeedback(frame);
  assert.equal(spellProfile(frame).delivery,form,id);
  assert.match(html,new RegExp(`delivery-${form}`),id);
  assert.doesNotMatch(html,/rune-projectile|muzzle-flash/,id);
  assert.ok(feedbackDuration(frame)>=520,id);
 }
 assert.match(battleFeedback(cast('H21')[0]),/data-actor="waterDragon"/);
 assert.match(battleFeedback(cast('R13')[0]),/data-actor="earthAvatar"/);
});

test('summon follow-ups and derived stone hits retain damage feedback without another ritual',()=>{
 for(const id of ['H07','R21']){
  const frames=cast(id).filter(f=>f.secondary&&Number.isFinite(f.hpDamage));
  assert.ok(frames.length,id);
  for(const frame of frames){
   const html=battleFeedback(frame);
   assert.doesNotMatch(html,/spell-delivery|rune-projectile|casting-seal/);
   assert.match(html,/combat-number/);
   assert.match(html,/impact-flare/);
   assert.equal(feedbackDuration(frame),frame.duration||420);
  }
 }
 const creation=cast('H07').find(f=>f.type==='summon'&&!Number.isFinite(f.hpDamage));
 assert.equal(feedbackDuration(creation),creation.duration||420);
});

test('large explosion keeps its actual range and all damage recipients in one visual beat',()=>{
 const frame=cast('F13',true).find(f=>f.type==='explosion');
 const before=structuredClone(frame),html=battleFeedback(frame);
 assert.ok(frame.blast.victims.length>3);
 assert.equal((html.match(/class="combat-number blast-number"/g)||[]).length,frame.blast.victims.length);
 assert.equal((html.match(/class="detonation-cloud"/g)||[]).length,1);
 assert.match(html,/data-actor="eruption"/);
 assert.ok(html.includes(`--blast-width:${frame.blast.radius*21.6}%`));
 assert.equal(spellVictims(frame).reduce((sum,v)=>sum+v.hpDamage,0),frame.hpDamage);
 assert.deepEqual(frame,before,'rendering must not alter combat results');
});

test('native and secondary eruptions render only one large flame sprite at impact',()=>{
 for(const id of ['F06','F14']){
  const frame=cast(id,true).find(f=>f.type==='explosion');
  assert.ok(frame,`${id} produces an actual blast`);
  const html=battleFeedback(frame);
  assert.equal((html.match(/data-actor="eruption"/g)||[]).length,1,id);
  assert.doesNotMatch(html,/detonation-plume/);
  assert.match(html,/blast-wave/);
  const secondary=battleFeedback({...frame,secondary:true});
  assert.equal((secondary.match(/data-actor="eruption"/g)||[]).length,1,`${id} secondary blast`);
  assert.match(secondary,/detonation-plume/);
  assert.doesNotMatch(secondary,/spell-delivery|casting-seal/);
 }
 const flame=cast('F07',true).find(f=>!f.secondary&&Number.isFinite(f.hpDamage));
 assert.ok(flame,'F07 produces a primary shot, not a spatial blast');
 assert.equal((battleFeedback(flame).match(/data-actor="eruption"/g)||[]).length,1);
});

test('presentation duration follows speed without altering enemy action or simulation timing',()=>{
 const frame=cast('L13')[0],before=structuredClone(frame);
 assert.match(battleFeedback(frame,2),new RegExp(`--fx-duration:${feedbackDuration(frame)/2}ms`));
 assert.deepEqual(frame,before);
 assert.equal(feedbackDuration({type:'enemy',action:'move',duration:600}),600);
 assert.equal(feedbackDuration({type:'shot',sourceId:'F01',hpDamage:3}),420);
 assert.equal(feedbackDuration({type:'shot',sourceId:'L02',hpDamage:3}),520);
});
