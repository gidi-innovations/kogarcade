/* Fruit of the Spirit (Galatians 5:22–23): a three-round character game.
   Round 1 Catch: catch the fruit of the Spirit, leave the opposite behaviours behind.
   Round 2 Heart Choices: Easy picks the fruit, Normal picks the good response to a situation, Hard picks the Christ-like response out of four.
   Round 3 Fruit Rush: a timed bonus round. Points, combos, badges and personal bests are kept only in this browser. */
(() => {
  const { store, storeJSON, tok, say, hush, bar, setBar, learn, shuf, steps } = Ark;
  const ink = '#13203A';
  const FRUITS = [
    { w: 'Love', c: '#E63946', k: 'apple', m: 'caring for others the way Jesus does' },
    { w: 'Joy', c: '#F4A300', k: 'round', m: 'gladness that comes from God' },
    { w: 'Peace', c: '#8CC63F', k: 'pear', m: 'a calm heart, and helping others get along' },
    { w: 'Patience', c: '#7A3E9D', k: 'grapes', m: 'waiting without grumbling' },
    { w: 'Kindness', c: '#FF6F91', k: 'round', m: 'being gentle and helpful' },
    { w: 'Goodness', c: '#F2C14E', k: 'lemon', m: 'doing what is right' },
    { w: 'Faithfulness', c: '#3F6FE0', k: 'round', m: 'keeping your promises' },
    { w: 'Gentleness', c: '#FF8C42', k: 'apple', m: 'using soft words and soft hands' },
    { w: 'Self-control', c: '#2A9D8F', k: 'pear', m: 'stopping to think before you act' }
  ];
  // Behaviours that go against God's ways, each with a short reason and the fruit that is its opposite
  const BAD = {
    'Rage': ['Feeling angry is not a sin by itself, but shouting, hitting or hurting people is. Calm down and talk instead.', 'Self-control', 'Ephesians 4:26'],
    'Jealousy': ['Jealousy makes us unhappy when good things happen to others. Love is glad for them.', 'Love', 'Proverbs 14:30'],
    'Pride': ['Pride means thinking we are better than others. God wants us to be humble.', 'Gentleness', 'Proverbs 16:18'],
    'Hatred': ['Hatred wants bad things for people. Jesus said to love even our enemies.', 'Love', 'Matthew 5:44'],
    'Selfishness': ['Selfishness only thinks about me. Kindness thinks about others too.', 'Kindness', 'Philippians 2:4'],
    'Dishonesty': ['Lying and cheating break trust. God wants us to be truthful.', 'Faithfulness', 'Ephesians 4:25'],
    'Unforgiveness': ['Holding on to hurt keeps our hearts heavy. God forgives us, so we forgive others.', 'Peace', 'Ephesians 4:32'],
    'Impatience': ['Impatience wants everything right now. Patience waits calmly.', 'Patience', 'James 1:19'],
    'Cruelty': ['Cruelty hurts people with words or actions. God wants gentle hands and kind words.', 'Gentleness', 'Ephesians 4:32'],
    'Greed': ['Greed always wants more. Goodness shares and is thankful.', 'Goodness', 'Luke 12:15'],
    'Gossip': ['Gossip spreads stories that hurt people. Kind words build others up.', 'Kindness', 'Proverbs 16:28']
  };
  const BADS = Object.keys(BAD);
  // Easy choice round: which one is the fruit?
  const PAIRS = BADS.map(b => ({ good: BAD[b][1], bad: b }));
  // Normal: everyday situations, one good and one harmful response
  const NORMAL = [
    { q: 'Your little sister breaks your favourite toy by accident.', o: [['Tell her it’s okay and help fix it', 1, 'Forgiving her shows love and patience.'], ['Shout and break her toy too', 0, 'Paying back hurt with hurt is rage, not self-control.']] },
    { q: 'A classmate drops all their books in the corridor.', o: [['Help pick them up', 1, 'Helping is kindness in action.'], ['Laugh with your friends', 0, 'Laughing at someone who is struggling is cruelty.']] },
    { q: 'A friend tells you a secret.', o: [['Keep it to yourself', 1, 'Keeping a secret shows faithfulness.'], ['Tell everyone at break time', 0, 'Passing on secrets is gossip, and it breaks trust.']] },
    { q: 'You find some money on the playground.', o: [['Give it to a teacher', 1, 'Doing what is right, even when nobody is watching, is goodness.'], ['Keep it quietly', 0, 'Keeping what isn’t yours is greed and dishonesty.']] },
    { q: 'Your team loses the football match.', o: [['Shake hands with the winners', 1, 'Losing well shows self-control and gentleness.'], ['Kick the ball away and sulk', 0, 'It’s okay to feel sad, but sulking and kicking is rage.']] },
    { q: 'Mum asks you to wait while she finishes a phone call.', o: [['Wait quietly', 1, 'Waiting calmly is patience.'], ['Keep shouting “Now, now, now!”', 0, 'Demanding things right now is impatience.']] },
    { q: 'You have sweets and your friend has none.', o: [['Share some with your friend', 1, 'Sharing shows love and kindness.'], ['Eat them all in front of him', 0, 'Thinking only of yourself is selfishness.']] },
    { q: 'You broke a window by accident.', o: [['Tell the truth and say sorry', 1, 'Telling the truth is goodness and faithfulness.'], ['Blame your brother', 0, 'Blaming someone else is dishonesty.']] },
    { q: 'A friend says sorry for being unkind to you.', o: [['Forgive them', 1, 'Forgiving brings peace, just as God forgives us.'], ['Never speak to them again', 0, 'Refusing to forgive is unforgiveness.']] },
    { q: 'You get the top mark in the class test.', o: [['Say thank you and encourage others', 1, 'Being humble and encouraging is gentleness.'], ['Boast that you are the cleverest', 0, 'Boasting comes from pride.']] }
  ];
  // Hard: real-life situations with four responses
  const HARD = [
    { q: 'A friend wins a competition that you really wanted to win. What do you do?', o: [['Celebrate their achievement', 1, 'Celebrating others shows love and kindness. Love is happy when good things happen to others (1 Corinthians 13:4).'], ['Spread rumours about them', 0, 'Rumours are gossip, and they hurt people.'], ['Become jealous and try to spoil their success', 0, 'Jealousy can lead us to do harmful things.'], ['Refuse to speak to them', 0, 'Shutting a friend out because they won is jealousy, not love.']] },
    { q: 'Your friends dare you to write mean comments about a classmate online.', o: [['Say no, and stand up for your classmate', 1, 'Standing up for someone takes courage and love, even when friends pressure you (Exodus 23:2).'], ['Write just one small comment so they don’t laugh at you', 0, 'Even one mean comment hurts. Giving in to pressure isn’t worth it.'], ['Watch and laugh along', 0, 'Laughing along still joins in the cruelty.'], ['Share the comments with more people', 0, 'Sharing them spreads the hurt further. That’s gossip.']] },
    { q: 'Someone pushes you hard in the line and you feel really angry.', o: [['Take a deep breath, tell them calmly it hurt, and tell a teacher if you need to', 1, 'Feeling angry is not a sin. What matters is how you respond: “Be ye angry, and sin not” (Ephesians 4:26). That is self-control.'], ['Push them back even harder', 0, 'Hitting back turns anger into rage.'], ['Plan to get them back later', 0, 'Planning revenge keeps the hurt growing. God says leave it to Him (Romans 12:19).'], ['Make up a nasty story about them', 0, 'Lying about someone is dishonesty and gossip.']] },
    { q: 'A new student who speaks differently sits alone at lunch.', o: [['Invite them to sit with you', 1, 'Welcoming someone shows kindness and love, like Jesus welcomed everyone.'], ['Ignore them', 0, 'Ignoring someone who is lonely misses a chance to show love.'], ['Copy the way they talk to make others laugh', 0, 'Mocking someone is cruelty.'], ['Tell others not to sit with them', 0, 'Turning people against someone is hatred.']] },
    { q: 'Your parents say no to a new phone that all your friends have.', o: [['Accept it, and thank God for what you have', 1, 'Being content and honouring your parents shows self-control and goodness (Ephesians 6:1).'], ['Sulk and refuse to talk for days', 0, 'Sulking is impatience and selfishness.'], ['Tell them they are the worst parents ever', 0, 'Unkind words to parents dishonour them.'], ['Secretly use a friend’s phone to break the rule', 0, 'Going behind their backs is dishonesty.']] },
    { q: 'Your friend copied your homework, and now the teacher thinks you both cheated.', o: [['Tell the truth kindly, and forgive your friend', 1, 'Truth and forgiveness together show goodness and peace.'], ['Shout at your friend in front of the class', 0, 'You can be upset, but shaming them is rage and cruelty.'], ['Lie and say you copied too', 0, 'Lying never fixes things. That’s dishonesty.'], ['Decide never to forgive them', 0, 'Unforgiveness keeps your heart heavy. God forgives us (Colossians 3:13).']] },
    { q: 'You promised to help Grandma on Saturday, but your friends invite you to a fun party.', o: [['Keep your promise to Grandma', 1, 'Keeping your word, even when something more fun comes along, is faithfulness.'], ['Pretend to be sick so you can go', 0, 'Pretending is dishonesty.'], ['Go to the party without telling anyone', 0, 'Breaking a promise without a word hurts trust.'], ['Help Grandma but complain the whole time', 0, 'Helping is good, but grumbling steals the joy.']] },
    { q: 'A friend tells you an unkind rumour about another girl.', o: [['Don’t pass it on, and say it isn’t kind', 1, 'Stopping a rumour protects people. That is kindness and goodness.'], ['Tell just one other person', 0, 'Even passing it to one person is gossip.'], ['Add more to the story', 0, 'Adding to it is dishonesty and gossip.'], ['Post it online', 0, 'Posting it spreads the hurt to many people.']] }
  ];
  const D = {
    easy: { speed: 95, every: 1.25, bad: .25, hearts: 0, accel: .7, catchTime: 70, qTime: 0, nQ: 5, rush: 12, rushEvery: .45, hint: true },
    normal: { speed: 140, every: .95, bad: .33, hearts: 3, accel: 1.1, catchTime: 60, qTime: 15, nQ: 5, rush: 14, rushEvery: .35, hint: true },
    hard: { speed: 175, every: .8, bad: .4, hearts: 3, accel: 1.6, catchTime: 55, qTime: 20, nQ: 5, rush: 15, rushEvery: .28, hint: false }
  };
  const BADGES = {
    full: ['Full Basket', 'Caught all nine fruits'],
    combo5: ['Combo Star', '5 in a row'],
    combo10: ['Super Combo', '10 in a row'],
    heart: ['Wise Heart', 'Every heart choice right'],
    quick: ['Quick Thinker', '3 fast right answers'],
    rush: ['Fruit Rush', '20 fruits in the bonus round'],
    trio: ['Faithful Player', 'Finished Easy, Normal and Hard']
  };
  const W = 420, H = 580, BW = 112, BY = H - 70;
  let el, run = null, g = null, raf = 0, Q = null;
  const onResize = () => g && g.size();
  const onKey = e => {
    if (!g) return;
    if (e.key === 'ArrowLeft') { g.keys.l = e.type === 'keydown'; e.preventDefault(); }
    if (e.key === 'ArrowRight') { g.keys.r = e.type === 'keydown'; e.preventDefault(); }
  };
  const mult = () => 1 + Math.min(4, Math.floor(run.combo / 3)) * .5;

  function css() {
    if (document.getElementById('fruit-css')) return;
    const st = document.createElement('style'); st.id = 'fruit-css';
    st.textContent = `
      .fr-list{display:flex;flex-wrap:wrap;gap:6px}
      .fr-chip{font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;border:2px dashed var(--line);color:var(--muted)}
      .fr-chip.got{border-style:solid;color:#fff;border-color:${ink};animation:frPop .35s cubic-bezier(.3,1.6,.5,1)}
      @keyframes frPop{50%{transform:scale(1.25)}}
      .fr-canvas{width:100%;max-width:min(620px,calc((100vh - var(--gbh,60px) - 370px) * .724));min-width:min(100%,260px);height:auto;margin:0 auto;display:block;border:3px solid var(--line);border-radius:16px;touch-action:none;cursor:ew-resize;order:9}
      .fr-lay{display:flex;flex-direction:column;gap:12px}.fr-side{display:contents}
      @media (orientation:landscape) and (min-width:640px){.fr-lay{display:grid;grid-template-columns:min(calc((100vh - var(--gbh,60px) - 40px) * .724),calc(min(100vw, 1240px) - 320px)) minmax(240px,1fr);align-items:start;gap:16px}.fr-side{display:grid;gap:12px;align-content:start}.fr-canvas{width:100%;max-width:none;min-width:0;margin:0;order:0}}
      .fr-score{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-variant-numeric:tabular-nums}
      .fr-score .pts{font-family:var(--display);font-weight:400;font-size:26px;color:var(--amber);-webkit-text-stroke:1px #13203A;transition:transform .15s}
      .fr-score .pts.bump{transform:scale(1.25)}
      .fr-score .combo{padding:3px 10px;border-radius:999px;background:#FFE58A;color:#13203A;border:2px solid #13203A}
      .fr-q{font-family:var(--display);font-size:clamp(21px,5vw,28px);line-height:1.2;margin:0}
      .fr-opts{display:grid;gap:10px}
      .fr-opt{font:inherit;font-weight:800;font-size:17px;text-align:left;padding:14px 16px;border-radius:14px;border:3px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;box-shadow:0 4px 0 var(--line);display:flex;gap:10px;align-items:center}
      .fr-opt b{display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:50%;background:var(--chip);border:2px solid var(--line);font-size:14px}
      .fr-opt:disabled{cursor:default}
      .fr-opt.right{background:#D6F5E4;color:#13203A;border-color:#14946B}
      .fr-opt.wrong{background:#FBD9DD;color:#13203A;border-color:#D7263D}
      .fr-opt.glow{box-shadow:0 0 0 5px #FFD447,0 4px 0 var(--line)}
      .fr-clock{height:10px;border:2px solid var(--line);border-radius:99px;background:var(--chip);overflow:hidden}
      .fr-clock span{display:block;height:100%;background:linear-gradient(90deg,#D7263D,#F2A007)}
      .fr-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
      .fr-badge{display:grid;justify-items:center;gap:2px;width:96px;padding:8px 6px;border-radius:14px;border:3px solid var(--line);background:var(--bg);font-weight:800;font-size:12px;text-align:center;line-height:1.2}
      .fr-badge svg{width:34px;height:34px}
      .fr-badge.off{opacity:.35}
      .fr-badge.new{background:#FFE58A;color:#13203A;border-color:#13203A;animation:frPop .5s ease 2}
      .fr-badge small{font-weight:700;opacity:.8;font-size:11px}
      .fr-round{text-align:center;display:grid;gap:10px;justify-items:center}
      .fr-round .big{font-family:var(--display);font-size:clamp(34px,9vw,52px);line-height:1}
      .confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:4}
      .confetti i{position:absolute;top:-10px;width:9px;height:14px;border-radius:2px;animation:fall 1.4s ease-in forwards}
      @keyframes fall{to{transform:translateY(520px) rotate(540deg);opacity:0}}
      @media (prefers-reduced-motion:reduce){.fr-chip.got,.fr-badge.new{animation:none}.confetti{display:none}}`;
    document.head.appendChild(st);
  }
  const badgeSvg = on => `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M12 24l-4 14 8-4 4 6 3-14M28 24l4 14-8-4-4 6-3-14" fill="#3F6FE0" stroke="${ink}" stroke-width="2"/><circle cx="20" cy="16" r="13" fill="${on ? '#FFD447' : '#DCE7F3'}" stroke="${ink}" stroke-width="2.5"/><path d="M20 8l2.4 5 5.4.6-4 3.8 1.1 5.4L20 20l-4.9 2.8 1.1-5.4-4-3.8 5.4-.6z" fill="${on ? '#F2A007' : '#fff'}" stroke="${ink}" stroke-width="1.5"/></svg>`;
  function confetti(n = 40) {
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#E63946', '#F4A300', '#8CC63F', '#3F6FE0', '#FF6F91', '#7A3E9D', '#FFD447'];
    box.innerHTML = Array.from({ length: n }, () => `<i style="left:${Math.random() * 100}%;background:${cols[Math.floor(Math.random() * cols.length)]};animation-delay:${Math.random() * .4}s;animation-duration:${1 + Math.random() * .8}s"></i>`).join('');
    el.appendChild(box); setTimeout(() => box.remove(), 2400);
  }

  function intro() {
    stop();
    const got = storeJSON('fruit-badges') || [];
    const bests = Ark.DIFFS.map(d => [d, +(store('fruit-pts-' + d) || 0)]).filter(x => x[1]);
    Ark.menu(el, {
      id: 'fruit-catch', title: 'Fruit of the Spirit', icon: 'heart', color: '#B5F08C',
      blurb: 'Catch good fruit, make wise choices, beat your best score!',
      how: [['basket', 'Round 1: Catch the good fruit'], ['quiz', 'Round 2: Make heart choices'], ['star', 'Round 3: Fruit Rush bonus']],
      listen: 'Round one: slide the basket to catch the fruit of the Spirit, and leave the bad behaviours behind. Round two: choose the response that pleases God. Round three: a fast bonus round. Get combos for answers in a row, and earn badges.',
      diffs: { easy: 'Spot the fruit versus the bad behaviour. Slow, with hints and no hearts.', normal: 'Pick the good response to everyday situations. Faster, with timers.', hard: 'Tricky real-life choices with four answers. Fastest, no hints.' },
      extra: `${bests.length ? `<p style="margin:0;font-weight:800">Your best scores: ${bests.map(([d, p]) => `${Ark.DLABEL[d]} ${p}`).join(' · ')}</p>` : ''}
        <div><p style="margin:0 0 6px;font-weight:800">Badges: ${got.length} of ${Object.keys(BADGES).length}</p><div class="fr-badges">${Object.entries(BADGES).map(([k, [t, d]]) => `<div class="fr-badge ${got.includes(k) ? '' : 'off'}">${badgeSvg(got.includes(k))}${t}<small>${d}</small></div>`).join('')}</div></div>`,
      start: d => { run = { diff: d, C: D[d], score: 0, combo: 0, bestCombo: 0, got: 0, qRight: 0, quick: 0, rushN: 0, hits: 0 }; roundCard(1); }
    });
  }

  function scoreBar() {
    return `<div class="fr-score"><span class="dpill ${run.diff}">${Ark.DLABEL[run.diff]}</span><span>Score <span class="pts" id="pts">${run.score}</span></span><span class="combo" id="cmb" ${run.combo >= 2 ? '' : 'hidden'}>Combo ×${mult()}</span></div>`;
  }
  function addPoints(p) {
    run.score += Math.round(p);
    const e = el.querySelector('#pts'); if (e) { e.textContent = run.score; e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); setTimeout(() => e.classList.remove('bump'), 160); }
  }
  function comboUp() {
    run.combo++; run.bestCombo = Math.max(run.bestCombo, run.combo);
    const c = el.querySelector('#cmb'); if (c) { c.hidden = run.combo < 2; c.textContent = `Combo ×${mult()} · ${run.combo} in a row`; }
    if (run.combo === 5 || run.combo === 10) { confetti(30); Ark.toast(`${run.combo} in a row! Combo ×${mult()}`); say(`${run.combo} in a row!`); }
  }
  function comboBreak() { run.combo = 0; const c = el.querySelector('#cmb'); if (c) c.hidden = true; }

  function roundCard(n) {
    stop();
    const names = { 1: ['Round 1: Catch', 'Catch the fruit of the Spirit. Leave the bad behaviours behind!'], 2: ['Round 2: Heart Choices', run.diff === 'easy' ? 'Which one is a fruit of the Spirit?' : run.diff === 'normal' ? 'What is the good thing to do?' : 'Which response shows Christian character?'], 3: ['Round 3: Fruit Rush!', `Bonus round! Catch as many fruits as you can in ${run.C.rush} seconds.`] };
    const [t, d] = names[n];
    el.innerHTML = `${scoreBar()}${bar((n - 1) / 3, `Round ${n} of 3`, 'gold')}
      <div class="fr-round"><span class="big">${t}</span><p class="story">${d}</p>
      <button class="btn big" id="go">${Ark.UI.play} Go!</button></div>`;
    say(t + '. ' + d);
    el.querySelector('#go').onclick = () => (n === 1 ? catchRound() : n === 2 ? choiceRound() : rushRound());
    Ark.ctl({ restart: () => { run = { ...run, score: 0, combo: 0, bestCombo: 0, got: 0, qRight: 0, quick: 0, rushN: 0, hits: 0 }; roundCard(1); } });
  }

  /* ---------- Rounds 1 and 3: catching ---------- */
  function canvasRound(rush) {
    const C = run.C;
    el.innerHTML = `<div class="fr-lay"><canvas class="fr-canvas" id="frC" width="${W}" height="${H}" aria-label="Move the basket left and right to catch fruit."></canvas><div class="fr-side">${scoreBar()}
      <div id="frBar">${rush ? bar(1, `Time: ${C.rush}s`, 'blue') : bar(0, 'Fruit caught: 0 of 9')}</div>
      ${rush ? '' : `<div class="fr-list" id="frList">${FRUITS.map((f, i) => `<span class="fr-chip" data-i="${i}">${f.w}</span>`).join('')}</div>`}
      <div id="frLearn" style="min-height:62px"></div></div></div>`;
    const cv = el.querySelector('#frC');
    g = { rush, cv, cx: cv.getContext('2d'), x: W / 2, target: W / 2, items: [], got: new Set(), hearts: C.hearts, t: 0, spawn: .4, last: performance.now(), keys: {}, pops: [], over: false, paused: false, sparks: [] };
    g.size = () => { const d = Math.min(3, devicePixelRatio || 1), w = cv.clientWidth || W; cv.width = Math.round(w * d); cv.height = Math.round(w * H / W * d); g.cx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); };
    g.size();
    const toX = e => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    cv.onpointerdown = e => { try { cv.setPointerCapture(e.pointerId); } catch (_) {} g.target = toX(e); };
    cv.onpointermove = e => { if (e.pointerType === 'mouse' || e.buttons) g.target = toX(e); };
    raf = requestAnimationFrame(loop);
    Ark.ctl({
      help: !rush && C.hint ? () => { const left = FRUITS.filter((f, i) => !g.got.has(i)).map(f => f.w); say('Still to catch: ' + left.join(', ') + '. Avoid the thorny balls.'); Ark.toast('Still to catch: ' + left.join(', ')); } : null,
      pause: () => { g.paused = true; }, resume: () => { g.paused = false; g.last = performance.now(); },
      restart: () => (rush ? rushRound() : catchRound())
    });
  }
  function catchRound() {
    canvasRound(false);
    learn(el.querySelector('#frLearn'), 'Slide the basket. Catch good fruit, and leave the thorny behaviours behind!', `${run.C.catchTime} seconds`, { icon: Ark.I.basket, speak: run.diff === 'easy' });
  }
  function rushRound() {
    canvasRound(true);
    learn(el.querySelector('#frLearn'), 'Fruit Rush! Golden fruit is worth extra points. Go, go, go!', '', { icon: Ark.I.star, speak: true });
  }

  function spawn() {
    const C = run.C;
    if (!g.rush && Math.random() < C.bad) {
      g.items.push({ bad: true, w: BADS[Math.floor(Math.random() * BADS.length)], x: 40 + Math.random() * (W - 80), y: -30, r: 24, spin: 0 });
    } else {
      const missing = FRUITS.map((f, i) => i).filter(i => !g.got.has(i));
      const pool = !g.rush && missing.length && Math.random() < .65 ? missing : FRUITS.map((f, i) => i);
      g.items.push({ i: pool[Math.floor(Math.random() * pool.length)], x: 40 + Math.random() * (W - 80), y: -30, r: 26, spin: Math.random() * 6, gold: g.rush });
    }
  }
  const msg = (t, r, o) => learn(el.querySelector('#frLearn'), t, r || '', o || {});

  function loop(now) {
    if (!g) return;
    if (g.paused) { g.last = now; draw(); raf = requestAnimationFrame(loop); return; }
    const dt = Math.min(.033, (now - g.last) / 1000); g.last = now; g.t += dt;
    const C = run.C, limit = g.rush ? C.rush : C.catchTime;
    if (g.keys.l) g.target -= 420 * dt;
    if (g.keys.r) g.target += 420 * dt;
    g.target = Math.max(BW / 2, Math.min(W - BW / 2, g.target));
    g.x += (g.target - g.x) * Math.min(1, dt * 14);
    g.spawn -= dt;
    if (g.spawn <= 0 && !g.over) { spawn(); g.spawn = (g.rush ? C.rushEvery : C.every) * (0.85 + Math.random() * .3); }
    const speed = (C.speed + g.t * C.accel * (g.rush ? 3 : 1)) * (g.rush ? 1.35 : 1);
    if (g.rush) setBar(el.querySelector('#frBar .pbar'), Math.max(0, 1 - g.t / limit), `Time: ${Math.max(0, Math.ceil(limit - g.t))}s`);
    for (const it of g.items) {
      it.y += speed * dt; it.spin += dt;
      if (!it.done && it.y + it.r >= BY && it.y - it.r < BY + 24 && Math.abs(it.x - g.x) < BW / 2 + it.r * .4) {
        it.done = true;
        if (it.bad) {
          comboBreak(); run.hits++;
          const [why, opp, ref] = BAD[it.w];
          g.pops.push({ x: it.x, y: BY - 10, t: 0, text: 'Oops!', c: tok('--ruby') });
          msg(`${it.w} isn’t a fruit of the Spirit. ${why} Try ${opp} instead!`, ref, { icon: Ark.I.ear, speak: true });
          if (C.hearts) { g.hearts--; if (g.hearts <= 0 && !g.over) { g.over = true; msg('Out of hearts! No problem, on to the next round.', '', { icon: Ark.I.heart, speak: true }); setTimeout(() => g && endCatch(), 1600); } }
        } else {
          const f = FRUITS[it.i], first = !g.rush && !g.got.has(it.i);
          comboUp();
          const p = (g.rush ? 25 : first ? 30 : 10) * mult();
          addPoints(p);
          g.pops.push({ x: it.x, y: BY - 10, t: 0, text: `+${Math.round(p)}`, c: g.rush ? '#F2A007' : f.c });
          for (let k = 0; k < 8; k++) g.sparks.push({ x: it.x, y: BY, vx: (Math.random() - .5) * 260, vy: -Math.random() * 260, t: 0, c: f.c });
          if (g.rush) run.rushN++;
          if (first) {
            g.got.add(it.i); run.got = g.got.size;
            msg(`${f.w} means ${f.m}.`, 'Galatians 5:22–23', { icon: Ark.I.heart, speak: true });
            const chip = el.querySelector(`.fr-chip[data-i="${it.i}"]`); if (chip) { chip.classList.add('got'); chip.style.background = f.c; }
            setBar(el.querySelector('#frBar .pbar'), g.got.size / 9, `Fruit caught: ${g.got.size} of 9`);
            if (g.got.size === 9 && !g.over) { g.over = true; confetti(); addPoints(200); msg('Full basket! +200 bonus points!', '', { icon: Ark.I.star, speak: true }); setTimeout(() => g && endCatch(), 1500); }
          }
        }
      }
    }
    if (!g.over && g.t >= limit) { g.over = true; if (g.rush) { confetti(); setTimeout(() => g && finishAll(), 900); } else { msg('Time’s up! On to the next round.', '', { icon: Ark.I.star }); setTimeout(() => g && endCatch(), 1300); } }
    g.items = g.items.filter(it => !it.done && it.y < H + 40);
    g.pops.forEach(p => (p.t += dt)); g.pops = g.pops.filter(p => p.t < 1);
    g.sparks.forEach(s => { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 600 * dt; }); g.sparks = g.sparks.filter(s => s.t < .7);
    draw();
    raf = requestAnimationFrame(loop);
  }
  function endCatch() { stop(); roundCard(2); }

  function fruitShape(c, it) {
    const f = FRUITS[it.i], r = it.r;
    c.save(); c.translate(it.x, it.y); c.rotate(Math.sin(it.spin * 2) * .15);
    c.lineWidth = 2.5; c.strokeStyle = ink; c.fillStyle = f.c;
    if (f.k === 'grapes') {
      [[-9, -8], [9, -8], [0, -8], [-5, 4], [5, 4], [0, 15], [-13, 3], [13, 3]].forEach(([dx, dy]) => { c.beginPath(); c.arc(dx * .9, dy * .9, 8, 0, 7); c.fill(); c.stroke(); });
    } else if (f.k === 'pear') {
      c.beginPath(); c.arc(0, 7, r * .82, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(0, -9, r * .52, 0, 7); c.fill(); c.stroke();
    } else if (f.k === 'lemon') {
      c.beginPath(); c.ellipse(0, 0, r, r * .72, 0, 0, 7); c.fill(); c.stroke();
    } else {
      c.beginPath(); c.arc(0, 0, r * (f.k === 'apple' ? .95 : .9), 0, 7); c.fill(); c.stroke();
      if (f.k === 'apple') { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-8, -8, 6, 0, 7); c.fill(); }
    }
    c.strokeStyle = '#6B4423'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -r + 2); c.lineTo(3, -r - 8); c.stroke();
    c.fillStyle = '#3FA34D'; c.strokeStyle = ink; c.lineWidth = 1.5; c.beginPath(); c.ellipse(11, -r - 5, 9, 4.5, -.4, 0, 7); c.fill(); c.stroke();
    c.restore();
    label(c, f.w, it.x, it.y + r + 14);
  }
  function badShape(c, it) {
    const r = it.r;
    c.save(); c.translate(it.x, it.y); c.rotate(it.spin);
    c.fillStyle = '#5A4632'; c.strokeStyle = ink; c.lineWidth = 2.5;
    c.beginPath();
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = k % 2 ? r * .7 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.stroke();
    c.restore();
    label(c, it.w, it.x, it.y + r + 14, true);
  }
  function label(c, text, x, y, bad) {
    c.font = '800 14px Nunito, "Segoe UI", system-ui, sans-serif';
    const w = c.measureText(text).width + 14;
    c.fillStyle = bad ? '#3B2A1C' : '#FFFFFF'; c.strokeStyle = ink; c.lineWidth = 2;
    c.beginPath(); c.roundRect ? c.roundRect(x - w / 2, y - 11, w, 22, 11) : c.rect(x - w / 2, y - 11, w, 22); c.fill(); c.stroke();
    c.fillStyle = bad ? '#FFFFFF' : ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x, y + 1);
  }
  function draw() {
    const c = g.cx;
    c.clearRect(0, 0, W, H);
    c.fillStyle = g.rush ? '#FFF3C4' : tok('--chip'); c.fillRect(0, 0, W, H);
    c.fillStyle = tok('--emerald'); c.strokeStyle = ink; c.lineWidth = 3;
    [[40, 10, 70], [140, -10, 80], [260, 0, 85], [380, 12, 70]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); });
    c.fillStyle = tok('--emerald'); c.globalAlpha = .35; c.fillRect(0, H - 30, W, 30); c.globalAlpha = 1;
    for (const it of g.items) {
      if (it.gold) { c.fillStyle = 'rgba(255,212,71,.55)'; c.beginPath(); c.arc(it.x, it.y, it.r + 10 + Math.sin(it.spin * 8) * 3, 0, 7); c.fill(); }
      it.bad ? badShape(c, it) : fruitShape(c, it);
    }
    const x = g.x - BW / 2;
    c.fillStyle = '#C68A4B'; c.strokeStyle = ink; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x, BY); c.lineTo(x + BW, BY); c.lineTo(x + BW - 12, BY + 46); c.lineTo(x + 12, BY + 46); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#8B5A2B'; c.lineWidth = 2;
    for (let yy = BY + 10; yy < BY + 44; yy += 9) { c.beginPath(); c.moveTo(x + 4 + (yy - BY) * .26, yy); c.lineTo(x + BW - 4 - (yy - BY) * .26, yy); c.stroke(); }
    c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 4, BY); c.lineTo(x + BW + 4, BY); c.stroke();
    c.font = '800 13px Nunito, "Segoe UI", system-ui, sans-serif'; c.fillStyle = '#FFF3DC'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(g.rush ? `${run.rushN} caught` : `${g.got.size} / 9`, g.x, BY + 26);
    if (run.C.hearts && !g.rush) { c.font = '800 20px Nunito, sans-serif'; c.fillStyle = '#D7263D'; c.textAlign = 'left'; c.fillText('♥'.repeat(Math.max(0, g.hearts)) + '♡'.repeat(run.C.hearts - Math.max(0, g.hearts)), 12, H - 14); }
    for (const s of g.sparks) { c.globalAlpha = 1 - s.t / .7; c.fillStyle = s.c; c.beginPath(); c.arc(s.x, s.y, 4, 0, 7); c.fill(); }
    c.globalAlpha = 1; c.textAlign = 'center';
    c.font = '800 22px "Lilita One", Nunito, sans-serif';
    for (const p of g.pops) { c.globalAlpha = 1 - p.t; c.fillStyle = p.c; c.strokeStyle = ink; c.lineWidth = 3; c.strokeText(p.text, p.x, p.y - p.t * 50); c.fillText(p.text, p.x, p.y - p.t * 50); }
    c.globalAlpha = 1;
  }

  /* ---------- Round 2: heart choices ---------- */
  function choiceRound() {
    stop();
    const C = run.C, diff = run.diff;
    const qs = diff === 'easy'
      ? shuf(PAIRS).slice(0, C.nQ).map(p => { const f = FRUITS.find(x => x.w === p.good); return { q: 'Which one is a fruit of the Spirit?', o: shuf([[p.good, 1, `${p.good} means ${f.m}.`], [p.bad, 0, BAD[p.bad][0]]]), ref: 'Galatians 5:22–23' }; })
      : shuf(diff === 'normal' ? NORMAL : HARD).slice(0, C.nQ).map(q => ({ ...q, o: shuf(q.o) }));
    Q = { qs, i: 0, res: [], raf: 0, left: 0, running: false, last: 0, answered: false };
    showQ();
  }
  function showQ() {
    const { qs, i } = Q, q = qs[i], C = run.C;
    cancelAnimationFrame(Q.raf); Q.answered = false;
    el.innerHTML = `${scoreBar()}${bar((1 + i / qs.length) / 3, `Round 2 · Question ${i + 1} of ${qs.length}`, 'gold')}
      ${steps(qs.length, i, i, Q.res.map((r, k) => (r ? -1 : k)).filter(k => k >= 0))}
      ${C.qTime ? '<div class="fr-clock"><span id="clk" style="width:100%"></span></div>' : ''}
      <p class="fr-q">${q.q}</p>
      <div class="fr-opts">${q.o.map((o, k) => `<button class="fr-opt" data-k="${k}"><b>${'ABCD'[k]}</b><span>${o[0]}</span></button>`).join('')}</div>
      <div id="frLearn"></div>
      ${Ark.canSpeak ? '<div class="row"><button class="chip" id="rd">Listen</button></div>' : ''}`;
    const read = () => say(q.q + ' ' + q.o.map((o, k) => `${'ABCD'[k]}, ${o[0]}`).join('. '), true);
    const rd = el.querySelector('#rd'); if (rd) rd.onclick = read;
    if (run.diff === 'easy') say(q.q + ' ' + q.o.map(o => o[0]).join(', or ') + '?');
    el.querySelectorAll('.fr-opt').forEach(b => (b.onclick = () => answer(+b.dataset.k)));
    Q.t0 = performance.now();
    if (C.qTime) { Q.left = C.qTime; Q.running = true; Q.last = performance.now(); Q.raf = requestAnimationFrame(qTick); }
    Ark.ctl({
      help: C.hint ? () => { if (Q.answered) return; const k = q.o.findIndex(o => o[1]); el.querySelector(`.fr-opt[data-k="${k}"]`).classList.add('glow'); Q.helped = true; say('Think about what would please God. Try this one.', true); } : null,
      pause: C.qTime ? () => { Q.running = false; } : null,
      resume: C.qTime ? () => { if (!Q.answered) { Q.running = true; Q.last = performance.now(); } } : null,
      restart: choiceRound
    });
  }
  function qTick(now) {
    if (!Q) return;
    if (Q.running) {
      Q.left -= (now - Q.last) / 1000;
      const c = el.querySelector('#clk'); if (c) c.style.width = Math.max(0, Q.left / run.C.qTime * 100) + '%';
      if (Q.left <= 0) { Q.running = false; return answer(-1); }
    }
    Q.last = now; Q.raf = requestAnimationFrame(qTick);
  }
  function answer(k) {
    if (Q.answered) return;
    Q.answered = true; Q.running = false; cancelAnimationFrame(Q.raf);
    const q = Q.qs[Q.i], pick = q.o[k], ok = !!(pick && pick[1]), good = q.o.find(o => o[1]);
    Q.res[Q.i] = ok;
    el.querySelectorAll('.fr-opt').forEach(b => { b.disabled = true; if (q.o[+b.dataset.k][1]) b.classList.add('right'); });
    if (pick && !ok) el.querySelector(`.fr-opt[data-k="${k}"]`).classList.add('wrong');
    const secs = (performance.now() - Q.t0) / 1000;
    if (ok) {
      comboUp(); run.qRight++;
      const speedBonus = run.C.qTime ? Math.max(0, Math.round(Q.left * 5)) : 0;
      if (secs < 5) run.quick++;
      const p = (100 + speedBonus) * mult() * (Q.helped ? .5 : 1);
      addPoints(p);
      confetti(18);
      msg(`${['Wise choice!', 'Well done!', 'That’s the fruit of the Spirit!'][Q.i % 3]} +${Math.round(p)}${speedBonus ? ' (speed bonus!)' : ''}. ${good[2]}`, q.ref || '', { icon: Ark.I.star, speak: true });
    } else {
      comboBreak();
      msg(`${k < 0 ? 'Time’s up!' : 'Not the best choice.'} ${pick ? pick[2] + ' ' : ''}The best answer: “${good[0]}”. ${good[2]}`, q.ref || '', { icon: Ark.I.ear, speak: true });
    }
    Q.helped = false;
    const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center';
    row.innerHTML = `<button class="btn big" id="nx">${Q.i + 1 < Q.qs.length ? 'Next question' : 'Fruit Rush!'} ${Ark.UI.play}</button>`;
    el.querySelector('#frLearn').after(row);
    const nx = el.querySelector('#nx'); nx.focus({ preventScroll: true });
    nx.onclick = () => { hush(); Q.i++; Q.i < Q.qs.length ? showQ() : (Q = null, roundCard(3)); };
  }

  /* ---------- results ---------- */
  function finishAll() {
    stop();
    const { diff, score, bestCombo, got, qRight, quick, rushN, C } = run;
    const best = +(store('fruit-pts-' + diff) || 0), isBest = score > best;
    if (isBest) store('fruit-pts-' + diff, score);
    const done = storeJSON('fruit-diffs') || []; if (!done.includes(diff)) { done.push(diff); storeJSON('fruit-diffs', done); }
    const have = storeJSON('fruit-badges') || [], earned = [];
    const check = (k, cond) => { if (cond && !have.includes(k)) { have.push(k); earned.push(k); } };
    check('full', got === 9); check('combo5', bestCombo >= 5); check('combo10', bestCombo >= 10);
    check('heart', qRight === C.nQ); check('quick', quick >= 3); check('rush', rushN >= 20); check('trio', done.length === 3);
    storeJSON('fruit-badges', have);
    const stars = got === 9 && qRight >= C.nQ - 1 ? 3 : got >= 6 && qRight >= 3 ? 2 : 1;
    Ark.finish(el, {
      id: 'fruit-catch', diff, stars, title: isBest && best ? 'New personal best!' : undefined,
      html: `<div class="fr-round"><span class="big" style="color:var(--amber);-webkit-text-stroke:1.5px #13203A">${score}</span><span style="font-weight:800">points${best && !isBest ? ` · your best is ${best}` : isBest ? ' · your best score!' : ''}</span></div>
        <p class="story" style="font-size:17px">${got} of 9 fruits caught · ${qRight} of ${C.nQ} heart choices right · ${rushN} fruits in the Rush · longest combo ${bestCombo}</p>
        ${earned.length ? `<p style="margin:0;font-weight:800">New badge${earned.length > 1 ? 's' : ''}!</p><div class="fr-badges">${earned.map(k => `<div class="fr-badge new">${badgeSvg(true)}${BADGES[k][0]}<small>${BADGES[k][1]}</small></div>`).join('')}</div>` : ''}
        <p style="margin:0;font-weight:700;color:var(--muted)">Badges: ${have.length} of ${Object.keys(BADGES).length}. Play again to beat your score!</p>`,
      verse: ['But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.', 'Galatians 5:22–23'],
      lesson: 'Feelings like anger or jealousy will come, and that’s normal. What matters is what we do next. When we stay close to Jesus, His Spirit helps us choose love, patience and kindness (John 15:5).',
      again: () => { run = { diff, C: D[diff], score: 0, combo: 0, bestCombo: 0, got: 0, qRight: 0, quick: 0, rushN: 0, hits: 0 }; roundCard(1); }, menu: intro,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-fruit-catch', d); run = { diff: d, C: D[d], score: 0, combo: 0, bestCombo: 0, got: 0, qRight: 0, quick: 0, rushN: 0, hits: 0 }; roundCard(1); }] : null
    });
    if (isBest || earned.length) confetti(60);
  }

  function stop() { cancelAnimationFrame(raf); g = null; if (Q) cancelAnimationFrame(Q.raf); }

  Ark.games['fruit-catch'] = {
    mount(stage) { el = stage; css(); addEventListener('resize', onResize); addEventListener('keydown', onKey); addEventListener('keyup', onKey); intro(); },
    unmount() { stop(); Q = null; removeEventListener('resize', onResize); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); hush(); },
    _test: { state: () => g, run: () => run, q: () => Q, loop: t => loop(t), stop: () => cancelAnimationFrame(raf), answer: k => answer(k) }
  };
})();
