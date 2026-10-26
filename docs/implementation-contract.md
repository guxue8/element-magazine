# 实现共享契约

所有模块 ES Modules、无依赖。数字品质 0白/1绿/2蓝/3紫/4橙。元素键 fire/water/lightning/wind/earth。内容目录 `src/catalog.js` 导出：

```js
ELEMENTS = {fire:{name:'火',symbol:'焰',color:'#ff7955'},water:{name:'水',symbol:'潮',color:'#59c7fa'},lightning:{name:'雷',symbol:'电',color:'#c6a4ff'},wind:{name:'风',symbol:'岚',color:'#68e2b6'},earth:{name:'岩',symbol:'砾',color:'#e4b969'}};
RARITIES = [{name:'普通',label:'白',color:'#aab5c3'}, /* five total */];
BULLETS = [{id,name,element,rarity,style,trigger:'shot'|'timer'|'passive'|'consumable',counter:0|1|2|3,description}];
BULLET_MAP = Object.fromEntries(BULLETS.map(x=>[x.id,x]));
BONDS = [{id,name,requirements:{fire:3},grade:'normal'|'core'|'evolution',description,targetId:null,whiteRequired:0,stages:[]}];
BOND_MAP = ...;
ENCHANTMENTS = [{id,name,element,kind:'mark'|'slot',description}];
ENCHANTMENT_MAP = ...;
ENEMIES = {walker:{id,name,hp,move,range,damage,description},runner,shield,spear,bug,drummer,healer,bomber,boss1,boss2,boss3};
WAVES = [['walker'],['walker','runner'], ...]; // 18 arrays, 53 total
TALENTS = [{id,name,description,costs:[1,2]}]; // body,repair,supply,refresh,remove,swap,emergency,focus,medicine,reroll
EVENTS = [{id:'anvil'|'circuit'|'supplies'|'camp',name,description}];
```

火F01–21、雷L01–21、风W01–21采用文档编号；水H01–21、岩R01–21按水岩分册表行顺序。卷轴C01–08。所有 lookup 都按以上真实 id。

`random.js`: `random(state)` 更新 `state.rng` 返回0..1；`shuffle(state,array)` 返回乱序副本；`sample(state,array,count,weightFn=()=>1)` 不放回副本。

Run 对象必须可 JSON 往返：

```js
{
 version:1,id:'run-...',seed:123,rng:123,phase:'supply'|'prepare'|'locked'|'ended',
 round:1,batch:1,completedBatches:0,isCleanup:false,
 hp:100,maxHp:100,shield:0,
 resources:{draft:100,refresh:10,remove:30,swap:20},
 inventory:[{uid:'b1',typeId:'F01',counter:0,mark:null,temp:{}}],
 magazine:Array(12).fill(null), // uid, not typeId
 rest:null, // or {uid,slot}
 slots:Array.from({length:12},()=>({engraving:null,charge:0,recycleRound:0})),
 enemies:[{uid:'e1',typeId:'walker',hp:30,maxHp:30,shield:0,lane:0,position:6,burn:0,burnTurns:0,wet:0,slow:false,controlledAt:-2,attackCount:0,boost:0}],
 summons:[{uid:'s1',kind:'spring'|'cannon'|'guard',life:2,created:1,sourceId:'H01',variant:null}],
 bonds:[],evolutions:{}, // {E01:{progress:0}}
 offers:null, // {kind:'bullet'|'bond'|'scroll'|'event'|'enchant',cards:[string ids],source:string,cost?:100, ...}
 pending:[], // queued reward descriptors, campaign manages
 selectedTarget:null,
 logs:[], // string messages of last combat
 stats:{kills:0,bossKills:0,damage:0,turns:0},
 defeatedBosses:[], // unique boss typeIds
 traits:{}, // saved talent levels at run start
 handled:[], // handled opportunity ids
 eventOrder:[],
 outcome:null, // 'victory'|'defeat'
 reward:0,nextUid:10
}
```

Combat input assumes phase prepare/locked and 12-length magazine, inventory id references valid. `resolveRound(run)` must clone input and return `{state,frames,summary}`. It performs counters, scrolls, shots/passives, summons, burn, enemies, consumable removal, evolution growth. It updates kill currency +10, statistics and `defeatedBosses`. It does NOT change round/batch, fixed income, offers, pending, phase, meta. `summary` may be string or structured report; state.logs must be strings. Use `nextUid++` for summons. Export `implementedBulletIds` for coverage verification (all113).

Frames: `{type:'shot'|'summon'|'enemy'|'status'|'log',text,slot?:0,targetId?:'e1',element?:'fire',amount?:8,board:{enemies,summons,hp,shield}}`. Snapshots independent of later mutations. Cap redundant log frames if needed but preserve visible attacks.

Campaign API:

```js
newRun(seed=Date.now(),meta=createMeta()) -> Run
act(run, action) -> {run,frames:[],error:null|string} // immutable, errors retain original run
getCounts(run) -> {fire,water,lightning,wind,earth}
getActiveBonds(run) -> array of bond ids
getIntent(enemy,run) -> Chinese string
previewWave(batch) -> array of enemy definition objects, [] beyond18
createMeta() -> {version:1,points:0,earned:0,talents:{},settledRuns:[],wins:0,bestBatch:0}
buyTalent(meta,id) -> new meta or original when cannot afford
resetTalents(meta) -> refunded meta
applyRunReward(meta,run) -> new meta, idempotent; only ended runs
```

Actions:

```js
{type:'draft',cost:100|200|300,focus?:'fire'}
{type:'choose',index:0|1|2,target?:string|number} // target uid for mark, slot index for engraving
{type:'skip'}; {type:'refresh'}; {type:'load'}
{type:'swap',a:0,b:1}; {type:'remove',slot:0}
{type:'rest',slot:0}; {type:'undoRest'}; {type:'target',uid:'e1'|null}
{type:'execute'} // resolve then advance campaign, returns frames; UI locks while playing them
{type:'rerollStart'}
```

Offers for events can use full card objects `{id,name,description,kind?,...}` instead of string ids; UI normalize using catalogs for string ids. Anvil/circuit enchant choosing needs a target: UI show target picker before act choose. Slots inspect all12 indices; marks require allowed permanent instance (attack-only marks require shot or damaging timer; campaign validates).

Storage exports `loadGame()->{run:null|Run,meta:Meta,warning:null|string}`, `saveGame(run,meta)->null|string`. Single namespaced key, validation, no browser globals at import so Node tests work. On receiving a saved run.phase='locked', UI calls act execute once deterministically, saves returned advanced state. UI saves a clone with phase locked before execute; final result saved before animation. While animations play no commands can mutate run.

UI creates a run from landing-page button only, never auto-start on load without saved run. It imports catalog/campaign/storage (root owned). UI owns only index.html/style.css/app.js and optional UI modules/assets. Root owns package, random, campaign, storage, server/build, CI and README. Combat implementer owns combat*.js and combat tests. Content implementer owns catalog.js and catalog tests.
