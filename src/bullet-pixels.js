// Original 32 x 32 mechanism-specific pixel illustrations. Rarity is styled by the UI.
import {BULLET_MAP} from './catalog.js';
const PALETTES={fire:['#642b32','#bd4938','#f7883f','#ffe3a0'],water:['#244761','#397fa9','#6dc9d5','#d9ffff'],lightning:['#3e345f','#7960ad','#c09bdf','#fff2b4'],wind:['#254f49','#4b9275','#99d5a2','#e9f8c4'],earth:['#513b37','#946448','#c99b61','#f0d9a0']};
const INK='#101824',IRON='#728b99',SILVER='#c8d4d1',WOOD='#74503a',PAPER='#d8c9a0';
function painter(p){
 const pixels=Array.from({length:32},()=>Array(32).fill(null));
 function dot(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=2&&x<=29&&y>=2&&y<=29)pixels[y][x]=c;}
 function rect(x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)dot(i,j,c);}
 function line(x0,y0,x1,y1,c,w=1){const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let n=0;n<=steps;n++)rect(Math.round(x0+(x1-x0)*n/steps),Math.round(y0+(y1-y0)*n/steps),w,w,c);}
 function oval(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)dot(x,y,c);}
 function poly(points,c){const ys=points.map(q=>q[1]),xs=points.map(q=>q[0]);for(let y=Math.floor(Math.min(...ys));y<=Math.max(...ys);y++)for(let x=Math.floor(Math.min(...xs));x<=Math.max(...xs);x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y+.5)!==(yj>y+.5)&&x+.5<(xj-xi)*(y+.5-yi)/(yj-yi)+xi)inside=!inside;}if(inside)dot(x,y,c);}}
 function ring(cx,cy,r,t,c){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){const d=(x-cx)**2+(y-cy)**2;if(d<=r*r&&d>=(r-t)**2)dot(x,y,c);}}
 const gem=(x,y,w=8,h=12)=>{poly([[x,y-h/2],[x+w/2,y],[x,y+h/2],[x-w/2,y]],p[1]);poly([[x,y-h/2],[x,y+h/2],[x-w/2,y]],p[2]);line(x,y-h/2+2,x+w/2-2,y,p[3]);};
 const flame=(x,y,w=10,h=14)=>{poly([[x,y-h],[x+w*.1,y-h*.55],[x+w*.37,y-h*.8],[x+w*.48,y-h*.25],[x+w*.28,y],[x-w*.28,y],[x-w*.5,y-h*.3],[x-w*.25,y-h*.6]],p[1]);poly([[x,y-h*.65],[x+w*.25,y-h*.2],[x+w*.1,y],[x-w*.2,y],[x-w*.25,y-h*.2]],p[2]);rect(x-1,y-4,2,4,p[3]);};
 const bolt=(x,y,w=10,h=20)=>{poly([[x+w*.1,y],[x+w,y],[x+w*.55,y+h*.42],[x+w,y+h*.42],[x-w*.2,y+h],[x+w*.2,y+h*.55],[x-w*.3,y+h*.55]],p[2]);line(x+w*.2,y+2,x+w*.6,y+2,p[3],2);};
 const star=(x,y,r=6)=>{poly([[x,y-r],[x+2,y-2],[x+r,y],[x+2,y+2],[x,y+r],[x-2,y+2],[x-r,y],[x-2,y-2]],p[2]);rect(x-1,y-1,3,3,p[3]);};
 const drop=(x,y,w=8,h=12)=>{poly([[x,y-h],[x+w/2,y-3],[x+w/2-1,y],[x-w/2+1,y],[x-w/2,y-3]],p[1]);line(x-2,y-h+5,x-w/2+2,y-3,p[3],2);rect(x-1,y-3,3,3,p[2]);};
 const feather=(x,y,w=10,h=21)=>{poly([[x,y],[x+w-1,y+2],[x+w,y+8],[x+3,y+h],[x,y+h-2],[x-3,y+9]],p[1]);poly([[x,y],[x+5,y+3],[x+3,y+h],[x,y+h-2]],p[2]);line(x+5,y+4,x-2,y+h+2,p[3]);for(let k=5;k<h-2;k+=4)line(x+3,y+k,x+7,y+k-2,INK);};
 const rock=(x,y,w=10,h=9)=>{poly([[x-w/2,y-2],[x-w/4,y-h/2],[x+w/3,y-h/2],[x+w/2,y+1],[x+w/4,y+h/2],[x-w/3,y+h/2]],p[1]);poly([[x-w/2,y-2],[x-w/4,y-h/2],[x+w/3,y-h/2],[x,y+1]],p[2]);line(x-w/3,y+h/2-1,x+w/4,y+h/2-1,p[0]);};
 const shield=(x,y,w=14,h=18)=>{poly([[x-w/2,y],[x,y-2],[x+w/2,y],[x+w/2-1,y+h*.6],[x,y+h],[x-w/2+1,y+h*.6]],IRON);poly([[x-w/2+2,y+2],[x,y],[x+w/2-2,y+2],[x+w/2-3,y+h*.55],[x,y+h-3],[x-w/2+3,y+h*.55]],p[1]);line(x-w/2+2,y+2,x,y,p[3]);};
 const arrow=(x0,y0,x1,y1,c=p[2],w=2)=>{line(x0,y0,x1,y1,c,w);const a=Math.atan2(y1-y0,x1-x0);poly([[x1+Math.cos(a)*4,y1+Math.sin(a)*4],[x1+Math.cos(a+2.4)*5,y1+Math.sin(a+2.4)*5],[x1+Math.cos(a-2.4)*5,y1+Math.sin(a-2.4)*5]],c);};
 const scroll=(x=8,y=6,w=16,h=19)=>{rect(x,y,w,h,PAPER);rect(x+2,y+2,w-4,h-4,'#f0e0b2');rect(x-3,y-1,w+3,3,WOOD);rect(x,y+h-1,w+3,3,WOOD);rect(x-3,y,3,5,PAPER);rect(x+w,y+h-3,3,5,PAPER);};
 const cog=(x,y,r=8)=>{ring(x,y,r,3,IRON);for(let k=0;k<8;k++){const a=k*Math.PI/4;rect(Math.round(x+Math.cos(a)*r)-1,Math.round(y+Math.sin(a)*r)-1,3,3,SILVER);}};
 const node=(x,y,r=3)=>{oval(x,y,r,r,p[1]);rect(x-1,y-1,2,2,p[3]);};
 const barrel=(x,y,w=15,h=19)=>{poly([[x+2,y],[x+w-2,y],[x+w,y+4],[x+w,y+h-4],[x+w-2,y+h],[x+2,y+h],[x,y+h-4],[x,y+4]],WOOD);for(let n=3;n<w;n+=4)line(x+n,y+2,x+n,y+h-2,p[0]);rect(x,y+4,w,3,IRON);rect(x,y+h-6,w,3,IRON);line(x+2,y,x+w-3,y,SILVER);};
 const cannon=(x,y,w=17,h=12)=>{rect(x,y,w,h-4,IRON);rect(x+2,y,w-2,2,SILVER);rect(x+w-3,y+2,3,h-7,INK);poly([[x+4,y+h-4],[x+w-4,y+h-4],[x+w-1,y+h],[x+1,y+h]],p[1]);oval(x+4,y+h,3,3,p[0]);oval(x+w-4,y+h,3,3,p[0]);};
 return {p,pixels,dot,rect,line,oval,poly,ring,gem,flame,bolt,star,drop,feather,rock,shield,arrow,scroll,cog,node,barrel,cannon};
}
// Independent main silhouettes, organized by catalog id.
const DRAW={
 F01:({star,line,p,rect})=>{line(4,25,11,18,p[1],2);star(18,12,10);rect(5,7,2,2,p[2]);rect(25,24,2,2,p[2]);},
 F02:({rock,flame,rect,p})=>{rock(10,23,12,8);rock(21,21,13,10);flame(11,17,5,9);flame(23,15,4,6);rect(16,7,2,2,p[3]);rect(6,10,2,2,p[2]);},
 F03:({flame,line,p})=>{line(4,26,28,26,p[0],2);flame(7,25,8,12);flame(16,24,11,21);flame(25,25,8,15);},
 F04:({line,flame,rect,p})=>{line(17,15,23,27,WOOD,4);line(17,14,23,26,p[2]);rect(12,15,10,3,IRON);flame(16,16,15,14);},
 F05:({line,flame,p})=>{line(5,24,26,28,WOOD,3);line(6,28,25,22,p[0],3);flame(16,23,18,19);line(8,25,11,25,p[2],2);},
 F06:({poly,line,p})=>{poly([[3,27],[3,19],[8,17],[6,12],[11,14],[13,7],[19,4],[27,7],[22,9],[18,9],[16,14],[20,16],[25,15],[29,19],[29,27]],p[1]);poly([[3,25],[10,20],[13,21],[15,17],[22,21],[27,19],[29,25]],p[2]);line(17,6,23,6,p[3],2);},
 F07:({poly,rect,flame,p})=>{poly([[4,11],[10,15],[16,5],[22,15],[28,11],[25,25],[7,25]],p[1]);rect(7,23,19,4,p[2]);rect(9,24,3,2,p[3]);rect(15,20,3,3,p[3]);flame(5,10,5,6);flame(27,10,5,6);},
 F08:({star,line,rect,p})=>{star(16,15,5);for(const [a,b,c,d]of [[16,3,16,8],[16,23,16,28],[3,15,8,15],[24,15,28,15],[5,4,10,9],[23,22,27,26],[24,6,21,9],[5,26,10,21]])line(a,b,c,d,p[2],2);rect(15,14,3,3,p[3]);},
 F09:({poly,line,star,p})=>{poly([[4,10],[13,5],[16,12],[12,18],[14,27],[5,23]],IRON);poly([[20,6],[27,11],[27,23],[20,26],[17,18],[22,15]],p[1]);line(7,10,12,8,SILVER,2);star(16,16,7);},
 F10:({oval,rect,line,star,p})=>{oval(15,20,10,9,p[0]);oval(15,19,8,8,p[1]);rect(10,9,8,4,IRON);line(15,9,20,5,WOOD,2);star(24,5,4);rect(9,15,3,4,p[3]);},
 F11:({poly,line,flame,p})=>{poly([[4,8],[18,5],[28,15],[16,27],[5,24]],IRON);poly([[5,9],[16,8],[24,15],[15,23],[6,21]],p[0]);line(7,25,24,7,p[2],4);line(10,24,25,9,p[3],2);flame(25,9,6,6);},
 F12:({barrel,line,star})=>{barrel(7,9,18,19);line(17,8,22,4,WOOD,2);star(24,4,3);},
 F13:({poly,rock,flame,p,line})=>{poly([[4,4],[12,7],[14,3],[19,10],[27,15],[19,25],[9,18]],p[1]);rock(21,22,17,13);flame(20,25,9,13);line(4,12,10,16,p[3],2);line(10,3,14,9,p[2],2);},
 F14:({node,line,star})=>{line(16,15,7,24,IRON,3);line(16,15,25,24,IRON,3);line(16,15,16,5,IRON,3);node(7,24,5);node(25,24,5);node(16,6,5);star(16,15,6);},
 F15:({poly,rect,line,p})=>{poly([[11,28],[11,11],[16,3],[21,11],[21,28]],p[1]);rect(12,12,8,13,p[2]);line(13,11,16,6,p[3],2);rect(9,25,14,4,IRON);},
 F16:({rect,line,star,p})=>{rect(6,18,19,9,p[0]);rect(7,19,17,3,p[2]);line(6,17,7,11,WOOD,2);line(7,11,15,8,WOOD,2);line(15,8,23,12,p[2],2);star(26,12,4);},
 F17:({poly,line,flame,p})=>{line(8,28,22,12,WOOD,4);poly([[9,8],[16,3],[28,13],[23,19]],IRON);line(11,8,16,5,SILVER,2);flame(6,19,7,9);},
 F18:({rect,poly,flame,p})=>{rect(5,10,22,16,IRON);poly([[3,10],[7,5],[25,5],[29,10]],p[0]);rect(9,14,14,12,INK);flame(16,25,13,11);rect(4,27,24,3,p[1]);rect(7,3,5,4,p[2]);},
 F19:({poly,rect,line,p})=>{poly([[7,4],[25,4],[28,8],[25,11],[19,11],[17,28],[14,28],[12,11],[7,11],[4,8]],IRON);rect(8,5,16,3,p[2]);line(14,12,16,25,p[1],2);rect(14,8,4,2,p[3]);},
 F20:({ring,flame,p,line})=>{ring(16,17,10,4,p[1]);ring(16,17,8,2,p[2]);flame(9,11,7,8);flame(23,11,7,8);line(6,23,11,27,p[3],2);},
 F21:({rect,poly,flame,p})=>{poly([[7,8],[11,4],[21,4],[25,8],[25,25],[21,29],[11,29],[7,25]],IRON);rect(4,12,24,3,p[0]);rect(13,2,6,28,p[0]);rect(10,8,12,17,INK);flame(16,24,11,15);rect(5,21,4,5,p[2]);rect(24,21,4,5,p[2]);},

 H01:({drop,line,poly,p})=>{drop(16,26,14,18);line(16,12,16,5,p[2],2);poly([[16,9],[7,6],[8,3],[14,4]],p[1]);poly([[17,7],[24,3],[26,5],[22,9]],p[2]);},
 H02:({oval,line,poly,p})=>{oval(16,26,12,3,p[1]);line(16,24,16,7,p[3],2);poly([[4,14],[7,9],[12,9],[16,15],[15,18],[10,12],[7,12]],p[2]);poly([[17,17],[21,8],[26,8],[29,13],[25,11],[23,12],[19,20]],p[2]);},
 H03:({poly,oval,rect,p})=>{poly([[12,3],[20,3],[25,10],[23,20],[28,27],[21,25],[17,29],[13,25],[6,28],[9,20],[6,12]],p[1]);oval(16,12,6,7,p[2]);rect(12,10,2,3,INK);rect(18,10,2,3,INK);rect(13,5,5,2,p[3]);},
 H04:({poly,line,drop,p})=>{poly([[4,21],[13,18],[18,12],[20,5],[28,6],[27,16],[20,23],[10,26],[4,25]],p[1]);line(5,22,15,21,p[3],2);poly([[22,6],[27,7],[25,13],[21,12]],INK);drop(8,15,6,10);},
 H05:({shield,oval,rect,p})=>{shield(16,12,17,17);oval(8,12,5,4,p[2]);oval(16,9,7,6,p[2]);oval(24,13,5,4,p[1]);rect(8,13,18,4,p[2]);rect(13,19,6,2,p[3]);},
 H06:({poly,oval,line,p})=>{poly([[3,27],[5,19],[11,16],[12,8],[17,3],[24,4],[28,10],[25,15],[20,14],[23,9],[18,8],[16,13],[20,19],[29,23],[28,28]],p[1]);line(7,23,12,21,p[2],3);line(14,7,19,5,p[3],2);oval(23,24,5,2,p[2]);},
 H07:({line,poly,drop,p})=>{line(16,6,16,28,SILVER,3);line(5,8,5,14,p[2],3);line(25,8,25,14,p[2],3);line(6,15,16,20,p[1],3);line(26,15,18,20,p[1],3);poly([[16,2],[12,9],[20,9]],p[3]);drop(5,7,6,5);drop(27,7,5,5);},
 H08:({poly,rect,line,p})=>{rect(5,4,22,5,p[2]);poly([[12,9],[21,9],[18,26],[14,29]],p[1]);line(13,10,15,24,p[3],2);rect(7,5,14,2,p[3]);},
 H09:({poly,line,p})=>{poly([[3,24],[17,5],[27,3],[25,14],[9,28]],p[1]);poly([[5,25],[19,8],[25,4],[20,14]],p[3]);line(11,24,23,14,p[2],2);},
 H10:({poly,line,p})=>{poly([[3,27],[10,20],[18,20],[11,27]],p[1]);poly([[11,18],[17,12],[25,12],[19,18]],p[2]);poly([[18,10],[23,5],[29,5],[25,10]],p[3]);line(3,20,6,17,p[2],2);line(8,12,11,9,p[2],2);},
 H11:({poly,line,p})=>{poly([[6,8],[22,5],[28,12],[25,27],[9,28],[4,20]],p[1]);poly([[6,8],[22,5],[18,12],[4,20]],p[3]);poly([[18,12],[28,12],[25,27],[17,25]],p[2]);line(9,16,22,21,INK,2);line(12,10,15,26,p[0],2);},
 H12:({rect,poly,drop,p})=>{rect(7,3,18,4,IRON);rect(7,26,18,3,IRON);poly([[9,7],[23,7],[18,16],[23,26],[9,26],[14,16]],p[1]);drop(16,14,7,6);poly([[11,25],[16,18],[21,25]],p[3]);},
 H13:({oval,star,rect,p})=>{oval(17,16,12,13,p[1]);oval(23,12,10,11,null);star(8,13,5);star(20,24,5);rect(15,3,2,2,p[3]);},
 H14:({line,gem,rect,p})=>{for(const [x,y]of [[16,3],[16,27],[3,15],[27,15]])line(16,15,x,y,p[2],3);line(6,5,25,25,p[1],2);line(6,25,25,5,p[1],2);gem(16,16,11,13);rect(14,13,4,4,p[3]);},
 H15:({poly,oval,line,p})=>{poly([[3,13],[7,7],[12,9],[16,6],[21,9],[26,7],[29,13],[25,24],[16,28],[7,24]],p[1]);for(let x=6;x<=26;x+=5)line(16,25,x,12,p[2]);oval(16,17,6,6,p[2]);oval(14,15,2,2,p[3]);},
 H16:({rect,poly,ring,line,drop,p})=>{ring(21,12,6,2,IRON);rect(8,13,16,13,p[1]);poly([[8,17],[3,11],[3,18],[8,23]],p[2]);rect(9,11,12,3,p[2]);line(11,15,11,23,p[3],2);drop(4,28,4,6);},
 H17:({poly,rect,line,drop,p})=>{poly([[6,5],[25,5],[22,18],[17,22],[14,22],[9,18]],IRON);rect(8,6,15,4,p[2]);rect(14,20,4,6,IRON);rect(9,26,14,3,SILVER);line(24,9,27,17,p[2],2);drop(27,24,5,7);},
 H18:({poly,line,p})=>{poly([[4,8],[17,9],[27,19],[25,27],[15,17],[5,19],[8,14]],p[1]);line(6,10,16,12,p[3],2);line(17,13,24,21,p[2],3);poly([[4,3],[10,3],[4,9]],p[2]);},
 H19:({ring,line,rect,p})=>{ring(16,16,9,3,p[1]);for(let k=0;k<8;k++){const a=k*Math.PI/4;line(16,16,16+Math.round(Math.cos(a)*11),16+Math.round(Math.sin(a)*11),p[2],2);}rect(13,13,6,6,p[3]);rect(4,13,3,7,IRON);rect(25,13,3,7,IRON);},
 H20:({poly,line,arrow,p})=>{poly([[4,25],[6,14],[13,8],[22,8],[24,13],[18,13],[13,15],[11,23]],p[1]);arrow(5,26,25,26,p[3]);arrow(11,20,24,20,p[2]);line(7,12,12,8,p[3],2);},
 H21:({ring,poly,oval,line,p})=>{ring(16,17,12,3,p[1]);ring(16,17,7,2,p[2]);poly([[14,4],[24,4],[28,11],[20,8]],p[3]);poly([[4,22],[9,27],[18,29],[12,23]],p[2]);oval(16,17,3,3,INK);line(12,12,16,10,p[3],2);},

 L01:({node,line,p})=>{line(5,24,13,14,p[2],2);line(13,14,26,7,p[2],2);node(5,24,4);node(14,14,4);node(27,6,3);},
 L02:({bolt,line,p})=>{bolt(12,3,10,25);line(4,5,7,8,p[0],2);line(24,23,27,26,p[0],2);},
 L03:({line,node,p})=>{for(let x=6;x<=26;x+=10){line(x,6,x,26,p[1]);line(6,x,26,x,p[2]);}line(6,6,26,26,p[2]);line(26,6,6,26,p[2]);node(6,6);node(26,6);node(16,16);node(6,26);node(26,26);},
 L04:({poly,node,line,p})=>{poly([[3,25],[5,12],[10,6],[21,6],[27,12],[29,25],[25,25],[23,14],[20,11],[12,11],[8,14],[7,25]],p[1]);line(10,7,21,7,p[3],2);node(5,25,3);node(27,25,3);line(12,15,20,15,p[2],2);},
 L05:({poly,node,p})=>{poly([[5,6],[11,6],[10,21],[16,25],[23,21],[23,8],[28,8],[28,23],[21,29],[11,29],[4,23]],p[1]);node(7,7,4);node(26,7,3);poly([[22,3],[27,3],[25,10],[20,6]],p[3]);},
 L06:({oval,rect,bolt,p})=>{oval(8,10,5,5,p[1]);oval(16,8,7,6,p[2]);oval(24,11,5,5,p[1]);rect(7,10,19,7,p[1]);bolt(9,15,5,14);bolt(21,16,4,11);},
 L07:({poly,line,node,p})=>{poly([[3,8],[9,4],[13,11],[18,6],[24,3],[29,8],[25,10],[21,9],[15,17],[9,11],[5,13]],p[2]);line(7,14,7,24,p[1],2);line(16,18,16,27,p[1],2);line(25,12,25,23,p[1],2);node(7,25);node(16,27);node(25,24);},
 L08:({rect,line,p})=>{line(3,16,10,16,p[2],2);line(22,16,29,16,p[2],2);rect(10,5,4,23,IRON);rect(19,5,4,23,IRON);rect(14,9,5,15,p[1]);rect(11,6,2,20,SILVER);rect(20,6,2,20,SILVER);},
 L09:({poly,oval,line,p})=>{poly([[4,22],[4,17],[9,13],[15,14],[19,9],[26,10],[29,17],[24,16],[22,14],[18,20],[10,18],[8,23]],p[1]);line(5,26,13,26,p[2],2);line(18,25,27,25,p[2],2);oval(25,12,1,1,p[3]);},
 L10:({rect,ring,line,bolt,p})=>{rect(6,16,15,11,IRON);bolt(10,17,5,8);line(17,16,17,10,SILVER,3);ring(12,7,4,2,p[2]);ring(22,7,4,2,p[2]);rect(13,8,10,3,p[2]);},
 L11:({poly,rect,bolt,p})=>{rect(9,3,14,5,IRON);poly([[8,9],[24,9],[27,13],[26,27],[22,29],[10,29],[6,25],[6,13]],p[0]);rect(9,12,15,13,p[1]);bolt(13,12,7,13);rect(10,4,3,2,SILVER);},
 L12:({shield,line,node,p})=>{shield(16,8,21,21);line(16,3,16,20,p[2],2);node(16,4,3);line(6,16,25,16,p[3]);line(9,21,22,21,p[2]);},
 L13:({rect,oval,line,p})=>{rect(13,4,6,24,IRON);for(const y of [8,14,20]){oval(16,y,10,4,p[1]);oval(16,y,6,2,INK);line(7,y+1,23,y+1,p[2],2);}rect(9,27,14,3,SILVER);line(16,3,22,3,p[3],2);},
 L14:({poly,rect,line,p})=>{poly([[11,6],[21,6],[26,12],[26,20],[21,26],[11,26],[6,20],[6,12]],IRON);rect(11,11,11,11,p[1]);rect(14,14,5,5,p[3]);for(const x of [10,16,22]){line(x,3,x,6,p[2],2);line(x,26,x,29,p[2],2);}},
 L15:({poly,line,rect,p})=>{poly([[3,28],[13,9],[25,3],[19,15]],SILVER);line(7,25,23,6,p[2],2);line(18,22,25,27,IRON,3);rect(22,25,5,3,p[1]);},
 L16:({rect,bolt,line,p})=>{rect(5,9,21,17,p[0]);rect(7,11,17,13,p[1]);rect(11,5,9,4,IRON);rect(4,14,2,7,IRON);rect(26,14,3,7,IRON);bolt(13,12,6,10);line(7,10,23,10,p[3]);},
 L17:({poly,rect,line,p})=>{poly([[4,5],[11,5],[11,16],[16,21],[21,16],[21,5],[28,5],[28,19],[21,26],[11,26],[4,19]],p[1]);rect(4,5,7,5,SILVER);rect(21,5,7,5,p[3]);line(16,10,16,29,IRON,3);rect(12,10,10,3,SILVER);},
 L18:({rect,line,gem,p})=>{rect(6,3,4,26,IRON);rect(23,3,4,26,IRON);for(const y of [7,15,23])line(10,y,23,y,p[1],2);gem(16,15,10,13);line(7,4,7,27,SILVER);line(24,4,24,27,SILVER);},
 L19:({line,node,poly,p})=>{line(4,10,26,10,IRON,2);line(4,24,26,24,IRON,2);poly([[4,19],[11,13],[16,17],[22,12],[29,16],[21,21],[16,19],[10,24]],p[2]);node(4,10,3);node(27,24,3);},
 L20:({poly,line,ring,node,p})=>{ring(16,17,10,1,p[1]);line(16,5,16,27,IRON,3);line(7,9,11,23,IRON,3);line(25,9,21,23,IRON,3);node(16,5,3);node(7,9);node(25,9);poly([[11,25],[22,25],[25,29],[8,29]],p[2]);},
 L21:({poly,line,rect,p})=>{poly([[3,20],[10,10],[22,3],[28,4],[27,10],[16,22],[6,29]],IRON);line(9,23,25,7,p[3],2);line(5,20,21,4,p[1],3);line(12,27,28,11,p[1],3);rect(4,25,5,3,WOOD);},

 W01:({feather})=>feather(12,3,12,23),
 W02:({poly,line,p})=>{poly([[4,21],[12,17],[19,8],[22,8],[22,25],[18,25],[11,23],[4,25]],p[1]);line(20,10,20,23,p[3],2);line(26,11,28,14,p[2],2);line(28,14,28,21,p[2],2);},
 W03:({feather,line,p})=>{feather(8,7,9,18);feather(20,3,9,20);line(8,27,22,27,WOOD,2);},
 W04:({poly,oval,line,p})=>{poly([[13,10],[16,6],[21,6],[25,10],[25,19],[28,23],[10,23],[13,19]],p[1]);oval(19,26,3,2,p[2]);line(15,10,15,19,p[3],2);line(6,10,3,15,p[2],2);line(3,15,6,20,p[2],2);},
 W05:({poly,line,feather,p})=>{feather(6,3,8,14);line(7,11,25,25,WOOD,3);poly([[20,23],[29,29],[27,18],[24,21]],p[2]);line(13,12,21,18,p[3],2);},
 W06:({poly,line,p})=>{poly([[3,5],[27,5],[25,10],[8,12],[25,15],[21,19],[12,20],[22,23],[17,29],[14,24],[7,21],[9,16],[4,13]],p[1]);line(6,7,24,7,p[3],2);line(10,16,22,16,p[2],2);line(12,23,18,24,p[2],2);},
 W07:({poly,oval,line,p})=>{poly([[3,16],[10,8],[22,8],[29,16],[22,24],[10,24]],p[1]);poly([[6,16],[12,12],[20,12],[26,16],[20,20],[12,20]],p[3]);oval(16,16,4,6,p[0]);line(15,13,15,18,p[2],2);line(6,4,13,4,p[2],2);line(20,27,27,27,p[2],2);},
 W08:({poly,line,p})=>{poly([[3,26],[8,13],[18,4],[28,3],[20,9],[15,17],[8,21]],p[1]);poly([[4,25],[11,14],[21,6],[27,4],[17,15]],p[3]);line(14,21,25,13,p[2],2);},
 W09:({poly,line,p})=>{poly([[15,28],[4,15],[5,8],[9,5],[16,8],[23,5],[28,10],[27,16],[18,28]],p[1]);for(const x of [6,11,17,23,27])line(16,25,x,10,p[2]);line(16,21,16,29,WOOD,3);},
 W10:({poly,line,p})=>{poly([[3,8],[27,20],[25,25],[4,12]],p[2]);poly([[4,25],[25,6],[28,9],[7,28]],p[1]);line(6,9,25,19,p[3]);line(5,26,25,8,SILVER);},
 W11:({poly,line,p})=>{line(8,28,20,11,WOOD,4);poly([[11,5],[17,3],[29,13],[25,19],[20,17],[15,12]],p[1]);line(15,6,25,13,p[3],2);poly([[5,12],[10,12],[12,18],[5,15]],p[2]);},
 W12:({poly,line,rect,p})=>{poly([[10,13],[10,6],[13,6],[13,12],[15,3],[18,3],[18,12],[21,5],[24,6],[23,15],[27,14],[29,17],[22,27],[12,27],[5,20],[6,16]],p[1]);line(13,15,22,19,p[3],2);rect(12,27,10,3,IRON);},
 W13:({poly,line,p})=>{line(5,28,24,8,WOOD,3);poly([[17,12],[22,3],[29,3],[28,10],[20,16]],p[2]);line(23,5,27,4,p[3],2);line(9,16,14,20,p[1],3);line(13,12,18,16,p[1],3);},
 W14:({oval,rect,arrow,p})=>{oval(9,17,6,5,p[1]);oval(17,12,7,7,p[2]);oval(24,18,5,5,p[1]);rect(7,17,18,7,p[1]);arrow(4,16,26,16,p[3]);},
 W15:({line,poly,rect,p})=>{line(8,4,8,29,WOOD,3);poly([[11,4],[26,9],[11,16]],p[1]);poly([[12,6],[21,9],[12,12]],p[3]);rect(5,27,11,3,IRON);},
 W16:({line,poly,p})=>{line(6,5,6,29,IRON,2);line(7,6,11,7,IRON,2);poly([[11,3],[28,11],[23,18],[10,12]],p[1]);poly([[12,5],[16,6],[14,14],[10,12]],p[3]);line(23,12,28,19,p[2],2);},
 W17:({line,poly,p})=>{for(const [x,y]of [[4,8],[14,3],[23,13]]){line(x,y,x,y+14,WOOD,2);poly([[x+2,y],[x+7,y+3],[x+2,y+7]],p[2]);}},
 W18:({line,poly,rect,p})=>{line(8,3,8,29,WOOD,3);poly([[11,4],[27,4],[24,10],[28,15],[12,17]],p[1]);line(13,6,22,6,p[3],2);poly([[14,11],[17,8],[20,11],[17,14]],p[2]);rect(4,27,14,3,IRON);},
 W19:({line,poly,p})=>{line(4,6,4,22,WOOD,2);line(26,10,26,28,WOOD,2);poly([[6,6],[14,8],[6,13]],p[1]);poly([[20,10],[26,10],[26,18],[18,14]],p[2]);line(8,22,20,22,p[3],2);poly([[19,17],[25,22],[19,26]],p[3]);},
 W20:({ring,line,poly,p})=>{ring(16,16,11,2,IRON);line(16,3,16,28,p[0]);line(3,16,28,16,p[0]);poly([[16,5],[20,18],[16,16],[12,18]],p[3]);poly([[16,27],[20,15],[16,17],[12,15]],p[1]);},
 W21:({poly,oval,p})=>{poly([[16,15],[16,3],[27,5],[25,11]],p[2]);poly([[17,16],[29,16],[27,27],[21,25]],p[1]);poly([[16,17],[16,29],[5,27],[7,21]],p[2]);poly([[15,16],[3,16],[5,5],[11,7]],p[1]);oval(16,16,3,3,p[3]);},

 R01:({rock,rect,line,p})=>{rock(16,21,21,15);rect(9,17,14,7,p[0]);rect(11,18,3,3,p[3]);rect(19,18,3,3,p[3]);line(16,12,16,6,p[2],2);rock(13,6,7,5);},
 R02:({line,poly})=>{line(8,28,21,12,WOOD,4);poly([[4,14],[9,6],[18,4],[28,11],[29,15],[19,10],[12,10]],IRON);line(10,7,17,6,SILVER,2);},
 R03:({poly,rock,line,rect,p})=>{rock(11,25,16,7);poly([[9,21],[8,14],[23,5],[28,6],[28,12],[14,23]],IRON);line(11,15,24,7,SILVER,2);line(24,7,26,9,INK,3);line(5,24,5,15,p[1],2);line(5,19,2,17,p[2],2);rect(13,23,6,4,p[0]);},
 R04:({rect,line,poly,p})=>{rect(4,4,15,19,PAPER);line(7,8,15,8,p[1],2);line(7,12,15,12,p[1],2);line(7,16,11,16,p[1],2);line(15,29,25,16,WOOD,3);poly([[17,14],[20,10],[29,18],[27,22]],IRON);},
 R05:({rect,poly,line,p})=>{poly([[7,20],[23,20],[28,28],[4,28]],p[0]);rect(5,6,6,17,IRON);rect(13,3,6,20,IRON);rect(21,7,6,16,IRON);rect(6,7,3,5,INK);rect(14,4,3,5,INK);rect(22,8,3,5,INK);line(8,24,23,24,p[2],3);},
 R06:({poly,rock,line,p})=>{poly([[3,3],[17,7],[27,17],[17,27],[6,17]],p[0]);line(5,4,19,15,p[2],3);line(3,12,12,21,p[1],3);rock(22,22,15,14);line(20,19,25,19,p[3],2);},
 R07:({rect,poly,p})=>{rect(11,3,10,8,p[1]);rect(13,5,2,2,p[3]);rect(18,5,2,2,p[3]);poly([[9,12],[23,12],[25,21],[20,23],[12,23],[7,21]],IRON);rect(3,12,5,13,p[1]);rect(25,12,4,13,p[1]);rect(9,23,6,6,p[0]);rect(19,23,6,6,p[0]);rect(13,15,6,5,p[2]);},
 R08:({shield,rock,rect,p})=>{shield(18,5,17,20);rock(7,25,10,7);rock(24,27,9,4);rect(16,11,4,8,p[2]);},
 R09:({oval,line,poly,rect,p})=>{oval(14,16,10,8,p[0]);poly([[5,17],[8,10],[15,7],[22,11],[24,18],[19,22],[8,22]],p[1]);poly([[14,8],[20,12],[19,18],[12,20],[8,15]],p[2]);line(8,15,22,16,p[0]);line(14,8,14,20,p[0]);rect(24,15,5,4,p[1]);rect(27,15,1,1,p[3]);line(8,22,5,25,IRON,3);line(20,22,24,25,IRON,3);poly([[5,17],[2,20],[6,20]],p[0]);},
 R10:({shield,line,poly,p})=>{shield(23,7,11,21);line(4,18,21,18,WOOD,5);line(5,18,20,18,p[2],2);poly([[4,10],[10,15],[4,15]],p[3]);poly([[3,22],[9,23],[3,28]],p[3]);},
 R11:({rock,line,p})=>{rock(8,10,10,10);rock(23,13,12,13);rock(14,25,13,8);line(15,7,18,3,p[2],2);line(26,25,29,27,p[2],2);},
 R12:({poly,rect,line,p})=>{poly([[3,9],[10,4],[12,9],[19,9],[22,4],[29,9],[26,15],[23,13],[21,27],[10,27],[8,13],[5,15]],IRON);poly([[11,10],[16,14],[21,10],[19,23],[12,23]],p[1]);line(12,12,15,15,p[3],2);line(10,25,21,25,p[2],2);rect(3,9,4,3,p[0]);rect(25,9,4,3,p[0]);},
 R13:({poly,line,p})=>{poly([[3,28],[10,8],[15,15],[20,3],[29,28]],p[1]);poly([[3,28],[10,8],[12,17],[9,18]],p[2]);poly([[18,10],[20,3],[24,15],[21,13]],p[3]);line(7,27,26,27,IRON,3);},
 R14:({rect,gem,p})=>{rect(5,24,23,5,p[0]);rect(9,20,15,4,p[2]);rect(12,10,9,10,IRON);rect(7,7,19,4,SILVER);gem(16,5,10,6);rect(14,12,2,7,p[3]);},
 R15:({oval,poly,line,p})=>{oval(16,17,9,9,p[1]);poly([[10,11],[17,8],[22,12],[14,13],[9,19]],p[2]);line(10,22,18,24,p[0],2);line(11,11,15,10,p[3],2);},
 R16:({poly,line,p})=>{poly([[4,11],[11,5],[16,7],[12,14],[16,20],[12,28],[4,24]],p[1]);poly([[21,5],[28,10],[28,24],[21,28],[17,20],[21,14],[17,8]],p[2]);line(6,12,10,8,p[3],2);line(16,3,16,6,p[0],2);},
 R17:({poly,rect,rock,line,p})=>{rect(11,3,10,4,WOOD);poly([[11,8],[21,8],[21,15],[26,23],[24,29],[8,29],[6,23],[11,15]],IRON);poly([[13,10],[19,10],[19,16],[24,24],[22,27],[10,27],[8,24],[13,16]],p[0]);rock(16,24,10,7);line(10,21,13,16,SILVER,2);},
 R18:({cog,arrow,rect,p})=>{cog(16,17,9);arrow(6,8,15,4,p[2]);arrow(25,26,17,29,p[2]);rect(12,13,9,9,p[0]);rect(14,15,5,5,p[3]);},
 R19:({rect,poly,oval,line,p})=>{poly([[3,10],[20,6],[27,10],[28,22],[21,26],[3,23]],IRON);line(4,12,20,8,SILVER,2);poly([[3,15],[19,11],[19,21],[3,23]],p[1]);oval(22,16,6,9,SILVER);oval(22,16,4,6,INK);line(6,16,14,14,p[2],2);},
 R20:({poly,line,rect,p})=>{poly([[3,12],[11,7],[29,15],[11,25],[3,22]],IRON);poly([[12,8],[29,15],[12,24]],p[1]);for(let x=14;x<25;x+=4)line(x,11,x-2,21,p[3]);rect(3,13,7,8,WOOD);},
 R21:({ring,rock,oval,p})=>{ring(16,16,8,3,p[1]);oval(16,16,4,4,INK);rock(7,5,8,5);rock(26,12,6,7);rock(20,27,9,5);rock(5,23,6,7);ring(16,16,11,1,p[2]);},

 C01:({scroll,flame,line,p})=>{scroll(7,5,16,20);flame(15,23,12,15);line(24,9,28,6,p[2],2);},
 C02:({scroll,star,oval,rect,p})=>{scroll(9,7,14,18);star(16,16,10);oval(16,16,4,4,p[0]);rect(14,14,2,2,p[3]);rect(18,14,2,2,p[3]);},
 C03:({scroll,line,gem,p})=>{scroll(6,8,20,16);line(16,3,16,28,p[2],2);line(5,16,28,16,p[2],2);gem(17,16,10,13);},
 C04:({scroll,poly,drop,p})=>{scroll(8,4,15,23);poly([[11,13],[14,10],[17,13],[20,10],[23,13],[21,19],[17,23],[13,19]],p[2]);drop(7,27,5,6);},
 C05:({scroll,ring,line,arrow,p})=>{scroll(6,6,18,20);ring(16,16,7,2,p[1]);line(16,12,16,17,p[2],2);line(16,17,20,17,p[2],2);arrow(24,5,28,9,p[3]);},
 C06:({scroll,poly,rect,p})=>{scroll(7,7,17,17);poly([[11,10],[14,10],[14,19],[18,22],[21,19],[21,10],[24,10],[24,20],[19,26],[15,26],[11,20]],p[1]);rect(11,9,3,4,p[3]);rect(21,9,3,4,p[3]);},
 C07:({scroll,poly,line,p})=>{scroll(6,6,19,19);poly([[16,8],[22,16],[24,25],[9,25],[11,16]],p[0]);poly([[16,11],[20,17],[13,17]],INK);line(14,20,12,24,p[2],2);},
 C08:({scroll,rect,poly,p})=>{scroll(8,5,16,21);rect(11,13,11,11,p[1]);rect(10,10,4,5,p[2]);rect(19,10,4,5,p[2]);rect(15,18,4,6,INK);poly([[9,25],[24,25],[27,28],[7,28]],IRON);},
};
const cache=new Map();
export function pixelBulletIcon(id){
 if(cache.has(id))return cache.get(id);
 const def=BULLET_MAP[id],draw=DRAW[id];if(!def||!draw)return '';
 const canvas=painter(PALETTES[def.element]);draw(canvas);
 const pixels=canvas.pixels,outlined=pixels.map(row=>[...row]);
 for(let y=2;y<30;y++)for(let x=2;x<30;x++)if(pixels[y][x])for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(!pixels[y+dy][x+dx])outlined[y+dy][x+dx]=INK;
 const rects=[];
 for(let y=1;y<31;y++)for(let x=1;x<31;){const color=outlined[y][x];if(!color){x++;continue;}let end=x+1;while(end<31&&outlined[y][end]===color)end++;rects.push('<rect x="'+x+'" y="'+y+'" width="'+(end-x)+'" height="1" fill="'+color+'"/>');x=end;}
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">'+rects.join('')+'</svg>';
 const uri='data:image/svg+xml,'+encodeURIComponent(svg);cache.set(id,uri);return uri;
}
