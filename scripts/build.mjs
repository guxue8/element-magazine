import { mkdir, readdir, lstat, copyFile, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const dist = path.resolve(root,'dist');
if (path.dirname(dist) !== path.resolve(root) || path.basename(dist) !== 'dist') throw new Error('Invalid build destination');
for (const name of ['index.html','style.css','src']) await access(path.join(root,name));
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
async function copyTree(source,target) {
  const entry = await lstat(source);
  if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${source}`);
  if (entry.isDirectory()) {
    await mkdir(target,{recursive:true});
    for (const name of await readdir(source)) {
      if (!name.startsWith('.')) await copyTree(path.join(source,name),path.join(target,name));
    }
  } else if (entry.isFile()) await copyFile(source,target);
}
for (const name of ['index.html','style.css','src']) await copyTree(path.join(root,name),path.join(dist,name));
try { await access(path.join(root,'assets')); await copyTree(path.join(root,'assets'),path.join(dist,'assets')); } catch(error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(path.join(dist,'.nojekyll'),'');
console.log('Static build ready: dist/');
