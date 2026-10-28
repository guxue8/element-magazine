import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,createMeta,previewWave,act,getIntent} from '../src/campaign.js';
import {getEnemyPreview} from '../src/difficulty.js';
import {saveGame,loadGame} from '../src/storage.js';
import {memoryStorage} from '../scripts/simulate.mjs';
import {comparisonRun} from '../scripts/compare-balance.mjs';
import {Combat} from '../src/combat.js';

const sum=(wave,key)=>wave.reduce((total,e)=>total+e[key],0);

test('v4 supplies 150 fragile targets with less total health and bounded contact pressure',()=>{
  let count=0,oldCount=0,hp=0,oldHp=0,reward=0,damage=0,oldDamage=0;
  for(let batch=1;batch<=18;batch++){
    const old=previewWave(batch,0,3),wave=previewWave(batch,0,4);
    count+=wave.length;oldCount+=old.length;hp+=sum(wave,'hp');oldHp+=sum(old,'hp');reward+=sum(wave,'draftReward');
    damage+=sum(wave,'damage');oldDamage+=sum(old,'damage');
    const boss=old.some(e=>e.id.startsWith('boss'));
    if(batch!==1&&!boss)assert.ok(wave.length>=old.length*1.5,`wave ${batch}: density`);
    else assert.equal(wave.length,old.length);
    assert.ok(sum(wave,'hp')<=sum(old,'hp')*(batch===1?1:.98),`wave ${batch}: health budget`);
    assert.ok(sum(wave,'hp')>=sum(old,'hp')*.80,`wave ${batch}: health floor`);
    assert.ok(sum(wave,'damage')<=sum(old,'damage')*1.15,`wave ${batch}: contact pressure`);
    for(const e of wave){
      assert.ok(e.hp>=1&&e.hp<=old.find(x=>x.id===e.id).hp);
      if(e.id==='bug'){assert.equal(e.hp,batch<=6?3:batch<=12?5:7);assert.equal(e.damage,1);assert.equal(e.draftReward,5);}
      else assert.equal(e.draftReward,10);
    }
  }
  assert.equal(count,150);assert.equal(oldCount,101);
  assert.ok(hp<oldHp*.95);
  assert.ok(damage<=oldDamage*1.03,'50% more bodies must not proportionally increase contact damage');
  assert.ok(reward>=oldCount*10*.95&&reward<=oldCount*10*1.05,'crowd density must not inflate recruitment income');
});

test('v4 higher difficulties remain monotone with half entry shields on fragile bugs only',()=>{
  for(let batch=1;batch<=18;batch++)for(let level=1;level<=10;level++){
    const lower=previewWave(batch,level-1,4),higher=previewWave(batch,level,4);
    for(let i=0;i<higher.length;i++){
      assert.ok(higher[i].hp>=lower[i].hp);
      assert.ok(higher[i].damage>=lower[i].damage);
      assert.ok(higher[i].shield>=lower[i].shield);
      assert.ok(higher[i].hp<=getEnemyPreview(higher[i].id,batch,level,3).hp);
      assert.ok(higher[i].damage===0||higher[i].damage>=1);
    }
  }
  assert.equal(getEnemyPreview('bug',8,10,4).shield,3);
  for(const level of [0,4,7,10]){
    assert.equal(getEnemyPreview('bug',8,level,4).shield,getEnemyPreview('bug',8,level,3).shield/2);
    assert.equal(getEnemyPreview('shield',8,level,4).shield,getEnemyPreview('shield',8,level,3).shield);
    assert.equal(getEnemyPreview('boss3',18,level,4).shield,getEnemyPreview('boss3',18,level,3).shield);
  }
});

