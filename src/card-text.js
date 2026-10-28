// Card-face copy is authored separately from the complete rules in catalog.js.
// Numeric badges are base values, never estimates of final combat damage.
import {BULLET_MAP} from './catalog.js';
import {magicText} from './spell-language.js';

const stat=(kind,label,value)=>({kind,label,value});
const entry=(text,damage=null,extra=[],direction=null,damageLabel='基础伤害')=>({
  text,stats:[...(damage===null?[]:[stat('damage',damageLabel,damage)]),...extra],direction,
});
const COPY={
  F01:entry('附加 1 层燃烧。',8,[stat('burn','燃烧',1)]),
  F02:entry('击杀：给 1 格内另一敌人附加 2 层燃烧。每夹一次。',6,[stat('burn','传播燃烧',2)]),
  F03:entry('主目标与 1 格内另一敌人各附加 1 层燃烧。',7,[stat('burn','燃烧',1)]),
  F04:entry('命中燃烧敌人：复制其至多 2 层燃烧给 1 格内另一敌人。每夹一次，不消耗原层数。',9,[stat('burn','复制上限',2)]),
  F05:entry('附加 2 层燃烧。',6,[stat('burn','燃烧',2)]),
  F06:entry('爆炸半径 2：所有敌人各附加 3 层燃烧。',30,[stat('burn','燃烧',3)],null,'范围伤害'),
  F07:entry('按命中前的燃烧层数，立即结算一次燃烧；2 格内至多 2 名其他敌人各受每层 2 火伤。每夹一次，不消耗层数。',10,[stat('burn','计入层数上限',5)]),
  F08:entry('爆炸半径 1：其余所有敌人各受 4 火伤。',6,[stat('damage','范围伤害',4)]),
  F09:entry('攻击前破盾 4。每夹一次。',10,[stat('shieldBreak','破盾',4)]),
  F10:entry('击杀：爆炸半径 1，其余所有敌人各受 6 火伤。不连爆。',9,[stat('damage','爆炸伤害',6)]),
  F11:entry('消耗目标至多 2 层燃烧，每层追加 8 火伤。',8,[stat('bonus','每层附伤',8)]),
  F12:entry('爆炸半径 1：其余所有敌人各受 20 火伤。',40,[stat('damage','范围伤害',20)]),
  F13:entry('消耗主目标全部燃烧，每层追加 8 火伤。爆炸半径 2：其余所有敌人各受 48 火伤。',100,[stat('damage','范围伤害',48)]),
  F14:entry('以燃烧最多的敌人为中心，爆炸半径 3。各消耗至多 3 层燃烧，每层追加 6 火伤。',60,[stat('bonus','每层附伤',6)],null,'范围伤害'),
  F15:entry('命中主目标。',12),
  F16:entry('右邻弹的首次命中附加 5 火伤。',7,[stat('bonus','右邻附伤',5)],'right'),
  F17:entry('命中燃烧敌人：推进下邻计时弹。每夹一次。',9,[stat('timer','推进',1)],'down'),
  F18:entry('同行其他白色普通弹的首次命中附加 3 火伤。',6,[stat('bonus','同行附伤',3)],'row'),
  F19:entry('上下邻弹首次命中燃烧敌人：附加 8 火伤，附伤无视护甲。',null,[stat('bonus','相邻附伤',8)],'upDown'),
  F20:entry('成功施放后，同列下方普通魔法的首次命中附加 18 火伤。',60,[stat('bonus','下方附伤',18)],'down'),
  F21:entry('四邻弹的首次命中附加 3 火伤与 1 层燃烧。装填前持有至少 6 枚火弹：获得磁引。',null,[stat('bonus','四邻附伤',3),stat('burn','附加燃烧',1)],'around'),
  H01:entry('召唤 1 泉灵，寿命 2。',null,[stat('summon','泉灵',1),stat('duration','寿命',2)]),
  H02:entry('场上有泉灵时，命中施加潮湿。',10,[stat('wet','潮湿',1)]),
  H03:entry('召唤 1 泉灵，寿命 3，并立即指令。',null,[stat('summon','泉灵',1),stat('duration','寿命',3)]),
  H04:entry('指令最早召唤、尚未接受指令的泉灵立即行动。每夹一次。',6,[stat('summon','指令',1)]),
  H05:entry('召唤 1 雾泉灵，寿命 2，并立即指令。行动额外给 2 护盾，每回合一次。',null,[stat('summon','泉灵',1),stat('shield','行动护盾',2)]),
  H06:entry('爆炸半径 1。召唤泉灵与礁炮各 1，寿命 3。',30,[stat('summon','造物',2)],null,'范围伤害'),
  H07:entry('爆炸半径 2，其余所有敌人各受 24 水伤。召唤 2 泉灵，寿命 3，立即指令。',42,[stat('damage','范围伤害',24),stat('summon','泉灵',2)]),
  H08:entry('命中施加缓行。',9,[stat('slow','移动减少',1)]),
  H09:entry('目标本回合已受到缓行：追加 6 水伤。',8,[stat('bonus','缓行附伤',6)]),
  H10:entry('命中施加缓行；若被控制抗性抵抗，改为缓行后方最近的可控敌人。至多控制 1 敌。',7,[stat('slow','最多控制',1)]),
  H11:entry('1 格内另一敌人受 5 水伤；主副目标各施加缓行。',7,[stat('damage','副目标伤害',5)]),
  H12:entry('消耗潮湿并施加缓行；若缓行无效，改为追加 8 水伤。',8,[stat('bonus','抵抗附伤',8)]),
  H13:entry('爆炸半径 2：所有敌人施加缓行。',42,[stat('slow','移动减少',1)],null,'范围伤害'),
  H14:entry('四邻弹的首次命中附加 3 水伤；其中前 2 次命中施加缓行，同名共享。',null,[stat('bonus','四邻附伤',3),stat('slow','缓行次数',2)],'around'),
  H15:entry('命中主目标。',12),
  H16:entry('命中施加潮湿。首次执行获得 2 战斗刷新，同名每回合一次。',8,[stat('resource','战斗刷新',2)]),
  H17:entry('本回合已获得 2 战斗刷新：追加 8 水伤；否则获得 1 战斗刷新。',8,[stat('bonus','条件附伤',8)]),
  H18:entry('命中潮湿敌人：追加 6 水伤。击杀：获得 1 战斗刷新。',10,[stat('bonus','潮湿附伤',6)]),
  H19:entry('本回合首次获得战斗刷新：回复 2 生命。同名每回合一次。',null,[stat('heal','回复生命',2)]),
  H20:entry('穿透至多 2 名其他敌人，各受 18 水伤。主目标被击杀：获得 2 战斗刷新。',36,[stat('damage','穿透伤害',18)]),
  H21:entry('本回合此前每获得 1 战斗刷新，追加一发 24 水伤追击，最多 2 发；不消耗刷新值。',60,[stat('damage','每发追击',24)]),
  L01:entry('弹跳 2 次，每跳 5 雷伤、距离 2 格。',6,[stat('damage','每跳伤害',5)]),
  L02:entry('主目标 2 格内没有其他敌人：追加 4 雷伤。',10,[stat('bonus','孤立附伤',4)]),
  L03:entry('弹跳 3 次，每跳 3 雷伤、距离 2 格。',7,[stat('damage','每跳伤害',3)]),
  L04:entry('弹跳 2 次，每跳 4 雷伤、距离 2 格；从潮湿敌人出发的这一跳距离增至 4 格。',6,[stat('damage','每跳伤害',4)]),
  L05:entry('弹跳至 2 格内另一敌人，造成 6 雷伤；再返回仍存活的主目标，造成 6 雷伤。',8,[stat('damage','每跳伤害',6)]),
  L06:entry('弹跳 4 次，每跳 24 雷伤、距离 3 格。',60,[stat('damage','每跳伤害',24)]),
  L07:entry('从主目标分出 2 条电链，各弹跳 2 次；每跳 5 雷伤、距离 2 格，所有电链不重复命中。',10,[stat('damage','每跳伤害',5)]),
  L08:entry('蓄力后命中主目标。无目标时保留就绪。',36),
  L09:entry('入夹后仍有其他雷计时弹等待：首次命中获得 1 护盾。同名每夹最多 3。',12,[stat('shield','护盾',1)]),
  L10:entry('击杀主目标：推进右邻计时弹。每夹一次。',7,[stat('timer','推进',1)],'right'),
  L11:entry('命中主目标。',84),
  L12:entry('入夹后每有 1 枚计时弹等待，获得 2 护盾。同名每夹合计最多 6。',null,[stat('shield','护盾上限',6)]),
  L13:entry('此前每施放 1 枚其他蓄力魔法，追加 24 雷伤，最多 2 枚。击杀：溢伤以半径 1 爆炸，最多 60。',132,[stat('bonus','每枚附伤',24),stat('damage','溢伤上限',60)]),
  L14:entry('上下邻计时弹成功执行后，附击 18 雷伤。每枚每夹一次，召唤成功也可触发。',null,[stat('bonus','附击伤害',18)],'upDown'),
  L15:entry('命中主目标。',12),
  L16:entry('右邻弹的首次命中附加 5 雷伤。',7,[stat('bonus','右邻附伤',5)],'right'),
  L17:entry('同列有携带弹：首次命中施加缓行。',10,[stat('slow','移动减少',1)],'column'),
  L18:entry('同列其他弹的首次命中附加 4 雷伤；弹跳距离 +1 格。',null,[stat('bonus','同列附伤',4)],'column'),
  L19:entry('同行其他普通弹首次命中潮湿敌人：对 2 格内另一敌人附击 4 雷伤。',8,[stat('bonus','附击伤害',4)],'row'),
  L20:entry('弹夹中每有一列含携带弹，追加一束 20 雷伤脉冲，最多 3 束；击杀后可换敌。',60,[stat('damage','每束脉冲',20)]),
  L21:entry('磁引。穿透至多 2 名其他敌人，各受 54 雷伤。同列有携带魔法：无视护甲。',108,[stat('damage','穿透伤害',54)],'column'),
  W01:entry('连发 2 发；击杀后下一发可换敌。','6 × 2',[stat('hits','连发',2)],null,'每发伤害 × 发数'),
  W02:entry('以 25% 基础伤害回响此前最近的可用普通弹。同名每夹一次。',9,[stat('echo','回响比例','25%')]),
  W03:entry('连发 2 发；两发命中同一敌人时，第二发追加 5 风伤。','4 × 2',[stat('bonus','同目标附伤',5)],null,'每发伤害 × 发数'),
  W04:entry('以 50% 基础伤害回响已发射的左邻普通弹。同名每夹一次。',6,[stat('echo','回响比例','50%')],'left'),
  W05:entry('连发 2 发；首发击杀时，第二发换敌并追加 8 风伤。','5 × 2',[stat('bonus','击杀附伤',8)],null,'每发伤害 × 发数'),
  W06:entry('连发 6 道风刃；击杀后下一道可换敌。','18 × 6',[stat('hits','连发',6)],null,'每道伤害 × 次数'),
  W07:entry('以 60% 基础伤害回响最近 2 枚元素不同的可用普通弹，按原先顺序执行。同名每夹一次。',30,[stat('echo','回响比例','60%')]),
  W08:entry('穿透至多 3 敌。',6,[stat('hits','最多目标',3)],null,'每目标伤害'),
  W09:entry('命中距玩家不超过 2 格的敌人：击退 1 格。',7,[stat('push','击退距离',1)]),
  W10:entry('对主目标 1 格内另一敌人造成 6 风伤。',10,[stat('damage','副目标伤害',6)]),
  W11:entry('命中击退 1 格。',10,[stat('push','击退距离',1)]),
  W12:entry('命中击退 1 格；成功则追加 4 风伤，失败则获得 2 护盾。击杀不触发，同名每夹最多给 4 护盾。',8,[stat('bonus','击退附伤',4),stat('shield','抵抗护盾',2)]),
  W13:entry('穿透至多 3 敌；伤害结算后，各击退 1 格。',36,[stat('hits','最多目标',3)],null,'每目标伤害'),
  W14:entry('同行其他普通弹穿透目标 +1，上限 3；首次命中附加 2 风伤。不增加弹跳或范围目标。',null,[stat('bonus','同行附伤',2)],'row'),
  W15:entry('命中施加风标。',9,[stat('bonus','风标附伤',3)]),
  W16:entry('右邻、下邻弹的首次命中各附加 3 风伤。',7,[stat('bonus','相邻附伤',3)],'rightDown'),
  W17:entry('给主目标与 1 格内另一敌人施加风标；副目标不受本弹伤害。',6,[stat('hits','最多风标',2)]),
  W18:entry('上下邻弹的首次命中各附加 5 风伤。',null,[stat('bonus','相邻附伤',5)],'upDown'),
  W19:entry('命中施加风标。右邻非风普通弹首次命中消耗风标时，另附加 6 风伤。',7,[stat('bonus','右邻附伤',6)],'right'),
  W20:entry('给主目标与另外至多 2 名最近敌人施加风标；其他目标不受本弹伤害。',24,[stat('hits','最多风标',3)]),
  W21:entry('命中带风标的主目标：再追击至多 2 名带风标敌人，各受 12 风伤并失去风标。同名每夹一次，追击不另结算风标伤害。',12,[stat('damage','每次追击',12)]),
  R01:entry('召唤 1 岩卫，寿命 2。',null,[stat('summon','岩卫',1),stat('duration','寿命',2)]),
  R02:entry('攻击前破盾 6。',8,[stat('shieldBreak','破盾',6)]),
  R03:entry('召唤 1 礁炮，寿命 2。',null,[stat('summon','礁炮',1),stat('duration','寿命',2)]),
  R04:entry('指令 1 个岩造物立即行动，礁炮优先。每夹一次，只选尚未接受指令的造物。',6,[stat('summon','指令',1)]),
  R05:entry('召唤 1 散射礁炮，寿命 2；命中后向 1 格内另一敌人溅射 6 岩伤，每回合一次。',null,[stat('summon','散射礁炮',1),stat('bonus','溅射伤害',6)]),
  R06:entry('爆炸半径 1，其余敌人各受 24 岩伤。召唤岩卫与礁炮各 1，寿命 3。',60,[stat('damage','范围伤害',24),stat('summon','造物',2)]),
  R07:entry('爆炸半径 2，其余敌人各受 36 岩伤。召唤岩卫与礁炮各 1，寿命 3，并立即指令。',60,[stat('damage','范围伤害',36),stat('summon','造物',2)]),
  R08:entry('命中获得 1 护盾。同名每夹最多 4。',10,[stat('shield','护盾',1)]),
  R09:entry('执行时没有护盾：获得 3 护盾。同名每夹一次，无需命中。',8,[stat('shield','护盾',3)]),
  R10:entry('攻击前消耗至多 4 护盾，每点追加 3 岩伤。无目标不消耗。',8,[stat('bonus','每点护盾附伤',3)]),
  R11:entry('命中后获得 1 次反击机会，反击造成 10 岩伤。',8,[stat('counter','反击伤害',10)]),
  R12:entry('本回合首次岩伤反击造成伤害后，获得 6 护盾。同名每回合一次。',null,[stat('shield','反击后护盾',6)]),
  R13:entry('攻击后获得 12 护盾与 2 次反击机会，每次反击造成 10 岩伤。',60,[stat('shield','护盾',12),stat('counter','反击次数',2)]),
  R14:entry('上邻弹的首次命中附加 6 岩伤；执行本槽时获得 3 护盾。',null,[stat('bonus','上邻附伤',6),stat('shield','护盾',3)],'up'),
  R15:entry('命中主目标。',12),
  R16:entry('命中满血敌人：追加 8 岩伤。击杀：获得 1 战斗拆解。',8,[stat('bonus','满血附伤',8)]),
  R17:entry('命中满血敌人：获得 1 战斗拆解。',9,[stat('resource','战斗拆解',1)]),
  R18:entry('本夹首次子弹本体击杀：获得 3 战斗拆解。同名每夹一次。',null,[stat('resource','战斗拆解',3)]),
  R19:entry('四邻每有 1 个空槽，追加 3 岩伤，最多计入 2 格。',10,[stat('bonus','每空槽附伤',3)],'around'),
  R20:entry('攻击前破盾 12；每实际移除 4 护盾，获得 1 战斗拆解。',36,[stat('shieldBreak','破盾',12)]),
  R21:entry('本阵每有 1 个空槽，追加一发 24 岩伤碎片，最多 3 发。主目标被击杀：获得 3 战斗拆解。',108,[stat('damage','每发碎片',24)]),
  C01:entry('为左邻伤害魔法刻下永久火印：基础伤害 +20%，最多 3 层。未就绪的蓄力魔法也能保留强化。',null,[stat('bonus','每层增幅','20%'),stat('hits','层数上限',3)],'left'),
  C02:entry('选燃烧最多的至多 2 敌，各消耗至多 3 层燃烧，每层造成 4 火伤。',null,[stat('burn','每层伤害',4),stat('hits','最多目标',2)]),
  C03:entry('对最近 3 敌施加潮湿与缓行。',null,[stat('hits','最多目标',3)]),
  C04:entry('回复 8 生命，获得 2 战斗刷新。',null,[stat('heal','回复生命',8),stat('resource','战斗刷新',2)]),
  C05:entry('推进右邻计时弹；归零后仍在原槽位执行。',null,[stat('timer','推进',1)],'right'),
  C06:entry('上下邻常驻魔法获得永久磁引。从下次入阵开始生效，同类不叠加。',null,[stat('weight','抽取权重','×2')],'upDown'),
  C07:entry('左邻常驻魔法获得永久潜伏。从下次入阵开始生效，同类不叠加。',null,[stat('weight','抽取权重','×0.5'),stat('bonus','首段增幅','20%')],'left'),
  C08:entry('召唤岩卫与礁炮各 1，寿命 2。',null,[stat('summon','造物',2),stat('duration','寿命',2)]),
};

