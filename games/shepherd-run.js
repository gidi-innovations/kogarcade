/* David's Shepherd Run (1 Samuel 16:11; 17:34–37). An endless runner.
   Young David looks after his father's sheep in the hills. Tap to jump over rocks, thorn bushes and streams (hold for
   a bigger jump), run into lost sheep to gather them, and tap the lion and the bear to chase them off before they take
   a lamb. The faster and further you run, the more points. Bump into too many things and you're out. */
(() => {
  const { store, storeJSON, say, hush } = Ark;
  const F = Ark.fun, ink = '#13203A';
  const ID = 'shepherd-run';
  const PXM = 40;
  const D = {
    easy: { sp: [230, 470], acc: 4, hearts: 5, beast: [26, 12, 8], gapT: 1.15, stars: [250, 600] },
    normal: { sp: [270, 560], acc: 6, hearts: 3, beast: [18, 10, 6], gapT: 1, stars: [300, 800] },
    hard: { sp: [310, 650], acc: 8, hearts: 3, beast: [12, 8, 4.5], gapT: .9, stars: [350, 1000] }
  };
  const DAVID = { skin: '#A8714A', robe: '#D9A45B', trim: '#7A3E9D', hair: '#B5651D', head: null };
  const TIPS = ['Tap to jump. Hold for a bigger jump!', 'Run into lost sheep to gather them.', 'A lion or a bear? TAP it to chase it away!', 'There is no end: how far can you run?'];

  let el, v = null, L = null, fx = null, g = null, run = null;
  const newRun = d => ({ diff: d, C: D[d], m: 0, score: 0, sheep: 0, scared: 0, tries: 0 });

  function menu() {
    stop();
    const best = storeJSON('shep-best-m') || {};
    Ark.menu(el, {
      id: ID, title: 'David’s Shepherd Run', icon: 'stone', color: '#14946B',
      blurb: 'Young David keeps his father’s sheep. Run the hills, gather the flock, and chase off the lion and the bear!',
      how: [['jump', 'Tap to jump (hold to go higher)'], ['heart', 'Gather the lost sheep'], ['tap', 'Tap the lion and bear to scare them']],
      listen: 'Tap to jump over rocks, thorn bushes and streams. Hold to jump higher. Run into lost sheep to gather them. When a lion or a bear comes, tap it to chase it away. How far can you run?',
      diffs: { easy: 'A gentle run with 5 hearts.', normal: 'Faster, with more lions and bears.', hard: 'Very fast. Only for brave shepherds!' },
      extra: Object.keys(best).length ? `<p style="margin:0;text-align:center;font-weight:800;color:var(--muted)">Furthest run: ${Ark.DIFFS.filter(d => best[d]).map(d => `${Ark.DLABEL[d]} ${best[d]} m`).join(' · ')}</p>` : '',
      start: d => { run = newRun(d); play(); }
    });
  }

  function play() {
    stop();
    el.innerHTML = '<div id="srHost"></div>';
    v = F.view(el.querySelector('#srHost'), { h: innerHeight < 520 && innerWidth > innerHeight ? 389 : 540, minA: .6, maxA: 2.4, label: 'David running across the hills with his sheep. Tap to jump.' });
    fx = F.fx();
    g = {
      st: 'intro', t: 0, dist: 0, sp: run.C.sp[0], y: 0, vy: 0, hold: false, holdT: 0, air: false,
      obs: [], sheep: [], beasts: [], flock: 0, hearts: run.C.hearts, hurt: 0, next: 500, beastT: run.C.beast[0], warn: null,
      m: 0, pts: 0, scared: 0, figs: 0, newBest: false, btns: [], outT: 0, msg: null
    };
    g.prevBest = (storeJSON('shep-best-m') || {})[run.diff] || 0;
    bind();
    L = F.loop(step);
    Ark.ctl({
      help: () => say(TIPS.join(' '), true),
      pause: () => L && L.pause(), resume: () => L && L.resume(),
      restart: () => { run = newRun(run.diff); play(); }
    });
  }
  const GY = () => v.H * .8;
  const DX = () => Math.min(v.W * .26, 230);

  /* ---------- input ---------- */
  function bind() {
    const cv = v.cv;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} if (g) press(v.pt(e)); });
    const up = () => { if (g) g.hold = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    g.onKey = e => {
      if (!g) return; const on = e.type === 'keydown';
      if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); if (on && !e.repeat) press(null); else if (!on) g.hold = false; }
      else if (['Enter', 's', 'S', 'ArrowRight'].includes(e.key) && on && !e.repeat) { e.preventDefault(); if (g.st === 'play') { const b = g.beasts.find(b => !b.run && b.x < v.W + 20); if (b) scare(b); } else press(null); }
    };
    addEventListener('keydown', g.onKey); addEventListener('keyup', g.onKey);
  }
  function press(p) {
    if (g.st === 'intro') { g.st = 'play'; F.sfx.pop(); return; }
    if (g.st === 'out') {
      if (g.outT < .7) return;
      const b = p ? g.btns.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) : g.btns[0];
      if (!b) return;
      if (b.k === 'again') { run.tries++; play(); } else finish();
      return;
    }
    if (g.st !== 'play') return;
    // tapping a lion or bear chases it off
    if (p) for (const b of g.beasts) if (!b.run && Math.hypot(p.x - b.x, p.y - (GY() - 40)) < 75) { scare(b); return; }
    if (!g.air) { g.vy = -860; g.air = true; g.hold = true; g.holdT = 0; F.sfx.jump(); }
  }
  function scare(b) {
    b.run = true; g.scared++; add(50); F.sfx.horn(392, .25); F.sfx.good();
    fx.text(b.x, GY() - 110, b.kind === 'lion' ? 'Shoo, lion!' : 'Off you go, bear!', '#FFE58A', 22);
    fx.burst(b.x, GY() - 50, 14, ['#fff', '#FFE58A'], { speed: 200, g: 0, life: .5 });
    g.staffT = .4;
  }

  /* ---------- the hills ahead ---------- */
  function spawn() {
    const C = run.C, x = v.W + 80, r = Math.random(), k = Math.min(1, g.m / 800);
    if (r < .38) g.obs.push({ kind: 'rock', x, w: 38 + Math.random() * 14, h: 30 + Math.random() * 10 });
    else if (r < .62) g.obs.push({ kind: 'bush', x, w: 50 + Math.random() * 20, h: 36 + Math.random() * 8 });
    else if (r < .8 && g.m > 40) g.obs.push({ kind: 'stream', x, w: 80 + Math.random() * (50 + 40 * k), h: 0 });
    else { g.sheep.push({ x, y: 0, bob: Math.random() * 6 }); }
    // sometimes a sheep waits on top of a rock: jump to get it
    const last = g.obs[g.obs.length - 1];
    if (last && last.x === x && last.kind === 'rock' && Math.random() < .35) g.sheep.push({ x, y: -last.h, bob: Math.random() * 6 });
    else if (Math.random() < .3) g.sheep.push({ x: x + 160, y: 0, bob: Math.random() * 6 });
    g.next = g.sp * C.gapT * (1.05 + Math.random() * .9);
  }

  /* ---------- update ---------- */
  function step(dt) {
    if (!g) return;
    g.t += dt; fx.update(dt); if (g.msg) g.msg.t += dt;
    if (g.st === 'play') {
      const C = run.C;
      g.sp = Math.min(C.sp[1], g.sp + C.acc * dt);
      const dx = g.sp * dt; g.dist += dx;
      // jumping: hold for a bigger jump
      if (g.air) { g.holdT += dt; const grav = g.hold && g.vy < 0 && g.holdT < .26 ? 1100 : 2400; g.vy += grav * dt; g.y += g.vy * dt; if (g.y >= 0) { g.y = 0; g.vy = 0; g.air = false; fx.burst(DX(), GY(), 5, ['#D9C29A', '#C9B07A'], { dir: -Math.PI / 2, spread: 2, speed: 90, size: 4, life: .4 }); } }
      g.hurt -= dt; g.staffT = (g.staffT || 0) - dt;
      // move the world
      for (const o of g.obs) o.x -= dx;
      for (const s of g.sheep) s.x -= dx;
      g.next -= dx; if (g.next <= 0) spawn();
      g.obs = g.obs.filter(o => o.x + o.w > -60); g.sheep = g.sheep.filter(s => s.x > -60 && !s.got);
      // bumps
      const px = DX(), feet = g.y;
      for (const o of g.obs) {
        if (o.hit || g.hurt > 0) continue;
        if (o.kind === 'stream') { if (!g.air && px > o.x + 10 && px < o.x + o.w - 10) { o.hit = true; hurt('Splash!'); F.sfx.splash(1); fx.burst(px, GY(), 18, ['#8FD0FF', '#fff'], { dir: -Math.PI / 2, spread: 1.4, speed: 260, life: .6 }); g.vy = -700; g.air = true; g.hold = false; } }
        else if (px + 14 > o.x - o.w / 2 && px - 14 < o.x + o.w / 2 && feet > -o.h + 4) { o.hit = true; hurt(o.kind === 'rock' ? 'Ouch, a rock!' : 'Ouch, thorns!'); F.sfx.oops(); fx.shake(8); }
      }
      // landing on a rock top
      for (const o of g.obs) if (o.kind === 'rock' && !o.hit && g.vy >= 0 && Math.abs(px - o.x) < o.w / 2 + 6 && g.y > -o.h - 12 && g.y < -o.h + 14 && g.air) { /* a light touch on top is fine */ }
      // gathering sheep
      for (const s of g.sheep) if (!s.got && Math.abs(s.x - px) < 34 && Math.abs(s.y - g.y) < 46) {
        s.got = true; g.flock++; run.sheep++; add(25); F.sfx.coin(); F.tone(700, .2, { type: 'triangle', to: 500, vol: .05, at: .05 });
        fx.text(px, GY() + s.y - 90, g.flock % 10 === 0 ? `${g.flock} sheep!` : 'Baa! +25', '#fff', 20);
        fx.burst(px, GY() + s.y - 30, 10, ['#fff', '#F2F2F2'], { speed: 140, g: 100, life: .5 });
      }
      // lions and bears
      g.beastT -= dt;
      if (g.m > 15 && g.beastT <= 0 && !g.warn && !g.beasts.some(b => !b.run)) { g.warn = { kind: Math.random() < .5 ? 'lion' : 'bear', t: 0 }; F.tone(140, .5, { type: 'sawtooth', to: 90, vol: .05, lp: 700 }); }
      if (g.warn) { g.warn.t += dt; if (g.warn.t > 1.3) { g.beasts.push({ kind: g.warn.kind, x: v.W + 70, run: false, took: false }); g.warn = null; const k = Math.min(1, g.m / 900); g.beastT = C.beast[1] + (C.beast[2] - C.beast[1]) * k + Math.random() * 3; } }
      for (const b of g.beasts) {
        if (b.run) b.x += (g.sp + 380) * dt; else b.x -= (g.sp * .35 + 140) * dt;
        if (!b.run && b.x < px + 44) { // it reached the flock
          b.run = true; b.took = true;
          if (g.flock > 0) { g.flock--; g.msg = { s: b.kind === 'lion' ? 'The lion took a lamb!' : 'The bear took a lamb!', t: 0 }; F.sfx.oops(); }
          else hurt(b.kind === 'lion' ? 'Roar!' : 'Grrr!');
          fx.shake(10);
        }
      }
      g.beasts = g.beasts.filter(b => b.x < v.W + 200 && b.x > -100);
      // distance points
      const m = Math.floor(g.dist / PXM);
      if (m > g.m) {
        add(m - g.m); g.m = m;
        if (m % 100 === 0) { fx.text(v.W / 2, v.H * .26, `${m} m!`, '#FFE58A', 32); F.sfx.good(); }
        if (!g.newBest && g.prevBest && m > g.prevBest) { g.newBest = true; fx.text(v.W / 2, v.H * .36, 'New best run!', '#FF8FA3', 28); F.sfx.win(); }
      }
    } else if (g.st === 'out') g.outT += dt;
    draw();
  }
  function hurt(s) {
    g.hearts--; g.hurt = 1.3; g.msg = { s, t: 0 };
    if (g.hearts <= 0) out();
  }
  function out() {
    g.st = 'out'; g.outT = 0; F.sfx.crash();
    run.m = Math.max(run.m, g.m); run.score = Math.max(run.score, g.pts); run.flock = Math.max(run.flock || 0, g.flock); run.scared = Math.max(run.scared, g.scared);
    const best = storeJSON('shep-best-m') || {};
    if (g.m > (best[run.diff] || 0)) { best[run.diff] = g.m; storeJSON('shep-best-m', best); }
    g.hiM = best[run.diff] || g.m;
  }
  const add = p => { g.pts += p; };

  /* ---------- drawing ---------- */
  function mix(a, b, t) { const p = h => h[0] === '#' ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) : h.match(/\d+/g).map(Number), A = p(a), B = p(b); return `rgb(${A.map((c, i) => Math.round(c + (B[i] - c) * t)).join(',')})`; }
  function draw() {
    const cx = v.cx, W = v.W, H = v.H, gy = GY();
    v.reset(); cx.save(); fx.pre(cx);
    // day turns to sunset, then a starry night, then morning again
    const cyc = (g.m % 1600) / 1600, night = cyc < .45 ? 0 : cyc < .6 ? (cyc - .45) / .15 : cyc < .85 ? 1 : 1 - (cyc - .85) / .15;
    const dusk = cyc > .35 && cyc < .6 ? Math.sin((cyc - .35) / .25 * Math.PI) : 0;
    const sk = cx.createLinearGradient(0, 0, 0, gy);
    sk.addColorStop(0, mix(mix('#7FC8F8', '#E8875A', dusk * .7), '#141B3D', night)); sk.addColorStop(1, mix(mix('#E6F6FF', '#FFD18A', dusk), '#3A3F6E', night));
    cx.fillStyle = sk; cx.fillRect(-30, -30, W + 60, gy + 31);
    if (night > .2) { cx.fillStyle = `rgba(255,255,255,${night})`; for (let i = 0; i < 46; i++) { const x = (i * 97.3 - g.dist * .01) % W, xx = x < 0 ? x + W : x, y = (i * 53.7) % (gy * .7); cx.beginPath(); cx.arc(xx, y, 1 + (i % 3) * .5 + Math.sin(g.t * 3 + i) * .3, 0, 7); cx.fill(); } cx.beginPath(); cx.arc(W * .8, H * .14, 20, 0, 7); cx.fillStyle = `rgba(255,246,210,${night})`; cx.fill(); }
    else { cx.beginPath(); cx.arc(W * .8, H * .14 + dusk * 60, 26, 0, 7); cx.fillStyle = '#FFE58A'; cx.fill(); }
    // far hills, near hills (parallax)
    for (const [f, col, hh, ph] of [[.15, mix('#A8D68F', '#2F3E5C', night), 110, 0], [.4, mix('#86C46F', '#26364E', night), 70, 2]]) {
      cx.beginPath(); cx.moveTo(-10, gy); for (let x = -10; x <= W + 10; x += 20) { const wx = x + g.dist * f; cx.lineTo(x, gy - hh - Math.sin(wx * .006 + ph) * 30 - Math.sin(wx * .017) * 12); } cx.lineTo(W + 10, gy); cx.closePath(); cx.fillStyle = col; cx.fill();
    }
    // little Bethlehem far away
    { const bx = ((W * 1.4 - g.dist * .15) % (W * 2.2) + W * 2.2) % (W * 2.2) - 200; for (let i = 0; i < 4; i++) { cx.fillStyle = mix('#E8D6B0', '#5A5F80', night); cx.fillRect(bx + i * 34, gy - 120 - (i % 2) * 14, 28, 26 + (i % 2) * 14); cx.lineWidth = 2; cx.strokeStyle = 'rgba(19,32,58,.5)'; cx.strokeRect(bx + i * 34, gy - 120 - (i % 2) * 14, 28, 26 + (i % 2) * 14); } }
    // ground
    cx.fillStyle = mix('#7CC36A', '#2C4A3A', night); cx.fillRect(-20, gy, W + 40, H - gy + 20);
    cx.fillStyle = mix('#E3C48C', '#5A5040', night); cx.fillRect(-20, gy, W + 40, 16);
    cx.beginPath(); cx.moveTo(-20, gy); cx.lineTo(W + 20, gy); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    for (let i = 0; i < 14; i++) { const x = ((i * 90 - g.dist) % (W + 90) + W + 90) % (W + 90) - 45; cx.beginPath(); cx.moveTo(x, gy + 30); cx.lineTo(x + 4, gy + 22); cx.lineTo(x + 8, gy + 30); cx.strokeStyle = 'rgba(19,32,58,.3)'; cx.lineWidth = 2; cx.stroke(); }
    for (const o of g.obs) drawObs(cx, o, gy);
    for (const s of g.sheep) drawSheep(cx, s.x, gy + s.y, 1, g.t * 2 + s.bob, false);
    // the flock following David
    const shown = Math.min(7, g.flock);
    for (let k = 0; k < shown; k++) drawSheep(cx, DX() - 46 - k * 30, gy, .8, g.t * 14 + k, true);
    if (g.flock > 7) F.say(cx, `+${g.flock - 7}`, DX() - 46 - 7 * 30, gy - 50, { size: 16 });
    drawDavid(cx, gy);
    for (const b of g.beasts) drawBeast(cx, b, gy);
    fx.draw(cx);
    cx.restore();
    if (g.warn) { const a = .5 + Math.sin(g.t * 18) * .5; cx.globalAlpha = a; F.say(cx, '!', W - 40, gy - 60, { size: 60, col: '#FF5A5A' }); F.say(cx, g.warn.kind === 'lion' ? 'A lion!' : 'A bear!', W - 70, gy - 120, { size: 22, col: '#FFE58A' }); cx.globalAlpha = 1; }
    drawHud(cx);
  }
  function drawObs(cx, o, gy) {
    cx.lineWidth = 3; cx.strokeStyle = ink;
    if (o.kind === 'rock') {
      cx.beginPath(); cx.moveTo(o.x - o.w / 2, gy); cx.lineTo(o.x - o.w * .4, gy - o.h * .7); cx.lineTo(o.x - o.w * .1, gy - o.h); cx.lineTo(o.x + o.w * .3, gy - o.h * .85); cx.lineTo(o.x + o.w / 2, gy); cx.closePath();
      cx.fillStyle = '#9A9AA5'; cx.fill(); cx.stroke(); cx.beginPath(); cx.moveTo(o.x - o.w * .2, gy - o.h * .7); cx.lineTo(o.x, gy - o.h * .5); cx.strokeStyle = 'rgba(19,32,58,.35)'; cx.stroke();
    } else if (o.kind === 'bush') {
      cx.fillStyle = '#3E8E41'; for (const [dx, dy, r] of [[-.3, .45, .32], [.05, .7, .36], [.32, .45, .3]]) { cx.beginPath(); cx.arc(o.x + dx * o.w, gy - dy * o.h, r * o.w * .7, 0, 7); cx.fill(); cx.stroke(); }
      cx.strokeStyle = '#2B1B12'; cx.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = -2.6 + k * .45, x0 = o.x + Math.cos(a) * o.w * .42, y0 = gy - o.h * .5 + Math.sin(a) * o.h * .55; cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x0 + Math.cos(a) * 8, y0 + Math.sin(a) * 8); cx.stroke(); }
    } else {
      cx.fillStyle = '#4FA3E8'; cx.fillRect(o.x, gy - 2, o.w, 40); cx.strokeStyle = ink; cx.beginPath(); cx.moveTo(o.x, gy); cx.lineTo(o.x, gy + 38); cx.moveTo(o.x + o.w, gy); cx.lineTo(o.x + o.w, gy + 38); cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2; for (let k = 0; k < 3; k++) { cx.beginPath(); for (let x = 0; x <= o.w; x += 8) { const y = gy + 6 + k * 10 + Math.sin(x * .2 + g.t * 6 + k) * 2; x === 0 ? cx.moveTo(o.x + x, y) : cx.lineTo(o.x + x, y); } cx.stroke(); }
    }
  }
  function drawSheep(cx, x, y, s, ph, run_) {
    cx.save(); cx.translate(x, y - (run_ ? Math.abs(Math.sin(ph)) * 6 : 0)); cx.scale(s, s); cx.lineWidth = 2.5; cx.strokeStyle = ink;
    for (const lx of [-10, -4, 6, 12]) { const sw = run_ ? Math.sin(ph + lx) * 4 : 0; cx.beginPath(); cx.moveTo(lx, -10); cx.lineTo(lx + sw, 0); cx.lineWidth = 4; cx.strokeStyle = ink; cx.stroke(); }
    cx.fillStyle = '#FFFFFF'; cx.lineWidth = 2.5;
    for (const [dx, dy, r] of [[-12, -20, 10], [-2, -26, 11], [9, -21, 10], [0, -16, 12], [-10, -14, 8], [10, -14, 8]]) { cx.beginPath(); cx.arc(dx, dy, r, 0, 7); cx.fill(); cx.stroke(); }
    cx.fillStyle = '#FFFFFF'; for (const [dx, dy, r] of [[-12, -20, 8], [-2, -26, 9], [9, -21, 8], [0, -16, 10]]) { cx.beginPath(); cx.arc(dx, dy, r, 0, 7); cx.fill(); }
    cx.beginPath(); cx.ellipse(22, -24, 8, 6, .3, 0, 7); cx.fillStyle = '#2B2B2B'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.arc(24, -26, 1.8, 0, 7); cx.fillStyle = '#fff'; cx.fill();
    cx.restore();
  }
  function drawDavid(cx, gy) {
    const x = DX(), y = gy + g.y, flick = g.hurt > 0 && Math.floor(g.t * 14) % 2 === 0;
    if (flick) return;
    const running = g.st === 'play' && !g.air, ph = g.dist / 22;
    F.person(cx, Object.assign({}, DAVID, {
      x, y: y + 2, s: v.W < 520 ? .82 : .95, mood: g.hurt > .4 ? 'oops' : g.st === 'out' ? 'worried' : g.air ? 'wow' : 'happy', blink: F.blink(g.t, 3),
      walk: running ? ph : g.air ? 1.2 : undefined, bounce: running ? -Math.abs(Math.sin(ph)) * 4 : 0, lean: running ? .08 : 0,
      armL: g.air ? -1.8 : -.4 - Math.sin(ph) * .4, armR: (g.staffT || 0) > 0 ? -2.2 : g.air ? 1.8 : 1.0 + Math.sin(ph) * .3
    }));
    // his shepherd's staff
    const s = v.W < 520 ? .82 : .95, up = (g.staffT || 0) > 0;
    cx.save(); cx.translate(x + 20 * s, y - 50 * s); cx.rotate(up ? -.6 : .15); cx.lineWidth = 5; cx.strokeStyle = '#6B4423';
    cx.beginPath(); cx.moveTo(0, 46 * s); cx.lineTo(0, -40 * s); cx.arc(-9 * s, -40 * s, 9 * s, 0, Math.PI, true); cx.stroke(); cx.restore();
  }
  function drawBeast(cx, b, gy) {
    const lion = b.kind === 'lion', ph = g.t * 16, dir = b.run ? 1 : -1;
    cx.save(); cx.translate(b.x, gy); cx.scale(dir, 1); cx.lineWidth = 3; cx.strokeStyle = ink;
    const body = lion ? '#E0A24A' : '#7A4B2E', dark = lion ? '#B5651D' : '#5A3420';
    for (const lx of [-26, -14, 14, 26]) { const sw = Math.sin(ph + lx) * 8; cx.beginPath(); cx.moveTo(lx, -24); cx.lineTo(lx + sw, 0); cx.lineWidth = 9; cx.strokeStyle = ink; cx.stroke(); cx.lineWidth = 5; cx.strokeStyle = body; cx.stroke(); }
    cx.lineWidth = 3; cx.strokeStyle = ink;
    cx.beginPath(); cx.ellipse(0, -36, lion ? 38 : 42, lion ? 20 : 25, 0, 0, 7); cx.fillStyle = body; cx.fill(); cx.stroke();
    if (lion) { cx.beginPath(); cx.moveTo(-36, -40); cx.quadraticCurveTo(-60, -60, -52, -30); cx.stroke(); cx.beginPath(); cx.arc(-52, -30, 5, 0, 7); cx.fillStyle = dark; cx.fill(); }
    const hx = 40, hy = lion ? -48 : -44;
    if (lion) { cx.beginPath(); cx.arc(hx, hy, 26, 0, 7); cx.fillStyle = dark; cx.fill(); cx.stroke(); }
    else { for (const ex of [-12, 12]) { cx.beginPath(); cx.arc(hx + ex, hy - 16, 7, 0, 7); cx.fillStyle = body; cx.fill(); cx.stroke(); } }
    cx.beginPath(); cx.arc(hx, hy, lion ? 17 : 19, 0, 7); cx.fillStyle = body; cx.fill(); cx.stroke();
    cx.beginPath(); cx.ellipse(hx + 10, hy + 6, 8, 6, 0, 0, 7); cx.fillStyle = lion ? '#F4D79A' : '#A8714A'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.arc(hx + 14, hy + 3, 2.5, 0, 7); cx.fillStyle = ink; cx.fill();
    // eyes: fierce while hunting, wide and scared when running away
    for (const ex of [-2, 8]) { cx.beginPath(); cx.arc(hx + ex, hy - 6, b.run ? 4 : 2.6, 0, 7); cx.fillStyle = b.run ? '#fff' : ink; cx.fill(); if (b.run) { cx.stroke(); cx.beginPath(); cx.arc(hx + ex + 1, hy - 6, 1.6, 0, 7); cx.fillStyle = ink; cx.fill(); } }
    if (!b.run) { cx.beginPath(); cx.moveTo(hx - 6, hy - 12); cx.lineTo(hx + 12, hy - 9); cx.lineWidth = 2.5; cx.stroke(); }
    if (b.took && g.flock >= 0) drawSheep(cx, hx - 6, hy + 36, .6, 0, false);
    cx.restore();
    if (!b.run && g.st === 'play') { const r = 52 + Math.sin(g.t * 10) * 4; cx.beginPath(); cx.arc(b.x, gy - 40, r, 0, 7); cx.lineWidth = 3; cx.strokeStyle = 'rgba(255,212,71,.8)'; cx.setLineDash([8, 6]); cx.stroke(); cx.setLineDash([]); F.say(cx, 'TAP!', b.x, gy - 106, { size: 20, col: '#FFE58A' }); }
  }
  function drawHud(cx) {
    const W = v.W, H = v.H, ty = W < 440 ? 50 : 12;
    F.pill(cx, 16, ty, 104, 26, '#FFF3C4', `★ ${g.pts}`, { size: 14 });
    F.pill(cx, W / 2 - 62, 8, 124, 34, '#C9F2DD', `🏃 ${g.m} m`, { size: 19 });
    F.pill(cx, W - 16 - 96, ty, 96, 26, '#FFD0DA', '♥'.repeat(Math.max(0, g.hearts)) || '–', { size: 13, col: '#D7263D' });
    F.pill(cx, 16, ty + 32, 104, 24, '#FFFFFF', `🐑 ${g.flock}`, { size: 14 });
    if (g.prevBest && g.st === 'play' && !g.newBest) F.pill(cx, W - 16 - 110, ty + 32, 110, 24, '#E4ECFF', `Best ${g.prevBest} m`, { size: 12 });
    if (g.msg && g.msg.t < 1.1 && g.st === 'play') { cx.globalAlpha = Math.min(1, (1.1 - g.msg.t) * 3); F.say(cx, g.msg.s, W / 2, H * .3, { size: Math.min(30, W / 13), col: '#FF8FA3' }); cx.globalAlpha = 1; }
    if (g.st === 'play' && g.t < 6 && run.tries === 0) { cx.globalAlpha = .7; F.say(cx, 'Tap to jump!', W / 2, H * .42, { size: 26, col: '#fff' }); cx.globalAlpha = 1; }
    if (g.st === 'intro') card(cx, 'Run, little shepherd!', TIPS, 'Tap to start running!');
    if (g.st === 'out') outCard(cx);
  }
  function card(cx, title, lines, go) {
    const W = v.W, H = v.H, w = Math.min(W - 24, 480), h = 96 + lines.length * 28 + 40, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.fillStyle = 'rgba(10,16,40,.35)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, title, W / 2, y + 36, { size: Math.min(28, w / 15), col: '#FFD447' });
    cx.font = '800 ' + Math.min(16, w / 27) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    lines.forEach((l, i) => cx.fillText(l, W / 2, y + 76 + i * 28));
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2, y + h - 30); cx.scale(pulse, pulse); F.pill(cx, -120, -20, 240, 40, '#14946B', ''); F.say(cx, go, 0, 1, { size: 18 }); cx.restore();
  }
  function outCard(cx) {
    const W = v.W, H = v.H, w = Math.min(W - 24, 460), h = 240, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.globalAlpha = Math.min(1, g.outT * 3);
    cx.fillStyle = 'rgba(10,16,40,.4)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, 'Time for a rest, David!', W / 2, y + 34, { size: Math.min(26, w / 15), col: '#FFD447' });
    F.say(cx, `${g.m} m`, W / 2, y + 80, { size: 44, col: '#6FCB5C' });
    cx.font = '800 ' + Math.min(16, w / 27) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(g.newBest || !g.prevBest ? `Your furthest run ever! · ★ ${g.pts}` : `Your best: ${g.hiM} m · ★ ${g.pts}`, W / 2, y + 120);
    cx.fillText(`🐑 ${g.flock} sheep · Chased off ${g.scared} lion${g.scared === 1 ? '' : 's'} & bear${g.scared === 1 ? '' : 's'}`, W / 2, y + 146);
    const bw = Math.min(190, (w - 48) / 2), by = y + h - 62;
    g.btns = [{ k: 'again', x: W / 2 - bw - 8, y: by, w: bw, h: 46 }, { k: 'done', x: W / 2 + 8, y: by, w: bw, h: 46 }];
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2 - bw / 2 - 8, by + 23); cx.scale(pulse, pulse); F.pill(cx, -bw / 2, -23, bw, 46, '#14946B', ''); F.say(cx, 'Run again', 0, 1, { size: Math.min(18, bw / 7.5) }); cx.restore();
    F.pill(cx, W / 2 + 8, by, bw, 46, '#F2B632', ''); F.say(cx, 'Finish ➜', W / 2 + 8 + bw / 2, by + 24, { size: Math.min(18, bw / 7.5) });
    cx.globalAlpha = 1;
  }

  function finish() {
    const diff = run.diff, C = run.C, stars = run.m >= C.stars[1] ? 3 : run.m >= C.stars[0] ? 2 : 1;
    const best = storeJSON('shep-best') || {}, prev = best[diff] || 0;
    if (run.score > prev) { best[diff] = run.score; storeJSON('shep-best', best); }
    const badges = [];
    if (run.m >= 1000) badges.push('Marathon Shepherd'); else if (run.m >= 500) badges.push('Swift Shepherd');
    if ((run.flock || 0) >= 20) badges.push('Good Shepherd');
    if (run.scared >= 5) badges.push('Brave as David');
    stop();
    Ark.finish(el, {
      id: ID, diff, stars, title: 'What a brave shepherd!',
      html: `<p class="story">Furthest run: <b>${run.m} m</b> · Score: <b>${run.score}</b>${run.score > prev && prev ? ' · <b>New best!</b>' : ''}</p>
        ${badges.length ? `<p class="story">${badges.map(b => `🏅 ${b}`).join(' &nbsp; ')}</p>` : ''}`,
      verse: ['The LORD that delivered me out of the paw of the lion, and out of the paw of the bear, he will deliver me out of the hand of this Philistine.', '1 Samuel 17:37 (KJV)'],
      lesson: 'Before David ever faced Goliath, he was a young shepherd who took care of every sheep. When a lion or a bear came, he trusted God to help him. God was with David in the small, everyday jobs, and He is with you too.',
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
    _test: { state: () => g, run: () => run, press: p => press(p), scare: b => scare(b), DX: () => DX(), GY: () => GY() }
  };
})();
