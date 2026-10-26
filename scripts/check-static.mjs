// Local-only release check. Run after npm run build.
import {spawn} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
async function assetFiles(directory='assets/'){
  const files=[];
  for(const entry of await readdir(new URL(directory,root),{withFileTypes:true})){
    const file=`${directory}${entry.name}`;
    if(entry.isDirectory())files.push(...await assetFiles(`${file}/`));
    else if(entry.isFile())files.push(file);
    else throw new Error(`Unsupported asset entry: ${file}`);
  }
  return files.sort();
}
const expectedMIME={html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',json:'application/json',txt:'application/octet-stream'};
const child=spawn(process.execPath,['scripts/serve.mjs','--port','0','--base','/element-magazine/'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
try {
  const url=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview server did not start')),10000);
    child.once('error',reject);
    child.stdout.on('data',chunk=>{const match=String(chunk).match(/LocalURL: (http:\/\/\S+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
    child.stderr.on('data',chunk=>{clearTimeout(timer);reject(new Error(String(chunk)));});
  });
  const runtimeFiles=['index.html','style.css','src/app.js','src/campaign.js','src/combat.js','src/combat-effects.js','src/combat-bonds.js','src/catalog.js','src/random.js','src/storage.js','src/resources.js','src/art.js','src/view-utils.js','src/presentation.js','src/pixel-art.js','src/pixel.css'];
  const assets=await assetFiles();
  assert.ok(assets.some(file=>file.endsWith('.svg')),'local SVG icons must be present');
  for(const required of ['assets/pixel/fantasy-atlas.png','assets/pixel/forest-ruins.png','assets/icons/credits.json','assets/icons/LICENSE.txt'])assert.ok(assets.includes(required),required);
  for(const file of [...runtimeFiles,...assets]){
    const response=await fetch(new URL(file==='index.html'?'':file,url));
    assert.equal(response.status,200,file);
    const extension=file.split('.').at(-1),mime=expectedMIME[extension]??'application/octet-stream';
    assert.equal(response.headers.get('content-type')?.split(';')[0],mime,`${file} MIME`);
    const source=await readFile(new URL(file,root));
    assert.ok(source.byteLength>0,file);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),source,`${file} served bytes`);
    assert.deepEqual(await readFile(new URL(`dist/${file}`,root)),source,`dist/${file} bytes`);
  }
  assert.equal((await fetch(new URL('docs/implementation-contract.md',url))).status,404);
  assert.equal((await fetch(new URL('src/app.js',url),{method:'POST'})).status,405);
  await readFile(new URL('dist/.nojekyll',root));
  console.log(`PASS: ${runtimeFiles.length} runtime files + ${assets.length} local assets, repository subpath, MIME, byte-for-byte dist equality, no development files exposed.`);
} finally {child.kill();}
