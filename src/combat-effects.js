import {
  BULLET_MAP
} from './catalog.js';
import {imprintSpell} from './spell-imprints.js';
const mainHit=(c,t,n,cond=0)=>{
  if(!t)return {
    killed:false,amount:0,overflow:0
  };
  const back=!c.replay?c.back(t,c.buffs[c.slot]?.pierce||0):[];
  const result=c.hit(t,n,cond);
  for(const x of back)c.hit(x,n);
  return result;
};
const single=(c,n,cond=0)=>mainHit(c,c.target(),n,cond);
const area=(c,n,side,radius,max)=>{
  const t=c.target();
  if(!t)return[];
  const ts=[t,...c.near(t,radius,max)];
  ts.forEach((x,i)=>i?c.hit(x,side):mainHit(c,x,n));
  return ts;
};
const explosion=(c,n,side,radius,after=()=>{})=>{
  const t=c.target();
  const origin=t?.position;
  return c.blast(t,radius,(x,i)=>{c.hit(x,i?splash(side,x.position,origin):n);after(x,i);});
};
// The outer ring still hits every enemy, but density should not turn one spell
// into equally strong attacks across the entire front. Lock the origin first.
const splash=(damage,position,origin)=>Math.abs(position-origin)>1?Math.ceil(damage/2):damage;
const pierce=(c,n,side,max,opts={
})=>{
  const t=c.target();
  if(!t)return[];
  const extra=c.replay?0:c.buffs[c.slot]?.pierce||0;
  const ts=[t,...c.back(t,Math.min(2,max-1+extra))];
  ts.forEach((x,i)=>c.hit(x,i?side:n,0,opts));
  return ts;
};
const chain=(c,n,side,jumps,radius,bridge=false)=>{
  let t=c.target();
  if(!t)return[];
  const seen=[t];
  mainHit(c,t,n);
  for(let i=0;
  i<jumps;
  i++){
    const next=c.near(t,(bridge&&t.wet?4:radius)+(c.replay?0:c.buffs[c.slot]?.jump||0),99,x=>!seen.includes(x))[0];
    if(!next)break;
    seen.push(next);
    c.hit(next,side,0,{
      jump:true
    });
    t=next;
  }return seen;
};
const shot=(c,n,cond=0)=>{
  const t=c.target();
  if(!t)return null;
  const snap={
    ...t
  };
  const out=mainHit(c,t,n,typeof cond==='function'?cond(snap):cond);
  return {
    t,snap,...out
  };
};
const command=(c,kind)=>c.command([...c.s.summons].sort((a,b)=>(a.kind==='cannon'?-1:b.kind==='cannon'?1:0)||a.created-b.created).find(s=>(kind==='rock'?s.kind!=='spring':s.kind===kind)&&!c.commands.has(s.uid)));
const mark=(c,t)=>c.mark(t);
const echo=(c,scale,id,predicate=()=>true)=>{
  if(!c.replay&&(c.counters[id]||0)<1){
    if(c.echo(c.source(predicate),scale))c.once(id);
  }
};
export const effects={
  F01:c=>{
    const a=shot(c,8);
    if(a)c.burn(a.t,1);
  },  F02:c=>{
    const a=shot(c,6);
    if(a?.killed)c.burn(c.near(a.t,1)[0],2);
  },  F03:c=>{
    const t=c.target(),other=t&&c.near(t,1)[0];
    shot(c,7);
    c.burn(t,1);
    c.burn(other,1);
  },  F04:c=>{
    const a=shot(c,9);
    if(a?.snap.burn)c.burn(c.near(a.t,1)[0],Math.min(2,a.snap.burn));
  },  F05:c=>{
    const a=shot(c,6);
    if(a)c.burn(a.t,2);
  },  F06:c=>explosion(c,24,12,2,(t,i)=>c.burn(t,i?1:3)),  F07:c=>{
    const a=shot(c,10);
    if(a&&!c.replay){
      const n=Math.min(5,a.snap.burn||0);
      c.derived(a.t,Math.round(n*2*(c.has('S02')?1.25:1)),'fire',{
        burn:true
      });
      for(const t of c.near(a.t,2,2))c.derived(t,2*n,'fire');
    }
  },  F08:c=>explosion(c,6,2,1),  F09:c=>{
    c.removeShield(c.target(),4);
    shot(c,14);
  },  F10:c=>{
    const a=shot(c,9);
    if(a?.killed)c.blast(a.t,1,t=>c.derived(t,6,'fire'),{includeCenter:false,secondary:true});
  },  F11:c=>{
    const t=c.target();
    if(!t)return;
    if(!c.replay&&c.stage('E02',5)&&!t.burn&&c.near(t,1,1,e=>e.burn>0).length&&c.once('E02.borrow'))c.burn(t,1);
    const n=c.replay?0:Math.min(t.burn||0,2);
    shot(c,8,8*n);
    c.consumeBurn(t,n);
    if(n&&c.stage('E02')&&c.once('E02.shield',3))c.shield(1);
    if(n===2){
      if(c.stage('E02',2)&&c.once('E02.refill',2))c.burn(t,1);
      if(c.stage('E02',9)&&c.once('E02.splash'))for(const x of c.near(t,1,2))c.derived(x,6,'fire');
    }
  },  F12:c=>explosion(c,32,12,1),  F13:c=>{
    const t=c.target();if(!t)return;
    const n=c.replay?0:t.burn,origin=t.position;
    c.blast(t,2,(x,i)=>{c.hit(x,i?splash(20,x.position,origin):80,i?0:8*n);if(!i)c.consumeBurn(t,n);});
  },  F14:c=>{
    const center=c.sorted().sort((a,b)=>(b.burn||0)-(a.burn||0))[0];
    const origin=center?.position;
    c.blast(center,3,(t,i)=>{const n=c.replay?0:Math.min(t.burn||0,3);c.hit(t,i?splash(30,t.position,origin):60,6*n);c.consumeBurn(t,n);});
  },  F15:c=>shot(c,16),F16:c=>shot(c,7),  F17:c=>{
    const a=shot(c,9);
    if(a?.snap.burn)c.advance(c.slot+4);
  },  F18:c=>shot(c,6),F19:()=>{
  },  F20:c=>{
    const a=shot(c,60);
    if(a&&!c.replay)for(let j=c.slot+4;
    j<12;
    j+=4)if(BULLET_MAP[c.layout[j]?.typeId]?.trigger==='shot')c.buffs[j].F20={
      amount:18,element:'fire'
    };
  },F21:()=>{
  },  H01:c=>c.summon('spring',2),  H02:c=>{
    const a=shot(c,10);
    if(a&&c.s.summons.some(s=>s.kind==='spring'))c.wet(a.t);
  },  H03:c=>{const spirit=c.summon('spring',3);c.command(spirit);},H04:c=>{
    shot(c,6);
    command(c,'spring');
  },H05:c=>{const spirit=c.summon('spring',2,'mist');c.command(spirit);},  H06:c=>{
    c.summon('spring',3);
    c.summon('cannon',3);
    explosion(c,24,12,1);
  },  H07:c=>{
    explosion(c,36,12,2);
    const a=c.summon('spring',3),b=c.summon('spring',3);
    c.command(a);
    c.command(b);
  },  H08:c=>{
    const a=shot(c,9);
    if(a)c.control(a.t,'slow');
  },  H09:c=>shot(c,8,t=>t.slow&&t.controlledAt===c.s.round?6:0),  H10:c=>{
    const a=shot(c,7);
    if(a&&a.t.hp>0&&!c.control(a.t,'slow')&&a.t.controlledAt>=c.s.round-1){
      const t=c.back(a.t,99).find(t=>t.controlledAt<c.s.round-1);
      c.control(t,'slow');
    }
  },  H11:c=>area(c,7,5,1,1).forEach(t=>c.control(t,'slow')),  H12:c=>{
    const a=shot(c,8);
    if(a?.snap.wet&&!c.replay){
      a.t.wet=0;
      if(a.t.hp>0&&!c.control(a.t,'slow'))c.derived(a.t,8,'water');
    }
  },  H13:c=>explosion(c,30,15,2,t=>c.control(t,'slow')),H14:()=>{
  },H15:c=>shot(c,16),  H16:c=>{
    if(!c.replay&&c.once('H16'))c.resource('refresh',2);
    const a=shot(c,8);
    if(a)c.wet(a.t);
  },  H17:c=>{
    const full=c.resources.refresh>=2;
    shot(c,8,full?8:0);
    if(!full)c.resource('refresh',1);
  },  H18:c=>{
    const a=shot(c,10,t=>t.wet?6:0);
    if(a?.killed)c.resource('refresh',1);
    if(a?.snap.wet&&!c.replay){
      if(c.stage('E03')&&c.once('E03.heal',2))c.heal(1);
      if(c.stage('E03',2)&&c.once('E03.spread',2))c.wet(c.near(a.t,1,1,t=>!t.wet)[0]);
      if(c.stage('E03',5)&&c.once('E03.summon'))c.summon('spring',2);
      if(a.killed&&c.stage('E03',9)&&c.once('E03.kill')){
        const t=c.sorted(c.alive().filter(t=>t!==a.t))[0];
        c.derived(t,6,'water');
        c.wet(t);
      }
    }
  },  H19:()=>{
  },  H20:c=>{
    const t=c.target();
    if(!t)return;
    const back=c.back(t,2);
    const a=c.hit(t,36);
    for(const x of back)c.hit(x,18);
    if(a.killed)c.resource('refresh',2);
  },  H21:c=>{
    const n=c.resources.refresh;
    shot(c,60);
    for(let i=0;
    i<n;
    i++)c.derived(c.target(),24,'water');
  },  L01:c=>chain(c,6,5,2,2),L02:c=>shot(c,14,t=>c.near(t,2).length?0:8),L03:c=>chain(c,7,3,3,2),L04:c=>chain(c,6,4,2,2,true),  L05:c=>{
    const ts=chain(c,8,6,1,2);
    if(ts.length===2&&ts[0].hp>0)c.hit(ts[0],6,0,{
      jump:true
    });
  },L06:c=>chain(c,60,24,4,3),  L07:c=>{
    const t=c.target();
    if(!t)return;
    const seen=[t];
    c.hit(t,10);
    for(let k=0;
    k<2;
    k++){
      let from=t;
      for(let j=0;
      j<2;
      j++){
        const x=c.near(from,2+(c.replay?0:c.buffs[c.slot]?.jump||0),99,e=>!seen.includes(e))[0];
        if(!x)break;
        seen.push(x);
        c.hit(x,5,0,{
          jump:true
        });
        from=x;
      }
    }
  },  L08:c=>shot(c,48),  L09:c=>{
    const a=shot(c,12);
    if(a&&c.waiting.some(b=>b.uid!==c.current.uid&&BULLET_MAP[b.typeId].element==='lightning')&&!c.replay&&c.once('L09',3))c.shield(1);
  },  L10:c=>{
    const a=shot(c,7);
    if(a?.killed)c.advance(c.right(c.slot));
  },  L11:c=>{
    const a=shot(c,104);
    if(a&&!c.replay){
      if(a.killed&&c.stage('E04',2)&&c.once('E04.kill'))c.derived(c.target(),12,'lightning');
      if(!a.killed&&c.stage('E04',9)&&c.once('E04.shield'))c.shield(4);
    }
  },  L12:c=>{
    if(!c.replay){
      const n=Math.min(6-(c.counters['L12.shield']||0),c.waiting.length*2);
      c.counters['L12.shield']=(c.counters['L12.shield']||0)+n;
      c.shield(n);
    }
  },  L13:c=>{
    const a=shot(c,168,Math.min(2,c.success.length)*24);
    if(a?.killed&&a.overflow>0)c.blast(a.t,1,t=>c.derived(t,Math.min(36,a.overflow),'lightning'),{includeCenter:false,secondary:true});
  },L14:()=>{
  },L15:c=>shot(c,16),L16:c=>shot(c,7),  L17:c=>{
    const a=shot(c,10);
    if(a&&c.layout.some((b,i)=>b&&i%4===c.slot%4&&BULLET_MAP[b.typeId].trigger==='passive'))c.control(a.t,'slow');
  },L18:()=>{
  },L19:c=>shot(c,8),  L20:c=>{
    single(c,60);
    const n=Math.min(3,new Set(c.layout.map((b,i)=>b&&BULLET_MAP[b.typeId].trigger==='passive'?i%4:null).filter(x=>x!==null)).size);
    for(let i=0;
    i<n;
    i++)single(c,20);
  },  L21:c=>pierce(c,108,54,3,{
    ignoreArmor:!c.replay&&c.layout.some((b,i)=>b&&i%4===c.slot%4&&BULLET_MAP[b.typeId].trigger==='passive')
  }),  W01:c=>{
    single(c,6);
    single(c,6);
  },W02:c=>{
    shot(c,9);
    echo(c,.25,'W02.echo');
  },  W03:c=>{
    const a=c.target();
    single(c,4);
    const b=c.target();
    single(c,4,a===b?5:0);
    if(a&&a===b&&!c.replay){
      if(c.stage('E06',2)&&c.once('E06.third',2))c.derived(c.target(),3,'wind');
      if(c.stage('E06',5))c.echo(c.source(()=>true,'E06'),.4,'E06',c.stage('E06',9)?2:1);
    }
  },  W04:c=>{
    shot(c,6);
    const uid=c.layout[c.left(c.slot)]?.uid;
    echo(c,.5,'W04.echo',x=>x.uid===uid);
  },  W05:c=>{
    const a=single(c,5);
    single(c,5,a.killed?8:0);
  },  W06:c=>{
    for(let i=0;
    i<6;
    i++)single(c,18);
  },  W07:c=>{
    const a=shot(c,30);
    if(a&&!c.replay&&c.once('W07.echo')){
      const s=c.source();
      const next=s&&c.source(x=>c.history.indexOf(x)<c.history.indexOf(s)&&BULLET_MAP[x.typeId].element!==BULLET_MAP[s.typeId].element);
      if(next)c.echo(next,.6);
      if(s)c.echo(s,.6);
    }
  },  W08:c=>pierce(c,6,6,3),W09:c=>{
    const a=shot(c,7);
    if(a&&a.snap.position<=2)c.control(a.t,'push');
  },  W10:c=>{
    const t=c.target();
    if(!t)return;
    const main=[t,...(!c.replay?c.back(t,c.buffs[c.slot]?.pierce||0):[])];
    const side=c.sorted(c.alive().filter(x=>!main.includes(x)&&Math.abs(x.position-t.position)<=1))[0];
    main.forEach(x=>c.hit(x,10));
    if(side)c.hit(side,6);
  },  W11:c=>{
    const a=shot(c,10);
    if(a)c.control(a.t,'push');
  },  W12:c=>{
    const a=shot(c,8);
    if(a?.t.hp>0&&!c.replay){
      if(c.control(a.t,'push'))c.derived(a.t,4,'wind');
      else if(c.once('W12.shield',2))c.shield(2);
    }
  },  W13:c=>pierce(c,36,36,3).forEach(t=>c.control(t,'push')),W14:()=>{
  },  W15:c=>{
    const a=shot(c,9);
    if(a)mark(c,a.t);
  },W16:c=>shot(c,7),  W17:c=>{
    const t=c.target(),other=t&&c.near(t,1)[0];
    shot(c,6);
    mark(c,t);
    mark(c,other);
  },W18:()=>{
  },W19:c=>{
    const a=shot(c,7);
    if(a)mark(c,a.t);
  },  W20:c=>{
    const t=c.target(),ts=t?[t,...c.sorted(c.alive().filter(x=>x!==t)).slice(0,2)]:[];
    shot(c,24);
    ts.forEach(t=>mark(c,t));
  },  W21:c=>{
    const a=shot(c,12);
    if(a?.snap.windMark&&!c.replay){
      const ts=c.sorted(c.alive().filter(t=>t!==a.t&&t.windMark)).slice(0,2);
      if(ts.length&&c.once('W21.chase'))for(const t of ts){
        delete t.windMark;
        c.derived(t,12,'wind');
      }
    }
  },  R01:c=>c.summon('guard',2),R02:c=>{
    c.removeShield(c.target(),6);
    shot(c,12);
  },R03:c=>c.summon('cannon',2),R04:c=>{
    shot(c,6);
    command(c,'rock');
  },R05:c=>c.summon('cannon',2,'scatter'),  R06:c=>{
    explosion(c,48,12,1);
    c.summon('guard',3);
    c.summon('cannon',3);
  },  R07:c=>{
    explosion(c,48,18,2);
    const a=c.summon('guard',3),b=c.summon('cannon',3);
    c.command(b);
    c.command(a);
  },  R08:c=>{
    if(shot(c,10)&&!c.replay&&c.once('R08.shield',4))c.shield(1);
  },  R09:c=>{
    if(!c.replay&&!c.s.shield&&c.once('R09.shield'))c.shield(3);
    shot(c,8);
  },  R10:c=>{
    const n=!c.replay&&c.target()?Math.min(4,c.s.shield):0;
    if(!c.replay)c.s.shield-=n;
    shot(c,8,n*3);
  },  R11:c=>{
    if(shot(c,8))c.counter('R11');
  },R12:()=>{
  },  R13:c=>{
    if(shot(c,60)){
      c.shield(12);
      c.counter('R13',2);
    }
  },R14:c=>c.shield(3),R15:c=>shot(c,16),  R16:c=>{
    const a=shot(c,8,t=>t.hp===t.maxHp?8:0);
    if(a?.killed)c.resource('remove',1);
  },  R17:c=>{
    const a=shot(c,9);
    if(a?.snap.hp===a?.snap.maxHp&&a)c.resource('remove',1);
  },R18:()=>{
  },  R19:c=>shot(c,10,3*Math.min(2,c.adjacent(c.slot).filter(i=>!c.layout[i]).length)),  R20:c=>{
    const n=c.removeShield(c.target(),12);
    shot(c,36);
    c.resource('remove',Math.floor(n/4));
  },  R21:c=>{
    const a=shot(c,150);
    if(a?.killed)c.resource('remove',3);
    if(a)for(let i=0;
    i<Math.min(3,c.layout.filter(b=>!b).length);
    i++)c.derived(c.target(),24,'earth');
  }
};
export function setupDirections(c){
  const put=(i,key,value,filter=()=>true)=>{
    if(i<0||i>=12)return;
    const b=c.layout[i];
    if(b&&BULLET_MAP[b.typeId].trigger!=='consumable'&&filter(BULLET_MAP[b.typeId]))c.buffs[i][key]=value;
  };
  for(let i=0;
  i<12;
  i++){
    const b=c.layout[i];
    if(!b)continue;
    const row=Array.from({
      length:4
    },(_,j)=>Math.floor(i/4)*4+j).filter(j=>j!==i),col=[i%4,i%4+4,i%4+8].filter(j=>j!==i),ud=[i-4,i+4],all=c.adjacent(i);
    const attack=(js,key,n,e,extra={
    },filter=()=>true)=>js.forEach(j=>put(j,key,{
      amount:n,element:e,...extra
    },filter));
    switch(b.typeId){
      case'F16':attack([c.right(i),...(c.stage('E01',2)?[i+4]:[])],'F16',5,'fire');
      break;
      case'F18':attack(row,'F18',3,'fire',{
      },d=>d.rarity===0&&d.trigger==='shot');
      break;
      case'F19':attack(ud,'F19',8,'fire');
      break;
      case'F21':attack(all,'F21',3,'fire',{
        burn:1
      });
      break;
      case'H14':attack(all,'H14',3,'water');
      break;
      case'L14':for(const j of c.stage('E05',9)?[...row,...col]:[...ud,...(c.stage('E05',2)?[c.left(i)]:[])])put(j,'L14',true,d=>d.trigger==='timer');
      break;
      case'L16':attack([c.right(i)],'L16',5,'lightning');
      break;
      case'L18':attack(col,'L18',4,'lightning');
      for(const j of col)put(j,'jump',1);
      break;
      case'L19':attack(row,'L19',0,'lightning',{
      },d=>d.trigger==='shot');
      break;
      case'W14':attack(row,'W14',2,'wind',{
      },d=>d.trigger==='shot');
      for(const j of row)put(j,'pierce',1,d=>d.trigger==='shot');
      break;
      case'W16':attack([c.right(i),i+4],'W16',3,'wind');
      break;
      case'W18':attack(ud,'W18',5,'wind');
      break;
      case'W19':put(c.right(i),'W19',true,d=>d.element!=='wind'&&d.trigger==='shot');
      break;
      case'R14':attack([i-4],'R14',6,'earth');
      break;
    }
  }
} export const scrollEffects={
  C01:c=>{
    const i=c.left(c.slot),b=c.layout[i];
    if(imprintSpell(b,'ember'))c.frame('status','左邻魔法获得永久火印：基础伤害 +20%',{slot:i});
  },  C02:c=>{
    const ts=c.sorted().filter(t=>t.burn).sort((a,b)=>b.burn-a.burn).slice(0,2);
    for(const t of ts){
      const n=c.consumeBurn(t,3);
      c.derived(t,4*n,'fire');
    }
  },  C03:c=>{
    for(const t of c.sorted(c.alive(),false).slice(0,3)){
      c.wet(t);
      c.control(t,'slow',false);
    }
  },C04:c=>{
    c.heal(8);
    c.resource('refresh',2);
  },C05:c=>c.advance(c.right(c.slot)),  C06:c=>{
    for(const i of [c.slot-4,c.slot+4]){
      const b=c.layout[i];
      if(imprintSpell(b,'magnet'))c.frame('status','相邻魔法获得永久磁引',{slot:i});
    }
  },  C07:c=>{
    const b=c.layout[c.left(c.slot)];
    if(imprintSpell(b,'lurk'))c.frame('status','左邻魔法获得永久潜伏',{slot:c.left(c.slot)});
  },C08:c=>{
    c.summon('guard',2);
    c.summon('cannon',2);
  }
};
