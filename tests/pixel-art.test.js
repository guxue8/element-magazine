import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PIXEL_BACKGROUND,spriteStyle} from '../src/pixel-art.js';
import {ENEMIES} from '../src/catalog.js';

test('pixel URLs are anchored to their module, independent of the consuming CSS directory',async()=>{
  const background=new URL(PIXEL_BACKGROUND);
  assert.equal(background.href,new URL('../assets/pixel/forest-ruins.png',import.meta.url).href);
  const atlas=spriteStyle('hero').match(/--sprite-image:url\("([^\"]+)"\)/)?.[1];
  assert.equal(atlas,new URL('../assets/pixel/fantasy-atlas.png',import.meta.url).href);
  for(const url of [background,new URL(atlas)])assert.equal((await readFile(url)).subarray(1,4).toString(),'PNG');
});

test('all campaign characters have finite proportional sprite frames and unknown types fall back',()=>{
  for(const id of ['hero',...Object.keys(ENEMIES)]){
    const style=spriteStyle(id);
    const width=Number(style.match(/--sprite-width:([\d.]+)%/)?.[1]);
    const height=Number(style.match(/--sprite-height:([\d.]+)%/)?.[1]);
    assert.ok(width>0&&width<=100&&height>0&&height<=100,id);
    assert.equal(Math.max(width,height),100,id);
    assert.doesNotMatch(style,/NaN|undefined/);
  }
  assert.equal(spriteStyle('unknown'),spriteStyle('walker'));
});
