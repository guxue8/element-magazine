import {
  BULLET_MAP
} from './catalog.js';
export class CombatBonds {
  constructor(c){
    this.c=c;
    this.progress={
    };
    this.fuel=new Set();
    this.sequence=[];
    this.pressure=0;
    this.lastSteam=null;
    this.network=null;
    this.mirror=null;
    this.infused=new Set();
    this.rail={
    };
    this.benefitElements=new Set();
    // A lightning bullet only charges targets for later bullets, never itself.
    this.chargedTargets=new Set();
  }  grow(id){
    const c=this.c;
    if(c.stage(id)&&c.once(`${id}.growth`,3))this.progress[id]=(this.progress[id]||0)+1;
  }  multiplier(d,t,opts){
    const c=this.c,e=d.element,b=(id,n,cond=true)=>c.has(id)&&cond?n:0;
    return b('S03',.3,e==='fire'&&t.burn>0)+b('S07',.25,e==='lightning'&&this.chargedTargets.has(t.uid))+b('S08',.25,e==='lightning'&&d.trigger==='timer')+b('S09',.35,e==='lightning'&&opts.jump)+b('S10',.2,e==='wind'&&c.slot%4>0&&c.hits.has(c.slot-1))+b('S12',.4,e==='wind'&&t.windMark)+b('S13',.15,e==='earth')+b('D02',.25,e==='water'&&t.burn)+b('D03',.3,e==='fire'&&t.burn>=2)+b('D04',.25,e==='lightning'&&t.burn)+b('D06',.25,e==='wind'&&t.burn)+b('D08',.25,e==='earth'&&t.burn)+b('D10',.25,e==='water'&&t.wet)+b('D12',.25,e==='wind'&&t.wet)+b('D14',.2,e==='earth'&&t.playerShield>0)+b('D16',.3,e==='lightning'&&t.windMark)+b('D20',.2,e==='wind'&&t.playerShield>0)+b('T01',.3,e==='fire'&&t.wet)+b('T04',.25,e==='lightning'&&(t.burn||t.windMark))+b('T07',.3,e==='wind'&&t.wet)+b('T10',.25,e==='lightning'&&d.trigger==='timer')+b('Q03',.15,d.trigger==='shot')+b('Q04',.4,e==='lightning'&&d.trigger==='timer'&&!c.success.some(x=>BULLET_MAP[x.typeId].element==='lightning'))+b('A03',.2,d.trigger==='shot');
  }  hit(t,snap,d){
    const c=this.c,e=d.element;
    if(e==='fire'&&snap.burn>0&&t.hp>0&&c.has('S01')&&c.once('S01',3))c.burn(t,1);
    if(e==='water'){
      if(snap.wet>0&&c.has('S04')&&c.once('S04',2))c.shield(3);
      if(c.has('T02')&&c.once('T02',2))c.heal(1);
      if(c.has('Q01')&&d.trigger==='shot'&&c.once('Q01'))c.resource('refresh',2);
    }  if(c.has('D01')&&(e==='fire'||e==='water')){
      if(this.lastSteam&&this.lastSteam!==e)this.pressure++;
      this.lastSteam=e;
      if(this.pressure>=3&&c.once('D01',2)){
        this.pressure=0;
        c.derived(t,30,'water');
        c.control(t,'push',false);
      }
    }  if(c.has('D09')&&e==='lightning'){
      if(!this.network&&snap.wet)this.network=[t,...c.sorted(c.alive().filter(x=>x!==t&&x.wet)).slice(0,2)];
      if(this.network?.includes(t)&&c.once('D09.conduct',3))for(const x of this.network)if(x!==t)c.derived(x,6,'lightning');
    }  if(c.has('D15')&&d.trigger==='shot'){
      this.sequence.push({
        element:e,source:c.current
      });
      if(this.sequence.length>3)this.sequence.shift();
      if(this.sequence.map(x=>x.element).join(',')==='lightning,wind,lightning'&&c.once('D15')){
        c.derived(t,24,'lightning');
        c.echo(this.sequence[1].source,.4,'D15',1);
      }
    }  if(c.has('D17')&&e==='lightning'&&c.once('D17.charge',6)){
      const s=[...c.s.summons].sort((a,b)=>a.created-b.created).find(s=>s.kind!=='spring'&&(this.rail[s.uid]||0)<3);
      if(s)this.rail[s.uid]=(this.rail[s.uid]||0)+1;
    }  if(c.has('A01')){
      if(e==='fire'&&d.trigger==='shot'&&this.fuel.size===4&&c.once('A01')){
        c.derived(t,36,'fire');
        for(const x of c.near(t,1,2))c.derived(x,18,'fire');
      }else if(e!=='fire')this.fuel.add(e);
    }
  }  evolutionHit(t,snap,d,buff){
    const c=this.c;
    if(c.resonant.has(c.current.uid))return;
    if(buff.F16&&d.trigger==='shot'&&c.stage('E01')){
      this.grow('E01');
      if(c.once('E01.burn',2))c.burn(t,1);
      if(c.stage('E01',5)&&snap.burn&&c.once('E01.spread')){
        const x=c.near(t,1)[0];
        c.derived(x,4,'fire');
        c.burn(x,1);
      }this.benefitElements.add(d.element);
      if(c.stage('E01',9)&&this.benefitElements.size>=2&&c.once('E01.multi'))for(const x of c.near(t,1,2))c.burn(x,1);
    }  if(d.element==='fire'&&snap.burn)this.grow('E02');
    if(d.element==='water'&&snap.wet)this.grow('E03');
    if(d.element==='earth'&&d.trigger==='shot'&&snap.playerShield>0)this.grow('E08');
    if(d.id==='W03'&&c.stage('E06'))c.derived(t,2,'wind');
    if(d.id==='R11'&&c.stage('E08')&&c.once('E08.hit',3))c.shield(1);
  }  timer(b){
    const c=this.c;
    if(c.resonant.has(b.uid))return;
    this.grow('E05');
    const d=BULLET_MAP[b.typeId];
    if(d.element==='lightning'){
      if(c.has('D18')&&c.once('D18'))c.shield(6);
      if(c.has('T05')&&!c.extra.has(b.uid)&&c.once('T05')){
        const candidates=c.layout.map((x,i)=>({
          x,i
        })).filter(({
          x,i
        })=>x&&i>c.slot&&BULLET_MAP[x.typeId].trigger==='timer'&&['fire','earth'].includes(BULLET_MAP[x.typeId].element)&&x.counter>0&&!c.extra.has(x.uid)).sort((a,b)=>a.x.counter-b.x.counter||a.i-b.i);
        if(candidates[0])c.advance(candidates[0].i,true);
      }
    }
  }  complete(b){
    const c=this.c,d=BULLET_MAP[b.typeId];
    if(c.resonant.has(b.uid))return;
    if(d.element==='lightning')for(const uid of c.hitTargets)this.chargedTargets.add(uid);
    if(d.element==='lightning'&&c.nativeCount)this.grow('E04');
    if(['W01','W03','W05','W06'].includes(b.typeId)&&new Set(c.hitTargets).size<c.hitTargets.length)this.grow('E06');
    if(d.trigger!=='shot'||!c.nativeCount)return;
    if(c.has('D11')){
      if(d.element==='wind'&&!this.mirror)this.mirror=b;
      else if(d.element==='water'&&this.mirror&&c.once('D11'))c.echo(this.mirror,.6,'D11',1);
    }if(c.has('T06')&&d.rarity===0&&c.once('T06.count',4)&&c.counters['T06.count']===4)c.summon('guard',2,'banner');
  }  empty(){
    const c=this.c;
    if(c.has('Q05'))c.echo(c.source(()=>true,'Q05'),.75,'Q05',2);
  }  prepareSummons(){
    const c=this.c;
    if(c.has('D13')&&c.s.summons.some(s=>s.kind==='spring')&&c.s.summons.some(s=>s.kind!=='spring'))this.infused=new Set(c.s.summons.map(s=>s.uid));
  }  summonAction(s,t){
    const c=this.c;
    if(s.kind==='spring'&&t){
      if(c.has('S06')&&c.once('S06',2))c.heal(2);
      if(c.has('T08')&&c.once('T08'))c.derived(t,8,'water');
      if(this.infused.has(s.uid))c.wet(c.sorted(c.alive().filter(x=>x!==t))[0]);
    }if(s.kind==='guard'){
      if(c.has('S14')&&c.once('S14',2))c.shield(1);
      if(c.has('T03')&&c.once('T03'))c.shield(3);
      if(this.infused.has(s.uid))c.derived(c.target(),8,'water');
    }if(s.kind==='cannon'){
      if(this.infused.has(s.uid)&&t?.wet)c.derived(t,6,'water');
      if(s.sourceId==='R03'&&c.stage('E07')){
        if(c.once('E07.shield',2))c.shield(c.stage('E07',5)?2:1);
        if(t){
          this.grow('E07');
          if(c.stage('E07',2)&&c.once('E07.splash',2))c.derived(c.near(t,1)[0],3,'earth');
        }
      }
    }if((this.rail[s.uid]||0)>=3&&c.once('D17.fire',2)){
      this.rail[s.uid]-=3;
      const target=c.target();
      if(target){
        const ts=[target,...c.back(target,1)];
        for(const x of ts)c.derived(x,18,'lightning');
      }
    }
  }  expire(s){
    const c=this.c;
    if(s.kind!=='spring'){
      if(c.has('S15')&&c.once('S15',2))c.resource('remove',1);
      if(c.has('D07')&&c.once('D07',2)){
        const t=c.target();
        if(t)for(const x of [t,...c.near(t,1,2)]){
          c.derived(x,12,'fire');
          c.burn(x,1);
        }
      }if(s.kind==='cannon'&&s.sourceId==='R03'&&c.stage('E07',9)&&c.once('E07.expire')){
        c.shield(4);
        c.derived(c.target(),6,'earth');
      }
    }
  }  attacked(e,absorbed){
    const c=this.c;
    if(absorbed&&c.has('D19')&&c.once('D19')){
      const out=c.derived(e,Math.min(6,absorbed)*2,'earth');
      this.counterHeal(out);
      c.control(e,'push',false);
    }
  }  counterHeal(out){
    const c=this.c;
    if(out.amount>0&&c.contains('R12')&&c.once('R12'))c.shield(6);
  }  counter(e,source){
    const c=this.c;
    const out=c.derived(e,10,'earth');
    this.counterHeal(out);
    if(source==='R11'&&c.stage('E08',2)&&c.once('E08.counterShield',2))c.shield(2);
    if(source==='R11'&&c.stage('E08',5)&&c.once('E08.counterSplash',2))c.derived(c.near(e,1)[0],4,'earth');
  }  commit(){
    const c=this.c;
    for(const [id,n]of Object.entries(this.progress)){
      c.s.evolutions[id]??={
        progress:0
      };
      c.s.evolutions[id].progress=Math.min(9,c.s.evolutions[id].progress+n);
    }
  }
}
