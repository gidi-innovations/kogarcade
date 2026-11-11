/* Peter Walks on Water (Matthew 14:22–33).
   Jesus says "Come." Hold your finger on Jesus and Peter walks to Him across the waves. Look away (lift your finger
   or lose Him in the storm) and Peter starts to sink, until Jesus stretches out His hand and catches him.
   Three stretches of sea, then the wind ceases and the disciples worship Him. */
(() => {
  const { store, storeJSON, say, hush } = Ark;
  const F = Ark.fun, ink = '#13203A';
  const ID = 'peter-water';
  const D = {
    easy: { r: 80, walk: 1 / 15, sinkUp: .42, sinkDown: .9, move: [.3, .45, .6], gust: [0, 7, 5.5], waves: [0, 6, 4.5], hearts: Infinity },
    normal: { r: 64, walk: 1 / 18, sinkUp: .58, sinkDown: .8, move: [.45, .65, .85], gust: [9, 5.5, 4.2], waves: [9, 5, 3.6], hearts: 3 },
    hard: { r: 52, walk: 1 / 21, sinkUp: .72, sinkDown: .7, move: [.6, .85, 1.1], gust: [6, 4.2, 3.2], waves: [6, 4, 2.8], hearts: 2 }
  };
  const ST = [
    { name: 'Step Out of the Boat', tip: ['Jesus said, “Come.” (Matthew 14:29)', 'HOLD your finger on Jesus to walk to Him.', 'Lift your finger and Peter starts to sink!'] },
    { name: 'The Wind Was Boisterous', tip: ['Wind and waves rock you about.', 'Keep your finger on Jesus as He moves.', 'Watch out for the wind arrows!'] },
    { name: 'Eyes on Jesus!', tip: ['Big waves, lightning and wind!', 'Don’t look at the storm.', 'Keep your eyes on Jesus all the way!'] }
  ];
  const JESUS = { skin: '#A06A45', robe: '#F4F1EA', trim: '#C0392B', hair: '#4A2E1C', beard: '#4A2E1C', belt: '#C0392B' };
  const PETER = { skin: '#8D5A3B', robe: '#1F55D6', trim: '#F2A007', hair: '#5A3A24', beard: '#8A8A8A', head: null };

  let el, v = null, L = null, fx = null, g = null, run = null;
  const newRun = d => ({ diff: d, C: D[d], st: 0, score: 0, stars: [], sinks: 0, best: 0 });

  function menu() {
    stop();
    const best = storeJSON('peter-best') || {};
    Ark.menu(el, {
      id: ID, title: 'Peter Walks on Water', icon: 'wave', color: '#1F55D6',
      blurb: 'Jesus says “Come!” Keep your eyes on Jesus and walk to Him across the stormy sea.',
      how: [['tap', 'Hold your finger on Jesus'], ['drag', 'Follow Him as He moves'], ['heart', 'Don’t look at the storm!']],
      listen: 'Hold your finger on Jesus and Peter walks to Him on the water. Follow Jesus with your finger as the boat rocks and the wind blows. If you lift your finger, Peter starts to sink!',
      diffs: { easy: 'A big target and gentle waves.', normal: 'Wind gusts and rolling waves.', hard: 'A wild storm. Only 2 tries per stretch!' },
      extra: Object.keys(best).length ? `<p style="margin:0;text-align:center;font-weight:800;color:var(--muted)">Best score: ${Ark.DIFFS.filter(d => best[d]).map(d => `${Ark.DLABEL[d]} ${best[d]}`).join(' · ')}</p>` : '',
      start: d => { run = newRun(d); play(); }
    });
  }

  function play() {
    stop();
    el.innerHTML = '<div id="pwHost"></div>';
    v = F.view(el.querySelector('#pwHost'), { h: innerHeight < 520 && innerWidth > innerHeight ? 432 : 600, minA: .56, maxA: 2.2, label: 'Peter walking on the stormy sea towards Jesus. Hold your finger on Jesus.' });
    fx = F.fx();
    g = {
      st: 'intro', t: 0, ta: Math.random() * 6, prog: 0, sink: 0, px: -999, py: -999, down: false, kb: false, kx: 0, ky: 0,
      on: false, held: 0, jx: 0, sway: 0, swayV: 0, gust: null, gustT: 0, wave: null, waveT: 3, flash: 0, flashT: 4, sea: 0,
      hearts: run.C.hearts, sinks: 0, pts: 0, msg: null, sunkT: 0, endT: 0, best: 0, spark: 0
    };
    bind();
    L = F.loop(step);
    Ark.ctl({
      help: () => say(ST[run.st].tip.join(' '), true),
      pause: () => L && L.pause(), resume: () => L && L.resume(),
      restart: () => { run.score -= g ? g.pts : 0; play(); }
    });
  }

  /* ---------- input: press and hold on Jesus ---------- */
  function bind() {
    const cv = v.cv;
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      if (!g) return; const p = v.pt(e); g.kb = false;
      if (g.st !== 'play') { tap(); return; }
      g.down = true; g.px = p.x; g.py = p.y;
    });
    cv.addEventListener('pointermove', e => { if (!g || !g.down) return; const p = v.pt(e); g.px = p.x; g.py = p.y; });
    const up = () => { if (g) g.down = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    g.keys = {};
    g.onKey = e => {
      if (!g) return; const on = e.type === 'keydown';
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault(); g.keys[e.key] = on;
        if (on && !g.kb && g.st === 'play') { const j = jesus(); g.kb = true; g.kx = j.x; g.ky = j.y - 50 * j.sc; }
      } else if ((e.key === ' ' || e.key === 'Enter') && on && !e.repeat) { e.preventDefault(); if (g.st !== 'play') tap(); }
    };
    addEventListener('keydown', g.onKey); addEventListener('keyup', g.onKey);
  }
  function tap() {
    if (g.st === 'intro') { g.st = 'play'; F.sfx.pop(); return; }
    if (g.st === 'done') { run.st++; play(); return; }
    if (g.st === 'out') { run.score -= g.pts; play(); return; }
    if (g.st === 'finale' && g.endT > 3.2) finish();
  }

  /* ---------- where Jesus is on the screen ---------- */
  function jesus() {
    const W = v.W, H = v.H, hz = H * .3, near = Math.min(1, g.prog) * .78;
    const sc = .45 + near * .75;
    const y = hz + 34 + near * H * .3 + Math.sin(g.t * 1.7) * 4;
    const x = W / 2 + g.jx * W * .32 * (1 - near * .2) + g.sway;
    return { x, y, sc };
  }
  const hitR = () => run.C.r * (.75 + jesus().sc * .4);
  const looking = () => {
    const j = jesus(), px = g.kb ? g.kx : g.px, py = g.kb ? g.ky : g.py;
    return (g.down || g.kb) && Math.hypot(px - j.x, py - (j.y - 52 * j.sc)) < hitR();
  };

  /* ---------- update ---------- */
  function step(dt) {
    if (!g) return;
    g.t += dt; fx.update(dt);
    const C = run.C, s = run.st;
    if (g.st === 'play') {
      // Jesus walks on the water, side to side
      g.ta += dt * C.move[s];
      g.jx = Math.max(-.95, Math.min(.95, .58 * Math.sin(g.ta) + .3 * Math.sin(g.ta * 2.3 + 1.1)));
      // the wind: a warning arrow, then a push that rocks the whole view
      if (C.gust[s]) {
        g.gustT += dt;
        if (!g.gust && g.gustT > C.gust[s]) { g.gustT = 0; g.gust = { dir: Math.random() < .5 ? -1 : 1, t: 0 }; F.sfx.whoosh(); }
        if (g.gust) { g.gust.t += dt; if (g.gust.t > .9 && g.gust.t < 1.6) g.swayV += g.gust.dir * v.W * 1.5 * dt; if (g.gust.t > 1.8) g.gust = null; }
      }
      g.swayV += (-g.sway * 5 - g.swayV * 2.2) * dt; g.sway += g.swayV * dt;
      // big waves roll up in front of Jesus
      if (C.waves[s]) { g.waveT -= dt; if (g.waveT <= 0) { g.waveT = C.waves[s] * (.7 + Math.random() * .6); g.wave = { t: 0, x: (Math.random() - .5) * .6 }; F.sfx.splash(.6); } }
      if (g.wave) { g.wave.t += dt; if (g.wave.t > 2.2) g.wave = null; }
      // lightning on the last stretch
      if (s === 2) { g.flashT -= dt; if (g.flashT <= 0) { g.flashT = 3.5 + Math.random() * 3; g.flash = .25; F.sfx.thunder(); fx.shake(8); } }
      g.flash = Math.max(0, g.flash - dt);
      // keyboard gaze
      if (g.kb) { const k = g.keys, sp = 420 * dt; g.kx += ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * sp; g.ky += ((k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0)) * sp; g.kx = Math.max(0, Math.min(v.W, g.kx)); g.ky = Math.max(0, Math.min(v.H, g.ky)); }
      // walking, or sinking
      const on = looking();
      if (on && !g.on) F.tone(660, .12, { type: 'triangle', to: 880, vol: .04 });
      g.on = on;
      if (on) {
        g.found = true; g.held += dt; g.best = Math.max(g.best, g.held);
        g.prog += dt * C.walk * (g.sink > .3 ? .6 : 1); g.sea += dt * 1.6;
        g.sink = Math.max(0, g.sink - dt * C.sinkDown);
        const mult = 1 + Math.min(4, Math.floor(g.held / 3));
        add(dt * 12 * mult);
        if (Math.floor(g.held / 3) !== Math.floor((g.held - dt) / 3) && mult > 1) { fx.text(jesus().x, jesus().y - 140 * jesus().sc, `Eyes on Jesus ×${mult}`, '#FFE58A', 22); F.sfx.good(); }
        g.spark += dt; if (g.spark > .12) { g.spark = 0; const j = jesus(); fx.burst(j.x + (Math.random() - .5) * 60 * j.sc, j.y - 60 * j.sc, 1, ['#FFE58A', '#fff'], { speed: 40, g: -60, life: .8, size: 4 }); }
      } else {
        if (g.held > 1) F.tone(300, .2, { type: 'triangle', to: 200, vol: .04 });
        g.held = 0; g.idle = (g.idle || 0) + dt;
        // a little grace at the start, until the child first finds Jesus
        if (g.found || g.idle > 4) g.sink += dt * C.sinkUp;
        g.sea += dt * .3;
        if (g.sink > .75 && !g.saveSaid) { g.saveSaid = true; F.sfx.oops(); }
        if (g.sink >= 1) sunk();
      }
      if (g.sink < .5) g.saveSaid = false;
      if (g.prog >= 1) reached();
    } else if (g.st === 'sunk') {
      g.sunkT += dt; g.sway *= .9;
      if (g.sunkT > 3.2) { g.st = g.hearts <= 0 ? 'out' : 'play'; g.sink = 0; g.down = false; }
    } else if (g.st === 'reached' || g.st === 'finale') {
      g.endT += dt; g.sway *= .92;
      if (g.st === 'reached' && g.endT > 1.6) { g.st = run.st < 2 ? 'done' : 'finale'; g.endT = 0; if (g.st === 'finale') F.sfx.win(); else F.sfx.good(); }
    }
    draw();
  }
  function sunk() {
    g.st = 'sunk'; g.sunkT = 0; g.sinks++; run.sinks++; g.held = 0;
    if (g.hearts !== Infinity) g.hearts--;
    g.prog = Math.max(0, g.prog - .06);
    F.sfx.splash(1.2); fx.shake(6);
  }
  function reached() {
    g.st = 'reached'; g.endT = 0; g.prog = 1; add(200);
    const stars = g.sinks === 0 ? 3 : g.sinks === 1 ? 2 : 1;
    run.stars[run.st] = stars; g.stStars = stars; run.best = Math.max(run.best, Math.round(g.best));
    F.sfx.cheer(); const j = jesus(); fx.burst(j.x, j.y - 60 * j.sc, 30, ['#FFE58A', '#fff', '#8FD0FF'], { speed: 240, g: 80, life: 1 });
  }
  const add = p => { g.pts += p; run.score += p; };

  /* ---------- drawing ---------- */
  function draw() {
    const cx = v.cx, W = v.W, H = v.H, s = run.st, calmNow = g.st === 'finale';
    v.reset(); cx.save(); fx.pre(cx);
    const hz = H * .3;
    // night sky
    const sk = cx.createLinearGradient(0, 0, 0, hz);
    if (calmNow) { sk.addColorStop(0, '#2B4C9B'); sk.addColorStop(1, '#F7C98B'); }
    else { sk.addColorStop(0, ['#1C2E5E', '#16213F', '#0E1430'][s]); sk.addColorStop(1, ['#4E6AA8', '#3A4C7A', '#2B3458'][s]); }
    cx.fillStyle = sk; cx.fillRect(-30, -30, W + 60, hz + 31);
    if (calmNow || s === 0) { cx.beginPath(); cx.arc(W * .82, hz * .38, 22, 0, 7); cx.fillStyle = '#FFF3C4'; cx.fill(); }
    // storm clouds
    if (!calmNow) { cx.fillStyle = s === 0 ? 'rgba(120,140,190,.5)' : 'rgba(40,50,80,.85)'; for (let i = 0; i < 7; i++) { const x = ((i * 190 + g.t * (12 + s * 16)) % (W + 240)) - 120, y = 30 + (i % 3) * 26; for (const [dx, dy, r] of [[0, 0, 34], [36, -12, 40], [74, 0, 30]]) { cx.beginPath(); cx.arc(x + dx, y + dy, r, 0, 7); cx.fill(); } } }
    // the sea
    const sea = cx.createLinearGradient(0, hz, 0, H);
    if (calmNow) { sea.addColorStop(0, '#5D8FD8'); sea.addColorStop(1, '#2E5FA8'); } else { sea.addColorStop(0, ['#2F5596', '#24447E', '#1B3567'][s]); sea.addColorStop(1, ['#173A75', '#122E60', '#0D2450'][s]); }
    cx.fillStyle = sea; cx.fillRect(-30, hz, W + 60, H - hz + 30);
    drawSeaLines(cx, hz, calmNow ? 0 : s + 1);
    // the boat, left behind as Peter walks
    drawBoat(cx, W * .14 - Math.min(1, g.prog) * W * .5 + (run.st > 0 && g.st !== 'finale' ? -W : 0) + (g.st === 'finale' ? W * .6 : 0), hz + 40, g.st === 'finale');
    // Jesus walking on the water
    const j = jesus();
    if (g.st !== 'finale') {
      if (g.st === 'play') { // the target ring
        const on = g.on, r = hitR();
        cx.beginPath(); cx.arc(j.x, j.y - 52 * j.sc, r + (on ? 0 : Math.sin(g.t * 5) * 4), 0, 7);
        cx.lineWidth = on ? 6 : 3; cx.strokeStyle = on ? 'rgba(255,212,71,.95)' : 'rgba(255,240,180,.55)'; cx.setLineDash(on ? [] : [10, 10]); cx.stroke(); cx.setLineDash([]);
        if (on) { cx.fillStyle = 'rgba(255,230,140,.12)'; cx.fill(); }
      }
      const glow = cx.createRadialGradient(j.x, j.y - 50 * j.sc, 4, j.x, j.y - 50 * j.sc, 110 * j.sc);
      glow.addColorStop(0, 'rgba(255,240,180,.55)'); glow.addColorStop(1, 'rgba(255,240,180,0)'); cx.fillStyle = glow; cx.fillRect(j.x - 120, j.y - 170 * j.sc, 240, 240 * j.sc);
      F.person(cx, Object.assign({}, JESUS, { x: j.x, y: j.y, s: j.sc, mood: 'happy', blink: F.blink(g.t, 8), armL: g.st === 'sunk' ? .3 : -.5, armR: g.st === 'sunk' || g.st === 'reached' ? 2.0 : .5, walk: g.t * 2 }));
      // the water around His feet
      cx.beginPath(); cx.ellipse(j.x, j.y, 30 * j.sc, 6 * j.sc, 0, 0, 7); cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 2; cx.stroke();
      // a big wave rolling up in front of Him
      if (g.wave) drawWave(cx, j, g.wave);
    }
    drawPeter(cx);
    fx.draw(cx);
    cx.restore();
    // lightning flash
    if (g.flash > 0) { cx.fillStyle = `rgba(255,255,255,${g.flash * 2.4})`; cx.fillRect(0, 0, W, H); }
    // sinking: the edges go dark and cold
    if (g.sink > .05 && g.st === 'play') { const vg = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(10,20,60,0)'); vg.addColorStop(1, `rgba(10,20,60,${g.sink * .75})`); cx.fillStyle = vg; cx.fillRect(0, 0, W, H); }
    if (g.gust && g.gust.t < 1.6) drawGust(cx);
    if (g.kb && g.st === 'play') { cx.beginPath(); cx.arc(g.kx, g.ky, 16, 0, 7); cx.lineWidth = 4; cx.strokeStyle = '#FFD447'; cx.stroke(); cx.beginPath(); cx.arc(g.kx, g.ky, 3, 0, 7); cx.fillStyle = '#FFD447'; cx.fill(); }
    drawHud(cx);
  }
  function drawSeaLines(cx, hz, rough) {
    const W = v.W, H = v.H;
    // rows of waves that come towards you as Peter walks
    for (let i = 0; i < 9; i++) {
      const f = ((i + g.sea) % 9) / 9, y = hz + 8 + f * f * (H - hz), amp = (2 + f * 12) * (.4 + rough * .4), len = 40 + f * 120;
      cx.beginPath(); for (let x = -20; x <= W + 20; x += 12) { const yy = y + Math.sin(x / len * 6.28 + g.t * (1.5 + rough) + i) * amp; x === -20 ? cx.moveTo(x, yy) : cx.lineTo(x, yy); }
      cx.lineWidth = 1.5 + f * 3; cx.strokeStyle = `rgba(255,255,255,${.12 + f * .3})`; cx.stroke();
    }
  }
  function drawBoat(cx, x, y, home) {
    if (x < -200 || x > v.W + 200) return;
    cx.save(); cx.translate(x, y); cx.rotate(Math.sin(g.t * 1.4) * (home ? .02 : .08));
    cx.lineWidth = 3; cx.strokeStyle = ink;
    for (let i = 0; i < 4; i++) { const hx = -40 + i * 26; cx.beginPath(); cx.arc(hx, -26, 9, 0, 7); cx.fillStyle = ['#8D5A3B', '#6B4226', '#A8714A', '#7A4B2E'][i]; cx.fill(); cx.stroke(); cx.beginPath(); cx.arc(hx - 3, -27, 1.6, 0, 7); cx.arc(hx + 3, -27, 1.6, 0, 7); cx.fillStyle = ink; cx.fill(); }
    cx.beginPath(); cx.moveTo(-70, -16); cx.lineTo(70, -16); cx.lineTo(52, 8); cx.lineTo(-52, 8); cx.closePath(); cx.fillStyle = '#8B5A2B'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.moveTo(-60, -6); cx.lineTo(60, -6); cx.strokeStyle = 'rgba(19,32,58,.4)'; cx.stroke();
    cx.beginPath(); cx.moveTo(0, -16); cx.lineTo(0, -80); cx.lineWidth = 4; cx.strokeStyle = ink; cx.stroke();
    cx.restore();
    if (g.st === 'intro' && run.st === 0) F.bubble(cx, x, y - 90, 'Lord, if it be thou, bid me come!', { size: 14, W: v.W });
  }
  function drawWave(cx, j, w) {
    const k = Math.sin(Math.min(1, w.t / 2.2) * Math.PI), wx = j.x + w.x * 200, base = j.y + 20, h = 150 * j.sc * k;
    cx.beginPath(); cx.moveTo(wx - 220, base + 10);
    cx.quadraticCurveTo(wx - 90, base - h * .4, wx - 20, base - h); cx.quadraticCurveTo(wx + 30, base - h * 1.1, wx + 60, base - h * .75);
    cx.quadraticCurveTo(wx + 130, base - h * .2, wx + 220, base + 10); cx.closePath();
    const wg = cx.createLinearGradient(0, base - h, 0, base + 10); wg.addColorStop(0, 'rgba(60,110,190,.95)'); wg.addColorStop(1, 'rgba(36,68,126,0)');
    cx.fillStyle = wg; cx.fill();
    cx.beginPath(); cx.moveTo(wx - 40, base - h * .95); cx.quadraticCurveTo(wx + 10, base - h * 1.15, wx + 56, base - h * .78); cx.lineWidth = 6; cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.stroke();
  }
  function drawGust(cx) {
    const W = v.W, H = v.H, d = g.gust.dir, warn = g.gust.t < .9;
    cx.save(); cx.globalAlpha = warn ? .5 + Math.sin(g.t * 20) * .4 : .8;
    for (let i = 0; i < 5; i++) { const y = H * (.38 + i * .1), x = ((g.gust.t * 900 * d + i * 140) % (W + 200) + W + 200) % (W + 200) - 100; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + d * 80, y); cx.lineWidth = 4; cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.stroke(); }
    if (warn) F.say(cx, d > 0 ? 'Wind! ➜' : '⬅ Wind!', W / 2, H * .22, { size: Math.min(34, W / 11), col: '#FFB347' });
    cx.restore();
  }
  function drawPeter(cx) {
    const W = v.W, H = v.H, x = W < 520 ? W * .2 : W * .16, wl = H * .9;
    const fin = g.st === 'finale', sink = fin ? 0 : g.sink, sunkNow = g.st === 'sunk';
    const dip = sunkNow ? Math.max(0, 90 - g.sunkT * 60) : sink * 70;
    const walking = g.on && g.st === 'play';
    const s = W < 520 ? .95 : 1.15;
    if (fin) {
      // Peter and Jesus together at the boat
      const bx = W * .55;
      F.person(cx, Object.assign({}, JESUS, { x: bx + 60, y: H * .86, s: 1.05, mood: 'happy', blink: F.blink(g.t, 8), armL: .2, armR: .2 }));
      F.person(cx, Object.assign({}, PETER, { x: bx - 40, y: H * .86, s: 1, mood: 'wow', blink: F.blink(g.t, 2), armL: -2.3, armR: 2.3, bounce: -Math.abs(Math.sin(g.t * 5)) * 6 }));
      return;
    }
    F.person(cx, Object.assign({}, PETER, {
      x, y: wl + dip, s, mood: sunkNow ? (g.sunkT > 1.2 ? 'happy' : 'oops') : sink > .6 ? 'oops' : walking ? 'happy' : 'worried', blink: F.blink(g.t, 2),
      armL: sunkNow || sink > .6 ? -2.6 : walking ? .5 + Math.sin(g.t * 7) * .3 : -.8, armR: sunkNow && g.sunkT > .6 ? 1.6 : sink > .6 ? 2.6 : walking ? .3 - Math.sin(g.t * 7) * .3 : 1.4,
      walk: walking ? g.t * 9 : undefined, lean: Math.sin(g.t * 1.3) * .04 + g.swayV / 9000
    }));
    // water over his legs
    const wy = k => wl - 6 + Math.sin(g.t * 4 + k * .03) * 5 + Math.sin(k * .011 + g.t) * 3;
    cx.beginPath(); cx.moveTo(-20, wy(-20)); for (let k = -20; k <= W + 20; k += 12) cx.lineTo(k, wy(k)); cx.lineTo(W + 20, H + 20); cx.lineTo(-20, H + 20); cx.closePath();
    cx.fillStyle = ['rgba(23,58,117,.9)', 'rgba(18,46,96,.9)', 'rgba(13,36,80,.9)'][run.st]; cx.fill();
    cx.beginPath(); cx.moveTo(-20, wy(-20)); for (let k = -20; k <= W + 20; k += 12) cx.lineTo(k, wy(k)); cx.lineWidth = 3; cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.stroke();
    if (sunkNow && g.sunkT > .5) { // Jesus' hand reaching down to catch him
      cx.save(); cx.translate(x + 50 * s, wl - 120 * s + dip * .3); cx.rotate(-.5); cx.fillStyle = JESUS.skin; cx.lineWidth = 3; cx.strokeStyle = ink;
      cx.beginPath(); cx.moveTo(60, -40); cx.lineTo(8, -4); cx.lineWidth = 14; cx.strokeStyle = ink; cx.stroke(); cx.lineWidth = 9; cx.strokeStyle = '#F4F1EA'; cx.stroke();
      cx.beginPath(); cx.arc(4, 0, 9, 0, 7); cx.fillStyle = JESUS.skin; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke(); cx.restore();
    }
    if (g.st === 'play' && sink > .7) F.bubble(cx, x, wl - 150 * s + dip, 'Lord, save me!', { size: 16, W });
    if (g.st === 'play' && !g.on && !g.down && g.prog < .08 && run.st === 0) {
      const j = jesus(), b = Math.abs(Math.sin(g.t * 5)) * 10;
      F.say(cx, '👆', j.x + 18, j.y - 10 + b, { size: 40, stroke: 'transparent' });
      F.say(cx, 'Hold here!', j.x, j.y - 150 * j.sc - 20, { size: 22, col: '#FFE58A' });
    }
  }
  function drawHud(cx) {
    const W = v.W, H = v.H, st = ST[run.st];
    const pw = Math.min(W - 32, 520), px = (W - pw) / 2;
    F.rr(cx, px, 12, pw, 22, 11); cx.fillStyle = 'rgba(255,255,255,.88)'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    const pr = Math.min(1, g.prog); if (pr > 0) { F.rr(cx, px + 2, 14, Math.max(18, (pw - 4) * pr), 18, 9); cx.fillStyle = '#FFD447'; cx.fill(); }
    cx.font = F.font(13); cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(`${run.st + 1} of 3 · ${st.name}`, W / 2, 24);
    F.pill(cx, 16, 42, 104, 24, '#FFF3C4', `★ ${Math.round(run.score)}`, { size: 14 });
    if (g.hearts !== Infinity) F.pill(cx, W - 16 - 96, 42, 96, 24, '#FFD0DA', '♥'.repeat(Math.max(0, g.hearts)) || '–', { size: 14, col: '#D7263D' });
    if (g.on && g.held > 3) F.pill(cx, W / 2 - 80, 42, 160, 24, '#FFD447', `👀 Eyes on Jesus ×${1 + Math.min(4, Math.floor(g.held / 3))}`, { size: 13 });
    if (g.st === 'intro') card(cx, `${run.st + 1}: ${st.name}`, st.tip, 'Tap to step out!');
    if (g.st === 'sunk') {
      const a = Math.min(1, g.sunkT * 2);
      cx.globalAlpha = a; F.rr(cx, 14, H * .16, W - 28, 104, 18); cx.fillStyle = '#FFF3C4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
      cx.font = F.font(Math.min(18, W / 26)); cx.fillStyle = ink; cx.textAlign = 'center';
      cx.fillText('“And immediately Jesus stretched forth his hand,', W / 2, H * .16 + 26);
      cx.fillText('and caught him… wherefore didst thou doubt?”', W / 2, H * .16 + 52);
      cx.font = '800 14px Nunito, sans-serif'; cx.fillText('Matthew 14:31', W / 2, H * .16 + 80); cx.globalAlpha = 1;
      if (g.hearts !== Infinity) F.say(cx, g.hearts > 0 ? 'Jesus caught you! Keep looking at Him!' : 'Let’s try this stretch again!', W / 2, H * .16 + 130, { size: Math.min(22, W / 18), col: '#FFE58A' });
    }
    if (g.st === 'reached') F.say(cx, 'You reached Jesus!', W / 2, H * .22, { size: Math.min(36, W / 11), col: '#FFD447' });
    if (g.st === 'done') card(cx, 'Well done!', [`${'★'.repeat(g.stStars)}${'☆'.repeat(3 - g.stStars)}`, g.sinks ? `Jesus caught you ${g.sinks} time${g.sinks > 1 ? 's' : ''}` : 'You never looked away!', `Longest look: ${Math.round(g.best)} seconds`], 'Tap for the next stretch');
    if (g.st === 'out') card(cx, 'Try again!', ['The storm was too strong this time.', 'Keep your finger on Jesus,', 'even when the waves are big.'], 'Tap to try again');
    if (g.st === 'finale') {
      const lines = [['“And when they were come into the ship,', 'the wind ceased.” (Matthew 14:32)', 0], ['“Of a truth thou art the Son of God.”', '(Matthew 14:33)', 1.4]];
      lines.forEach(([a, b, t0], i) => { if (g.endT < t0) return; cx.globalAlpha = Math.min(1, (g.endT - t0) * 2); F.say(cx, a, W / 2, H * .14 + i * 70, { size: Math.min(22, W / 21), col: '#fff' }); F.say(cx, b, W / 2, H * .14 + i * 70 + 28, { size: Math.min(18, W / 25), col: '#FFE58A' }); cx.globalAlpha = 1; });
      if (g.endT > 3.2) F.say(cx, 'Tap to finish', W / 2, H - 30, { size: 22, col: '#FFD447' });
    }
  }
  function card(cx, title, lines, go) {
    const W = v.W, H = v.H, w = Math.min(W - 24, 480), h = 96 + lines.length * 28 + 40, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.fillStyle = 'rgba(10,16,40,.35)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, title, W / 2, y + 36, { size: Math.min(28, w / 15), col: '#FFD447' });
    cx.font = '800 ' + Math.min(17, w / 26) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    lines.forEach((l, i) => cx.fillText(l, W / 2, y + 76 + i * 28));
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2, y + h - 30); cx.scale(pulse, pulse); F.pill(cx, -120, -20, 240, 40, '#14946B', ''); F.say(cx, go, 0, 1, { size: 18 }); cx.restore();
  }

  function finish() {
    const diff = run.diff, avg = Math.round(run.stars.reduce((a, b) => a + b, 0) / run.stars.length);
    const score = Math.round(run.score), best = storeJSON('peter-best') || {}, prev = best[diff] || 0;
    if (score > prev) { best[diff] = score; storeJSON('peter-best', best); }
    const badges = [];
    if (run.sinks === 0) badges.push('Never Looked Away');
    if (run.best >= 15) badges.push(`Steady Eyes (${run.best}s)`);
    stop();
    Ark.finish(el, {
      id: ID, diff, stars: Math.max(1, avg), title: 'Peter walked on the water!',
      html: `<p class="story">Score: <b>${score}</b>${score > prev && prev ? ' · <b>New best!</b>' : ''} · Longest look: ${run.best}s</p>
        ${badges.length ? `<p class="story">${badges.map(b => `🏅 ${b}`).join(' &nbsp; ')}</p>` : ''}`,
      verse: ['Be of good cheer; it is I; be not afraid.', 'Matthew 14:27 (KJV)'],
      lesson: 'When Peter looked at Jesus, he walked on the water. When he looked at the wind and the waves, he began to sink, but Jesus caught him straight away. When life feels stormy, keep your eyes on Jesus. He will never let you go.',
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
    _test: { state: () => g, run: () => run, tap: () => tap(), jesus: () => jesus(), hitR: () => hitR() }
  };
})();
