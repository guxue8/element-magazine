import {BULLET_MAP} from './catalog.js';
import {random} from './random.js';

export const ELEMENT_KEYS=Object.freeze(['fire','water','lightning','wind','earth']);
export const validElementBan=value=>value===null||ELEMENT_KEYS.includes(value);
export const allowedElements=run=>ELEMENT_KEYS.filter(element=>element!==run?.bannedElement);
export const elementAllowed=(run,element)=>element!==run?.bannedElement;
export const bulletAllowed=(run,bullet)=>Boolean(bullet)&&elementAllowed(run,bullet.element);
export const enchantmentAllowed=(run,enchantment)=>Boolean(enchantment)&&elementAllowed(run,enchantment.element);
export function bondAllowed(run,bond){
  return Boolean(bond)&&!(bond.requirements?.[run?.bannedElement]>0)&&
    (!bond.targetId||bulletAllowed(run,BULLET_MAP[bond.targetId]));
}
// A separate seeded stream keeps opening/closing the choice from rerolling the run.
export function rollElementBan(seed=Date.now()){
  const offer={rng:(Number(seed)>>>0)^0xa341316c};
  random(offer);random(offer);
  return ELEMENT_KEYS[Math.floor(random(offer)*ELEMENT_KEYS.length)];
}
