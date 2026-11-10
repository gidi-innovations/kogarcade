/* Lamp to My Feet: Light the Way (Psalm 119:105).
   Tap path tiles to turn them so the lamp's light travels to the door. Four rounds, each in a new place, each lighting
   part of the verse. Every board is carved from a maze, so it always has at least one solution.
   Fair scoring: your turns are compared with the fewest turns ANY working route needs (a shortest-path search over the
   board), so a different valid path is never penalised. Progress (stars, best score, paths lit) is kept only in this browser. */
(() => {
  const { store, storeJSON, say, hush, bar, setBar, learn, starRow } = Ark;
  const N = 1, E = 2, S = 4, W = 8;
  const DIRS = [[N, 0, -1, S], [E, 1, 0, W], [S, 0, 1, N], [W, -1, 0, E]];
  const rot = m => ((m << 1) | (m >> 3)) & 15; // one clockwise quarter-turn
  const rotK = (m, k) => { k = ((k % 4) + 4) % 4; while (k--) m = rot(m); return m; };
  const fwd = (r, k) => (((k - r) % 4) + 4) % 4; // taps needed to go from rotation r to rotation k
  const BASES = [N, N | S, N | E, N | E | S, 15]; // dead end, straight, corner, T, cross
  const canon = m => { for (const b of BASES) for (let k = 0; k < 4; k++) if (rotK(b, k) === m) return { base: b, k }; return { base: m, k: 0 }; };
  const maskOf = t => rotK(t.base, t.r);
  const rand4 = () => (Math.random() * 4) | 0;
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /* Psalm 119:105, King James Version (the arcade's Bible version). */
  const VERSE = ['Thy word is', 'a lamp unto my feet,', 'and a light', 'unto my path.'];
  const FULL = 'Thy word is a lamp unto my feet, and a light unto my path.';
  const REF = 'Psalm 119:105 (KJV)';
  const ROUNDS = [
    { name: 'The First Light', env: 'dawn', tip: 'Tap a tile to turn it. Join the paths so the light reaches the door!', lesson: 'God’s Word helps guide us.' },
    { name: 'The Twisting Path', env: 'garden', tip: 'This path twists and turns, and some paths lead nowhere. Try different tiles to find the way!', lesson: 'When we have a choice to make, we can look to God’s Word for guidance.' },
    { name: 'The Hidden Way', env: 'grotto', tip: 'The way is hidden! Shining gems sit along one way to the door. Take your time.', lesson: 'Sometimes we need patience and wisdom to find the right path.' },
    { name: 'Light the Way', env: 'hill', tip: 'The biggest board yet! There is more than one way to the door. Any way that works is a good way.', lesson: 'God’s Word guides us as we follow Him.' }
  ];
  /* Difficulty: board size, tile layout ('simple' = only the true path has real shapes, 'maze' = branches and dead ends),
     extra openings (loops = more than one route), hints and clues per puzzle, dashed guidance. */
  const CFG = {
    easy: { sizes: [3, 4, 4, 5], fill: ['simple', 'simple', 'maze', 'maze'], loops: [0, 0, 0, 1], hints: Infinity, clues: Infinity, guide: true },
    normal: { sizes: [4, 5, 5, 6], fill: ['simple', 'maze', 'maze', 'maze'], loops: [0, 0, 1, 2], hints: 3, clues: 1, guide: false },
    hard: { sizes: [5, 6, 6, 7], fill: ['maze', 'maze', 'maze', 'maze'], loops: [0, 0, 1, 3], hints: 0, clues: 0, guide: false }
  };
  const GEMS = [0, 0, 3, 0];
  const MIN_COST = [2, 4, 5, 6];

  let el, st = null, run = null, timers = [], helpOpen = false;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const $ = s => el && el.querySelector(s);
  const paths = () => +store('lamp-paths') || 0;
  const bestOf = d => (storeJSON('lamp-best') || {})[d] || 0;
  const newRun = diff => ({ diff, i: 0, stars: [], pts: [], score: 0 });

  /* ---------- sound effects (follow the Sound button) ---------- */
  let ctx = null;
  const ac = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; };
  function tone(f, d, o = {}) {
    if (!Ark.voiceOn() || !ac()) return;
    try {
      const t = ctx.currentTime + (o.at || 0), osc = ctx.createOscillator(), gn = ctx.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(o.vol || .06, t + Math.min(.03, d / 4)); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(gn); gn.connect(ctx.destination); osc.start(t); osc.stop(t + d + .02);
    } catch (e) {}
  }
  const sfx = {
    turn: () => tone(380, .08, { type: 'triangle', to: 520, vol: .05 }),
    light: k => { for (let j = 0; j < Math.min(k, 4); j++) tone(660 + j * 132, .22, { at: j * .06, vol: .04 }); },
    gem: () => { tone(1046, .2, { vol: .06 }); tone(1568, .32, { at: .08, vol: .05 }); },
    door: () => tone(220, .6, { to: 440, vol: .06 }),
    win: () => [523, 659, 784, 1046].forEach((f, j) => tone(f, .4, { at: j * .11, vol: .07 }))
  };

  /* ---------- pictures ---------- */
  const ARM = { [N]: 'M50 50V0', [E]: 'M50 50H100', [S]: 'M50 50V100', [W]: 'M50 50H0' };
  // Layers: glow, groove, stone path, light core, flowing particles. Drawn layer by layer so arms join cleanly in the middle.
  const tileSvg = base => {
    const arms = [N, E, S, W].filter(b => base & b), L = cls => arms.map(b => `<path class="${cls}" d="${ARM[b]}"${cls === 'pt' ? ` data-b="${b}"` : ''}/>`).join('');
    return `<svg class="tl" viewBox="0 0 100 100" aria-hidden="true">${L('gl')}${L('gv')}<circle class="hgv" cx="50" cy="50" r="18"/>${L('pv')}<circle class="hpv" cx="50" cy="50" r="12"/>${L('lt')}<circle class="hlt" cx="50" cy="50" r="9"/>${L('pt')}</svg>`;
  };
  const LAMP = `<svg class="lp-lamp" viewBox="0 0 60 100" aria-hidden="true">
      <path class="gv" d="M30 50H60"/><path class="lt on" d="M30 50H60"/><path class="pt out" d="M30 50H60"/>
      <circle class="halo" cx="30" cy="48" r="30"/>
      <path d="M6 58c-6-1-6-9 0-9" fill="none" stroke="#13203A" stroke-width="2.5"/>
      <path d="M4 60c0-7 10-10 20-10s16 2 22-1c-2 10-12 15-22 15S4 66 4 60z" fill="#E8B13A" stroke="#13203A" stroke-width="2.5"/>
      <rect x="16" y="64" width="14" height="7" rx="2" fill="#A0612D" stroke="#13203A" stroke-width="2.5"/>
      <path class="flame" d="M44 50c5-5 3-13 3-13s-8 3-8 11c0 2 2 3 5 2z" fill="#FF8A1F" stroke="#13203A" stroke-width="2"/>
      <path class="flame" d="M44 48c2-3 1-6 1-6s-3 2-3 5z" fill="#FFF1A8"/></svg>`;
  const DOOR = `<svg class="lp-door" viewBox="0 0 60 100" aria-hidden="true">
      <path class="gv" d="M0 50H18"/><path class="pv" d="M0 50H18"/><path class="lt" d="M0 50H18"/>
      <path d="M14 92V40a22 22 0 0144 0v52z" fill="#8C7B66" stroke="#13203A" stroke-width="3"/>
      <path class="shine" d="M19 90V41a17 17 0 0134 0v49z"/>
      <g class="leaf"><path d="M19 90V41a17 17 0 0134 0v49z" fill="#7A4A26" stroke="#13203A" stroke-width="2.5"/>
      <path d="M28 52v34M36 47v39M44 52v34" stroke="#5A3418" stroke-width="2"/><circle cx="46" cy="70" r="2.6" fill="#FFD447" stroke="#13203A" stroke-width="1"/></g></svg>`;
  const GEM = `<svg class="lp-gem" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z" fill="#8FE3FF" stroke="#13203A" stroke-width="1.8" stroke-linejoin="round"/><path d="M2 9h20M9 3l3 18 3-18" fill="none" stroke="#13203A" stroke-width="1.2" opacity=".55"/></svg>`;
  const BULB = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0012 3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const GLASS = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;

  /* Scenery for each round (original artwork, drawn here). */
  const DECO = {
    dawn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><g fill="#fff" opacity=".7"><circle cx="40" cy="30" r="1.6"/><circle cx="90" cy="62" r="1.2"/><circle cx="150" cy="22" r="1.4"/><circle cx="232" cy="48" r="1"/><circle cx="270" cy="18" r="1.3"/></g><circle cx="330" cy="80" r="50" fill="#FFD9A0" opacity=".22"/><circle cx="330" cy="80" r="22" fill="#FFF1C9" opacity=".65"/><path d="M0 235q90-45 180-12t220-18V300H0z" fill="#3B3768" opacity=".75"/><path d="M0 268q110-28 210-6t190-10V300H0z" fill="#26234D"/></svg>`,
    garden: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><g fill="#8FD47A" opacity=".35"><ellipse cx="20" cy="20" rx="44" ry="18" transform="rotate(30 20 20)"/><ellipse cx="60" cy="0" rx="30" ry="12" transform="rotate(-10 60 0)"/><ellipse cx="380" cy="30" rx="46" ry="16" transform="rotate(-25 380 30)"/></g><path d="M0 250q30-40 60-10q30-36 70-4q40-34 80 0q40-40 90-6q40-30 100 6V300H0z" fill="#245A36"/><g fill="#FFE08A"><circle cx="40" cy="268" r="4"/><circle cx="150" cy="276" r="4"/><circle cx="300" cy="270" r="4"/></g><g fill="#FF9FB4"><circle cx="90" cy="284" r="4"/><circle cx="232" cy="286" r="4"/><circle cx="362" cy="280" r="4"/></g></svg>`,
    grotto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><path d="M0 0h400v22q-20 16-40 0t-40 6-40-4-40 8-40-6-40 4-40-8-40 6-40-6-40 2z" fill="#B9A6FF" opacity=".25"/><g opacity=".8"><path d="M18 300l18-74 16 74z" fill="#7FE0D2"/><path d="M48 300l12-48 12 48z" fill="#C6A9FF"/><path d="M330 300l20-84 18 84z" fill="#C6A9FF"/><path d="M364 300l12-52 12 52z" fill="#7FE0D2"/></g><circle cx="40" cy="250" r="40" fill="#7FE0D2" opacity=".12"/><circle cx="350" cy="250" r="44" fill="#C6A9FF" opacity=".14"/><g fill="#fff" opacity=".6"><circle cx="70" cy="80" r="2"/><circle cx="320" cy="120" r="2"/><circle cx="200" cy="50" r="1.6"/></g><path d="M0 286h400v14H0z" fill="#2A2048"/></svg>`,
    hill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><g fill="#fff" opacity=".8"><circle cx="30" cy="24" r="1.6"/><circle cx="80" cy="54" r="1.1"/><circle cx="130" cy="16" r="1.4"/><circle cx="260" cy="30" r="1.2"/><circle cx="330" cy="60" r="1.6"/><circle cx="372" cy="20" r="1.1"/></g><circle cx="200" cy="178" r="56" fill="#FFD447" opacity=".12"/><path d="M0 252q100-62 200-62t200 62V300H0z" fill="#2C2B5A"/><g fill="#3D3C74"><rect x="150" y="160" width="20" height="34"/><rect x="176" y="148" width="36" height="46"/><rect x="218" y="158" width="18" height="36"/><rect x="240" y="168" width="18" height="26"/><path d="M174 148l20-14 20 14z"/></g><path d="M186 194v-18a8 8 0 0116 0v18z" fill="#FFE08A" opacity=".9"/></svg>`
  };

  function css() {
    if (document.getElementById('lamp-css')) return;
    const s = document.createElement('style'); s.id = 'lamp-css';
    s.textContent = `
      .stage.lp-wide{max-width:1200px}
      .lp-wrap{position:relative;display:grid;gap:12px;grid-template-areas:"head" "board" "ctrl";padding:clamp(8px,2vw,16px);border-radius:18px;border:3px solid var(--line);color:#fff;overflow:hidden;background:var(--deco,none) center bottom/cover no-repeat,var(--env)}
      .lp-head{grid-area:head;display:grid;gap:8px;min-width:0}
      .lp-main{grid-area:board;position:relative;display:grid;place-items:center;min-width:0}
      .lp-ctrl{grid-area:ctrl;display:grid;gap:10px;align-content:start;min-width:0}
      .lp-info{display:grid;gap:6px}
      @media (orientation:landscape) and (min-width:640px){
        .lp-wrap{grid-template-columns:minmax(0,1fr) minmax(250px,330px);grid-template-areas:"board head" "board ctrl";grid-template-rows:auto 1fr;align-items:start}
      }
      .env-dawn{--env:linear-gradient(180deg,#2C3570 0%,#5B4B86 55%,#C9876A 100%);--board:#232A4F;--tile:#40446B;--tile2:#353960;--groove:#22264A;--path:#7A7CA3;--litbg:#5E4C2C}
      .env-garden{--env:linear-gradient(180deg,#1E4A47,#2F6B47 60%,#6E9A4E);--board:#1A3C2C;--tile:#5E4934;--tile2:#4E3B2A;--groove:#2E2216;--path:#9A7A54;--litbg:#6B5426}
      .env-grotto{--env:linear-gradient(180deg,#2E2A5C,#4C3A78 55%,#8B5A8E);--board:#251F45;--tile:#463E70;--tile2:#3A3360;--groove:#231D40;--path:#7C71AE;--litbg:#604A6A}
      .env-hill{--env:linear-gradient(180deg,#1F2E66,#45539A 50%,#E7A866);--board:#1E2550;--tile:#4C4A6A;--tile2:#3F3D5C;--groove:#252344;--path:#9A8A66;--litbg:#6A5428}
      .lp-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .lp-title b{font-family:var(--display);font-weight:400;font-size:clamp(22px,3vw,30px);text-shadow:0 2px 0 rgba(0,0,0,.4)}
      .lp-title .rn{font-weight:800;font-size:13px;padding:3px 10px;border-radius:999px;background:rgba(10,14,30,.45);border:2px solid rgba(255,255,255,.3)}
      .lp-title .dpill{background:#fff}
      .lp-rounds{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:0;padding:0;list-style:none}
      .lp-rounds li{display:grid;justify-items:center;gap:2px;padding:4px 2px;border-radius:10px;background:rgba(10,14,30,.35);border:2px solid rgba(255,255,255,.2);font-weight:800;font-size:12px;line-height:1.1}
      .lp-rounds li.now{border-color:#FFD447;background:rgba(255,212,71,.2)}
      .lp-rounds li.on{background:rgba(255,212,71,.35);border-color:#FFE58A}
      .lp-rounds .stars{display:flex;gap:1px;color:#fff}.lp-rounds .stars svg{width:13px;height:13px}
      .lp-verse{display:flex;flex-wrap:wrap;gap:6px;margin:0;font-family:var(--display);font-size:clamp(17px,2.3vw,22px);line-height:1.25}
      .lp-verse span{padding:3px 9px;border-radius:9px;background:rgba(255,255,255,.12);color:transparent;text-shadow:0 0 9px rgba(255,255,255,.55);border:2px dashed rgba(255,255,255,.4)}
      .lp-verse span.on{background:#FFE58A;color:#13203A;text-shadow:none;border:2px solid #13203A;box-shadow:0 0 16px rgba(255,212,71,.75)}
      .lp-verse span.new{animation:lpReveal 1.1s ease-out}
      .lp-ref{font-size:13px;font-weight:800;opacity:.9;font-style:normal}
      .fin .lp-verse{justify-content:center}
      @keyframes lpReveal{0%{transform:scale(.6);filter:brightness(2.2)}60%{transform:scale(1.12)}}
      .lp-hud{display:flex;flex-wrap:wrap;gap:6px}
      .lp-hud span{background:rgba(10,14,30,.45);border:2px solid rgba(255,255,255,.25);border-radius:999px;padding:3px 10px;font-weight:800;font-size:14px;font-variant-numeric:tabular-nums}
      .lp-btns{display:flex;flex-wrap:wrap;gap:8px}
      .lp-btns .btn{flex:1 1 auto;min-height:50px;font-size:16px;padding:10px 14px}
      .lp-btns .btn small{font-size:13px;opacity:.85}
      .lp-btns .btn[disabled]{opacity:.5;cursor:default}
      .lp-done{background:#FFFDF4;color:#13203A;border:3px solid #13203A;border-radius:16px;padding:12px;display:grid;gap:6px;justify-items:center;text-align:center;animation:fadeUp .3s ease-out}
      .lp-done b{font-size:18px}.lp-done small{font-weight:700;color:#55627A}
      .lp-done .stars svg{width:30px;height:30px}
      .lp-board{--gap:clamp(3px,.7vw,6px);position:relative;display:grid;grid-template-columns:.6fr repeat(var(--n),minmax(0,1fr)) .6fr;gap:var(--gap);padding:clamp(6px,1.4vw,12px);border-radius:16px;background:var(--board);border:3px solid rgba(0,0,0,.5);box-shadow:inset 0 0 30px rgba(0,0,0,.4);touch-action:manipulation;user-select:none;-webkit-user-select:none;
        width:min(100%,max(calc(var(--n) * 44px + 80px),calc((100vh - var(--gbh,60px) - 270px) * var(--ratio))))}
      @media (orientation:landscape) and (min-width:640px){.lp-board{width:min(100%,960px,max(calc(var(--n) * 40px + 70px),calc((100vh - var(--gbh,60px) - 56px) * var(--ratio))))}}
      .lp-board.won{box-shadow:inset 0 0 30px rgba(0,0,0,.3),0 0 36px rgba(255,212,71,.55)}
      .lp-tile{position:relative;aspect-ratio:1;width:100%;padding:0;margin:0;display:block;border:2px solid rgba(0,0,0,.45);border-radius:clamp(6px,1.2vw,12px);background:linear-gradient(145deg,var(--tile),var(--tile2));cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;
        transition:background .35s var(--d,0ms),border-color .35s var(--d,0ms),box-shadow .35s var(--d,0ms)}
      .lp-tile::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 25%,rgba(255,255,255,.08) 0 2px,transparent 3px),radial-gradient(circle at 75% 70%,rgba(0,0,0,.12) 0 3px,transparent 4px),radial-gradient(circle at 70% 20%,rgba(255,255,255,.06) 0 2px,transparent 3px);pointer-events:none}
      .env-garden .lp-tile::before{background:repeating-linear-gradient(90deg,transparent 0 23%,rgba(0,0,0,.18) 23% 25%)}
      .lp-tile:hover{filter:brightness(1.12)}
      .lp-tile:focus-visible{outline:4px solid #fff;outline-offset:1px;z-index:2}
      .lp-tile.lit{background:linear-gradient(145deg,#8E6E34,var(--litbg));border-color:#FFD447;box-shadow:inset 0 0 16px rgba(255,212,71,.5)}
      .lp-tile .tl{position:absolute;inset:0;width:100%;height:100%;transform:rotate(calc(var(--r,0) * 90deg));transition:transform .3s cubic-bezier(.34,1.45,.55,1)}
      .lp-board path{fill:none}
      .lp-board .gl,.lp-demo .gl{stroke:#FFC21A;stroke-width:46;opacity:0;transition:opacity .35s var(--d,0ms)}
      .lp-board .gv,.lp-demo .gv{stroke:var(--groove);stroke-width:36}
      .lp-board .pv,.lp-demo .pv{stroke:var(--path);stroke-width:24}
      .lp-board .lt,.lp-demo .lt{stroke:#FFD447;stroke-width:15;opacity:0;transition:opacity .35s var(--d,0ms)}
      .lp-board .pt,.lp-demo .pt{stroke:#FFFBE6;stroke-width:5;stroke-linecap:round;stroke-dasharray:2 10;opacity:0}
      .hgv{fill:var(--groove)}.hpv{fill:var(--path)}.hlt{fill:#FFF1A8;opacity:0;transition:opacity .35s var(--d,0ms)}
      .lp-tile.lit .gl{opacity:.3}.lp-tile.lit .lt,.lp-tile.lit .hlt,.lp-board .lt.on{opacity:1}
      .lp-tile.lit .pt.in,.lp-tile.lit .pt.out,.lp-lamp .pt{opacity:.95;animation:lpFlow .8s linear infinite}
      .lp-tile.lit .pt.in{animation-name:lpFlowIn}
      @keyframes lpFlow{to{stroke-dashoffset:-24}}@keyframes lpFlowIn{to{stroke-dashoffset:24}}
      .lp-tile.route::after{content:"";position:absolute;inset:3px;border:2px dashed rgba(255,232,150,.8);border-radius:8px;pointer-events:none}
      .lp-tile.tap{animation:lpTap .22s ease-out}
      @keyframes lpTap{40%{transform:scale(.9)}}
      .lp-tile.tip{box-shadow:0 0 0 4px #FFD447,0 0 20px 4px rgba(255,212,71,.8);z-index:2}
      .lp-tile.clue{animation:lpClue .7s ease-in-out 3}
      @keyframes lpClue{50%{box-shadow:0 0 0 4px #9FE8FF,0 0 22px 6px rgba(159,232,255,.8)}}
      .lp-tile.spot{z-index:3;animation:lpSpot 1s ease-in-out infinite}
      @keyframes lpSpot{50%{box-shadow:0 0 0 4px #fff,0 0 24px 8px rgba(255,255,255,.6)}}
      .lp-tile.beam{animation:lpBeam .55s ease-out}
      @keyframes lpBeam{35%{transform:scale(1.08);filter:brightness(1.6)}}
      .lp-board.allglow .lp-tile{animation:lpWave 1s ease-out var(--w,0ms) both}
      @keyframes lpWave{0%{filter:brightness(1)}50%{filter:brightness(1.8)}100%{filter:brightness(1.18)}}
      .lp-gem{position:absolute;right:5%;top:5%;width:26%;height:26%;transition:transform .3s,filter .3s;filter:saturate(.35) brightness(.75)}
      .lp-gem.got{filter:none;animation:lpGem .8s ease-out}
      @keyframes lpGem{40%{transform:scale(1.6) rotate(12deg)}}
      .lp-edge{position:relative;display:block}
      .lp-edge svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
      .lp-lamp .halo{fill:#FFE58A;opacity:.28;animation:lpHalo 2.4s ease-in-out infinite}
      .lp-lamp .flame{transform-origin:43px 51px;animation:lpFlick 1.3s ease-in-out infinite}
      @keyframes lpFlick{50%{transform:scale(1.1,.9) rotate(-4deg)}}@keyframes lpHalo{50%{opacity:.45}}
      .lp-door .shine{fill:#FFF3C4;opacity:.25;transition:opacity .5s}
      .lp-door .leaf{transform-origin:19px 60px;transition:transform .8s cubic-bezier(.3,1.2,.4,1)}
      .reached .lp-door .lt{opacity:1}.reached .lp-door .shine{opacity:1}
      .reached .lp-door{filter:drop-shadow(0 0 8px #FFD447)}
      .open .lp-door .leaf{transform:scaleX(.12)}
      .lp-hand{position:absolute;left:0;top:0;width:56px;height:56px;pointer-events:none;z-index:6;transition:transform .55s ease-in-out,opacity .3s;filter:drop-shadow(0 3px 4px rgba(0,0,0,.45))}
      .lp-hand svg{width:100%;height:100%}
      .lp-hand.press svg{animation:lpPress .32s ease-in-out}
      @keyframes lpPress{50%{transform:scale(.8) translateY(4px)}}
      .lp-orb{position:absolute;left:0;top:0;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;pointer-events:none;z-index:5;background:radial-gradient(circle,#fff 0 25%,#FFE58A 45%,rgba(255,212,71,0) 72%);box-shadow:0 0 22px 10px rgba(255,212,71,.6);transition:transform .12s linear}
      .lp-spark{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#FFF3C4;box-shadow:0 0 8px #FFD447;pointer-events:none;z-index:5;animation:lpBurst .9s ease-out forwards}
      @keyframes lpBurst{to{transform:translate(var(--x),var(--y)) scale(.3);opacity:0}}
      .lp-float{position:absolute;margin:-12px 0 0 -16px;font-weight:900;font-size:16px;color:#FFF3C4;text-shadow:0 0 6px #13203A,0 1px 0 #13203A;pointer-events:none;z-index:6;animation:lpFloat 1s ease-out forwards}
      @keyframes lpFloat{to{transform:translateY(-30px);opacity:0}}
      .lp-banner{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:7}
      .lp-banner div{text-align:center;padding:12px 22px;border-radius:18px;background:rgba(10,14,30,.75);border:3px solid #FFD447;animation:lpBan 1.8s ease-out forwards}
      .lp-banner small{display:block;font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#FFE58A}
      .lp-banner b{font-family:var(--display);font-weight:400;font-size:clamp(26px,5vw,40px)}
      @keyframes lpBan{0%{opacity:0;transform:scale(.8)}15%,70%{opacity:1;transform:none}100%{opacity:0}}
      .lp-helpov{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:12px;background:rgba(10,14,30,.78)}
      .lp-hcard{width:min(460px,100%);max-height:100%;overflow:auto;background:var(--surface);color:var(--ink);border:3px solid var(--line);border-radius:20px;padding:16px;display:grid;gap:10px}
      .lp-hcard h3{font-size:26px;margin:0}
      .lp-hcard ol{margin:0;padding-left:22px;display:grid;gap:4px;font-weight:700}
      .lp-hcard p{margin:0;font-weight:700;color:var(--muted);font-size:15px}
      .lp-demo{position:relative;display:grid;grid-template-columns:.6fr 1fr 1fr .6fr;gap:4px;width:min(100%,300px);margin:0 auto;padding:8px;border-radius:14px;background:#232A4F;--tile:#40446B;--tile2:#353960;--groove:#22264A;--path:#7A7CA3;--litbg:#5E4C2C}
      .lp-demo .lp-tile{cursor:default}
      .lp-demo .t2 .tl{animation:lpDT 4.2s infinite}
      .lp-demo .t2 .lt,.lp-demo .t2 .hlt{animation:lpDL 4.2s infinite}
      .lp-demo .t2 .gl{animation:lpDG 4.2s infinite}
      .lp-demo .lp-door .lt,.lp-demo .lp-door .shine{animation:lpDL 4.2s infinite}
      .lp-demo .lp-door .leaf{animation:lpDD 4.2s infinite}
      .lp-demo .dh{position:absolute;left:58%;top:42%;width:42px;height:42px;animation:lpDH 4.2s infinite;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
      .lp-demo .dh svg{width:100%;height:100%}
      @keyframes lpDT{0%,30%{transform:rotate(0)}40%,100%{transform:rotate(90deg)}}
      @keyframes lpDL{0%,44%{opacity:0}52%,96%{opacity:1}100%{opacity:0}}
      @keyframes lpDG{0%,44%{opacity:0}52%,96%{opacity:.3}100%{opacity:0}}
      @keyframes lpDD{0%,56%{transform:none}66%,92%{transform:scaleX(.12)}100%{transform:none}}
      @keyframes lpDH{0%{opacity:0;transform:translate(40px,40px)}14%{opacity:1;transform:none}24%{transform:scale(.82)}30%{transform:none}48%{opacity:1}58%,100%{opacity:0}}
      .lp-final{display:block;max-width:340px;width:100%;margin:0 auto;pointer-events:none;padding:8px}
      .lp-final .lp-board{width:100%}
      .lp-stats{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
      .lp-stats span{font-weight:800;padding:4px 12px;border-radius:999px;background:var(--chip);color:var(--ink)}
      .lp-stats .nb{background:#FFE58A;color:#13203A;border:2px solid #13203A}
      .lp-reflect{width:100%;text-align:left;display:grid;gap:8px;padding:14px;border-radius:16px;border:3px solid var(--line);background:var(--bg)}
      .lp-reflect h3{font-size:22px;margin:0}.lp-reflect p{margin:0;font-weight:800}
      .lp-reflect .opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
      .lp-reflect .opts .btn{justify-content:flex-start;text-align:left;font-size:16px;min-height:50px}
      .lp-reflect .opts .btn.picked{box-shadow:0 0 0 4px var(--gold),0 4px 0 var(--line)}
      .lp-reflect .fb:empty{display:none}
      .lp-reflect .fb{padding:10px 12px;border-radius:14px;background:#FFF3C4;color:#13203A;border:3px solid #13203A;font-weight:800;animation:fadeUp .3s ease-out}
      .lp-reflect .fb small{display:block;font-weight:700;color:#55627A;margin-top:4px}
      .lp-menu-stats{margin:0;font-weight:800;color:var(--muted);text-align:center}
      .lp-tag{margin:0;text-align:center;font-family:var(--display);font-size:20px;color:var(--amber)}
      @media (max-width:560px){
        .stage.lp-wide{padding:6px;border-width:2px}
        .lp-wrap{padding:6px;gap:10px;border-width:2px;border-radius:14px}
        .lp-board{--gap:3px;padding:5px;border-width:2px;grid-template-columns:.45fr repeat(var(--n),minmax(0,1fr)) .45fr}
        .lp-board .lamp-edge svg{left:auto;right:0;width:133%}.lp-board .goal svg{width:133%}
        .stage.lp-wide{padding:4px}.lp-wrap{padding:5px}
        .gwrap:has(.stage.lp-wide){padding-left:6px;padding-right:6px}
        .lp-rounds li{font-size:11px;padding:3px 1px}
        .lp-title b{font-size:22px}
      }
      @media (prefers-reduced-motion:reduce){
        .lp-demo .t2 .tl{transform:rotate(90deg)}
        .lp-demo .t2 .lt,.lp-demo .t2 .hlt,.lp-demo .lp-door .lt,.lp-demo .lp-door .shine{opacity:1}
        .lp-demo .dh{display:none}
      }`;
    document.head.appendChild(s);
  }

  /* ---------- board building (always solvable) ---------- */
  function build(n, fill, loops) {
    // 1. Carve a maze: every cell is reachable from every other cell.
    const open = new Array(n * n).fill(0), seen = new Uint8Array(n * n), first = (Math.random() * n * n) | 0, stack = [first];
    seen[first] = 1;
    while (stack.length) {
      const c = stack[stack.length - 1], x = c % n, y = (c / n) | 0;
      const opts = DIRS.filter(([, dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]; });
      if (!opts.length) { stack.pop(); continue; }
      const [b, dx, dy, ob] = opts[(Math.random() * opts.length) | 0], nc = (y + dy) * n + x + dx;
      open[c] |= b; open[nc] |= ob; seen[nc] = 1; stack.push(nc);
    }
    // 2. Knock through a few extra walls so there is more than one way to the door.
    const walls = [];
    for (let c = 0; c < n * n; c++) {
      const x = c % n, y = (c / n) | 0;
      if (x < n - 1 && !(open[c] & E)) walls.push([c, E, c + 1, W]);
      if (y < n - 1 && !(open[c] & S)) walls.push([c, S, c + n, N]);
    }
    Ark.shuf(walls).slice(0, loops).forEach(([a, b, c2, ob]) => { open[a] |= b; open[c2] |= ob; });
    // 3. Lamp on the left edge, door on the right edge, on different rows.
    const lampRow = (Math.random() * n) | 0;
    let doorRow = (Math.random() * n) | 0;
    if (n > 2 && doorRow === lampRow) doorRow = (lampRow + 1 + ((Math.random() * (n - 1)) | 0)) % n;
    const s0 = lampRow * n, g = doorRow * n + n - 1;
    // 4. The maze path from lamp to door is a guaranteed solution.
    const prev = { [s0]: -1 }, q = [s0];
    while (q.length) {
      const c = q.shift(), x = c % n, y = (c / n) | 0;
      for (const [b, dx, dy] of DIRS) if (open[c] & b) { const nc = (y + dy) * n + x + dx; if (!(nc in prev)) { prev[nc] = c; q.push(nc); } }
    }
    const path = []; for (let c = g; c !== -1; c = prev[c]) path.unshift(c);
    const dirTo = (a, b) => { const d = b - a; return d === 1 ? E : d === -1 ? W : d === n ? S : N; };
    let want;
    if (fill === 'maze') { want = open.slice(); want[s0] |= W; want[g] |= E; }
    else {
      want = Array.from({ length: n * n }, () => rotK(Math.random() < .5 ? (N | S) : (N | E), rand4()));
      path.forEach((c, k) => { want[c] = (k ? dirTo(c, path[k - 1]) : W) | (k < path.length - 1 ? dirTo(c, path[k + 1]) : E); });
    }
    const tiles = want.map(m => { const { base, k } = canon(m); return { base, r: k, sol: k }; });
    return { tiles, path, s0, g, lampRow, doorRow, dirTo };
  }

  /* Which tiles the light reaches from the lamp. */
  function lightUp() {
    const { tiles, n, s0, g } = st, on = new Map();
    if (!(maskOf(tiles[s0]) & W)) return { on, win: false };
    on.set(s0, { p: -1, ent: W, d: 0 }); const q = [s0];
    while (q.length) {
      const c = q.shift(), x = c % n, y = (c / n) | 0, m = maskOf(tiles[c]), dd = on.get(c).d;
      for (const [b, dx, dy, ob] of DIRS) {
        if (!(m & b)) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const nc = ny * n + nx;
        if (!on.has(nc) && (maskOf(tiles[nc]) & ob)) { on.set(nc, { p: c, ent: ob, d: dd + 1 }); q.push(nc); }
      }
    }
    return { on, win: on.has(g) && !!(maskOf(tiles[g]) & E) };
  }

  /* Fewest taps needed to make ANY working route from the current board (Dijkstra over cell + entry side).
     Returns the cost and one cheapest route as [cell, rotation] pairs. */
  function solve() {
    const { tiles, n, s0, g } = st, M = n * n * 4;
    const dist = new Array(M).fill(Infinity), prev = new Int32Array(M).fill(-1), via = new Int8Array(M), done = new Uint8Array(M);
    dist[s0 * 4 + 3] = 0;
    let best = Infinity, bestId = -1, bestK = 0;
    for (;;) {
      let id = -1, d = Infinity;
      for (let j = 0; j < M; j++) if (!done[j] && dist[j] < d) { d = dist[j]; id = j; }
      if (id < 0 || d >= best) break;
      done[id] = 1;
      const c = id >> 2, inI = id & 3, t = tiles[c], x = c % n, y = (c / n) | 0;
      for (let oi = 0; oi < 4; oi++) {
        if (oi === inI) continue;
        const need = DIRS[inI][0] | DIRS[oi][0];
        let cost = 9, kk = 0;
        for (let k = 0; k < 4; k++) if ((rotK(t.base, k) & need) === need) { const f = fwd(t.r, k); if (f < cost) { cost = f; kk = k; } }
        if (cost === 9) continue;
        if (c === g && DIRS[oi][0] === E) { if (d + cost < best) { best = d + cost; bestId = id; bestK = kk; } continue; }
        const nx = x + DIRS[oi][1], ny = y + DIRS[oi][2];
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const nid = (ny * n + nx) * 4 + ((oi + 2) % 4);
        if (d + cost < dist[nid]) { dist[nid] = d + cost; prev[nid] = id; via[nid] = kk; }
      }
    }
    if (bestId < 0) return { cost: Infinity, route: null };
    const route = [[g, bestK]];
    for (let id = bestId; prev[id] !== -1; id = prev[id]) route.unshift([prev[id] >> 2, via[id]]);
    return { cost: best, route };
  }
  // Next tile to fix: from the cheapest route, or (as a safety net) along the maze's own path.
  function nextFix() {
    const { route } = solve();
    const r = route && route.find(([c, k]) => fwd(st.tiles[c].r, k) > 0);
    if (r) return r;
    for (let j = 0; j < st.path.length; j++) {
      const c = st.path[j], t = st.tiles[c], need = (j ? st.dirTo(c, st.path[j - 1]) : W) | (j < st.path.length - 1 ? st.dirTo(c, st.path[j + 1]) : E);
      let best = 9, kk = 0;
      for (let k = 0; k < 4; k++) if ((rotK(t.base, k) & need) === need && fwd(t.r, k) < best) { best = fwd(t.r, k); kk = k; }
      if (best > 0 && best < 9) return [c, kk];
    }
    return null;
  }

  function scramble(easyTutorial) {
    const { tiles, path } = st, onPath = new Set(path);
    if (easyTutorial) {
      // Round 1 on Easy: everything is ready except the first tile (the hand turns it) and the last one (the child turns it).
      tiles.forEach((t, c) => { t.r = onPath.has(c) ? t.sol : rand4(); });
      const a = tiles[path[0]], z = tiles[path[path.length - 1]];
      a.r = a.sol + 3;
      z.r = z.sol + (z.base === (N | S) ? 1 : 2);
      return;
    }
    // Try several shuffles; keep the first that is challenging enough, otherwise the most challenging one found.
    const min = MIN_COST[st.i];
    let keep = null, keepCost = -1;
    for (let tries = 0; tries < 60; tries++) {
      tiles.forEach(t => { t.r = rand4(); });
      for (let guard = 0; lightUp().win && guard < 30; guard++) { const t = tiles[path[(Math.random() * path.length) | 0]]; if (t.base !== 15) t.r++; }
      if (lightUp().win) continue;
      const cost = solve().cost;
      if (cost > keepCost) { keepCost = cost; keep = tiles.map(t => t.r); }
      if (cost >= min) return;
    }
    if (keep) tiles.forEach((t, c) => { t.r = keep[c]; });
    for (let guard = 0; lightUp().win && guard < 60; guard++) { const t = tiles[path[guard % path.length]]; if (t.base !== 15) t.r++; }
  }

  /* ---------- screens ---------- */
  const verseBar = (upto, fresh = -1) => `<p class="lp-verse" aria-label="${REF}: ${upto ? VERSE.slice(0, upto).join(' ') + (upto < 4 ? ' …' : '') : 'not found yet'}">${VERSE.map((p, k) => `<span class="${k < upto ? 'on' : ''}${k === fresh ? ' new' : ''}" aria-hidden="true">${p}</span>`).join('')}</p>`;
  const roundsList = () => `<ol class="lp-rounds" aria-label="Rounds">${ROUNDS.map((R, k) => `<li class="${k < run.stars.length ? 'on' : k === run.i ? 'now' : ''}">Round ${k + 1}${k < run.stars.length ? starRow(run.stars[k]) : k === run.i ? '<span>Now</span>' : '<span>&nbsp;</span>'}</li>`).join('')}</ol>`;

  function menu() {
    clearTimers(); st = null; el.classList.remove('lp-wide');
    const b = storeJSON('lamp-best') || {};
    Ark.menu(el, {
      id: 'lamp-path', title: 'Lamp to My Feet: Light the Way', icon: 'lamp', color: '#4A4E8C',
      blurb: 'Guide the lamp’s light through the dark and discover a special verse.',
      how: [['turn', 'Tap a tile to turn it'], ['lamp', 'Join the paths so the light reaches the door'], ['scroll', 'Discover Psalm 119:105']],
      listen: 'Tap the path tiles to turn them. When the paths join up, the lamp’s light travels along them. Get the light all the way to the door! Every path you light shows more of a special verse.',
      diffs: { easy: 'Small boards. The way is marked, and you get as many hints as you need.', normal: 'Bigger boards with twists and dead ends. 3 hints on each puzzle.', hard: 'The biggest boards, with branches and loops. No hints. You can do it!' },
      extra: `<p class="lp-tag">Connect the Path. Follow the Light. Discover God’s Word.</p>
        <p class="lp-menu-stats">Paths lit: ${paths()}${Ark.DIFFS.some(d => b[d]) ? ' · Best score: ' + Ark.DIFFS.filter(d => b[d]).map(d => `${Ark.DLABEL[d]} ${b[d]}`).join(', ') : ''}</p>`,
      start: d => { run = newRun(d); play(); }
    });
  }

  function play() {
    clearTimers(); helpOpen = false;
    const { diff, i } = run, C = CFG[diff], R = ROUNDS[i], n = C.sizes[i];
    st = Object.assign(build(n, C.fill[i], C.loops[i]), { n, i, diff, turns: 0, used: 0, hints: C.hints, clues: C.clues, lock: true, done: false, opt: 0, gems: new Set(), gemGot: new Set(), prevOn: new Set(), demo: null });
    const tutorial = i === 0 && (diff === 'easy' || !store('lamp-seen'));
    scramble(i === 0 && diff === 'easy');
    st.init = st.tiles.map(t => t.r);
    const inner = st.path.slice(1, -1);
    for (let j = 0; j < Math.min(GEMS[i], inner.length); j++) st.gems.add(inner[Math.floor((inner.length * (j + 1)) / (GEMS[i] + 1))]);
    const guide = C.guide ? new Set((solve().route || []).map(([c]) => c)) : new Set();

    const cells = [];
    for (let y = 0; y < n; y++) {
      cells.push(`<span class="lp-edge lamp-edge">${y === st.lampRow ? LAMP : ''}</span>`);
      for (let x = 0; x < n; x++) {
        const c = y * n + x;
        cells.push(`<button type="button" class="lp-tile${guide.has(c) ? ' route' : ''}" data-c="${c}" tabindex="${c === st.s0 ? 0 : -1}" style="--r:${st.tiles[c].r}">${tileSvg(st.tiles[c].base)}${st.gems.has(c) ? GEM : ''}</button>`);
      }
      cells.push(`<span class="lp-edge${y === st.doorRow ? ' goal" id="lpDoor' : ''}">${y === st.doorRow ? DOOR : ''}</span>`);
    }
    el.classList.add('lp-wide');
    el.innerHTML = `<div class="lp-wrap env-${R.env}">
      <div class="lp-head">
        <div class="lp-title"><span class="rn">Round ${i + 1} of 4</span><b>${R.name}</b><span class="dpill ${diff}">${Ark.DLABEL[diff]}</span></div>
        ${roundsList()}
        <div id="lpBar">${bar(i / 4, `Verse lit: ${i} of 4 parts`, 'gold')}</div>
      </div>
      <div class="lp-main"><div class="lp-board" id="lpBoard" role="group" aria-label="Puzzle board, ${n} by ${n} tiles. The lamp is on the left, the door is on the right." style="--n:${n};--ratio:${((n + 1.1) / n).toFixed(3)}">${cells.join('')}</div></div>
      <div class="lp-ctrl"><div class="lp-info">${verseBar(i)}<cite class="lp-ref">${REF}</cite><div class="lp-hud" id="lpHud"></div></div><div id="lpLearn"></div><div class="lp-btns" id="lpBtns"></div><div id="lpDone"></div></div>
    </div>`;
    $('.lp-wrap').style.setProperty('--deco', `url("data:image/svg+xml,${encodeURIComponent(DECO[R.env])}")`);
    const board = $('#lpBoard');
    board.addEventListener('click', e => { const b = e.target.closest('.lp-tile'); if (b) turn(+b.dataset.c); });
    board.addEventListener('keydown', onKey);
    learn($('#lpLearn'), R.tip, C.guide ? 'The dashed tiles show the way.' : '', { icon: Ark.I.turn, speak: diff === 'easy' && !tutorial });
    banner(`Round ${i + 1}`, R.name);
    buttons(); paint();
    Ark.ctl({ help: openHelp, pause: () => {}, resume: () => {}, restart: restartPuzzle });
    if (tutorial) later(demo, calm() ? 200 : 1900); else startControl();
  }

  function banner(top, big) {
    const host = $('.lp-main'); if (!host) return;
    const b = document.createElement('div'); b.className = 'lp-banner'; b.innerHTML = `<div><small>${top}</small><b>${big}</b></div>`;
    host.appendChild(b); later(() => b.remove(), 1850);
  }

  function startControl() {
    if (!st) return;
    st.lock = false; st.opt = solve().cost;
    buttons(); paint();
  }

  /* Round 1 demonstration: highlight a tile, a hand taps it, it turns, and the light flows on along the joined paths. */
  function demo() {
    if (!st) return;
    store('lamp-seen', 1);
    let fix = nextFix();
    // Keep at least one tile for the child to turn themselves.
    for (let guard = 0; guard < 12; guard++) {
      const r = solve().route || [];
      if (r.filter(([c, k]) => fwd(st.tiles[c].r, k) > 0).length >= 2) break;
      const others = st.path.filter(c => !fix || c !== fix[0]).filter(c => st.tiles[c].base !== 15);
      const t = st.tiles[others[(Math.random() * others.length) | 0]]; t.r++; st.init = st.tiles.map(x => x.r);
      paint(); fix = nextFix();
    }
    if (!fix) return startControl();
    const [c, k] = fix, times = fwd(st.tiles[c].r, k), tile = tileEl(c), board = $('#lpBoard');
    st.demo = [c, times];
    learn($('#lpLearn'), 'Watch! Tap a tile to turn it.', 'The light travels along paths that join up.', { icon: Ark.I.tap, speak: true });
    tile.classList.add('spot');
    const hand = document.createElement('div'); hand.className = 'lp-hand'; hand.innerHTML = Ark.I.tap; hand.style.opacity = '0';
    board.appendChild(hand);
    const at = (x, y) => { hand.style.transform = `translate(${x - 18}px,${y - 6}px)`; };
    at(board.clientWidth - 40, board.clientHeight - 20);
    const go = calm() ? 0.25 : 1;
    later(() => { hand.style.opacity = '1'; at(tile.offsetLeft + tile.offsetWidth / 2, tile.offsetTop + tile.offsetHeight / 2); }, 300 * go);
    for (let j = 0; j < times; j++) {
      later(() => {
        hand.classList.remove('press'); void hand.offsetWidth; hand.classList.add('press');
        st.tiles[c].r++; tapFx(tile); sfx.turn(); paint();
      }, (1100 + j * 650) * go);
    }
    const end = (1100 + times * 650) * go;
    later(() => {
      tile.classList.remove('spot');
      learn($('#lpLearn'), 'See the light move along the joined paths? Now you finish the path to the door!', 'Tap the tiles that are still dark.', { icon: Ark.I.lamp, speak: true });
    }, end + 300);
    later(() => { hand.style.opacity = '0'; startControl(); }, end + 700);
    later(() => hand.remove(), end + 1200);
  }

  const tileEl = c => $(`.lp-tile[data-c="${c}"]`);
  function tapFx(b) { b.classList.remove('tap'); void b.offsetWidth; b.classList.add('tap'); }

  function turn(c) {
    if (!st || st.lock || helpOpen) return;
    const t = st.tiles[c], b = tileEl(c);
    t.r++; tapFx(b); sfx.turn();
    if (t.base !== 15) st.turns++; // a cross looks the same every way round, so turning it is free
    paint();
  }

  function onKey(e) {
    const b = e.target.closest('.lp-tile'); if (!b || !st) return;
    const n = st.n, c = +b.dataset.c; let x = c % n, y = (c / n) | 0;
    if (e.key === 'ArrowLeft') x--; else if (e.key === 'ArrowRight') x++; else if (e.key === 'ArrowUp') y--; else if (e.key === 'ArrowDown') y++;
    else if (e.key === 'Home') x = 0; else if (e.key === 'End') x = n - 1; else return;
    e.preventDefault();
    x = Math.max(0, Math.min(n - 1, x)); y = Math.max(0, Math.min(n - 1, y));
    const to = tileEl(y * n + x); b.tabIndex = -1; to.tabIndex = 0; to.focus();
  }

  function paint() {
    if (!st || !$('#lpBoard')) return;
    const { tiles, n, g } = st, L = lightUp(), { on, win } = L, quick = calm();
    const fresh = [...on.keys()].filter(c => !st.prevOn.has(c)), minD = fresh.length ? Math.min(...fresh.map(c => on.get(c).d)) : 0;
    tiles.forEach((t, c) => {
      const b = tileEl(c), lit = on.has(c), x = c % n, y = (c / n) | 0;
      b.style.setProperty('--r', t.r);
      b.style.setProperty('--d', lit && !quick && !st.prevOn.has(c) ? (on.get(c).d - minD) * 60 + 'ms' : '0ms');
      b.classList.toggle('lit', lit);
      b.querySelectorAll('.pt').forEach(p => {
        const a = rotK(+p.dataset.b, t.r);
        let cls = '';
        if (lit) {
          if (a === on.get(c).ent) cls = 'in';
          else {
            const [, dx, dy, ob] = DIRS.find(D => D[0] === a), nx = x + dx, ny = y + dy, nc = ny * n + nx;
            if (nx >= 0 && ny >= 0 && nx < n && ny < n && on.has(nc) && (maskOf(tiles[nc]) & ob)) cls = 'out';
            else if (c === g && a === E) cls = 'out';
          }
        }
        p.setAttribute('class', 'pt ' + cls);
      });
      b.setAttribute('aria-label', `Tile, row ${y + 1}, column ${x + 1}, ${lit ? 'lit' : 'dark'}${st.gems.has(c) ? ', gem' : ''}. Press to turn.`);
    });
    $('#lpDoor').classList.toggle('reached', win);
    if (fresh.length && st.painted) sfx.light(fresh.length);
    if (!st.lock) st.gems.forEach(c => {
      if (on.has(c) && !st.gemGot.has(c)) {
        st.gemGot.add(c); const b = tileEl(c); b.querySelector('.lp-gem').classList.add('got'); sfx.gem();
        floatText(b.offsetLeft + b.offsetWidth / 2, b.offsetTop, '+25');
      }
    });
    st.prevOn = new Set(on.keys()); st.painted = true;
    hud();
    if (win && !st.lock && !st.done) celebrate(L);
  }

  function floatText(x, y, text) {
    const f = document.createElement('div'); f.className = 'lp-float'; f.textContent = text;
    f.style.left = x + 'px'; f.style.top = y + 'px'; $('#lpBoard').appendChild(f); later(() => f.remove(), 1100);
  }

  function hud() {
    const h = $('#lpHud'); if (!h) return;
    const best = bestOf(run.diff);
    h.innerHTML = `<span>Turns: ${st.turns}</span><span>Score: ${run.score}</span><span>Paths lit: ${paths()}</span>${st.gems.size ? `<span>Gems: ${st.gemGot.size} of ${st.gems.size}</span>` : ''}${best ? `<span>Best: ${best}</span>` : ''}`;
  }

  function buttons() {
    const box = $('#lpBtns'); if (!box) return;
    const C = CFG[st.diff], showClue = st.i === 2 && C.clues > 0, off = st.lock || st.done;
    box.innerHTML = `${C.hints > 0 ? `<button class="btn" id="lpHint" ${off ? 'disabled' : ''}>${BULB} Hint${C.hints !== Infinity ? ` <small>(${st.hints} left)</small>` : ''}</button>` : ''}
      ${showClue ? `<button class="btn ghost" id="lpClue" ${off || st.clues <= 0 ? 'disabled' : ''}>${GLASS} Clue${C.clues !== Infinity ? ` <small>(${st.clues})</small>` : ''}</button>` : ''}
      <button class="btn ghost" id="lpHow">${Ark.UI.help} How to play</button>
      <button class="btn ghost" id="lpReset" ${st.done ? 'disabled' : ''}>${Ark.UI.restart} Restart puzzle</button>`;
    const on = (id, fn) => { const b = $(id); if (b) b.onclick = fn; };
    on('#lpHint', hint); on('#lpClue', clue); on('#lpHow', openHelp); on('#lpReset', restartPuzzle);
  }

  function hint() {
    if (!st || st.lock || st.done) return;
    if (st.hints <= 0) return Ark.toast('No hints left on this puzzle. You can do it!');
    const fix = nextFix(); if (!fix) return;
    const [c, k] = fix, t = st.tiles[c], b = tileEl(c);
    st.hints--; st.used++;
    t.r += fwd(t.r, k);
    b.classList.add('tip'); later(() => b.classList.remove('tip'), 1000);
    say('Here is a tile turned for you.');
    paint(); if (!st.done) buttons();
  }

  function clue() {
    if (!st || st.lock || st.done || st.clues <= 0) return;
    const { route } = solve(); if (!route) return;
    st.clues--;
    route.forEach(([c]) => { const b = tileEl(c); b.classList.remove('clue'); void b.offsetWidth; b.classList.add('clue'); later(() => b.classList.remove('clue'), 2200); });
    say('Look! The glowing tiles show one way to the door.');
    buttons();
  }

  function restartPuzzle() {
    if (!st) return;
    if (st.done) { // after a win: play this round again with a fresh board
      run.i = st.i; run.stars.length = st.i; run.score -= run.pts[st.i] || 0; run.pts.length = st.i;
      return play();
    }
    clearTimers();
    el.querySelectorAll('.lp-hand,.lp-spot,.lp-float').forEach(x => x.remove());
    el.querySelectorAll('.lp-tile.spot').forEach(x => x.classList.remove('spot'));
    st.tiles.forEach((t, c) => { t.r = st.init[c] + (st.demo && st.demo[0] === c ? st.demo[1] : 0); });
    st.turns = 0; st.used = 0; st.hints = CFG[st.diff].hints; st.clues = CFG[st.diff].clues;
    st.gemGot.clear(); el.querySelectorAll('.lp-gem.got').forEach(x => x.classList.remove('got'));
    st.prevOn = new Set();
    Ark.toast('Puzzle restarted');
    startControl();
  }

  /* ---------- winning a round: the light races along the route, the door opens, the verse appears ---------- */
  function celebrate(L) {
    st.lock = true; st.done = true;
    const route = []; for (let c = st.g; c !== -1; c = L.on.get(c).p) route.unshift(c);
    const extra = Math.max(0, st.turns - st.opt) + st.used * 2;
    const stars = extra <= 2 ? 3 : extra <= Math.max(4, st.opt) ? 2 : 1;
    const pts = 100 + Math.max(0, 60 - 12 * extra) + st.gemGot.size * 25;
    const i = st.i;
    run.stars.push(stars); run.pts.push(pts); run.score += pts; run.i++;
    store('lamp-paths', paths() + 1);
    buttons();
    Ark.ctl({ help: openHelp, restart: restartPuzzle });

    const board = $('#lpBoard'), quick = calm(), step = quick ? 0 : 115;
    board.classList.add('won');
    const centre = node => [node.offsetLeft + node.offsetWidth / 2, node.offsetTop + node.offsetHeight / 2];
    const lampCell = board.querySelectorAll('.lamp-edge')[st.lampRow], door = $('#lpDoor');
    let orb = null;
    if (!quick) {
      orb = document.createElement('div'); orb.className = 'lp-orb';
      const [lx, ly] = centre(lampCell); orb.style.transform = `translate(${lx}px,${ly}px)`; board.appendChild(orb);
    }
    route.forEach((c, k) => later(() => {
      const b = tileEl(c); b.classList.remove('beam'); void b.offsetWidth; b.classList.add('beam');
      if (orb) { const [x, y] = centre(b); orb.style.transform = `translate(${x}px,${y}px)`; }
      if (k % 2 === 0) tone(520 + k * 30, .12, { vol: .035 });
    }, 200 + k * step));
    const T = 200 + route.length * step;
    later(() => {
      const [dx, dy] = centre(door);
      if (orb) orb.style.transform = `translate(${dx}px,${dy}px)`;
      door.classList.add('open'); sfx.door();
      if (!quick) for (let j = 0; j < 14; j++) {
        const s = document.createElement('div'), a = (j / 14) * Math.PI * 2, r = 40 + Math.random() * 40;
        s.className = 'lp-spark'; s.style.left = dx + 'px'; s.style.top = dy + 'px';
        s.style.setProperty('--x', Math.cos(a) * r + 'px'); s.style.setProperty('--y', Math.sin(a) * r + 'px');
        board.appendChild(s); later(() => s.remove(), 1000);
      }
    }, T);
    later(() => {
      if (orb) orb.remove();
      sfx.win();
      $('.lp-verse').outerHTML = verseBar(run.i, i);
      setBar($('#lpBar .pbar'), run.i / 4, `Verse lit: ${run.i} of 4 parts`);
      $('.lp-rounds').outerHTML = roundsList();
      learn($('#lpLearn'), `“${VERSE[i]}”`, ROUNDS[i].lesson, { icon: Ark.I.lamp });
      say(`${VERSE[i]}. ${ROUNDS[i].lesson}`);
      const msg = stars === 3 ? 'Brilliant! You found a really short way.' : stars === 2 ? 'Great job! The light reached the door.' : 'You did it! Every way to the door counts. Try fewer turns next time.';
      const done = $('#lpDone');
      done.innerHTML = `<div class="lp-done">${starRow(stars)}<b>${msg}</b>
        <small>${st.turns} turn${st.turns === 1 ? '' : 's'} · fewest possible: ${st.opt}${st.used ? ` · ${st.used} hint${st.used > 1 ? 's' : ''}` : ''}${st.gemGot.size ? ` · ${st.gemGot.size} gem${st.gemGot.size > 1 ? 's' : ''}` : ''} · +${pts} points</small>
        ${run.i < 4 ? `<button class="btn big" id="lpNext">Next puzzle ${Ark.UI.play}</button>` : ''}</div>`;
      hud();
      if (run.i < 4) {
        const nx = $('#lpNext'); nx.onclick = play; nx.focus({ preventScroll: true });
        if (nx.getBoundingClientRect().bottom > innerHeight) nx.scrollIntoView({ block: 'nearest', behavior: quick ? 'auto' : 'smooth' });
      } else finale();
    }, T + 650);
  }

  /* Round 4: the whole board lights up before the final screen. */
  function finale() {
    const board = $('#lpBoard'), { n, s0 } = st, sx = s0 % n, sy = (s0 / n) | 0;
    board.querySelectorAll('.lp-tile').forEach(b => {
      const c = +b.dataset.c, d = Math.abs(c % n - sx) + Math.abs(((c / n) | 0) - sy);
      b.style.setProperty('--w', d * 70 + 'ms'); b.style.setProperty('--d', d * 70 + 'ms'); b.classList.add('lit');
    });
    board.classList.add('allglow');
    banner('Psalm 119:105', 'The whole verse is shining!');
    later(() => { st.final = board.outerHTML; finish(); }, calm() ? 1200 : 2800);
  }

  const REFLECT = [
    ['Pray and ask God to help me', 'Great idea! The Bible says, “If any of you lack wisdom, let him ask of God” (James 1:5). God loves to help us.'],
    ['Look at what the Bible says', 'Yes! That is just what Psalm 119:105 means. God’s Word is like a lamp: it shows us the next step to take.'],
    ['Choose the honest way, even if it is hard', 'Well chosen. “They that deal truly are his delight” (Proverbs 12:22). Telling the truth keeps us on God’s path.'],
    ['Choose the kind way', 'Lovely! “Be ye kind one to another” (Ephesians 4:32). Kindness helps light the way for other people too.'],
    ['Ask a grown-up I trust, like a parent or teacher', 'That is wise. Proverbs 15:22 teaches that good plans come from listening to good advice (that is a paraphrase, not the exact words).'],
    ['Just guess and hope for the best', 'We all feel unsure sometimes! Instead of guessing, you can stop, pray, and remember what God’s Word says. Try another idea too!']
  ];

  function finish() {
    clearTimers();
    const diff = run.diff, stars = Math.max(1, Math.round(run.stars.reduce((a, b) => a + b, 0) / run.stars.length));
    const best = storeJSON('lamp-best') || {}, prev = best[diff] || 0, isBest = run.score > prev;
    if (isBest) { best[diff] = run.score; storeJSON('lamp-best', best); }
    const mini = (st && st.final || '').replace(/<button\b/g, '<span').replace(/<\/button>/g, '</span>').replace(/\s(id|tabindex|data-c|aria-label|role)="[^"]*"/g, '');
    el.classList.remove('lp-wide');
    Ark.finish(el, {
      id: 'lamp-path', diff, stars, title: 'The whole verse is shining!',
      html: `${mini ? `<div class="lp-wrap env-hill lp-final" aria-hidden="true">${mini}</div>` : ''}
        <div class="lp-stats"><span>Score: ${run.score}</span>${isBest && prev ? '<span class="nb">New personal best!</span>' : `<span>Best: ${Math.max(prev, run.score)}</span>`}<span>Paths lit: ${paths()}</span></div>`,
      verse: [FULL, REF],
      lesson: `<b>What it means:</b> When it’s dark, a lamp shows you where to put your feet, one step at a time. God’s Word, the Bible, is like that lamp. When you’re not sure which way to go, it shows you what is true, right and kind.<br><small>In other words (a paraphrase, not a quotation): God’s Word is a lamp to guide our steps and a light to show us the way.</small>`,
      again: () => { run = newRun(diff); play(); }, menu,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-lamp-path', d); run = newRun(d); play(); }] : null
    });
    st = null;
    // Optional reflection: never required to move on.
    const box = document.createElement('div'); box.className = 'lp-reflect';
    box.innerHTML = `<h3>Think about it</h3><p>What can you do when you’re unsure which decision to make?</p>
      <div class="opts">${REFLECT.map(([t], k) => `<button class="btn ghost" data-k="${k}">${t}</button>`).join('')}</div><div class="fb" role="status"></div>`;
    const lesson = el.querySelector('.fin .lesson'); if (lesson) lesson.after(box);
    box.querySelectorAll('[data-k]').forEach(b => (b.onclick = () => {
      box.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('picked', x === b));
      const [, fb] = REFLECT[+b.dataset.k];
      box.querySelector('.fb').innerHTML = `${fb}<small>Psalm 119:105 reminds us: God’s Word lights the way, one step at a time.</small>`;
      say(fb);
    }));
  }

  /* ---------- How to play (also the game bar's Help button) ---------- */
  function openHelp() {
    const wrap = $('.lp-wrap'); if (!wrap || helpOpen) return;
    helpOpen = true;
    const d = st ? st.diff : 'easy';
    const tA = `<span class="lp-tile lit" style="--r:1">${tileSvg(N | S).replace(/class="pt" d="M50 50V0" data-b="1"/, 'class="pt out" d="M50 50V0"').replace(/class="pt" d="M50 50V100" data-b="4"/, 'class="pt in" d="M50 50V100"')}</span>`;
    const tB = `<span class="lp-tile t2" style="--r:0">${tileSvg(N | S)}</span>`;
    const ov = document.createElement('div'); ov.className = 'lp-helpov';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'lpHT');
    ov.innerHTML = `<div class="lp-hcard">
      <h3 id="lpHT">How to play</h3>
      <div class="lp-demo lp-board" aria-hidden="true" style="--n:2;width:min(100%,300px)"><span class="lp-edge">${LAMP}</span>${tA}${tB}<span class="lp-edge goal">${DOOR}</span><span class="dh">${Ark.I.tap}</span></div>
      <ol><li><b>Tap</b> a tile to turn it.</li><li><b>Join</b> the paths so they touch.</li><li>The <b>light</b> travels along joined paths. Lit paths glow gold and sparkle. Dark paths are not joined yet.</li><li>Get the light to the <b>door</b> to open it!</li></ol>
      <p>${d === 'easy' ? 'Easy: the dashed tiles show the way, and Hint turns a tile for you.' : d === 'normal' ? 'Normal: you have 3 hints on each puzzle.' : 'Hard: there are no hints, but any way that reaches the door wins.'} Fewer turns earn more stars.</p>
      <p>Keyboard: arrow keys move between tiles. Enter or Space turns a tile.</p>
      <div class="row">${Ark.canSpeak ? `<button class="btn ghost" id="lpHL">${Ark.UI.listen} Listen</button>` : ''}<button class="btn big" id="lpHOk">Got it!</button></div></div>`;
    wrap.appendChild(ov);
    const close = () => { helpOpen = false; ov.remove(); hush(); const t = $('.lp-tile[tabindex="0"]'); if (t) t.focus({ preventScroll: true }); };
    ov.querySelector('#lpHOk').onclick = close;
    const l = ov.querySelector('#lpHL'); if (l) l.onclick = () => say('Tap a tile to turn it. Join the paths so they touch. The light travels along joined paths, and lit paths glow gold. Get the light to the door to open it!', true);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } });
    ov.querySelector('#lpHOk').focus({ preventScroll: true });
  }

  Ark.games['lamp-path'] = {
    mount(stage) { el = stage; css(); menu(); },
    unmount() { clearTimers(); st = null; helpOpen = false; hush(); if (el) el.classList.remove('lp-wide'); },
    _test: { state: () => st, run: () => run, turn: c => turn(c), solve: () => st && solve(), lightUp: () => st && lightUp(), build, hint: () => hint(), play: (d, i) => { clearTimers(); run = newRun(d); for (let k = 0; k < i; k++) { run.stars.push(3); run.pts.push(0); } run.i = i; play(); } }
  };
})();
