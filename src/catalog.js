// Maintained game data. The legacy generator is a historical seed, not an update command.

export const ELEMENTS = {
  "fire": {
    "name": "火",
    "symbol": "焰",
    "color": "#ff7955"
  },
  "water": {
    "name": "水",
    "symbol": "潮",
    "color": "#59c7fa"
  },
  "lightning": {
    "name": "雷",
    "symbol": "电",
    "color": "#c6a4ff"
  },
  "wind": {
    "name": "风",
    "symbol": "岚",
    "color": "#68e2b6"
  },
  "earth": {
    "name": "岩",
    "symbol": "砾",
    "color": "#e4b969"
  }
};

export const RARITIES = [
  {
    "name": "普通",
    "label": "白",
    "color": "#aab5c3"
  },
  {
    "name": "优良",
    "label": "绿",
    "color": "#68d994"
  },
  {
    "name": "稀有",
    "label": "蓝",
    "color": "#65afff"
  },
  {
    "name": "史诗",
    "label": "紫",
    "color": "#ba8dff"
  },
  {
    "name": "传说",
    "label": "橙",
    "color": "#ffb65c"
  }
];

export const BULLETS = [
  {
    "id": "F01",
    "name": "火星弹",
    "element": "fire",
    "rarity": 0,
    "style": "灼烧",
    "trigger": "shot",
    "counter": 0,
    "description": "8 火伤，附加 1 层燃烧。"
  },
  {
    "id": "F02",
    "name": "余烬弹",
    "element": "fire",
    "rarity": 0,
    "style": "灼烧",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 6 火伤；若本体击杀该目标，给其死亡位置邻域 1 格内最近另一敌人附加 2 层燃烧。每实体每夹最多传播 1 次，无合法接收者则不传播。"
  },
  {
    "id": "F03",
    "name": "燎原弹",
    "element": "fire",
    "rarity": 1,
    "style": "灼烧",
    "trigger": "shot",
    "counter": 0,
    "description": "7 火伤；目标及其邻域 1 格内最近另一敌人各附加 1 层燃烧。"
  },
  {
    "id": "F04",
    "name": "传薪弹",
    "element": "fire",
    "rarity": 1,
    "style": "灼烧",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 9 火伤；若命中前主目标已燃烧，记录其最多 2 层燃烧，命中后给邻域 1 格内最近另一敌人附加等量层数，不消耗主目标层数。每实体每夹只转移 1 次，主目标被击杀也可按命中前快照传播。"
  },
  {
    "id": "F05",
    "name": "薪火弹",
    "element": "fire",
    "rarity": 2,
    "style": "灼烧",
    "trigger": "shot",
    "counter": 0,
    "description": "6 火伤，附加 2 层燃烧。即时伤害低，适合提前堆层。"
  },
  {
    "id": "F06",
    "name": "赤潮弹",
    "element": "fire",
    "rarity": 3,
    "style": "灼烧",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 24 火伤、3 层燃烧；爆炸半径 2，其余敌人受 12 火伤、1 层燃烧。距爆心超过 1 格的溅射基础伤害减半，向上取整。不限目标数。"
  },
  {
    "id": "F07",
    "name": "烬冠弹",
    "element": "fire",
    "rarity": 4,
    "style": "灼烧",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 10 火伤；记录其命中前燃烧层数 N，上限 5。命中后立即额外结算该目标一次 N 层燃烧伤害，不减少燃烧层数或剩余次数；再对其邻域 2 格内最近另外至多 2 个敌人各造成 2N 火伤。每实体每夹只兑现 1 次；主目标死亡时跳过对它的额外结算，外溅仍使用快照 N。"
  },
  {
    "id": "F08",
    "name": "花火弹",
    "element": "fire",
    "rarity": 0,
    "style": "引爆",
    "trigger": "shot",
    "counter": 0,
    "description": "主目标 6 火伤；爆炸半径 1 内其余所有敌人各受 2 火伤。范围在施放时锁定，每敌仅命中一次。"
  },
  {
    "id": "F09",
    "name": "裂壳弹",
    "element": "fire",
    "rarity": 0,
    "style": "引爆",
    "trigger": "shot",
    "counter": 0,
    "description": "先移除主目标最多 4 点护盾，再造成 14 火伤。移除护盾不伤生命、不算命中，不触发反击、击杀或其他移盾效果；每实体每夹只移除 1 次。"
  },
  {
    "id": "F10",
    "name": "导爆弹",
    "element": "fire",
    "rarity": 1,
    "style": "引爆",
    "trigger": "shot",
    "counter": 0,
    "description": "主目标 9 火伤。若本体击杀，死亡位置爆炸半径 1 内其余所有敌人各受 6 火伤；衍生爆炸不会再引爆。"
  },
  {
    "id": "F11",
    "name": "热熔弹",
    "element": "fire",
    "rarity": 2,
    "style": "引爆",
    "trigger": "shot",
    "counter": 0,
    "description": "8 火伤；消耗目标至多 2 层燃烧，每消耗一层额外造成 8 火伤。"
  },
  {
    "id": "F12",
    "name": "火药桶",
    "element": "fire",
    "rarity": 2,
    "style": "引爆",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 32 火伤；爆炸半径 1 内其余所有敌人各受 12 火伤。每敌仅命中一次。"
  },
  {
    "id": "F13",
    "name": "熔核弹",
    "element": "fire",
    "rarity": 3,
    "style": "引爆",
    "trigger": "timer",
    "counter": 3,
    "description": "主目标 80 火伤，消耗其全部燃烧，每层追加 8 火伤；爆炸半径 2 内其余所有敌人各受 20 火伤。距爆心超过 1 格的溅射基础伤害减半，向上取整。无固有潜伏。"
  },
  {
    "id": "F14",
    "name": "群爆核心",
    "element": "fire",
    "rarity": 4,
    "style": "引爆",
    "trigger": "timer",
    "counter": 3,
    "description": "以燃烧层数最多的敌人为中心，造成 60 火伤；爆炸半径 3，其余敌人受 30 火伤。距爆心超过 1 格的溅射基础伤害减半，向上取整。每名目标分别消耗至多 3 层燃烧，每层另追加 6 火伤。不限目标数。平局按选敌顺序。"
  },
  {
    "id": "F15",
    "name": "赤铜弹",
    "element": "fire",
    "rarity": 0,
    "style": "锻炉",
    "trigger": "shot",
    "counter": 0,
    "description": "16 火伤。稳定承接方向强化。"
  },
  {
    "id": "F16",
    "name": "引信弹",
    "element": "fire",
    "rarity": 1,
    "style": "锻炉",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 7 火伤；右邻弹首次本体命中附加 5 火伤。"
  },
  {
    "id": "F17",
    "name": "淬火弹",
    "element": "fire",
    "rarity": 1,
    "style": "锻炉",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 9 火伤；若命中前主目标已燃烧，本次命中后尝试使正下方尚未执行的计时弹额外减 1。每实体每夹最多尝试推进 1 次，目标共享每回合 1 次额外推进上限；越界、空槽或无合法目标则不推进。"
  },
  {
    "id": "F18",
    "name": "承炉弹",
    "element": "fire",
    "rarity": 2,
    "style": "锻炉",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 6 火伤；布局锁定时，同一行其他白色普通发射弹获得“首次本体命中附加 3 火伤”。最多强化另外 3 枚，每个受强化实体每夹兑现 1 次；不强化白色计时弹或携带弹。"
  },
  {
    "id": "F19",
    "name": "熔铆弹",
    "element": "fire",
    "rarity": 2,
    "style": "锻炉",
    "trigger": "passive",
    "counter": 0,
    "description": "上下相邻弹首次本体命中燃烧目标时，附加 8 火伤，此项附伤无视护甲但仍被护盾吸收。最多强化 2 枚，每个目标实体每夹兑现 1 次；携带源自身不发射。"
  },
  {
    "id": "F20",
    "name": "铸火环",
    "element": "fire",
    "rarity": 3,
    "style": "锻炉",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 60 火伤。成功施放后，同列下方尚未施放的普通魔法首次本体命中各附加 18 火伤，最多强化 2 枚。无目标不重置。"
  },
  {
    "id": "F21",
    "name": "炬炉芯",
    "element": "fire",
    "rarity": 4,
    "style": "锻炉",
    "trigger": "passive",
    "counter": 0,
    "description": "上下左右相邻弹首次本体命中附加 3 火伤及 1 层燃烧。 炉心定位：装填前背包火属性实体至少 6 枚时获得本次磁引、权重 ×2，否则维持默认；包含尚未消耗的火卷轴，不保证入夹。"
  },
  {
    "id": "H01",
    "name": "泉种弹",
    "element": "water",
    "rarity": 0,
    "style": "潮灵召唤",
    "trigger": "timer",
    "counter": 1,
    "description": "召唤 1 泉灵，寿命 2 次正常行动。首次入阵即可召唤；每实体每回合最多召唤一次，成功后重置为 1。遵循造物容量上限。"
  },
  {
    "id": "H02",
    "name": "引泉弹",
    "element": "water",
    "rarity": 0,
    "style": "潮灵召唤",
    "trigger": "shot",
    "counter": 0,
    "description": "对首目标造成 10 水伤；若执行本槽时已有泉灵或其变体，给命中后仍存活的首目标施加潮湿。 每实体每回合最多命中 1 个敌人、最多 1 次施湿；不命令造物行动。"
  },
  {
    "id": "H03",
    "name": "潮灵弹",
    "element": "water",
    "rarity": 1,
    "style": "潮灵召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "召唤 1 泉灵，寿命 3 次正常行动，并立即指令其行动一次，不提前消耗寿命。每实体每回合最多召唤一次，成功后重置为 2。遵循造物容量上限。"
  },
  {
    "id": "H04",
    "name": "唤泉令",
    "element": "water",
    "rarity": 1,
    "style": "潮灵召唤",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 6 水伤；随后令创建最早、尚未接受本回合指令的 1 只泉灵立即行动，包括泉灵变体。 每实体每回合最多 1 次攻击、1 次指令；没有敌人时可跳过直接伤害，仍尝试发出指令。"
  },
  {
    "id": "H05",
    "name": "雾泉弹",
    "element": "water",
    "rarity": 2,
    "style": "潮灵召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "召唤 1 雾泉灵，寿命 2 次正常行动，并立即指令其行动。其行动额外给予 2 护盾，每只每回合一次，指令与正常行动共享。"
  },
  {
    "id": "H06",
    "name": "唤潮弹",
    "element": "water",
    "rarity": 3,
    "style": "潮灵召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "召唤泉灵与礁炮各 1，寿命 3 次正常行动。主目标 24 水伤；爆炸半径 1 内其余敌人各受 12 水伤。任一召唤成功即重置；无敌人时只跳过伤害。"
  },
  {
    "id": "H07",
    "name": "百川潮令",
    "element": "water",
    "rarity": 4,
    "style": "潮灵召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 36 水伤；爆炸半径 2，其余敌人受 12 水伤，距爆心超过 1 格的溅射基础伤害减半。召唤 2 泉灵，寿命 3，并分别立即指令；无敌人也可召唤。"
  },
  {
    "id": "H08",
    "name": "霜钉弹",
    "element": "water",
    "rarity": 0,
    "style": "寒潮",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 9 水伤，尝试施加缓行。 每实体每回合 1 次攻击、最多 1 次缓行；遵守控制抗性。"
  },
  {
    "id": "H09",
    "name": "冰棱弹",
    "element": "water",
    "rarity": 0,
    "style": "寒潮",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 水伤；若命中前该目标本回合已经成功受到缓行，额外造成 6 水伤。 每实体每回合最多 1 次条件增伤；自身不施加或刷新控制。"
  },
  {
    "id": "H10",
    "name": "寒径弹",
    "element": "water",
    "rarity": 1,
    "style": "寒潮",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 7 水伤并尝试缓行；若首目标因控制抗性而无法被缓行，改为对同位置或后方最近一名没有控制抗性的敌人尝试缓行。 每实体每回合最多成功缓行 1 个敌人；只转移一次，不遍历重试，不对后方目标追加伤害。"
  },
  {
    "id": "H11",
    "name": "冰封弹",
    "element": "water",
    "rarity": 2,
    "style": "寒潮",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 7 水伤；邻域 1 格内最近另一敌人受 5 水伤；分别尝试对两者施加缓行。 每实体每回合至多攻击和尝试控制 2 个不同敌人；每敌仍遵守控制抗性。"
  },
  {
    "id": "H12",
    "name": "凝潮弹",
    "element": "water",
    "rarity": 2,
    "style": "寒潮",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 水伤；若命中前目标已潮湿，消耗潮湿并尝试缓行。如果因控制抗性或 Boss 最低移动规则而不能降低移动，则改为额外造成 8 水伤。 每实体每回合最多消耗 1 次潮湿；缓行与替代增伤二选一，不能同时获得；无潮湿则只有基础伤害。"
  },
  {
    "id": "H13",
    "name": "极夜弹",
    "element": "water",
    "rarity": 3,
    "style": "寒潮",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 30 水伤；爆炸半径 2，其余敌人受 15 水伤，距爆心超过 1 格的溅射基础伤害减半，向上取整。所有命中敌人尝试施加缓行，不限目标数。"
  },
  {
    "id": "H14",
    "name": "寒潮芯",
    "element": "water",
    "rarity": 4,
    "style": "寒潮",
    "trigger": "passive",
    "counter": 0,
    "description": "四邻弹首次本体命中附加 3 水伤；本回合前 2 次由此强化产生的有效本体命中尝试缓行。 每枚被强化实体每回合最多领取 1 次附伤；同名寒潮芯合计最多追加 2 次缓行尝试，不叠加同源附伤。"
  },
  {
    "id": "H15",
    "name": "潮珠弹",
    "element": "water",
    "rarity": 0,
    "style": "循环资源",
    "trigger": "shot",
    "counter": 0,
    "description": "16 水伤。稳定承接方向强化。"
  },
  {
    "id": "H16",
    "name": "润泽弹",
    "element": "water",
    "rarity": 1,
    "style": "循环资源",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 水伤并施加潮湿；本回合首次执行润泽弹获得 2 刷新值，不要求命中。 每实体每回合 1 次攻击、至多 1 次施湿；同名全体每回合仅申请 1 次 +2 刷新，受共享上限截断。"
  },
  {
    "id": "H17",
    "name": "溢流弹",
    "element": "water",
    "rarity": 1,
    "style": "循环资源",
    "trigger": "shot",
    "counter": 0,
    "description": "进入自身槽位时，若本回合战斗刷新收益已经达到 2，则首目标受到 8 基础水伤和 8 条件水伤；否则只造成 8 水伤，并获得 1 刷新值。 进入槽位时二选一并锁定结果，每实体每回合最多 1 次；自身这次收入不能立刻再触发增伤；收益受共享上限截断。"
  },
  {
    "id": "H18",
    "name": "回潮弹",
    "element": "water",
    "rarity": 2,
    "style": "循环资源",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 10 水伤；目标已潮湿时额外 6 水伤；本体击杀获得 1 刷新值。 每实体每回合最多 1 次条件增伤、1 次资源收益；受 +2 刷新共享上限约束。"
  },
  {
    "id": "H19",
    "name": "回流芯",
    "element": "water",
    "rarity": 2,
    "style": "循环资源",
    "trigger": "passive",
    "counter": 0,
    "description": "本回合首次实际获得正数战斗刷新值时，恢复玩家 2 生命，不超过最大生命。 同名全体每回合最多恢复 1 次；已被上限截断为 0 的收益不触发，不返还或再生成刷新值。"
  },
  {
    "id": "H20",
    "name": "回澜弹",
    "element": "water",
    "rarity": 3,
    "style": "循环资源",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 36 水伤，向同位置或后方穿透至多 2 名敌人，各受 18 水伤。主目标被本体击杀时获得 2 战斗刷新；穿透击杀不重复领取。"
  },
  {
    "id": "H21",
    "name": "万流归海",
    "element": "water",
    "rarity": 4,
    "style": "循环资源",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 60 水伤。读取本回合此前实际获得的战斗刷新，每点追加一发 24 水伤追击，最多 2 发；击杀后可换敌，不消耗刷新值。"
  },
  {
    "id": "L01",
    "name": "跳电弹",
    "element": "lightning",
    "rarity": 0,
    "style": "链电",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 6 雷伤；向水平距离 2 格内最近的未命中敌人最多弹跳 2 次，各造成 5 雷伤。"
  },
  {
    "id": "L02",
    "name": "孤电弹",
    "element": "lightning",
    "rarity": 0,
    "style": "链电",
    "trigger": "shot",
    "counter": 0,
    "description": "主目标 14 雷伤；若命中前该目标距离 2 格内没有其他敌人，本次额外造成 8 雷伤。每实体每夹判定 1 次，不另算一次本体命中。"
  },
  {
    "id": "L03",
    "name": "电网弹",
    "element": "lightning",
    "rarity": 1,
    "style": "链电",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 7 雷伤；再依次弹跳至至多 3 个不同敌人，各受 3 雷伤，每跳至多 2 格。"
  },
  {
    "id": "L04",
    "name": "桥电弹",
    "element": "lightning",
    "rarity": 1,
    "style": "链电",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 6 雷伤，再弹跳至至多 2 个不同敌人，每跳 4 雷伤。通常每跳距离最多 2 格；若本跳出发目标潮湿，该跳距离改为最多 4 格。每跳选最近合法目标，不重复命中已访问目标，不能返回主目标。"
  },
  {
    "id": "L05",
    "name": "回返电弧",
    "element": "lightning",
    "rarity": 2,
    "style": "链电",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 雷伤，再向距离 2 格内最近另一敌人弹跳造成 6 雷伤；若这一跳发生且最初主目标仍存活，再返回最初主目标造成 6 雷伤。最多 2 次弹跳，返回只允许原主目标一次；主目标已死则不返回、不换目标。"
  },
  {
    "id": "L06",
    "name": "雷暴弹",
    "element": "lightning",
    "rarity": 3,
    "style": "链电",
    "trigger": "timer",
    "counter": 2,
    "description": "首目标 60 雷伤；再依次弹跳至至多 4 个不同敌人，各受 24 雷伤，每跳至多 3 格。"
  },
  {
    "id": "L07",
    "name": "极光织网",
    "element": "lightning",
    "rarity": 4,
    "style": "链电",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 10 雷伤；从主目标依次建立最多 2 条支链，每条最多 2 跳，每跳 5 雷伤、距离最多 2 格。两条链共享已访问列表，主目标不能被支链再次命中，每个其他敌人整枚最多命中一次；最多影响 5 个目标。"
  },
  {
    "id": "L08",
    "name": "电容弹",
    "element": "lightning",
    "rarity": 0,
    "style": "蓄能",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 48 雷伤。无有效目标时保持就绪，下一次入阵继续尝试施放。"
  },
  {
    "id": "L09",
    "name": "伏流弹",
    "element": "lightning",
    "rarity": 0,
    "style": "蓄能",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 12 雷伤；若锁定并完成常规入夹减一后，本夹存在其他未归零的雷计时弹，则自身首次本体命中获得 1 护盾。每实体每夹 1 次，所有同名卡合计每夹最多 3 护盾；被休止的卡不参与判定。"
  },
  {
    "id": "L10",
    "name": "催电弹",
    "element": "lightning",
    "rarity": 1,
    "style": "蓄能",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 7 雷伤；若本体击杀主目标，尝试使右邻尚未执行的计时弹额外减 1。每实体每夹最多尝试 1 次，目标共享每回合 1 次额外推进上限；没有合法右邻时不转移给其他卡。"
  },
  {
    "id": "L11",
    "name": "雷罐弹",
    "element": "lightning",
    "rarity": 2,
    "style": "蓄能",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 104 雷伤。"
  },
  {
    "id": "L12",
    "name": "待机屏障",
    "element": "lightning",
    "rarity": 2,
    "style": "蓄能",
    "trigger": "passive",
    "counter": 0,
    "description": "记录锁定并完成常规入夹减一后，本夹未归零的计时弹数量 N，排除被休止的卡；轮到自身槽位时获得 2N 护盾，上限 6。每实体每夹结算 1 次，所有同名卡合计每夹最多 6 护盾。"
  },
  {
    "id": "L13",
    "name": "终相线圈",
    "element": "lightning",
    "rarity": 3,
    "style": "蓄能",
    "trigger": "timer",
    "counter": 3,
    "description": "主目标 168 雷伤；本阵此前每成功施放一枚其他蓄力魔法，追加 24 雷伤，最多计入 2 枚。若主目标被本体击杀，将至多 36 点溢伤以半径 1 爆炸传给其余所有敌人，不再连爆。"
  },
  {
    "id": "L14",
    "name": "蓄电芯",
    "element": "lightning",
    "rarity": 4,
    "style": "蓄能",
    "trigger": "passive",
    "counter": 0,
    "description": "上下相邻计时弹在计数为 0 时成功执行后，各产生一次 18 雷伤附击；每个目标实体每回合至多触发一次，之前已经保持 0 的实体同样适用。召唤成功也算执行成功；无攻击目标时跳过附击。"
  },
  {
    "id": "L15",
    "name": "雷针弹",
    "element": "lightning",
    "rarity": 0,
    "style": "磁阵",
    "trigger": "shot",
    "counter": 0,
    "description": "16 雷伤。稳定承接方向强化。"
  },
  {
    "id": "L16",
    "name": "储电弹",
    "element": "lightning",
    "rarity": 1,
    "style": "磁阵",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 7 雷伤；右邻弹首次本体命中附加 5 雷伤。"
  },
  {
    "id": "L17",
    "name": "磁钉弹",
    "element": "lightning",
    "rarity": 1,
    "style": "磁阵",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 10 雷伤；若锁定时同列存在未被休止的携带弹，自身首次本体命中时尝试施加缓行。每实体每夹尝试 1 次，遵守普通控制抗性，不能因存在多枚携带弹重复控制。"
  },
  {
    "id": "L18",
    "name": "磁轨芯",
    "element": "lightning",
    "rarity": 2,
    "style": "磁阵",
    "trigger": "passive",
    "counter": 0,
    "description": "同列其他弹首次本体命中附加 4 雷伤；被强化的链电弹每跳距离 +1 格。"
  },
  {
    "id": "L19",
    "name": "横流弹",
    "element": "lightning",
    "rarity": 2,
    "style": "磁阵",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 8 雷伤；同行其他普通发射弹首次本体命中潮湿目标后，对该目标距离 2 格内最近另一敌人附加 4 雷伤。最多强化另外 3 枚，每枚每夹兑现 1 次；没有另一个合法敌人则无附伤，不转为对主目标加伤。"
  },
  {
    "id": "L20",
    "name": "极阵脉冲",
    "element": "lightning",
    "rarity": 3,
    "style": "磁阵",
    "trigger": "timer",
    "counter": 2,
    "description": "先对主目标造成 60 雷伤；再按锁定时“含有至少 1 枚未休止携带弹”的列数 N，发射 N 束 20 雷伤脉冲，N 上限 3。脉冲依次选择当前合法优先目标，前一目标死亡后可换目标；整枚仍只有一次首次本体命中资格，基础总伤害最多 120。"
  },
  {
    "id": "L21",
    "name": "磁轨歼击",
    "element": "lightning",
    "rarity": 4,
    "style": "磁阵",
    "trigger": "timer",
    "counter": 3,
    "description": "主目标 108 雷伤，向同位置或后方穿透至多 2 名敌人，各受 54 雷伤。同列有未休止携带魔法时，各段无视护甲但仍被护盾吸收。固有磁引：入阵权重 ×2。"
  },
  {
    "id": "W01",
    "name": "轻羽弹",
    "element": "wind",
    "rarity": 0,
    "style": "回响连发",
    "trigger": "shot",
    "counter": 0,
    "description": "同槽连续射出 2 发，每发 6 风伤。"
  },
  {
    "id": "W02",
    "name": "回音弹",
    "element": "wind",
    "rarity": 0,
    "style": "回响连发",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 9 风伤；完整发射后，以 25% 基础伤害回响此前最近一枚可用来源。所有回音弹每夹合计最多成功回响 1 次。"
  },
  {
    "id": "W03",
    "name": "叠风弹",
    "element": "wind",
    "rarity": 1,
    "style": "回响连发",
    "trigger": "shot",
    "counter": 0,
    "description": "同槽连续射出 2 发，每发 4 风伤；两发命中同一目标时，第二发额外造成 5 风伤。"
  },
  {
    "id": "W04",
    "name": "余响弹",
    "element": "wind",
    "rarity": 1,
    "style": "回响连发",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 6 风伤；完整发射后，以 50% 基础伤害回响本夹左邻的已发射原生普通弹一次。左邻必须是可用来源；每夹同名最多成功回响 1 次。"
  },
  {
    "id": "W05",
    "name": "追羽弹",
    "element": "wind",
    "rarity": 2,
    "style": "回响连发",
    "trigger": "shot",
    "counter": 0,
    "description": "同槽连续射出 2 发，每发 5 风伤；若第一发本体伤害击杀目标，第二发重新选敌并额外造成 8 风伤。该加成只给第二发，不能增加发数；没有第二个合法目标则跳过。"
  },
  {
    "id": "W06",
    "name": "回响风暴",
    "element": "wind",
    "rarity": 3,
    "style": "回响连发",
    "trigger": "timer",
    "counter": 2,
    "description": "连续施放 6 道风刃，每道 18 风伤；前一目标被击杀后可重新选敌。所有外部附伤与本体命中羁绊仍只兑现一次。"
  },
  {
    "id": "W07",
    "name": "复调风眼",
    "element": "wind",
    "rarity": 4,
    "style": "回响连发",
    "trigger": "timer",
    "counter": 2,
    "description": "首目标 30 风伤；成功攻击后，倒查此前可用来源，先选最近一枚，再选比它更早且元素不同的一枚，各以 60% 基础伤害回响一次；按来源原执行顺序结算。只有一个来源时只回响一次。每夹同名最多发动一次复调、最多产生 2 次回响，并占风弹共享额度。"
  },
  {
    "id": "W08",
    "name": "风刃弹",
    "element": "wind",
    "rarity": 0,
    "style": "穿透推退",
    "trigger": "shot",
    "counter": 0,
    "description": "沿水平射线穿透至多 3 敌人，各受 6 风伤；同位置重叠敌人也可命中。"
  },
  {
    "id": "W09",
    "name": "推羽弹",
    "element": "wind",
    "rarity": 0,
    "style": "穿透推退",
    "trigger": "shot",
    "counter": 0,
    "description": "7 风伤；若目标仍存活且命中前距玩家不超过 2 格，尝试将其击退 1 格。远处目标只承受伤害，控制不忽略抗性。"
  },
  {
    "id": "W10",
    "name": "横切弹",
    "element": "wind",
    "rarity": 1,
    "style": "穿透推退",
    "trigger": "shot",
    "counter": 0,
    "description": "主目标 10 风伤；对水平距离 1 格内最近另一敌人造成 6 风伤。攻击前锁定副目标；没有符合条件的敌人则只攻击主目标。"
  },
  {
    "id": "W11",
    "name": "风锤弹",
    "element": "wind",
    "rarity": 2,
    "style": "穿透推退",
    "trigger": "shot",
    "counter": 0,
    "description": "10 风伤，尝试击退 1 格。"
  },
  {
    "id": "W12",
    "name": "止风弹",
    "element": "wind",
    "rarity": 2,
    "style": "穿透推退",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 8 风伤；若目标仍存活，尝试击退 1 格。发生实际位移时，对它追加 4 风伤；因首领免疫、控制抗性或已在第 6 格而没有位移时，获得 2 护盾。所有止风弹每夹合计最多提供 4 护盾；本体已击杀目标时没有追加伤害或护盾。"
  },
  {
    "id": "W13",
    "name": "断阵风矛",
    "element": "wind",
    "rarity": 3,
    "style": "穿透推退",
    "trigger": "timer",
    "counter": 2,
    "description": "锁定主目标及同位置或后方至多 2 名敌人，各受 36 风伤；全部伤害结算后，对存活目标各尝试击退 1 格。位移不改变命中名单。"
  },
  {
    "id": "W14",
    "name": "穿云芯",
    "element": "wind",
    "rarity": 4,
    "style": "穿透推退",
    "trigger": "passive",
    "counter": 0,
    "description": "同行其他即时弹的主弹穿透目标数 +1，上限 3；首次本体命中附加 2 风伤。不增加弹跳或范围目标数。"
  },
  {
    "id": "W15",
    "name": "风标弹",
    "element": "wind",
    "rarity": 0,
    "style": "风标",
    "trigger": "shot",
    "counter": 0,
    "description": "9 风伤，给目标留下风标；本回合下一次其他子弹本体命中该目标时，附加 3 风伤并消耗风标。同敌风标不叠加，未触发的风标在本回合玩家子弹阶段结束时消失。"
  },
  {
    "id": "W16",
    "name": "顺风弹",
    "element": "wind",
    "rarity": 1,
    "style": "风标",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 7 风伤；右邻、下邻弹首次本体命中各附加 3 风伤。"
  },
  {
    "id": "W17",
    "name": "散标弹",
    "element": "wind",
    "rarity": 1,
    "style": "风标",
    "trigger": "shot",
    "counter": 0,
    "description": "主目标 6 风伤；给仍存活的主目标及其邻域 1 格内最近另一敌人分别留下风标。副目标只获得标记，不承受本弹伤害。攻击前锁定副目标，主目标死亡不追加其他标记名额。"
  },
  {
    "id": "W18",
    "name": "阵风旗",
    "element": "wind",
    "rarity": 2,
    "style": "风标",
    "trigger": "passive",
    "counter": 0,
    "description": "上下相邻弹首次本体命中各附加 5 风伤。连发不会重复领取。"
  },
  {
    "id": "W19",
    "name": "接旗弹",
    "element": "wind",
    "rarity": 2,
    "style": "风标",
    "trigger": "shot",
    "counter": 0,
    "description": "自身 7 风伤并给存活目标留下风标；右邻的非风原生普通弹取得首次本体命中时，若该次命中消耗风标，则另附加 6 风伤。强化关系在开火时锁定，附伤每个受益实体每夹至多一次；同名来源不叠加。"
  },
  {
    "id": "W20",
    "name": "巡风令",
    "element": "wind",
    "rarity": 3,
    "style": "风标",
    "trigger": "timer",
    "counter": 1,
    "description": "首目标 24 风伤；给仍存活的主目标及全场距玩家最近另外至多 2 名敌人分别留下风标。攻击前锁定这至多 3 名敌人，主目标死亡不补位；另外两名只获得标记，不承受本弹伤害。"
  },
  {
    "id": "W21",
    "name": "巡标风轮",
    "element": "wind",
    "rarity": 4,
    "style": "风标",
    "trigger": "shot",
    "counter": 0,
    "description": "主目标 12 风伤。若主目标命中前带风标，先按通常规则消耗它并结算 3 风伤；随后选择全场最近另外至多 2 名带风标敌人，各造成 12 风伤并移除风标，侧目标不再获得通常的 3 点风标附伤。至少存在一个侧目标才发动追击，所有巡标风轮每夹最多发动 1 次；无风标或次数用尽时仍执行自身 12 点普通攻击。"
  },
  {
    "id": "R01",
    "name": "岩种弹",
    "element": "earth",
    "rarity": 0,
    "style": "构装召唤",
    "trigger": "timer",
    "counter": 1,
    "description": "召唤 1 岩卫，寿命 2 次正常行动。首次入阵即可召唤；每实体每回合最多召唤一次，成功后重置为 1。遵循造物容量上限。"
  },
  {
    "id": "R02",
    "name": "凿壁弹",
    "element": "earth",
    "rarity": 0,
    "style": "构装召唤",
    "trigger": "shot",
    "counter": 0,
    "description": "先移除主目标最多 6 点护盾，再造成 12 岩伤。移除护盾不伤生命、不算命中，不触发反击、击杀或其他移盾效果。"
  },
  {
    "id": "R03",
    "name": "礁种弹",
    "element": "earth",
    "rarity": 1,
    "style": "构装召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "召唤 1 礁炮，寿命 2 次正常行动。每实际入阵两次召唤一次；每实体每回合最多召唤一次，成功后重置为 2。遵循造物容量上限。"
  },
  {
    "id": "R04",
    "name": "督造弹",
    "element": "earth",
    "rarity": 1,
    "style": "构装召唤",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 6 岩伤；随后令 1 个尚未接受本回合指令的岩造物立即行动，按礁炮优先、再岩卫、同种创建顺序选择，包括变体。 每实体每回合最多 1 次攻击、1 次指令；无敌人时仍可指令岩卫，无法执行的攻击不产生补偿。"
  },
  {
    "id": "R05",
    "name": "棱礁弹",
    "element": "earth",
    "rarity": 2,
    "style": "构装召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "召唤 1 散射礁炮，寿命 2 次正常行动；其固有效果为命中后向邻域 1 格内最近另一敌人造成 6 岩伤。 每实体每回合最多召唤 1 次；每只散射礁炮每回合最多溅射 1 次，正常与指令共享。"
  },
  {
    "id": "R06",
    "name": "陨星弹",
    "element": "earth",
    "rarity": 3,
    "style": "构装召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 48 岩伤；爆炸半径 1 内其余敌人受 12 岩伤。召唤岩卫与礁炮各 1，寿命 3 次正常行动。任一召唤成功即重置；无敌人时只跳过伤害。"
  },
  {
    "id": "R07",
    "name": "天工弹",
    "element": "earth",
    "rarity": 4,
    "style": "构装召唤",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 48 岩伤；爆炸半径 2 内其余敌人受 18 岩伤，距爆心超过 1 格的溅射基础伤害减半。召唤岩卫与礁炮各 1，寿命 3，并分别立即指令。"
  },
  {
    "id": "R08",
    "name": "盾砂弹",
    "element": "earth",
    "rarity": 0,
    "style": "壁垒反击",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 10 岩伤；命中获得 1 护盾。 每实体每回合最多给盾 1 次；所有盾砂弹合计每回合最多提供 4 护盾。"
  },
  {
    "id": "R09",
    "name": "硬壳弹",
    "element": "earth",
    "rarity": 0,
    "style": "壁垒反击",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 岩伤；进入自身槽位时若玩家护盾为 0，立即获得 3 护盾。 同名全体每回合最多触发 1 次空盾恢复；不要求命中，不把超上限护盾转为其他资源。"
  },
  {
    "id": "R10",
    "name": "盾冲弹",
    "element": "earth",
    "rarity": 1,
    "style": "壁垒反击",
    "trigger": "shot",
    "counter": 0,
    "description": "有合法目标时，攻击前消耗玩家至多 4 护盾，对首目标造成 8 岩伤，并按每消耗 1 护盾附加 3 岩伤。 每实体每回合最多消耗 4 护盾、追加 12 岩伤；无目标不扣盾；主动扣盾不算敌方攻击，不能触发反击或砂暴壁垒。"
  },
  {
    "id": "R11",
    "name": "碎石弹",
    "element": "earth",
    "rarity": 2,
    "style": "壁垒反击",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 岩伤；命中后申请获得 1 次子弹反击机会，反击伤害为 10 岩伤。 每实体每回合最多申请 1 次；与镇岳弹共用每回合最多发放及兑现 2 次的机会池，阶段结束清空。"
  },
  {
    "id": "R12",
    "name": "回铠芯",
    "element": "earth",
    "rarity": 2,
    "style": "壁垒反击",
    "trigger": "passive",
    "counter": 0,
    "description": "本回合第一次岩伤反击对敌人造成正数伤害后，获得 6 护盾；可由子弹反击或明确标注的羁绊反击触发。 同名全体每回合最多给盾 1 次；不给予新反击机会，补盾本身不视为吸收攻击，不递归触发。"
  },
  {
    "id": "R13",
    "name": "镇岳弹",
    "element": "earth",
    "rarity": 3,
    "style": "壁垒反击",
    "trigger": "timer",
    "counter": 2,
    "description": "主目标 60 岩伤；获得 12 护盾与 2 次反击机会，每次反击 10 岩伤。反击次数受全体每回合共享上限约束；无攻击目标时保持就绪，不领取护盾或反击。"
  },
  {
    "id": "R14",
    "name": "磐座芯",
    "element": "earth",
    "rarity": 4,
    "style": "壁垒反击",
    "trigger": "passive",
    "counter": 0,
    "description": "上邻弹首次本体命中附加 6 岩伤；自身槽位执行时获得 3 护盾。 每枚被强化实体每回合最多领取 1 次同源附伤；每枚磐座芯每回合最多给盾 1 次，仍受玩家护盾总上限约束。"
  },
  {
    "id": "R15",
    "name": "石丸弹",
    "element": "earth",
    "rarity": 0,
    "style": "拆解资源",
    "trigger": "shot",
    "counter": 0,
    "description": "16 岩伤。稳定承接方向强化。"
  },
  {
    "id": "R16",
    "name": "崩岩弹",
    "element": "earth",
    "rarity": 1,
    "style": "拆解资源",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 8 岩伤；命中前目标满血时额外 8 岩伤；本体击杀获得 1 删除值。 每实体每回合最多 1 次条件增伤、1 次资源收益；受 +3 删除值共享上限约束。"
  },
  {
    "id": "R17",
    "name": "取样弹",
    "element": "earth",
    "rarity": 1,
    "style": "拆解资源",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 9 岩伤；若命中前目标满血，获得 1 删除值，不要求击杀。 每实体每回合最多获取 1 删除值；命中前状态只检查 1 次，受 +3 删除值共享上限约束。"
  },
  {
    "id": "R18",
    "name": "回收芯",
    "element": "earth",
    "rarity": 2,
    "style": "拆解资源",
    "trigger": "passive",
    "counter": 0,
    "description": "存在于本轮锁定弹夹时，本回合首次子弹本体击杀获得 3 删除值。 同名全体每回合最多申请 1 次 +3 删除值；重射、造物、反击与燃烧击杀不触发，受共享上限截断。"
  },
  {
    "id": "R19",
    "name": "空膛弹",
    "element": "earth",
    "rarity": 2,
    "style": "拆解资源",
    "trigger": "shot",
    "counter": 0,
    "description": "首目标 10 岩伤；按锁定布局中自身上下左右相邻空槽数量，每格额外造成 3 岩伤，最多计算 2 个空槽。 每实体每回合最多追加 6 岩伤；已发射的邻弹不算空槽，不发额外资源，不新增休止权限。"
  },
  {
    "id": "R20",
    "name": "拆城弹",
    "element": "earth",
    "rarity": 3,
    "style": "拆解资源",
    "trigger": "timer",
    "counter": 1,
    "description": "先移除首目标至多 12 点敌方护盾，再造成 36 岩伤；每实际移除完整 4 点护盾获得 1 删除值。 每实体每回合最多移除 12 护盾、获取 3 删除值；不足 4 的余量不跨次累计，无目标保持 0；受删除共享上限约束。"
  },
  {
    "id": "R21",
    "name": "归墟弹",
    "element": "earth",
    "rarity": 4,
    "style": "拆解资源",
    "trigger": "timer",
    "counter": 3,
    "description": "主目标 150 岩伤；本阵每有 1 个空槽，追加一发 24 岩伤碎片，最多 3 发。主目标被本体击杀时获得 3 战斗拆解；碎片击杀不重复领取。"
  },
  {
    "id": "C01",
    "name": "火焰卷轴",
    "element": "fire",
    "rarity": 1,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "为左邻伤害魔法刻下 1 层永久火印，本局内每层基础伤害 +20%，最多 3 层。强化包含该魔法自身的连发、穿透、连锁与爆炸，外部附伤、状态和回响不增强；火印最多 +60%，独立于羁绊基础增幅上限。未就绪的蓄力魔法保留火印，后续释放仍生效。不占附魔印记位。左边界、空位、休止、携带、纯召唤、其他卷轴或已有 3 层火印时无收益，仍消耗卷轴。"
  },
  {
    "id": "C02",
    "name": "爆燃卷轴",
    "element": "fire",
    "rarity": 2,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "选择场上燃烧层数最多的至多 2 名敌人，平局按正常选敌顺序；各消耗至多 3 层燃烧，每层造成 4 火伤。 最多 2 个目标，每目标最多 12 基础火伤；没有燃烧目标时提示无收益。伤害不再引爆其他燃烧或触发本体命中。"
  },
  {
    "id": "C03",
    "name": "寒潮卷轴",
    "element": "water",
    "rarity": 1,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "对距离玩家最近的至多 3 名敌人施加潮湿，并各尝试缓行。 每敌 1 次控制尝试，遵守控制抗性与 Boss 规则。没有敌人时提示无目标；所有敌人免控时仍可施加潮湿。"
  },
  {
    "id": "C04",
    "name": "回澜卷轴",
    "element": "water",
    "rarity": 1,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "恢复玩家 8 生命，并获得 2 刷新值。 治疗不超过生命上限；刷新计入全部水系战斗来源每回合 +2 的共享上限。满血且本回合刷新额度已满时提示全额浪费。"
  },
  {
    "id": "C05",
    "name": "促动卷轴",
    "element": "lightning",
    "rarity": 2,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "使右邻当前尚未执行、计数大于 0 的常驻计时弹额外减 1；若因此归零，仍在该实体原槽位执行。 只推进 1 枚、1 次；与所有卡牌／共振共享“同目标每回合最多 1 次额外推进”。不能推进消耗型、已就绪、已执行、休止或携带实体，被推进执行不能再发动推进链。"
  },
  {
    "id": "C06",
    "name": "磁航卷轴",
    "element": "lightning",
    "rarity": 3,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "给正上方与正下方的常驻魔法各刻下永久磁引，本局内后续每次抽取的权重 ×2。从下次入阵开始生效，不改变当前阵列；不保证抽中。最多 2 枚，不占附魔印记位，与固有磁引、磁引印记和临时磁引不叠加。越界、空位、休止或其他卷轴不能成为目标。"
  },
  {
    "id": "C07",
    "name": "潜行卷轴",
    "element": "wind",
    "rarity": 3,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "给左邻常驻魔法刻下永久潜伏，本局内后续每次抽取的权重 ×0.5；若实际入阵并造成原生伤害，首段基础伤害 +20%。从下次入阵开始生效，不改变当前阵列；未抽中或未释放不会累计增幅。不占附魔印记位，与潜伏印记和临时潜伏不叠加。左邻无合法常驻魔法时无收益，仍消耗卷轴。"
  },
  {
    "id": "C08",
    "name": "岩阵卷轴",
    "element": "earth",
    "rarity": 2,
    "style": "一次性卷轴",
    "trigger": "consumable",
    "counter": 1,
    "description": "依次召唤 1 岩卫与 1 礁炮，各拥有 2 次行动寿命。它们在本回合正常造物阶段行动。 每实体只召唤这 2 个造物；遵守总上限 4、同种上限 2 与最短寿命替换规则。预览必定替换的造物；替换退场不触发自然到期效果。"
  }
];

