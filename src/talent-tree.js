import {TALENTS} from './catalog.js';
import {RESOURCE_COSTS} from './resources.js';

export const TALENT_BRANCHES=Object.freeze([
  {id:'guard',name:'守线',subtitle:'保住生命，把险境转成补给',icon:'shield'},
  {id:'supply',name:'补给',subtitle:'重选候选，减少无用招募',icon:'shop'},
  {id:'craft',name:'编排',subtitle:'调整弹夹，带入元素卷轴',icon:'swap'}
]);
const nodes={
  body:{branch:'guard',requires:[],icon:'heart'},
  repair:{branch:'guard',requires:['body'],icon:'home'},
  medicine:{branch:'guard',requires:['body'],icon:'spring'},
  emergency:{branch:'guard',requires:['repair'],icon:'shield'},
  rescueScroll:{branch:'guard',requires:['emergency'],icon:'water'},
  supply:{branch:'supply',requires:[],icon:'coin'},
  refresh:{branch:'supply',requires:['supply'],icon:'refresh'},
  focus:{branch:'supply',requires:['supply'],icon:'target'},
  freeRefresh:{branch:'supply',requires:['refresh'],icon:'refresh'},
  skipRefresh:{branch:'supply',requires:['freeRefresh'],icon:'undo'},
  swap:{branch:'craft',requires:[],icon:'swap'},
  remove:{branch:'craft',requires:['swap'],icon:'remove'},
  reroll:{branch:'craft',requires:['swap'],icon:'load'},
  freeSwap:{branch:'craft',requires:['swap'],icon:'swap'},
  scrollCache:{branch:'craft',requires:['remove'],icon:'scroll'}
};
for(const node of Object.values(nodes)){Object.freeze(node.requires);Object.freeze(node);}
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
export function createTalentState(){return {freeSwapRound:0,freeRefreshUsed:false,skipRefunds:0,rescueGranted:false,scrollBatches:[]};}
export function ensureTalentState(run){return run.talentState??=createTalentState();}
export function isFreeSwapAvailable(run){return Boolean(run?.traits?.freeSwap&&run.talentState?.freeSwapRound!==run.round);}
export function isFreeRefreshAvailable(run){return Boolean(run?.traits?.freeRefresh&&!run.talentState?.freeRefreshUsed);}
export function getSwapCost(run){return isFreeSwapAvailable(run)?0:RESOURCE_COSTS.swap;}
export function getRefreshCost(run){return isFreeRefreshAvailable(run)?0:10;}
