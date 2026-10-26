import test from 'node:test';
import assert from 'node:assert/strict';
import {BULLETS,BULLET_MAP,BONDS} from '../src/catalog.js';
import {cardText,keywordsForText,CARD_COPY_IDS} from '../src/card-text.js';
import {newRun} from '../src/campaign.js';
import {resolveRound} from '../src/combat.js';

test('every bullet has deliberately authored short copy and safe stat values',()=>{
  assert.deepEqual([...CARD_COPY_IDS].sort(),BULLETS.map(x=>x.id).sort());
  for(const def of BULLETS){
    const card=cardText(def);
    assert.ok(card.text.length>0&&card.text.length<=170,`${def.id}: ${card.text.length}`);
    assert.doesNotMatch(card.text,/每实体|原生|快照|锁定时位于|[FHLWRC]\d{2}/,def.id);
    assert.ok(card.stats.length>0,def.id);
    assert.ok(card.stats.every(x=>x.kind&&x.label&&String(x.value).length),def.id);
    assert.equal(new Set(card.keywords.map(x=>x.id)).size,card.keywords.length,def.id);
    assert.equal(card.details,def.description,def.id);
  }
});
test('summons, passive buffs and consumed burn are never mislabelled as direct attack',()=>{
  for(const id of ['H01','H03','H05','R01','R03','R05','F19','L14','C02'])
    assert.equal(cardText(BULLET_MAP[id]).stats.some(x=>x.kind==='damage'),false,id);
  assert.equal(cardText(BULLET_MAP.F01).stats.find(x=>x.kind==='damage').value,8);
  assert.equal(cardText(BULLET_MAP.W01).stats.find(x=>x.kind==='damage').value,'6 × 2');
  assert.equal(cardText(BULLET_MAP.R10).stats.find(x=>x.kind==='damage').value,8);
});
test('direction markers distinguish a single neighbour from a whole row or column',()=>{
  const expected={C01:'left',F16:'right',F17:'down',F18:'row',F19:'upDown',F20:'down',F21:'around',L18:'column',W16:'rightDown',R14:'up'};
  for(const [id,direction]of Object.entries(expected))assert.equal(cardText(BULLET_MAP[id]).direction,direction,id);
  assert.equal(cardText(BULLET_MAP.F01).direction,null);
});
test('keywords are relevant, unique, and include precise shared rules',()=>{
  assert.deepEqual(keywordsForText('燃烧与燃烧').map(x=>x.id),['burn']);
  assert.equal(keywordsForText('稳定射击。').length,0);
  const wet=keywordsForText('潮湿')[0];
  assert.match(wet.description,/2/);
  assert.doesNotMatch(wet.description,/受到.*伤害.*增加/);
  assert.match(cardText(BULLET_MAP.H01).keywords.find(x=>x.id==='timer').description,/入夹/);
  assert.match(cardText(BULLET_MAP.H01).keywords.find(x=>x.id==='spring').description,/6/);
  assert.match(keywordsForText('护盾')[0].description,/上限 20/);
  assert.match(keywordsForText('护盾')[0].description,/保留到下一回合/);
  assert.match(cardText(BULLET_MAP.F13).text,/24.*3|3.*24/);
  assert.match(cardText(BULLET_MAP.H21).text,/本回合.*刷新|战斗刷新/);
});
test('bond copy follows the live definition and preserves condition thresholds',()=>{
  const changed={...BONDS[0],description:'火弹命中燃烧目标：附加 2 层燃烧，每夹最多 2 次。'};
  const card=cardText(changed);
  assert.match(card.text,/命中燃烧目标/);
  assert.match(card.text,/最多 2 次/);
  assert.doesNotMatch(card.text,/15%/);
  assert.ok(card.keywords.some(x=>x.id==='burn'));
  assert.deepEqual(card.stats,[]);
});
test('formatting leaves definitions immutable and gracefully accepts missing descriptions',()=>{
  const def=structuredClone(BULLET_MAP.C01),before=JSON.stringify(def);
  cardText(def);
  assert.equal(JSON.stringify(def),before);
  assert.deepEqual(cardText(null),{text:'暂无说明',keywords:[],stats:[],direction:null,directionLabel:'',details:''});
});

test('first strike keyword is precise and does not duplicate the full phrase tooltip',()=>{
  const short=keywordsForText('火弹首击燃烧敌人。');
  assert.equal(short.filter(x=>x.id==='firstHit').length,1);
  assert.match(short.find(x=>x.id==='firstHit').description,/第一.*本体|首次.*本体/);
  assert.match(short.find(x=>x.id==='firstHit').description,/不含回响/);
  const both=keywordsForText('首击与首次命中是同一触发。');
  assert.equal(both.filter(x=>x.id==='firstHit').length,1);
});

test('all displayed primary attack values match real unmodified combat attacks',()=>{
  for(const def of BULLETS){
    const badge=cardText(def).stats.find(x=>x.kind==='damage');
    if(!badge)continue;
    const run=newRun(8001);
    run.inventory=Array.from({length:12},(_,i)=>({uid:`audit${i}`,typeId:i===0?def.id:'R18',counter:0,mark:null,temp:{}}));
    run.magazine=run.inventory.map(x=>x.uid);run.rest=null;run.phase='prepare';
    run.enemies=Array.from({length:6},(_,i)=>({uid:`target${i}`,typeId:'walker',hp:9999,maxHp:10000,shield:0,lane:0,position:3,burn:0,burnTurns:0,wet:0,slow:false,controlledAt:-2,attackCount:0,boost:0}));
    run.bonds=[];run.summons=[];run.shield=0;
    const frames=resolveRound(run).frames;
    const first=frames.find(f=>f.type==='shot'&&f.sourceId===def.id);
    assert.ok(first,`${def.id} has a real attack`);
    const base=Number(String(badge.value).split(' ')[0]);
    // F13 always carries Lurk; the badge explicitly promises the base value.
    const expected=def.id==='F13'?Math.round(base*1.2):base;
    assert.equal(first.amount,expected,`${def.id}: displayed ${badge.label} must match its first attack`);
  }
});
