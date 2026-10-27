import {BULLETS,BULLET_MAP,BONDS,BOND_MAP,ENCHANTMENTS,ENCHANTMENT_MAP,ENEMIES,WAVES,TALENTS,EVENTS} from './catalog.js';
import {random,shuffle,sample} from './random.js';
import {resolveRound} from './combat.js';
import {RESOURCE_COSTS,normalizeResources,addResource} from './resources.js';
import {canBuyTalent,createTalentState,ensureTalentState,getSwapCost,getRefreshCost} from './talent-tree.js';
import {getUnlockedDifficulty,selectDifficulty,getWaveIds,getEnemyPreview} from './difficulty.js';
import {ELEMENT_KEYS,validElementBan,allowedElements,bulletAllowed,bondAllowed,enchantmentAllowed} from './element-pool.js';
export {rollElementBan} from './element-pool.js';

const BOND_ROUNDS=[2,4,6,9,12,15,17];
const EVENT_ROUNDS=[4,10,16];
const ODDS={100:[65,28,6,1,0],200:[20,43,29,7,1],300:[0,15,45,32,8]};
const clone=value=>structuredClone(value);
const card=instance=>BULLET_MAP[instance.typeId];
const permanent=instance=>card(instance)?.trigger!=='consumable';
const requireRule=(condition,message)=>{if(!condition)throw new Error(message);};
const pick=(run,items)=>items.length?items[Math.floor(random(run)*items.length)]:undefined;

export function getCounts(run){
  const counts=Object.fromEntries(ELEMENT_KEYS.map(e=>[e,0]));
  for(const item of run.inventory) if(card(item))counts[card(item).element]++;
  return counts;
}
function bondGap(run,bond,{includeTarget=true}={}){
  const counts=getCounts(run);
  let gap=Object.entries(bond.requirements||{}).reduce((n,[e,value])=>n+Math.max(0,value-(counts[e]||0)),0);
  if(bond.whiteRequired)gap+=Math.max(0,bond.whiteRequired-run.inventory.filter(x=>card(x).rarity===0).length);
  if(includeTarget&&bond.targetId&&!run.inventory.some(x=>x.typeId===bond.targetId))gap++;
  return gap;
}
export function getActiveBonds(run){return run.bonds.filter(id=>bondAllowed(run,BOND_MAP[id])&&bondGap(run,BOND_MAP[id])===0);}
export function previewWave(batch,difficulty=0,encounterVersion=3){return getWaveIds(batch,encounterVersion).map(id=>getEnemyPreview(id,batch,difficulty,encounterVersion));}
export function getIntent(enemy,run){
  const def=ENEMIES[enemy.typeId];
  if(!def)return '未知敌人';
  if(enemy.position<=def.range){
    if(enemy.typeId==='healer')return '治疗同伴';
    if(enemy.typeId==='boss2'&&(enemy.attackCount+1)%2===0)return '鼓舞同伴 / 攻击';
    let damage=def.damage+(enemy.boost||0)+(enemy.difficultyDamage||0);
    if(enemy.typeId==='boss3'&&enemy.hp<=enemy.maxHp/2)damage=14+(enemy.boost||0)+(enemy.difficultyDamage||0);
    return `攻击 ${damage}`;
  }
  const move=enemy.slow?Math.max(enemy.typeId.startsWith('boss')?1:0,def.move-1):def.move;
  return `前进 ${move} 格`;
}

export function createMeta(){return {version:1,points:0,earned:0,talents:{},settledRuns:[],wins:0,bestBatch:0,unlockedDifficulty:0};}
export function buyTalent(meta,id){
  const def=TALENTS.find(x=>x.id===id),level=meta.talents[id]||0;
  const price=def?.costs[level];
  if(!canBuyTalent(meta,id))return meta;
  const out=clone(meta);out.points-=price;out.talents[id]=level+1;return out;
}
export function resetTalents(meta){
  const out=clone(meta);
  for(const t of TALENTS){const level=out.talents[t.id]||0;out.points+=t.costs.slice(0,level).reduce((a,b)=>a+b,0);}
  out.talents={};return out;
}
export function applyRunReward(meta,run){
  if(!run||run.phase!=='ended'||meta.settledRuns.includes(run.id))return meta;
  const out=clone(meta);
  const first=run.outcome==='victory'&&out.wins===0;
  const points=Math.floor(Math.min(run.completedBatches,18)/3)+run.stats.bossKills+(first?2:0);
  out.points+=points;out.earned+=points;
  out.bestBatch=Math.max(out.bestBatch,run.completedBatches);
  if(run.outcome==='victory'){
    const unlocked=getUnlockedDifficulty(meta);
    out.wins++;
    out.unlockedDifficulty=(run.difficulty||0)===unlocked?Math.min(10,unlocked+1):unlocked;
  }else out.unlockedDifficulty=getUnlockedDifficulty(meta);
  out.settledRuns.push(run.id);
  // Keep all settlement ids: evicting them would let an old save claim twice.
  return out;
}

