import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,createMeta,act} from '../src/campaign.js';
import {saveGame,GAME_STORAGE_KEY} from '../src/storage.js';
import {BULLET_MAP,BOND_MAP} from '../src/catalog.js';
import {bondSummary} from '../src/presentation.js';
import {escapeHTML} from '../src/view-utils.js';
import {resolveRound} from '../src/combat.js';

let importNumber=0;
async function harness(run,meta=createMeta()){
  const values=new Map(),listeners={},timers=new Set();
  const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))};
  assert.equal(saveGame(run,meta,storage),null);
  const app={innerHTML:'',addEventListener:(kind,fn)=>listeners[kind]=fn};
  const toast={textContent:'',classList:{add(){},remove(){}}};
  const prior={document:globalThis.document,localStorage:globalThis.localStorage,setTimeout:globalThis.setTimeout};
  globalThis.document={querySelector:s=>s==='#app'?app:s==='#toast'?toast:null,addEventListener(){}};
  globalThis.localStorage=storage;
  globalThis.setTimeout=(fn,ms)=>{const handle=prior.setTimeout(fn,ms);timers.add(handle);return handle;};
  await import(`../src/app.js?ui-review=${++importNumber}`);
  return {
    html:()=>app.innerHTML,
    saved:()=>JSON.parse(storage.getItem(GAME_STORAGE_KEY)).run,
    async reload(){await import(`../src/app.js?ui-review=${++importNumber}`);},
    click(dataset){
      const tags=app.innerHTML.match(/<button\b[^>]*>/g)||[];
      const expected=Object.entries(dataset).map(([key,value])=>`data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}="${value}"`);
      const tag=tags.find(tag=>expected.every(value=>tag.includes(value)));
      assert.ok(tag,`Visible UI button not found: ${JSON.stringify(dataset)}`);
      assert.doesNotMatch(tag,/\sdisabled(?:\s|>)/,'UI button unexpectedly disabled');
      listeners.click({target:{closest:()=>({dataset,disabled:false})}});
    },
    close(){for(const timer of timers)clearTimeout(timer);globalThis.document=prior.document;globalThis.localStorage=prior.localStorage;globalThis.setTimeout=prior.setTimeout;}
  };
}
const prepare=run=>{const result=act(run,{type:'load'});assert.equal(result.error,null);return result.run;};
const arranged=ids=>{
  let run=newRun(201);
  run.inventory=ids.map((typeId,i)=>({uid:`review${i}`,typeId,counter:BULLET_MAP[typeId].counter,mark:null,temp:{}}));
  run=prepare(run);
  run.magazine=Array.from({length:12},(_,i)=>run.inventory[i]?.uid??null);
  return run;
};
const notice=html=>html.match(/<p class="notice">([^]*?)<\/p>/)?.[1]??'';

test('bond details lead with a summary and keep complete rules collapsed',async()=>{
  const h=await harness(newRun(130));
  try{
    h.click({ui:'codex'});h.click({tab:'bonds'});h.click({bond:'D09'});
    assert.ok(h.html().includes(escapeHTML(bondSummary('D09'))));
    const rules=h.html().match(/<details class="rule-details"[^>]*>([^]*?)<\/details>/);
    assert.ok(rules,'precise rules remain accessible');
    assert.doesNotMatch(rules[0],/<details[^>]*\sopen/);
    assert.ok(rules[1].includes(escapeHTML(BOND_MAP.D09.description)));
  }finally{h.close();}
});

