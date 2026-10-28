import {BULLET_MAP,BOND_MAP,ENEMIES,TALENTS,ENCHANTMENT_MAP,EVENTS,WAVES} from './catalog.js';
import {createMeta} from './campaign.js';
import {RESOURCE_CAPS,normalizeResources} from './resources.js';
import {MAX_DIFFICULTY,getUnlockedDifficulty} from './difficulty.js';
import {validElementBan,bulletAllowed,bondAllowed,enchantmentAllowed} from './element-pool.js';
import {validSpellImprints} from './spell-imprints.js';

export const GAME_STORAGE_KEY='element-magazine.save.v1';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const integer=n=>Number.isInteger(n)&&n>=0;
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const strings=x=>Array.isArray(x)&&x.every(v=>typeof v==='string');
const eventIds=new Set(EVENTS.map(x=>x.id));
const eventChoices=new Set(['refresh10','remove30','swap20','scroll-box','heal25','max10']);
const overChargeCap=run=>run&&Object.entries(RESOURCE_CAPS).some(([kind,cap])=>run.resources[kind]>cap);
function preserveChargeBackup(storage,saved,raw=JSON.stringify(saved)){
  const key=`${GAME_STORAGE_KEY}.backup.charge-cap.${saved.run.id}`;
  if(storage.getItem(key)===null)storage.setItem(key,raw);
}
function validOffer(offer,run){
  if(!record(offer)||typeof offer.source!=='string'||!Array.isArray(offer.cards)||!offer.cards.length)return false;
  return offer.cards.every(c=>{
    if(offer.kind==='event')return record(c)&&eventChoices.has(c.id)&&typeof c.name==='string'&&typeof c.description==='string';
    if(typeof c!=='string')return false;
    if(offer.kind==='bond')return bondAllowed(run,BOND_MAP[c]);
    if(offer.kind==='bullet')return bulletAllowed(run,BULLET_MAP[c])&&BULLET_MAP[c].trigger!=='consumable';
    if(offer.kind==='scroll')return bulletAllowed(run,BULLET_MAP[c])&&BULLET_MAP[c].trigger==='consumable';
    if(offer.kind==='enchant')return enchantmentAllowed(run,ENCHANTMENT_MAP[c])||bulletAllowed(run,BULLET_MAP[c])&&BULLET_MAP[c].trigger==='consumable';
    return false;
  });
}
function numericTreeValid(value){
  if(typeof value==='number')return Number.isFinite(value);
  if(Array.isArray(value))return value.every(numericTreeValid);
  if(value&&typeof value==='object')return Object.values(value).every(numericTreeValid);
  return true;
}
function validMeta(meta){
  if(!meta||meta.version!==1||!integer(meta.points)||!integer(meta.earned)||!integer(meta.wins)||!integer(meta.bestBatch)||!meta.talents||!Array.isArray(meta.settledRuns))return false;
  if(meta.unlockedDifficulty!==undefined&&(!integer(meta.unlockedDifficulty)||meta.unlockedDifficulty>MAX_DIFFICULTY))return false;
  if(!meta.settledRuns.every(x=>typeof x==='string'))return false;
  return Object.entries(meta.talents).every(([id,level])=>{const talent=TALENTS.find(x=>x.id===id);return talent&&integer(level)&&level<=talent.costs.length;});
}
function validRun(run){
  if(run===null)return true;
  if(!run||run.version!==1||!['supply','prepare','locked','ended'].includes(run.phase)||typeof run.id!=='string'||!numericTreeValid(run))return false;
  if(run.difficulty!==undefined&&(!integer(run.difficulty)||run.difficulty>MAX_DIFFICULTY))return false;
  if(run.encounterVersion!==undefined&&![1,2,3,4].includes(run.encounterVersion))return false;
  if(run.bannedElement!==undefined&&!validElementBan(run.bannedElement))return false;
  if(!integer(run.rng)||!integer(run.nextUid)||!Number.isInteger(run.batch)||run.batch<1||run.batch>18||!Number.isInteger(run.round)||run.round<1)return false;
  if(!finite(run.hp)||!finite(run.maxHp)||run.maxHp<=0||!finite(run.shield))return false;
  if(!run.resources||!['draft','refresh','remove','swap'].every(k=>integer(run.resources[k])))return false;
  if(!Array.isArray(run.inventory)||run.inventory.length<3||run.inventory.length>10000)return false;
  if(!run.inventory.every(x=>x&&typeof x.uid==='string'&&bulletAllowed(run,BULLET_MAP[x.typeId])&&integer(x.counter)&&(!x.mark||ENCHANTMENT_MAP[x.mark]?.kind==='mark'&&enchantmentAllowed(run,ENCHANTMENT_MAP[x.mark]))&&x.temp&&typeof x.temp==='object'&&validSpellImprints(x.imprints)))return false;
  const ids=new Set(run.inventory.map(x=>x.uid));if(ids.size!==run.inventory.length)return false;
  if(!Array.isArray(run.magazine)||run.magazine.length!==12||!run.magazine.every(uid=>uid===null||typeof uid==='string'&&(run.phase==='ended'||ids.has(uid))))return false;
  const loaded=run.magazine.filter(Boolean);if(new Set(loaded).size!==loaded.length)return false;
  if(!Array.isArray(run.bonds)||!run.bonds.every(x=>bondAllowed(run,BOND_MAP[x]))||new Set(run.bonds).size!==run.bonds.length)return false;
  if(!Array.isArray(run.enemies)||!run.enemies.every(x=>x&&ENEMIES[x.typeId]&&finite(x.hp)&&finite(x.maxHp)&&integer(x.position)&&x.position<=6&&integer(x.lane)&&x.lane<3&&(x.draftReward===undefined||integer(x.draftReward)&&x.draftReward<=10)))return false;
  if(!Array.isArray(run.summons)||!run.summons.every(x=>x&&['spring','cannon','guard'].includes(x.kind)&&integer(x.life)))return false;
  if(!Array.isArray(run.slots)||run.slots.length!==12||!run.slots.every(x=>x&&(!x.engraving||ENCHANTMENT_MAP[x.engraving]?.kind==='slot'&&enchantmentAllowed(run,ENCHANTMENT_MAP[x.engraving]))))return false;
  if(!Array.isArray(run.pending)||!run.pending.every(x=>record(x)&&typeof x.source==='string'&&(['bond','scroll'].includes(x.kind)||x.kind==='event'&&eventIds.has(x.eventId))))return false;
  if(!strings(run.handled)||!strings(run.defeatedBosses)||!strings(run.logs)||!strings(run.eventOrder)||!run.eventOrder.every(id=>eventIds.has(id)))return false;
  if(!Array.isArray(run.waveLanes)||run.waveLanes.length!==18||!run.waveLanes.every((lanes,i)=>Array.isArray(lanes)&&lanes.length===WAVES[i].length&&lanes.every(n=>integer(n)&&n<3)))return false;
  if(!record(run.stats)||!['kills','bossKills','damage','turns'].every(k=>integer(run.stats[k]))||!record(run.traits)||!record(run.evolutions))return false;
  if(run.talentState!==undefined){
    const t=run.talentState;
    if(!record(t)||!integer(t.freeSwapRound)||t.freeSwapRound>run.round||typeof t.freeRefreshUsed!=='boolean'||!integer(t.skipRefunds)||t.skipRefunds>2||typeof t.rescueGranted!=='boolean'||!Array.isArray(t.scrollBatches)||!t.scrollBatches.every(n=>[6,12,18].includes(n))||new Set(t.scrollBatches).size!==t.scrollBatches.length)return false;
  }
  if(!Object.entries(run.evolutions).every(([id,value])=>BOND_MAP[id]?.grade==='evolution'&&bondAllowed(run,BOND_MAP[id])&&record(value)&&integer(value.progress)))return false;
  if(!integer(run.completedBatches)||run.completedBatches>18||!integer(run.draftCount)||!integer(run.reward))return false;
  if(run.rest&&(!ids.has(run.rest.uid)||!Number.isInteger(run.rest.slot)||run.rest.slot<0||run.rest.slot>=12||run.magazine[run.rest.slot]!==null))return false;
  if(run.offers&&!validOffer(run.offers,run))return false;
  return true;
}
export function loadGame(storage){
  let raw;
  try{
    storage=storage??globalThis.localStorage;
    raw=storage.getItem(GAME_STORAGE_KEY);
    if(!raw)return {run:null,meta:createMeta(),warning:null};
    const saved=JSON.parse(raw);
    const meta=validMeta(saved.meta)?{...saved.meta,unlockedDifficulty:getUnlockedDifficulty(saved.meta)}:createMeta();
    if(saved.version===1&&validMeta(saved.meta)&&validRun(saved.run)){
      let warning=null;
      if(saved.run){saved.run.difficulty??=0;saved.run.encounterVersion??=1;saved.run.bannedElement??=null;}
      if(overChargeCap(saved.run)){
        let backedUp=true;
        try{preserveChargeBackup(storage,saved,raw);}catch{backedUp=false;}
        saved.run.resources=normalizeResources(saved.run.resources);
        warning='删除和换位已更新为最多储存 3 次。'+(backedUp?'旧存档已备份，其他进度保留。':'旧存档备份写入失败，请检查浏览器存储空间。');
      }
      return {run:saved.run,meta,warning};
    }
    try{storage.setItem(`${GAME_STORAGE_KEY}.backup.${Date.now()}`,raw);}catch{}
    return {run:null,meta,warning:'本局存档格式异常，已保留可恢复的天赋数据和原始备份。可以开始新远征。'};
  }catch{
    if(raw){try{storage.setItem(`${GAME_STORAGE_KEY}.backup.${Date.now()}`,raw);}catch{}}
    return {run:null,meta:createMeta(),warning:'无法读取本地存档。本次可以游玩，但请检查浏览器是否允许本地存储。'};
  }
}
export function saveGame(run,meta,storage){
  if(!validRun(run)||!validMeta(meta))return '存档状态校验失败，未覆盖已有存档。';
  try{
    storage=storage??globalThis.localStorage;
    if(overChargeCap(run))preserveChargeBackup(storage,{version:1,run,meta});
    const savedRun=run?{...run,resources:normalizeResources(run.resources)}:null;
    storage.setItem(GAME_STORAGE_KEY,JSON.stringify({version:1,run:savedRun,meta}));
    return null;
  }catch{return '自动存档失败，可能是存储空间不足或隐私设置限制。请保持本页开启。';}
}
