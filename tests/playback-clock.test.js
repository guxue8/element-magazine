import test from 'node:test';
import assert from 'node:assert/strict';
import {PlaybackClock} from '../src/playback-clock.js';

test('pausing freezes logical time and resuming does not restart the movement',()=>{
 let now=0;const clock=new PlaybackClock(()=>now);clock.reset();
 now=180;clock.setPaused(true);assert.equal(clock.elapsed(),180);
 now=980;assert.equal(clock.elapsed(),180);clock.setPaused(false);
 now=1100;assert.equal(clock.elapsed(),300);
});
test('changing speed preserves elapsed animation time and applies only to future time',()=>{
 let now=0;const clock=new PlaybackClock(()=>now);clock.reset();
 now=100;clock.setSpeed(4);assert.equal(clock.elapsed(),100);
 now=150;assert.equal(clock.elapsed(),300);
 clock.setPaused(true);now=200;clock.setSpeed(2);assert.equal(clock.elapsed(),300);
 clock.setPaused(false);now=250;assert.equal(clock.elapsed(),400);
 clock.reset();assert.equal(clock.elapsed(),0);now=300;assert.equal(clock.elapsed(),100);
});
