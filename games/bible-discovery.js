/* The Lost Sheep: Rescue Rush (Luke 15:3–7). Gather. Search. Rescue!
   Three fast, playable stages (keeps the id "bible-discovery", so stars and links from the old game still work):
   1 Gather the Flock: you ARE the shepherd. Sheep wander the meadow and move away from you. Herd them through the gate
     into the pen. When the last one is in, the count stops at 99: one is missing!
   2 The Great Search: a side-scrolling run at dusk. Run and jump over streams, rocks, fallen trees and thorn bushes.
     Follow the wool and the hoofprints; the bleat gets louder (and comes from the right) as you get close.
   3 Rescue and Return: pull the thorny branches away to free the sheep, then the shepherd carries it home at sunrise,
     the flock reaches 100 and everyone celebrates. A short note says what Jesus meant.
   No text-to-speech anywhere. Sounds are short effects made in the browser; the Sound button turns them off. */
(() => {
  const { store, storeJSON, hush } = Ark;
  const ink = '#13203A';
  const STAGES = ['Gather the Flock', 'The Great Search', 'Rescue and Return'];
  const D = {
    easy: { sheep: 6, wander: 22, flee: 125, fleeR: 175, gate: 150, walk: 260, skittish: 0, len: 3000, gap: [60, 85], feats: ['gap', 'step', 'log', 'gap', 'rock'], run: 255, branches: 3, pull: 70, tangle: {}, hint: true, ok: [3, 6] },
    normal: { sheep: 9, wander: 30, flee: 145, fleeR: 155, gate: 115, walk: 250, skittish: .002, len: 4200, gap: [70, 115], feats: ['gap', 'step', 'log', 'rock', 'thorn', 'plat', 'gap'], run: 285, branches: 5, pull: 95, tangle: { 1: 2 }, hint: false, ok: [2, 5] },
    hard: { sheep: 12, wander: 40, flee: 170, fleeR: 140, gate: 90, walk: 245, skittish: .006, len: 5400, gap: [95, 150], feats: ['gap', 'step', 'log', 'rock', 'thorn', 'plat', 'gap', 'thorn', 'stack'], run: 300, branches: 7, pull: 120, tangle: { 1: 2, 3: 4, 5: 6 }, hint: false, ok: [1, 3] }
  };
  let el, g = null, raf = 0, W = 960, H = 540;
  const $ = s => el.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mixC = (a, b, t) => `rgb(${[1, 3, 5].map(i => Math.round(lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), clamp(t, 0, 1)))).join(',')})`;
  function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(() => g && fn(), ms));

  /* ---------- sound effects (no speech) ---------- */
  const SFX = (() => {
    let ctx = null;
    const ac = () => { if (!Ark.voiceOn()) return null; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; };
    function tone(f, d, o = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0), os = c.createOscillator(), gn = c.createGain();
      os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d);
      if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = o.depth || 20; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + d); }
      let node = os; if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; os.connect(f2); node = f2; }
      gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .07, t + .03); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      let out = gn; if (o.pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); gn.connect(p); out = p; }
      node.connect(gn); out.connect(c.destination); os.start(t); os.stop(t + d + .02);
    }
    function noise(d, o = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0), n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain(); s.buffer = b; fl.type = o.type || 'bandpass'; fl.frequency.value = o.f || 1500;
      gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .04, t + .02); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(fl); fl.connect(gn); gn.connect(c.destination); s.start(t);
    }
    const bleat = (p = 1, pan = 0, vol = .06) => tone(420 * p, .5, { type: 'sawtooth', to: 370 * p, lp: 1500, vib: 26, depth: 34 * p, vol, pan });
    return {
      bleat,
      pen: () => [784, 988, 1175].forEach((f, i) => tone(f, .12, { vol: .05, at: i * .06 })),
      jump: () => tone(330, .18, { to: 620, vol: .05 }),
      land: () => noise(.07, { type: 'lowpass', f: 300, vol: .05 }),
      step: () => noise(.05, { type: 'lowpass', f: 450, vol: .025 }),
      wool: () => { tone(988, .08, { vol: .05 }); tone(1319, .12, { vol: .05, at: .06 }); },
      splash: () => noise(.4, { type: 'highpass', f: 1600, vol: .06 }),
      ouch: () => tone(200, .2, { type: 'triangle', to: 120, vol: .08 }),
      check: () => [523, 784].forEach((f, i) => tone(f, .15, { type: 'triangle', vol: .05, at: i * .1 })),
      snip: () => { noise(.15, { f: 3200, vol: .05 }); tone(700, .08, { vol: .03 }); },
      rustle: () => noise(.25, { f: 2400, vol: .03 }),
      song: () => [523, 587, 659, 784, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .24, { type: 'triangle', vol: .06, at: i * .18 })),
      win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, { vol: .07, at: i * .12 }))
    };
  })();

  function css() {
    if (document.getElementById('lr-css')) return;
    const s = document.createElement('style'); s.id = 'lr-css';
    s.textContent = `
      .stage.lr-wide{max-width:1200px}
      @media (orientation:landscape) and (max-height:600px){.stage.lr-wide{padding:8px;gap:8px}}
      .lr-view{position:relative;margin:0 auto;border:3px solid var(--line);border-radius:16px;overflow:hidden;line-height:0;touch-action:none;user-select:none;-webkit-user-select:none;background:#7FC8F8;scroll-margin-top:calc(var(--gbh,60px) + 4px);-webkit-tap-highlight-color:transparent}
      .lr-view canvas{display:block;width:100%;height:100%}
      .lr-hud{position:absolute;left:8px;right:8px;top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;pointer-events:none;line-height:1.2;z-index:2}
      .lr-bar{position:relative;flex:1 1 180px;height:22px;border:3px solid #13203A;border-radius:99px;background:rgba(255,255,255,.85);overflow:hidden;display:flex}
      .lr-bar i{position:relative;flex:1;border-right:2px solid #13203A;font-style:normal}
      .lr-bar i:last-child{border-right:0}
      .lr-bar i b{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#14946B,#7ED957);transition:width .2s}
      .lr-bar i.done b{width:100%!important}
      .lr-bar .lr-s{display:none}
      @media (max-width:620px){.lr-bar .lr-l{display:none}.lr-bar .lr-s{display:inline}}
      .lr-bar i em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:3px;font-style:normal;font-size:11px;font-weight:800;color:#13203A;white-space:nowrap;overflow:hidden}
      .lr-pill{background:rgba(255,255,255,.93);color:#13203A;border:3px solid #13203A;border-radius:99px;padding:1px 10px;font-weight:800;font-size:clamp(13px,2.6vmin,18px);white-space:nowrap;font-variant-numeric:tabular-nums}
      .lr-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:max(8px,1.6vmin);pointer-events:none;z-index:2;line-height:1}
      .lr-pad>div{display:flex;gap:max(10px,2vmin)}
      .lr-pad button{pointer-events:auto;width:clamp(62px,16vmin,110px);height:clamp(62px,16vmin,110px);border-radius:50%;border:4px solid #13203A;background:rgba(255,255,255,.85);color:#13203A;font:inherit;font-weight:800;font-size:clamp(24px,6vmin,40px);display:grid;place-content:center;justify-items:center;box-shadow:0 5px 0 #13203A;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .lr-pad button span{font-size:clamp(10px,2.4vmin,15px);letter-spacing:.05em}
      .lr-pad button[data-k=jump]{background:#FFD447}
      .lr-pad button.down{transform:translateY(5px);box-shadow:0 0 0 #13203A}
      @media (pointer:fine){.lr-pad button{width:64px;height:64px;font-size:26px;opacity:.85}}
      .lr-keys{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);font-weight:800;font-size:12px;color:#fff;background:rgba(19,32,58,.6);border-radius:999px;padding:4px 10px;line-height:1.3;pointer-events:none;white-space:nowrap;z-index:1}
      @media (pointer:coarse){.lr-keys{display:none}}
      .lr-say{position:absolute;left:50%;top:44px;transform:translateX(-50%);background:rgba(255,255,255,.95);color:#13203A;border:3px solid #13203A;border-radius:16px;padding:5px 14px;font-weight:800;font-size:clamp(15px,3.2vmin,22px);line-height:1.25;z-index:3;pointer-events:none;white-space:nowrap;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis;animation:lrIn .3s ease-out}
      @keyframes lrIn{from{opacity:0;transform:translate(-50%,-6px)}}
      .lr-card{position:absolute;inset:0;display:grid;place-items:center;background:rgba(19,32,58,.42);padding:10px;z-index:4;line-height:1.4}
      .lr-card>div{background:var(--surface);color:var(--ink);border:3px solid var(--line);border-radius:20px;padding:clamp(12px,2.6vmin,22px);display:grid;gap:10px;justify-items:center;text-align:center;width:min(480px,100%);max-height:100%;overflow:auto;animation:lrIn2 .3s ease-out}
      @keyframes lrIn2{from{opacity:0;transform:scale(.94)}}
      .lr-card h3{font-size:clamp(22px,4.6vmin,32px)}
      .lr-card p{margin:0;font-weight:700}
      .lr-card .how{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
      .lr-card .how span{background:var(--bg);border-radius:14px;padding:8px 12px;font-weight:800;font-size:14px;display:grid;justify-items:center;gap:2px}
      .lr-card .how b{font-size:26px;line-height:1}
      .lr-card .ref{font-size:13px;color:var(--sapphire);font-weight:800}
      .lr-card .note{font-size:12px;color:var(--muted);font-weight:700}
      .lr-rot{display:none;align-items:center;gap:8px;font-weight:800;font-size:14px;background:#FFF3C4;color:#13203A;border:2px solid #13203A;border-radius:12px;padding:6px 10px}
      .lr-rot i{display:inline-block;font-style:normal;font-size:22px;animation:lrRot 2s ease-in-out infinite}
      @keyframes lrRot{35%,65%{transform:rotate(-90deg)}}
      @media (orientation:portrait) and (pointer:coarse){.lr-rot{display:flex}}`;
    document.head.appendChild(s);
  }

  /* ---------- menu (no spoken narration: the shared Listen button is removed here) ---------- */
  function menu() {
    stop(); el.classList.remove('lr-wide');
    const best = storeJSON('lsr-best') || {};
    Ark.menu(el, {
      id: 'bible-discovery', title: 'The Lost Sheep: Rescue Rush', icon: 'glass', color: '#9BE38C',
      blurb: 'Gather the flock, search the hills and rescue the one lost sheep! (Luke 15:3–7)',
      how: [['arrows', 'Herd the sheep'], ['jump', 'Run and jump'], ['drag', 'Pull the thorns away']],
      listen: '',
      diffs: { easy: '6 sheep, a short gentle path, 3 thorny branches. Jump signs help you.', normal: '9 sheep, streams and thorn bushes, 5 branches.', hard: '12 jumpy sheep, a narrow gate, a long tricky path, tangled thorns.' },
      extra: `<p style="margin:0;font-weight:700;color:var(--muted);font-size:14px">Best scores: ${['easy', 'normal', 'hard'].map(d => `${Ark.DLABEL[d]} ${best[d] || '—'}`).join(' · ')}</p>`,
      afterRender: s => {
        s.querySelector('#gmListen')?.remove();
        s.querySelectorAll('.diff').forEach(b => { const f = b.onclick; b.onclick = e => { f && f(e); hush(); }; });
      },
      start: d => play(d)
    });
    Ark.ctl({});
  }
  function play(diff) {
    stop();
    g = { diff, C: D[diff], score: 0, mistakes: 0, stage: 0, t: 0, last: performance.now(), keys: {}, paused: false, seed: Math.floor(Math.random() * 1e9), parts: [], pops: [], times: [0, 0, 0] };
    el.classList.add('lr-wide');
    el.innerHTML = `<div class="lr-view" id="lrView">
      <canvas id="lrC" aria-label="The Lost Sheep: Rescue Rush"></canvas>
      <div class="lr-hud" id="lrHud"></div>
      <div class="lr-say" id="lrSay" hidden></div>
      <div class="lr-pad" id="lrPad" hidden><div><button type="button" data-k="left" aria-label="Left">◀</button><button type="button" data-k="right" aria-label="Right">▶</button></div><div><button type="button" data-k="jump" aria-label="Jump">⬆<span>JUMP</span></button></div></div>
      <span class="lr-keys" id="lrKeys" hidden></span>
      <div class="lr-card" id="lrCard" hidden></div></div>`;
    fit(); wire();
    $('#lrView').scrollIntoView({ block: 'start' });
    begin(0);
    raf = requestAnimationFrame(loop);
  }
  function begin(stage) {
    timers.forEach(clearTimeout); timers = [];
    g.stage = stage; g.parts = []; g.pops = []; g.keys = {};
    g.snap = { score: g.score, mistakes: g.mistakes };
    const v = $('#lrView'); const gb = document.querySelector('.gbar'); if (v && v.getBoundingClientRect().top < (gb ? gb.getBoundingClientRect().bottom : 0) - 2) v.scrollIntoView({ block: 'start' });
    [setup1, setup2, setup3][stage]();
    ctl();
  }
  function ctl() {
    Ark.ctl({
      help: g.diff !== 'hard' ? () => { g.helpT = g.t + 6; } : null,
      pause: () => { g.paused = true; g.keys = {}; hush(); },
      resume: () => { g.paused = false; g.last = performance.now(); },
      restart: () => { if (!g) return; Object.assign(g, g.snap); g.times[g.stage] = 0; begin(g.stage); }
    });
  }
  function fit() {
    const v = $('#lrView'), cv = $('#lrC'); if (!v || !cv) return;
    const gb = document.querySelector('.gbar'), gbh = gb ? gb.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--gbh', gbh + 'px');
    v.style.width = ''; const cs = getComputedStyle(el), cw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 6;
    const avail = Math.max(260, innerHeight - gbh - 14);
    let vw, vh;
    if (cw / avail >= 1.1) { vh = Math.min(avail, cw / 1.2); vw = Math.min(cw, vh * 2); H = vh < 480 ? 430 : 540; /* short phone screens: zoom in */ W = H * vw / vh; }
    else { vw = cw; vh = Math.max(vw * .95, Math.min(avail * .85, vw * 1.45)); W = 600; H = W * vh / vw; }
    v.style.width = Math.round(vw) + 'px'; v.style.height = Math.round(vh) + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    g.cx = cv.getContext('2d'); g.sc = vw / W; g.cx.setTransform(g.sc * dpr, 0, 0, g.sc * dpr, 0, 0);
    if (g.stage === 0 && g.s1) layoutPen();
  }
  const onResize = () => { if (g && $('#lrView')) fit(); };

  /* ---------- shared screen pieces ---------- */
  function hud(stageP, pills) {
    const b = $('#lrHud'); if (!b) return;
    b.innerHTML = `<div class="lr-bar" aria-label="Progress">${STAGES.map((s, i) => `<i class="${i < g.stage ? 'done' : ''}"><b style="width:${i === g.stage ? Math.round(stageP * 100) : 0}%"></b><em>${i < g.stage ? '✓ ' : ''}${i + 1}. <span class="lr-l">${s}</span><span class="lr-s">${['Gather', 'Search', 'Rescue'][i]}</span></em></i>`).join('')}</div>
      <span class="lr-pill">⭐ ${g.score}</span>${pills || ''}`;
  }
  function sayLine(t, ms = 2600) {
    const s = $('#lrSay'); if (!s) return;
    s.hidden = false; s.textContent = t; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
    clearTimeout(g.sayT); g.sayT = setTimeout(() => { const x = el && el.querySelector('#lrSay'); if (x) x.hidden = true; }, ms);
  }
  function card(html, btnLabel, fn) {
    const k = $('#lrCard'); k.hidden = false; g.paused = true;
    k.innerHTML = `<div>${html}<button class="btn big" type="button" id="lrGo">${btnLabel}</button></div>`;
    $('#lrGo').onclick = () => { k.hidden = true; k.innerHTML = ''; g.paused = false; g.last = performance.now(); fn && fn(); };
    setTimeout(() => { const b = el && el.querySelector('#lrGo'); if (b) b.focus({ preventScroll: true }); }, 50);
  }
  function pop(x, y, txt, c = '#FFD447', big, world) { g.pops.push({ x, y, txt, c, t: 0, big, world }); }
  function sparkle(x, y, c = '#FFD447', n = 12, world) { for (let i = 0; i < n; i++) { const a = rnd(0, 7), s = rnd(60, 220); g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 1, c, r: rnd(2, 5), star: i % 3 === 0, world }); } }
  function addScore(n) { g.score = Math.max(0, g.score + n); }

  /* ---------- input ---------- */
  const KEY = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ' ': 'jump' };
  function onKey(e) {
    if (!g || !el.querySelector('#lrView') || !$('#lrCard').hidden) return;
    const k = KEY[e.key]; if (!k) return;
    e.preventDefault();
    const down = e.type === 'keydown';
    if (down && e.repeat) return;
    g.keys[k] = down;
    if (down && (k === 'jump' || k === 'up') && g.stage === 1 && g.s2) g.s2.jq = g.t;
    if (g.stage === 2 && g.s3 && k === 'jump') { if (down) grabAt(g.s3.cur); else release(); }
  }
  function wire() {
    const v = $('#lrView');
    v.querySelectorAll('.lr-pad button').forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); e.stopPropagation(); b.classList.add('down'); g.keys[k] = true; if (k === 'jump' && g.s2) g.s2.jq = g.t; };
      const off = () => { b.classList.remove('down'); g.keys[k] = false; };
      b.onpointerdown = on; b.onpointerup = b.onpointerleave = b.onpointercancel = off;
    });
    const P = e => { const r = $('#lrC').getBoundingClientRect(); return [(e.clientX - r.left) / g.sc, (e.clientY - r.top) / g.sc]; };
    v.onpointerdown = e => {
      if (e.target.closest('button, .lr-card') || g.paused) return;
      e.preventDefault(); try { v.setPointerCapture(e.pointerId); } catch (x) {}
      g.ptr = P(e); g.ptrDown = true;
      if (g.stage === 2 && g.s3) grabAt(g.ptr);
    };
    v.onpointermove = e => { if (!g.ptrDown) return; const p = P(e); if (g.stage === 2 && g.s3) dragTo(p); g.ptr = p; };
    v.onpointerup = v.onpointercancel = () => { if (!g.ptrDown) return; g.ptrDown = false; if (g.stage === 2 && g.s3) release(); };
  }

  /* ---------- loop ---------- */
  function loop(now) {
    raf = 0;
    if (!g || !el.isConnected || !$('#lrC')) return;
    const dt = Math.min(.033, (now - g.last) / 1000); g.last = now;
    if (!g.paused) {
      g.t += dt; g.times[g.stage] += dt;
      [update1, update2, update3][g.stage](dt);
      g.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; q.life -= dt * 1.1; }); g.parts = g.parts.filter(q => q.life > 0);
      g.pops.forEach(p => (p.t += dt)); g.pops = g.pops.filter(p => p.t < (p.big ? 1.6 : 1));
    }
    const c = g.cx; c.save(); [draw1, draw2, draw3][g.stage](c); drawFx(c); c.restore();
    raf = requestAnimationFrame(loop);
  }
  function drawFx(c) {
    const cam = g.stage === 1 ? g.camX || 0 : 0, oy = g.stage === 1 ? g.oy || 0 : 0;
    g.parts.forEach(q => { const x = q.x - (q.world ? cam : 0), y = q.y + (q.world ? oy : 0); c.globalAlpha = clamp(q.life, 0, 1); c.fillStyle = q.c; c.beginPath(); if (q.star) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? q.r * .45 : q.r * 1.4; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); } else c.arc(x, y, q.r, 0, 7); c.fill(); });
    c.globalAlpha = 1; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    g.pops.forEach(p => { const life = p.big ? 1.6 : 1; c.globalAlpha = clamp((life - p.t) * 2, 0, 1); c.font = `400 ${p.big ? 46 : 26}px "Lilita One", sans-serif`; c.lineWidth = 6; c.strokeStyle = ink; c.fillStyle = p.c; const x = clamp(p.x - (p.world ? cam : 0), 140, W - 140), y = p.y + (p.world ? oy : 0) - p.t * 40; c.strokeText(p.txt, x, y); c.fillText(p.txt, x, y); });
    c.globalAlpha = 1;
  }

  /* ---------- characters ---------- */
  function sheepTop(c, x, y, ang, s = 1, t = 0) {
    // a sheep seen from above, facing the way it walks
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
    c.fillStyle = 'rgba(19,32,58,.18)'; c.beginPath(); c.ellipse(2, 4, 18, 13, 0, 0, 7); c.fill();
    const leg = Math.sin(t * 14) * 3;
    c.fillStyle = ink; [[-8, -10 + leg], [-8, 10 - leg], [8, -10 - leg], [8, 10 + leg]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 3, 0, 7); c.fill(); });
    c.fillStyle = '#fff'; c.strokeStyle = ink; c.lineWidth = 2;
    [[-6, -6], [-6, 6], [4, -7], [4, 7], [0, 0], [-10, 0]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 8, 0, 7); c.fill(); c.stroke(); });
    c.fillStyle = '#3B3B3B'; c.beginPath(); c.ellipse(15, 0, 8, 6.5, 0, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(13, -7, 4, 2, -.5, 0, 7); c.ellipse(13, 7, 4, 2, .5, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(18, -2.5, 1.4, 0, 7); c.arc(18, 2.5, 1.4, 0, 7); c.fill();
    c.restore();
  }
  function shepherdTop(c, x, y, ang, t, moving) {
    c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(19,32,58,.2)'; c.beginPath(); c.ellipse(3, 5, 22, 16, 0, 0, 7); c.fill();
    c.rotate(ang);
    const sw = moving ? Math.sin(t * 12) * 5 : 0;
    c.strokeStyle = '#6B4423'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, 16); c.lineTo(30, 18 + sw); c.stroke(); c.beginPath(); c.arc(32, 12 + sw, 6, Math.PI * .5, Math.PI * 1.6); c.stroke();
    c.fillStyle = '#6E8B3D'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 0, 14, 19, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#9B6A3C'; c.beginPath(); c.ellipse(10, -14 - sw * .4, 5, 4, 0, 0, 7); c.ellipse(10, 14 + sw * .4, 5, 4, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#E9DFC9'; c.beginPath(); c.arc(2, 0, 11, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = '#B5453A'; c.lineWidth = 3; c.beginPath(); c.arc(2, 0, 7.5, 0, 7); c.stroke();
    c.lineCap = 'butt'; c.restore();
  }
  function shepherdSide(c, x, y, t, moving, face = 1, carry = false, flash = false) {
    // side view, feet at (x, y)
    c.save(); c.translate(x, y); c.scale(face, 1);
    if (flash) c.globalAlpha = .5;
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, 18, 4, 0, 0, 7); c.fill();
    const st = moving ? Math.sin(t * 14) : 0;
    c.strokeStyle = ink; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4, -18); c.lineTo(-4 + st * 8, -1); c.moveTo(4, -18); c.lineTo(4 - st * 8, -1); c.stroke();
    c.strokeStyle = '#6B4423'; c.lineWidth = 4.5; c.beginPath(); c.moveTo(18, -2); c.lineTo(18, -78); c.stroke(); c.beginPath(); c.arc(11, -78, 7, Math.PI * 2, Math.PI, true); c.stroke();
    c.fillStyle = '#6E8B3D'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-14, -14); c.lineTo(-11, -58); c.lineTo(11, -58); c.lineTo(15, -14); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#C9A227'; c.lineWidth = 4; c.beginPath(); c.moveTo(-12, -36); c.lineTo(12, -36); c.stroke();
    c.strokeStyle = '#9B6A3C'; c.lineWidth = 5; c.beginPath(); c.moveTo(6, -52); c.lineTo(18, -40 - st * 2); c.stroke();
    c.fillStyle = '#9B6A3C'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.arc(2, -70, 11, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#E9DFC9'; c.beginPath(); c.moveTo(-12, -66); c.quadraticCurveTo(-10, -86, 4, -84); c.quadraticCurveTo(14, -82, 12, -74); c.lineTo(-6, -74); c.lineTo(-12, -58); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#B5453A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -77); c.lineTo(12, -77); c.stroke();
    c.fillStyle = ink; c.beginPath(); c.arc(7, -70, 1.5, 0, 7); c.fill();
    if (carry) sheepSide(c, -2, -76, .62, t, 1, true);
    c.lineCap = 'butt'; c.restore();
  }
  function sheepSide(c, x, y, s = 1, t = 0, face = 1, happy) {
    c.save(); c.translate(x, y); c.scale(s * face, s);
    c.strokeStyle = ink; c.lineWidth = 3; c.lineCap = 'round';
    const l = Math.sin(t * 10) * 2;
    c.beginPath(); [-9, -3, 5, 10].forEach((a, i) => { c.moveTo(a, 8); c.lineTo(a + (i % 2 ? l : -l), 18); }); c.stroke();
    c.fillStyle = '#fff'; c.lineWidth = 2.2;
    [[-10, 0, 7], [-3, -5, 8], [6, -4, 8], [11, 2, 6], [0, 4, 9]].forEach(([a, b, r]) => { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); c.stroke(); });
    c.fillStyle = '#3B3B3B'; c.beginPath(); c.ellipse(16, -4, 6, 7, 0, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(12, -10, 4, 2, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(18, -6, 1.4, 0, 7); c.fill();
    if (happy) { c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.beginPath(); c.arc(16, -1, 2.5, .2, Math.PI - .2); c.stroke(); }
    c.lineCap = 'butt'; c.restore();
  }

  /* ================= STAGE 1: Gather the Flock (top-down herding) ================= */
  function layoutPen() {
    const S = g.s1, land = W >= H;
    const pen = land ? { x: W * .7, y: H * .26, w: W * .3 - 4, h: H * .56 } : { x: W * .12, y: H * .17, w: W * .76, h: H * .22 };
    const gw = g.C.gate;
    pen.land = land;
    pen.gate = land ? { x: pen.x, y: pen.y + pen.h / 2 } : { x: pen.x + pen.w / 2, y: pen.y + pen.h };
    const { x, y, w, h } = pen;
    S.walls = land
      ? [[x, y, x + w, y], [x + w, y, x + w, y + h], [x, y + h, x + w, y + h], [x, y, x, y + h / 2 - gw / 2], [x, y + h / 2 + gw / 2, x, y + h]]
      : [[x, y, x + w, y], [x, y, x, y + h], [x + w, y, x + w, y + h], [x, y + h, x + w / 2 - gw / 2, y + h], [x + w / 2 + gw / 2, y + h, x + w, y + h]];
    S.pen = pen;
  }
  function setup1() {
    const C = g.C, r = rng(g.seed);
    g.s1 = { sheep: [], penned: 0, done: false };
    layoutPen();
    const S = g.s1, pen = S.pen;
    S.rocks = Array.from({ length: g.diff === 'hard' ? 4 : 2 }, (_, i) => ({ x: W * (.18 + i * .14), y: H * (i % 2 ? .78 : .34), r: 22 + (i % 2) * 8 }));
    for (let i = 0; i < C.sheep; i++) {
      let x, y, k = 0;
      do { x = rnd(60, W - 60); y = rnd(110, H - 50); k++; } while (k < 60 && ((x > pen.x - 120 && x < pen.x + pen.w + 40 && y > pen.y - 80 && y < pen.y + pen.h + 80) || (x < 170 && y > H - 170)));
      S.sheep.push({ x, y, vx: 0, vy: 0, ang: rnd(0, 7), wa: rnd(0, 7), wt: rnd(0, 2), penned: false, ph: r() * 9, scared: 0 });
    }
    S.me = { x: 90, y: H - 90, ang: 0, moving: false };
    $('#lrPad').hidden = true; const k = $('#lrKeys'); k.hidden = false; k.textContent = 'Arrow keys or WASD to walk · or press and drag on the field';
    hud(0, `<span class="lr-pill">🐑 90</span>`);
    card(`<h3>Gather the Flock!</h3><p>Walk <b>behind</b> the sheep to move them into the pen.</p>
      <div class="how"><span><b>👆</b>Press and drag</span><span><b>⌨️</b>Arrow keys</span><span><b>🐑 ➡ 🏠</b>Into the pen</span></div>
      <div class="lr-rot"><i>📱</i> Turn sideways for a bigger field!</div>`, `${Ark.UI.play} Go!`, () => sayLine('Bring the sheep into the pen!'));
  }
  function segPush(o, r, s) {
    // keep a circle (o, radius r) out of wall segment s
    const [x1, y1, x2, y2] = s, dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
    const t = clamp(((o.x - x1) * dx + (o.y - y1) * dy) / L2, 0, 1), cx = x1 + dx * t, cy = y1 + dy * t;
    const ex = o.x - cx, ey = o.y - cy, d = Math.hypot(ex, ey);
    if (d < r && d > .001) { o.x = cx + ex / d * r; o.y = cy + ey / d * r; return true; }
    return false;
  }
  function update1(dt) {
    const S = g.s1, C = g.C, me = S.me, pen = S.pen;
    if (S.done) return;
    // the shepherd: keys, or walk toward the finger while it's held down
    let mx = (g.keys.right ? 1 : 0) - (g.keys.left ? 1 : 0), my = (g.keys.down ? 1 : 0) - (g.keys.up ? 1 : 0);
    if (!mx && !my && g.ptrDown && g.ptr) { const dx = g.ptr[0] - me.x, dy = g.ptr[1] - me.y, d = Math.hypot(dx, dy); if (d > 8) { mx = dx / d; my = dy / d; } }
    const m = Math.hypot(mx, my); me.moving = m > 0;
    if (m) { me.x += mx / m * C.walk * dt; me.y += my / m * C.walk * dt; me.ang = Math.atan2(my, mx); if (Math.floor(g.t * 6) !== S.stepT) { S.stepT = Math.floor(g.t * 6); if (S.stepT % 2) SFX.step(); } }
    me.x = clamp(me.x, 20, W - 20); me.y = clamp(me.y, 60, H - 20);
    S.walls.forEach(w => segPush(me, 20, w));
    S.rocks.forEach(rk => { const d = Math.hypot(me.x - rk.x, me.y - rk.y); if (d < rk.r + 18) { me.x = rk.x + (me.x - rk.x) / d * (rk.r + 18); me.y = rk.y + (me.y - rk.y) / d * (rk.r + 18); } });
    // sheep: wander, stay a little together, move away from the shepherd, avoid each other, rocks and walls
    const free = S.sheep.filter(s => !s.penned), cx = free.reduce((a, s) => a + s.x, 0) / (free.length || 1), cy = free.reduce((a, s) => a + s.y, 0) / (free.length || 1);
    for (const s of S.sheep) {
      let ax = 0, ay = 0;
      s.wt -= dt; if (s.wt <= 0) { s.wa += rnd(-1.5, 1.5); s.wt = rnd(.8, 2.5); }
      if (C.skittish && !s.penned && Math.random() < C.skittish) { s.wa = rnd(0, 7); s.scared = .7; }
      const ws = C.wander * (s.scared > 0 ? 2.5 : 1);
      ax += Math.cos(s.wa) * ws; ay += Math.sin(s.wa) * ws;
      s.scared = Math.max(0, s.scared - dt);
      if (!s.penned) {
        const dx = s.x - me.x, dy = s.y - me.y, d = Math.hypot(dx, dy) || 1;
        if (d < C.fleeR) { const f = (1 - d / C.fleeR) * C.flee * 1.6; ax += dx / d * f; ay += dy / d * f; if (d < C.fleeR * .5 && Math.random() < .004) SFX.bleat(rnd(.9, 1.2), (s.x - W / 2) / W, .035); }
        ax += (cx - s.x) * .04; ay += (cy - s.y) * .04;
        // near the open gate, sheep see the flock inside and want to go in
        const gd = Math.hypot(s.x - pen.gate.x, s.y - pen.gate.y);
        // soft push away from the field edges and the outside of the pen, so no sheep gets stuck in a corner
        if (s.x < 70) ax += (70 - s.x) * 3; if (s.x > W - 70) ax -= (s.x - W + 70) * 3;
        if (s.y < 120) ay += (120 - s.y) * 3; if (s.y > H - 70) ay -= (s.y - H + 70) * 3;
        if (gd > C.gate * .9) {
          const qx = clamp(s.x, pen.x, pen.x + pen.w), qy = clamp(s.y, pen.y, pen.y + pen.h), ex = s.x - qx, ey = s.y - qy, ed = Math.hypot(ex, ey);
          if (ed > .1 && ed < 50) { ax += ex / ed * (50 - ed) * 4; ay += ey / ed * (50 - ed) * 4; }
        }
        if (gd < C.gate * 1.1) { const ix = pen.x + pen.w / 2 - s.x, iy = pen.y + pen.h / 2 - s.y, il = Math.hypot(ix, iy) || 1; ax += ix / il * 90; ay += iy / il * 90; }
      }
      for (const o of S.sheep) { if (o === s || o.penned !== s.penned) continue; const dx = s.x - o.x, dy = s.y - o.y, d = Math.hypot(dx, dy); if (d < 30 && d > .01) { ax += dx / d * 60; ay += dy / d * 60; } }
      s.vx += (ax - s.vx) * Math.min(1, dt * 4); s.vy += (ay - s.vy) * Math.min(1, dt * 4);
      const sp = Math.hypot(s.vx, s.vy), max = s.penned ? 30 : C.flee * 1.3; if (sp > max) { s.vx *= max / sp; s.vy *= max / sp; }
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (sp > 8) { const ta = Math.atan2(s.vy, s.vx); s.ang += Math.atan2(Math.sin(ta - s.ang), Math.cos(ta - s.ang)) * Math.min(1, dt * 8); }
      if (s.penned) { s.x = clamp(s.x, pen.x + 22, pen.x + pen.w - 22); s.y = clamp(s.y, pen.y + 22, pen.y + pen.h - 22); continue; }
      if (s.x < 24 || s.x > W - 24) s.wa = Math.PI - s.wa;
      if (s.y < 70 || s.y > H - 24) s.wa = -s.wa;
      s.x = clamp(s.x, 24, W - 24); s.y = clamp(s.y, 70, H - 24);
      S.walls.forEach(w => segPush(s, 17, w));
      S.rocks.forEach(rk => { const d = Math.hypot(s.x - rk.x, s.y - rk.y); if (d < rk.r + 16) { s.x = rk.x + (s.x - rk.x) / d * (rk.r + 16); s.y = rk.y + (s.y - rk.y) / d * (rk.r + 16); } });
      if (s.x > pen.x + 18 && s.x < pen.x + pen.w - 18 && s.y > pen.y + 18 && s.y < pen.y + pen.h - 18) {
        s.penned = true; S.penned++; addScore(100); SFX.pen(); SFX.bleat(1.1, .3);
        sparkle(s.x, s.y, '#7ED957'); pop(s.x, s.y - 30, `${90 + S.penned}`, '#FFFFFF');
        hud(S.penned / C.sheep, `<span class="lr-pill">🐑 ${90 + S.penned}</span>`);
        if (S.penned === C.sheep) done1();
      }
    }
  }
  function done1() {
    const S = g.s1; S.done = true;
    const bonus = Math.max(0, Math.round((g.C.sheep * 9 - g.times[0]) * 10)); addScore(bonus);
    hud(1, `<span class="lr-pill">🐑 99</span>`);
    pop(W / 2, H / 2 - 40, '99… one is missing!', '#FFD447', true);
    SFX.bleat(1.4, 1, .03);
    if (bonus) later(() => sayLine(`+${bonus} speed bonus`, 1800), 700);
    later(() => begin(1), 2600);
  }
  function draw1(c) {
    const S = g.s1, pen = S.pen;
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8DD07A'); gr.addColorStop(1, '#5FAF55'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { const x = (i * 137.5) % W, y = 60 + (i * 89.3) % (H - 70), sw = Math.sin(g.t * 2 + i) * 2; c.strokeStyle = 'rgba(46,125,50,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3 + sw, y - 9); c.moveTo(x + 3, y); c.lineTo(x + 5 + sw, y - 8); c.stroke(); if (i % 7 === 0) { c.fillStyle = ['#FFD447', '#FF8FA3', '#fff'][i % 3]; c.beginPath(); c.arc(x + 8, y - 4, 3, 0, 7); c.fill(); } }
    S.rocks.forEach(rk => { c.fillStyle = 'rgba(19,32,58,.2)'; c.beginPath(); c.ellipse(rk.x + 4, rk.y + 6, rk.r, rk.r * .7, 0, 0, 7); c.fill(); c.fillStyle = '#A9A39A'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.arc(rk.x, rk.y, rk.r, 0, 7); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(rk.x - rk.r * .3, rk.y - rk.r * .3, rk.r * .35, 0, 7); c.fill(); });
    // the pen: floor, the 90 sheep already inside (a fluffy crowd at the back), walls
    c.fillStyle = 'rgba(201,180,138,.55)'; c.fillRect(pen.x, pen.y, pen.w, pen.h);
    const crowd = pen.land ? { x: pen.x + pen.w * .62, y: pen.y + 16, w: pen.w * .32, h: pen.h - 32 } : { x: pen.x + 16, y: pen.y + 12, w: pen.w - 32, h: pen.h * .35 };
    const cols = Math.max(1, Math.floor(crowd.w / 30)), rows = Math.max(1, Math.floor(crowd.h / 26));
    for (let i = 0; i < cols * rows && i < 24; i++) { const x = crowd.x + 14 + (i % cols) * 30 + (Math.floor(i / cols) % 2) * 10, y = crowd.y + 12 + Math.floor(i / cols) * 26; sheepTop(c, x, y + Math.sin(g.t * 2 + i) * .8, (pen.land ? Math.PI : -Math.PI / 2) + Math.sin(i * 2.3) * .6, .72); }
    c.lineCap = 'round';
    c.strokeStyle = '#8B5A2B'; c.lineWidth = 10; S.walls.forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
    c.strokeStyle = '#C98B4A'; c.lineWidth = 4; S.walls.forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
    c.lineCap = 'butt';
    const gt = pen.gate, glow = .5 + .5 * Math.sin(g.t * 4);
    c.fillStyle = `rgba(255,212,71,${.25 + .25 * glow})`; c.beginPath(); c.arc(gt.x, gt.y, g.C.gate * .55, 0, 7); c.fill();
    // Easy (or Help): show where to stand to push the nearest sheep toward the gate
    if (g.C.hint || g.t < (g.helpT || 0)) {
      const tgt = S.sheep.filter(s => !s.penned).sort((a, b) => Math.hypot(a.x - S.me.x, a.y - S.me.y) - Math.hypot(b.x - S.me.x, b.y - S.me.y))[0];
      if (tgt) { const dx = gt.x - tgt.x, dy = gt.y - tgt.y, d = Math.hypot(dx, dy) || 1, bx = clamp(tgt.x - dx / d * 70, 20, W - 20), by = clamp(tgt.y - dy / d * 70, 70, H - 20); c.setLineDash([8, 8]); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.beginPath(); c.moveTo(tgt.x, tgt.y); c.lineTo(gt.x, gt.y); c.stroke(); c.setLineDash([]); c.fillStyle = 'rgba(255,212,71,.85)'; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, 12 + glow * 4, 0, 7); c.fill(); c.stroke(); c.font = '13px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('👣', bx, by + 1); }
    }
    const list = S.sheep.map(s => [s.y, 's', s]); list.push([S.me.y, 'm']); list.sort((a, b) => a[0] - b[0]);
    list.forEach(([, k, s]) => (k === 's' ? sheepTop(c, s.x, s.y, s.ang, 1, Math.hypot(s.vx, s.vy) > 10 ? g.t + s.ph : 0) : shepherdTop(c, S.me.x, S.me.y, S.me.ang, g.t, S.me.moving)));
    if (g.ptrDown && g.ptr && !S.done) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.arc(g.ptr[0], g.ptr[1], 14 + Math.sin(g.t * 8) * 3, 0, 7); c.stroke(); }
  }

  /* ================= STAGE 2: The Great Search (side-scrolling platformer) ================= */
  const GY = 450, PW = 30, PH = 64;
  function buildLevel() {
    const C = g.C, r = rng(g.seed + 7), L = { solids: [], water: [], thorns: [], wool: [], checks: [], prints: [], hints: [] };
    let x = 0, top = GY;
    const ground = w => { L.solids.push({ x, y: top, w, h: 600, k: 'ground' }); x += w; };
    const flat = (w, items = true) => {
      const x0 = x; ground(w);
      if (items) { const n = Math.floor(w / 110); for (let i = 0; i < n; i++) { const hi = r() < .3; L.wool.push({ x: x0 + 60 + i * 100, y: top - (hi ? 120 : 40), got: false }); } }
      for (let i = 0; i < w / 70; i++) L.prints.push({ x: x0 + 20 + i * 70, y: top });
    };
    flat(520, false); L.checks.push({ x: 120, y: GY, on: true });
    let lastCheck = 0;
    while (x < C.len) {
      const f = C.feats[Math.floor(r() * C.feats.length)];
      if (f === 'gap') { const w = Math.round(lerp(C.gap[0], C.gap[1], r())); L.hints.push({ x: x - 40 }); L.water.push({ x, w }); x += w; top = clamp(top + Math.round(lerp(-40, 30, r())), GY - 90, GY); }
      else if (f === 'step') top = clamp(top + (r() < .5 ? -1 : 1) * Math.round(lerp(30, 65, r())), GY - 110, GY);
      else if (f === 'log') { ground(60); L.hints.push({ x: x - 20 }); L.solids.push({ x, y: top - 34, w: 80, h: 34, k: 'log' }); ground(80); }
      else if (f === 'rock') { ground(60); const h = Math.round(lerp(48, 80, r())); L.hints.push({ x: x - 20 }); L.solids.push({ x, y: top - h, w: 70, h, k: 'rock' }); ground(70); }
      else if (f === 'thorn') { ground(70); L.hints.push({ x: x - 30 }); L.thorns.push({ x, y: top - 36, w: 56, h: 36 }); ground(56); }
      else if (f === 'plat') { const gw = 250; L.hints.push({ x: x - 40 }); L.water.push({ x, w: gw }); L.solids.push({ x: x + gw / 2 - 45, y: top - 70, w: 90, h: 24, k: 'plat' }); L.wool.push({ x: x + gw / 2, y: top - 110, got: false }); x += gw; }
      else if (f === 'stack') { ground(50); L.hints.push({ x: x - 20 }); L.solids.push({ x, y: top - 50, w: 60, h: 50, k: 'rock' }); L.solids.push({ x: x + 60, y: top - 100, w: 60, h: 100, k: 'rock' }); L.wool.push({ x: x + 90, y: top - 150, got: false }); ground(120); }
      flat(Math.round(lerp(180, 280, r())));
      if (x - lastCheck > 900) { L.checks.push({ x: x - 100, y: top, on: false }); lastCheck = x; }
    }
    flat(900, false);
    L.end = x - 560; L.endY = top;
    return L;
  }
  function setup2() {
    g.s1 = null;
    const L = buildLevel();
    g.s2 = { L, p: { x: 120, y: GY - PH, vx: 0, vy: 0, on: true, face: 1, coyote: 0 }, jq: -9, check: L.checks[0], wool: 0, falls: 0, hits: 0, inv: 0, done: false, bleatT: 2, fireflies: Array.from({ length: 18 }, (_, i) => ({ x: (i * 241) % 1400, y: 120 + (i * 67) % 260, ph: i })) };
    g.camX = 0;
    $('#lrPad').hidden = false; const k = $('#lrKeys'); k.hidden = false; k.textContent = '← → to run · ↑ or Space to jump';
    hud2();
    card(`<h3>The Great Search!</h3><p>Run and jump. Follow the wool and listen for the “Baa!”</p>
      <div class="how"><span><b>◀ ▶</b>Run</span><span><b>⬆</b>Jump</span><span><b>🧶</b>Collect wool</span></div>
      <p class="note">Fall in a stream? You start again from the last lantern 🏮.</p>`, `${Ark.UI.play} Go!`, () => sayLine('Find the lost sheep! ➡️'));
  }
  function hud2() { const S = g.s2; hud(clamp(S.p.x / S.L.end, 0, 1), `<span class="lr-pill">🧶 ${S.wool}/${S.L.wool.length}</span>`); }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function update2(dt) {
    const S = g.s2, C = g.C, p = S.p, L = S.L;
    if (S.done) return;
    const dir = (g.keys.right ? 1 : 0) - (g.keys.left ? 1 : 0);
    const acc = p.on ? 2400 : 1600;
    if (dir) { p.vx += dir * acc * dt; p.face = dir; } else { const f = (p.on ? 2600 : 600) * dt; p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f; }
    p.vx = clamp(p.vx, -C.run, C.run);
    p.coyote = p.on ? .1 : Math.max(0, p.coyote - dt);
    if (g.t - S.jq < .14 && (p.on || p.coyote > 0)) { p.vy = -720; p.on = false; p.coyote = 0; S.jq = -9; SFX.jump(); }
    if (!g.keys.jump && !g.keys.up && p.vy < -250) p.vy += 2600 * dt;   // let go early for a little hop
    p.vy = Math.min(p.vy + 1900 * dt, 1100);
    // move and collide, one axis at a time
    p.x += p.vx * dt;
    let box = { x: p.x, y: p.y, w: PW, h: PH };
    for (const s of L.solids) if (hit(box, s)) { if (p.vx > 0) p.x = s.x - PW; else if (p.vx < 0) p.x = s.x + s.w; p.vx = 0; box.x = p.x; }
    p.x = Math.max(0, p.x);
    const wasOn = p.on; p.on = false; p.y += p.vy * dt; box = { x: p.x, y: p.y, w: PW, h: PH };
    for (const s of L.solids) if (hit(box, s)) { if (p.vy > 0) { p.y = s.y - PH; p.on = true; if (!wasOn && p.vy > 300) SFX.land(); } else p.y = s.y + s.h; p.vy = 0; box.y = p.y; }
    if (p.on && Math.abs(p.vx) > 40 && Math.floor(g.t * 7) !== S.stepT) { S.stepT = Math.floor(g.t * 7); SFX.step(); }
    S.inv = Math.max(0, S.inv - dt);
    // thorn bushes bump you back (no damage)
    for (const t of L.thorns) if (S.inv <= 0 && hit({ x: p.x + 4, y: p.y + 6, w: PW - 8, h: PH - 6 }, t)) { S.inv = 1; S.hits++; g.mistakes++; addScore(-25); p.vx = -p.face * 320; p.vy = -380; p.on = false; SFX.ouch(); pop(p.x, p.y - 20, 'Ouch! Jump the thorns', '#FF8FA3', false, true); hud2(); }
    // a stream: splash, then start again from the last lantern
    if (p.y > 610) { S.falls++; g.mistakes++; addScore(-50); SFX.splash(); sparkle(p.x, 560, '#9FD8FF', 16, true); p.x = S.check.x; p.y = S.check.y - PH - 4; p.vx = 0; p.vy = 0; S.inv = 1; sayLine('Splash! Back to the lantern 🏮', 1800); hud2(); }
    for (const w of L.wool) if (!w.got && Math.abs(p.x + PW / 2 - w.x) < 30 && Math.abs(p.y + PH / 2 - w.y) < 44) { w.got = true; S.wool++; addScore(50); SFX.wool(); sparkle(w.x, w.y, '#FFFFFF', 10, true); hud2(); }
    for (const ck of L.checks) if (!ck.on && p.x > ck.x) { ck.on = true; S.check = ck; SFX.check(); pop(ck.x, ck.y - 90, '🏮 Saved!', '#FFD447', false, true); }
    // the bleat: louder, and more from the right, as you get closer
    const prog = clamp(p.x / L.end, 0, 1);
    S.bleatT -= dt; if (S.bleatT <= 0) { S.bleatT = 3.2 - prog * 1.4; SFX.bleat(1.3, .7 - prog * .5, .012 + prog * .06); S.wave = 1; }
    S.wave = Math.max(0, (S.wave || 0) - dt);
    const tx = p.x - W * .35 + p.vx * .25; g.camX += (tx - g.camX) * Math.min(1, dt * 6); g.camX = clamp(g.camX, 0, Math.max(0, L.end + 400 - W));
    if (Math.floor(g.t * 5) !== S.hb) { S.hb = Math.floor(g.t * 5); hud2(); }
    if (p.x > L.end - 70) done2();
  }
  function done2() {
    const S = g.s2; S.done = true; $('#lrPad').hidden = true; g.keys = {};
    const bonus = Math.max(0, Math.round((S.L.end / g.C.run * 2.2 - g.times[1]) * 8)) + 200; addScore(bonus);
    SFX.bleat(1.4, 0, .07); later(() => SFX.bleat(1.45, 0, .07), 500);
    pop(W / 2, H / 2 - 60, 'Found it! 🐑', '#FFD447', true);
    later(() => begin(2), 1800);
  }
  function groundAt(L, x) { let y = GY; for (const s of L.solids) if (s.k === 'ground' && x >= s.x && x <= s.x + s.w) y = s.y; return y; }
  function draw2(c) {
    const S = g.s2, L = S.L, p = S.p, cam = g.camX, prog = clamp(p.x / L.end, 0, 1);
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, mixC('#5B6FB5', '#1B2450', prog)); gr.addColorStop(1, mixC('#F2A27A', '#3C4A82', prog)); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = `rgba(255,255,255,${prog * .9})`; for (let i = 0; i < 40; i++) c.fillRect(((i * 137.5 - cam * .05) % W + W) % W, (i * 61) % (H * .5), 2, 2);
    c.fillStyle = '#FFF3C4'; c.beginPath(); c.arc(W * .8, 80, 26, 0, 7); c.fill();
    g.oy = (H - 540) * (H > 540 ? .55 : .85); c.save(); c.translate(0, g.oy);
    c.fillStyle = mixC('#7FA27A', '#2C4A44', prog); c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, GY - 120 - 40 * Math.sin((x + cam * .25) / 160) - 20 * Math.sin((x + cam * .25) / 63)); c.lineTo(W, H); c.fill();
    c.fillStyle = mixC('#5E8F55', '#23402F', prog); for (let i = -1; i < W / 140 + 2; i++) { const bx = i * 140 - (cam * .5) % 140; c.beginPath(); c.moveTo(bx, GY - 30); c.lineTo(bx + 30, GY - 130); c.lineTo(bx + 60, GY - 30); c.fill(); }
    c.save(); c.translate(-cam, 0);
    for (const w of L.water) { if (w.x > cam + W || w.x + w.w < cam) continue; c.fillStyle = '#3E7BD6'; c.fillRect(w.x, GY + 40, w.w, H); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = 0; x <= w.w; x += 8) c.lineTo(w.x + x, GY + 52 + k * 16 + Math.sin((x + g.t * 60) / 10) * 2); c.stroke(); } }
    for (const s of L.solids) {
      if (s.x > cam + W || s.x + s.w < cam) continue;
      c.strokeStyle = ink; c.lineWidth = 3;
      if (s.k === 'ground') { c.fillStyle = '#8B6A45'; c.fillRect(s.x, s.y, s.w, 700); c.fillStyle = mixC('#6FBF5A', '#3E7B47', prog); c.fillRect(s.x, s.y, s.w, 14); c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x + s.w, s.y); c.stroke(); }
      else if (s.k === 'log') { c.fillStyle = '#8B5A2B'; c.beginPath(); if (c.roundRect) c.roundRect(s.x, s.y, s.w, s.h, 14); else c.rect(s.x, s.y, s.w, s.h); c.fill(); c.stroke(); c.fillStyle = '#D9B38C'; c.beginPath(); c.ellipse(s.x + s.w - 6, s.y + s.h / 2, 6, s.h / 2 - 2, 0, 0, 7); c.fill(); c.stroke(); }
      else { c.fillStyle = s.k === 'plat' ? '#A9A39A' : '#9A958E'; c.beginPath(); if (c.roundRect) c.roundRect(s.x, s.y, s.w, s.h, 8); else c.rect(s.x, s.y, s.w, s.h); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(s.x + 8, s.y + 6, s.w * .4, 5); }
    }
    // edges of streams
    for (const w of L.water) { if (w.x > cam + W || w.x + w.w < cam) continue; c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.moveTo(w.x, groundAt(L, w.x - 2)); c.lineTo(w.x, H); c.moveTo(w.x + w.w, groundAt(L, w.x + w.w + 2)); c.lineTo(w.x + w.w, H); c.stroke(); }
    // hoofprints: the trail the lost sheep left
    c.fillStyle = 'rgba(90,70,50,.55)'; for (const h of L.prints) { if (h.x < cam - 20 || h.x > cam + W + 20) continue; c.beginPath(); c.ellipse(h.x - 3, h.y + 7, 2, 3.2, 0, 0, 7); c.ellipse(h.x + 3, h.y + 7, 2, 3.2, 0, 0, 7); c.fill(); }
    for (const t of L.thorns) { if (t.x > cam + W || t.x + t.w < cam) continue; c.fillStyle = '#3E5A2A'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI, rr = i % 2 ? t.w * .42 : t.w * .58; c.lineTo(t.x + t.w / 2 + Math.cos(a) * rr, t.y + t.h + Math.sin(a) * rr * 1.2); } c.closePath(); c.fill(); c.stroke(); }
    for (const ck of L.checks) { const x = ck.x; if (x < cam - 40 || x > cam + W + 40) continue; c.strokeStyle = '#6B4423'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, ck.y); c.lineTo(x, ck.y - 70); c.lineTo(x + 14, ck.y - 70); c.stroke(); c.fillStyle = ck.on ? '#FFD447' : '#7A6A50'; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.rect(x + 8, ck.y - 66, 14, 18); c.fill(); c.stroke(); if (ck.on) { const gl = c.createRadialGradient(x + 15, ck.y - 57, 2, x + 15, ck.y - 57, 40); gl.addColorStop(0, 'rgba(255,220,120,.6)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gl; c.fillRect(x - 30, ck.y - 100, 90, 90); } }
    for (const w of L.wool) { if (w.got || w.x < cam - 20 || w.x > cam + W + 20) continue; const by = w.y + Math.sin(g.t * 3 + w.x) * 4; c.fillStyle = '#fff'; c.strokeStyle = ink; c.lineWidth = 1.6; [[-6, 0], [6, 0], [0, -5], [0, 5]].forEach(([a, b]) => { c.beginPath(); c.arc(w.x + a, by + b, 7, 0, 7); c.fill(); c.stroke(); }); }
    if (g.C.hint || g.t < (g.helpT || 0)) for (const h of L.hints) { if (h.x < p.x || h.x > p.x + 340) continue; const y = groundAt(L, h.x) - 70; c.fillStyle = '#FFD447'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(h.x, y); c.lineTo(h.x - 14, y + 18); c.lineTo(h.x + 14, y + 18); c.closePath(); c.fill(); c.stroke(); c.font = '800 13px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeText('JUMP', h.x, y - 10); c.fillText('JUMP', h.x, y - 10); }
    // the lost sheep at the end, caught in a thorn bush
    const ex = L.end + 120, ey = L.endY;
    c.fillStyle = '#3E5A2A'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI, rr = i % 2 ? 46 : 62; c.lineTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr * 1.1); } c.closePath(); c.fill(); c.stroke();
    sheepSide(c, ex - 4 + Math.sin(g.t * 6) * 2, ey - 34, 1.1, 0, -1);
    c.fillStyle = '#3E5A2A'; c.beginPath(); c.arc(ex + 20, ey - 20, 22, 0, 7); c.arc(ex - 28, ey - 16, 18, 0, 7); c.fill(); c.stroke();
    c.fillStyle = `rgba(255,240,150,${prog})`; S.fireflies.forEach(f => { const x = cam + ((f.x + Math.sin(g.t + f.ph) * 20) % W), y = f.y + Math.cos(g.t * 1.3 + f.ph) * 12; c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); });
    shepherdSide(c, p.x + PW / 2, p.y + PH, g.t, p.on && Math.abs(p.vx) > 30, p.face, false, S.inv > 0 && Math.floor(S.inv * 10) % 2);
    c.restore(); c.restore();
    if (S.wave > 0 && !S.done) { c.globalAlpha = S.wave; const s = 16 + prog * 18; c.font = `400 ${s}px "Lilita One", sans-serif`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.lineWidth = 5; c.strokeStyle = ink; c.fillStyle = '#fff'; c.strokeText('Baa! ➡', W - 14, H * .42); c.fillText('Baa! ➡', W - 14, H * .42); c.globalAlpha = 1; }
  }

  /* ================= STAGE 3: Rescue and Return ================= */
  function setup3() {
    const C = g.C, n = C.branches;
    g.s2 = null; g.camX = 0;
    const cx = W / 2, cy = H * .56;
    const br = Array.from({ length: n }, (_, i) => ({ a: -Math.PI * .95 + i * (Math.PI * 1.9 / Math.max(1, n - 1)), dx: 0, dy: 0, gone: false, out: 0, len: 150 + (i % 3) * 20 }));
    g.s3 = { cx, cy, br, phase: 'free', grab: -1, t: 0, cur: [cx, cy - 140], walk: 0 };
    $('#lrPad').hidden = true; const k = $('#lrKeys'); k.hidden = false; k.textContent = 'Drag a branch away · or move the hand with arrows and hold Space';
    hud3();
    card(`<h3>Rescue the Sheep!</h3><p>Grab a thorny branch and pull it away from the sheep.</p>
      <div class="how"><span><b>👆 ↗</b>Drag outward</span>${g.diff === 'hard' ? '<span><b>🔗</b>Top branches first</span>' : ''}</div>`, `${Ark.UI.play} Go!`, () => SFX.bleat(1.4, 0, .05));
  }
  function hud3() { const S = g.s3, left = S.br.filter(b => !b.gone).length; hud(S.phase === 'free' ? 1 - left / S.br.length : 1, S.phase === 'free' ? `<span class="lr-pill">🌿 ${left} left</span>` : ''); }
  const tangled = i => { const j = g.C.tangle[i]; return j !== undefined && !g.s3.br[j].gone; };
  function branchSeg(b) { const S = g.s3, ca = Math.cos(b.a), sa = Math.sin(b.a); return [S.cx + ca * 30 + b.dx, S.cy + sa * 30 + b.dy, S.cx + ca * b.len + b.dx, S.cy + sa * b.len + b.dy]; }
  function nearest(p) {
    const S = g.s3; let best = -1, bd = 36;
    S.br.forEach((b, i) => { if (b.gone) return; const [x1, y1, x2, y2] = branchSeg(b), dx = x2 - x1, dy = y2 - y1, t = clamp(((p[0] - x1) * dx + (p[1] - y1) * dy) / (dx * dx + dy * dy), 0, 1), d = Math.hypot(p[0] - x1 - dx * t, p[1] - y1 - dy * t) - (tangled(i) ? 0 : 4); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function grabAt(p) {
    const S = g.s3; if (!S || S.phase !== 'free' || S.grab >= 0) return;
    const i = nearest(p); if (i < 0) return;
    if (tangled(i)) { S.shake = { i, t: .4 }; sayLine('Tangled! Pull the branch on top first.', 1600); SFX.rustle(); return; }
    S.grab = i; S.g0 = [p[0], p[1]]; S.b0 = [S.br[i].dx, S.br[i].dy]; S.br[i].spring = false; SFX.rustle();
  }
  function dragTo(p) { const S = g.s3; if (!S || S.grab < 0) return; const b = S.br[S.grab]; b.dx = S.b0[0] + p[0] - S.g0[0]; b.dy = S.b0[1] + p[1] - S.g0[1]; }
  function release() {
    const S = g.s3; if (!S || S.grab < 0) return;
    const b = S.br[S.grab]; S.grab = -1;
    // it comes free when pulled far enough, outward (away from the sheep)
    const out = b.dx * Math.cos(b.a) + b.dy * Math.sin(b.a);
    if (Math.hypot(b.dx, b.dy) >= g.C.pull && out > g.C.pull * .4) {
      b.gone = true; b.fly = [b.dx * 5 + Math.cos(b.a) * 200, b.dy * 5 + Math.sin(b.a) * 200 - 200]; addScore(50); SFX.snip();
      sparkle(S.cx + Math.cos(b.a) * 100 + b.dx, S.cy + Math.sin(b.a) * 100 + b.dy, '#7ED957', 10); hud3();
      if (S.br.every(x => x.gone)) freed();
    } else { b.spring = true; if (Math.hypot(b.dx, b.dy) > 10) sayLine('Pull further, away from the sheep!', 1600); }
  }
  function freed() {
    const S = g.s3; S.phase = 'lift'; S.t = 0;
    const bonus = Math.max(0, Math.round((g.C.branches * 6 - g.times[2]) * 10)); addScore(bonus);
    SFX.bleat(1.2, 0, .07); later(() => SFX.bleat(1.3, 0, .07), 500);
    for (let i = 0; i < 20; i++) g.parts.push({ x: S.cx + rnd(-40, 40), y: S.cy - 40, vx: rnd(-60, 60), vy: rnd(-200, -80), life: 1.4, c: '#FF8FA3', r: 5 });
    sayLine('Free! 💛', 1600);
    hud3();
  }
  function update3(dt) {
    const S = g.s3; S.t += dt;
    if (S.phase === 'free') {
      const mx = (g.keys.right ? 1 : 0) - (g.keys.left ? 1 : 0), my = (g.keys.down ? 1 : 0) - (g.keys.up ? 1 : 0);
      if (mx || my) { S.usedKeys = true; S.cur[0] = clamp(S.cur[0] + mx * 280 * dt, 0, W); S.cur[1] = clamp(S.cur[1] + my * 280 * dt, 0, H); if (S.grab >= 0) dragTo(S.cur); }
      S.br.forEach((b, i) => {
        if (b.gone && b.fly) { b.dx += b.fly[0] * dt; b.dy += b.fly[1] * dt; b.fly[1] += 900 * dt; b.out = Math.min(1, b.out + dt * 1.6); }
        else if (b.spring && S.grab !== i) { b.dx *= .82; b.dy *= .82; if (Math.hypot(b.dx, b.dy) < 1) { b.dx = b.dy = 0; b.spring = false; } }
      });
      if (S.shake) { S.shake.t -= dt; if (S.shake.t <= 0) S.shake = null; }
    } else if (S.phase === 'lift') {
      if (S.t > 2.4) { S.phase = 'home'; S.t = 0; S.walk = 0; sayLine('Home we go! 🌅', 2000); }
    } else if (S.phase === 'home') {
      S.walk = Math.min(1, S.t / 5); if (Math.floor(S.t * 4) !== S.stepT) { S.stepT = Math.floor(S.t * 4); SFX.step(); }
      if (S.t > 5.2) { S.phase = 'party'; S.t = 0; S.count = 99; SFX.bleat(1, .4); later(() => SFX.bleat(1.1, .5), 300); }
    } else if (S.phase === 'party') {
      if (S.count === 99 && S.t > 1.2) { S.count = 100; SFX.win(); pop(W / 2, H * .34, 'Every sheep is home!', '#FFFFFF', true); for (let i = 0; i < 60; i++) g.parts.push({ x: rnd(0, W), y: rnd(-60, 0), vx: rnd(-40, 40), vy: rnd(40, 160), life: 3, c: ['#FFD447', '#FF8FA3', '#7ED957', '#5DA9F0'][i % 4], r: 5, star: i % 3 === 0 }); }
      if (S.t > 2.2 && !S.sang) { S.sang = true; SFX.song(); }
      if (S.t > 4.6 && !S.ended) { S.ended = true; ending(); }
    }
  }
  function draw3(c) {
    const S = g.s3;
    if (S.phase === 'free' || S.phase === 'lift') {
      const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1B2450'); gr.addColorStop(1, '#3C4A82'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 40; i++) c.fillRect((i * 137.5) % W, (i * 61) % (H * .45), 2, 2);
      c.fillStyle = '#8A857E'; c.beginPath(); c.moveTo(0, H * .7); c.lineTo(W * .2, H * .5); c.lineTo(W * .45, H * .62); c.lineTo(W * .7, H * .45); c.lineTo(W, H * .6); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.fillStyle = '#6E6A64'; c.fillRect(0, H * .8, W, H * .2);
      c.fillStyle = '#2F4A22'; c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI, rr = i % 2 ? 120 : 150; c.lineTo(S.cx + Math.cos(a) * rr, S.cy + 70 + Math.sin(a) * rr); } c.closePath();
      c.globalAlpha = S.phase === 'free' ? 1 : Math.max(0, 1 - S.t); c.fill(); c.stroke(); c.globalAlpha = 1;
      if (S.phase === 'free') sheepSide(c, S.cx + Math.sin(g.t * 7) * 2, S.cy + 20, 2.2, 0, 1);
      else {
        // the shepherd comes and lifts the sheep onto his shoulders
        const k = clamp(S.t / 1.2, 0, 1), sx = lerp(-60, S.cx - 70, k);
        if (S.t < 1.4) sheepSide(c, S.cx, S.cy + 20 - Math.abs(Math.sin(S.t * 8)) * 14, 2.2, g.t, 1, true);
        c.save(); c.translate(sx, S.cy + 110); c.scale(1.6, 1.6); shepherdSide(c, 0, 0, g.t, k < 1, 1, S.t >= 1.4); c.restore();
      }
      S.br.forEach((b, i) => {
        if (b.gone && b.out >= 1) return;
        const [x1, y1, x2, y2] = branchSeg(b), sh = S.shake && S.shake.i === i ? Math.sin(g.t * 60) * 4 : 0;
        c.globalAlpha = 1 - b.out; c.save(); c.translate(sh, 0);
        const free = !tangled(i);
        c.strokeStyle = S.grab === i ? '#7ED957' : free ? '#4C7A3A' : '#2E4220'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + Math.sin(b.a) * 14, (y1 + y2) / 2 - Math.cos(b.a) * 14, x2, y2); c.stroke();
        c.strokeStyle = ink; c.lineWidth = 3; for (let t = .15; t < 1; t += .17) { const px = lerp(x1, x2, t), py = lerp(y1, y2, t), nx = -Math.sin(b.a), ny = Math.cos(b.a); c.beginPath(); c.moveTo(px + nx * 7, py + ny * 7); c.lineTo(px + nx * 16 + Math.cos(b.a) * 6, py + ny * 16 + Math.sin(b.a) * 6); c.moveTo(px - nx * 7, py - ny * 7); c.lineTo(px - nx * 16 + Math.cos(b.a) * 6, py - ny * 16 + Math.sin(b.a) * 6); c.stroke(); }
        c.fillStyle = '#6FBF5A'; c.beginPath(); c.ellipse(lerp(x1, x2, .7), lerp(y1, y2, .7), 9, 5, b.a, 0, 7); c.fill();
        if (free && !b.gone && S.grab !== i && (g.C.hint || g.t < (g.helpT || 0))) { const ax = x2 + Math.cos(b.a) * 24, ay = y2 + Math.sin(b.a) * 24; c.fillStyle = '#FFD447'; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(ax + Math.cos(b.a) * 16, ay + Math.sin(b.a) * 16); c.lineTo(ax + Math.cos(b.a + 2.4) * 12, ay + Math.sin(b.a + 2.4) * 12); c.lineTo(ax + Math.cos(b.a - 2.4) * 12, ay + Math.sin(b.a - 2.4) * 12); c.closePath(); c.fill(); c.stroke(); }
        c.restore(); c.globalAlpha = 1; c.lineCap = 'butt';
      });
      if (S.phase === 'free' && S.usedKeys) { c.font = '34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(S.grab >= 0 ? '✊' : '✋', S.cur[0], S.cur[1]); }
    } else {
      // the walk home: night turns to morning, then the flock and neighbours celebrate
      const k = S.phase === 'home' ? S.walk : 1;
      const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, mixC('#1B2450', '#8FD3FF', k)); gr.addColorStop(1, mixC('#3C4A82', '#FFE7B5', k)); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = `rgba(255,255,255,${1 - k})`; for (let i = 0; i < 40; i++) c.fillRect((i * 137.5) % W, (i * 61) % (H * .45), 2, 2);
      c.fillStyle = '#FFE08A'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.arc(W * .8, lerp(H * .7, H * .18, k), 32, 0, 7); c.fill(); c.stroke();
      const off = k * 600;
      c.fillStyle = mixC('#2C4A44', '#9BD08A', k); c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * .62 - 40 * Math.sin((x + off * .4) / 150)); c.lineTo(W, H); c.fill();
      c.fillStyle = mixC('#23402F', '#6FBF5A', k); c.fillRect(0, H * .78, W, H * .22);
      for (let i = 0; i < 12; i++) { const x = ((i * 160 - off) % (W + 160) + W + 160) % (W + 160) - 80; c.fillStyle = mixC('#1E3A28', '#3E8E41', k); c.beginPath(); c.arc(x, H * .78, 28, Math.PI, 0); c.fill(); }
      const homeX = W * .72;
      if (S.phase === 'party' || S.walk > .55) {
        const fx = S.phase === 'party' ? homeX : lerp(W + 200, homeX, (S.walk - .55) / .45);
        c.fillStyle = '#D9A066'; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(fx - 70, H * .78); c.lineTo(fx - 70, H * .62); c.lineTo(fx, H * .52); c.lineTo(fx + 70, H * .62); c.lineTo(fx + 70, H * .78); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#8B5A2B'; c.fillRect(fx - 14, H * .68, 28, H * .1); c.strokeRect(fx - 14, H * .68, 28, H * .1);
        for (let i = 0; i < 9; i++) { const jump = S.phase === 'party' ? Math.abs(Math.sin(g.t * 6 + i)) * 14 : 0; sheepSide(c, fx - 170 + i * 30, H * .8 - jump, 1.1, g.t, -1, true); }
      }
      if (S.phase === 'party') {
        [[W * .1, '#D7263D'], [W * .18, '#1F55D6'], [W * .93, '#7A3E9D']].forEach(([x, col], i) => { const j = Math.abs(Math.sin(g.t * 5 + i)) * 12, b = H * .84 - j; c.fillStyle = col; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 14, b); c.lineTo(x - 10, b - 50); c.lineTo(x + 10, b - 50); c.lineTo(x + 14, b); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#9B6A3C'; c.beginPath(); c.arc(x, b - 62, 11, 0, 7); c.fill(); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(x - 10, b - 46); c.lineTo(x - 20, b - 72); c.moveTo(x + 10, b - 46); c.lineTo(x + 20, b - 72); c.stroke(); });
        c.font = '400 28px "Lilita One", sans-serif'; c.textAlign = 'center'; for (let i = 0; i < 6; i++) { c.fillStyle = ['#7A3E9D', '#D7263D', '#1F55D6'][i % 3]; c.fillText(i % 2 ? '♫' : '♪', W * (.15 + i * .14), H * .45 - ((g.t * 40 + i * 30) % 120)); }
        c.font = '400 72px "Lilita One", sans-serif'; c.lineWidth = 8; c.strokeStyle = ink; c.fillStyle = '#FFD447'; c.textBaseline = 'middle'; c.strokeText(`🐑 ${S.count}`, W / 2, H * .18); c.fillText(`🐑 ${S.count}`, W / 2, H * .18);
      }
      const sx = S.phase === 'party' ? W * .42 : W * .3;
      c.save(); c.translate(sx, H * .82); c.scale(1.5, 1.5); shepherdSide(c, 0, 0, g.t, S.phase === 'home', 1, true); c.restore();
    }
  }
  function ending() {
    card(`<h3>Rejoice! 🎉</h3><p>“Rejoice with me; for I have found my sheep which was lost.”</p><span class="ref">Luke 15:6 (KJV)</span>
      <p style="font-size:15px">Jesus told this story. God is like the shepherd: He looks for every person who is lost, and there is joy in heaven when one comes back to Him.</p><span class="ref">Luke 15:7 (summary)</span>`, '⭐ See my score', finishAll);
  }

  /* ---------- finish ---------- */
  function finishAll() {
    const { diff, score, mistakes, times, C } = g;
    const stars = mistakes <= C.ok[0] ? 3 : mistakes <= C.ok[1] ? 2 : 1;
    const best = storeJSON('lsr-best') || {}, prev = best[diff] || 0, nb = score > prev;
    if (nb) { best[diff] = score; storeJSON('lsr-best', best); }
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
    const d = diff, total = times[0] + times[1] + times[2];
    stop(); el.classList.remove('lr-wide');
    Ark.finish(el, {
      id: 'bible-discovery', diff: d, stars, title: 'All 100 sheep are home!',
      html: `<div class="row" style="justify-content:center;gap:6px"><span class="chip">⭐ ${score} points</span><span class="chip">🏆 Best ${Math.max(score, prev)}</span><span class="chip">⏱ ${fmt(total)}</span><span class="chip">${mistakes ? `${mistakes} bump${mistakes === 1 ? '' : 's'} & splashes` : '✓ No bumps or splashes'}</span></div>
        ${nb && prev ? '<span class="newbest">New best score!</span>' : ''}
        <div class="lesson" style="text-align:left;border-color:var(--amber)">🎯 <b>Next challenge:</b> ${mistakes ? 'get home with no bumps or splashes!' : `beat your best of ${Math.max(score, prev)}!`}</div>`,
      verse: ['Rejoice with me; for I have found my sheep which was lost.', 'Luke 15:6 (KJV)'],
      lesson: 'Jesus is the Good Shepherd. Every single person matters to God, and heaven rejoices when one who was lost comes home (Luke 15:7).',
      again: () => play(d), menu,
      next: d !== 'hard' ? [`Try ${d === 'easy' ? 'Normal' : 'Hard'}`, () => { const n = d === 'easy' ? 'normal' : 'hard'; store('diff-bible-discovery', n); play(n); }] : null
    });
    hush();   // the shared finish screen can speak; this game uses no speech
    if (nb && prev) Ark.toast('New best score!');
  }

  // This game uses no spoken narration: while it is open, the shared screens' speech is silenced (restored on leaving).
  let realSpeak = null;
  function muteTTS(on) {
    try {
      const ss = window.speechSynthesis; if (!ss) return;
      if (on && !realSpeak) { realSpeak = ss.speak; ss.speak = () => {}; }
      else if (!on && realSpeak) { ss.speak = realSpeak; realSpeak = null; }
    } catch (e) {}
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; if (g) clearTimeout(g.sayT); g = null; }

  Ark.games['bible-discovery'] = {
    mount(stage) { el = stage; css(); muteTTS(true); addEventListener('resize', onResize); addEventListener('keydown', onKey); addEventListener('keyup', onKey); menu(); },
    unmount() { stop(); hush(); muteTTS(false); if (el) el.classList.remove('lr-wide'); removeEventListener('resize', onResize); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); },
    _test: { state: () => g, D, size: () => [W, H], begin: s => begin(s), grab: p => grabAt(p), drag: p => dragTo(p), release: () => release(), seg: b => branchSeg(b), hit }
  };
})();
