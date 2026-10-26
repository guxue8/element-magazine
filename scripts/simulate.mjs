import {pathToFileURL} from 'node:url';
import {newRun,act,createMeta,getCounts,applyRunReward} from '../src/campaign.js';
import {BULLET_MAP,BOND_MAP,ENCHANTMENT_MAP} from '../src/catalog.js';
import {loadGame,saveGame} from '../src/storage.js';

// A deliberately modest player: prefer usable damage, affordable synergy, and
// a compact deck. It never sees future offers, RNG, or combat outcomes.
export function bulletScore(id,run){
  const b=BULLET_MAP[id];
  let score=10+b.rarity*2;
  const values={F01:12,F02:8,F08:14,F09:11,F15:12,F16:12,F06:24,F13:30,F14:30,
    H01:7,H03:10,H05:10,H06:27,H07:30,H08:12,H09:9,H15:12,H16:12,H19:3,
    L01:12,L02:13,L03:14,L04:13,L06:34,L08:15,L11:24,L12:4,L13:29,L14:5,L21:35,
    W01:13,W02:11,W03:14,W04:11,W05:15,W06:31,W08:12,W09:9,W15:11,W20:12,
    R01:4,R02:10,R03:14,R04:10,R05:17,R06:27,R07:29,R08:12,R09:12,R10:12,R12:3,R18:2,R19:12,R21:29};
  score=values[id]??score;
  if(b.trigger==='passive')score-=run.inventory.length<10?7:3;
  if(b.trigger==='consumable')return id==='C08'?20:id==='C04'?15:id==='C03'?10:5;
  const counts=getCounts(run);
  score+=Math.min(4,counts[b.element]*0.6);
  for(const bondId of run.bonds){
    const need=BOND_MAP[bondId].requirements[b.element]||0;
    if(need>counts[b.element])score+=2;
  }
  return score;
}

function bondScore(id,run){
  const b=BOND_MAP[id],counts=getCounts(run);
  const gap=Object.entries(b.requirements).reduce((n,[e,k])=>n+Math.max(0,k-counts[e]),0);
  const missingTarget=b.targetId&&!run.inventory.some(x=>x.typeId===b.targetId)?3:0;
  const whiteGap=Math.max(0,(b.whiteRequired||0)-run.inventory.filter(x=>BULLET_MAP[x.typeId].rarity===0).length);
  return 20-5*(gap+missingTarget+whiteGap)+(b.grade==='evolution'?4:0)+(id==='S13'?3:0);
}
const bestIndex=(items,score)=>items.map((x,i)=>({i,score:score(x)})).sort((a,b)=>b.score-a.score||a.i-b.i)[0].i;

export function chooseAction(run){
  if(run.phase==='supply'){
    const offer=run.offers;
    if(offer){
      if(['bullet','scroll'].includes(offer.kind))return {type:'choose',index:bestIndex(offer.cards,id=>bulletScore(id,run))};
      if(offer.kind==='bond')return {type:'choose',index:bestIndex(offer.cards,id=>bondScore(id,run))};
      if(offer.kind==='enchant'){
        const index=bestIndex(offer.cards,id=>BULLET_MAP[id]?bulletScore(id,run):({G01:20,M03:18,M04:17,M05:15,G03:10,M01:8}[id]||4));
        const id=offer.cards[index],def=ENCHANTMENT_MAP[id];
        if(!def)return {type:'choose',index};
        if(def.kind==='slot')return {type:'choose',index,target:0};
        const targets=run.inventory.filter(x=>BULLET_MAP[x.typeId].trigger==='shot');
        return {type:'choose',index,target:targets[bestIndex(targets,x=>bulletScore(x.typeId,run))].uid};
      }
      const index=bestIndex(offer.cards,c=>c.id==='heal25'?run.maxHp-run.hp:c.id==='max10'?12:c.id==='scroll-box'?15:c.id==='remove30'?8:3);
      return {type:'choose',index};
    }
    const cost=run.inventory.filter(x=>BULLET_MAP[x.typeId].trigger!=='consumable').length<10?100:run.batch>=13?300:200;
    if(run.resources.draft>=cost)return {type:'draft',cost};
    return {type:'load'};
  }
  if(run.phase==='prepare'){
    if(run.inventory.length>14&&run.resources.remove>=30){
      const loaded=run.magazine.map((uid,slot)=>({item:run.inventory.find(x=>x.uid===uid),slot})).filter(x=>x.item&&BULLET_MAP[x.item.typeId].trigger!=='consumable');
      loaded.sort((a,b)=>bulletScore(a.item.typeId,run)-bulletScore(b.item.typeId,run));
      if(loaded.length&&bulletScore(loaded[0].item.typeId,run)<14)return {type:'remove',slot:loaded[0].slot};
    }
    return {type:'execute'};
  }
  if(run.phase==='locked')return {type:'execute'};
  return null;
}

export function memoryStorage(){
  const values=new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};
}

export function simulateCampaign(seed,{restoreEveryAction=true,maxActions=1200,startRun,onStep}={}){
  let run=startRun?structuredClone(startRun):newRun(seed),meta=createMeta();
  const storage=memoryStorage(),trace=[];
  let actions=0,saveChecks=0;
  while(run.phase!=='ended'&&actions<maxActions){
    const action=chooseAction(run);
    if(!action)throw new Error(`No action in ${run.phase}`);
    const before=run,result=act(run,action);
    if(result.error)throw new Error(`Seed ${seed}, batch ${run.batch}, ${JSON.stringify(action)}: ${result.error}`);
    run=result.run;actions++;
    const error=saveGame(run,meta,storage);
    if(error)throw new Error(`Seed ${seed}, batch ${run.batch}, after ${action.type}: ${error}`);
    saveChecks++;
    if(restoreEveryAction){
      const loaded=loadGame(storage);
      if(loaded.warning||!loaded.run)throw new Error(`Reload failed: ${loaded.warning}`);
      run=loaded.run;
    }
    if(action.type==='execute')trace.push({round:before.round,batch:before.batch,hp:run.hp,enemies:run.enemies.length,deck:run.inventory.length,damage:run.stats.damage-before.stats.damage,cleanup:before.isCleanup});
    onStep?.({before,action,run,result});
  }
  if(run.phase!=='ended')throw new Error(`Seed ${seed} did not end within ${maxActions} actions`);
  meta=applyRunReward(meta,run);
  return {run,meta,actions,saveChecks,trace};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const count=Number(process.argv[2]||20),rows=[];
  for(let seed=1;seed<=count;seed++){
    const result=simulateCampaign(seed);
    rows.push({seed,outcome:result.run.outcome,batch:result.run.batch,turns:result.run.stats.turns,hp:result.run.hp,kills:result.run.stats.kills,bosses:result.run.stats.bossKills,points:result.meta.points,actions:result.actions,saves:result.saveChecks,cleanupTurns:result.trace.filter(x=>x.cleanup).length});
  }
  console.log(JSON.stringify({strategy:'No talents; damage and currently reachable bonds; no future-state inspection; every action saved/reloaded',runs:rows.length,wins:rows.filter(x=>x.outcome==='victory').length,rows},null,2));
}
