/* Bible Trivia Challenge: 10 questions per round. Easy, Normal and Hard use different question sets; every answer comes with a Bible reference. */
(() => {
  const { store, shuf, say, hush, bar, setBar, steps } = Ark;
  // q: question, a: correct answer, w: wrong answers, r: reference, f: short fact shown after answering
  const BANK = {
    easy: [
      { q: 'Who built a big boat called an ark?', a: 'Noah', w: ['Moses', 'David', 'Peter'], r: 'Genesis 6:14', f: 'God told Noah exactly how to build the ark.' },
      { q: 'Who was swallowed by a great fish?', a: 'Jonah', w: ['Daniel', 'Joseph', 'Paul'], r: 'Jonah 1:17', f: 'Jonah was inside the fish for three days and three nights.' },
      { q: 'In which town was baby Jesus born?', a: 'Bethlehem', w: ['Nazareth', 'Jericho', 'Rome'], r: 'Matthew 2:1', f: 'Bethlehem was also King David’s hometown.' },
      { q: 'Where did Mary lay baby Jesus?', a: 'In a manger', w: ['In a basket', 'In a boat', 'In a palace bed'], r: 'Luke 2:7', f: 'There was no room for them in the inn.' },
      { q: 'Who beat the giant Goliath with a sling and a stone?', a: 'David', w: ['Samson', 'Saul', 'Noah'], r: '1 Samuel 17:50', f: 'David was a young shepherd boy.' },
      { q: 'What did God make on the very first day?', a: 'Light', w: ['Animals', 'People', 'Fish'], r: 'Genesis 1:3', f: 'God said, “Let there be light,” and there was light.' },
      { q: 'Who was the first man God made?', a: 'Adam', w: ['Abraham', 'Noah', 'Jacob'], r: 'Genesis 2:7', f: 'God formed Adam from the dust of the ground.' },
      { q: 'What did God put in the sky as a promise after the flood?', a: 'A rainbow', w: ['A star', 'A cloud', 'The moon'], r: 'Genesis 9:13', f: 'The rainbow reminds us that God keeps His promises.' },
      { q: 'Jesus fed a big crowd with five loaves and how many fish?', a: 'Two', w: ['Five', 'Ten', 'One'], r: 'Matthew 14:17', f: 'About five thousand men ate, and there were 12 baskets left over!' },
      { q: 'Who was put into a den of lions but kept safe by God?', a: 'Daniel', w: ['Jonah', 'Elijah', 'Moses'], r: 'Daniel 6:22', f: 'God sent an angel to shut the lions’ mouths.' },
      { q: 'What was the name of Jesus’ mother?', a: 'Mary', w: ['Martha', 'Ruth', 'Esther'], r: 'Luke 1:30–31', f: 'The angel Gabriel told Mary she would have a baby.' },
      { q: 'How many disciples did Jesus choose?', a: '12', w: ['3', '7', '40'], r: 'Mark 3:14', f: 'Jesus chose twelve men to be with Him.' },
      { q: 'Which bird brought Noah an olive leaf?', a: 'A dove', w: ['A raven', 'An eagle', 'A sparrow'], r: 'Genesis 8:11', f: 'The olive leaf showed the water was going down.' },
      { q: 'Who led God’s people across the Red Sea?', a: 'Moses', w: ['Noah', 'Joshua', 'David'], r: 'Exodus 14:21', f: 'God pushed back the water with a strong wind.' },
      { q: 'What did Jesus do when the storm scared His friends in the boat?', a: 'He calmed the storm', w: ['He swam away', 'He fell asleep again', 'He built a bigger boat'], r: 'Mark 4:39', f: 'Jesus said, “Peace, be still,” and the wind stopped.' }
    ],
    normal: [
      { q: 'Who was given a coat of many colours and sold by his brothers?', a: 'Joseph', w: ['Benjamin', 'Isaac', 'Samuel'], r: 'Genesis 37:3', f: 'Later, God made Joseph a great ruler in Egypt.' },
      { q: 'What was the first plague God sent on Egypt?', a: 'Water turned to blood', w: ['Frogs', 'Locusts', 'Darkness'], r: 'Exodus 7:20', f: 'There were ten plagues in all.' },
      { q: 'Who was Moses’ brother who spoke for him?', a: 'Aaron', w: ['Joshua', 'Caleb', 'Levi'], r: 'Exodus 4:14', f: 'Aaron later became the first high priest.' },
      { q: 'Which city’s walls fell down after God’s people marched around them?', a: 'Jericho', w: ['Jerusalem', 'Nineveh', 'Babylon'], r: 'Joshua 6:20', f: 'They marched around it for seven days.' },
      { q: 'Which strong man’s strength was linked to his long hair?', a: 'Samson', w: ['Gideon', 'Goliath', 'Elijah'], r: 'Judges 16:17', f: 'Samson was a judge of Israel.' },
      { q: 'Who said, “Whither thou goest, I will go”?', a: 'Ruth', w: ['Naomi', 'Esther', 'Hannah'], r: 'Ruth 1:16', f: 'Ruth stayed loyal to her mother-in-law, Naomi.' },
      { q: 'Which disciple walked on the water toward Jesus?', a: 'Peter', w: ['John', 'Thomas', 'Andrew'], r: 'Matthew 14:29', f: 'Peter began to sink when he looked at the wind and waves.' },
      { q: 'What was Jesus’ first miracle?', a: 'Turning water into wine', w: ['Healing a blind man', 'Walking on water', 'Feeding 5,000 people'], r: 'John 2:11', f: 'It happened at a wedding in Cana.' },
      { q: 'Who climbed a sycamore tree to see Jesus?', a: 'Zacchaeus', w: ['Nicodemus', 'Lazarus', 'Bartimaeus'], r: 'Luke 19:4', f: 'Zacchaeus was too short to see over the crowd.' },
      { q: 'How many days was Jesus in the wilderness without food?', a: '40', w: ['3', '7', '12'], r: 'Matthew 4:2', f: 'Jesus answered every temptation with Scripture.' },
      { q: 'Which prophet went up to heaven in a whirlwind?', a: 'Elijah', w: ['Elisha', 'Isaiah', 'Jeremiah'], r: '2 Kings 2:11', f: 'A chariot of fire appeared too.' },
      { q: 'Which king asked God for wisdom instead of riches?', a: 'Solomon', w: ['David', 'Saul', 'Hezekiah'], r: '1 Kings 3:9', f: 'God was pleased and gave him riches as well.' },
      { q: 'Which boy heard God call his name at night in the temple?', a: 'Samuel', w: ['David', 'Josiah', 'Joseph'], r: '1 Samuel 3:10', f: 'Samuel answered, “Speak; for thy servant heareth.”' },
      { q: 'What is the first book of the New Testament?', a: 'Matthew', w: ['Genesis', 'Acts', 'John'], r: 'Matthew 1:1', f: 'It begins with the family line of Jesus.' },
      { q: 'In Jesus’ story, who stopped to help the hurt man on the road?', a: 'A Samaritan', w: ['A priest', 'A Levite', 'A soldier'], r: 'Luke 10:33', f: 'Jesus told this story to show who our neighbour is.' }
    ],
    hard: [
      { q: 'Who was the father of John the Baptist?', a: 'Zacharias', w: ['Joseph', 'Simeon', 'Joachim'], r: 'Luke 1:13', f: 'Zacharias could not speak until John was born.' },
      { q: 'Which Roman governor sentenced Jesus to be crucified?', a: 'Pontius Pilate', w: ['Herod', 'Caesar Augustus', 'Felix'], r: 'Matthew 27:26', f: 'Pilate washed his hands in front of the crowd.' },
      { q: 'On the road to which city was Saul blinded by a light from heaven?', a: 'Damascus', w: ['Jerusalem', 'Antioch', 'Corinth'], r: 'Acts 9:3', f: 'Saul became Paul, the great missionary.' },
      { q: 'Who was the first follower of Jesus to die for his faith?', a: 'Stephen', w: ['James', 'Peter', 'Philip'], r: 'Acts 7:59', f: 'Stephen prayed for the people who stoned him.' },
      { q: 'How many books are in the Bible?', a: '66', w: ['39', '27', '73'], r: '39 Old + 27 New', f: '39 in the Old Testament and 27 in the New Testament.' },
      { q: 'Who read the writing on the wall for King Belshazzar?', a: 'Daniel', w: ['Joseph', 'Ezekiel', 'Nehemiah'], r: 'Daniel 5:17', f: 'The kingdom fell that same night.' },
      { q: 'What did Esau sell to his brother Jacob for a bowl of stew?', a: 'His birthright', w: ['His coat', 'His sheep', 'His land'], r: 'Genesis 25:33', f: 'The birthright was the special blessing of the firstborn son.' },
      { q: 'Which judge defeated the Midianites with only 300 men?', a: 'Gideon', w: ['Samson', 'Deborah', 'Jephthah'], r: 'Judges 7:7', f: 'They used trumpets, jars and torches.' },
      { q: 'Who led the rebuilding of the walls of Jerusalem?', a: 'Nehemiah', w: ['Ezra', 'Zerubbabel', 'Jeremiah'], r: 'Nehemiah 6:15', f: 'The wall was finished in just 52 days.' },
      { q: 'Which disciple was a tax collector before following Jesus?', a: 'Matthew', w: ['Thomas', 'Bartholomew', 'Andrew'], r: 'Matthew 9:9', f: 'He was also called Levi.' },
      { q: 'In which city were Paul and Silas in prison when an earthquake opened the doors?', a: 'Philippi', w: ['Ephesus', 'Rome', 'Athens'], r: 'Acts 16:26', f: 'They had been singing praises at midnight.' },
      { q: 'Who is the oldest man named in the Bible?', a: 'Methuselah', w: ['Noah', 'Adam', 'Abraham'], r: 'Genesis 5:27', f: 'He lived 969 years.' },
      { q: 'On which feast day did the Holy Spirit come upon the disciples?', a: 'Pentecost', w: ['Passover', 'Tabernacles', 'Purim'], r: 'Acts 2:1–4', f: 'About three thousand people believed that day.' },
      { q: 'Which prophet challenged the prophets of Baal on Mount Carmel?', a: 'Elijah', w: ['Elisha', 'Samuel', 'Amos'], r: '1 Kings 18:36–38', f: 'God answered with fire from heaven.' },
      { q: 'What was the name of Abraham’s wife, the mother of Isaac?', a: 'Sarah', w: ['Rebekah', 'Rachel', 'Leah'], r: 'Genesis 21:3', f: 'She had Isaac when she was 90 years old.' },
      { q: 'What is the last book of the Bible?', a: 'Revelation', w: ['Jude', 'Malachi', 'Acts'], r: 'Revelation 22:21', f: 'It was written by John on the island of Patmos.' }
    ]
  };

  const D = {
    easy: { fifty: 2, time: 0, read: true },
    normal: { fifty: 1, time: 0, read: false },
    hard: { fifty: 0, time: 20, read: false }
  };
  const ROUND = 10;
  let el, R = null, timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; if (R) cancelAnimationFrame(R.raf); };

  function css() {
    if (document.getElementById('trivia-css')) return;
    const s = document.createElement('style'); s.id = 'trivia-css';
    s.textContent = `
      .tq-q{font-family:var(--display);font-size:clamp(22px,5.4vw,30px);line-height:1.2;margin:0}
      .tq-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
      .tq-opt{font:inherit;font-weight:800;font-size:18px;text-align:left;padding:14px 16px;border-radius:14px;border:3px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;box-shadow:0 4px 0 var(--line);display:flex;gap:10px;align-items:center}
      .tq-opt b{display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:50%;background:var(--chip);border:2px solid var(--line);font-size:14px}
      .tq-opt:disabled{cursor:default}
      .tq-opt.right{background:#D6F5E4;color:#13203A;border-color:#14946B}
      .tq-opt.wrong{background:#FBD9DD;color:#13203A;border-color:#D7263D}
      .tq-opt.gone{visibility:hidden}
      .tq-fb{display:grid;gap:4px;padding:12px 14px;border-radius:12px;background:var(--bg);border-left:6px solid var(--emerald);font-weight:700}
      .tq-fb.no{border-left-color:var(--ruby)}
      .tq-fb strong{font-size:18px}
      .tq-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .tq-streak{font-weight:800;color:var(--amber)}
      .tq-clock{height:10px;border:2px solid var(--line);border-radius:99px;background:var(--chip);overflow:hidden}
      .tq-clock span{display:block;height:100%;background:linear-gradient(90deg,#D7263D,#F2A007);transition:width .1s linear}
      .tq-review{display:grid;gap:6px;margin:0;padding:0;list-style:none;text-align:left;width:100%}
      .tq-review li{padding:8px 12px;border-radius:10px;background:var(--bg);font-weight:700;font-size:15px}
      .tq-review li span{color:var(--muted);font-weight:700}`;
    document.head.appendChild(s);
  }

  function menu() {
    clearTimers();
    Ark.menu(el, {
      id: 'bible-trivia', title: 'Bible Trivia Challenge', icon: 'star', color: '#FF8FA3',
      blurb: 'How well do you know the Bible?',
      how: [['scroll', 'Read the question'], ['quiz', 'Tap your answer'], ['scroll', 'Learn the verse']],
      listen: 'Answer ten questions. After each one you will learn a fun fact and the Bible verse. Tap Help me to take away two wrong answers.',
      diffs: { easy: 'Easy questions read out loud, with two 50/50 helps.', normal: 'Harder Bible questions, with one 50/50 help.', hard: 'Tricky questions, 20 seconds each, no helps.' },
      start: play
    });
  }

  function play(diff) {
    clearTimers();
    const C = D[diff];
    R = { diff, C, qs: shuf(BANK[diff]).slice(0, ROUND).map(q => ({ ...q, opts: shuf([q.a, ...q.w]) })), res: [], i: 0, streak: 0, bestStreak: 0, fifty: C.fifty, raf: 0, left: 0, running: false, last: 0 };
    show();
  }

  function show() {
    clearTimers();
    const { qs, i, res, C, diff } = R, q = qs[i];
    el.innerHTML = `<div class="hud"><span class="dpill ${diff}">${Ark.DLABEL[diff]}</span><span>Question ${i + 1} of ${ROUND}</span></div>
      ${steps(ROUND, i, i, res.map((r, k) => (r ? -1 : k)).filter(k => k >= 0))}
      ${C.time ? `<div class="tq-clock" aria-hidden="true"><span id="clock" style="width:100%"></span></div>` : ''}
      <p class="tq-q">${q.q}</p>
      <div class="tq-opts">${q.opts.map((o, k) => `<button class="tq-opt" data-o="${k}"><b>${'ABCD'[k]}</b><span>${o}</span></button>`).join('')}</div>
      <div id="fb" aria-live="polite"></div>
      <div class="tq-tools">
        ${Ark.canSpeak ? `<button class="chip" id="read">${'Listen'}</button>` : ''}
        ${C.fifty ? `<span style="font-weight:800;font-size:14px;color:var(--muted)">50/50 helps left: <span id="fl">${R.fifty}</span></span>` : ''}
        ${R.streak >= 2 ? `<span class="tq-streak">${R.streak} in a row!</span>` : ''}
      </div>`;
    const opts = [...el.querySelectorAll('.tq-opt')];
    const rd = el.querySelector('#read');
    if (rd) rd.onclick = () => say(q.q + ' ' + opts.filter(b => !b.disabled).map(b => b.querySelector('span').textContent).join('? Or, ') + '?', true);
    if (C.read) timers.push(setTimeout(() => say(q.q + ' ' + q.opts.join('? Or, ') + '?'), 250));
    opts.forEach(b => (b.onclick = () => answer(b.querySelector('span').textContent, b)));
    const fifty = () => {
      if (R.fifty <= 0 || R.answered) return Ark.toast(R.fifty <= 0 ? 'No 50/50 helps left' : 'Tap Next question');
      R.fifty--; const f = el.querySelector('#fl'); if (f) f.textContent = R.fifty;
      shuf(opts.filter(b => b.querySelector('span').textContent !== q.a)).slice(0, 2).forEach(b => { b.classList.add('gone'); b.disabled = true; });
      say('Two wrong answers are gone.', true);
    };
    R.answered = false;
    if (C.time) { R.left = C.time; R.running = true; R.last = performance.now(); R.raf = requestAnimationFrame(tick); }
    Ark.ctl({
      help: C.fifty ? fifty : null,
      pause: C.time ? () => { R.running = false; } : null,
      resume: C.time ? () => { if (!R.answered) { R.running = true; R.last = performance.now(); } } : null,
      restart: () => play(diff)
    });
  }

  function tick(now) {
    if (!R) return;
    if (R.running) {
      R.left -= (now - R.last) / 1000;
      const c = el.querySelector('#clock'); if (c) c.style.width = Math.max(0, R.left / R.C.time * 100) + '%';
      if (R.left <= 0) { R.running = false; return answer(null, null); }
    }
    R.last = now; R.raf = requestAnimationFrame(tick);
  }

  function answer(pick, btn) {
    if (R.answered) return;
    R.answered = true; R.running = false; cancelAnimationFrame(R.raf);
    const q = R.qs[R.i], ok = pick === q.a;
    R.res[R.i] = ok; R.streak = ok ? R.streak + 1 : 0; R.bestStreak = Math.max(R.bestStreak, R.streak);
    const sk = el.querySelector('.tq-streak'); if (sk) sk.remove();
    el.querySelectorAll('.tq-opt').forEach(x => { x.disabled = true; if (x.querySelector('span').textContent === q.a) x.classList.add('right'); });
    if (btn && !ok) btn.classList.add('wrong');
    const head = ok ? ['Correct!', 'Well done!', 'That’s right!', 'Excellent!'][Math.floor(Math.random() * 4)] : pick === null ? `Time’s up! The answer is: ${q.a}` : `The answer is: ${q.a}`;
    const fb = el.querySelector('#fb');
    fb.innerHTML = `<div class="tq-fb ${ok ? '' : 'no'}"><strong>${head}</strong><span>${q.f}</span><span class="ref">${q.r}</span></div>
      <div class="row" style="margin-top:10px"><button class="btn big" id="next">${R.i + 1 < ROUND ? 'Next question' : 'See my score'}</button></div>`;
    say(R.C.read ? `${head}. ${q.f}` : head);
    const nx = fb.querySelector('#next'); nx.focus({ preventScroll: true });
    nx.onclick = () => { hush(); R.i++; R.i < ROUND ? show() : done(); };
    fb.scrollIntoView({ block: 'nearest' });
    Ark.ctl({ restart: () => play(R.diff) });
  }

  function done() {
    const { res, qs, diff, bestStreak } = R, score = res.filter(Boolean).length;
    const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1;
    const missed = qs.filter((q, k) => !res[k]);
    clearTimers();
    Ark.finish(el, {
      id: 'bible-trivia', diff, stars, title: score === ROUND ? 'Perfect score!' : undefined,
      html: `<p class="story">You got ${score} out of ${ROUND}.${bestStreak >= 3 ? ` Longest streak: ${bestStreak} in a row!` : ''}</p>
        ${bar(score / ROUND, `${score} / ${ROUND} correct`)}
        ${missed.length ? `<p style="margin:0;font-weight:800">Look these up in your Bible:</p><ul class="tq-review">${missed.map(q => `<li>${q.q}<br><span>${q.a} · ${q.r}</span></li>`).join('')}</ul>` : ''}`,
      verse: ['Thy word have I hid in mine heart, that I might not sin against thee.', 'Psalm 119:11'],
      again: () => play(diff), menu,
      next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-bible-trivia', d); play(d); }] : null
    });
  }

  Ark.games['bible-trivia'] = {
    mount(stage) { el = stage; css(); menu(); },
    unmount() { clearTimers(); R = null; hush(); },
    _test: { BANK, state: () => R }
  };
})();
