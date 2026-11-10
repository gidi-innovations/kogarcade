/* Queen Esther: Courage of a Queen (Book of Esther). Discover. Decide. Be Courageous.
   A walk-around palace adventure in five stages:
   1 Explore the Palace (Esther 1–2)   2 The Secret Plot (Esther 2:21–4:9)   3 Esther's Courage (Esther 4:10–5:1)
   4 The Golden Sceptre (Esther 5:1–4)  5 The Royal Banquet (Esther 5:4–9:28)
   Choices never change what happened in the Bible: they help children understand Esther's situation, wisdom and courage.
   Names follow the NIV (King Xerxes, Susa, Hathak, Bigthana, Harbona). Quotations are KJV (public domain), which says Ahasuerus,
   Shushan and Hatach; an explainer in Stage 1 tells children both names. Text labels: "The Bible says" = KJV quotation; "(summary)" = the Bible's events in our own words; "Explainer" = commentary.
   All pictures are drawn in code (SVG) and all sounds are made in code (Web Audio), so there are no outside assets. */
(() => {
  const { store, storeJSON, say, hush, shuf, canSpeak } = Ark;
  const ink = '#13203A', VW = 960, VH = 540, FLOOR = 470, SPEED = 300;
  const ID = 'queen-esther';

  /* ---------- difficulty ---------- */
  const D = {
    easy: { arrow: true, spark: 1, guards: 4, psst: [1.6, 2.2], decoy: 0, decree: 3, decreeSil: true, houses: 5, blink: false, steps: 5, zone: .34, sweep: .5, moveZone: false, table: 4, tableSil: true, scrolls: 6, s2Extra: false },
    normal: { arrow: false, spark: 1, guards: 5, psst: [1.1, 2.6], decoy: .4, decree: 4, decreeSil: true, houses: 7, blink: false, steps: 6, zone: .24, sweep: .75, moveZone: false, table: 5, tableSil: true, scrolls: 8, s2Extra: true },
    hard: { arrow: false, spark: 0, guards: 6, psst: [.7, 3], decoy: .8, decree: 5, decreeSil: false, houses: 9, blink: true, steps: 7, zone: .16, sweep: 1, moveZone: true, table: 6, tableSil: false, scrolls: 10, s2Extra: true }
  };
  const STAGES = [
    { t: 'Explore the Palace', ic: '🏛️', ref: 'Esther 1–2', how: [['👆', 'Tap to walk'], ['✦', 'Find story stars'], ['👑', 'Crown the queen']] },
    { t: 'The Secret Plot', ic: '🔍', ref: 'Esther 2:21–4:9', how: [['👂', 'Spot the whisperers'], ['🧩', 'Rebuild the decree'], ['📜', 'Collect clues']] },
    { t: 'Esther’s Courage', ic: '💛', ref: 'Esther 4:10–5:1', how: [['🤔', 'Make choices'], ['🏠', 'Gather the people'], ['☀️', 'Three days']] },
    { t: 'Esther Before King Xerxes – The Golden Sceptre', ic: '✨', ref: 'Esther 5:1–4', how: [['👣', 'Brave steps to the inner court'], ['⏱️', 'Tap in the gold zone'], ['🪄', 'Touch the sceptre']] },
    { t: 'The Royal Banquet', ic: '🍇', ref: 'Esther 5–9', how: [['🍞', 'Set the table'], ['📜', 'Find the record'], ['👉', 'Reveal the enemy']] }
  ];

  /* ---------- sounds (made in code, only when Sound is on) ---------- */
  const SFX = (() => {
    let ctx = null;
    const ac = () => { if (!Ark.voiceOn()) return null; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; };
    function tone(f, d, o = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0), osc = c.createOscillator(), gn = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + d);
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(o.vol || .06, t + .012); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      osc.connect(gn).connect(c.destination); osc.start(t); osc.stop(t + d + .05);
    }
    return {
      find: () => [880, 1175, 1568].forEach((f, i) => tone(f, .28, { at: i * .07, vol: .05 })),
      good: () => [659, 880].forEach((f, i) => tone(f, .22, { at: i * .09, vol: .06 })),
      oops: () => tone(240, .3, { type: 'triangle', slide: 160, vol: .05 }),
      step: () => tone(150, .12, { type: 'triangle', vol: .07 }),
      beat: () => { tone(72, .14, { vol: .14 }); tone(60, .16, { vol: .11, at: .17 }); },
      pop: () => tone(620, .08, { vol: .04 }),
      roll: () => { for (let i = 0; i < 18; i++) tone(110 + i * 5, .06, { at: i * .07, vol: .02 + i * .003, type: 'square' }); },
      fan: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .32, { at: i * .12, vol: .06, type: 'triangle' })),
      day: () => [392, 523, 659].forEach((f, i) => tone(f, .4, { at: i * .15, vol: .04 }))
    };
  })();

  /* ---------- characters (drawn standing, feet at 0,0, about 180 units tall) ---------- */
  const P = {
    esther: { robe: '#B58CE0', trim: '#FFF3C4', hair: '#2B1A12', skin: '#C68A5A', head: 'band', long: 1, cheek: 1 },
    queen: { robe: '#6B3FA0', trim: '#FFD447', hair: '#2B1A12', skin: '#C68A5A', head: 'crown', long: 1, cheek: 1 },
    royal: { robe: '#7A2E8C', trim: '#FFD447', hair: '#2B1A12', skin: '#C68A5A', head: 'crown', long: 1, cheek: 1, cape: '#E8B730' },
    mordecai: { robe: '#7B5B3A', trim: '#E9D3A6', skin: '#B57A4E', head: 'turban', hat: '#EDE3CF', beard: '#E8E4DC', hair: '#E8E4DC' },
    sack: { robe: '#8C7B5A', trim: '#6D5F45', skin: '#B57A4E', head: 'none', beard: '#E8E4DC', hair: '#E8E4DC', ash: 1, face: 'sad' },
    honour: { robe: '#1F55D6', trim: '#FFD447', skin: '#B57A4E', head: 'turban', hat: '#FFFFFF', beard: '#E8E4DC', hair: '#E8E4DC', cape: '#7A2E8C' },
    hegai: { robe: '#2E9E6B', trim: '#FFD447', skin: '#A86F45', head: 'turban', hat: '#F2A007', hair: '#3A2418' },
    king: { robe: '#C0392B', trim: '#FFD447', skin: '#C68A5A', head: 'kingcrown', beard: '#2B1A12', hair: '#2B1A12', cape: '#7A2E8C', s: 1.08 },
    haman: { robe: '#2B4A3A', trim: '#B8264A', skin: '#C9A07A', head: 'tall', beard: '#4A2E1E', hair: '#4A2E1E', face: 'sly' },
    guard: { robe: '#3E6FA8', trim: '#C9CED6', skin: '#A86F45', head: 'helmet', beard: '#3A2418', hair: '#3A2418', spear: 1 },
    hatach: { robe: '#F28C28', trim: '#FFF3C4', skin: '#8E5B36', head: 'turban', hat: '#FFF3C4', hair: '#2B1A12' },
    maid: { robe: '#5DA9F0', trim: '#FFFFFF', skin: '#D9A273', head: 'veil', veil: '#FFFFFF', hair: '#3A2418', long: 1, cheek: 1 },
    person1: { robe: '#14946B', trim: '#FFF3C4', skin: '#A86F45', head: 'veil', veil: '#E9D3A6', hair: '#2B1A12', long: 1, cheek: 1, face: 'sad' },
    person2: { robe: '#8B5A2B', trim: '#E9D3A6', skin: '#C68A5A', head: 'turban', hat: '#E9D3A6', beard: '#2B1A12', hair: '#2B1A12', face: 'sad' },
    child: { robe: '#F2A007', trim: '#FFF3C4', skin: '#C68A5A', head: 'none', hair: '#2B1A12', s: .7, face: 'sad' },
    harbonah: { robe: '#5B6B8A', trim: '#FFD447', skin: '#A86F45', head: 'turban', hat: '#C9CED6', hair: '#2B1A12' }
  };
  function fig(key, over = {}) {
    const o = Object.assign({}, P[key] || P.esther, over), s = o.s || 1, r = o.robe, t = o.trim, sk = o.skin, face = o.face || 'smile';
    const arm = (side, pose) => {
      const x = side * 23; let hx = side * 33, hy = -50;
      if (pose === 'up') { hx = side * 48; hy = -170; } else if (pose === 'fwd') { hx = side * 58; hy = -104; } else if (pose === 'hold') { hx = side * 34; hy = -86; } else if (pose === 'cover') { hx = side * 9; hy = -132; }
      const d = `M${x} -106 Q${(x + hx) / 2 + side * 9} ${(-106 + hy) / 2 + 6} ${hx} ${hy}`;
      return `<path d="${d}" stroke="${ink}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${r}" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="7" fill="${sk}" stroke="${ink}" stroke-width="2.5"/>`;
    };
    const brows = face === 'angry' || face === 'sly' ? `<path d="M-14 -150 L-3 -145 M14 -150 L3 -145" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
      : face === 'sad' || face === 'worry' ? `<path d="M-14 -146 L-4 -150 M14 -146 L4 -150" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>` : '';
    const mouth = { smile: 'M-7 -128 Q0 -121 7 -128', sad: 'M-7 -124 Q0 -130 7 -124', angry: 'M-8 -124 Q0 -131 8 -124', sly: 'M-8 -127 Q2 -123 8 -129', worry: 'M-5 -126 Q0 -129 5 -126' }[face];
    const head = {
      crown: `<path d="M-17 -153 L-15 -175 L-7 -163 L0 -180 L7 -163 L15 -175 L17 -153Z" fill="url(#qeGold)" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-160" r="3.2" fill="#D7263D" stroke="${ink}" stroke-width="1.4"/>`,
      kingcrown: `<path d="M-20 -151 V-186 L-12 -175 L-6 -191 L0 -177 L6 -191 L12 -175 L20 -186 V-151Z" fill="url(#qeGold)" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-20 -160 H20" stroke="#D7263D" stroke-width="4"/>`,
      turban: `<path d="M-25 -146 Q-29 -174 0 -176 Q29 -174 25 -146 Q0 -157 -25 -146z" fill="${o.hat}" stroke="${ink}" stroke-width="2.6"/><path d="M-20 -160 Q0 -150 22 -166" stroke="${ink}" stroke-width="1.6" fill="none" opacity=".5"/>`,
      tall: `<path d="M-19 -150 L-15 -199 Q0 -205 15 -199 L19 -150 Q0 -158 -19 -150z" fill="#24233F" stroke="${ink}" stroke-width="2.6"/><path d="M-18 -160 Q0 -166 18 -160" stroke="#B8264A" stroke-width="5" fill="none"/>`,
      helmet: `<path d="M-24 -146 Q-25 -174 0 -176 Q25 -174 24 -146z" fill="#AEB6C6" stroke="${ink}" stroke-width="2.6"/><path d="M0 -176 V-188" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`,
      band: `<path d="M-22 -151 Q0 -160 22 -151" stroke="${t}" stroke-width="4" fill="none"/><circle cx="0" cy="-157" r="3" fill="#FFD447" stroke="${ink}" stroke-width="1.4"/>`,
      veil: `<path d="M-24 -148 Q-26 -172 0 -173 Q26 -172 24 -148" fill="${o.veil}" stroke="${ink}" stroke-width="2.4"/>`,
      none: ''
    }[o.head || 'none'];
    const back = (o.long ? `<path d="M-25 -136 Q-31 -92 -20 -82 H20 Q31 -92 25 -136 Z" fill="${o.hair}" stroke="${ink}" stroke-width="2.5"/>` : '')
      + (o.head === 'veil' ? `<path d="M-27 -146 L-34 -88 Q0 -96 34 -88 L27 -146Z" fill="${o.veil}" stroke="${ink}" stroke-width="2.4"/>` : '');
    const cape = o.cape ? `<path d="M-27 -112 L-42 0 H42 L27 -112Z" fill="${o.cape}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>` : '';
    const L = o.armL || 'side', R = o.armR || (o.spear ? 'hold' : 'side');
    const extra = (o.spear ? `<path d="M36 22 V-232" stroke="#7A4E25" stroke-width="5" stroke-linecap="round"/><path d="M36 -250 l-8 20 h16z" fill="#D7DCE4" stroke="${ink}" stroke-width="2"/>` : '')
      + (o.sceptre ? `<path d="M48 -170 L96 -236" stroke="url(#qeGold)" stroke-width="7" stroke-linecap="round"/><path d="M48 -170 L96 -236" stroke="${ink}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><circle cx="99" cy="-240" r="10" fill="#FFD447" stroke="${ink}" stroke-width="2.5"/>` : '')
      + (o.scroll ? `<g transform="translate(${o.armR === 'fwd' ? 58 : 34} ${o.armR === 'fwd' ? -104 : -86})"><rect x="-8" y="-14" width="16" height="28" rx="3" fill="#FBEBC8" stroke="${ink}" stroke-width="2"/></g>` : '');
    const ash = o.ash ? `<g fill="#8F8F8F" opacity=".8"><circle cx="-10" cy="-158" r="3"/><circle cx="6" cy="-162" r="2.4"/><circle cx="14" cy="-152" r="2"/><circle cx="-16" cy="-60" r="2.4"/><circle cx="12" cy="-34" r="2.6"/></g>` : '';
    const robe = `${cape}<path d="M-36 0 L-25 -112 Q0 -124 25 -112 L36 0 Z" fill="${r}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-35 -1 h70 l-1.2 -10 h-67.6z" fill="${t}" stroke="${ink}" stroke-width="2"/><rect x="-25" y="-74" width="50" height="8" fill="${t}" stroke="${ink}" stroke-width="2"/>
      <path d="M-12 -117 L0 -101 L12 -117" stroke="${t}" stroke-width="4" fill="none"/>${o.ash ? `<path d="M-20 -90 l8 6 M10 -50 l9 -5 M-14 -30 l7 5" stroke="#6D5F45" stroke-width="2.5"/>` : ''}`;
    const faceSvg = `<circle cx="0" cy="-138" r="22" fill="${sk}" stroke="${ink}" stroke-width="3"/>
      ${o.hair && !o.long && o.head === 'none' ? `<path d="M-22 -144 Q-18 -164 0 -162 Q18 -164 22 -144 Q10 -152 0 -151 Q-10 -152 -22 -144z" fill="${o.hair}" stroke="${ink}" stroke-width="2.2"/>` : ''}
      ${o.long ? `<path d="M-23 -142 Q-20 -166 0 -164 Q20 -166 23 -142 Q12 -153 0 -151 Q-12 -153 -23 -142z" fill="${o.hair}" stroke="${ink}" stroke-width="2.4"/>` : ''}
      ${o.beard ? `<path d="M-20 -134 Q-20 -102 0 -98 Q20 -102 20 -134 Q14 -122 0 -122 Q-14 -122 -20 -134z" fill="${o.beard}" stroke="${ink}" stroke-width="2.4"/>` : ''}
      <ellipse cx="-8" cy="-140" rx="2.8" ry="3.4" fill="${ink}"/><ellipse cx="8" cy="-140" rx="2.8" ry="3.4" fill="${ink}"/>
      ${o.cheek ? `<g fill="#FF8FA3" opacity=".7"><ellipse cx="-14" cy="-131" rx="4" ry="2.4"/><ellipse cx="14" cy="-131" rx="4" ry="2.4"/></g>` : ''}${brows}
      <path d="${mouth}" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    return `<g class="fig" transform="scale(${s})"><ellipse cx="0" cy="2" rx="40" ry="7" fill="${ink}" opacity=".2"/><g class="bd">${robe}<g class="up">${back}${arm(-1, L)}${arm(1, R)}${faceSvg}${head}${ash}</g>${extra}</g></g>`;
  }
  // A head-and-shoulders picture for captions and cards.
  const portrait = key => key === 'pip' ? Ark.pip() : `<svg viewBox="-42 -200 84 96" aria-hidden="true">${fig(key, { s: 1, spear: 0, sceptre: 0 })}</svg>`;

  /* ---------- scenery ---------- */
  const DEFS = `<defs>
    <pattern id="qeTile" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#F4EFE6"/><path d="M0 0h20v20H0zM40 20h20v20H40z" fill="#C0392B" opacity=".8"/><path d="M20 20h20v20H20zM60 0h20v20H60z" fill="#1F55D6" opacity=".75"/><path d="M40 0h20v20H40z" fill="#2E2A3A" opacity=".85"/><path d="M0 0h80M0 20h80M20 0v40M40 0v40M60 0v40" stroke="#13203A" stroke-width="1" opacity=".25"/></pattern>
    <pattern id="qeSand" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#E2C48E"/><path d="M0 30h60M30 0v30" stroke="#B8955A" stroke-width="1.5" opacity=".5"/></pattern>
    <linearGradient id="qeSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC8F5"/><stop offset="1" stop-color="#FFE7B3"/></linearGradient>
    <linearGradient id="qeNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1640"/><stop offset="1" stop-color="#3B2A86"/></linearGradient>
    <linearGradient id="qeWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8E7C6"/><stop offset="1" stop-color="#E7C38E"/></linearGradient>
    <linearGradient id="qeWallN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3B7A"/><stop offset="1" stop-color="#2E2558"/></linearGradient>
    <linearGradient id="qeGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#D89B12"/></linearGradient>
    <linearGradient id="qeRed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9E1F2E"/><stop offset=".5" stop-color="#D7263D"/><stop offset="1" stop-color="#9E1F2E"/></linearGradient>
    <radialGradient id="qeGlow"><stop offset="0" stop-color="#FFE27A" stop-opacity=".9"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient>
  </defs>`;
  const pillar = x => `<g transform="translate(${x} 0)"><rect x="-17" y="150" width="34" height="${FLOOR - 160}" fill="#F7F3EC" stroke="${ink}" stroke-width="3"/><path d="M-7 156V${FLOOR - 14}M7 156V${FLOOR - 14}" stroke="#C9C1B4" stroke-width="3"/><rect x="-27" y="134" width="54" height="18" rx="4" fill="url(#qeGold)" stroke="${ink}" stroke-width="3"/><path d="M-27 134 q-8 -10 2 -14 M27 134 q8 -10 -2 -14" stroke="${ink}" stroke-width="3" fill="#FFE27A"/><rect x="-24" y="${FLOOR - 14}" width="48" height="14" rx="3" fill="#E6DCCB" stroke="${ink}" stroke-width="3"/></g>`;
  const arch = (x, sky = 'url(#qeSky)', w = 64) => `<path d="M${x - w} ${FLOOR - 60} V250 Q${x - w} 186 ${x} 156 Q${x + w} 186 ${x + w} 250 V${FLOOR - 60}Z" fill="${sky}" stroke="${ink}" stroke-width="4"/><path d="M${x - w} ${FLOOR - 60} V250 Q${x - w} 186 ${x} 156 Q${x + w} 186 ${x + w} 250 V${FLOOR - 60}" fill="none" stroke="#1F55D6" stroke-width="9" opacity=".35"/><rect x="${x - w - 6}" y="${FLOOR - 64}" width="${2 * w + 12}" height="10" fill="#E6DCCB" stroke="${ink}" stroke-width="3"/>`;
  // White, green and blue hangings with purple cords and silver rings (Esther 1:6).
  const drape = (x1, x2, c) => { const m = (x1 + x2) / 2; return `<path d="M${x1} 126 Q${m} 196 ${x2} 126 L${x2} 146 Q${m} 220 ${x1} 146Z" fill="${c}" stroke="${ink}" stroke-width="2.5"/><path d="M${x1} 140 Q${m} 212 ${x2} 140" stroke="#7A3E9D" stroke-width="3" fill="none"/><circle cx="${x1}" cy="128" r="6" fill="#DDE3EA" stroke="${ink}" stroke-width="2"/><circle cx="${x2}" cy="128" r="6" fill="#DDE3EA" stroke="${ink}" stroke-width="2"/>`; };
  const frieze = w => `<rect x="0" y="96" width="${w}" height="30" fill="#1F55D6" stroke="${ink}" stroke-width="3"/><path d="M0 111 ${Array.from({ length: Math.ceil(w / 40) }, (_, i) => `L${i * 40 + 20} 101 L${i * 40 + 40} 111`).join(' ')}" fill="none" stroke="#FFD447" stroke-width="3"/>`;
  const room = (w, o = {}) => `<rect width="${w}" height="${FLOOR}" fill="${o.wall || 'url(#qeWall)'}"/>${frieze(w)}<rect y="0" width="${w}" height="96" fill="${o.top || '#C9A26A'}" opacity=".55"/>
    <rect y="${FLOOR}" width="${w}" height="${VH - FLOOR}" fill="${o.floor || 'url(#qeTile)'}"/><rect y="${FLOOR - 8}" width="${w}" height="10" fill="#C9A26A" stroke="${ink}" stroke-width="2"/>`;
  const palm = (x, h = 1) => `<g transform="translate(${x} ${FLOOR}) scale(${h})"><path d="M-6 0 Q-14 -120 4 -230 L14 -228 Q2 -120 10 0z" fill="#9B6A3C" stroke="${ink}" stroke-width="3"/>${[-150, -110, -60, -20, 20, 70].map(a => `<path d="M8 -232 q${Math.cos(a * Math.PI / 180) * 60} ${Math.sin(a * Math.PI / 180) * 40 - 10} ${Math.cos(a * Math.PI / 180) * 110} ${Math.sin(a * Math.PI / 180) * 60 + 30}" stroke="#2E9E4F" stroke-width="14" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
  const fountain = x => `<g transform="translate(${x} ${FLOOR})"><ellipse cx="0" cy="-8" rx="90" ry="16" fill="#5DA9F0" stroke="${ink}" stroke-width="3"/><path d="M-90 -8 v-26 q90 22 180 0 v26" fill="#F4EFE6" stroke="${ink}" stroke-width="3"/><rect x="-10" y="-100" width="20" height="70" fill="#F4EFE6" stroke="${ink}" stroke-width="3"/><ellipse cx="0" cy="-100" rx="36" ry="8" fill="#5DA9F0" stroke="${ink}" stroke-width="3"/><path class="qe-water" d="M0 -104 q-20 -40 -40 -2 M0 -104 q20 -40 40 -2" stroke="#BFE3FF" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  const jars = x => `<g transform="translate(${x} ${FLOOR})">${[[-50, '#C0392B', 1], [0, '#14946B', 1.25], [50, '#1F55D6', .9]].map(([dx, c, s]) => `<g transform="translate(${dx} 0) scale(${s})"><path d="M-16 0 Q-30 -30 -14 -52 V-62 H14 V-52 Q30 -30 16 0Z" fill="${c}" stroke="${ink}" stroke-width="3"/><rect x="-16" y="-68" width="32" height="8" rx="3" fill="url(#qeGold)" stroke="${ink}" stroke-width="2.5"/></g>`).join('')}<path d="M-6 -86 q8 -12 0 -24 M10 -90 q8 -12 0 -24" stroke="#C9A2FF" stroke-width="3" fill="none" opacity=".8"/></g>`;
  const cushion = (x, c) => `<g transform="translate(${x} ${FLOOR})"><rect x="-60" y="-26" width="120" height="26" rx="12" fill="${c}" stroke="${ink}" stroke-width="3"/><path d="M-60 -14h120" stroke="#FFD447" stroke-width="3"/></g>`;
  const throne = x => `<g transform="translate(${x} ${FLOOR})"><path d="M-130 0 h260 v-20 h-30 v-20 h-200 v20 h-30z" fill="#E6DCCB" stroke="${ink}" stroke-width="3"/><path d="M-70 -40 V-250 Q0 -300 70 -250 V-40Z" fill="url(#qeGold)" stroke="${ink}" stroke-width="4"/><path d="M-50 -60 V-230 Q0 -268 50 -230 V-60Z" fill="#B8264A" stroke="${ink}" stroke-width="3"/><circle cx="0" cy="-262" r="10" fill="#1F55D6" stroke="${ink}" stroke-width="3"/></g>`;
  const canopy = (x, w) => `<path d="M${x - w} 40 Q${x} 120 ${x + w} 40 V70 Q${x} 150 ${x - w} 70Z" fill="#7A3E9D" stroke="${ink}" stroke-width="3"/><path d="M${x - w} 70 Q${x} 150 ${x + w} 70" stroke="#FFD447" stroke-width="4" fill="none"/>`;
  const gate = (x, glow) => `<g transform="translate(${x} 0)"><rect x="-150" y="80" width="300" height="${FLOOR - 80}" fill="#D9B77E" stroke="${ink}" stroke-width="4"/><path d="M-150 80 h300 v-20 ${Array.from({ length: 10 }, (_, i) => `h-${i % 2 ? 30 : 0} v${i % 2 ? 20 : -20}`).join(' ')}" fill="none"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${-150 + i * 54}" y="58" width="30" height="24" fill="#D9B77E" stroke="${ink}" stroke-width="3"/>`).join('')}
    <path d="M-80 ${FLOOR} V250 Q-80 170 0 150 Q80 170 80 250 V${FLOOR}Z" fill="${glow ? '#FFE7B3' : '#5A3A22'}" stroke="${ink}" stroke-width="4"/><path d="M-80 250 Q-80 170 0 150 Q80 170 80 250" stroke="#1F55D6" stroke-width="10" fill="none"/>
    <g fill="#1F55D6" opacity=".8">${[-110, 110].map(dx => `<path d="M${dx} 140 l12 18 l-12 18 l-12 -18z"/>`).join('')}</g></g>`;
  const house = (x, h, c, lit) => `<g transform="translate(${x} ${FLOOR})"><rect x="-70" y="${-h}" width="140" height="${h}" fill="${c}" stroke="${ink}" stroke-width="3"/><rect x="-76" y="${-h - 10}" width="152" height="12" fill="#C9A26A" stroke="${ink}" stroke-width="3"/><rect x="-22" y="-74" width="44" height="74" rx="20" fill="#6B4220" stroke="${ink}" stroke-width="3"/><rect x="-54" y="${-h + 24}" width="26" height="30" rx="10" fill="${lit ? '#FFE27A' : '#3D2A55'}" stroke="${ink}" stroke-width="2.5"/><rect x="28" y="${-h + 24}" width="26" height="30" rx="10" fill="${lit ? '#FFE27A' : '#3D2A55'}" stroke="${ink}" stroke-width="2.5"/></g>`;
  const city = (w, night) => `<rect width="${w}" height="${FLOOR}" fill="${night ? 'url(#qeNight)' : 'url(#qeSky)'}"/>${night ? '' : `<circle cx="${w * .8}" cy="80" r="40" fill="#FFF3C4"/>`}
    <path d="M0 330 ${Array.from({ length: Math.ceil(w / 120) + 1 }, (_, i) => `L${i * 120} ${300 + (i % 3) * 18} L${i * 120 + 60} ${300 + (i % 3) * 18}`).join(' ')} L${w} 470 L0 470Z" fill="${night ? '#2A1D66' : '#E9C995'}" opacity=".8"/>
    <rect y="${FLOOR}" width="${w}" height="${VH - FLOOR}" fill="url(#qeSand)"/>`;
  const shelf = (x, n) => `<g transform="translate(${x} 0)"><rect x="-10" y="150" width="${n * 70 + 20}" height="300" fill="#7A4E25" stroke="${ink}" stroke-width="4"/>${[230, 330, 430].map(y => `<rect x="-10" y="${y}" width="${n * 70 + 20}" height="12" fill="#5A3A1C" stroke="${ink}" stroke-width="2"/>`).join('')}</g>`;
  const table = (x, w) => `<g transform="translate(${x} ${FLOOR})"><rect x="${-w / 2}" y="-96" width="${w}" height="22" rx="6" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/><path d="M${-w / 2} -96 h${w} v34 q${-w / 2} 24 ${-w} 0z" fill="#FFF8EA" stroke="${ink}" stroke-width="3"/><path d="M${-w / 2 + 8} -62 q${w / 2 - 8} 20 ${w - 16} 0" stroke="#7A3E9D" stroke-width="5" fill="none"/><rect x="${-w / 2 + 20}" y="-60" width="14" height="60" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/><rect x="${w / 2 - 34}" y="-60" width="14" height="60" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/></g>`;
  const lamp = (x, y, on = true) => `<g transform="translate(${x} ${y})">${on ? '<circle cx="0" cy="-26" r="34" fill="url(#qeGlow)"/>' : ''}<path d="M-14 0 q0 -10 14 -10 q14 0 18 -6 q-2 16 -18 16z" fill="url(#qeGold)" stroke="${ink}" stroke-width="2.5"/>${on ? `<path class="qe-flame" d="M14 -14 q6 -10 0 -20 q-6 10 0 20z" fill="#FF7A1A" stroke="${ink}" stroke-width="1.5"/>` : ''}</g>`;
  const scrollIc = (c = '#FBEBC8') => `<rect x="-14" y="-22" width="28" height="44" rx="4" fill="${c}" stroke="${ink}" stroke-width="2.5"/><circle cx="0" cy="-22" r="5" fill="#E3C48C" stroke="${ink}" stroke-width="2"/><circle cx="0" cy="22" r="5" fill="#E3C48C" stroke="${ink}" stroke-width="2"/>`;
  const curtain = x => `<g transform="translate(${x} 0)"><rect x="-60" y="126" width="120" height="${FLOOR - 126}" fill="#7A3E9D" stroke="${ink}" stroke-width="3"/><path d="M-40 126V${FLOOR}M-20 126V${FLOOR}M0 126V${FLOOR}M20 126V${FLOOR}M40 126V${FLOOR}" stroke="#5B2A86" stroke-width="3"/><path d="M-60 126h120" stroke="#FFD447" stroke-width="6"/></g>`;
  const SPARK = `<g class="qe-spk"><circle r="20" fill="url(#qeGlow)"/><path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4Z" fill="#FFD447" stroke="${ink}" stroke-width="2"/></g>`;

  /* ---------- state and timing ---------- */
  let el = null, g = null, raf = 0, last = 0, TK = 0;
  const ABORT = new Error('qe-abort');
  const $ = s => el && el.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const NS = 'http://www.w3.org/2000/svg';
  // Every waiting step belongs to the current run; restarting a stage makes older steps stop quietly.
  function guard(p) { const t = TK; return p.then(v => { if (t !== TK || !g) throw ABORT; return v; }); }
  const tick = f => { g.ticks.push(f); return () => { if (g) g.ticks = g.ticks.filter(x => x !== f); }; };
  const wait = ms => guard(new Promise(res => { let left = ms / 1000; const off = tick(dt => { left -= dt; if (left <= 0) { off(); res(); } }); }));
  const tween = (ms, fn) => guard(new Promise(res => { let t = 0; fn(0); const off = tick(dt => { t = Math.min(1, t + dt / (ms / 1000)); fn(ease(t)); if (t >= 1) { off(); res(); } }); }));
  const until = cond => guard(new Promise(res => { if (cond()) return res(); const off = tick(() => { if (cond()) { off(); res(); } }); }));

  /* ---------- the view: picture, heads-up display, captions and cards ---------- */
  function build() {
    el.classList.add('qe-wide');
    el.innerHTML = `<div class="qe-view" id="qeV">
      <svg id="qeS" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="The palace">${DEFS}<g id="qeW"></g></svg>
      <div class="qe-hud" id="qeHud"></div>
      <div class="qe-goal" id="qeGoal" hidden></div>
      <div class="qe-pad" id="qePad" hidden><div><button type="button" data-k="l" aria-label="Walk left">◀</button><button type="button" data-k="r" aria-label="Walk right">▶</button></div><button type="button" class="act" id="qeAct" aria-label="Look">✋</button></div>
      <div class="qe-keys" id="qeKeys" hidden>← → walk · Space to look</div>
      <div class="qe-cap" id="qeCap" hidden></div>
      <div class="qe-ov" id="qeOv" hidden></div>
      <div class="qe-float" id="qeFloat"></div>
    </div>
    <div class="qe-rot" role="note"><i>📱</i> Turn your device sideways for a bigger palace!</div>`;
    hud(); fit(); wire();
  }
  function hud() {
    const h = $('#qeHud'); if (!h || !g) return;
    h.innerHTML = `<div class="qe-stg" aria-label="Stage ${g.st + 1} of 5">${STAGES.map((s, i) => `<span class="${i < g.st ? 'done' : i === g.st ? 'now' : ''}" title="${s.t}">${i < g.st ? '✓' : i + 1}</span>`).join('')}<b>${STAGES[g.st].t}</b></div>
      <div class="qe-cm" role="meter" aria-label="Courage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(g.courage)}"><span>💛</span><div class="m"><i id="qeCm" style="width:${g.courage}%"></i></div></div>
      ${g.clues.length ? `<div class="qe-clues" aria-label="Clues">${g.clues.map(c => `<span title="${c[1]}">${c[0]}</span>`).join('')}</div>` : ''}`;
  }
  function courage(n) {
    if (!g) return;
    g.courage = clamp(g.courage + (n > 0 ? n * .5 : n), 0, Math.max(g.courage, Math.min(100, 28 + g.st * 18)));   // the meter grows stage by stage
    const m = $('#qeCm'); if (m) { m.style.width = g.courage + '%'; m.parentNode.parentNode.setAttribute('aria-valuenow', Math.round(g.courage)); }
    if (n > 0) floatTxt('+💛 Courage');
  }
  function floatTxt(t) { const f = $('#qeFloat'); if (!f) return; while (f.children.length > 1) f.firstChild.remove(); const s = document.createElement('span'); s.textContent = t; f.appendChild(s); setTimeout(() => s.remove(), 1300); }
  function clue(icon, name) { if (!g.clues.some(c => c[1] === name)) { g.clues.push([icon, name]); hud(); Ark.toast(`Clue found: ${icon} ${name}`); SFX.find(); } }
  function goal(text, n, of) { const b = $('#qeGoal'); if (!b) return; if (!text) { b.hidden = true; return; } b.hidden = false; b.innerHTML = `<b>${text}</b>${of ? ` <span>${n}/${of}</span>` : ''}`; }
  function miss(n = 1) { g.miss += n; courage(-2); SFX.oops(); }

  // Fit a 16:9 picture to the space under the game bar, without scrolling.
  function fit() {
    const v = $('#qeV'); if (!v) return;
    const gb = document.querySelector('.gbar'), gbh = gb ? gb.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--gbh', gbh + 'px');
    v.style.width = '';
    const cw = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) * 2;
    const avail = Math.max(200, innerHeight - gbh - (innerHeight < 520 ? 10 : 30));
    const S = $('#qeS');
    if (cw / avail < 1.15) {
      // Upright screens: show the whole scene in the middle, with room above for the status bar and below for captions.
      const h = Math.min(avail, Math.max(cw * 1.05, cw * 9 / 16 + 230));
      v.style.width = Math.round(cw) + 'px'; v.style.height = Math.round(h) + 'px';
      S.setAttribute('preserveAspectRatio', 'xMidYMid meet'); v.classList.add('tall');
      v.style.fontSize = clamp(cw * .034, 12, 16).toFixed(1) + 'px';
    } else {
      const w = Math.min(cw, avail * 16 / 9);
      v.style.width = Math.round(w) + 'px'; v.style.height = Math.round(w * 9 / 16) + 'px';
      S.setAttribute('preserveAspectRatio', 'xMidYMid slice'); v.classList.remove('tall');
      v.style.fontSize = clamp(w * 9 / 16 * .028, 11, 19).toFixed(1) + 'px';
    }
  }
  const onResize = () => { if (g && $('#qeV')) fit(); };

  /* ---------- a scene: a wide room the camera follows, with objects to tap ---------- */
  function scene(def) {
    g.w = def.w || VW; g.objs = []; g.minX = def.minX || 50; g.maxX = def.maxX || g.w - 50; g.want = null; g.tx = null; g.busy = false; g.free = !!def.player; g.camLock = def.cam;
    const W = $('#qeW');
    W.innerHTML = `${def.art || ''}<g id="qeO"></g><g id="qeP"></g>${def.front || ''}<g id="qeArr" class="qe-arr" style="display:none"><path d="M-18 -34 h36 l-18 28z" fill="#FFD447" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/></g>`;
    (def.objs || []).forEach(obj);
    if (def.player) setPlayer(def.player.who, def.player.x); else g.player = null;
    g.cam = def.cam !== undefined ? def.cam : clamp((g.player ? g.px : 0) - VW * .45, 0, g.w - VW);
    W.setAttribute('transform', `translate(${-g.cam} 0)`);
    $('#qeS').setAttribute('aria-label', def.label || STAGES[g.st].t);
    padShow();
  }
  function obj(o) {
    const e = document.createElementNS(NS, 'g');
    e.setAttribute('class', 'qe-o'); e.dataset.id = o.id;
    o.hw = o.hw || 45; o.hh = o.hh || 190; o.y = o.y ?? FLOOR; o.active = o.active ?? true;
    e.innerHTML = `<g class="art">${o.art || ''}</g><rect class="hit" x="${-o.hw}" y="${-o.hh}" width="${2 * o.hw}" height="${o.hh + 10}" fill="transparent"/><g class="spk" transform="translate(0 ${-o.hh - 18})">${SPARK}</g>`;
    if (o.label) { e.setAttribute('role', 'button'); e.setAttribute('aria-label', o.label); e.setAttribute('tabindex', '-1'); }
    $('#qeO').appendChild(e); o.el = e; g.objs.push(o); place(o); paint(o);
    return o;
  }
  const place = o => o.el.setAttribute('transform', `translate(${o.x} ${o.y})${o.sc ? ` scale(${o.sc})` : ''}`);
  function paint(o) {
    const live = o.active && !o.done && o.act;
    o.el.classList.toggle('on', !!live);
    o.el.classList.toggle('spark', !!live && o.spark !== false && (g.C.spark || o.alwaysSpark || o.near));
    o.el.style.display = o.hide ? 'none' : '';
  }
  const setArt = (o, svg) => { o.el.querySelector('.art').innerHTML = svg; };
  const byId = id => g.objs.find(o => o.id === id);
  function setPlayer(who, x) {
    g.px = x; g.tx = null; g.who = who;
    const p = $('#qeP'); p.innerHTML = `<g class="qe-me">${fig(who)}</g>`;
    g.player = { el: p };
    p.setAttribute('transform', `translate(${x} ${FLOOR})`);
  }
  function tapObj(o) {
    if (!g || g.busy || blocked() || !o.active || o.done || !o.act) return;
    if (!g.player || o.noWalk) return runObj(o);
    const reach = o.reach || 75;
    if (Math.abs(g.px - o.x) <= reach + 8) return runObj(o);
    g.want = o; g.tx = clamp(o.x + (g.px < o.x ? -reach : reach), g.minX, g.maxX);
  }
  function runObj(o) {
    g.want = null; g.tx = null; g.busy = true; padShow();
    const tk = TK;
    Promise.resolve().then(() => o.act(o)).catch(e => { if (e !== ABORT) console.error(e); }).finally(() => { if (g && tk === TK) { g.busy = false; paint(o); padShow(); } });
  }
  const nearest = () => g.objs.filter(o => o.active && !o.done && o.act && !o.hide).sort((a, b) => Math.abs(a.x - g.px) - Math.abs(b.x - g.px))[0];
  const nextGoal = () => g.objs.find(o => o.goal && o.active && !o.done && !o.hide);
  function padShow() {
    const p = $('#qePad'), k = $('#qeKeys'); if (!p) return;
    const on = !!(g && g.player && g.free && !g.busy && !blocked());
    p.hidden = !on; k.hidden = !on;
  }

  /* ---------- main loop: walking, camera, hints ---------- */
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!g || g.paused) return;
    for (const f of g.ticks.slice()) f(dt);
    if (!g) return;
    if (g.player) {
      let dir = 0;
      if (g.free && !g.busy && !blocked()) { if (g.keys.l) dir = -1; if (g.keys.r) dir = 1; }
      if (dir) { g.tx = null; g.want = null; g.px = clamp(g.px + dir * SPEED * dt, g.minX, g.maxX); }
      else if (g.tx != null) {
        const d = g.tx - g.px, st = SPEED * (g.walkSpeed || 1) * dt;
        if (Math.abs(d) <= st) { g.px = g.tx; g.tx = null; if (g.want) { const o = g.want; if (Math.abs(g.px - o.x) <= (o.reach || 75) + 10) runObj(o); else g.want = null; } }
        else { g.px += Math.sign(d) * st; dir = Math.sign(d); }
      }
      g.player.el.setAttribute('transform', `translate(${g.px.toFixed(1)} ${FLOOR})`);
      g.player.el.classList.toggle('walk', !!dir);
      // Hard: no sparkles until you are close to something.
      if (!g.C.spark && (g.nearT = (g.nearT || 0) - dt) <= 0) { g.nearT = .2; g.objs.forEach(o => { const n = Math.abs(o.x - g.px) < 190; if (n !== !!o.near) { o.near = n; paint(o); } }); }
    }
    const want = g.camLock !== undefined && g.camLock !== null ? g.camLock : clamp((g.player ? g.px : g.cam + VW / 2) - VW * .45, 0, g.w - VW);
    g.cam += (want - g.cam) * Math.min(1, dt * 5);
    const W = $('#qeW'); if (W) W.setAttribute('transform', `translate(${(-g.cam).toFixed(1)} 0)`);
    // Hint arrow above the next goal: always on Easy, for a few seconds after Help on Normal.
    const a = $('#qeArr');
    if (a) {
      const t = (g.C.arrow || (g.arrowT || 0) > 0) && !g.busy ? (g.arrowTo || nextGoal()) : null;
      if (g.arrowT > 0) g.arrowT -= dt;
      if (t) { a.style.display = ''; a.setAttribute('transform', `translate(${t.x} ${t.y - t.hh * (t.sc || 1) - 44 + Math.sin(now / 200) * 6})`); } else a.style.display = 'none';
    }
  }

  /* ---------- input ---------- */
  function wire() {
    const v = $('#qeV'), S = $('#qeS');
    v.addEventListener('pointerdown', e => {
      if (!g || g.paused) return;
      if (e.target.closest('.qe-cap,.qe-ov,.qe-pad,.qe-tb,button,.qe-hud')) return;
      const oe = e.target.closest('.qe-o');
      if (oe) { const o = g.objs.find(x => x.el === oe); if (o && o.active && !o.done && o.act) { e.preventDefault(); tapObj(o); return; } }
      if (g.onTap) { g.onTap(e); return; }
      if (g.player && g.free && !g.busy && !blocked()) {
        const m = S.getScreenCTM(); if (!m) return;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        g.want = null; g.tx = clamp(p.x + g.cam, g.minX, g.maxX);
      }
    });
    v.querySelectorAll('.qe-pad [data-k]').forEach(b => {
      const k = b.dataset.k;
      b.onpointerdown = e => { e.preventDefault(); if (g) g.keys[k] = true; b.classList.add('down'); };
      b.onpointerup = b.onpointerleave = b.onpointercancel = () => { if (g) g.keys[k] = false; b.classList.remove('down'); };
    });
    $('#qeAct').onclick = () => { if (!g) return; const o = nearest(); if (o) tapObj(o); };
  }
  function onKey(e) {
    if (!g || !$('#qeV') || g.paused) return;
    const down = e.type === 'keydown', k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { g.keys.l = down; e.preventDefault(); return; }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { g.keys.r = down; e.preventDefault(); return; }
    if (!down) return;
    if (e.target.closest && e.target.closest('button,input,a,select,textarea')) return; // a focused button clicks itself
    if (k === ' ' || k === 'Enter') {
      if (g.capNext && !$('#qeCap').hidden) { e.preventDefault(); g.capNext(); return; }
      if (g.cardOn) return;
      if (g.onKeyAct) { e.preventDefault(); g.onKeyAct(); return; }
      if (g.player && g.free && !g.busy) { const o = nearest(); if (o) { e.preventDefault(); tapObj(o); } }
    }
  }

  /* ---------- captions: short lines, optional narration ---------- */
  // kind: 'bible' = KJV quotation, 'note' = explainer (commentary), default = story narration (summary)
  function cap(text, o = {}) {
    return guard(new Promise(res => {
      const c = $('#qeCap'); c.hidden = false; c.className = 'qe-cap ' + (o.kind || '');
      const tag = o.kind === 'bible' ? '<span class="tag">📖 The Bible says</span>' : o.kind === 'note' ? '<span class="tag">💡 Explainer</span>' : '';
      c.innerHTML = `${o.who ? `<div class="pt">${portrait(o.who)}</div>` : ''}<div class="tx">${tag}<p>${text}</p>${o.ref ? `<small>${o.ref}</small>` : ''}</div>
        <div class="bt">${canSpeak ? '<button type="button" class="lx" aria-label="Listen">🔊</button>' : ''}<button type="button" class="nx">${o.btn || 'Next'} ▶</button></div>`;
      const plain = text.replace(/<[^>]+>/g, '');
      const prevHelp = g.help;
      g.capOn = true; padShow();
      g.help = () => { Ark.toast('Tap Next ▶ to keep going'); c.querySelector('.nx').classList.add('hint'); };
      g.capNext = () => { if (!g) return; c.hidden = true; g.capNext = null; g.capOn = false; g.help = prevHelp; hush(); padShow(); res(); };
      c.querySelector('.nx').onclick = g.capNext;
      const l = c.querySelector('.lx'); if (l) l.onclick = () => say(plain + (o.ref ? '. ' + o.ref.replace(' (summary)', '').replace(' (KJV)', '') : ''), true);
      if (g.diff === 'easy') say(plain);
    }));
  }
  const bible = (text, ref, who, gloss) => cap(`“${text}”`, { kind: 'bible', ref: ref + ' (KJV' + (gloss ? ' · ' + gloss : '') + ')', who });
  const story = (text, ref, who) => cap(text, { ref: ref ? ref + ' (summary)' : '', who: who || 'pip' });
  const note = (text, ref) => cap(text, { kind: 'note', ref, who: 'pip' });

  /* ---------- cards ---------- */
  function card(html, cls = '') { const ov = $('#qeOv'); g.cardOn = true; padShow(); ov.hidden = false; ov.className = 'qe-ov ' + cls; ov.innerHTML = `<div class="qe-card">${html}</div>`; return ov.firstChild; }
  function closeCard() { const ov = $('#qeOv'); if (g) { g.cardOn = false; padShow(); } if (ov) { ov.hidden = true; ov.innerHTML = ''; } }
  const blocked = () => !!(g && (g.capOn || g.cardOn));
  // A question. Wrong answers explain gently and never change what happened in the Bible.
  function ask(q, opts, o = {}) {
    return guard(new Promise(res => {
      const list = o.keep ? opts : shuf(opts);
      const c = card(`${o.who ? `<div class="qe-pt">${portrait(o.who)}</div>` : ''}<h3>${q}</h3><div class="qe-opts">${list.map((x, i) => `<button type="button" class="qe-opt" data-i="${i}">${x.ic ? `<span class="ic">${x.ic}</span>` : ''}<span>${x.t}</span></button>`).join('')}</div><p class="qe-why" hidden></p>${canSpeak ? '<button type="button" class="chip qe-ql">🔊 Listen</button>' : ''}`, 'ask');
      const why = c.querySelector('.qe-why');
      if (g.diff === 'easy') say(q + ' ' + list.map(x => x.t).join('? Or, ') + '?');
      const ql = c.querySelector('.qe-ql'); if (ql) ql.onclick = () => say(q + ' ' + list.map(x => x.t).join('? Or, ') + '?', true);
      c.querySelectorAll('.qe-opt').forEach(b => (b.onclick = () => {
        const x = list[+b.dataset.i];
        if (x.ok || o.any) {
          c.querySelectorAll('.qe-opt').forEach(z => (z.disabled = true)); b.classList.add('ok'); SFX.good(); courage(o.gain ?? 6);
          if (x.why) { why.hidden = false; why.className = 'qe-why ok'; why.innerHTML = x.why; say(x.why.replace(/<[^>]+>/g, '')); }
          const go = () => { g.help = null; closeCard(); res(x); };
          if (x.why) { const n = document.createElement('button'); n.type = 'button'; n.className = 'btn qe-next'; n.textContent = 'Next ▶'; n.onclick = go; c.appendChild(n); n.focus(); } else setTimeout(go, 650);
        } else {
          b.classList.add('no'); b.disabled = true; miss();
          why.hidden = false; why.className = 'qe-why'; why.innerHTML = x.why || 'Not quite. Try again!'; say(why.textContent);
        }
      }));
      g.help = o.any ? null : () => { const i = list.findIndex(x => x.ok); const b = c.querySelector(`[data-i="${i}"]`); if (b && !b.classList.contains('hint')) { if (g.diff === 'normal') g.hints++; b.classList.add('hint'); say('Try this one: ' + list[i].t, true); } };
      setTimeout(() => { const b = c.querySelector('.qe-opt'); if (b) b.focus({ preventScroll: true }); }, 50);
    }));
  }
  /* A drag-and-drop puzzle (or tap a piece, then tap its place). Used for the crown, the decree, the robe and the banquet table. */
  function puzzle(cfg) {
    return guard(new Promise(res => {
      const c = card(`<h3>${cfg.title}</h3>${cfg.sub ? `<p class="qe-sub">${cfg.sub}</p>` : ''}
        <div class="qe-board ${cfg.cls || ''}" style="aspect-ratio:${cfg.ratio || '16/7'}">${cfg.board || ''}${cfg.slots.map(s => `<div class="qe-slot" data-s="${s.id}" style="left:${s.x}%;top:${s.y}%;width:${s.w || 18}%;height:${s.h || 30}%">${cfg.sil !== false ? `<span class="sil">${s.sil || ''}</span>` : ''}${s.label ? `<small>${s.label}</small>` : ''}</div>`).join('')}</div>
        <div class="qe-tray">${shuf(cfg.pieces).map(p => `<button type="button" class="qe-pc" data-p="${p.id}" aria-label="${p.label}">${p.html}${p.label && !cfg.noLabels ? `<small>${p.label}</small>` : ''}</button>`).join('')}</div>`, 'puz');
      let sel = null, left = cfg.pieces.length;
      const pick = b => { c.querySelectorAll('.qe-pc').forEach(x => x.classList.toggle('sel', x === b)); sel = b; if (b) SFX.pop(); };
      function drop(b, slot) {
        if (!b || !slot || slot.classList.contains('full')) return false;
        const p = cfg.pieces.find(x => x.id === b.dataset.p), want = cfg.slots.find(s => s.id === slot.dataset.s);
        if ((want.accept || want.id) !== p.id) { miss(); slot.classList.add('bad'); setTimeout(() => slot.classList.remove('bad'), 450); if (cfg.wrong) floatTxt(cfg.wrong); return true; }
        slot.classList.add('full'); slot.innerHTML = `<span class="got">${p.html}</span>${want.label && cfg.keepLabel ? `<small>${want.label}</small>` : ''}`; b.remove(); sel = null; SFX.good(); courage(cfg.gain ?? 2);
        if (cfg.onPlace) cfg.onPlace(p, want);
        if (--left === 0) { g.help = null; setTimeout(() => { closeCard(); res(); }, cfg.endDelay || 700); }
        return true;
      }
      c.querySelectorAll('.qe-slot').forEach(s => (s.onclick = () => { if (sel) drop(sel, s); }));
      c.querySelectorAll('.qe-pc').forEach(b => {
        b.onpointerdown = e => {
          e.preventDefault();
          const sx = e.clientX, sy = e.clientY; let ghost = null;
          const mv = ev => {
            if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { ghost = b.cloneNode(true); ghost.classList.add('ghost'); document.body.appendChild(ghost); b.classList.add('lift'); }
            if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
          };
          const up = ev => {
            removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
            b.classList.remove('lift');
            if (ghost) { ghost.remove(); const t = document.elementFromPoint(ev.clientX, ev.clientY); const s = t && t.closest('.qe-slot'); if (!drop(b, s)) pick(b); }
            else pick(sel === b ? null : b);
          };
          addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        };
        b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(b); const s = c.querySelector(`.qe-slot:not(.full)`); if (s) s.focus && s.setAttribute('tabindex', '0'); } };
      });
      c.querySelectorAll('.qe-slot').forEach(s => { s.setAttribute('tabindex', '0'); s.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); e.stopPropagation(); drop(sel, s); } }; });
      g.help = () => {
        const b = c.querySelector('.qe-pc'); if (!b) return;
        const want = cfg.slots.find(s => (s.accept || s.id) === b.dataset.p), s = want && c.querySelector(`[data-s="${want.id}"]`);
        if (g.diff === 'normal') g.hints++;
        pick(b); if (s) { s.classList.add('hint'); setTimeout(() => s.classList.remove('hint'), 1800); }
      };
      if (g.diff === 'easy') say(cfg.title + (cfg.sub ? '. ' + cfg.sub : ''));
    }));
  }
  // A big pick-the-right-picture task inside a card (scrolls, houses).
  function stageIntro(i) {
    return guard(new Promise(res => {
      const s = STAGES[i];
      const c = card(`<span class="qe-eyebrow">Stage ${i + 1} of 5 · ${s.ref}</span><div class="qe-big">${s.ic}</div><h3>${s.t}</h3>
        <div class="qe-how">${s.how.map(([a, b]) => `<div><b>${a}</b>${b}</div>`).join('')}</div>
        <button type="button" class="btn big qe-go">${Ark.UI.play} Start</button>`, 'intro');
      say(`Stage ${i + 1}. ${s.t}.`);
      g.help = () => say(`Stage ${i + 1}. ${s.t}. ${s.how.map(x => x[1]).join('. ')}. Tap Start.`, true);
      const b = c.querySelector('.qe-go'); b.onclick = () => { g.help = null; closeCard(); hush(); res(); }; b.focus({ preventScroll: true });
      g.onKeyAct = () => { g.onKeyAct = null; b.click(); };
    })).finally(() => { if (g) g.onKeyAct = null; });
  }
  function stageDone(i) {
    const prog = storeJSON('qe-prog') || {};
    if ((prog[g.diff] || 0) < i + 1) { prog[g.diff] = i + 1; storeJSON('qe-prog', prog); }
    if (i === 4) return Promise.resolve();
    return guard(new Promise(res => {
      SFX.fan(); courage(5);
      const c = card(`<div class="qe-big">✅</div><h3>Stage ${i + 1} complete!</h3><p class="qe-sub">${STAGES[i].t}</p>
        <div class="qe-cmbig"><span>💛 Courage</span><div class="m"><i style="width:${g.courage}%"></i></div></div>
        <div class="row"><button type="button" class="btn big qe-go">Next: ${STAGES[i + 1].t} ▶</button></div>
        <div class="row"><button type="button" class="btn ghost qe-re">${Ark.UI.restart} Play this stage again</button><a class="btn more" href="#home">${Ark.UI.grid} More Games</a></div>`, 'intro');
      say(`Stage ${i + 1} complete! Next: ${STAGES[i + 1].t}.`);
      const b = c.querySelector('.qe-go'); b.onclick = () => { closeCard(); res(); }; b.focus({ preventScroll: true });
      c.querySelector('.qe-re').onclick = () => { closeCard(); restartStage(i); };
    }));
  }

  /* =====================================================================
     STAGE 1: Explore the Palace (Esther 1–2)
     ===================================================================== */
  async function stage1() {
    const C = g.C; let found = 0;
    const art = room(2000) + arch(170) + arch(470) + pillar(320) + pillar(20) + pillar(620) + drape(20, 320, '#FFFFFF') + drape(320, 620, '#3FA34D') + drape(620, 920, '#5DA9F0')
      + palm(80, .9) + fountain(500) + pillar(920)
      + `<rect x="940" y="126" width="460" height="${FLOOR - 126}" fill="#F2D8E8" opacity=".55"/>` + arch(1040, 'url(#qeSky)', 50) + arch(1260, 'url(#qeSky)', 50) + cushion(1150, '#D7263D') + cushion(1280, '#1F55D6') + pillar(1400)
      + drape(1400, 1700, '#FFFFFF') + drape(1700, 2000, '#3FA34D') + canopy(1800, 150) + throne(1800) + pillar(1640);
    scene({ w: 2000, art, player: { who: 'esther', x: 120 }, maxX: 1320, label: 'The royal palace in Susa' });
    const disc = async (o, fn) => { o.done = true; paint(o); SFX.find(); courage(8); goal('Find the story stars ✦', found + 1, 4); await fn(); found++; };
    obj({ id: 'mord', x: 300, art: fig('mordecai'), label: 'Mordecai', goal: 1, act: o => disc(o, async () => {
      await story('This is Mordecai. When Esther’s mother and father died, her cousin Mordecai brought her up as his own daughter.', 'Esther 2:7', 'mordecai');
      await story('Esther’s other name was Hadassah. Mordecai told her not to tell anyone yet that she was Jewish.', 'Esther 2:7, 10', 'mordecai');
    }) });
    obj({ id: 'hang', x: 640, hw: 60, hh: 360, art: '', label: 'The beautiful hangings', goal: 1, act: o => disc(o, async () => {
      await bible('white, green, and blue, hangings… and pillars of marble', 'Esther 1:6');
      await story('King Xerxes ruled 127 provinces, from India to Cush. His royal throne was in the citadel of Susa.', 'Esther 1:1–2', 'king');
      await note('Bibles spell some names differently. The NIV says King Xerxes, Susa and Hathak. The KJV, which we quote in this game, says Ahasuerus, Shushan and Hatach. They are the same king, city and servant.', 'Explainer');
    }) });
    obj({ id: 'jars', x: 1000, hw: 70, hh: 110, art: jars(0).replace(`translate(0 ${FLOOR})`, 'translate(0 0)'), label: 'Jars of perfume', goal: 1, act: o => disc(o, async () => {
      await story('Before Esther, Queen Vashti refused to come when King Xerxes sent for her. So the king decided to choose a new queen.', 'Esther 1:10–12; 2:1–4');
      await story('Many young women were brought to the palace in Susa. For a whole year they were made ready with oil of myrrh and sweet perfumes.', 'Esther 2:8, 12');
    }) });
    obj({ id: 'hegai', x: 1220, art: fig('hegai'), label: 'Hegai, keeper of the women', goal: 1, act: o => disc(o, async () => {
      await story('Hegai looked after the young women. He liked Esther and was kind to her.', 'Esther 2:8–9', 'hegai');
      await ask('When it was Esther’s turn to see the king, what did she ask for?', [
        { t: 'Lots of jewels and gold', ic: '💎', why: 'Not quite. Esther didn’t ask for extra things. Try again!' },
        { t: 'Only what Hegai advised', ic: '🙂', ok: 1, why: '“She required nothing but what Hegai… appointed.” (Esther 2:15, KJV) Esther was humble and wise.' },
        { t: 'A palace of her own', ic: '🏰', why: 'No. Esther was humble. Have another go!' }
      ], { who: 'esther' });
    }) });
    const cur = obj({ id: 'curtain', x: 1400, hw: 60, hh: 360, art: curtain(0).replace('translate(0 0)', `translate(0 ${-FLOOR})`), label: 'Curtain to the king’s hall', spark: false, act: async () => { Ark.toast(`Explore more first: ${4 - found} story star${4 - found === 1 ? '' : 's'} left`); SFX.oops(); } });
    goal('Find the story stars ✦', 0, 4);
    await story('Welcome to the palace! Tap the floor to walk, and tap the ✦ sparkles to discover Esther’s story.', 'Esther 1–2');
    await until(() => found >= 4);
    // The curtain opens to the king's hall.
    cur.done = true; cur.act = null; paint(cur);
    await tween(700, t => { cur.el.style.opacity = 1 - t; });
    cur.hide = true; paint(cur);
    g.maxX = g.w - 60; SFX.day();
    goal('Go to the king ✦');
    let crowned = false;
    obj({ id: 'king', x: 1800, sc: 1, art: fig('king', { armR: 'hold' }), label: 'King Xerxes', goal: 1, alwaysSpark: true, act: async o => {
      o.done = true; paint(o);
      await story('Esther was taken to King Xerxes in the royal palace.', 'Esther 2:16', 'king');
      await puzzle({ title: 'Place the royal crown on Esther', sub: 'Drag the crown, or tap it and then tap Esther’s head.', ratio: '16/9', cls: 'crownb',
        board: `<svg viewBox="-120 -230 240 250" class="qe-bsvg">${fig('esther')}</svg>`,
        slots: [{ id: 'crown', x: 40, y: 6, w: 20, h: 22, sil: '👑' }], pieces: [{ id: 'crown', html: '<span class="emo">👑</span>', label: 'Royal crown' }], gain: 10 });
      setPlayer('queen', g.px); crowned = true; SFX.fan();
      await bible('the king loved Esther above all the women… so that he set the royal crown upon her head, and made her queen instead of Vashti.', 'Esther 2:17', 'queen');
      await story('The king made a great feast for her, called Esther’s feast!', 'Esther 2:18', 'king');
    } });
    await until(() => crowned);
    goal();
  }

  /* =====================================================================
     STAGE 2: The Secret Plot (Esther 2:21–4:9)
     ===================================================================== */
  async function stage2() {
    const C = g.C;
    /* Part A: two door guards, Bigthana and Teresh, whisper a plot at the king's gate (2:21–23). */
    const gateArt = city(VW) + gate(480, true) + `<rect x="0" y="${FLOOR - 6}" width="${VW}" height="6" fill="#B8955A"/>`;
    scene({ w: VW, art: gateArt, cam: 0, label: 'The king’s gate' });
    const mord = obj({ id: 'mord', x: 110, art: fig('mordecai'), label: 'Mordecai', active: false });
    const n = C.guards, xs = Array.from({ length: n }, (_, i) => 240 + i * (640 / (n - 1)));
    const plot = shuf(xs.map((_, i) => i)).slice(0, 2);
    let got = 0;
    const guards = xs.map((x, i) => obj({ id: 'g' + i, x, art: fig('guard', { face: plot.includes(i) ? 'sly' : 'smile' }) + `<g class="bub" style="opacity:0"><path d="M10 -238 h86 a14 14 0 0 1 14 14 v26 a14 14 0 0 1 -14 14 h-56 l-16 14 v-14 h-14 a14 14 0 0 1 -14 -14 v-26 a14 14 0 0 1 14 -14z" fill="#fff" stroke="${ink}" stroke-width="3"/><text x="54" y="-205" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="22" fill="${ink}">${plot.includes(i) ? 'psst…' : '♪ ♪'}</text></g>`,
      label: 'Door guard ' + (i + 1), spark: false, act: async o => {
        if (plot.includes(i)) { o.done = true; o.el.classList.add('caught'); got++; SFX.find(); courage(6); goal('Find the 2 whisperers 👂', got, 2); floatTxt('Found one!'); }
        else { miss(); floatTxt('Just guarding the door'); }
      } }));
    goal('Find the 2 whisperers 👂', 0, 2);
    await story('Esther was now queen. Mordecai sat at the king’s gate. Two of the king’s officers who guarded the door, Bigthana and Teresh, were angry and planned to harm King Xerxes!', 'Esther 2:21', 'mordecai');
    await cap('Watch and listen. Tap the 2 guards who whisper “psst…”: Bigthana and Teresh.', { who: 'pip', btn: 'Start' });
    // Whispers: the plotters take turns; on Normal and Hard other guards hum to confuse you.
    let t = 0, turn = 0;
    const off = tick(dt => {
      t -= dt;
      if (t <= 0) {
        guards.forEach(o => (o.el.querySelector('.bub').style.opacity = 0));
        const left = plot.filter(i => !guards[i].done);
        if (!left.length) return;
        const show = left[turn++ % left.length];
        guards[show].el.querySelector('.bub').style.opacity = 1;
        if (C.decoy && Math.random() < C.decoy) { const others = guards.filter((o, i) => !plot.includes(i)); const d = others[Math.floor(Math.random() * others.length)]; d.el.querySelector('.bub').style.opacity = 1; }
        setTimeout(() => { if (g && guards[show] && guards[show].el) guards[show].el.querySelector('.bub').style.opacity = g.diff === 'easy' ? 1 : 0; }, C.psst[0] * 1000);
        t = C.psst[0] + C.psst[1];
      }
    });
    g.help = () => { const i = plot.find(i => !guards[i].done); if (i === undefined) return; if (g.diff === 'normal') g.hints++; g.arrowTo = guards[i]; g.arrowT = 2.5; };
    if (C.arrow) g.arrowTo = guards[plot[0]];
    await until(() => { if (C.arrow) { const i = plot.find(i => !guards[i].done); g.arrowTo = i === undefined ? null : guards[i]; } return got >= 2; });
    off(); guards.forEach(o => (o.el.querySelector('.bub').style.opacity = 0)); g.arrowTo = null; g.help = null; goal();
    await story('Mordecai told Queen Esther. Esther told the king, and said it was Mordecai who found out.', 'Esther 2:22', 'queen');
    await bible('it was written in the book of the chronicles before the king', 'Esther 2:23');
    clue('📜', 'Book of records');
    guards.filter((o, i) => plot.includes(i)).forEach(o => { o.hide = true; paint(o); });
    await note('Remember this clue! Mordecai saved the king, but nobody rewarded him… yet.', '');

    /* Part B: everyone bows to Haman except Mordecai (3:1–6), then Haman casts Pur (3:7). */
    await story('Some years later, King Xerxes honoured Haman and gave him a seat higher than all the other nobles. The king commanded everyone at the gate to bow down to him.', 'Esther 3:1–2', 'haman');
    const folk = guards.filter(o => !o.hide);
    const haman = obj({ id: 'haman', x: 1060, art: fig('haman'), label: 'Haman', active: false });
    await tween(2200, k => { haman.x = 1060 - k * 300; place(haman); });
    folk.forEach((o, i) => setTimeout(() => o.el && o.el.classList.add('qe-bow'), i * 120));
    await wait(700 + folk.length * 120);
    let picked = false;
    mord.active = true; mord.spark = false; mord.label = 'Mordecai';
    mord.act = async o => { o.done = true; picked = true; SFX.find(); courage(8); };
    folk.forEach(o => { o.done = false; o.act = async () => { miss(); floatTxt('He is bowing'); }; paint(o); });
    paint(mord);
    goal('Tap the one man who does NOT bow');
    g.help = () => { if (g.diff === 'normal') g.hints++; g.arrowTo = mord; g.arrowT = 2.5; };
    if (C.arrow) g.arrowTo = mord;
    await cap('Look closely… Everyone bows to Haman. Tap the one man who does NOT bow.', { who: 'pip', btn: 'Look' });
    await until(() => picked);
    g.arrowTo = null; g.help = null; goal();
    folk.forEach(o => { o.act = null; paint(o); });
    await bible('But Mordecai bowed not, nor did him reverence.', 'Esther 3:2', 'mordecai');
    await story('Mordecai had told them that he was a Jew.', 'Esther 3:4', 'mordecai');
    setArt(haman, fig('haman', { face: 'angry' }));
    await story('Haman was full of anger. He wanted to destroy not only Mordecai, but all the Jews in the whole kingdom.', 'Esther 3:5–6', 'haman');
    // Pur: Haman casts lots to choose a day.
    await guard(new Promise(res => {
      const c = card(`<h3>Haman casts “Pur” (lots) to choose a day</h3><div class="qe-dice" id="qeDice">🎲</div><button type="button" class="btn big qe-roll">Tap to cast Pur</button><p class="qe-why ok" hidden></p>`, 'ask');
      const b = c.querySelector('.qe-roll');
      b.onclick = () => {
        b.disabled = true; SFX.roll(); const d = c.querySelector('#qeDice'); d.classList.add('spin');
        setTimeout(() => {
          d.classList.remove('spin'); d.textContent = '📅';
          const w = c.querySelector('.qe-why'); w.hidden = false;
          w.innerHTML = '“…they cast Pur, that is, the lot, before Haman… to the twelfth month, that is, the month Adar.” (Esther 3:7, KJV) In the 12th year of King Xerxes, the lot fell on the month of Adar.';
          const n2 = document.createElement('button'); n2.type = 'button'; n2.className = 'btn qe-next'; n2.textContent = 'Next ▶'; n2.onclick = () => { closeCard(); res(); }; c.appendChild(n2); n2.focus();
        }, 1400);
      };
      b.focus(); g.help = () => b.classList.add('hint');
    }));
    clue('🎲', 'Pur, the lots');
    await story('Haman spoke against the Jews to King Xerxes. The king gave Haman his ring, and a law was written: on that day all the Jews would be destroyed.', 'Esther 3:8–13', 'haman');

    /* Part C: Hathak (KJV Hatach) collects clues in the city for Esther (4:1–9), and rebuilds the decree. */
    const W2 = 1900;
    const streetArt = city(W2) + house(300, 210, '#E9C995', false) + house(560, 250, '#F2D8B5', false) + house(1120, 230, '#E9C995', false) + house(1420, 260, '#F2D8B5', false) + gate(1700, true)
      + `<g transform="translate(110 0)"><rect x="-90" y="90" width="180" height="${FLOOR - 90}" fill="#F7E3C6" stroke="${ink}" stroke-width="4"/><path d="M-50 ${FLOOR} V300 Q-50 240 0 226 Q50 240 50 300 V${FLOOR}Z" fill="#7A3E9D" stroke="${ink}" stroke-width="4"/><text x="0" y="150" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="26" fill="${ink}">Palace</text></g>`;
    scene({ w: W2, art: streetArt, player: { who: 'hatach', x: 200 }, label: 'The streets of Susa' });
    const need = C.s2Extra ? 4 : 3; let have = 0;
    const take = async (o, fn) => { o.done = true; paint(o); goal('Collect clues for Esther 📜', have + 1, need); await fn(); have++; };
    obj({ id: 'mourn', x: 760, hw: 90, art: `<g transform="translate(-50 0)">${fig('person1', { armL: 'cover', armR: 'cover' })}</g><g transform="translate(40 0)">${fig('person2', { armL: 'cover' })}</g><g transform="translate(-4 0)">${fig('child')}</g>`, label: 'Sad people', goal: 1, act: o => take(o, async () => {
      await story('All over the kingdom, the Jews were very sad. They fasted, wept and cried out loud.', 'Esther 4:3', 'person2');
      clue('😢', 'God’s people mourning');
    }) });
    obj({ id: 'post', x: 960, hw: 50, hh: 260, art: `<rect x="-14" y="-260" width="28" height="260" fill="#F4EFE6" stroke="${ink}" stroke-width="3"/><g transform="translate(0 -170)">${['-14 -38', '6 -30', '-10 -6', '10 4'].map((p, i) => `<rect x="${p.split(' ')[0]}" y="${p.split(' ')[1]}" width="22" height="26" fill="#FBEBC8" stroke="${ink}" stroke-width="2" transform="rotate(${i * 17 - 20})"/>`).join('')}</g>`, label: 'The torn decree on a pillar', goal: 1, act: o => take(o, async () => {
      await story('The king’s law was posted in Susa for everyone to read. But this copy is torn! Put it back together.', 'Esther 3:14–15');
      const P5 = [
        { id: 'king', html: '<span class="emo">👑</span>', label: 'In the name of King Xerxes', q: 'Who sent it?', ref: '3:12' },
        { id: 'ring', html: '<span class="emo">💍</span>', label: 'Sealed with the king’s ring', q: 'How was it sealed?', ref: '3:12' },
        { id: 'jews', html: '<span class="emo">⚠️</span>', label: 'To destroy all the Jews', q: 'What does it say?', ref: '3:13' },
        { id: 'adar', html: '<span class="emo">📅</span>', label: 'On the 13th day of Adar', q: 'When?', ref: '3:13' },
        { id: 'pur', html: '<span class="emo">🎲</span>', label: 'The day picked by Pur', q: 'How was the day chosen?', ref: '3:7' }
      ].slice(0, C.decree);
      const cols = P5.length, sw = 88 / cols;
      await puzzle({ title: 'Rebuild the king’s decree', sub: C.decreeSil ? 'Match each piece to its picture.' : 'Read each question and find its piece.', ratio: cols > 4 ? '16/6' : '16/7', cls: 'decree',
        board: `<div class="qe-scroll"></div>`, sil: C.decreeSil, keepLabel: true,
        slots: P5.map((p, i) => ({ id: p.id, x: 6 + i * sw, y: 18, w: sw - 2, h: 64, sil: p.html, label: C.decreeSil ? '' : p.q })),
        pieces: P5.map(p => ({ id: p.id, html: p.html, label: p.label })) });
      await story('This decree was a wicked plan against God’s people, and the king had sealed it with his ring.', 'Esther 3:12–13');
      clue('📃', 'The decree');
    }) });
    if (C.s2Extra) obj({ id: 'rider', x: 1300, hw: 70, art: `<g transform="translate(0 0)"><path d="M-70 -60 q10 -40 60 -40 h40 l20 -30 l20 10 l-10 30 q0 30 -20 30 l0 60 h-12 l-4 -50 h-60 l-6 50 h-12 z" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/><g transform="translate(-10 -96) scale(.6)">${fig('guard', { spear: 0, scroll: 1, armR: 'fwd' })}</g></g>`, label: 'A royal rider', goal: 1, act: o => take(o, async () => {
      await story('Riders called “posts” hurried out on fast horses to take the law to every province.', 'Esther 3:13–15');
      clue('🐎', 'The royal posts');
    }) });
    const mo = obj({ id: 'mord', x: 1590, art: fig('sack'), label: 'Mordecai in sackcloth', goal: 1, act: o => take(o, async () => {
      await story('Mordecai tore his clothes and put on sackcloth and ashes. He cried with a loud and bitter cry at the king’s gate.', 'Esther 4:1–2', 'sack');
      await story('Mordecai told Hathak everything, even the amount of silver Haman had promised to pay to destroy the Jews.', 'Esther 4:7', 'sack');
      await story('He gave Hathak a copy of the decree for Esther, and asked her to go to the king and plead for her people.', 'Esther 4:8', 'sack');
      clue('💰', 'Haman’s silver');
    }) });
    void mo;
    goal('Collect clues for Esther 📜', 0, need);
    await story('In the palace, Queen Esther heard that Mordecai was crying in sackcloth. She sent Hathak, a servant of the king who looked after her, to find out why.', 'Esther 4:4–5', 'hatach');
    await until(() => have >= need);
    goal('Take the clues back to Esther 🏛️');
    let back = false;
    obj({ id: 'door', x: 110, hw: 60, hh: 240, label: 'Back to the palace', goal: 1, alwaysSpark: true, act: async o => { o.done = true; back = true; } });
    await until(() => back);
    goal();
    await story('Hathak went back and told Esther everything Mordecai had said.', 'Esther 4:9', 'hatach');
  }

  /* =====================================================================
     STAGE 3: Esther's Courage (Esther 4:10–5:1)
     ===================================================================== */
  async function stage3() {
    const C = g.C;
    const art = room(VW, { wall: 'url(#qeWall)' }) + `<path d="M560 ${FLOOR - 80} V230 Q560 170 640 150 Q720 170 720 230 V${FLOOR - 80}Z" fill="url(#qeNight)" stroke="${ink}" stroke-width="4" id="qeWin"/>`
      + `<g id="qeSunMoon"><circle cx="640" cy="230" r="26" fill="#FFF3C4"/></g>`
      + `<rect x="554" y="${FLOOR - 86}" width="172" height="12" fill="#E6DCCB" stroke="${ink}" stroke-width="3"/>`
      + `<g transform="translate(150 ${FLOOR})"><rect x="-100" y="-80" width="200" height="60" rx="10" fill="#7A3E9D" stroke="${ink}" stroke-width="3"/><rect x="-110" y="-110" width="40" height="110" rx="8" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/><rect x="-96" y="-96" width="70" height="26" rx="12" fill="#FFF8EA" stroke="${ink}" stroke-width="3"/></g>`
      + lamp(380, FLOOR - 150) + `<rect x="350" y="${FLOOR - 150}" width="60" height="150" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/>` + pillar(40) + pillar(920);
    scene({ w: VW, art, player: { who: 'queen', x: 330 }, cam: 0, label: 'Esther’s room in the palace' });
    const hat = obj({ id: 'hatach', x: 860, art: fig('hatach', { scroll: 1 }), label: 'Hathak with a message', goal: 1, alwaysSpark: true, act: async o => { o.done = true; paint(o); } });
    goal('Talk to Hathak 💬');
    await story('Hathak shows Esther the decree. Mordecai’s message says: go to the king and plead for your people!', 'Esther 4:8', 'hatach');
    await until(() => hat.done);
    goal();
    await ask('Why is Esther afraid to go to the king?', [
      { t: 'The king’s law: anyone who goes in without being called could be put to death', ic: '⚖️', ok: 1, why: 'Yes. Only if King Xerxes held out his golden sceptre would that person live. And the king had not called Esther for 30 days. (Esther 4:11)' },
      { t: 'She doesn’t like the king', ic: '😠', why: 'The Bible doesn’t say that. Look at the king’s law…' },
      { t: 'The palace is too big', ic: '🏰', why: 'Not that! There was a dangerous law about going in uninvited.' }
    ], { who: 'queen' });
    await bible('who knoweth whether thou art come to the kingdom for such a time as this?', 'Esther 4:14', 'mordecai');
    await ask('What might Mordecai mean?', [
      { t: 'Esther may be queen for this very moment, to help her people', ic: '⏳', ok: 1, why: 'That’s right. Esther was in the palace at just the right time.' },
      { t: 'Esther should hide and keep quiet', ic: '🙈', why: 'No. Mordecai warned that hiding in the palace would not keep her safe (Esther 4:13).' },
      { t: 'Esther should run away from the palace', ic: '🏃‍♀️', why: 'No. Mordecai wanted Esther to be brave where God had placed her.' }
    ], { who: 'mordecai' });
    await note('The Book of Esther never uses the name “God”. But Mordecai was sure help would come for the Jews (Esther 4:14), and many readers see God quietly at work in the whole story.', 'Explainer, not a Bible quote');
    await bible('Go, gather together all the Jews that are present in Shushan, and fast ye for me', 'Esther 4:16', 'queen', 'Shushan is Susa');

    /* Gather the people of Susa: tap each house to share Esther's message. */
    await guard(new Promise(res => {
      const n = C.houses; let lit = 0, blink = -1, bt = 0;
      const pos = Array.from({ length: n }, (_, i) => ({ x: 6 + (i % Math.ceil(n / 2)) * (88 / Math.ceil(n / 2)), y: i < Math.ceil(n / 2) ? 18 : 56 }));
      const c = card(`<h3>Gather the Jews of Susa</h3><p class="qe-sub">${C.blink ? 'Tap a house when its door glows.' : 'Tap each dark house to share Esther’s message.'} <b class="qe-cnt">0/${n}</b></p>
        <div class="qe-map">${pos.map((p, i) => `<button type="button" class="qe-house" data-i="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="House ${i + 1}"><svg viewBox="0 0 60 60"><rect x="6" y="20" width="48" height="38" fill="#E9C995" stroke="${ink}" stroke-width="3"/><rect x="2" y="14" width="56" height="8" fill="#C9A26A" stroke="${ink}" stroke-width="3"/><rect class="dr" x="23" y="34" width="14" height="24" rx="6" fill="#6B4220" stroke="${ink}" stroke-width="2"/><rect class="wn" x="10" y="28" width="10" height="10" rx="3" fill="#3D2A55" stroke="${ink}" stroke-width="2"/><rect class="wn" x="40" y="28" width="10" height="10" rx="3" fill="#3D2A55" stroke="${ink}" stroke-width="2"/></svg></button>`).join('')}</div>`, 'puz night');
      const hs = [...c.querySelectorAll('.qe-house')];
      const pickBlink = () => { const left = hs.map((h, i) => i).filter(i => !hs[i].classList.contains('lit')); hs.forEach(h => h.classList.remove('blink')); blink = left.length ? left[Math.floor(Math.random() * left.length)] : -1; if (blink >= 0) hs[blink].classList.add('blink'); };
      if (C.blink) pickBlink();
      const off = tick(dt => { if (!C.blink) return; bt += dt; if (bt > 1.6) { bt = 0; pickBlink(); } });
      hs.forEach((h, i) => (h.onclick = () => {
        if (h.classList.contains('lit')) return;
        if (C.blink && i !== blink) { miss(); h.classList.add('bad'); setTimeout(() => h.classList.remove('bad'), 400); return; }
        h.classList.add('lit'); h.disabled = true; lit++; SFX.pop(); courage(2);
        c.querySelector('.qe-cnt').textContent = `${lit}/${n}`;
        if (C.blink) { bt = 0; pickBlink(); }
        if (lit >= n) { off(); g.help = null; SFX.find(); setTimeout(() => { closeCard(); res(); }, 700); }
      }));
      g.help = () => { const h = C.blink ? hs[blink] : hs.find(h => !h.classList.contains('lit')); if (h) { h.classList.add('hint'); setTimeout(() => h.classList.remove('hint'), 1500); } };
      if (g.diff === 'easy') say('Tap each dark house to share Esther’s message.');
    }));
    await bible('neither eat nor drink three days, night or day: I also and my maidens will fast likewise', 'Esther 4:16', 'queen');

    /* Three days of fasting: tap the sun to let each day pass. */
    const sm = $('#qeSunMoon'), win = $('#qeWin');
    let day = 0;
    const sun = obj({ id: 'sun', x: 640, y: 262, hw: 70, hh: 110, noWalk: true, label: 'Tap the sun to pass the day', goal: 1, alwaysSpark: true, act: async o => {
      SFX.day(); day++; courage(8);
      sm.innerHTML = `<circle cx="640" cy="230" r="30" fill="#FFD447" stroke="${ink}" stroke-width="3"/>`; win.setAttribute('fill', 'url(#qeSky)');
      floatTxt(`Day ${day}`);
      await wait(900);
      sm.innerHTML = `<circle cx="640" cy="230" r="26" fill="#FFF3C4"/><circle cx="652" cy="222" r="22" fill="#2A2470"/>`; win.setAttribute('fill', 'url(#qeNight)');
      goal('Let three days pass ☀️', day, 3);
      if (day < 3) { o.done = false; paint(o); } else o.done = true;
    } });
    goal('Let three days pass ☀️', 0, 3);
    await cap('Tap the window to let each day and night pass.', { who: 'pip', btn: 'OK' });
    await until(() => sun.done && !g.busy);
    goal();
    await note('The Bible says they fasted: no food or drink for three days. The Book of Esther doesn’t mention prayer, but in the Bible fasting often goes with prayer (see Nehemiah 1:4), so many Christians believe they prayed too.', 'Explainer: Esther 4:16 and Nehemiah 1:4');
    await bible('and so will I go in unto the king, which is not according to the law: and if I perish, I perish', 'Esther 4:16', 'queen');
    await ask('How do you think Esther felt?', [
      { t: 'Scared', ic: '😟', why: 'Maybe! Going to the king was dangerous. Being brave doesn’t mean never feeling afraid.' },
      { t: 'Brave', ic: '💪', why: 'Yes! She chose to do the right thing for her people.' },
      { t: 'Both scared and brave', ic: '💛', why: 'Many people think so. Courage is doing what is right, even when you feel afraid.' }
    ], { any: true, keep: true, gain: 6, who: 'queen' });
    /* Esther puts on her royal clothes (5:1). */
    await story('On the third day, Esther put on her royal clothes.', 'Esther 5:1', 'queen');
    await puzzle({ title: 'Dress Queen Esther in her royal apparel', sub: 'Drag each piece onto Esther.', ratio: '16/9', cls: 'crownb',
      board: `<svg viewBox="-120 -230 240 250" class="qe-bsvg">${fig('queen', { head: 'band' })}</svg>`,
      slots: [{ id: 'robe', x: 38, y: 50, w: 24, h: 38, sil: '👗' }, { id: 'cape', x: 66, y: 46, w: 18, h: 30, sil: '✨' }, { id: 'crown', x: 40, y: 3, w: 20, h: 22, sil: '👑' }],
      pieces: [{ id: 'robe', html: '<span class="emo">👗</span>', label: 'Royal robe' }, { id: 'cape', html: '<span class="emo">✨</span>', label: 'Golden cape' }, { id: 'crown', html: '<span class="emo">👑</span>', label: 'Crown' }], gain: 4 });
    setPlayer('royal', g.px); SFX.fan();
  }

  /* =====================================================================
     STAGE 4: Esther Before King Xerxes – The Golden Sceptre (Esther 5:1–4)
     Order follows 5:1–2: Esther stands in the inner court → the king sees her → holds out the sceptre → she draws near and touches it.
     ===================================================================== */
  async function stage4() {
    const C = g.C, W4 = 1800;
    let art = room(W4) + `<rect x="0" y="${FLOOR}" width="${W4}" height="${VH - FLOOR}" fill="url(#qeTile)"/><path d="M0 ${FLOOR + 22} H${W4} V${VH - 14} H0z" fill="url(#qeRed)" stroke="${ink}" stroke-width="3"/>`;
    for (let x = 140; x < W4 - 300; x += 260) art += pillar(x) + (x + 260 < W4 - 300 ? drape(x, x + 260, ['#FFFFFF', '#3FA34D', '#5DA9F0'][(x / 260 | 0) % 3]) : '');
    art += canopy(1640, 150) + throne(1640)
      + `<rect x="1112" y="${FLOOR}" width="16" height="${VH - FLOOR}" fill="url(#qeGold)" stroke="${ink}" stroke-width="2"/>`
      + [[790, 'Inner court'], [1310, 'The king’s hall']].map(([x, t]) => `<g transform="translate(${x} 236)"><rect x="-96" y="0" width="192" height="38" rx="12" fill="#7A3E9D" stroke="${ink}" stroke-width="3"/><text x="0" y="27" text-anchor="middle" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="21" fill="#FFF3C4">${t}</text></g>`).join('');
    scene({ w: W4, art, player: { who: 'royal', x: 90 }, label: 'The inner court and King Xerxes’ hall' });
    g.free = false; padShow();
    const watchers = [320, 580, 840, 1260, 1420].map((x, i) => obj({ id: 'w' + i, x, y: FLOOR - 4, sc: .8, art: fig(i % 2 ? 'guard' : 'harbonah', { face: 'worry' }), active: false }));
    const king = obj({ id: 'king', x: 1640, y: FLOOR - 40, art: fig('king', { face: 'worry' }), active: false });
    await story('On the third day, Esther put on her royal robes and went to the inner court of the palace, in front of the king’s hall. King Xerxes sat on his royal throne, facing the entrance.', 'Esther 5:1', 'royal');
    await cap('Help Esther walk bravely into the inner court. Tap STEP when the marker is in the gold zone.', { who: 'pip', btn: 'Ready' });

    /* Timing: brave steps. A miss makes Esther hesitate, but she keeps going. */
    const startX = 90, endX = 1040, need = C.steps;   // she stops in the inner court, where the king can see her
    const tb = document.createElement('div'); tb.className = 'qe-tb';
    tb.innerHTML = `<div class="bar"><i class="zone"></i><b class="mk"></b></div><button type="button" class="btn big qe-step">👣 STEP</button><span class="qe-cnt">0/${need}</span>`;
    $('#qeV').appendChild(tb);
    const zoneEl = tb.querySelector('.zone'), mk = tb.querySelector('.mk');
    let zs = .5 - C.zone / 2, p = 0, dir = 1, steps = 0, moving = false, beatT = 0;
    const setZone = () => { if (C.moveZone) zs = .08 + Math.random() * (.84 - C.zone); zoneEl.style.left = zs * 100 + '%'; zoneEl.style.width = C.zone * 100 + '%'; };
    setZone();
    const offT = tick(dt => {
      if (!moving) { p += dir * C.sweep * dt * 2; if (p > 1) { p = 1; dir = -1; } if (p < 0) { p = 0; dir = 1; } mk.style.left = p * 100 + '%'; }
      beatT += dt; if (beatT > .9 - steps * .06) { beatT = 0; SFX.beat(); }
    });
    const press = async () => {
      if (moving || !g || g.paused) return;
      if (p >= zs - .02 && p <= zs + C.zone + .02) {
        moving = true; steps++; SFX.step(); courage(4); tb.querySelector('.qe-cnt').textContent = `${steps}/${need}`; tb.classList.add('good');
        const from = g.px, to = startX + (endX - startX) * steps / need;
        g.player.el.classList.add('walk');
        await tween(650, k => { g.px = from + (to - from) * k; });
        g.player.el.classList.remove('walk'); tb.classList.remove('good');
        watchers.forEach(w => { if (Math.abs(w.x - g.px) < 200) w.el.classList.add('gasp'); });
        setZone(); moving = false;
      } else {
        miss(); tb.classList.add('bad'); g.player.el.classList.add('shake'); floatTxt('Esther hesitates…');
        setTimeout(() => { tb.classList.remove('bad'); if (g && g.player) g.player.el.classList.remove('shake'); }, 450);
      }
    };
    tb.querySelector('.qe-step').onpointerdown = e => { e.preventDefault(); press().catch(() => {}); };
    tb.querySelector('.qe-step').onclick = e => { if (e.detail === 0) press().catch(() => {}); };
    g.onKeyAct = () => press().catch(() => {});
    g.onTap = () => press().catch(() => {});
    g.help = () => { if (g.diff === 'normal' && !tb.classList.contains('hinted')) g.hints++; tb.classList.add('hinted'); Ark.toast('Tap STEP when the marker is inside the gold zone'); };
    await until(() => steps >= need && !moving);
    offT(); tb.remove(); g.onKeyAct = null; g.onTap = null; g.help = null;
    /* Suspense: Esther stands in the court. Will the king hold out the sceptre? */
    g.camLock = W4 - VW;
    await cap('Esther stands in the inner court. King Xerxes looks up and sees her… Everyone waits.', { who: 'pip', btn: 'Wait…' });
    SFX.roll();
    await wait(1600);
    setArt(king, fig('king', { armR: 'up', sceptre: 1 })); SFX.fan(); courage(10);
    await bible('And it was so, when the king saw Esther the queen standing in the court, that she obtained favour in his sight: and the king held out to Esther the golden sceptre that was in his hand.', 'Esther 5:2', 'king');
    /* Touch the top of the sceptre. */
    const tip = obj({ id: 'tip', x: 1640 + 107, y: FLOOR - 40 - 232, hw: 44, hh: 56, noWalk: true, label: 'The top of the golden sceptre', goal: 1, alwaysSpark: true, art: '<circle cx="0" cy="-20" r="26" fill="url(#qeGlow)"/>', act: async o => {
      o.done = true; paint(o);
      g.walkSpeed = .5; g.tx = 1560; await until(() => g.tx == null); g.walkSpeed = 1;
      setPlayer('royal', g.px); $('#qeP .qe-me').innerHTML = fig('royal', { armR: 'up' });
      SFX.find(); courage(6);
    } });
    goal('Tap the sceptre: Esther draws near and touches it ✨');
    g.help = () => { if (g.diff === 'normal') g.hints++; g.arrowTo = tip; g.arrowT = 3; };
    await until(() => tip.done && !g.busy);
    goal(); g.help = null;
    await bible('So Esther drew near, and touched the top of the sceptre.', 'Esther 5:2', 'royal');
    setArt(king, fig('king', { armR: 'hold' }));
    await bible('What wilt thou, queen Esther? and what is thy request? it shall be even given thee to the half of the kingdom.', 'Esther 5:3', 'king');
    await ask('What does Esther ask for first?', [
      { t: 'For the king and Haman to come to a banquet she has made', ic: '🍇', ok: 1, why: 'Yes! (Esther 5:4) Esther was wise and patient. She waited for the right moment to tell the king everything.' },
      { t: 'Half of the kingdom', ic: '🗺️', why: 'Esther didn’t want riches. She wanted to save her people.' },
      { t: 'To shout “Haman is wicked!” right now', ic: '📢', why: 'Not yet! Esther waited for the right moment.' }
    ], { who: 'royal' });
    g.camLock = undefined;
  }

  /* =====================================================================
     STAGE 5: The Royal Banquet (Esther 5:4–9:28)
     ===================================================================== */
  async function stage5() {
    const C = g.C;
    if (!g.clues.some(c => c[1] === 'Book of records')) g.clues.push(['📜', 'Book of records']), hud();
    const hall = (night) => room(VW, { wall: night ? 'url(#qeWallN)' : 'url(#qeWall)' }) + arch(160, 'url(#qeNight)', 54) + arch(800, 'url(#qeNight)', 54) + lamp(300, 200) + lamp(660, 200) + drape(220, 740, '#FFFFFF') + table(480, 440) + cushion(330, '#D7263D') + cushion(630, '#1F55D6');
    scene({ w: VW, art: hall(false), player: { who: 'royal', x: 100 }, cam: 0, label: 'The banquet hall' });
    g.free = false; padShow();
    /* Prepare the banquet. */
    const ITEMS = [
      { id: 'bread', html: '<span class="emo">🍞</span>', label: 'Bread' },
      { id: 'grapes', html: '<span class="emo">🍇</span>', label: 'Grapes' },
      { id: 'cup', html: '<span class="emo">🏆</span>', label: 'Golden cups' },
      { id: 'lamp', html: '<span class="emo">🪔</span>', label: 'Oil lamps' },
      { id: 'dates', html: '<span class="emo">🌴</span>', label: 'Dates' },
      { id: 'flower', html: '<span class="emo">🌸</span>', label: 'Flowers' }
    ].slice(0, C.table);
    await story('Esther prepared a banquet for King Xerxes and Haman.', 'Esther 5:4', 'royal');
    await puzzle({ title: 'Set the banquet table', sub: C.tableSil ? 'Drag each thing to its place.' : 'Read the labels and set each thing in its place.', ratio: '16/6', cls: 'tableb', sil: C.tableSil, keepLabel: !C.tableSil,
      board: `<div class="qe-tablecloth"></div>`,
      slots: ITEMS.map((it, i) => ({ id: it.id, x: 6 + i * (88 / ITEMS.length), y: 22, w: 88 / ITEMS.length - 3, h: 56, sil: it.html, label: C.tableSil ? '' : it.label })),
      pieces: ITEMS });
    // Guests arrive.
    const king = obj({ id: 'king', x: 1040, art: fig('king'), active: false });
    const haman = obj({ id: 'haman', x: 1140, art: fig('haman', { face: 'sly' }), active: false });
    await tween(1800, k => { king.x = 1040 - k * 690; haman.x = 1140 - k * 510; place(king); place(haman); });
    await story('At the banquet, King Xerxes asked again what Esther wanted. Esther asked them both to come to a second banquet the next day.', 'Esther 5:6–8', 'royal');
    await story('Haman went home proud and happy… until he saw Mordecai at the gate, who did not stand up or move for him. Haman planned to harm Mordecai.', 'Esther 5:9–14', 'haman');

    /* The king can't sleep: find the record about Mordecai (6:1–3). */
    scene({ w: VW, art: room(VW, { wall: 'url(#qeWallN)' }) + arch(820, 'url(#qeNight)', 60) + shelf(80, 6) + lamp(620, 230) + `<g transform="translate(720 ${FLOOR})"><rect x="-120" y="-70" width="240" height="50" rx="10" fill="#7A3E9D" stroke="${ink}" stroke-width="3"/><rect x="-130" y="-120" width="40" height="120" rx="8" fill="#8B5A2B" stroke="${ink}" stroke-width="3"/></g>`, cam: 0, label: 'The king’s room at night' });
    obj({ id: 'king', x: 640, art: fig('king', { face: 'worry' }), active: false });
    await bible('On that night could not the king sleep, and he commanded to bring the book of records of the chronicles', 'Esther 6:1', 'king');
    const RECS = [
      ['🐴', 'A list of the king’s horses. Zzz…'], ['🌾', 'How much grain was stored. Yawn…'], ['🏺', 'A list of royal jars and cups. Zzz…'], ['🧵', 'Orders for new curtains. Yawn…'],
      ['🛣️', 'Repairs to the roads. Zzz…'], ['🐫', 'Camels bought this year. Yawn…'], ['🪙', 'A long list of taxes. Zzz…'], ['🍯', 'Honey for the palace kitchen. Yawn…'], ['🪵', 'Wood for the new doors. Zzz…']
    ];
    let foundRec = false;
    await guard(new Promise(res => {
      const recs = shuf([['🚪', 'MORDECAI'], ...shuf(RECS).slice(0, C.scrolls - 1)]);
      const c = card(`<h3>Find the record about Mordecai</h3><p class="qe-sub">${g.diff === 'easy' ? 'Look for the scroll with the 🚪 door guards picture, like your clue!' : 'Use your 📜 clue: what did Mordecai do at the gate?'}</p>
        <div class="qe-shelf">${recs.map((r, i) => `<button type="button" class="qe-scr" data-i="${i}" aria-label="Scroll ${i + 1}"><svg viewBox="-20 -30 40 60">${scrollIc()}</svg><span>${r[0]}</span></button>`).join('')}</div><p class="qe-why" hidden></p>`, 'puz night');
      const why = c.querySelector('.qe-why');
      c.querySelectorAll('.qe-scr').forEach(b => (b.onclick = () => {
        const r = recs[+b.dataset.i];
        if (r[1] === 'MORDECAI') { b.classList.add('ok'); foundRec = true; SFX.find(); courage(8); g.help = null; setTimeout(() => { closeCard(); res(); }, 700); }
        else { b.classList.add('no'); b.disabled = true; miss(); why.hidden = false; why.textContent = r[1]; }
      }));
      g.help = () => { const i = recs.findIndex(r => r[1] === 'MORDECAI'); const b = c.querySelector(`[data-i="${i}"]`); if (b && !b.classList.contains('hint')) { if (g.diff === 'normal') g.hints++; b.classList.add('hint'); } };
    }));
    void foundRec;
    await story('The record told how Mordecai had warned about Bigthana and Teresh, the two door guards who planned to harm King Xerxes.', 'Esther 6:2', 'king');
    await bible('What honour and dignity hath been done to Mordecai for this?', 'Esther 6:3', 'king');
    await bible('There is nothing done for him.', 'Esther 6:3', 'harbonah');

    /* Mordecai honoured: Haman must lead him through the city (6:10–11). */
    const W5 = 1500;
    scene({ w: W5, art: city(W5) + house(260, 220, '#E9C995', true) + house(620, 250, '#F2D8B5', true) + house(1000, 230, '#E9C995', true) + gate(1320, true), cam: 0, label: 'The city street' });
    const horse = obj({ id: 'horse', x: -120, hw: 90, hh: 280, art: `<path d="M-80 -70 q10 -44 66 -44 h44 l22 -34 l22 12 l-10 34 q0 34 -22 34 l0 70 h-14 l-4 -56 h-66 l-6 56 h-14 z" fill="#F4EFE6" stroke="${ink}" stroke-width="3"/><path d="M-40 -114 h50 v20 h-50z" fill="#7A3E9D" stroke="${ink}" stroke-width="2"/><g transform="translate(-14 -104) scale(.75)">${fig('honour')}</g>`, active: false });
    const hm = obj({ id: 'haman', x: -10, art: fig('haman', { face: 'sad', armR: 'fwd' }), active: false });
    const crowd = [220, 420, 700, 900, 1100].map((x, i) => obj({ id: 'c' + i, x, y: FLOOR + 6, sc: .75, art: fig(['person1', 'person2', 'maid', 'hatach', 'person2'][i], { face: 'smile', armL: 'up', armR: 'up' }), active: false }));
    let cheers = 0;
    const cheerBtn = document.createElement('div'); cheerBtn.className = 'qe-tb';
    cheerBtn.innerHTML = `<button type="button" class="btn big qe-step">🎉 Cheer!</button><span class="qe-cnt">0/5</span>`;
    $('#qeV').appendChild(cheerBtn);
    const cheer = () => { if (cheers >= 5) return; cheers++; SFX.pop(); courage(2); cheerBtn.querySelector('.qe-cnt').textContent = `${cheers}/5`; crowd.forEach(o => o.el.classList.remove('jump')); void crowd[0].el.getBoundingClientRect(); crowd.forEach(o => o.el.classList.add('jump')); floatTxt('🎉'); };
    cheerBtn.querySelector('button').onclick = cheer; g.onKeyAct = cheer;
    await story('The next morning, King Xerxes told Haman to dress Mordecai in royal clothes and lead him through the city on the king’s horse.', 'Esther 6:10–11', 'king');
    const go = tween(6000, k => { horse.x = -120 + k * (W5 - 200); hm.x = horse.x + 150; place(horse); place(hm); g.camLock = clamp(horse.x - VW * .4, 0, W5 - VW); });
    await bible('Thus shall it be done unto the man whom the king delighteth to honour.', 'Esther 6:11', 'haman');
    await go;
    goal('Cheer for Mordecai! 🎉', cheers, 5);
    await until(() => { goal('Cheer for Mordecai! 🎉', cheers, 5); return cheers >= 5; });
    goal();
    cheerBtn.remove(); g.onKeyAct = null; g.camLock = undefined;
    await story('Afterwards Mordecai went back to the king’s gate, and Haman hurried home, very upset.', 'Esther 6:12', 'honour');

    /* The second banquet: Esther reveals the enemy (7:1–6). */
    scene({ w: VW, art: hall(false), cam: 0, label: 'The second banquet' });
    const est = obj({ id: 'est', x: 140, art: fig('royal'), active: false });
    const people = [
      { id: 'king', x: 330, who: 'king', name: 'King Xerxes', t: 'King Xerxes didn’t know the plan was against Esther’s people. He is the one Esther is asking for help!' },
      { id: 'harb', x: 560, who: 'harbonah', name: 'Harbona, a servant of the king', t: 'This is Harbona, one of the king’s servants (Esther 7:9). He didn’t make the plan.' },
      { id: 'haman', x: 700, who: 'haman', name: 'Haman', ok: 1 },
      { id: 'maid', x: 860, who: 'maid', name: 'One of Esther’s maids', t: 'This is one of Esther’s maids. She fasted with Esther (Esther 4:16), so she is on Esther’s side!' }
    ];
    void est;
    await bible('What is thy petition, queen Esther?', 'Esther 7:2', 'king');
    await bible('let my life be given me at my petition, and my people at my request', 'Esther 7:3', 'royal');
    await story('Esther told the king that she and her people had been sold to be destroyed.', 'Esther 7:4', 'royal');
    await bible('Who is he, and where is he, that durst presume in his heart to do so?', 'Esther 7:5', 'king');
    let named = false;
    people.forEach(p => obj({ id: p.id, x: p.x, art: fig(p.who, p.who === 'haman' ? { face: 'worry' } : {}), label: p.name, spark: false, act: async o => {
      if (p.ok) { o.done = true; named = true; SFX.find(); courage(10); }
      else { miss(); await cap(p.t, { who: p.who, btn: 'Try again' }); }
    } }));
    goal('Help Esther point to the enemy 👉');
    g.help = () => { if (g.diff === 'normal') g.hints++; g.arrowTo = byId('haman'); g.arrowT = 3; };
    await cap('Look at your clues. Who made the wicked plan? Tap him.', { who: 'pip', btn: 'Look' });
    await until(() => named);
    goal(); g.help = null;
    setArt(byId('haman'), fig('haman', { face: 'sad' }));
    await bible('The adversary and enemy is this wicked Haman.', 'Esther 7:6', 'royal');
    await story('King Xerxes was very angry. Haman was punished by the very thing he had set up to harm Mordecai.', 'Esther 7:7–10', 'king');
    await story('King Xerxes gave Mordecai the ring he had taken back from Haman. Then a new law, sealed with that ring, let the Jews stand up and defend their lives.', 'Esther 8:2, 8:8–11', 'honour');
    await story('God’s people were saved! Their sadness turned to joy. Every year they remember it at the feast of Purim, with feasting, gifts to friends and gifts to the poor.', 'Esther 9:20–22, 26', 'queen');
    await note('God’s name is not written in the Book of Esther, but we can see how He kept His people safe through Esther’s courage and Mordecai’s faithfulness.', 'Explainer');
  }

  const STAGE_FNS = [stage1, stage2, stage3, stage4, stage5];

  /* ---------- run, restart, finish ---------- */
  async function runStage(i) {
    const tk = ++TK;
    g.st = i; g.ticks = []; g.help = null; g.capNext = null; g.capOn = false; g.cardOn = false; g.onTap = null; g.onKeyAct = null; g.arrowTo = null; g.arrowT = 0; g.camLock = undefined; g.walkSpeed = 1; g.keys = {};
    g.snap = { courage: g.courage, miss: g.miss, hints: g.hints, clues: g.clues.slice() };
    closeCard(); const cp = $('#qeCap'); if (cp) cp.hidden = true; goal();
    el.querySelectorAll('.qe-tb').forEach(x => x.remove());
    hud(); ctl();
    // Show the stage's first scene behind the intro card.
    try {
      if (!$('#qeW').innerHTML) scene({ w: VW, art: room(VW) + arch(240) + arch(720) + pillar(480), cam: 0 });
      await stageIntro(i);
      await STAGE_FNS[i]();
      if (tk !== TK) return;
      await stageDone(i);
      if (tk !== TK) return;
      if (i < 4) runStage(i + 1); else end();
    } catch (e) { if (e !== ABORT) console.error(e); }
  }
  function restartStage(i) {
    if (!g) return;
    const s = g.snap || {}; g.courage = s.courage ?? g.courage; g.miss = s.miss ?? g.miss; g.hints = s.hints ?? g.hints; g.clues = (s.clues || g.clues).slice();
    if (g.paused) { g.paused = false; }
    runStage(i ?? g.st);
  }
  function ctl() {
    Ark.ctl({
      help: g.diff === 'hard' ? null : () => { if (!g) return; if (g.help) g.help(); else if (g.player && g.free) { const o = nextGoal() || nearest(); if (o) { if (g.diff === 'normal') g.hints++; g.arrowTo = o; g.arrowT = 3; } } else if (g.capNext) Ark.toast('Tap Next ▶ to keep going'); },
      pause: () => { if (g) { g.paused = true; g.keys = {}; hush(); } },
      resume: () => { if (g) { g.paused = false; last = performance.now(); } },
      restart: () => restartStage()
    });
  }
  function end() {
    const d = g.diff, m = g.miss, hints = g.hints, mh = g.miss + g.hints, from = g.from;
    const stars = d === 'easy' ? (m <= 5 ? 3 : m <= 10 ? 2 : 1) : d === 'normal' ? (mh <= 2 ? 3 : mh <= 6 ? 2 : 1) : (m === 0 ? 3 : m <= 3 ? 2 : 1);
    const cour = Math.round(g.courage);
    stop(); el.classList.remove('qe-wide');
    Ark.finish(el, {
      id: ID, diff: d, stars, title: 'God saved His people!',
      html: `<div class="qe-cmbig" style="max-width:340px;margin:0 auto"><span>💛 Courage ${cour}%</span><div class="m"><i style="width:${cour}%"></i></div></div>
        <p class="story" style="font-size:16px;margin:0">${m === 0 ? 'No mistakes. A courageous queen!' : `${m} mistake${m > 1 ? 's' : ''}${hints ? ` · ${hints} hint${hints > 1 ? 's' : ''}` : ''}. Can you do it with none?`}${from ? ` <br><small>(You started from Stage ${from + 1}.)</small>` : ''}</p>`,
      verse: ['…who knoweth whether thou art come to the kingdom for such a time as this?', 'Esther 4:14 (KJV)'],
      lesson: 'God placed Esther in the palace at just the right time. She was afraid, but she was brave, wise and patient. God has placed you where you are too. You can choose to do what is right, even when it is hard.',
      again: () => play(d, 0), menu,
      next: d !== 'hard' ? [`Try ${d === 'easy' ? 'Normal' : 'Hard'}`, () => { const n = d === 'easy' ? 'normal' : 'hard'; store('diff-' + ID, n); play(n, 0); }] : null
    });
  }

  function play(diff, st = 0) {
    stop();
    g = { diff, C: D[diff], st, from: st, courage: st ? 20 + st * 14 : 10, miss: 0, hints: 0, clues: [], paused: false, ticks: [], keys: {}, objs: [], px: 0, cam: 0, w: VW };
    if (st >= 2) g.clues = [['📜', 'Book of records'], ['🎲', 'Pur, the lots'], ['📃', 'The decree']];
    build();
    last = performance.now(); raf = requestAnimationFrame(loop);
    runStage(st);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; TK++; g = null; hush(); document.querySelectorAll('.qe-pc.ghost').forEach(x => x.remove()); }

  /* ---------- menu with stage select ---------- */
  function menu() {
    stop(); if (el) el.classList.remove('qe-wide');
    const prog = storeJSON('qe-prog') || {};
    Ark.menu(el, {
      id: ID, title: 'Queen Esther: Courage of a Queen', icon: 'crown', color: '#A98BFF',
      blurb: 'Discover. Decide. Be Courageous. A palace adventure from the Book of Esther.',
      how: [['tap', 'Tap to walk and explore'], ['scroll', 'Find clues and solve puzzles'], ['heart', 'Fill your Courage Meter']],
      listen: 'Queen Esther: Courage of a Queen. Walk through the palace, solve mysteries and help Queen Esther be brave. Tap the floor to walk and tap sparkles to discover. There are five stages. Tap Help me if you get stuck.',
      diffs: { easy: 'The story is read to you. Arrows show where to go. Big gold zones.', normal: 'Sparkles show things to find. Help is there if you need it.', hard: 'No sparkles, no help, smaller timing zones and trickier puzzles.' },
      extra: `<div class="qe-pick"><b>Stages</b><div class="qe-pk" id="qePick"></div><small>Finish a stage to unlock the next one on that level.</small><small>Names follow the NIV (King Xerxes, Susa). Bible quotations are from the King James Version, which calls the king Ahasuerus.</small></div>`,
      afterRender: st => {
        const paintPick = () => {
          const d = store('diff-' + ID) || 'easy', un = prog[d] || 0;
          st.querySelector('#qePick').innerHTML = STAGES.map((s, i) => `<button type="button" class="chip" data-st="${i}" ${i > un ? 'disabled aria-disabled="true"' : ''}>${i > un ? '🔒' : s.ic} ${i + 1}. ${s.t}</button>`).join('');
          st.querySelectorAll('[data-st]').forEach(b => (b.onclick = () => { hush(); play(store('diff-' + ID) || 'easy', +b.dataset.st); }));
        };
        paintPick();
        st.querySelectorAll('.diff').forEach(b => b.addEventListener('click', paintPick));
      },
      start: d => play(d, 0)
    });
  }

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById('qe-css')) return;
    const s = document.createElement('style'); s.id = 'qe-css';
    s.textContent = `
      .stage.qe-wide{max-width:1240px;padding:8px;gap:8px}
      .qe-view{position:relative;margin:0 auto;border:3px solid var(--line);border-radius:16px;overflow:hidden;background:#2A1D66;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;container-type:size;font-size:14px;line-height:1.3;color:#13203A}
      .qe-view>svg{display:block;width:100%;height:100%}
      .qe-view.tall{background:linear-gradient(#3B2A86,#2A1D66)}
      .qe-view.tall .qe-cap{bottom:1.5cqh}
      @container (max-width:620px){.qe-stg b{display:none}.qe-cap{grid-template-columns:auto 1fr}.qe-cap .bt{grid-column:1/-1;justify-content:flex-end}.qe-cap .pt{width:3em;height:3em}.qe-tb{gap:.5em;padding:.4em}.qe-tb .bar{width:38cqw}}
      @container (max-height:430px){.qe-card{gap:.35em;padding:.6em .8em}.qe-card h3{font-size:1.25em}.qe-opt{padding:.35em .6em;font-size:.95em}.qe-big{font-size:2em}.qe-how b{font-size:1.2em}}
      .qe-o{cursor:default}.qe-o.on{cursor:pointer}
      .qe-o .spk{opacity:0;pointer-events:none}.qe-o.spark .spk{opacity:1;animation:qeTw 1.1s ease-in-out infinite}
      @keyframes qeTw{50%{transform:scale(1.25) rotate(20deg)}}
      .qe-o .spk>g{transform-box:fill-box;transform-origin:center}
      .qe-o.on:hover .art{filter:brightness(1.08) drop-shadow(0 0 6px #FFD447)}
      .qe-o.caught .art{filter:drop-shadow(0 0 8px #D7263D)}
      .qe-arr{pointer-events:none}
      .fig .bd{transform-box:fill-box;transform-origin:50% 100%;transition:transform .35s}
      .qe-bow .fig .bd{transform:scaleY(.78) rotate(4deg)}
      .walk .fig .bd{animation:qeBob .34s ease-in-out infinite}
      @keyframes qeBob{50%{transform:translateY(-6px) rotate(2deg)}}
      .shake .fig{animation:qeShake .4s}
      @keyframes qeShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
      .qe-o.gasp .fig .bd{animation:qeGasp .5s}
      @keyframes qeGasp{50%{transform:translateY(-10px)}}
      .qe-o.jump .fig .bd{animation:qeGasp .45s}
      .qe-water{animation:qeWat 1.4s ease-in-out infinite}@keyframes qeWat{50%{opacity:.4}}
      .qe-flame{animation:qeFl .6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}@keyframes qeFl{to{transform:scaleY(.8)}}
      .qe-hud{position:absolute;left:1.2cqw;right:1.2cqw;top:1.2cqh;display:flex;gap:1cqw;align-items:center;flex-wrap:wrap;pointer-events:none;z-index:2}
      .qe-stg,.qe-cm,.qe-clues,.qe-goal{background:rgba(255,255,255,.92);border:2px solid #13203A;border-radius:999px;padding:.25em .6em;display:flex;align-items:center;gap:.35em;font-weight:800}
      .qe-stg span{width:1.6em;height:1.6em;border-radius:50%;display:grid;place-items:center;border:2px solid #13203A;background:#DCE7F3;font-size:.8em}
      .qe-stg span.done{background:#14946B;color:#fff}.qe-stg span.now{background:#FFD447}
      .qe-stg b{font-family:var(--display);font-weight:400;margin-left:.2em}
      .qe-cm .m,.qe-cmbig .m{width:clamp(70px,16cqw,180px);height:.9em;border:2px solid #13203A;border-radius:999px;background:#FFF3DC;overflow:hidden}
      .qe-cm i,.qe-cmbig i{display:block;height:100%;background:linear-gradient(90deg,#F2A007,#FFD447);transition:width .5s}
      .qe-cmbig{display:flex;align-items:center;gap:8px;justify-content:center;font-weight:800}.qe-cmbig .m{width:200px;height:16px}
      .qe-clues span{font-size:1.1em}
      .qe-goal{position:absolute;left:50%;transform:translateX(-50%);top:calc(1.2cqh + 2.6em);z-index:2;pointer-events:none;white-space:nowrap;background:#FFD447}
      .qe-goal span{background:#fff;border-radius:999px;padding:0 .5em;border:2px solid #13203A}
      .qe-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:1.6cqh 1.6cqw;pointer-events:none;z-index:2}
      .qe-pad>div{display:flex;gap:1.4cqw}
      .qe-pad button{pointer-events:auto;width:clamp(48px,12cqh,90px);height:clamp(48px,12cqh,90px);border-radius:50%;border:3px solid #13203A;background:rgba(255,255,255,.88);font:inherit;font-weight:800;font-size:clamp(20px,5cqh,34px);color:#13203A;box-shadow:0 4px 0 #13203A;cursor:pointer;touch-action:none}
      .qe-pad button.down{transform:translateY(3px);box-shadow:0 1px 0 #13203A}
      .qe-pad .act{background:#FFD447;margin-left:auto}
      @media (pointer:fine){.qe-pad>div{display:none}.qe-pad button{width:56px;height:56px;font-size:24px}}
      .qe-keys{position:absolute;left:50%;bottom:1.4cqh;transform:translateX(-50%);background:rgba(19,32,58,.6);color:#fff;border-radius:999px;padding:.2em .8em;font-size:.8em;font-weight:800;pointer-events:none;white-space:nowrap}
      @media (pointer:coarse){.qe-keys{display:none}}
      .qe-cap{position:absolute;left:2cqw;right:2cqw;bottom:2cqh;z-index:4;display:grid;grid-template-columns:auto 1fr auto;gap:.8em;align-items:center;background:#FFFDF6;border:3px solid #13203A;border-radius:18px;padding:.6em .8em;box-shadow:0 5px 0 rgba(19,32,58,.5);animation:qeUp .25s ease-out}
      .qe-cap.bible{background:#FFF3C4;border-color:#B07A2E}.qe-cap.note{background:#E6F0FF}
      @keyframes qeUp{from{opacity:0;transform:translateY(12px)}}
      .qe-cap .pt{width:4.2em;height:4.2em;border-radius:50%;background:#FFE7B3;border:3px solid #13203A;overflow:hidden;display:grid;place-items:center}
      .qe-cap .pt svg{width:100%;height:100%}
      .qe-cap p{margin:0;font-weight:800;font-size:1.12em}
      .qe-cap.bible p{font-family:Georgia,serif;font-style:italic;font-weight:700}
      .qe-cap small{display:block;color:#55627A;font-weight:800;margin-top:.15em}
      .qe-cap .tag{display:inline-block;font-size:.75em;font-weight:800;background:#13203A;color:#fff;border-radius:999px;padding:.05em .6em;margin-bottom:.25em}
      .qe-cap .bt{display:flex;gap:.4em}
      .qe-cap button,.qe-card .chip{font:inherit;font-weight:800;border:3px solid #13203A;border-radius:14px;background:#FFD447;color:#13203A;padding:.45em .8em;cursor:pointer;box-shadow:0 3px 0 #13203A;white-space:nowrap}
      .qe-cap .lx{background:#fff}
      .qe-cap .nx.hint{box-shadow:0 0 0 4px #F2A007,0 3px 0 #13203A}
      .qe-ov{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(19,32,58,.42);padding:2cqh 2cqw}
      .qe-card{background:var(--surface,#fff);color:var(--ink,#13203A);border:3px solid #13203A;border-radius:20px;padding:1em 1.2em;display:grid;gap:.6em;justify-items:center;text-align:center;width:min(780px,100%);max-height:100%;overflow:auto;animation:qeIn .28s ease-out}
      @keyframes qeIn{from{opacity:0;transform:scale(.94)}}
      .qe-card h3{font-family:var(--display);font-weight:400;font-size:1.6em;margin:0;line-height:1.1}
      .qe-sub{margin:0;font-weight:700}
      .qe-eyebrow{font-weight:800;color:var(--muted,#55627A);font-size:.9em}
      .qe-big{font-size:3em;line-height:1}
      .qe-how{display:flex;gap:.6em;flex-wrap:wrap;justify-content:center}
      .qe-how div{background:var(--bg,#EAF2FA);border-radius:14px;padding:.4em .8em;font-weight:800;display:grid;justify-items:center}
      .qe-how b{font-size:1.6em}
      .qe-pt{width:4em;height:4em;border-radius:50%;background:#FFE7B3;border:3px solid #13203A;overflow:hidden}.qe-pt svg{width:100%;height:100%}
      .qe-opts{display:grid;gap:.5em;width:100%}
      .qe-opt{font:inherit;font-weight:800;font-size:1.05em;display:flex;align-items:center;gap:.6em;text-align:left;padding:.55em .8em;border-radius:14px;border:3px solid var(--line,#13203A);background:var(--chip,#DCE7F3);color:var(--ink,#13203A);cursor:pointer;box-shadow:0 3px 0 var(--line,#13203A)}
      .qe-opt .ic{font-size:1.5em}
      .qe-opt.ok{background:#DFF5E8;border-color:#14946B;color:#13203A}.qe-opt.no{background:#FFE1E4;color:#13203A;opacity:.75}
      .qe-opt.hint,.qe-scr.hint,.qe-house.hint{box-shadow:0 0 0 5px #F2A007,0 3px 0 #13203A}
      .qe-why{margin:0;font-weight:800;background:#FFF3C4;color:#13203A;border-radius:12px;padding:.4em .7em}.qe-why.ok{background:#DFF5E8}
      .qe-board{position:relative;width:100%;border:3px solid #13203A;border-radius:16px;background:#FFF8EA;overflow:hidden}
      .qe-board.decree .qe-scroll{position:absolute;inset:6% 2%;background:#FBEBC8;border:3px solid #B07A2E;border-radius:12px}
      .qe-board.tableb{background:#5B2A86}.qe-tablecloth{position:absolute;inset:14% 2%;background:#FFF8EA;border:3px solid #13203A;border-radius:12px}
      .qe-board.crownb{background:radial-gradient(circle at 50% 40%,#FFF3C4,#E7C38E)}
      .qe-bsvg{position:absolute;inset:0;width:100%;height:100%}
      .qe-slot{position:absolute;border:3px dashed #B07A2E;border-radius:14px;display:grid;place-items:center;align-content:center;background:rgba(255,255,255,.5)}
      .qe-slot .sil{font-size:2em;opacity:.28;filter:grayscale(1)}
      .qe-slot small{font-weight:800;font-size:.75em;padding:0 .2em;line-height:1.1}
      .qe-slot.full{border-style:solid;border-color:#14946B;background:rgba(223,245,232,.9)}
      .qe-slot .got{font-size:2em;line-height:1}.qe-slot .got small{display:none}
      .qe-slot.bad{animation:qeShake .4s;border-color:#D7263D}
      .qe-slot.hint{box-shadow:0 0 0 5px #F2A007}
      .qe-tray{display:flex;gap:.5em;flex-wrap:wrap;justify-content:center}
      .qe-pc{font:inherit;font-weight:800;border:3px solid #13203A;border-radius:14px;background:#fff;color:#13203A;padding:.3em .6em;cursor:grab;box-shadow:0 3px 0 #13203A;display:grid;justify-items:center;touch-action:none;min-width:4em}
      .qe-pc .emo,.qe-slot .emo{font-size:1.8em;line-height:1.1}
      .qe-pc small{font-size:.78em;max-width:9em}
      .qe-pc.sel{background:#FFD447;transform:translateY(-3px)}
      .qe-pc.lift{opacity:.35}
      .qe-pc.ghost{position:fixed;z-index:50;pointer-events:none;transform:translate(-50%,-50%) scale(1.1);opacity:.95;font-size:16px}
      .qe-dice{font-size:4em;line-height:1}.qe-dice.spin{animation:qeSpin .35s linear infinite}@keyframes qeSpin{to{transform:rotate(360deg)}}
      .qe-map{position:relative;width:100%;aspect-ratio:16/7;background:linear-gradient(#0B1640,#3B2A86);border:3px solid #13203A;border-radius:16px}
      .qe-house{position:absolute;width:11%;aspect-ratio:1;border:0;background:none;padding:0;cursor:pointer}
      .qe-house svg{width:100%;height:100%}
      .qe-house.lit .wn{fill:#FFE27A}.qe-house.lit{filter:drop-shadow(0 0 8px #FFE27A)}
      .qe-house.blink .dr{fill:#FFD447}.qe-house.blink{animation:qeGasp .8s infinite}
      .qe-house.bad{animation:qeShake .4s}
      .qe-shelf{display:grid;grid-template-columns:repeat(5,1fr);gap:.5em;width:100%;background:#7A4E25;border:3px solid #13203A;border-radius:14px;padding:.6em}
      .qe-scr{font:inherit;border:3px solid #13203A;border-radius:12px;background:#FBEBC8;cursor:pointer;padding:.2em;display:grid;justify-items:center;position:relative}
      .qe-scr svg{width:2.2em;height:3.2em}.qe-scr span{font-size:1.4em;position:absolute;top:34%}
      .qe-scr.no{opacity:.45}.qe-scr.ok{background:#DFF5E8;box-shadow:0 0 0 5px #14946B}
      .qe-tb{position:absolute;left:50%;bottom:3cqh;transform:translateX(-50%);z-index:3;display:flex;align-items:center;gap:1em;background:rgba(255,255,255,.94);border:3px solid #13203A;border-radius:18px;padding:.5em .8em}
      .qe-tb .bar{position:relative;width:clamp(150px,34cqw,360px);height:2.2em;border:3px solid #13203A;border-radius:999px;background:#DCE7F3;overflow:hidden}
      .qe-tb .zone{position:absolute;top:0;bottom:0;background:linear-gradient(90deg,#F2A007,#FFD447,#F2A007)}
      .qe-tb .mk{position:absolute;top:-4px;bottom:-4px;width:8px;margin-left:-4px;background:#13203A;border-radius:4px}
      .qe-tb.good .bar{box-shadow:0 0 0 4px #14946B}.qe-tb.bad .bar{box-shadow:0 0 0 4px #D7263D}
      .qe-tb .btn{font-size:1.2em;padding:.4em .9em;touch-action:none}
      .qe-tb .qe-cnt{font-weight:800;font-variant-numeric:tabular-nums}
      .qe-float{position:absolute;left:3cqw;top:11cqh;z-index:6;pointer-events:none;display:grid;gap:.2em}
      .qe-float span{white-space:nowrap;font-family:var(--display);font-size:1.25em;color:#fff;-webkit-text-stroke:1.5px #13203A;paint-order:stroke;animation:qeFloat 1.3s ease-out forwards;justify-self:start}
      @keyframes qeFloat{from{opacity:0;transform:translateY(10px)}20%{opacity:1;transform:none}80%{opacity:1}to{opacity:0;transform:translateY(-14px)}}
      .qe-ov.night .qe-card{background:#1B1F3A;color:#fff}.qe-ov.night .qe-why{color:#13203A}
      .qe-rot{display:none;align-items:center;gap:8px;font-weight:800;font-size:14px;background:#FFF3C4;color:#13203A;border:2px solid #13203A;border-radius:12px;padding:6px 10px}
      .qe-rot i{font-style:normal;font-size:22px;display:inline-block;animation:qeRot 2s ease-in-out infinite}@keyframes qeRot{35%,65%{transform:rotate(-90deg)}}
      @media (orientation:portrait) and (pointer:coarse){.qe-rot{display:flex}}
      .qe-pick{display:grid;gap:6px}.qe-pk{display:flex;gap:6px;flex-wrap:wrap}.qe-pick small{color:var(--muted)}
      .qe-pk .chip[disabled]{opacity:.5;cursor:not-allowed}
      @media (orientation:landscape) and (max-height:520px){.stage.qe-wide{padding:0;border:0;background:none}
        body:has(.stage.qe-wide) .gwrap{padding-top:4px}body:has(.stage.qe-wide) .gbar .wrap{padding-block:3px}
        body:has(.stage.qe-wide) .gbar .allgames,body:has(.stage.qe-wide) .gctl button{padding-block:4px;min-height:34px}body:has(.stage.qe-wide) .gtitle{font-size:15px}}
    `;
    document.head.appendChild(s);
  }

  Ark.games[ID] = {
    mount(stage) { el = stage; css(); addEventListener('resize', onResize); addEventListener('keydown', onKey); addEventListener('keyup', onKey); menu(); },
    unmount() { stop(); if (el) el.classList.remove('qe-wide'); removeEventListener('resize', onResize); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); },
    _test: { state: () => g, play, D, tapObj: id => { const o = g && byId(id); if (o) tapObj(o); return !!o; }, objs: () => g ? g.objs.map(o => ({ id: o.id, x: o.x, active: o.active, done: o.done, hide: o.hide, act: !!o.act })) : [] }
  };
})();
