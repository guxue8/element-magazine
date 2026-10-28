import {enemyPoint} from './view-utils.js';
import {ELEMENTS,BULLET_MAP} from './catalog.js';
const PALETTES={
 fire:['#ffd780','#fff3c0','#ed793c','#a83d30'],water:['#80d6ef','#e0ffff','#379fc4','#28608e'],
 lightning:['#e2b1ff','#fff4c9','#a36ae0','#644199'],wind:['#a8ecc5','#eaffd9','#54b39b','#326d77'],earth:['#deb684','#fff0c2','#ad7953','#694c42'],
};
const rect=(x,y,w,h,color)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
const path=(d,color)=>`<path d="${d}" fill="${color}"/>`;
const svg=(content,view='0 0 32 32')=>`<svg viewBox="${view}" shape-rendering="crispEdges" aria-hidden="true">${content}</svg>`;

// Integer-grid silhouettes keep projectiles, trails and impacts in the same pixel language.
function bolt(element){
 const [c,hi,shade,dark]=PALETTES[element];
 const tail=rect(0,7,5,2,dark)+rect(5,6,6,4,shade)+rect(11,5,7,6,c);
 const shapes={
  fire:tail+path('M 16 3 H 24 V 5 H 28 V 7 H 31 V 10 H 27 V 12 H 20 V 10 H 16 Z',shade)+rect(20,5,7,5,c)+rect(23,6,5,3,hi),
  water:rect(1,8,5,2,shade)+rect(7,6,7,4,c)+path('M 14 6 H 18 V 4 H 25 V 6 H 29 V 11 H 25 V 13 H 18 V 11 H 14 Z',shade)+rect(18,6,8,5,c)+rect(21,6,5,2,hi),
  lightning:path('M 0 6 H 12 V 3 H 21 V 6 H 31 V 9 H 19 V 12 H 10 V 9 H 0 Z',shade)+path('M 3 7 H 14 V 5 H 19 V 7 H 29 V 8 H 17 V 10 H 12 V 8 H 3 Z',hi),
  wind:rect(1,6,8,2,shade)+rect(5,11,8,2,c)+path('M 15 2 H 25 V 4 H 29 V 6 H 31 V 10 H 27 V 12 H 23 V 14 H 15 V 12 H 21 V 10 H 25 V 6 H 21 V 4 H 15 Z',c)+rect(25,6,3,4,hi),
  earth:rect(2,8,4,3,dark)+rect(8,5,4,3,shade)+path('M 17 3 H 25 V 5 H 29 V 12 H 25 V 14 H 17 V 12 H 14 V 6 H 17 Z',dark)+rect(17,5,9,7,shade)+rect(18,5,6,4,c)+rect(19,5,4,2,hi),
 };
 return svg(shapes[element],'0 0 32 16');
}
function burst(element){
 const [c,hi,shade,dark]=PALETTES[element];
 const core=rect(13,7,6,18,hi)+rect(7,13,18,6,hi)+rect(10,10,12,12,c)+rect(13,13,6,6,hi);
 const wide=path('M 12 3 H 20 V 7 H 25 V 11 H 29 V 21 H 24 V 26 H 18 V 29 H 10 V 25 H 5 V 20 H 2 V 12 H 7 V 7 H 12 Z',shade)+path('M 12 7 H 20 V 11 H 25 V 19 H 21 V 24 H 11 V 21 H 7 V 12 H 12 Z',c)+rect(12,12,9,8,hi);
 const shapes={
  fire:wide+rect(8,2,3,5,c)+rect(24,5,3,4,hi)+rect(3,22,3,3,dark),
  water:path('M 14 4 H 18 V 12 H 22 V 9 H 26 V 5 H 29 V 11 H 26 V 15 H 22 V 24 H 19 V 28 H 13 V 24 H 10 V 16 H 6 V 11 H 3 V 6 H 7 V 10 H 11 V 13 H 14 Z',c)+rect(14,14,5,9,hi)+rect(4,21,4,3,shade)+rect(24,23,4,4,shade),
  lightning:path('M 17 1 H 22 V 7 H 18 V 12 H 23 V 17 H 18 V 23 H 14 V 31 H 10 V 21 H 14 V 15 H 9 V 10 H 14 V 5 H 17 Z',c)+rect(14,12,5,8,hi)+rect(3,7,3,6,shade)+rect(6,11,5,3,hi)+rect(23,20,6,3,hi)+rect(26,23,3,6,shade),
  wind:path('M 7 5 H 23 V 8 H 28 V 14 H 25 V 18 H 21 V 21 H 7 V 18 H 19 V 15 H 23 V 11 H 19 V 8 H 7 Z',c)+path('M 3 14 H 7 V 23 H 12 V 26 H 25 V 29 H 10 V 26 H 3 Z',shade)+rect(8,11,9,2,hi)+rect(12,23,7,2,hi),
  earth:rect(10,8,12,16,dark)+path('M 13 4 H 21 V 8 H 25 V 20 H 21 V 24 H 10 V 20 H 7 V 10 H 13 Z',shade)+rect(11,9,8,9,c)+rect(12,9,6,3,hi)+rect(2,20,5,6,c)+rect(25,8,5,5,c)+rect(23,26,6,3,dark),
 };
 return svg(`<g class="burst-core">${core}</g><g class="burst-bloom">${shapes[element]}</g>`);
}
function particles(element,killed){
 const [c,hi,shade]=PALETTES[element],count=killed?12:8;
 return Array.from({length:count},(_,i)=>{
  const a=i*Math.PI*2/count,r=killed?54:34;
  return `<i style="--dx:${Math.round(Math.cos(a)*r/4)*4}px;--dy:${Math.round(Math.sin(a)*r/4)*4}px;--spark:${[c,hi,shade][i%3]};--particle-size:${i%3===0?6:4}px"></i>`;
 }).join('');
}
export function spellProfile(frame){
 const def=BULLET_MAP[frame?.sourceId];
 const cast=Boolean(frame&&!frame.secondary&&(['shot','explosion','summon'].includes(frame.type)));
 const tier=Math.max(0,Math.min(4,def?.rarity??0));
 return {cast,tier,element:frame?.element||def?.element||'earth',ritual:cast&&(tier>=3||def?.trigger==='timer'),resonance:Boolean(frame?.sourceBond||frame?.empowered)};
}
export function mageSprite(){
 return `<svg class="mage-sprite" viewBox="0 0 48 64" shape-rendering="crispEdges" aria-hidden="true"><g class="mage-cloak">${path('M 16 28 H 29 V 36 H 32 V 46 H 35 V 58 H 9 V 52 H 12 V 40 H 16 Z','#202e48')+path('M 18 32 H 25 V 45 H 28 V 57 H 14 V 51 H 16 V 40 H 18 Z','#48617a')+rect(18,33,3,20,'#8293a2')+rect(9,57,11,4,'#152235')+rect(25,57,10,4,'#152235')}</g><g class="mage-head">${path('M 17 13 H 28 V 17 H 31 V 29 H 27 V 33 H 18 V 29 H 14 V 19 H 17 Z','#172638')+rect(19,22,9,8,'#d9b58b')+rect(23,24,7,2,'#fff0c7')+path('M 22 3 H 26 V 9 H 29 V 16 H 34 V 20 H 10 V 17 H 16 V 11 H 20 V 7 H 22 Z','#526e87')+rect(17,16,15,3,'#a5bbc0')}</g><g class="mage-casting-arm">${rect(25,33,7,7,'#657d93')+rect(30,35,7,5,'#d9b58b')+rect(38,22,3,34,'#75654e')+rect(38,24,1,30,'#b59f70')+path('M 36 14 H 43 V 18 H 45 V 24 H 42 V 28 H 37 V 24 H 34 V 18 H 36 Z','#668792')+rect(37,16,5,7,'#b3e6df')+rect(38,17,2,4,'#efffe0')}</g></svg>`;
}
function sigil(element){
 const [c,hi,shade]=PALETTES[element];
 return svg(path('M 12 2 H 20 V 6 H 26 V 12 H 30 V 20 H 26 V 26 H 20 V 30 H 12 V 26 H 6 V 20 H 2 V 12 H 6 V 6 H 12 V 2 M 13 5 V 8 H 8 V 13 H 5 V 19 H 8 V 24 H 13 V 27 H 19 V 24 H 24 V 19 H 27 V 13 H 24 V 8 H 19 V 5 Z',shade)+rect(14,9,4,14,c)+rect(9,14,14,4,c)+rect(14,14,4,4,hi));
}
function castingArt(profile){
 if(!profile.cast)return '';
 return `<span class="casting-seal">${sigil(profile.element)}</span>${profile.ritual?`<span class="ritual-column">${svg(rect(8,0,3,32,PALETTES[profile.element][2])+rect(14,6,4,26,PALETTES[profile.element][0])+rect(23,0,2,32,PALETTES[profile.element][1]))}</span>`:''}`;
}
function grandSpell(element){
 const [c,hi,shade]=PALETTES[element];
 const art={
  lightning:path('M 16 0 H 22 V 8 H 18 V 14 H 23 V 18 H 17 V 25 H 12 V 32 H 8 V 23 H 12 V 16 H 8 V 12 H 13 V 5 H 16 Z',c)+rect(14,14,3,12,hi)+rect(3,7,3,6,shade)+rect(25,12,3,8,shade),
  earth:path('M 3 32 V 20 H 5 V 15 H 9 V 20 H 11 V 32 M 12 32 V 13 H 14 V 5 H 18 V 13 H 20 V 32 M 23 32 V 23 H 25 V 17 H 28 V 23 H 30 V 32',shade)+rect(14,15,3,17,c)+rect(5,22,2,10,hi)+rect(25,24,2,8,c),
  water:path('M 0 27 H 5 V 22 H 10 V 16 H 15 V 10 H 21 V 6 H 28 V 10 H 24 V 15 H 22 V 22 H 27 V 26 H 32 V 32 H 0 Z',shade)+path('M 2 25 H 8 V 20 H 14 V 15 H 19 V 10 H 25 V 12 H 22 V 17 H 17 V 22 H 12 V 27 H 2 Z',c)+rect(19,10,5,2,hi),
  wind:path('M 4 2 H 21 V 5 H 27 V 9 H 30 V 14 H 26 V 18 H 20 V 21 H 7 V 18 H 18 V 15 H 24 V 11 H 20 V 7 H 4 Z',c)+path('M 2 13 H 6 V 23 H 12 V 27 H 29 V 30 H 10 V 27 H 5 V 23 H 2 Z',shade)+rect(12,12,8,2,hi),
  fire:path('M 5 32 V 22 H 9 V 13 H 13 V 19 H 17 V 3 H 21 V 12 H 24 V 23 H 28 V 17 H 31 V 32 Z',shade)+path('M 10 32 V 25 H 14 V 22 H 17 V 17 H 21 V 25 H 25 V 32 Z',c)+rect(16,26,6,6,hi),
 };
 return `<span class="grand-spell grand-${element}">${svg(art[element])}</span>`;
}
export function spellVictims(frame){return frame?.blast?.victims||(frame?.target&&Number.isFinite(frame.hpDamage)?[frame]:[]);}
function explosionFeedback(frame,speed){
 const p=spellProfile(frame),blast=frame.blast,center=blast.center,element=p.element;
 const x=enemyPoint(center).x,radius=blast.radius*10.8;
 const numbers=blast.victims.map((v,i)=>`<span class="combat-number blast-number" style="left:${enemyPoint(v.target).x}%;--number-row:${i%3}">${v.hpDamage||'格挡'}</span>`).join('');
 return `<div class="combat-fx fx-${element} spell-tier-${p.tier} fx-explosion${p.resonance?' fx-resonance':''}${frame.secondary?' fx-instant':''}" style="--impact-x:${x}%;--blast-width:${2*radius}%;--fx-color:${PALETTES[element][0]};--fx-duration:${(frame.duration||640)/speed}ms" aria-hidden="true">${castingArt(p)}${p.tier>=3?grandSpell(element):''}${p.cast?`<span class="rune-projectile">${bolt(element)}</span>`:''}${p.resonance?`<span class="greater-impact">${sigil(element)}</span>`:''}<span class="blast-footprint"></span><span class="blast-wave">${burst(element)}</span><span class="impact-flare">${burst(element)}</span><span class="impact-particles">${particles(element,true)}</span>${numbers}</div>`;
}
export function battleFeedback(frame,speed=1){
 if(frame?.blast)return explosionFeedback(frame,speed);
 if(frame?.type==='summon'&&!Number.isFinite(frame.hpDamage)){const p=spellProfile(frame);return `<div class="combat-fx spell-tier-${p.tier} fx-summoning" style="--fx-color:${PALETTES[p.element][0]};--fx-duration:${(frame.duration||420)/speed}ms" aria-hidden="true">${castingArt(p)}<span class="summoning-seal">${sigil(p.element)}</span></div>`;}
 if(!frame?.target||!Number.isFinite(frame.hpDamage))return '';
 const {x}=enemyPoint(frame.target),element=ELEMENTS[frame.element]?frame.element:'earth';
 const travel=frame.type==='shot'&&!frame.secondary;
 const p=spellProfile(frame);
 return `<div class="combat-fx fx-${element} spell-tier-${p.tier}${p.resonance?' fx-resonance':''}${p.ritual?' fx-ritual':''}${frame.killed?' fx-kill':''}${travel?'':' fx-instant'}" style="--impact-x:${x}%;--fx-color:${PALETTES[element][0]};--fx-duration:${(frame.duration||420)/speed}ms" aria-hidden="true">${castingArt(p)}${p.ritual?grandSpell(element):''}${travel?`<span class="muzzle-flash">${sigil(element)}</span><span class="rune-projectile">${bolt(element)}</span>`:''}${p.ritual||p.resonance?`<span class="greater-impact">${sigil(element)}</span>`:''}<span class="impact-flare">${burst(element)}</span><span class="impact-particles">${particles(element,frame.killed)}</span><span class="combat-number">${frame.hpDamage>0?frame.hpDamage:'格挡'}${frame.absorbed?`<small>盾 −${frame.absorbed}</small>`:''}${frame.killed?'<b>击破</b>':''}</span></div>`;
}

