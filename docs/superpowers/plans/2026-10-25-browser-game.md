# 弹阵：元素守线 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成可以从 GitHub Pages 链接直接游玩的中文单机肉鸽游戏，包含已批准的完整内容池与一整局流程。

**Architecture:** 使用静态 ES Modules；内容数据、纯战斗结算、战役操作与 DOM/Canvas 画面分别维护。所有随机通过保存状态的 PRNG，操作返回新状态，localStorage 原子保存。GitHub Pages 使用相对路径和无后端静态部署。

**Tech Stack:** HTML、CSS、JavaScript ES Modules、Node.js 24 内置测试和静态服务器；零运行时第三方依赖。

## Global Constraints

- 一个 3 行 × 4 列弹夹就是一个回合；旧怪未清不影响下一批入场，18 批后收尾。
- 初始随机 4 枚白色常驻弹，名称不同、至少 3 枚普通弹、同属性最多 2 枚；合法组合等概率。
- 105 常驻弹＋8 消耗弹、53 基础羁绊＋8 进化、10 附魔；引用 specs 中真实描述与数值。
- 装填按实体不放回，计时绑定实体；不足 12 枚先随机排列、填入前 N 格。
- 招募和羁绊允许跳过，费用与机会不退；前 3 批候选元素互异。
- 删除从本局背包永久移除单个实体，最低 3 常驻且 2 普通；删除 30、换位 10、刷新 10。
- 游戏无需账号或后端；资源地址使用相对路径，支持任意 GitHub Pages 仓库子路径。
- 存档包含 RNG、候选、已处理奖励、计时、附魔、进化；重复载入不能重发奖励。
- 无既有 Git 仓库，在用户指定的 D:/gamegame 内实现，不需要创建额外工作树。

## 文件与接口

- `src/catalog.js`: 105＋8 卡、61 羁绊、10 附魔、敌人、18 波、事件、天赋的静态数据。
- `src/random.js`: `random(state)` 更新 state.rng 并返回 [0,1)；`shuffle(state,array)` 返回打乱副本；`sample(state,array,count,weightFn)` 不放回。
- `src/combat.js` 与其辅助模块: `resolveRound(run) -> {state,frames,summary}`，不产生下一波或阶段收入。
- `src/campaign.js`: `newRun(seed,meta)`、`act(run,action)->{run,frames,error}`、计数／意图／激活羁绊／天赋函数。
- `src/storage.js`: 本地保存与校验，备份损坏存档而不静默丢失局外数据。
- `src/app.js`, `index.html`, `style.css`: 中文 UI、Canvas 三通道战场、12 格弹夹、供给选择、图鉴、天赋、说明、战报、结算。
- `scripts/serve.mjs`, `scripts/build.mjs`, `.github/workflows/pages.yml`: 本地预览、静态导出、GitHub Pages 自动部署。
- `tests/*.test.js`: 内容覆盖、关键战斗机制、战役与存档、完整流程。
- `docs/implementation-contract.md`: 精确共享数据契约，独立实现任务必须遵循。

## Task 1: 内容目录与规则数据

**Files:** `src/catalog.js`, `tests/catalog.test.js`。

**Interfaces:** 导出契约中的字典与数组。火 F01–21、水 H01–21、雷 L01–21、风 W01–21、岩 R01–21，卷轴 C01–08，羁绊原编号。

- [ ] 写并运行数量／唯一性／引用／波次总量测试，确认尚无目录时失败。

```js
assert.equal(BULLETS.filter(x=>x.trigger!=='consumable').length,105);
assert.equal(new Set(BULLETS.map(x=>x.id)).size,113);
assert.equal(BONDS.length,61);
assert.equal(WAVES.reduce((n,w)=>n+w.length,0),53);
```

- [ ] 从批准的 Markdown 表转录字段，保留描述与品质，定义映射与类别，不给卡牌填充通用假效果。
- [ ] 执行 `node --test tests/catalog.test.js`，检查全部通过；自审每个引用都可解析。

## Task 2: 战斗结算

**Files:** `src/combat.js`, `src/combat-effects.js`, `src/combat-bonds.js`, `tests/combat.test.js`。

**Interfaces:** 输入与输出遵循共享契约；纯函数克隆输入。frames 含每步战场快照供 UI 播放，结算不依赖动画时长。

- [ ] 写计时等待／入夹推进、召唤替换、携带方向、一次性使用、状态和敌方先移后攻等失败测试。

