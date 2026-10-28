// Presentation vocabulary only. Stable save IDs and combat types stay unchanged.
import {BULLETS} from './catalog.js';
const SPECIAL_NAMES={F12:'炎爆咒',F14:'焚天星雨',L11:'封雷咒',L13:'终相雷仪',L12:'聚能屏障',L21:'天罚雷光',L18:'引雷结界',R19:'空境咒',R17:'探岩术'};
const NAMES=BULLETS.map(b=>[b.name,SPECIAL_NAMES[b.id]||b.name.replace(/弹$/,'术').replace(/芯$/,'结界')]).sort((a,b)=>b[0].length-a[0].length);
const TERMS=[
 ['装填弹夹','布置法阵'],['普通击发','即时施法'],['弹阵执行中','法阵施放中'],
 ['火药桶','炎爆咒'],['群爆核心','焚天星雨'],['雷罐弹','封雷咒'],['终相线圈','终相雷仪'],['待机屏障','聚能屏障'],['磁轨歼击','天罚雷光'],['磁轨芯','引雷结界'],['空膛弹','空境咒'],['取样弹','探岩术'],['铸火环','铸火仪式'],
 ['计时弹','蓄力法术'],['雷计时','雷系蓄力'],['计时触发','蓄力施法'],['普通弹','即时法术'],['常驻弹','常驻法术'],['原生弹','法术'],['核心弹','核心法术'],['白弹','白色法术'],['子弹','法术'],['火弹','火系法术'],['水弹','水系法术'],['雷弹','雷系法术'],['风弹','风系法术'],['岩弹','岩系法术'],
 ['弹夹','法阵'],['入夹','入阵'],['每夹','每轮'],['本夹','本轮'],['夹末','轮末'],['装填','布阵'],['击发','施法'],['发射','释放'],['射出','释放'],['射击','施法'],['重射','复施'],['招募','研习'],['弹阵','法阵'],
 ['邻弹','邻法术'],['下邻计时','下邻蓄力'],['计时','蓄力'],
];
export function magicText(value){
 let text=String(value??'');
 for(const [from,to] of NAMES)text=text.split(from).join(to);
 for(const [from,to] of TERMS)text=text.split(from).join(to);
 // Named spells ending in 弹 become 术; 弹跳 is a distinct mechanic.
 return text.replace(/([\u4e00-\u9fff]{1,6})弹(?=[<，。：；、\s「」“”·+（()）\d]|$)/g,'$1术');
}