const GLOSSARY=[
  ['explosion','爆炸','以爆心为中心，命中左右半径内的全部敌人，不受目标数量限制。按战线距离判定，边界也命中；每个目标在同一次爆炸中只受一次范围伤害。'],
  ['burn','燃烧','每层在敌人行动前造成 2 火伤，上限 5 层。持续 2 次结算，再次施加会刷新持续时间。'],
  ['wet','潮湿','持续 2 个回合的水属性标记；本身不造成伤害，由子弹或羁绊利用。再次施加刷新持续时间。'],
  ['slow','缓行','本回合移动距离 −1。成功受控的敌人本回合和下回合抵抗新的控制；首领至少移动 1 格。'],
  ['push','击退','令敌人向右移动。首领免疫击退；敌人在最右端或有控制抗性时不会移动。成功后获得控制抗性。'],
  ['resist','控制抗性','成功受到缓行或击退后，本回合及下回合不能再次受控。'],
  ['mark','风标','下一枚其他子弹首次命中该敌人时，附加 3 风伤并消耗标记；不叠加，玩家射击阶段结束时清除。'],
  ['timer','计时','每次实际入夹后计数 −1，归零才执行。成功攻击或召唤后重置；未抽中不计数，无有效目标保留 0。'],
  ['advance','推进','令尚未执行、尚未归零的计时弹额外 −1。每枚每回合最多受一次推进，不能连锁推进。'],
  ['passive','携带','进入弹夹即可提供所写效果，自身不发射。被休止的子弹不生效。'],
  ['consumable','一次性','实际入夹并锁定后优先触发，随后从本局背包删除；未抽中会保留，没有合法目标也会消耗。'],
  ['firstHit','首击','每枚子弹每夹的第一次本体直接命中，不含回响、造物、燃烧和衍生附击。连发、穿透、群攻也只触发一次。',['首次命中']],
  ['base','基础伤害','子弹自带的直接攻击数值；不含条件附伤、燃烧、造物和外部附加效果。'],
  ['echo','回响','按比例重复已发射普通弹的基础攻击形态，不复制状态、资源、召唤与外部附伤；不会连锁。同一来源每夹一次，风弹共享最多 3 次。'],
  ['pierce','穿透','攻击主目标及同位置或后方敌人；位置重叠也可命中，通常最多 3 个不同目标。'],
  ['jump','弹跳','从刚命中的敌人跳向范围内最近的合法敌人；默认不重复命中，特殊返回按卡面说明。'],
  ['volley','连发','在同一槽位依次攻击多次；前一目标死亡后可重新选敌，首次命中效果仍只领取一次。'],
  ['overflow','溢伤','本次攻击超过目标剩余生命与护盾的伤害。转移不再触发本体击杀或新的溢伤。'],
  ['break','破盾','攻击前直接移除敌方护盾；不是伤害，也不能移除独立护甲。'],
  ['armor','护甲','减免伤害的敌人能力，与可消耗的护盾分开；无视护甲仍会被护盾吸收。'],
  ['shield','护盾','优先抵挡伤害，基础上限 20；部分羁绊可提高上限。未消耗的护盾保留到下一回合。'],
  ['summon','造物','每回合在子弹阶段之后行动。场上最多 4 个，同种最多 2 个；超限替换寿命最短者，替换不触发自然到期。'],
  ['spring','泉灵','正常行动造成 6 水伤并施加潮湿，优先选未潮湿敌人。雾泉灵额外给盾。所有造物总上限 4，同种上限 2。'],
  ['guard','岩卫','正常行动给予玩家 3 护盾。所有造物总上限 4，同种上限 2；超限替换寿命最短者。'],
  ['cannon','礁炮','正常行动造成 12 岩伤，命中潮湿敌人再附加 4 水伤。所有造物总上限 4，同种上限 2。'],
  ['life','寿命','造物每次正常行动消耗 1 点，归零自然到期；额外指令不消耗寿命。'],
  ['command','指令','令一个造物立即额外行动；每个造物每回合最多接受一次，不扣寿命。'],
  ['counter','反击','敌人攻击后对攻击者造成岩伤。子弹反击机会每回合共享上限 2，未使用机会在阶段结束清空。'],
  ['refresh','战斗刷新','本回合通过战斗得到的刷新值，所有来源共享每回合 +2 上限；不包括钱包原有或波间奖励。'],
  ['remove','战斗拆解','获得删除值，所有战斗来源共享每回合 +3 上限；达到删除费用后可永久移除一枚背包子弹。'],
  ['magnet','磁引','装填权重 ×2，增加抽中机会但不保证入夹；同类磁引不叠加。'],
  ['lurk','潜伏','装填权重 ×0.5；若实际入夹，第一次直接攻击的首段基础伤害 +20%。没有发动不累计。'],
  ['empty','空槽','布局锁定时为空或被休止的槽位；子弹射出后，其原槽位不会变为空槽。'],
  ['ordinary','普通弹','每次入夹按槽位直接发射的子弹；包括各品质，不包括计时、携带与一次性子弹。'],
];
const DIRECTION_LABELS={left:'左邻',right:'右邻',up:'上邻',down:'下方',upDown:'上下邻',rightDown:'右邻与下邻',row:'同行',column:'同列',around:'上下左右邻格',next:'下一枚'};
export const CARD_COPY_IDS=Object.freeze(Object.keys(COPY));

