/* The Walls of Jericho (Joshua 6). A rhythm game.
   Tap the drum notes on the beat, HOLD the trumpet notes, and stay quiet on the "Shh" notes
   ("Ye shall not shout... until the day I bid you shout", Joshua 6:10). Day 1, 3, 5 and Day 7 (seven times round),
   then SHOUT to bring the walls down. Rahab's window with the scarlet cord stays standing (Joshua 2:18; 6:25). */
(() => {
  const { store, storeJSON, say, hush } = Ark;
  const F = Ark.fun, ink = '#13203A';
  const ID = 'jericho-march';
  const D = {
    easy: { bpm: 80, good: .17, perfect: .075, lead: 2.5, shout: 18 },
    normal: { bpm: 96, good: .14, perfect: .062, lead: 2.1, shout: 24 },
    hard: { bpm: 112, good: .12, perfect: .052, lead: 1.8, shout: 30 }
  };
  /* Bars of 4 beats. x = drum step, e = two quick steps, h = trumpet (held while '-' follows), s = stay quiet, . = rest */
  const DAYS = [
    { n: 1, name: 'Day 1: March!', tip: ['Tap when a drum reaches the circle.', 'Step in time as you march around Jericho!'], bars: ['x.x.', 'x.x.', 'x.xx', 'x.x.', 'xxx.', 'x.xx', 'x.x.', 'xxx.'] },
    { n: 3, name: 'Day 3: Blow the trumpets!', tip: ['New! Golden trumpet notes.', 'HOLD your finger down until the trumpet ends.'], bars: ['x.x.', 'h---', 'x.xx', 'h-x.', 'xx..', 'h---', 'x.x.', 'h-h-'] },
    { n: 5, name: 'Day 5: Keep silent', tip: ['God told the people not to shout yet (Joshua 6:10).', 'When a purple “Shh” note comes, DON’T tap!'], bars: ['x.s.', 'x.x.', 's.x.', 'h---', 'x.ss', 'x.x.', 'h-s.', 'xxs.', 'x.x.'] },
    { n: 7, name: 'Day 7: Seven times around!', tip: ['On the seventh day they marched round seven times.', 'Everything at once, and a little faster!'], bars: ['x.x.', 'xxx.', 'h-x.', 's.x.', 'x.xx', 'h---', 'x.s.', 'xxxx', 'h-h-', 's.xx', 'x.x.', 'h---', 'xs.x', 'xxx.'], fast: 12 }
  ];

  /* A slow, guided practice before each new kind of note: the note waits at the circle until the child taps. */
  const LEARN = [
    [{ k: 'step', t: 2 }, { k: 'step', t: 4 }, { k: 'step', t: 6 }],
    [{ k: 'horn', t: 2, d: 2 }, { k: 'step', t: 6 }],
    [{ k: 'step', t: 2 }, { k: 'shh', t: 4 }, { k: 'step', t: 6 }],
    null
  ];
  let el, v = null, L = null, fx = null, g = null, run = null;

  function menu() {
    stop();
    const best = storeJSON('jericho-best') || {};
    Ark.menu(el, {
      id: ID, title: 'The Walls of Jericho', icon: 'trumpet', color: '#B9770E',
      blurb: 'March, blow the trumpets, stay silent, then SHOUT! A rhythm game from Joshua 6.',
      how: [['tap', 'Tap the drums on the beat'], ['turn', 'Hold the trumpet notes'], ['ear', 'Stay quiet on “Shh”']],
      listen: 'Tap when a drum reaches the circle. Hold your finger down on the golden trumpet notes. When a purple Shh note comes, do not tap!',
      diffs: { easy: 'A slow march with lots of time to tap.', normal: 'A brisk march. Find the beat!', hard: 'A fast march with quick double steps.' },
      extra: Object.keys(best).length ? `<p style="margin:0;text-align:center;font-weight:800;color:var(--muted)">Best score: ${Ark.DIFFS.filter(d => best[d]).map(d => `${Ark.DLABEL[d]} ${best[d]}`).join(' · ')}</p>` : '',
      start: d => { run = { diff: d, C: D[d], day: 0, score: 0, stars: [], best: 0, misses: 0, shh: 0, learned: {} }; play(); }
    });
  }

  /* ---------- build the notes for a day ---------- */
  function chart(day, diff) {
    const notes = []; let b = 0;
    day.bars.forEach(bar => {
      for (let i = 0; i < 4; i++) {
        const c = bar[i], t = b + i;
        if (c === 'x') notes.push({ k: 'step', t });
        else if (c === 'e') { notes.push({ k: 'step', t }); if (diff !== 'easy') notes.push({ k: 'step', t: t + .5 }); }
        else if (c === 's') notes.push({ k: 'shh', t });
        else if (c === 'h') { let d = 1; while (i + d < 4 && bar[i + d] === '-') d++; notes.push({ k: 'horn', t, d: Math.max(1, d - .25) }); }
      }
      b += 4;
    });
    if (diff === 'hard') notes.forEach(n => { if (n.k === 'step' && n.t % 4 === 3 && !notes.some(m => m.t === n.t + .5)) notes.push({ k: 'step', t: n.t + .5 }); });
    if (diff === 'easy') for (let i = notes.length - 1; i >= 0; i--) if (notes[i].k === 'step' && notes[i].t % 2 === 1 && notes.some(m => m.t === notes[i].t - 1 && m.k === 'step')) notes.splice(i, 1);
    notes.sort((a, c) => a.t - c.t);
    return { notes, beats: b };
  }

  function play() {
    stop();
    el.innerHTML = '<div id="jmHost"></div>';
    v = F.view(el.querySelector('#jmHost'), { h: 540, minA: .56, maxA: 2.2, label: 'The people of Israel marching around the walls of Jericho. Tap on the beat.' });
    fx = F.fx();
    const C = run.C, day = DAYS[run.day], bpm = C.bpm + (day.fast || 0);
    const ch = chart(day, run.diff);
    g = {
      st: 'intro', t: 0, song: -1, bpm, bl: 60 / bpm, notes: ch.notes.map(n => ({ ...n, j: null })), beats: ch.beats,
      down: false, holding: null, combo: 0, best: 0, pts: 0, perf: 0, good: 0, miss: 0, quiet: 0, shhMiss: 0,
      judge: null, lastBeat: -99, wait: null, missRun: 0, tipT: 0, learnMsg: '', wallX: 0, oops: {}, stepT: 0, horn: 0, shout: 0, shoutT: 0, bricks: [], fall: 0, lap: 1
    };
    v.onfit = () => {};
    bind();
    L = F.loop(step);
    Ark.ctl({
      help: () => say(day.tip.join(' '), true),
      pause: () => L && L.pause(), resume: () => L && L.resume(),
      restart: () => { run.score -= g ? g.pts : 0; play(); }
    });
  }

  /* ---------- input ---------- */
  function bind() {
    const cv = v.cv;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} press(); });
    cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', release);
    g.onKey = e => {
      if (!g || ![' ', 'Enter', 'ArrowDown', 'ArrowUp', 'j', 'f'].includes(e.key)) return;
      e.preventDefault();
      if (e.type === 'keydown' && !e.repeat) press(); else if (e.type === 'keyup') release();
    };
    addEventListener('keydown', g.onKey); addEventListener('keyup', g.onKey);
  }
  const songNow = () => g.song + (g.st === 'play' ? (performance.now() - g.frame) / 1000 : 0);
  function press() {
    if (!g) return;
    if (g.st === 'intro') { if (LEARN[run.day] && !run.learned[run.day]) beginLearn(); else start(); return; }
    if (g.st === 'ready') { g.notes = g.real; start(); return; }
    if (g.st === 'learn') { learnPress(); return; }
    if (g.st === 'done') { run.day++; play(); return; }
    if (g.st === 'fallen' && g.fall > 2.6) { finish(); return; }
    if (g.st === 'shout') { shoutTap(); return; }
    if (g.st !== 'play') return;
    g.down = true;
    const now = songNow(), C = run.C;
    let n = null, best = 9;
    for (const x of g.notes) { if (x.j) continue; const dt = Math.abs(x.t * g.bl - now); if (dt < best) { best = dt; n = x; } if (x.t * g.bl - now > C.good) break; }
    if (!n || best > C.good) { if (g.combo > 2) { g.combo = 0; show('Too early!', '#FFB347'); } F.sfx.tick(); return; }
    if (n.k === 'shh') { n.j = 'shh'; g.shhMiss++; run.shh++; g.combo = 0; show('Shh! Stay quiet!', '#C9A2FF'); F.sfx.oops(); oops(); return; }
    const q = best <= C.perfect ? 'perfect' : 'good';
    n.j = q; g.missRun = 0; g[q === 'perfect' ? 'perf' : 'good']++; g.combo++; g.best = Math.max(g.best, g.combo);
    add(q === 'perfect' ? 100 : 60);
    show(q === 'perfect' ? 'Perfect!' : 'Good!', q === 'perfect' ? '#FFE58A' : '#9FE8B0');
    if (n.k === 'horn') { g.holding = n; n.held = 0; F.sfx.horn(330, n.d * g.bl); F.sfx.horn(247, n.d * g.bl); g.horn = n.d * g.bl; }
    else { F.sfx.drum(1); g.stepT = .18; dust(); }
    if (g.combo && g.combo % 10 === 0) { fx.text(v.W / 2, v.H * .42, `${g.combo} in a row!`, '#FFE58A', 30); F.sfx.good(); }
  }
  function release() {
    if (!g) return;
    g.down = false;
    if (g.st === 'learn') {
      const n = g.holding;
      if (n && songNow() < (n.t + n.d) * g.bl - .05) { g.holding = null; g.wait = n; g.learnMsg = 'Keep holding until the trumpet ends!'; show('Keep holding!', '#FFB347'); }
      return;
    }
    if (g.holding) {
      const n = g.holding, end = (n.t + n.d) * g.bl;
      if (songNow() < end - .18) { show('Hold the trumpet!', '#FFB347'); n.short = true; g.horn = 0; }
      g.holding = null;
    }
  }
  function show(s, col) { g.judge = { s, col, t: 0 }; }
  const add = p => { const m = 1 + Math.min(4, Math.floor(g.combo / 10)) * .5; const pts = Math.round(p * m); g.pts += pts; run.score += pts; };
  function oops() { const k = Math.floor(Math.random() * 4); g.oops[k] = .7; }
  function dust() { const y = groundY(); for (let i = 0; i < 4; i++) fx.burst(v.W * (.25 + i * .15), y, 3, ['#D9C29A', '#E8D6B0'], { dir: -Math.PI / 2, spread: 1.6, speed: 70, g: 200, size: 4, life: .5 }); }

  function beginLearn() {
    g.real = g.notes; g.notes = LEARN[run.day].map(n => ({ ...n, j: null }));
    g.st = 'learn'; g.song = -.6; g.wait = null; g.learnMsg = '';
    F.sfx.pop();
  }
  function learnPress() {
    g.down = true;
    const w = g.wait;
    if (!w) {
      const sh = g.notes.find(n => !n.j && n.k === 'shh' && Math.abs(n.t * g.bl - g.song) < .5);
      if (sh) { show('Shh! Don’t tap this one!', '#C9A2FF'); F.sfx.oops(); oops(); g.learnMsg = 'Purple Shh: keep your finger off. Let it go past!'; return; }
      F.sfx.tick(); show('Not yet… wait for it!', '#FFB347'); return;
    }
    if (w.k === 'step') { w.j = 'perfect'; g.wait = null; F.sfx.drum(1); g.stepT = .18; dust(); show('Yes! Just like that!', '#FFE58A'); g.learnMsg = ''; }
    else { w.started = true; g.holding = w; g.wait = null; const left = Math.max(.3, (w.t + w.d) * g.bl - g.song); F.sfx.horn(330, left); F.sfx.horn(247, left); g.horn = left; g.learnMsg = 'Keep holding… keep holding…'; }
  }
  function learnStep(dt) {
    const sp = .75;
    if (g.holding) {
      const n = g.holding; g.song += dt;
      if (g.song >= (n.t + n.d) * g.bl) { n.j = 'perfect'; g.holding = null; show('Brilliant trumpet!', '#FFE58A'); F.sfx.good(); g.learnMsg = ''; }
    } else if (g.wait) { /* frozen: the note waits at the circle */ }
    else {
      const w = g.notes.find(n => !n.j && n.k !== 'shh');
      const nxt = g.song + dt * sp;
      if (w && nxt >= w.t * g.bl && !w.started) { g.song = w.t * g.bl; g.wait = w; g.learnMsg = w.k === 'step' ? 'TAP NOW!' : 'Press and HOLD your finger down!'; }
      else g.song = nxt;
    }
    for (const n of g.notes) if (!n.j && n.k === 'shh' && g.song - n.t * g.bl > .25) { n.j = 'quiet'; show('Well done! You stayed quiet!', '#C9A2FF'); F.sfx.good(); g.learnMsg = ''; }
    const last = g.notes[g.notes.length - 1];
    if (g.notes.every(n => n.j) && g.song > (last.t + (last.d || 0) + 1.2) * g.bl) { run.learned[run.day] = true; g.st = 'ready'; g.notes = []; F.sfx.cheer(); }
    // what to say before a note arrives
    if (!g.wait && !g.holding && !g.learnMsg.startsWith('Purple')) {
      const n = g.notes.find(x => !x.j);
      if (n) { const dtn = n.t * g.bl - g.song; if (dtn < 2.2) g.learnMsg = n.k === 'shh' ? 'Purple Shh coming. DON’T tap it!' : n.k === 'horn' ? 'A golden trumpet is coming…' : 'Watch the red drum come to the circle…'; }
    }
  }
  function start() {
    g.st = 'count'; g.song = -4 * g.bl - (run.C.lead - 4 * g.bl > 0 ? run.C.lead - 4 * g.bl : 0); g.frame = performance.now();
    F.sfx.pop();
  }

  /* ---------- layout ---------- */
  const groundY = () => v.H * .72;
  const laneY = () => v.H - 72;
  const hitX = () => Math.min(90, v.W * .2);

  /* ---------- update ---------- */
  function step(dt) {
    if (!g) return;
    g.t += dt; fx.update(dt); g.frame = performance.now();
    for (const k in g.oops) g.oops[k] -= dt;
    g.stepT -= dt; g.horn -= dt;
    if (g.judge) g.judge.t += dt;
    if (g.st === 'learn') learnStep(dt);
    else if (g.st === 'count' || g.st === 'play') {
      g.song += dt;
      const beat = Math.floor(g.song / g.bl);
      if (beat !== g.lastBeat) {
        g.lastBeat = beat;
        if (g.song < 0) { F.sfx.drum(.7); F.sfx.tick(); }
        else if (beat < g.beats) F.sfx.drum(.35);
      }
      if (g.st === 'count' && g.song >= 0 - run.C.lead) g.st = 'play';
      g.tipT -= dt;
      // marching: the wall slides past
      g.wallX -= dt * (40 + g.bpm * .6);
      if (run.day === 3) g.lap = Math.min(7, 1 + Math.floor(Math.max(0, g.song) / (g.beats * g.bl) * 7));
      // missed notes
      const C = run.C;
      for (const n of g.notes) {
        if (n.j) continue;
        if (g.song - n.t * g.bl > C.good) {
          if (n.k === 'shh') { n.j = 'quiet'; g.quiet++; add(50); show('Quiet! ✓', '#C9A2FF'); }
          else { n.j = 'miss'; g.miss++; run.misses++; g.combo = 0; show('Miss', '#FF8FA3'); oops(); if (++g.missRun >= 3) { g.missRun = 0; g.tipT = 3; } }
        }
      }
      if (g.holding) { const n = g.holding; if (g.song >= (n.t + n.d) * g.bl) { add(40); fx.text(hitX() + 60, laneY() - 40, 'Trumpet! +40', '#FFE58A', 20); g.holding = null; } }
      if (g.song > g.beats * g.bl + C.good + .4) dayDone();
    } else if (g.st === 'shout') {
      g.shoutT += dt; g.shout = Math.max(0, g.shout - dt * (run.C.shout / 10));
      if (g.shout >= run.C.shout) fallDown();
    } else if (g.st === 'fallen') {
      g.fall += dt;
      for (const b of g.bricks) { b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt; const gy = groundY() + 10 + (b.id % 5) * 4; if (b.y > gy) { b.y = gy; b.vy *= -.25; b.vx *= .6; b.vr *= .5; } }
    }
    draw();
  }
  function dayDone() {
    const total = g.notes.length || 1, acc = (g.perf + g.good * .7 + g.quiet) / total;
    const stars = acc >= .85 ? 3 : acc >= .6 ? 2 : 1;
    run.stars[run.day] = stars; run.best = Math.max(run.best, g.best);
    g.acc = acc; g.dstars = stars;
    if (run.day < DAYS.length - 1) { g.st = 'done'; F.sfx.good(); }
    else { g.st = 'shout'; g.shout = 0; g.shoutT = 0; g.wallX = v.W * .74 + 210; F.sfx.horn(392, 1.2); F.sfx.horn(294, 1.2); }
  }
  function shoutTap() {
    g.shout += 1; F.tone(200 + g.shout * 12, .08, { type: 'square', vol: .03, lp: 1200 }); fx.shake(3 + g.shout * .25);
    fx.burst(v.W * (.2 + Math.random() * .6), groundY() - 60, 4, ['#FFE58A', '#fff'], { speed: 160, g: 0, life: .4 });
  }
  function fallDown() {
    g.st = 'fallen'; g.fall = 0; F.sfx.crash(); setTimeout(() => F.sfx.cheer(), 600); fx.shake(28); add(500);
    // the wall breaks into bricks (Rahab's window stays standing)
    const top = v.H * .22, bot = groundY() - 6;
    let id = 0;
    for (let x = -20; x < v.W + 40; x += 34) {
      if (Math.abs(x - rahabX()) < 50) continue;
      for (let y = top + 20; y < bot; y += 22) g.bricks.push({ id: id++, x: x + Math.random() * 6, y, w: 30, h: 18, vx: (Math.random() - .5) * 260, vy: -Math.random() * 220, r: 0, vr: (Math.random() - .5) * 6, col: ['#C9A86A', '#BF9A5A', '#D6B87C'][id % 3] });
    }
    for (let i = 0; i < 10; i++) fx.burst(v.W * Math.random(), bot - 30, 6, ['#E8D6B0', '#D9C29A', '#fff'], { speed: 200, g: -40, size: 14, life: 1.4, shape: 'grow' });
  }
  const rahabX = () => { const P = v.W + 420; return ((g.wallX % P) + P) % P - 210; }; // slides past once a lap

  /* ---------- drawing ---------- */
  function draw() {
    const cx = v.cx, W = v.W, H = v.H, gy = groundY();
    v.reset(); cx.save(); fx.pre(cx);
    // desert sky
    const sk = cx.createLinearGradient(0, 0, 0, gy); sk.addColorStop(0, '#7FC8F8'); sk.addColorStop(1, '#FFE2A8');
    cx.fillStyle = sk; cx.fillRect(-30, -30, W + 60, H + 60);
    cx.beginPath(); cx.arc(W * .85, H * .12, 30, 0, 7); cx.fillStyle = '#FFE58A'; cx.fill();
    // distant hills
    cx.beginPath(); cx.moveTo(-10, gy - 140); for (let x = -10; x <= W + 10; x += 30) cx.lineTo(x, gy - 150 + Math.sin(x * .01) * 18); cx.lineTo(W + 10, gy); cx.lineTo(-10, gy); cx.fillStyle = '#E3C48C'; cx.fill();
    // the wall
    if (g.st !== 'fallen') drawWall(cx); else drawRuins(cx);
    // ground
    cx.fillStyle = '#E8CF9A'; cx.fillRect(-20, gy, W + 40, H - gy + 20);
    cx.beginPath(); cx.moveTo(-20, gy); cx.lineTo(W + 20, gy); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    drawMarchers(cx);
    if (g.st === 'fallen') for (const b of g.bricks) { cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.fillStyle = b.col; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.lineWidth = 2; cx.strokeStyle = ink; cx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore(); }
    fx.draw(cx);
    cx.restore();
    drawLane(cx);
    drawHud(cx);
  }
  function drawWall(cx) {
    const W = v.W, top = v.H * .22, bot = groundY(), seg = 200, off = ((g.wallX % seg) + seg) % seg;
    const shake = g.st === 'shout' ? (Math.random() - .5) * (g.shout / run.C.shout) * 6 : 0;
    cx.save(); cx.translate(shake, 0);
    cx.fillStyle = '#D6B87C'; cx.fillRect(-20, top + 30, W + 40, bot - top - 30);
    // stone courses
    cx.strokeStyle = 'rgba(19,32,58,.28)'; cx.lineWidth = 2;
    for (let y = top + 52, r = 0; y < bot; y += 24, r++) { cx.beginPath(); cx.moveTo(-20, y); cx.lineTo(W + 20, y); cx.stroke(); for (let x = (off + (r % 2) * 22) % 44 - 44; x < W + 20; x += 44) { cx.beginPath(); cx.moveTo(x, y - 24); cx.lineTo(x, y); cx.stroke(); } }
    // towers and windows sliding by
    for (let x = off - seg; x < W + seg; x += seg) {
      const tw = 70;
      cx.fillStyle = '#C9A86A'; cx.fillRect(x, top, tw, bot - top); cx.lineWidth = 3; cx.strokeStyle = ink; cx.strokeRect(x, top, tw, bot - top);
      for (let k = 0; k < 4; k++) { cx.fillRect(x - 4 + k * 20, top - 14, 14, 16); cx.strokeRect(x - 4 + k * 20, top - 14, 14, 16); }
      // a window with a curious face
      const wy = top + 40, idx = Math.round((x - g.wallX) / seg);
      cx.fillStyle = '#5A3E22'; F.rr(cx, x + 22, wy, 26, 30, 8); cx.fill(); cx.stroke();
      if ((idx * 7919) % 3 !== 0) { const pop = Math.max(0, Math.sin(g.t * 1.6 + idx)); if (pop > .2) { cx.save(); cx.beginPath(); F.rr(cx, x + 22, wy, 26, 30, 8); cx.clip(); F.person(cx, { x: x + 35, y: wy + 112 - pop * 22, s: .5, skin: ['#8D5A3B', '#A8714A', '#6B4226'][Math.abs(idx) % 3], robe: '#7A3E9D', mood: pop > .8 ? 'wow' : 'worried', blink: F.blink(g.t, idx), head: 'cloth', headCol: '#E8DCC6' }); cx.restore(); } }
    }
    // Rahab's window with the scarlet cord (Joshua 2:18)
    drawRahab(cx, rahabX(), top + 70);
    cx.lineWidth = 3; cx.strokeStyle = ink; cx.beginPath(); cx.moveTo(-20, top + 30); cx.lineTo(W + 20, top + 30); cx.stroke();
    // cracks while shouting
    if (g.st === 'shout' && g.shout > 4) { cx.strokeStyle = ink; cx.lineWidth = 2; const n = Math.floor(g.shout / 3); for (let i = 0; i < n; i++) { const x = (i * 137) % W; cx.beginPath(); cx.moveTo(x, top + 40); cx.lineTo(x + 12, top + 80); cx.lineTo(x - 6, top + 120); cx.lineTo(x + 8, top + 170); cx.stroke(); } }
    cx.restore();
  }
  function drawRahab(cx, x, y) {
    cx.fillStyle = '#C9A86A'; cx.fillRect(x - 40, y - 30, 80, groundY() - y + 30); cx.lineWidth = 3; cx.strokeStyle = ink; cx.strokeRect(x - 40, y - 30, 80, groundY() - y + 30);
    cx.fillStyle = '#5A3E22'; F.rr(cx, x - 16, y, 32, 36, 8); cx.fill(); cx.stroke();
    F.person(cx, { x, y: y + 92, s: .5, skin: '#A06A45', robe: '#C0392B', mood: g.st === 'fallen' ? 'happy' : 'calm', blink: F.blink(g.t, 4), head: 'cloth', headCol: '#F2E3C2', band: '#C0392B' });
    cx.fillStyle = '#5A3E22'; cx.fillRect(x - 16, y + 30, 32, 6);
    // scarlet cord
    cx.beginPath(); cx.moveTo(x + 10, y + 34); for (let k = 0; k < 8; k++) cx.lineTo(x + 10 + Math.sin(g.t * 2 + k) * 3, y + 34 + k * 12); cx.lineWidth = 5; cx.strokeStyle = '#D7263D'; cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = ink;
  }
  function drawRuins(cx) {
    const top = v.H * .22;
    drawRahab(cx, rahabX(), top + 70);
    if (g.fall > 1.2) { cx.globalAlpha = Math.min(1, (g.fall - 1.2) * 1.5); F.say(cx, 'The wall fell down flat!', v.W / 2, v.H * .2, { size: Math.min(34, v.W / 12), col: '#FFE58A' }); F.say(cx, 'Joshua 6:20', v.W / 2, v.H * .2 + 34, { size: 17 }); cx.globalAlpha = 1; }
    if (g.fall > 1.8) { F.bubble(cx, rahabX(), top + 52, 'Rahab’s family is safe!', { size: 15, W: v.W }); }
  }
  function drawMarchers(cx) {
    const W = v.W, gy = groundY(), beatPh = g.song > 0 ? g.song / g.bl : g.t * 1.4;
    const n = W < 500 ? 4 : W < 900 ? 6 : 8, gap = Math.min(110, (W - 60) / n);
    const x0 = W / 2 - gap * (n - 1) / 2;
    const cheering = g.st === 'fallen', shouting = g.st === 'shout';
    for (let i = 0; i < n; i++) {
      const x = x0 + i * gap, isArk = i === Math.floor(n / 2) - 1 || i === Math.floor(n / 2);
      const oo = (g.oops[i % 4] || 0) > 0;
      const walk = cheering ? 0 : beatPh * Math.PI + i * .3;
      const bob = cheering ? -Math.abs(Math.sin(g.t * 6 + i)) * 12 : -Math.abs(Math.sin(walk)) * 4;
      const priest = !isArk;
      const blowing = priest && (g.horn > 0 || shouting);
      F.person(cx, {
        x, y: gy + 4, s: W < 500 ? .78 : .92, bounce: bob, walk, lean: oo ? .35 : 0,
        skin: ['#8D5A3B', '#6B4226', '#A8714A', '#7A4B2E'][i % 4], robe: priest ? '#F4F1EA' : '#3F6FE0', trim: priest ? '#1F55D6' : null,
        head: 'cloth', headCol: priest ? '#F4F1EA' : '#E8DCC6', band: priest ? '#F2A007' : '#C0392B', beard: i % 2 ? '#2B1B12' : null,
        mood: oo ? 'oops' : cheering ? 'happy' : shouting ? 'wow' : g.down ? 'happy' : 'calm', blink: F.blink(g.t, i + 2),
        armL: cheering ? -2.4 : blowing ? 1.7 : isArk ? 2.0 : .4 + Math.sin(walk) * .3,
        armR: cheering ? 2.4 : isArk ? 2.0 : .3 - Math.sin(walk) * .3, flip: false
      });
      if (blowing) { // ram's horn trumpet and sound waves
        cx.save(); cx.translate(x + 26 * (W < 500 ? .78 : .92), gy - 76 + bob); cx.lineWidth = 3; cx.strokeStyle = ink;
        cx.beginPath(); cx.moveTo(-14, 6); cx.quadraticCurveTo(10, 4, 26, -14); cx.lineTo(32, -6); cx.quadraticCurveTo(12, 14, -14, 12); cx.closePath(); cx.fillStyle = '#E8C27A'; cx.fill(); cx.stroke();
        cx.strokeStyle = 'rgba(255,255,255,.9)'; for (let k = 1; k <= 3; k++) { const r = k * 10 + (g.t * 40 % 10); cx.beginPath(); cx.arc(30, -10, r, -.9, .5); cx.stroke(); }
        cx.restore();
      }
      if (oo) F.say(cx, '!', x, gy - 110, { size: 22, col: '#FF8FA3' });
    }
    // the ark of the covenant, carried on poles (Joshua 6:6)
    const a = x0 + (Math.floor(n / 2) - .5) * gap, ay = gy - 60 * (W < 500 ? .78 : .92) + (cheering ? -Math.abs(Math.sin(g.t * 6)) * 10 : -Math.abs(Math.sin(beatPh * Math.PI)) * 4);
    cx.lineWidth = 3; cx.strokeStyle = ink;
    cx.beginPath(); cx.moveTo(a - gap * .75, ay + 8); cx.lineTo(a + gap * .75, ay + 8); cx.lineWidth = 6; cx.strokeStyle = '#8B5A2B'; cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = ink;
    F.rr(cx, a - 34, ay - 22, 68, 30, 4); cx.fillStyle = '#F2B632'; cx.fill(); cx.stroke();
    cx.beginPath(); cx.moveTo(a - 30, ay - 22); cx.quadraticCurveTo(a - 18, ay - 44, a - 4, ay - 26); cx.moveTo(a + 30, ay - 22); cx.quadraticCurveTo(a + 18, ay - 44, a + 4, ay - 26); cx.fillStyle = '#FFD447'; cx.stroke();
    cx.strokeStyle = 'rgba(19,32,58,.3)'; cx.strokeRect(a - 26, ay - 16, 52, 18); cx.strokeStyle = ink;
  }
  function drawLane(cx) {
    if (!(g.st === 'play' || g.st === 'count' || g.st === 'learn')) return;
    const W = v.W, y = laneY(), hx = hitX(), C = run.C, spd = (W - hx + 40) / (g.st === 'learn' ? 3 : C.lead);
    F.rr(cx, 8, y - 38, W - 16, 76, 38); cx.fillStyle = 'rgba(19,32,58,.6)'; cx.fill();
    // beat lines
    cx.strokeStyle = 'rgba(255,255,255,.2)'; cx.lineWidth = 2;
    for (let b = Math.ceil((g.song) / g.bl); b < (g.song + C.lead) / g.bl; b++) { const x = hx + (b * g.bl - g.song) * spd; cx.beginPath(); cx.moveTo(x, y - 22); cx.lineTo(x, y + 22); cx.stroke(); }
    // hit circle, pulsing on the beat
    const ph = ((g.song / g.bl) % 1 + 1) % 1, pulse = 1 + Math.max(0, .18 - ph * .5);
    cx.beginPath(); cx.arc(hx, y, 33 * pulse, 0, 7); cx.fillStyle = g.down ? 'rgba(255,212,71,.5)' : 'rgba(255,255,255,.12)'; cx.fill(); cx.lineWidth = 5; cx.strokeStyle = '#FFD447'; cx.stroke();
    // notes
    for (const n of g.notes) {
      if (n.j && n.j !== 'quiet' && !(n.k === 'horn' && g.holding === n)) continue;
      const x = hx + (n.t * g.bl - g.song) * spd;
      if (x > W + 40) break;
      if (n.k === 'horn') {
        const x2 = hx + ((n.t + n.d) * g.bl - g.song) * spd, xs = (g.holding === n || n.started) ? hx : x;
        if (x2 < hx - 30) continue;
        F.rr(cx, xs - 17, y - 17, Math.max(34, x2 - xs + 34), 34, 17); cx.fillStyle = g.holding === n ? '#FFE58A' : '#F2B632'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
        cx.beginPath(); cx.arc(xs, y, 22, 0, 7); cx.fillStyle = '#FFD447'; cx.fill(); cx.stroke();
        F.say(cx, '🎺', xs, y + 1, { size: 19, stroke: 'transparent' });
        tag(cx, xs, y, g.holding === n ? 'HOLD…' : 'HOLD', '#FFD447', hx);
      } else if (n.k === 'shh') {
        if (n.j === 'quiet') continue;
        cx.beginPath(); cx.arc(x, y, 23, 0, 7); cx.fillStyle = '#7A3E9D'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
        F.say(cx, 'Shh', x, y + 1, { size: 15 });
        tag(cx, x, y, 'DON’T TAP', '#C9A2FF', hx);
      } else {
        cx.beginPath(); cx.arc(x, y, 22, 0, 7); cx.fillStyle = '#D7263D'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
        tag(cx, x, y, 'TAP', '#FFE58A', hx);
        cx.beginPath(); cx.ellipse(x, y - 5, 14, 6, 0, 0, 7); cx.fillStyle = '#F4E3C0'; cx.fill(); cx.stroke();
      }
    }
    if (g.st === 'learn' && g.learnMsg) guide(cx, g.learnMsg, g.wait || g.holding);
    else if (g.st === 'play' && g.tipT > 0) guide(cx, 'Tap when a red drum touches the yellow circle!', false);
    if (g.wait && g.wait.k === 'step') { const b = Math.abs(Math.sin(g.t * 6)) * 10; F.say(cx, '👆', hx, y - 52 - b, { size: 34, stroke: 'transparent' }); }
    if (g.judge && g.judge.t < .7) { cx.globalAlpha = 1 - g.judge.t / .7; F.say(cx, g.judge.s, hx + 40, y - 62 - g.judge.t * 20, { size: 24, col: g.judge.col, align: 'left' }); cx.globalAlpha = 1; }
    if (g.st === 'count' || g.song < 0) {
      const left = Math.ceil(-g.song / g.bl);
      F.say(cx, left > 3 ? 'Get ready…' : left > 0 ? String(left) : 'March!', W / 2, v.H * .2, { size: 56, col: '#FFE58A' });
    }
  }
  /* a small label over each note as it nears the circle */
  function tag(cx, x, y, s, col, hx) {
    if (x - hx > 260 || x < hx - 20 || (g.wait && Math.abs(x - hx) < 6)) return;
    F.say(cx, s, x, y - 34, { size: 13, col });
  }
  function guide(cx, s, urgent) {
    const W = v.W, size = Math.min(urgent ? 30 : 22, W / (s.length * .52)), w = Math.min(W - 24, s.length * size * .56 + 40), y = v.H * .34;
    const pulse = urgent ? 1 + Math.sin(g.t * 8) * .05 : 1;
    cx.save(); cx.translate(W / 2, y); cx.scale(pulse, pulse);
    F.rr(cx, -w / 2, -size * .9, w, size * 1.8, size * .9); cx.fillStyle = urgent ? 'rgba(20,148,107,.95)' : 'rgba(19,32,58,.85)'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = '#fff'; cx.stroke();
    F.say(cx, s, 0, 1, { size, col: '#fff' }); cx.restore();
  }
  function drawHud(cx) {
    const W = v.W, H = v.H, day = DAYS[run.day];
    const pw = Math.min(W - 32, 520), px = (W - pw) / 2;
    F.rr(cx, px, 12, pw, 20, 10); cx.fillStyle = 'rgba(255,255,255,.88)'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    const pr = g.st === 'play' ? Math.max(0, Math.min(1, g.song / (g.beats * g.bl))) : g.st === 'intro' || g.st === 'count' ? 0 : 1;
    if (pr > 0) { F.rr(cx, px + 2, 14, Math.max(16, (pw - 4) * pr), 16, 8); cx.fillStyle = '#FFD447'; cx.fill(); }
    cx.font = F.font(13); cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(run.day === 3 && g.st === 'play' ? `Day 7 · Lap ${g.lap} of 7` : day.name, W / 2, 23);
    F.pill(cx, 16, 40, 110, 24, '#FFF3C4', `★ ${run.score}`, { size: 14 });
    if (g.combo > 1) F.pill(cx, W - 16 - 120, 40, 120, 24, '#FFD447', `Combo ×${g.combo}`, { size: 14 });
    const learning = LEARN[run.day] && !run.learned[run.day];
    if (g.st === 'intro') card(cx, day.name, learning ? [...day.tip, 'First, a slow practice!'] : day.tip, learning ? 'Tap to practise' : 'Tap to march!');
    if (g.st === 'ready') card(cx, 'You’ve got it!', ['Now the real march.', 'TAP red drums · HOLD gold trumpets', 'DON’T TAP purple Shh'].slice(0, run.day === 0 ? 2 : run.day === 1 ? 2 : 3).map((l, i) => i === 1 && run.day === 0 ? 'TAP each red drum at the yellow circle' : l), 'Tap to march!');
    if (g.st === 'learn') F.pill(cx, W - 16 - 110, 40, 110, 24, '#C9F2DD', 'Practice', { size: 14 });
    if (g.st === 'done') card(cx, `${day.name.split(':')[0]} done!`, [`${'★'.repeat(g.dstars)}${'☆'.repeat(3 - g.dstars)}`, `Perfect ${g.perf} · Good ${g.good}${g.quiet ? ` · Quiet ${g.quiet}` : ''} · Missed ${g.miss}`, `Best streak: ${g.best}`], 'Tap for the next day');
    if (g.st === 'shout') {
      F.say(cx, '“Shout; for the LORD hath given you the city.”', W / 2, H * .3, { size: Math.min(22, W / 24), col: '#fff' });
      F.say(cx, 'Joshua 6:16', W / 2, H * .3 + 28, { size: 15, col: '#FFE58A' });
      const bw = Math.min(W - 40, 420), bx = (W - bw) / 2, by = H - 120, fill = Math.min(1, g.shout / run.C.shout);
      F.rr(cx, bx, by, bw, 30, 15); cx.fillStyle = 'rgba(255,255,255,.9)'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
      if (fill > 0) { F.rr(cx, bx + 3, by + 3, Math.max(24, (bw - 6) * fill), 24, 12); cx.fillStyle = '#F0485C'; cx.fill(); }
      const pulse = 1 + Math.sin(g.t * 14) * .06;
      cx.save(); cx.translate(W / 2, H - 52); cx.scale(pulse, pulse); F.say(cx, 'TAP TAP TAP — SHOUT!', 0, 0, { size: Math.min(34, W / 12), col: '#FFD447' }); cx.restore();
    }
    if (g.st === 'fallen' && g.fall > 2.6) F.say(cx, 'Tap to continue', W / 2, H - 40, { size: 22, col: '#FFD447' });
  }
  function card(cx, title, lines, go) {
    const W = v.W, H = v.H, w = Math.min(W - 30, 480), h = 96 + lines.length * 28 + 40, x = (W - w) / 2, y = (H - h) / 2 - 10;
    cx.fillStyle = 'rgba(10,16,40,.35)'; cx.fillRect(0, 0, W, H);
    F.rr(cx, x, y + 5, w, h, 22); cx.fillStyle = ink; cx.fill();
    F.rr(cx, x, y, w, h, 22); cx.fillStyle = '#FFFDF4'; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = ink; cx.stroke();
    F.say(cx, title, W / 2, y + 36, { size: Math.min(28, w / 15), col: '#FFD447' });
    cx.font = '800 ' + Math.min(17, w / 25) + 'px Nunito, "Segoe UI", sans-serif'; cx.fillStyle = ink; cx.textAlign = 'center';
    lines.forEach((l, i) => cx.fillText(l, W / 2, y + 76 + i * 28));
    const pulse = 1 + Math.sin(g.t * 5) * .04;
    cx.save(); cx.translate(W / 2, y + h - 30); cx.scale(pulse, pulse); F.pill(cx, -110, -20, 220, 40, '#14946B', ''); F.say(cx, go, 0, 1, { size: 18 }); cx.restore();
  }

  function finish() {
    const diff = run.diff, avg = Math.round(run.stars.reduce((a, b) => a + b, 0) / run.stars.length);
    const best = storeJSON('jericho-best') || {}, prev = best[diff] || 0;
    if (run.score > prev) { best[diff] = run.score; storeJSON('jericho-best', best); }
    const badges = [];
    if (run.misses === 0) badges.push('Perfect Marcher');
    if (run.shh === 0) badges.push('Quiet Hero');
    if (run.best >= 20) badges.push(`Streak of ${run.best}`);
    stop();
    Ark.finish(el, {
      id: ID, diff, stars: Math.max(1, avg), title: 'The walls came tumbling down!',
      html: `<p class="story">Score: <b>${run.score}</b>${run.score > prev && prev ? ' · <b>New best!</b>' : ''} · Best streak: ${run.best}</p>
        ${badges.length ? `<p class="story">${badges.map(b => `🏅 ${b}`).join(' &nbsp; ')}</p>` : ''}
        <p class="story" style="font-size:15px">Rahab and her family were kept safe, just as promised (Joshua 6:25).</p>`,
      verse: ['By faith the walls of Jericho fell down, after they were compassed about seven days.', 'Hebrews 11:30 (KJV)'],
      lesson: 'God’s plan sounded strange: march, blow trumpets, stay quiet, then shout! Joshua and the people trusted God and obeyed, and God gave them the victory. When God’s way is hard to understand, we can still trust Him.',
      again: () => { run = { ...run, day: 0, score: 0, stars: [], best: 0, misses: 0, shh: 0 }; play(); }, menu,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-' + ID, d); run = { diff: d, C: D[d], day: 0, score: 0, stars: [], best: 0, misses: 0, shh: 0, learned: run.learned }; play(); }] : null
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
    _test: { state: () => g, run: () => run, press: () => press(), release: () => release(), songNow: () => g && songNow(), DAYS }
  };
})();