export function enemyActionFeedback(frame){
 if(frame?.type!=='enemy'||!frame.actor||!['melee','ranged','explode','heal','buff'].includes(frame.action))return '';
 const actorX=enemyPoint(frame.actor).x,action=frame.action;
 const color=action==='heal'?'#a5edb0':action==='buff'?'#dbbdff':'#f6b49b';
 const hit=svg(path('M 13 3 H 19 V 11 H 27 V 17 H 20 V 26 H 13 V 20 H 5 V 13 H 13 Z','#b74b44')+rect(13,11,7,9,'#fff0c5'));
 let art='';
 if(action==='heal'||action==='buff'){
  const ids=frame.affectedIds?.length?frame.affectedIds:[frame.targetId||frame.actor.uid];
  for(const uid of ids){const e=frame.board.enemies.find(e=>e.uid===uid);if(!e)continue;
   const symbol=action==='heal'?rect(13,7,6,18,color)+rect(7,13,18,6,color):path('M 5 17 H 10 V 12 H 14 V 7 H 18 V 12 H 22 V 17 H 27 V 22 H 21 V 18 H 11 V 22 H 5 Z',color);
   art+=`<span class="support-spark" style="--support-x:${enemyPoint(e).x}%">${svg(symbol+rect(4,4,3,3,'#fff2d0')+rect(25,25,3,3,'#fff2d0'))}</span>`;
  }
 }else{
  const missile=frame.actor.typeId==='spear'?svg(rect(2,7,24,2,'#dfc19b')+path('M 0 7 H 3 V 4 H 8 V 7 H 12 V 9 H 7 V 12 H 3 V 9 H 0 Z','#eff3d5'),'0 0 32 16'):bolt(frame.actor.typeId==='boss2'?'lightning':'fire');
  art+=(action==='ranged'?`<span class="hostile-projectile${frame.actor.typeId==='spear'?'':' hostile-spell'}">${missile}</span>`:`<span class="melee-slash">${action==='explode'?burst('fire'):hit}</span>`);
  art+=`<span class="hostile-impact">${hit}</span><span class="hostile-damage">${frame.playerDamage>0?'−'+frame.playerDamage:'格挡'}${frame.absorbed?`<small>盾 −${frame.absorbed}</small>`:''}</span>`;
 }
 return `<div class="enemy-action-fx action-${action}" style="--actor-x:${actorX}%;--fx-duration:${frame.duration||480}ms" aria-hidden="true">${art}</div>`;
}
