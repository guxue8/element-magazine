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
export function getWaveIds(batch,encounterVersion=2){
  const base=WAVES[batch-1]||[];
  if(encounterVersion===1||batch<3||!base.length||base.some(id=>id.startsWith('boss')))return [...base];
  // The first two waves teach targeting; later normal waves add fragile swarms.
  return [...base,...Array(batch<7?1:2).fill('bug')];
}
export function getEnemyPreview(typeId,batch,level=0,encounterVersion=2){
  const def=ENEMIES[typeId];if(!def)return null;
  const boss=typeId.startsWith('boss'),scale=batch<=6?1:batch<=12?1.6:2.4;
  const legacy=encounterVersion===1,difficulty=getDifficulty(level);
  const hp=legacy?(boss?def.hp:Math.ceil(def.hp*scale)):
    Math.max(1,Math.ceil(def.hp*(boss ? .9 : scale*.62)*difficulty.hpMultiplier));
  const difficultyDamage=legacy?0:difficulty.damageBonus;
  return {...def,hp,damage:def.damage+(def.damage>0?difficultyDamage:0),difficultyDamage,shield:legacy?0:difficulty.startingShield};
}
