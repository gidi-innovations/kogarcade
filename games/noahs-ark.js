/* Noah's Ark Animal Match 2.0 (Genesis 6–9). Match. Rescue. Discover God's Promise.
   Stage 1: the original matching game, upgraded (score, combos, sounds, rescue scene, weather, 2 players).
   Stage 2: guide the rescued animals to the ark (jump logs, rocks, streams; collect olive leaves).
   Stage 3: God's Promise, the story of the flood, the dove and the rainbow, with short Bible Discoveries. */
(() => {
  const { store, shuf, say, hush, bar, setBar, learn } = Ark;
  const ink = '#13203A';
  const eyes = (y = 27, l = 24, r = 36) => `<circle cx="${l}" cy="${y}" r="2.6" fill="${ink}"/><circle cx="${r}" cy="${y}" r="2.6" fill="${ink}"/>`;
  const ANIMALS = {
    lion: { n: 'Lion', pl: 'lions', s: `<circle cx="30" cy="30" r="26" fill="#E07A1F" stroke="${ink}" stroke-width="2.5" stroke-dasharray="6 3"/><circle cx="30" cy="31" r="17" fill="#F6C04A" stroke="${ink}" stroke-width="2.5"/>${eyes(28)}<path d="M26 34h8l-4 4z" fill="${ink}"/><path d="M26 41q4 3 8 0" stroke="${ink}" stroke-width="2" fill="none"/>` },
    elephant: { n: 'Elephant', pl: 'elephants', s: `<ellipse cx="13" cy="29" rx="11" ry="14" fill="#9AA3AF" stroke="${ink}" stroke-width="2.5"/><ellipse cx="47" cy="29" rx="11" ry="14" fill="#9AA3AF" stroke="${ink}" stroke-width="2.5"/><circle cx="30" cy="27" r="15" fill="#B7BEC8" stroke="${ink}" stroke-width="2.5"/><path d="M25 35v13a5 5 0 0010 0V35" fill="#B7BEC8" stroke="${ink}" stroke-width="2.5"/>${eyes(25)}` },
    giraffe: { n: 'Giraffe', pl: 'giraffes', s: `<path d="M23 15V5M37 15V5" stroke="${ink}" stroke-width="3"/><circle cx="23" cy="5" r="3" fill="#A0522D"/><circle cx="37" cy="5" r="3" fill="#A0522D"/><ellipse cx="30" cy="31" rx="14" ry="19" fill="#F2C14E" stroke="${ink}" stroke-width="2.5"/><circle cx="22" cy="20" r="3" fill="#B5651D"/><circle cx="38" cy="22" r="2.5" fill="#B5651D"/><circle cx="34" cy="15" r="2" fill="#B5651D"/><ellipse cx="30" cy="43" rx="9" ry="6" fill="#E0A93A" stroke="${ink}" stroke-width="2"/>${eyes(28)}` },
    sheep: { n: 'Sheep', pl: 'sheep', s: `<g fill="#fff" stroke="${ink}" stroke-width="2.5"><circle cx="17" cy="22" r="9"/><circle cx="30" cy="15" r="9"/><circle cx="43" cy="22" r="9"/><circle cx="46" cy="35" r="8"/><circle cx="14" cy="35" r="8"/></g><ellipse cx="30" cy="34" rx="11" ry="14" fill="#3B3B3B" stroke="${ink}" stroke-width="2.5"/><circle cx="25" cy="31" r="2.6" fill="#fff"/><circle cx="35" cy="31" r="2.6" fill="#fff"/><circle cx="30" cy="22" r="6" fill="#fff"/>` },
    zebra: { n: 'Zebra', pl: 'zebras', s: `<path d="M21 13l2-9 5 8M39 13l-2-9-5 8" fill="#fff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="30" cy="30" rx="13" ry="20" fill="#fff" stroke="${ink}" stroke-width="2.5"/><path d="M18 22q6 3 0 6M42 22q-6 3 0 6M19 33q5 2 0 5M41 33q-5 2 0 5M30 11v9" stroke="${ink}" stroke-width="3.5" fill="none"/><ellipse cx="30" cy="44" rx="9" ry="6" fill="#3B3B3B"/>${eyes(27, 25, 35)}` },
    bear: { n: 'Bear', pl: 'bears', s: `<circle cx="15" cy="15" r="8" fill="#8B5A2B" stroke="${ink}" stroke-width="2.5"/><circle cx="45" cy="15" r="8" fill="#8B5A2B" stroke="${ink}" stroke-width="2.5"/><circle cx="30" cy="32" r="20" fill="#8B5A2B" stroke="${ink}" stroke-width="2.5"/><ellipse cx="30" cy="39" rx="9" ry="7" fill="#D9B38C" stroke="${ink}" stroke-width="2"/><ellipse cx="30" cy="36" rx="3.5" ry="2.5" fill="${ink}"/>${eyes(28)}` },
    rabbit: { n: 'Rabbit', pl: 'rabbits', s: `<ellipse cx="23" cy="15" rx="5.5" ry="13" fill="#E9E4DE" stroke="${ink}" stroke-width="2.5"/><ellipse cx="37" cy="15" rx="5.5" ry="13" fill="#E9E4DE" stroke="${ink}" stroke-width="2.5"/><ellipse cx="23" cy="15" rx="2.2" ry="8" fill="#F5A3B5"/><ellipse cx="37" cy="15" rx="2.2" ry="8" fill="#F5A3B5"/><circle cx="30" cy="37" r="15" fill="#E9E4DE" stroke="${ink}" stroke-width="2.5"/><ellipse cx="30" cy="40" rx="3" ry="2.2" fill="#E2728C"/>${eyes(34, 25, 35)}` },
    dove: { n: 'Dove', pl: 'doves', s: `<path d="M8 34q10-20 30-12 8-10 14-4l-6 4q2 14-14 18-14 2-24-6z" fill="#fff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 30q8-8 16 0" fill="#E3EAF2" stroke="${ink}" stroke-width="2"/><path d="M52 18l6 2-6 2" fill="#F2A007" stroke="${ink}" stroke-width="1.5"/><circle cx="46" cy="19" r="2" fill="${ink}"/><path d="M54 24q-4 12-14 16" stroke="#4E7D2B" stroke-width="2" fill="none"/><ellipse cx="50" cy="31" rx="3" ry="1.6" fill="#6FA83A" transform="rotate(-50 50 31)"/><ellipse cx="45" cy="37" rx="3" ry="1.6" fill="#6FA83A" transform="rotate(-30 45 37)"/>` }
  };

  const svg = k => `<svg viewBox="0 0 60 60" aria-hidden="true">${ANIMALS[k].s}</svg>`;
  const STORY = [
    ['Noah loved God and obeyed Him.', 'Genesis 6:9'],
    ['God told Noah to build a big boat called an ark.', 'Genesis 6:14'],
    ['Noah did everything God told him to do.', 'Genesis 6:22'],
    ['The animals came to Noah two by two.', 'Genesis 7:9'],
    ['God shut the door of the ark to keep them safe.', 'Genesis 7:16'],
    ['It rained for forty days and forty nights.', 'Genesis 7:12'],
    ['A dove came back with an olive leaf. The water was going down!', 'Genesis 8:11'],
    ['God put a rainbow in the sky as His promise.', 'Genesis 9:13']
  ];
  // What changes from level to level. Stage 1 = matching, Stage 2 = the run to the ark.
  const D = {
    easy: { pairs: 4, cols: 4, peek: 3000, time: 0, helps: 99, star3: 3, star2: 7,
      speed: 165, len: 3000, jump: 640, grav: 1500, obs: ['log', 'rock'], gap: [460, 640], stream: 0, hint: true },
    normal: { pairs: 6, cols: 4, peek: 0, time: 0, helps: 3, star3: 4, star2: 9,
      speed: 235, len: 4300, jump: 640, grav: 1750, obs: ['log', 'rock', 'stream'], gap: [340, 520], stream: 62, hint: false },
    hard: { pairs: 8, cols: 4, peek: 0, time: 80, helps: 0, star3: 6, star2: 12,
      speed: 300, len: 5600, jump: 660, grav: 2150, obs: ['log', 'rock', 'stream', 'hedge', 'double'], gap: [300, 460], stream: 84, hint: false }
  };
  const STAGES = ['Find the Animals', 'Guide Them to the Ark', 'God’s Promise'];
  const BADGES = {
    memory: ['🧠', 'Sharp Memory', 'Match every pair with only a few extra tries'],
    combo: ['🔥', 'Combo Star', 'Make 3 matches in a row'],
    feet: ['👣', 'Sure Feet', 'Reach the ark without bumping into anything'],
    leaves: ['🌿', 'Leaf Collector', 'Collect every olive leaf on the way'],
    explorer: ['📖', 'Bible Explorer', 'Get every Bible Discovery right'],
    rainbow: ['🌈', 'Rainbow Keeper', 'Finish the whole mission on Hard'],
    team: ['🤝', 'Two by Two', 'Finish a two-player game']
  };
  let el, g = null, timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const later = (fn, ms) => timers.push(setTimeout(() => g && fn(), ms));
  const $ = s => el.querySelector(s);
  const opt = () => Ark.storeJSON('noah-opts') || { two: false, timed: true };

  /* ---------- sound effects: made in the browser (no downloads), soft and short. Sound on/off button controls them. ---------- */
  const SFX = (() => {
    let ctx = null;
    const on = () => Ark.voiceOn();
    const ac = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; };
    function tone(f, d, o = {}) {
      if (!on() || !ac()) return;
      const t = ctx.currentTime + (o.at || 0), osc = ctx.createOscillator(), gn = ctx.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib; lg.gain.value = o.depth || f * .04; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + d); }
      let node = osc;
      if (o.lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
      const v = (o.vol || .12);
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(v, t + Math.min(.04, d / 4)); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      node.connect(gn); gn.connect(ctx.destination); osc.start(t); osc.stop(t + d + .02);
    }
    function noise(d, o = {}) {
      if (!on() || !ac()) return;
      const t = ctx.currentTime + (o.at || 0), n = Math.floor(ctx.sampleRate * d), buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), gn = ctx.createGain();
      src.buffer = buf; fl.type = o.type || 'lowpass'; fl.frequency.value = o.f || 800;
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .08, t + (o.rise || .03)); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      src.connect(fl); fl.connect(gn); gn.connect(ctx.destination); src.start(t);
    }
    const animal = {
      lion: () => { tone(150, .7, { type: 'sawtooth', to: 90, lp: 500, vib: 9, depth: 14, vol: .1 }); noise(.6, { f: 300, vol: .05 }); },
      elephant: () => tone(330, .7, { type: 'sawtooth', to: 620, lp: 1800, vib: 7, depth: 20, vol: .07 }),
      giraffe: () => tone(210, .45, { type: 'triangle', to: 180, vol: .1 }),
      sheep: () => tone(420, .6, { type: 'sawtooth', to: 380, lp: 1400, vib: 28, depth: 30, vol: .07 }),
      zebra: () => { tone(700, .45, { type: 'square', to: 950, lp: 1600, vib: 22, depth: 40, vol: .04 }); tone(900, .35, { type: 'square', to: 500, lp: 1400, vol: .04, at: .4 }); },
      bear: () => tone(110, .6, { type: 'triangle', to: 85, vib: 6, depth: 8, vol: .16 }),
      rabbit: () => { tone(1300, .08, { to: 1700, vol: .08 }); tone(1300, .08, { to: 1700, vol: .08, at: .12 }); },
      dove: () => { tone(520, .28, { to: 430, vol: .1 }); tone(480, .4, { to: 400, vol: .1, at: .32 }); }
    };
    return {
      animal: k => animal[k] && animal[k](),
      flip: () => noise(.12, { type: 'bandpass', f: 2200, vol: .05, rise: .01 }),
      match: (combo = 1) => [523, 659, 784, 1047].slice(0, 2 + Math.min(combo, 2)).forEach((f, i) => tone(f * (1 + (combo - 1) * .06), .18, { vol: .09, at: i * .08 })),
      miss: () => tone(260, .18, { type: 'triangle', to: 200, vol: .07 }),
      jump: () => tone(380, .2, { to: 760, vol: .07 }),
      bump: () => { tone(160, .2, { type: 'triangle', to: 90, vol: .12 }); },
      splash: () => noise(.35, { type: 'highpass', f: 1500, vol: .06 }),
      leaf: () => { tone(880, .1, { vol: .07 }); tone(1320, .14, { vol: .07, at: .07 }); },
      star: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .14, { vol: .07, at: i * .06 })),
      thunder: () => noise(2.2, { f: 140, vol: .12, rise: .35 }),
      wind: () => noise(1.8, { type: 'bandpass', f: 500, vol: .04, rise: .6 }),
      rain: () => noise(3, { type: 'highpass', f: 2500, vol: .025, rise: .5 }),
      door: () => { tone(120, .25, { type: 'triangle', vol: .14 }); noise(.2, { f: 400, vol: .06, at: .05 }); },
      win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, { vol: .08, at: i * .12 }))
    };
  })();

  function css() {
    if (document.getElementById('noah-css')) return;
    const st = document.createElement('style'); st.id = 'noah-css';
    st.textContent = `
      .noah-grid{display:grid;gap:clamp(6px,1.6vw,12px);max-width:min(100%,640px);margin:0 auto;width:100%;position:relative}
      .nx-s1{display:grid;gap:12px}.nx-s1a{display:grid;gap:12px;align-content:start;min-width:0}
      @media (orientation:landscape) and (max-height:520px){.nx-s1a .nx-scene{width:min(100%,260px)}.nx-s1a{gap:8px}.nx-s1 .noah-grid{width:min(calc((100vh - var(--gbh,44px) - 96px) * var(--ar,1)),calc(62vw - 40px))!important}}
      @media (orientation:landscape) and (min-width:700px){.nx-s1{grid-template-columns:minmax(0,1fr) auto;align-items:start}.nx-s1 .noah-grid{width:min(calc((100vh - var(--gbh,60px) - 150px) * var(--ar,1)),calc(62vw - 40px));max-width:none;margin:0}}
      .noah-card{display:block;width:100%;aspect-ratio:1;max-width:100%;border:0;padding:0;background:none;cursor:pointer;perspective:600px;font:inherit;position:relative}
      .noah-card .in{display:block;position:relative;width:100%;height:100%;transition:transform .4s cubic-bezier(.4,1.4,.6,1);transform-style:preserve-3d}
      .noah-card.up .in{transform:rotateY(180deg)}
      .noah-card .face{position:absolute;inset:0;border:3px solid var(--line);border-radius:14px;backface-visibility:hidden;display:grid;place-items:center;box-shadow:0 3px 0 var(--line)}
      .noah-card .back{background:radial-gradient(circle at 50% 40%,#C98B4A 0 30%,transparent 31%),repeating-linear-gradient(90deg,#A0612D 0 14px,#8B5224 14px 16px)}
      .noah-card .back svg{width:46%;transition:transform .2s}
      .noah-card:hover .back svg{transform:scale(1.08) rotate(-4deg)}
      .noah-card .front{background:radial-gradient(circle at 50% 35%,#FFFDF6,#FFEFD0);transform:rotateY(180deg)}
      .noah-card .front svg{width:78%;height:auto}
      .noah-card.up:not(.done) .front svg{animation:noahWig 1s ease-in-out infinite}
      @keyframes noahWig{25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
      .noah-card.done .front{background:radial-gradient(circle,#F0FFF5,#C9F0D8);border-color:var(--emerald)}
      .noah-card.done .front svg{animation:noahHop .6s cubic-bezier(.3,1.8,.5,1)}
      @keyframes noahHop{40%{transform:translateY(-14%) scale(1.15)}}
      .noah-card.done{cursor:default}
      .noah-card.done::after{content:"";position:absolute;inset:-10%;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#FFD447 0 8%,transparent 9%) 20% 20%/30% 30%,radial-gradient(circle,#FFD447 0 8%,transparent 9%) 80% 30%/26% 26%,radial-gradient(circle,#7ED957 0 8%,transparent 9%) 30% 85%/28% 28%,radial-gradient(circle,#FF8FA3 0 8%,transparent 9%) 85% 80%/24% 24%;background-repeat:no-repeat;animation:noahSpark .7s ease-out forwards}
      @keyframes noahSpark{from{transform:scale(.4);opacity:1}to{transform:scale(1.3);opacity:0}}
      .noah-card.peek .front{box-shadow:0 0 0 4px var(--gold)}
      .noah-card.nope .front{animation:shake .3s}
      .noah-rain{position:relative;height:16px;border:2px solid var(--line);border-radius:99px;background:var(--chip);overflow:hidden}
      .noah-rain span{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#5DA9F0,#1F55D6)}
      .nx-top{display:grid;gap:8px}
      .nx-stages{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
      .nx-stages span{font-size:12px;font-weight:800;text-align:center;padding:5px 4px;border-radius:10px;border:2px solid var(--line);background:var(--chip);line-height:1.15}
      .nx-stages span.on{background:var(--emerald);color:#fff}.nx-stages span.now{background:var(--amber);color:#13203A}
      .nx-score{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-variant-numeric:tabular-nums}
      .nx-pts{font-family:var(--display);font-size:24px;color:var(--sapphire)}
      .nx-pl{display:flex;gap:6px}.nx-pl span{padding:4px 10px;border-radius:999px;border:2px solid var(--line);background:var(--chip);font-size:14px}
      .nx-pl span.turn{background:var(--amber);color:#13203A;box-shadow:0 0 0 3px var(--gold)}
      .nx-scene{border:3px solid var(--line);border-radius:16px;overflow:hidden;line-height:0;position:relative}
      .nx-scene svg{width:100%;height:auto;display:block}
      .nx-scene .sky stop{transition:stop-color 1.2s}
      .nx-scene .clouds{transition:opacity 1.2s}
      .nx-scene .drift{animation:nxDrift var(--wind,40s) linear infinite}
      @keyframes nxDrift{from{transform:translateX(-120px)}to{transform:translateX(380px)}}
      .nx-scene .sway{animation:nxSway 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom}
      @keyframes nxSway{50%{transform:skewX(calc(var(--sway,4) * 1deg))}}
      .nx-scene .arrive{animation:nxArrive 1.6s cubic-bezier(.3,1.1,.5,1) both}
      @keyframes nxArrive{from{transform:translateX(-260px)}60%{transform:translateX(6px) translateY(-6px)}}
      .nx-scene .flash{animation:nxFlash 1s ease-out}
      @keyframes nxFlash{10%{opacity:.45}to{opacity:0}}
      .nx-scene .drops path{stroke:#D7ECFF;stroke-width:1.6;stroke-linecap:round;animation:naRain .8s linear infinite}
      @keyframes naRain{from{transform:translate(0,-20px);opacity:0}30%{opacity:1}to{transform:translate(-8px,120px);opacity:0}}
      .nx-scene .bob{animation:naBob 2.4s ease-in-out infinite}
      @keyframes naBob{50%{transform:translateY(4px) rotate(.8deg)}}
      .nx-scene .waves{animation:naWave 3s ease-in-out infinite alternate}.nx-scene .w2{animation-duration:2.2s}
      @keyframes naWave{to{transform:translateX(-24px)}}
      .nx-scene .water{transition:transform 1.6s ease-in-out}
      .nx-scene .fly{animation:naFly 2.6s ease-in-out forwards}
      @keyframes naFly{50%{transform:translate(150px,-60px)}100%{transform:translate(var(--fx,0px),var(--fy,0px))}}
      .nx-scene .glow{animation:naGlow 1.4s ease-in-out infinite;cursor:pointer}
      @keyframes naGlow{50%{opacity:.5}}
      .nx-scene .pop{animation:naPop .5s cubic-bezier(.3,1.6,.5,1) both;transform-box:fill-box;transform-origin:center}
      @keyframes naPop{from{transform:scale(0)}}
      .nx-scene .walkin{animation:nxIn 1.4s ease-in both;transform-box:fill-box;transform-origin:center}
      @keyframes nxIn{to{transform:translate(var(--dx),var(--dy)) scale(.3);opacity:0}}
      .nx-scene .doorgo{animation:nxDoor .9s cubic-bezier(.5,0,.3,1.3) both;transform-box:fill-box;transform-origin:left}
      @keyframes nxDoor{from{transform:scaleX(0)}}
      .nx-scene .tap{cursor:pointer}
      .nx-float{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-family:var(--display);font-size:clamp(22px,5vw,32px);color:#13203A;background:#FFD447;border:3px solid #13203A;border-radius:999px;padding:4px 16px;pointer-events:none;white-space:nowrap;z-index:3;animation:nxUp 1.1s ease-out forwards}
      @keyframes nxUp{from{transform:translate(-50%,-20%) scale(.6);opacity:0}25%{transform:translate(-50%,-50%) scale(1.08);opacity:1}to{transform:translate(-50%,-140%);opacity:0}}
      .nx-disc{background:#FFF8EA;color:#13203A;border:3px solid #A0612D;border-radius:16px;padding:12px 14px;display:grid;gap:10px;animation:fadeUp .3s}
      .nx-disc .k{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8B5224}
      .nx-disc .k button{font:inherit;font-size:13px;letter-spacing:0;text-transform:none;font-weight:800;border:2px solid #13203A;background:#fff;color:#13203A;border-radius:999px;padding:4px 10px;cursor:pointer}
      .nx-disc .fact{font-weight:700;font-size:17px;margin:0}.nx-disc .fact .ref{font-weight:800;color:#1F55D6;white-space:nowrap}
      .nx-disc .q{font-weight:800;font-size:18px;margin:0}
      .nx-disc .who{font-size:13px;font-weight:800;color:#7A3E9D}
      .nx-opts{display:grid;gap:8px}
      .nx-opt{font:inherit;font-weight:800;font-size:16px;text-align:left;padding:10px 14px;border-radius:14px;border:3px solid #13203A;background:#fff;color:#13203A;cursor:pointer;box-shadow:0 3px 0 #13203A}
      .nx-opt.ok{background:#DFF5E8;border-color:#14946B}.nx-opt.no{background:#FFE1E4}
      .nx-opt[disabled]{cursor:default}
      .nx-opt.hint{box-shadow:0 0 0 4px var(--gold),0 3px 0 #13203A}
      .nx-exp{font-weight:700;background:#fff;border-left:5px solid #14946B;border-radius:8px;padding:8px 10px;margin:0}
      .nx-skip{font:inherit;font-weight:800;background:none;border:0;color:#55627A;text-decoration:underline;cursor:pointer;justify-self:start;padding:4px 0}
      .nx-done{display:grid;gap:12px;text-align:center;justify-items:center;animation:fadeUp .3s}
      .nx-done h3{font-size:clamp(24px,5vw,32px)}
      .nx-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
      .nx-chip{font-weight:800;padding:6px 12px;border-radius:999px;background:var(--bg);border:2px solid var(--line)}
      .nx-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;width:100%;text-align:left}
      .nx-badge{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;padding:8px 10px;border-radius:14px;border:2px solid var(--line);background:var(--bg)}
      .nx-badge .i{font-size:26px}.nx-badge b{display:block;font-size:14px}.nx-badge small{display:block;font-size:12px;color:var(--muted);font-weight:700;line-height:1.25}
      .nx-badge.got{background:#FFF3C4;color:#13203A;border-color:#13203A}.nx-badge.got small{color:#55627A}
      .nx-badge.new{box-shadow:0 0 0 4px var(--gold);animation:naPop .5s cubic-bezier(.3,1.6,.5,1)}
      .nx-badge:not(.got){opacity:.6}.nx-badge:not(.got) .i{filter:grayscale(1)}
      .nx-mode{display:grid;gap:8px;padding:12px;border-radius:16px;background:var(--bg)}
      .nx-mode .row{gap:6px}
      .nx-best{font-weight:800;color:var(--muted);font-size:14px;margin:0}
      .nx-ctl{display:grid;grid-template-columns:1fr;gap:8px}
      .nx-hint{font-weight:700;color:var(--muted);font-size:14px;margin:0;text-align:center}
      .nx-turn{text-align:center;display:grid;gap:12px;justify-items:center;padding:12px}
      .nx-cmp{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
      .nx-cmp div{padding:10px;border-radius:14px;border:3px solid var(--line);background:var(--bg);font-weight:800}
      .nx-cmp div.win{background:#FFF3C4;color:#13203A;box-shadow:0 0 0 4px var(--gold)}
      .nx-cmp b{display:block;font-family:var(--display);font-weight:400;font-size:28px}
      .nx-pal{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
      .nx-pal button{width:52px;height:52px;border-radius:50%;border:3px solid var(--line);cursor:pointer;box-shadow:0 3px 0 var(--line)}
      .nx-pal button.no{animation:shake .3s}.nx-pal button.hint{box-shadow:0 0 0 5px var(--gold),0 3px 0 var(--line)}
      .nx-pal button[disabled]{opacity:.25;cursor:default}
      .nx-say{background:var(--bg);border-radius:14px;padding:12px 14px;font-weight:700;font-size:17px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start}
      .nx-say .ref{display:block;font-size:14px;color:var(--sapphire);font-weight:800;margin-top:2px}
      .nx-say button{font:inherit;font-size:13px;font-weight:800;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:4px 10px;cursor:pointer}
      .nx-think{background:#F3ECFF;color:#13203A;border:3px solid #7A3E9D;border-radius:16px;padding:12px 14px;display:grid;gap:8px}
      .nx-think .k{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7A3E9D}
      .nx-think .nx-opt{border-color:#7A3E9D;box-shadow:0 3px 0 #7A3E9D}
      .nx-think .nx-opt.pick{background:#FFF3C4}
      .stage.nx-wide{max-width:1200px}
      @media (orientation:landscape) and (max-height:600px){.stage.nx-wide{padding:8px;gap:8px;border-width:2px}.stage.nx-wide .nx-stages span{font-size:11px;padding:2px 4px}.stage.nx-wide .nx-top{gap:4px}.stage.nx-wide .nx-pts{font-size:20px}}
      .nx-run{position:relative;border:3px solid var(--line);border-radius:16px;overflow:hidden;line-height:0;touch-action:manipulation;user-select:none;-webkit-user-select:none;cursor:pointer;background:#8FD0FF;scroll-margin-top:calc(var(--gbh,60px) + 4px)}
      .nx-run canvas{width:100%;display:block}
      .nx-hud{position:absolute;left:8px;right:8px;top:8px;display:flex;gap:6px;align-items:center;pointer-events:none;line-height:1.2}
      .nx-prog{position:relative;flex:1;min-width:60px;height:18px;border:3px solid #13203A;border-radius:99px;background:rgba(255,255,255,.75);overflow:hidden}
      .nx-prog span{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#14946B,#7ED957);transition:width .2s linear}
      .nx-prog i{position:absolute;right:2px;top:50%;transform:translateY(-50%);font-style:normal;font-size:12px}
      .nx-pill{background:rgba(255,255,255,.92);color:#13203A;border:3px solid #13203A;border-radius:99px;padding:1px 9px;font-weight:800;font-size:clamp(13px,2.6vmin,18px);font-variant-numeric:tabular-nums;white-space:nowrap}
      .nx-jumpbtn{position:absolute;right:max(10px,2.2vmin);bottom:max(10px,2.2vmin);width:clamp(78px,19vmin,132px);height:clamp(78px,19vmin,132px);border-radius:50%;border:4px solid #13203A;background:#FFD447;color:#13203A;font:inherit;font-weight:800;font-size:clamp(28px,7vmin,48px);line-height:1;display:grid;place-content:center;justify-items:center;box-shadow:0 6px 0 #13203A;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;z-index:2}
      .nx-jumpbtn span{font-size:clamp(12px,2.8vmin,19px);letter-spacing:.06em}
      .nx-jumpbtn.down,.nx-jumpbtn:active{transform:translateY(5px);box-shadow:0 1px 0 #13203A}
      .nx-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(19,32,58,.4);padding:10px;line-height:1.4;cursor:default;z-index:3}
      .nx-intro .card{background:var(--surface);color:var(--ink);border:3px solid var(--line);border-radius:20px;padding:clamp(10px,2.6vmin,20px);display:grid;gap:8px;justify-items:center;text-align:center;width:min(460px,100%);max-height:100%;overflow:auto}
      .nx-intro h3{font-size:clamp(20px,4.6vmin,30px)}
      .nx-intro .how{display:flex;gap:clamp(6px,2vmin,14px);font-size:clamp(24px,6vmin,38px);line-height:1}
      .nx-intro .btn.big{font-size:clamp(18px,4vmin,24px)}
      .nx-intro small{font-size:12px}
      .nx-rot{display:none;align-items:center;gap:8px;font-weight:800;font-size:14px;background:#FFF3C4;color:#13203A;border:2px solid #13203A;border-radius:12px;padding:6px 10px;line-height:1.25;text-align:left}
      .nx-rot i{display:inline-block;font-style:normal;font-size:26px;animation:nxRot 2s ease-in-out infinite}
      @keyframes nxRot{35%,65%{transform:rotate(-90deg)}}
      @media (orientation:portrait) and (pointer:coarse){.nx-rot{display:flex}}
      .nx3{display:grid;gap:10px}
      .nx3-sc{position:relative;width:100%;max-width:calc((100dvh - var(--gbh,60px) - 20px) * 1.8);margin:0 auto;scroll-margin-top:calc(var(--gbh,60px) + 6px)}
      .nx3-sc .nx-scene svg{display:block;width:100%;height:auto}
      .nx3-side{display:grid;gap:10px;align-content:start}
      @media (orientation:landscape) and (min-width:600px){.nx3{grid-template-columns:minmax(0,1.7fr) minmax(230px,1fr);align-items:start}.nx3-sc{margin:0}.nx3-side{max-height:calc(100dvh - var(--gbh,60px) - 20px);overflow:auto;padding:2px}}
      .nx-cap{position:absolute;z-index:2;left:8px;right:8px;top:8px;display:flex;justify-content:center;pointer-events:none;line-height:1.25}
      .nx-cap>div{pointer-events:auto;background:rgba(255,255,255,.94);color:#13203A;border:3px solid #13203A;border-radius:16px;padding:5px 6px 5px 14px;font-weight:800;font-size:clamp(15px,3.4vmin,24px);display:flex;gap:4px 8px;align-items:center;flex-wrap:wrap;justify-content:center;text-align:center;animation:fadeUp .35s}
      .nx-cap small{font-size:.62em;color:#1F55D6;white-space:nowrap}
      .nx-cap button{font:inherit;font-size:16px;border:2px solid #13203A;background:#FFD447;border-radius:50%;width:34px;height:34px;cursor:pointer;line-height:1;flex:none}
      .nx-act{position:absolute;z-index:2;left:8px;right:8px;bottom:16px;display:flex;justify-content:center;pointer-events:none;line-height:1.2}
      .nx-act>*{pointer-events:auto}
      .nx-act .btn{font-size:clamp(16px,3.6vmin,24px);padding:clamp(8px,2vmin,14px) clamp(14px,3vmin,26px);animation:naPop .4s cubic-bezier(.3,1.6,.5,1)}
      .nx-act .btn.hint{box-shadow:0 0 0 5px var(--gold),0 4px 0 var(--line)}
      .nx-tip{background:rgba(19,32,58,.85);color:#fff;font-weight:800;border-radius:999px;padding:6px 14px;font-size:clamp(15px,3.2vmin,20px);pointer-events:none!important;animation:naGlow 1.4s ease-in-out infinite}
      .nx-act .nx-pal{background:rgba(255,255,255,.88);border:3px solid #13203A;border-radius:999px;padding:6px 10px;gap:6px;flex-wrap:nowrap}
      .nx-act .nx-pal button{width:clamp(34px,8vmin,50px);height:clamp(34px,8vmin,50px)}
      .nx-scene .lmove{transition:transform 1.8s ease-in-out}
      .nx-scene .lsun{opacity:0;transform:translateY(40px);transition:opacity 1.6s,transform 1.6s ease-out}.nx-scene .lsun.on{opacity:1;transform:none}
      .nx-scene .lcl{transition:transform 2.4s ease-in-out}
      .nx-scene .tree{transform:scale(0);transform-box:fill-box;transform-origin:bottom;transition:transform .8s cubic-bezier(.3,1.6,.5,1)}
      .nx-scene svg.trees .tree{transform:scale(1)}
      .nx-scene .flower{opacity:0;transform:scale(0);transform-box:fill-box;transform-origin:bottom;transition:transform .6s cubic-bezier(.3,1.6,.5,1),opacity .4s}
      .nx-scene svg.flowers .flower{opacity:1;transform:scale(1)}
      .nx-scene .lwind path{opacity:0}
      .nx-scene .lwind.go path{animation:nxWind 1.3s ease-out}
      @keyframes nxWind{from{opacity:.95;transform:translateX(0)}to{opacity:0;transform:translateX(460px)}}
      .nx-rot3{margin:0}
      .nx3-steps{position:absolute;z-index:1;left:12px;right:12px;bottom:5px;pointer-events:none;line-height:0}
      .nx3-steps .steps span{height:6px;border-width:1.5px}
      @media (orientation:landscape) and (min-width:600px){.nx3.solo{grid-template-columns:1fr}.nx3.solo .nx3-sc{margin:0 auto}.nx3.solo .nx3-side{display:none}}
      @media (orientation:portrait),(max-width:599px){
        .nx3-sc{display:flex;flex-direction:column;gap:8px}
        .nx3-sc .nx-cap,.nx3-sc .nx-act{position:static}
        .nx3-sc .nx3-steps{position:static}
        .nx3-sc .nx-act{min-height:52px;align-items:center}
        .nx3-sc .nx-tip{background:var(--ink);color:var(--surface)}
        .nx3-sc .nx-act .nx-pal{flex-wrap:wrap;border-radius:18px}
      }`;
    document.head.appendChild(st);
  }

  /* ---------- shared screen pieces ---------- */
  const pname = i => `Player ${i + 1}`;
  function top(stage) {
    const two = g.two, P = g.players;
    return `<div class="nx-top">
      <div class="nx-stages">${STAGES.map((s, i) => `<span class="${i < stage ? 'on' : i === stage ? 'now' : ''}">${i + 1}. ${s}</span>`).join('')}</div>
      <div class="nx-score"><span class="dpill ${g.diff}">${Ark.DLABEL[g.diff]}</span>
        ${two ? `<span class="nx-pl" id="nxPl">${P.map((p, i) => `<span class="${i === g.turn ? 'turn' : ''}">${pname(i)}: <b>${p.score}</b></span>`).join('')}</span>`
              : `<span>Score <span class="nx-pts" id="nxPts">${P[0].score}</span></span>`}
      </div></div>`;
  }
  function paintScore() {
    if (!g) return;
    if (g.two) { const b = $('#nxPl'); if (b) b.innerHTML = g.players.map((p, i) => `<span class="${i === g.turn ? 'turn' : ''}">${pname(i)}: <b>${p.score}</b></span>`).join(''); }
    else { const b = $('#nxPts'); if (b) b.textContent = g.players[0].score; }
  }
  function addPts(n, who = g.turn) { g.players[who].score += n; paintScore(); }
  function floatText(box, text) {
    if (!box) return;
    const f = document.createElement('div'); f.className = 'nx-float'; f.textContent = text;
    box.appendChild(f); setTimeout(() => f.remove(), 1200);
  }
  function sayBox(text, ref) {
    return `<div class="nx-say"><div>${text}${ref ? `<span class="ref">${ref}</span>` : ''}</div>${Ark.canSpeak ? `<button type="button" data-say="${Ark.esc(text.replace(/<[^>]+>/g, ''))}">${Ark.UI.listen ? '🔊' : ''} Listen</button>` : ''}</div>`;
  }
  function wireSay(root) { root.querySelectorAll('[data-say]').forEach(b => (b.onclick = () => say(b.dataset.say, true))); }

  /* Begin a stage: remembers the scores so Restart Stage puts them back exactly as they were. */
  function begin(stage, fn) {
    g.stage = stage;
    el.classList.toggle('nx-wide', stage >= 1);
    g.snap = JSON.stringify({ players: g.players, stats: g.stats, turn: g.turn });
    g.restartStage = () => { if (!g) return; clearTimers(); g.loop = false; const s = JSON.parse(g.snap); Object.assign(g, s); hush(); fn(); };
    fn();
  }
  const ctlFor = (o = {}) => Ark.ctl({ restart: () => g && g.restartStage(), pause: o.pause || (() => {}), resume: o.resume || (() => {}), help: o.help || null });

  /* Bible Discovery: a short fact and one question. One try, a simple explanation, then carry on. Skip is always there. */
  function discovery(box, d, then) {
    const two = g.two, who = two ? g.qTurn : 0;
    if (two) g.qTurn = 1 - g.qTurn;
    box.insertAdjacentHTML('beforeend', `<div class="nx-disc" id="nxDisc">
      <div class="k"><span>📜 Bible Discovery</span>${Ark.canSpeak ? '<button type="button" id="nxDl">🔊 Read it to me</button>' : ''}</div>
      <p class="fact">${d.fact} <span class="ref">${d.ref}</span></p>
      ${two ? `<span class="who">${pname(who)}, this one is for you!</span>` : ''}
      <p class="q">${d.q}</p>
      <div class="nx-opts">${shuf(d.opts.map((o, i) => [o, i])).map(([o, i]) => `<button class="nx-opt" data-i="${i}">${o.t}</button>`).join('')}</div>
      <button class="nx-skip" id="nxSkip">Skip for now</button></div>`);
    const disc = box.querySelector('#nxDisc'); disc.removeAttribute('id');
    const read = () => say(`${d.fact} ${d.q} ${d.opts.map(o => o.t).join('? Or, ')}?`, true);
    const rb = disc.querySelector('#nxDl'); if (rb) { rb.removeAttribute('id'); rb.onclick = read; }
    if (g.diff === 'easy' && Ark.voiceOn()) read();
    g.stats.asked++;
    const btns = [...disc.querySelectorAll('.nx-opt')], skip = disc.querySelector('#nxSkip'); skip.removeAttribute('id');
    const done = () => { btns.forEach(b => (b.disabled = true)); skip.remove(); g.discHelp = null; then(); };
    g.discHelp = () => { const r = btns.find(b => d.opts[+b.dataset.i].ok); if (r) r.classList.add('hint'); };
    btns.forEach(b => (b.onclick = () => {
      const ok = d.opts[+b.dataset.i].ok;
      b.classList.add(ok ? 'ok' : 'no');
      if (!ok) btns.find(x => d.opts[+x.dataset.i].ok).classList.add('ok');
      if (ok) { g.stats.right++; addPts(200, who); SFX.star(); floatText(disc, '+200'); } else { g.stats.wrong++; SFX.miss(); }
      const exp = (ok ? '✓ ' : 'The answer is: ' + d.opts.find(o => o.ok).t + '. ') + d.exp;
      disc.insertAdjacentHTML('beforeend', `<p class="nx-exp">${exp}</p>`);
      if (g.diff !== 'hard') say(exp);
      done();
    }));
    skip.onclick = () => { g.stats.skipped++; done(); };
    disc.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function nextBtn(box, label, fn) {
    box.insertAdjacentHTML('beforeend', `<div class="row" style="justify-content:center"><button class="btn big" data-next>${label} ${Ark.UI.play}</button></div>`);
    const b = [...box.querySelectorAll('[data-next]')].pop();
    b.onclick = () => { b.disabled = true; SFX.flip(); fn(); };
    b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return b;
  }

  /* ---------- menu ---------- */
  function menu() {
    stop(); el.classList.remove('nx-wide');
    const o = opt(), best = Ark.storeJSON('noah-best') || {}, got = Ark.storeJSON('noah-badges') || {};
    Ark.menu(el, {
      id: 'noahs-ark', title: 'Noah’s Ark Animal Match', icon: 'ark', color: '#FFD36B',
      blurb: 'Match. Rescue. Discover God’s Promise.',
      how: [['flip', '1. Match the animal pairs'], ['jump', '2. Guide them to the ark'], ['scroll', '3. Discover God’s promise']],
      listen: 'Three stages! First, flip the cards and match the animals, two by two. Next, lead the animals to the ark: tap to jump over logs, rocks and streams, and collect olive leaves. Last, watch what God did for Noah, and find out what the rainbow means.',
      diffs: {
        easy: '4 pairs. A slow, gentle path with jump signs. Lots of help.',
        normal: '6 pairs. Faster path with streams to jump. A few hints.',
        hard: '8 pairs. Fast path, tall hedges, no hints. Beat the rain!'
      },
      extra: `<div class="nx-mode">
        <b>Players</b>
        <div class="row" role="group" aria-label="Players"><button class="chip" data-two="0" aria-pressed="${!o.two}">👤 1 player</button><button class="chip" data-two="1" aria-pressed="${o.two}">👥 2 players (take turns)</button></div>
        <label class="row" style="font-weight:700"><input type="checkbox" id="nxTimed" ${o.timed ? 'checked' : ''}> ⏱ Timed challenge on Hard: match all the pairs before the rain</label>
        <p class="nx-best">${['easy', 'normal', 'hard'].map(d => `${Ark.DLABEL[d]} best: ${best[d] || '—'}`).join(' · ')} · Badges: ${Object.keys(got).length} of ${Object.keys(BADGES).length}</p>
      </div>`,
      afterRender: s => {
        s.querySelectorAll('[data-two]').forEach(b => (b.onclick = () => {
          const v = Ark.storeJSON('noah-opts') || opt(); v.two = b.dataset.two === '1'; Ark.storeJSON('noah-opts', v);
          s.querySelectorAll('[data-two]').forEach(x => x.setAttribute('aria-pressed', x === b));
        }));
        s.querySelector('#nxTimed').onchange = e => { const v = Ark.storeJSON('noah-opts') || opt(); v.timed = e.target.checked; Ark.storeJSON('noah-opts', v); };
      },
      start: d => play(d)
    });
  }

  function play(diff) {
    stop();
    const o = opt();
    g = { diff, C: D[diff], two: !!o.two, timed: diff === 'hard' && o.timed !== false, turn: 0, qTurn: 0,
      players: (o.two ? [0, 1] : [0]).map(() => ({ score: 0, bumps: 0, leaves: 0, stars: 0, combo: 0 })),
      stats: { tries: 0, helps: 0, bestCombo: 0, asked: 0, right: 0, wrong: 0, skipped: 0, leafTotal: 0 },
      rescued: [], stage: 0, timers: [] };
    begin(0, stage1);
  }

  /* ================= STAGE 1: Find the Animals (the original match game, upgraded) ================= */
  function scene1() {
    // Meadow with the ark far away on the hill. Weather is set by weather1().
    return `<svg viewBox="0 0 360 140" role="img" aria-label="A sunny meadow. The ark waits on a far hill. Rescued animals gather here.">
      <defs><linearGradient id="nxSky" class="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0FF"/><stop offset="1" stop-color="#FFF1C9"/></linearGradient></defs>
      <rect width="360" height="140" fill="url(#nxSky)"/>
      <g id="nxSun"><circle cx="40" cy="30" r="16" fill="#FFD447" stroke="${ink}" stroke-width="2.5"/></g>
      <path d="M200 92q60-40 160-30V140H200z" fill="#8FC57A" stroke="${ink}" stroke-width="2"/>
      <g transform="translate(276 44) scale(.42)">${Ark.G.ark.replace('<svg ', '<svg width="120" height="100" ')}</g>
      <g class="clouds" id="nxClouds" style="opacity:.35">
        ${[[0, 10, 1], [120, 24, .8], [230, 6, 1.1], [60, 40, .7]].map(([x, y, s], i) => `<g class="drift" style="animation-delay:-${i * 9}s"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 20a12 12 0 0112-12 16 16 0 0130-2 11 11 0 0110 18z" fill="#fff" stroke="${ink}" stroke-width="2"/></g></g>`).join('')}
      </g>
      <path d="M0 108q90-16 180-4t180-6V140H0z" fill="#7CC36A" stroke="${ink}" stroke-width="2.5"/>
      <g>${Array.from({ length: 14 }, (_, i) => `<path class="sway" d="M${8 + i * 26} 122l3-10 3 10" stroke="#3E7B39" stroke-width="2.5" fill="none" style="animation-delay:-${i * .13}s"/>`).join('')}</g>
      <g id="nxHerd"></g>
      <g class="drops" id="nxDrops" style="display:none">${Array.from({ length: 22 }, (_, i) => `<path d="M${(i * 41) % 360} ${(i * 17) % 60}l-5 12" style="animation-delay:${(i % 8) * .1}s"/>`).join('')}</g>
      <rect id="nxFlash" width="360" height="140" fill="#fff" opacity="0" pointer-events="none"/>
    </svg>`;
  }
  // p = how far through the mission (0 to 1). Sunshine → wind → clouds → distant thunder → light rain.
  function weather1(p, sound) {
    const sc = $('.nx-scene'); if (!sc) return;
    const sky = sc.querySelectorAll('.sky stop');
    const mix = (a, b, t) => '#' + [0, 2, 4].map(i => Math.round(parseInt(a.substr(i + 1, 2), 16) * (1 - t) + parseInt(b.substr(i + 1, 2), 16) * t).toString(16).padStart(2, '0')).join('');
    const t = Math.max(0, (p - .35) / .65);
    if (sky[0]) { sky[0].setAttribute('stop-color', mix('#8FD0FF', '#7D8AA3', t)); sky[1].setAttribute('stop-color', mix('#FFF1C9', '#C9CDD6', t)); }
    sc.querySelector('#nxClouds').style.opacity = String(.35 + Math.min(1, p * 1.3) * .65);
    sc.style.setProperty('--wind', (p < .25 ? 40 : p < .5 ? 22 : 14) + 's');
    sc.style.setProperty('--sway', p < .25 ? 3 : 9);
    sc.querySelector('#nxSun').style.opacity = String(Math.max(.15, 1 - t));
    if (sound && p >= .25 && !g.windDone) { g.windDone = 1; SFX.wind(); }
    if (p >= .75 && !g.thunderDone) { g.thunderDone = 1; const f = sc.querySelector('#nxFlash'); f.classList.remove('flash'); void f.getBoundingClientRect(); f.classList.add('flash'); if (sound) setTimeout(SFX.thunder, 300); }
    sc.querySelector('#nxDrops').style.display = p >= .9 ? '' : 'none';
  }
  function herdAdd(k, n) {
    const herd = $('#nxHerd'); if (!herd) return;
    const i = n - 1, col = i % 4, row = Math.floor(i / 4);
    const x = 96 + col * 50 + row * 18, y = 92 + row * 16;
    herd.insertAdjacentHTML('beforeend', `<g class="arrive"><svg x="${x}" y="${y - 4}" width="28" height="28" viewBox="0 0 60 60">${ANIMALS[k].s}</svg><svg x="${x + 20}" y="${y - 2}" width="28" height="28" viewBox="0 0 60 60">${ANIMALS[k].s}</svg></g>`);
  }

  function stage1() {
    const { diff, C } = g;
    const picks = shuf(Object.keys(ANIMALS)).slice(0, C.pairs);
    const deck = shuf([...picks, ...picks]);
    Object.assign(g, { open: [], tries: 0, matched: 0, lock: true, helps: 0, left: C.time, running: false, last: 0, raf: 0, windDone: 0, thunderDone: 0, rescued: [] });
    g.players.forEach(p => (p.combo = 0));
    el.innerHTML = `${top(0)}
      <div class="nx-s1"><div class="nx-s1a">
      <div class="nx-scene">${scene1()}</div>
      <div class="hud"><span id="rescued">🐾 Animals rescued: 0 of ${C.pairs * 2}</span><span id="tries">Tries: 0</span></div>
      <div id="nBar">${bar(0, `Pairs found: 0 of ${C.pairs}`)}</div>
      ${g.timed ? `<div><div class="noah-rain"><span id="rain" style="width:100%"></span></div><p style="margin:4px 0 0;font-weight:800;font-size:13px;color:var(--muted)" id="rainTxt">Before the rain: ${C.time}s</p></div>` : ''}
      <div id="nLearn"></div></div>
      <div class="noah-grid" id="grid" style="grid-template-columns:repeat(${C.cols},1fr);--ar:${(C.cols / ((C.pairs * 2) / C.cols)).toFixed(3)}">
        ${deck.map((k, i) => `<button class="noah-card" data-k="${k}" aria-label="Card ${i + 1}, face down"><span class="in"><span class="face back">${Ark.G.ark}</span><span class="face front">${svg(k)}</span></span></button>`).join('')}
      </div></div>`;
    weather1(0);
    const cards = [...el.querySelectorAll('.noah-card')];
    cards.forEach(card => (card.onclick = () => flip(card)));
    const go = () => {
      g.lock = false;
      learn($('#nLearn'), g.two ? `${pname(g.turn)}, your turn! Find a pair to keep your turn.` : 'Tap two cards to find a pair.', '');
      if (g.timed) { g.running = true; g.last = performance.now(); g.raf = requestAnimationFrame(tick); }
    };
    if (C.peek) {
      cards.forEach(c => c.classList.add('up'));
      learn($('#nLearn'), 'Look carefully! Remember where the animals are.', '', { speak: true, icon: Ark.I.ear });
      later(() => { cards.forEach(c => c.classList.remove('up')); go(); }, C.peek);
    } else go();
    ctlFor({
      help: diff === 'hard' ? null : () => {
        if (!g || g.lock) return;
        if (g.helps >= C.helps) { Ark.toast('No hints left. You can do it!'); return; }
        const k = cards.find(c => !c.classList.contains('done') && !c.classList.contains('up'))?.dataset.k;
        if (!k) return;
        g.helps++; g.stats.helps++;
        const pair = cards.filter(c => c.dataset.k === k && !c.classList.contains('done'));
        pair.forEach(c => c.classList.add('peek', 'up')); g.lock = true;
        say('Here is a pair of ' + ANIMALS[k].pl, true);
        if (C.helps < 99) Ark.toast(`Hint used: ${C.helps - g.helps} left`);
        later(() => { pair.forEach(c => { if (!c.classList.contains('done')) c.classList.remove('up'); c.classList.remove('peek'); }); g.lock = false; }, 1300);
      },
      pause: g.timed ? () => { if (g) g.running = false; } : null,
      resume: g.timed ? () => { if (g) { g.running = true; g.last = performance.now(); } } : null
    });
  }

  function tick(now) {
    if (!g || g.stage !== 0) return;
    if (g.running) {
      g.left -= (now - g.last) / 1000;
      const r = $('#rain'), t = $('#rainTxt');
      if (r) r.style.width = Math.max(0, g.left / g.C.time * 100) + '%';
      if (t) t.textContent = g.left > 0 ? `Before the rain: ${Math.ceil(g.left)}s` : 'The rain is starting!';
      if (g.left <= 0) { g.running = false; return lose(); }
    }
    g.last = now; g.raf = requestAnimationFrame(tick);
  }

  function flip(card) {
    if (!g || g.lock || card.classList.contains('up')) return;
    const k = card.dataset.k;
    card.classList.add('up'); card.setAttribute('aria-label', ANIMALS[k].n);
    SFX.flip();
    if (g.diff !== 'hard') say(ANIMALS[k].n);
    g.open.push(card);
    if (g.open.length < 2) return;
    g.tries++; g.stats.tries++; $('#tries').textContent = 'Tries: ' + g.tries;
    const [a, b] = g.open; g.open = [];
    const P = g.players[g.turn];
    if (a.dataset.k === b.dataset.k) {
      a.classList.add('done'); b.classList.add('done');
      [a, b].forEach(c => c.setAttribute('aria-label', ANIMALS[k].n + ', rescued'));
      P.combo++; g.stats.bestCombo = Math.max(g.stats.bestCombo, P.combo);
      const pts = 100 + (P.combo - 1) * 50;
      addPts(pts);
      floatText($('#grid'), P.combo > 1 ? `Combo x${P.combo}! +${pts}` : `+${pts}`);
      later(() => SFX.animal(k), 120); later(() => SFX.match(P.combo), 650);
      const [t, r] = STORY[g.matched % STORY.length];
      g.matched++; g.rescued.push(k);
      herdAdd(k, g.matched);
      $('#rescued').textContent = `🐾 Animals rescued: ${g.matched * 2} of ${g.C.pairs * 2}`;
      setBar($('#nBar .pbar'), g.matched / g.C.pairs, `Pairs found: ${g.matched} of ${g.C.pairs}`);
      weather1(g.matched / g.C.pairs * .6, true);
      learn($('#nLearn'), `Two ${ANIMALS[k].pl}! ${t}`, r, { speak: g.diff !== 'hard', icon: Ark.I.scroll });
      if (g.matched === g.C.pairs) { g.running = false; g.lock = true; later(stage1Done, 1600); }
    } else {
      g.lock = true; P.combo = 0; SFX.miss();
      [a, b].forEach(c => { c.classList.remove('nope'); void c.offsetWidth; c.classList.add('nope'); });
      if (g.tries === 2 && g.diff === 'easy' && !g.two) learn($('#nLearn'), 'Not a pair. Try to remember where each animal is!', '');
      later(() => {
        [a, b].forEach(c => { c.classList.remove('up', 'nope'); c.setAttribute('aria-label', 'Card, face down'); });
        if (g.two) { g.turn = 1 - g.turn; paintScore(); learn($('#nLearn'), `${pname(g.turn)}, your turn!`, '', { speak: true }); }
        g.lock = false;
      }, 900);
    }
  }

  function stage1Done() {
    const { C } = g, box = el.querySelector('.noah-grid');
    if (g.timed) addPts(Math.ceil(g.left) * 5, g.two ? g.turn : 0);
    if (g.tries <= C.pairs + 2) g.earn = Object.assign(g.earn || {}, { memory: 1 });
    if (g.stats.bestCombo >= 3) g.earn = Object.assign(g.earn || {}, { combo: 1 });
    box.outerHTML = `<div class="nx-done" id="nxD1"><h3>🐾 All ${C.pairs * 2} animals found!</h3>
      <div class="nx-chips"><span class="nx-chip">Tries: ${g.tries}</span><span class="nx-chip">Best combo: x${g.stats.bestCombo}</span>${g.timed ? `<span class="nx-chip">Beat the rain with ${Math.ceil(g.left)}s left (+${Math.ceil(g.left) * 5})</span>` : ''}</div></div>`;
    $('.noah-rain')?.parentElement.remove();
    const d1 = $('#nxD1');
    $('#nLearn').innerHTML = '';
    SFX.win();
    discovery(d1, {
      ref: 'Genesis 6:19–20', fact: 'God told Noah that the animals would come to him in pairs, “two of every sort”.',
      q: 'How many animals are in a pair?',
      opts: [{ t: 'Two', ok: true }, { t: 'One' }, { t: 'Ten' }],
      exp: g.diff === 'hard' ? 'A pair is two. Look closer: Genesis 7:2 says Noah took seven of some animals, the “clean” ones, too!' : 'A pair is two, a male and a female, so new baby animals could be born after the flood.'
    }, () => nextBtn(d1, 'Stage 2: Guide them to the ark', () => begin(1, stage2)));
    ctlFor({ help: g.diff === 'hard' ? null : () => g.discHelp && g.discHelp() });
  }

  function lose() {
    const diff = g.diff, m = g.matched, n = g.C.pairs;
    clearTimers(); cancelAnimationFrame(g.raf);
    g.lock = true;
    el.querySelector('.noah-grid').outerHTML = `<div class="fin"><h2>The rain is starting!</h2>
      <p class="story">You found ${m} of ${n} pairs. So close! Try again a little faster.</p>
      <div class="lesson" style="text-align:left">God gave Noah seven days to bring the animals in before the rain (Genesis 7:4). Noah got them all in on time!</div>
      <div class="row"><button class="btn big" id="ag">${Ark.UI.restart} Try again</button><button class="btn ghost" id="noTime">Play without the timer</button><button class="btn ghost" id="ch">Change difficulty</button></div>
      <a class="btn more big" href="#home">${Ark.UI.grid} More Games</a></div>`;
    $('#ag').onclick = () => g.restartStage();
    $('#noTime').onclick = () => { g.timed = false; g.restartStage(); };
    $('#ch').onclick = menu;
    ctlFor();
    void diff;
  }

  if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); };
  /* ================= STAGE 2: Guide Them to the Ark (runner) =================
     Noah runs on his own; tap, Space or the Jump button to jump. The rescued animals follow and copy his jumps.
     Bumping into something never ends the game: everyone just slows down for a moment. */
  let W = 540, PX = 210, OY = 0;   // OY = extra sky above the path on tall (portrait) screens
  const H = 270, GROUND = 222;
  function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function course(C, seed) {
    const r = rng(seed), items = [], bonus = [], jh = C.jump * C.jump / (2 * C.grav);
    let x = 700;
    while (x < C.len) {
      const type = C.obs[Math.floor(r() * C.obs.length)];
      let mid = x;
      if (type === 'double') { items.push({ type: 'log', x, w: 44, h: 20 }); items.push({ type: 'rock', x: x + 250, w: 34, h: 30 }); mid = x + 22; x += 284; }
      else if (type === 'stream') { items.push({ type, x, w: C.stream, h: 0 }); mid = x + C.stream / 2; x += C.stream; }
      else if (type === 'hedge') { items.push({ type, x, w: 30, h: 46 }); mid = x + 15; x += 30; }
      else if (type === 'log') { items.push({ type, x, w: 46, h: 22 }); mid = x + 23; x += 46; }
      else { items.push({ type: 'rock', x, w: 34, h: 30 }); mid = x + 17; x += 34; }
      const gap = C.gap[0] + r() * (C.gap[1] - C.gap[0]);
      const roll = r();
      if (roll < .45) bonus.push({ type: 'leaf', x: mid, y: GROUND - jh + 14 });          // over the obstacle: jump to get it
      else if (roll < .8) bonus.push({ type: 'leaf', x: x + gap / 2, y: GROUND - 26 }); // on the path
      else if (roll < .9) bonus.push({ type: 'star', x: mid, y: GROUND - jh - 4 });
      x += gap;
    }
    return { items, bonus, end: Math.max(x, C.len) + 300 };
  }
  const imgCache = {};
  function animalImg(k) {
    if (!imgCache[k]) { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">${ANIMALS[k].s}</svg>`); imgCache[k] = i; }
    return imgCache[k];
  }

  function stage2() {
    if (g.keyH) removeEventListener('keydown', g.keyH);
    if (g.resH) removeEventListener('resize', g.resH);
    g.seed = g.seed || Math.floor(Math.random() * 1e9);
    g.runP = 0; g.runs = []; g.turn = 0;
    el.innerHTML = `${top(1)}
      <div class="nx-run" id="nxRun">
        <canvas id="nxCv" aria-label="Noah leads the animals along the path to the ark. Tap to jump."></canvas>
        <div class="nx-hud" id="nxHud"></div>
        <button type="button" class="nx-jumpbtn" id="nxJump" hidden aria-label="Jump">⬆<span>JUMP</span></button>
        <div class="nx-intro" id="nxIntro"></div>
      </div>
      <div class="nx-ctl" id="nxCtl"></div>`;
    g.resH = () => { if (g && g.stage === 1) { fitRun(); if (!g.loop) draw(); } };
    addEventListener('resize', g.resH);
    intro();
  }
  /* Size the game to the screen: as big as fits under the game bar. Everything is drawn in game units and scaled,
     so animals, obstacles and the ark stay in proportion on any screen. Narrow (portrait) screens keep at least
     480 units of path in view so there is still time to see what is coming. */
  function fitRun() {
    const box = $('#nxRun'), cv = $('#nxCv'); if (!box || !cv) return;
    const gb = document.querySelector('.gbar'), gbh = gb ? gb.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--gbh', gbh + 'px');
    const cw = box.clientWidth, avail = Math.max(200, innerHeight - gbh - 14);
    let ch, sc;
    OY = 0;
    if (cw < avail * .9) {        // upright phone or tablet: zoom in a little and show extra sky above the path
      W = cw < 600 ? 380 : 480; sc = cw / W; ch = Math.min(avail, cw * (cw < 600 ? 1.25 : .9)); OY = Math.max(0, ch / sc - H);
    } else {
      ch = Math.min(avail, cw * .56); sc = ch / H; W = cw / sc;
      if (W < 480) { W = 480; sc = cw / W; ch = H * sc; }
    }
    PX = Math.round(W < 420 ? 150 : Math.min(260, Math.max(200, W * .34)));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.style.height = ch + 'px';
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    g.ctx = cv.getContext('2d'); g.ctx.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0);
  }
  const fill = () => { const b = $('#nxRun'); if (b) b.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  function hud() {
    const r = g.r; if (!r) return;
    $('#nxHud').innerHTML = `<div class="nx-prog" aria-hidden="true"><span id="nxProg" style="width:0"></span><i>🚪</i></div>
      <span class="nx-pill">🌿 <b id="nxLv">${r.leaves}</b>/${r.leafTotal}</span><span class="nx-pill">⭐ <b id="nxSt">${r.stars}</b></span>
      <span class="nx-pill">${g.two ? pname(g.runP) : 'Score'} <b id="nxHs">${g.players[g.runP].score}</b></span>`;
  }
  function intro() {
    const p = g.runP; g.turn = p; paintScore();
    g.loop = false; setupRun(); hud(); draw(0);
    $('#nxJump').hidden = true;
    const box = $('#nxIntro'); box.hidden = false;
    box.innerHTML = `<div class="card">
      <h3>${g.two ? `${pname(p)}, your run!` : 'Lead the animals to the ark!'}</h3>
      <div class="how" aria-hidden="true"><span>👆</span><span>⬆</span><span>🪵</span><span>🪨</span><span>🌊</span><span>🌿</span></div>
      <p class="nx-hint" style="font-size:16px;color:var(--ink)"><b>Tap to jump!</b> Collect 🌿 and ⭐.</p>
      <div class="nx-rot"><i>📱</i> Turn your phone sideways for a bigger game!</div>
      <button class="btn big" id="nxGo">${Ark.UI.play} Start</button>
      <small class="nx-hint">God brought the animals to Noah (Genesis 7:9). Help them along!</small></div>`;
    $('#nxGo').onclick = () => { SFX.flip(); startRun(); };
    fill();
    if (g.diff === 'easy') say('Tap to jump! Collect the olive leaves and stars.');
    ctlFor({ help: g.diff === 'hard' ? null : () => { if (!g.r) return; g.r.hint = true; g.stats.helps++; Ark.toast('Jump signs are on!'); } });
  }
  function setupRun() {
    const C = g.C, c = course(C, g.seed);   // same path for both players, so it’s fair
    g.r = { c, wx: 0, py: GROUND, vy: 0, t: 0, inv: 0, slow: 0, hist: [], bumps: 0, leaves: 0, stars: 0, pts: 0,
      leafTotal: c.bonus.filter(b => b.type === 'leaf').length, done: false, hint: C.hint, jq: -1, flashed: 0, rained: 0, phase: 0, flash: 0, started: false,
      parts: [], pops: [], board: null,
      clouds: Array.from({ length: 9 }, (_, i) => ({ x: i * 120 + 30 * Math.sin(i * 7), y: 18 + (i * 37) % 60, s: .7 + (i % 3) * .2 })) };
    c.items.forEach(o => (o.hit = false)); c.bonus.forEach(b => (b.got = false));
    fitRun();
    g.rescued.forEach(animalImg);
  }
  function jump() {
    const r = g && g.r; if (!r || !r.started || r.done || g.paused) return;
    r.jq = r.t;   // remember the tap for a moment, so a slightly early tap still works
  }
  function startRun() {
    const r = g.r; r.started = true;
    $('#nxIntro').hidden = true; $('#nxIntro').innerHTML = '';
    const jb = $('#nxJump'); jb.hidden = false;
    jb.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); jb.classList.add('down'); jump(); };
    jb.onpointerup = jb.onpointerleave = () => jb.classList.remove('down');
    jb.onclick = e => { if (e.detail === 0) jump(); };   // keyboard users
    $('#nxRun').onpointerdown = e => { if (e.target.closest('.nx-intro')) return; e.preventDefault(); jump(); };
    g.keyH = e => { if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key) && g && g.stage === 1) { e.preventDefault(); jump(); } };
    addEventListener('keydown', g.keyH);
    fill();
    g.loop = true; g.paused = false; g.last = performance.now();
    const id = g.runId = (g.runId || 0) + 1;
    const frame = now => {
      if (!g || !g.loop || g.runId !== id) return;
      const dt = Math.min(.05, (now - g.last) / 1000); g.last = now;
      if (!g.paused) { step(dt); draw(dt); }
      if (g && g.loop && g.runId === id) g.raf = requestAnimationFrame(frame);
    };
    g.raf = requestAnimationFrame(frame);
    ctlFor({
      pause: () => { if (g) g.paused = true; },
      resume: () => { if (g) { g.paused = false; g.last = performance.now(); } },
      help: g.diff === 'hard' ? null : () => { if (!g.r || g.r.hint) return; g.r.hint = true; g.stats.helps++; Ark.toast('Jump signs are on!'); }
    });
  }

  /* Boarding: when Noah reaches the ramp, the animals walk up into the ark one at a time.
     Each one gets its own sound, a sparkle burst at the door, +25 points and a face in the window. */
  const BOARD_T = .8;
  const doorPos = r => [r.c.end - r.wx - 4, GROUND - 76];
  function burst(px, py, n = 16) {
    const cols = ['#FFD447', '#7ED957', '#FF8FA3', '#5DA9F0', '#FFFFFF'];
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 160; g.r.parts.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90, life: 1, c: cols[i % cols.length], star: i % 3 === 0 }); }
  }
  function boardStep(dt) {
    const r = g.r, B = r.board, n = g.rescued.length;
    if (!B || B.end) return;
    B.t += dt;
    if (B.i < n && B.t >= BOARD_T) {
      const k = g.rescued[B.i], [dx, dy] = doorPos(r);
      SFX.animal(k); setTimeout(() => SFX.leaf(), 120);
      burst(dx, dy); addPts(25, g.runP);
      r.pops.push({ x: dx, y: dy - 30, t: 0, txt: `+25` });
      B.i++; B.t = 0;
    }
    if (B.i >= n && B.t > .3) {
      B.end = true; SFX.win();
      const [dx, dy] = doorPos(r); burst(dx, dy - 20, 40); burst(dx + 110, dy - 30, 30);
      r.pops.push({ x: dx + 60, y: dy - 70, t: 0, txt: 'Everyone is on board!', big: true });
      later(finishRun, 1700);
    }
  }

  function step(dt) {
    const r = g.r, C = g.C;
    r.t += dt;
    boardStep(dt);
    r.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 380 * dt; q.life -= dt * 1.1; }); r.parts = r.parts.filter(q => q.life > 0);
    r.pops.forEach(q => (q.t += dt)); r.pops = r.pops.filter(q => q.t < (q.big ? 2.2 : 1.1));
    const onGround = r.py >= GROUND - .5 && !overStream(r);
    if (r.jq >= 0 && r.t - r.jq < .16 && onGround && !r.done) { r.vy = -C.jump; r.jq = -1; SFX.jump(); }
    if (r.jq >= 0 && r.t - r.jq >= .16) r.jq = -1;
    r.vy += C.grav * dt; r.py += r.vy * dt;
    if (r.py >= GROUND) { r.py = GROUND; r.vy = 0; }
    r.inv = Math.max(0, r.inv - dt); r.slow = Math.max(0, r.slow - dt); r.flash = Math.max(0, r.flash - dt);
    const ramp = Math.min(1, r.t / .8);
    let sp = C.speed * ramp * (r.slow > 0 ? .45 : 1);
    const toArk = r.c.end - 90 - (r.wx + PX);
    if (toArk < 160) sp *= Math.max(.25, toArk / 160);
    if (!r.done) { r.wx += sp * dt; r.phase += sp * dt * .05; }
    r.hist.push([r.wx, r.py]); if (r.hist.length > 900) r.hist.shift();
    // obstacles
    for (const o of r.c.items) {
      if (o.hit) continue;
      const sx = o.x - r.wx;
      if (sx > PX + 14 || sx + o.w < PX - 14) continue;
      const hit = o.type === 'stream' ? (r.py >= GROUND - 1 && sx < PX - 6 && sx + o.w > PX + 6) : (r.py > GROUND - o.h + 3);
      if (hit && r.inv <= 0) {
        o.hit = true; r.bumps++; r.inv = 1.2; r.slow = .9;
        if (o.type === 'stream') { SFX.splash(); floatText($('#nxRun'), 'Splash! Keep going'); } else { SFX.bump(); floatText($('#nxRun'), 'Oops! Keep going'); }
        if (r.py >= GROUND - 1 && o.type !== 'stream') r.vy = -260;
      }
    }
    // olive leaves and stars
    for (const b of r.c.bonus) {
      if (b.got) continue;
      const sx = b.x - r.wx;
      if (Math.abs(sx - PX) < 28 && b.y > r.py - 70 && b.y < r.py + 22) {
        b.got = true;
        if (b.type === 'leaf') { r.leaves++; r.pts += 50; SFX.leaf(); } else { r.stars++; r.pts += 150; SFX.star(); floatText($('#nxRun'), '⭐ +150'); }
        addPts(b.type === 'leaf' ? 50 : 150, g.runP);
      }
    }
    // weather: clouds thicken, distant thunder, light rain near the ark
    const prog = Math.min(1, r.wx / (r.c.end - PX - 90));
    if (prog > .55 && !r.flashed) { r.flashed = 1; r.flash = .6; setTimeout(SFX.thunder, 250); }
    if (prog > .75 && !r.rained) { r.rained = 1; SFX.rain(); }
    if (Math.floor(r.t * 10) !== r.lastBar) { r.lastBar = Math.floor(r.t * 10); const pr = $('#nxProg'); if (pr) { pr.style.width = Math.round(prog * 100) + '%'; $('#nxLv').textContent = r.leaves; $('#nxSt').textContent = r.stars; $('#nxHs').textContent = g.players[g.runP].score; } }
    if (!r.done && toArk <= 2) arrive();
  }
  const overStream = r => r.c.items.some(o => o.type === 'stream' && o.x - r.wx < PX - 6 && o.x + o.w - r.wx > PX + 6);

  function draw() { const x = g && g.ctx; if (!x || !g.r) return; x.save(); x.translate(0, OY); drawScene(); x.restore(); }
  function drawScene() {
    const r = g.r, x = g.ctx; if (!x || !r) return;
    const prog = Math.min(1, r.wx / (r.c.end - PX - 90)), wthr = .6 + prog * .4, t = Math.max(0, (wthr - .45) / .55);
    const mix = (a, b) => `rgb(${[0, 2, 4].map(i => Math.round(parseInt(a.substr(i + 1, 2), 16) * (1 - t) + parseInt(b.substr(i + 1, 2), 16) * t)).join(',')})`;
    const sky = x.createLinearGradient(0, -OY, 0, H); sky.addColorStop(0, mix('#8FD0FF', '#76839C')); sky.addColorStop(1, mix('#FFF1C9', '#C9CDD6'));
    x.fillStyle = sky; x.fillRect(0, -OY, W, H + OY);
    // sun
    x.globalAlpha = Math.max(.12, 1 - t); x.fillStyle = '#FFD447'; x.strokeStyle = ink; x.lineWidth = 3;
    x.beginPath(); x.arc(470, 46, 24, 0, 7); x.fill(); x.stroke(); x.globalAlpha = 1;
    // clouds drift with the wind
    const windSp = 10 + prog * 30;
    r.clouds.forEach((c, i) => {
      const cx = ((c.x - r.wx * .08 - r.t * windSp) % (W + 160) + W + 160) % (W + 160) - 80;
      x.save(); x.translate(cx, c.y - OY * .6); x.scale(c.s * 1.5, c.s * 1.5);
      x.globalAlpha = Math.min(1, .5 + prog); x.fillStyle = mix('#FFFFFF', '#AEB6C6'); x.strokeStyle = ink; x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, 20); x.arc(12, 20, 12, Math.PI, Math.PI * 1.5); x.arc(28, 14, 15, Math.PI * 1.1, Math.PI * 1.9); x.arc(44, 20, 10, Math.PI * 1.4, 0); x.closePath(); x.fill(); x.stroke();
      x.restore();
      void i;
    });
    x.globalAlpha = 1;
    // far hills
    x.fillStyle = mix('#9BD08A', '#7FA27A'); x.beginPath(); x.moveTo(0, H);
    for (let i = 0; i <= W; i += 20) x.lineTo(i, 168 - 22 * Math.sin((i + r.wx * .3) / 90) - 10 * Math.sin((i + r.wx * .3) / 37));
    x.lineTo(W, H); x.fill();
    // ground
    x.fillStyle = '#7CC36A'; x.fillRect(0, GROUND, W, H - GROUND);
    x.fillStyle = '#A9744A'; x.fillRect(0, GROUND + 14, W, H - GROUND - 14);
    x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.moveTo(0, GROUND); x.lineTo(W, GROUND); x.stroke();
    // grass tufts
    x.strokeStyle = '#3E7B39'; x.lineWidth = 2.5;
    for (let i = -1; i < 20; i++) { const gx = i * 40 - (r.wx % 40); const sw = Math.sin(r.t * 4 + i) * (2 + prog * 4); x.beginPath(); x.moveTo(gx, GROUND); x.lineTo(gx + 3 + sw, GROUND - 9); x.lineTo(gx + 6, GROUND); x.stroke(); }
    // the ark at the end of the path
    const ax = r.c.end - r.wx;
    if (ax < W + 260) {
      x.save(); x.translate(ax, GROUND);
      x.fillStyle = '#C98B4A'; x.strokeStyle = ink; x.lineWidth = 3;
      x.beginPath(); x.moveTo(-90, 0); x.lineTo(-20, -60); x.lineTo(-6, -60); x.lineTo(-76, 0); x.closePath(); x.fill(); x.stroke();   // ramp
      x.fillStyle = '#8B5224'; x.beginPath(); x.moveTo(-20, -60); x.lineTo(240, -60); x.lineTo(214, 0); x.lineTo(6, 0); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#A0612D'; for (let i = 0; i < 6; i++) x.fillRect(-14 + i * 44, -58, 20, 56);
      x.strokeRect(-20, -60, 260, 0);
      x.fillStyle = '#C98B4A'; x.fillRect(30, -100, 160, 40); x.strokeRect(30, -100, 160, 40);
      x.fillStyle = '#7A4A22'; x.beginPath(); x.moveTo(16, -100); x.lineTo(110, -132); x.lineTo(204, -100); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#2B1A0E'; x.fillRect(-20, -92, 32, 32); x.strokeRect(-20, -92, 32, 32);
      x.fillStyle = '#FFE58A'; [60, 140].forEach(wx2 => { x.fillRect(wx2, -90, 20, 14); x.strokeRect(wx2, -90, 20, 14); });
      if (r.board) {
        g.rescued.slice(0, r.board.i).slice(-2).forEach((k, j) => { const im = animalImg(k); if (im.complete) x.drawImage(im, [56, 136][j], -106, 28, 28); });
        x.fillStyle = `rgba(255,212,71,${.35 + .25 * Math.sin(r.t * 6)})`; x.beginPath(); x.arc(-4, -76, 26, 0, 7); x.fill();
      }
      x.restore();
    }
    // obstacles
    for (const o of r.c.items) {
      const sx = o.x - r.wx; if (sx > W + 20 || sx + o.w < -20) continue;
      x.strokeStyle = ink; x.lineWidth = 3;
      if (o.type === 'stream') {
        x.fillStyle = '#3E7BD6'; x.fillRect(sx, GROUND - 2, o.w, H - GROUND + 2);
        x.strokeStyle = '#BFE3FF'; x.lineWidth = 2;
        for (let k = 0; k < 3; k++) { x.beginPath(); const yy = GROUND + 10 + k * 14; for (let i = 0; i <= o.w; i += 6) x.lineTo(sx + i, yy + Math.sin((i + r.t * 60) / 8) * 2); x.stroke(); }
        x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.moveTo(sx, GROUND); x.lineTo(sx, H); x.moveTo(sx + o.w, GROUND); x.lineTo(sx + o.w, H); x.stroke();
      } else if (o.type === 'log') {
        x.fillStyle = '#8B5A2B'; x.beginPath(); x.roundRect(sx, GROUND - o.h, o.w, o.h, 10); x.fill(); x.stroke();
        x.fillStyle = '#D9B38C'; x.beginPath(); x.ellipse(sx + o.w - 6, GROUND - o.h / 2, 6, o.h / 2 - 2, 0, 0, 7); x.fill(); x.stroke();
      } else if (o.type === 'rock') {
        x.fillStyle = '#A7AFBC'; x.beginPath(); x.moveTo(sx, GROUND); x.lineTo(sx + 6, GROUND - o.h + 8); x.lineTo(sx + 18, GROUND - o.h); x.lineTo(sx + o.w, GROUND - 10); x.lineTo(sx + o.w, GROUND); x.closePath(); x.fill(); x.stroke();
      } else {
        x.fillStyle = '#3FA34D'; x.beginPath(); x.roundRect(sx, GROUND - o.h, o.w, o.h, 12); x.fill(); x.stroke();
        x.fillStyle = '#E63946'; [[8, 12], [20, 24], [10, 34]].forEach(([a, b]) => { x.beginPath(); x.arc(sx + a, GROUND - o.h + b, 3, 0, 7); x.fill(); });
      }
      if (r.hint && !o.hit) {
        const d = sx - PX;
        if (d > 0 && d < g.C.speed * .95) { x.fillStyle = '#FFD447'; x.strokeStyle = ink; x.lineWidth = 2.5; x.beginPath(); const mx = sx + o.w / 2; x.moveTo(mx, GROUND - Math.max(o.h, 10) - 10); x.lineTo(mx - 10, GROUND - Math.max(o.h, 10) - 26); x.lineTo(mx + 10, GROUND - Math.max(o.h, 10) - 26); x.closePath(); x.fill(); x.stroke(); }
      }
    }
    // bonus items bob gently
    for (const b of r.c.bonus) {
      if (b.got) continue; const sx = b.x - r.wx; if (sx < -20 || sx > W + 20) continue;
      const by = b.y + Math.sin(r.t * 3 + b.x) * 4;
      x.strokeStyle = ink; x.lineWidth = 2;
      if (b.type === 'leaf') { x.fillStyle = '#6FA83A'; x.beginPath(); x.ellipse(sx, by, 12, 6, -.6, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(sx - 9, by + 7); x.lineTo(sx + 8, by - 6); x.stroke(); }
      else { x.fillStyle = '#FFD447'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 14; x.lineTo(sx + Math.cos(a) * rr, by + Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); }
    }
    // the animals follow Noah and copy his jumps
    const yAt = wx => { for (let i = r.hist.length - 1; i >= 0; i--) if (r.hist[i][0] <= wx) return r.hist[i][1]; return GROUND; };
    const B = r.board, ax0 = r.c.end - r.wx;
    g.rescued.forEach((k, i) => {
      const im = animalImg(k); if (!im.complete) return;
      if (B && i < B.i) return;                          // already on the ark
      if (B) {
        const u = i === B.i ? Math.min(1, B.t / BOARD_T) : 0;
        const slot = 36 + (i - B.i) * 22 - (i === B.i ? 0 : Math.min(1, B.t / BOARD_T) * 22);   // the line shuffles forward
        let fx = PX - slot, fy = GROUND, s = 1;
        if (i === B.i) {
          const p0 = [PX - 36, GROUND], p1 = [ax0 - 86, GROUND], p2 = [ax0 - 18, GROUND - 62], p3 = [ax0 - 4, GROUND - 66];
          const lerp = (a2, b2, t2) => [a2[0] + (b2[0] - a2[0]) * t2, a2[1] + (b2[1] - a2[1]) * t2];
          const pt = u < .3 ? lerp(p0, p1, u / .3) : u < .8 ? lerp(p1, p2, (u - .3) / .5) : lerp(p2, p3, (u - .8) / .2);
          fx = pt[0]; fy = pt[1] - Math.abs(Math.sin(u * Math.PI * 4)) * 8; s = u < .8 ? 1 : 1 - (u - .8) / .2 * .7;
        }
        x.drawImage(im, fx - 34 * s, fy - 40 * s, 40 * s, 40 * s); x.drawImage(im, fx - 16 * s, fy - 38 * s, 38 * s, 38 * s);
        return;
      }
      const dist = 36 + i * 22, fy = yAt(r.wx - dist), fx = PX - dist;
      const bob = r.started && !r.done && fy >= GROUND - .5 ? Math.abs(Math.sin(r.phase + i)) * 3 : 0;
      x.drawImage(im, fx - 34, fy - 40 - bob, 40, 40); x.drawImage(im, fx - 16, fy - 38 - bob, 38, 38);
    });
    // Noah
    const blink = r.inv > 0 && Math.floor(r.t * 12) % 2;
    x.save(); x.translate(PX, r.py); x.globalAlpha = blink ? .45 : 1;
    const leg = r.py < GROUND ? 0 : Math.sin(r.phase) * 7;
    x.strokeStyle = ink; x.lineWidth = 4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-4, -12); x.lineTo(-4 + leg, 0); x.moveTo(4, -12); x.lineTo(4 - leg, 0); x.stroke();
    x.fillStyle = '#8E5BB5'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-12, -10); x.lineTo(-8, -40); x.lineTo(8, -40); x.lineTo(12, -10); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#6B4A2B'; x.lineWidth = 3; x.beginPath(); x.moveTo(14, -6); x.lineTo(14, -54); x.stroke();   // staff
    x.strokeStyle = ink; x.lineWidth = 2.5; x.fillStyle = '#9B6A3C'; x.beginPath(); x.arc(0, -50, 10, 0, 7); x.fill(); x.stroke();
    x.fillStyle = '#F2F2F2'; x.beginPath(); x.moveTo(-8, -48); x.quadraticCurveTo(0, -30, 8, -48); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = ink; x.beginPath(); x.arc(-3, -52, 1.5, 0, 7); x.arc(3, -52, 1.5, 0, 7); x.fill();
    x.restore(); x.globalAlpha = 1;
    // jump sign over Noah when something is coming (Easy, or when Help is on)
    if (r.hint && r.started && !r.done) {
      const next = r.c.items.find(o => !o.hit && o.x - r.wx > PX - 4);
      const d = next ? next.x - r.wx - PX : 1e9;
      if (d < g.C.speed * .42 && d > 0 && r.py >= GROUND - 1) { x.font = '800 18px Nunito, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#FFD447'; x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.roundRect(PX - 44, r.py - 98, 88, 28, 14); x.fill(); x.stroke(); x.fillStyle = ink; x.fillText('JUMP!', PX, r.py - 78); }
    }
    // light rain near the end, and a soft flash of distant lightning
    if (prog > .75) { x.strokeStyle = 'rgba(215,236,255,.8)'; x.lineWidth = 1.6; x.beginPath(); for (let i = 0; i < 40; i++) { const dx = (i * 97 + r.t * 40) % W, dy = (i * 53 + r.t * 260) % (GROUND + OY) - OY; x.moveTo(dx, dy); x.lineTo(dx - 4, dy + 12); } x.stroke(); }
    if (r.flash > 0) { x.fillStyle = `rgba(255,255,255,${r.flash * .5})`; x.fillRect(0, -OY, W, H + OY); }
    r.parts.forEach(q => { x.globalAlpha = Math.max(0, q.life); x.fillStyle = q.c; x.strokeStyle = ink; x.lineWidth = 1.2; x.beginPath();
      if (q.star) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 2.5 : 6; x.lineTo(q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); }
      else { x.arc(q.x, q.y, 3.5, 0, 7); x.fill(); } });
    x.globalAlpha = 1;
    x.textAlign = 'center'; x.lineJoin = 'round';
    r.pops.forEach(q => { const a = Math.min(1, (q.big ? 2.2 : 1.1) - q.t); x.globalAlpha = a; x.font = `400 ${q.big ? 30 : 22}px "Lilita One", sans-serif`; x.lineWidth = 5; x.strokeStyle = ink; x.fillStyle = q.big ? '#FFD447' : '#fff';
      const yy = q.y - q.t * 30; x.strokeText(q.txt, Math.min(W - 150, Math.max(150, q.x)), yy); x.fillText(q.txt, Math.min(W - 150, Math.max(150, q.x)), yy); });
    x.globalAlpha = 1;
    if (r.board) { const n = g.rescued.length, txt = `🐾 On board: ${Math.min(r.board.i, n)} of ${n}`; x.font = '400 22px "Lilita One", sans-serif'; x.fillStyle = 'rgba(255,255,255,.92)'; x.strokeStyle = ink; x.lineWidth = 3;
      const tw = x.measureText(txt).width + 28; x.beginPath(); x.roundRect(W / 2 - tw / 2, 44, tw, 34, 17); x.fill(); x.stroke(); x.fillStyle = ink; x.fillText(txt, W / 2, 69); }
  }

  function arrive() {
    const r = g.r; r.done = true;
    const p = g.runP, P = g.players[p];
    P.bumps = r.bumps; P.leaves = r.leaves; P.stars = r.stars;
    const bonus = r.bumps === 0 ? 300 : 100; addPts(bonus, p);
    g.stats.leafTotal = r.leafTotal;
    if (r.bumps === 0) g.earn = Object.assign(g.earn || {}, { feet: 1 });
    if (r.leaves >= r.leafTotal) g.earn = Object.assign(g.earn || {}, { leaves: 1 });
    $('#nxJump').hidden = true;
    r.board = { i: 0, t: 0 };
    if (!g.rescued.length) r.board.i = 0;
  }
  function finishRun() {
    const r = g.r, p = g.runP;
    g.loop = false; removeEventListener('keydown', g.keyH);
    $('#nxRun').onpointerdown = null;
    g.runs[p] = { bumps: r.bumps, leaves: r.leaves, stars: r.stars, total: r.leafTotal };
    const chips = `<div class="nx-chips"><span class="nx-chip">🌿 ${r.leaves} of ${r.leafTotal} leaves</span><span class="nx-chip">⭐ ${r.stars} stars</span><span class="nx-chip">${r.bumps ? `Bumps: ${r.bumps}` : '👣 No bumps! +300'}</span></div>`;
    if (g.two && p === 0) {
      const ov = $('#nxIntro'); ov.hidden = false;
      ov.innerHTML = `<div class="card nx-done"><h3>${pname(0)} made it! 🎉</h3>${chips}</div>`;
      g.runP = 1; g.turn = 1; paintScore();
      nextBtn(ov.querySelector('.card'), `${pname(1)}’s turn`, () => { intro(); });
      return;
    }
    const out = $('#nxCtl');
    out.innerHTML = `<div class="nx-done" id="nxD2"><h3>🚪 You reached the ark!</h3>${g.two ? `<div class="nx-cmp">${g.runs.map((x2, i) => `<div><span>${pname(i)}</span><b>🌿 ${x2.leaves}</b>${x2.bumps ? `${x2.bumps} bumps` : 'No bumps!'}</div>`).join('')}</div>` : chips}</div>`;
    g.turn = 0; paintScore();
    const d2 = $('#nxD2');
    discovery(d2, {
      ref: 'Genesis 6:22', fact: 'Noah built the ark exactly the way God told him: “according to all that God commanded him, so did he.”',
      q: 'What can we learn from Noah?',
      opts: [{ t: 'To obey God, even when it is hard', ok: true }, { t: 'To build boats on sunny days' }, { t: 'To be the fastest runner' }],
      exp: 'Noah trusted God and did what He said, even before any rain came. We can trust and obey God too, one step at a time.'
    }, () => nextBtn(d2, 'Stage 3: God’s Promise', () => begin(2, stage3)));
    ctlFor({ help: g.diff === 'hard' ? null : () => g.discHelp && g.discHelp() });
    $('#nxCtl').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ================= STAGE 3: God’s Promise (animated story, Genesis 7–9) ================= */
  const hardV = (easy, kjv) => (g && g.diff === 'hard' ? kjv : easy);
  const SKY = { gloom: ['#8C96A8', '#C9C2B0'], storm: ['#3C4660', '#5E6A86'], clear: ['#8FD0FF', '#E6F6FF'], gold: ['#FFC46B', '#FFF1C9'], grey: ['#A9B3C4', '#DCE3EC'] };
  const BOW = [['#D7263D', 'Red'], ['#F28C28', 'Orange'], ['#F2C14E', 'Yellow'], ['#14946B', 'Green'], ['#1F55D6', 'Blue'], ['#7A3E9D', 'Purple']];
  function pic(sky, body, label) {
    const [a, b] = SKY[sky];
    return `<svg viewBox="0 0 360 200" role="img" aria-label="${Ark.esc(label)}">
      <defs><linearGradient id="nxSky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="360" height="200" fill="url(#nxSky3)"/>${body}</svg>`;
  }
  function noahFig(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 44l4-30h16l4 30z" fill="#8E5BB5" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="0" cy="4" r="9" fill="#9B6A3C" stroke="${ink}" stroke-width="2.5"/><path d="M-8 6q8 14 16 0q-2 9-8 10q-6-1-8-10z" fill="#F2F2F2" stroke="${ink}" stroke-width="1.8"/>
      <circle cx="-3" cy="3" r="1.4" fill="${ink}"/><circle cx="3" cy="3" r="1.4" fill="${ink}"/></g>`;
  }
  // The big wooden ark. door: 'open' | 'shut' | 'closing'
  function arkSVG(x, y, door = 'open') {
    const W2 = 200, H2 = 46;
    let boards = ''; for (let i = 0; i < 10; i++) boards += `<rect x="${x + i * 20}" y="${y}" width="20.5" height="${H2}" fill="${i % 2 ? '#A0612D' : '#8B5224'}"/>`;
    return `<g><defs><clipPath id="nxHull"><path d="M${x} ${y}h${W2}l-18 ${H2}H${x + 18}z"/></clipPath></defs>
      <g clip-path="url(#nxHull)">${boards}</g><path d="M${x} ${y}h${W2}l-18 ${H2}H${x + 18}z" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="${x + 50}" y="${y - 30}" width="100" height="30" fill="#C98B4A" stroke="${ink}" stroke-width="3"/>
      <path d="M${x + 40} ${y - 30}l60-22 60 22z" fill="#7A4A22" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="${x + 64}" y="${y - 22}" width="14" height="10" fill="#FFE58A" stroke="${ink}" stroke-width="2"/><rect x="${x + 122}" y="${y - 22}" width="14" height="10" fill="#FFE58A" stroke="${ink}" stroke-width="2"/>
      <rect x="${x + 88}" y="${y - 24}" width="24" height="24" fill="#2B1A0E" stroke="${ink}" stroke-width="2.5"/>
      ${door === 'open' ? '' : `<g class="${door === 'closing' ? 'doorgo' : ''}"><rect x="${x + 88}" y="${y - 24}" width="24" height="24" fill="#A0612D" stroke="${ink}" stroke-width="2.5"/><circle cx="${x + 107}" cy="${y - 12}" r="2" fill="${ink}"/></g>`}</g>`;
  }
  const water = (lv, cls = '') => `<g class="water ${cls}"><path class="waves" d="M-20 ${200 - lv}q25-10 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V210H-20z" fill="#3E7BD6" opacity=".9"/>
      <path class="waves w2" d="M-20 ${210 - lv}q25-8 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V210H-20z" fill="#2A5FB5"/></g>`;
  const hills = (c = '#7CC36A') => `<path d="M0 160q60-26 120-10t120-6 120 8V200H0z" fill="${c}" stroke="${ink}" stroke-width="2.5"/>`;
  const drops = n => `<g class="drops">${Array.from({ length: n }, (_, i) => `<path d="M${(i * 37) % 360} ${(i * 23) % 90}l-6 16" style="animation-delay:${(i % 7) * .12}s"/>`).join('')}</g>`;
  const cloud = (x, y, c = '#fff', s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 20a12 12 0 0112-12 16 16 0 0130-2 11 11 0 0110 18z" fill="${c}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/></g>`;
  const sun = (x, y) => `<circle cx="${x}" cy="${y}" r="16" fill="#FFD447" stroke="${ink}" stroke-width="2.5"/>`;
  const doveSVG = (x, y, leaf) => `<g transform="translate(${x} ${y}) scale(.6)"><path d="M8 34q10-20 30-12 8-10 14-4l-6 4q2 14-14 18-14 2-24-6z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M20 30q8-8 16 0" fill="#E3EAF2" stroke="${ink}" stroke-width="2"/><path d="M52 18l6 2-6 2" fill="#F2A007" stroke="${ink}" stroke-width="1.5"/><circle cx="46" cy="19" r="2" fill="${ink}"/>${leaf ? '<path d="M56 22q8 2 10 10" stroke="#4E7D2B" stroke-width="2.5" fill="none"/><ellipse cx="64" cy="30" rx="5" ry="2.6" fill="#6FA83A" stroke="#2F5A17" stroke-width="1" transform="rotate(50 64 30)"/>' : ''}</g>`;
  const bowSVG = cols => cols.map((c, i) => `<path d="M${70 + i * 10} 168a${110 - i * 10} ${110 - i * 10} 0 01${220 - i * 20} 0" fill="none" stroke="${c || 'rgba(255,255,255,.6)'}" stroke-width="10" ${c ? '' : 'stroke-dasharray="6 6"'}/>`).join('');
  const mountain = (top = 140) => `<path d="M150 210L230 ${top}l20 8 18-10 70 72z" fill="#8C7A66" stroke="${ink}" stroke-width="2.5"/><path d="M222 ${top + 8}l8-8 20 8 18-10 8 7" fill="none" stroke="#fff" stroke-width="3"/>`;

  /* Layout: the picture is the star. A short caption sits on the picture, and the main button sits at the bottom
     of the picture, so nothing important is ever below the fold. In landscape the side panel (Bible Discoveries,
     reflection) sits beside the picture; in portrait it sits underneath. */
  function stage3() {
    g.turn = 0;
    el.innerHTML = `${top(2)}<div class="nx3">
        <div class="nx3-sc"><div class="nx-cap" id="nxCap"></div><div class="nx-scene" id="nxSc"></div><div class="nx3-steps" id="nxSteps"></div><div class="nx-act" id="nxAct"></div></div>
        <div class="nx3-side"><div class="nx-rot nx-rot3"><i>📱</i> Turn sideways for a bigger picture!</div><div id="nxP" style="display:grid;gap:12px"></div></div>
      </div>`;
    const gb = document.querySelector('.gbar'); document.documentElement.style.setProperty('--gbh', (gb ? gb.getBoundingClientRect().height : 60) + 'px');
    ctlFor({ help: g.diff === 'hard' ? null : () => { if (g.discHelp) return g.discHelp(); if (g.help3) g.help3(); }, pause: () => hush() });
    const box = $('.nx3'), sync = () => box.classList.toggle('solo', !$('#nxP').children.length);
    new MutationObserver(sync).observe($('#nxP'), { childList: true }); sync();
    s3a();
  }
  const speakable = t => t.replace(/<[^>]+>/g, '').replace(/\p{Extended_Pictographic}|️/gu, '').trim();
  function cap(text, ref) {
    $('#nxCap').innerHTML = `<div>${text}${ref ? ` <small>${ref}</small>` : ''}${Ark.canSpeak ? '<button type="button" aria-label="Read it to me">🔊</button>' : ''}</div>`;
    const b = $('#nxCap button'); if (b) b.onclick = () => say(speakable(text), true);
    if (g.diff !== 'hard') say(speakable(text));
  }
  function act(label, fn, cls = '') {
    $('#nxAct').innerHTML = `<button class="btn big ${cls}" type="button">${label}</button>`;
    const b = $('#nxAct button');
    b.onclick = () => { $('#nxAct').innerHTML = ''; SFX.flip(); fn(); };
    keep();
    return b;
  }
  const tip = t => { $('#nxAct').innerHTML = `<span class="nx-tip">${t}</span>`; };
  function S3(i, picture) {
    g.s3 = i; g.help3 = null; g.discHelp = null;
    $('#nxSteps').innerHTML = Ark.steps(5, i, i);
    if (picture) $('#nxSc').innerHTML = picture;
    $('#nxP').innerHTML = ''; $('#nxAct').innerHTML = '';
    keep();
  }
  /* Keep the whole picture (caption, scene, button) on screen. If it fits, line it up under the game bar. */
  function keep() {
    const sc0 = el.querySelector('.nx3-sc'); if (!sc0) return;
    const gb = document.querySelector('.gbar'), top0 = gb ? gb.getBoundingClientRect().bottom : 0, r = sc0.getBoundingClientRect();
    if (r.height <= innerHeight - top0 - 6) { if (r.top < top0 - 1 || r.bottom > innerHeight + 1) scrollBy(0, r.top - top0 - 6); }
    else { const b = sc0.querySelector('.nx-act'); const rb = b.getBoundingClientRect(); if (rb.bottom > innerHeight || rb.top < top0) b.scrollIntoView({ block: 'end' }); }
  }
  const P3 = () => $('#nxP');
  const sc = () => $('#nxSc svg');
  const next3 = fn => act(`Next ${Ark.UI.play}`, fn);

  // 1. Into the ark: the rescued animals walk up the ramp
  function s3a() {
    const ks = g.rescued.length ? g.rescued : Object.keys(ANIMALS).slice(0, 4);
    const walk = ks.map((k, i) => `<g class="walkin" style="--dx:-110px;--dy:-44px;animation-delay:${.4 + i * .45}s"><svg x="${300 + (i % 2) * 12}" y="${132 - (i % 2) * 4}" width="30" height="30" viewBox="0 0 60 60">${ANIMALS[k].s}</svg></g>`).join('');
    S3(0, pic('grey', `${cloud(20, 14, '#E6E9EF')}${cloud(250, 22, '#E6E9EF', .9)}${hills()}${arkSVG(80, 112)}<path d="M262 112l58 46h-16l-48-38z" fill="#C98B4A" stroke="${ink}" stroke-width="2.5"/>${noahFig(46, 112, .9)}${walk}`, 'The animals walk up the ramp into the ark.'));
    cap(hardV('Two by two, into the ark! 🐾', '“There went in two and two unto Noah.” 🐾'), 'Gen 7:9');
    discovery(P3(), {
      ref: 'Genesis 7:9', fact: 'The animals went in “as God had commanded Noah”.',
      q: 'Who told Noah to prepare the ark?',
      opts: [{ t: 'God', ok: true }, { t: 'Noah’s neighbours' }, { t: 'The animals' }],
      exp: 'God told Noah what to do, and Noah listened.'
    }, () => next3(s3b));
  }
  // 2. God shuts the door
  function s3b() {
    const base = door => pic('gloom', `${cloud(10, 10, '#C9CED6', 1.1)}${cloud(150, 4, '#C9CED6')}${cloud(270, 14, '#C9CED6')}${hills('#9DB08A')}${arkSVG(80, 112, door)}
      ${door === 'open' ? `<g class="glow tap" id="nxLight" role="button" tabindex="0" aria-label="Tap the light"><circle cx="180" cy="40" r="30" fill="#FFF3C4" opacity=".9"/><circle cx="180" cy="40" r="15" fill="#FFD447" stroke="${ink}" stroke-width="2"/></g>` : `<g class="pop"><path d="M180 0L160 84h40z" fill="#FFF3C4" opacity=".75"/></g>`}`,
      door === 'open' ? 'The ark with its door open. A light glows in the sky above.' : 'Light shines from heaven as the ark door closes.');
    S3(1, base('open'));
    cap('Tap the light! ✨');
    tip('👆 Tap the light');
    g.help3 = () => Ark.toast('Tap the glowing light above the ark!');
    const tap = () => {
      $('#nxLight').onclick = null;
      $('#nxSc').innerHTML = base('closing'); SFX.door(); later(SFX.thunder, 900);
      cap(hardV('God shut the door! 🚪', '“The LORD shut him in.” 🚪'), 'Gen 7:16');
      g.help3 = null; $('#nxAct').innerHTML = ''; later(() => next3(s3c), 900);
    };
    $('#nxLight').onclick = tap;
    $('#nxLight').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
  }
  // 3. Rain, and the ark floats safely
  function s3c() {
    const view = inside => pic('storm', `${cloud(10, 10, '#6B7590', 1.3)}${cloud(150, 4, '#6B7590', 1.2)}${cloud(270, 14, '#6B7590', 1.1)}${drops(26)}${water(80, 'rise')}
      <g class="bob tap" id="nxArk" role="button" tabindex="0" aria-label="Look inside the ark">${arkSVG(80, 74, 'shut')}</g>
      ${inside ? `<g class="pop"><rect x="60" y="20" width="240" height="110" rx="16" fill="#FFF3DC" stroke="${ink}" stroke-width="3"/><rect x="60" y="100" width="240" height="30" fill="#E3C48C"/>
        ${noahFig(96, 54, .9)}${g.rescued.slice(0, 6).map((k, i) => `<svg x="${120 + i * 28}" y="${78 - (i % 2) * 6}" width="30" height="30" viewBox="0 0 60 60">${ANIMALS[k].s}</svg>`).join('')}
        <circle cx="270" cy="44" r="10" fill="#FFD447" stroke="${ink}" stroke-width="2"/>
        <text x="180" y="44" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="16" fill="${ink}">Safe and warm! 💛</text></g>` : ''}`, inside ? 'Inside the ark, Noah and the animals are safe and warm.' : 'Rain pours down. The ark floats safely on the water.');
    S3(2, view(false));
    cap(hardV('40 days of rain. The ark floats! 🌧️', '“The ark went upon the face of the waters.” 🌧️'), 'Gen 7:12, 18');
    SFX.rain();
    const w = sc().querySelector('.water'); w.style.transform = 'translateY(70px)'; requestAnimationFrame(() => requestAnimationFrame(() => { w.style.transform = ''; }));
    tip('👆 Tap the ark to look inside');
    g.help3 = () => Ark.toast('Tap the ark on the water!');
    let seen = false;
    const look = () => {
      if (seen) return; seen = true; SFX.leaf();
      $('#nxSc').innerHTML = view(true);
      cap('Safe inside! God kept them safe. 💛', 'Psalm 4:8');
      g.help3 = null; $('#nxAct').innerHTML = ''; later(() => next3(s3d), 700);
    };
    $('#nxArk').onclick = look;
    $('#nxArk').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); look(); } });
  }

  /* 4. The waters recede. One living picture, changed in place so every change animates:
     the wind blows, the water sinks, the sun comes out, the ark settles on a mountain, trees grow, flowers appear.
     Then the three doves, exactly as before. */
  function landSVG() {
    const tree = (x, y, s, d) => `<g class="tree" style="transition-delay:${d}s"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-2 0v-14h4V0z" fill="#8B5A2B" stroke="${ink}" stroke-width="1.5"/><circle cx="0" cy="-20" r="10" fill="#6FA83A" stroke="${ink}" stroke-width="2"/><ellipse cx="-4" cy="-23" rx="3" ry="1.6" fill="#9BD06A"/></g></g>`;
    const flower = (x, y, c, d) => `<g class="flower" style="transition-delay:${d}s"><path d="M${x} ${y}v-7" stroke="#3E7B39" stroke-width="2"/><circle cx="${x}" cy="${y - 9}" r="3.4" fill="${c}" stroke="${ink}" stroke-width="1.2"/></g>`;
    return `<svg viewBox="0 0 360 200" role="img" aria-label="The flood water goes down and the land appears.">
      <defs><linearGradient id="nxSkyL" class="sky" x1="0" y1="0" x2="0" y2="1"><stop id="lS0" offset="0" stop-color="#7D8AA3"/><stop id="lS1" offset="1" stop-color="#C9CDD6"/></linearGradient></defs>
      <rect width="360" height="200" fill="url(#nxSkyL)"/>
      <g id="lSun" class="lsun">${sun(320, 34)}<g stroke="#F2A007" stroke-width="3" stroke-linecap="round"><path d="M320 8v-6M296 34h-6M344 34h6M302 16l-4-4M338 16l4-4"/></g></g>
      <g id="lCl" class="lcl">${cloud(10, 10, '#B9C0CC', 1.2)}${cloud(140, 4, '#B9C0CC', 1.1)}${cloud(250, 16, '#B9C0CC')}</g>
      <path d="M-10 200V146q50-26 110-8q30 12 40 62z" fill="#7CC36A" stroke="${ink}" stroke-width="2.5"/>
      ${tree(30, 140, 1, 0)}${tree(62, 134, 1.2, .25)}${tree(96, 140, .9, .5)}
      ${flower(18, 160, '#FF8FA3', 0)}${flower(46, 156, '#FFD447', .15)}${flower(80, 154, '#fff', .3)}${flower(112, 160, '#FF8FA3', .45)}
      ${mountain(136)}
      <g id="lArk" class="lmove"><g transform="translate(118 98) scale(.62)">${arkSVG(0, 0, 'shut')}</g></g>
      <g id="lW" class="lmove">${water(80)}</g>
      <g id="lWind" class="lwind">${[30, 60, 90].map((y, i) => `<path d="M-60 ${y}q30-8 60 0t60 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" style="animation-delay:${i * .15}s"/>`).join('')}</g>
      <g id="lDv"></g>
    </svg>`;
  }
  function land(o) {
    const s = sc(); if (!s) return;
    if (o.lv !== undefined) s.querySelector('#lW').style.transform = `translateY(${80 - o.lv}px)`;
    if (o.ark) s.querySelector('#lArk').style.transform = `translate(${o.ark[0]}px,${o.ark[1]}px)`;
    if (o.sky) { s.querySelector('#lS0').setAttribute('stop-color', o.sky[0]); s.querySelector('#lS1').setAttribute('stop-color', o.sky[1]); }
    if (o.sun !== undefined) s.querySelector('#lSun').classList.toggle('on', o.sun);
    if (o.clouds !== undefined) s.querySelector('#lCl').style.transform = `translateX(${o.clouds}px)`;
    if (o.trees) s.classList.add('trees');
    if (o.flowers) s.classList.add('flowers');
    if (o.bow) s.classList.add('bow');
  }
  function blow() { const w = sc().querySelector('#lWind'); w.classList.remove('go'); void w.getBoundingClientRect(); w.classList.add('go'); SFX.wind(); }

  function s3d() {
    S3(3, landSVG());
    cap(hardV('God sent a wind. 🌬️', '“God made a wind to pass over the earth.” 🌬️'), 'Gen 8:1');
    let n = 0;
    const steps = [
      { lv: 62, ark: [0, 18], sky: ['#8E9BB3', '#D3D8E0'], clouds: 60 },
      { lv: 46, ark: [69, 16], sky: ['#A5C8EE', '#E0E9F2'], sun: true, clouds: 160 },
      { lv: 34, ark: [69, 16], sky: ['#8FD0FF', '#E6F6FF'], sun: true, clouds: 420 }
    ];
    const caps = [['The water goes down! 💧', 'Gen 8:3'], ['The ark rests on a mountain! ⛰️', 'Gen 8:4'], ['Mountain tops! The sun is out! ☀️', 'Gen 8:5']];
    const go = () => {
      blow(); land(steps[n]); cap(...caps[n]); n++;
      if (n < 3) later(() => act(`🌬️ Blow again! (${n + 1}/3)`, go), 1300);
      else later(() => act('🕊️ Next: the dove', s3e), 1500);
    };
    act('🌬️ Blow the wind! (1/3)', go);
    g.help3 = () => $('#nxAct .btn')?.classList.add('hint');
  }
  // 5. Three doves (same sequence as before), with the land changing around them
  function s3e() {
    S3(4, null);
    cap(hardV('Send out the dove! 🕊️', '“He sent forth a dove.” 🕊️'), 'Gen 8:8');
    let trip = 0;
    const send = () => {
      act(`🕊️ ${['Send the dove', 'Send it again', 'One more time'][trip]} (${trip + 1}/3)`, fly);
      g.help3 = () => $('#nxAct .btn')?.classList.add('hint');
    };
    function fly() {
      const back = trip < 2, leaf = trip === 1;
      sc().querySelector('#lDv').innerHTML = `<g class="fly" style="--fx:${back ? 0 : -260}px;--fy:${back ? 0 : -80}px">${doveSVG(232, 58, leaf)}</g>`;
      SFX.animal('dove'); cap(['Off it goes… 🕊️', 'Fly, little dove… 🕊️', 'Off it goes again… 🕊️'][trip]);
      later(() => {
        if (trip === 0) { cap('No dry land yet. Wait 7 days… ⏳', 'Gen 8:9–10'); land({ lv: 24 }); trip = 1; }
        else if (trip === 1) { cap('An olive leaf! Trees are growing! 🌿', 'Gen 8:11'); land({ lv: 12, trees: true }); SFX.leaf(); trip = 2; }
        else { cap('It didn’t come back. The land is dry! 🎉', 'Gen 8:12–13'); land({ lv: -14, flowers: true }); SFX.win(); trip = 3; }
        if (!back) sc().querySelector('#lDv').innerHTML = '';
        if (trip < 3) later(send, 900); else { g.help3 = null; later(() => next3(s3f), 1200); }
      }, 2700);
    }
    send();
  }
  // 6. The rainbow: God’s covenant
  function s3f() {
    const cols = BOW.map(() => null), ks = (g.rescued.length ? g.rescued : Object.keys(ANIMALS)).slice(0, 6);
    const view = () => pic('clear', `${sun(330, 26)}${bowSVG(cols)}${hills()}${arkSVG(196, 112, 'open')}${ks.map((k, i) => `<svg x="${16 + i * 30}" y="${146 + (i % 2) * 6}" width="28" height="28" viewBox="0 0 60 60">${ANIMALS[k].s}</svg>`).join('')}${noahFig(206, 126, .7)}`, 'Noah and the animals on dry land under a rainbow.');
    S3(4, view()); $('#nxSteps').innerHTML = Ark.steps(5, 5, -1);
    const easy = g.diff === 'easy';
    cap(easy ? 'Paint God’s rainbow! 🌈' : 'Paint the rainbow, outside in! 🌈', 'Gen 9:13');
    $('#nxAct').innerHTML = `<div class="nx-pal" id="nxPal">${shuf(BOW).map(([c, n]) => `<button style="background:${c}" data-c="${c}" aria-label="${n}"></button>`).join('')}</div>`;
    let i = 0;
    g.help3 = () => { const b = $(`#nxPal [data-c="${BOW[i] && BOW[i][0]}"]`); if (b) { b.classList.add('hint'); say(BOW[i][1], true); } };
    $('#nxPal').querySelectorAll('button').forEach(b => (b.onclick = () => {
      if (i >= BOW.length) return;
      const want = BOW[i][0];
      if (!easy && b.dataset.c !== want) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); SFX.miss(); return; }
      const btn = easy ? $(`#nxPal [data-c="${want}"]`) : b;
      cols[i] = want; btn.disabled = true; btn.classList.remove('hint');
      SFX.leaf(); i++; $('#nxSc').innerHTML = view();
      if (i === BOW.length) { g.help3 = null; addPts(150, 0); if (g.two) addPts(150, 1); SFX.star(); later(covenant, 500); }
    }));
    function covenant() {
      $('#nxAct').innerHTML = '';
      cap(hardV('God’s forever promise! 🌈', '“A token of a covenant.” 🌈'), 'Gen 9:11–13');
      P3().insertAdjacentHTML('beforeend', `<div class="nx-say"><div>🌈 A <b>covenant</b> is a promise that lasts forever. God promised: no more flood like this, ever.<span class="ref">Genesis 9:11–13</span></div></div>`);
      discovery(P3(), {
        ref: 'Genesis 9:13', fact: 'The rainbow is the sign of God’s promise.',
        q: 'What does the rainbow remind us?',
        opts: [{ t: 'God always keeps His promises', ok: true }, { t: 'It will rain again tomorrow' }, { t: 'Noah liked bright colours' }],
        exp: 'God kept His promise to Noah, and He keeps His promises to you.'
      }, reflect);
    }
    function reflect() {
      const opts = [['🤝', '“I am with you always.”', 'Matthew 28:20'], ['🛡️', '“I will never leave you.”', 'Hebrews 13:5'], ['❤️', '“I love you with an everlasting love.”', 'Jeremiah 31:3'], ['🌈', '“I will never flood the whole earth again.”', 'Genesis 9:11']];
      P3().insertAdjacentHTML('beforeend', `<div class="nx-think"><span class="k">Think about it</span><p class="q" style="margin:0;font-weight:800;font-size:18px">Which promise will you hold on to?</p>
        <div class="nx-opts" id="nxThink">${opts.map((o, j) => `<button class="nx-opt" data-j="${j}">${o[0]} ${o[1]}</button>`).join('')}</div><button class="nx-skip" id="nxTSkip">Skip</button></div>`);
      const done = () => { $('#nxTSkip')?.remove(); P3().querySelectorAll('#nxThink .nx-opt').forEach(b => (b.disabled = true)); act('🏁 Finish the mission', finishAll); };
      P3().querySelectorAll('#nxThink .nx-opt').forEach(b => (b.onclick = () => { const o = opts[+b.dataset.j]; g.promise = o; b.classList.add('pick'); P3().insertAdjacentHTML('beforeend', `<p class="nx-exp">${o[2]}. Hold on to it!</p>`); done(); }));
      $('#nxTSkip').onclick = done;
      act('🏁 Finish the mission', finishAll);   // the reflection is optional: finishing is always one tap away
      $('#nxThink').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /* ================= Mission complete: score, personal best, badges, replay challenge ================= */
  function finishAll() {
    const { diff, C, two, players, stats } = g;
    const allow = (diff === 'hard' ? 6 : 4) * (two ? 2 : 1);
    const p1 = Math.max(0, stats.tries - C.pairs - allow) / 3;
    const avgBumps = players.reduce((s, p) => s + p.bumps, 0) / players.length;
    const pen = p1 + avgBumps / 2 + stats.wrong;
    const stars = pen <= 1.5 ? 3 : pen <= 4 ? 2 : 1;
    const earn = Object.assign({}, g.earn || {});
    if (stats.asked && stats.right === stats.asked) earn.explorer = 1;
    if (diff === 'hard') earn.rainbow = 1;
    if (two) earn.team = 1;
    const got = Ark.storeJSON('noah-badges') || {}, fresh = Object.keys(earn).filter(k => !got[k]);
    fresh.forEach(k => (got[k] = Date.now())); Ark.storeJSON('noah-badges', got);
    const top1 = Math.max(...players.map(p => p.score));
    const best = Ark.storeJSON('noah-best') || {}, prevBest = best[diff] || 0, newBest = top1 > prevBest;
    if (newBest) { best[diff] = top1; Ark.storeJSON('noah-best', best); }
    const locked = Object.keys(BADGES).filter(k => !got[k]);
    const challenge = locked.length ? `🎯 <b>Next challenge:</b> unlock <b>${BADGES[locked[0]][0]} ${BADGES[locked[0]][1]}</b>. ${BADGES[locked[0]][2]}.`
      : `🎯 <b>Next challenge:</b> beat your best score of <b>${(newBest ? top1 : prevBest)}</b> on ${Ark.DLABEL[diff]}!`;
    let scoreHTML;
    if (two) {
      const w = players[0].score === players[1].score ? -1 : players[0].score > players[1].score ? 0 : 1;
      scoreHTML = `<h3 style="font-size:24px">${w < 0 ? 'It’s a tie! You both win!' : `${pname(w)} wins! 🏆`}</h3>
        <div class="nx-cmp">${players.map((p, i) => `<div class="${i === w ? 'win' : ''}"><span>${pname(i)}</span><b>${p.score}</b>🌿 ${p.leaves} · ${p.bumps ? `${p.bumps} bumps` : 'no bumps'}</div>`).join('')}</div>`;
    } else scoreHTML = `<div class="nx-chips"><span class="nx-chip" style="font-size:20px">Score: <b>${players[0].score}</b></span><span class="nx-chip">Best: ${Math.max(top1, prevBest)}</span></div>`;
    const d = diff;
    clearTimers(); removeEventListener('keydown', g.keyH); g.loop = false;
    SFX.win();
    el.classList.remove('nx-wide');
    Ark.finish(el, {
      id: 'noahs-ark', diff: d, stars, title: 'Mission complete! God kept His promise!',
      html: `<svg viewBox="0 0 200 104" style="width:min(220px,64%)" aria-hidden="true">${BOW.map(([c], i) => `<path d="M${10 + i * 10} 100a${90 - i * 10} ${90 - i * 10} 0 01${180 - i * 20} 0" fill="none" stroke="${c}" stroke-width="10"/>`).join('')}</svg>
        ${scoreHTML}${newBest && prevBest ? '<span class="newbest">New best score!</span>' : ''}
        <div class="nx-badges">${Object.entries(BADGES).map(([k, b]) => `<div class="nx-badge ${got[k] ? 'got' : ''} ${fresh.includes(k) ? 'new' : ''}"><span class="i">${b[0]}</span><span><b>${b[1]}${fresh.includes(k) ? ' (new!)' : ''}</b><small>${b[2]}</small></span></div>`).join('')}</div>
        ${g.promise ? `<div class="lesson" style="text-align:left">🤍 The promise you’re holding on to: <b>${g.promise[1]}</b> (${g.promise[2]})</div>` : ''}
        <div class="lesson" style="text-align:left;border-color:var(--amber)">${challenge}</div>`,
      verse: ['I do set my bow in the cloud, and it shall be for a token of a covenant between me and the earth.', 'Genesis 9:13'],
      lesson: 'Noah obeyed God, and God kept Noah and the animals safe. The rainbow reminds us that God always keeps His promises.',
      again: () => play(d), menu,
      next: d !== 'hard' ? [`Try ${d === 'easy' ? 'Normal' : 'Hard'}`, () => { const n = d === 'easy' ? 'normal' : 'hard'; store('diff-noahs-ark', n); play(n); }] : null
    });
    if (fresh.length) setTimeout(() => Ark.toast(`New badge: ${BADGES[fresh[0]][0]} ${BADGES[fresh[0]][1]}!`), 900);
    g = null;
  }

  function stop() { clearTimers(); if (g) { cancelAnimationFrame(g.raf); g.loop = false; if (g.keyH) removeEventListener('keydown', g.keyH); if (g.resH) removeEventListener('resize', g.resH); } g = null; }

  Ark.games['noahs-ark'] = {
    mount(stage) { el = stage; css(); menu(); },
    unmount() { stop(); hush(); if (el) el.classList.remove('nx-wide'); },
    _test: { state: () => g, D, px: () => PX, w: () => W }
  };
})();