export const BONDS = [
  {
    "id": "S01",
    "name": "火苗初燃",
    "requirements": {
      "fire": 3
    },
    "grade": "normal",
    "description": "火弹首击燃烧敌人：燃烧 +1。每夹最多 3 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S02",
    "name": "余烬长燃",
    "requirements": {
      "fire": 6
    },
    "grade": "normal",
    "description": "燃烧结算：伤害 +25%。层数上限与持续时间不变。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S03",
    "name": "赤焰专精",
    "requirements": {
      "fire": 10
    },
    "grade": "normal",
    "description": "火弹命中燃烧敌人：直接伤害 +30%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S04",
    "name": "涓流护身",
    "requirements": {
      "water": 3
    },
    "grade": "normal",
    "description": "水弹首击潮湿敌人：获得 3 护盾。每夹最多 2 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S05",
    "name": "泉灵契约",
    "requirements": {
      "water": 6
    },
    "grade": "normal",
    "description": "泉灵正常行动：水伤 +25%。指令行动不加成。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S06",
    "name": "深泉滋养",
    "requirements": {
      "water": 10
    },
    "grade": "normal",
    "description": "泉灵正常行动命中：回复 2 生命。每只每回合 1 次，全体最多 2 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S07",
    "name": "电荷追击",
    "requirements": {
      "lightning": 3
    },
    "grade": "normal",
    "description": "命中本夹先前雷弹击中过的敌人：雷弹直接伤害 +25%。同一枚雷弹不能自行触发。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S08",
    "name": "蓄能专注",
    "requirements": {
      "lightning": 6
    },
    "grade": "normal",
    "description": "雷系计时弹触发：直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S09",
    "name": "万钧连锁",
    "requirements": {
      "lightning": 10
    },
    "grade": "normal",
    "description": "雷弹弹跳命中：伤害 +35%。首目标不加成，不增加弹跳。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S10",
    "name": "轻风起势",
    "requirements": {
      "wind": 3
    },
    "grade": "normal",
    "description": "同排左邻格子弹已命中：风弹直接伤害 +20%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S11",
    "name": "回声余韵",
    "requirements": {
      "wind": 6
    },
    "grade": "normal",
    "description": "回响／重射：伤害 +25%。不增加次数。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S12",
    "name": "逐标疾风",
    "requirements": {
      "wind": 10
    },
    "grade": "normal",
    "description": "风弹命中风标敌人：直接伤害 +40%。风标照常消耗。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S13",
    "name": "岩石弹头",
    "requirements": {
      "earth": 3
    },
    "grade": "normal",
    "description": "岩弹直接伤害 +15%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S14",
    "name": "坚垒契约",
    "requirements": {
      "earth": 6
    },
    "grade": "normal",
    "description": "岩卫正常行动：额外获得 1 护盾。每只每回合 1 次，全体最多 2 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "S15",
    "name": "岩构回收",
    "requirements": {
      "earth": 10
    },
    "grade": "normal",
    "description": "岩卫／礁炮自然到期：获得 1 删除值。每回合最多 2 次，与岩系资源共享上限；替换无效。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D01",
    "name": "蒸汽引擎",
    "requirements": {
      "fire": 5,
      "water": 3
    },
    "grade": "core",
    "description": "按本夹火／水原生弹首次本体命中的顺序记录元素；相邻两次记录元素不同则压力 +1，相同则不增压，其他元素不改记录。压力达到 3 时清零，对该次命中目标造成 30 水伤并尝试击退 1 格；每夹最多释放 2 次，夹末清空压力。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D02",
    "name": "烫潮追击",
    "requirements": {
      "water": 5,
      "fire": 2
    },
    "grade": "normal",
    "description": "水属性原生弹对燃烧目标的直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D03",
    "name": "电火淬炼",
    "requirements": {
      "fire": 5,
      "lightning": 2
    },
    "grade": "normal",
    "description": "火属性原生弹对拥有至少 2 层燃烧的目标，直接伤害 +30%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D04",
    "name": "焦痕导电",
    "requirements": {
      "lightning": 5,
      "fire": 2
    },
    "grade": "normal",
    "description": "雷属性原生弹对燃烧目标的直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D05",
    "name": "风送火星",
    "requirements": {
      "fire": 5,
      "wind": 2
    },
    "grade": "normal",
    "description": "风属性原生弹成功击退敌人后，给被击退目标附加 2 层燃烧；每夹最多 2 次。没有实际位移则不触发。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D06",
    "name": "炽风切割",
    "requirements": {
      "wind": 5,
      "fire": 2
    },
    "grade": "normal",
    "description": "风属性原生弹对燃烧目标的直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D07",
    "name": "熔铸兵团",
    "requirements": {
      "fire": 5,
      "earth": 3
    },
    "grade": "core",
    "description": "每回合前 2 个自然到期的岩卫／礁炮，在最近敌人处引爆：对该敌人及邻域 1 格内另外至多 2 个敌人各造成 12 火伤，并各附加 1 层燃烧。爆破在全部造物行动、统一减寿命之后结算；替换退场不爆破。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D08",
    "name": "灼岩压阵",
    "requirements": {
      "earth": 5,
      "fire": 2
    },
    "grade": "normal",
    "description": "岩属性原生弹对燃烧目标的直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D09",
    "name": "暴雨电网",
    "requirements": {
      "lightning": 6,
      "water": 2
    },
    "grade": "core",
    "description": "每夹第一次雷原生弹命中潮湿目标时，以该目标和最近另外至多 2 名潮湿敌人建立本夹电网。从建网该次起、包括建网命中在内共前 3 次雷原生弹首次本体命中网内目标时，其他存活节点各受 6 雷伤。节点锁定、不补位；每夹最多建网 1 次、传导 3 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D10",
    "name": "带电潮涌",
    "requirements": {
      "water": 5,
      "lightning": 2
    },
    "grade": "normal",
    "description": "水属性原生弹对潮湿目标的直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D11",
    "name": "镜海回声",
    "requirements": {
      "water": 5,
      "wind": 3
    },
    "grade": "core",
    "description": "本夹第一枚有基础伤害的风属性原生普通弹完整发射后，保存其基础伤害形态；随后第一枚水属性原生普通弹完整发射后，以 60% 基础伤害回响该镜像一次。每夹最多 1 次；未兑现的镜像夹末消失。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D12",
    "name": "湿刃寒风",
    "requirements": {
      "wind": 5,
      "water": 2
    },
    "grade": "normal",
    "description": "风属性原生弹对潮湿目标的直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D13",
    "name": "潮生礁庭",
    "requirements": {
      "water": 5,
      "earth": 3
    },
    "grade": "core",
    "description": "锁定造物行动名单时，若同时存在泉灵和至少一种岩造物，给名单中的泉灵、礁炮、岩卫各 1 点本回合灌注。正常行动消耗后：泉灵命中时给最近另一敌人附潮湿；礁炮对潮湿目标额外造成 6 水伤；岩卫在护盾之外向最近敌人发射 8 水伤潮汐弹。每只只获得、消费 1 次；不追加行动、不延寿，余量回合末清空。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D14",
    "name": "潮盾重击",
    "requirements": {
      "earth": 5,
      "water": 2
    },
    "grade": "normal",
    "description": "玩家当前拥有护盾时，岩属性原生弹直接伤害 +20%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D15",
    "name": "风暴回路",
    "requirements": {
      "wind": 5,
      "lightning": 3
    },
    "grade": "core",
    "description": "本夹原生普通弹首次本体命中序列连续出现“雷→风→雷”时，最后目标额外受到 24 雷伤，并以 40% 基础伤害回响中间风弹的基础伤害形态一次。其他元素的普通弹有效命中打断序列；计时、携带、空格不参与序列。每夹最多完成 1 个回路。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D16",
    "name": "风标引雷",
    "requirements": {
      "lightning": 5,
      "wind": 2
    },
    "grade": "normal",
    "description": "雷属性原生弹命中带风标的目标时，直接伤害 +30%。风标仍按原规则消耗。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D17",
    "name": "磁轨阵地",
    "requirements": {
      "lightning": 5,
      "earth": 3
    },
    "grade": "core",
    "description": "本夹前 6 枚雷属性原生弹首次本体命中时，给场上最早创建且轨道充能不足 3 的一个岩卫或礁炮 +1 轨道充能，无合格造物则不存储。轨道充能达到 3 的造物在本次正常行动后，消耗 3 并追加一次轨道炮：最近敌人及同位置或后方最近另一敌人各受 18 雷伤。每个造物每回合至多发射一次，全体至多两次；剩余轨道充能回合末清空。此炮击不是新的造物行动或子弹命中。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D18",
    "name": "蓄电石垒",
    "requirements": {
      "earth": 5,
      "lightning": 2
    },
    "grade": "normal",
    "description": "本夹第一枚雷属性计时弹成功执行后，获得 6 护盾；每夹 1 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D19",
    "name": "砂暴壁垒",
    "requirements": {
      "earth": 5,
      "wind": 3
    },
    "grade": "core",
    "description": "每回合第一次敌人直接攻击被护盾吸收后，取本次实际吸收量与 6 的较小值，对攻击者造成该值 ×2 的岩伤，并尝试将攻击者击退 1 格。攻击先正常结算，不额外扣盾、不再次减免伤害；每回合反击 1 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "D20",
    "name": "护砂疾风",
    "requirements": {
      "wind": 5,
      "earth": 2
    },
    "grade": "normal",
    "description": "玩家当前拥有护盾时，风属性原生弹直接伤害 +20%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T01",
    "name": "电汽灼击",
    "requirements": {
      "fire": 5,
      "water": 2,
      "lightning": 1
    },
    "grade": "normal",
    "description": "火属性原生弹对潮湿目标的直接伤害 +30%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T02",
    "name": "暖潮轻息",
    "requirements": {
      "water": 5,
      "fire": 2,
      "wind": 1
    },
    "grade": "normal",
    "description": "本夹前 2 枚水属性原生弹取得首次本体命中后，各恢复玩家 1 生命；每夹最多恢复 2。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T03",
    "name": "温泉石垒",
    "requirements": {
      "earth": 5,
      "water": 2,
      "fire": 1
    },
    "grade": "normal",
    "description": "每回合第一只正常行动的岩卫额外提供 3 护盾；每回合 1 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T04",
    "name": "焦标雷袭",
    "requirements": {
      "lightning": 5,
      "wind": 2,
      "fire": 1
    },
    "grade": "normal",
    "description": "雷属性原生弹对燃烧或带风标的目标直接伤害 +25%；同时满足两项仍只加一次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T05",
    "name": "倒计时共振",
    "requirements": {
      "lightning": 6,
      "earth": 3,
      "fire": 2
    },
    "grade": "core",
    "description": "每夹第一枚自然归零并成功执行的雷计时弹，使本夹尚未结算、计数大于 0 的一枚火／岩计时弹额外减 1；按剩余计数最小、再按槽位顺序选取。若因此归零，则在它原本槽位执行。每夹只推进 1 枚、1 次；该次被推进后的执行带共振标记，不能再触发羁绊的命中、计时或重射事件。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T06",
    "name": "白弹军团",
    "requirements": {
      "fire": 4,
      "earth": 3,
      "wind": 2
    },
    "grade": "core",
    "description": "本夹第 4 枚白色原生普通弹完整发射后，召唤 1 只寿命 2 次行动的军旗岩卫。它仍属于岩卫，占岩卫同种名额；每次正常行动照常给 3 护盾，并对最近敌人额外造成 6 火伤。每夹最多召唤 1 只，每只每回合最多正常行动 1 次，并可接受一次明确指令；指令只提供基础 3 护盾、不附加 6 火伤，寿命仍统一减少一次。无攻击目标时跳过正常行动火伤。",
    "targetId": null,
    "whiteRequired": 8,
    "stages": []
  },
  {
    "id": "T07",
    "name": "潮电风刃",
    "requirements": {
      "wind": 5,
      "water": 2,
      "lightning": 1
    },
    "grade": "normal",
    "description": "风属性原生弹对潮湿目标的直接伤害 +30%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T08",
    "name": "电礁泉涌",
    "requirements": {
      "water": 5,
      "earth": 2,
      "lightning": 1
    },
    "grade": "normal",
    "description": "每回合第一只通过正常行动成功命中的泉灵对其目标额外造成 8 水伤；每回合 1 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T09",
    "name": "潮砂回收",
    "requirements": {
      "earth": 5,
      "water": 2,
      "wind": 1
    },
    "grade": "normal",
    "description": "全部造物行动结束、寿命减少之前，若仍有至少 1 个造物，获得 1 删除值；每回合 1 次，计入岩系资源共享上限。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "T10",
    "name": "岩风蓄雷",
    "requirements": {
      "lightning": 5,
      "wind": 2,
      "earth": 1
    },
    "grade": "normal",
    "description": "雷属性计时弹成功执行时，本体直接伤害 +25%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "Q01",
    "name": "四象回潮",
    "requirements": {
      "water": 6,
      "wind": 2,
      "fire": 1,
      "lightning": 1
    },
    "grade": "normal",
    "description": "每夹第一枚水属性原生普通弹成功本体命中时获得 2 刷新值；每夹 1 次，计入水系资源共享上限。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "Q02",
    "name": "四象厚垒",
    "requirements": {
      "earth": 6,
      "water": 2,
      "fire": 1,
      "lightning": 1
    },
    "grade": "normal",
    "description": "玩家护盾上限 +8；只提高上限，不立即填充护盾。失活时超出新上限的护盾截断。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "Q03",
    "name": "炉风合奏",
    "requirements": {
      "fire": 6,
      "wind": 2,
      "water": 1,
      "earth": 1
    },
    "grade": "normal",
    "description": "所有原生普通发射弹的直接伤害 +15%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "Q04",
    "name": "磁焰蓄势",
    "requirements": {
      "lightning": 6,
      "earth": 2,
      "fire": 1,
      "wind": 1
    },
    "grade": "normal",
    "description": "每夹第一枚成功执行的雷属性计时弹，本体直接伤害 +40%；每夹最多强化 1 枚。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "Q05",
    "name": "空槽交响",
    "requirements": {
      "wind": 5,
      "lightning": 3,
      "water": 2,
      "earth": 2
    },
    "grade": "core",
    "description": "获得专属“休止”：装填后可将至多 1 枚本夹常驻实体暂时留在背包，其原槽变空，不补抽。执行到空槽时，以 75% 基础伤害回响本夹此前最近一枚已完整发射、有基础伤害的原生普通弹。每夹最多 2 个空槽触发；同一原生来源最多被本羁绊回响 1 次，无前序来源则跳过。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "A01",
    "name": "万象燃炉",
    "requirements": {
      "fire": 6,
      "water": 1,
      "lightning": 1,
      "wind": 1,
      "earth": 1
    },
    "grade": "core",
    "description": "本夹分别记录水、雷、风、岩原生弹的第一次本体命中；集齐四种燃料后，下一枚火属性原生普通弹首次本体命中时引爆燃炉，对主目标造成 36 火伤、邻域 1 格内另外至多 2 个目标各造成 18 火伤。每夹最多 1 次，未集齐或未兑现的燃料夹末消失。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "A02",
    "name": "五色归潮",
    "requirements": {
      "water": 5,
      "fire": 2,
      "lightning": 1,
      "wind": 1,
      "earth": 1
    },
    "grade": "normal",
    "description": "每夹全部子弹执行结束后获得 6 护盾；每夹 1 次。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "A03",
    "name": "五方同阵",
    "requirements": {
      "earth": 5,
      "water": 2,
      "fire": 1,
      "lightning": 1,
      "wind": 1
    },
    "grade": "normal",
    "description": "所有原生普通发射弹的直接伤害 +20%。",
    "targetId": null,
    "whiteRequired": 0,
    "stages": []
  },
  {
    "id": "E01",
    "name": "引线工坊",
    "requirements": {
      "fire": 3
    },
    "grade": "evolution",
    "description": "每回合前 2 枚受到引信方向强化的原生普通弹取得首次本体命中时，给主目标附加 1 层燃烧。 成长：受到引信方向强化的原生普通弹取得首次本体命中，记 1 点；每个受益实体只记一次。",
    "targetId": "F16",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "引信的方向强化增加下邻，新增方向同样附加 5 火伤；同名来源对同一受益实体不叠加。"
      },
      {
        "progress": 5,
        "description": "每回合首次受益弹命中一个命中前已燃烧的目标后，对其邻域 1 格内最近另一敌人造成 4 火伤并附加 1 层燃烧。"
      },
      {
        "progress": 9,
        "description": "本夹有两枚元素不同的受益普通弹各取得首次本体命中后，在第二次命中目标的邻域 1 格内，给最近另外至多 2 名敌人各附加 1 层燃烧；每回合只释放 1 次，不读取衍生附伤元素。"
      }
    ],
    "growth": "受到引信方向强化的原生普通弹取得首次本体命中，记 1 点；每个受益实体只记一次。"
  },
  {
    "id": "E02",
    "name": "熔火回炼",
    "requirements": {
      "fire": 4
    },
    "grade": "evolution",
    "description": "热熔一次执行消耗至少 1 层燃烧后，获得 1 护盾；每回合最多获得 3 护盾。 成长：原生火弹首次本体命中一个命中前已燃烧的目标，记 1 点。",
    "targetId": "F11",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "热熔一次执行消耗满 2 层后，若目标存活，给它重新附加 1 层燃烧；每回合最多回填 2 次，不重新执行消耗。"
      },
      {
        "progress": 5,
        "description": "每回合第一枚热熔攻击一个未燃烧目标时，若该目标邻域 1 格内存在燃烧敌人，先给主目标附加 1 层燃烧，再按热熔原规则攻击与消耗；只借火一次，不扣来源层数。"
      },
      {
        "progress": 9,
        "description": "每回合第一次热熔消耗满 2 层后，对原目标邻域 1 格内最近另外至多 2 名敌人各造成 6 火伤；不再次消耗或传播燃烧。"
      }
    ],
    "growth": "原生火弹首次本体命中一个命中前已燃烧的目标，记 1 点。"
  },
  {
    "id": "E03",
    "name": "百川归流",
    "requirements": {
      "water": 4
    },
    "grade": "evolution",
    "description": "回潮命中一个命中前潮湿的目标后，恢复玩家 1 生命；每回合最多恢复 2。 成长：原生水弹首次本体命中一个命中前潮湿的目标，记 1 点。",
    "targetId": "H18",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "回潮命中潮湿目标后，给其邻域 1 格内最近另一名未潮湿敌人施加潮湿；每回合最多扩散 2 次。"
      },
      {
        "progress": 5,
        "description": "每回合第一次回潮命中潮湿目标后，召唤 1 只寿命 2 次正常行动的泉灵；按现有容量执行替换，出生当回合可行动，不产生额外成长。"
      },
      {
        "progress": 9,
        "description": "每回合第一次回潮本体击杀一个命中前潮湿的目标后，对全场最近另一敌人造成 6 水伤并施加潮湿；这次扩散伤害不再触发回潮或召唤。"
      }
    ],
    "growth": "原生水弹首次本体命中一个命中前潮湿的目标，记 1 点。"
  },
  {
    "id": "E04",
    "name": "蓄雷弹仓",
    "requirements": {
      "lightning": 4
    },
    "grade": "evolution",
    "description": "已入夹的雷罐在自身槽位到来时若计数仍大于 0，提供 2 护盾；每回合合计最多 4。等待护盾不算发射成功，不重置计数。 成长：原生雷弹成功完整发射，记 1 点；无合法目标未发射、未归零等待和进化附击均不计。",
    "targetId": "L11",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "雷罐本体击杀主目标后，对全场最近另一敌人造成 12 雷伤；每回合最多追击 1 次。"
      },
      {
        "progress": 5,
        "description": "雷罐成功执行后的重置值由 2 改为 1；不立刻修改正在倒计时的实体，也不额外推进本回合计数。"
      },
      {
        "progress": 9,
        "description": "雷罐成功执行但未本体击杀主目标时，提供 4 护盾；每回合最多 1 次。这与等待护盾分别限次，均受玩家护盾上限约束。"
      }
    ],
    "growth": "原生雷弹成功完整发射，记 1 点；无合法目标未发射、未归零等待和进化附击均不计。"
  },
  {
    "id": "E05",
    "name": "蓄电网络",
    "requirements": {
      "lightning": 5
    },
    "grade": "evolution",
    "description": "受到蓄电芯强化的计时弹在计数为 0 时成功执行后，提供 1 护盾；每回合最多 3。 成长：本夹原生计时弹在计数为 0 时成功攻击或成功召唤，记 1 点；不限元素，保持 0 后成功执行也计。",
    "targetId": "L14",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "蓄电芯的强化方向增加左邻；仍只对计时弹生效，18 雷伤附击对每个受益实体每回合最多一次。"
      },
      {
        "progress": 5,
        "description": "蓄电芯的 18 点附击击杀目标后，对距该目标 2 格内最近另一敌人造成 6 雷伤；每回合最多 2 次。该追击不属于新附击。"
      },
      {
        "progress": 9,
        "description": "强化范围扩大为同行与同列的其他计时弹；同一受益实体不因多个方向或同名芯而重复得到 18 点附击，仍每回合最多一次。"
      }
    ],
    "growth": "本夹原生计时弹在计数为 0 时成功攻击或成功召唤，记 1 点；不限元素，保持 0 后成功执行也计。"
  },
  {
    "id": "E06",
    "name": "千重奏",
    "requirements": {
      "wind": 3
    },
    "grade": "evolution",
    "description": "叠风的首次本体命中附加 2 风伤，每个叠风实体每回合一次；这不是新的本体段。 成长：一枚原生连发弹在自身槽位的原始连发中至少两次命中同一敌人，记 1 点；进化第三发和回响不计，原生计时连发也可满足。",
    "targetId": "W03",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "每回合前 2 枚两发命中同一敌人的叠风，在两发结束后追加一发 3 风伤的进化段；原目标死亡时可重选，进化段不再触发本体事件。"
      },
      {
        "progress": 5,
        "description": "符合上述同目标条件的叠风完成原始两发后，以 40% 基础伤害回响此前最近一枚其他已完整发射的原生普通弹；每回合最多成功回响 1 次，无合法来源则跳过。"
      },
      {
        "progress": 9,
        "description": "上述回响共享上限由 1 提高至 2；每个叠风实体最多发起一次，同一原生来源最多被本进化回响一次。它仍不复制第三发、进化附伤或其他回响。"
      }
    ],
    "growth": "一枚原生连发弹在自身槽位的原始连发中至少两次命中同一敌人，记 1 点；进化第三发和回响不计，原生计时连发也可满足。"
  },
  {
    "id": "E07",
    "name": "移动要塞",
    "requirements": {
      "earth": 3
    },
    "grade": "evolution",
    "description": "礁种创建的礁炮每次正常行动后提供 1 护盾；每回合最多 2。没有攻击目标也可获得该盾，但不会因此获得成长。 成长：礁种创建的礁炮正常行动成功命中敌人，记 1 点；每只每回合一次，指令、额外攻击及衍生伤害不计。",
    "targetId": "R03",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "每回合前 2 次此类礁炮正常命中后，对主目标邻域 1 格内最近另一敌人造成 3 岩伤；不重复触发礁炮潮湿加伤。"
      },
      {
        "progress": 5,
        "description": "此类礁炮正常行动后提供的护盾由 1 改为 2，进化护盾共享上限由 2 改为 4；不增加行动次数。"
      },
      {
        "progress": 9,
        "description": "每回合第一只礁种创建的礁炮自然到期时，提供 4 护盾，并对最近敌人造成 6 岩伤；替换退场不触发，无敌人时仅提供护盾。"
      }
    ],
    "growth": "礁种创建的礁炮正常行动成功命中敌人，记 1 点；每只每回合一次，指令、额外攻击及衍生伤害不计。"
  },
  {
    "id": "E08",
    "name": "回击壁垒",
    "requirements": {
      "earth": 4
    },
    "grade": "evolution",
    "description": "碎石首次本体命中后提供 1 护盾；每回合最多 3。原有反击资格照常获得。 成长：原生岩普通弹取得首次本体命中，且该次命中前玩家已有护盾，记 1 点；反击与反击附伤不计。",
    "targetId": "R11",
    "whiteRequired": 0,
    "stages": [
      {
        "progress": 2,
        "description": "碎石产生的反击实际结算后，提供 2 护盾；每回合最多 4。敌人攻击先正常扣盾／扣血并检查玩家存活，护盾不能追溯吸收刚才的攻击。"
      },
      {
        "progress": 5,
        "description": "每回合前 2 次碎石反击结算后，对攻击者邻域 1 格内最近另一敌人造成 4 岩伤；衍生范围伤害不会再生成反击机会。"
      },
      {
        "progress": 9,
        "description": "碎石与镇岳的反击共同池由每回合 2 次提高至 3 次：前 2 次可由任一合格来源触发，额外第 3 次仅能消耗原生碎石命中取得的资格。每次碎石基础反击仍为 10 岩伤，不自动授予第三次资格；全部来源合计最多 3 次，不能分别累加为碎石 3 次加镇岳 2 次。"
      }
    ],
    "growth": "原生岩普通弹取得首次本体命中，且该次命中前玩家已有护盾，记 1 点；反击与反击附伤不计。"
  }
];

