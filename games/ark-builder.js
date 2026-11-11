/* Build the Ark Race (Genesis 6–7).
   Part 1: a plank swings on a rope. Tap to drop it onto the ark. Line it up! Any bit that hangs over the edge breaks off,
   so the next plank is shorter. A perfect drop makes the plank a little longer again. Finish before the rain clouds arrive.
   Part 2: the animals come two by two. Tap an animal, then tap its partner, and they walk up the ramp together.
   Then the LORD shuts the door, the rain falls, the ark floats, and God sets His rainbow in the cloud. */
(() => {
  const { store, storeJSON, say, hush } = Ark;
  const F = Ark.fun, ink = '#13203A';
  const ID = 'ark-builder';
  const D = {
    easy: { layers: 8, speed: [150, 9], time: 95, pairs: 5, walk: 28, rain: 70, hearts: Infinity },
    normal: { layers: 10, speed: [200, 12], time: 80, pairs: 7, walk: 48, rain: 60, hearts: 4 },
    hard: { layers: 12, speed: [250, 15], time: 70, pairs: 9, walk: 72, rain: 55, hearts: 3 }
  };
  const ANIMALS = [['🦁', 'Roar!'], ['🐘', 'Toot!'], ['🦒', 'Hum!'], ['🐑', 'Baa!'], ['🐄', 'Moo!'], ['🐫', 'Grunt!'], ['🦓', 'Neigh!'], ['🐒', 'Ooh ooh!'], ['🐇', 'Sniff!'], ['🐻', 'Grr!'], ['🐢', 'Slow…'], ['🐖', 'Oink!'], ['🐐', 'Meh!'], ['🦊', 'Yip!'], ['🐓', 'Cock-a-doodle!'], ['🐂', 'Snort!']];
  const NOAH = { skin: '#8D5A3B', robe: '#8B5A2B', trim: '#F2E3C2', hair: '#E8E8E8', beard: '#F4F4F4', head: 'cloth', headCol: '#F2E3C2', band: '#8B5A2B' };
  const LH = 26;

  let el, v = null, L = null, fx = null, g = null, run = null;
  const newRun = d => ({ diff: d, C: D[d], score: 0, stars: [], misses: 0, perfect: 0, wrong: 0, all: false, bestStreak: 0 });

  function menu() {
    stop();
    const best = storeJSON('ark-best') || {};
    Ark.menu(el, {
      id: ID, title: 'Build the Ark Race', icon: 'ark', color: '#2E7D32',
      blurb: 'God told Noah to build an ark. Stack the planks, then bring the animals in two by two before the rain!',
      how: [['tap', 'Tap to drop each plank'], ['star', 'Line them up perfectly'], ['choice', 'Tap two matching animals']],
      listen: 'A plank swings on a rope. Tap to drop it onto the ark. Line it up, because any bit hanging over the edge breaks off. Then tap an animal and its partner to send them into the ark two by two.',
      diffs: { easy: 'A small ark, slow planks and lots of time.', normal: 'A bigger ark and faster planks.', hard: 'A huge ark, quick planks and busy animals!' },
      extra: Object.keys(best).length ? `<p style="margin:0;text-align:center;font-weight:800;color:var(--muted)">Best score: ${Ark.DIFFS.filter(d => best[d]).map(d => `${Ark.DLABEL[d]} ${best[d]}`).join(' · ')}</p>` : '',
      start: d => { run = newRun(d); play('build'); }
    });
  }

  function play(part) {
    stop();
    el.innerHTML = '<div id="abHost"></div>';
    v = F.view(el.querySelector('#abHost'), { h: innerHeight < 520 && innerWidth > innerHeight ? 461 : 640, minA: .56, maxA: 2.1, label: part === 'build' ? 'Noah building the ark. Tap to drop each plank.' : 'Animals in a field beside the ark. Tap two matching animals.' });
    fx = F.fx();
    g = { part, st: part === 'build' ? 'intro' : 'aIntro', t: 0, pts: 0, msg: null };
    if (part === 'build') Object.assign(g, { stack: [], plank: null, bits: [], misses: 0, streak: 0, cam: 0, timeLeft: run.C.time, hearts: run.C.hearts, hammer: 0 });
    else setupAnimals();
    layout(); v.onfit = layout;
    bind();
    L = F.loop(step);
    Ark.ctl({
      help: () => say(part === 'build' ? 'Tap to drop the swinging plank onto the ark. Line it up with the plank below. A perfect drop makes it longer!' : 'Tap an animal, then tap the one that matches it. They go into the ark two by two!', true),
      pause: () => L && L.pause(), resume: () => L && L.resume(),
      restart: () => { run.score -= g ? g.pts : 0; play(part); }
    });
  }
  function layout() {
    if (!g) return;
    g.W0 = Math.min(v.W * .72, 400); g.base = v.H * .84;
    if (g.part === 'build' && !g.stack.length) g.stack.push({ x: v.W / 2, w: g.W0 });
    if (g.part === 'animals') g.field = { x0: Math.max(v.W * .38, 170), x1: v.W - 30, y0: v.H * .42, y1: v.H * .86 };
  }

  function bind() {
    const cv = v.cv;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); if (g) tap(v.pt(e)); });
    g.onKey = e => { if (!g || e.repeat) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tap(null); } };
    addEventListener('keydown', g.onKey);
  }
  function tap(p) {
    const st = g.st;
    if (st === 'intro') { g.st = 'play'; newPlank(); F.sfx.pop(); return; }
    if (st === 'play') { drop(); return; }
    if (st === 'built' && g.endT > 1.4) { run.stars[0] = g.bStars; play('animals'); return; }
    if (st === 'out') { run.score -= g.pts; play('build'); return; }
    if (st === 'aIntro') { g.st = 'aPlay'; return; }
    if (st === 'aPlay') { if (p) pick(p); return; }
    if (st === 'final' && g.endT > 5.2) finish();
  }

  /* ---------- part 1: stacking ---------- */
  const topOf = () => g.stack[g.stack.length - 1];
  const layerY = i => g.base - (i + 1) * LH + g.cam; // top edge of layer i on screen
  function newPlank() {
    const top = topOf(), i = g.stack.length - 1, sp = run.C.speed[0] + run.C.speed[1] * i;
    const A = Math.min(v.W * .44, 300);
    g.plank = { w: top.w, x: Math.random() < .5 ? v.W / 2 - A : v.W / 2 + A, dir: Math.random() < .5 ? 1 : -1, sp, A, y: 0, vy: 0, falling: false };
  }
  function drop() {
    if (!g.plank || g.plank.falling) return;
    g.plank.falling = true; g.plank.vy = 0; F.sfx.whoosh();
  }
  function landPlank() {
    const p = g.plank, top = topOf();
    const l = Math.max(p.x - p.w / 2, top.x - top.w / 2), r = Math.min(p.x + p.w / 2, top.x + top.w / 2), ov = r - l;
    g.plank = null;
    if (ov <= 4) { // missed the ark completely
      g.bits.push({ x: p.x, y: layerY(g.stack.length - 1) - LH / 2, w: p.w, vx: (p.x < top.x ? -1 : 1) * 80, vy: -60, r: 0, vr: (p.x < top.x ? -1 : 1) * 3 });
      g.misses++; run.misses++; g.streak = 0; F.sfx.oops(); setTimeout(() => F.sfx.splash(.8), 500);
      g.msg = { s: 'Missed! Splash!', col: '#FF8FA3', t: 0 };
      if (g.hearts !== Infinity && --g.hearts <= 0) { g.st = 'out'; return; }
      newPlank(); return;
    }
    let nx = (l + r) / 2, nw = ov;
    if (Math.abs(p.x - top.x) < 7) { // perfect!
      nx = top.x; nw = Math.min(g.W0, top.w + 8); g.streak++; run.perfect++; run.bestStreak = Math.max(run.bestStreak, g.streak);
      add(50 + 25 * Math.min(6, g.streak)); F.sfx.good();
      g.msg = { s: g.streak > 1 ? `Perfect ×${g.streak}!` : 'Perfect!', col: '#FFE58A', t: 0 };
      fx.burst(nx, layerY(g.stack.length) + LH / 2, 16, ['#FFD447', '#fff'], { speed: 180, g: 100, life: .6 });
    } else {
      g.streak = 0; add(30);
      // the bit hanging over breaks off and falls
      const off = p.w - ov, ox = p.x < top.x ? l - off / 2 : r + off / 2;
      g.bits.push({ x: ox, y: layerY(g.stack.length) + LH / 2, w: off, vx: (p.x < top.x ? -1 : 1) * 60, vy: -40, r: 0, vr: (p.x < top.x ? -1 : 1) * 2.5 });
      g.msg = { s: off < 25 ? 'Good!' : 'Snap!', col: off < 25 ? '#9FE8B0' : '#FFB347', t: 0 };
    }
    g.stack.push({ x: nx, w: nw, t: 0 });
    g.hammer = .5; F.sfx.drum(.8); setTimeout(() => F.sfx.tick(), 120); setTimeout(() => F.sfx.tick(), 240);
    fx.shake(3);
    if (g.stack.length - 1 >= run.C.layers) built(); else newPlank();
  }
  function built() {
    g.st = 'built'; g.endT = 0; const bonus = Math.round(g.timeLeft) * 5; add(bonus); g.bonus = bonus;
    g.bStars = g.misses === 0 ? 3 : g.misses <= 2 ? 2 : 1;
    F.sfx.cheer(); fx.burst(v.W / 2, layerY(g.stack.length - 1), 40, ['#FFD447', '#fff', '#8FD0FF', '#FF8FA3'], { speed: 280, life: 1.1 });
  }

  /* ---------- part 2: two by two ---------- */
  function setupAnimals() {
    const kinds = ANIMALS.slice().sort(() => Math.random() - .5).slice(0, run.C.pairs);
    if (run.diff === 'hard' && !kinds.find(k => k[0] === '🐑')) kinds[0] = ANIMALS[3];
    if (run.diff === 'hard' && !kinds.find(k => k[0] === '🐐')) kinds[1] = ANIMALS[12];
    g.an = []; kinds.forEach((k, ki) => { for (let j = 0; j < 2; j++) g.an.push({ e: k[0], snd: k[1], kind: ki, x: 0, y: 0, vx: 0, vy: 0, turn: 0, sel: false, go: 0, shake: 0, inside: false, id: g.an.length }); });
    g.sel = null; g.left = run.C.rain; g.done = 0; g.combo = 0; g.wrong = 0; g.rainP = 0;
    g.place = true;
  }
  function placeAnimals() {
    const f = g.field;
    for (const a of g.an) { a.x = f.x0 + Math.random() * (f.x1 - f.x0); a.y = f.y0 + Math.random() * (f.y1 - f.y0); }
    g.place = false;
  }
  function pick(p) {
    let best = null, bd = 9e9;
    for (const a of g.an) { if (a.go) continue; const d = Math.hypot(a.x - p.x, a.y - 20 - p.y); if (d < bd) { bd = d; best = a; } }
    if (!best || bd > 52) return;
    if (!g.sel) { g.sel = best; best.sel = true; F.sfx.pop(); fx.text(best.x, best.y - 60, best.snd, '#fff', 20); return; }
    if (g.sel === best) { best.sel = false; g.sel = null; F.sfx.tick(); return; }
    const a = g.sel; a.sel = false; g.sel = null;
    if (a.kind === best.kind) {
      g.combo++; add(100 + 20 * Math.min(5, g.combo - 1)); F.sfx.coin(); F.sfx.good();
      a.go = best.go = 1; a.mate = best; best.mate = a;
      fx.burst((a.x + best.x) / 2, (a.y + best.y) / 2 - 20, 20, ['#FFD447', '#FF8FA3', '#fff'], { speed: 200, g: 100, life: .7 });
      fx.text((a.x + best.x) / 2, Math.min(a.y, best.y) - 70, g.combo > 1 ? `Two by two! ×${g.combo}` : 'Two by two!', '#FFE58A', 24);
    } else {
      g.combo = 0; g.wrong++; run.wrong++; a.shake = best.shake = .5; F.sfx.oops();
      fx.text(best.x, best.y - 60, 'Not a pair!', '#FF8FA3', 20);
    }
  }
  const ramp = () => ({ x: Math.max(v.W * .3, 140), y: v.H * .86, tx: Math.max(v.W * .16, 70), ty: v.H * .62 });

  /* ---------- update ---------- */
  function step(dt) {
    if (!g) return;
    g.t += dt; fx.update(dt); if (g.msg) g.msg.t += dt;
    if (g.part === 'build') {
      if (g.st === 'play') {
        g.timeLeft -= dt; if (g.timeLeft <= 0) { g.timeLeft = 0; g.st = 'out'; g.outRain = true; F.sfx.thunder(); }
        const p = g.plank;
        if (p && !p.falling) { p.x += p.dir * p.sp * dt; if (p.x > v.W / 2 + p.A) { p.x = v.W / 2 + p.A; p.dir = -1; } if (p.x < v.W / 2 - p.A) { p.x = v.W / 2 - p.A; p.dir = 1; } }
        if (p && p.falling) { p.vy += 2600 * dt; p.y += p.vy * dt; if (hangY() + p.y >= layerY(g.stack.length)) landPlank(); }
      }
      g.hammer -= dt;
      for (const b of g.bits) { b.vy += 1200 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt; if (b.y > v.H * .9 && !b.sp) { b.sp = 1; fx.burst(b.x, v.H * .9, 10, ['#8FD0FF', '#fff'], { dir: -Math.PI / 2, spread: 1.4, speed: 200, life: .6 }); } }
      g.bits = g.bits.filter(b => b.y < v.H + 80);
      const want = Math.max(0, g.stack.length * LH - v.H * .42); g.cam += (want - g.cam) * Math.min(1, dt * 4);
      if (g.st === 'built') g.endT += dt;
    } else {
      if (g.place) placeAnimals();
      const f = g.field, C = run.C, rp = ramp();
      if (g.st === 'aPlay') { g.left -= dt; if (g.left <= 0) { g.left = 0; rainTime(); } }
      for (const a of g.an) {
        a.shake -= dt;
        if (a.inside) continue;
        if (a.go) { // walk to the ramp, then up into the ark
          const tx = a.go === 1 ? rp.x + (a.id % 2) * 26 : rp.tx, ty = a.go === 1 ? rp.y - 6 : rp.ty;
          const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), sp = 190;
          if (d < 6) { if (a.go === 1) a.go = 2; else { a.inside = true; g.done += .5; F.tone(520 + g.done * 40, .1, { type: 'triangle', vol: .05 }); } }
          else { a.x += dx / d * Math.min(d, sp * dt); a.y += dy / d * Math.min(d, sp * dt); }
          continue;
        }
        a.turn -= dt;
        if (a.turn <= 0) { a.turn = 1 + Math.random() * 2.2; const ang = Math.random() * 6.28, sp = C.walk * (.5 + Math.random()); a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp * .6; if (Math.random() < .25) { a.vx = a.vy = 0; } }
        if (a.sel) { a.vx *= .9; a.vy *= .9; }
        a.x += a.vx * dt; a.y += a.vy * dt;
        if (a.x < f.x0) { a.x = f.x0; a.vx = Math.abs(a.vx); } if (a.x > f.x1) { a.x = f.x1; a.vx = -Math.abs(a.vx); }
        if (a.y < f.y0) { a.y = f.y0; a.vy = Math.abs(a.vy); } if (a.y > f.y1) { a.y = f.y1; a.vy = -Math.abs(a.vy); }
      }
      if (g.st === 'aPlay' && g.an.every(a => a.go)) { g.all = true; run.all = true; add(Math.round(g.left) * 10); g.bonus = Math.round(g.left) * 10; rainTime(); }
      if (g.st === 'rain' || g.st === 'aPlay') g.rainP = g.st === 'rain' ? Math.min(1, g.rainP + dt * .5) : Math.max(0, 1 - g.left / C.rain) * .5;
      if (g.st === 'rain') { g.endT += dt; if (g.an.every(a => a.inside) && g.endT > 1) { g.st = 'final'; g.endT = 0; F.sfx.thunder(); } }
      if (g.st === 'final') { g.endT += dt; if (g.endT > 3 && !g.bow) { g.bow = 1; F.sfx.win(); } }
    }
    draw();
  }
  function rainTime() {
    if (g.st === 'rain') return;
    g.st = 'rain'; g.endT = 0;
    // any animals still in the field hurry in by themselves: God brought them to Noah (Genesis 7:9)
    for (const a of g.an) if (!a.go) { a.go = 1; a.go2 = true; }
    if (g.sel) g.sel.sel = false;
    const stars = g.all && g.wrong <= 1 ? 3 : g.all ? 2 : 1; run.stars[1] = stars; g.aStars = stars;
    F.sfx.thunder();
  }
  const hangY = () => Math.min(layerY(g.stack.length) - 110, v.H * .24);
  const add = p => { g.pts += p; run.score += p; };

  /* ---------- drawing ---------- */
  function sky(cx, dark) {
    const W = v.W, H = v.H, sk = cx.createLinearGradient(0, 0, 0, H);
    sk.addColorStop(0, mixc('#8FD0FF', '#4A5878', dark)); sk.addColorStop(1, mixc('#E6F6FF', '#8A96AE', dark));
    cx.fillStyle = sk; cx.fillRect(-30, -30, W + 60, H + 60);
    // rain clouds rolling in
    cx.fillStyle = `rgba(${Math.round(255 - dark * 160)},${Math.round(255 - dark * 150)},${Math.round(255 - dark * 130)},.92)`;
    for (let i = 0; i < 6; i++) { const x = ((i * 210 + g.t * 10) % (W + 260)) - 130, y = 46 + (i % 2) * 30 - dark * 10; for (const [dx, dy, r] of [[0, 0, 30 + dark * 14], [34, -12, 36 + dark * 16], [70, 0, 28 + dark * 12]]) { cx.beginPath(); cx.arc(x + dx, y + dy, r, 0, 7); cx.fill(); } }
  }
  function mixc(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((c, i) => Math.round(c + (B[i] - c) * t)).join(',')})`; }
  function rain(cx, k) {
    if (k <= 0) return; const W = v.W, H = v.H; cx.strokeStyle = `rgba(200,225,255,${.35 + k * .4})`; cx.lineWidth = 2;
    const n = Math.round(30 + k * 120); for (let i = 0; i < n; i++) { const x = (i * 73.1 + g.t * 60) % (W + 40) - 20, y = (i * 131.7 + g.t * 700) % (H + 40) - 20; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - 4, y + 14); cx.stroke(); }
  }
  function draw() {
    const cx = v.cx;
    v.reset(); cx.save(); fx.pre(cx);
    if (g.part === 'build') drawBuild(cx); else drawAnimals(cx);
    fx.draw(cx);
    cx.restore();
    drawHud(cx);
  }
  function ground(cx, y, water) {
    const W = v.W, H = v.H;
    cx.fillStyle = '#7CC36A'; cx.beginPath(); cx.moveTo(-20, y); for (let x = -20; x <= W + 20; x += 40) cx.lineTo(x, y - 8 + Math.sin(x * .02) * 6); cx.lineTo(W + 20, H + 20); cx.lineTo(-20, H + 20); cx.fill();
    cx.lineWidth = 3; cx.strokeStyle = ink; cx.beginPath(); cx.moveTo(-20, y); for (let x = -20; x <= W + 20; x += 40) cx.lineTo(x, y - 8 + Math.sin(x * .02) * 6); cx.stroke();
    if (water) { cx.fillStyle = 'rgba(70,150,230,.85)'; cx.fillRect(-20, H * .9, W + 40, H * .1 + 20); cx.beginPath(); cx.moveTo(-20, H * .9); for (let x = -20; x <= W + 20; x += 20) cx.lineTo(x, H * .9 + Math.sin(x * .05 + g.t * 3) * 3); cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2; cx.stroke(); }
  }
  function plank(cx, x, y, w, col, glow) {
    F.rr(cx, x - w / 2, y, w, LH - 2, 6); cx.fillStyle = col || '#A0612D'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    cx.strokeStyle = 'rgba(19,32,58,.25)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x - w / 2 + 8, y + LH * .45); cx.lineTo(x + w / 2 - 8, y + LH * .45); cx.stroke();
    cx.fillStyle = ink; for (const nx of [x - w / 2 + 8, x + w / 2 - 8]) if (w > 26) { cx.beginPath(); cx.arc(nx, y + LH / 2 - 1, 2, 0, 7); cx.fill(); }
    if (glow) { F.rr(cx, x - w / 2 - 3, y - 3, w + 6, LH + 4, 8); cx.strokeStyle = 'rgba(255,212,71,.9)'; cx.lineWidth = 3; cx.stroke(); }
  }
  function drawBuild(cx) {
    const W = v.W, H = v.H, C = run.C, dark = Math.min(1, 1 - g.timeLeft / C.time) * .8;
    sky(cx, g.st === 'out' && g.outRain ? 1 : dark);
    const gy = g.base + LH + g.cam;
    ground(cx, gy + 4, true);
    // the keel (the boat bottom)
    const b0 = g.stack[0];
    cx.beginPath(); cx.moveTo(b0.x - b0.w / 2 - 14, layerY(0)); cx.lineTo(b0.x + b0.w / 2 + 14, layerY(0)); cx.lineTo(b0.x + b0.w / 2 - 30, layerY(0) + LH + 6); cx.lineTo(b0.x - b0.w / 2 + 30, layerY(0) + LH + 6); cx.closePath();
    cx.fillStyle = '#7A4A22'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    // props holding it up
    cx.lineWidth = 6; cx.strokeStyle = '#6B4423'; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(b0.x + s * (b0.w / 2 + 6), layerY(0) + 10); cx.lineTo(b0.x + s * (b0.w / 2 + 40), gy); cx.stroke(); }
    // the planks
    for (let i = 1; i < g.stack.length; i++) { const s = g.stack[i]; s.t = (s.t || 0) + 1 / 60; const sq = s.t < .15 ? 1 - Math.sin(s.t / .15 * Math.PI) * .15 : 1; cx.save(); cx.translate(s.x, layerY(i) + LH); cx.scale(1, sq); plank(cx, 0, -LH, s.w); cx.restore(); }
    // falling bits
    for (const b of g.bits) { cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); plank(cx, 0, -LH / 2, b.w, '#B3743A'); cx.restore(); }
    // a roof once it is built
    if (g.st === 'built') { const top = topOf(), y = layerY(g.stack.length - 1), k = Math.min(1, g.endT * 2);
      cx.beginPath(); cx.moveTo(top.x - top.w / 2 - 10, y); cx.lineTo(top.x, y - 70 * k); cx.lineTo(top.x + top.w / 2 + 10, y); cx.closePath(); cx.fillStyle = '#C0392B'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
      const d = g.stack[Math.min(2, g.stack.length - 1)]; F.rr(cx, d.x + d.w * .18, layerY(Math.min(4, g.stack.length - 1)) + 4, 30, LH * Math.min(4, g.stack.length - 1) - 6, 6); cx.fillStyle = '#5A3E22'; cx.fill(); cx.stroke(); }
    // the swinging plank on its rope
    const p = g.plank;
    if (p && g.st === 'play') {
      const y = hangY() + p.y;
      cx.lineWidth = 3; cx.strokeStyle = '#6B4423'; cx.beginPath(); cx.moveTo(p.x, -10); cx.lineTo(p.x, p.falling ? Math.min(y, hangY() - 20) : y); cx.stroke();
      // a guide line straight down
      if (!p.falling) { cx.setLineDash([6, 8]); cx.strokeStyle = 'rgba(255,255,255,.65)'; cx.lineWidth = 2; for (const ex of [p.x - p.w / 2, p.x + p.w / 2]) { cx.beginPath(); cx.moveTo(ex, y + LH); cx.lineTo(ex, layerY(g.stack.length - 1)); cx.stroke(); } cx.setLineDash([]); }
      plank(cx, p.x, y, p.w, '#B86F33', Math.abs(p.x - topOf().x) < 7);
    }
    // Noah with his hammer
    const nx = Math.max(46, b0.x - b0.w / 2 - 50), hm = g.hammer > 0;
    F.person(cx, Object.assign({}, NOAH, { x: nx, y: gy + 2, s: W < 500 ? .75 : .9, mood: g.msg && g.msg.t < .8 && g.msg.col === '#FF8FA3' ? 'oops' : 'happy', blink: F.blink(g.t, 4), armL: -.5, armR: hm ? 1.2 + Math.sin(g.t * 30) * .8 : .6, flip: false }));
    rain(cx, g.st === 'out' && g.outRain ? 1 : 0);
  }
  function drawAnimals(cx) {
    const W = v.W, H = v.H, rp = ramp(), dark = g.st === 'final' ? (g.endT > 3 ? Math.max(.1, 1 - (g.endT - 3) * .6) : 1) : g.rainP;
    sky(cx, dark);
    const flood = g.st === 'final' ? Math.min(1, g.endT / 2.5) : 0;
    if (g.st === 'final' && g.endT > 3) { const k = Math.min(1, (g.endT - 3) / 1.5); cx.globalAlpha = k; ['#E74C3C', '#F39C12', '#F1C40F', '#2ECC71', '#3498DB', '#8E44AD'].forEach((c, i) => { cx.beginPath(); cx.arc(W / 2, H * .62, Math.min(W * .46, H * .5) - i * 12, Math.PI, 0); cx.lineWidth = 12; cx.strokeStyle = c; cx.stroke(); }); cx.globalAlpha = 1; }
    ground(cx, H * .88, false);
    // the ark (finished), with its ramp; at the end the flood lifts it and it floats
    const ax = rp.tx - 10, aw = Math.min(W * .34, 260), ay = rp.ty, waterTop = H * .92 - flood * H * .36, lift = Math.max(0, ay + 40 - waterTop);
    g.waterTop = waterTop;
    cx.save(); cx.translate(flood * (W / 2 - ax - aw * .05), -lift + (g.st === 'final' ? Math.sin(g.t * 1.5) * 4 * flood : 0));
    cx.beginPath(); cx.moveTo(ax - aw * .45, ay - 40); cx.lineTo(ax + aw * .55, ay - 40); cx.lineTo(ax + aw * .45, ay + 50); cx.lineTo(ax - aw * .35, ay + 50); cx.closePath(); cx.fillStyle = '#A0612D'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    cx.strokeStyle = 'rgba(19,32,58,.3)'; cx.lineWidth = 2; for (let k = 0; k < 3; k++) { cx.beginPath(); cx.moveTo(ax - aw * .42, ay - 12 + k * 22); cx.lineTo(ax + aw * .5, ay - 12 + k * 22); cx.stroke(); }
    cx.beginPath(); cx.moveTo(ax - aw * .3, ay - 40); cx.lineTo(ax + aw * .05, ay - 100); cx.lineTo(ax + aw * .4, ay - 40); cx.closePath(); cx.fillStyle = '#C0392B'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    // the door (shut by the LORD at the end)
    const shut = g.st === 'final' ? 1 : 0;
    F.rr(cx, rp.tx - 16, ay - 34, 36, 50, 6); cx.fillStyle = shut ? '#8B5A2B' : '#3A2614'; cx.fill(); cx.stroke();
    // animals peeking out of the window
    const inside = g.an.filter(a => a.inside);
    inside.slice(-6).forEach((a, k) => { cx.font = '22px sans-serif'; cx.textAlign = 'center'; cx.fillText(a.e, ax + aw * .1 + k * 22, ay - 44); });
    cx.restore();
    if (!shut) { cx.beginPath(); cx.moveTo(rp.tx, rp.ty + 14); cx.lineTo(rp.x + 40, rp.y + 6); cx.lineWidth = 12; cx.strokeStyle = ink; cx.stroke(); cx.lineWidth = 7; cx.strokeStyle = '#C68A4B'; cx.stroke(); }
    // Noah welcoming them in
    if (!shut) F.person(cx, Object.assign({}, NOAH, { x: rp.x + 70, y: rp.y + 4, s: .8, mood: 'happy', blink: F.blink(g.t, 4), armL: -1.6 + Math.sin(g.t * 3) * .3, armR: .5, flip: true }));
    // the animals
    const list = g.an.filter(a => !a.inside).sort((a, b) => a.y - b.y);
    for (const a of list) {
      const bob = a.go ? -Math.abs(Math.sin(g.t * 12 + a.id)) * 6 : -Math.abs(Math.sin(g.t * 6 + a.id)) * 3, sh = a.shake > 0 ? Math.sin(a.shake * 60) * 6 : 0;
      cx.beginPath(); cx.ellipse(a.x, a.y + 4, 20, 6, 0, 0, 7); cx.fillStyle = 'rgba(19,32,58,.2)'; cx.fill();
      if (a.sel) { cx.beginPath(); cx.arc(a.x, a.y - 18, 32 + Math.sin(g.t * 8) * 3, 0, 7); cx.fillStyle = 'rgba(255,212,71,.35)'; cx.fill(); cx.lineWidth = 4; cx.strokeStyle = '#FFD447'; cx.stroke(); }
      cx.save(); cx.translate(a.x + sh, a.y + bob); if (a.vx > 0 && !a.go) cx.scale(-1, 1);
      cx.font = '40px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.fillText(a.e, 0, 0); cx.restore();
    }
    rain(cx, g.st === 'final' && g.endT > 3 ? Math.max(0, 1 - (g.endT - 3)) : dark);
    if (g.st === 'final') {
      const wt = g.waterTop; cx.fillStyle = 'rgba(60,140,225,.9)'; cx.beginPath(); cx.moveTo(-20, wt); for (let x = -20; x <= W + 20; x += 20) cx.lineTo(x, wt + Math.sin(x * .04 + g.t * 2.5) * 4); cx.lineTo(W + 20, H + 20); cx.lineTo(-20, H + 20); cx.fill();
      cx.beginPath(); for (let x = -20; x <= W + 20; x += 20) { const y = wt + Math.sin(x * .04 + g.t * 2.5) * 4; x === -20 ? cx.moveTo(x, y) : cx.lineTo(x, y); } cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 3; cx.stroke();
    }
  }
  function drawHud(cx) {
    const W = v.W, H = v.H, C = run.C;
    F.pill(cx, 16, 12, 110, 26, '#FFF3C4', `★ ${run.score}`, { size: 14 });
    if (g.part === 'build') {
      const done = g.stack.length - 1;
      F.pill(cx, W < 460 ? 16 : W / 2 - 70, W < 460 ? 44 : 12, 140, 26, '#C9F2DD', `Planks ${Math.min(done, C.layers)} / ${C.layers}`, { size: 14 });
      if (g.hearts !== Infinity) F.pill(cx, W - 16 - 96, 12, 96, 26, '#FFD0DA', '♥'.repeat(Math.max(0, g.hearts)) || '–', { size: 14, col: '#D7263D' });
      const bw = Math.min(W - 32, 360), bx = (W - bw) / 2, fill = g.timeLeft / C.time;
      const by0 = W < 460 ? 78 : 46; F.rr(cx, bx, by0, bw, 16, 8); cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = ink; cx.stroke();
      F.rr(cx, bx + 2, by0 + 2, Math.max(12, (bw - 4) * fill), 12, 6); cx.fillStyle = fill > .35 ? '#6FCB5C' : '#F0485C'; cx.fill();
      cx.font = F.font(11); cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('☁ Before the rain', W / 2, by0 + 8);
      if (g.msg && g.msg.t < .8) { cx.globalAlpha = 1 - g.msg.t / .8; F.say(cx, g.msg.s, W / 2, H * .3 - g.msg.t * 30, { size: 30, col: g.msg.col }); cx.globalAlpha = 1; }
      if (g.st === 'play' && g.stack.length <= 2 && g.misses === 0) { const b = Math.abs(Math.sin(g.t * 4)) * 8; F.say(cx, 'Tap when the plank is right above the ark!', W / 2, H * .36 + b, { size: Math.min(20, W / 22), col: '#fff' }); }
      if (g.st === 'intro') card(cx, 'Build the Ark!', ['“Make thee an ark of gopher wood.” (Genesis 6:14)', 'Tap to drop each plank onto the ark.', 'Line it up! Overhanging bits break off.', 'A perfect drop makes the plank longer.'], 'Tap to start building');
      if (g.st === 'built' && g.endT > .5) card(cx, 'The ark is built!', [`${'★'.repeat(g.bStars)}${'☆'.repeat(3 - g.bStars)}`, `Perfect drops: ${run.perfect} · Time bonus: +${g.bonus}`, 'Now bring in the animals!'], 'Tap to continue');
      if (g.st === 'out') card(cx, g.outRain ? 'The rain is coming!' : 'Too many planks fell!', ['Let’s build it again.', 'Tap when the plank lines up with the one below.'], 'Tap to try again');
    } else {
      const pairs = g.an.length / 2, inP = g.an.filter(a => a.go).length / 2;
      F.pill(cx, W < 460 ? 16 : W / 2 - 70, W < 460 ? 44 : 12, 140, 26, '#C9F2DD', `Pairs ${inP} / ${pairs}`, { size: 14 });
      if (g.st === 'aPlay' || g.st === 'aIntro') F.pill(cx, W - 16 - 100, 12, 100, 26, g.left < 10 ? '#FFD0DA' : '#E4ECFF', `☁ ${Math.ceil(g.left)}s`, { size: 14 });
      if (g.st === 'aPlay' && inP === 0 && !g.sel) F.say(cx, 'Tap an animal, then tap its partner!', W / 2, W < 460 ? 96 : 62, { size: Math.min(20, W / 22), col: '#fff' });
      if (g.st === 'aIntro') card(cx, 'Two by two!', ['“Of every living thing of all flesh,', 'two of every sort shalt thou bring into the ark.”', '(Genesis 6:19)', 'Tap an animal, then tap its partner.'], 'Tap to start');
      if (g.st === 'rain' && g.endT < 2.5) F.say(cx, g.all ? 'Everyone is safe inside!' : 'The rain is starting! Hurry in!', W / 2, H * .3, { size: Math.min(30, W / 14), col: '#FFE58A' });
      if (g.st === 'final') {
        if (g.endT > .4) { F.say(cx, '“And the LORD shut him in.”', W / 2, H * .14, { size: Math.min(24, W / 18), col: '#fff' }); F.say(cx, 'Genesis 7:16', W / 2, H * .14 + 28, { size: 15, col: '#FFE58A' }); }
        if (g.endT > 3.4) { F.say(cx, '“I do set my bow in the cloud.”', W / 2, H * .14 + 64, { size: Math.min(24, W / 18), col: '#fff' }); F.say(cx, 'Genesis 9:13', W / 2, H * .14 + 92, { size: 15, col: '#FFE58A' }); }
        if (g.endT > 5.2) F.say(cx, 'Tap to finish', W / 2, H - 30, { size: 22, col: '#FFD447' });
      }
    }
  }
  function card(cx, title, lines, go) {
    const W = v.W, H = v.H, w = Math.min(W - 24, 500), h = 96 + lines.length * 28 + 40, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.fillStyle = 'rgba(10,16,40,.35)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, title, W / 2, y + 36, { size: Math.min(28, w / 15), col: '#FFD447' });
    cx.font = '800 ' + Math.min(16, w / 28) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    lines.forEach((l, i) => cx.fillText(l, W / 2, y + 76 + i * 28));
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2, y + h - 30); cx.scale(pulse, pulse); F.pill(cx, -120, -20, 240, 40, '#14946B', ''); F.say(cx, go, 0, 1, { size: 18 }); cx.restore();
  }

  function finish() {
    const diff = run.diff, avg = Math.round(run.stars.reduce((a, b) => a + b, 0) / run.stars.length);
    const best = storeJSON('ark-best') || {}, prev = best[diff] || 0;
    if (run.score > prev) { best[diff] = run.score; storeJSON('ark-best', best); }
    const badges = [];
    if (run.misses === 0) badges.push('Master Builder');
    if (run.bestStreak >= 3) badges.push(`${run.bestStreak} Perfect in a Row`);
    if (run.all && run.wrong === 0) badges.push('Animal Friend');
    stop();
    Ark.finish(el, {
      id: ID, diff, stars: Math.max(1, avg), title: 'Noah built the ark!',
      html: `<p class="story">Score: <b>${run.score}</b>${run.score > prev && prev ? ' · <b>New best!</b>' : ''} · Perfect drops: ${run.perfect}</p>
        ${badges.length ? `<p class="story">${badges.map(b => `🏅 ${b}`).join(' &nbsp; ')}</p>` : ''}`,
      verse: ['Thus did Noah; according to all that God commanded him, so did he.', 'Genesis 6:22 (KJV)'],
      lesson: 'Building the ark was a huge job, and nobody had ever seen a flood before. But Noah trusted God and obeyed Him, plank by plank. God kept Noah, his family and the animals safe, and gave the rainbow as His promise.',
      again: () => { run = newRun(run.diff); play('build'); }, menu,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-' + ID, d); run = newRun(d); play('build'); }] : null
    });
  }

  function stop() {
    if (L) L.stop(); L = null;
    if (v) v.destroy(); v = null;
    if (g && g.onKey) removeEventListener('keydown', g.onKey);
    g = null;
  }

  Ark.games[ID] = {
    mount(stage) { el = stage; menu(); },
    unmount() { stop(); hush(); },
    _test: { state: () => g, run: () => run, tap: p => tap(p), top: () => topOf(), part2: () => { run.stars[0] = 3; play('animals'); } }
  };
})();
