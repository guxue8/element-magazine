import test from 'node:test';
import assert from 'node:assert/strict';
import { BONDS, BOND_MAP } from '../src/catalog.js';
import { bondSummary, bondGrowth, bondTags } from '../src/presentation.js';

test('every catalog bond has a concise summary and a grade tag', () => {
  assert.equal(BONDS.length, 61);
  for (const bond of BONDS) {
    const summary = bondSummary(bond.id);
    assert.ok(summary.length > 4 && summary.length <= 75, bond.id);
    assert.notEqual(summary, '暂无羁绊说明', bond.id);
    assert.deepEqual(bondTags(bond.id), [bond.grade === 'evolution' ? '成长' : bond.grade === 'core' ? '核心机制' : '属性强化']);
  }
});

test('unknown bond IDs return safe empty presentation', () => {
  for (const id of [null, undefined, '', 'bad', 'toString', '__proto__', 1]) {
    assert.equal(bondSummary(id), '暂无羁绊说明');
    assert.deepEqual(bondGrowth(id), []);
    assert.deepEqual(bondTags(id), []);
  }
});

test('evolution summaries show the base effect separately from growth', () => {
  for (const bond of BONDS.filter(bond => bond.grade === 'evolution')) {
    assert.ok(!bondSummary(bond.id).includes('成长：'), bond.id);
    assert.deepEqual(bondGrowth(bond.id).map(stage => stage.progress), [2, 5, 9], bond.id);
    assert.equal(bondGrowth(bond.id).length, BOND_MAP[bond.id].stages.length);
    for (const stage of bondGrowth(bond.id)) assert.ok(stage.description.length > 4, bond.id);
  }
  assert.deepEqual(bondGrowth('S01'), []);
});

test('network and empty-slot summaries retain decision-making boundaries', () => {
  const network = bondSummary('D09');
  assert.match(network, /潮湿/);
  assert.match(network, /建网.*首击|首击.*建网/);
  assert.match(network, /3 次/);
  assert.match(network, /6 雷伤/);

  const emptySlot = bondSummary('Q05');
  assert.match(emptySlot, /常驻弹/);
  assert.match(emptySlot, /不补抽/);
  assert.match(emptySlot, /75%/);
  assert.match(emptySlot, /每夹最多 2 次/);
  assert.match(emptySlot, /同源.*1 次/);
});

test('summaries distinguish natural expiry, direct hits, and capped triggers', () => {
  assert.match(bondSummary('D07'), /自然到期/);
  assert.match(bondSummary('D07'), /前 2/);
  assert.match(bondSummary('D07'), /替换无效/);
  assert.match(bondSummary('D15'), /雷→风→雷/);
  assert.match(bondSummary('T05'), /归零.*成功执行/);
  assert.match(bondSummary('E07'), /正常行动/);
  assert.match(bondSummary('E08'), /首次直接命中/);
});

test('each evolution stage keeps its defining trigger or limit', () => {
  const anchors = {
    E01: [/下邻/, /已燃烧.*另一敌/, /两种元素.*至多 2/],
    E02: [/消耗满 2 层.*回填/, /未燃烧.*借火/, /消耗满 2 层.*至多 2/],
    E03: [/另一未潮湿/, /寿命 2 次.*泉灵/, /直接击杀.*不连锁/],
    E04: [/直接击杀.*另一敌/, /重置计数 3→2/, /未直接击杀.*等待给盾分别限次/],
    E05: [/左邻.*仅计时弹/, /附击击杀.*2 格/, /同行、同列.*不叠加/],
    E06: [/两发命中同一敌人.*第三发/, /两发同目标.*40%/, /1→2.*同一来源/],
    E07: [/正常命中.*另一敌/, /给盾 1→2.*上限 2→4/, /自然到期.*替换无效/],
    E08: [/反击结算后.*不能抵挡/, /反击后.*另一敌.*不连锁/, /反击上限 2→3.*第 3 次/],
  };
  for (const [id, rules] of Object.entries(anchors)) {
    const stages = bondGrowth(id);
    rules.forEach((rule, index) => assert.match(stages[index].description, rule, `${id} at ${stages[index].progress}`));
  }
});