export const ENCHANTMENTS = [
  {
    "id": "M01",
    "name": "磁引印",
    "element": "lightning",
    "kind": "mark",
    "description": "宿主装填权重 ×2。 所有常驻弹可用；与固有或临时同名磁引不叠加，不保证抽到。"
  },
  {
    "id": "M02",
    "name": "潜伏印",
    "element": "wind",
    "kind": "mark",
    "description": "宿主装填权重 ×0.5；每次实际入夹执行的首个原生本体基础伤害结算 +20%。 所有常驻弹可用。携带／纯召唤宿主只有抽取倾向部分；界面说明没有可兑现的伤害收益，不虚构攻击。"
  },
  {
    "id": "M03",
    "name": "焰痕印",
    "element": "fire",
    "kind": "mark",
    "description": "宿主首次原生本体命中附加 1 层燃烧。 仅接受有本体伤害的常驻普通或计时弹。每实体每回合 1 次；连发与范围不逐段触发，宿主元素不变。"
  },
  {
    "id": "M04",
    "name": "潮润印",
    "element": "water",
    "kind": "mark",
    "description": "宿主首次原生本体命中时施加潮湿。 仅接受有本体伤害的常驻普通或计时弹。每实体每回合 1 次；不额外缓行，不重复触发本体命中。"
  },
  {
    "id": "M05",
    "name": "岩甲印",
    "element": "earth",
    "kind": "mark",
    "description": "轮到宿主实际占据的槽位时获得 2 护盾，常驻计时弹即使未就绪也可获得。 所有常驻弹可用，每实体每回合 1 次；休止实体不结算，复制、回响不再给盾，遵守护盾上限。"
  },
  {
    "id": "G01",
    "name": "煅火格",
    "element": "fire",
    "kind": "slot",
    "description": "本格常驻弹首次原生本体命中时附加 4 火伤。 每格每回合 1 次；空格、携带、未就绪计时、消耗型没有本体命中则不触发。"
  },
  {
    "id": "G02",
    "name": "润泽格",
    "element": "water",
    "kind": "slot",
    "description": "本格常驻弹首次原生本体命中时获得 1 刷新值。 每格每回合 1 次，与所有水弹、卷轴及羁绊共享每回合 +2 刷新上限；不由回响或造物触发。"
  },
  {
    "id": "G03",
    "name": "蓄势格",
    "element": "lightning",
    "kind": "slot",
    "description": "执行到本格时，若占据它的是尚未就绪的常驻计时弹，槽位积蓄 2 点雷伤。以后本格的就绪常驻计时弹首次原生本体命中时，附加全部所蓄雷伤，然后清空。 每格最多蓄 6，每回合最多积蓄一次、兑现一次；能量保存在格上而非实体。普通弹、空格、携带、消耗型、休止不积蓄；纯召唤或无目标执行不兑现，能量继续保留。"
  },
  {
    "id": "G04",
    "name": "接力格",
    "element": "wind",
    "kind": "slot",
    "description": "本格常驻弹首次原生本体命中时，若按发射顺序紧邻的前一槽已经有不同元素的常驻弹成功取得原生本体命中，则本次附加 4 风伤。 每格每回合 1 次。前一槽不跳空、不跳携带、不跳未就绪或消耗型；允许从上一行末格接到下一行首格，第一格没有前槽。读源弹元素，不读附魔来源元素。"
  },
  {
    "id": "G05",
    "name": "回收格",
    "element": "earth",
    "kind": "slot",
    "description": "本格消耗型子弹在回合末因使用而永久移除时，给此格标记“下一回合回收”。下一回合此格常驻普通弹首次本体命中附加 4 岩伤，随后清除标记。 每格最多存 1 个标记，不能叠加。只在紧接的一回合有效，未兑现就到期；计时弹、手动删除或本回合之前的消耗均不能兑现。"
  }
];

