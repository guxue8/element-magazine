# 静态发布实现报告

2026-10-26 已按用户要求发布首个完整试玩版 v0.1。仓库：https://github.com/guxue8/element-magazine；游戏：https://guxue8.github.io/element-magazine/。

首个发布提交 `5a4b183de3b7fc6e4a0d84d70d0810956507abb4` 的 GitHub Actions 测试、构建、HTTP 素材校验与 Pages 部署全部成功：https://github.com/guxue8/element-magazine/actions/runs/40338577271 。本地 272 项测试通过，20 局无天赋自动流程全部正常结束（12 胜）；这不代表已完成所有构筑的平衡验证。

线上首页返回 HTTP 200；21 个运行文件和代表性 PNG/SVG/署名文件均返回 200，MIME 正常，与上传提交逐字节一致。内置浏览器访问线上域名遇到 ERR_CONNECTION_CLOSED，尚未完成公网浏览器画面验收；本地桌面、横屏和竖屏提示已验收。未修改代理、防火墙或证书设置。

已实现零依赖 Node HTTP 预览服务器、白名单静态导出、GitHub Pages Actions 流程与中文 README；包含根 .nojekyll。GitHub Pages 使用 workflow 模式，源码和本地生成日志分离；发布凭据不进入仓库。

服务器默认127.0.0.1:4174，可通过--port和--base /element-magazine/模拟仓库子路径。仅提供index.html、style.css、src、assets与.nojekyll；阻止目录穿越、编码路径穿越、隐藏路径和符号链接，支持GET/HEAD与正确MIME。构建仅复制网页白名单至dist；不复制docs、tests、scripts或package文件。

官方版本查证：GitHub Pages自定义工作流文档明确使用checkout@v6、configure-pages@v5、upload-pages-artifact@v4、deploy-pages@v4；setup-node官方仓库当前README介绍v7，故采用setup-node@v7并指定Node24。流程触发main/master push与workflow_dispatch，部署权限pages:write/id-token:write，仅上传dist。

来源：
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://github.com/actions/setup-node

验证：node --check两个脚本通过；npm run build成功。临时服务器4189下验证子路径首页200、JS/CSS MIME、docs/tests/package/缺失路径404、编码穿越403、POST405；自测完成后停止，没有占用4173。首次沙箱内连接localhost出现EACCES，随后经工具批准在沙箱外执行同一只读测试并通过。

当前 UI 与运行模块已全部落盘，完整 dist 已在 GitHub Actions 中重新生成并发布。README 提供实际游戏地址；后续推送 main 自动测试和更新网站。
