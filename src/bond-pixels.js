// Original 32 × 32 fantasy emblems, assembled from hand-drawn pixel silhouettes.
// Every recipe represents a mechanism; elemental gems are additional information.
import {BOND_MAP} from './catalog.js';

const palettes={
  fire:['#76382d','#d75d32','#ffac4a','#fff0a7'],
  water:['#28507a','#478dc0','#7bd7e5','#ddffff'],
  lightning:['#54407e','#9271d5','#e1bcff','#fff6c6'],
  wind:['#28635c','#58a886','#a6e1bc','#efffd4'],
  earth:['#5f4540','#a77b51','#e5bc7a','#fff0bf']
};
const neutral=['#394658','#65748a','#afbdc9','#edf4ed'];
const gold='#f7d788',ink='#101827';
// A slash separates pixel rows. Dots stay transparent, including holes in rings.
const silhouettes={
  torch:'......xx....../.....xxx....../....xxxxx..../...xxxxxxx.../...xxxxxxx.../....xxxxx..../.....xxx...../...xxxxxxx.../....xxxxx..../.....xxx...../.....xxx...../.....xxx...../.....xxx...../....xxxxx....',
  ember:'..xx......xx../...xx....xx.../....xxxxxx..../.....xxxx...../.xx..xxxx..xx./..xxxxxxxxxx../....xxxxxx..../...xxxxxxxx.../..xxx....xxx../.xxx......xxx./xxxx......xxxx/...xxxxxxxx.../....xxxxxx....',
  sword:'..........xxx./.........xxxx./........xxxx../.......xxxx.../......xxxx..../.....xxxx...../....xxxx....../xx.xxxx......./xxxxxx......../.xxxx........./..xxxx......../.xx..xx......./xx....xx......',
  chalice:'.....xx......./....xxxx....../.....xx......./............../xx..........xx/xxx........xxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../.....xxxx...../......xx....../......xx....../...xxxxxxxx.../..xxxxxxxxxx..',
  spirit:'.....xxxx...../...xxxxxxxx.../..xxxxxxxxxx../.xxxxxxxxxxxx./.xxx..xx..xxx./.xxx..xx..xxx./.xxxxxxxxxxxx./.xxxxx..xxxxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../..xxxx..xxxx../.xxx......xxx./xx..........xx',
  fountain:'......xx....../.....xxxx...../....xxxxxx..../...xxx..xxx.../..xxx.xx.xxx../.xxx..xx..xxx./xx....xx....xx/......xx....../..xxxxxxxxxx../...xxxxxxxx.../.....xxxx...../......xx....../...xxxxxxxx.../..xxxxxxxxxx..',
  bolt:'.......xxxxx../......xxxxx.../.....xxxxx..../....xxxxx...../...xxxxx....../..xxxxxxxxxxx./......xxxxxx../.....xxxxxx.../....xxxxxx..../...xxxxxx...../..xxxxx......./..xxxx......../..xxx........./..xx..........',
  hourglass:'.xxxxxxxxxxxx./.xxxxxxxxxxxx./..xx......xx../...xx....xx.../....xx..xx..../.....xxxx...../......xx....../......xx....../.....xxxx...../....xxxxxx..../...xxxxxxxx.../..xxxxxxxxxx../.xxxxxxxxxxxx./.xxxxxxxxxxxx.',
  chain:'..xxxx......../.xxxxxx......./xx....xx....../xx....xx..xx../.xx..xx..xxx../..xxxx..xxxxx./...xx..xxx.xx./..xxx.xxx..xx./.xxxxx.xx.xxx./.xx.xxx.xxxx../.xx..xxx.xx.../.xxx..xxx...../..xxxxxx....../...xxxx.......',
  feather:'........xxxx../......xxxxxxx./.....xxxxxxxx./....xxxxxxxx../...xxxxxxxx.../..xxxxxxxxx.../.xxxxxxxxx..../.xx.xxxxx...../.xxxxx.xx...../..xxxxx......./...xx........./..xx........../.xx.........../xx............',
  echo:'....xxxxxx..../..xxx....xxx../.xx........xx./xx....xx....xx/xx...x..x...xx/xx..xx..xx..xx/.xx.xx..xx.xx./..xxx....xxx../...xx....xx.../....xx..xx..../.....xxxx...../......xx....../..xxxxxxxxxx../...xxxxxxxx...',
  bow:'..........xx../........xxxx../......xxxx.xx./....xxxx...xx./..xxxx.....xx./xxxx.......xx./xx.........xx./.xx..xxxxxxxxx/..xx...xxxx.../...xx..xx...../....xxxx....../.....xx......./....xx......../...xx.........',
  stone:'.....xxxxx..../...xxxxxxxxx../..xxxxxxxxxxx./.xxxxxxxxxxxxx/.xxxxxxx.xxxxx/xxxxxxx..xxxxx/xxxxx...xxxxxx/xxxxxx.xxxxxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../.....xxxx.....',
  tower:'xxx..xxxx..xxx/xxx..xxxx..xxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/..xxxxxxxxxx../..xx..xx..xx../..xx..xx..xx../..xxxxxxxxxx../..xxxxxxxxxx../..xxx....xxx../..xxx....xxx../..xxx....xxx../.xxxxxxxxxxxx./xxxxxxxxxxxxxx',
  recycle:'.....xxxx...../...xxxxxxx..../..xxx..xxxxx../.xxx....xxxx../xx.......xxx../xx......xxxxx./xx............/..........xxxx/xxx........xxx/xxxx......xxx./xxxxx....xxx../..xxxxxxxxx.../...xxxxxxx..../.....xxxx.....',
  engine:'......xxxx..../...xx.xxxx.xx./..xxxxxxxxxxx./...xxx....xxx./..xxx.xxxx.xxx/.xxx.xxxxxx.xx/.xxx.xx..xx.xx/..xxx.xxxx.xxx/...xxx....xxx./..xxxxxxxxxxx./...xx.xxxx.xx./......xxxx..../..xxxxxxxxxx../...xxxxxxxx...',
  wave:'...xxxx......./..xxxxxxx...../.xxx..xxxx..../xxx....xxxx.../xx......xxx.../........xxx.xx/.......xxxxxxx/...xxxxxxx.xxx/..xxxxxxx...xx/.xxxxx......../xxxx......xx../xx......xxxxx./..xxxxxxxxxxx./...xxxxxxxxx..',
  volcano:'.....xxxx...../....xxxxxx..../.....xxxx...../...xx....xx.../..xxx....xxx../..xxxx..xxxx../.xxxxx..xxxxx./.xxxx....xxxx./xxxxxx..xxxxxx/xxxxxx..xxxxxx/xxxxxxx.xxxxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx..',
  net:'xx....xx....xx/xxxx..xx..xxxx/xx.xxxxxxxx.xx/....xxxxxx..../...xx.xx.xx.../..xx..xx..xx../xxxx..xx..xxxx/xx....xx....xx/xxxx..xx..xxxx/..xx..xx..xx../...xx.xx.xx.../....xxxxxx..../xx.xxxxxxxx.xx/xxxx..xx..xxxx',
  mirror:'...xxxxxxxx.../..xxxxxxxxxx../.xxx......xxx./xxx..x.....xxx/xx..xx......xx/xx.xxx......xx/xx.xx.......xx/xx..........xx/xxx........xxx/.xxx......xxx./..xxxxxxxxxx../...xxxxxxxx.../.....xxxx...../...xxxxxxxx...',
  arrow:'.......xx...../.......xxx..../.......xxxx.../..xxxxxxxxxx../.xxxxxxxxxxxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxxx/..xxxxxxxxxx../.......xxxx.../.......xxx..../.......xx...../..xx........../.xxxx........./..xx..........',
  coral:'...xx.....xx../xx.xxx...xxx../xx..xx...xx.xx/.xxxxxx.xxxxx./..xxxxxxxxxx../....xxxxxx..../xx...xxxx...xx/xxx..xxxx..xxx/.xxxxxxxxxxxx./...xxxxxxxx.../.....xxxx...../.....xxxx...../...xxxxxxxx.../..xxxxxxxxxx..',
  hammer:'.xxxxxxxxxx.../xxxxxxxxxxxx../xxxxxxxxxxxx../xxxxxxxxxxxx../.xxxxxxxxxx.../.....xxx....../.....xxx....../.....xxx....../.....xxx....../.....xxx....../....xxxx....../...xxxxx....../..xxxxx......./..xxxx........',
  circuit:'..xxxx..xxxx../.xx..xxxx..xx./xx....xx....xx/xx..........xx/.xx........xx./..xxx....xxx../....xxxxxx..../.....xxxx...../....xxxxxx..../..xxx....xxx../.xx........xx./xx....xx....xx/.xx..xxxx..xx./..xxxx..xxxx..',
  rail:'....xxxxxxxxxx/...xxxxxxxxxxx/..xxxxxxxxxxxx/.xxxx......xxx/xxxx........xx/.xxxx......xxx/..xxxxxxxxxxxx/...xxxxxxxxxxx/....xxxxxxxxxx/......xxx...../......xxx...../..xxxxxxxxxx../.xxx......xxx./xxx........xxx',
  shield:'xx..........xx/xxx........xxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./.xxxxxxxxxxxx./..xxxxxxxxxx../..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../.....xxxx...../......xx....../......xx......',
  wingShield:'xxx........xxx/xxxx......xxxx/xxxxx....xxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../....xxxxxx..../.....xxxx...../.....xxxx...../......xx....../......xx....../.....xxxx...../....xxxxxx....',
  cauldron:'..xx......xx../...xx....xx.../....xx..xx..../.....xxxx...../..xxxxxxxxxx../.xxxxxxxxxxxx./xxx........xxx/xx..xxxxxxxxxx/xx..xxxxxxxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../..xxx....xxx../.xxx......xxx.',
  heart:'..xxxx..xxxx../.xxxxxxxxxxxx./xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../.....xxxx...../......xx....../......xx....../.....xxxx.....',
  target:'....xxxxxx..../..xxxxxxxxxx../.xxx......xxx./xxx..xxxx..xxx/xx..xxxxxx..xx/xx..xx..xx..xx/xx..xx..xx..xx/xx..xxxxxx..xx/xxx..xxxx..xxx/.xxx......xxx./..xxxxxxxxxx../....xxxxxx..../.....xxxx...../......xx......',
  clock:'....xxxxxx..../...xxxxxxxx.../..xxxxxxxxxx../.xxx..xx..xxx./xxx...xx...xxx/xx....xx....xx/xx....xxxxx.xx/xx..........xx/xxx........xxx/.xxx......xxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../.....xxxx.....',
  banner:'..xx........../..xxxxxxxxxxx./..xxxxxxxxxxxx/..xxxxxxxxxxx./..xxxxxxxxxx../..xxxxxxxxxxx./..xxxxxxxxxxxx/..xx........../..xx........../..xx........../..xx........../..xx........../.xxxx........./xxxxxx........',
  blade:'..........xxxx/........xxxxx./......xxxxxx../.....xxxxxx.../...xxxxxxx..../..xxxxxxx...../.xxxxxxx....../xxxxxxx......./.xxxxxxx....../..xxxxxxx...../...xxxxxxx..../.....xxxxxx.../.......xxxxx../..........xxx.',
  orb:'.....xxxx...../...xxxxxxxx.../..xxxxxxxxxx../.xxxxxxxxxxxx./xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../.....xxxx...../.....xxxx...../..xxxxxxxxxx..',
  tideRing:'....xxxxxx..../..xxxx..xxxx../.xxx......xxx./xxx..xxxx..xxx/xx..xx..xx..xx/xx......xx..xx/xx....xxx...xx/xxx..xxx...xxx/.xxxxxx...xxx./..xxxxxxxxxx../....xxxxxx..../...xx....xx.../..xx......xx../.xx........xx.',
  bastion:'xx..xx..xx..xx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xx..xxxxxx..xx/xx..xxxxxx..xx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxx..xxxx..xxx/xxx..xxxx..xxx/xxxxxxxxxxxxxx/xxxxx....xxxxx/xxxxx....xxxxx/xxxxx....xxxxx/xxxxxxxxxxxxxx',
  lute:'.....xxx....../.....xxx....../.....xxx....../.....xxx....../....xxxxx...../...xxxxxxx..../..xxxxxxxxx.../.xxxxxx.xxxx../.xxxxx...xxx../.xxxxxx.xxxx../..xxxxxxxxx.../...xxxxxxx..../....xxxxx...../.....xxx......',
  coil:'....xxxxxx..../...xxxxxxxx.../.....xxxx...../...xxxxxxxx.../.xxxxxxxxxxxx./.....xxxx...../...xxxxxxxx.../.xxxxxxxxxxxx./.....xxxx...../...xxxxxxxx.../.xxxxxxxxxxxx./.....xxxx...../..xxxxxxxxxx../.xxxxxxxxxxxx.',
  hollow:'xxxxxxxxxxxxxx/xxxxxxxxxxxxxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxx........xxx/xxxxxxxxxxxxxx/xxxxxxxxxxxxxx',
  furnace:'.....xxxx...../...xxxxxxxx.../..xx.xxxx.xx../.xxxxxxxxxxxx./xx..........xx/xx..xxxxxx..xx/xx.xxx..xxx.xx/xx.xx....xx.xx/xx.xx.xx.xx.xx/xx.xxxxxxxx.xx/xx..xxxxxx..xx/xxxxxxxxxxxxxx/xxx........xxx/xxx........xxx',
  crown:'xx....xx....xx/xxx..xxxx..xxx/xxxx.xxxx.xxxx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./.xxxxxxxxxxxx./..xxxxxxxxxx../..xx......xx../..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../.....xxxx...../......xx....../.....xxxx.....',
  pentagram:'......xx....../.....xxxx...../xx...xxxx...xx/xxx.xxxxxx.xxx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xx....xx.../..xxxx..xxxx../.xxxxx..xxxxx./xxx..xxxx..xxx/xx....xx....xx/.....xxxx...../....xx..xx..../...xx....xx...',
  fuse:'xx............ /xxx...xxxx..../.xx..xxxxxx.../.xx.xxx..xxx../.xxxxxx..xxx../...xxxxxxxx.../....xxxxxx..../....xxxxxx..../...xxxxxxxx.../..xxxxxxxxxx../.xxxxxxxxxxxx./.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx...',
  forge:'xx..........xx/xxxxxxxxxxxxxx/.xxxxxxxxxxxx./..xxxxxxxxxx../....xxxxxx..../.....xxxx...../.....xxxx...../...xxxxxxxx.../..xxxxxxxxxx../.....xxxx...../.....xxxx...../....xxxxxx..../..xxxxxxxxxx../.xxxxxxxxxxxx.',
  urn:'....xxxxxx..../...xxxxxxxx.../.....xxxx...../...xxxxxxxx.../..xxxxxxxxxx../.xxxxxxxxxxxx./xx.xxxxxxxx.xx/xx.xxxxxxxx.xx/.xxxxxxxxxxxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../...xxxxxxxx.../..xxxxxxxxxx..',
  network:'xxx........xxx/xxxxx....xxxxx/xxxxxxxxxxxxxx/.xxx......xxx./..xx......xx../..xx..xx..xx../..xxxxxxxxxx../.....xxxx...../..xxxxxxxxxx../..xx..xx..xx../..xx......xx../.xxx......xxx./xxxxxxxxxxxxxx/xxxxx....xxxxx',
  fan:'......xx....../..xx..xx..xx../..xxx.xx.xxx../...xxxxxxxx.../xx..xxxxxx..xx/xxx..xxxx..xxx/.xxxxxxxxxxxx./...xxxxxxxx.../.....xxxx...../.....xxxx...../.....xxxx...../.....xxxx...../....xxxxxx..../...xxxxxxxx...',
  fortress:'xxx........xxx/xxx........xxx/xxxxxx..xxxxxx/xxxxxxxxxxxxxx/.xxxx....xxxx./.xxxx....xxxx./.xxxxxxxxxxxx./.xxx..xx..xxx./.xxx..xx..xxx./.xxxxxxxxxxxx./.xxxxxxxxxxxx./xxx..xxxx..xxx/xxx..xxxx..xxx/xxxxxxxxxxxxxx',
  counter:'.....xxxx...../...xxxxxxxx.../..xxx....xxx../.xxx......xxx./xxx........xxx/xxxx......xxxx/xxxxx....xxxxx/.xxxx....xxxx./..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx..../..xx.xxxx.xx../.xxx..xx..xxx./xxxx......xxxx',
  unknown:'....xxxxxx..../...xxxxxxxx.../..xxx....xxx../..xx......xx../........xxx.../.......xxx..../......xxx...../......xx....../............../......xx....../......xx....../..xxxxxxxxxx../...xxxxxxxx.../....xxxxxx....'
};
const sigils={
  fire:['...x...','..xxx..','.xxxxx.','xxxxxxx','.xxxxx.','..xxx..','...x...'],
  water:['...x...','..xxx..','..xxx..','.xxxxx.','xxxxxxx','.xxxxx.','..xxx..'],
  lightning:['....xx.','...xx..','..xxx..','.xxxxx.','...xx..','..xx...','.x.....'],
  wind:['....xxx','..xxxxx','.xxxxx.','xxxxxx.','.xxxx..','..xx...','.xx....'],
  earth:['..xxx..','.xxxxx.','xxxxxxx','xxxxxxx','xxxxxxx','.xxxxx.','..xxx..'],
  steam:['.x...x.','..x.x..','...x...','.......','.xxxxx.','xxxxxxx','.xxxxx.'],
  shield:['xxxxxxx','xxxxxxx','.xxxxx.','.xxxxx.','..xxx..','...x...','...x...'],
  spark:['...x...','.x.x.x.','..xxx..','xxxxxxx','..xxx..','.x.x.x.','...x...']
};
const recipes={
  S01:['torch'],S02:['ember'],S03:['sword','fire'],S04:['chalice','water'],S05:['spirit'],S06:['fountain'],
  S07:['bolt','spark'],S08:['hourglass'],S09:['chain'],S10:['feather'],S11:['echo'],S12:['bow','wind'],
  S13:['stone'],S14:['tower'],S15:['recycle'],
  D01:['engine','steam'],D02:['wave','fire'],D03:['torch','lightning'],D04:['bolt','fire'],
  D05:['feather','fire'],D06:['sword','wind'],D07:['forge','fire'],D08:['volcano','earth'],
  D09:['net','water'],D10:['wave','lightning'],D11:['mirror','wind'],D12:['arrow','water'],
  D13:['coral','water'],D14:['hammer','water'],D15:['circuit','wind'],D16:['bow','lightning'],
  D17:['rail','lightning'],D18:['shield','lightning'],D19:['shield','wind'],D20:['wingShield','earth'],
  T01:['cauldron','lightning'],T02:['heart','water'],T03:['tower','water'],T04:['target','lightning'],
  T05:['clock','lightning'],T06:['banner','fire'],T07:['blade','lightning'],T08:['fountain','lightning'],
  T09:['recycle','water'],T10:['orb','earth'],
  Q01:['tideRing','water'],Q02:['bastion','shield'],Q03:['lute','fire'],Q04:['coil','lightning'],Q05:['hollow','wind'],
  A01:['furnace','fire'],A02:['crown','water'],A03:['pentagram','earth'],
  E01:['fuse','spark'],E02:['forge','fire'],E03:['chalice','water'],E04:['urn','lightning'],
  E05:['network','lightning'],E06:['fan','wind'],E07:['fortress','earth'],E08:['counter','shield']
};
const cache=new Map();

