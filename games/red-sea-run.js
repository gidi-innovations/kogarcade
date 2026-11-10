/* Red Sea Run 2.0 (Exodus 14–15). Run Through the Sea. Discover God's Power.
   A behind-the-runner, 3D-style lane runner across the dry sea bed between two walls of water.
   Stage 1 The Sea Opens: hold to stretch out Moses' hand, then a guided practice run.
   Stage 2 Journey Through the Sea: the main run (fish in the walls, Israelites ahead, discoveries).
   Stage 3 Reach the Other Side!: the shore and finish marker, then the waters return (only once everyone is
   safely across) and Miriam's song with a tambourine rhythm game.
   The obstacles are game challenges; the Bible says God's people walked through on dry ground. Bumps slow you down
   and break your combo, but nothing ends the game early. */
(() => {
  const { store, storeJSON, say, hush, shuf, esc } = Ark;
  const ink = '#13203A';

  /* ---------- world and camera (metres) ---------- */
  const LW = 1.8, WX = 3.5, WH = 7, CAMD = 4, CAMH = 2.4, FAR = 75, NEAR = -2.5, HY = 150, FOC = 540;   // camera close behind the runner
  let W = 960, H = 540, OY = 0;
  const proj = (x, y, dz) => { const s = FOC / (dz + CAMD); return [W / 2 + x * s, HY + (CAMH - y) * s, s]; };
  const laneX = l => (l - 1) * LW;

  /* ---------- difficulty: speeds (m/s) per stage, lengths (m), gaps (s), patterns ---------- */
  const D = {
    easy: { spd: [[7, 7.5], [8, 10], [10, 11]], len: [230, 520, 300], gap: [1.7, 2.3], minGap: 1.1, comboT: 0, jumpT: .84, slideT: .8, tol: .25, hitW: .32, hint: true,
      tamb: [2, 3, 2], pats: [{ low1: 4, block1: 3, lowAll: 2 }, { low1: 4, block1: 3, lowAll: 2, high1: 1, low2: 2 }, { low1: 3, block1: 3, lowAll: 2, high1: 1, low2: 2 }], bpm: 72, win: .26 },
    normal: { spd: [[8.5, 9], [9.5, 13], [13, 14.5]], len: [260, 720, 380], gap: [1.15, 1.6], minGap: .75, comboT: 0, jumpT: .74, slideT: .72, tol: .12, hitW: .42, hint: false,
      tamb: [2, 4, 3], pats: [{ low1: 3, block1: 3, lowAll: 2, high1: 2, highAll: 1 }, { low1: 2, block1: 2, block2: 3, lowAll: 2, highAll: 2, high1: 2, blockLow: 2 }, { block2: 3, lowAll: 2, highAll: 2, blockLow: 2, mix: 2, low2: 1 }], bpm: 88, win: .2 },
    hard: { spd: [[10, 10.5], [11, 16], [16, 17.5]], len: [300, 900, 460], gap: [.85, 1.25], minGap: .6, comboT: .55, jumpT: .66, slideT: .66, tol: .05, hitW: .48, hint: false,
      tamb: [2, 5, 4], pats: [{ low1: 2, block1: 2, block2: 2, lowAll: 2, high1: 2, highAll: 1 }, { block2: 3, lowAll: 2, highAll: 2, blockLow: 3, mix: 3, combo: 2 }, { block2: 3, blockLow: 3, mix: 3, combo: 3, lowAll: 1, highAll: 1 }], bpm: 104, win: .15 }
  };
  const STAGES = ['The Sea Opens', 'Journey Through the Sea', 'Reach the Other Side!'];
  const LOW = { rock: { top: .55, dh: .45 }, weed: { top: .5, dh: .35 }, ridge: { top: .38, dh: .55 }, log: { top: .5, dh: .4 } };
  const BADGES = {
    steady: ['🛡️', 'Steady Steps', 'Run Stage 2 without a single bump'],
    combo: ['🔥', 'Combo x10', 'Get 10 jumps, slides or dodges in a row'],
    near: ['⚡', 'Close Call', 'Make 5 near misses in one game'],
    tamb: [null, 'Tambourine Collector', 'Collect every tambourine'],
    rhythm: ['🎶', 'Song of Praise', 'Hit all 8 beats in Miriam’s song'],
    explorer: ['📖', 'Bible Explorer', 'Get every Bible Discovery right'],
    hard: ['🌊', 'Sea Crosser', 'Finish the whole journey on Hard'],
    team: ['🤝', 'Travel Together', 'Finish a two-player game']
  };
  /* Bible discoveries shown while running (short, never blocking). (summary) = in our own words; quotation marks = KJV. */
  const FINDS = [
    [[.3, 'The water stood up like a wall on both sides!', 'Exodus 14:22 (summary)'], [.7, '“The children of Israel went into the midst of the sea upon the dry ground.”', 'Exodus 14:22 (KJV)']],
    [[.15, 'The pillar of cloud moved behind God’s people to protect them.', 'Exodus 14:19–20 (summary)'], [.4, 'God sent a strong east wind all night long.', 'Exodus 14:21 (summary)'], [.65, '“The LORD shall fight for you.”', 'Exodus 14:14 (KJV)'], [.88, '“Fear ye not, stand still, and see the salvation of the LORD.”', 'Exodus 14:13 (KJV)']],
    [[.25, '“Speak unto the children of Israel, that they go forward.”', 'Exodus 14:15 (KJV)'], [.6, 'Morning is coming. The far shore is near!', 'Exodus 14:24, 27 (summary)']]
  ];

  const TB = '<svg viewBox="0 0 24 24" width="1.05em" height="1.05em" style="vertical-align:-.18em" aria-label="tambourine"><circle cx="12" cy="12" r="10" fill="#F2C14E" stroke="#13203A" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="#FFF3DC"/><g fill="#C0392B"><circle cx="12" cy="3.3" r="1.7"/><circle cx="20.3" cy="9.3" r="1.7"/><circle cx="17.2" cy="19.2" r="1.7"/><circle cx="6.8" cy="19.2" r="1.7"/><circle cx="3.7" cy="9.3" r="1.7"/></g></svg>';
  function tambIcon(c, x, y, r) {
    c.fillStyle = '#F2C14E'; c.strokeStyle = ink; c.lineWidth = r * .12; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#FFF3DC'; c.beginPath(); c.arc(x, y, r * .62, 0, 7); c.fill();
    c.fillStyle = '#C0392B'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + g.t; c.beginPath(); c.arc(x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82, r * .15, 0, 7); c.fill(); }
  }
  let el, g = null, raf = 0;
  const $ = s => el.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const mixC = (a, b, t) => `rgb(${[1, 3, 5].map(i => Math.round(lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), clamp(t, 0, 1)))).join(',')})`;
  function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pickW = (w, r) => { const k = Object.keys(w), tot = k.reduce((s, x) => s + w[x], 0); let v = r() * tot; for (const x of k) { v -= w[x]; if (v <= 0) return x; } return k[0]; };
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(() => g && fn(), ms));

  /* ---------- sound effects (made in the browser, soft; the Sound button turns them on and off) ---------- */
  const SFX = (() => {
    let ctx = null;
    const ac = () => { if (!Ark.voiceOn()) return null; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; };
    function tone(f, d, o = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0), osc = c.createOscillator(), gn = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .08, t + Math.min(.03, d / 4)); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      osc.connect(gn); gn.connect(c.destination); osc.start(t); osc.stop(t + d + .02);
    }
    function noise(d, o = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0), n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain();
      s.buffer = b; fl.type = o.type || 'lowpass'; fl.frequency.value = o.f || 800;
      gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .06, t + (o.rise || .02)); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(fl); fl.connect(gn); gn.connect(c.destination); s.start(t);
    }
    return {
      jump: () => tone(360, .22, { to: 720, vol: .06 }),
      slide: () => noise(.3, { type: 'bandpass', f: 900, vol: .05 }),
      lane: () => tone(520, .06, { vol: .035 }),
      water: () => { tone(700, .08, { to: 1100, vol: .05 }); tone(900, .1, { to: 1400, vol: .04, at: .05 }); },
      bread: () => [523, 784].forEach((f, i) => tone(f, .12, { vol: .05, at: i * .06 })),
      tamb: () => { for (let i = 0; i < 3; i++) noise(.09, { type: 'highpass', f: 5000, vol: .05, at: i * .05 }); tone(1568, .2, { vol: .03 }); },
      hit: () => { tone(170, .22, { type: 'triangle', to: 90, vol: .1 }); noise(.15, { f: 500, vol: .05 }); },
      near: () => { noise(.2, { type: 'bandpass', f: 1800, vol: .04 }); tone(988, .12, { vol: .05, at: .08 }); },
      combo: n => tone(600 + Math.min(n, 12) * 40, .1, { vol: .04 }),
      count: hi => tone(hi ? 880 : 440, .15, { vol: .06 }),
      wind: () => noise(2.2, { type: 'bandpass', f: 450, vol: .05, rise: .6 }),
      waves: () => noise(2.6, { f: 300, vol: .06, rise: .5 }),
      cheer: () => { noise(1.2, { type: 'bandpass', f: 1400, vol: .05, rise: .2 }); [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, { vol: .05, at: .2 + i * .12 })); },
      beat: () => tone(330, .05, { vol: .03 }),
      win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, { vol: .07, at: i * .12 }))
    };
  })();

  function css() {
    if (document.getElementById('rsr-css')) return;
    const s = document.createElement('style'); s.id = 'rsr-css';
    s.textContent = `
      .stage.rs-wide{max-width:1200px}
      @media (orientation:landscape) and (max-height:600px){.stage.rs-wide{padding:8px;gap:8px;border-width:2px}.stage.rs-wide .rs-stg span{font-size:11px;padding:2px 4px}}
      .rs-top{display:grid;gap:6px}
      .rs-stg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
      .rs-stg span{font-size:12px;font-weight:800;text-align:center;padding:4px;border-radius:10px;border:2px solid var(--line);background:var(--chip);line-height:1.15}
      .rs-stg span.on{background:var(--emerald);color:#fff}.rs-stg span.now{background:var(--amber);color:#13203A}
      .rs-sc{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-variant-numeric:tabular-nums}
      .rs-pl{display:flex;gap:6px}.rs-pl span{padding:3px 10px;border-radius:999px;border:2px solid var(--line);background:var(--chip);font-size:14px}.rs-pl span.turn{background:var(--amber);color:#13203A}
      .rs-view{position:relative;margin:0 auto;border:3px solid var(--line);border-radius:16px;overflow:hidden;line-height:0;touch-action:none;user-select:none;-webkit-user-select:none;background:#1B2450;scroll-margin-top:calc(var(--gbh,60px) + 4px);-webkit-tap-highlight-color:transparent}
      .rs-view canvas{display:block;width:100%;height:100%}
      .rs-hud{position:absolute;left:8px;right:8px;top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;pointer-events:none;line-height:1.2;z-index:2}
      .rs-jb{position:relative;flex:1 1 160px;height:20px;border:3px solid #13203A;border-radius:99px;background:rgba(255,255,255,.8);overflow:hidden;display:flex}
      .rs-jb i{position:relative;height:100%;border-right:2px solid #13203A;font-style:normal}
      .rs-jb i:last-child{border-right:0}
      .rs-jb i b{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#14946B,#7ED957)}
      .rs-jb i.done b{width:100%!important}
      .rs-jb i em{position:absolute;inset:0;display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:800;color:#13203A}
      .rs-pill{background:rgba(255,255,255,.92);color:#13203A;border:3px solid #13203A;border-radius:99px;padding:1px 9px;font-weight:800;font-size:clamp(12px,2.5vmin,17px);white-space:nowrap;font-variant-numeric:tabular-nums}
      .rs-pill.combo{background:#FFD447;animation:rsPop .3s cubic-bezier(.3,1.6,.5,1)}
      @keyframes rsPop{from{transform:scale(.6)}}
      .rs-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:max(8px,1.6vmin);pointer-events:none;z-index:2;line-height:1}
      .rs-pad>div{display:flex;gap:max(8px,1.6vmin);pointer-events:none}
      .rs-pad .ud{flex-direction:column}
      .rs-pad button{pointer-events:auto;width:clamp(58px,15vmin,104px);height:clamp(58px,15vmin,104px);border-radius:50%;border:4px solid #13203A;background:rgba(255,255,255,.88);color:#13203A;font:inherit;font-weight:800;font-size:clamp(24px,6vmin,40px);display:grid;place-content:center;justify-items:center;box-shadow:0 5px 0 #13203A;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent}
      .rs-pad button span{font-size:clamp(10px,2.3vmin,15px);letter-spacing:.05em}
      .rs-pad button[data-a=jump]{background:#FFD447}.rs-pad button[data-a=slide]{background:#9FD8FF}
      .rs-pad button.down{transform:translateY(5px);box-shadow:0 0 0 #13203A;filter:brightness(1.1)}
      .rs-pad button.pulse{animation:rsPulse .8s ease-in-out infinite}
      @keyframes rsPulse{50%{box-shadow:0 0 0 10px rgba(255,212,71,.9),0 5px 0 #13203A}}
      @media (pointer:fine){.rs-pad button{width:62px;height:62px;font-size:26px}}
      .rs-keys{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);font-weight:800;font-size:12px;color:#fff;background:rgba(19,32,58,.6);border-radius:999px;padding:4px 10px;line-height:1.3;pointer-events:none;white-space:nowrap;z-index:1}
      @media (pointer:coarse){.rs-keys{display:none}}
      .rs-banner{position:absolute;left:50%;top:42px;transform:translateX(-50%);max-width:min(560px,calc(100% - 20px));background:rgba(255,255,255,.95);color:#13203A;border:3px solid #13203A;border-radius:16px;padding:6px 6px 6px 12px;font-weight:800;font-size:clamp(13px,2.8vmin,18px);line-height:1.3;display:flex;gap:8px;align-items:center;z-index:3;animation:rsIn .35s ease-out}
      .rs-banner small{display:block;font-size:.75em;color:#1F55D6}
      .rs-banner button,.rs-cap button{font:inherit;font-size:15px;border:2px solid #13203A;background:#FFD447;border-radius:50%;width:32px;height:32px;cursor:pointer;flex:none;line-height:1}
      @keyframes rsIn{from{opacity:0;transform:translate(-50%,-8px)}}
      .rs-cap{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:max-content;max-width:calc(100% - 20px);background:rgba(255,255,255,.95);color:#13203A;border:3px solid #13203A;border-radius:16px;padding:6px 6px 6px 14px;font-weight:800;font-size:clamp(15px,3.3vmin,23px);line-height:1.3;display:flex;gap:8px;align-items:center;z-index:3;animation:rsIn .35s ease-out}
      .rs-cap small{display:block;font-size:.65em;color:#1F55D6}
      .rs-teach{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);background:#FFD447;color:#13203A;border:4px solid #13203A;border-radius:20px;padding:10px 18px;font-family:var(--display);font-size:clamp(22px,5.5vmin,40px);line-height:1.1;text-align:center;z-index:3;pointer-events:none;animation:rsPulse2 .9s ease-in-out infinite}
      .rs-teach small{display:block;font-family:var(--body);font-weight:800;font-size:clamp(12px,2.6vmin,17px)}
      @keyframes rsPulse2{50%{transform:translate(-50%,-50%) scale(1.06)}}
      .rs-act{position:absolute;left:0;right:0;bottom:max(12px,2vmin);display:flex;justify-content:center;gap:10px;z-index:3;pointer-events:none;line-height:1.2}
      .rs-act>*{pointer-events:auto}
      .rs-act .btn{max-width:calc(100% - 20px);font-size:clamp(16px,3.6vmin,26px);padding:clamp(10px,2vmin,16px) clamp(16px,3.4vmin,30px)}
      .rs-hold{position:relative;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      .rs-hold::before{content:"";position:absolute;inset:0 auto 0 0;width:calc(var(--p,0) * 100%);background:rgba(126,217,87,.75);z-index:0}
      .rs-hold>*{position:relative;z-index:1}
      .rs-hold.down{transform:translateY(3px);box-shadow:0 1px 0 var(--line)}
      .rs-card{position:absolute;inset:0;display:grid;place-items:center;background:rgba(19,32,58,.45);padding:10px;z-index:4;line-height:1.4}
      .rs-card>div{background:var(--surface);color:var(--ink);border:3px solid var(--line);border-radius:20px;padding:clamp(12px,2.6vmin,22px);display:grid;gap:10px;justify-items:center;text-align:center;width:min(520px,100%);max-height:100%;overflow:auto;animation:rsIn2 .3s ease-out}
      @keyframes rsIn2{from{opacity:0;transform:scale(.94)}}
      .rs-card h3{font-size:clamp(22px,4.6vmin,32px)}
      .rs-card p{margin:0;font-weight:700}
      .rs-card .chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
      .rs-card .chip2{font-weight:800;padding:4px 10px;border-radius:999px;background:var(--bg);border:2px solid var(--line);font-size:14px}
      .rs-card .how{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;width:100%}
      .rs-card .how div{background:var(--bg);border-radius:14px;padding:8px;font-weight:800;font-size:14px;display:grid;gap:2px;justify-items:center}
      .rs-card .how b{font-size:28px;line-height:1}
      .rs-card .note{font-size:13px;color:var(--muted);font-weight:700}
      .rs-rot{display:none;align-items:center;gap:8px;font-weight:800;font-size:14px;background:#FFF3C4;color:#13203A;border:2px solid #13203A;border-radius:12px;padding:6px 10px;text-align:left}
      .rs-rot i{display:inline-block;font-style:normal;font-size:24px;animation:rsRot 2s ease-in-out infinite}
      @keyframes rsRot{35%,65%{transform:rotate(-90deg)}}
      @media (orientation:portrait) and (pointer:coarse){.rs-rot{display:flex}}
      .rs-q{display:grid;gap:8px;width:100%;text-align:left}
      .rs-q .fact{font-weight:700}.rs-q .fact small{color:#1F55D6;font-weight:800}
      .rs-q .qq{font-weight:800;font-size:18px}
      .rs-opt{font:inherit;font-weight:800;font-size:16px;text-align:left;padding:10px 14px;border-radius:14px;border:3px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;box-shadow:0 3px 0 var(--line)}
      .rs-opt.ok{background:#DFF5E8;border-color:#14946B}.rs-opt.no{background:#FFE1E4}.rs-opt.pick{background:#FFF3C4;color:#13203A}
      .rs-opt.hint{box-shadow:0 0 0 4px var(--gold),0 3px 0 var(--line)}
      .rs-opt[disabled]{cursor:default}
      .rs-exp{font-weight:700;background:var(--bg);border-left:5px solid #14946B;border-radius:8px;padding:8px 10px;margin:0}
      .rs-skip{font:inherit;font-weight:800;background:none;border:0;color:var(--muted);text-decoration:underline;cursor:pointer;justify-self:start}
      .rs-think{border:3px solid #7A3E9D;border-radius:16px;padding:10px;background:#F3ECFF;color:#13203A}
      .rs-think .k{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7A3E9D}
      .rs-cmp{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
      .rs-cmp div{padding:10px;border-radius:14px;border:3px solid var(--line);background:var(--bg);font-weight:800}
      .rs-cmp div.win{background:#FFF3C4;color:#13203A;box-shadow:0 0 0 4px var(--gold)}
      .rs-cmp b{display:block;font-family:var(--display);font-weight:400;font-size:28px}
      .rs-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;width:100%;text-align:left}
      .rs-badge{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;padding:8px 10px;border-radius:14px;border:2px solid var(--line);background:var(--bg)}
      .rs-badge .i{font-size:26px}.rs-badge b{display:block;font-size:14px}.rs-badge small{display:block;font-size:12px;color:var(--muted);font-weight:700;line-height:1.25}
      .rs-badge.got{background:#FFF3C4;color:#13203A;border-color:#13203A}.rs-badge.got small{color:#55627A}
      .rs-badge.new{box-shadow:0 0 0 4px var(--gold)}
      .rs-badge:not(.got){opacity:.6}.rs-badge:not(.got) .i{filter:grayscale(1)}
      .rs-mode{display:grid;gap:8px;padding:12px;border-radius:16px;background:var(--bg)}
      .rs-best{font-weight:800;color:var(--muted);font-size:14px;margin:0}`;
    document.head.appendChild(s);
  }

  /* ---------- menu ---------- */
  const opt = () => storeJSON('rsr-opts') || { two: false };
  function menu() {
    stop(); el.classList.remove('rs-wide');
    const o = opt(), best = storeJSON('rsr-best') || {}, got = storeJSON('rsr-badges') || {};
    Ark.menu(el, {
      id: 'red-sea-run', title: 'Red Sea Run', icon: 'wave', color: '#7FD3FF',
      blurb: 'Run Through the Sea. Discover God’s Power.',
      how: [['swipe', 'Swipe or ◀ ▶ to change lanes'], ['jump', 'Jump ⬆ and slide ⬇'], ['star', 'Collect water, bread and tambourines']],
      listen: 'Three stages! First, hold the button to stretch out Moses’ hand and watch God open the sea. Then run across the dry sea bed. Swipe or tap the arrows to change lanes, jump over rocks, and slide under the arches. Collect water jars, bread and tambourines, and reach the other side!',
      diffs: { easy: 'Gentle speed, lots of hints and practice. Great for little runners.', normal: 'Faster, with slides and more to dodge. A few hints.', hard: 'Fastest! Tricky jump-and-slide combos. No hints.' },
      extra: `<div class="rs-mode"><b>Players</b>
        <div class="row" role="group" aria-label="Players"><button class="chip" data-two="0" aria-pressed="${!o.two}">👤 1 player</button><button class="chip" data-two="1" aria-pressed="${!!o.two}">👥 2 players (take turns)</button></div>
        <p class="rs-best">${['easy', 'normal', 'hard'].map(d => `${Ark.DLABEL[d]} best: ${best[d] || '—'}`).join(' · ')} · Badges: ${Object.keys(got).length} of ${Object.keys(BADGES).length}</p></div>`,
      afterRender: st => st.querySelectorAll('[data-two]').forEach(b => (b.onclick = () => {
        storeJSON('rsr-opts', { two: b.dataset.two === '1' });
        st.querySelectorAll('[data-two]').forEach(x => x.setAttribute('aria-pressed', x === b));
      })),
      start: d => play(d)
    });
  }

  function play(diff) {
    stop();
    const o = opt();
    g = { diff, C: D[diff], two: !!o.two, turn: 0, qTurn: 0, seed: Math.floor(Math.random() * 1e9),
      players: (o.two ? [0, 1] : [0]).map(() => ({ score: 0, hits: 0, near: 0, bestCombo: 0, water: 0, bread: 0, tamb: 0, hits2: 0 })),
      stats: { asked: 0, right: 0, wrong: 0, rhythm: 0, tambTotal: 0 }, earn: {}, stageDone: [0, 0, 0], last: performance.now() };
    g.C.tamb.forEach(n => (g.stats.tambTotal += n));
    begin(0, stage1);
  }
  /* Start a stage. Restart Stage puts the scores back to how they were when the stage began. */
  function begin(stage, fn) {
    g.stage = stage;
    g.snap = JSON.stringify({ players: g.players, stats: g.stats, earn: g.earn, turn: g.turn });
    g.restartStage = () => { if (!g) return; timers.forEach(clearTimeout); timers = []; Object.assign(g, JSON.parse(g.snap)); hush(); fn(); };
    el.classList.add('rs-wide');
    fn();
  }
  const pname = i => `Player ${i + 1}`;

  /* ---------- the screen: header, then one big game view (canvas + overlays) ---------- */
  function screen(stage) {
    el.innerHTML = `<div class="rs-top">
        <div class="rs-stg">${STAGES.map((s, i) => `<span class="${i < stage ? 'on' : i === stage ? 'now' : ''}">${i < stage ? '✓ ' : ''}${i + 1}. ${s}</span>`).join('')}</div>
        <div class="rs-sc"><span class="dpill ${g.diff}">${Ark.DLABEL[g.diff]}</span><span id="rsScore"></span></div></div>
      <div class="rs-view" id="rsView">
        <canvas id="rsC" aria-label="Red Sea Run. A runner crosses the dry sea bed between walls of water."></canvas>
        <div class="rs-hud" id="rsHud" hidden></div>
        <div class="rs-banner" id="rsBanner" hidden></div>
        <div class="rs-cap" id="rsCap" hidden></div>
        <div class="rs-teach" id="rsTeach" hidden></div>
        <div class="rs-pad" id="rsPad" hidden>
          <div><button type="button" data-a="left" aria-label="Move left">◀</button><button type="button" data-a="right" aria-label="Move right">▶</button></div>
          <div class="ud"><button type="button" data-a="jump" aria-label="Jump">⬆<span>JUMP</span></button><button type="button" data-a="slide" aria-label="Slide">⬇<span>SLIDE</span></button></div>
        </div>
        <span class="rs-keys" id="rsKeys" hidden>← → move · ↑ / Space jump · ↓ slide</span>
        <div class="rs-act" id="rsAct"></div>
        <div class="rs-card" id="rsCard" hidden></div>
      </div>`;
    paintScore();
    fit();
    wireInput();
    const v = $('#rsView'); v.scrollIntoView({ block: 'start' });
    if (!raf) { g.last = performance.now(); raf = requestAnimationFrame(loop); }
  }
  function paintScore() {
    const b = $('#rsScore'); if (!b || !g) return;
    b.innerHTML = g.two ? `<span class="rs-pl">${g.players.map((p, i) => `<span class="${i === g.turn ? 'turn' : ''}">${pname(i)}: ${p.score}</span>`).join('')}</span>` : `Score <b style="font-family:var(--display);font-weight:400;font-size:22px;color:var(--sapphire)">${g.players[0].score}</b>`;
  }
  /* Fit the game to the screen without stretching: landscape screens get a wide view (up to 2:1);
     upright phones get a taller view with more sky, and a suggestion to turn sideways. */
  function fit() {
    const v = $('#rsView'), cv = $('#rsC'); if (!v || !cv) return;
    const gb = document.querySelector('.gbar'), gbh = gb ? gb.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--gbh', gbh + 'px');
    v.style.width = ''; const cw = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) * 2 - 6;
    const avail = Math.max(240, innerHeight - gbh - 14);
    let vw, vh;
    if (cw / avail >= 1.05) { vh = Math.min(avail, cw / 1.05); vw = Math.min(cw, vh * 2); W = 540 * vw / vh; H = 540; OY = 0; }
    else { vw = cw; W = 600; const sc0 = vw / W; vh = Math.max(vw * .952, Math.min(avail * .82, vw * 1.3)); H = vh / sc0; OY = H - 540; }
    v.style.width = Math.round(vw) + 'px'; v.style.height = Math.round(vh) + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    g.cx = cv.getContext('2d'); const sc = vh / H; g.cx.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0); g.sc = sc;
  }
  const onResize = () => { if (g && $('#rsView')) fit(); };

  /* ---------- input: keyboard, swipes, taps and the big buttons (all act instantly on press) ---------- */
  function wireInput() {
    const v = $('#rsView');
    v.querySelectorAll('.rs-pad button').forEach(b => {
      b.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); b.classList.add('down'); act(b.dataset.a); };
      b.onpointerup = b.onpointerleave = b.onpointercancel = () => b.classList.remove('down');
      b.onclick = e => { if (e.detail === 0) act(b.dataset.a); };
    });
    let sx = 0, sy = 0, live = false, used = false;
    v.onpointerdown = e => { if (e.target.closest('button, .rs-card, .rs-act, .rs-cap, .rs-banner')) return; e.preventDefault(); sx = e.clientX; sy = e.clientY; live = true; used = false; if (g && g.mode === 'rhythm') act('tap'); };
    v.onpointermove = e => {
      if (!live || used) return;
      const dx = e.clientX - sx, dy = e.clientY - sy, th = 26;
      if (Math.abs(dx) > th || Math.abs(dy) > th) { used = true; act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy < 0 ? 'jump' : 'slide')); }
    };
    v.onpointerup = v.onpointercancel = () => { if (live && !used && g && g.mode === 'run') act('jump'); live = false; };
  }
  const KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', ArrowDown: 'slide', s: 'slide', S: 'slide' };
  function onKey(e) {
    if (!g || !$('#rsView') || e.repeat && g.mode !== 'scene') return;
    if (!$('#rsCard').hidden) return;
    if (g.mode === 'scene' && g.scn && g.scn.hold !== undefined && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); if (e.type === 'keydown') holdOn(); else holdOff(); return; }
    if (e.type !== 'keydown') return;
    if (g.mode === 'rhythm' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); act('tap'); return; }
    const a = KEYS[e.key]; if (a && g.mode === 'run') { e.preventDefault(); act(a); }
  }
  function act(a) {
    if (!g || g.paused) return;
    if (g.mode === 'rhythm' && a === 'tap') return rhythmTap();
    const r = g.r; if (g.mode !== 'run' || !r || r.count > 0 || r.done) return;
    if (a === 'left' || a === 'right') {
      const nl = clamp(r.lane + (a === 'left' ? -1 : 1), 0, 2);
      if (nl !== r.lane) { r.prevLane = r.lane; r.laneT = r.t; r.lane = nl; SFX.lane(); }
    } else if (a === 'jump') { r.jq = r.t; }
    else if (a === 'slide') {
      if (r.py > .01) { r.vy = Math.min(r.vy, -r.v0 * 1.3); r.sq = true; }   // in the air: drop fast, then slide
      else startSlide(r);
    }
  }
  function startSlide(r) { r.slide = g.C.slideT; r.sq = false; SFX.slide(); }

  /* ---------- the course: rows of obstacles with at least one safe lane, and enough time between rows to reach it ---------- */
  function course(st) {
    const C = g.C, r = rng(g.seed + st * 977), len = C.len[st], rows = [], items = [];
    const spd = p => lerp(C.spd[st][0], C.spd[st][1], p);
    const lowK = () => ['rock', 'weed', 'ridge', 'log'][Math.floor(r() * 4)], blockK = () => (r() < .5 ? 'coral' : 'boulder');
    const make = pat => {
      const L = [null, null, null], ln = shuf([0, 1, 2]);
      if (pat === 'low1') L[ln[0]] = lowK();
      if (pat === 'low2') { L[ln[0]] = lowK(); L[ln[1]] = lowK(); }
      if (pat === 'lowAll') { const k = lowK(); L[0] = L[1] = L[2] = k; }
      if (pat === 'block1') L[ln[0]] = blockK();
      if (pat === 'block2') { L[ln[0]] = blockK(); L[ln[1]] = blockK(); }
      if (pat === 'high1') L[ln[0]] = 'arch';
      if (pat === 'highAll') L[0] = L[1] = L[2] = 'arch';
      if (pat === 'mix') { L[ln[0]] = lowK(); L[ln[1]] = 'arch'; L[ln[2]] = blockK(); }
      if (pat === 'blockLow') { L[ln[0]] = blockK(); L[ln[1]] = blockK(); L[ln[2]] = lowK(); }
      return L;
    };
    let z = 32;
    if (st === 0) {   // guided practice: move, jump, slide
      rows.push({ z, L: [null, 'coral', null], teach: 'move' }); z += spd(0) * 2.6;
      rows.push({ z, L: ['rock', 'rock', 'rock'], teach: 'jump' }); z += spd(0) * 2.6;
      rows.push({ z, L: ['arch', 'arch', 'arch'], teach: 'slide' }); z += spd(0) * 2.8;
    }
    const endZ = len - (st === 2 ? 40 : 16);
    while (z < endZ) {
      const p = z / len, pat = pickW(C.pats[st], r);
      if (pat === 'combo') {
        rows.push({ z, L: make('lowAll') }); rows.push({ z: z + spd(p) * C.comboT, L: make('highAll') });
        z += spd(p) * C.comboT;
      } else rows.push({ z, L: make(pat) });
      const gapS = Math.max(C.minGap, lerp(C.gap[0], C.gap[1], r()) * (st === 2 ? 1 - .3 * p : 1));
      const gap = spd(p) * gapS, last = rows[rows.length - 1];
      // collectibles in the gap: a line of water jars in a lane, sometimes bread; jars arc over "jump" rows; low jars under arches
      const open = [0, 1, 2].filter(l => last.L[l] !== 'coral' && last.L[l] !== 'boulder');
      if (last.L.every(k => k && LOW[k])) { const l = Math.floor(r() * 3); [-1.6, 0, 1.6].forEach((o, i) => items.push({ z: last.z + o, lane: l, h: [1.0, 1.5, 1.0][i], kind: 'water' })); }
      else if (last.L.every(k => k === 'arch')) { const l = Math.floor(r() * 3); items.push({ z: last.z, lane: l, h: .35, kind: 'water' }); }
      if (gap > 9 && r() < .7) {
        const l = open.length ? open[Math.floor(r() * open.length)] : 1, n = Math.min(4, Math.floor((gap - 5) / 2.2));
        for (let i = 0; i < n; i++) items.push({ z: last.z + 3 + i * 2.2, lane: l, h: .8, kind: r() < .1 ? 'bread' : 'water' });
      }
      z += gap;
    }
    // tambourines: replace some items with a tambourine (a fixed number per stage, so every one can be collected)
    const cand = items.filter(it => it.kind === 'water'), nT = Math.min(C.tamb[st], cand.length);
    shuf(cand).slice(0, nT).forEach(it => (it.kind = 'tamb'));
    g.stats['tamb' + st] = nT;
    const obs = [];
    rows.forEach(rw => rw.L.forEach((k, l) => { if (!k) return; const cls = LOW[k] ? 'low' : k === 'arch' ? 'high' : 'block'; obs.push({ z: rw.z, lane: l, kind: k, cls, row: rw, top: LOW[k] ? LOW[k].top : 0, dh: LOW[k] ? LOW[k].dh : k === 'arch' ? .35 : .5 }); }));
    return { rows, obs, items, len, endZ: len };
  }

  /* ---------- a run (one player, one stage) ---------- */
  function run(st, onDone) {
    const C = g.C, c = course(st);
    const v0 = 4 * 1.25 / C.jumpT, G = 8 * 1.25 / (C.jumpT * C.jumpT);
    g.mode = 'run'; g.scn = null;
    g.r = { st, c, pz: 0, px: 0, lane: 1, prevLane: 1, laneT: -9, py: 0, vy: 0, v0, G, slide: 0, sq: false, jq: -9, t: 0, count: 2.4, lastCount: 3,
      ts: 1, inv: 0, slowT: 0, shake: 0, hits: 0, combo: 0, bestCombo: 0, near: 0, water: 0, bread: 0, tamb: 0, score: 0, done: false, finds: 0,
      hint: C.hint || st === 0 && g.diff === 'normal', pops: [], parts: [], fish: [], bubbles: [], walkers: [], onDone,
      speed: C.spd[st][0] };
    const R = g.r, rr = rng(g.seed + 31 * st);
    for (let i = 0; i < 18; i++) R.fish.push(newFish(rr, true));
    for (let i = 0; i < 24; i++) R.bubbles.push({ side: rr() < .5 ? -1 : 1, z: rr() * FAR, h: rr() * WH, sp: .4 + rr() * .8 });
    for (let i = 0; i < 9; i++) R.walkers.push({ x: (rr() * 2 - 1) * 2.6, dz: 40 + rr() * 26, ph: rr() * 6, k: .75 + rr() * .4, c: ['#C0392B', '#1F55D6', '#14946B', '#7A3E9D', '#F28C28', '#8B5A2B'][i % 6], kid: rr() < .35 });
    $('#rsHud').hidden = false; $('#rsPad').hidden = false; $('#rsKeys').hidden = false; $('#rsAct').innerHTML = ''; $('#rsCap').hidden = true;
    hud();
    ctl();
  }
  function newFish(r, any) {
    return { side: r() < .5 ? -1 : 1, z: (any ? r() * FAR : FAR + r() * 20), h: .8 + r() * (WH - 1.8), v: (r() < .5 ? -1 : 1) * (1 + r() * 2.5), s: .25 + r() * .3,
      c: ['#FFB347', '#FFD447', '#FF7F7F', '#7ED957', '#C9A2FF'][Math.floor(r() * 5)], stripe: r() < .5 };
  }
  function ctl() {
    Ark.ctl({
      help: g.diff === 'hard' ? null : () => { if (g.mode === 'run' && g.r) { g.r.hint = true; Ark.toast('Hints are on: follow the arrows!'); } else if (g.helpScn) g.helpScn(); },
      pause: () => { if (g) { g.paused = true; holdOff(); hush(); } },
      resume: () => { if (g) { g.paused = false; g.last = performance.now(); } },
      restart: () => g && g.restartStage()
    });
  }
  function hud() {
    const R = g.r, C = g.C, tot = C.len[0] + C.len[1] + C.len[2];
    $('#rsHud').innerHTML = `<div class="rs-jb" aria-label="Journey progress">${[0, 1, 2].map(i => `<i class="${i < R.st ? 'done' : ''}" style="width:${C.len[i] / tot * 100}%"><b id="rsJ${i}" style="width:0"></b><em>${i < R.st ? '✓' : i + 1}</em></i>`).join('')}</div>
      <span class="rs-pill">💧<b id="rsW">${R.water}</b></span><span class="rs-pill">${TB}<b id="rsT">${R.tamb}</b>/${g.stats['tamb' + R.st]}</span>
      <span class="rs-pill">${g.two ? pname(g.turn) : 'Score'} <b id="rsS">${g.players[g.turn].score}</b></span><span class="rs-pill combo" id="rsCo" hidden></span>`;
  }

  function stepRun(dt) {
    const R = g.r, C = g.C;
    if (R.count > 0) {
      R.count -= dt; const n = Math.ceil(R.count / .8);
      if (n !== R.lastCount && n >= 0) { R.lastCount = n; SFX.count(n === 0); }
      if (R.count > 0) return;
    }
    // guided practice: slow motion until the child does the right move
    let teach = null;
    for (const rw of R.c.rows) if (rw.teach && !rw.taught) { const dz = rw.z - R.pz; if (dz < (rw.teach === 'move' ? 10 : 4.2) && dz > -1.5) teach = rw; break; }
    if (teach) {
      const ok = teach.teach === 'move' ? R.lane !== 1 : teach.teach === 'jump' ? R.py > .25 || R.vy > 0 : R.slide > 0;
      if (ok) { teach.taught = true; showTeach(null); pop('Great!', '#7ED957'); }
      else showTeach(teach.teach);
      if (teach.z - R.pz < -1) { teach.taught = true; showTeach(null); }
    } else if (R.teachOn) showTeach(null);
    R.ts += ((teach && !teach.taught ? .12 : 1) - R.ts) * Math.min(1, dt * 10);
    const dts = dt * R.ts;
    R.t += dts;
    // movement
    const tx = laneX(R.lane), maxStep = LW / .13 * dts;
    R.px += clamp(tx - R.px, -maxStep, maxStep);
    if (R.jq > -9 && R.t - R.jq < .15 && R.py <= .01 && !R.done) { R.vy = R.v0; R.slide = 0; R.jq = -9; SFX.jump(); dust(); }
    if (R.t - R.jq >= .15) R.jq = -9;
    if (R.py > 0 || R.vy > 0) { R.vy -= R.G * dts; R.py += R.vy * dts; if (R.py <= 0) { R.py = 0; R.vy = 0; dust(); if (R.sq) startSlide(R); } }
    R.slide = Math.max(0, R.slide - dts);
    R.inv = Math.max(0, R.inv - dts); R.slowT = Math.max(0, R.slowT - dts); R.shake = Math.max(0, R.shake - dt);
    const p = clamp(R.pz / R.c.len, 0, 1);
    let sp = lerp(C.spd[R.st][0], C.spd[R.st][1], p) * (R.slowT > 0 ? .6 : 1) * Math.min(1, (R.t + .4) / .8);
    if (R.st === 2) { const left = R.c.len - 3 - R.pz; if (left < 18) sp *= clamp(left / 18, .2, 1); }
    R.speed = sp;
    if (!R.done) { const d = sp * dts; R.pz += d; R.score += d * .5; if (Math.floor(R.score) !== R.lastS) { R.lastS = Math.floor(R.score); } }
    // obstacles
    const hw = LW * C.hitW;
    for (const o of R.c.obs) {
      if (o.done) continue;
      const dz = o.z - R.pz, zone = o.dh + .3;
      if (dz > zone) continue;
      const inLane = Math.abs(R.px - laneX(o.lane)) < hw;
      if (dz >= -zone) {
        if (inLane) {
          o.inLane = true;
          const bad = o.cls === 'low' ? R.py < o.top - C.tol : o.cls === 'high' ? !(R.slide > 0) : true;
          if (bad && R.inv <= 0 && !o.hit) { o.hit = true; hit(o); }
        }
      } else {
        o.done = true;
        if (o.inLane && !o.hit) clear(o);
        else if (!o.inLane && o.lane === R.prevLane && R.t - R.laneT < .55 && R.lane !== o.lane) nearMiss();
      }
    }
    // collectibles
    for (const it of R.c.items) {
      if (it.got) continue;
      const dz = it.z - R.pz; if (dz > 1 || dz < -1.2) continue;
      const pc = R.py + (R.slide > 0 ? .35 : .8);
      if (Math.abs(R.px - laneX(it.lane)) < LW * .55 && Math.abs(dz) < .8 && Math.abs(pc - it.h) < .8) collect(it);
    }
    // scenery life
    R.fish.forEach(f => { f.z += f.v * dts; if (f.z < R.pz - 4 || f.z > R.pz + FAR + 25) Object.assign(f, newFish(Math.random, false), { z: R.pz + FAR + Math.random() * 15 }); });
    if (R.st === 1 && (p > .3 && p < .45 || p > .72 && p < .82) && R.fish.length < 40) for (let i = 0; i < 2; i++) R.fish.push(Object.assign(newFish(Math.random, false), { z: R.pz + 20 + Math.random() * 50, v: 2.5 }));
    R.bubbles.forEach(b => { b.h += b.sp * dts; if (b.h > WH || b.z < R.pz - 3) { b.h = 0; b.z = R.pz + Math.random() * FAR; } });
    R.pops.forEach(q => (q.t += dt)); R.pops = R.pops.filter(q => q.t < 1);
    R.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt; q.life -= dt * 1.4; }); R.parts = R.parts.filter(q => q.life > 0);
    // discoveries while running
    const F = FINDS[R.st];
    if (R.finds < F.length && p >= F[R.finds][0]) { const [, t, ref] = F[R.finds++]; banner(t, ref); }
    // HUD
    if (Math.floor(R.t * 8) !== R.hb) {
      R.hb = Math.floor(R.t * 8);
      const jb = $('#rsJ' + R.st); if (jb) jb.style.width = Math.round(p * 100) + '%';
      $('#rsS').textContent = g.players[g.turn].score + Math.round(R.score);
    }
    if (!R.done && R.pz >= R.c.len - (R.st === 2 ? 3.2 : 0)) finishRun();
  }
  function dust() { const R = g.r, [sx, sy] = proj(R.px, 0, 0); for (let i = 0; i < 8; i++) R.parts.push({ x: sx + (Math.random() - .5) * 40, y: sy, vx: (Math.random() - .5) * 160, vy: -60 - Math.random() * 80, life: .6, c: 'rgba(200,160,100,.8)', r: 4 }); }
  function pop(txt, c = '#fff') { const R = g.r; R.pops.push({ txt, c, t: 0 }); }
  const mult = () => 1 + Math.min(4, Math.floor(g.r.combo / 5));
  function addR(n) { g.r.score += n; }
  function comboUp() {
    const R = g.r; R.combo++; R.bestCombo = Math.max(R.bestCombo, R.combo);
    const b = $('#rsCo'); if (R.combo >= 3 && b) { b.hidden = false; b.textContent = `Combo x${R.combo}`; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; SFX.combo(R.combo); }
  }
  function hit(o) {
    const R = g.r; R.hits++; R.inv = 1; R.slowT = .7; R.shake = .3; R.combo = 0; R.slide = 0;
    const b = $('#rsCo'); if (b) b.hidden = true;
    SFX.hit(); pop(o.cls === 'block' ? 'Bump! Change lanes' : o.cls === 'high' ? 'Oops! Slide ⬇' : 'Oops! Jump ⬆', '#FF8FA3');
    if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {}
  }
  function clear(o) { const n = 10 * mult(); addR(n); comboUp(); pop(o.cls === 'high' ? `Slide! +${n}` : `Jump! +${n}`, '#7ED957'); }
  function nearMiss() { const R = g.r; R.near++; const n = 50 * mult(); addR(n); comboUp(); SFX.near(); pop(`Close call! +${n}`, '#FFD447'); }
  function collect(it) {
    const R = g.r; it.got = true;
    const n = (it.kind === 'tamb' ? 50 : it.kind === 'bread' ? 25 : 10) * mult(); addR(n);
    R[it.kind]++; SFX[it.kind]();
    const [sx, sy] = proj(laneX(it.lane), it.h, Math.max(0, it.z - R.pz));
    for (let i = 0; i < 10; i++) R.parts.push({ x: sx, y: sy, vx: (Math.random() - .5) * 260, vy: -Math.random() * 260, life: .8, c: it.kind === 'water' ? '#7FD3FF' : '#FFD447', r: 4, star: it.kind !== 'water' });
    if (it.kind !== 'water') pop(it.kind === 'tamb' ? `Tambourine! +${n}` : `Bread! +${n}`, '#FFD447');
    $('#rsW').textContent = R.water; $('#rsT').textContent = R.tamb;
  }
  function showTeach(k) {
    const R = g.r, t = $('#rsTeach');
    $('#rsPad').querySelectorAll('button').forEach(b => b.classList.remove('pulse'));
    if (!k) { t.hidden = true; R.teachOn = false; return; }
    R.teachOn = true; t.hidden = false;
    const touch = matchMedia('(pointer:coarse)').matches;
    const T = { move: ['◀ ▶ Move!', touch ? 'Swipe sideways or tap ◀ ▶' : 'Press ← or →'], jump: ['⬆ Jump!', touch ? 'Tap, swipe up or press JUMP' : 'Press ↑ or Space'], slide: ['⬇ Slide!', touch ? 'Swipe down or press SLIDE' : 'Press ↓'] }[k];
    if (t.dataset.k !== k) { t.dataset.k = k; t.innerHTML = `${T[0]}<small>${T[1]}</small>`; say(T[0].replace(/[◀▶⬆⬇]/g, '')); }
    $('#rsPad').querySelectorAll(k === 'move' ? '[data-a=left],[data-a=right]' : `[data-a=${k}]`).forEach(b => b.classList.add('pulse'));
  }
  function banner(t, ref) {
    const b = $('#rsBanner'); if (!b) return;
    b.hidden = false; b.innerHTML = `<div>${t}<small>${ref}</small></div>${Ark.canSpeak ? '<button type="button" aria-label="Read it to me">🔊</button>' : ''}`;
    const k = b.querySelector('button'); if (k) k.onclick = e => { e.stopPropagation(); say(t.replace(/[“”]/g, ''), true); };
    b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    say(t.replace(/[“”]/g, ''));
    clearTimeout(g.bannerT); g.bannerT = setTimeout(() => { const x = el && el.querySelector('#rsBanner'); if (x) x.hidden = true; }, 5500);
  }
  function finishRun() {
    const R = g.r; R.done = true; showTeach(null);
    const P = g.players[g.turn];
    const pts = Math.round(R.score);
    P.score += pts; P.hits += R.hits; P.near += R.near; P.bestCombo = Math.max(P.bestCombo, R.bestCombo); P.water += R.water; P.bread += R.bread; P.tamb += R.tamb;
    if (R.st === 1 && R.hits === 0) g.earn.steady = 1;
    if (R.bestCombo >= 10) g.earn.combo = 1;
    if (P.near >= 5) g.earn.near = 1;
    R.result = { pts, hits: R.hits, near: R.near, combo: R.bestCombo, water: R.water, bread: R.bread, tamb: R.tamb };
    paintScore();
    $('#rsPad').hidden = true; $('#rsKeys').hidden = true;
    const done = R.onDone;
    if (R.st === 2) { SFX.cheer(); R.celebrate = true; for (let i = 0; i < 60; i++) confetti(); later(() => done(R.result), 2200); }
    else { SFX.win(); later(() => done(R.result), 900); }
  }
  function confetti() {
    const R = g.r; R.parts.push({ x: Math.random() * W, y: -10 - Math.random() * 100, vx: (Math.random() - .5) * 80, vy: 60 + Math.random() * 120, life: 2.5, c: ['#FFD447', '#FF8FA3', '#7ED957', '#5DA9F0', '#fff'][Math.floor(Math.random() * 5)], r: 5, star: Math.random() < .4, conf: true });
  }

  /* ---------- drawing the run ---------- */
  function sky(c, st, p) {
    // night (stage 1) → dawn (stage 2) → sunrise (stage 3)
    const T = [['#141B3C', '#3C4A82'], [mixC('#22285A', '#6C5B9E', p), mixC('#4E5C98', '#F2A27A', p)], [mixC('#79B6EE', '#8FD0FF', p), mixC('#FFC98A', '#FFE7B8', p)]][st];
    const gr = c.createLinearGradient(0, 0, 0, HY + OY); gr.addColorStop(0, T[0]); gr.addColorStop(1, T[1]);
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    if (st === 0 || st === 1 && p < .5) { c.fillStyle = `rgba(255,255,255,${st === 0 ? .9 : .9 - p * 1.8})`; for (let i = 0; i < 40; i++) { const x = (i * 137.5) % W, y = (i * 61.3) % (HY + OY - 30); c.fillRect(x, y, 2, 2); } }
    if (st === 2) { const y = HY + OY - 10 - p * 40; const gr2 = c.createRadialGradient(W / 2, y, 10, W / 2, y, 160); gr2.addColorStop(0, 'rgba(255,240,180,.95)'); gr2.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = gr2; c.fillRect(0, 0, W, H); c.fillStyle = '#FFE58A'; c.beginPath(); c.arc(W / 2, y, 34, 0, 7); c.fill(); }
  }
  // the light for the walls and sand: darker at night, warm at sunrise
  const light = (st, p) => st === 0 ? .55 : st === 1 ? .65 + p * .3 : 1;
  function ground(c, o) {
    const { wx, pz, dzEnd, lit, sandA = 1 } = o;
    const far = Math.min(FAR, dzEnd);
    const [x1, y1] = proj(-wx, 0, far), [x2] = proj(wx, 0, far), [x3, y3] = proj(wx, 0, NEAR), [x4] = proj(-wx, 0, NEAR);
    const gr = c.createLinearGradient(0, y1, 0, y3); gr.addColorStop(0, mixC('#8C7A5A', '#F1DDAE', lit)); gr.addColorStop(1, mixC('#6E5A3C', '#D9B576', lit));
    c.globalAlpha = sandA; c.fillStyle = gr; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y1); c.lineTo(x3, y3); c.lineTo(x4, y3); c.closePath(); c.fill();
    // sand ripples and lane guides move toward you, so you feel the speed
    c.strokeStyle = `rgba(120,85,40,${.35 * lit})`;
    for (let z = Math.ceil(pz / 2.5) * 2.5; z < pz + far; z += 2.5) {
      const dz = z - pz; if (dz < NEAR) continue;
      const [a, y, s] = proj(-wx, 0, dz), [b] = proj(wx, 0, dz);
      c.lineWidth = Math.max(.6, s * .02); c.beginPath(); c.moveTo(a, y); c.quadraticCurveTo((a + b) / 2, y - s * .05, b, y); c.stroke();
    }
    if (o.lanes) {
      c.strokeStyle = `rgba(255,255,255,${.28 * lit})`;
      [-LW / 2, LW / 2].forEach(x => { for (let z = Math.ceil(pz / 4) * 4; z < pz + far; z += 4) { const d1 = z - pz, d2 = d1 + 2; if (d2 < NEAR) continue; const [ax, ay, s] = proj(x, 0, Math.max(NEAR, d1)), [bx, by] = proj(x, 0, d2); c.lineWidth = Math.max(1, s * .04); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); } });
    }
    // shells and pebbles
    for (let z = Math.ceil(pz / 3) * 3; z < pz + far; z += 3) {
      const dz = z - pz; if (dz < NEAR + .5) continue;
      const hsh = Math.sin(z * 12.9898) * 43758.5453, fr = hsh - Math.floor(hsh), x = (fr * 2 - 1) * (wx - .3);
      const [sx, sy, s] = proj(x, 0, dz); c.fillStyle = fr > .5 ? `rgba(255,230,210,${.8 * lit})` : `rgba(120,110,100,${.7 * lit})`;
      c.beginPath(); c.ellipse(sx, sy, s * .09, s * .04, 0, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
  }
  function walls(c, o) {
    const { wx, wh, pz, dzEnd, lit, t } = o; if (wh <= .05) return;
    const far = Math.min(FAR, dzEnd);
    [-1, 1].forEach(sd => {
      const pts = [], top = [];
      for (let dz = far; dz >= NEAR; dz -= dz > 20 ? 5 : 1.5) {
        pts.push(proj(sd * wx, 0, dz));
        const wob = Math.sin((dz + pz) * .35 + t * 2.2) * .18;
        top.push(proj(sd * wx, wh + wob, dz));
      }
      const gr = c.createLinearGradient(W / 2, 0, W / 2 + sd * W * .6, 0);
      gr.addColorStop(0, mixC('#2B4C8C', '#8FD8FF', lit)); gr.addColorStop(.35, mixC('#1C3570', '#3FA0E8', lit)); gr.addColorStop(1, mixC('#0E1F48', '#1F55D6', lit));
      c.fillStyle = gr; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); for (let i = top.length - 1; i >= 0; i--) c.lineTo(top[i][0], top[i][1]); c.closePath(); c.fill();
      // shimmering light bands (sunlight through water)
      c.save(); c.clip();
      for (let k = 0; k < 6; k++) {
        const zz = ((k * 13 + t * 1.5 - pz * .15) % far + far) % far;
        const [bx, by0, s] = proj(sd * wx, 0, zz), [, by1] = proj(sd * wx, wh, zz);
        c.strokeStyle = `rgba(255,255,255,${.12 * lit})`; c.lineWidth = Math.max(2, s * .5);
        c.beginPath(); for (let i = 0; i <= 8; i++) { const yy = lerp(by0, by1, i / 8); c.lineTo(bx + Math.sin(i + t * 2 + k) * s * .08 * sd, yy); } c.stroke();
      }
      c.restore();
      // the foam on top of the wall
      c.strokeStyle = `rgba(255,255,255,${.6 + .3 * lit})`; c.lineWidth = 3; c.beginPath(); top.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      // a shadow where the wall meets the sand
      c.strokeStyle = 'rgba(10,20,50,.35)'; c.lineWidth = 6; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    });
  }
  function wallLife(c, R, o) {
    const { wx, wh, pz, dzEnd, t } = o, far = Math.min(FAR, dzEnd);
    R.bubbles.forEach(b => { const dz = b.z - pz; if (dz < NEAR || dz > far || b.h > wh) return; const [x, y, s] = proj(b.side * (wx + .05), b.h, dz); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, Math.max(1, s * .05), 0, 7); c.stroke(); });
    const fish = R.fish.slice().sort((a, b) => b.z - a.z);
    fish.forEach(f => {
      const dz = f.z - pz; if (dz < NEAR + .5 || dz > far || f.h > wh - .3) return;
      const [hx, hy, s] = proj(f.side * (wx + .1), f.h, dz + Math.sign(f.v) * f.s), [tx, ty] = proj(f.side * (wx + .1), f.h + Math.sin(t * 6 + f.z) * .05, dz - Math.sign(f.v) * f.s);
      const ang = Math.atan2(hy - ty, hx - tx), len = Math.hypot(hx - tx, hy - ty), r = Math.max(2, s * f.s * .45);
      c.save(); c.translate((hx + tx) / 2, (hy + ty) / 2); c.rotate(ang);
      c.fillStyle = f.c; c.strokeStyle = 'rgba(19,32,58,.7)'; c.lineWidth = 1;
      c.beginPath(); c.ellipse(0, 0, Math.max(r * 1.4, len / 2), r, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-Math.max(r * 1.4, len / 2), 0); c.lineTo(-Math.max(r * 1.4, len / 2) - r, -r * .8); c.lineTo(-Math.max(r * 1.4, len / 2) - r, r * .8); c.closePath(); c.fill();
      if (f.stripe) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = Math.max(1, r * .35); c.beginPath(); c.moveTo(0, -r); c.lineTo(0, r); c.stroke(); }
      c.fillStyle = ink; c.beginPath(); c.arc(Math.max(r * 1.4, len / 2) * .6, -r * .2, Math.max(.8, r * .18), 0, 7); c.fill();
      c.restore();
    });
  }
  function person(c, x, y, s, col, o = {}) {
    // a small Israelite figure from behind or the side; o.cheer raises arms; o.kid is smaller
    const k = s * (o.kid ? .7 : 1) / 112, bob = o.bob || 0;
    c.save(); c.translate(x, y - bob); c.scale(k, k);
    c.fillStyle = 'rgba(19,32,58,.2)'; c.beginPath(); c.ellipse(0, 0 + bob / k, 30, 8, 0, 0, 7); c.fill();
    c.strokeStyle = '#7A4A26'; c.lineWidth = 10; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-8, -40); c.lineTo(-8 + (o.step || 0), -2); c.moveTo(8, -40); c.lineTo(8 - (o.step || 0), -2); c.stroke();
    c.fillStyle = col; c.strokeStyle = ink; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-28, -30); c.lineTo(28, -30); c.lineTo(20, -110); c.lineTo(-20, -110); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#9B6A3C'; c.lineWidth = 9;
    if (o.cheer) { c.beginPath(); c.moveTo(-18, -100); c.lineTo(-34, -150); c.moveTo(18, -100); c.lineTo(34, -150); c.stroke(); }
    else { c.beginPath(); c.moveTo(-20, -100); c.lineTo(-28, -60); c.moveTo(20, -100); c.lineTo(28, -60); c.stroke(); }
    c.lineCap = 'butt';
    c.fillStyle = o.face ? '#9B6A3C' : '#F4EBDD'; c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.arc(0, -128, 20, 0, 7); c.fill(); c.stroke();
    if (o.face) { c.fillStyle = col; c.beginPath(); c.arc(0, -134, 21, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(22, -122); c.lineTo(-22, -122); c.closePath(); c.fill(); c.stroke(); c.fillStyle = ink; c.beginPath(); c.arc(-7, -126, 2.6, 0, 7); c.arc(7, -126, 2.6, 0, 7); c.fill(); c.lineWidth = 3; c.beginPath(); c.arc(0, -121, 7, .3, Math.PI - .3); c.stroke(); }
    c.restore();
  }
  function obstacle(c, o, dz, lit) {
    const x = laneX(o.lane), [sx, sy, s] = proj(x, 0, dz), u = s;   // u = pixels per metre here
    c.lineJoin = 'round'; c.strokeStyle = ink; c.lineWidth = Math.max(1, u * .03);
    c.fillStyle = 'rgba(19,32,58,.25)'; c.beginPath(); c.ellipse(sx, sy, u * .55, u * .1, 0, 0, 7); c.fill();
    const sh = (a, b) => mixC(a, b, lit);
    if (o.kind === 'rock') {
      c.fillStyle = sh('#4F4C48', '#8D8A85'); c.beginPath(); c.moveTo(sx - u * .48, sy); c.lineTo(sx - u * .36, sy - u * .4); c.lineTo(sx - u * .05, sy - u * .55); c.lineTo(sx + u * .32, sy - u * .42); c.lineTo(sx + u * .48, sy); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(sx - u * .25, sy - u * .3); c.lineTo(sx - u * .05, sy - u * .47); c.lineTo(sx + u * .05, sy - u * .28); c.closePath(); c.fill();
    } else if (o.kind === 'weed') {
      c.strokeStyle = sh('#1E5A22', '#2E9E4F'); c.lineCap = 'round'; c.lineWidth = Math.max(2, u * .08);
      for (let i = -3; i <= 3; i++) { const bx = sx + i * u * .12; c.beginPath(); c.moveTo(bx, sy); c.quadraticCurveTo(bx + (i % 2 ? 1 : -1) * u * .12, sy - u * .25, bx + Math.sin(g.t * 3 + i) * u * .05, sy - u * .5); c.stroke(); }
      c.lineCap = 'butt';
    } else if (o.kind === 'ridge') {
      c.fillStyle = sh('#8C7448', '#D2AE6E'); c.beginPath(); c.ellipse(sx, sy, u * .75, u * .38, 0, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(120,85,40,.6)'; c.beginPath(); c.ellipse(sx, sy, u * .5, u * .2, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    } else if (o.kind === 'log') {
      c.fillStyle = sh('#5A3A1C', '#8B5A2B'); c.beginPath(); if (c.roundRect) c.roundRect(sx - u * .7, sy - u * .5, u * 1.4, u * .5, u * .22); else c.rect(sx - u * .7, sy - u * .5, u * 1.4, u * .5); c.fill(); c.stroke();
      c.fillStyle = sh('#A58660', '#D9B38C'); c.beginPath(); c.ellipse(sx + u * .58, sy - u * .25, u * .12, u * .22, 0, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(sx - u * .5, sy - u * .3); c.lineTo(sx + u * .3, sy - u * .3); c.stroke();
    } else if (o.kind === 'arch') {
      // two coral posts with a driftwood beam and hanging kelp: slide underneath
      [-1, 1].forEach(sd => { c.fillStyle = sh('#A04A5A', '#FF7F8F'); c.beginPath(); if (c.roundRect) c.roundRect(sx + sd * u * .82 - u * .1, sy - u * 1.6, u * .2, u * 1.6, u * .08); else c.rect(sx + sd * u * .82 - u * .1, sy - u * 1.6, u * .2, u * 1.6); c.fill(); c.stroke(); });
      c.fillStyle = sh('#5A3A1C', '#9B6A3C'); c.beginPath(); if (c.roundRect) c.roundRect(sx - u * .95, sy - u * 1.35, u * 1.9, u * .28, u * .1); else c.rect(sx - u * .95, sy - u * 1.35, u * 1.9, u * .28); c.fill(); c.stroke();
      c.strokeStyle = sh('#1E5A22', '#3FA34D'); c.lineWidth = Math.max(2, u * .07); c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) { const bx = sx + i * u * .22; c.beginPath(); c.moveTo(bx, sy - u * 1.08); c.quadraticCurveTo(bx + Math.sin(g.t * 2 + i) * u * .08, sy - u * 1.0, bx, sy - u * .92); c.stroke(); }
      c.lineCap = 'butt';
    } else if (o.kind === 'coral') {
      c.fillStyle = sh('#A04A5A', '#FF8FA3');
      c.beginPath(); c.moveTo(sx - u * .45, sy); c.lineTo(sx - u * .4, sy - u * 1.2); c.quadraticCurveTo(sx - u * .7, sy - u * 1.6, sx - u * .45, sy - u * 1.9); c.lineTo(sx - u * .2, sy - u * 1.4); c.lineTo(sx, sy - u * 2.1); c.lineTo(sx + u * .2, sy - u * 1.5); c.quadraticCurveTo(sx + u * .7, sy - u * 1.8, sx + u * .5, sy - u * 1.1); c.lineTo(sx + u * .45, sy); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(sx + (i - 2) * u * .14, sy - u * (.5 + (i % 3) * .4), u * .05, 0, 7); c.fill(); }
    } else {
      c.fillStyle = sh('#3E3B37', '#6E6A64'); c.beginPath(); c.moveTo(sx - u * .7, sy); c.lineTo(sx - u * .6, sy - u * 1.1); c.lineTo(sx - u * .1, sy - u * 1.55); c.lineTo(sx + u * .5, sy - u * 1.3); c.lineTo(sx + u * .7, sy); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.moveTo(sx - u * .4, sy - u * .9); c.lineTo(sx - u * .1, sy - u * 1.35); c.lineTo(sx + u * .1, sy - u * .9); c.closePath(); c.fill();
    }
  }
  function hintBadge(c, o, dz) {
    if (dz < 5 || dz > 24) return;
    const [sx, sy, s] = proj(laneX(o.lane), o.cls === 'block' ? 2.3 : o.cls === 'high' ? 1.9 : 1.1, dz), r = Math.max(10, s * .28);
    c.fillStyle = o.cls === 'low' ? '#FFD447' : o.cls === 'high' ? '#9FD8FF' : '#FF8FA3'; c.strokeStyle = ink; c.lineWidth = 2.5;
    c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = ink; c.font = `800 ${Math.round(r * 1.1)}px Nunito, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(o.cls === 'low' ? '⬆' : o.cls === 'high' ? '⬇' : '↔', sx, sy + 1);
  }
  function item(c, it, dz, t) {
    const [sx, sy, s] = proj(laneX(it.lane), it.h + Math.sin(t * 3 + it.z) * .06, dz), u = s;
    const [gx, gy] = proj(laneX(it.lane), 0, dz);
    c.fillStyle = 'rgba(19,32,58,.18)'; c.beginPath(); c.ellipse(gx, gy, u * .2, u * .05, 0, 0, 7); c.fill();
    const glow = c.createRadialGradient(sx, sy, 1, sx, sy, u * .45); glow.addColorStop(0, 'rgba(255,255,220,.6)'); glow.addColorStop(1, 'rgba(255,255,220,0)'); c.fillStyle = glow; c.beginPath(); c.arc(sx, sy, u * .45, 0, 7); c.fill();
    c.strokeStyle = ink; c.lineWidth = Math.max(1, u * .025);
    if (it.kind === 'water') {
      c.fillStyle = '#C8743A'; c.beginPath(); c.moveTo(sx - u * .12, sy - u * .18); c.quadraticCurveTo(sx - u * .26, sy + u * .02, sx - u * .14, sy + u * .2); c.lineTo(sx + u * .14, sy + u * .2); c.quadraticCurveTo(sx + u * .26, sy + u * .02, sx + u * .12, sy - u * .18); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#5DA9F0'; c.beginPath(); c.ellipse(sx, sy - u * .18, u * .12, u * .04, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(sx - u * .1, sy - u * .08, u * .04, u * .16);
    } else if (it.kind === 'bread') {
      c.fillStyle = '#E3A857'; c.beginPath(); c.ellipse(sx, sy, u * .24, u * .14, 0, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = '#A0612D'; c.beginPath(); c.moveTo(sx - u * .12, sy - u * .05); c.lineTo(sx + u * .12, sy - u * .05); c.stroke();
    } else {
      c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(sx, sy, u * .22, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#FFF3DC'; c.beginPath(); c.arc(sx, sy, u * .14, 0, 7); c.fill();
      c.fillStyle = '#C0392B'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + t; c.beginPath(); c.arc(sx + Math.cos(a) * u * .18, sy + Math.sin(a) * u * .18, Math.max(1, u * .035), 0, 7); c.fill(); }
      c.strokeStyle = '#FF5D8F'; c.lineWidth = Math.max(1, u * .03); c.beginPath(); c.moveTo(sx + u * .16, sy + u * .12); c.quadraticCurveTo(sx + u * .3, sy + u * .26, sx + u * .2, sy + u * .36); c.stroke();
    }
  }
  function runner(c, R) {
    // the runner, seen from behind: a young Israelite with a head-cloth and a travel bag
    const [sx, sy, s] = proj(R.px, R.py, 0), [gx, gy] = proj(R.px, 0, 0), k = s / 112;
    c.fillStyle = 'rgba(19,32,58,.3)'; c.beginPath(); c.ellipse(gx, gy, (34 - R.py * 8) * s / 112, (9 - R.py * 2) * s / 112, 0, 0, 7); c.fill();
    if (R.inv > 0 && Math.floor(R.inv * 12) % 2) c.globalAlpha = .45;
    c.save(); c.translate(sx, sy); c.scale(k, k);
    const sliding = R.slide > 0, air = R.py > .02, run = R.done ? 0 : Math.sin(R.t * 16);
    if (R.inv > .5) c.rotate(Math.sin(R.inv * 30) * .12);
    const tilt = clamp((laneX(R.lane) - R.px) * .25, -.25, .25); c.rotate(-tilt);
    if (sliding) c.scale(1.15, .55);
    c.lineCap = 'round'; c.lineJoin = 'round';
    // legs
    c.strokeStyle = '#7A4A26'; c.lineWidth = 13;
    const lg = air ? 0 : run * 14;
    c.beginPath(); c.moveTo(-11, -46); c.lineTo(-11 + (air ? -6 : 0), air ? -18 : -4 - Math.max(0, lg)); c.moveTo(11, -46); c.lineTo(11 + (air ? 6 : 0), air ? -18 : -4 - Math.max(0, -lg)); c.stroke();
    c.fillStyle = '#5A3A1C'; [[-11, air ? -16 : -2 - Math.max(0, lg)], [11, air ? -16 : -2 - Math.max(0, -lg)]].forEach(([a, b]) => { c.beginPath(); c.ellipse(a, b, 9, 5, 0, 0, 7); c.fill(); });
    // robe
    c.fillStyle = '#1F55D6'; c.strokeStyle = ink; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-30, -38); c.lineTo(30, -38); c.lineTo(22, -120); c.lineTo(-22, -120); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#F2C14E'; c.lineWidth = 6; c.beginPath(); c.moveTo(-26, -78); c.lineTo(26, -78); c.stroke();
    // bag on the back
    c.fillStyle = '#C98B4A'; c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); if (c.roundRect) c.roundRect(-16, -112, 32, 30, 8); else c.rect(-16, -112, 32, 30); c.fill(); c.stroke();
    c.strokeStyle = '#8B5224'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -112); c.lineTo(-20, -126); c.moveTo(14, -112); c.lineTo(20, -126); c.stroke();
    // arms
    c.strokeStyle = '#9B6A3C'; c.lineWidth = 11;
    const ar = air ? -1 : run;
    c.beginPath(); c.moveTo(-24, -112); c.lineTo(-36, air ? -150 : -80 + ar * 14); c.moveTo(24, -112); c.lineTo(36, air ? -150 : -80 - ar * 14); c.stroke();
    // head with head-cloth
    c.fillStyle = '#F4EBDD'; c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.arc(0, -142, 21, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = '#C0392B'; c.lineWidth = 6; c.beginPath(); c.moveTo(-20, -146); c.lineTo(20, -146); c.stroke();
    c.fillStyle = '#F4EBDD'; c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -128); c.lineTo(-20, -104); c.lineTo(-6, -110); c.closePath(); c.fill(); c.stroke();
    c.restore(); c.globalAlpha = 1;
  }
  function shore(c, R, dzE, lit, t) {
    // the far shore, the people waiting there, and the SAFE SHORE finish marker
    if (dzE > FAR + 10) return;
    const [ , yE, s] = proj(0, 0, dzE);
    const gr = c.createLinearGradient(0, yE - s * 3, 0, yE); gr.addColorStop(0, '#7CC36B'); gr.addColorStop(1, '#E9CF97');
    c.fillStyle = gr; c.beginPath(); c.moveTo(0, yE); for (let x = 0; x <= W; x += 20) c.lineTo(x, yE - s * (1.6 + Math.sin(x / 60) * .4 + (Math.abs(x - W / 2) > W * .3 ? .8 : 0))); c.lineTo(W, yE); c.closePath(); c.fill();
    c.strokeStyle = ink; c.lineWidth = 2; c.stroke();
    // calm sea beside the shore
    c.fillStyle = '#5DA9F0'; const [lx] = proj(-WX, 0, dzE), [rx] = proj(WX, 0, dzE);
    c.fillRect(0, yE - 2, lx, 4); c.fillRect(rx, yE - 2, W - rx, 4);
    // palms
    [-6, -4.5, 4.8, 6.4].forEach((x, i) => { const [px, py, ps] = proj(x, 1.4, dzE + 2 + i); c.strokeStyle = '#7A4A26'; c.lineWidth = Math.max(2, ps * .12); c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + ps * .2, py - ps * 1.2, px + ps * .1, py - ps * 2.4); c.stroke(); c.fillStyle = '#2E9E4F'; for (let a = -2.6; a <= -.4; a += .55) { c.beginPath(); c.ellipse(px + ps * .1 + Math.cos(a) * ps * .6, py - ps * 2.4 + Math.sin(a) * ps * .25, ps * .6, ps * .14, a + Math.PI / 2 + .9, 0, 7); c.fill(); } });
    // the crowd waiting on the shore cheers you in
    for (let i = 0; i < 14; i++) { const x = -4 + (i % 7) * 1.35 + (i > 6 ? .6 : 0), dz = dzE + 1.2 + (i > 6 ? 2 : 0), [px, py, ps] = proj(x, 0, dz); if (Math.abs(x) < 1.2 && i < 7) continue; person(c, px, py, ps, ['#C0392B', '#14946B', '#7A3E9D', '#F28C28', '#1F55D6'][i % 5], { cheer: true, face: true, kid: i % 3 === 0, bob: Math.abs(Math.sin(t * 5 + i)) * ps * .25 }); }
    // finish marker: two posts and a banner
    const mz = dzE - 3; if (mz < NEAR) return;
    const [ax, ay, as] = proj(-2.9, 0, mz), [bx] = proj(2.9, 0, mz), [, ty] = proj(0, 3.2, mz);
    c.strokeStyle = '#8B5A2B'; c.lineWidth = Math.max(3, as * .12); c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax, ty); c.moveTo(bx, ay); c.lineTo(bx, ty); c.stroke();
    const bh = as * .7, glow = .6 + .4 * Math.sin(t * 4);
    c.fillStyle = `rgba(255,212,71,${.25 * glow})`; c.fillRect(ax, ty - bh * .3, bx - ax, ay - ty + bh * .3);
    c.fillStyle = '#FFD447'; c.strokeStyle = ink; c.lineWidth = Math.max(2, as * .04); c.beginPath(); if (c.roundRect) c.roundRect(ax, ty, bx - ax, bh, bh * .3); else c.rect(ax, ty, bx - ax, bh); c.fill(); c.stroke();
    c.fillStyle = ink; c.font = `400 ${Math.round(bh * .62)}px "Lilita One", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🏁 SAFE SHORE', (ax + bx) / 2, ty + bh * .54);
    void lit;
  }
  function drawRun(c) {
    const R = g.r, st = R.st, p = clamp(R.pz / R.c.len, 0, 1), lit = light(st, p), t = g.t;
    sky(c, st, p);
    c.save(); c.translate(0, OY);
    if (R.shake > 0) c.translate((Math.random() - .5) * 10 * R.shake, (Math.random() - .5) * 6 * R.shake);
    const dzE = st === 2 ? R.c.len - R.pz : 1e9, o = { wx: WX, wh: WH, pz: R.pz, dzEnd: dzE, lit, t, lanes: true };
    ground(c, o);
    if (st === 2) shore(c, R, dzE, lit, t);
    walls(c, o); wallLife(c, R, o);
    // everything on the path, far to near
    const list = [];
    R.c.obs.forEach(ob => { const dz = ob.z - R.pz; if (dz > NEAR + .3 && dz < Math.min(FAR, dzE)) list.push([dz, 'o', ob]); });
    R.c.items.forEach(it => { const dz = it.z - R.pz; if (!it.got && dz > NEAR + .3 && dz < Math.min(FAR, dzE)) list.push([dz, 'i', it]); });
    R.walkers.forEach(w => { if (w.dz < dzE - 2) list.push([w.dz, 'w', w]); });
    list.push([0, 'p']);
    list.sort((a, b) => b[0] - a[0]);
    for (const [dz, k, ob] of list) {
      if (k === 'o') obstacle(c, ob, dz, lit);
      else if (k === 'i') item(c, ob, dz, t);
      else if (k === 'w') { const [x, y, s] = proj(ob.x, 0, dz); person(c, x, y, s, ob.c, { kid: ob.kid, step: Math.sin(t * 8 + ob.ph) * 10, bob: Math.abs(Math.sin(t * 8 + ob.ph)) * s * .04 }); }
      else runner(c, R);
    }
    if (R.hint) R.c.obs.forEach(ob => { if (!ob.done) hintBadge(c, ob, ob.z - R.pz); });
    c.restore();
    // particles, pop-up words, countdown
    R.parts.forEach(q => { c.globalAlpha = clamp(q.life, 0, 1); c.fillStyle = q.c; c.beginPath(); if (q.star) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? q.r * .45 : q.r * 1.3; c.lineTo(q.x + Math.cos(a) * rr, q.y + OY * (q.conf ? 0 : 1) + Math.sin(a) * rr); } c.closePath(); } else c.arc(q.x, q.y + (q.conf ? 0 : OY), q.r, 0, 7); c.fill(); });
    c.globalAlpha = 1;
    const [px, py] = proj(R.px, R.py, 0);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    R.pops.forEach((q, i) => { c.globalAlpha = 1 - q.t; c.font = '400 30px "Lilita One", sans-serif'; c.lineWidth = 6; c.strokeStyle = ink; c.fillStyle = q.c; const y = py + OY - 200 - q.t * 50 - i * 6; c.strokeText(q.txt, clamp(px, 140, W - 140), y); c.fillText(q.txt, clamp(px, 140, W - 140), y); });
    c.globalAlpha = 1;
    if (R.count > 0) { const n = Math.ceil(R.count / .8), txt = n >= 1 ? String(Math.min(3, n)) : 'GO!'; c.font = `400 ${n >= 1 ? 110 : 90}px "Lilita One", sans-serif`; c.lineWidth = 10; c.strokeStyle = ink; c.fillStyle = '#FFD447'; c.strokeText(txt, W / 2, H / 2); c.fillText(txt, W / 2, H / 2); }
    else if (R.t < .6) { c.globalAlpha = 1 - R.t / .6; c.font = '400 90px "Lilita One", sans-serif'; c.lineWidth = 10; c.strokeStyle = ink; c.fillStyle = '#7ED957'; c.strokeText('GO!', W / 2, H / 2); c.fillText('GO!', W / 2, H / 2); c.globalAlpha = 1; }
    if (R.ts < .9) { c.fillStyle = `rgba(19,32,58,${(1 - R.ts) * .25})`; c.fillRect(0, 0, W, H); }
  }

  /* ---------- story scenes: the sea opening, the waters returning, Miriam's song ---------- */
  function moses(c, x, y, sc, arm) {
    // Moses, side view, staff in hand; arm 0 = down, 1 = stretched out over the sea
    c.save(); c.translate(x, y); c.scale(sc, sc); c.lineCap = 'round'; c.lineJoin = 'round';
    c.fillStyle = 'rgba(19,32,58,.25)'; c.beginPath(); c.ellipse(0, 0, 50, 10, 0, 0, 7); c.fill();
    c.fillStyle = '#8B5A2B'; c.strokeStyle = ink; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-34, 0); c.lineTo(34, 0); c.lineTo(20, -130); c.lineTo(-22, -130); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#C0392B'; c.beginPath(); c.moveTo(-22, -130); c.lineTo(20, -130); c.lineTo(14, -60); c.lineTo(-30, -2); c.lineTo(-34, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#9B6A3C'; c.beginPath(); c.arc(4, -150, 22, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#F4F4F4'; c.beginPath(); c.moveTo(10, -146); c.quadraticCurveTo(30, -120, 8, -108); c.quadraticCurveTo(-4, -118, 0, -140); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#E9D7A8'; c.beginPath(); c.arc(4, -156, 23, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(28, -146); c.lineTo(-18, -140); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = ink; c.beginPath(); c.arc(16, -152, 2.5, 0, 7); c.fill();
    const a = lerp(.9, -.55, arm), sx = 6, sy = -118, hx = sx + Math.cos(a) * 60, hy = sy + Math.sin(a) * 60;
    c.strokeStyle = '#9B6A3C'; c.lineWidth = 12; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke();
    c.strokeStyle = '#6B4423'; c.lineWidth = 7; c.beginPath(); c.moveTo(hx - Math.cos(a - .3) * 40, hy - Math.sin(a - .3) * 40 + 30); c.lineTo(hx + Math.cos(a - .3) * 70, hy + Math.sin(a - .3) * 70 - 50); c.stroke();
    if (arm > .6) { c.strokeStyle = `rgba(255,240,170,${(arm - .6) * 2})`; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(hx + Math.cos(a - .3) * 70, hy + Math.sin(a - .3) * 70 - 50, 10 + i * 8, 0, 7); c.stroke(); } }
    c.restore();
  }
  function seaScene(c, s) {
    // looking out over the sea from the beach; p = how far the sea has opened (0 closed, 1 open)
    const p = ease(clamp(s.pOpen, 0, 1)), t = g.t, lit = s.kind === 'part' ? .6 : 1;
    sky(c, s.kind === 'part' ? 0 : 2, s.kind === 'part' ? 0 : 1);
    c.save(); c.translate(0, OY);
    const seaTop = HY, beach = 3;
    const [, by] = proj(0, 0, beach);
    const sg = c.createLinearGradient(0, seaTop, 0, by); sg.addColorStop(0, mixC('#2B4C8C', '#8FD8FF', lit)); sg.addColorStop(1, mixC('#14306A', '#1F55D6', lit));
    c.fillStyle = sg; c.fillRect(0, seaTop, W, by - seaTop);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const z = beach + ((i * 5 + t * 2) % 70), [, y, sc] = proj(0, 0, z); c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, y + Math.sin(x / 40 + t * 2 + i) * sc * .04); c.stroke(); }
    if (p > .01) {
      const o = { wx: WX * p, wh: WH * p, pz: 0, dzEnd: FAR, lit, t, sandA: p };
      // path through the sea from the beach to the horizon
      c.save(); c.beginPath(); c.rect(0, 0, W, by); c.clip(); ground(c, o); walls(c, o); c.restore();
    }
    // beach in the front
    const bg = c.createLinearGradient(0, by, 0, 540); bg.addColorStop(0, mixC('#8C7A5A', '#F1DDAE', lit)); bg.addColorStop(1, mixC('#6E5A3C', '#D9B576', lit));
    c.fillStyle = bg; c.beginPath(); c.moveTo(0, by); for (let x = 0; x <= W; x += 30) c.lineTo(x, by + Math.sin(x / 70) * 4); c.lineTo(W, 540); c.lineTo(0, 540); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, by + Math.sin(x / 70) * 4 + Math.sin(t * 2 + x) * 1.5); c.stroke();
    // the strong east wind
    if (s.kind === 'part' && s.hold) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = 0; i < 9; i++) { const y = 60 + i * 34, x = ((t * 900 + i * 230) % (W + 300)) - 150; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 60, y - 12, x + 120, y); c.stroke(); } c.lineCap = 'butt'; }
    // the people watching from the beach
    for (let i = 0; i < 9; i++) { const x = W * .58 + (i % 5) * 70 + (i > 4 ? 35 : 0), y = 470 + (i > 4 ? 40 : 0); person(c, x, y, 120 + (i > 4 ? 30 : 0), ['#C0392B', '#14946B', '#7A3E9D', '#F28C28', '#1F55D6'][i % 5], { kid: i % 3 === 1, face: true, cheer: p > .95 || s.cheer, bob: (p > .95 || s.cheer) ? Math.abs(Math.sin(t * 5 + i)) * 10 : 0 }); }
    moses(c, Math.max(120, W * .2), 500, 1.15, s.arm);
    c.restore();
  }
  function miriamScene(c, s) {
    const t = g.t;
    sky(c, 2, 1);
    c.save(); c.translate(0, OY);
    c.fillStyle = '#5DA9F0'; c.fillRect(0, HY, W, 90);
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) { const x = (i * 97 + t * 20) % W, y = HY + 10 + (i * 37) % 70; c.fillRect(x, y, 14, 2); }
    const bg = c.createLinearGradient(0, HY + 90, 0, 540); bg.addColorStop(0, '#F1DDAE'); bg.addColorStop(1, '#D9B576');
    c.fillStyle = bg; c.fillRect(0, HY + 90, W, 540 - HY - 90);
    // women dancing in a circle around Miriam; they jump when you hit the beat
    const n = 8, cx = W / 2, cy = 430, ring = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + t * .5; ring.push([a, cx + Math.cos(a) * Math.min(W * .36, 300), cy + Math.sin(a) * 60, i]); }
    ring.sort((p1, p2) => p1[2] - p2[2]).forEach(([a, x, y, i]) => {
      const bob = Math.max(0, s.jump - (i % 3) * .08) * 60 + Math.abs(Math.sin(t * 4 + i)) * 8;
      person(c, x, y, 100 + Math.sin(a) * 18, ['#C0392B', '#F28C28', '#14946B', '#1F55D6', '#7A3E9D', '#FF8FA3', '#2E9E4F', '#B9770E'][i], { cheer: true, face: true, kid: i % 4 === 2, bob });
    });
    // Miriam with her tambourine
    const mb = s.jump * 40;
    c.save(); c.translate(cx, cy + 40 - mb);
    c.fillStyle = 'rgba(19,32,58,.25)'; c.beginPath(); c.ellipse(0, mb, 50, 10, 0, 0, 7); c.fill();
    c.fillStyle = '#7A3E9D'; c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(24, -130); c.lineTo(-24, -130); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#9B6A3C'; c.beginPath(); c.arc(0, -150, 22, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -158, 23, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(26, -140); c.lineTo(-26, -140); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = ink; c.beginPath(); c.arc(-7, -150, 2.5, 0, 7); c.arc(7, -150, 2.5, 0, 7); c.fill();
    c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.arc(0, -144, 8, .2, Math.PI - .2); c.stroke();
    c.strokeStyle = '#9B6A3C'; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, -118); c.lineTo(-46, -170); c.moveTo(20, -118); c.lineTo(46, -175 - s.jump * 10); c.stroke(); c.lineCap = 'butt';
    c.translate(52, -190 - s.jump * 10); c.rotate(Math.sin(t * 8) * .1 + s.jump * .5);
    c.fillStyle = '#F2C14E'; c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 28, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#FFF3DC'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill();
    c.fillStyle = '#C0392B'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.beginPath(); c.arc(Math.cos(a) * 23, Math.sin(a) * 23, 4, 0, 7); c.fill(); }
    c.restore();
    c.restore();
    // music notes
    s.notes.forEach(q => { c.globalAlpha = clamp(q.life, 0, 1); c.fillStyle = q.c; c.font = '400 34px "Lilita One", sans-serif'; c.textAlign = 'center'; c.fillText(q.ch, q.x, q.y + OY); });
    c.globalAlpha = 1;
    // the beat ring: tap when the shrinking ring reaches the tambourine
    if (s.beats) {
      const bx = W / 2, byy = 105 + OY, now = s.t, next = s.beats.find(b => !b.judged && b.at > now - g.C.win);
      c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.arc(bx, byy, 40, 0, 7); c.fill(); c.stroke();
      tambIcon(c, bx, byy, 28); c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (next) { const d = next.at - now, r = 40 + Math.max(0, d) * 120; if (d < 1.2) { c.strokeStyle = `rgba(255,212,71,${1 - Math.max(0, d) / 1.2})`; c.lineWidth = 8; c.beginPath(); c.arc(bx, byy, r, 0, 7); c.stroke(); } }
      c.font = '800 18px Nunito, sans-serif'; c.fillStyle = '#fff'; c.strokeStyle = ink; c.lineWidth = 4;
      const lbl = s.lead > 0 ? `Get ready… ${s.lead}` : `${s.hits} / ${s.beats.length}`;
      c.strokeText(lbl, bx, byy + 64); c.fillText(lbl, bx, byy + 64);
      if (s.fb && s.fb.t < .8) { c.globalAlpha = 1 - s.fb.t / .8; c.font = '400 34px "Lilita One", sans-serif'; c.fillStyle = s.fb.c; c.lineWidth = 6; c.strokeText(s.fb.txt, bx + 130, byy); c.fillText(s.fb.txt, bx + 130, byy); c.globalAlpha = 1; }
    }
  }

  /* ---------- the main loop ---------- */
  function loop(now) {
    raf = 0;
    if (!g || !el.isConnected || !$('#rsC')) return;
    const dt = Math.min(.04, (now - g.last) / 1000); g.last = now;
    if (!g.paused) {
      g.t = (g.t || 0) + dt;
      if (g.mode === 'run' && g.r) stepRun(dt);
      else if (g.mode === 'scene' && g.scn) stepScene(dt);
      else if (g.mode === 'rhythm' && g.scn) stepRhythm(dt);
      if (g.mode !== 'run' && g.r && g.r.parts) { g.r.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 300 * dt; q.life -= dt * .6; }); g.r.parts = g.r.parts.filter(q => q.life > 0); }
    }
    const c = g.cx;
    if (c) {
      c.save();
      if (g.mode === 'run' || g.mode === 'arrive') drawRun(c);
      else if (g.mode === 'scene') seaScene(c, g.scn);
      else if (g.mode === 'rhythm') miriamScene(c, g.scn);
      c.restore();
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---------- captions, cards and the hold button ---------- */
  function caption(t, ref) {
    const b = $('#rsCap'); b.hidden = false;
    b.innerHTML = `<div>${t}${ref ? `<small>${ref}</small>` : ''}</div>${Ark.canSpeak ? '<button type="button" aria-label="Read it to me">🔊</button>' : ''}`;
    const k = b.querySelector('button'); if (k) k.onclick = () => say(t.replace(/[“”]/g, ''), true);
    b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    say(t.replace(/[“”]/g, '').replace(/\p{Extended_Pictographic}/gu, ''));
  }
  function card(html) {
    const k = $('#rsCard'); k.hidden = false; k.innerHTML = `<div>${html}</div>`;
    $('#rsPad').hidden = true; $('#rsKeys').hidden = true; $('#rsTeach').hidden = true;
    return k.firstElementChild;
  }
  const closeCard = () => { const k = $('#rsCard'); if (k) { k.hidden = true; k.innerHTML = ''; } };
  function btn(box, label, fn, cls = 'big') {
    box.insertAdjacentHTML('beforeend', `<div class="row" style="justify-content:center"><button class="btn ${cls}" type="button">${label}</button></div>`);
    const b = [...box.querySelectorAll('.btn')].pop();
    b.onclick = () => { b.disabled = true; hush(); fn(); };
    return b;
  }
  function holdOn() { const s = g && g.scn; if (!s || s.hold === undefined || s.doneHold) return; s.hold = true; s.taps = (s.taps || 0) + 1; s.p = Math.min(1, s.p + .04); const b = $('#rsHold'); if (b) b.classList.add('down'); if (!s.windT || g.t - s.windT > 2) { s.windT = g.t; s.kind === 'part' ? SFX.wind() : SFX.waves(); } }
  function holdOff() { const s = g && g.scn; if (!s) return; s.hold = false; const b = el && el.querySelector('#rsHold'); if (b) b.classList.remove('down'); }
  function holdButton(label) {
    $('#rsAct').innerHTML = `<button class="btn big rs-hold" id="rsHold" type="button" style="--p:0"><span>${label}</span></button>`;
    const b = $('#rsHold');
    b.onpointerdown = e => { e.preventDefault(); holdOn(); };
    b.onpointerup = b.onpointerleave = b.onpointercancel = () => holdOff();
    b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); holdOn(); } };
    b.onkeyup = e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); holdOff(); } };
  }
  function stepScene(dt) {
    const s = g.scn;
    if (s.hold && !s.doneHold) s.p = Math.min(1, s.p + dt / (g.diff === 'easy' ? 2.4 : 3));
    s.arm += ((s.hold || s.doneHold ? 1 : 0) - s.arm) * Math.min(1, dt * 6);
    const b = $('#rsHold'); if (b) b.style.setProperty('--p', s.p.toFixed(3));
    if (!s.doneHold && s.p >= 1) { s.doneHold = true; s.hold = false; $('#rsAct').innerHTML = ''; s.onOpen(); }
  }
  // the scene draws "p" as how open the sea is; for the waters returning we show 1 - progress
  function scene(kind, onOpen) {
    g.mode = 'scene'; g.r = null;
    g.scn = { kind, p: 0, arm: 0, hold: false, doneHold: false, onOpen };
    Object.defineProperty(g.scn, 'pOpen', { get() { return kind === 'part' ? this.p : 1 - this.p; } });
    $('#rsHud').hidden = true; $('#rsPad').hidden = true; $('#rsKeys').hidden = true; $('#rsBanner').hidden = true;
    g.helpScn = () => { const b = $('#rsHold'); if (b) { b.classList.add('pulse'); Ark.toast('Press and hold the green button!'); } };
    ctl();
  }

  /* ================= STAGE 1: The Sea Opens ================= */
  function stage1() {
    screen(0);
    scene('part', () => {
      caption('God made a way through the sea! 🌊', 'Exodus 14:21–22 (summary)');
      SFX.waves();
      later(() => {
        const k = card(`<h3>Run across the sea bed!</h3>
          <div class="how"><div><b>◀ ▶</b>Swipe or tap arrows to change lanes</div><div><b>⬆</b>Tap or swipe up to jump</div><div><b>⬇</b>Swipe down to slide</div></div>
          <p class="note">On a keyboard: ← → to move, ↑ or Space to jump, ↓ to slide.</p>
          <div class="rs-rot"><i>📱</i> Turn your phone sideways for a bigger game!</div>
          <p class="note">The rocks and arches are part of the game. In the Bible, God kept His people safe all the way across.</p>`);
        btn(k, `${Ark.UI.play} Start practice run`, () => { closeCard(); runAll(0, stage1Done); });
      }, 1600);
    });
    caption('Moses stretched out his hand over the sea. ✋', 'Exodus 14:21 (summary)');
    holdButton('✋ Hold to stretch out Moses’ hand');
  }
  // run the stage for each player in turn (same course, so it’s fair), then call next
  function runAll(st, next) {
    const go = p => {
      g.turn = p; paintScore();
      run(st, () => {
        if (g.two && p === 0) {
          const k = card(`<h3>${pname(0)} done! 🎉</h3>${chips(g.r.result)}<p>${pname(1)}, get ready!</p>`);
          btn(k, `${Ark.UI.play} ${pname(1)}’s turn`, () => { closeCard(); go(1); });
        } else next();
      });
    };
    go(0);
  }
  const chips = r => `<div class="chips"><span class="chip2">+${r.pts} points</span><span class="chip2">💧 ${r.water}</span><span class="chip2">${TB} ${r.tamb}</span>${r.bread ? `<span class="chip2">🍞 ${r.bread}</span>` : ''}<span class="chip2">${r.hits ? `Bumps: ${r.hits}` : '🛡️ No bumps!'}</span>${r.near ? `<span class="chip2">⚡ ${r.near} close calls</span>` : ''}<span class="chip2">🔥 Best combo ${r.combo}</span></div>`;
  function compare() {
    return g.two ? `<div class="rs-cmp">${g.players.map((p, i) => `<div><span>${pname(i)}</span><b>${p.score}</b></div>`).join('')}</div>` : '';
  }
  /* A Bible Discovery question: one try, a short explanation, Skip is always there. */
  function question(box, d, then) {
    const who = g.two ? g.qTurn : 0; if (g.two) g.qTurn = 1 - g.qTurn;
    g.stats.asked++;
    box.insertAdjacentHTML('beforeend', `<div class="rs-q"><p class="fact">📜 ${d.fact} <small>${d.ref}</small></p>${g.two ? `<b style="color:#7A3E9D">${pname(who)}, this one is for you!</b>` : ''}<p class="qq">${d.q}</p>
      ${shuf(d.opts.map((o, i) => [o, i])).map(([o, i]) => `<button class="rs-opt" data-i="${i}">${o.t}</button>`).join('')}<button class="rs-skip">Skip for now</button></div>`);
    const q = [...box.querySelectorAll('.rs-q')].pop(), bs = [...q.querySelectorAll('.rs-opt')], sk = q.querySelector('.rs-skip');
    if (g.diff !== 'hard') say(d.q);
    const end = () => { bs.forEach(b => (b.disabled = true)); sk.remove(); g.helpScn = null; then(); };
    g.helpScn = () => bs.find(b => d.opts[+b.dataset.i].ok)?.classList.add('hint');
    bs.forEach(b => (b.onclick = () => {
      const ok = d.opts[+b.dataset.i].ok; b.classList.add(ok ? 'ok' : 'no'); if (!ok) bs.find(x => d.opts[+x.dataset.i].ok).classList.add('ok');
      if (ok) { g.stats.right++; g.players[who].score += 150; paintScore(); SFX.bread(); } else g.stats.wrong++;
      q.insertAdjacentHTML('beforeend', `<p class="rs-exp">${ok ? '✓ +150. ' : ''}${d.exp}</p>`); end();
    }));
    sk.onclick = end;
  }
  function stage1Done() {
    g.mode = 'arrive';
    const k = card(`<h3>✓ Stage 1 done!</h3>${g.two ? compare() : chips(g.r.result)}`);
    question(k, { fact: 'The LORD pushed the sea back with a strong east wind all that night.', ref: 'Exodus 14:21 (summary)', q: 'Who sent the wind that opened the sea?',
      opts: [{ t: 'God', ok: true }, { t: 'Pharaoh' }, { t: 'The fish' }], exp: 'God did it! Moses obeyed, and God opened the way.' },
    () => btn(k, `Next stage: Journey Through the Sea ${Ark.UI.play}`, () => begin(1, stage2)));
    ctl();
  }

  /* ================= STAGE 2: Journey Through the Sea ================= */
  function stage2() {
    screen(1);
    g.mode = 'arrive'; g.r = null; g.scn = null;
    // show the view while the card is up
    run(1, () => {}); g.mode = 'arrive'; g.r.count = 0; g.r.t = 1;
    const k = card(`<h3>Stage 2: Journey Through the Sea</h3><p>Run faster and faster! Watch for fish in the water walls, and God’s people walking ahead of you.</p>
      <div class="chips"><span class="chip2">⬆ jump</span><span class="chip2">⬇ slide</span><span class="chip2">◀ ▶ dodge</span><span class="chip2">⚡ close calls = bonus</span></div>`);
    btn(k, `${Ark.UI.play} Go!`, () => { closeCard(); runAll(1, stage2Done); });
  }
  function stage2Done() {
    g.mode = 'arrive';
    const k = card(`<h3>✓ Stage 2 done!</h3>${g.two ? compare() : chips(g.r.result)}
      <div class="rs-think"><span class="k">Think about it</span><p class="qq" style="font-weight:800;margin:4px 0 8px">God’s people were scared, but God made a way. When you feel scared, what can you remember?</p>
      <div class="rs-q" id="rsTh">${[['🙏', 'I can pray to God', 'God hears every prayer, big or small.'], ['💛', 'God is with me', 'Yes! God was with His people in the sea, and He is with you.'], ['🧑‍🤝‍🧑', 'I can ask a grown-up for help', 'That’s wise. God gives us people to help us.'], ['🌊', 'God made a way for Moses', 'God can make a way for you too.']].map((o, i) => `<button class="rs-opt" data-i="${i}" data-r="${esc(o[2])}">${o[0]} ${o[1]}</button>`).join('')}</div>
      <button class="rs-skip" id="rsThS">Skip</button></div>`);
    const fin = () => { k.querySelectorAll('#rsTh .rs-opt').forEach(b => (b.disabled = true)); k.querySelector('#rsThS')?.remove(); btn(k, `Next stage: Reach the Other Side! ${Ark.UI.play}`, () => begin(2, stage3)); };
    k.querySelectorAll('#rsTh .rs-opt').forEach(b => (b.onclick = () => { b.classList.add('pick'); k.querySelector('#rsTh').insertAdjacentHTML('beforeend', `<p class="rs-exp">${b.dataset.r}</p>`); say(b.dataset.r); g.reflect = b.textContent; fin(); }));
    k.querySelector('#rsThS').onclick = fin;
    ctl();
  }

  /* ================= STAGE 3: Reach the Other Side! ================= */
  function stage3() {
    screen(2);
    run(2, () => {}); g.mode = 'arrive'; g.r.count = 0; g.r.t = 1;
    const k = card(`<h3>Stage 3: Reach the Other Side!</h3><p>The shore is ahead! Run to the 🏁 <b>SAFE SHORE</b> marker. The last part is the trickiest.</p>`);
    btn(k, `${Ark.UI.play} Go!`, () => { closeCard(); runAll(2, arrived); });
  }
  function arrived() {
    g.mode = 'arrive'; $('#rsHud').hidden = true; $('#rsBanner').hidden = true;
    caption('You made it across on dry ground! 🎉', 'Exodus 14:29 (summary)');
    later(() => {
      const k = card(`<h3>Safe on the other side!</h3>${g.two ? compare() : chips(g.r.result)}<p>Everyone is safe on the shore. Now Moses stretches out his hand again…</p>`);
      btn(k, `Look back at the sea ${Ark.UI.play}`, () => { closeCard(); returnWaters(); });
    }, 1800);
    ctl();
  }
  function returnWaters() {
    scene('return', () => {
      caption('The sea flowed back to its place. God’s people were safe! 🌊', 'Exodus 14:26–29 (summary)');
      g.scn.cheer = true; SFX.cheer();
      later(() => btn($('#rsAct'), `${TB} Celebrate with Miriam ${Ark.UI.play}`, () => { $('#rsAct').innerHTML = ''; miriam(); }), 1800);
    });
    g.scn.p = 0;
    caption('Everyone was across. Moses stretched out his hand again. ✋', 'Exodus 14:26 (summary)');
    holdButton('✋ Hold to stretch out Moses’ hand');
  }

  /* Miriam’s song: tap the tambourine on the beat (8 beats). */
  function miriam() {
    g.mode = 'rhythm'; g.r = g.r || null;
    const C = g.C, spb = 60 / C.bpm, lead = 4;
    const beats = Array.from({ length: 8 }, (_, i) => ({ at: (lead + i) * spb + .4, judged: false }));
    g.scn = { t: 0, beats, hits: 0, lead, jump: 0, notes: [], fb: null, spb, lastBeat: -1 };
    $('#rsHud').hidden = true; $('#rsPad').hidden = true;
    caption('Miriam took a tambourine, and all the women danced. Tap on the beat!', 'Exodus 15:20 (summary)');
    $('#rsAct').innerHTML = `<button class="btn big" id="rsTap" type="button" style="font-size:clamp(20px,4.4vmin,30px)">${TB} Tap!</button>`;
    const b = $('#rsTap'); b.onpointerdown = e => { e.preventDefault(); act('tap'); }; b.onclick = e => { if (e.detail === 0) act('tap'); };
    g.helpScn = () => Ark.toast('Tap when the yellow ring touches the tambourine!');
    ctl();
  }
  function stepRhythm(dt) {
    const s = g.scn, C = g.C; s.t += dt; s.jump = Math.max(0, s.jump - dt * 3);
    const bi = Math.floor((s.t - .4) / s.spb);
    if (bi !== s.lastBeat && bi >= 0 && bi < s.lead + 8) { s.lastBeat = bi; SFX.beat(); s.lead = Math.max(0, 4 - bi - 1); }
    if (bi >= 0 && bi < 4) s.lead = 4 - bi; else s.lead = 0;
    s.beats.forEach(b => { if (!b.judged && s.t > b.at + C.win) { b.judged = true; s.fb = { txt: 'Miss', c: '#FF8FA3', t: 0 }; } });
    if (s.fb) s.fb.t += dt;
    s.notes.forEach(q => { q.y -= 60 * dt; q.life -= dt * .7; }); s.notes = s.notes.filter(q => q.life > 0);
    if (!s.end && s.beats.every(b => b.judged) && s.t > s.beats[7].at + .6) { s.end = true; songDone(); }
  }
  function rhythmTap() {
    const s = g.scn, C = g.C; if (!s || s.end) return;
    const b = s.beats.filter(x => !x.judged).sort((a, x) => Math.abs(a.at - s.t) - Math.abs(x.at - s.t))[0];
    SFX.tamb(); s.jump = 1;
    for (let i = 0; i < 2; i++) s.notes.push({ x: W / 2 + (Math.random() - .5) * 300, y: 330, life: 1, ch: ['♪', '♫'][i], c: ['#FFD447', '#FF8FA3', '#7ED957'][Math.floor(Math.random() * 3)] });
    if (!b) return;
    const d = Math.abs(b.at - s.t);
    if (d <= C.win) { b.judged = true; s.hits++; const perfect = d <= C.win * .45; s.fb = { txt: perfect ? 'Perfect!' : 'Good!', c: perfect ? '#FFD447' : '#7ED957', t: 0 }; g.players.forEach(p => (p.score += perfect ? 40 : 20)); paintScore(); }
  }
  function songDone() {
    const s = g.scn; g.stats.rhythm = s.hits; if (s.hits === 8) g.earn.rhythm = 1;
    $('#rsAct').innerHTML = '';
    caption('“Sing ye to the LORD, for he hath triumphed gloriously.”', 'Exodus 15:21 (KJV)');
    SFX.win();
    later(() => {
      const k = card(`<h3>🎶 ${s.hits} of 8 beats!</h3><p>God’s people praised God with music and dancing.</p>`);
      question(k, { fact: 'Miriam and the women played tambourines, danced and sang to the LORD.', ref: 'Exodus 15:20–21 (summary)', q: 'What did God’s people do after God saved them?',
        opts: [{ t: 'They sang and praised God', ok: true }, { t: 'They went home to sleep' }, { t: 'They forgot about it' }], exp: 'They thanked God with songs! We can praise God too when He helps us.' },
      () => btn(k, '🏁 Finish the journey', finishAll));
    }, 2600);
  }

  /* ================= Finish: stars, personal best, badges, replay challenge ================= */
  function finishAll() {
    const { diff, two, players, stats } = g;
    const hits = players.reduce((a, p) => a + p.hits, 0) / players.length;
    const pen = hits / 2 + stats.wrong;
    const stars = pen <= 1.5 ? 3 : pen <= 4 ? 2 : 1;
    const earn = Object.assign({}, g.earn);
    if (players.some(p => p.tamb >= stats.tamb0 + stats.tamb1 + stats.tamb2)) earn.tamb = 1;
    if (stats.asked && stats.right === stats.asked) earn.explorer = 1;
    if (diff === 'hard') earn.hard = 1;
    if (two) earn.team = 1;
    const got = storeJSON('rsr-badges') || {}, fresh = Object.keys(earn).filter(k => !got[k]);
    fresh.forEach(k => (got[k] = Date.now())); storeJSON('rsr-badges', got);
    const top = Math.max(...players.map(p => p.score)), best = storeJSON('rsr-best') || {}, prev = best[diff] || 0, nb = top > prev;
    if (nb) { best[diff] = top; storeJSON('rsr-best', best); }
    const locked = Object.keys(BADGES).filter(k => !got[k]);
    const challenge = locked.length ? `🎯 <b>Next challenge:</b> unlock <b>${BADGES[locked[0]][0]} ${BADGES[locked[0]][1]}</b>. ${BADGES[locked[0]][2]}.` : `🎯 <b>Next challenge:</b> beat your best of <b>${Math.max(top, prev)}</b> on ${Ark.DLABEL[diff]}!`;
    let sc;
    if (two) { const w = players[0].score === players[1].score ? -1 : players[0].score > players[1].score ? 0 : 1; sc = `<h3 style="font-size:24px">${w < 0 ? 'It’s a tie!' : `${pname(w)} wins! 🏆`}</h3><div class="rs-cmp">${players.map((p, i) => `<div class="${i === w ? 'win' : ''}"><span>${pname(i)}</span><b>${p.score}</b>${TB} ${p.tamb} · ${p.hits ? `${p.hits} bumps` : 'no bumps'}</div>`).join('')}</div>`; }
    else sc = `<div class="chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"><span style="font-weight:800;padding:6px 12px;border-radius:999px;border:2px solid var(--line);background:var(--bg);font-size:20px">Score: <b>${players[0].score}</b></span><span style="font-weight:800;padding:6px 12px;border-radius:999px;border:2px solid var(--line);background:var(--bg)">Best: ${Math.max(top, prev)}</span></div>`;
    const d = diff;
    stop(); el.classList.remove('rs-wide');
    Ark.finish(el, {
      id: 'red-sea-run', diff: d, stars, title: 'God made a way through the sea!',
      html: `${sc}${nb && prev ? '<span class="newbest">New best score!</span>' : ''}
        <div class="rs-badges">${Object.entries(BADGES).map(([k, b]) => `<div class="rs-badge ${got[k] ? 'got' : ''} ${fresh.includes(k) ? 'new' : ''}"><span class="i">${b[0] || TB}</span><span><b>${b[1]}${fresh.includes(k) ? ' (new!)' : ''}</b><small>${b[2]}</small></span></div>`).join('')}</div>
        <div class="lesson" style="text-align:left;border-color:var(--amber)">${challenge}</div>`,
      verse: ['The LORD shall fight for you, and ye shall hold your peace.', 'Exodus 14:14 (KJV)'],
      lesson: 'God’s people were stuck between an army and the sea, but God made a way where there was no way. They walked through on dry ground, and then they praised Him with songs. God is with you too!',
      again: () => play(d), menu,
      next: d !== 'hard' ? [`Try ${d === 'easy' ? 'Normal' : 'Hard'}`, () => { const n = d === 'easy' ? 'normal' : 'hard'; store('diff-red-sea-run', n); play(n); }] : null
    });
    if (fresh.length) setTimeout(() => Ark.toast(`New badge: ${BADGES[fresh[0]][0]} ${BADGES[fresh[0]][1]}!`), 900);
  }

  function stop() { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; if (g) clearTimeout(g.bannerT); g = null; }

  Ark.games['red-sea-run'] = {
    mount(stage) { el = stage; css(); addEventListener('resize', onResize); addEventListener('keydown', onKey); addEventListener('keyup', onKey); menu(); },
    unmount() { stop(); hush(); if (el) el.classList.remove('rs-wide'); removeEventListener('resize', onResize); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); },
    _test: { state: () => g, D, act: a => act(a), hold: on => (on ? holdOn() : holdOff()), proj, laneX, LW, W: () => W }
  };
})();