export const ENEMIES = {
  "walker": {
    "id": "walker",
    "name": "游荡者",
    "hp": 30,
    "move": 1,
    "range": 0,
    "damage": 6,
    "description": "标准近战"
  },
  "runner": {
    "id": "runner",
    "name": "疾奔兽",
    "hp": 22,
    "move": 2,
    "range": 0,
    "damage": 5,
    "description": "快速贴近"
  },
  "shield": {
    "id": "shield",
    "name": "铁盾卫",
    "hp": 50,
    "move": 1,
    "range": 0,
    "damage": 8,
    "description": "每回合首次直接攻击受到的伤害减半，后续正常；连发可以破盾"
  },
  "spear": {
    "id": "spear",
    "name": "投矛手",
    "hp": 28,
    "move": 1,
    "range": 3,
    "damage": 4,
    "description": "进射程后停止移动"
  },
  "bug": {
    "id": "bug",
    "name": "飞掠虫",
    "hp": 18,
    "move": 2,
    "range": 0,
    "damage": 3,
    "description": "低血量数量压力"
  },
  "drummer": {
    "id": "drummer",
    "name": "战鼓手",
    "hp": 36,
    "move": 1,
    "range": 0,
    "damage": 4,
    "description": "每次行动后让最近另一名非首领敌人额外移动 1 格；同一目标每回合至多一次"
  },
  "healer": {
    "id": "healer",
    "name": "缝补者",
    "hp": 30,
    "move": 1,
    "range": 3,
    "damage": 0,
    "description": "在射程内恢复最近另一名非首领敌人 6／9／12 血；无目标则不施法"
  },
  "bomber": {
    "id": "bomber",
    "name": "爆甲虫",
    "hp": 42,
    "move": 1,
    "range": 0,
    "damage": 10,
    "description": "攻击一次后自毁；被玩家击杀不爆炸伤害玩家"
  },
  "boss1": {
    "id": "boss1",
    "name": "磐甲统领",
    "hp": 180,
    "move": 1,
    "range": 0,
    "damage": 14,
    "position": 5,
    "description": "每次敌方阶段给最近一个普通敌人6护盾，同一目标此护盾上限6。"
  },
  "boss2": {
    "id": "boss2",
    "name": "雷鸣祭司",
    "hp": 320,
    "move": 1,
    "range": 3,
    "damage": 7,
    "position": 5,
    "description": "每第二次攻击改为给最近两个普通敌人的下一次攻击+2，同源不叠加；无友军则正常攻击。"
  },
  "boss3": {
    "id": "boss3",
    "name": "裂隙核心",
    "hp": 580,
    "move": 1,
    "range": 2,
    "damage": 10,
    "position": 4,
    "description": "半血后攻击14；免疫击退，缓行最低移动1格。"
  }
};

