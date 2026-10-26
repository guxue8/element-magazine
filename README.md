# 弹阵：元素守线

中文单机浏览器肉鸽：把五元素子弹放入3行×4列弹夹，按位置与计时组合输出，守住18批敌人的增援。包括105种常驻弹、8种一次性卷轴、53条基础羁绊、8条专属进化和10种附魔。无需账号，运行时不访问外部服务。

新版采用侧视 2D 奇幻像素场景与角色，敌人在同一条地面线上前进并允许重叠，弹夹位于中下方。子弹使用图标显示，点击查看完整信息；羁绊先显示短说明，完整规则可以展开。背包、羁绊、图鉴、战报和设置从图标入口展开。手机请横屏游玩，竖屏会提示旋转设备。

本轮像素版的自动测试、静态导出与 HTTP 素材检查已通过；已在浏览器检查桌面、844×390 手机横屏和竖屏提示。详见[本轮验证记录](docs/pixel-implementation-report.md)与[当前横屏截图](docs/screenshots/pixel-landscape.png)。

## 本地试玩

Windows 安装 Node.js 24 后，双击项目根目录的 `start-game.cmd`。它会在后台启动本机服务，确认网页响应后打开浏览器；重复双击会复用已运行的服务。关闭浏览器不会停止服务，重启电脑后需再次启动。启动失败时窗口会显示原因，服务日志保存在 `preview.log` 和 `preview-error.log`。

也可以在项目目录运行 `npm start`，然后打开 `http://127.0.0.1:4174/`。无需运行 npm install。请通过 HTTP 访问，直接双击 index.html 不适用于 ES 模块。

开发时若需要在终端前台运行服务：

```sh
npm run dev
```

浏览器打开终端打印的 LocalURL，默认是 `http://127.0.0.1:4174/`；关闭终端或按 Ctrl+C 会停止此前台服务。

也可使用其他端口或模拟GitHub仓库子路径：

```sh
npm run dev -- --port 4180 --base /element-magazine/
```

随后打开 `http://127.0.0.1:4180/element-magazine/`。服务器仅在本机监听；Ctrl+C停止。

## 快速入门

1. 点击开始新局，得到4枚随机白色常驻弹。通过购买图标打开招募：支付100、200或300招募值，从三项候选中选一项，也可跳过，费用不退。300档在第13批解锁。
2. 购买图标内部每条表示100招募值；前期显示两条，第13批起显示三条，提示当前可选招募档位。**条数仅为显示，招募值没有新增储存上限**，超出部分继续保留。
3. 点击装填，从背包中的子弹实体不放回抽入弹夹。弹夹仅显示图标与必要的小标记；点击子弹查看名称、完整效果、计时、附魔及入夹权重。
4. 使用换位和删除图标调整弹夹。换位消耗10点、删除消耗30点，两者各最多储存3次；图标内三条槽显示完整次数与部分充能。删除会从本局背包永久移除所选实体。灵巧手套每级增加5点起始换位值。
5. 点击执行，按从左到右、从上到下结算。普通弹立即攻击；计时弹只有实际入夹执行才推进，归零后发动；携带弹提供布局效果。点击敌人可查看状态与意图，并指定集火目标。
6. 旧敌未消灭仍会保留，下一批照常入场。背包、羁绊和下一批情报可从对应图标查看，音效、动画播放速度等在设置中调整。
7. 指定回合选择羁绊、事件和卷轴；第18批后继续清理残敌，全部消灭获胜。局外点数可购买或免费重置天赋。

血量、资源、背包、候选、随机状态与局外天赋保存在当前浏览器的localStorage。刷新后可继续最近进度；清除网站数据、换浏览器或更换网站地址会使用另一份存档。暂停与动画速度不改变结算结果。

## 测试与静态导出

```sh
npm test
npm run build
node scripts/check-static.mjs
```

导出的dist目录包含index.html、style.css、src、assets及.nojekyll。**assets目录包含背景、图标和素材署名，是运行必需内容。** 将dist内容放到任何支持静态文件的HTTP服务器即可游玩，支持域名根目录与仓库子目录，无需后端。文档、测试与开发脚本不进入dist。

静态检查会启动临时的本机只读服务器，验证仓库子路径下的脚本、SVG、背景及署名文件能加载，检查MIME，并逐字节比较发布目录与源码素材。

## 素材与署名

奇幻图标来自Game-icons.net，本地保存并按其许可署名；像素场景及角色图集为项目生成素材。来源和作者见[像素素材说明](docs/pixel-art.md)、[图标素材说明](docs/art-credits.md)、[逐项图标署名](assets/icons/credits.json)与[图标许可](assets/icons/LICENSE.txt)。发布时请一并保留assets中的署名与许可文件，游戏设置也提供素材来源入口。

## 发布到GitHub Pages

本项目提供发布流程，但当前文件本身不代表已经部署。

1. 登录GitHub，创建一个仓库，例如element-magazine。免费账号可使用公开仓库。
2. 把本项目上传到仓库根目录，确保包含package.json、index.html、style.css、src、assets、tests、scripts和隐藏目录.github；保留docs以便查看设计和素材说明。GitHub Desktop可添加现有项目并发布仓库；用命令行上传时也须包含.github/workflows/pages.yml。不要只上传dist，否则仓库内的自动测试与构建流程不会存在。
3. 在仓库Settings → Pages中，将Build and deployment的Source设为GitHub Actions。
4. 推送到main或master会触发Deploy GitHub Pages流程；也可在Actions中选该流程，点击Run workflow手动运行。
5. 等待测试、构建和部署成功，打开流程deploy步骤或Settings → Pages展示的实际地址。常见项目地址格式为 `https://<用户名>.github.io/<仓库名>/`；请替换占位内容并保留末尾斜杠。仓库名若为`<用户名>.github.io`，则使用该域名根目录。

如果未出现部署，先检查Source是否为GitHub Actions、默认分支是否为main/master，以及Actions失败日志。仓库网页中的代码浏览地址并非游戏入口。

流程使用Node24与GitHub官方Actions，并仅上传dist：[GitHub Pages自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。不需要额外安装依赖或设置访问令牌。