export function keywordsForText(text=''){
  const value=magicText(text);
  return GLOSSARY.flatMap(([id,name,description,aliases=[]])=>{
    const shownName=[name,...aliases].map(magicText).find(word=>value.includes(word));
    return shownName?[{id,name:shownName,description:magicText(description)}]:[];
  });
}

function playerText(text){
  return String(text||'暂无说明')
    .replace(/\b[FHLWRC]\d{2}\b/g,id=>BULLET_MAP[id]?.name||id)
    .replace(/原生弹/g,'子弹').replace(/每实体每夹/g,'每枚每夹').replace(/每实体每回合/g,'每枚每回合')
    .replace(/命中前快照/g,'命中前状态').replace(/\s+/g,' ').trim();
}

export function cardText(def){
  if(!def)return {text:'暂无说明',keywords:[],stats:[],direction:null,directionLabel:'',details:''};
  // Bonds deliberately use the current definition: edited conditions must never
  // be hidden behind an older hard-coded summary keyed by the same save id.
  const authored=def.trigger&&COPY[def.id];
  const prefix=def.trigger==='timer'?`计时 ${def.counter}。`:def.trigger==='passive'?'携带。':def.trigger==='consumable'?'一次性。':'';
  const text=magicText(prefix+(authored?.text||playerText(def.description)));
  const stats=authored?authored.stats.map(x=>({...x})):[];
  if(def.trigger==='timer')stats.push(stat('timer','计时',def.counter));
  const direction=authored?.direction||null;
  return {text,keywords:keywordsForText(text),stats,direction,directionLabel:DIRECTION_LABELS[direction]||'',details:magicText(def.description||'')};
}
