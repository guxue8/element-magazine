import {enemyPoint} from './view-utils.js';
import {ELEMENTS} from './catalog.js';
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
export function battleFeedback(frame,speed=1){
 if(!frame?.target||!Number.isFinite(frame.hpDamage))return '';
 const {x}=enemyPoint(frame.target),element=ELEMENTS[frame.element]?frame.element:'earth';
 const travel=frame.type==='shot'&&!frame.secondary;
 return `<div class="combat-fx fx-${element}${frame.killed?' fx-kill':''}${travel?'':' fx-instant'}" style="--impact-x:${x}%;--fx-color:${PALETTES[element][0]};--fx-duration:${(frame.duration||420)/speed}ms" aria-hidden="true">${travel?`<span class="muzzle-flash">${svg(rect(13,6,5,20,PALETTES[element][0])+rect(6,13,20,5,PALETTES[element][1]))}</span><span class="rune-projectile">${bolt(element)}</span>`:''}<span class="impact-flare">${burst(element)}</span><span class="impact-particles">${particles(element,frame.killed)}</span><span class="combat-number">${frame.hpDamage>0?frame.hpDamage:'格挡'}${frame.absorbed?`<small>盾 −${frame.absorbed}</small>`:''}${frame.killed?'<b>击破</b>':''}</span></div>`;
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
