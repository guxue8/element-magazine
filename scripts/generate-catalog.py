from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]; specs=root/'docs/superpowers/specs'
def rows(path):
 return [[x.strip() for x in line.strip().strip('|').split('|')] for line in (specs/path).read_text(encoding='utf-8-sig').splitlines() if line.startswith('|')]
def out(v):return json.dumps(v,ensure_ascii=False,indent=2)
elements={k:dict(name=n,symbol=s,color=c) for k,n,s,c in [('fire','火','焰','#ff7955'),('water','水','潮','#59c7fa'),('lightning','雷','电','#c6a4ff'),('wind','风','岚','#68e2b6'),('earth','岩','砾','#e4b969')]}; ek={v['name']:k for k,v in elements.items()}; rq=lambda s:{ek[n]:int(v) for n,v in re.findall(r'([火水雷风岩])\s*≥\s*(\d+)',s)}
rarities=[dict(name=n,label=l,color=c) for n,l,c in [('普通','白','#aab5c3'),('优良','绿','#68d994'),('稀有','蓝','#65afff'),('史诗','紫','#ba8dff'),('传说','橙','#ffb65c')]]
bullets=[]
def card(id,name,element,rarity,mode,style,desc):
 trigger='consumable' if id.startswith('C') else 'timer' if '计时' in mode else 'passive' if '携带' in mode else 'shot'
 m=re.search(r'计时\s*(\d)',mode)
 bullets.append(dict(id=id,name=name,element=element,rarity='白绿蓝紫橙'.index(rarity),style=style,trigger=trigger,counter=int(m[1]) if m else 1 if trigger=='consumable' else 0,description=desc))
for r in rows('parts/fire-thunder.md'):
 if re.fullmatch('[FL]\\d{2}',r[0]):
  i=int(r[0][1:]); e='fire' if r[0][0]=='F' else 'lightning'; style=({'fire':['灼烧','引爆','锻炉'],'lightning':['链电','蓄能','磁阵']}[e])[(i-1)//7]
  card(r[0],r[1],e,r[2],r[3],style,r[5])
for r in rows('parts/wind.md'):
 if re.fullmatch('W\\d{2}',r[0]): card(r[0],r[1],'wind',r[2],r[3],['回响连发','穿透推退','风标'][(int(r[0][1:])-1)//7],r[5])
counts={'水':0,'岩':0}
for r in rows('parts/water-earth.md'):
 if re.match('[水岩]／',r[0]):
  n=r[0][0]; counts[n]+=1; card(('H' if n=='水' else 'R')+f'{counts[n]:02}',r[1],ek[n],r[2],r[3],r[0].split('／')[1],r[4]+' '+r[5])
for r in rows('2026-10-25-scrolls-and-enchantments.md'):
 if re.fullmatch('C\\d{2}',r[0]):card(r[0],r[1],ek[r[2]],r[3],'消耗型／计时 1','一次性卷轴',r[4]+' '+r[5])
bullets.sort(key=lambda b:('FHLWR C'.replace(' ','').index(b['id'][0]),b['id']))
bonds=[]
for r in rows('2026-10-25-bonds-catalog.md'):
 if re.fullmatch('[SDTQA]\\d{2}',r[0]):bonds.append(dict(id=r[0],name=r[1],requirements=rq(r[2]),grade='core' if r[4]=='核心' else 'normal',description=r[3],targetId=None,whiteRequired=8 if r[0]=='T06' else 0,stages=[]))
for r in rows('2026-10-25-bullet-evolutions.md'):
 if re.match('E\\d{2}／',r[0]):
  id,name=r[0].split('／'); target=next(b['id'] for b in bullets if b['name']==r[1].split('／')[0]); bonds.append(dict(id=id,name=name,requirements=rq(r[2]),grade='evolution',description=r[3]+' 成长：'+r[4],targetId=target,whiteRequired=0,stages=[dict(progress=p,description=d) for p,d in zip([2,5,9],r[5:8])],growth=r[4]))
enchants=[]
for r in rows('2026-10-25-scrolls-and-enchantments.md'):
 if re.fullmatch('[MG]\\d{2}',r[0]):enchants.append(dict(id=r[0],name=r[1],element=ek[r[2]],kind='mark' if r[0][0]=='M' else 'slot',description=r[3]+' '+r[4]))
enemies={}
ids=['walker','runner','shield','spear','bug','drummer','healer','bomber']; codes={}
for r in rows('2026-10-25-element-magazine-design.md'):
 if re.match('[步奔盾矛虫鼓医爆]／',r[0]):
  id=ids[len(enemies)]; code,name=r[0].split('／'); codes[code]=id; nums=re.findall(r'\d+',r[3]); enemies[id]=dict(id=id,name=name,hp=int(r[1]),move=int(r[2]),range=int(nums[0]),damage=int(nums[1]) if len(nums)>1 else 0,description=r[4])
for i,(name,hp,ran,damage,position,desc) in enumerate([('磐甲统领',180,0,14,5,'每次敌方阶段给最近一个普通敌人6护盾，同一目标此护盾上限6。'),('雷鸣祭司',320,3,7,5,'每第二次攻击改为给最近两个普通敌人的下一次攻击+2，同源不叠加；无友军则正常攻击。'),('裂隙核心',580,2,10,4,'半血后攻击14；免疫击退，缓行最低移动1格。')],1):
 id=f'boss{i}';enemies[id]=dict(id=id,name=name,hp=hp,move=1,range=ran,damage=damage,position=position,description=desc)
codes.update({'首领一':'boss1','首领二':'boss2','首领三':'boss3'})
waves=[]
for r in rows('2026-10-25-element-magazine-design.md'):
 if len(r)==4 and r[0].isdigit() and 1<=int(r[0])<=18 and all(x in codes for x in r[1].split('、')):waves.append([codes[x] for x in r[1].split('、')])
talents=[]; tids=['body','repair','supply','refresh','remove','swap','emergency','focus','medicine','reroll']
for r in rows('2026-10-25-element-magazine-design.md'):
 if len(r)==3 and '级，' in r[1]:talents.append(dict(id=tids[len(talents)],name=r[0],description=r[2],costs=[int(x) for x in r[1].split('，')[1].split('＋')]))
events=[]; eids=['anvil','circuit','supplies','camp']
for r in rows('2026-10-25-element-magazine-design.md'):
 if len(r)==2 and r[0] in ['弹夹铁砧','元素回路','遗落补给','临时营地']:events.append(dict(id=eids[len(events)],name=r[0],description=r[1]))
assert len(bullets)==113,(len(bullets),counts);assert len(bonds)==61;assert len(waves)==18
parts=['// Approved design data. Regenerate with python scripts/generate-catalog.py.']
for name,value in [('ELEMENTS',elements),('RARITIES',rarities),('BULLETS',bullets),('BONDS',bonds),('ENCHANTMENTS',enchants),('ENEMIES',enemies),('WAVES',waves),('TALENTS',talents),('EVENTS',events)]:parts.append('export const '+name+' = '+out(value)+';')
for singular,plural in [('BULLET','BULLETS'),('BOND','BONDS'),('ENCHANTMENT','ENCHANTMENTS')]:parts.append(f'export const {singular}_MAP = Object.fromEntries({plural}.map(x => [x.id, x]));')
(root/'src/catalog.js').write_text('\n\n'.join(parts)+'\n',encoding='utf-8')
print('Generated',len(bullets),'bullets,',len(bonds),'bonds,',len(enchants),'enchantments,',len(waves),'waves.')
