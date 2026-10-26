import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,createMeta,applyRunReward,previewWave,act,getIntent} from '../src/campaign.js';
import {loadGame,saveGame,GAME_STORAGE_KEY} from '../src/storage.js';
import {ENEMIES,WAVES} from '../src/catalog.js';

const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const ended=(level,outcome='victory',id=`clear-${level}`)=>{
  const run=newRun(91,{...createMeta(),unlockedDifficulty:10},level);
  return {...run,id,phase:'ended',outcome,completedBatches:18,stats:{...run.stats,bossKills:3}};
};

test('new players start at difficulty zero and cannot enter a locked tier',()=>{
  const meta=createMeta();
  assert.equal(meta.unlockedDifficulty,0);
  assert.equal(newRun(1,meta,10).difficulty,0);
  assert.equal(newRun(1,meta).encounterVersion,2);
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
