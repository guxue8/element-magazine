// One logical clock drives frame advancement and CSS animation playback.
export class PlaybackClock {
 constructor(now=()=>performance.now()){
  this.now=now;this.speed=1;this.paused=false;this.reset();
 }
 reset(){this.time=0;this.last=this.now();}
 elapsed(){
  const next=this.now();
  if(!this.paused)this.time+=Math.max(0,next-this.last)*this.speed;
  this.last=next;return this.time;
 }
 setPaused(paused){this.elapsed();this.paused=paused;}
 setSpeed(speed){this.elapsed();this.speed=speed;}
}
