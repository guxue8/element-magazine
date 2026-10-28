# 像素素材与裁切

## 素材

| 文件 | 实际尺寸 | 色彩与透明度 | 用途 |
| --- | ---: | --- | --- |
| `assets/pixel/fantasy-atlas.png` | 1448 × 1086 px | RGBA，alpha 0–255 | 主角与 11 种敌人的静态精灵图集 |
| `assets/pixel/forest-ruins.png` | 2172 × 724 px | RGB，不透明 | 奇幻森林遗迹的侧视战场背景 |

这两张图由本次任务的前序代理使用内置 `image_gen` 生成并保存到本地。原始逐字提示词没有在交接上下文中留存，故不能准确复述。已知设计要求为：奇幻像素风、2D 侧视、蓝披风主角面向右侧、11 类敌人面向左侧、透明角色图集、森林遗迹背景、单条地面战线。生成位图保持原样，未重新编辑或抠图。

## 接入

`src/pixel-art.js` 导出 `PIXEL_BACKGROUND` 和 `spriteStyle(type)`。通过 `new URL('../assets/pixel/...', import.meta.url)` 相对模块位置解析成完整 URL，保留部署仓库子路径，避免 CSS 自定义属性把图片误解析到 `src/assets/`。将 `spriteStyle(type)` 返回值经 HTML 属性转义后放到方形 `span.pixel-sprite` 的 `style` 中。CSS 用 `background-size` 和 `background-position` 在原图中选出单个角色，精灵保持最近邻像素渲染。未知类型回退到 `walker`。

图集不是严格的 4×3 等分网格。下表为 `spriteStyle` 使用的各自裁切窗口，坐标为原图左上角起算的 `(x, y, 宽, 高)`，取值单位 px。窗口底边靠近人物脚底，显示时统一落在方形 `span` 下缘。`boss2` 和 `boss3` 的相邻边缘另用 CSS `clip-path` 去除图集中的邻角，不修改原 PNG。

| 类型 | 角色 | 裁切窗口 |
| --- | --- | --- |
| `hero` | 蓝披风守卫 | 16, 60, 380, 290 |
| `walker` | 骷髅步兵 | 405, 65, 300, 285 |
| `runner` | 哥布林 | 740, 85, 320, 265 |
| `shield` | 岩石巨人 | 1080, 25, 360, 325 |
| `spear` | 骷髅弓手 | 25, 380, 320, 325 |
| `bug` | 蝙蝠 | 420, 395, 300, 270 |
| `drummer` | 小恶魔鼓手 | 780, 410, 285, 285 |
| `healer` | 萨满 | 1090, 372, 350, 320 |
| `bomber` | 炸弹史莱姆 | 35, 750, 290, 305 |
| `boss1` | 冰巨人 | 335, 675, 395, 380 |
| `boss2` | 石像鬼 | 735, 695, 350, 360 |
| `boss3` | 巨龙 | 1060, 695, 388, 360 |

实际显示尺寸由容器控制。spriteStyle 输出 --sprite-image、--sprite-size、--sprite-position、--sprite-width、--sprite-height 和 --sprite-clip 自定义属性，由 .pixel-sprite::before 在方形容器内等比例绘制，并贴齐容器底边。图集是静态图，未含逐帧动画。背景为不透明 RGB 图，不应用于角色透明层。

## v0.4 法师与造物

新增 `assets/pixel/spellwarden-atlas-v4.png`（1254 × 1254，RGBA）由内置 imagegen 生成。需求为透明背景、统一的靛蓝金纹银发法师待机与施法两姿态，以及泉灵、岩卫、珊瑚岩炮、水龙、岩石法相和火焰爆炸。原生成位图保持原样；`src/actor-art.js` 用独立窗口取出人物，`src/actors.css` 去除邻接图形边角，使用最近邻渲染。封面、头像和战场均调用 `wardenArt()`；原图集继续承担敌人素材。新图集的两种姿态配合位移、冲击和渐隐动画，不宣称为完整逐帧骨骼动画。
