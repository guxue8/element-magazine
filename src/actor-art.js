// One source of identity for the title screen, portrait, battlefield and summons.
const ATLAS=new URL('../assets/pixel/spellwarden-atlas-v4.png',import.meta.url).href;
const RECTS={
 hero:[12,116,267,463],cast:[285,106,391,474],spring:[680,214,245,375],
 guard:[925,209,318,371],cannon:[12,812,331,308],
 waterDragon:[311,628,324,506],earthAvatar:[617,608,362,526],eruption:[960,688,280,441],
};
export const ACTOR_IDS=Object.freeze(Object.keys(RECTS));
export function actorArt(type='hero',extra=''){
 const key=Object.hasOwn(RECTS,type)?type:'hero';
 const [x,y,w,h]=RECTS[key],size=Math.max(w,h);
 return `<span class="actor-art actor-${key} ${extra}" data-actor="${key}" aria-hidden="true" style="--actor-image:url('${ATLAS}');--actor-bg-size:${1254/w*100}% ${1254/h*100}%;--actor-bg-position:${x/(1254-w)*100}% ${y/(1254-h)*100}%;--actor-w:${w/size*100}%;--actor-h:${h/size*100}%"></span>`;
}
export function wardenArt(){return `<span class="warden-poses">${actorArt('hero','warden-idle')}${actorArt('cast','warden-release')}</span>`;}
