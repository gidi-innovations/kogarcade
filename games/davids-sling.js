/* David's Sling Shot (1 Samuel 17): run along the brook and jump to gather five smooth stones, then face Goliath. */
(() => {
let dsEl=null,ds=null,dsRAF=0,gs=null,gsRAF=0;
const { store, say, hush, bar, setBar, learn } = Ark;
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
const onResize=()=>{if(ds&&ds.size)ds.size();if(gs&&gs.size)gs.size()};
const tok=Ark.tok;
// Battle settings per difficulty
const SL={
 easy:{move:0,amp:0,fr:24,aim:22,ring:true,wind:0},
 normal:{move:.9,amp:45,fr:17,aim:13,ring:false,wind:0},
 hard:{move:1.4,amp:85,fr:13,aim:7,ring:false,wind:70}
};
// Brook run settings per difficulty
const GR={easy:{speed:170,gap:[1.7,2.4]},normal:{speed:220,gap:[1.2,1.8]},hard:{speed:270,gap:[.9,1.4]}};
const FACTS=[
 ['David was a shepherd boy who looked after his father’s sheep.','1 Samuel 17:15'],
 ['God helped David save his sheep from a lion and a bear!','1 Samuel 17:34–35'],
 ['Goliath was a giant, over nine feet tall!','1 Samuel 17:4'],
 ['Everyone was afraid of Goliath, but David trusted God.','1 Samuel 17:32'],
 ['David chose five smooth stones out of the brook.','1 Samuel 17:40']
];
const onKey=e=>{if(gs&&(e.key===' '||e.key==='ArrowUp')){e.preventDefault();gJump()}};

function dsIntro(){
 stopAll();
 Ark.menu(dsEl,{
  id:'davids-sling',title:'David’s Sling Shot',icon:'stone',color:'#FF9A62',
  blurb:'Gather five smooth stones, then face the giant!',
  how:[['jump','Jump to collect stones'],['drag','Drag back to aim'],['star','Hit the forehead']],
  listen:'First, run along the brook and jump to collect five smooth stones, like David did. Then drag back to aim your sling, and let go to hit Goliath on the forehead.',
  diffs:{easy:'Slow run. Goliath stands still, with a big target and a long aiming line.',normal:'Faster run. Goliath moves, and the aiming line is shorter.',hard:'Fast run. Goliath moves quickly, the target is small, and the wind blows!'},
  start:d=>gather(d)
 });
}

/* ---------- Part 1: gather five smooth stones ---------- */
const GW=800,GH=360,GY=290;
function gather(mode){
 stopAll();
 dsEl.innerHTML=`<div class="hud"><span class="dpill ${mode}">${Ark.DLABEL[mode]}</span><span>Part 1: The brook</span></div>
  <div id="gBar">${bar(0,'Smooth stones: 0 of 5','gold')}</div>
  <div id="gLearn" style="min-height:62px"></div>
  <canvas id="gC" width="${GW}" height="${GH}" style="width:100%;height:auto;max-width:100%;border:3px solid var(--line);border-radius:14px;touch-action:none;display:block" aria-label="David runs along the brook. Tap or press space to jump."></canvas>
  <button class="btn big" id="gJ" style="width:100%;background:#14946B;color:#fff">Jump</button>`;
 const cv=dsEl.querySelector('#gC');
 gs={mode,G:GR[mode],cv,cx:cv.getContext('2d'),x:0,vy:0,y:0,items:[],next:.8,stones:0,bumps:0,t:0,last:performance.now(),paused:false,slow:0,done:false,pops:[]};
 gs.size=()=>{const d=Math.min(3,devicePixelRatio||1),w=cv.clientWidth||GW;cv.width=Math.round(w*d);cv.height=Math.round(w*GH/GW*d);gs.cx.setTransform(cv.width/GW,0,0,cv.height/GH,0,0)};
 gs.size();
 cv.onpointerdown=e=>{e.preventDefault();gJump()};
 dsEl.querySelector('#gJ').onclick=gJump;
 learn(dsEl.querySelector('#gLearn'),'Tap Jump to leap over bushes and grab the stones!','1 Samuel 17:40',{icon:Ark.I.jump,speak:mode==='easy'});
 Ark.ctl({help:mode==='hard'?null:()=>{say('Tap Jump just before a bush or log. Jump to reach stones in the air.',true)},pause:()=>{gs.paused=true},resume:()=>{gs.paused=false;gs.last=performance.now()},restart:()=>gather(mode)});
 gsRAF=requestAnimationFrame(gLoop);
}
function gJump(){if(!gs||gs.paused||gs.done)return;if(gs.y===0){gs.vy=-720}}
function gSpawn(){
 const r=Math.random();
 if(r<.45)gs.items.push({k:'stone',x:GW+40,h:Math.random()<.4?110:0});
 else gs.items.push({k:Math.random()<.5?'bush':'log',x:GW+40});
 if(Math.random()<.35)gs.items.push({k:'stone',x:GW+40+150,h:0});
}
function gLoop(now){
 if(!gs)return;
 if(gs.paused){gs.last=now;gDraw();gsRAF=requestAnimationFrame(gLoop);return}
 const dt=Math.min(.033,(now-gs.last)/1000);gs.last=now;gs.t+=dt;
 const sp=gs.G.speed*(gs.slow>0?.45:1);gs.slow=Math.max(0,gs.slow-dt);
 gs.x+=sp*dt;
 gs.vy+=1900*dt;gs.y=Math.min(0,gs.y+gs.vy*dt);if(gs.y===0)gs.vy=0;
 gs.next-=dt;if(gs.next<=0&&!gs.done){gSpawn();const[a,b]=gs.G.gap;gs.next=a+Math.random()*(b-a)}
 const DX=170;
 for(const it of gs.items){
  it.x-=sp*dt;
  if(it.hit||Math.abs(it.x-DX)>28)continue;
  if(it.k==='stone'){
   const sy=GY-12-it.h;if(Math.abs((GY-40+gs.y)-sy)<70){it.hit=true;gs.stones++;
    const[t,r]=FACTS[gs.stones-1];learn(dsEl.querySelector('#gLearn'),t,r,{icon:Ark.I.scroll,speak:true});
    setBar(dsEl.querySelector('#gBar .pbar'),gs.stones/5,`Smooth stones: ${gs.stones} of 5`);
    gs.pops.push({x:DX,y:GY-80+gs.y,t:0,text:`Stone ${gs.stones}!`,c:'#F2A007'});
    if(gs.stones>=5){gs.done=true;setTimeout(()=>gs&&toBattle(),1600)}}
  }else if(gs.y>-40){it.hit=true;gs.bumps++;gs.slow=.7;gs.pops.push({x:DX,y:GY-90,t:0,text:'Oops!',c:'#D7263D'});
   learn(dsEl.querySelector('#gLearn'),`Oops, a ${it.k}! Tap Jump just before you reach it.`,'',{icon:Ark.I.jump})}
 }
 gs.items=gs.items.filter(it=>it.x>-60&&!(it.hit&&it.k==='stone'));
 gs.pops.forEach(p=>p.t+=dt);gs.pops=gs.pops.filter(p=>p.t<1);
 gDraw();gsRAF=requestAnimationFrame(gLoop);
}
function gDraw(){
 const c=gs.cx,ink='#13203A';
 c.fillStyle=tok('--chip');c.fillRect(0,0,GW,GH);
 c.fillStyle=tok('--emerald');c.globalAlpha=.4;const o=(gs.x*.3)%400;
 for(let k=-1;k<4;k++){c.beginPath();c.ellipse(k*400-o+200,GY+20,260,110,0,Math.PI,0);c.fill()}
 c.globalAlpha=1;
 c.fillStyle='#7FC36B';c.fillRect(0,GY,GW,GH-GY);
 c.fillStyle='#5DA9F0';c.fillRect(0,GY+38,GW,30);
 c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();for(let x=0;x<=GW;x+=30){const w=(x+gs.x)%60<30?3:-3;c.lineTo(x,GY+50+w)}c.stroke();
 // sheep grazing far away on the hills
 c.fillStyle='#fff';c.strokeStyle=ink;c.lineWidth=1.5;for(let k=0;k<3;k++){const sx=((k*330-gs.x*.3)%1000+1000)%1000-100,sy=GY-70-(k%2)*18;c.beginPath();c.ellipse(sx,sy,10,7,0,0,7);c.fill();c.stroke();c.fillStyle='#3B3B3B';c.beginPath();c.arc(sx+10,sy-3,3.5,0,7);c.fill();c.fillStyle='#fff'}
 c.lineWidth=3;
 for(const it of gs.items){
  if(it.k==='stone'){const y=GY-12-it.h;c.fillStyle='#D9DDE3';c.beginPath();c.ellipse(it.x,y,13,10,0,0,7);c.fill();c.stroke();c.fillStyle='#FFD447';c.beginPath();c.arc(it.x+12,y-12,3,0,7);c.arc(it.x-10,y-14,2,0,7);c.fill()}
  else if(it.k==='bush'){c.fillStyle='#2E7D32';[[-14,0],[0,-10],[14,0]].forEach(([dx,dy])=>{c.beginPath();c.arc(it.x+dx,GY-16+dy,16,0,7);c.fill();c.stroke()})}
  else{c.fillStyle='#8B5A2B';rr(c,it.x-30,GY-22,60,22,10);c.fill();c.stroke();c.fillStyle='#C68A4B';c.beginPath();c.ellipse(it.x+24,GY-11,6,9,0,0,7);c.fill();c.stroke()}
 }
 // David running
 const x=170,y=GY+gs.y,step=gs.y?0:Math.sin(gs.t*16)*7;
 c.fillStyle='rgba(19,32,58,.25)';c.beginPath();c.ellipse(x,GY+4,20+gs.y*.05,5,0,0,7);c.fill();
 c.strokeStyle='#8D5524';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(x-5,y-30);c.lineTo(x-5+step,y-4);c.moveTo(x+5,y-30);c.lineTo(x+5-step,y-4);c.stroke();
 c.lineWidth=3;c.strokeStyle=ink;c.fillStyle=tok('--sapphire');c.beginPath();c.moveTo(x-15,y-28);c.lineTo(x+15,y-28);c.lineTo(x+10,y-64);c.lineTo(x-10,y-64);c.closePath();c.fill();c.stroke();
 c.fillStyle='#8D5524';c.beginPath();c.arc(x+2,y-78,14,0,7);c.fill();c.stroke();
 c.fillStyle='#3B2414';c.beginPath();c.arc(x+2,y-83,14,Math.PI*1.05,Math.PI*1.95);c.fill();
 c.fillStyle=ink;c.beginPath();c.arc(x+8,y-78,2.2,0,7);c.fill();
 c.strokeStyle='#6B4423';c.lineWidth=4;c.beginPath();c.moveTo(x-16,y-90);c.lineTo(x-14,y-20);c.stroke();c.lineCap='butt';
 c.font='800 22px "Lilita One", Nunito, sans-serif';c.textAlign='center';
 for(const p of gs.pops){c.globalAlpha=1-p.t;c.fillStyle=p.c;c.strokeStyle=ink;c.lineWidth=3;c.strokeText(p.text,p.x,p.y-p.t*40);c.fillText(p.text,p.x,p.y-p.t*40)}
 c.globalAlpha=1;
}
function toBattle(){
 const mode=gs.mode;gs.bumps;cancelAnimationFrame(gsRAF);gs=null;
 dsEl.innerHTML=`${bar(1,'Smooth stones: 5 of 5','gold')}<h2>Part 2: Face the giant</h2>
  <p class="story">David said, “The LORD… will deliver me out of the hand of this Philistine.”</p><span class="ref">1 Samuel 17:37</span>
  <div class="row"><button class="btn big" id="bGo">${Ark.UI.play} Face Goliath</button>${Ark.canSpeak?`<button class="btn ghost" id="bLs">${Ark.UI.listen} Listen</button>`:''}</div>`;
 say('Part 2. Face the giant. David said, The LORD will deliver me.');
 dsEl.querySelector('#bGo').onclick=()=>dsStart(mode);
 const l=dsEl.querySelector('#bLs');if(l)l.onclick=()=>say('David said, The LORD will deliver me out of the hand of this Philistine.',true);
 Ark.ctl({restart:()=>gather(mode)});
}

/* ---------- Part 2: the battle ---------- */
function dsStart(mode){
 cancelAnimationFrame(dsRAF);const P=SL[mode];
 dsEl.innerHTML=`<div class="hud"><span class="dpill ${mode}">${Ark.DLABEL[mode]}</span><span id="dsStones" aria-label="Stones left"></span></div><div id="dsLearn" style="min-height:62px"></div>
 <canvas id="dsC" width="800" height="480" style="width:100%;height:auto;max-width:100%;border:3px solid var(--line);border-radius:14px;touch-action:none;display:block;cursor:crosshair" aria-label="Sling shot field"></canvas>`;
 const cv=dsEl.querySelector('#dsC');
 const W=cv.clientWidth<520?560:800;
 ds={mode,P,wind:P.wind?(Math.random()<.5?-1:1)*P.wind:0,paused:false,W,stones:5,stone:null,drag:null,drag0:null,t:0,gx:W-160,fall:0,won:false,endT:0,cv,cx:cv.getContext('2d'),last:performance.now(),A:{x:150,y:322}};
 ds.size=()=>{const d=Math.min(3,devicePixelRatio||1),w=cv.clientWidth||W;cv.width=Math.round(w*d);cv.height=Math.round(w*480/W*d);ds.cx.setTransform(cv.width/W,0,0,cv.height/480,0,0)};
 cv.width=W;ds.size();
 const msg=(t,r)=>Ark.learn(dsEl.querySelector('#dsLearn'),t,r||'',{icon:Ark.I.drag});ds.msg=msg;msg(P.wind?`Drag back to aim. Watch out: the wind is blowing ${ds.wind<0?'left':'right'}!`:'Drag back on the field to aim, then let go!');
 const hud=()=>{dsEl.querySelector('#dsStones').textContent='Stones: '+'●'.repeat(ds.stones)+'○'.repeat(5-ds.stones)};hud();ds.hud=hud;
 const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*ds.W/r.width,y:(e.clientY-r.top)*480/r.height}};
 cv.onpointerdown=e=>{if(ds.paused||ds.stone||ds.won||ds.stones<=0)return;try{cv.setPointerCapture(e.pointerId)}catch(_){};ds.drag0=pt(e);ds.drag=pt(e)};
 cv.onpointermove=e=>{if(ds.drag)ds.drag=pt(e)};
 cv.onpointerup=cv.onpointercancel=()=>{if(!ds.drag)return;const p=dsPull();ds.drag=null;
  if(Math.hypot(p.x,p.y)<25){msg('Pull back further to throw!');return}
  ds.stone={x:ds.A.x+p.x*.5,y:ds.A.y+p.y*.5,vx:p.x*-6.5,vy:p.y*-6.5};ds.stones--;hud();msg('Whoosh!')};
 dsRAF=requestAnimationFrame(dsLoop);
 Ark.ctl({help:mode==='hard'?null:()=>{Ark.say('Aim for the forehead, under the helmet. Pull back further to throw higher.',true);ds.msg('Aim for the forehead, under the helmet. Pull further back to throw higher!')},pause:()=>{ds.paused=true;ds.drag=null},resume:()=>{ds.paused=false;ds.last=performance.now()},restart:()=>dsStart(mode)});
}
function dsPull(){if(!ds.drag)return{x:0,y:0};let x=ds.drag.x-ds.drag0.x,y=ds.drag.y-ds.drag0.y;const l=Math.hypot(x,y),m=170;if(l>m){x*=m/l;y*=m/l}return{x,y}}
function dsHead(){return{x:ds.gx,y:150}}
function dsLoop(now){
 if(ds.paused){ds.last=now;dsDraw();dsRAF=requestAnimationFrame(dsLoop);return}
 const dt=Math.min(.033,(now-ds.last)/1000);ds.last=now;ds.t+=dt;
 if(!ds.won)ds.gx=ds.W-170+Math.sin(ds.t*ds.P.move)*ds.P.amp*(ds.W>600?1:.75);
 const s=ds.stone,h=dsHead(),fr=ds.P.fr;
 const steps=s?Math.max(1,Math.ceil(Math.hypot(s.vx,s.vy)*dt/4)):0;
 for(let i=0;i<steps&&ds.stone&&!ds.won;i++){const sd=dt/steps;s.vy+=900*sd;s.vx+=ds.wind*sd;s.x+=s.vx*sd;s.y+=s.vy*sd;
  const fx=h.x-6,fy=h.y-6;
  if(Math.hypot(s.x-fx,s.y-fy)<fr+6){ds.won=true;ds.stone=null;ds.msg('Bullseye! Down goes Goliath!','1 Samuel 17:49');Ark.say('Bullseye!')}
  else if((Math.hypot(s.x-h.x,s.y-h.y)<32&&Math.hypot(s.x-fx,s.y-fy)>fr+14)||(s.x>ds.gx-45&&s.x<ds.gx+45&&s.y>178&&s.y<420)){ds.stone=null;ds.msg('Clang! Goliath’s armour is made of brass. Aim for his forehead!','1 Samuel 17:5')}
  else if(s.x>ds.W+30||s.y>425||s.x<-30){ds.stone=null;ds.msg(ds.stones?(s.x>ds.W+30?'Too far! Pull back a little less.':'Too short! Pull back further.'):'Out of stones…')}
 }
 if(ds.won){ds.fall=Math.min(1,ds.fall+dt*1.4);ds.endT+=dt;if(ds.endT>1.8)return dsEnd(true)}
 else if(!ds.stone&&ds.stones<=0){ds.endT+=dt;if(ds.endT>1)return dsEnd(false)}
 dsDraw();dsRAF=requestAnimationFrame(dsLoop);
}
function dsDraw(){
 const c=ds.cx,ink='#13203A';c.clearRect(0,0,ds.W,480);
 c.fillStyle=tok('--chip');c.fillRect(0,0,ds.W,480);
 c.fillStyle=tok('--emerald');c.globalAlpha=.45;c.beginPath();c.ellipse(220,430,320,90,0,Math.PI,0);c.ellipse(ds.W-160,430,300,120,0,Math.PI,0);c.fill();c.globalAlpha=1;
 c.fillStyle=tok('--emerald');c.fillRect(0,420,ds.W,60);
 c.lineWidth=3;c.strokeStyle=ink;c.lineJoin='round';c.lineCap='round';
 // David
 c.fillStyle='#8D5524';c.fillRect(98,380,9,40);c.fillRect(114,380,9,40);
 c.fillStyle=tok('--sapphire');c.beginPath();c.moveTo(92,388);c.lineTo(128,388);c.lineTo(122,326);c.lineTo(98,326);c.closePath();c.fill();c.stroke();
 c.fillStyle='#8D5524';c.beginPath();c.arc(110,306,17,0,7);c.fill();c.stroke();
 c.fillStyle='#3B2414';c.beginPath();c.arc(110,300,17,Math.PI*1.05,Math.PI*1.95);c.fill();
 c.fillStyle=ink;c.beginPath();c.arc(116,306,2.2,0,7);c.fill();
 const p=dsPull(),A=ds.A,pouch={x:A.x+p.x*.5,y:A.y+p.y*.5};
 c.beginPath();c.moveTo(122,340);c.lineTo(A.x-8,A.y);c.stroke();
 c.strokeStyle='#6B4423';c.lineWidth=2.5;c.beginPath();c.moveTo(A.x-8,A.y);c.lineTo(pouch.x,pouch.y);c.stroke();c.strokeStyle=ink;c.lineWidth=3;
 if(!ds.stone&&ds.stones>0&&!ds.won){c.fillStyle='#C9CED6';c.beginPath();c.arc(pouch.x,pouch.y,8,0,7);c.fill();c.stroke()}
 // aim preview
 if(ds.drag&&Math.hypot(p.x,p.y)>=25){let x=pouch.x,y=pouch.y,vx=-p.x*6.5,vy=-p.y*6.5;const n=ds.P.aim;c.fillStyle=tok('--ink');c.globalAlpha=.6;
  for(let i=0;i<n;i++){for(let k=0;k<3;k++){vy+=900*.012;x+=vx*.012;y+=vy*.012}c.beginPath();c.arc(x,y,3,0,7);c.fill()}c.globalAlpha=1}
 if(ds.wind){c.fillStyle=tok('--ink');c.font='800 15px Nunito, sans-serif';c.textAlign='center';c.fillText(ds.wind<0?'◀ wind':'wind ▶',ds.W/2,30)}
 // Goliath
 c.save();c.translate(ds.gx,420);c.rotate(-ds.fall*Math.PI*.47);
 c.fillStyle='#C68642';c.fillRect(-32,-100,24,100);c.fillRect(8,-100,24,100);c.strokeRect(-32,-100,24,100);c.strokeRect(8,-100,24,100);
 c.fillStyle='#B08D57';rr(c,-46,-245,92,150,14);c.fill();c.stroke();
 c.strokeStyle='#7A5C2E';for(let y=-230;y<-105;y+=16){c.beginPath();c.moveTo(-40,y);c.lineTo(40,y);c.stroke()}c.strokeStyle=ink;
 c.strokeStyle='#6B4423';c.lineWidth=6;c.beginPath();c.moveTo(66,-330);c.lineTo(66,0);c.stroke();c.lineWidth=3;c.strokeStyle=ink;
 c.fillStyle='#9AA3AF';c.beginPath();c.moveTo(66,-350);c.lineTo(56,-326);c.lineTo(76,-326);c.closePath();c.fill();c.stroke();
 c.fillStyle='#C68642';rr(c,42,-235,18,90,8);c.fill();c.stroke();
 c.beginPath();c.arc(0,-270,30,0,7);c.fill();c.stroke();
 c.fillStyle='#3B2414';c.beginPath();c.moveTo(-24,-256);c.quadraticCurveTo(0,-215,24,-256);c.fill();
 c.fillStyle='#9AA3AF';c.beginPath();c.arc(0,-284,31,Math.PI,0);c.lineTo(31,-280);c.lineTo(-31,-280);c.closePath();c.fill();c.stroke();
 c.fillStyle=ink;if(ds.won){c.fillRect(-16,-266,10,3);c.fillRect(6,-266,10,3)}else{c.beginPath();c.arc(-12,-264,3,0,7);c.arc(10,-264,3,0,7);c.fill()}
 if(!ds.won&&ds.P.ring){c.setLineDash([4,4]);c.strokeStyle=tok('--ruby');c.beginPath();c.arc(-6,-276,ds.P.fr,0,7);c.stroke();c.setLineDash([]);c.strokeStyle=ink}
 c.restore();
 if(ds.stone){c.fillStyle='#C9CED6';c.beginPath();c.arc(ds.stone.x,ds.stone.y,8,0,7);c.fill();c.stroke()}
}
function dsEnd(win){
 cancelAnimationFrame(dsRAF);const used=5-ds.stones,m=ds.mode;
 if(win){
  const stars=used===1?3:used<=3?2:1;
  Ark.finish(dsEl,{id:'davids-sling',diff:m,stars,title:'Victory! Goliath is down!',
   html:`<p class="story">You used ${used} stone${used>1?'s':''}${used===1?', just like David!':'.'} David only needed one stone, because God was with him (1 Samuel 17:50).</p>`,
   verse:['…for the battle is the LORD’s.','1 Samuel 17:47'],
   lesson:'David was small, but he trusted a big God. When you face something scary, God is with you too.',
   again:()=>gather(m),menu:dsIntro,
   next:m!=='hard'?[`Try ${m==='easy'?'Normal':'Hard'}`,()=>{const d=m==='easy'?'normal':'hard';store('diff-davids-sling',d);gather(d)}]:['Battle again',()=>dsStart(m)]});
 }else{
  dsEl.innerHTML=`<div class="fin"><h2>Goliath is still standing!</h2>
   <p class="story">David didn’t give up, and neither should you. Aim for the forehead, under the helmet.</p>
   <div class="row"><button class="btn big" id="dsA">${Ark.UI.restart} Try the battle again</button><button class="btn ghost" id="dsB">Change difficulty</button></div>
   <a class="btn more big" href="#home">${Ark.UI.grid} More Games</a></div>`;
  dsEl.querySelector('#dsA').onclick=()=>dsStart(m);
  dsEl.querySelector('#dsB').onclick=dsIntro;
  Ark.ctl({restart:()=>dsStart(m)});
 }
}
function stopAll(){cancelAnimationFrame(dsRAF);cancelAnimationFrame(gsRAF);ds=null;gs=null}
Ark.games['davids-sling']={
 mount(stage){dsEl=stage;addEventListener('resize',onResize);addEventListener('keydown',onKey);dsIntro()},
 unmount(){stopAll();hush();removeEventListener('resize',onResize);removeEventListener('keydown',onKey)},
 _test:{state:()=>ds,gstate:()=>gs,loop:t=>dsLoop(t),gloop:t=>gLoop(t),stop:()=>{cancelAnimationFrame(dsRAF);cancelAnimationFrame(gsRAF)},jump:()=>gJump(),start:m=>dsStart(m)}
};
})();
