import {ENEMIES,WAVES} from './catalog.js';

export const MAX_DIFFICULTY=10;
const levelOf=value=>Number.isFinite(value)?Math.max(0,Math.min(MAX_DIFFICULTY,Math.floor(value))):0;
export const DIFFICULTIES=Object.freeze(Array.from({length:MAX_DIFFICULTY+1},(_,level)=>{
  const hpMultiplier=Math.round((1+level*.12)*100)/100;
  const damageBonus=Math.floor((level+1)/3);
  const startingShield=level>=10?6:level>=7?4:level>=4?2:0;
  return Object.freeze({id:level,level,name:level===0?'初征':`升阶 ${level}`,hpMultiplier,damageBonus,startingShield,
    description:level===0?'较低敌人生命，熟悉弹夹与构筑。':
      `敌人生命 +${Math.round((hpMultiplier-1)*100)}%${damageBonus?`；攻击 +${damageBonus}`:''}${startingShield?`；入场护盾 ${startingShield}`:''}。`});
}));
export function getDifficulty(level=0){return DIFFICULTIES[levelOf(level)];}
export function getUnlockedDifficulty(meta={}){return Math.max(meta.wins>0?1:0,levelOf(meta.unlockedDifficulty));}
export function selectDifficulty(meta,requested=0){return Math.min(levelOf(requested),getUnlockedDifficulty(meta));}
export function getWaveIds(batch,encounterVersion=4){
  const base=WAVES[batch-1]||[];
  if(encounterVersion===4){
    const prior=getWaveIds(batch,3);
    if(batch===1||!base.length||base.some(id=>id.startsWith('boss')))return prior;
    return [...prior,...Array(Math.ceil(prior.length*.5)).fill('bug')];
  }
  if(encounterVersion===3){
    if(batch===1||!base.length||base.some(id=>id.startsWith('boss')))return [...base];
    const prior=getWaveIds(batch,2);
    return [...prior,...Array(Math.max(1,Math.round(prior.length*.4))).fill('bug')];
  }
  if(encounterVersion===1||batch<3||!base.length||base.some(id=>id.startsWith('boss')))return [...base];
  // The first two waves teach targeting; later normal waves add fragile swarms.
  return [...base,...Array(batch<7?1:2).fill('bug')];
}
function swarmHealth(typeId,batch){
  const prior=getWaveIds(batch,2),wave=getWaveIds(batch,3);
  const bugHp=batch<=6?5:batch<=12?8:11;
  if(typeId==='bug')return bugHp;
  const oldHp=id=>getEnemyPreview(id,batch,0,2).hp;
  // Aim at 90% of the v2 ordinary wave budget, including the extra bugs.
  // Never make an individual target tougher just to fill the health budget.
  if(!prior.length||prior.some(id=>id.startsWith('boss')))return oldHp(typeId)*.9;
  const budget=prior.reduce((total,id)=>total+oldHp(id),0)*.9;
  const bugBudget=wave.filter(id=>id==='bug').length*bugHp;
  const otherBudget=prior.filter(id=>id!=='bug').reduce((total,id)=>total+oldHp(id),0);
  return oldHp(typeId)*(otherBudget>0?Math.max(0,Math.min(1,(budget-bugBudget)/otherBudget)):.9);
}
function magicSwarmHealth(typeId,batch){
  const prior=getWaveIds(batch,3),wave=getWaveIds(batch,4);
  const oldHp=id=>getEnemyPreview(id,batch,0,3).hp;
  const bugHp=batch<=6?3:batch<=12?5:7;
  if(typeId==='bug')return bugHp;
  if(!prior.length||prior.some(id=>id.startsWith('boss')))return oldHp(typeId)*.9;
  const budget=prior.reduce((total,id)=>total+oldHp(id),0)*.95;
  const bugBudget=wave.filter(id=>id==='bug').length*bugHp;
  const otherBudget=prior.filter(id=>id!=='bug').reduce((total,id)=>total+oldHp(id),0);
  return oldHp(typeId)*(otherBudget>0?Math.max(0,Math.min(1,(budget-bugBudget)/otherBudget)):.95);
}
export function getEnemyPreview(typeId,batch,level=0,encounterVersion=4){
  const def=ENEMIES[typeId];if(!def)return null;
  const boss=typeId.startsWith('boss'),scale=batch<=6?1:batch<=12?1.6:2.4;
  const legacy=encounterVersion===1,difficulty=getDifficulty(level);
  if(encounterVersion===4){
    const prior=getEnemyPreview(typeId,batch,level,3);
    const hp=Math.min(prior.hp,Math.max(1,Math.ceil(magicSwarmHealth(typeId,batch)*difficulty.hpMultiplier)));
    // Keep contact pressure close to v3 despite more bodies; preserve recruitment income.
    const relief=typeId==='bug'||boss||batch<=2?2:1;
    const difficultyDamage=def.damage>0?Math.max(1-def.damage,difficulty.damageBonus-relief):0;
    return {...def,hp,damage:def.damage+(def.damage>0?difficultyDamage:0),difficultyDamage,
      shield:typeId==='bug'?difficulty.startingShield/2:difficulty.startingShield,draftReward:typeId==='bug'?5:10};
  }
  const swarm=encounterVersion===3;
  const health=swarm?Math.max(1,Math.ceil((boss?def.hp*.81:swarmHealth(typeId,batch))*difficulty.hpMultiplier)):
    legacy?(boss?def.hp:Math.ceil(def.hp*scale)):
    Math.max(1,Math.ceil(def.hp*(boss ? .9 : scale*.62)*difficulty.hpMultiplier));
  const hp=swarm?Math.min(health,getEnemyPreview(typeId,batch,level,2).hp):health;
  // This signed modifier is saved on enemies and used by combat and intents.
  const relief=typeId==='bug'?2:boss||batch<=2?1:0;
  const difficultyDamage=legacy?0:swarm&&def.damage>0?difficulty.damageBonus-relief:difficulty.damageBonus;
  return {...def,hp,damage:def.damage+(def.damage>0?difficultyDamage:0),difficultyDamage,shield:legacy?0:difficulty.startingShield};
}