export const WAVES = [
  [
    "walker"
  ],
  [
    "walker",
    "runner"
  ],
  [
    "walker",
    "bug"
  ],
  [
    "shield",
    "spear"
  ],
  [
    "walker",
    "runner",
    "healer"
  ],
  [
    "boss1"
  ],
  [
    "walker",
    "runner",
    "bug"
  ],
  [
    "walker",
    "shield",
    "spear"
  ],
  [
    "runner",
    "bug",
    "bomber"
  ],
  [
    "walker",
    "drummer",
    "healer"
  ],
  [
    "walker",
    "shield",
    "spear",
    "bomber"
  ],
  [
    "boss2",
    "runner",
    "bug"
  ],
  [
    "walker",
    "runner",
    "bug",
    "bomber"
  ],
  [
    "walker",
    "shield",
    "spear",
    "healer"
  ],
  [
    "walker",
    "runner",
    "bug",
    "drummer"
  ],
  [
    "walker",
    "shield",
    "spear",
    "bomber"
  ],
  [
    "shield",
    "spear",
    "healer",
    "bomber"
  ],
  [
    "boss3",
    "walker",
    "runner"
  ]
];

export const TALENTS = [
  {
    "id": "body",
    "name": "结实体魄",
    "description": "每级最大生命 +5。",
    "costs": [
      1,
      2
    ]
  },
  {
    "id": "repair",
    "name": "战后修缮",
    "description": "击杀首领：每级回复 3 生命。",
    "costs": [
      1,
      2
    ]
  },
  {
    "id": "supply",
    "name": "启动储备",
    "description": "每级起始招募值 +25。",
    "costs": [
      1,
      2
    ]
  },
  {
    "id": "refresh",
    "name": "货架筛选",
    "description": "起始刷新值 +10",
    "costs": [
      2
    ]
  },
  {
    "id": "remove",
    "name": "拆解工具",
    "description": "起始删除值 +30",
    "costs": [
      3
    ]
  },
  {
    "id": "swap",
    "name": "灵巧手套",
    "description": "每级起始换位值 +5。满级时起始可换位 3 次。",
    "costs": [
      1,
      2
    ]
  },
  {
    "id": "emergency",
    "name": "应急护板",
    "description": "每局首次受伤后存活且生命低于 30：获得 10 护盾。",
    "costs": [
      3
    ]
  },
  {
    "id": "focus",
    "name": "定向补给",
    "description": "首次招募前，可指定已有元素：第一个候选必为该系，品质照常抽取。跳过也消耗。",
    "costs": [
      3
    ]
  },
  {
    "id": "medicine",
    "name": "营地医药",
    "description": "事件直接治疗量 +5",
    "costs": [
      2
    ]
  },
  {
    "id": "reroll",
    "name": "准备预案",
    "description": "首次招募前，可重新抽取整组初始 4 个法术。每局 1 次。",
    "costs": [
      1
    ]
  },
  {
    "id": "freeSwap",
    "name": "灵活编排",
    "description": "每轮第一次有效换位免费。",
    "costs": [3]
  },
  {
    "id": "freeRefresh",
    "name": "再看一次",
    "description": "每局第一次候选刷新免费。适用于法术、羁绊和卷轴。",
    "costs": [2]
  },
  {
    "id": "skipRefresh",
    "name": "弃选回收",
    "description": "跳过付费招募：获得 5 刷新值。每局最多 2 次。",
    "costs": [3]
  },
  {
    "id": "scrollCache",
    "name": "旅途卷匣",
    "description": "完成第 6、12、18 批：随机获得 1 枚元素卷轴。清场回合不重复获得。",
    "costs": [3]
  },
  {
    "id": "rescueScroll",
    "name": "绝境药匣",
    "description": "应急护板触发并存活过本轮：获得回澜卷轴，禁水时改为岩阵卷轴。每局 1 次。",
    "costs": [3]
  },
  {
    "id":"fieldCare","name":"行军药包",
    "description":"完成第 3、6、9、12、15、18 批：回复 4 生命。清场回合不触发。","costs":[4]
  },
  {
    "id":"safeCamp","name":"余温结界",
    "description":"事件治疗溢出时：将溢出量转为护盾，每次最多 8。受护盾上限限制。","costs":[5]
  },
  {
    "id":"wardReserve","name":"破关仪式",
    "description":"第 6、12、18 批敌人入场：获得 6 护盾。受护盾上限限制。","costs":[6]
  },
  {
    "id":"renewal","name":"舍取之间",
    "description":"跳过羁绊选择：回复 4 生命。每局最多 3 次。","costs":[7]
  },
  {
    "id":"lastLight","name":"不灭烛火",
    "description":"每局首次受到致命伤害：结束本轮敌方行动，回复至 15 生命。","costs":[8]
  },
  {
    "id":"scout","name":"初识秘典",
    "description":"首次普通招募：第一个候选至少为优良品质。刷新保留此保底；跳过也消耗。","costs":[4]
  },
  {
    "id":"scholar","name":"深卷研读",
    "description":"首次双倍招募：第一个候选至少为稀有品质。刷新保留此保底；跳过也消耗。","costs":[5]
  },
  {
    "id":"freshInk","name":"未录之术",
    "description":"招募第三候选优先出现未持有的法术。沿用本次抽中的品质和元素；无新法术时正常抽取。","costs":[6]
  },
  {
    "id":"scrollMerchant","name":"书商赠礼",
    "description":"选取双倍或三倍招募的法术：额外获得 1 枚随机元素卷轴。每局最多 2 次。","costs":[7]
  },
  {
    "id":"deepStudy","name":"禁书通行",
    "description":"三倍招募提前至第 10 批解锁。费用和品质概率不变。","costs":[8]
  },
  {
    "id":"preparedSigil","name":"预绘法阵",
    "description":"开局：第一个法阵槽位获得 1 种随机元素刻印。不会出现本局禁用元素。","costs":[4]
  },
  {
    "id":"patientStudy","name":"预演仪式",
    "description":"获得蓄能法术时：首次计数减 1，最低为 1。之后的蓄能周期不变。","costs":[5]
  },
  {
    "id":"recycleCharge","name":"拆卷取墨",
    "description":"删除常驻法术：获得 10 刷新值。每局最多 2 次。","costs":[6]
  },
  {
    "id":"succession","name":"火印传承",
    "description":"删除带火印的法术：将 1 层火印传给背包中最早获得、可接受火印的法术。","costs":[7]
  },
  {
    "id":"quietSlot","name":"留白之术",
    "description":"整备时可休止 1 个常驻法术：本轮不施放，下一轮仍可抽取。可以撤销。","costs":[8]
  }
];

export const EVENTS = [
  {
    "id": "anvil",
    "name": "弹夹铁砧",
    "description": "从 10 种附魔中提供三个不同候选，至少含一印记、一刻印；选一并指定合法常驻实体或槽位"
  },
  {
    "id": "circuit",
    "name": "元素回路",
    "description": "均匀随机确定一个元素，提供该元素的印记、刻印及随机一款同元素卷轴，三选一"
  },
  {
    "id": "supplies",
    "name": "遗落补给",
    "description": "刷新值 +10／删除值 +30／换位值 +20／卷轴箱，四选一；箱子打开后三种不同卷轴选一，不额外领取资源"
  },
  {
    "id": "camp",
    "name": "临时营地",
    "description": "恢复 25 血，或最大生命 +10 并恢复 10 血；不超最大生命"
  }
];

export const BULLET_MAP = Object.fromEntries(BULLETS.map(x => [x.id, x]));

export const BOND_MAP = Object.fromEntries(BONDS.map(x => [x.id, x]));

export const ENCHANTMENT_MAP = Object.fromEntries(ENCHANTMENTS.map(x => [x.id, x]));
