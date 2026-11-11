/* Jesus Calms the Storm (Mark 4:35–41).
   Keep the disciples' boat steady in a growing storm: hold ◀ ▶ to lean, tap the boat to bail water out,
   tap flying things (Peter's headcloth, nets, fish, the seagull) to catch them. Three stretches of sea, then wake Jesus
   and watch Him calm the storm. Stars, best score and badges are kept only in this browser. */
(() => {
  const { store, storeJSON, say, hush } = Ark;
  const F = Ark.fun, ink = '#13203A';
  const ID = 'calm-storm';
  const D = {
    easy: { wave: .6, gust: [6.5, 5.5, 4.8], imp: 1.25, rain: 0, warn: .52, max: .82, splash: .1, len: [30, 36, 42], items: 3.2 },
    normal: { wave: .82, gust: [5.5, 4.4, 3.6], imp: 1.7, rain: .006, warn: .46, max: .78, splash: .14, len: [34, 42, 50], items: 3.8 },
    hard: { wave: 1, gust: [4.8, 3.9, 3.2], imp: 2.1, rain: .011, warn: .44, max: .77, splash: .15, len: [38, 48, 56], items: 4.4 }
  };
  const LV = [
    { name: 'Setting Sail', S: .45, tip: ['Hold ◀ or ▶ to keep the boat steady.', 'Tap the boat to bail out water.', 'Tap flying things to catch them!'] },
    { name: 'The Wind Rises', S: .75, tip: ['Big waves are coming!', 'When you see ⚠, lean the OTHER way.', 'Rain is filling the boat. Keep bailing!'] },
    { name: 'A Great Storm', S: 1, tip: ['The storm is at its worst.', 'Lightning, huge waves and flying nets!', 'Stay steady. You can do it!'] }
  ];
  const CREW = [
    { n: 'Peter', skin: '#8D5A3B', robe: '#3F6FE0', beard: '#3B2A1E', hair: '#2B1B12', head: 'cloth', headCol: '#E8DCC6', band: '#C0392B', dx: -0.02 },
    { n: 'Andrew', skin: '#6B4226', robe: '#14946B', beard: '#2B1B12', hair: '#1E140D', dx: 0.17 },
    { n: 'James', skin: '#A8714A', robe: '#C0392B', beard: '#4A2E1C', head: 'cloth', headCol: '#F2E3C2', band: '#1F55D6', dx: 0.35 },
    { n: 'John', skin: '#7A4B2E', robe: '#F2A007', hair: '#2B1B12', dx: 0.53 }
  ];
  const JESUS = { skin: '#A06A45', robe: '#F4F1EA', trim: '#C0392B', hair: '#4A2E1C', beard: '#4A2E1C', belt: '#C0392B' };

  let el, v = null, L = null, fx = null, g = null, run = null;

  /* ---------- colours ---------- */
  const hex = h => h[0] === '#' ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) : h.match(/\d+/g).slice(0, 3).map(Number);
  const mix = (a, b, t) => { t = Math.max(0, Math.min(1, t)); const A = hex(a), B = hex(b); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',')})`; };

  /* ---------- menu ---------- */
  function menu() {
    stop();
    const best = (storeJSON('calm-best') || {});
    Ark.menu(el, {
      id: ID, title: 'Jesus Calms the Storm', icon: 'boat', color: '#2E5C9E',
      blurb: 'A storm hits the Sea of Galilee! Keep the boat afloat, then see who even the wind obeys.',
      how: [['arrows', 'Hold ◀ ▶ to keep the boat steady'], ['tap', 'Tap the boat to bail out water'], ['star', 'Catch the flying things']],
      listen: 'Hold the left and right buttons to keep the boat steady. Tap the boat to bail out water. Tap flying things to catch them. When you see a warning sign, lean the other way!',
      diffs: { easy: 'Gentle waves and lots of time to bail.', normal: 'Bigger waves, rain and sudden gusts.', hard: 'A wild storm! Quick hands needed.' },
      extra: Object.keys(best).length ? `<p style="margin:0;text-align:center;font-weight:800;color:var(--muted)">Best score: ${Ark.DIFFS.filter(d => best[d]).map(d => `${Ark.DLABEL[d]} ${best[d]}`).join(' · ')}</p>` : '',
      start: d => { run = { diff: d, C: D[d], lv: 0, score: 0, stars: [], caught: 0, lurches: 0 }; play(); }
    });
  }

  /* ---------- a level ---------- */
  function play() {
    stop();
    el.innerHTML = '<div id="csHost"></div>';
    v = F.view(el.querySelector('#csHost'), { h: 540, minA: .56, maxA: 2.1, label: 'A boat on a stormy sea. Hold left or right to keep it steady, tap the boat to bail water.' });
    fx = F.fx();
    const C = run.C, lv = LV[run.lv];
    g = {
      st: 'intro', t: 0, S: lv.S, Sgoal: lv.S, dist: 0, len: C.len[run.lv], th: 0, om: 0, inL: 0, inR: 0, keys: {},
      water: 0, maxW: 0, lurch: 0, bailCd: 0, bailAnim: 0, items: [], itemT: 2.5, gustT: C.gust[run.lv] * (run.lv === 0 ? 1.4 : 1), warn: null,
      flash: 0, boltT: 4 + Math.random() * 4, bolt: null, oops: 0, happy: 0, hatOn: true, gull: null, gullT: 8 + Math.random() * 6,
      zz: 0, caughtLv: 0, ptrs: {}, wakeTaps: 0, calmT: 0, jesus: 'sleep', pts: 0
    };
    layout();
    v.onfit = layout;
    bindInput();
    L = F.loop(step);
    Ark.ctl({
      help: () => say(lv.tip.join(' '), true),
      pause: () => L && L.pause(), resume: () => L && L.resume(),
      restart: () => { run.score -= g ? g.pts : 0; play(); }
    });
  }
  function layout() {
    if (!g) return;
    const W = v.W, H = v.H;
    g.base = H * .64; g.bs = Math.max(.7, Math.min(1.45, W / 400));
    const r = W < 420 ? 36 : 42;
    g.bL = { x: r + 16, y: H - r - 16, r }; g.bR = { x: W - r - 16, y: H - r - 16, r };
  }

  /* ---------- input ---------- */
  function bindInput() {
    const cv = v.cv;
    const down = e => {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      const p = v.pt(e); tap(p, e.pointerId);
    };
    const up = e => { const k = g && g.ptrs[e.pointerId]; if (k) { g[k] = 0; delete g.ptrs[e.pointerId]; } };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointermove', e => { // sliding a finger between the two lean buttons
      const k = g && g.ptrs[e.pointerId]; if (!k) return;
      const p = v.pt(e), nk = F.hit(g.bL, p) ? 'inL' : F.hit(g.bR, p) ? 'inR' : null;
      if (nk && nk !== k) { g[k] = 0; g[nk] = 1; g.ptrs[e.pointerId] = nk; }
    });
    g.onKey = e => {
      if (!g) return;
      const k = e.key, on = e.type === 'keydown';
      if (['ArrowLeft', 'a', 'A'].includes(k)) { g.inL = on ? 1 : 0; e.preventDefault(); }
      else if (['ArrowRight', 'd', 'D'].includes(k)) { g.inR = on ? 1 : 0; e.preventDefault(); }
      else if ((k === ' ' || k === 'Enter') && on && !e.repeat) { e.preventDefault(); tap({ x: v.W / 2, y: g.base - 20, key: true }); }
    };
    addEventListener('keydown', g.onKey); addEventListener('keyup', g.onKey);
  }
  function tap(p, id) {
    if (!g) return;
    if (g.st === 'intro') { g.st = 'play'; F.sfx.pop(); return; }
    if (g.st === 'done') { next(); return; }
    if (g.st === 'sunk') { run.score -= g.pts; play(); return; }
    if (g.st === 'calmed' && g.calmT > 2.5) { finish(); return; }
    if (g.st === 'finale') {
      const j = jesusPos();
      if (p.key || Math.hypot(p.x - j.x, p.y - j.y) < 70 * g.bs) {
        g.wakeTaps++; F.sfx.pop(); fx.burst(j.x, j.y - 20, 8, ['#FFE58A', '#fff'], { speed: 120, g: 0, life: .6 });
        if (g.wakeTaps >= 3) { g.jesus = 'stand'; g.st = 'speak'; g.speakT = 0; F.sfx.good(); }
      }
      return;
    }
    if (g.st !== 'play') return;
    if (F.hit(g.bL, p)) { g.inL = 1; if (id !== undefined) g.ptrs[id] = 'inL'; return; }
    if (F.hit(g.bR, p)) { g.inR = 1; if (id !== undefined) g.ptrs[id] = 'inR'; return; }
    // catch something flying?
    for (const it of g.items) if (!it.got && Math.hypot(p.x - it.x, p.y - it.y) < 40) { catchIt(it); return; }
    if (g.gull && !g.gull.dropped && Math.hypot(p.x - g.gull.x, p.y - g.gull.y) < 46) { gullDrop(); return; }
    bail();
  }
  function bail() {
    if (g.bailCd > 0) return;
    g.bailCd = .13; g.bailAnim = .35;
    const b = boatPos();
    if (g.water > .01) {
      g.water = Math.max(0, g.water - .07);
      const side = Math.random() < .5 ? -1 : 1;
      fx.burst(b.x + side * 70 * g.bs, b.y - 20, 14, ['#9FD3FF', '#5DA9F0', '#fff'], { dir: side < 0 ? -2.3 : -.8, spread: .7, speed: 260, g: 700, size: 4 });
      F.sfx.splash(.45);
    } else { fx.text(b.x, b.y - 90 * g.bs, 'No water!', '#fff', 20); }
  }
  function catchIt(it) {
    it.got = true; g.happy = 1.2; run.caught++; g.caughtLv++;
    const pts = it.k === 'cloth' ? 80 : it.k === 'net' ? 60 : 40;
    add(pts); fx.text(it.x, it.y - 10, (it.k === 'cloth' ? 'Peter’s headcloth! +' : '+') + pts, '#FFE58A', 24);
    fx.burst(it.x, it.y, 16, ['#FFE58A', '#fff', '#FFB347'], { speed: 200, g: 0, life: .6 });
    if (it.k === 'cloth') g.hatOn = true;
    F.sfx.coin();
  }
  function gullDrop() {
    g.gull.dropped = true; F.tone(1400, .12, { type: 'square', vol: .03, to: 900, lp: 2500 }); F.tone(1200, .12, { type: 'square', vol: .03, to: 800, lp: 2500, at: .12 });
    g.items.push({ k: 'fish', x: g.gull.x, y: g.gull.y + 10, vx: 0, vy: 40, rot: 0, falling: true, got: false });
    fx.text(g.gull.x, g.gull.y - 20, 'Squawk!', '#fff', 22);
  }
  const add = p => { g.pts += p; run.score += p; };

  /* ---------- the sea ---------- */
  const amp = () => (8 + 30 * g.S * run.C.wave) * (g.st === 'calmed' || g.st === 'speak' ? Math.max(.06, 1 - (g.calmT || 0) / 2.5) : 1);
  const surf = (x, t) => g.base + amp() * (Math.sin(x * .017 + t * 1.5) * .55 + Math.sin(x * .0085 - t * 1.05 + 2) * 1);
  const boatPos = () => { const x = v.W / 2 + Math.sin(g.t * .37) * v.W * .025; return { x, y: surf(x, g.t) - 6 * g.bs }; };
  const slopeAt = x => Math.atan((surf(x + 55, g.t) - surf(x - 55, g.t)) / 110);
  const jesusPos = () => { const b = boatPos(), a = g.th + slopeAt(b.x) * .6; const lx = (g.jesus === 'sleep' ? -80 : -70) * g.bs; return { x: b.x + Math.cos(a) * lx, y: b.y + Math.sin(a) * lx - (g.jesus === 'sleep' ? 30 : 70) * g.bs }; };

  /* ---------- update ---------- */
  function step(dt) {
    if (!g) return;
    g.t += dt; fx.update(dt);
    const C = run.C;
    if (g.st === 'play') {
      const b = boatPos(), sl = slopeAt(b.x);
      g.dist += dt; g.bailCd -= dt; g.bailAnim -= dt; g.oops -= dt; g.happy -= dt;
      // forces on the boat
      const inp = (g.inR ? 1 : 0) - (g.inL ? 1 : 0);
      let tq = sl * 1.55 * C.wave * (.6 + g.S * .5) + inp * 3.3 - g.th * 2.2 - g.om * 1.5;
      g.om += tq * dt; g.th += g.om * dt;
      // gusts, telegraphed
      g.gustT -= dt;
      if (!g.warn && g.gustT < 1.1 && (run.lv > 0 || g.dist > 8)) g.warn = { dir: Math.random() < .5 ? -1 : 1, t: 1.1, push: 0 };
      if (g.warn) {
        g.warn.t -= dt;
        if (g.warn.t <= 0 && !g.warn.push) { g.warn.push = .9; fx.shake(8); F.sfx.whoosh(); }
        if (g.warn.push) { // the wave pushes for almost a second: leaning the other way while it pushes saves the boat
          g.om += g.warn.dir * C.imp * 2.6 * (.75 + g.S * .35) * dt;
          g.warn.push -= dt;
          if (g.warn.push <= 0) { g.warn = null; g.gustT = C.gust[run.lv] * (.8 + Math.random() * .4); }
        }
      }
      // water comes in
      const at = Math.abs(g.th);
      if (at > C.warn) { g.water += (at - C.warn) * .9 * dt; if (Math.random() < dt * 6) splashSide(Math.sign(g.th), .4); }
      if (at > C.max) {
        g.th = Math.sign(g.th) * C.max; g.om *= -.35; g.water += C.splash; g.lurch++; run.lurches++; g.oops = 1.1;
        splashSide(Math.sign(g.th), 1); fx.shake(16); F.sfx.splash(1);
        if (g.hatOn && Math.random() < .5) loseHat();
      }
      g.water += C.rain * g.S * dt * (run.lv > 0 ? 1 : 0);
      g.water = Math.max(0, g.water); g.maxW = Math.max(g.maxW, g.water);
      if (g.water >= 1) { g.st = 'sunk'; F.sfx.oops(); fx.shake(12); }
      // flying things
      g.itemT -= dt;
      if (g.itemT <= 0) { spawnItem(); g.itemT = C.items * (.7 + Math.random() * .6); }
      for (const it of g.items) {
        if (it.falling) { it.vy += 500 * dt; it.y += it.vy * dt; if (it.y > b.y - 10 && !it.got) { it.got = true; g.happy = 1; add(40); run.caught++; fx.text(it.x, it.y - 30, 'Fish! +40', '#FFE58A', 22); F.sfx.coin(); } }
        else { it.x += it.vx * dt; it.y += Math.sin(g.t * 3 + it.ph) * 30 * dt; it.rot += dt * it.spin; }
      }
      g.items = g.items.filter(it => !it.got && it.x > -60 && it.x < v.W + 60 && it.y < v.H + 40);
      // seagull
      g.gullT -= dt;
      if (!g.gull && g.gullT <= 0) { const d = Math.random() < .5 ? 1 : -1; g.gull = { d, x: d > 0 ? -40 : v.W + 40, y: v.H * .13 + Math.random() * 30, dropped: false }; }
      if (g.gull) { g.gull.x += g.gull.d * 95 * dt; if (g.gull.x < -60 || g.gull.x > v.W + 60) { g.gull = null; g.gullT = 9 + Math.random() * 8; } }
      // lightning
      if (g.S > .7) { g.boltT -= dt; if (g.boltT <= 0) { lightning(); g.boltT = 3.5 + Math.random() * 5; } }
      if (g.dist >= g.len) levelDone();
    } else if (g.st === 'finale') {
      g.th *= Math.pow(.2, dt); g.om = 0; g.S = 1.25;
    } else if (g.st === 'speak') {
      g.speakT += dt; g.th *= Math.pow(.1, dt);
      if (g.speakT > 1.6) { g.st = 'calmed'; g.calmT = 0; F.sfx.win(); }
    } else if (g.st === 'calmed') {
      g.calmT += dt; g.S = Math.max(0, 1.25 - g.calmT * .6); g.th *= Math.pow(.1, dt);
    } else {
      g.th *= Math.pow(.3, dt);
    }
    g.flash = Math.max(0, g.flash - dt * 2.2);
    g.zz += dt;
    draw();
  }
  function splashSide(side, k) {
    const b = boatPos();
    fx.burst(b.x + side * 95 * g.bs, b.y - 5, Math.round(18 * k), ['#fff', '#BFE3FF', '#7FC1F2'], { dir: -Math.PI / 2 + side * .5, spread: 1.1, speed: 330 * k, g: 800, size: 5 });
  }
  function loseHat() {
    g.hatOn = false; const b = boatPos();
    g.items.push({ k: 'cloth', x: b.x + CREW[0].dx * 200 * g.bs, y: b.y - 80 * g.bs, vx: (Math.random() < .5 ? -1 : 1) * 110, rot: 0, spin: 5, ph: 0, got: false });
    fx.text(b.x, b.y - 120 * g.bs, 'Peter’s headcloth!', '#fff', 22);
  }
  function spawnItem() {
    const k = run.lv === 0 ? (Math.random() < .5 ? 'fish' : 'net') : ['net', 'fish', 'net', 'basket'][Math.floor(Math.random() * 4)];
    if (g.hatOn && run.lv > 0 && Math.random() < .25) { loseHat(); return; }
    const d = Math.random() < .5 ? 1 : -1;
    g.items.push({ k, x: d > 0 ? -30 : v.W + 30, y: v.H * (.2 + Math.random() * .25), vx: d * (110 + Math.random() * 80 + g.S * 40), rot: 0, spin: (Math.random() - .5) * 6, ph: Math.random() * 6, got: false });
  }
  function lightning() {
    g.flash = 1; F.sfx.thunder(); fx.shake(6); g.oops = .6;
    const x0 = v.W * (.15 + Math.random() * .7); const pts = [[x0, 0]]; let x = x0, y = 0;
    while (y < g.base - 40) { x += (Math.random() - .5) * 60; y += 30 + Math.random() * 30; pts.push([x, y]); }
    g.bolt = { pts, t: .25 };
  }
  function levelDone() {
    const stars = (g.maxW < .45 ? 1 : 0) + (g.lurch <= 2 ? 1 : 0) + 1;
    const bonus = Math.round((1 - g.maxW) * 200) + 100;
    add(bonus); run.stars[run.lv] = stars; g.lvStars = stars; g.bonus = bonus;
    F.sfx.good();
    if (run.lv < 2) { g.st = 'done'; }
    else { g.st = 'finale'; g.items = []; g.gull = null; g.warn = null; F.sfx.thunder(); }
  }
  function next() { run.lv++; play(); }

  /* ---------- drawing ---------- */
  function draw() {
    const cx = v.cx, W = v.W, H = v.H, S = Math.min(1.2, g.S), t = g.t;
    v.reset(); cx.save(); fx.pre(cx);
    // sky
    const calmGlow = g.st === 'calmed' ? Math.min(1, g.calmT / 2.5) : 0;
    const sk = cx.createLinearGradient(0, 0, 0, g.base);
    sk.addColorStop(0, calmGlow ? mix(mix('#7EC8F5', '#1C2340', S), '#8FD0FF', calmGlow) : mix('#7EC8F5', '#1C2340', S));
    sk.addColorStop(1, calmGlow ? mix(mix('#FFE7B0', '#4A5578', S), '#FFE7B0', calmGlow) : mix('#FFE7B0', '#4A5578', S));
    cx.fillStyle = sk; cx.fillRect(-20, -20, W + 40, H + 40);
    if (calmGlow) { // sunlight breaking through
      cx.save(); cx.globalAlpha = calmGlow * .5; cx.fillStyle = '#FFF3C4';
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .28; cx.beginPath(); cx.moveTo(W * .5, -10); cx.lineTo(W * .5 + Math.cos(a - .06) * H * 1.4, -10 + Math.sin(a - .06) * -H); cx.lineTo(W * .5 + Math.cos(a + .06) * H * 1.4, -10 + Math.sin(a + .06) * -H); cx.fill(); }
      cx.globalAlpha = calmGlow; cx.beginPath(); cx.arc(W * .5, H * .1, 34, 0, 7); cx.fillStyle = '#FFE58A'; cx.fill(); cx.restore();
    }
    // clouds
    for (let i = 0; i < 6; i++) {
      const cxp = ((i * 173 + t * (12 + S * 40)) % (W + 300)) - 150, cy = 30 + (i % 3) * 38;
      cx.globalAlpha = .85 - calmGlow * .7; cx.fillStyle = mix('#FFFFFF', '#3A4260', S);
      for (const [dx, dy, r] of [[0, 0, 34], [36, -12, 40], [76, 0, 32], [40, 14, 30]]) { cx.beginPath(); cx.arc(cxp + dx, cy + dy, r, 0, 7); cx.fill(); }
    }
    cx.globalAlpha = 1;
    // lightning
    if (g.bolt) { g.bolt.t -= 1 / 60; cx.strokeStyle = '#FFF8C4'; cx.lineWidth = 5; cx.beginPath(); g.bolt.pts.forEach(([x, y], i) => (i ? cx.lineTo(x, y) : cx.moveTo(x, y))); cx.stroke(); if (g.bolt.t <= 0) g.bolt = null; }
    // back sea
    cx.beginPath(); cx.moveTo(-10, H);
    for (let x = -10; x <= W + 10; x += 10) cx.lineTo(x, g.base - 26 + amp() * .45 * Math.sin(x * .011 + t * .9 + 1));
    cx.lineTo(W + 10, H); cx.closePath(); cx.fillStyle = mix(mix('#3E8ED8', '#1D3A66', S), '#4FA0E6', calmGlow); cx.fill();
    // rain (behind boat)
    if (S > .3 && g.st !== 'calmed') {
      cx.strokeStyle = 'rgba(210,225,255,.45)'; cx.lineWidth = 2; cx.beginPath();
      const n = Math.round(70 * S);
      for (let i = 0; i < n; i++) { const x = ((i * 97.3 + t * 140) % (W + 80)) - 40, y = ((i * 53.7 + t * 620) % (H + 40)) - 20; cx.moveTo(x, y); cx.lineTo(x - 8 - S * 6, y + 18); }
      cx.stroke();
    }
    drawBoat(cx);
    // front sea
    cx.beginPath(); cx.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 10; x += 8) cx.lineTo(x, surf(x, t) + 18);
    cx.lineTo(W + 10, H + 10); cx.closePath();
    const sg = cx.createLinearGradient(0, g.base - 40, 0, H); sg.addColorStop(0, mix(mix('#4FA0E6', '#234E86', S), '#5DB1F0', calmGlow)); sg.addColorStop(1, mix(mix('#1F55D6', '#0E2448', S), '#2A6FD9', calmGlow));
    cx.fillStyle = sg; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    // foam on the crests
    if (S > .35) {
      cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 3;
      for (let x = 10; x < W; x += 46) { const y = surf(x, t) + 18; if (surf(x - 6, t) > surf(x, t) && surf(x + 6, t) > surf(x, t)) { cx.beginPath(); cx.arc(x, y + 6, 9, Math.PI * 1.1, Math.PI * 1.9); cx.stroke(); } }
    }
    // flying things and the seagull
    for (const it of g.items) drawItem(cx, it);
    if (g.gull) drawGull(cx, g.gull);
    fx.draw(cx);
    cx.restore();
    if (g.flash > 0) { cx.fillStyle = `rgba(255,255,240,${g.flash * .55})`; cx.fillRect(0, 0, W, H); }
    drawHud(cx);
  }

  function drawBoat(cx) {
    const b = boatPos(), s = g.bs, a = g.th + slopeAt(b.x) * .6;
    cx.save(); cx.translate(b.x, b.y); cx.rotate(a); cx.scale(s, s);
    cx.lineWidth = 3; cx.strokeStyle = ink;
    // mast and sail
    cx.beginPath(); cx.moveTo(18, -6); cx.lineTo(18, -168); cx.lineWidth = 6; cx.stroke(); cx.lineWidth = 3;
    const flap = Math.sin(g.t * (4 + g.S * 6)) * (6 + g.S * 10);
    cx.beginPath(); cx.moveTo(22, -160); cx.quadraticCurveTo(70 + flap, -110, 96, -42); cx.lineTo(22, -42); cx.closePath(); cx.fillStyle = '#F7EFDF'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.moveTo(22, -100); cx.quadraticCurveTo(52 + flap * .6, -92, 66, -72); cx.strokeStyle = 'rgba(19,32,58,.25)'; cx.stroke(); cx.strokeStyle = ink;
    // inside of the hull
    cx.beginPath(); cx.moveTo(-118, -14); cx.lineTo(118, -14); cx.lineTo(108, 6); cx.lineTo(-108, 6); cx.closePath(); cx.fillStyle = '#6B4220'; cx.fill();
    // water inside the boat
    if (g.water > .01) { const wy = 6 - g.water * 24; cx.fillStyle = 'rgba(93,169,240,.85)'; cx.fillRect(-106, wy, 212, 6 - wy); cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.beginPath(); for (let x = -104; x < 104; x += 12) cx.lineTo(x, wy + Math.sin(x * .3 + g.t * 8) * 1.5); cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = ink; }
    // crew
    const scared = g.st === 'play' || g.st === 'finale' || g.st === 'sunk', amazed = g.st === 'speak' || g.st === 'calmed';
    CREW.forEach((c, i) => {
      const bailer = i === 1 && g.bailAnim > 0;
      const mood = amazed ? 'wow' : g.happy > 0 ? 'happy' : g.oops > 0 ? 'oops' : scared && g.S > .5 ? 'worried' : 'happy';
      const sway = Math.sin(g.t * 2.2 + i) * .06 - a * .5;
      F.person(cx, Object.assign({}, c, {
        x: c.dx * 200, y: 2, s: .76, sit: true, mood, blink: F.blink(g.t, i + 1), lean: sway,
        head: i === 0 && !g.hatOn ? null : c.head,
        armL: amazed ? -2.3 - Math.sin(g.t * 3 + i) * .15 : scared ? .9 + Math.sin(g.t * 3 + i) * .1 : .3,
        armR: bailer ? 2.3 + Math.sin(g.bailAnim * 18) * .4 : amazed ? 2.3 + Math.sin(g.t * 3 + i) * .15 : scared ? .7 : .2
      }));
    });
    // Jesus
    if (g.jesus === 'sleep') {
      // asleep on a pillow in the back of the boat (Mark 4:38)
      cx.beginPath(); cx.ellipse(-104, -30, 17, 10, -.15, 0, 7); cx.fillStyle = '#E8DCC6'; cx.fill(); cx.stroke();
      cx.save(); cx.translate(-36, -26); cx.rotate(-Math.PI / 2 + .1);
      F.person(cx, Object.assign({}, JESUS, { x: 0, y: 0, s: .72, mood: 'sleepy', armL: .25, armR: .1, bounce: Math.sin(g.t * 1.6) * 1.2 }));
      cx.restore();
      // z z z
      const zt = g.zz % 2.4;
      for (let k = 0; k < 3; k++) { const p = (zt + k * .8) % 2.4; cx.globalAlpha = Math.max(0, 1 - p / 2.4); F.say(cx, 'z', -112 + p * 16, -60 - p * 30, { size: 18 + k * 4, col: '#fff' }); }
      cx.globalAlpha = 1;
      if (g.st === 'finale') { // glowing "tap me" ring
        const pr = 1 + Math.sin(g.t * 6) * .08; cx.beginPath(); cx.arc(-80, -30, 56 * pr, 0, 7); cx.strokeStyle = '#FFD447'; cx.lineWidth = 5; cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = ink;
      }
    } else {
      F.person(cx, Object.assign({}, JESUS, { x: -70, y: -10, s: .82, mood: 'calm', blink: F.blink(g.t, 9), armL: .3, armR: g.st === 'speak' || g.st === 'calmed' ? 2.5 : .2 }));
    }
    // outside of the hull
    cx.beginPath(); cx.moveTo(-128, -18); cx.quadraticCurveTo(-120, 30, -70, 36); cx.lineTo(70, 36); cx.quadraticCurveTo(120, 30, 132, -22); cx.lineTo(118, -14); cx.lineTo(-118, -14); cx.closePath();
    cx.fillStyle = '#A0612D'; cx.fill(); cx.stroke();
    cx.strokeStyle = 'rgba(19,32,58,.35)'; cx.lineWidth = 2;
    for (const y of [0, 14, 26]) { cx.beginPath(); cx.moveTo(-118 + (y > 14 ? 22 : 6), y); cx.lineTo(118 - (y > 14 ? 22 : 6), y); cx.stroke(); }
    cx.strokeStyle = ink; cx.lineWidth = 3;
    cx.beginPath(); cx.moveTo(-128, -18); cx.lineTo(132, -22); cx.lineWidth = 6; cx.strokeStyle = '#6B4220'; cx.stroke();
    cx.restore();
  }
  function drawItem(cx, it) {
    cx.save(); cx.translate(it.x, it.y); cx.rotate(it.rot); cx.lineWidth = 3; cx.strokeStyle = ink;
    if (it.k === 'fish') {
      cx.beginPath(); cx.ellipse(0, 0, 20, 10, 0, 0, 7); cx.fillStyle = '#8FD0FF'; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(18, 0); cx.lineTo(30, -9); cx.lineTo(30, 9); cx.closePath(); cx.fill(); cx.stroke();
      cx.beginPath(); cx.arc(-10, -2, 2.4, 0, 7); cx.fillStyle = ink; cx.fill();
    } else if (it.k === 'net') {
      cx.beginPath(); cx.arc(0, 0, 22, 0, 7); cx.fillStyle = 'rgba(232,220,198,.85)'; cx.fill(); cx.stroke();
      cx.strokeStyle = '#8B6B42'; cx.lineWidth = 2; for (let k = -16; k <= 16; k += 8) { cx.beginPath(); cx.moveTo(k, -20); cx.lineTo(k, 20); cx.moveTo(-20, k); cx.lineTo(20, k); cx.stroke(); }
    } else if (it.k === 'basket') {
      cx.beginPath(); cx.moveTo(-18, -8); cx.lineTo(18, -8); cx.lineTo(13, 14); cx.lineTo(-13, 14); cx.closePath(); cx.fillStyle = '#C68A4B'; cx.fill(); cx.stroke();
      cx.beginPath(); cx.arc(0, -8, 14, Math.PI, 0); cx.stroke();
    } else { // Peter's headcloth
      cx.beginPath(); cx.moveTo(-22, 10); cx.quadraticCurveTo(-24, -22, 0, -22); cx.quadraticCurveTo(24, -22, 22, 10); cx.quadraticCurveTo(0, 0, -22, 10); cx.fillStyle = '#E8DCC6'; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-18, -8); cx.quadraticCurveTo(0, -14, 18, -8); cx.strokeStyle = '#C0392B'; cx.lineWidth = 4; cx.stroke();
    }
    cx.restore();
    // a little glow so children see it can be caught
    cx.beginPath(); cx.arc(it.x, it.y, 30 + Math.sin(g.t * 8) * 3, 0, 7); cx.strokeStyle = 'rgba(255,228,138,.6)'; cx.lineWidth = 3; cx.stroke();
  }
  function drawGull(cx, gl) {
    cx.save(); cx.translate(gl.x, gl.y); cx.scale(gl.d, 1); cx.lineWidth = 3; cx.strokeStyle = ink;
    const fl = Math.sin(g.t * 12) * 12;
    cx.beginPath(); cx.moveTo(-6, 0); cx.quadraticCurveTo(-20, -10 - fl, -36, -4 - fl); cx.moveTo(6, 0); cx.quadraticCurveTo(20, -10 - fl, 36, -4 - fl); cx.stroke();
    cx.beginPath(); cx.ellipse(0, 2, 14, 8, 0, 0, 7); cx.fillStyle = '#fff'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.arc(12, -2, 6, 0, 7); cx.fill(); cx.stroke();
    cx.beginPath(); cx.moveTo(17, -2); cx.lineTo(25, 0); cx.lineTo(17, 2); cx.fillStyle = '#F2A007'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.arc(13, -4, 1.5, 0, 7); cx.fillStyle = ink; cx.fill();
    if (!gl.dropped) { cx.beginPath(); cx.ellipse(22, 8, 9, 4, .3, 0, 7); cx.fillStyle = '#8FD0FF'; cx.fill(); cx.stroke(); }
    cx.restore();
  }
  function drawHud(cx) {
    const W = v.W, H = v.H;
    // progress
    const pw = Math.min(W - 32, 520), px = (W - pw) / 2;
    F.rr(cx, px, 12, pw, 20, 10); cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    const pr = Math.min(1, g.dist / g.len); if (pr > 0) { F.rr(cx, px + 2, 14, Math.max(16, (pw - 4) * pr), 16, 8); cx.fillStyle = '#FFD447'; cx.fill(); }
    cx.font = F.font(13); cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(`Stretch ${run.lv + 1} of 3 · ${LV[run.lv].name}`, W / 2, 23);
    // water meter + score
    const mw = Math.min(170, W * .38);
    F.rr(cx, 16, 40, mw, 18, 9); cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fill(); cx.stroke();
    if (g.water > 0) { F.rr(cx, 18, 42, Math.max(14, (mw - 4) * Math.min(1, g.water)), 14, 7); cx.fillStyle = g.water > .7 ? '#F0485C' : '#5DA9F0'; cx.fill(); }
    cx.font = F.font(12); cx.fillStyle = ink; cx.textAlign = 'center'; cx.fillText(g.water > .7 ? 'Bail! Bail!' : 'Water in the boat', 16 + mw / 2, 49);
    F.pill(cx, W - 16 - 96, 38, 96, 24, '#FFF3C4', `★ ${run.score}`, { size: 14 });
    if (g.st === 'play') {
      // lean buttons, glowing on the side to lean when a big wave is coming
      const need = g.warn ? -g.warn.dir : 0, glow = 1 + Math.sin(g.t * 14) * .5;
      g.bL.down = !!g.inL; g.bR.down = !!g.inR;
      F.button(cx, g.bL, '◀', { fill: need < 0 ? `rgba(255,${Math.round(180 + 40 * glow)},70,1)` : '#5DA9F0' });
      F.button(cx, g.bR, '▶', { fill: need > 0 ? `rgba(255,${Math.round(180 + 40 * glow)},70,1)` : '#5DA9F0' });
      if (g.warn) { const x = g.warn.dir < 0 ? 60 : W - 60; F.say(cx, '⚠ Big wave!', W / 2, 92, { size: 26, col: '#FFD447' }); F.say(cx, g.warn.dir < 0 ? '▶' : '◀', x, H * .45, { size: 54, col: '#FFD447' }); }
      if (Math.abs(g.th) > run.C.warn) F.say(cx, 'Steady!', W / 2, g.base - 150 * g.bs, { size: 24, col: '#FF8FA3' });
      if (g.t < 6 && run.lv === 0) F.say(cx, 'Tap the boat to bail · Hold ◀ ▶ to lean', W / 2, g.bL.y - g.bL.r - 22, { size: Math.min(18, W / 24) });
    }
    if (g.st === 'intro') card(cx, `Stretch ${run.lv + 1}: ${LV[run.lv].name}`, LV[run.lv].tip, 'Tap to sail!');
    if (g.st === 'done') card(cx, 'Safe through the waves!', [`${'★'.repeat(g.lvStars)}${'☆'.repeat(3 - g.lvStars)}`, `Things caught: ${g.caughtLv} · Bonus +${g.bonus}`], 'Tap for the next stretch');
    if (g.st === 'sunk') card(cx, 'Too much water!', ['The boat filled up. Keep tapping the boat', 'to bail the water out. Try again!'], 'Tap to try again');
    if (g.st === 'finale') {
      const j = jesusPos();
      F.bubble(cx, Math.min(W - 40, Math.max(40, W / 2)), g.base - 175 * g.bs, '“Master, carest thou not that we perish?”', { size: Math.min(18, W / 24), W });
      F.say(cx, `Tap Jesus to wake Him! (${g.wakeTaps}/3)`, W / 2, H - 30, { size: Math.min(24, W / 18), col: '#FFD447' });
      void j;
    }
    if (g.st === 'speak' || g.st === 'calmed') {
      const j = jesusPos();
      F.bubble(cx, Math.max(60, Math.min(W - 60, j.x)), j.y - 52 * g.bs, '“Peace, be still.”', { size: 22, W, fill: '#FFF3C4' });
    }
    if (g.st === 'calmed' && g.calmT > 1.4) {
      cx.globalAlpha = Math.min(1, (g.calmT - 1.4) * 1.5);
      F.say(cx, 'And there was a great calm.', W / 2, g.base + 80, { size: Math.min(30, W / 13), col: '#fff' });
      F.say(cx, 'Mark 4:39', W / 2, g.base + 112, { size: 17, col: '#FFE58A' });
      if (g.calmT > 2.5) F.say(cx, 'Tap to continue', W / 2, H - 30, { size: 22, col: '#FFD447' });
      cx.globalAlpha = 1;
    }
  }
  function card(cx, title, lines, go) {
    const W = v.W, H = v.H, w = Math.min(W - 30, 460), h = 96 + lines.length * 28 + 40, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.fillStyle = 'rgba(10,16,40,.35)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, title, W / 2, y + 36, { size: Math.min(28, w / 15), col: '#FFD447' });
    cx.font = '800 ' + Math.min(17, w / 24) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center';
    lines.forEach((l, i) => cx.fillText(l, W / 2, y + 76 + i * 28));
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2, y + h - 30); cx.scale(pulse, pulse); F.pill(cx, -110, -20, 220, 40, '#14946B', '', {}); F.say(cx, go, 0, 1, { size: 18 }); cx.restore();
  }

  /* ---------- the end ---------- */
  function finish() {
    const diff = run.diff, avg = Math.round(run.stars.reduce((a, b) => a + b, 0) / run.stars.length);
    const best = storeJSON('calm-best') || {}, prev = best[diff] || 0;
    if (run.score > prev) { best[diff] = run.score; storeJSON('calm-best', best); }
    const badges = [];
    if (run.lurches === 0) badges.push('Steady Sailor');
    if (run.caught >= 8) badges.push('Great Catcher');
    if (avg === 3) badges.push('Storm Champion');
    stop();
    Ark.finish(el, {
      id: ID, diff, stars: Math.max(1, avg), title: 'Even the wind and the sea obey Him!',
      html: `<p class="story">Score: <b>${run.score}</b>${run.score > prev && prev ? ' · <b>New best!</b>' : ''} · Things caught: ${run.caught}</p>
        ${badges.length ? `<p class="story">${badges.map(b => `🏅 ${b}`).join(' &nbsp; ')}</p>` : ''}`,
      verse: ['And he arose, and rebuked the wind, and said unto the sea, Peace, be still. And the wind ceased, and there was a great calm.', 'Mark 4:39 (KJV)'],
      lesson: 'The disciples were afraid, but Jesus was in the boat with them the whole time. When you feel scared, you can talk to Jesus. He is bigger than any storm.',
      again: () => { run = { ...run, lv: 0, score: 0, stars: [], caught: 0, lurches: 0 }; play(); }, menu,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-' + ID, d); run = { diff: d, C: D[d], lv: 0, score: 0, stars: [], caught: 0, lurches: 0 }; play(); }] : null
    });
  }

  function stop() {
    if (L) L.stop(); L = null;
    if (v) v.destroy(); v = null;
    if (g && g.onKey) { removeEventListener('keydown', g.onKey); removeEventListener('keyup', g.onKey); }
    g = null;
  }

  Ark.games[ID] = {
    mount(stage) { el = stage; menu(); },
    unmount() { stop(); hush(); },
    _test: { state: () => g, run: () => run, tap: p => tap(p), win: () => { if (g) g.dist = g.len; }, step: dt => step(dt) }
  };
})();
