/* Fruit Splash (Galatians 5:22–23). Swipe the good fruit!
   Fruit of the Spirit fly up from the bottom of the screen; swipe (or tap) them to splash them into your basket.
   Rotten, thorny "works of the flesh" fly too: don't swipe those. Combos for good swipes in a row.
   Easy: slower, fewer wrong ones, hint glow. Normal: faster, mixed, combos. Hard: faster still, more wrong ones,
   some wrong ones look like fruit (read the word!), and two "What would Jesus want?" scenario rounds.
   (This game replaces Fruit vs. Flesh and keeps its id, so saved stars and links still work.) */
(() => {
  const { store, storeJSON, say, hush, shuf, esc } = Ark;
  const ink = '#13203A';
  const GOOD = {
    love: ['Love', 'strawberry', '#E63946', '#FFB3BA', 'Love cares for others, just like Jesus.'],
    joy: ['Joy', 'orange', '#F28C28', '#FFD7A8', 'Joy is gladness that comes from God.'],
    peace: ['Peace', 'plum', '#5B6CD6', '#C7CEFF', 'Peace is calm inside, trusting God.'],
    patience: ['Patience', 'pear', '#8CC63F', '#E4F5C4', 'Patience waits without grumbling.'],
    kindness: ['Kindness', 'apple', '#D7263D', '#FFE3C2', 'Kindness helps and shares.'],
    goodness: ['Goodness', 'banana', '#F2C14E', '#FFF3C4', 'Goodness does what is right.'],
    faithfulness: ['Faithfulness', 'grapes', '#7A3E9D', '#E3C9F5', 'Faithfulness keeps promises and trusts God.'],
    gentleness: ['Gentleness', 'peach', '#FF9E7A', '#FFE0CF', 'Gentleness is soft and caring.'],
    selfcontrol: ['Self-control', 'melon', '#2E9E4F', '#FF6B6B', 'Self-control stops and thinks first.']
  };
  const BAD = {
    anger: ['Anger', 'thorn', '#7A1F1F', 'Anger hurts people. Stay calm instead.'],
    envy: ['Envy', 'rotten', '#5E6B2E', 'Envy wants what others have.'],
    hatred: ['Hatred', 'thorn', '#2B2B33', 'Hatred is the opposite of love.'],
    pride: ['Pride', 'thorn', '#4B2A6B', 'Pride says “Me first!” God loves a humble heart.'],
    selfishness: ['Selfishness', 'rotten', '#6B4423', 'Selfishness forgets about others.'],
    gossip: ['Gossip', 'thorn', '#3E4A61', 'Gossip spreads unkind words about people.'],
    greed: ['Greed', 'rotten', '#6B5A1E', 'Greed always wants more and more.'],
    jealousy: ['Jealousy', 'rotten', '#4F6B1E', 'Jealousy is upset when others do well.'],
    unforgiveness: ['Unforgiveness', 'stone', '#5C6470', 'Unforgiveness holds on to hurt. God forgives us, so we forgive too.']
  };
  const SCEN = [
    ['Your friend breaks your toy by accident.', ['Say “It’s OK, I forgive you”', 'Shout at them', 'Break their toy too'], 'That’s kindness and forgiveness!'],
    ['You have two sweets. Your brother has none.', ['Share one with him', 'Eat both quickly', 'Hide them'], 'That’s kindness and goodness!'],
    ['You lose a game.', ['Say “Well played!”', 'Throw the game on the floor', 'Say it was unfair'], 'That’s self-control and gentleness!'],
    ['Someone tells you a secret about a classmate.', ['Keep it to yourself', 'Tell everyone', 'Laugh about it'], 'That’s faithfulness and love!'],
    ['Mum says, “Wait. Dinner is nearly ready.”', ['Wait patiently', 'Grab a snack anyway', 'Moan and moan'], 'That’s patience!'],
    ['A new child sits alone at lunch.', ['Invite them to sit with you', 'Ignore them', 'Make fun of them'], 'That’s love and kindness!']
  ];
  const D = {
    easy: { lives: 5, goal: 30, every: 1.5, bad: .2, grav: 520, r: 66, multi: [1, 2], hint: true, trick: 0, scen: 0, speedUp: .15 },
    normal: { lives: 3, goal: 45, every: 1.1, bad: .35, grav: 700, r: 60, multi: [1, 3], hint: false, trick: 0, scen: 0, speedUp: .25 },
    hard: { lives: 3, goal: 55, every: .85, bad: .45, grav: 860, r: 54, multi: [2, 4], hint: false, trick: .4, scen: 2, speedUp: .35 }
  };
  let el, g = null, raf = 0, W = 960, H = 540;
  const $ = s => el.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(() => g && fn(), ms));

  /* ---------- sounds (made in the browser; the Sound button turns them on and off) ---------- */
  const SFX = (() => {
    let ctx = null;
    const ac = () => { if (!Ark.voiceOn()) return null; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; };
    function tone(f, d, o = {}) { const c = ac(); if (!c) return; const t = c.currentTime + (o.at || 0), os = c.createOscillator(), gn = c.createGain(); os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d); gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .07, t + .01); gn.gain.exponentialRampToValueAtTime(.0001, t + d); os.connect(gn); gn.connect(c.destination); os.start(t); os.stop(t + d + .02); }
    function noise(d, o = {}) { const c = ac(); if (!c) return; const t = c.currentTime + (o.at || 0), n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1; const s = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain(); s.buffer = b; fl.type = o.type || 'lowpass'; fl.frequency.value = o.f || 800; gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .06, t + .01); gn.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(gn); gn.connect(c.destination); s.start(t); }
    return {
      swoosh: () => noise(.14, { type: 'bandpass', f: 2400, vol: .03 }),
      splash: c => { noise(.22, { f: 1200, vol: .07 }); tone(500 + Math.min(c, 10) * 60, .12, { to: 900 + Math.min(c, 10) * 60, vol: .05 }); },
      bad: () => { tone(180, .3, { type: 'triangle', to: 90, vol: .11 }); noise(.25, { f: 300, vol: .06 }); },
      combo: n => [0, 1, 2].forEach(i => tone(660 * Math.pow(1.26, i) * (1 + Math.min(n, 20) * .02), .1, { vol: .05, at: i * .06 })),
      count: hi => tone(hi ? 880 : 440, .14, { vol: .06 }),
      right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, { vol: .06, at: i * .08 })),
      win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, { vol: .07, at: i * .12 }))
    };
  })();

  function css() {
    if (document.getElementById('fs-css')) return;
    const s = document.createElement('style'); s.id = 'fs-css';
    s.textContent = `
      .stage.fs-wide{max-width:1200px}
      @media (orientation:landscape) and (max-height:600px){.stage.fs-wide{padding:8px;gap:8px}}
      .fs-view{position:relative;margin:0 auto;border:3px solid var(--line);border-radius:16px;overflow:hidden;line-height:0;touch-action:none;user-select:none;-webkit-user-select:none;background:#8FD0FF;cursor:crosshair;scroll-margin-top:calc(var(--gbh,60px) + 4px);-webkit-tap-highlight-color:transparent}
      .fs-view canvas{display:block;width:100%;height:100%}
      .fs-hud{position:absolute;left:8px;right:8px;top:8px;display:flex;gap:6px;align-items:center;pointer-events:none;line-height:1.2;z-index:2;flex-wrap:wrap}
      .fs-pill{background:rgba(255,255,255,.93);color:#13203A;border:3px solid #13203A;border-radius:99px;padding:1px 10px;font-weight:800;font-size:clamp(13px,2.7vmin,19px);white-space:nowrap;font-variant-numeric:tabular-nums}
      .fs-lives{letter-spacing:1px}
      .fs-bask{position:relative;flex:1 1 140px;height:22px;border:3px solid #13203A;border-radius:99px;background:rgba(255,255,255,.85);overflow:hidden}
      .fs-bask b{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#F28C28,#FFD447);transition:width .25s}
      .fs-bask em{position:absolute;inset:0;display:grid;place-items:center;font-style:normal;font-weight:800;font-size:12px;color:#13203A}
      .fs-combo{background:#FFD447;animation:fsPop .3s cubic-bezier(.3,1.6,.5,1)}
      @keyframes fsPop{from{transform:scale(.6)}}
      .fs-tip{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 20px);width:max-content;background:rgba(255,255,255,.96);color:#13203A;border:3px solid #13203A;border-radius:16px;padding:6px 14px;font-weight:800;font-size:clamp(14px,3vmin,20px);line-height:1.3;z-index:3;pointer-events:none;animation:fsIn .25s ease-out;text-align:center}
      .fs-tip.ok{border-color:#14946B;background:#E9FBEF}.fs-tip.no{border-color:#D7263D;background:#FFECEE}
      @keyframes fsIn{from{opacity:0;transform:translate(-50%,8px)}}
      .fs-scn{position:absolute;left:50%;top:44px;transform:translateX(-50%);width:min(560px,calc(100% - 20px));background:#FFF3C4;color:#13203A;border:3px solid #13203A;border-radius:18px;padding:8px 14px;font-weight:800;font-size:clamp(15px,3.2vmin,21px);line-height:1.3;text-align:center;z-index:3;pointer-events:none;animation:fsIn .3s ease-out}
      .fs-scn small{display:block;font-size:.7em;color:#7A3E9D;letter-spacing:.06em;text-transform:uppercase}
      .fs-card{position:absolute;inset:0;display:grid;place-items:center;background:rgba(19,32,58,.4);padding:10px;z-index:4;line-height:1.4;cursor:default}
      .fs-card>div{background:var(--surface);color:var(--ink);border:3px solid var(--line);border-radius:20px;padding:clamp(12px,2.6vmin,22px);display:grid;gap:10px;justify-items:center;text-align:center;width:min(520px,100%);max-height:100%;overflow:auto;animation:fsIn2 .3s ease-out}
      @keyframes fsIn2{from{opacity:0;transform:scale(.94)}}
      .fs-card h3{font-size:clamp(22px,4.6vmin,32px)}
      .fs-card p{margin:0;font-weight:700}
      .fs-demo{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
      .fs-demo div{border-radius:14px;padding:8px;font-weight:800;font-size:14px;display:grid;gap:4px;justify-items:center}
      .fs-demo .y{background:#E9FBEF;border:2px solid #14946B}.fs-demo .n{background:#FFECEE;border:2px solid #D7263D}
      .fs-demo canvas{width:120px;height:64px}
      .fs-note{font-size:13px;color:var(--muted);font-weight:700}
      .fs-rot{display:none;align-items:center;gap:8px;font-weight:800;font-size:14px;background:#FFF3C4;color:#13203A;border:2px solid #13203A;border-radius:12px;padding:6px 10px;text-align:left}
      .fs-rot i{display:inline-block;font-style:normal;font-size:24px;animation:fsRot 2s ease-in-out infinite}
      @keyframes fsRot{35%,65%{transform:rotate(-90deg)}}
      @media (orientation:portrait) and (pointer:coarse){.fs-rot{display:flex}}
      .fs-found{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
      .fs-found span{font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;border:2px solid var(--line);background:var(--bg);opacity:.5}
      .fs-found span.on{opacity:1;background:#FFF3C4;color:#13203A}
      .fs-sum{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
      .fs-sum span{font-weight:800;padding:5px 12px;border-radius:999px;border:2px solid var(--line);background:var(--bg)}`;
    document.head.appendChild(s);
  }

  /* ---------- menu ---------- */
  function menu() {
    stop(); el.classList.remove('fs-wide');
    const best = storeJSON('fs-best') || {};
    Ark.menu(el, {
      id: 'fruit-vs-flesh', title: 'Fruit Splash', icon: 'tree', color: '#C9F28C',
      blurb: 'Swipe the good fruit! Splash the Fruit of the Spirit into your basket, and don’t touch the rotten, thorny ones.',
      how: [['swipe', 'Swipe the good fruit'], ['heart', 'Don’t swipe rotten or thorny ones'], ['star', 'Swipe in a row for combos']],
      listen: 'Fruit will fly up the screen. Swipe your finger across the good fruit: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control. Don’t swipe the rotten, thorny ones, like anger, envy or pride. Fill your basket to win!',
      diffs: { easy: 'Slower, with fewer wrong ones. Good fruit glows to help you. 5 hearts.', normal: 'Faster, with more mixed in. Big combos! 3 hearts.', hard: 'Fastest! Some wrong ones look like fruit, so read the word. Plus “What would Jesus want?” rounds.' },
      extra: `<p class="fs-note" style="margin:0">Best scores: ${['easy', 'normal', 'hard'].map(d => `${Ark.DLABEL[d]} ${best[d] || '—'}`).join(' · ')}</p>`,
      start: d => play(d)
    });
  }

  /* ---------- play ---------- */
  function play(diff) {
    stop();
    const C = D[diff];
    g = { diff, C, lives: C.lives, score: 0, combo: 0, bestCombo: 0, good: 0, missed: 0, badHits: 0, swipes: 0, found: {}, items: [], halves: [], parts: [], splats: [], pops: [], trail: [],
      t: 0, spawnT: 1, count: 2.4, lastCount: 4, paused: false, over: false, hintT: C.hint ? 1e9 : 0, taught: {}, scn: null, scnDone: 0, last: performance.now(), shake: 0 };
    el.classList.add('fs-wide');
    el.innerHTML = `<div class="fs-view" id="fsView">
        <canvas id="fsC" aria-label="Fruit Splash. Fruit flies up the screen. Swipe the good fruit."></canvas>
        <div class="fs-hud" id="fsHud"></div>
        <div class="fs-scn" id="fsScn" hidden></div>
        <div class="fs-tip" id="fsTip" hidden></div>
        <div class="fs-card" id="fsCard" hidden></div>
      </div>`;
    fit(); hud(); wire();
    $('#fsView').scrollIntoView({ block: 'start' });
    intro();
    ctl();
    raf = requestAnimationFrame(loop);
  }
  function ctl() {
    Ark.ctl({
      help: g.diff === 'hard' ? null : () => { g.hintT = Math.max(g.hintT, g.t + 15); Ark.toast('Good fruit will glow for a while!'); say('Swipe the glowing fruit. Leave the dark, thorny ones.', true); },
      pause: () => { if (g) g.paused = true; },
      resume: () => { if (g) { g.paused = false; g.last = performance.now(); } },
      restart: () => g && play(g.diff)
    });
  }
  function fit() {
    const v = $('#fsView'), cv = $('#fsC'); if (!v || !cv) return;
    const gb = document.querySelector('.gbar'), gbh = gb ? gb.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--gbh', gbh + 'px');
    v.style.width = ''; const cs = getComputedStyle(el), cw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 6;
    const avail = Math.max(260, innerHeight - gbh - 14);
    let vw, vh;
    if (cw / avail >= 1.1) { vh = Math.min(avail, cw / 1.1); vw = Math.min(cw, vh * 2); H = 540; W = H * vw / vh; }
    else { vw = cw; vh = Math.max(vw * .9, Math.min(avail * .86, vw * 1.5)); W = 600; H = W * vh / vw; }
    v.style.width = Math.round(vw) + 'px'; v.style.height = Math.round(vh) + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    g.cx = cv.getContext('2d'); g.sc = vw / W; g.cx.setTransform(g.sc * dpr, 0, 0, g.sc * dpr, 0, 0);
  }
  const onResize = () => { if (g && $('#fsView')) fit(); };
  function hud() {
    const b = $('#fsHud'); if (!b || !g) return;
    const C = g.C;
    b.innerHTML = `<span class="fs-pill fs-lives" aria-label="${g.lives} hearts left">${'❤️'.repeat(Math.max(0, g.lives))}${'🤍'.repeat(Math.max(0, C.lives - g.lives))}</span>
      <div class="fs-bask" aria-label="Basket ${g.good} of ${C.goal}"><b style="width:${g.good / C.goal * 100}%"></b><em>🧺 ${g.good} / ${C.goal}</em></div>
      <span class="fs-pill">Score <b>${g.score}</b></span>${g.combo >= 3 ? `<span class="fs-pill fs-combo">Combo x${g.combo}</span>` : ''}`;
  }
  function tip(text, kind) {
    const t = $('#fsTip'); if (!t) return;
    t.hidden = false; t.className = 'fs-tip ' + (kind || ''); t.textContent = text;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(g.tipT); g.tipT = setTimeout(() => { const x = el && el.querySelector('#fsTip'); if (x) x.hidden = true; }, kind === 'no' ? 2600 : 1900);
  }
  function card(html) { const k = $('#fsCard'); k.hidden = false; k.innerHTML = `<div>${html}</div>`; return k.firstElementChild; }

  function intro() {
    g.paused = true;
    const k = card(`<h3>Swipe the good fruit!</h3>
      <div class="fs-demo"><div class="y"><canvas id="fsD1" width="240" height="128"></canvas>✓ Swipe these</div><div class="n"><canvas id="fsD2" width="240" height="128"></canvas>✗ Don’t swipe these</div></div>
      <p>Drag your finger (or mouse) across the good fruit. You can tap them too.</p>
      <p class="fs-note">“But the fruit of the Spirit is love, joy, peace…” Galatians 5:22 (KJV)</p>
      <div class="fs-rot"><i>📱</i> Turn your phone sideways for a bigger game!</div>
      <button class="btn big" id="fsGo" type="button">${Ark.UI.play} Start</button>`);
    // little preview pictures of good and bad items
    [['#fsD1', ['love', 'joy'], true], ['#fsD2', ['anger', 'greed'], false]].forEach(([id, keys, good]) => {
      const c = k.querySelector(id).getContext('2d'); c.scale(2, 2);
      keys.forEach((key, i) => drawThing(c, { key, good, kind: good ? GOOD[key][1] : BAD[key][1], x: 32 + i * 58, y: 30, r: 24, rot: 0, t: 0, label: true }));
    });
    k.querySelector('#fsGo').onclick = () => { $('#fsCard').hidden = true; g.paused = false; g.last = performance.now(); SFX.count(false); };
    if (g.diff === 'easy') say('Swipe the good fruit! Don’t swipe the rotten, thorny ones.');
  }

  /* ---------- input: swipes and taps cut what they cross ---------- */
  function wire() {
    const v = $('#fsView');
    const P = e => { const r = $('#fsC').getBoundingClientRect(); return [(e.clientX - r.left) / g.sc, (e.clientY - r.top) / g.sc]; };
    let down = false, lastP = null;
    v.onpointerdown = e => {
      if (e.target.closest('.fs-card, button')) return;
      e.preventDefault(); down = true; lastP = P(e);
      try { v.setPointerCapture(e.pointerId); } catch (x) {}
      g.trail = [[...lastP, g.t]]; g.swipeHits = 0; g.swipeGood = 0;
      cutAt(lastP);   // a tap counts too
    };
    v.onpointermove = e => {
      if (!down || !g) return;
      const p = P(e); if (Math.hypot(p[0] - lastP[0], p[1] - lastP[1]) < 2) return;
      cutSeg(lastP, p); g.trail.push([...p, g.t]); if (g.trail.length > 24) g.trail.shift(); lastP = p;
    };
    v.onpointerup = v.onpointercancel = () => { down = false; if (g) endSwipe(); };
  }
  const reach = it => it.r * (it.good || it.answer ? 1 : .78);   // wrong ones need a direct hit, so brushing past by accident doesn't count
  function cutAt(p) { if (!live()) return; for (const it of g.items) if (!it.cut && Math.hypot(it.x - p[0], it.y - p[1]) < reach(it)) { slice(it, 0); break; } }
  function cutSeg(a, b) {
    if (!live()) return;
    const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, ang = Math.atan2(dy, dx);
    if (Math.sqrt(L2) > 14 && g.t - (g.swT || 0) > .12) { g.swT = g.t; SFX.swoosh(); }
    for (const it of g.items) {
      if (it.cut) continue;
      if (!live()) break;
      const tt = clamp(((it.x - a[0]) * dx + (it.y - a[1]) * dy) / L2, 0, 1), cx = a[0] + dx * tt, cy = a[1] + dy * tt;
      if (Math.hypot(it.x - cx, it.y - cy) < reach(it)) slice(it, ang);
    }
  }
  const live = () => g && !g.paused && !g.over && !g.done && g.count <= 0 && $('#fsCard').hidden;
  function endSwipe() {
    if (g.swipeGood >= 3 && !g.over) { const n = g.swipeGood * 15; g.score += n; g.pops.push({ x: W / 2, y: H * .4, txt: `${g.swipeGood} in one swipe! +${n}`, c: '#FFD447', t: 0, big: true }); SFX.combo(g.combo); hud(); }
    g.swipeGood = 0;
  }

  /* ---------- slicing ---------- */
  function slice(it, ang) {
    it.cut = true; g.swipes++;
    if (it.answer) return answer(it);
    const C = g.C;
    if (it.good) {
      const info = GOOD[it.key];
      g.combo++; g.bestCombo = Math.max(g.bestCombo, g.combo); g.swipeGood = (g.swipeGood || 0) + 1;
      const mult = 1 + Math.min(4, Math.floor(g.combo / 5)), n = 10 * mult;
      g.score += n; g.good++; g.found[it.key] = (g.found[it.key] || 0) + 1;
      g.halves.push(half(it, ang, -1), half(it, ang, 1));
      splash(it.x, it.y, info[2], 18); g.splats.push({ x: it.x, y: it.y, r: it.r * rnd(.9, 1.4), c: info[2], life: 1, seed: Math.random() });
      g.pops.push({ x: it.x, y: it.y - it.r, txt: `${info[0]}! +${n}`, c: '#FFFFFF', t: 0 });
      SFX.splash(g.combo);
      if (g.combo > 0 && g.combo % 5 === 0) { SFX.combo(g.combo); g.pops.push({ x: W / 2, y: H * .3, txt: `Combo x${g.combo}!`, c: '#FFD447', t: 0, big: true }); }
      if (!g.taught[it.key] && !g.scn) { g.taught[it.key] = 1; tip(`✓ ${info[4]}`, 'ok'); if (g.diff !== 'hard') say(`${info[0]}. ${info[4]}`); }
      if (g.good >= C.goal) { g.done = true; later(() => end(true), 900); }
      else if (C.scen && g.scnDone < C.scen && g.good >= Math.round(C.goal * (g.scnDone + 1) / (C.scen + 1))) g.scnWait = true;
    } else {
      const info = BAD[it.key];
      g.combo = 0; g.badHits++; g.lives--; g.shake = .35;
      dark(it.x, it.y, info[2]);
      g.pops.push({ x: it.x, y: it.y - it.r, txt: `✗ ${info[0]}`, c: '#FF8FA3', t: 0 });
      tip(`✗ ${info[0]} isn’t a fruit of the Spirit. ${info[3]}`, 'no');
      say(`${info[0]} is not a fruit of the Spirit.`);
      SFX.bad(); if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) {}
      if (g.lives <= 0) { g.done = true; later(() => end(false), 900); }
    }
    hud();
  }
  function half(it, ang, side) {
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    return { key: it.key, kind: it.kind, x: it.x, y: it.y, r: it.r, ang, side, rot: it.rot, vr: side * rnd(2, 5), vx: it.vx * .4 + nx * side * 140, vy: Math.min(it.vy, 0) * .3 + ny * side * 140 - 120, life: 1.6 };
  }
  function splash(x, y, c, n) { for (let i = 0; i < n; i++) { const a = rnd(0, 7), s = rnd(120, 420); g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, r: rnd(3, 8), c, life: 1 }); } for (let i = 0; i < 6; i++) g.parts.push({ x, y, vx: rnd(-200, 200), vy: rnd(-300, -100), r: rnd(3, 5), c: '#FFFFFF', life: .8, star: true }); }
  function dark(x, y, c) { for (let i = 0; i < 16; i++) { const a = rnd(0, 7), s = rnd(80, 300); g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, r: rnd(4, 9), c, life: 1, shard: true }); } for (let i = 0; i < 8; i++) g.parts.push({ x, y, vx: rnd(-60, 60), vy: rnd(-80, -20), r: rnd(6, 12), c: 'rgba(60,60,70,.5)', life: 1.2, smoke: true }); }

  /* ---------- spawning: things are thrown up from the bottom in arcs ---------- */
  function launch(kind) {
    const C = g.C, good = kind === 'good', r = C.r * rnd(.92, 1.08);
    const key = good ? pick(Object.keys(GOOD)) : pick(Object.keys(BAD));
    const x = rnd(W * .14, W * .86), y = H + r + 6, peak = rnd(H * .16, H * .46);
    const G = C.grav * g.pace, vy = -Math.sqrt(2 * G * (y - peak)), tFlight = -2 * vy / G, tx = clamp(x + rnd(-W * .3, W * .3), W * .12, W * .88);
    const trick = !good && Math.random() < C.trick;
    g.items.push({ key, good, kind: good ? GOOD[key][1] : trick ? pick(Object.values(GOOD))[1] : BAD[key][1], trick, x, y, vx: (tx - x) / tFlight, vy, G, r, rot: rnd(-.5, .5), vr: rnd(-1.6, 1.6), t: 0 });
  }
  function wave() {
    const C = g.C, n = Math.round(rnd(C.multi[0], C.multi[1] + .49));
    let bads = 0;
    for (let i = 0; i < n; i++) {
      const bad = Math.random() < C.bad && bads < n - 1 && !(g.diff === 'easy' && bads >= 1);
      if (bad) bads++;
      setTimeout(() => g && !g.over && launch(bad ? 'bad' : 'good'), i * rnd(120, 260));
    }
  }

  /* ---------- Hard: "What would Jesus want?" scenario rounds ---------- */
  function scenario() {
    g.scnWait = false; g.scnDone++;
    const s = pick(SCEN.filter(x => !g.usedScn || !g.usedScn.includes(x))); g.usedScn = (g.usedScn || []).concat([s]);
    g.scn = s;
    $('#fsTip').hidden = true;
    const box = $('#fsScn'); box.hidden = false; box.innerHTML = `<small>What would Jesus want you to do?</small>${esc(s[0])}`;
    say(`What would Jesus want you to do? ${s[0]}`);
    const opts = shuf(s[1].map((t, i) => ({ t, ok: i === 0 })));
    opts.forEach((o, i) => {
      const x = W * (i + 1) / 4, r = Math.min(92, W * .12);
      g.items.push({ answer: true, text: o.t, ok: o.ok, x, y: H + r, ty: H * .56, r, rot: 0, vr: 0, vx: 0, vy: 0, t: 0, bob: i });
    });
  }
  function answer(it) {
    const s = g.scn; if (!s) return;
    g.items.filter(x => x.answer).forEach(x => (x.cut = true, x.leave = true));
    if (it.ok) { g.score += 100; g.combo++; splash(it.x, it.y, '#7ED957', 26); SFX.right(); tip(`✓ ${s[2]} +100`, 'ok'); say(s[2]); g.pops.push({ x: it.x, y: it.y - it.r, txt: '+100', c: '#FFD447', t: 0, big: true }); }
    else { g.lives--; g.combo = 0; g.shake = .3; dark(it.x, it.y, '#5C6470'); SFX.bad(); tip(`✗ A godly choice: “${s[1][0]}”. ${s[2]}`, 'no'); say(`A better choice is: ${s[1][0]}`); if (g.lives <= 0) { g.done = true; later(() => end(false), 1500); } }
    hud();
    later(() => { $('#fsScn').hidden = true; g.scn = null; g.items = g.items.filter(x => !x.answer); g.spawnT = 1; }, 2600);
  }

  /* ---------- loop ---------- */
  function loop(now) {
    raf = 0;
    if (!g || !el.isConnected || !$('#fsC')) return;
    const dt = Math.min(.04, (now - g.last) / 1000); g.last = now;
    if (!g.paused) step(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }
  function step(dt) {
    const C = g.C;
    g.t += dt; g.shake = Math.max(0, g.shake - dt);
    if (g.count > 0) {
      g.count -= dt; const n = Math.ceil(g.count / .8);
      if (n !== g.lastCount) { g.lastCount = n; if (n >= 0) SFX.count(n === 0); }
      return;
    }
    g.pace = 1 + C.speedUp * (g.good / C.goal);
    if (!g.over && !g.done && !g.scn) {
      if (g.scnWait && !g.items.some(it => !it.cut)) scenario();
      else if (!g.scnWait) { g.spawnT -= dt * g.pace; if (g.spawnT <= 0) { wave(); g.spawnT = C.every * rnd(.85, 1.15); } }
    }
    for (const it of g.items) {
      it.t += dt;
      if (it.answer) { if (!it.cut) it.y += (it.ty + Math.sin(g.t * 2 + it.bob) * 8 - it.y) * Math.min(1, dt * 3); else if (it.leave) it.y += 600 * dt; continue; }
      it.vy += it.G * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
      if (!it.cut && it.vy > 0 && it.y > H + it.r + 4) { it.cut = true; it.gone = true; if (it.good) { g.missed++; if (g.diff !== 'easy' && g.combo) { g.combo = 0; hud(); } } }
    }
    g.items = g.items.filter(it => !(it.cut && !it.answer) && it.y < H + 200 || it.answer && !(it.leave && it.y > H + 150));
    g.halves.forEach(h => { h.vy += 900 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; h.life -= dt; }); g.halves = g.halves.filter(h => h.life > 0 && h.y < H + 120);
    g.parts.forEach(q => { q.vy += (q.smoke ? -40 : 700) * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt * 1.3; }); g.parts = g.parts.filter(q => q.life > 0);
    g.splats.forEach(s => (s.life -= dt * .25)); g.splats = g.splats.filter(s => s.life > 0).slice(-14);
    g.pops.forEach(p => (p.t += dt)); g.pops = g.pops.filter(p => p.t < (p.big ? 1.4 : 1));
    g.trail = g.trail.filter(p => g.t - p[2] < .18);
  }

  /* ---------- drawing ---------- */
  function draw() {
    const c = g.cx; if (!c) return;
    c.save();
    if (g.shake > 0) c.translate(rnd(-1, 1) * 10 * g.shake, rnd(-1, 1) * 8 * g.shake);
    // a sunny orchard
    const sk = c.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#7FC8F8'); sk.addColorStop(.6, '#CDEBFF'); sk.addColorStop(1, '#FFF1C9');
    c.fillStyle = sk; c.fillRect(-20, -20, W + 40, H + 40);
    const sx = W * .85, sy = H * .16, rays = c.createRadialGradient(sx, sy, 10, sx, sy, 200); rays.addColorStop(0, 'rgba(255,240,170,.9)'); rays.addColorStop(1, 'rgba(255,240,170,0)');
    c.fillStyle = rays; c.fillRect(0, 0, W, H); c.fillStyle = '#FFD447'; c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, 34, 0, 7); c.fill(); c.stroke();
    for (let i = 0; i < 5; i++) { const x = ((i * 260 + g.t * (10 + i * 3)) % (W + 240)) - 120, y = 40 + (i * 53) % (H * .3); cloud(c, x, y, .8 + (i % 3) * .25); }
    c.fillStyle = '#9BD08A'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * .72 - 26 * Math.sin(x / 120) - 12 * Math.sin(x / 47)); c.lineTo(W, H); c.fill();
    tree(c, W * .07, H * .9, H * .0042); tree(c, W * .93, H * .9, H * .0038);
    c.fillStyle = '#6FBF5A'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * .86 - 10 * Math.sin(x / 70 + 1)); c.lineTo(W, H); c.fill();
    // juice splats on the scene
    g.splats.forEach(s => { c.globalAlpha = Math.min(.55, s.life * .55); c.fillStyle = s.c; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, rr = s.r * (.7 + .5 * Math.sin(s.seed * 50 + k * 2.3)); c.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr); } c.closePath(); c.fill(); });
    c.globalAlpha = 1;
    // flying things
    const hints = g.t < g.hintT;
    g.items.forEach(it => { if (!it.cut || it.answer && it.leave) it.answer ? bubble(c, it) : drawThing(c, Object.assign({ label: true, hint: hints, t: g.t }, it)); });
    g.halves.forEach(h => drawHalf(c, h));
    g.parts.forEach(q => {
      c.globalAlpha = clamp(q.life, 0, 1); c.fillStyle = q.c; c.beginPath();
      if (q.star) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? q.r * .45 : q.r * 1.4; c.lineTo(q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr); } c.closePath(); }
      else if (q.shard) { c.moveTo(q.x, q.y - q.r); c.lineTo(q.x + q.r, q.y + q.r * .6); c.lineTo(q.x - q.r, q.y + q.r * .6); c.closePath(); }
      else c.arc(q.x, q.y, q.r, 0, 7);
      c.fill();
    });
    c.globalAlpha = 1;
    // the swipe trail: a bright glowing streak
    if (g.trail.length > 1) {
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (let pass = 0; pass < 2; pass++) {
        c.strokeStyle = pass ? '#FFFFFF' : 'rgba(255,212,71,.7)'; c.lineWidth = pass ? 5 : 14;
        c.beginPath(); g.trail.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    }
    // pop-up words
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    g.pops.forEach(p => { const life = p.big ? 1.4 : 1; c.globalAlpha = clamp((life - p.t) * 2, 0, 1); c.font = `400 ${p.big ? 40 : 26}px "Lilita One", sans-serif`; c.lineWidth = 6; c.strokeStyle = ink; c.fillStyle = p.c; const y = p.y - p.t * 50, x = clamp(p.x, 120, W - 120); c.strokeText(p.txt, x, y); c.fillText(p.txt, x, y); });
    c.globalAlpha = 1;
    if (g.count > 0 && $('#fsCard').hidden) { const n = Math.ceil(g.count / .8), txt = n >= 1 ? String(Math.min(3, n)) : 'GO!'; c.font = '400 110px "Lilita One", sans-serif'; c.lineWidth = 10; c.strokeStyle = ink; c.fillStyle = '#FFD447'; c.strokeText(txt, W / 2, H / 2); c.fillText(txt, W / 2, H / 2); }
    c.restore();
  }
  function cloud(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s * 1.6, s * 1.6); c.fillStyle = 'rgba(255,255,255,.95)'; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 20); c.arc(12, 20, 12, Math.PI, Math.PI * 1.5); c.arc(28, 14, 15, Math.PI * 1.1, Math.PI * 1.9); c.arc(44, 20, 10, Math.PI * 1.4, 0); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  function tree(c, x, y, k) {
    c.save(); c.translate(x, y); c.scale(k * 30, k * 30);
    c.fillStyle = '#8B5A2B'; c.strokeStyle = ink; c.lineWidth = .1; c.beginPath(); c.moveTo(-.5, 0); c.lineTo(-.3, -3); c.lineTo(.3, -3); c.lineTo(.5, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#3FA34D'; [[0, -4.2, 2.2], [-1.4, -3.4, 1.4], [1.4, -3.4, 1.4]].forEach(([a, b, r]) => { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); c.stroke(); });
    ['#E63946', '#F28C28', '#7A3E9D', '#F2C14E', '#E63946'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-1.6 + i * .8, -3.6 - (i % 2) * .9, .28, 0, 7); c.fill(); });
    c.restore();
  }
  // a face that makes fruit friendly and the wrong things grumpy
  function face(c, r, happy) {
    c.fillStyle = ink;
    c.beginPath(); c.arc(-r * .28, -r * .05, r * .09, 0, 7); c.arc(r * .28, -r * .05, r * .09, 0, 7); c.fill();
    c.strokeStyle = ink; c.lineWidth = r * .07; c.lineCap = 'round'; c.beginPath();
    if (happy) c.arc(0, r * .12, r * .22, .3, Math.PI - .3);
    else { c.arc(0, r * .42, r * .2, Math.PI + .4, -.4); c.moveTo(-r * .45, -r * .3); c.lineTo(-r * .15, -r * .2); c.moveTo(r * .45, -r * .3); c.lineTo(r * .15, -r * .2); }
    c.stroke(); c.lineCap = 'butt';
    if (happy) { c.fillStyle = 'rgba(255,120,140,.45)'; c.beginPath(); c.arc(-r * .45, r * .15, r * .1, 0, 7); c.arc(r * .45, r * .15, r * .1, 0, 7); c.fill(); }
  }
  function body(c, kind, r, col, t) {
    c.strokeStyle = ink; c.lineWidth = Math.max(2, r * .06); c.lineJoin = 'round';
    const leaf = (x, y, a) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#3FA34D'; c.beginPath(); c.ellipse(0, 0, r * .28, r * .12, 0, 0, 7); c.fill(); c.stroke(); c.restore(); };
    const hi = () => { c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-r * .35, -r * .4, r * .18, r * .1, -.6, 0, 7); c.fill(); };
    if (kind === 'strawberry') { c.fillStyle = col; c.beginPath(); c.moveTo(0, r); c.bezierCurveTo(-r * 1.2, r * .2, -r * 1.1, -r * .9, 0, -r * .7); c.bezierCurveTo(r * 1.1, -r * .9, r * 1.2, r * .2, 0, r); c.fill(); c.stroke(); c.fillStyle = '#FFE58A'; for (let i = 0; i < 8; i++) { c.beginPath(); c.ellipse(Math.cos(i * 1.7) * r * .5, Math.sin(i * 2.3) * r * .4 + r * .15, r * .04, r * .07, 0, 0, 7); c.fill(); } [-.6, 0, .6].forEach(a => leaf(Math.sin(a) * r * .3, -r * .75, a)); hi(); }
    else if (kind === 'banana') { c.fillStyle = col; c.beginPath(); c.moveTo(-r * .9, -r * .3); c.quadraticCurveTo(-r * .2, r * 1.1, r * .95, -r * .45); c.quadraticCurveTo(r * .2, r * .45, -r * .7, -r * .5); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#6B4423'; c.beginPath(); c.arc(r * .95, -r * .45, r * .08, 0, 7); c.fill(); }
    else if (kind === 'grapes') { c.fillStyle = col; [[0, -.45], [-.4, -.35], [.4, -.35], [-.2, 0], [.2, 0], [-.55, .05], [.55, .05], [0, .4], [-.3, .38], [.3, .38], [0, .75]].forEach(([a, b]) => { c.beginPath(); c.arc(a * r, b * r, r * .27, 0, 7); c.fill(); c.stroke(); }); leaf(r * .2, -r * .85, .4); }
    else if (kind === 'pear') { c.fillStyle = col; c.beginPath(); c.moveTo(0, -r * .85); c.bezierCurveTo(r * .45, -r * .85, r * .35, -r * .2, r * .8, r * .3); c.bezierCurveTo(r, r * 1.05, -r, r * 1.05, -r * .8, r * .3); c.bezierCurveTo(-r * .35, -r * .2, -r * .45, -r * .85, 0, -r * .85); c.fill(); c.stroke(); c.strokeStyle = '#6B4423'; c.beginPath(); c.moveTo(0, -r * .85); c.lineTo(r * .1, -r * 1.05); c.stroke(); leaf(r * .3, -r * .95, .5); hi(); }
    else if (kind === 'melon') { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke(); c.strokeStyle = '#1E6B33'; c.lineWidth = r * .1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.ellipse(i * r * .3, 0, r * .08, r * .95, 0, 0, 7); c.stroke(); } c.strokeStyle = ink; c.lineWidth = Math.max(2, r * .06); c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); hi(); }
    else if (kind === 'thorn') {
      c.fillStyle = col; c.beginPath();
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * .5, rr = i % 2 ? r * .82 : r * 1.12; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      c.closePath(); c.fill(); c.stroke();
    } else if (kind === 'rotten') {
      c.fillStyle = col; c.beginPath(); c.moveTo(0, -r * .7); c.bezierCurveTo(r * 1.1, -r * 1.05, r * 1.15, r * .9, 0, r * .9); c.bezierCurveTo(-r * 1.15, r * .9, -r * 1.1, -r * 1.05, 0, -r * .7); c.fill(); c.stroke();
      c.fillStyle = 'rgba(30,20,10,.45)'; [[.4, .3, .2], [-.45, -.1, .16], [.1, .55, .12]].forEach(([a, b, s]) => { c.beginPath(); c.ellipse(a * r, b * r, s * r, s * r * .8, 0, 0, 7); c.fill(); });
      c.strokeStyle = '#E8C9A0'; c.lineWidth = r * .1; c.lineCap = 'round'; c.beginPath(); c.moveTo(r * .6, -r * .5); c.quadraticCurveTo(r * .95, -r * .8 + Math.sin(t * 6) * r * .1, r * 1.1, -r * .55); c.stroke(); c.lineCap = 'butt';
    } else if (kind === 'stone') {
      c.fillStyle = col; c.beginPath(); c.moveTo(-r, r * .3); c.lineTo(-r * .7, -r * .6); c.lineTo(-r * .1, -r * .95); c.lineTo(r * .7, -r * .7); c.lineTo(r, r * .1); c.lineTo(r * .6, r * .85); c.lineTo(-r * .5, r * .9); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(-r * .2, -r * .9); c.lineTo(0, -r * .4); c.lineTo(-r * .25, r * .1); c.stroke();
      c.strokeStyle = '#8E96A3'; c.lineWidth = r * .1; c.beginPath(); for (let i = 0; i < 4; i++) c.ellipse(-r * .9 + i * r * .3, r * .55, r * .14, r * .09, 0, 0, 7); c.stroke();
    } else {
      // round fruit: orange, plum, apple, peach
      c.fillStyle = col; c.beginPath();
      if (kind === 'apple') { c.moveTo(0, -r * .65); c.bezierCurveTo(r * 1.15, -r * 1.1, r * 1.2, r * .95, 0, r * .9); c.bezierCurveTo(-r * 1.2, r * .95, -r * 1.15, -r * 1.1, 0, -r * .65); }
      else c.arc(0, 0, r, 0, 7);
      c.fill(); c.stroke();
      if (kind === 'peach') { c.strokeStyle = 'rgba(200,80,60,.5)'; c.beginPath(); c.moveTo(0, -r * .9); c.quadraticCurveTo(-r * .3, 0, 0, r * .9); c.stroke(); }
      if (kind === 'orange') { c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(Math.cos(i * 2.1) * r * .55, Math.sin(i * 1.3) * r * .55, r * .04, 0, 7); c.fill(); } }
      c.strokeStyle = '#6B4423'; c.lineWidth = Math.max(2, r * .07); c.beginPath(); c.moveTo(0, -r * .7); c.lineTo(r * .08, -r * 1.0); c.stroke();
      leaf(r * .28, -r * .92, .5); hi();
    }
  }
  function drawThing(c, o) {
    const r = o.r, good = o.good;
    c.save(); c.translate(o.x, o.y);
    if (o.hint && good) { const gl = c.createRadialGradient(0, 0, r * .6, 0, 0, r * 1.6); gl.addColorStop(0, 'rgba(255,230,120,.75)'); gl.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 0, r * 1.6, 0, 7); c.fill(); }
    c.save(); c.rotate(o.rot * (o.kind === 'thorn' ? 0 : 1) * .4);
    const col = good ? GOOD[o.key][2] : o.trick ? GOOD[Object.keys(GOOD).find(k => GOOD[k][1] === o.kind)][2] : BAD[o.key][2];
    body(c, o.kind, r, col, o.t || 0);
    if (o.trick) { c.fillStyle = 'rgba(40,30,20,.5)'; c.beginPath(); c.ellipse(r * .35, r * .35, r * .2, r * .15, 0, 0, 7); c.fill(); }
    face(c, r, good);
    c.restore();
    // flies buzz round the bad ones (not on Hard's tricky ones)
    if (!good && !o.trick && g && g.diff !== 'hard') { c.fillStyle = ink; for (let i = 0; i < 3; i++) { const a = (o.t || 0) * 7 + i * 2.1, fx = Math.cos(a) * r * 1.25, fy = Math.sin(a * 1.3) * r * .8 - r * .4; c.beginPath(); c.arc(fx, fy, 2.6, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1; c.beginPath(); c.ellipse(fx - 2, fy - 3, 3, 2, -.5, 0, 7); c.ellipse(fx + 2, fy - 3, 3, 2, .5, 0, 7); c.stroke(); } }
    if (o.hint && !good) { c.fillStyle = '#D7263D'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(r * .8, -r * .8, r * .3, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.font = `800 ${Math.round(r * .4)}px Nunito, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✗', r * .8, -r * .78); }
    if (o.label) {
      const txt = good ? GOOD[o.key][0] : BAD[o.key][0], fs = Math.max(11, Math.round(r * .4));
      c.font = `800 ${fs}px Nunito, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const tw = c.measureText(txt).width + fs, th = fs * 1.5, ly = r * 1.05;
      c.fillStyle = good ? '#FFFFFF' : '#1E1E26'; c.strokeStyle = good ? col : '#000'; c.lineWidth = 3;
      c.beginPath(); if (c.roundRect) c.roundRect(-tw / 2, ly - th / 2, tw, th, th / 2); else c.rect(-tw / 2, ly - th / 2, tw, th); c.fill(); c.stroke();
      c.fillStyle = good ? ink : '#FFFFFF'; c.fillText(txt, 0, ly + 1);
    }
    c.restore();
  }
  function drawHalf(c, h) {
    const col = GOOD[h.key][2], flesh = GOOD[h.key][3], r = h.r;
    c.save(); c.globalAlpha = clamp(h.life, 0, 1); c.translate(h.x, h.y); c.rotate(h.ang + h.rot * .5);
    c.beginPath(); c.rect(-r * 1.6, h.side < 0 ? -r * 1.6 : 0, r * 3.2, r * 1.6); c.clip();
    c.rotate(-h.ang); body(c, h.kind, r, col, 0); c.rotate(h.ang);
    c.fillStyle = flesh; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, r * .92, r * .14, 0, 0, 7); c.fill(); c.stroke();
    c.restore(); c.globalAlpha = 1;
  }
  function bubble(c, it) {
    const r = it.r;
    c.save(); c.translate(it.x, it.y);
    c.fillStyle = 'rgba(255,255,255,.96)'; c.strokeStyle = '#7A3E9D'; c.lineWidth = 4;
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-r * .2, r * .95); c.lineTo(-r * .35, r * 1.25); c.lineTo(r * .05, r * .98); c.fill(); c.stroke();
    c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    let fs = Math.round(r * .26); c.font = `800 ${fs}px Nunito, sans-serif`;
    const words = it.text.split(' '), lines = []; let ln = '';
    words.forEach(w => { const t = ln ? ln + ' ' + w : w; if (c.measureText(t).width > r * 1.6 && ln) { lines.push(ln); ln = w; } else ln = t; }); lines.push(ln);
    lines.forEach((l, i) => c.fillText(l, 0, (i - (lines.length - 1) / 2) * fs * 1.2));
    c.restore();
  }

  /* ---------- end ---------- */
  function end() {
    if (!g || g.over) return;
    g.over = true;
    const won = g.good >= g.C.goal && g.lives > 0;
    const { diff, C, score, lives, bestCombo, good, badHits, found } = g;
    const lost = C.lives - lives, stars = lost === 0 ? 3 : lost <= (diff === 'easy' ? 2 : 1) ? 2 : 1;
    const best = storeJSON('fs-best') || {}, prev = best[diff] || 0, nb = score > prev;
    if (nb) { best[diff] = score; storeJSON('fs-best', best); }
    const foundHTML = `<div class="fs-found">${Object.keys(GOOD).map(k => `<span class="${found[k] ? 'on' : ''}">${GOOD[k][0]}${found[k] ? ' ✓' : ''}</span>`).join('')}</div>`;
    const sum = `<div class="fs-sum"><span>Score ${score}</span><span>Best ${Math.max(score, prev)}</span><span>🧺 ${good}</span><span>🔥 Combo ${bestCombo}</span><span>${badHits ? `✗ ${badHits} wrong` : '✓ No wrong swipes!'}</span></div>`;
    const challenge = `🎯 <b>Next challenge:</b> ${badHits ? 'fill the basket without swiping a single wrong one!' : nb && prev ? 'you set a new best. Can you beat it again?' : `beat your best of <b>${Math.max(score, prev)}</b>!`}`;
    const d = diff;
    later(() => {
      cancelAnimationFrame(raf); raf = 0; el.classList.remove('fs-wide');
      if (won) {
        SFX.win();
        Ark.finish(el, {
          id: 'fruit-vs-flesh', diff: d, stars, title: 'Basket full! 🧺',
          html: `${sum}${nb && prev ? '<span class="newbest">New best score!</span>' : ''}<p style="margin:0;font-weight:800">Fruit you splashed:</p>${foundHTML}<div class="lesson" style="text-align:left;border-color:var(--amber)">${challenge}</div>`,
          verse: ['But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance.', 'Galatians 5:22–23 (KJV)'],
          lesson: 'When we follow Jesus, the Holy Spirit helps this good fruit grow in us. (The King James words “longsuffering”, “meekness” and “temperance” mean patience, gentleness and self-control.)',
          again: () => play(d), menu,
          next: d !== 'hard' ? [`Try ${d === 'easy' ? 'Normal' : 'Hard'}`, () => { const n = d === 'easy' ? 'normal' : 'hard'; store('diff-fruit-vs-flesh', n); play(n); }] : null
        });
      } else {
        el.innerHTML = `<div class="fin"><h2>Out of hearts!</h2>${sum}
          <p class="story">You filled ${good} of ${C.goal} in your basket. Swipe only the good fruit, and leave the rotten, thorny ones.</p>
          <p style="margin:0;font-weight:800">Fruit you splashed:</p>${foundHTML}
          <div class="lesson" style="text-align:left">“The fruit of the Spirit is love, joy, peace…” (Galatians 5:22, KJV). God helps this good fruit grow in us, a little more every day.</div>
          <div class="row"><button class="btn big" id="fsAgain">${Ark.UI.restart} Play again</button><button class="btn ghost" id="fsDiff">Change difficulty</button></div>
          <a class="btn more big" href="#all">${Ark.UI.grid} More Games</a></div>`;
        el.querySelector('#fsAgain').onclick = () => play(d);
        el.querySelector('#fsDiff').onclick = menu;
        Ark.ctl({ restart: () => play(d) });
      }
      if (nb && prev) Ark.toast('New best score!');
      g = null;
    }, 700);
  }

  function stop() { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; if (g) clearTimeout(g.tipT); g = null; }

  Ark.games['fruit-vs-flesh'] = {
    mount(stage) { el = stage; css(); addEventListener('resize', onResize); menu(); },
    unmount() { stop(); hush(); if (el) el.classList.remove('fs-wide'); removeEventListener('resize', onResize); },
    _test: { state: () => g, D, swipe: (a, b) => cutSeg(a, b), tap: p => cutAt(p), endSwipe: () => endSwipe(), size: () => [W, H] }
  };
})();
