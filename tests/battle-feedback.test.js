import test from 'node:test';
import assert from 'node:assert/strict';
import {Combat} from '../src/combat.js';
import {newRun} from '../src/campaign.js';
import {battleFeedback} from '../src/battle-feedback.js';
test('lethal hit frames retain target position and separate damage from absorbed shield',()=>{
 const c=new Combat(newRun(71));const t=c.s.enemies[0];t.hp=3;t.shield=2;
 c.damage(t,9,'fire');const f=c.frames.at(-1);
 assert.equal(f.killed,true);assert.equal(f.hpDamage,3);assert.equal(f.absorbed,2);
 assert.equal(f.target.position,t.position);assert.equal(f.target.uid,t.uid);
 assert.equal(f.board.enemies.some(e=>e.uid===t.uid),false);
});
test('difficulty attack bonus persists across enemy attacks',()=>{
 const c=new Combat(newRun(73));const e=c.s.enemies[0];e.position=0;e.difficultyDamage=3;e.boost=0;c.s.enemies=[e];c.s.shield=0;
 const hp=c.s.hp;c.enemyPhase();const one=hp-c.s.hp;c.enemyPhase();assert.equal(hp-c.s.hp,one*2);
 const base=new Combat(newRun(73));base.s.enemies=[{...e,difficultyDamage:0}];base.s.shield=0;const before=base.s.hp;base.enemyPhase();assert.equal(one,before-base.s.hp+3);
});
test('derived hits and lightning jumps impact at the enemy without another muzzle shot',()=>{
 const c=new Combat(newRun(79)),target=c.s.enemies[0];target.hp=100;
 c.damage(target,2,'lightning');
 assert.match(battleFeedback(c.frames.at(-1)),/muzzle-flash/);
 c.derived(target,2,'fire');
 assert.equal(c.frames.at(-1).secondary,true);
 assert.doesNotMatch(battleFeedback(c.frames.at(-1)),/muzzle-flash/);
 c.damage(target,2,'lightning',{jump:true});
 assert.doesNotMatch(battleFeedback(c.frames.at(-1)),/rune-projectile/);
 assert.match(battleFeedback(c.frames.at(-1)),/impact-flare/);
});
