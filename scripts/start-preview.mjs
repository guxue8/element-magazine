import { spawn } from 'node:child_process';
import { open, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const url = 'http://127.0.0.1:4174/';
const expected = await readFile(new URL('../index.html', import.meta.url));

async function isReady() {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(1500) });
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return false;
    throw new Error(`Cannot check ${url}: ${error.cause?.code ?? error.message}`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !body.equals(expected)) {
    throw new Error('Port 4174 is occupied by another page. No process was stopped.');
  }
  return true;
}

try {
  if (await isReady()) {
    console.log(`Already running: ${url}`);
  } else {
    const out = await open(new URL('../preview.log', import.meta.url), 'a');
    const err = await open(new URL('../preview-error.log', import.meta.url), 'a');
    let child;
    let startError;
    try {
      child = spawn(process.execPath, ['scripts/serve.mjs', '--port', '4174'], {
        cwd: root, detached: true, windowsHide: true,
        stdio: ['ignore', out.fd, err.fd],
      });
      child.on('error', error => { startError = error; });
      child.unref();
    } finally {
      await out.close();
      await err.close();
    }
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (startError) throw startError;
      if (await isReady()) { ready = true; break; }
      if (child.exitCode !== null) break;
      await delay(200);
    }
    if (!ready) throw new Error('Preview did not start. See preview-error.log for details.');
    console.log(`Ready: ${url}`);
    console.log(`Background server PID: ${child.pid}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
