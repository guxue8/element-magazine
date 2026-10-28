import {BULLET_MAP} from './catalog.js';

export const MAX_EMBER_IMPRINTS=3;
const pureSummons=new Set(['H01','H03','H05','R01','R03','R05']);

// Imprints belong to this individual spell for the whole expedition, separate
// from the replaceable mark slot and the next-load-only temp flags.
export function validSpellImprints(value){
  if(value===undefined)return true;
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  return Object.entries(value).every(([key,n])=>key==='ember'?
    Number.isInteger(n)&&n>=0&&n<=MAX_EMBER_IMPRINTS:
    (key==='magnet'||key==='lurk')&&typeof n==='boolean');
}
export function canReceiveImprint(item,kind){
  const def=BULLET_MAP[item?.typeId];
  if(!def||def.trigger==='consumable')return false;
  if(kind==='ember')return ['shot','timer'].includes(def.trigger)&&!pureSummons.has(def.id)&&
    (item.imprints?.ember||0)<MAX_EMBER_IMPRINTS;
  return (kind==='magnet'||kind==='lurk')&&!item.imprints?.[kind];
}
export function imprintSpell(item,kind){
  if(!canReceiveImprint(item,kind))return false;
  item.imprints??={};
  if(kind==='ember')item.imprints.ember=(item.imprints.ember||0)+1;
  else item.imprints[kind]=true;
  return true;
}
export function imprintDamageBonus(item){
  return Math.min(MAX_EMBER_IMPRINTS,Math.max(0,item?.imprints?.ember||0))*20/100;
}
export function imprintDrawFlags(item){
  return {magnet:item?.imprints?.magnet===true,lurk:item?.imprints?.lurk===true};
}
export function spellImprintLabels(item){
  const labels=[],bonus=imprintDamageBonus(item),flags=imprintDrawFlags(item);
  if(bonus)labels.push(`永久火印 ${item.imprints.ember}/${MAX_EMBER_IMPRINTS} · 基础伤害 +${Math.round(bonus*100)}%`);
  if(flags.magnet)labels.push('永久磁引 · 后续抽取权重 ×2');
  if(flags.lurk)labels.push('永久潜伏 · 后续抽取权重 ×0.5，入阵首段基础伤害 +20%');
  return labels;
}
