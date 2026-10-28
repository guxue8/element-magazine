import {TALENTS} from './catalog.js';
import {RESOURCE_COSTS} from './resources.js';

export const TALENT_BRANCHES=Object.freeze([
  {id:'guard',name:'守线',subtitle:'保住生命，把险境转成补给',icon:'shield'},
  {id:'supply',name:'补给',subtitle:'重选候选，减少无用招募',icon:'shop'},
  {id:'craft',name:'编排',subtitle:'调整弹夹，带入元素卷轴',icon:'swap'}
]);
const nodes={
  body:{branch:'guard',requires:[],icon:'heart',position:[1,1]},
  repair:{branch:'guard',requires:['body'],icon:'home',position:[2,1]},
  medicine:{branch:'guard',requires:['body'],icon:'spring',position:[2,2]},
  emergency:{branch:'guard',requires:['repair'],icon:'shield',position:[3,1]},
  rescueScroll:{branch:'guard',requires:['emergency'],icon:'water',position:[4,1]},
  fieldCare:{branch:'guard',requires:['medicine'],icon:'heart',position:[3,2]},
  safeCamp:{branch:'guard',requires:['fieldCare'],icon:'shield',position:[4,2]},
  wardReserve:{branch:'guard',requires:['rescueScroll'],icon:'shield',position:[5,1]},
  renewal:{branch:'guard',requires:['safeCamp'],icon:'spring',position:[5,2]},
  lastLight:{branch:'guard',requires:['wardReserve','renewal'],icon:'fire',position:[6,1]},
  supply:{branch:'supply',requires:[],icon:'coin',position:[1,1]},
  refresh:{branch:'supply',requires:['supply'],icon:'refresh',position:[2,1]},
  focus:{branch:'supply',requires:['supply'],icon:'target',position:[2,2]},
  freeRefresh:{branch:'supply',requires:['refresh'],icon:'refresh',position:[3,1]},
  skipRefresh:{branch:'supply',requires:['freeRefresh'],icon:'undo',position:[4,1]},
  scout:{branch:'supply',requires:['focus'],icon:'book',position:[3,2]},
  scholar:{branch:'supply',requires:['scout'],icon:'book',position:[4,2]},
  freshInk:{branch:'supply',requires:['skipRefresh'],icon:'load',position:[5,1]},
  scrollMerchant:{branch:'supply',requires:['scholar'],icon:'scroll',position:[5,2]},
  deepStudy:{branch:'supply',requires:['freshInk','scrollMerchant'],icon:'shop',position:[6,1]},
  swap:{branch:'craft',requires:[],icon:'swap',position:[1,1]},
  remove:{branch:'craft',requires:['swap'],icon:'remove',position:[2,1]},
  reroll:{branch:'craft',requires:['swap'],icon:'load',position:[2,2]},
  freeSwap:{branch:'craft',requires:['swap'],icon:'swap',position:[3,2]},
  scrollCache:{branch:'craft',requires:['remove'],icon:'scroll',position:[3,1]},
  preparedSigil:{branch:'craft',requires:['scrollCache'],icon:'earth',position:[4,1]},
  patientStudy:{branch:'craft',requires:['freeSwap'],icon:'timer',position:[4,2]},
  recycleCharge:{branch:'craft',requires:['preparedSigil'],icon:'refresh',position:[5,1]},
  succession:{branch:'craft',requires:['patientStudy'],icon:'fire',position:[5,2]},
  quietSlot:{branch:'craft',requires:['recycleCharge','succession'],icon:'undo',position:[6,1]}
};
for(const node of Object.values(nodes)){Object.freeze(node.requires);Object.freeze(node.position);Object.freeze(node);}
export function getTalentNode(id){return Object.hasOwn(nodes,id)?nodes[id]:null;}
export function getTalentPurchaseState(meta,id){
  const def=TALENTS.find(t=>t.id===id),node=getTalentNode(id);
  if(!def||!node)return {canBuy:false,level:0,cost:null,maxed:false,missing:[],reason:'未知天赋'};
  const level=meta?.talents?.[id]||0,cost=def.costs[level]??null;
  const missing=node.requires.filter(parent=>(meta?.talents?.[parent]||0)<1);
  const maxed=level>=def.costs.length;
  const reason=maxed?'已满级':missing.length?`需要先解锁：${missing.map(id=>TALENTS.find(t=>t.id===id).name).join('、')}`:(meta?.points||0)<cost?'天赋点不足':null;
  return {canBuy:!reason,level,cost,maxed,missing,reason};
}
export function canBuyTalent(meta,id){return getTalentPurchaseState(meta,id).canBuy;}
export function createTalentState(){return {freeSwapRound:0,freeRefreshUsed:false,skipRefunds:0,rescueGranted:false,scrollBatches:[],renewalUses:0,lastLightUsed:false,scoutUsed:false,scholarUsed:false,scrollMerchantUses:0,recycleUses:0};}
export function ensureTalentState(run){
  // Missing keys come from older saves. Existing usage counters must survive.
  const state=run.talentState??={};
  for(const [key,value] of Object.entries(createTalentState()))if(state[key]===undefined)state[key]=value;
  return state;
}
export function getEliteDraftBatch(run){return run?.traits?.deepStudy?10:13;}
export function isFreeSwapAvailable(run){return Boolean(run?.traits?.freeSwap&&run.talentState?.freeSwapRound!==run.round);}
export function isFreeRefreshAvailable(run){return Boolean(run?.traits?.freeRefresh&&!run.talentState?.freeRefreshUsed);}
export function getSwapCost(run){return isFreeSwapAvailable(run)?0:RESOURCE_COSTS.swap;}
export function getRefreshCost(run){return isFreeRefreshAvailable(run)?0:10;}
