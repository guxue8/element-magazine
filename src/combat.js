import {
  BULLET_MAP,BOND_MAP,ENEMIES,ELEMENTS
} from './catalog.js';
import {
  effects,setupDirections,scrollEffects
} from './combat-effects.js';
import {
  CombatBonds
} from './combat-bonds.js';
import {normalizeResources,addResource} from './resources.js';
export const implementedBulletIds=Object.freeze([...Object.keys(effects),...Object.keys(scrollEffects)]);
const clone=x=>structuredClone(x);
export const distance=(a,b)=>Math.abs(a.position-b.position);
export class Combat {
  constructor(run){
    this.s=clone(run);
    this.s.resources=normalizeResources(this.s.resources);
    this.startDamage=run.stats.damage;
    this.frames=[];
    this.s.logs=[];
    this.layout=this.s.magazine.map(uid=>this.s.inventory.find(b=>b.uid===uid)||null);
    this.counts={
    };
    for(const b of this.s.inventory){
      const e=BULLET_MAP[b.typeId].element;
      this.counts[e]=(this.counts[e]||0)+1;
    }this.active=new Set(this.s.bonds.filter(id=>{
      const b=BOND_MAP[id];
      return b&&Object.entries(b.requirements).every(([e,n])=>(this.counts[e]||0)>=n)&&this.s.inventory.filter(x=>BULLET_MAP[x.typeId].rarity===0).length>=(b.whiteRequired||0)&&(!b.targetId||this.s.inventory.some(x=>x.typeId===b.targetId));
    }));
    this.counters={
    };
    this.buffs=Array.from({
      length:12
    },()=>({
    }));
    this.extra=new Set();
    this.resonant=new Set();
    this.success=[];
    this.history=[];
    this.hits=new Map();
    this.used=new Set();
    this.replay=false;
    this.slot=-1;
    this.nativeCount=0;
    this.spawnCount=0;
    this.shieldLimit=this.has('Q02')?28:20;
    this.s.shield=Math.min(this.s.shield,this.shieldLimit);
    this.resources={
      refresh:0,remove:0
    };
    this.counterPool=[];
    this.issuedCounters=0;
    this.commands=new Set();
    this.variantUsed=new Set();
    this.firstShield=new Set();
    this.bonds=new CombatBonds(this);
  }  has(id){
    return this.active.has(id);
  } stage(id,n=0){
    return this.has(id)&&(this.s.evolutions[id]?.progress||0)>=n;
  } once(key,limit=1){
    if((this.counters[key]||0)>=limit)return false;
    this.counters[key]=(this.counters[key]||0)+1;
    return true;
  }  alive(){
    return this.s.enemies.filter(e=>e.hp>0);
  } sorted(list=this.alive(),priority=true){
    return [...list].sort((a,b)=>(priority?(a.uid===this.s.selectedTarget?-1:b.uid===this.s.selectedTarget?1:0):0)||a.position-b.position||this.s.enemies.indexOf(a)-this.s.enemies.indexOf(b));
  } target(){
    return this.sorted()[0];
  } near(t,r=1,n=1,p=()=>true){
    return this.sorted(this.alive().filter(e=>e.uid!==t.uid&&distance(t,e)<=r&&p(e)),false).slice(0,n);
  } back(t,n=2){
    return this.sorted(this.alive().filter(e=>e.uid!==t.uid&&e.position>=t.position),false).slice(0,n);
  } adjacent(i){
    return [i%4?i-1:-1,i%4<3?i+1:-1,i-4,i+4].filter(j=>j>=0&&j<12);
  } right(i){
    return i%4<3?i+1:-1;
  } left(i){
    return i%4?i-1:-1;
  }  frame(type,text,extra={
  }){
    const f={
      type,text,...extra,board:clone({
        enemies:this.alive(),summons:this.s.summons,hp:this.s.hp,shield:this.s.shield
      })
    };
    this.frames.push(f);
    this.s.logs.push(text);
  }  shield(n){
    if(this.replay||n<=0)return;
    const old=this.s.shield;
    this.s.shield=Math.min(this.shieldLimit,old+n);
    if(this.s.shield>old)this.frame('status',`获得 ${this.s.shield-old} 护盾`,{
      amount:this.s.shield-old
    });
  }  heal(n){
    if(this.replay)return;
    this.s.hp=Math.min(this.s.maxHp,this.s.hp+n);
  }  resource(kind,n){
    if(this.replay)return 0;
    const requested=Math.min(n,(kind==='refresh'?2:3)-this.resources[kind]);
    const gain=requested>0?addResource(this.s.resources,kind,requested):0;
    if(gain<=0)return 0;
    this.resources[kind]+=gain;
    if(kind==='refresh'&&this.contains('H19')&&this.once('H19'))this.heal(2);
    return gain;
  }  contains(id){
    return this.layout.some(b=>b?.typeId===id);
  } burn(t,n){
    if(!this.replay&&t?.hp>0&&n>0){
      t.burn=Math.min(5,(t.burn||0)+n);
      t.burnTurns=2;
    }
  } wet(t){
    if(!this.replay&&t?.hp>0)t.wet=2;
  } mark(t){
    if(!this.replay&&t?.hp>0)t.windMark=this.current?.uid;
  }  control(t,kind,origin=true){
    if(this.replay||!t||t.hp<=0||t.controlledAt>=this.s.round-1)return false;
    const boss=t.typeId.startsWith('boss');
    if(kind==='push'&&(boss||t.position>=6))return false;
    if(kind==='slow'&&boss&&(ENEMIES[t.typeId]?.move||1)<=1)return false;
    t.controlledAt=this.s.round;
    if(kind==='push')t.position=Math.min(6,t.position+1);
    else t.slow=true;
    if(kind==='push'&&origin&&this.currentDef?.element==='wind'&&this.has('D05')&&this.once('D05',2))this.burn(t,2);
    this.frame('status',kind==='push'?'击退':'缓行',{
      targetId:t.uid
    });
    return true;
  }  damage(t,n,element,opts={
  }){
    if(!t||t.hp<=0||n<=0)return {
      killed:false,amount:0,overflow:0
    };
    let amount=Math.max(0,Math.round(n));
    if(!opts.ignoreArmor&&!opts.burn&&t.typeId==='shield'&&!this.firstShield.has(t.uid)){
      this.firstShield.add(t.uid);
      amount=Math.round(amount/2);
    }const before=t.hp;
    const absorbed=Math.min(t.shield||0,amount);
    t.shield=(t.shield||0)-absorbed;
    t.hp=Math.max(0,t.hp-(amount-absorbed));
    this.s.stats.damage+=Math.min(before,amount-absorbed)+absorbed;
    const killed=t.hp===0;
    if(killed){
      this.s.stats.kills++;
      this.s.resources.draft+=10;
      if(t.typeId.startsWith('boss')&&!this.s.defeatedBosses.includes(t.typeId)){
        this.s.defeatedBosses.push(t.typeId);
        this.s.stats.bossKills++;
        this.s.hp=Math.min(this.s.maxHp,this.s.hp+(this.s.traits.repair||0)*3);
      }
    }this.frame(opts.type||'shot',`${opts.label||this.currentDef?.name||'攻击'}：${amount} ${ELEMENTS[element]?.name||element}伤害${killed?'，击杀':''}`,{
      slot:this.slot>=0?this.slot:undefined,targetId:t.uid,element,amount
    });
    return {
      killed,amount,overflow:Math.max(0,amount-absorbed-before)
    };
  }  hit(t,base,conditional=0,opts={
  }){
    if(!t||t.hp<=0)return {
      killed:false,amount:0,overflow:0
    };
    const d=this.currentDef;
    const snap={
      ...t,playerShield:this.s.shield
    };
    const first=this.nativeCount===0;
    let bonus=this.replay?0:this.bonds.multiplier(d,snap,opts);
    if(!this.replay){
      bonus+=this.buffs[this.slot]?.scroll||0;
      if(first&&(this.current.temp?.loadedLurk||this.current.typeId==='F13'||this.current.mark==='M02'))bonus+=.2;
    }let value=this.replay?Math.floor(base*this.replayScale*(this.has('S11')?1.25:1)):Math.round(base*(1+Math.min(1,bonus))+conditional*(1+Math.min(1,this.bonds.multiplier(d,snap,opts))));
    const out=this.damage(t,value,d.element,{
      ...opts,label:this.replay?`${d.name}回响`:d.name
    });
    if(this.replay)return out;
    this.nativeCount++;
    this.hitTargets.push(t.uid);
    if(first){
      this.hits.set(this.slot,d.element);
      this.firstHit(t,snap);
      if(!this.resonant.has(this.current.uid))this.bonds.hit(t,snap,d);
    }if(out.killed&&this.contains('R18')&&this.once('R18'))this.resource('remove',3);
    return out;
  }  firstHit(t,snap){
    const b=this.current,d=this.currentDef,slot=this.s.slots[this.slot],buff=this.buffs[this.slot];
    if(snap.windMark&&snap.windMark!==b.uid){
      delete t.windMark;
      this.derived(t,3,'wind');
      if(buff.W19)this.derived(t,6,'wind');
    }for(const [source,v]of Object.entries(buff)){
      if(source==='scroll'||source==='pierce'||source==='jump'||source==='L14'||source==='W19')continue;
      if(source==='F19'&&!snap.burn)continue;
      if(source==='L19'){
        if(snap.wet)this.derived(this.near(t,2)[0],4,'lightning');
        continue;
      }if(v?.amount)this.derived(t,v.amount,v.element,{
        ignoreArmor:source==='F19'
      });
      if(v?.burn)this.burn(t,v.burn);
      if(source==='H14'&&this.once('H14.control',2))this.control(t,'slow');
    }const mark=b.temp?.loadedMark===undefined?b.mark:b.temp.loadedMark;
    if(mark==='M03')this.burn(t,1);
    if(mark==='M04')this.wet(t);
    if(slot.engraving==='G01')this.derived(t,4,'fire');
    if(slot.engraving==='G02')this.resource('refresh',1);
    if(slot.engraving==='G03'&&d.trigger==='timer'){
      this.derived(t,slot.charge||0,'lightning');
      slot.charge=0;
    }if(slot.engraving==='G04'&&this.hits.has(this.slot-1)&&this.hits.get(this.slot-1)!==d.element)this.derived(t,4,'wind');
    if(slot.engraving==='G05'&&slot.recycleRound===this.s.round&&d.trigger==='shot'){
      this.derived(t,4,'earth');
      slot.recycleRound=0;
    }this.bonds.evolutionHit(t,snap,d,buff);
  }  derived(t,n,e,opts={
  }){
    if(this.replay)return {
      killed:false,amount:0,overflow:0
    };
    return this.damage(t,n,e,opts);
  }  removeShield(t,n){
    if(this.replay||!t)return 0;
    const removed=Math.min(t.shield||0,n);
    t.shield-=removed;
    return removed;
  }  consumeBurn(t,n){
    if(this.replay||!t)return 0;
    const used=Math.min(t.burn||0,n);
    t.burn-=used;
    return used;
  }  advance(i,resonant=false){
    if(this.replay||this.extra.has(this.current?.uid))return false;
    const b=this.layout[i];
    if(!b||i<=this.slot||BULLET_MAP[b.typeId].trigger!=='timer'||b.counter<=0||this.extra.has(b.uid))return false;
    b.counter--;
    this.extra.add(b.uid);
    if(resonant)this.resonant.add(b.uid);
    this.frame('status','计时额外推进',{
      slot:i
    });
    return true;
  }  summon(kind,life,variant=null){
    if(this.replay)return null;
    const same=this.s.summons.filter(s=>s.kind===kind);
    const pool=same.length>=2?same:this.s.summons.length>=4?this.s.summons:[];
    if(pool.length){
      const victim=[...pool].sort((a,b)=>a.life-b.life||a.created-b.created)[0];
      this.s.summons=this.s.summons.filter(x=>x!==victim);
    }const uid=this.s.nextUid++;
    const unit={
      uid:`s${uid}`,kind,life,created:uid,sourceId:this.current?.typeId||'C08',variant
    };
    this.s.summons.push(unit);
    this.spawnCount++;
    this.frame('summon',`召唤${kind==='spring'?'泉灵':kind==='guard'?'岩卫':'礁炮'}`);
    return unit;
  }  command(s){
    if(this.replay||!s||!this.s.summons.includes(s)||this.commands.has(s.uid))return;
    this.commands.add(s.uid);
    this.summonAction(s,false);
  }  summonAction(s,normal){
    const target=this.sorted(this.alive().filter(e=>s.kind==='spring'?!e.wet:!!e.wet),false)[0]||this.sorted(this.alive(),false)[0];
    if(s.kind==='guard'){
      this.shield(3);
      if(normal&&s.variant==='banner')this.derived(this.target(),6,'fire');
    }else if(target){
      this.derived(target,s.kind==='spring'?Math.round(6*(normal&&this.has('S05')?1.25:1)):12,s.kind==='spring'?'water':'earth',{
        type:'summon',label:s.kind==='spring'?'泉灵':'礁炮'
      });
      if(s.kind==='spring')this.wet(target);
      else if(target.wet)this.derived(target,4,'water');
      if(s.variant==='scatter'&&!this.variantUsed.has(s.uid)){
        this.variantUsed.add(s.uid);
        this.derived(this.near(target,1)[0],6,'earth');
      }
    }if(s.variant==='mist'&&!this.variantUsed.has(s.uid)){
      this.variantUsed.add(s.uid);
      this.shield(2);
    }if(normal)this.bonds.summonAction(s,target);
  }  counter(source,n=1){
    if(this.replay)return;
    for(let i=0;
    i<n;
    i++){
      if(this.issuedCounters>=2&&!(source==='R11'&&this.stage('E08',9)&&this.issuedCounters<3))break;
      this.counterPool.push(source);
      this.issuedCounters++;
    }
  }  echo(source,scale,pool='wind',limit=3){
    if(this.replay||!source||!this.target())return false;
    const key=`echo.${pool}.${source.uid}`;
    if(this.counters[key]||!this.once(`echo.${pool}`,limit))return false;
    this.counters[key]=1;
    const old={
      current:this.current,currentDef:this.currentDef,slot:this.slot,nativeCount:this.nativeCount,hitTargets:this.hitTargets
    };
    this.replay=true;
    this.replayScale=scale;
    this.current=source;
    this.currentDef=BULLET_MAP[source.typeId];
    effects[source.typeId](this);
    this.replay=false;
    Object.assign(this,old);
    return true;
  }  source(predicate=()=>true,pool='wind'){
    return [...this.history].reverse().find(b=>predicate(b)&&!this.counters[`echo.${pool}.${b.uid}`]);
  }  execute(){
    for(const b of this.layout)if(b&&BULLET_MAP[b.typeId].trigger==='timer')b.counter=Math.max(0,b.counter-1);
    this.waiting=this.layout.filter(b=>b&&BULLET_MAP[b.typeId].trigger==='timer'&&b.counter>0);
    setupDirections(this);
    for(let i=0;
    i<12;
    i++){
      const b=this.layout[i];
      if(b&&scrollEffects[b.typeId]){
        this.slot=i;
        this.current=b;
        this.currentDef=BULLET_MAP[b.typeId];
        scrollEffects[b.typeId](this);
        this.used.add(b.uid);
        this.frame('status',`${this.currentDef.name}已使用`,{
          slot:i
        });
      }
    }this.slot=-1;
    for(let i=0;
    i<12;
    i++){
      this.slot=i;
      const b=this.layout[i];
      if(!b){
        this.bonds.empty();
        continue;
      }if(this.used.has(b.uid))continue;
      this.current=b;
      const d=this.currentDef=BULLET_MAP[b.typeId];
      const mark=b.temp?.loadedMark===undefined?b.mark:b.temp.loadedMark;
      if(mark==='M05')this.shield(2);
      if(d.trigger==='timer'&&b.counter>0){
        if(this.s.slots[i].engraving==='G03')this.s.slots[i].charge=Math.min(6,(this.s.slots[i].charge||0)+2);
        if(b.typeId==='L11'&&this.stage('E04')&&this.once('E04.wait',2))this.shield(2);
        continue;
      }this.nativeCount=0;
      this.spawnCount=0;
      this.hitTargets=[];
      effects[b.typeId](this);
      if(this.nativeCount||this.spawnCount){
        if(d.trigger==='timer'){
          b.counter=b.typeId==='L11'&&this.stage('E04',5)?2:d.counter;
          this.success.push(b);
          this.bonds.timer(b);
          if(this.buffs[i].L14){
            const t=this.target(),r=this.derived(t,18,'lightning');
            if(this.stage('E05')&&this.once('E05.shield',3))this.shield(1);
            if(r.killed&&this.stage('E05',5)&&this.once('E05.kill',2))this.derived(this.near(t,2)[0],6,'lightning');
          }
        }this.bonds.complete(b);
        if(d.trigger==='shot'&&this.nativeCount)this.history.push(b);
      }
    }this.slot=-1;
    for(const e of this.s.enemies)delete e.windMark;
    if(this.has('S13'))this.shield(4);
    if(this.has('A02'))this.shield(6);
    this.current=null;
    this.currentDef=null;
    this.bonds.prepareSummons();
    const order={
      spring:0,cannon:1,guard:2
    };
    for(const s of [...this.s.summons].sort((a,b)=>order[a.kind]-order[b.kind]||a.created-b.created))this.summonAction(s,true);
    if(this.has('T09')&&this.s.summons.length)this.resource('remove',1);
    for(const s of this.s.summons)s.life--;
    for(const s of this.s.summons.filter(s=>s.life<=0))this.bonds.expire(s);
    this.s.summons=this.s.summons.filter(s=>s.life>0);
    for(const e of this.alive())if(e.burn>0&&e.burnTurns>0){
      this.damage(e,Math.round(e.burn*2*(this.has('S02')?1.25:1)),'fire',{
        burn:true,label:'燃烧',type:'status'
      });
      e.burnTurns--;
      if(!e.burnTurns)e.burn=0;
    }this.enemyPhase();
    this.bonds.commit();
    for(let i=0;
    i<12;
    i++){
      const slot=this.s.slots[i];
      if(slot.recycleRound<=this.s.round)slot.recycleRound=0;
      if(this.used.has(this.s.magazine[i])){
        if(slot.engraving==='G05')slot.recycleRound=this.s.round+1;
        this.s.magazine[i]=null;
      }
    }this.s.inventory=this.s.inventory.filter(b=>!this.used.has(b.uid));
    this.s.enemies=this.alive();
    this.s.stats.turns++;
    return {
      state:this.s,frames:this.frames,summary:`本回合造成 ${this.s.stats.damage-this.startDamage} 伤害；场上剩余 ${this.s.enemies.length} 名敌人。`
    };
  }  enemyPhase(){
    const boosted=new Set();
    for(const e of this.alive()){
      if(this.s.hp<=0)break;
      if(e.hp<=0)continue;
      const def=ENEMIES[e.typeId];
      const allies=()=>this.sorted(this.alive().filter(x=>x!==e&&!x.typeId.startsWith('boss')),false);
      if(e.typeId==='boss1'){
        const a=allies()[0];
        if(a)a.shield=Math.max(a.shield,6);
      }if(e.position>def.range){
        e.position=Math.max(0,e.position-Math.max(e.typeId.startsWith('boss')?1:0,def.move-(e.slow?1:0)));
        this.frame('enemy',`${def.name}移动`,{
          targetId:e.uid
        });
      }else if(e.typeId==='healer'){
        const a=allies()[0];
        if(a){
          a.hp=Math.min(a.maxHp,a.hp+(e.heal ?? (e.maxHp<=30?6:e.maxHp<=48?9:12)));
          this.frame('enemy',`${def.name}治疗友军`,{
            targetId:a.uid
          });
        }
      }else{
        e.attackCount++;
        if(e.typeId==='boss2'&&e.attackCount%2===0&&allies().length){
          for(const a of allies().slice(0,2))a.boost=2;
          this.frame('enemy','雷鸣祭司强化友军');
        }else{
          const damage=(e.typeId==='boss3'&&e.hp<=e.maxHp/2?14:def.damage)+(e.boost||0);
          e.boost=0;
          const absorbed=Math.min(this.s.shield,damage);
          this.s.shield-=absorbed;
          this.s.hp=Math.max(0,this.s.hp-(damage-absorbed));
          this.frame('enemy',`${def.name}攻击 ${damage}`,{
            targetId:e.uid,amount:damage
          });
          if(this.s.hp<=0)break;
          this.bonds.attacked(e,absorbed);
          if(this.counterPool.length){
            const source=this.counterPool.shift();
            this.bonds.counter(e,source);
          }if(e.typeId==='bomber')e.hp=0;
          if(this.s.traits.emergency&&!this.s.emergencyUsed&&this.s.hp<30){
            this.s.emergencyUsed=true;
            this.shield(10);
          }
        }
      }if(e.typeId==='drummer'){
        const a=allies().find(a=>!boosted.has(a.uid));
        if(a){
          a.position=Math.max(0,a.position-1);
          boosted.add(a.uid);
        }
      }
    }for(const e of this.alive()){
      e.wet=Math.max(0,(e.wet||0)-1);
      e.slow=false;
    }
  }
} export function resolveRound(run){
  return new Combat(run).execute();
}
