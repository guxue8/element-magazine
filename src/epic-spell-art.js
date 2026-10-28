import {actorArt} from './actor-art.js';
// Spell silhouettes are composed on a fine pixel grid; delivery describes
// how magic arrives, independently of the underlying damage calculation.
const p=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const r=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const svg=(art,view='0 0 96 96')=>`<svg viewBox="${view}" shape-rendering="crispEdges" aria-hidden="true">${art}</svg>`;
const FORMS={
 F06:'eruption',F07:'eruption',F12:'meteor',F13:'meteor',F14:'eruption',F20:'meteor',
 H06:'tide',H07:'dragon',H13:'tide',H20:'tide',H21:'dragon',
 R06:'meteor',R07:'avatar',R13:'avatar',R20:'eruption',R21:'avatar',
 W06:'vortex',W07:'vortex',W13:'vortex',W20:'vortex',W21:'vortex',
};
export function spellDelivery(sourceId,element,tier){
 if(!sourceId)return 'bolt';
 return FORMS[sourceId]||(element==='lightning'?'thunder':tier>=3&&element==='earth'?'eruption':'bolt');
}
export function thunderArt(powerful=false){
 const trunk='M 47 0 H 57 V 12 H 52 V 27 H 44 V 36 H 53 V 43 H 47 V 55 H 42 V 68 H 36 V 82 H 31 V 96 H 27 V 76 H 33 V 61 H 38 V 46 H 30 V 39 H 36 V 27 H 42 V 12 H 47 Z';
 const core='M 49 0 H 53 V 12 H 48 V 28 H 40 V 39 H 48 V 43 H 43 V 55 H 38 V 68 H 33 V 82 H 30 V 94 H 29 V 77 H 35 V 62 H 40 V 44 H 34 V 40 H 40 V 28 H 46 V 12 H 49 Z';
 const branches=p('M 43 28 H 35 V 23 H 25 V 15 H 18 V 7 H 14 V 18 H 21 V 27 H 31 V 32 H 42 Z M 46 43 H 56 V 50 H 65 V 62 H 73 V 76 H 78 V 88 H 82 V 72 H 77 V 59 H 69 V 47 H 60 V 39 H 49 Z M 36 62 H 24 V 68 H 15 V 77 H 7 V 81 H 3 V 87 H 14 V 82 H 19 V 74 H 29 V 69 H 36 Z','#ac8ce3');
 return svg(`<g class="thunder-branches">${powerful?branches:''}</g>${p(trunk,'#b58eea')}${p(core,'#f6edff')}${r(29,84,7,10,'#fffacd')}`);
}
export function meteorArt(element){
 const rock=element==='earth';
 return svg(p('M 0 2 H 7 V 9 H 16 V 17 H 25 V 25 H 34 V 35 H 43 V 44 H 52 V 50 H 58 V 62 H 52 V 70 H 42 V 69 H 33 V 63 H 29 V 53 H 20 V 43 H 14 V 32 H 8 V 20 H 3 V 10 H 0 Z',rock?'#8b725c':'#9b4234')+
 p('M 5 8 H 9 V 16 H 19 V 24 H 28 V 35 H 36 V 42 H 43 V 50 H 49 V 57 H 46 V 62 H 37 V 58 H 31 V 47 H 23 V 40 H 18 V 30 H 11 V 23 H 8 V 15 H 5 Z',rock?'#c7ab79':'#f28b45')+
 p('M 11 19 H 17 V 26 H 24 V 35 H 31 V 43 H 38 V 50 H 40 V 56 H 34 V 50 H 27 V 41 H 20 V 32 H 15 V 24 H 11 Z','#ffe1a0')+
 p('M 39 48 H 52 V 53 H 58 V 65 H 51 V 72 H 39 V 68 H 33 V 57 H 39 Z',rock?'#524c43':'#742d2d')+
 p('M 40 51 H 50 V 55 H 54 V 62 H 49 V 67 H 41 V 64 H 37 V 57 H 40 Z',rock?'#d3c6a0':'#ffbd6a')+r(41,53,7,5,'#fff1be'),'0 0 64 80');
}
export function tideArt(){
 return svg(p('M 0 75 H 9 V 65 H 20 V 55 H 32 V 40 H 45 V 25 H 57 V 15 H 71 V 12 H 84 V 20 H 92 V 31 H 87 V 41 H 78 V 44 H 75 V 37 H 80 V 31 H 74 V 25 H 65 V 30 H 59 V 45 H 66 V 58 H 77 V 66 H 88 V 72 H 96 V 87 H 0 Z','#226688')+p('M 3 72 H 13 V 61 H 27 V 48 H 39 V 34 H 49 V 23 H 61 V 16 H 74 V 16 H 83 V 23 H 88 V 31 H 83 V 38 H 78 V 37 H 82 V 31 H 74 V 24 H 62 V 29 H 54 V 44 H 58 V 57 H 70 V 70 H 88 V 78 H 3 Z','#46aec3')+p('M 12 62 H 29 V 48 H 42 V 33 H 52 V 23 H 63 V 18 H 74 V 18 H 83 V 25 H 85 V 31 H 82 V 33 H 80 V 29 H 74 V 24 H 61 V 30 H 54 V 45 H 44 V 53 H 33 V 64 H 23 V 69 H 12 Z','#bdffff')+r(23,77,19,3,'#7bdae3')+r(49,81,24,3,'#b7f9f0')+r(8,48,5,3,'#85e8ee')+r(57,3,5,5,'#a6ffff'));
}
export function vortexArt(){
 const bands=['M 16 8 H 75 V 11 H 89 V 16 H 93 V 24 H 86 V 30 H 69 V 32 H 25 V 29 H 13 V 24 H 10 V 17 H 16 Z','M 20 37 H 78 V 40 H 87 V 47 H 80 V 55 H 61 V 58 H 30 V 55 H 18 V 49 H 15 V 43 H 20 Z','M 30 65 H 67 V 67 H 74 V 73 H 64 V 79 H 48 V 84 H 40 V 91 H 36 V 84 H 43 V 76 H 31 V 73 Z'];
 return svg(bands.map((d,i)=>`<g class="vortex-band vortex-band-${i}">${p(d,['#25585d','#3c8c84','#88ceac'][i])}${r(24+i*5,17+i*27,46-i*10,3,['#aaf4d0','#e8ffe3','#d3ffe1'][i])}</g>`).join('')+r(5,34,5,3,'#99ddbd')+r(86,64,6,2,'#b0f1c9'));
}
export function eruptionArt(element){
 const fire=element==='fire',dark=fire?'#8a3a35':'#5b5149',light=fire?'#ffb75a':'#c4b184';
 return svg(p('M 10 88 V 68 H 16 V 48 H 22 V 64 H 30 V 30 H 38 V 47 H 44 V 7 H 49 V 24 H 55 V 42 H 62 V 19 H 67 V 55 H 74 V 43 H 80 V 69 H 86 V 61 H 91 V 88 Z',dark)+p('M 20 88 V 71 H 29 V 59 H 36 V 72 H 43 V 47 H 48 V 28 H 52 V 53 H 57 V 70 H 65 V 57 H 70 V 76 H 79 V 88 Z',light)+p('M 36 88 V 77 H 43 V 69 H 48 V 50 H 52 V 72 H 61 V 81 H 68 V 88 Z','#fff0b3')+r(24,19,4,8,light)+r(71,6,3,7,light));
}
export function deliveryArt(profile){
 if(!profile.cast||profile.delivery==='bolt')return '';
 const art=profile.delivery==='thunder'?thunderArt(profile.tier>=2):profile.delivery==='dragon'?`<span class="dragon-wake">${tideArt()}</span>${actorArt('waterDragon')}`:profile.delivery==='avatar'?actorArt('earthAvatar'):profile.delivery==='meteor'?meteorArt(profile.element):profile.delivery==='tide'?tideArt():profile.delivery==='vortex'?vortexArt():profile.element==='fire'?actorArt('eruption'):eruptionArt(profile.element);
 return `<span class="spell-omen omen-${profile.delivery}"></span><span class="spell-delivery delivery-${profile.delivery}">${art}</span>`;
}
export function detonationArt(element,withPlume=true){
 const fire=element==='fire',water=element==='water',earth=element==='earth';
 const colors=fire?['#743f39','#d35c3e','#ffb75d','#fff5cb']:water?['#28638a','#3cadd1','#9eeef6','#edffff']:earth?['#5d554c','#9a8061','#d8bf8e','#fff1c8']:['#454b76','#9c8bc8','#d3c7f5','#fff5df'];
 const cloud=p('M 18 22 H 31 V 13 H 47 V 17 H 59 V 9 H 73 V 20 H 84 V 31 H 94 V 47 H 86 V 60 H 77 V 69 H 64 V 76 H 47 V 70 H 32 V 76 H 20 V 64 H 9 V 51 H 3 V 37 H 13 V 28 H 18 Z',colors[0])+p('M 21 28 H 34 V 21 H 46 V 26 H 61 V 18 H 70 V 28 H 79 V 36 H 86 V 47 H 78 V 58 H 66 V 65 H 48 V 60 H 34 V 66 H 25 V 57 H 15 V 49 H 11 V 40 H 21 Z',colors[1]);
 const core=p('M 32 30 H 44 V 23 H 56 V 31 H 69 V 38 H 76 V 48 H 67 V 55 H 57 V 62 H 43 V 57 H 29 V 51 H 24 V 41 H 32 Z',colors[2])+p('M 39 34 H 53 V 38 H 64 V 48 H 55 V 54 H 42 V 50 H 33 V 41 H 39 Z',colors[3]);
 const smoke=p('M 9 32 H 21 V 26 H 34 V 33 H 44 V 42 H 40 V 54 H 29 V 59 H 17 V 53 H 6 V 42 Z M 58 26 H 71 V 20 H 84 V 28 H 94 V 41 H 88 V 54 H 76 V 60 H 64 V 53 H 54 V 40 Z',colors[0]);
 return `${fire&&withPlume?`<span class="detonation-plume">${actorArt('eruption')}</span>`:''}${svg(`<g class="detonation-smoke">${smoke}</g><g class="detonation-shell">${cloud}</g><g class="detonation-core">${core}</g>`)}`;
}
export function shockwaveArt(color){
 return svg(p('M 19 3 H 77 V 5 H 89 V 9 H 96 V 14 H 96 V 20 H 89 V 25 H 77 V 29 H 19 V 29 H 7 V 25 H 0 V 20 H 0 V 14 H 7 V 9 H 19 V 3 M 20 6 V 11 H 9 V 15 H 4 V 19 H 9 V 23 H 20 V 26 H 76 V 26 H 87 V 23 H 92 V 19 H 92 V 15 H 87 V 11 H 76 V 6 Z',color),'0 0 96 32');
}
