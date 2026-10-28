import test from 'node:test';
import assert from 'node:assert/strict';
import {magicText} from '../src/spell-language.js';
import {battleFeedback,spellProfile,spellVictims,mageSprite} from '../src/battle-feedback.js';
test('magic wording preserves bounce mechanic and stable identifiers',()=>{
 assert.equal(magicText('火星弹'), '火星术');
 assert.equal(magicText('F01 子弹入夹，弹跳 2 次'), 'F01 法术入阵，弹跳 2 次');
 assert.equal(magicText('<b>花火弹</b>'), '<b>花火术</b>');
});
test('rarity and casting kind distinguish humble spells from rituals without amplifying derived casts',()=>{
 assert.equal(spellProfile({type:'shot',sourceId:'F01'}).tier,0);
 assert.equal(spellProfile({type:'shot',sourceId:'F07'}).tier,4);
 assert.equal(spellProfile({type:'shot',sourceId:'F07',secondary:true}).cast,false);
 assert.equal(spellProfile({type:'summon',sourceId:'H01'}).ritual,true);
 assert.match(mageSprite(),/warden-poses/);
 assert.match(mageSprite(),/data-actor="hero"/);
 assert.match(mageSprite(),/data-actor="cast"/);
});
test('explosion shows one area footprint and every victim together',()=>{
 const target=i=>({uid:'e'+i,typeId:'bug',position:3});
 const f={type:'explosion',sourceId:'F08',element:'fire',blast:{center:target(0),radius:1,victims:Array.from({length:9},(_,i)=>({target:target(i),hpDamage:5,killed:true}))}};
 const html=battleFeedback(f);
 assert.equal((html.match(/class="blast-footprint"/g)||[]).length,1);
 assert.equal((html.match(/class="combat-number blast-number"/g)||[]).length,9);
 assert.equal((html.match(/class="rune-projectile"/g)||[]).length,1);
 assert.equal(spellVictims(f).length,9);
});
