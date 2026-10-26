export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const chargeSegments=(value,cost,count=3)=>Array.from({length:count},(_,i)=>Math.max(0,Math.min(1,(value-i*cost)/cost)));
function hash(text){let n=2166136261;for(const c of text){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}n^=n>>>16;n=Math.imul(n,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return (n>>>0)/4294967296;}
// One side-view ground line. Stable horizontal offset allows overlap without reflow.
export function enemyPoint(enemy){
  const x=24+Math.max(0,Math.min(6,enemy.position))*10.8+(hash(enemy.uid+'x')-.5)*4;
  const y=78;
  return {x:Math.min(94,Math.max(24,x)),y:Math.min(85,Math.max(16,y))};
}
