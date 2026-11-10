/* Books of the Bible Sort: tap the books in Bible order to fill each shelf. A guide explains each section of the Bible "library"; Help shows the next book. */
(() => {
  const { store, storeJSON, shuf, say, hush, bar, setBar, learn, toTop, I } = Ark;
  const OT = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
  const NT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];
  const range = (l, a, b) => l.slice(l.indexOf(a), l.indexOf(b) + 1);
  // The sections of the Bible library, explained simply
  const SECT = {
    law: { t: 'Law', c: '#C0392B', d: 'The beginning of everything, and God’s rules for His people.' },
    history: { t: 'History', c: '#B9770E', d: 'True stories of what happened to God’s people.' },
    poetry: { t: 'Poetry', c: '#7A3E9D', d: 'Songs, prayers and wise sayings.' },
    prophecy: { t: 'Prophecy', c: '#14946B', d: 'Messages from God, given through prophets.' },
    gospels: { t: 'Gospels', c: '#1F55D6', d: 'Four books about the life of Jesus.' },
    letters: { t: 'Letters', c: '#D35400', d: 'Letters written to churches and friends.' }
  };
  const sectOf = b => {
    const o = OT.indexOf(b);
    if (o >= 0) return o < 5 ? 'law' : o < 17 ? 'history' : o < 22 ? 'poetry' : 'prophecy';
    const n = NT.indexOf(b);
    return n < 4 ? 'gospels' : n === 4 ? 'history' : n === 26 ? 'prophecy' : 'letters';
  };
  const FACT = {
    Matthew: 'Matthew was a tax collector who followed Jesus.', Mark: 'Mark is the shortest Gospel.', Luke: 'Luke was a doctor.', John: 'John wrote, “God so loved the world.”',
    Genesis: 'Genesis means “beginning”. It tells how God made the world.', Exodus: 'Exodus tells how Moses led God’s people out of Egypt.', Leviticus: 'Leviticus teaches how to worship a holy God.', Numbers: 'Numbers counts the people in the wilderness.', Deuteronomy: 'In Deuteronomy, Moses reminds the people of God’s law.',
    Job: 'Job trusted God even in hard times.', Psalms: 'Psalms has 150 songs and prayers.', Proverbs: 'Proverbs is full of wise sayings.', Ecclesiastes: 'Ecclesiastes says there is a time for everything.', 'Song of Solomon': 'Song of Solomon is a love song.',
    Joshua: 'Joshua led the people into the Promised Land.', Judges: 'Judges tells of leaders like Gideon and Samson.', Ruth: 'Ruth was loyal and kind.', '1 Samuel': '1 Samuel tells of David and Goliath.', '2 Samuel': '2 Samuel tells of King David.', '1 Kings': '1 Kings tells of wise King Solomon.', '2 Kings': '2 Kings tells of the prophet Elisha.', '1 Chronicles': 'Chronicles retells the story of the kings.', '2 Chronicles': '2 Chronicles tells of Solomon’s temple.', Ezra: 'Ezra helped God’s people come home.', Nehemiah: 'Nehemiah rebuilt Jerusalem’s walls.', Esther: 'Esther was a brave queen.',
    Romans: 'Romans explains God’s good news.', '1 Corinthians': '1 Corinthians 13 is the famous “love chapter”.', Galatians: 'Galatians lists the fruit of the Spirit.', Ephesians: 'Ephesians talks about the armour of God.', Philippians: 'Philippians is a letter full of joy.', Colossians: 'Colossians says Jesus is over all things.',
    Isaiah: 'Isaiah told about Jesus long before He was born.', Jeremiah: 'Jeremiah is called the weeping prophet.', Lamentations: 'Lamentations is a sad song about Jerusalem.', Ezekiel: 'Ezekiel saw a valley of dry bones come alive.', Daniel: 'Daniel was kept safe in the lions’ den.',
    Jonah: 'Jonah was swallowed by a great fish.', Malachi: 'Malachi is the last book of the Old Testament.', Micah: 'Micah said Jesus would be born in Bethlehem.'
  };
  const LEVELS = [
    { id: 'split', type: 'split', t: 'Old or New?', s: null, d: 'Is each book before Jesus (Old Testament) or about Jesus and His church (New Testament)?' },
    { id: 'gospels', type: 'sort', t: 'The Gospels', s: 'gospels', books: range(NT, 'Matthew', 'John') },
    { id: 'moses', type: 'sort', t: 'The Law', s: 'law', books: range(OT, 'Genesis', 'Deuteronomy') },
    { id: 'poetry', type: 'sort', t: 'Poetry', s: 'poetry', books: range(OT, 'Job', 'Song of Solomon') },
    { id: 'history', type: 'sort', t: 'History', s: 'history', books: range(OT, 'Joshua', 'Esther') },
    { id: 'paul', type: 'sort', t: 'Letters to Churches', s: 'letters', books: range(NT, 'Romans', '2 Thessalonians') },
    { id: 'major', type: 'sort', t: 'Major Prophets', s: 'prophecy', books: range(OT, 'Isaiah', 'Daniel') },
    { id: 'minor', type: 'sort', t: 'Minor Prophets', s: 'prophecy', books: range(OT, 'Hosea', 'Malachi') }
  ];
  const SPINES = ['#C0392B', '#3F6FE0', '#14946B', '#B9770E', '#7A3E9D', '#D35400', '#2A9D8F', '#8E44AD'];
  let el, diff = 'easy', timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const doneSet = () => storeJSON('books-done-' + diff) || [];

  function css() {
    if (document.getElementById('books-css')) return;
    const s = document.createElement('style'); s.id = 'books-css';
    s.textContent = `
      .bk-lib{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px}
      .bk-lib div{display:grid;grid-template-columns:10px 1fr;gap:8px;align-items:start;font-size:14px;font-weight:700;line-height:1.3;padding:6px 8px;border-radius:10px;background:var(--bg)}
      .bk-lib i{width:10px;height:100%;min-height:30px;border-radius:3px;border:2px solid var(--line)}
      .bk-lib b{display:block;font-size:15px}
      .bk-levels{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
      .bk-lv{font:inherit;text-align:left;display:grid;gap:2px;padding:10px 12px;border-radius:14px;border:3px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;border-left-width:10px}
      .bk-lv b{font-size:16px}.bk-lv small{font-weight:700;color:var(--muted);font-size:13px}
      .bk-lv.done{background:#E7F7EE;color:#13203A}.bk-lv.done small{color:#2B6B4A}
      .bk-wrap{min-width:0;position:relative}
      .bk-shelf{display:flex;align-items:flex-end;gap:2px;min-height:150px;padding:10px 6px 0;border:3px solid var(--line);border-radius:14px 14px 6px 6px;background:var(--bg)}
      .bk-plank{height:16px;margin-top:-3px;border:3px solid var(--line);border-radius:4px;background:repeating-linear-gradient(90deg,#A0612D 0 22px,#8B5224 22px 24px)}
      .bk-slot{flex:1 1 0;min-width:18px;max-width:46px;height:130px;border:2px dashed var(--muted);border-bottom:0;border-radius:6px 6px 0 0;opacity:.55;display:flex;align-items:flex-end;justify-content:center;font-weight:800;color:var(--muted);font-size:13px;padding-bottom:4px}
      .bk-slot.next{border-color:var(--amber);opacity:1;border-width:3px;color:var(--ink)}
      .bk-spine{flex:1 1 0;min-width:18px;max-width:46px;height:130px;border:2.5px solid #13203A;border-bottom:0;border-radius:6px 6px 0 0;color:#fff;font-weight:800;font-size:clamp(11px,3vw,13px);writing-mode:vertical-rl;transform:rotate(180deg);display:flex;align-items:center;justify-content:center;padding:6px 0;white-space:nowrap;overflow:hidden;box-shadow:inset 0 10px 0 rgba(255,255,255,.18),inset 0 -10px 0 rgba(0,0,0,.15);animation:bkIn .3s cubic-bezier(.3,1.5,.5,1)}
      @keyframes bkIn{from{transform:rotate(180deg) translateY(30px);opacity:0}}
      .bk-pile{display:flex;flex-wrap:wrap;gap:8px;position:relative}
      .bk-tile{font:inherit;font-weight:800;font-size:16px;padding:10px 14px;border-radius:10px;border:3px solid #13203A;color:#fff;cursor:pointer;box-shadow:0 3px 0 #13203A;border-left-width:8px}
      .bk-tile.bad{animation:shake .3s}
      .bk-tile.glow{box-shadow:0 0 0 5px #FFD447,0 3px 0 #13203A}
      .bk-hand{position:absolute;width:48px;height:48px;pointer-events:none;z-index:3;transition:left .7s ease,top .7s ease;filter:drop-shadow(0 3px 2px rgba(0,0,0,.3))}
      .bk-card{font-family:var(--display);font-size:clamp(30px,8vw,46px);text-align:center;padding:22px 12px;border:3px solid var(--line);border-radius:16px;background:var(--bg)}
      .bk-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .bk-two.six{grid-template-columns:repeat(3,1fr)}
      @media (max-width:420px){.bk-two.six{grid-template-columns:1fr 1fr}}
      .bk-two .btn{padding:14px 8px;font-size:16px;color:#fff}
      .bk-two .btn.glow{box-shadow:0 0 0 5px #FFD447,0 4px 0 #13203A}
      .bk-fb{margin:0;font-weight:800;text-align:center;min-height:1.5em}
      .bk-fb.ok{color:var(--emerald)}.bk-fb.no{color:var(--ruby)}
      @media (prefers-reduced-motion:reduce){.bk-spine{animation:none}}`;
    document.head.appendChild(s);
  }

  const libHTML = open => `<details ${open ? 'open' : ''}><summary style="font-weight:800;cursor:pointer">What are the sections of the Bible?</summary><div class="bk-lib" style="margin-top:8px">${Object.values(SECT).map(s => `<div><i style="background:${s.c}"></i><span><b>${s.t}</b>${s.d}</span></div>`).join('')}</div></details>`;

  function menu() {
    clearTimers();
    Ark.menu(el, {
      id: 'books-sort', title: 'Books of the Bible Sort', icon: 'book', color: '#F3C37A',
      blurb: 'The Bible is a library of 66 books. Put them on the shelf!',
      how: [['tap', 'Tap the book that comes next'], ['shelf', 'Fill the shelf'], ['ear', 'Stuck? Tap Help me']],
      listen: 'The Bible is like a library with 66 books. Tap the books in Bible order to fill the shelf. If you get stuck, tap Help me, and I will show you the next book.',
      diffs: { easy: 'Shorter shelves, letter clues on the shelf and Help any time.', normal: 'Full shelves. Clues appear after a mistake.', hard: 'No clues or help. Old or New becomes “Which section?”' },
      extra: libHTML(),
      start: d => { diff = d; store('books-seen-lib', 1); levels(); }
    });
  }

  function levels() {
    clearTimers();
    const done = doneSet();
    el.innerHTML = `<div class="hud"><span>Choose a shelf</span><span class="dpill ${diff}">${Ark.DLABEL[diff]}</span></div>
      ${bar(done.length / LEVELS.length, `Shelves complete: ${done.length} of ${LEVELS.length}`, 'gold')}
      <div class="bk-levels">${LEVELS.map((L, i) => {
        const S = L.s ? SECT[L.s] : null, n = L.type === 'split' ? (diff === 'hard' ? 'Which section?' : 'Old or New?') : `${shelfBooks(L).length} books`;
        return `<button class="bk-lv ${done.includes(L.id) ? 'done' : ''}" data-l="${i}" style="border-left-color:${S ? S.c : '#13203A'}"><b>${done.includes(L.id) ? '★ ' : ''}${L.type === 'split' && diff === 'hard' ? 'Which section?' : L.t}</b><small>${S ? S.d : 'Sort books into the Old and New Testament.'} · ${n}</small></button>`;
      }).join('')}</div>
      ${libHTML(!store('books-seen-lib2'))}`;
    store('books-seen-lib2', 1);
    el.querySelectorAll('[data-l]').forEach(b => (b.onclick = () => start(+b.dataset.l)));
    Ark.ctl({ help: () => say('Pick a shelf to fill. Start with the Gospels if you are new!', true) });
  }
  const shelfBooks = L => (diff === 'easy' && L.books.length > 6 ? L.books.slice(0, 6) : L.books);
  const start = i => (LEVELS[i].type === 'split' ? split(i) : sort(i));

  function sort(i) {
    clearTimers();
    const L = LEVELS[i], S = SECT[L.s], books = shelfBooks(L);
    let next = 0, mistakes = 0, helps = 0;
    el.innerHTML = `<div class="hud"><span>${L.t}</span><span id="bkM">Mistakes: 0</span></div>
      <p style="margin:0;font-weight:800"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;border:2px solid var(--line);background:${S.c};vertical-align:-1px"></span> ${S.t}: ${S.d}</p>
      <div class="bk-wrap"><div class="bk-shelf" id="shelf">${books.map((b, k) => `<span class="bk-slot" data-s="${k}">${diff === 'easy' ? b[0] === '1' || b[0] === '2' ? b.slice(0, 3) : b[0] : ''}</span>`).join('')}</div><div class="bk-plank"></div></div>
      <div id="bkLearn"></div>
      <p style="margin:0;font-weight:800;font-size:18px">Tap the book that comes ${books.length && 'first'}.</p>
      <div class="bk-pile" id="pile"></div>`;
    const shelf = el.querySelector('#shelf'), pile = el.querySelector('#pile'), lbox = el.querySelector('#bkLearn'), prompt = el.querySelector('#pile').previousElementSibling;
    const markNext = () => { shelf.querySelectorAll('.bk-slot').forEach(s => s.classList.toggle('next', +s.dataset.s === next)); };
    const place = (t, b) => {
      const sp = document.createElement('span'); sp.className = 'bk-spine'; sp.textContent = b; sp.style.background = t.style.background; sp.title = b;
      shelf.replaceChild(sp, shelf.querySelector(`.bk-slot[data-s="${next}"]`));
      t.remove(); next++; markNext();
      learn(lbox, FACT[b] ? `${b}: ${FACT[b]}` : `${b} is in place!`, next < books.length ? `Next: what comes after ${b}?` : 'The shelf is full!', { speak: diff === 'easy', icon: I.book || Ark.I.scroll });
      prompt.textContent = next < books.length ? `What comes after ${b}?` : 'You filled the shelf!';
      if (next === books.length) timers.push(setTimeout(() => done(i, mistakes, helps), 1100));
    };
    shuf(books).forEach(b => {
      const t = document.createElement('button');
      t.className = 'bk-tile'; t.textContent = b; t.style.background = SPINES[Math.floor(Math.random() * SPINES.length)];
      t.onclick = () => {
        if (b === books[next]) { if (diff === 'easy') say(b); place(t, b); }
        else {
          mistakes++; el.querySelector('#bkM').textContent = 'Mistakes: ' + mistakes;
          t.classList.remove('bad'); void t.offsetWidth; t.classList.add('bad');
          const want = books[next];
          const pos = books.indexOf(b);
          const why = pos > next ? `${b} comes later on this shelf.` : '';
          const clue = diff === 'hard' ? '' : ` Look for a book starting with “${want.match(/^\d? ?\S/)[0].trim()}”.`;
          learn(lbox, `Not yet! ${why}${next ? ` What comes after ${books[next - 1]}?` : ' Which book is first?'}${clue}`, '', { speak: diff === 'easy', icon: Ark.I.ear });
        }
      };
      pile.appendChild(t);
    });
    markNext();
    function demo(auto) {
      const want = books[next], t = [...pile.children].find(x => x.textContent === want);
      if (!t) return;
      helps++;
      const hand = document.createElement('div'); hand.className = 'bk-hand'; hand.innerHTML = Ark.I.tap;
      const pr = pile.getBoundingClientRect(), tr = t.getBoundingClientRect();
      hand.style.left = (pr.width - 40) + 'px'; hand.style.top = '-40px';
      pile.appendChild(hand);
      requestAnimationFrame(() => { hand.style.left = (tr.left - pr.left + tr.width / 2 - 14) + 'px'; hand.style.top = (tr.top - pr.top + tr.height / 2 - 6) + 'px'; });
      t.classList.add('glow');
      say(`${auto ? 'Watch me. ' : ''}${want} comes ${next ? 'after ' + books[next - 1] : 'first'}.`, true);
      learn(lbox, `${auto ? 'Watch! ' : ''}${want} comes ${next ? 'after ' + books[next - 1] : 'first'}.`, auto ? 'Now you try the next one!' : 'Tap it to put it on the shelf.', { icon: Ark.I.tap });
      timers.push(setTimeout(() => { hand.remove(); if (auto && t.isConnected) { helps--; place(t, want); } }, auto ? 1500 : 1300));
    }
    if (!store('books-demo')) { store('books-demo', 1); timers.push(setTimeout(() => demo(true), 600)); }
    Ark.ctl({ help: diff === 'hard' ? null : () => demo(false), restart: () => sort(i) });
  }

  function done(i, mistakes, helps) {
    const L = LEVELS[i], books = shelfBooks(L), miss = mistakes + (diff === 'normal' ? helps : 0);
    const d = doneSet(); if (!d.includes(L.id)) { d.push(L.id); storeJSON('books-done-' + diff, d); }
    const stars = miss === 0 ? 3 : miss <= Math.ceil(books.length / 3) ? 2 : 1;
    const nx = LEVELS[i + 1];
    Ark.finish(el, {
      id: 'books-sort', diff, stars, title: miss === 0 ? 'Perfect shelf!' : 'Shelf complete!',
      html: `<div class="bk-wrap" style="width:100%"><div class="bk-shelf">${books.map(x => `<span class="bk-spine" style="background:${SECT[L.s].c}">${x}</span>`).join('')}</div><div class="bk-plank"></div></div>
        <p class="story">${L.t}: ${books.length} books, ${mistakes} mistake${mistakes === 1 ? '' : 's'}${helps ? `, ${helps} hint${helps > 1 ? 's' : ''}` : ''}.</p>
        ${bar(d.length / LEVELS.length, `Shelves complete: ${d.length} of ${LEVELS.length}`, 'gold')}
        <p style="margin:0;font-weight:800;color:var(--muted)">Can you say them in order without looking?</p>`,
      lesson: `${SECT[L.s].t} books: ${SECT[L.s].d}`,
      again: () => sort(i), next: nx ? [`Next shelf: ${nx.t}`, () => start(i + 1)] : ['All shelves', levels], menu: levels
    });
  }

  function split(i) {
    clearTimers();
    const hard = diff === 'hard', n = diff === 'easy' ? 8 : 10;
    const deck = hard ? shuf([...OT, ...NT]).slice(0, n) : shuf([...shuf(OT).slice(0, n / 2), ...shuf(NT).slice(0, n / 2)]);
    let k = 0, right = 0, lock = false;
    const opts = hard ? Object.entries(SECT) : [['ot', { t: 'Old Testament', c: '#8A5A2B' }], ['nt', { t: 'New Testament', c: '#1F55D6' }]];
    el.innerHTML = `<div class="hud"><span>${hard ? 'Which section?' : 'Old or New?'}</span><span id="bkS">0 / ${n}</span></div>
      <div id="spBar">${bar(0, `Book 1 of ${n}`, 'blue')}</div>
      <div class="bk-card" id="card"></div>
      <div class="bk-two ${hard ? 'six' : ''}">${opts.map(([id, o]) => `<button class="btn" data-a="${id}" style="background:${o.c}">${o.t}</button>`).join('')}</div>
      <div id="spLearn"></div>`;
    const card = el.querySelector('#card'), lbox = el.querySelector('#spLearn');
    learn(lbox, hard ? 'Which part of the Bible library is this book in?' : 'Tip: the New Testament starts with Matthew, the first book about Jesus.', '', { icon: Ark.I.ear });
    const show = () => { card.textContent = deck[k]; if (diff === 'easy') say(deck[k]); };
    show();
    el.querySelectorAll('[data-a]').forEach(btn => (btn.onclick = () => {
      if (lock) return; lock = true;
      const book = deck[k], isOT = OT.includes(book);
      const answer = hard ? sectOf(book) : isOT ? 'ot' : 'nt';
      const ok = btn.dataset.a === answer;
      if (ok) right++;
      const where = hard ? `${SECT[answer].t}: ${SECT[answer].d}` : `the ${isOT ? 'Old Testament, written before Jesus was born' : 'New Testament, about Jesus and His church'}`;
      learn(lbox, `${ok ? 'Yes!' : 'Not quite.'} ${book} is in ${hard ? 'the ' + where : where}.`, FACT[book] || '', { speak: diff !== 'hard', icon: ok ? Ark.I.star : Ark.I.ear });
      el.querySelector('#bkS').textContent = `${right} / ${n}`;
      k++; setBar(el.querySelector('#spBar .pbar'), k / n, k < n ? `Book ${k + 1} of ${n}` : 'Done!');
      timers.push(setTimeout(() => { lock = false; if (k === deck.length) return splitDone(i, right, n); show(); }, ok ? 1300 : 2400));
    }));
    Ark.ctl({
      help: hard ? null : () => { const b = deck[k]; say(OT.includes(b) ? `${b} is in the Old Testament.` : `${b} is in the New Testament.`, true); el.querySelector(`[data-a="${OT.includes(b) ? 'ot' : 'nt'}"]`).classList.add('glow'); timers.push(setTimeout(() => el.querySelectorAll('.glow').forEach(x => x.classList.remove('glow')), 1500)); },
      restart: () => split(i)
    });
  }

  function splitDone(i, right, n) {
    const L = LEVELS[i];
    const d = doneSet(); if (!d.includes(L.id)) { d.push(L.id); storeJSON('books-done-' + diff, d); }
    const stars = right === n ? 3 : right >= n * .7 ? 2 : 1;
    Ark.finish(el, {
      id: 'books-sort', diff, stars, title: right === n ? 'All correct!' : 'Well done!',
      html: `<p class="story">You got ${right} out of ${n}.</p>${bar(d.length / LEVELS.length, `Shelves complete: ${d.length} of ${LEVELS.length}`, 'gold')}`,
      lesson: 'The Old Testament has 39 books about God’s people before Jesus was born. The New Testament has 27 books about Jesus and His church.',
      again: () => split(i), next: [`Next: ${LEVELS[i + 1].t}`, () => start(i + 1)], menu: levels
    });
  }

  Ark.games['books-sort'] = {
    mount(stage) { el = stage; css(); menu(); },
    unmount() { clearTimers(); hush(); },
    _test: { LEVELS, OT, NT, sectOf, shelfBooks: L => shelfBooks(L), setDiff: d => (diff = d) }
  };
})();
