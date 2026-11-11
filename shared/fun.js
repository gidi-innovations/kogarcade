/* KoG Arcade "fun kit": shared pieces for the hand-made action games (Calm the Storm, Walls of Jericho, Zacchaeus).
   - Ark.fun.view: a canvas that fills the space under the game bar in any orientation without stretching.
     The world keeps a fixed height; its width follows the screen's shape (between minA and maxA).
   - Ark.fun.loop: a frame loop that can pause.
   - Ark.fun.fx: particles, floating score text and screen shake.
   - Ark.fun.person: expressive characters (blink, moods, walking, waving arms).
   - Ark.fun.sfx: little sounds made with Web Audio (they follow the Sound button).
   - A friendly break reminder after a long stretch of play. */
(() => {
  const ink = '#13203A';
  const F = {};
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  F.calm = calm;

  if (!document.getElementById('fun-css')) {
    const s = document.createElement('style'); s.id = 'fun-css';
    s.textContent = `.fun-host{position:relative;width:100%;min-width:0;max-width:100%}
      .fun-cv{display:block;margin:0 auto;border:3px solid ${ink};border-radius:16px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:#203060}
      body.kog-full .fun-cv{border-width:0;border-radius:6px}`;
    document.head.appendChild(s);
  }

  /* ---------- the play area ---------- */
  F.view = (host, o) => {
    host.classList.add('fun-host');
    const cv = document.createElement('canvas'); cv.className = 'fun-cv'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', o.label || 'Game');
    host.appendChild(cv);
    const v = { cv, cx: cv.getContext('2d'), H: o.h, W: Math.round(o.h * (o.minA || 1)), cssW: 0, cssH: 0 };
    v.fit = () => {
      cv.style.width = '1px'; cv.style.height = '1px'; // let the page settle to the new screen size before measuring
      const gw = document.getElementById('gwrap');
      const hr = host.getBoundingClientRect();
      let availH;
      if (gw) { const gr = gw.getBoundingClientRect(); availH = gw.clientHeight - (hr.top - gr.top + gw.scrollTop) - (o.below || (document.body.classList.contains('kog-full') ? 10 : 34)); }
      else availH = innerHeight - hr.top - (o.below || 14);
      const availW = Math.max(220, host.clientWidth);
      availH = Math.max(o.minH || 240, availH);
      const a = Math.min(o.maxA || 2.4, Math.max(o.minA || .5, availW / availH));
      v.W = Math.round(o.h * a);
      let cw = availW, ch = cw / a;
      if (ch > availH) { ch = availH; cw = ch * a; }
      cw = Math.floor(cw); ch = Math.floor(ch);
      v.cssW = cw; v.cssH = ch;
      const d = Math.min(2, devicePixelRatio || 1);
      cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
      cv.width = Math.round((cw - 6) * d); cv.height = Math.round((ch - 6) * d);
      v.k = cv.width / v.W;
      v.cx.setTransform(v.k, 0, 0, cv.height / v.H, 0, 0);
      v.cx.lineJoin = 'round'; v.cx.lineCap = 'round';
      if (v.onfit) v.onfit(v);
    };
    v.reset = () => v.cx.setTransform(v.k, 0, 0, cv.height / v.H, 0, 0);
    v.pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * v.W / r.width, y: (e.clientY - r.top) * v.H / r.height }; };
    const onR = () => requestAnimationFrame(v.fit);
    addEventListener('resize', onR);
    v.destroy = () => removeEventListener('resize', onR);
    requestAnimationFrame(v.fit); v.fit();
    return v;
  };

  /* ---------- frame loop ---------- */
  F.loop = step => {
    const L = { paused: false, raf: 0, last: 0, on: true };
    const tick = t => {
      if (!L.on) return;
      const dt = Math.min(.05, Math.max(0, (t - (L.last || t)) / 1000)); L.last = t;
      if (!L.paused) step(dt, t / 1000);
      L.raf = requestAnimationFrame(tick);
    };
    L.raf = requestAnimationFrame(tick);
    L.stop = () => { L.on = false; cancelAnimationFrame(L.raf); };
    L.pause = () => { L.paused = true; };
    L.resume = () => { L.paused = false; L.last = 0; };
    return L;
  };

  /* ---------- effects ---------- */
  F.fx = () => {
    const ps = [], ts = []; let sh = 0;
    return {
      burst(x, y, n, col, o = {}) {
        for (let i = 0; i < n; i++) {
          const a = o.dir !== undefined ? o.dir + (Math.random() - .5) * (o.spread || 1.2) : Math.random() * Math.PI * 2;
          const sp = (o.speed || 160) * (.4 + Math.random() * .8);
          ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: (o.life || .7) * (.6 + Math.random() * .6), r: (o.size || 5) * (.6 + Math.random() * .8), col: Array.isArray(col) ? col[i % col.length] : col, g: o.g ?? 500, shape: o.shape || 'dot', rot: Math.random() * 6 });
        }
      },
      text(x, y, s, col = '#FFE58A', size = 28) { ts.push({ x, y, s, col, size, t: 0 }); },
      shake(a) { if (!calm()) sh = Math.max(sh, a); },
      update(dt) {
        for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.life += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 6; if (p.life > p.max) ps.splice(i, 1); }
        for (let i = ts.length - 1; i >= 0; i--) { ts[i].t += dt; if (ts[i].t > 1) ts.splice(i, 1); }
        sh *= Math.pow(.02, dt);
      },
      pre(cx) { if (sh > .4) cx.translate((Math.random() - .5) * sh, (Math.random() - .5) * sh); },
      draw(cx) {
        for (const p of ps) {
          const a = 1 - p.life / p.max; cx.globalAlpha = Math.max(0, a); cx.fillStyle = p.col;
          if (p.shape === 'rect') { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-p.r, -p.r * .6, p.r * 2, p.r * 1.2); cx.restore(); }
          else { cx.beginPath(); cx.arc(p.x, p.y, p.r * (p.shape === 'grow' ? 1 + p.life * 3 : 1), 0, 7); cx.fill(); }
        }
        cx.globalAlpha = 1;
        for (const t of ts) {
          const sc = t.t < .15 ? .6 + t.t / .15 * .6 : 1.2 - Math.min(.2, (t.t - .15)); cx.save();
          cx.globalAlpha = Math.min(1, (1 - t.t) * 2.5); cx.translate(t.x, t.y - t.t * 50); cx.scale(sc, sc);
          F.say(cx, t.s, 0, 0, { size: t.size, col: t.col }); cx.restore();
        }
        cx.globalAlpha = 1;
      },
      clear() { ps.length = 0; ts.length = 0; sh = 0; }
    };
  };

  /* ---------- drawing helpers ---------- */
  F.font = (size, w = 400) => `${w} ${size}px "Lilita One","Arial Rounded MT Bold","Trebuchet MS",sans-serif`;
  F.say = (cx, s, x, y, o = {}) => { // bold game text with an ink outline
    cx.font = F.font(o.size || 26); cx.textAlign = o.align || 'center'; cx.textBaseline = 'middle';
    cx.lineWidth = (o.size || 26) / 5; cx.strokeStyle = o.stroke || ink; cx.lineJoin = 'round'; cx.strokeText(s, x, y);
    cx.fillStyle = o.col || '#fff'; cx.fillText(s, x, y);
  };
  F.rr = (cx, x, y, w, h, r) => { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); };
  F.pill = (cx, x, y, w, h, fill, text, o = {}) => {
    F.rr(cx, x, y, w, h, h / 2); cx.fillStyle = fill; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    if (text) { cx.font = F.font(o.size || h * .5); cx.fillStyle = o.col || ink; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(text, x + w / 2, y + h / 2 + 1); }
  };
  F.bubble = (cx, x, y, text, o = {}) => { // speech bubble pointing down at (x, y)
    cx.font = F.font(o.size || 20); const w = cx.measureText(text).width + 26, h = (o.size || 20) * 1.7;
    let bx = Math.max(6, Math.min((o.W || 9999) - w - 6, x - w / 2)), by = y - h - 14;
    F.rr(cx, bx, by, w, h, 12); cx.fillStyle = o.fill || '#fff'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    cx.beginPath(); cx.moveTo(x - 8, by + h - 1); cx.lineTo(x, y - 4); cx.lineTo(x + 8, by + h - 1); cx.fillStyle = o.fill || '#fff'; cx.fill(); cx.stroke();
    cx.fillStyle = o.fill || '#fff'; cx.fillRect(x - 6, by + h - 4, 12, 5);
    cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(text, bx + w / 2, by + h / 2 + 1);
  };
  F.button = (cx, b, label, o = {}) => { // big round canvas button; b = {x,y,r}
    cx.save(); cx.globalAlpha = o.alpha ?? .92;
    cx.beginPath(); cx.arc(b.x, b.y + 4, b.r, 0, 7); cx.fillStyle = ink; cx.fill();
    cx.beginPath(); cx.arc(b.x, b.y + (b.down ? 3 : 0), b.r, 0, 7); cx.fillStyle = o.fill || '#FFD447'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    cx.globalAlpha = 1; F.say(cx, label, b.x, b.y + (b.down ? 3 : 0) + 1, { size: o.size || b.r * .7, col: o.col || '#fff' }); cx.restore();
  };
  F.hit = (b, p) => (p.x - b.x) ** 2 + (p.y - b.y) ** 2 <= (b.r * 1.15) ** 2;

  /* ---------- characters ----------
     p: {x, y (feet), s, skin, robe, trim, head:'cloth'|'hair'|'none', headCol, hair, beard, mood:'happy'|'worried'|'wow'|'sleepy'|'calm'|'oops',
         blink 0..1, walk (phase), armL, armR (angle from hanging down, radians, + = forwards/up), lean, flip, bounce} */
  F.person = (cx, p) => {
    const s = p.s || 1;
    cx.save(); cx.translate(p.x, p.y + (p.bounce || 0)); cx.rotate(p.lean || 0); cx.scale(p.flip ? -s : s, s);
    cx.lineWidth = 3; cx.strokeStyle = ink;
    const skin = p.skin || '#8D5A3B', robe = p.robe || '#3F6FE0';
    // legs
    if (!p.sit) {
      const sw = p.walk !== undefined ? Math.sin(p.walk) * 7 : 0;
      for (const [lx, d] of [[-6, sw], [6, -sw]]) {
        cx.beginPath(); cx.moveTo(lx, -24); cx.lineTo(lx + d, -2); cx.lineWidth = 8; cx.strokeStyle = ink; cx.stroke(); cx.lineWidth = 4; cx.strokeStyle = skin; cx.stroke();
        cx.beginPath(); cx.ellipse(lx + d + 2, -1, 6, 3, 0, 0, 7); cx.fillStyle = '#6B4423'; cx.fill(); cx.lineWidth = 2; cx.strokeStyle = ink; cx.stroke();
      }
    }
    cx.lineWidth = 3; cx.strokeStyle = ink;
    // back arm
    arm(cx, 11, -60, p.armR ?? .15, robe, skin);
    // robe
    cx.beginPath(); cx.moveTo(-13, -66); cx.quadraticCurveTo(-15, -45, -20, p.sit ? -10 : -20); cx.lineTo(20, p.sit ? -10 : -20); cx.quadraticCurveTo(15, -45, 13, -66); cx.quadraticCurveTo(0, -71, -13, -66); cx.closePath();
    cx.fillStyle = robe; cx.fill(); cx.stroke();
    if (p.trim) { cx.beginPath(); cx.moveTo(-3, -67); cx.lineTo(-5, p.sit ? -11 : -21); cx.lineTo(3, p.sit ? -11 : -21); cx.lineTo(3, -67); cx.closePath(); cx.fillStyle = p.trim; cx.fill(); }
    cx.beginPath(); cx.moveTo(-15, -44); cx.lineTo(15, -44); cx.lineWidth = 5; cx.strokeStyle = p.belt || '#6B4423'; cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = ink;
    // head
    const hy = -84;
    cx.beginPath(); cx.arc(0, hy, 17, 0, 7); cx.fillStyle = skin; cx.fill(); cx.stroke();
    if (p.hair) { cx.beginPath(); cx.arc(0, hy - 2, 17, Math.PI * 1.05, Math.PI * 1.95); cx.lineTo(13, hy - 6); cx.quadraticCurveTo(0, hy - 13, -13, hy - 6); cx.closePath(); cx.fillStyle = p.hair; cx.fill(); cx.stroke(); }
    if (p.beard) { cx.beginPath(); cx.moveTo(-14, hy + 3); cx.quadraticCurveTo(-12, hy + 22, 0, hy + 23); cx.quadraticCurveTo(12, hy + 22, 14, hy + 3); cx.quadraticCurveTo(7, hy + 11, 0, hy + 10); cx.quadraticCurveTo(-7, hy + 11, -14, hy + 3); cx.fillStyle = p.beard; cx.fill(); cx.stroke(); }
    face(cx, hy, p);
    if (p.head === 'cloth') {
      cx.beginPath(); cx.moveTo(-19, hy + 12); cx.quadraticCurveTo(-22, hy - 22, 0, hy - 22); cx.quadraticCurveTo(22, hy - 22, 19, hy + 12); cx.lineTo(15, hy + 12); cx.quadraticCurveTo(16, hy - 10, 0, hy - 12); cx.quadraticCurveTo(-16, hy - 10, -15, hy + 12); cx.closePath();
      cx.fillStyle = p.headCol || '#E8DCC6'; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-16, hy - 9); cx.quadraticCurveTo(0, hy - 15, 16, hy - 9); cx.lineWidth = 4; cx.strokeStyle = p.band || '#C0392B'; cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = ink;
    }
    if (p.hat) { cx.beginPath(); cx.ellipse(0, hy - 15, 22, 6, 0, 0, 7); cx.fillStyle = p.hat; cx.fill(); cx.stroke(); cx.beginPath(); cx.moveTo(-11, hy - 16); cx.quadraticCurveTo(0, hy - 36, 11, hy - 16); cx.fill(); cx.stroke(); }
    // front arm
    arm(cx, -11, -60, p.armL ?? .15, robe, skin, true);
    cx.restore();
  };
  function arm(cx, sx, sy, ang, robe, skin, front) {
    const len = 28, ex = sx + Math.sin(ang) * len * (front ? -1 : 1) * -1, ey = sy + Math.cos(ang) * len;
    // angle 0 = hanging down; positive raises forward/up
    const ax = sx + Math.sin(ang) * len, ay = sy + Math.cos(ang) * len;
    cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(ax, ay); cx.lineWidth = 12; cx.strokeStyle = ink; cx.stroke(); cx.lineWidth = 7; cx.strokeStyle = robe; cx.stroke();
    cx.beginPath(); cx.arc(ax, ay, 5.5, 0, 7); cx.fillStyle = skin; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = ink; cx.stroke(); cx.lineWidth = 3;
    void ex; void ey;
  }
  function face(cx, hy, p) {
    const m = p.mood || 'happy', bl = p.blink || 0;
    cx.fillStyle = ink; cx.strokeStyle = ink; cx.lineWidth = 2.5;
    if (m === 'sleepy') {
      for (const ex of [-6, 6]) { cx.beginPath(); cx.arc(ex, hy - 1, 3.5, .15 * Math.PI, .85 * Math.PI); cx.stroke(); }
    } else {
      const ey = hy - 2, ry = (m === 'wow' ? 4.6 : 3.6) * (1 - bl * .9);
      for (const ex of [-6, 6]) { cx.beginPath(); cx.ellipse(ex, ey, m === 'wow' ? 3.2 : 2.6, Math.max(.5, ry), 0, 0, 7); cx.fill(); }
      if (bl < .5) { cx.fillStyle = '#fff'; for (const ex of [-6, 6]) { cx.beginPath(); cx.arc(ex + .9, ey - 1.2, 1, 0, 7); cx.fill(); } cx.fillStyle = ink; }
      // brows
      cx.beginPath();
      if (m === 'worried' || m === 'oops') { cx.moveTo(-10, hy - 9); cx.lineTo(-3, hy - 11); cx.moveTo(10, hy - 9); cx.lineTo(3, hy - 11); }
      else if (m === 'wow') { cx.moveTo(-10, hy - 12); cx.quadraticCurveTo(-6, hy - 15, -2, hy - 12); cx.moveTo(10, hy - 12); cx.quadraticCurveTo(6, hy - 15, 2, hy - 12); }
      cx.stroke();
    }
    // mouth
    cx.beginPath();
    if (m === 'happy' || m === 'calm') { cx.arc(0, hy + 4, m === 'happy' ? 6 : 4.5, .15 * Math.PI, .85 * Math.PI); cx.stroke(); }
    else if (m === 'worried') { cx.moveTo(-5, hy + 9); cx.quadraticCurveTo(-2.5, hy + 6, 0, hy + 8); cx.quadraticCurveTo(2.5, hy + 10, 5, hy + 7); cx.stroke(); }
    else if (m === 'wow' || m === 'oops') { cx.ellipse(0, hy + 8, m === 'wow' ? 4 : 3, m === 'wow' ? 5 : 3.5, 0, 0, 7); cx.fillStyle = '#7A1E2B'; cx.fill(); cx.stroke(); }
    else if (m === 'sleepy') { cx.ellipse(0, hy + 8, 2.5, 2, 0, 0, 7); cx.stroke(); }
    // cheeks
    if (m === 'happy' || m === 'wow') { cx.fillStyle = 'rgba(255,120,140,.45)'; cx.beginPath(); cx.ellipse(-11, hy + 4, 3.5, 2.2, 0, 0, 7); cx.ellipse(11, hy + 4, 3.5, 2.2, 0, 0, 7); cx.fill(); }
  }
  // Blink helper: returns 0..1 (closed) now and then, different for each character (seed).
  F.blink = (t, seed) => { const c = (t + seed * 1.37) % (3.1 + (seed % 3) * .7); return c < .12 ? 1 - Math.abs(c - .06) / .06 : 0; };

  /* ---------- sound ---------- */
  let ac = null, noiseBuf = null;
  const ctx = () => {
    if (!Ark.voiceOn()) return null;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
    return ac;
  };
  F.tone = (f, d, o = {}) => {
    const c = ctx(); if (!c) return;
    try {
      const t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      let node = osc;
      if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || .08, t + Math.min(o.att || .01, d / 3)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      node.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + d + .03);
    } catch (e) {}
  };
  F.noise = (d, o = {}) => {
    const c = ctx(); if (!c) return;
    try {
      if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
      const t = c.currentTime + (o.at || 0), src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      src.buffer = noiseBuf; src.loop = true; fl.type = o.type || 'lowpass'; fl.frequency.setValueAtTime(o.f || 1200, t);
      if (o.fTo) fl.frequency.exponentialRampToValueAtTime(o.fTo, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || .1, t + (o.att || .02)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      src.connect(fl); fl.connect(g); g.connect(c.destination); src.start(t); src.stop(t + d + .05);
    } catch (e) {}
  };
  F.sfx = {
    pop: () => F.tone(660, .09, { type: 'triangle', to: 990, vol: .07 }),
    coin: () => { F.tone(988, .08, { type: 'square', vol: .035, lp: 3000 }); F.tone(1319, .18, { type: 'square', vol: .035, lp: 3000, at: .07 }); },
    jump: () => F.tone(300, .16, { type: 'triangle', to: 720, vol: .06 }),
    land: () => F.noise(.08, { f: 500, vol: .06 }),
    splash: (v = 1) => { F.noise(.45, { f: 2400, fTo: 400, vol: .12 * v }); F.tone(180, .2, { to: 90, vol: .04 * v }); },
    whoosh: () => F.noise(.35, { type: 'bandpass', f: 600, fTo: 2400, vol: .08 }),
    thunder: () => { F.noise(1.6, { f: 260, fTo: 60, vol: .22, att: .03 }); F.tone(55, 1.2, { vol: .06, to: 38 }); },
    drum: (v = 1) => { F.tone(140, .18, { to: 45, vol: .2 * v }); F.noise(.05, { f: 1800, vol: .04 * v }); },
    tick: () => F.tone(1800, .03, { type: 'square', vol: .02, lp: 4000 }),
    horn: (f = 330, d = .35) => { F.tone(f, d, { type: 'sawtooth', lp: 1500, vol: .06, att: .04 }); F.tone(f * 2, d, { type: 'sawtooth', lp: 1200, vol: .02, att: .05 }); },
    good: () => { F.tone(784, .1, { type: 'triangle', vol: .06 }); F.tone(1175, .16, { type: 'triangle', vol: .05, at: .08 }); },
    oops: () => F.tone(330, .25, { type: 'triangle', to: 180, vol: .07 }),
    cheer: () => { F.noise(1.4, { type: 'bandpass', f: 1400, vol: .12, att: .15 }); [523, 659, 784, 1046].forEach((f, i) => F.tone(f, .5, { type: 'triangle', vol: .05, at: i * .1 })); },
    win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => F.tone(f, .45, { type: 'triangle', vol: .06, at: i * .1 })),
    crash: () => { F.noise(1.2, { f: 900, fTo: 120, vol: .25 }); F.tone(70, .9, { to: 35, vol: .12 }); }
  };

  /* ---------- card pictures for the new games ---------- */
  Object.assign(Ark.G, {
    boat: '<svg viewBox="0 0 48 48"><path d="M2 36c4 3 8 3 11 0s7-3 11 0 7 3 11 0 7-3 11 0v8H2z" fill="#5DA9F0" stroke="#13203A" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 28h32l-5 8H13z" fill="#A0612D" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><path d="M24 6v22" stroke="#13203A" stroke-width="3"/><path d="M25 8l12 16H25z" fill="#fff" stroke="#13203A" stroke-width="2.5" stroke-linejoin="round"/><path d="M36 6l-4 6 3 0-3 6" fill="none" stroke="#FFD447" stroke-width="2.5" stroke-linecap="round"/></svg>',
    trumpet: '<svg viewBox="0 0 48 48"><path d="M6 30c10-2 20-8 28-18l6 2c-2 10-8 18-16 22z" fill="#E8C27A" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><path d="M34 12c3-3 7-4 9-2s0 6-3 8" fill="#F4DDA8" stroke="#13203A" stroke-width="3"/><path d="M4 28l4 6" stroke="#13203A" stroke-width="3" stroke-linecap="round"/><g stroke="#F2A007" stroke-width="2.5" stroke-linecap="round"><path d="M42 24l4 2M40 30l4 4M44 18l3-1"/></g></svg>',
    sycamore: '<svg viewBox="0 0 48 48"><path d="M21 46V28h6v18z" fill="#8B5A2B" stroke="#13203A" stroke-width="2.5"/><path d="M27 32l8-6M21 34l-7-5" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="16" r="14" fill="#3FA34D" stroke="#13203A" stroke-width="3"/><circle cx="31" cy="20" r="5" fill="#F4C27A" stroke="#13203A" stroke-width="2"/><circle cx="31" cy="19" r="1" fill="#13203A"/><path d="M29 22q2 1.5 4 0" stroke="#13203A" stroke-width="1.2" fill="none"/><circle cx="16" cy="12" r="2.2" fill="#B5527A" stroke="#13203A" stroke-width="1.2"/><circle cx="22" cy="7" r="2.2" fill="#B5527A" stroke="#13203A" stroke-width="1.2"/></svg>'
  });

  /* ---------- a friendly break reminder ---------- */
  let played = 0, away = 0, told = 0;
  setInterval(() => {
    if (document.hidden) return;
    const inGame = document.body.classList.contains('in-game') && document.getElementById('pauseOv')?.hidden !== false;
    if (inGame) { played++; away = 0; } else if (++away > 120) { played = 0; told = 0; }
    const mins = Math.floor(played / 60);
    if (mins >= 25 && mins - told >= 25) { told = mins; Ark.say(`Great playing! You've been playing for ${mins} minutes. Time for a stretch and a drink of water?`, true); }
  }, 1000);

  Ark.fun = F;
})();