```js
const before=structuredClone(run);
const result=resolveRound(run);
assert.deepEqual(run,before);
assert.equal(result.state.inventory.find(x=>x.uid===timerId).counter,1);
assert.equal(result.state.enemies[0].position,5);
```

- [ ] 实现所有卡牌 dispatch、有限派生事件、53 基础羁绊与 8 进化；用局部计数器限制递归、资源与召唤行动。
- [ ] 覆盖：没有目标计时保持 0、实际击杀才发奖、一次性夹末消耗不闪断羁绊、旧怪保留、造物寿命、全部伤害模式都有实现。
- [ ] 执行 `node --test tests/combat.test.js`；为全部卡牌运行有合法目标的执行健全性检查。

## Task 3: 战役、随机、存档与局外天赋

**Files:** `src/random.js`, `src/campaign.js`, `src/storage.js`, `tests/campaign.test.js`。

**Interfaces:** `act` 接收 draft/choose/skip/refresh/load/swap/remove/rest/undoRest/target/execute 等操作，验证阶段、费用与目标；失败保留原状态。

- [ ] 写随机起手约束、跳过不退款、删除最低数量、换位扣费、不放回、旧怪跨波、三倍解锁和存档复现测试。

```js
let run=newRun(123,createMeta());
assert.equal(run.inventory.length,4);
const paid=act(run,{type:'draft',cost:100}).run;
const skipped=act(paid,{type:'skip'}).run;
assert.equal(skipped.resources.draft,0);
assert.equal(skipped.inventory.length,4);
```

- [ ] 实现 18 批增援、事件/羁绊/首领奖励队列、3 档招募、4 类事件、印记与槽位刻印、天赋购买与重置。
- [ ] 保存一次操作的完整结果，已锁定回合允许确定性重放；结果奖励按 run.id 去重。
- [ ] 执行 `node --test tests/campaign.test.js`，验证跨回合和重复读取。

## Task 4: 可操作的完整游戏界面

**Files:** `index.html`, `style.css`, `src/app.js`，可新增仅 UI 的模块。

**Interfaces:** UI 只调用 campaign API，不自创战斗规则；读取 catalog 显示真实效果。执行前保存锁定快照，执行结果立即保存，动画只负责表现。

- [ ] 实现桌面主战场：左侧玩家，右侧敌人，生命/护盾/状态/下一步意图；显示下一批预览、上轮战报。
- [ ] 实现 3×4 弹夹、选中详情、换位/删除/休止、三档招募、所有三选一和跳过、羁绊进度、背包与图鉴。
- [ ] 以深色遗迹与元素光效形成可读的统一视觉；使用 CSS/SVG/Canvas 绘制角色、敌人、子弹与特效。
- [ ] 实现暂停／快进、音效开关、帮助、重新开始、继续存档、天赋、胜负结算；窄屏允许纵向滚动。
- [ ] 本地浏览器手动验证从开局到首个羁绊、跳过招募、装填换位、执行与读档；检查真实截图。

## Task 5: 静态发布与最终验收

**Files:** `package.json`, `scripts/build.mjs`, `scripts/serve.mjs`, `.github/workflows/pages.yml`, `README.md`, `tests/integration.test.js`。

- [ ] 配置 `npm test` 为 `node --test`，`npm run dev` 为本地服务器，`npm run build` 复制白名单网页文件到 dist 并写 `.nojekyll`。
- [ ] GitHub Actions 在 push main/master 或手动运行时测试、导出、上传 Pages artifact、部署；不使用固定仓库名或根路径。
- [ ] 测试目录与仓库子路径均返回 index.html 与模块；资源不依赖外网。
- [ ] 自动完成多种固定种子的回合流程与所有卡牌、羁绊健全性检查；确认状态可 JSON 往返且无 NaN。
- [ ] 独立代码审阅，对发现的实质问题补回归测试和修复；完整重跑 `npm test` 与 `npm run build`。
- [ ] 交付本地可试玩入口与 GitHub 上传说明；只有真实部署成功才报告公网链接。

## 执行记录

- 已批准设计；用户追加明确要求 GitHub Pages，采用相对路径静态网页，不使用 Sites 托管。
- 尚无代码基线或 Git 仓库。按本计划在当前工作区持续执行，分派边界独立的内容、战斗、界面任务；根代理负责战役与集成。
