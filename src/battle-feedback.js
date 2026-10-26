import {enemyPoint,escapeHTML} from './view-utils.js';
import {ELEMENTS} from './catalog.js';
export function battleFeedback(frame,speed=1){
 if(!frame?.target||!Number.isFinite(frame.hpDamage))return '';
 const {x}=enemyPoint(frame.target),element=ELEMENTS[frame.element]?frame.element:'earth';
 const travel=frame.type==='shot'&&!frame.secondary;
 const burst=Array.from({length:frame.killed?10:6},(_,i)=>{
   const angle=i*Math.PI*2/(frame.killed?10:6),radius=frame.killed?46:27;
   return `<i style="--dx:${Math.round(Math.cos(angle)*radius)}px;--dy:${Math.round(Math.sin(angle)*radius)}px;--spin:${i*47}deg"></i>`;
 }).join('');
 return `<div class="combat-fx fx-${element}${frame.killed?' fx-kill':''}${travel?'':' fx-instant'}" style="--impact-x:${x}%;--fx-color:${ELEMENTS[element].color};--fx-duration:${420/speed}ms" aria-hidden="true">${travel?'<span class="muzzle-flash"></span><span class="rune-projectile"><i></i></span>':''}<span class="impact-flare"></span><span class="impact-ring"></span><span class="impact-particles">${burst}</span><span class="combat-number">${frame.hpDamage>0?frame.hpDamage:'格挡'}${frame.absorbed?`<small>盾 −${frame.absorbed}</small>`:''}${frame.killed?'<b>击破</b>':''}</span><span class="impact-rune">${escapeHTML({fire:'✦',water:'◇',lightning:'ϟ',wind:'≋',earth:'◆'}[element])}</span></div>`;
}
