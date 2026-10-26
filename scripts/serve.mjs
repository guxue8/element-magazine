import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
let port = 4174, base = '/';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port') port = Number(args[++i]);
  else if (args[i] === '--base') base = args[++i];
  else throw new Error(`Unknown argument: ${args[i]}`);
}
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port');
if (typeof base !== 'string' || !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Base must look like /element-magazine/');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon', '.woff2':'font/woff2', '.wav':'audio/wav', '.mp3':'audio/mpeg', '.ogg':'audio/ogg' };
const allowed = name => name === 'index.html' || name === 'style.css' || name === '.nojekyll' || /^(src|assets)\//.test(name);
const inside = (parent, child) => { const rel = path.relative(parent, child); return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel)); };
const server = createServer(async (req,res) => {
  const reply = (status,text) => { res.writeHead(status, {'Content-Type':'text/plain; charset=utf-8'}); res.end(req.method === 'HEAD' ? undefined : text); };
  if (!['GET','HEAD'].includes(req.method)) { res.setHeader('Allow','GET, HEAD'); return reply(405,'Method not allowed'); }
  let pathname;
  try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); } catch { return reply(400,'Invalid URL'); }
  if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(p=>p === '..' || p === '.')) return reply(403,'Forbidden');
  if (base !== '/' && pathname === base.slice(0,-1)) { res.writeHead(308,{Location:base}); return res.end(); }
  if (!pathname.startsWith(base)) return reply(404,'Not found');
  const name = pathname.slice(base.length) || 'index.html';
  if (!allowed(name) || name.split('/').some(p=>p.startsWith('.') && p!=='.nojekyll')) return reply(404,'Not found');
  try {
    const requested = path.resolve(root,name);
    const file = await realpath(requested);
    const canonical = value => process.platform === 'win32' ? value.toLowerCase() : value;
    if (canonical(requested) !== canonical(file)) return reply(403,'Forbidden');
    if (!inside(root,file)) return reply(403,'Forbidden');
    if (!(await stat(file)).isFile()) return reply(404,'Not found');
    const content = await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':content.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) { reply(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500,'Not found'); }
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`LocalURL: http://127.0.0.1:${server.address().port}${base}`));
