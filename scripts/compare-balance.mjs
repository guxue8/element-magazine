import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';
import {newRun,createMeta,previewWave} from '../src/campaign.js';
import {simulateCampaign} from './simulate.mjs';

// Rebuild the first wave explicitly so both versions begin with identical
// starter cards and RNG state even when the application's default changes.
export function comparisonRun(seed,version,difficulty=0){
  const run=newRun(seed,{...createMeta(),unlockedDifficulty:10},difficulty);
  run.encounterVersion=version;
  const wave=previewWave(1,difficulty,version);
  if(wave.length!==run.enemies.length)throw new Error('Comparison setup needs a first-wave migration');
  run.enemies.forEach((enemy,i)=>{
    const p=wave[i];
    if(enemy.typeId!==p.id)throw new Error('Comparison first-wave enemy mismatch');
    Object.assign(enemy,{hp:p.hp,maxHp:p.hp,shield:p.shield,difficultyDamage:p.difficultyDamage});
  });
  return run;
}

const mean=(rows,key)=>rows.length?Math.round(rows.reduce((total,row)=>total+row[key],0)/rows.length*100)/100:0;
export function compareBalance(count=100,levels=[0,5,10]){
  const groups=[];
  for(const difficulty of levels)for(const encounterVersion of [2,3]){
    const rows=[];
    for(let seed=1;seed<=count;seed++){
      const result=simulateCampaign(seed,{startRun:comparisonRun(seed,encounterVersion,difficulty)});
      const r=result.run;
      rows.push({seed,outcome:r.outcome,hp:r.hp,kills:r.stats.kills,turns:r.stats.turns,completedBatches:r.completedBatches,saveChecks:result.saveChecks});
    }
    const wins=rows.filter(row=>row.outcome==='victory');
    groups.push({difficulty,encounterVersion,runs:count,wins:wins.length,winRate:wins.length/count,
      meanFinalHp:mean(rows,'hp'),meanWinnerHp:mean(wins,'hp'),meanKills:mean(rows,'kills'),meanWinnerKills:mean(wins,'kills'),
      meanTurns:mean(rows,'turns'),meanCompletedBatches:mean(rows,'completedBatches'),rows});
  }
  return {strategy:'Fixed existing chooseAction policy: no talents, current-card and reachable-bond scores, no target selection or slot swaps, no future RNG/combat inspection. Every action saved and reloaded.',
    limitations:'An automated regression proxy, not a measured human win rate. Versions share seeds and initial cards; extra spawn RNG and kill rewards may change later offers. The policy does not learn or optimize for either version.',groups};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const count=Number(process.argv[2]||100);
  if(!Number.isInteger(count)||count<1)throw new Error('Run count must be a positive integer');
  const report=compareBalance(count);
  if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,groups:report.groups.map(({rows,...summary})=>summary)},null,2));
}