test('pixel battlefield and enemy intel consistently show one horizontal front',async()=>{
  const h=await harness(newRun(131));
  try{
    h.click({ui:'continue'});
    assert.match(h.html(),/pixel-floor/);
    assert.match(h.html(),/class="pixel-sprite/);
    h.click({ui:'intel'});
    assert.doesNotMatch(h.html(),/通道/);
    assert.match(h.html(),/距离/);
  }finally{h.close();}
});

test('magazine icons reveal full bullet information only after clicking',async()=>{
  const run=prepare(newRun(101)),h=await harness(run);
  try{
    h.click({ui:'continue'});
    assert.doesNotMatch(h.html(),/role="dialog"/);
    const uid=run.magazine[0],b=BULLET_MAP[run.inventory.find(i=>i.uid===uid).typeId];
    const tile=h.html().match(/<button class="bullet-slot[^]*?<\/button>/)[0];
    assert.match(tile,/bullet-glyph/);assert.doesNotMatch(tile,new RegExp(`>${b.name}<`));
    h.click({slot:'0'});
    assert.match(h.html(),/aria-label="子弹详情"/);
    assert.ok(h.html().includes(escapeHTML(b.description)));
    h.click({ui:'close'});h.click({ui:'bag'});
    assert.match(h.html(),/aria-label="携行背包"/);
    h.click({inspect:uid});assert.match(h.html(),/aria-label="子弹详情"/);
    h.click({ui:'back'});assert.match(h.html(),/aria-label="携行背包"/);
  }finally{h.close();}
});

test('swap icon selects two slots and persists exactly one charge payment',async()=>{
  const run=prepare(newRun(102)),h=await harness(run);
  try{
    h.click({ui:'continue'});h.click({mode:'swap'});h.click({slot:'0'});h.click({slot:'8'});
    const saved=h.saved();assert.equal(saved.magazine[8],run.magazine[0]);assert.equal(saved.magazine[0],null);
    assert.equal(saved.resources.swap,run.resources.swap-10);
  }finally{h.close();}
});

test('circuit scroll reward can be selected without an enchantment target',async()=>{
  const run=newRun(103);run.offers={kind:'enchant',source:'event-test',cards:['M03','G03','C05']};
  const h=await harness(run);
  try{
    h.click({ui:'continue'});h.click({main:'true'});h.click({choose:'2'});
    assert.equal(h.saved().inventory.filter(x=>x.typeId==='C05').length,1);
    assert.equal(h.saved().offers,null);assert.doesNotMatch(h.html(),/aria-label="选择附魔目标"/);
  }finally{h.close();}
});

test('resting a permanent bullet and clicking its empty icon restores the same instance',async()=>{
  let run=newRun(104);
  run.inventory=['W01','W01','W01','W01','W01','L01','L01','L01','H06','H06','R11','R11'].map((typeId,i)=>({uid:`test${i}`,typeId,counter:0,mark:null,temp:{}}));
  run.bonds=['Q05'];run=prepare(run);
  const h=await harness(run);
  try{
    h.click({ui:'continue'});h.click({slot:'0'});h.click({action:'rest',slot:'0'});
    assert.deepEqual(h.saved().rest,{uid:run.magazine[0],slot:0});assert.equal(h.saved().magazine[0],null);
    h.click({slot:'0'});assert.equal(h.saved().rest,null);assert.equal(h.saved().magazine[0],run.magazine[0]);
  }finally{h.close();}
});

test('the starting reroll talent remains reachable from the redesigned preparation UI',async()=>{
  const meta=createMeta();meta.talents.reroll=1;
  const run=newRun(105,meta),h=await harness(run,meta);
  try{
    h.click({ui:'continue'});h.click({ui:'bag'});
    if(!/data-(?:ui|action)="rerollStart"/.test(h.html())){h.click({ui:'close'});h.click({ui:'shop'});}
    const match=h.html().match(/data-(ui|action)="rerollStart"/);
    assert.ok(match,'准备预案 must expose its starting reroll action in bag or shop');
    h.click({[match[1]]:'rerollStart'});
    assert.equal(h.saved().startRerolled,true);
    assert.equal(h.saved().inventory.length,4);assert.equal(h.saved().resources.draft,run.resources.draft);
    assert.doesNotMatch(h.html(),/data-(?:ui|action)="rerollStart"/);
  }finally{h.close();}
});

test('a fire scroll warns at the left boundary and clears the warning after moving beside a shot',async()=>{
  const run=arranged(['C01','F15','F15','H06']),h=await harness(run);
  try{
    h.click({ui:'continue'});h.click({slot:'0'});
    assert.match(notice(h.html()),/左侧没有常驻弹/);
    h.click({detailAction:'swap'});h.click({slot:'2'});h.click({slot:'2'});
    assert.equal(h.saved().magazine[2],run.inventory[0].uid);
    assert.doesNotMatch(notice(h.html()),/无收益|尚未就绪/);
    assert.match(notice(h.html()),/入夹执行后消耗/);
  }finally{h.close();}
});

test('a timer scroll preview accounts for the natural countdown before scroll resolution',async()=>{
  for(const counter of [1,2]){
    const run=arranged(['C05','L08','F15','H06','F15']);
    run.inventory[1].counter=counter;
    const h=await harness(run);
    try{
      h.click({ui:'continue'});h.click({slot:'0'});
      if(counter===1)assert.match(notice(h.html()),/右侧没有自然计时后仍可推进/);
      else assert.doesNotMatch(notice(h.html()),/右侧没有自然计时后仍可推进/);
      const result=resolveRound(run);
      assert.equal(result.frames.filter(f=>f.text==='计时额外推进').length,counter===2?1:0);
    }finally{h.close();}
  }
});

test('deletion requires confirmation, removes one instance, charges once and survives page reload',async()=>{
  const run=arranged(['F15','F15','F15','F15']),h=await harness(run),uid=run.magazine[0];
  try{
    h.click({ui:'continue'});h.click({mode:'remove'});h.click({slot:'0'});
    assert.match(h.html(),/aria-label="删除这枚子弹"/);
    assert.equal(h.saved().inventory.length,4);assert.equal(h.saved().resources.remove,30);
    h.click({confirmRemove:'true'});
    assert.equal(h.saved().inventory.length,3);
    assert.ok(h.saved().inventory.every(item=>item.uid!==uid));
    assert.equal(h.saved().magazine[0],null);assert.equal(h.saved().resources.remove,0);
    assert.doesNotMatch(h.html(),/data-confirm-remove=/);
    const saved=h.saved();
    await h.reload();h.click({ui:'continue'});h.click({ui:'bag'});
    assert.deepEqual(h.saved(),saved);
    assert.ok(!h.html().includes(`data-inspect="${uid}"`));
    assert.equal((h.html().match(/data-inspect=/g)||[]).length,3);
  }finally{h.close();}
});

test('recruitment shows two charge bars through batch twelve and unlocks the third in batch thirteen',async()=>{
  for(const batch of [12,13]){
    const run=newRun(202);run.batch=batch;run.round=batch;run.completedBatches=batch-1;run.resources.draft=250;
    const h=await harness(run);
    try{
      h.click({ui:'continue'});
      const bars=h.html().match(/<span class="charge-bars recruit-bars">([^]*?)<\/span>/)?.[1];
      assert.ok(bars,'recruitment orb must contain its charge bars');
      assert.equal((bars.match(/<i>/g)||[]).length,batch===12?2:3);
      assert.equal((bars.match(/width:100%/g)||[]).length,2);
      assert.equal((bars.match(/width:50%/g)||[]).length,batch===13?1:0);
      h.click({ui:'shop'});assert.match(h.html(),/招募值 <b>250<\/b>/);
    }finally{h.close();}
  }
});