function addBullet(run,id){
  const def=BULLET_MAP[id];
  requireRule(Boolean(def),'未知子弹');
  requireRule(bulletAllowed(run,def),'本局已禁用该元素');
  const instance={uid:`b${run.nextUid++}`,typeId:id,counter:def.counter||0,mark:null,temp:{}};
  run.inventory.push(instance);return instance;
}
function starter(run){
  const white=BULLETS.filter(x=>bulletAllowed(run,x)&&x.rarity===0&&x.trigger!=='consumable');
  // Full-group rejection preserves equal probability of legal combinations.
  for(;;){
    const group=sample(run,white,4);
    if(group.filter(x=>x.trigger==='shot').length<3)continue;
    const counts={};for(const c of group)counts[c.element]=(counts[c.element]||0)+1;
    if(Math.max(...Object.values(counts))>2)continue;
    run.inventory=[];group.forEach(x=>addBullet(run,x.id));return;
  }
}
function spawnBatch(run){
  for(const preview of previewWave(run.batch,run.difficulty||0,run.encounterVersion||1)){
    const typeId=preview.id,boss=typeId.startsWith('boss');
    const hp=preview.hp;
    const position=typeId==='boss3'?4:boss?5:6;
    run.enemies.push({uid:`e${run.nextUid++}`,typeId,hp,maxHp:hp,heal:typeId==='healer'?(run.batch<=6?6:run.batch<=12?9:12):0,shield:preview.shield,difficultyDamage:preview.difficultyDamage,lane:(random(run),0),position,burn:0,burnTurns:0,wet:0,slow:false,controlledAt:-2,attackCount:0,boost:0});
  }
}
export function newRun(seed=Date.now(),meta=createMeta(),difficulty=0,bannedElement=null){
  requireRule(validElementBan(bannedElement),'禁用元素无效');
  const traits=clone(meta.talents||{}),maxHp=100+5*(traits.body||0);
  const run={version:1,id:`run-${seed}-${Date.now()}`,seed:Number(seed)>>>0,rng:(Number(seed)>>>0)||1,difficulty:selectDifficulty(meta,difficulty),bannedElement,encounterVersion:3,phase:'supply',round:1,batch:1,completedBatches:0,isCleanup:false,
    hp:maxHp,maxHp,shield:0,resources:{draft:100+25*(traits.supply||0),refresh:10+10*(traits.refresh||0),remove:30+30*(traits.remove||0),swap:20+5*(traits.swap||0)},
    inventory:[],magazine:Array(12).fill(null),rest:null,slots:Array.from({length:12},()=>({engraving:null,charge:0,recycleRound:0})),enemies:[],summons:[],bonds:[],evolutions:{},offers:null,pending:[],selectedTarget:null,logs:[],stats:{kills:0,bossKills:0,damage:0,turns:0},defeatedBosses:[],traits,handled:[],eventOrder:[],outcome:null,reward:0,nextUid:1,draftCount:0,startRerolled:false,emergencyUsed:false};
  run.resources=normalizeResources(run.resources);
  run.talentState=createTalentState();
  starter(run);
  run.eventOrder=shuffle(run,EVENTS.map(x=>x.id));
  // Retain RNG consumption and save fields; all enemies share one ground line.
  run.waveLanes=WAVES.map(w=>w.map(()=>(random(run),0)));
  spawnBatch(run);
  run.enemies.forEach((e,i)=>e.lane=0);
  return run;
}
function rarity(run,cost){
  let x=random(run)*100;
  for(let i=0;i<5;i++){x-=ODDS[cost][i];if(x<0)return i;}
  return 4;
}
function primaryElement(run){
  const counts=getCounts(run),max=Math.max(...Object.values(counts));
  return pick(run,allowedElements(run).filter(e=>counts[e]===max));
}
function draftCards(run,cost,focus){
  const tiers=Array.from({length:3},()=>rarity(run,cost)),used=new Set();
  const selected=[];
  const elements=allowedElements(run);
  let elems=run.batch<=3?sample(run,elements,3):[];
  if(focus){
    elems=[focus,...sample(run,elements.filter(e=>e!==focus),2)];
  }
  const primary=run.batch>3?primaryElement(run):null;
  for(let i=0;i<3;i++){
    let pool=BULLETS.filter(x=>bulletAllowed(run,x)&&x.trigger!=='consumable'&&x.rarity===tiers[i]&&!used.has(x.id));
    const all=pool;
    if(run.batch<=3||focus){pool=pool.filter(x=>x.element===elems[i]);}
    else if(i===0){pool=pool.filter(x=>x.element===primary);}
    else if(i===1){
      const inactive=run.bonds.map(id=>BOND_MAP[id]).filter(x=>bondAllowed(run,x)&&bondGap(run,x)>0).sort((a,b)=>bondGap(run,a)-bondGap(run,b));
      if(inactive.length){
        const counts=getCounts(run),requirements=Object.entries(inactive[0].requirements).map(([e,n])=>({e,gap:n-counts[e]})).filter(x=>x.gap>0).sort((a,b)=>b.gap-a.gap);
        if(requirements.length)pool=pool.filter(x=>x.element===requirements[0].e);
      }else{
        const styleCounts={};for(const item of run.inventory){const def=card(item);styleCounts[def.style]=(styleCounts[def.style]||0)+1;}
        const max=Math.max(...Object.values(styleCounts)),style=pick(run,Object.keys(styleCounts).filter(x=>styleCounts[x]===max));
        pool=pool.filter(x=>x.style===style);
      }
    }
    const chosen=pick(run,pool.length?pool:all);
    used.add(chosen.id);selected.push(chosen.id);
  }
  return selected;
}
function bondCards(run,core=false){
  const pool=BONDS.filter(x=>bondAllowed(run,x)&&x.grade===(core?'core':'normal')&&!run.bonds.includes(x.id));
  const chosen=[];
  if(!core&&[4,9,15].includes(run.batch)){
    const evo=pick(run,BONDS.filter(x=>bondAllowed(run,x)&&x.grade==='evolution'&&!run.bonds.includes(x.id)&&bondGap(run,x,{includeTarget:false})===0));
    if(evo)chosen.push(evo.id);
  }
  function take(list){const found=pick(run,list.filter(x=>!chosen.includes(x.id)));if(found)chosen.push(found.id);}
  if(run.batch===2){
    const single=pool.filter(x=>x.id.startsWith('S')&&Object.values(x.requirements)[0]===3);
    const min=Math.min(...single.map(x=>bondGap(run,x)));
    take(single.filter(x=>bondGap(run,x)===min));
  }else{
    const satisfied=pool.filter(x=>bondGap(run,x)===0);
    if(satisfied.length)take(satisfied);
    else {const min=Math.min(...pool.map(x=>bondGap(run,x)));take(pool.filter(x=>bondGap(run,x)===min));}
  }
  if(chosen.length<2)take(pool.filter(x=>bondGap(run,x)<=2));
  while(chosen.length<3){const prior=chosen.length;take(pool);if(chosen.length===prior)break;}
  return chosen;
}
function scrollCards(run,element){return sample(run,BULLETS.filter(x=>bulletAllowed(run,x)&&x.trigger==='consumable'&&(!element||x.element===element)),3).map(x=>x.id);}
function eventOffer(run,descriptor){
  if(descriptor.eventId==='anvil'){
    const pool=ENCHANTMENTS.filter(x=>enchantmentAllowed(run,x));
    const first=pick(run,pool.filter(x=>x.kind==='mark'));
    const second=pick(run,pool.filter(x=>x.kind==='slot'));
    const third=pick(run,pool.filter(x=>x.id!==first.id&&x.id!==second.id));
    return {...descriptor,kind:'enchant',cards:[first.id,second.id,third.id]};
  }
  if(descriptor.eventId==='circuit'){
    const element=pick(run,allowedElements(run));
    return {...descriptor,kind:'enchant',cards:[...ENCHANTMENTS.filter(x=>x.element===element).map(x=>x.id),pick(run,BULLETS.filter(x=>x.trigger==='consumable'&&x.element===element)).id]};
  }
  if(descriptor.eventId==='supplies')return {...descriptor,cards:[{id:'refresh10',name:'重整补给',description:'获得 10 刷新值。'},{id:'remove30',name:'拆解工具',description:'获得 30 删除值。'},{id:'swap20',name:'调度组件',description:'获得 20 换位值。'},{id:'scroll-box',name:'元素卷轴箱',description:'打开后从三种随机卷轴中选择一枚，也可放弃。'}]};
  return {...descriptor,cards:[{id:'heal25',name:'休整治疗',description:`恢复 ${25+(run.traits.medicine?5:0)} 生命。`},{id:'max10',name:'强化体魄',description:`最大生命 +10，并恢复 ${10+(run.traits.medicine?5:0)} 生命。`}]};
}
function openNext(run){
  if(run.offers||!run.pending.length)return;
  const d=run.pending.shift();
  if(run.handled.includes(d.source))return openNext(run);
  if(d.kind==='bond')run.offers={...d,cards:bondCards(run,d.core)};
  else if(d.kind==='scroll')run.offers={...d,cards:scrollCards(run)};
  else run.offers=eventOffer(run,d);
}
function finishOffer(run){
  if(run.offers?.source&&!run.handled.includes(run.offers.source))run.handled.push(run.offers.source);
  run.offers=null;openNext(run);
}
function queueBatchRewards(run){
  if(BOND_ROUNDS.includes(run.batch))run.pending.push({kind:'bond',source:`bond-${run.batch}`,core:[6,12].includes(run.batch)});
  if(EVENT_ROUNDS.includes(run.batch))run.pending.push({kind:'event',source:`event-${run.batch}`,eventId:run.eventOrder[EVENT_ROUNDS.indexOf(run.batch)]});
  if(run.batch===18)run.pending.push({kind:'scroll',source:'final-scroll'});
}
function weightInfo(run,item){
  const fireCount=getCounts(run).fire;
  const magnet=item.typeId==='L21'||(item.typeId==='F21'&&fireCount>=6)||item.mark==='M01'||item.temp?.magnet;
  const lurk=item.typeId==='F13'||item.mark==='M02'||item.temp?.lurk;
  return {weight:Math.max(.25,Math.min(3,(magnet?2:1)*(lurk?0.5:1))),lurk:Boolean(lurk)};
}
export function getDrawWeight(run,item){return weightInfo(run,item).weight;}
function loadMagazine(run){
  const info=new Map(run.inventory.map(x=>[x.uid,weightInfo(run,x)]));
  const chosen=shuffle(run,sample(run,run.inventory,12,x=>info.get(x.uid).weight));
  run.magazine=Array(12).fill(null);
  chosen.forEach((item,i)=>{run.magazine[i]=item.uid;item.temp={...item.temp,loadedLurk:info.get(item.uid).lurk,loadedMark:item.mark,loadedWeight:info.get(item.uid).weight};});
  for(const item of run.inventory){delete item.temp.magnet;delete item.temp.lurk;}
  run.rest=null;run.phase='prepare';
}
function chooseOffer(run,action){
  const offer=run.offers;
  requireRule(offer&&Number.isInteger(action.index)&&action.index>=0&&action.index<offer.cards.length,'没有这张候选');
  const option=offer.cards[action.index],id=typeof option==='string'?option:option.id;
  if(offer.kind==='bullet'||offer.kind==='scroll')addBullet(run,id);
  else if(offer.kind==='bond'){
    requireRule(bondAllowed(run,BOND_MAP[id]),'本局已禁用该羁绊需求元素');
    requireRule(!run.bonds.includes(id),'已经拥有该羁绊');
    const bond=BOND_MAP[id];
    run.bonds.push(id);
    if(bond.grade==='evolution'){
      run.evolutions[id]={progress:0};
      if(bond.targetId&&!run.inventory.some(item=>item.typeId===bond.targetId))addBullet(run,bond.targetId);
    }
  }else if(offer.kind==='enchant'){
    if(BULLET_MAP[id]?.trigger==='consumable')addBullet(run,id);
    else {
      const def=ENCHANTMENT_MAP[id];requireRule(Boolean(def),'未知附魔');
      requireRule(enchantmentAllowed(run,def),'本局已禁用该附魔元素');
      if(def.kind==='slot'){
        const index=Number(action.target);requireRule(action.target!==undefined&&Number.isInteger(index)&&index>=0&&index<12,'请先选择一个弹夹槽位');
        run.slots[index]={engraving:id,charge:0,recycleRound:0};
      }else{
        const item=run.inventory.find(x=>x.uid===action.target);requireRule(item&&permanent(item),'请选择一枚常驻子弹');
        if(['M03','M04'].includes(id))requireRule(card(item).trigger==='shot'||(card(item).trigger==='timer'&&!['H01','H03','H05','R01','R03','R05'].includes(item.typeId)),'此印记需要有直接攻击的子弹');
        item.mark=id;
      }
    }
  }else{
    if(id==='refresh10')run.resources.refresh+=10;
    else if(id==='remove30')addResource(run.resources,'remove',30);
    else if(id==='swap20')addResource(run.resources,'swap',20);
    else if(id==='heal25')run.hp=Math.min(run.maxHp,run.hp+25+(run.traits.medicine?5:0));
    else if(id==='max10'){run.maxHp+=10;run.hp=Math.min(run.maxHp,run.hp+10+(run.traits.medicine?5:0));}
    else if(id==='scroll-box'){run.offers={kind:'scroll',source:offer.source,cards:scrollCards(run)};return;}
    else throw new Error('未知事件选项');
  }
  finishOffer(run);
}
function endRun(run,outcome){
  run.phase='ended';run.outcome=outcome;run.offers=null;run.pending=[];
  run.reward=Math.floor(Math.min(run.completedBatches,18)/3)+run.stats.bossKills;
}
function advanceAfterCombat(run,previousBosses){
  run.stats.turns=run.round;
  if(run.hp<=0){endRun(run,'defeat');return;}
  const talentState=ensureTalentState(run);
  if(run.traits.rescueScroll&&run.emergencyUsed&&!talentState.rescueGranted){
    talentState.rescueGranted=true;
    const id=bulletAllowed(run,BULLET_MAP.C04)?'C04':'C08';
    addBullet(run,id);
    run.logs.push(`绝境药匣：获得${BULLET_MAP[id].name}，之后入夹时生效。`);
  }
  for(const boss of run.defeatedBosses.filter(id=>!previousBosses.includes(id))){
    if(boss!=='boss3')run.pending.push({kind:'scroll',source:`scroll-${boss}`});
  }
  if(!run.isCleanup){
    run.completedBatches=run.batch;
    run.resources.draft+=run.batch<=6?100:run.batch<=12?150:200;
    run.resources.refresh+=2+([6,12].includes(run.batch)?10:0);
    if([3,6,9,12,15].includes(run.batch))addResource(run.resources,'remove',30);
    addResource(run.resources,'swap',5);
    if(run.traits.scrollCache&&[6,12,18].includes(run.batch)&&!talentState.scrollBatches.includes(run.batch)){
      const element=pick(run,allowedElements(run));
      const scroll=pick(run,BULLETS.filter(x=>x.trigger==='consumable'&&x.element===element));
      addBullet(run,scroll.id);
      talentState.scrollBatches.push(run.batch);
      run.logs.push(`旅途卷匣：获得${scroll.name}，之后入夹时生效。`);
    }
  }
  if(run.batch===18&&run.enemies.length===0&&run.stats.bossKills>=3){endRun(run,'victory');return;}
  run.round++;
  if(run.batch<18){
    run.batch++;const start=run.enemies.length;spawnBatch(run);
    run.enemies.slice(start).forEach((e,i)=>e.lane=0);
    queueBatchRewards(run);
  }else run.isCleanup=true;
  run.magazine=Array(12).fill(null);run.rest=null;run.selectedTarget=null;run.phase='supply';
  openNext(run);
}