test('v4 persisted attack and recruitment rewards agree with combat and next wave',()=>{
  const memory=memoryStorage(),meta=createMeta(),run=newRun(81);
  run.enemies[0].position=0;
  assert.equal(saveGame(run,meta,memory),null);
  const restored=loadGame(memory).run;
  assert.equal(restored.encounterVersion,4);
  assert.equal(getIntent(restored.enemies[0],restored),'攻击 4');
  const battle=new Combat(restored),hp=battle.s.hp;battle.enemyPhase();assert.equal(hp-battle.s.hp,4);
  run.batch=2;run.enemies=[];run.phase='prepare';run.magazine.fill(null);
  const spawned=act(run,{type:'execute'}).run;
  assert.equal(spawned.enemies.length,previewWave(3,0,4).length);
  const b=new Combat(spawned),bug=b.alive().find(e=>e.typeId==='bug'),draft=b.s.resources.draft;
  b.damage(bug,999,'fire');assert.equal(b.s.resources.draft-draft,5);
  assert.equal(saveGame(spawned,meta,memory),null);
  assert.deepEqual(loadGame(memory).run.enemies,spawned.enemies);
  for(const invalid of [-1,NaN,11,1.5,'5']){
    const corrupt=structuredClone(run);corrupt.enemies=[{...spawned.enemies[0],draftReward:invalid}];
    assert.ok(saveGame(corrupt,meta,memory));
  }
});

test('legacy v1-v3 encounters retain saved enemies and versioned future waves',()=>{
  for(const version of [1,2,3]){
    const memory=memoryStorage(),run=comparisonRun(91,version),meta=createMeta();
    assert.equal(saveGame(run,meta,memory),null);
    const loaded=loadGame(memory);
    assert.equal(loaded.warning,null);assert.deepEqual(loaded.run,run);
    assert.equal(loaded.run.enemies[0].draftReward,undefined);
    run.batch=7;run.enemies=[];run.phase='prepare';run.magazine.fill(null);
    const future=act(run,{type:'execute'}).run;
    assert.equal(future.enemies.length,previewWave(8,0,version).length);
    assert.ok(future.enemies.every(e=>e.draftReward===undefined));
  }
});

test('v4 preview outside the schedule remains finite',()=>{
  for(const batch of [0,19,100])for(const id of ['walker','bug','boss3']){
    const e=getEnemyPreview(id,batch,0,4);assert.ok(Number.isFinite(e.hp)&&e.hp>=1);
  }
});

test('v4 waves spread fragile bugs over three distances and spawning exactly matches the preview',()=>{
  for(let batch=2;batch<=18;batch++){
    const preview=previewWave(batch,0,4),bugs=preview.filter(e=>e.id==='bug');
    assert.deepEqual(bugs.map(e=>e.position),bugs.map((_,i)=>batch>=3?4+i%3:6));
    assert.ok(preview.filter(e=>e.id!=='bug'&&!e.id.startsWith('boss')).every(e=>e.position===6),'ranged enemies and tanks are not advanced');
    const run=newRun(37);run.batch=batch-1;run.enemies=[];run.phase='prepare';run.magazine.fill(null);
    const result=act(run,{type:'execute'});
    assert.equal(result.error,null);
    assert.deepEqual(result.run.enemies.map(e=>({typeId:e.typeId,position:e.position})),preview.map(e=>({typeId:e.id,position:e.position})));
    assert.ok(result.run.enemies.every(e=>e.lane===0),'all enemies stay on one ground line');
    for(const version of [1,2,3])assert.ok(previewWave(batch,0,version).filter(e=>!e.id.startsWith('boss')).every(e=>e.position===6));
  }
});

test('one-range and two-range explosions cover different portions of a real fresh v4 wave',()=>{
  const run=newRun(37);run.batch=7;run.enemies=[];run.phase='prepare';run.magazine.fill(null);
  const spawned=act(run,{type:'execute'}).run,battle=new Combat(spawned),center=battle.target();
  assert.equal(center.position,4);
  const close=[center,...battle.near(center,1,Infinity)],wide=[center,...battle.near(center,2,Infinity)];
  assert.ok(close.length>1,'a small blast still clears a cluster');
  assert.ok(close.length<wide.length,'radius must change actual target coverage');
  assert.equal(wide.length,spawned.enemies.length);
  assert.ok(close.every(e=>e.typeId==='bug'),'dangerous backline survives a front-centered small blast');
});
