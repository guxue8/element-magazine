import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,createMeta,applyRunReward,previewWave,act,getIntent} from '../src/campaign.js';
import {loadGame,saveGame,GAME_STORAGE_KEY} from '../src/storage.js';
import {ENEMIES,WAVES} from '../src/catalog.js';
import {getEnemyPreview,getWaveIds} from '../src/difficulty.js';
import {Combat} from '../src/combat.js';

const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const ended=(level,outcome='victory',id=`clear-${level}`)=>{
  const run=newRun(91,{...createMeta(),unlockedDifficulty:10},level);
  return {...run,id,phase:'ended',outcome,completedBatches:18,stats:{...run.stats,bossKills:3}};
};

test('new players start at difficulty zero and cannot enter a locked tier',()=>{
  const meta=createMeta();
  assert.equal(meta.unlockedDifficulty,0);
  assert.equal(newRun(1,meta,10).difficulty,0);
  assert.equal(newRun(1,meta).encounterVersion,4);
  assert.equal(newRun(1,{...meta,unlockedDifficulty:3},2).difficulty,2);
  assert.equal(newRun(1,{...meta,unlockedDifficulty:3},9).difficulty,3);
  assert.equal(newRun(1,{...meta,unlockedDifficulty:3},-1).difficulty,0);
});

test('victories unlock only the next tier; replaying a lower tier and defeats do not skip tiers',()=>{
  const first=applyRunReward(createMeta(),ended(0));
  assert.equal(first.unlockedDifficulty,1);
  assert.equal(first.points,11);
  assert.equal(applyRunReward(first,ended(0,'victory','repeat-zero')).unlockedDifficulty,1);
  assert.equal(applyRunReward(first,ended(1,'defeat')).unlockedDifficulty,1);
  assert.equal(applyRunReward(first,ended(8)).unlockedDifficulty,1,'foreign high-tier results cannot skip unlocks');
  const second=applyRunReward(first,ended(1));
  assert.equal(second.unlockedDifficulty,2);
  assert.deepEqual(applyRunReward(second,ended(1)),second);
  const top=applyRunReward({...second,unlockedDifficulty:10},ended(10));
  assert.equal(top.unlockedDifficulty,10);
});

test('difficulty zero has lower individual health and later waves contain more low-health enemies',()=>{
  const first=newRun(5);
  assert.ok(first.enemies[0].hp<ENEMIES.walker.hp);
  const preview=previewWave(8,0);
  assert.ok(preview.length>WAVES[7].length);
  assert.ok(preview.find(e=>e.id==='bug').hp<ENEMIES.bug.hp*1.6);
  let run=newRun(5);run.batch=7;run.enemies=[];run.phase='prepare';run.magazine.fill(null);
  const result=act(run,{type:'execute'});
  assert.equal(result.error,null);
  assert.deepEqual(result.run.enemies.map(e=>({id:e.typeId,hp:e.hp,shield:e.shield})),preview.map(e=>({id:e.id,hp:e.hp,shield:e.shield})));
});

test('higher difficulty increases health, attack and entry shield with readable intent',()=>{
  const low=newRun(7,{...createMeta(),unlockedDifficulty:10},0);
  const high=newRun(7,{...createMeta(),unlockedDifficulty:10},10);
  const a=low.enemies[0],b=high.enemies[0];
  assert.ok(b.hp>a.hp);
  assert.ok(b.difficultyDamage>a.difficultyDamage);
  assert.ok(b.shield>a.shield);
  b.position=0;
  assert.equal(getIntent(b,high),`攻击 ${ENEMIES[b.typeId].damage+b.difficultyDamage}`);
});

test('legacy saves retain their current enemies and original future waves while old winners unlock tier one',()=>{
  const memory=storage(),run=newRun(31),meta=createMeta();
  delete run.difficulty;delete run.encounterVersion;delete meta.unlockedDifficulty;
  meta.wins=2;meta.points=7;meta.talents={body:1};
  run.enemies[0].hp=30;run.enemies[0].maxHp=30;delete run.enemies[0].difficultyDamage;
  memory.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run,meta}));
  const loaded=loadGame(memory);
  assert.equal(loaded.warning,null);
  assert.equal(loaded.meta.unlockedDifficulty,1);
  assert.equal(loaded.meta.points,7);
  assert.deepEqual(loaded.meta.talents,{body:1});
  assert.equal(loaded.run.difficulty,0);
  assert.equal(loaded.run.encounterVersion,1);
  assert.deepEqual(loaded.run.enemies,run.enemies);
  assert.equal(loaded.run.rng,run.rng);
  const preview=previewWave(8,loaded.run.difficulty,loaded.run.encounterVersion);
  assert.equal(preview.length,WAVES[7].length);
  assert.equal(preview[0].hp,48);
  assert.equal(saveGame(loaded.run,loaded.meta,memory),null);
});

test('new difficulty saves round-trip and invalid levels are rejected',()=>{
  const memory=storage(),meta={...createMeta(),unlockedDifficulty:5},run=newRun(12,meta,5);
  assert.equal(saveGame(run,meta,memory),null);
  assert.deepEqual(loadGame(memory),{run,meta,warning:null});
  assert.ok(saveGame({...run,difficulty:11},meta,memory));
  assert.ok(saveGame({...run,difficulty:-1},meta,memory));
  assert.ok(saveGame(run,{...meta,unlockedDifficulty:11},memory));
});

