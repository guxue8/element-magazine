"""Fetch selected official Game-icons SVGs; normalize the documented solid backdrop.

Run manually with Python 3. No runtime/build dependency; installed assets are committed.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, re, time, urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'icons'
BASE = 'https://raw.githubusercontent.com/game-icons/icons/master/'

UI = {
    'bag':'delapouite/backpack','book':'lorc/open-book','settings':'lorc/cog',
    'shop':'lorc/shiny-purse','remove':'delapouite/trash-can','swap':'lorc/back-forth',
    'play':'guard13007/play-button','pause':'guard13007/pause-button','speed':'lorc/fast-arrow',
    'sound':'delapouite/sound-on','mute':'delapouite/sound-off','close':'lorc/cross-mark',
    'refresh':'lorc/cycle','heart':'lorc/shining-heart','shield':'lorc/checked-shield',
    'coin':'lorc/crown-coin','bond':'lorc/linked-rings','talent':'lorc/embrassed-energy',
    'report':'lorc/scroll-unfurled','next':'lorc/arrowhead','home':'lorc/castle',
    'help':'delapouite/info','rotate':'delapouite/horizontal-flip','hero':'lorc/robe',
    'fire':'lorc/small-fire','water':'lorc/drop','lightning':'lorc/power-lightning',
    'wind':'lorc/whirlwind','earth':'lorc/rock','scroll':'lorc/tied-scroll',
    'target':'lorc/reticule','rest':'lorc/sleepy','undo':'lorc/return-arrow',
    'fullscreen':'delapouite/expand','spring':'delapouite/water-fountain',
    'cannon':'lorc/cannon','guard':'lorc/stone-tower','load':'lorc/bullets',
    'enchant':'lorc/crystal-wand','event':'lorc/crystal-ball','timer':'lorc/stopwatch',
}

def group(prefix, names):
    return {f'{prefix}{i:02d}':name if '/' in name else 'lorc/'+name for i,name in enumerate(names.split(),1)}

BULLETS = {
    **group('F','ember-shot burning-embers wildfires fire-tail campfire fire-wave crowned-explosion firework-rocket shatter fire-bomb delapouite/melting-metal delapouite/barrel burning-meteor cluster-bomb cannon-ball time-bomb sword-smithing fire-bowl anvil-impact fire-ring delapouite/furnace'),
    **group('H','sprout water-bolt ghost-ally crystal-wand cloud-ring big-wave trident ice-spear ice-bolt frozen-arrow frozen-block snowflake-2 eclipse snowing droplet-splash wrapped-heart splashy-stream cycle delapouite/water-fountain waves at-sea'),
    **group('L','arcing-bolt focused-lightning lightning-frequency lightning-branches return-arrow lightning-storm lightning-trio batteries power-lightning charged-arrow bottled-bolt bolt-shield tesla-coil lightning-electron lightning-helix ball-glow magnet magnet-blast electrical-crescent lightning-shout skoll/laser-burst'),
    **group('W','feather echo-ripples two-feathers resonance winged-arrow whirlwind skoll/sound-waves wind-slap winged-leg crossed-slashes flat-hammer wind-hole aerodynamic-harpoon piercing-sword flying-flag fast-arrow target-arrows tattered-banner rally-the-troops compass tornado-discs'),
    **group('R','rune-stone drill delapouite/coral stone-crafting crystal-growth meteor-impact gear-hammer bordered-shield armoured-shell shield-bounces crumbling-ball auto-repair mountains stone-throne stone-sphere thrown-charcoal magnifying-glass recycle cannon-shot demolish black-hole-bolas'),
    **group('C','burning-book flaming-sheet frozen-orb pouring-chalice lightning-spanner magnet-blast shadow-follower stone-tablet'),
}
BONDS = {
    **group('S','candle-flame burning-embers fire-ace chalice-drops ghost-ally delapouite/water-fountain arcing-bolt concentration-orb lightning-tree feather echo-ripples winged-arrow rock stone-tower recycle'),
    **group('D','delapouite/steam water-bolt delapouite/lightning-flame lightning-slashes fire-tail flaming-trident sword-smithing volcano lightning-storm lightning-arc resonance frozen-arrow delapouite/coral wave-strike lightning-frequency lightning-bow magnet-blast lightning-shield dust-cloud winged-shield'),
    **group('T','delapouite/steam-blast shining-heart delapouite/healing-shield thunder-struck clockwork rally-the-troops sonic-lightning delapouite/waterfall recycle thunderball'),
    **group('Q','at-sea surrounded-shield fire-ring lightning-electron double-quaver'),
    **group('A','delapouite/furnace vortex radial-balance'),
    **group('E','time-bomb delapouite/melting-metal delapouite/water-recycling bottled-bolt circuitry two-feathers white-tower shield-reflect'),
}
ENEMIES = {
    'walker':'skoll/skeleton','runner':'lorc/werewolf','shield':'delapouite/rock-golem',
    'spear':'lorc/bowman','bug':'delapouite/swamp-bat','drummer':'lorc/imp',
    'healer':'lorc/fairy','bomber':'lorc/evil-minion','boss1':'delapouite/ice-golem',
    'boss2':'delapouite/gargoyle','boss3':'lorc/wyvern',
}
AUTHORS = {'lorc':'Lorc','delapouite':'Delapouite','skoll':'Skoll','guard13007':'Guard13007'}

def get(url):
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Element-Magazine-asset-import'})
            with urllib.request.urlopen(req,timeout=30) as response: return response.read().decode('utf-8')
        except Exception:
            if attempt==2: raise
            time.sleep(attempt+1)

def normalize(svg):
    # Official repository wraps white icon paths in a single opaque square.
    # Remove only that exact backdrop; keep every foreground contour intact.
    svg=re.sub(r'<path\b[^>]*\bd="M0 0h512v512H0z"[^>]*/>', '', svg, count=1)
    svg=re.sub(r'<path\b[^>]*\bd="M0 0h512v512H0z"[^>]*>\s*</path>', '', svg, count=1)
    if not svg.startswith('<svg') or 'viewBox="0 0 512 512"' not in svg: raise ValueError('Unexpected SVG')
    if '<script' in svg or '<image' in svg or 'href=' in svg: raise ValueError('Non self-contained SVG')
    return svg

def filename(source): return source.replace('/','-')+'.svg'
def asset(source): return './assets/icons/'+filename(source)

def fetch(source):
    existing=OUT/filename(source)
    if existing.exists():
        normalize(existing.read_text(encoding='utf-8'))
        return source
    svg=get(BASE+source+'.svg')
    (OUT/filename(source)).write_text(normalize(svg),encoding='utf-8')
    return source

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    sources=sorted(set(UI.values())|set(BULLETS.values())|set(BONDS.values())|set(ENEMIES.values()))
    known={item['path'] for item in json.loads((ROOT/'scripts/icon-tree.json').read_text(encoding='utf-8-sig'))['tree']}
    missing=[source for source in sources if source+'.svg' not in known]
    if missing: raise ValueError('Unknown sources: '+', '.join(missing))
    with ThreadPoolExecutor(max_workers=8) as pool: list(pool.map(fetch,sources))
    (OUT/'LICENSE.txt').write_text(get(BASE+'license.txt'),encoding='utf-8')
    manifest=[{'file':filename(source),'author':AUTHORS[source.split('/')[0]],'source':'https://game-icons.net/1x1/'+source+'.html','license':'https://creativecommons.org/licenses/by/3.0/','changes':'Removed solid square backdrop; glyph unchanged; recolored by CSS.'} for source in sources]
    (OUT/'credits.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    js='// Local Game-icons assets. Full attribution: assets/icons/credits.json and LICENSE.txt.\n'
    for name,table in [('UI_ICONS',UI),('BULLET_ICONS',BULLETS),('BOND_ICONS',BONDS),('ENEMY_ICONS',ENEMIES)]:
        js+='export const '+name+' = Object.freeze('+json.dumps({key:asset(value) for key,value in table.items()},ensure_ascii=False,indent=2)+');\n'
    js+='''
export const ART_CREDIT = 'Icons made by Lorc, Delapouite, Skoll and Guard13007 / Game-icons.net / CC BY 3.0';
export const iconPath = name => UI_ICONS[name] || UI_ICONS.help;
export const bulletIcon = id => BULLET_ICONS[typeof id==='object'?id.id:id] || UI_ICONS.scroll;
export const bondIcon = id => BOND_ICONS[typeof id==='object'?id.id:id] || UI_ICONS.bond;
export const enemyIcon = id => ENEMY_ICONS[typeof id==='object'?id.typeId:id] || ENEMY_ICONS.walker;
'''
    (ROOT/'src/art.js').write_text(js,encoding='utf-8')
    doc='''# 奇幻图标素材来源

本项目图标来自 [Game-icons.net](https://game-icons.net/) 的[官方 SVG 仓库](https://github.com/game-icons/icons)，采用 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) 许可。

**Icons made by Lorc, Delapouite, Skoll and Guard13007.**

- 作者：Lorc（http://lorcblog.blogspot.com）、Delapouite（https://delapouite.com）、Skoll、Guard13007（https://guard13007.com）。
- 选择依据：统一的高对比奇幻剪影；角色尽量采用完整身体轮廓，子弹按火、水、雷、风、岩机制匹配。
- 下载日期：2026-10-26。
- 修改：仅移除官方 SVG 的纯色正方形底板，保留前景路径；颜色由网页 CSS 设置。
- 每枚图标的作者、原始页面、许可与修改声明保存在 `assets/icons/credits.json`；原仓库许可文本保存在 `assets/icons/LICENSE.txt`。
- 运行时全部使用本地文件，没有外部图片热链。设置的素材署名入口保留上述署名和许可链接。
- `src/art.js` 覆盖 113 枚子弹、61 条羁绊、11 种敌人和功能入口；共享图标通过元素色、品质边框与点击详情区分。

## 来源核验

- [官方许可说明](https://github.com/game-icons/icons/blob/master/license.txt)
- [官方贡献许可约定](https://github.com/game-icons/icons/blob/master/CONTRIBUTING.md)

'''
    doc+='## 逐图来源\n\n| 本地文件 | 作者 | 原始页面 |\n|---|---|---|\n'
    doc+=''.join(f"| {item['file']} | {item['author']} | [原始图标]({item['source']}) |\n" for item in manifest)
    (ROOT/'docs/art-credits.md').write_text(doc,encoding='utf-8')
    print(f'Installed {len(sources)} SVG assets; maps: {len(BULLETS)} bullets, {len(BONDS)} bonds, {len(ENEMIES)} enemies.')

if __name__=='__main__': main()
