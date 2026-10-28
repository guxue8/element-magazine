import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveRound,implementedBulletIds
} from '../src/combat.js';
export function fixture(ids=['F15'],enemies=[{
}]) {
  return {
    version:1,round:1,batch:1,phase:'prepare',rng:123,hp:100,maxHp:100,shield:0,resources:{
      draft:0,refresh:0,remove:0,swap:0
    },inventory:ids.map((typeId,i)=>({
      uid:`b${i}`,typeId,counter:typeId==='L08'?2:0,mark:null,temp:{
      }
    })),magazine:Array.from({
      length:12
    },(_,i)=>i<ids.length?`b${i}`:null),slots:Array.from({
      length:12
    },()=>({
      engraving:null,charge:0,recycleRound:0
    })),enemies:enemies.map((x,i)=>({
      uid:`e${i}`,typeId:'walker',hp:100,maxHp:100,shield:0,lane:0,position:6,burn:0,burnTurns:0,wet:0,slow:false,controlledAt:-2,attackCount:0,boost:0,...x
    })),summons:[],bonds:[],evolutions:{
    },pending:[],logs:[],stats:{
      kills:0,bossKills:0,damage:0,turns:0
    },defeatedBosses:[],traits:{
    },nextUid:100
  };
} test('immutable deterministic snapshots and no campaign advancement',()=>{
  const r=fixture();
  const before=structuredClone(r);
  const a=resolveRound(r);
  assert.deepEqual(r,before);
  assert.deepEqual(a,resolveRound(r));
  assert.equal(a.state.enemies[0].hp,84);
  assert.equal(a.state.enemies[0].position,5);
  assert.equal(a.state.round,1);
  assert.equal(a.state.resources.draft,0);
  assert.notEqual(a.frames[0].board.enemies,a.state.enemies);
});
test('timers advance only loaded instances; zero waits without a target',()=>{
  let r=fixture(['L08','L08']);
  r.magazine[1]=null;
  let a=resolveRound(r).state;
  assert.equal(a.inventory[0].counter,1);
  assert.equal(a.inventory[1].counter,2);
  a.enemies=[];
  a.inventory[0].counter=1;
  a=resolveRound(a).state;
  assert.equal(a.inventory[0].counter,0);
});
test('summons replace shortest same kind, then act and age once',()=>{
  let r=fixture(['H01']);
  r.inventory[0].counter=1;
  r.summons=[{
    uid:'s0',kind:'spring',life:3,created:0,sourceId:'H01'
  },{
    uid:'s1',kind:'spring',life:1,created:1,sourceId:'H01'
  }];
  let a=resolveRound(r).state;
  assert.equal(a.summons.length,2);
  assert.ok(!a.summons.some(x=>x.uid==='s1'));
  assert.equal(a.inventory[0].counter,1);
  assert.equal(a.enemies[0].hp,88);
});
test('scroll buffs left before shots and removes only used inventory',()=>{
  let r=fixture(['F15','C01','C04']);
  r.magazine[2]=null;
  let a=resolveRound(r).state;
  assert.equal(a.enemies[0].hp,81);
  assert.deepEqual(a.inventory.map(x=>x.typeId),['F15','C04']);
});
test('controls reject previous round and enemies do not attack after moving',()=>{
  let r=fixture(['H08'],[{
    position:1,controlledAt:0
  }]);
  let a=resolveRound(r).state;
  assert.equal(a.enemies[0].position,0);
  assert.equal(a.hp,100);
});
test('kills reward once; burn and direct kill do not duplicate',()=>{
  let r=fixture(['F01'],[{
    hp:8,maxHp:8
  }]);
  let a=resolveRound(r).state;
  assert.equal(a.resources.draft,10);
  assert.equal(a.stats.kills,1);
  assert.equal(a.enemies.length,0);
});
test('all 113 cards have explicit implementation',()=>assert.equal(new Set(implementedBulletIds).size,113));
import {
  BULLETS,BULLET_MAP,BONDS
} from '../src/catalog.js';
for(const def of BULLETS)test(`card ${def.id} executes deterministically with bounded finite state`,()=>{
  const r=fixture([def.id,'F15'],Array.from({
    length:7
  },(_,i)=>({
    hp:500,maxHp:500,lane:i%3,position:3+Math.floor(i/3),burn:2,burnTurns:2,wet:2
  })));
  r.inventory[0].counter=1;
  r.summons=[{
    uid:'spring',kind:'spring',life:3,created:1,sourceId:'H01'
  },{
    uid:'guard',kind:'guard',life:3,created:2,sourceId:'R01'
  },{
    uid:'cannon',kind:'cannon',life:3,created:3,sourceId:'R03'
  }];
  const a=resolveRound(r);
  assert.deepEqual(a,resolveRound(r));
  assert.ok(!JSON.stringify(a).includes('null,"hp":null'));
  assert.ok(a.frames.length<200);
  for(const e of a.state.enemies)assert.ok(Number.isFinite(e.hp)&&e.hp>=0);
  assert.ok(a.state.summons.length<=4);
  assert.ok(a.state.resources.refresh<=2&&a.state.resources.remove<=3);
});
for(const def of BONDS)test(`bond ${def.id} active stage-nine smoke`,()=>{
  const ids=['F16','F11','H18','L11','L14','W03','R03','R11','L15','W01','L15'];
  const r=fixture(ids,Array.from({
    length:7
  },(_,i)=>({
    hp:500,maxHp:500,lane:i%3,position:0,burn:2,burnTurns:2,wet:2
  })));
  for(const element of ['fire','water','lightning','wind','earth']){
    const b=BULLETS.find(b=>b.element===element&&b.rarity===0);
    for(let j=0;
    j<12;
    j++)r.inventory.push({
      uid:`extra-${element}-${j}`,typeId:b.id,counter:b.counter,mark:null,temp:{
      }
    });
  }r.bonds=[def.id];
  r.evolutions[def.id]={
    progress:9
  };
  for(const b of r.inventory)if(BULLET_MAP[b.typeId].trigger==='timer')b.counter=1;
  r.shield=15;
  const a=resolveRound(r);
  assert.ok(a.frames.length<300);
  assert.ok(a.state.hp>=0);
  assert.ok(a.state.shield<=28);
  assert.ok(a.state.resources.refresh<=2&&a.state.resources.remove<=3);
});
test('wind echo does not copy conditional damage, burns or resources',()=>{
  const r=fixture(['F01','W02'],[{
    hp:100,maxHp:100
  }]);
  const a=resolveRound(r).state;
  assert.equal(a.enemies[0].hp,79);
  assert.equal(a.enemies[0].burn,1);
});
test('resource sources share a cap and return-flow heals once',()=>{
  const r=fixture(['H19','C04','H16','H17','H17']);
  r.hp=50;
  const a=resolveRound(r).state;
  assert.equal(a.resources.refresh,2);
  assert.equal(a.hp,60);
  assert.equal(a.enemies[0].hp,60);
});
test('extra timer advancement is shared and cannot advance a chain',()=>{
  const r=fixture(['C05','F17','L08']);
  r.inventory[1].counter=1;
  r.inventory[2].counter=3;
  r.magazine=Array(12).fill(null);
  r.magazine[0]='b0';
  r.magazine[1]='b2';
  const a=resolveRound(r).state;
  assert.equal(a.inventory.find(b=>b.uid==='b2').counter,1);
});
test('engraving charge belongs to slot and clears on lethal first hit',()=>{
  let r=fixture(['L08']);
  r.slots[0]={
    engraving:'G03',charge:4,recycleRound:0
  };
  r.inventory[0].counter=1;
  r.enemies[0].hp=1;
  let a=resolveRound(r).state;
  assert.equal(a.slots[0].charge,0);
  assert.equal(a.stats.kills,1);
});
test('selected target overrides shots but nearest-only scroll ignores selection',()=>{
  const r=fixture(['C03'],[{
    position:0
  },{
    position:1
  },{
    position:2
  },{
    position:6
  }]);
  r.selectedTarget='e3';
  const a=resolveRound(r).state;
  assert.equal(a.enemies.find(e=>e.uid==='e3').wet,0);
});
test('basic multishot receives locked pierce on each segment',()=>{
  const r=fixture(['W01','W14'],[{
    hp:100,maxHp:100,position:4
  },{
    hp:100,maxHp:100,position:5
  }]);
  const a=resolveRound(r).state;
  assert.deepEqual(a.enemies.map(e=>e.hp),[86,88]);
});
test('isolated lightning uses pre-hit neighborhood without counting itself',()=>{
  const a=resolveRound(fixture(['L02'])).state;
  assert.equal(a.enemies[0].hp,78);
});
test('damage percentages round once over a native conditional segment',()=>{
  // R10 spends 3 shield: (8 + 9) * 1.15 rounds to 20, not 9 + 10.
  const r=fixture(['R10','R15','R15']);
  r.magazine[1]=r.magazine[2]=null;
  r.shield=3;
  r.bonds=['S13'];
  const a=resolveRound(r).state;
  assert.equal(a.enemies[0].hp,80);
});
test('returning chain is not a native multishot evolution growth event',()=>{
  const r=fixture(['L05','W03','W01','W01'],[{
    hp:1000,maxHp:1000
  },{
    hp:1000,maxHp:1000,position:5
  }]);
  r.magazine[1]=r.magazine[2]=r.magazine[3]=null;
  r.bonds=['E06'];
  r.evolutions={
    E06:{
      progress:0
    }
  };
  assert.equal(resolveRound(r).state.evolutions.E06.progress,0);
});
test('evolution grows only at end and survives inactive rounds',()=>{
  const r=fixture(['W03','W01','W01']);
  r.magazine[1]=r.magazine[2]=null;
  r.bonds=['E06'];
  r.evolutions={
    E06:{
      progress:1
    }
  };
  const a=resolveRound(r).state;
  assert.equal(a.evolutions.E06.progress,2);
  assert.equal(a.enemies[0].hp,85);
  a.round++;
  a.inventory=a.inventory.slice(0,1);
  a.enemies[0].hp=100;
  const b=resolveRound(a).state;
  assert.equal(b.evolutions.E06.progress,2);
  assert.equal(b.enemies[0].hp,87);
});
test('natural expiration runs after every summon action; replacement never explodes',()=>{
  const r=fixture(['R01']);
  r.bonds=['D07'];
  for(let i=0;
  i<5;
  i++)r.inventory.push({
    uid:'f'+i,typeId:'F15',counter:0,temp:{
    }
  });
  for(let i=0;
  i<2;
  i++)r.inventory.push({
    uid:'r'+i,typeId:'R15',counter:0,temp:{
    }
  });
  r.summons=[{
    uid:'s1',kind:'guard',life:1,created:1,sourceId:'R01'
  },{
    uid:'s2',kind:'guard',life:2,created:2,sourceId:'R01'
  }];
  r.inventory[0].counter=1;
  assert.equal(resolveRound(r).state.enemies[0].hp,100);
});
test('consumed element counts remain locked until round end',()=>{
  const r=fixture(['F15','F15','C01'],[{burn:1,burnTurns:2}]);
  r.bonds=['S01'];
  const a=resolveRound(r).state;
  // The consumed fire scroll still satisfies S01 for both later fire shots.
  assert.equal(a.enemies[0].burn,3);
  assert.equal(a.enemies[0].hp,59);
  assert.equal(a.inventory.length,2);
});
test('burn-consuming conditional damage is native, amplified, and grants native kill listeners',()=>{
  const r=fixture(['F11','F15','F15','R18'],[{
    hp:27,maxHp:27,burn:2,burnTurns:2
  }]);
  r.magazine[1]=r.magazine[2]=null;
  // S03 now owns the conditional fire multiplier; S01 grows existing burn.
  r.bonds=['S03'];
  for(let i=0;i<7;i++)r.inventory.push({uid:`fire-filler${i}`,typeId:'F15',counter:0,mark:null,temp:{}});
  const a=resolveRound(r).state;
  assert.equal(a.resources.remove,3);
  assert.equal(a.stats.kills,1);
});
test('counter opportunity pool is shared and stage-nine bonus belongs only to shatter',()=>{
  const r=fixture(['R13','R11','R11','R11'],Array.from({
    length:5
  },()=>({
    hp:1000,maxHp:1000,position:0
  })));
  r.inventory[0].counter=1;
  r.bonds=['E08'];
  r.evolutions={
    E08:{
      progress:9
    }
  };
  const a=resolveRound(r);
  assert.equal(a.frames.filter(f=>f.type==='shot'&&f.element==='earth'&&f.amount===10).length,3);
});
test('summon instruction does not repeat normal-action healing or age twice',()=>{
  const r=fixture(['H04']);
  for(let i=0;
  i<9;
  i++)r.inventory.push({
    uid:`h${i}`,typeId:'H15',counter:0,mark:null,temp:{
    }
  });
  r.summons=[{
    uid:'s1',kind:'spring',life:2,created:1,sourceId:'H01'
  }];
  r.bonds=['S06'];
  r.hp=50;
  const a=resolveRound(r).state;
  assert.equal(a.hp,52);
  assert.equal(a.summons[0].life,1);
  assert.equal(a.enemies[0].hp,82);
});
test('bomber self destruction gives no kill currency and death stops later attacks',()=>{
  const r=fixture([], [{
    typeId:'bomber',position:0
  },{
    typeId:'walker',position:0
  }]);
  r.hp=5;
  const a=resolveRound(r);
  assert.equal(a.state.hp,0);
  assert.equal(a.state.resources.draft,0);
  assert.equal(a.frames.filter(f=>f.type==='enemy').length,1);
});
test('echo boss kills keep universal kill rewards and talent repair',()=>{
  const r=fixture(['F15','W02'],[{
    hp:12,maxHp:12,position:4
  },{
    typeId:'boss1',hp:11,maxHp:180,position:5
  }]);
  r.hp=50;
  r.traits.repair=2;
  const a=resolveRound(r).state;
  assert.equal(a.stats.bossKills,1);
  assert.equal(a.hp,56);
  assert.deepEqual(a.defeatedBosses,['boss1']);
  assert.equal(a.resources.draft,20);
});
test('emergency talent triggers immediately once and never resurrects',()=>{const r=fixture([], [{position:0},{position:0}]);r.hp=31;r.traits.emergency=1;const a=resolveRound(r).state;assert.equal(a.hp,25);assert.equal(a.shield,4);assert.equal(a.emergencyUsed,true);a.round++;a.shield=0;const b=resolveRound(a).state;assert.equal(b.hp,13);assert.equal(b.shield,0);});
test('healer birth-stage power stays frozen across later batches, including old saves',()=>{
  for(const [maxHp,heal] of [[30,6],[48,9],[72,12]]){
    for(const saved of [false,true]){
      const r=fixture([], [{typeId:'healer',hp:maxHp,maxHp,position:3,...(saved?{heal}:{})},{hp:10,maxHp:100,position:6}]);
      r.batch=18;
      const a=resolveRound(r).state;
      assert.equal(a.enemies.find(e=>e.uid==='e1').hp,10+heal);
    }
  }
});