export function act(input,action){
  let run=clone(input),frames=[];
  try {
    requireRule(run&&run.version===1,'存档版本不兼容');
    requireRule(run.bannedElement===undefined||validElementBan(run.bannedElement),'禁用元素无效');
    run.resources=normalizeResources(run.resources);
    ensureTalentState(run);
    requireRule(run.phase!=='ended','本局已结束');
    if(['draft','choose','skip','refresh','load','rerollStart'].includes(action.type))requireRule(run.phase==='supply','请在补给阶段操作');
    if(['swap','remove','rest','undoRest','target'].includes(action.type))requireRule(run.phase==='prepare','请先装填弹夹');
    switch(action.type){
      case 'draft': {
        requireRule(!run.offers&&!run.pending.length,'请先处理当前选择');
        requireRule([100,200,300].includes(action.cost),'招募档位无效');
        requireRule(action.cost!==300||run.batch>=13,'三倍招募在第 13 批解锁');
        requireRule(run.resources.draft>=action.cost,'选弹值不足');
        const focus=action.focus&&run.traits.focus&&!run.draftCount&&getCounts(run)[action.focus]>0?action.focus:null;
        run.resources.draft-=action.cost;run.draftCount++;
        run.offers={kind:'bullet',source:`draft-${run.draftCount}`,cost:action.cost,focus,cards:draftCards(run,action.cost,focus)};
        break;
      }
      case 'choose':chooseOffer(run,action);break;
      case 'skip': {
        requireRule(Boolean(run.offers),'当前没有可跳过的选择');
        if(run.traits.skipRefresh&&run.offers.kind==='bullet'&&[100,200,300].includes(run.offers.cost)&&run.talentState.skipRefunds<2){
          run.talentState.skipRefunds++;
          run.resources.refresh+=5;
        }
        finishOffer(run);break;
      }
      case 'refresh': {
        const offer=run.offers;requireRule(offer&&['bullet','bond','scroll'].includes(offer.kind),'当前选择不能刷新');
        const cost=getRefreshCost(run);
        requireRule(run.resources.refresh>=cost,'刷新值不足');run.resources.refresh-=cost;
        if(cost===0)run.talentState.freeRefreshUsed=true;
        offer.cards=offer.kind==='bullet'?draftCards(run,offer.cost,offer.focus):offer.kind==='bond'?bondCards(run,offer.core):scrollCards(run);
        break;
      }
      case 'load':requireRule(!run.offers&&!run.pending.length,'请先选择或跳过当前奖励');loadMagazine(run);break;
      case 'swap': {
        const {a,b}=action;requireRule(Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&a<12&&b>=0&&b<12&&a!==b,'请选择两个不同槽位');
        requireRule(run.magazine[a]||run.magazine[b],'两个空槽不需要换位');
        requireRule(!run.rest||![a,b].includes(run.rest.slot),'先撤销该槽位的休止');
        const cost=getSwapCost(run);
        requireRule(run.resources.swap>=cost,'换位值不足');run.resources.swap-=cost;
        if(cost===0)run.talentState.freeSwapRound=run.round;
        [run.magazine[a],run.magazine[b]]=[run.magazine[b],run.magazine[a]];break;
      }
      case 'remove': {
        const uid=run.magazine[action.slot];requireRule(Boolean(uid),'请选择有子弹的槽位');
        const remaining=run.inventory.filter(x=>x.uid!==uid);
        requireRule(remaining.filter(permanent).length>=3&&remaining.filter(x=>permanent(x)&&card(x).trigger==='shot').length>=2,'至少保留 3 枚常驻子弹，其中 2 枚普通发射弹');
        const candidate={...run,inventory:remaining};
        requireRule(!run.rest||getActiveBonds(candidate).includes('Q05'),'这次删除会使空槽交响失效，请先撤销休止');
        requireRule(run.resources.remove>=RESOURCE_COSTS.remove,'删除值不足');run.resources.remove-=RESOURCE_COSTS.remove;
        run.inventory=remaining;run.magazine[action.slot]=null;break;
      }
      case 'rest': {
        requireRule(getActiveBonds(run).includes('Q05'),'需要激活空槽交响');requireRule(!run.rest,'本夹已经有一枚休止子弹');
        const uid=run.magazine[action.slot],item=run.inventory.find(x=>x.uid===uid);
        requireRule(item&&permanent(item),'休止只能选择常驻子弹');run.rest={uid,slot:action.slot};run.magazine[action.slot]=null;break;
      }
      case 'undoRest':requireRule(Boolean(run.rest),'当前没有休止子弹');run.magazine[run.rest.slot]=run.rest.uid;run.rest=null;break;
      case 'target':requireRule(action.uid===null||run.enemies.some(x=>x.uid===action.uid),'敌人已不在场');run.selectedTarget=action.uid;break;
      case 'rerollStart':
        requireRule(run.round===1&&!run.draftCount&&!run.offers&&run.traits.reroll&&!run.startRerolled,'开局重抽不可用');
        starter(run);run.startRerolled=true;break;
      case 'execute': {
        requireRule(['prepare','locked'].includes(run.phase),'请先装填');
        const previousBosses=[...run.defeatedBosses];
        const result=resolveRound(run);run=result.state;frames=result.presentationFrames||result.frames||[];
        advanceAfterCombat(run,previousBosses);break;
      }
      default:throw new Error('未知操作');
    }
    return {run,frames,error:null};
  }catch(error){return {run:input,frames:[],error:error.message||'操作失败'};}
}
