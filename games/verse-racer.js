/* Verse Racer: learn a verse, then race your car by tapping its words in order. Each difficulty is a ladder of verses that unlock one by one. */
(() => {
  const { store, storeJSON, shuf, say, hush, bar, setBar, learn, G, I } = Ark;
  const LADDER = {
    easy: [
      { r: 'Psalm 23:1', t: 'The LORD is my shepherd; I shall not want.', m: 'God takes care of me like a shepherd cares for his sheep.' },
      { r: '1 John 4:19', t: 'We love him, because he first loved us.', m: 'God loved us first, so we love Him back.' },
      { r: 'Psalm 56:3', t: 'What time I am afraid, I will trust in thee.', m: 'When I feel scared, I can trust God.' },
      { r: 'Genesis 1:1', t: 'In the beginning God created the heaven and the earth.', m: 'God made everything.' },
      { r: 'Philippians 4:13', t: 'I can do all things through Christ which strengtheneth me.', m: 'Jesus gives me strength.' }
    ],
    normal: [
      { r: 'Psalm 119:105', t: 'Thy word is a lamp unto my feet, and a light unto my path.', m: 'The Bible shows me the right way to go.' },
      { r: 'Psalm 118:24', t: 'This is the day which the LORD hath made; we will rejoice and be glad in it.', m: 'Every day is a gift from God.' },
      { r: 'Romans 12:21', t: 'Be not overcome of evil, but overcome evil with good.', m: 'Answer unkindness with kindness.' },
      { r: 'Proverbs 3:5', t: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', m: 'Trust God even when you don’t understand.' },
      { r: 'Matthew 19:14', t: 'Suffer little children, and forbid them not, to come unto me: for of such is the kingdom of heaven.', m: 'Jesus welcomes children. “Suffer” here means “let”.' }
    ],
    hard: [
      { r: 'John 3:16', t: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', m: 'God gave Jesus so we can live with Him forever.' },
      { r: 'Matthew 6:33', t: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.', m: 'Put God first, and He will take care of the rest.' },
      { r: 'Joshua 1:9', t: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', m: 'God is with you wherever you go.' },
      { r: 'Jeremiah 29:11', t: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.', m: 'God has good plans for you.' },
      { r: 'Isaiah 40:31', t: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', m: 'God gives new strength to those who trust Him.' }
    ]
  };
  const DECOYS = ['bread', 'mountain', 'quickly', 'river', 'silver', 'garden', 'tomorrow', 'stone', 'always', 'shall'];
  let el, diff = 'easy', idx = 0, race = null;
  const doneKey = d => 'vr-ladder-' + d;
  const doneCount = d => +(store(doneKey(d)) || 0);
  const clean = w => w.replace(/[;:,.]/g, '');

  function menu() {
    stopRace();
    Ark.menu(el, {
      id: 'verse-racer', title: 'Verse Racer', icon: 'car', color: '#7FB2FF',
      blurb: 'Learn a verse, then race to build it!',
      how: [['scroll', 'Read the verse'], ['tap', 'Tap the words in order'], ['star', 'Unlock the next verse']],
      listen: 'First read the verse. Then tap the words in the right order to race your car to the finish. Finish a verse to unlock the next one.',
      diffs: { easy: 'Short verses in big word groups. The next piece glows if you need help.', normal: 'Longer verses, one word at a time, with first-letter clues.', hard: 'Long verses from memory, with tricky extra words mixed in.' },
      extra: `<div>${['easy', 'normal', 'hard'].map(d => `<p style="margin:0 0 4px;font-weight:800;font-size:14px">${Ark.DLABEL[d]}: ${doneCount(d)} of ${LADDER[d].length} verses</p>`).join('')}</div>`,
      start: d => { diff = d; idx = Math.min(doneCount(d), LADDER[d].length - 1); learnStep(); }
    });
  }

  function ladderBar() {
    const n = LADDER[diff].length, d = doneCount(diff);
    return bar(d / n, `Verses mastered: ${d} of ${n}`, 'gold');
  }

  function learnStep() {
    stopRace();
    const v = LADDER[diff][idx], n = LADDER[diff].length;
    el.innerHTML = `${ladderBar()}
      <div class="hud"><span>Verse ${idx + 1} of ${n}</span><span class="dpill ${diff}">${Ark.DLABEL[diff]}</span></div>
      <div class="verse" id="vrVerse">${v.t}<br><span class="ref">${v.r}</span></div>
      <div id="vrLearn"></div>
      <div class="row"><button class="btn big" id="go">${Ark.UI.play} Start the race</button>${Ark.canSpeak ? `<button class="btn ghost" id="say">${Ark.UI.listen} Listen</button>` : ''}</div>
      <div class="row">${LADDER[diff].map((x, k) => `<button class="chip" data-k="${k}" ${k > doneCount(diff) ? 'disabled' : ''} aria-pressed="${k === idx}">${k < doneCount(diff) ? '★ ' : ''}${x.r}</button>`).join('')}</div>`;
    learn(el.querySelector('#vrLearn'), v.m, 'What it means', { icon: I.heart });
    el.querySelector('#go').onclick = startRace;
    const s = el.querySelector('#say'); if (s) s.onclick = () => say(v.t + '. ' + v.r, true);
    el.querySelectorAll('[data-k]').forEach(b => (b.onclick = () => { idx = +b.dataset.k; learnStep(); }));
    if (diff === 'easy') say(v.t + '. ' + v.r);
    Ark.ctl({ help: () => say(v.t + '. ' + v.r, true), restart: learnStep });
  }

  function pieces(v) {
    const words = v.t.split(' ');
    if (diff !== 'easy') return words;
    const out = []; for (let i = 0; i < words.length; i += 2) out.push(words.slice(i, i + 2).join(' '));
    return out;
  }

  function startRace() {
    hush(); stopRace();
    const v = LADDER[diff][idx], parts = pieces(v);
    const pool = parts.map((w, i) => ({ w, i }));
    if (diff === 'hard') shuf(DECOYS.filter(d => !v.t.toLowerCase().includes(d))).slice(0, 3).forEach(w => pool.push({ w, i: -1 }));
    race = { v, parts, next: 0, mistakes: 0, helps: 0, ms: 0, last: performance.now(), running: true, idle: 0, timer: 0 };
    const clue = diff === 'normal' ? `<p id="clue" style="margin:0;font-weight:800;color:var(--muted);letter-spacing:.04em">${v.t.split(' ').map(w => w[0] + '_'.repeat(Math.max(0, clean(w).length - 1))).join(' ')}</p>` : '';
    el.innerHTML = `<div class="hud"><span>${v.r}</span><span id="tm">0.0s</span></div>
      <div class="track"><svg class="flag" viewBox="0 0 24 32"><path d="M3 2v28" stroke="var(--ink)" stroke-width="3"/><path d="M4 3h16l-4 6 4 6H4z" fill="var(--ruby)" stroke="var(--ink)" stroke-width="2"/></svg><div class="car" id="car">${G.car}</div></div>
      ${diff === 'easy' ? `<p style="margin:0;font-weight:700;color:var(--muted)">${v.t}</p>` : clue}
      <div class="built" id="built" aria-live="polite"></div>
      <p id="vrMsg" style="margin:0;font-weight:800;min-height:1.5em;color:var(--muted)">Tap the ${diff === 'easy' ? 'first words' : 'first word'}!</p>
      <div class="tiles" id="tiles"></div>`;
    const tiles = el.querySelector('#tiles'), built = el.querySelector('#built'), car = el.querySelector('#car'), tm = el.querySelector('#tm'), msg = el.querySelector('#vrMsg');
    const glowNext = () => { const t = [...tiles.children].find(b => !b.disabled && b.textContent === parts[race.next]); if (t) { t.classList.add('glow'); t.focus({ preventScroll: true }); } };
    shuf(pool).forEach(o => {
      const b = document.createElement('button');
      b.className = 'tile'; b.textContent = o.w; b.dataset.i = o.i;
      b.onclick = () => {
        if (!race || !race.running) return;
        race.idle = 0;
        if (o.i === race.next || (o.i >= 0 && parts[o.i] === parts[race.next])) {
          b.disabled = true; built.textContent += (race.next ? ' ' : '') + o.w; race.next++;
          tiles.querySelectorAll('.glow').forEach(x => x.classList.remove('glow'));
          if (diff === 'easy') say(o.w);
          car.style.left = `calc(${race.next / parts.length * 100}% - ${race.next / parts.length * 70}px + 6px)`;
          msg.textContent = race.next < parts.length ? ['Zoom!', 'Great!', 'Keep going!', 'Yes!'][race.next % 4] : 'Finish line!';
          if (race.next === parts.length) { race.running = false; setTimeout(() => race && done(), 450); }
        } else {
          race.mistakes++;
          b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad');
          const prev = race.next ? parts[race.next - 1].split(' ').pop() : null;
          msg.textContent = o.i === -1 ? `“${o.w}” isn’t in this verse!` : diff === 'hard' ? 'Not that one. Think about what comes next.' : prev ? `What comes after “${prev}”?${diff === 'normal' ? ` It starts with “${parts[race.next][0]}”.` : ''}` : 'Which word starts the verse?';
          if (diff === 'easy') glowNext();
        }
      };
      tiles.appendChild(b);
    });
    const tick = () => {
      if (!race) return;
      const now = performance.now();
      if (race.running) {
        race.ms += now - race.last; race.idle += now - race.last;
        tm.textContent = (race.ms / 1000).toFixed(1) + 's';
        if (diff === 'easy' && race.idle > 4000) { glowNext(); race.idle = -99999; }
      }
      race.last = now; race.timer = requestAnimationFrame(tick);
    };
    race.timer = requestAnimationFrame(tick);
    Ark.ctl({
      help: diff === 'hard' ? null : () => { race.helps++; glowNext(); say(parts[race.next], true); },
      pause: () => { race.running = false; },
      resume: () => { if (race && race.next < parts.length) { race.running = true; race.last = performance.now(); } },
      restart: startRace
    });
  }

  function done() {
    const { v, mistakes, ms, helps } = race, s = +(ms / 1000).toFixed(1);
    stopRace();
    const n = LADDER[diff].length;
    let first = false;
    if (idx >= doneCount(diff)) { store(doneKey(diff), idx + 1); first = true; }
    const d = doneCount(diff);
    const stars = Math.max(1, Math.floor(d / n * 3));
    const b = store(`vr-best-${diff}-${idx}`), rec = !b || s < +b;
    if (rec) store(`vr-best-${diff}-${idx}`, s);
    const nextIdx = idx + 1 < n ? idx + 1 : null;
    Ark.finish(el, {
      id: 'verse-racer', diff, stars,
      title: first ? (d === n ? 'Every verse mastered!' : 'Verse unlocked!') : 'You crossed the finish line!',
      html: `${ladderBar()}<p class="story">${s} seconds · ${mistakes} mistake${mistakes === 1 ? '' : 's'}${helps ? ` · ${helps} hint${helps > 1 ? 's' : ''}` : ''}${rec ? ' · best time!' : ` · best ${b}s`}</p>
        <p style="margin:0;font-weight:800;color:var(--muted)">Can you say it without looking?</p>`,
      verse: [v.t, v.r], lesson: v.m,
      again: () => startRace(),
      next: nextIdx !== null ? ['Next verse', () => { idx = nextIdx; learnStep(); }] : diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { diff = diff === 'easy' ? 'normal' : 'hard'; store('diff-verse-racer', diff); idx = Math.min(doneCount(diff), LADDER[diff].length - 1); learnStep(); }] : null,
      menu
    });
  }

  function stopRace() { if (race) cancelAnimationFrame(race.timer); race = null; }

  Ark.games['verse-racer'] = {
    mount(stage) { el = stage; menu(); },
    unmount() { stopRace(); hush(); },
    _test: { LADDER, state: () => race }
  };
})();
