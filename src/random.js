// All gameplay randomness advances this serializable PRNG, never Math.random().
export function random(state) {
  let x=(Number(state.rng)>>>0)||0x6d2b79f5;
  x^=x<<13; x^=x>>>17; x^=x<<5;
  state.rng=x>>>0;
  return state.rng/4294967296;
}
export function shuffle(state,array) {
  const out=[...array];
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(random(state)*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
export function sample(state,array,count,weightFn=()=>1) {
  const pool=[...array],out=[];
  while(pool.length&&out.length<count){
    const weights=pool.map(x=>Math.max(0,Number(weightFn(x))||0));
    const total=weights.reduce((a,b)=>a+b,0);
    let index;
    if(!total) index=Math.floor(random(state)*pool.length);
    else {
      let n=random(state)*total;
      index=weights.length-1;
      for(let i=0;i<weights.length;i++){n-=weights[i];if(n<0){index=i;break;}}
    }
    out.push(pool.splice(index,1)[0]);
  }
  return out;
}