function drawEmblem(def,recipe){
  const cells=new Map();
  const pixel=(x,y,color)=>{if(x>=2&&y>=2&&x<=29&&y<=29)cells.set(`${x},${y}`,color);};
  const rect=(x,y,w,h,color)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixel(xx,yy,color);};
  const elements=def?Object.entries(def.requirements).sort((a,b)=>b[1]-a[1]).map(([e])=>e):[];
  const p=palettes[elements[0]]||neutral,q=palettes[elements[1]]||p;
  const grid=silhouettes[recipe[0]].split('/').map(row=>row.trim()),width=Math.max(...grid.map(row=>row.length));
  const ox=Math.floor((32-width)/2),oy=6;
  const exists=(x,y)=>grid[y]?.[x]==='x';
  // Main silhouette is rendered at native pixels, with a two-sided enamel shade.
  for(let y=0;y<grid.length;y++)for(let x=0;x<width;x++)if(exists(x,y)){
    const palette=elements.length>1&&x>width*.6?q:p;
    const shade=!exists(x,y-1)?3:!exists(x-1,y)?2:y>grid.length*.67?0:(x+y)%5===0?2:1;
    pixel(ox+x,oy+y,palette[shade]);
  }
  // A separate lower-right mechanism silhouette, not an ID or arbitrary rune.
  if(recipe[1]){
    const marker=sigils[recipe[1]],palette=palettes[recipe[1]]||q;
    for(let y=0;y<7;y++)for(let x=0;x<7;x++)if(marker[y][x]==='x')pixel(21+x,18+y,palette[y<3?2:1]);
  }
  if(def?.grade==='core'){
    rect(4,5,2,5,p[2]);rect(6,4,3,2,p[3]);
    rect(26,5,2,5,q[2]);rect(23,4,3,2,q[3]);
    rect(5,23,2,3,p[1]);rect(7,25,3,2,p[2]);
  }
  if(def?.grade==='evolution'){
    // Three rising gold steps identify permanent evolution growth.
    rect(3,23,2,4,gold);rect(5,21,2,6,gold);rect(7,19,2,8,gold);
    rect(6,15,2,2,'#fff2c5');rect(5,16,4,1,'#fff2c5');
  }
  // One jewel per required element; asymmetrical requirements color the main body.
  const gems=elements.length?elements:['neutral'];
  const start=Math.floor((32-(gems.length*5-1))/2);
  gems.forEach((element,i)=>{const color=(palettes[element]||neutral)[2],x=start+i*5;rect(x+1,27,2,1,color);rect(x,28,4,1,color);rect(x+1,29,2,1,color);});
  // Outline the combined silhouette after composition so overlapping motifs read as one badge.
  const outline=new Map();
  for(const key of cells.keys()){
    const [x,y]=key.split(',').map(Number);
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;
      if(nx>=1&&ny>=1&&nx<=30&&ny<=30&&!cells.has(k))outline.set(k,ink);
    }
  }
  const pixels=[...outline,...cells].map(([key,color])=>{const [x,y]=key.split(',');return `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;}).join('');
  return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${pixels}</svg>`);
}

export function pixelBondIcon(id){
  const known=Object.hasOwn(BOND_MAP,id)&&Object.hasOwn(recipes,id);
  const key=known?id:'fallback';
  if(!cache.has(key))cache.set(key,drawEmblem(known?BOND_MAP[id]:null,known?recipes[id]:['unknown']));
  return cache.get(key);
}
