// Read the supplied combat snapshot, never the final run behind an animation.
// Counts are detail metadata only: the battlefield displays icons without numbers.
const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
export function enemyStatusList(enemy){
  if(!enemy||enemy.hp<=0)return [];
  const list=[];
  if(positive(enemy.burn)&&positive(enemy.burnTurns))list.push({
    id:'burn',icon:'fire',count:enemy.burn,
    label:`燃烧：${enemy.burn} 层，剩余 ${enemy.burnTurns} 回合；敌人行动前按层数造成火伤。`
  });
  if(positive(enemy.wet))list.push({
    id:'wet',icon:'water',label:`潮湿：剩余 ${enemy.wet} 回合，可被相关子弹与羁绊利用。`
  });
  if(enemy.slow===true)list.push({
    id:'slow',icon:'timer',label:'缓行：本回合移动距离 -1；首领至少移动 1 格。'
  });
  if(positive(enemy.shield))list.push({
    id:'shield',icon:'shield',count:enemy.shield,label:`护盾：剩余 ${enemy.shield} 点，优先抵挡伤害。`
  });
  if(typeof enemy.windMark==='string'&&enemy.windMark.length)list.push({
    id:'windMark',icon:'wind',label:'风标：本夹内，其他子弹以此敌人为首击目标时消耗，追加 3 风伤。'
  });
  if(positive(enemy.boost))list.push({
    id:'boost',icon:'talent',count:enemy.boost,label:`鼓舞：下次攻击伤害 +${enemy.boost}，攻击后消失。`
  });
  return list;
}
