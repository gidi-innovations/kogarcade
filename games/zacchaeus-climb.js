/* Zacchaeus Climbs Up (Luke 19:1–10). An endless climb.
   Zacchaeus was too short to see Jesus over the crowd, so he climbed a sycamore tree. He bounces by himself and you
   steer. There is no top: the higher you go, the more points you get, and the tree gets trickier. Fall and you are out!
   Then Jesus calls him down by name, and Zacchaeus makes things right (Luke 19:8). */
(() => {
  const { store, storeJSON, say, hush } = Ark;
  const F = Ark.fun, ink = '#13203A';
  const ID = 'zacchaeus-climb';
  const PXM = 40; // pixels per metre
  /* everything gets harder as you climb: k goes from 0 at the ground to 1 at "ramp" pixels up */
  const D = {
    easy: { gap: [95, 130], gapMax: 168, crack: [0, .14], moss: [0, .1], leafy: .1, bird: [1100, 520], ramp: 9000, give: 22, stars: [20, 50] },
    normal: { gap: [105, 145], gapMax: 182, crack: [.04, .24], moss: [.04, .15], leafy: .09, bird: [800, 380], ramp: 7000, give: 20, stars: [30, 75] },
    hard: { gap: [115, 160], gapMax: 194, crack: [.08, .32], moss: [.08, .2], leafy: .08, bird: [560, 280], ramp: 5500, give: 18, stars: [40, 100] }
  };
  const TIPS = ['Zacchaeus is too short to see Jesus!', 'He bounces by himself. Hold left or right to steer.', 'There is no top: the higher, the more points!', 'But if you fall off the screen, you’re out!'];
  const ZONES = [[10, 'Up in the branches!'], [25, 'Higher than the rooftops!'], [50, 'Where the birds live!'], [80, 'Into the clouds!'], [120, 'Touching the sky!'], [175, 'Super climber!'], [250, 'Amazing! Keep going!']];
  const ZAC = { skin: '#A8714A', robe: '#7A3E9D', trim: '#FFD447', hair: '#2B1B12', beard: '#2B1B12', head: 'cloth', headCol: '#F2B632', band: '#7A3E9D' };
  const JESUS = { skin: '#A06A45', robe: '#F4F1EA', trim: '#C0392B', hair: '#4A2E1C', beard: '#4A2E1C', belt: '#C0392B' };

  let el, v = null, L = null, fx = null, g = null, run = null;
  const newRun = d => ({ diff: d, C: D[d], score: 0, figs: 0, m: 0, tries: 0 });

  function menu() {
    stop();
    const best = storeJSON('zac-best-m') || {};
    Ark.menu(el, {
      id: ID, title: 'Zacchaeus Climbs Up', icon: 'sycamore', color: '#2E9E4F',
      blurb: 'Zacchaeus is too short to see Jesus! How high can you bounce up the sycamore tree?',
      how: [['arrows', 'Hold left or right to steer'], ['jump', 'Climb as high as you can'], ['heart', 'Don’t fall, or you’re out!']],
      listen: 'Zacchaeus bounces by himself. Hold the left or right side of the screen to steer him. There is no top: the higher you climb, the more points you get. If you fall off the screen, you are out!',
      diffs: { easy: 'Wide branches that get trickier slowly.', normal: 'Snapping branches, slippery moss and cheeky birds.', hard: 'Big gaps and lots of birds. Only for brave climbers!' },
      extra: Object.keys(best).length ? `<p style="margin:0;text-align:center;font-weight:800;color:var(--muted)">Highest climb: ${Ark.DIFFS.filter(d => best[d]).map(d => `${Ark.DLABEL[d]} ${best[d]} m`).join(' · ')}</p>` : '',
      start: d => { run = newRun(d); play(); }
    });
  }

  /* ---------- the tree grows as you climb ---------- */
  function gen() {
    const C = run.C, y = g.genY, k = Math.min(1, -y / C.ramp), n = g.genN++;
    const crack = C.crack[0] + (C.crack[1] - C.crack[0]) * k, moss = C.moss[0] + (C.moss[1] - C.moss[0]) * k;
    const r = Math.random(), w = (70 + Math.random() * 70) * (1 - .3 * k);
    const early = y > -500; // the first few branches are always safe
    const type = early ? 'ok' : r < crack ? 'crack' : r < crack + moss ? 'moss' : r < crack + moss + C.leafy ? 'leafy' : 'ok';
    const knot = n % 7 === 6;
    const side = g.genSide; g.genSide = -side;
    g.br.push({ y, side: knot ? 0 : side, w: knot ? 50 : w, type: knot ? 'ok' : type, broken: false, fall: 0 });
    if (Math.random() < .55) g.figs.push({ y: y - 50 - Math.random() * 30, side, f: .4 + Math.random() * .5, gold: Math.random() < .12, got: false });
    // birds come more often the higher you go
    const every = C.bird[0] + (C.bird[1] - C.bird[0]) * k;
    if (!early && -y - g.lastBird > every) { g.lastBird = -y; g.birds.push({ y: y - 60, x: Math.random(), d: Math.random() < .5 ? 1 : -1, sp: 90 + Math.random() * 60 + 80 * k, bump: 0 }); }
    // after a mossy (small bounce) branch the next one is always close enough to reach
    const g0 = C.gap[0], g1 = C.gap[1] + (C.gapMax - C.gap[1]) * k;
    g.genY -= type === 'moss' && !knot ? g0 : g0 + Math.random() * (g1 - g0);
  }
  function grow() {
    while (g.genY > g.cam - 300) gen();
    const lim = g.cam + v.H + 300;
    if (g.br.length > 60) { g.br = g.br.filter(b => b.y < lim); g.figs = g.figs.filter(f => f.y < lim); g.birds = g.birds.filter(b => b.y < lim); }
  }

  function play() {
    stop();
    el.innerHTML = '<div id="zcHost"></div>';
    v = F.view(el.querySelector('#zcHost'), { h: 640, minA: .5, maxA: 2, label: 'Zacchaeus climbing a sycamore tree. Hold left or right to steer.' });
    fx = F.fx();
    g = {
      st: 'intro', t: 0, br: [], figs: [], birds: [], genY: -120, genN: 0, genSide: Math.random() < .5 ? -1 : 1, lastBird: 0,
      x: 0, y: 0, vx: 0, vy: 0, inL: 0, inR: 0, cam: 0, best: 0, m: 0, zone: 0, newBest: false,
      pts: 0, figsLv: 0, face: 'happy', faceT: 0, flip: false, slide: 0, people: null, giveT: 0, coins: [], btns: []
    };
    g.prevBest = (storeJSON('zac-best-m') || {})[run.diff] || 0;
    layout(); v.onfit = layout;
    g.cam = g.y - v.H * .72;
    grow();
    bind();
    L = F.loop(step);
    Ark.ctl({
      help: () => say(TIPS.join(' '), true),
      pause: () => L && L.pause(), resume: () => L && L.resume(),
      restart: () => { run = newRun(run.diff); play(); }
    });
  }
  function layout() { if (!g) return; g.PF = Math.min(v.W - 16, 480); g.PL = (v.W - g.PF) / 2; g.TX = v.W / 2; }
  const bx = b => b.side === 0 ? [g.TX - b.w / 2, g.TX + b.w / 2] : b.side < 0 ? [g.TX - 18 - b.w, g.TX] : [g.TX, g.TX + 18 + b.w];
  const figX = f => g.TX + f.side * (18 + f.f * 110);

  function bind() {
    const cv = v.cv;
    const side = e => (v.pt(e).x < v.W / 2 ? 'inL' : 'inR');
    const ptrs = {};
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      if (!g) return;
      const p = v.pt(e);
      if (g.st === 'play') { const k = side(e); ptrs[e.pointerId] = k; g[k] = 1; return; }
      tap(p);
    });
    cv.addEventListener('pointermove', e => { if (!g || !ptrs[e.pointerId]) return; const k = side(e); if (k !== ptrs[e.pointerId]) { g[ptrs[e.pointerId]] = 0; g[k] = 1; ptrs[e.pointerId] = k; } });
    const up = e => { if (g && ptrs[e.pointerId]) { g[ptrs[e.pointerId]] = 0; delete ptrs[e.pointerId]; } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    g.onKey = e => {
      if (!g) return; const on = e.type === 'keydown';
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { g.inL = on ? 1 : 0; e.preventDefault(); }
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) { g.inR = on ? 1 : 0; e.preventDefault(); }
      else if ((e.key === ' ' || e.key === 'Enter') && on && !e.repeat) { e.preventDefault(); if (g.st !== 'play') tap({ x: v.W / 2, y: v.H / 2, key: true }); }
    };
    addEventListener('keydown', g.onKey); addEventListener('keyup', g.onKey);
  }
  function tap(p) {
    if (g.st === 'intro') { g.st = 'play'; g.vy = -820; F.sfx.jump(); return; }
    if (g.st === 'out') {
      if (g.outT < .7) return;
      const b = p.key ? g.btns[0] : g.btns.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
      if (!b) return;
      if (b.k === 'again') { run.tries++; run.score = 0; play(); } else meetJesus();
      return;
    }
    if (g.st === 'called' && g.calledT > 1.2) { g.st = 'slide'; g.slide = 0; F.sfx.whoosh(); return; }
    if (g.st === 'giveIntro') { g.st = 'give'; g.giveT = run.C.give; return; }
    if (g.st === 'give') { give(p); return; }
    if (g.st === 'gaveAll' && g.endT > 1.5) { finish(); return; }
  }

  /* ---------- update ---------- */
  function step(dt) {
    if (!g) return;
    g.t += dt; fx.update(dt); g.faceT -= dt;
    if (g.st === 'play') physics(dt);
    else if (g.st === 'out') g.outT += dt;
    else if (g.st === 'called') g.calledT += dt;
    else if (g.st === 'slide') { g.slide += dt; g.y = g.top + (0 - g.top) * Math.min(1, g.slide / 1.6) ** 2; g.x = 0; if (Math.random() < .6) fx.burst(g.TX, g.y - g.cam - 40, 2, ['#6FCB5C', '#3FA34D'], { speed: 80, size: 5 }); if (g.slide > 1.9) startGive(); }
    else if (g.st === 'give') { g.giveT -= dt; for (const c of g.coins) { c.t += dt * 2.4; } g.coins = g.coins.filter(c => c.t < 1 || (coinLand(c), false)); if (g.giveT <= 0 || g.people.every(p => p.got >= p.need)) endGive(); }
    else if (g.st === 'gaveAll') { g.endT += dt; }
    // the camera follows Zacchaeus up, and never drops below the ground
    if (g.st === 'play' || g.st === 'slide' || g.st === 'called') {
      const want = g.y - v.H * (g.st === 'slide' ? .6 : .62);
      g.cam += (Math.min(want, g.cam) - g.cam) * Math.min(1, dt * 6);
      if (g.st === 'slide') g.cam = Math.min(0 - v.H * .82 + 40, g.cam + (want - g.cam) * Math.min(1, dt * 8));
      g.cam = Math.min(g.cam, -v.H * .82 + 40);
      if (g.st === 'called') g.cam += (g.top - v.H * .5 - g.cam) * Math.min(1, dt * 2);
    }
    draw();
  }
  function physics(dt) {
    const inp = (g.inR ? 1 : 0) - (g.inL ? 1 : 0);
    g.vx += (inp * 330 - g.vx) * Math.min(1, dt * 9);
    if (inp) g.flip = inp < 0;
    const prevY = g.y;
    g.vy += 1500 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
    const half = g.PF / 2 - 16; if (g.x < -half) { g.x = -half; g.vx = 0; } if (g.x > half) { g.x = half; g.vx = 0; }
    const px = g.TX + g.x;
    // landing on branches (only when falling)
    if (g.vy > 0) {
      if (prevY <= 0 && g.y >= 0) { bounce(-820, 'ground'); g.y = 0; }
      for (const b of g.br) {
        if (b.broken) continue;
        if (prevY <= b.y && g.y >= b.y) { const [a, c] = bx(b); if (px >= a - 12 && px <= c + 12) { g.y = b.y; land(b); break; } }
      }
    }
    for (const b of g.br) if (b.broken) { b.fall += dt; b.y += 400 * dt * b.fall * 3; }
    grow();
    // figs
    for (const f of g.figs) if (!f.got && Math.abs(figX(f) - px) < 26 && Math.abs(f.y - (g.y - 34)) < 36) {
      f.got = true; const pts = f.gold ? 50 : 10; add(pts); run.figs++; g.figsLv++;
      fx.burst(figX(f), f.y - g.cam, 10, f.gold ? ['#FFD447', '#fff'] : ['#C76A97', '#FFD0E4'], { speed: 140, g: 0, life: .5 });
      fx.text(figX(f), f.y - g.cam - 16, '+' + pts, f.gold ? '#FFD447' : '#fff', 20); F.sfx.coin();
    }
    // birds
    for (const bd of g.birds) {
      bd.x += bd.d * bd.sp * dt / g.PF; if (bd.x > 1.1) bd.d = -1; if (bd.x < -.1) bd.d = 1;
      bd.bump -= dt;
      const bxp = g.PL + bd.x * g.PF;
      if (bd.bump <= 0 && Math.abs(bxp - px) < 30 && Math.abs(bd.y - (g.y - 40)) < 34) { bd.bump = 1; g.vx = bd.d * 420; g.vy = Math.max(g.vy, 120); g.face = 'oops'; g.faceT = .8; F.tone(1500, .1, { type: 'square', vol: .03, lp: 2600 }); fx.text(px, g.y - g.cam - 90, 'Tweet!', '#fff', 20); }
    }
    g.best = Math.min(g.best, g.y);
    // height: 10 points for every new metre
    const m = Math.max(0, Math.floor(-g.best / PXM));
    if (m > g.m) {
      add((m - g.m) * 10); g.m = m;
      const z = ZONES[g.zone];
      if (m % 10 === 0 && !(z && m >= z[0])) { fx.text(v.W / 2, v.H * .26, `${m} m!`, '#FFE58A', 30); F.sfx.good(); }
      if (z && m >= z[0]) { g.zone++; g.banner = { s: `${z[0]} m! ${z[1]}`, t: 0 }; F.sfx.cheer(); fx.burst(v.W / 2, v.H * .3, 24, ['#FFD447', '#fff', '#8FD0FF', '#FF8FA3'], { speed: 240, g: 60, life: .9 }); }
      if (!g.newBest && g.prevBest && m > g.prevBest) { g.newBest = true; fx.text(v.W / 2, v.H * .4, 'New best height!', '#FF8FA3', 28); F.sfx.win(); }
    }
    if (g.banner) g.banner.t += dt;
    // fell off the bottom of the screen: out!
    if (g.y - g.cam > v.H + 60) fell();
  }
  function land(b) {
    const v0 = b.type === 'leafy' ? -1180 : b.type === 'moss' ? -720 : -820;
    bounce(v0, b.type);
    if (b.type === 'crack') { b.broken = true; F.tone(140, .2, { type: 'square', vol: .05, lp: 600 }); fx.text(g.TX + g.x, b.y - g.cam - 20, 'Snap!', '#FFB347', 20); }
    if (b.type === 'moss') { fx.text(g.TX + g.x, b.y - g.cam - 20, 'Slippery!', '#9FE8B0', 18); }
    if (b.type === 'leafy') { fx.text(g.TX + g.x, b.y - g.cam - 20, 'Boing!', '#FFE58A', 22); F.tone(220, .3, { type: 'triangle', to: 880, vol: .07 }); }
  }
  function bounce(v0, kind) {
    g.vy = v0; if (kind !== 'leafy') F.sfx.jump();
    if (g.faceT <= 0) g.face = 'happy';
    fx.burst(g.TX + g.x, g.y - g.cam, 6, ['#6FCB5C', '#3FA34D', '#A7E08A'], { dir: -Math.PI / 2, spread: 2, speed: 120, size: 4, life: .45 });
  }
  function fell() {
    g.st = 'out'; g.outT = 0; F.sfx.oops(); setTimeout(() => F.sfx.crash && g && g.st === 'out' && F.tone(160, .4, { type: 'triangle', to: 60, vol: .08 }), 200);
    fx.shake(10);
    run.m = Math.max(run.m, g.m); run.score = Math.max(run.score, g.pts);
    const best = storeJSON('zac-best-m') || {};
    if (g.m > (best[run.diff] || 0)) { best[run.diff] = g.m; storeJSON('zac-best-m', best); }
    g.hiM = best[run.diff] || g.m;
  }
  /* the story ending: Jesus stops under the tree and calls Zacchaeus by name */
  function meetJesus() {
    run.score = g.pts; run.figs = g.figsLv;
    g.st = 'called'; g.calledT = 0; F.sfx.win();
    g.br = []; g.figs = []; g.birds = []; g.genY = -120; g.genN = 0;
    for (let i = 0; i < 6; i++) gen();
    g.top = g.br[3].y; g.x = 0; g.y = g.top; g.vx = 0; g.vy = 0; g.face = 'wow'; g.faceT = 99;
    g.cam = g.top - v.H * .5;
  }
  const add = p => { g.pts += p; run.score += p; };

  /* ---------- making things right (Luke 19:8) ---------- */
  function startGive() {
    g.st = 'giveIntro';
    const n = v.W < 500 ? 5 : 7;
    g.people = Array.from({ length: n }, (_, i) => ({ i, need: i % 2 ? 4 : 1, got: 0, x: 0, skin: ['#8D5A3B', '#6B4226', '#A8714A', '#7A4B2E', '#5A3A24'][i % 5], robe: ['#14946B', '#1F55D6', '#C0392B', '#F2A007', '#3F6FE0', '#B07AD6', '#2FBF8E'][i % 7], thank: 0 }));
    layoutPeople();
  }
  function layoutPeople() {
    const n = g.people.length, x0 = v.W * .32, x1 = v.W - 40, gap = (x1 - x0) / (n - 1 || 1);
    g.people.forEach((p, k) => { p.x = x0 + k * gap; p.y = v.H * .84 - (k % 2) * 34; });
  }
  function give(p) {
    layoutPeople();
    let best = null, bd = 9e9; if (!p || p.key) return;
    for (const q of g.people) { const d = Math.hypot(q.x - p.x, (q.y - 50) - p.y); if (d < bd) { bd = d; best = q; } }
    if (!best || bd > 90 || best.got >= best.need) return;
    best.got++; add(20); F.sfx.coin();
    g.coins.push({ to: best, t: 0, x0: v.W * .16, y0: v.H * .62 });
  }
  function coinLand(c) {
    const p = c.to; fx.burst(p.x, p.y - 60, 8, ['#FFD447', '#fff'], { speed: 120, g: 0, life: .5 });
    if (p.got >= p.need && !p.thank) { p.thank = 1; add(50); F.sfx.good(); fx.text(p.x, p.y - 120, 'Thank you!', '#FFE58A', 22); }
  }
  function endGive() {
    if (g.st !== 'give') return;
    g.st = 'gaveAll'; g.endT = 0; F.sfx.win();
    const all = g.people.every(p => p.got >= p.need);
    g.gaveAll = all; if (all) add(Math.round(g.giveT * 10));
  }

  /* ---------- drawing ---------- */
  function draw() {
    const cx = v.cx, W = v.W, H = v.H;
    v.reset(); cx.save(); fx.pre(cx);
    if (g.st === 'giveIntro' || g.st === 'give' || g.st === 'gaveAll') { drawTown(cx); cx.restore(); drawGiveHud(cx); return; }
    const cam = g.cam, hm = Math.max(0, -cam / PXM), h01 = Math.min(1, hm / 160);
    // the sky gets deeper blue, then starry, the higher you climb
    const sk = cx.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, mix('#8FD0FF', '#1E2A6E', h01)); sk.addColorStop(1, mix('#FFF1C9', '#7FA8E8', h01));
    cx.fillStyle = sk; cx.fillRect(-20, -20, W + 40, H + 40);
    if (h01 > .45) { cx.fillStyle = `rgba(255,255,255,${Math.min(1, (h01 - .45) * 2.5)})`; for (let i = 0; i < 40; i++) { const sx = (i * 97.3) % W, sy = ((i * 53.7 - cam * .08) % H + H) % H, r = 1 + (i % 3) * .6 + Math.sin(g.t * 3 + i) * .4; cx.beginPath(); cx.arc(sx, sy, r, 0, 7); cx.fill(); } }
    // distant clouds drift (parallax)
    cx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 7; i++) { const y = ((i * 260 - cam * .25) % (H + 200)) - 100, x = (i * 173 + g.t * 8) % (W + 160) - 80; for (const [dx, dy, r] of [[0, 0, 26], [28, -10, 32], [58, 0, 24]]) { cx.beginPath(); cx.arc(x + dx, y + dy, r, 0, 7); cx.fill(); } }
    // Jericho town and the crowd at the bottom
    const gy = 0 - cam;
    if (gy < H + 220) drawGround(cx, gy);
    // the trunk
    const tY = Math.min(H + 20, gy);
    cx.fillStyle = '#8B5A2B'; cx.fillRect(g.TX - 20, -20, 40, tY + 20);
    cx.strokeStyle = ink; cx.lineWidth = 3;
    cx.beginPath(); cx.moveTo(g.TX - 20, -20); cx.lineTo(g.TX - 20, tY); cx.moveTo(g.TX + 20, -20); cx.lineTo(g.TX + 20, tY); cx.stroke();
    cx.strokeStyle = 'rgba(19,32,58,.25)'; cx.lineWidth = 2;
    const tTop = -40; for (let y = ((-cam) % 60) - 60; y < Math.min(H, gy); y += 60) { if (y < tTop) continue; cx.beginPath(); cx.moveTo(g.TX - 10, y); cx.quadraticCurveTo(g.TX, y + 14, g.TX + 8, y + 30); cx.stroke(); }
    // branches
    for (const b of g.br) { const y = b.y - cam; if (y < -60 || y > H + 60) continue; drawBranch(cx, b, y); }
    // figs
    for (const f of g.figs) { if (f.got) continue; const y = f.y - cam; if (y < -30 || y > H + 30) continue; const x = figX(f), bob = Math.sin(g.t * 3 + f.y) * 3;
      cx.beginPath(); cx.arc(x, y + bob, f.gold ? 11 : 9, 0, 7); cx.fillStyle = f.gold ? '#FFD447' : '#B5527A'; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = ink; cx.stroke();
      cx.beginPath(); cx.moveTo(x, y + bob - 9); cx.lineTo(x + 2, y + bob - 15); cx.stroke(); if (f.gold) { cx.globalAlpha = .5 + Math.sin(g.t * 6) * .3; cx.beginPath(); cx.arc(x, y + bob, 17, 0, 7); cx.strokeStyle = '#FFE58A'; cx.stroke(); cx.globalAlpha = 1; } }
    // birds
    for (const bd of g.birds) { const y = bd.y - cam; if (y < -40 || y > H + 40) continue; drawBird(cx, g.PL + bd.x * g.PF, y, bd.d); }
    // Zacchaeus
    {
      const zy = g.y - cam, up = g.vy < 0;
      F.person(cx, Object.assign({}, ZAC, { x: g.TX + g.x, y: zy, s: .7, flip: g.flip, mood: g.faceT > 0 ? g.face : g.st === 'called' ? 'wow' : up ? 'happy' : 'calm', blink: F.blink(g.t, 3),
        armL: g.st === 'slide' ? 2.8 : up ? -2.4 : -.6, armR: g.st === 'slide' ? 2.8 : up ? 2.4 : .6, walk: up ? 0 : g.t * 18, lean: g.vx / 2200 }));
    }
    if (g.st === 'called') drawJesusBelow(cx);
    fx.draw(cx);
    cx.restore();
    drawHud(cx);
  }
  function drawGround(cx, gy) {
    const W = v.W;
    cx.fillStyle = '#E8CF9A'; cx.fillRect(-20, gy, W + 40, 400);
    // houses of Jericho
    for (let i = 0; i < 6; i++) { const x = (i / 6) * W + 10, h = 60 + (i % 3) * 22, w = W / 6 - 14; if (Math.abs(x + w / 2 - g.TX) < 70) continue; cx.fillStyle = ['#E3C48C', '#D6B87C', '#EAD3A2'][i % 3]; cx.fillRect(x, gy - h - 40, w, h); cx.lineWidth = 3; cx.strokeStyle = ink; cx.strokeRect(x, gy - h - 40, w, h); cx.fillStyle = '#5A3E22'; F.rr(cx, x + w / 2 - 9, gy - 40 - 26, 18, 26, 6); cx.fill(); }
    // the crowd that blocked his view
    for (let i = 0; i < Math.ceil(W / 46) + 1; i++) { const x = i * 46 + 10; if (Math.abs(x - g.TX) < 40) continue;
      F.person(cx, { x, y: gy + 18, s: .62 + (i % 3) * .06, skin: ['#8D5A3B', '#6B4226', '#A8714A', '#7A4B2E'][i % 4], robe: ['#14946B', '#1F55D6', '#C0392B', '#F2A007', '#3F6FE0'][i % 5], head: i % 2 ? 'cloth' : null, headCol: '#E8DCC6', hair: '#2B1B12', mood: 'calm', blink: F.blink(g.t, i), flip: i % 2 === 0 }); }
    cx.beginPath(); cx.moveTo(-20, gy); cx.lineTo(W + 20, gy); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
  }
  function drawBranch(cx, b, y) {
    const [a, c] = bx(b); cx.lineWidth = 3; cx.strokeStyle = ink;
    cx.beginPath(); cx.moveTo(a, y); cx.lineTo(c, y); cx.lineWidth = 16; cx.strokeStyle = ink; cx.stroke();
    cx.lineWidth = 10; cx.strokeStyle = b.type === 'moss' ? '#6E9A4E' : b.broken ? '#A0612D' : '#8B5A2B'; cx.stroke();
    if (b.type === 'crack' && !b.broken) { cx.lineWidth = 2.5; cx.strokeStyle = ink; const m = (a + c) / 2; cx.beginPath(); cx.moveTo(m - 6, y - 6); cx.lineTo(m, y + 1); cx.lineTo(m - 3, y + 6); cx.stroke(); }
    // leaves at the tip
    const tip = b.side < 0 ? a : b.side > 0 ? c : null;
    if (tip !== null) { cx.fillStyle = b.type === 'leafy' ? '#56C15A' : '#3FA34D'; const rr = b.type === 'leafy' ? 22 : 16; for (const [dx, dy] of [[0, -10], [b.side * -16, -16], [b.side * 10, -20]]) { cx.beginPath(); cx.arc(tip + dx, y + dy, rr, 0, 7); cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = ink; cx.stroke(); } }
  }
  function drawBird(cx, x, y, d) {
    cx.save(); cx.translate(x, y); cx.scale(d, 1); cx.lineWidth = 3; cx.strokeStyle = ink;
    const fl = Math.sin(g.t * 14) * 9;
    cx.beginPath(); cx.ellipse(0, 0, 14, 10, 0, 0, 7); cx.fillStyle = '#5DA9F0'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.moveTo(-2, -2); cx.quadraticCurveTo(-12, -14 - fl, -22, -6 - fl); cx.stroke();
    cx.beginPath(); cx.arc(11, -6, 6, 0, 7); cx.fill(); cx.stroke();
    cx.beginPath(); cx.moveTo(16, -6); cx.lineTo(23, -4); cx.lineTo(16, -2); cx.fillStyle = '#F2A007'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.arc(12, -8, 1.6, 0, 7); cx.fillStyle = ink; cx.fill();
    cx.restore();
  }
  function drawJesusBelow(cx) {
    const W = v.W, H = v.H, y = H - 30;
    cx.fillStyle = '#E8CF9A'; cx.fillRect(0, H - 60, W, 60); cx.beginPath(); cx.moveTo(0, H - 60); cx.lineTo(W, H - 60); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    const jx = Math.min(W - 60, g.TX + 120);
    F.person(cx, Object.assign({}, JESUS, { x: jx, y, s: .8, mood: 'happy', blink: F.blink(g.t, 8), armL: .3, armR: g.st === 'called' ? 2.4 : .2, flip: true }));
    if (g.st === 'called') {
      const lines = ['“Zacchaeus, make haste, and come down;', 'for to day I must abide at thy house.”'];
      const by = 96;
      F.rr(cx, 14, by - 34, W - 28, 92, 16); cx.fillStyle = '#FFF3C4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
      cx.font = F.font(Math.min(20, W / 22)); cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(lines[0], W / 2, by - 8); cx.fillText(lines[1], W / 2, by + 20);
      cx.font = '800 14px Nunito, sans-serif'; cx.fillText('Luke 19:5', W / 2, by + 44);
      if (g.calledT > 1.2) F.say(cx, 'Tap to slide down!', W / 2, by + 96, { size: 24, col: '#FFD447' });
    }
  }
  function drawTown(cx) {
    const W = v.W, H = v.H;
    const sk = cx.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#8FD0FF'); sk.addColorStop(1, '#FFE7B0'); cx.fillStyle = sk; cx.fillRect(0, 0, W, H);
    cx.fillStyle = '#E8CF9A'; cx.fillRect(0, H * .72, W, H * .3); cx.beginPath(); cx.moveTo(0, H * .72); cx.lineTo(W, H * .72); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    // Zacchaeus' house with Jesus as his guest
    const hx = W * .04, hw = Math.max(150, W * .22), hy = H * .4;
    cx.fillStyle = '#EAD3A2'; cx.fillRect(hx, hy, hw, H * .72 - hy); cx.strokeRect(hx, hy, hw, H * .72 - hy);
    cx.fillStyle = '#5A3E22'; F.rr(cx, hx + hw * .55, H * .72 - 70, 34, 70, 10); cx.fill(); cx.stroke();
    F.person(cx, Object.assign({}, JESUS, { x: hx + hw * .3, y: H * .72, s: .72, mood: 'happy', blink: F.blink(g.t, 8), armL: .3, armR: .3 }));
    F.person(cx, Object.assign({}, ZAC, { x: W * .16 + 40, y: H * .72 + 30, s: .82, mood: 'happy', blink: F.blink(g.t, 3), armL: -.4, armR: g.coins.length ? 2.2 : 1.2 }));
    // his money bag
    const bx0 = W * .16 + 80, by0 = H * .72 + 20; cx.beginPath(); cx.ellipse(bx0, by0, 22, 18, 0, 0, 7); cx.fillStyle = '#C68A4B'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke(); F.say(cx, '$', bx0, by0 + 2, { size: 16, col: '#FFD447' });
    layoutPeople();
    for (const p of g.people) {
      const done = p.got >= p.need;
      F.person(cx, { x: p.x, y: p.y, s: .72, skin: p.skin, robe: p.robe, head: p.i % 3 ? 'cloth' : null, headCol: '#E8DCC6', hair: '#2B1B12', mood: done ? 'happy' : 'worried', blink: F.blink(g.t, p.i + 5), armL: done ? -2.3 : 1.1, armR: done ? 2.3 : .3, flip: true, bounce: done ? -Math.abs(Math.sin(g.t * 6 + p.i)) * 8 : 0 });
      // what they are owed
      const tag = p.need === 4 ? `${p.got}/4` : done ? '✓' : '1';
      F.pill(cx, p.x - 26, p.y - 112, 52, 24, done ? '#9FE8B0' : '#FFF3C4', tag, { size: 13 });
      if (!done && g.st === 'give') { cx.beginPath(); cx.arc(p.x, p.y - 50, 44 + Math.sin(g.t * 6 + p.i) * 3, 0, 7); cx.strokeStyle = 'rgba(255,212,71,.7)'; cx.lineWidth = 3; cx.stroke(); }
    }
    // coins flying
    for (const c of g.coins) { const t = Math.min(1, c.t), x = c.x0 + (c.to.x - c.x0) * t, y = c.y0 + (c.to.y - 60 - c.y0) * t - Math.sin(t * Math.PI) * 120; cx.beginPath(); cx.arc(x, y, 9, 0, 7); cx.fillStyle = '#FFD447'; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = ink; cx.stroke(); }
    fx.draw(cx);
  }
  function drawGiveHud(cx) {
    const W = v.W, H = v.H;
    F.pill(cx, 16, 12, 110, 26, '#FFF3C4', `★ ${run.score}`, { size: 14 });
    if (g.st === 'give') F.pill(cx, W - 16 - 110, 12, 110, 26, '#FFD447', `⏱ ${Math.ceil(g.giveT)}s`, { size: 14 });
    F.say(cx, 'Make things right!', W / 2, 62, { size: Math.min(28, W / 14), col: '#FFD447' });
    cx.font = '800 ' + Math.min(16, W / 26) + 'px Nunito, sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center';
    cx.fillText('Tap each person to give back what was taken.', W / 2, 94);
    cx.fillText('People marked 4 get back four times as much!', W / 2, 116);
    if (g.st === 'giveIntro') card(cx, 'Zacchaeus has a new heart!', ['“Behold, Lord, the half of my goods I give to the poor…', 'I restore him fourfold.” (Luke 19:8)', 'Tap people to give back what he took!'], 'Tap to start giving');
    if (g.st === 'gaveAll' && g.endT > .4) card(cx, g.gaveAll ? 'Everyone is happy!' : 'What a change of heart!', ['“For the Son of man is come to seek', 'and to save that which was lost.” (Luke 19:10)'], 'Tap to finish');
  }
  function drawHud(cx) {
    const W = v.W, H = v.H;
    const ty = W < 440 ? 50 : 12;
    F.pill(cx, 16, ty, 104, 26, '#FFF3C4', `★ ${g.pts}`, { size: 14 });
    if (g.st !== 'called') F.pill(cx, W / 2 - 62, 8, 124, 34, '#C9F2DD', `📏 ${g.m} m`, { size: 19 });
    if (g.prevBest && g.st !== 'called') F.pill(cx, W - 16 - 104, ty, 104, 26, g.newBest ? '#FFD0DA' : '#E4ECFF', g.newBest ? 'New best!' : `Best ${g.prevBest} m`, { size: 13 });
    // a little flag at your best height
    if (g.prevBest && !g.newBest && g.st === 'play') { const fy = -g.prevBest * PXM - g.cam; if (fy > 40 && fy < H) { cx.setLineDash([8, 8]); cx.beginPath(); cx.moveTo(0, fy); cx.lineTo(W, fy); cx.lineWidth = 2; cx.strokeStyle = 'rgba(215,38,61,.6)'; cx.stroke(); cx.setLineDash([]); F.say(cx, `Your best: ${g.prevBest} m`, W - 80, fy - 12, { size: 13, col: '#FFD0DA' }); } }
    if (g.banner && g.banner.t < 2.2 && g.st === 'play') { cx.globalAlpha = Math.min(1, (2.2 - g.banner.t) * 2); F.say(cx, g.banner.s, W / 2, H * .2 + 30, { size: Math.min(30, W / 13), col: '#FFD447' }); cx.globalAlpha = 1; }
    if (g.st === 'play' && g.t < 7 && run.tries === 0) {
      cx.globalAlpha = .55; F.say(cx, '◀ hold', 54, H - 40, { size: 22 }); F.say(cx, 'hold ▶', W - 54, H - 40, { size: 22 }); cx.globalAlpha = 1;
    }
    if (g.st === 'intro') card(cx, 'Climb as high as you can!', TIPS, 'Tap to start climbing!');
    if (g.st === 'out') outCard(cx);
  }
  function outCard(cx) {
    const W = v.W, H = v.H, w = Math.min(W - 24, 460), h = 250, x = (W - w) / 2, y = (H - h) / 2 - 10, a = Math.min(1, g.outT * 3);
    cx.globalAlpha = a;
    cx.fillStyle = 'rgba(10,16,40,.4)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, 'Whoops! Zacchaeus fell!', W / 2, y + 34, { size: Math.min(26, w / 15), col: '#FFD447' });
    F.say(cx, `${g.m} m`, W / 2, y + 80, { size: 44, col: '#6FCB5C' });
    cx.font = '800 ' + Math.min(16, w / 27) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(g.newBest || !g.prevBest ? `Your highest climb ever! · ★ ${g.pts}` : `Your best: ${g.hiM} m · ★ ${g.pts}`, W / 2, y + 122);
    cx.fillText(`Figs: ${g.figsLv}`, W / 2, y + 148);
    const bw = Math.min(190, (w - 48) / 2), by = y + h - 66;
    g.btns = [{ k: 'again', x: W / 2 - bw - 8, y: by, w: bw, h: 46 }, { k: 'jesus', x: W / 2 + 8, y: by, w: bw, h: 46 }];
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2 - bw / 2 - 8, by + 23); cx.scale(pulse, pulse); F.pill(cx, -bw / 2, -23, bw, 46, '#14946B', ''); F.say(cx, 'Climb again', 0, 1, { size: Math.min(18, bw / 7.5) }); cx.restore();
    F.pill(cx, W / 2 + 8, by, bw, 46, '#F2B632', ''); F.say(cx, 'Meet Jesus ➜', W / 2 + 8 + bw / 2, by + 24, { size: Math.min(18, bw / 7.5) });
    cx.globalAlpha = 1;
  }
  function mix(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
    return `rgb(${A.map((c, i) => Math.round(c + (B[i] - c) * t)).join(',')})`;
  }
  function card(cx, title, lines, go) {
    const W = v.W, H = v.H, w = Math.min(W - 24, 500), h = 96 + lines.length * 28 + 40, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.fillStyle = 'rgba(10,16,40,.35)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, title, W / 2, y + 36, { size: Math.min(28, w / 15), col: '#FFD447' });
    cx.font = '800 ' + Math.min(16, w / 27) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center';
    lines.forEach((l, i) => cx.fillText(l, W / 2, y + 76 + i * 28));
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2, y + h - 30); cx.scale(pulse, pulse); F.pill(cx, -120, -20, 240, 40, '#14946B', ''); F.say(cx, go, 0, 1, { size: 17 }); cx.restore();
  }

  function finish() {
    const diff = run.diff, C = run.C, stars = run.m >= C.stars[1] ? 3 : run.m >= C.stars[0] ? 2 : 1;
    const best = storeJSON('zac-best') || {}, prev = best[diff] || 0;
    if (run.score > prev) { best[diff] = run.score; storeJSON('zac-best', best); }
    const badges = [];
    if (run.m >= 100) badges.push('Sky-High Climber'); else if (run.m >= 50) badges.push('Treetop Climber');
    if (run.figs >= 25) badges.push('Fig Collector');
    if (g && g.gaveAll) badges.push('Generous Heart');
    stop();
    Ark.finish(el, {
      id: ID, diff, stars, title: 'Salvation came to Zacchaeus’ house!',
      html: `<p class="story">Highest climb: <b>${run.m} m</b> · Score: <b>${run.score}</b>${run.score > prev && prev ? ' · <b>New best!</b>' : ''} · Figs: ${run.figs}</p>
        ${badges.length ? `<p class="story">${badges.map(b => `🏅 ${b}`).join(' &nbsp; ')}</p>` : ''}`,
      verse: ['For the Son of man is come to seek and to save that which was lost.', 'Luke 19:10 (KJV)'],
      lesson: 'Zacchaeus was short and not well liked, but Jesus saw him in the tree and called him by name. Meeting Jesus changed his heart, so he gave to the poor and made things right. Jesus sees you too, and He loves you.',
      again: () => { run = newRun(run.diff); play(); }, menu,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-' + ID, d); run = newRun(d); play(); }] : null
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
    _test: { state: () => g, run: () => run, tap: p => tap(p), bx: b => bx(b), D }
  };
})();