test('v3 adds fragile targets while reducing every ordinary wave health and attack budget',()=>{
  for(let batch=1;batch<=18;batch++){
    const old=previewWave(batch,0,2),wave=previewWave(batch,0,3);
    const sum=(list,key)=>list.reduce((total,e)=>total+e[key],0);
    if(old.some(e=>e.id.startsWith('boss'))){
      assert.equal(wave.length,old.length);
      const boss=wave.find(e=>e.id.startsWith('boss')),prior=old.find(e=>e.id===boss.id);
      assert.ok(boss.hp<=Math.ceil(prior.hp*.9));
    }else{
      if(batch===1)assert.equal(wave.length,1);
      else assert.ok(wave.length>=old.length*1.3&&wave.length<=old.length*1.6,`wave ${batch} count`);
      assert.ok(sum(wave,'hp')<=sum(old,'hp')*.95,`wave ${batch} health ceiling`);
      assert.ok(sum(wave,'hp')>=sum(old,'hp')*(batch<=3?.75:.85),`wave ${batch} health floor`);
    }
    assert.ok(sum(wave,'damage')<=sum(old,'damage'),`wave ${batch} attack budget`);
    for(const bug of wave.filter(e=>e.id==='bug')){
      assert.ok(bug.hp<=11,`wave ${batch} swarm health`);
      assert.equal(bug.damage,1);
    }
    for(const enemy of wave.filter(e=>e.id!=='bug')){
      assert.ok(enemy.hp<=old.find(e=>e.id===enemy.id).hp,`wave ${batch}: ${enemy.id} must not gain health to fill a budget`);
    }
  }
});

test('single-enemy preview stays finite outside the normal wave schedule',()=>{
  for(const batch of [0,19,100])for(const id of Object.keys(ENEMIES)){
    const enemy=getEnemyPreview(id,batch,0,3);
    assert.ok(Number.isFinite(enemy.hp)&&enemy.hp>0,`${id} batch ${batch}`);
  }
});

test('v1 and v2 previews retain the original enemy health, counts, attack and shields',()=>{
  for(const version of [1,2])for(let batch=1;batch<=18;batch++)for(const level of [0,5,10]){
    const extra=version===2&&batch>=3&&!WAVES[batch-1].some(id=>id.startsWith('boss'))?Array(batch<7?1:2).fill('bug'):[];
    const ids=[...WAVES[batch-1],...extra];
    assert.deepEqual(getWaveIds(batch,version),ids);
    for(const id of ids){
      const e=getEnemyPreview(id,batch,level,version),def=ENEMIES[id],boss=id.startsWith('boss');
      const scale=batch<=6?1:batch<=12?1.6:2.4;
      assert.equal(e.hp,version===1?(boss?def.hp:Math.ceil(def.hp*scale)):Math.ceil(def.hp*(boss?.9:scale*.62)*(1+level*.12)));
      assert.equal(e.damage,def.damage+(version===2&&def.damage>0?Math.floor((level+1)/3):0));
      assert.equal(e.shield,version===1?0:level>=10?6:level>=7?4:level>=4?2:0);
    }
  }
});

test('v3 attack reduction survives save restore and matches both intent and combat',()=>{
  const memory=storage(),meta=createMeta(),run=newRun(31);
  run.encounterVersion=3;
  const preview=getEnemyPreview('walker',1,0,3);
  Object.assign(run.enemies[0],{hp:preview.hp,maxHp:preview.hp,difficultyDamage:preview.difficultyDamage});
  const e=run.enemies[0];e.position=0;
  assert.equal(e.difficultyDamage,-1);
  assert.equal(saveGame(run,meta,memory),null);
  const restored=loadGame(memory).run;
  assert.equal(restored.encounterVersion,3);
  assert.equal(getIntent(restored.enemies[0],restored),'攻击 5');
  const battle=new Combat(restored),hp=battle.s.hp;battle.enemyPhase();
  assert.equal(hp-battle.s.hp,5);
});

test('v2 saves preserve their current enemies and future encounter rules on restore',()=>{
  const memory=storage(),meta=createMeta(),run=newRun(31);
  run.encounterVersion=2;
  const p=getEnemyPreview('walker',1,0,2);
  Object.assign(run.enemies[0],{hp:p.hp,maxHp:p.hp,difficultyDamage:p.difficultyDamage});
  assert.equal(saveGame(run,meta,memory),null);
  const restored=loadGame(memory);
  assert.equal(restored.warning,null);
  assert.deepEqual(restored.run,run);
  assert.equal(previewWave(8,0,restored.run.encounterVersion).length,5);
  assert.ok(saveGame({...run,encounterVersion:5},meta,memory));
});

test('v3 each higher tier keeps health and attack monotone and retains high-tier shields',()=>{
  for(let batch=1;batch<=18;batch++)for(let level=1;level<=10;level++){
    const before=previewWave(batch,level-1,3),after=previewWave(batch,level,3);
    for(let i=0;i<after.length;i++){
      assert.ok(after[i].hp>=before[i].hp);
      assert.ok(after[i].damage>=before[i].damage);
      assert.ok(after[i].shield>=before[i].shield);
      assert.ok(after[i].hp<=getEnemyPreview(after[i].id,batch,level,2).hp,'no individual target gets harder through rounding at higher tiers');
    }
  }
  assert.equal(getEnemyPreview('bug',8,10,3).shield,6);
});
