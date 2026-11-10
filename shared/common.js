/* KoG Arcade shared engine.
   Every game registers Ark.games[id] = {mount(stage), unmount()} and builds its screens with the helpers here:
   Ark.menu (difficulty + how to play), Ark.ctl (game-bar buttons), Ark.bar (progress), Ark.learn (learning pop-ups),
   Ark.finish (stars + Play again + More Games), Ark.story (choose-your-path engine), Ark.say (optional audio). */
window.Ark = (() => {
  const games = {};
  const ink = '#13203A';

  // Saved progress lives only in this browser. No names or personal details are ever stored.
  function store(key, value) {
    try {
      if (value !== undefined) localStorage.setItem('kog-' + key, value);
      const v = localStorage.getItem('kog-' + key);
      if (v !== null) return v;
      return localStorage.getItem(key); // older saves from before the update
    } catch (e) { return null; }
  }
  const storeJSON = (k, v) => { if (v !== undefined) store(k, JSON.stringify(v)); try { return JSON.parse(store(k) || 'null'); } catch (e) { return null; } };

  let toastTimer = 0;
  function toast(text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text; el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2400);
  }

  const shuf = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
  const toTop = el => { if (el.getBoundingClientRect().top < 70) el.scrollIntoView({ block: 'start' }); };
  const tok = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- optional audio ---------- */
  // The reading voice is switched off: device voices sounded too robotic. Help and hints show as a message bubble instead.
  const canSpeak = false;
  let voice = store('voice') !== 'off';
  let capT = 0;
  function caption(text) {
    const t = String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!t) return;
    // Show it only if the game isn't already showing the same words (checked once the game has drawn them).
    setTimeout(() => {
      const st = document.getElementById('stage'), seen = st ? st.textContent.replace(/\s+/g, ' ') : '';
      if (seen.includes(t.slice(0, 40))) return;
      showCaption(t);
    }, 40);
  }
  function showCaption(t) {
    let el = document.getElementById('kogCap');
    if (!el) {
      el = document.createElement('div'); el.id = 'kogCap'; el.className = 'kog-cap'; el.setAttribute('role', 'status'); el.hidden = true;
      el.onclick = () => { el.hidden = true; };
      document.body.appendChild(el);
    }
    el.innerHTML = `<span class="ci" aria-hidden="true">💡</span><div>${esc(t)}</div><button type="button" aria-label="Close message">✕</button>`;
    el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(capT); capT = setTimeout(() => { el.hidden = true; }, Math.min(9000, Math.max(3200, t.length * 70)));
  }
  const hideCaption = () => { const el = document.getElementById('kogCap'); if (el) el.hidden = true; clearTimeout(capT); };
  function say(text, force) {
    if (force) caption(text); // Help and hints: shown, not spoken
    if (!canSpeak || (!voice && !force) || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, '').replace(/LORD/g, 'Lord').replace(/(\d+):(\d+)/g, '$1, verse $2'));
      u.rate = .92; u.pitch = 1.08; speechSynthesis.speak(u);
    } catch (e) {}
  }
  const hush = () => { hideCaption(); try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} };
  function setVoice(on) { voice = on; store('voice', on ? 'on' : 'off'); if (!on) hush(); paintCtl(); }

  /* ---------- stars & rewards ---------- */
  const DIFFS = ['easy', 'normal', 'hard'];
  const DLABEL = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
  const starsOf = id => storeJSON('stars-' + id) || {};
  const bestStars = id => Math.max(0, ...DIFFS.map(d => starsOf(id)[d] || 0));
  const totalStars = ids => ids.reduce((s, id) => s + DIFFS.reduce((t, d) => t + (starsOf(id)[d] || 0), 0), 0);
  function award(id, diff, n) {
    const s = starsOf(id), prev = s[diff] || 0;
    if (n > prev) { s[diff] = n; storeJSON('stars-' + id, s); }
    return { prev, best: Math.max(prev, n), isNew: n > prev };
  }
  const STAR = on => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z" fill="${on ? '#FFD447' : 'none'}" stroke="${on ? '#13203A' : 'currentColor'}" stroke-width="2" stroke-linejoin="round" ${on ? '' : 'opacity=".45"'}/></svg>`;
  const starRow = (n, of = 3) => `<span class="stars" aria-label="${n} of ${of} stars">${Array.from({ length: of }, (_, i) => STAR(i < n)).join('')}</span>`;

  /* ---------- little pictures for "how to play" ---------- */
  const I = {
    tap: `<svg viewBox="0 0 44 44"><circle cx="20" cy="12" r="8" fill="none" stroke="#F2A007" stroke-width="3" stroke-dasharray="3 3"/><path d="M17 12v15l-4-3c-2-1-4 1-3 3l7 9h14c2-3 3-6 3-10v-6c0-2-3-2-3 0v-2c0-2-3-2-3 0v-1c0-2-3-2-3 0V12c0-3-5-3-5 0z" fill="#FFF3DC" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    swipe: `<svg viewBox="0 0 44 44"><path d="M4 12h14M4 12l5-4M4 12l5 4M40 12H26M40 12l-5-4M40 12l-5 4" stroke="#1F55D6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M19 18v13l-4-3c-2-1-4 1-3 3l6 9h13c2-3 2-6 2-9v-5c0-2-3-2-3 0v-1c0-2-3-2-3 0v-1c0-2-3-2-3 0v-6c0-3-5-3-5 0z" fill="#FFF3DC" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    drag: `<svg viewBox="0 0 44 44"><path d="M30 8L12 26" stroke="#D7263D" stroke-width="3" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="32" cy="7" r="4" fill="#C9CED6" stroke="${ink}" stroke-width="2"/><path d="M13 22v12l-3-2c-2-1-4 1-3 3l5 7h12c2-3 2-5 2-8v-5c0-2-3-2-3 0v-1c0-2-3-2-3 0v-1c0-2-3-2-3 0v-5c0-3-4-3-4 0z" fill="#FFF3DC" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    jump: `<svg viewBox="0 0 44 44"><path d="M22 4v14M22 4l-6 6M22 4l6 6" stroke="#14946B" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="40" rx="10" ry="3" fill="#13203A" opacity=".2"/><circle cx="22" cy="24" r="6" fill="#9B6A3C" stroke="${ink}" stroke-width="2.5"/><path d="M14 36l8-6 8 6" stroke="#C0392B" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
    turn: `<svg viewBox="0 0 44 44"><rect x="8" y="8" width="28" height="28" rx="6" fill="#1E2840" stroke="${ink}" stroke-width="2.5"/><path d="M22 8v14h14" stroke="#FFD447" stroke-width="6" fill="none"/><path d="M38 6a18 18 0 01-2 22" stroke="#F2A007" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M33 26l3 3 3-4" stroke="#F2A007" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    flip: `<svg viewBox="0 0 44 44"><rect x="4" y="8" width="16" height="22" rx="3" fill="#A0612D" stroke="${ink}" stroke-width="2.5"/><rect x="24" y="8" width="16" height="22" rx="3" fill="#FFF8EA" stroke="${ink}" stroke-width="2.5"/><circle cx="32" cy="19" r="5" fill="#F6C04A" stroke="${ink}" stroke-width="2"/><path d="M10 38q12 6 24 0" stroke="#1F55D6" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    arrows: `<svg viewBox="0 0 44 44"><g fill="#DCE7F3" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><rect x="16" y="4" width="12" height="12" rx="3"/><rect x="2" y="18" width="12" height="12" rx="3"/><rect x="16" y="18" width="12" height="12" rx="3"/><rect x="30" y="18" width="12" height="12" rx="3"/></g><path d="M22 8l-3 4h6zM5 24l4-3v6zM22 26l-3-4h6zM39 24l-4-3v6z" fill="${ink}"/><circle cx="22" cy="38" r="4" fill="#9B6A3C" stroke="${ink}" stroke-width="2"/></svg>`,
    basket: `<svg viewBox="0 0 44 44"><circle cx="22" cy="8" r="6" fill="#E63946" stroke="${ink}" stroke-width="2.5"/><path d="M22 16v6" stroke="${ink}" stroke-width="2.5" stroke-dasharray="2 3"/><path d="M6 26h32l-4 14H10z" fill="#C68A4B" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    star: `<svg viewBox="0 0 44 44"><path d="M22 4l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#FFD447" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    ear: `<svg viewBox="0 0 44 44"><path d="M8 17h7l9-8v26l-9-8H8z" fill="#FFD447" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 15q5 7 0 14M34 11q9 11 0 22" stroke="#1F55D6" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    shelf: `<svg viewBox="0 0 44 44"><g stroke="${ink}" stroke-width="2.5"><rect x="5" y="10" width="7" height="24" fill="#C0392B"/><rect x="13" y="12" width="7" height="22" fill="#3F6FE0"/><rect x="21" y="9" width="7" height="25" fill="#14946B"/></g><rect x="30" y="12" width="7" height="22" fill="none" stroke="#F2A007" stroke-width="2.5" stroke-dasharray="3 3"/><rect x="2" y="34" width="40" height="6" rx="2" fill="#A0612D" stroke="${ink}" stroke-width="2.5"/></svg>`,
    choice: `<svg viewBox="0 0 44 44"><path d="M22 40V24M22 24L10 10M22 24l12-14" stroke="#14946B" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="10" cy="9" r="5" fill="#FFD447" stroke="${ink}" stroke-width="2.5"/><circle cx="34" cy="9" r="5" fill="#DCE7F3" stroke="${ink}" stroke-width="2.5"/></svg>`,
    scroll: `<svg viewBox="0 0 44 44"><rect x="9" y="8" width="26" height="28" rx="3" fill="#FBEBC8" stroke="${ink}" stroke-width="2.5"/><path d="M14 16h16M14 22h16M14 28h10" stroke="#B07A2E" stroke-width="2.5" stroke-linecap="round"/><circle cx="9" cy="10" r="4" fill="#E3C48C" stroke="${ink}" stroke-width="2.5"/><circle cx="35" cy="34" r="4" fill="#E3C48C" stroke="${ink}" stroke-width="2.5"/></svg>`,
    quiz: `<svg viewBox="0 0 44 44"><g stroke="${ink}" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="4" fill="#D6F5E4"/><rect x="24" y="4" width="16" height="16" rx="4" fill="#DCE7F3"/><rect x="4" y="24" width="16" height="16" rx="4" fill="#DCE7F3"/><rect x="24" y="24" width="16" height="16" rx="4" fill="#DCE7F3"/></g><path d="M8 12l4 4 6-8" stroke="#14946B" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    lamp: '',
    heart: `<svg viewBox="0 0 44 44"><path d="M22 38S5 28 5 16a8.5 8.5 0 0117-2 8.5 8.5 0 0117 2c0 12-17 22-17 22z" fill="#FF8FA3" stroke="${ink}" stroke-width="2.5"/></svg>`
  };
  const UI = {
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>`,
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>`,
    restart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 107-7H8" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M9 1L5 5l4 4" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    help: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9.2 9.3a3 3 0 115 2.2c-1.2.8-2.2 1.4-2.2 3" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/></svg>`,
    sound: on => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l6-5v16l-6-5H3z" fill="currentColor"/>${on ? '<path d="M16 8q3 4 0 8M19 5q6 7 0 14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>' : '<path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'}</svg>`,
    listen: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l6-5v16l-6-5H3z" fill="currentColor"/><path d="M16 8q3 4 0 8M19 5q6 7 0 14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
    full: on => on ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor"/></svg>`
  };

  /* ---------- game bar buttons (Help, Pause, Restart, Sound) ---------- */
  let cur = {}, paused = false;
  const $ = id => document.getElementById(id);
  function paintCtl() {
    const b = { help: $('gHelp'), pause: $('gPause'), restart: $('gRestart'), sound: $('gSound') };
    if (!b.sound) return;
    b.help.hidden = !cur.help;
    b.pause.hidden = !document.body.classList.contains('in-game'); // every game can be paused
    b.restart.hidden = !cur.restart;
    b.sound.hidden = false; // sound effects
    b.sound.innerHTML = UI.sound(voice) + `<span class="t">${voice ? 'Sound on' : 'Sound off'}</span>`;
    b.sound.setAttribute('aria-pressed', voice);
  }
  function ctl(o) { cur = o || {}; if (paused) resume(true); paintCtl(); }
  function pause() {
    if (paused || !document.body.classList.contains('in-game')) return;
    paused = true; if (cur.pause) cur.pause(); hush();
    $('pauseOv').hidden = false; $('pResume').focus();
  }
  function resume(silent) {
    if (!paused) return;
    paused = false; $('pauseOv').hidden = true;
    if (!silent && cur.resume) cur.resume();
  }
  function wireBar() {
    $('gHelp').onclick = () => cur.help && cur.help();
    $('gPause').onclick = pause;
    $('gRestart').onclick = () => { if (!cur.restart) return; const r = cur.restart; resume(true); r(); };
    $('gSound').onclick = () => { setVoice(!voice); toast(voice ? 'Sound is on' : 'Sound is off'); };
    if ($('gFull')) { $('gFull').onclick = () => setFull(!full); paintFull(); }
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && native) { native = false; setFull(false); } });
    // Every game can size itself to the space under the game bar.
    const gb = document.querySelector('.gbar');
    const gbh = () => { if (gb && gb.offsetHeight) document.documentElement.style.setProperty('--gbh', gb.offsetHeight + 'px'); };
    if (gb && 'ResizeObserver' in window) new ResizeObserver(gbh).observe(gb); else addEventListener('resize', gbh);
    gbh();
    $('pResume').onclick = () => resume();
    $('pRestart').onclick = () => { const r = cur.restart; resume(true); r && r(); };
    $('pHome').onclick = () => { resume(true); location.hash = 'home'; };
    addEventListener('keydown', e => {
      if (location.hash.slice(1) === 'home' || !location.hash) return;
      if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && !e.defaultPrevented && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); paused ? resume() : pause(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    paintCtl();
  }

  /* ---------- full screen: the game fills the whole screen (uses the browser's full screen when allowed) ---------- */
  let full = false, native = false;
  function paintFull() {
    const b = $('gFull'); if (!b) return;
    b.innerHTML = UI.full(full) + `<span class="t">${full ? 'Exit full screen' : 'Full screen'}</span>`;
    b.setAttribute('aria-pressed', full); b.setAttribute('aria-label', full ? 'Exit full screen' : 'Full screen');
  }
  function setFull(on) {
    full = on; document.body.classList.toggle('kog-full', on); paintFull();
    try {
      const d = document.documentElement;
      if (on && !document.fullscreenElement && d.requestFullscreen) d.requestFullscreen({ navigationUI: 'hide' }).then(() => {
        native = true;
        // games played sideways turn the screen sideways where the phone allows it
        const id = (document.getElementById('stage') || {}).dataset?.game, g = (window.ARK_CATALOG || []).find(x => x.id === id);
        if (g && g.orient === 'landscape' && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
      }).catch(() => {});
      if (!on && document.fullscreenElement && document.exitFullscreen) { native = false; document.exitFullscreen().catch(() => {}); }
    } catch (e) {}
    // let every game re-measure itself
    requestAnimationFrame(() => { dispatchEvent(new Event('resize')); setTimeout(() => dispatchEvent(new Event('resize')), 350); });
  }

  /* ---------- progress bars ---------- */
  const bar = (v, label = '', cls = '') => `<div class="pbar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v * 100)}"><span style="width:${Math.max(0, Math.min(1, v)) * 100}%"></span><b>${label}</b></div>`;
  function setBar(el, v, label) {
    if (!el) return;
    el.querySelector('span').style.width = Math.max(0, Math.min(1, v)) * 100 + '%';
    if (label !== undefined) el.querySelector('b').textContent = label;
    el.setAttribute('aria-valuenow', Math.round(v * 100));
  }
  const steps = (n, done, now = -1, bad = []) => `<div class="steps">${Array.from({ length: n }, (_, i) => `<span class="${bad.includes(i) ? 'no' : i < done ? 'on' : i === now ? 'now' : ''}"></span>`).join('')}</div>`;

  /* ---------- learning pop-up ---------- */
  function learn(container, text, ref, opts = {}) {
    if (!container) return;
    container.innerHTML = `<div class="learn" role="status">${opts.icon || I.scroll}<div>${text}${ref ? `<small>${ref}</small>` : ''}</div>${canSpeak ? '<button class="lx" type="button">Listen</button>' : ''}</div>`;
    const b = container.querySelector('.lx'); if (b) b.onclick = () => say(text, true);
    if (opts.speak) say(text);
  }

  /* ---------- difficulty menu ---------- */
  function menu(stage, cfg) {
    ctl({ help: () => say(cfg.listen, true) });
    const stars = starsOf(cfg.id);
    let diff = store('diff-' + cfg.id) || 'easy';
    if (!DIFFS.includes(diff)) diff = 'easy';
    stage.innerHTML = `<div class="gm-hero"><div class="ic" style="background:${cfg.color || '#FFD447'}">${G[cfg.icon] || cfg.icon || ''}</div><div><h2>${cfg.title}</h2><p>${cfg.blurb}</p></div></div>
      <div class="howto">${cfg.how.map(([ic, t]) => `<div class="st">${I[ic] || ic}<span>${t}</span></div>`).join('')}</div>
      <div class="diffs" role="group" aria-label="Choose difficulty">${DIFFS.map(d => `<button class="diff ${d}" data-d="${d}" aria-pressed="${d === diff}"><b>${DLABEL[d]} ${starRow(stars[d] || 0)}</b><small>${cfg.diffs[d]}</small></button>`).join('')}</div>
      <div class="row"><button class="btn big" id="gmPlay">${UI.play} Play ${DLABEL[diff]}</button>${canSpeak ? `<button class="btn ghost" id="gmListen">${UI.listen} Listen</button>` : ''}</div>
      ${cfg.extra || ''}`;
    const play = stage.querySelector('#gmPlay');
    stage.querySelectorAll('.diff').forEach(b => (b.onclick = () => {
      diff = b.dataset.d; store('diff-' + cfg.id, diff);
      stage.querySelectorAll('.diff').forEach(x => x.setAttribute('aria-pressed', x === b));
      play.innerHTML = `${UI.play} Play ${DLABEL[diff]}`;
      say(`${DLABEL[diff]}. ${cfg.diffs[diff]}`);
    }));
    play.onclick = () => { hush(); cfg.start(diff); };
    const l = stage.querySelector('#gmListen'); if (l) l.onclick = () => say(cfg.listen, true);
    if (cfg.afterRender) cfg.afterRender(stage);
  }

  /* ---------- finish screen ---------- */
  function finish(stage, o) {
    const a = award(o.id, o.diff, o.stars);
    ctl({ restart: o.again });
    const cheer = o.stars >= 3 ? 'Amazing!' : o.stars === 2 ? 'Great job!' : 'Well done!';
    stage.innerHTML = `<div class="fin">
      <div class="bigstars">${Array.from({ length: 3 }, (_, i) => STAR(i < o.stars)).join('')}</div>
      <h2>${o.title || cheer}</h2>
      <span class="dpill ${o.diff}">${DLABEL[o.diff]}</span>
      ${a.isNew && a.prev > 0 ? '<span class="newbest">New best!</span>' : ''}
      ${o.html || ''}
      ${o.verse ? `<div class="verse">“${o.verse[0]}”<br><span class="ref">${o.verse[1]}</span></div>` : ''}
      ${o.lesson ? `<div class="lesson">${o.lesson}</div>` : ''}
      <div class="row">
        <button class="btn big" id="fAgain">${UI.restart} Play again</button>
        ${o.next ? `<button class="btn" id="fNext">${o.next[0]}</button>` : ''}
        <button class="btn ghost" id="fDiff">Change difficulty</button>
      </div>
      <a class="btn more big" href="#home">${UI.grid} More Games</a>
      ${window.ARK_CATALOG ? `<div class="nextup"><h3>Play next</h3><div class="jrow">${nextGames(o.id).map(jtile).join('')}</div></div>` : ''}
    </div>`;
    stage.querySelector('#fAgain').onclick = o.again;
    stage.querySelector('#fDiff').onclick = o.menu;
    if (o.next) stage.querySelector('#fNext').onclick = o.next[1];
    say(`${o.title || cheer} You earned ${o.stars} star${o.stars === 1 ? '' : 's'}.${o.verse ? ' ' + o.verse[0] : ''}`);
    toTop(stage);
    if (o.stars === 3 && a.isNew) toast('3 stars! You’re a champion!');
  }

  /* ---------- choose-your-path story engine ----------
     nodes: {start:{h,p,c:[[label,next,'hard'?]],clue,wrong,end}}. Choices marked 'hard' only appear on Hard.
     Help highlights the choice nearest the ending, worked out from the story map. */
  function story(stage, cfg) {
    const N = cfg.nodes, diff = cfg.diff;
    const endKey = Object.keys(N).find(k => N[k].end);
    const dist = { [endKey]: 0 };
    for (let changed = true; changed;) {
      changed = false;
      for (const k in N) for (const [, to] of N[k].c || []) {
        if (to in dist && !N[k].wrong && (!(k in dist) || dist[k] > dist[to] + 1)) { dist[k] = dist[to] + 1; changed = true; }
      }
    }
    const total = dist.start;
    let clues = [], wrong = 0, hints = 0, best = 0, node = 'start';
    function go(k) {
      node = k;
      const n = N[k];
      if (k === 'start') { clues = []; wrong = 0; hints = 0; best = 0; }
      if (n.wrong) wrong++;
      if (n.clue && !clues.includes(n.clue)) clues.push(n.clue);
      if (!n.wrong && k in dist) best = Math.max(best, total - dist[k]);
      if (n.end) return done();
      const opts = shuf((n.c || []).filter(c => c[2] !== 'hard' || diff === 'hard'));
      stage.innerHTML = `${bar(best / total, `Story ${best} of ${total}`)}
        ${clues.length ? `<div class="clues">${clues.map(c => `<span class="clue">${cfg.cluePrefix || ''}${c}</span>`).join('')}</div>` : ''}
        <h2>${n.h || (n.wrong ? 'Hmm, not quite…' : cfg.title)}</h2>
        <p class="story">${n.p}</p>
        <div class="choices">${opts.map(([t, to]) => `<button class="btn ghost" data-to="${to}">${t}</button>`).join('')}</div>
        ${canSpeak ? `<div class="row"><button class="chip" id="stListen">${'Listen'}</button></div>` : ''}`;
      stage.querySelectorAll('[data-to]').forEach(b => (b.onclick = () => { go(b.dataset.to); toTop(stage); }));
      const l = stage.querySelector('#stListen'); if (l) l.onclick = () => say(n.p + ' ' + opts.map(o => o[0]).join('? Or, ') + '?', true);
      if (diff === 'easy') say(n.p);
      ctl({
        restart: () => go('start'),
        help: diff === 'hard' ? null : () => {
          const bestBtn = [...stage.querySelectorAll('[data-to]')].sort((a, b) => (dist[a.dataset.to] ?? 99) - (dist[b.dataset.to] ?? 99))[0];
          if (!bestBtn) return;
          if (diff === 'normal' && !bestBtn.classList.contains('hint')) hints++;
          bestBtn.classList.add('hint'); bestBtn.focus();
          say('Try this one: ' + bestBtn.textContent, true);
        }
      });
    }
    function done() {
      const miss = wrong + hints;
      const stars = diff === 'easy' ? (wrong <= 2 ? 3 : wrong <= 4 ? 2 : 1) : diff === 'normal' ? (miss === 0 ? 3 : miss <= 2 ? 2 : 1) : (wrong === 0 ? 3 : wrong === 1 ? 2 : 1);
      finish(stage, {
        id: cfg.id, diff, stars, title: cfg.endTitle,
        html: `<p class="story">${N[endKey].p}</p>${clues.length ? `<div class="clues" style="justify-content:center">${clues.map(c => `<span class="clue">${c}</span>`).join('')}</div>` : ''}
          <p style="margin:0;font-weight:800;color:var(--muted)">${wrong === 0 ? 'No wrong turns. Super detective!' : `${wrong} wrong turn${wrong > 1 ? 's' : ''}${hints ? ` · ${hints} hint${hints > 1 ? 's' : ''}` : ''}`}</p>`,
        verse: cfg.verse, lesson: cfg.lesson,
        again: () => go('start'), menu: cfg.menu
      });
    }
    go('start');
  }

  /* ---------- card art ---------- */
  const G = {
    car: '<svg viewBox="0 0 64 40"><path d="M6 26l6-12h30l10 12h6v8H4v-8z" fill="#FFD447" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><path d="M16 15h10v10H12zM30 15h11l8 10H30z" fill="#BFE3FF" stroke="#13203A" stroke-width="2.5"/><circle cx="16" cy="34" r="5" fill="#13203A"/><circle cx="48" cy="34" r="5" fill="#13203A"/></svg>',
    glass: '<svg viewBox="0 0 48 48"><circle cx="20" cy="20" r="13" fill="#BFE3FF" stroke="#13203A" stroke-width="4"/><path d="M30 30l12 12" stroke="#13203A" stroke-width="6" stroke-linecap="round"/></svg>',
    ark: '<svg viewBox="0 0 48 40"><path d="M2 24h44l-7 12H9z" fill="#A0522D" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><rect x="12" y="12" width="24" height="12" fill="#FFD447" stroke="#13203A" stroke-width="3"/><path d="M9 12L24 3l15 9z" fill="#fff" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/></svg>',
    lamp: '<svg viewBox="0 0 48 48"><path d="M6 30c0-6 10-8 18-8s14 2 18 0c-2 8-10 12-18 12S6 34 6 30z" fill="#FFD447" stroke="#13203A" stroke-width="3"/><path d="M40 22c4-4 2-10 2-10s-6 2-6 8" fill="#FF7A1A" stroke="#13203A" stroke-width="2.5"/><rect x="18" y="34" width="12" height="6" fill="#A0522D" stroke="#13203A" stroke-width="3"/></svg>',
    fish: '<svg viewBox="0 0 56 40"><path d="M4 20c8-14 30-14 38 0-8 14-30 14-38 0z" fill="#BFE3FF" stroke="#13203A" stroke-width="3"/><path d="M42 20l12-10v20z" fill="#BFE3FF" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><circle cx="14" cy="17" r="3" fill="#13203A"/></svg>',
    crown: '<svg viewBox="0 0 48 40"><path d="M4 32L8 8l10 12 6-14 6 14 10-12 4 24z" fill="#FFD447" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 48 44"><path d="M24 40S4 28 4 15a10 10 0 0120-3 10 10 0 0120 3c0 13-20 25-20 25z" fill="#FF8FA3" stroke="#13203A" stroke-width="3"/></svg>',
    book: '<svg viewBox="0 0 48 40"><path d="M24 8c-6-4-14-4-20-2v28c6-2 14-2 20 2 6-4 14-4 20-2V6c-6-2-14-2-20 2z" fill="#fff" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><path d="M24 8v28" stroke="#13203A" stroke-width="3"/></svg>',
    star: '<svg viewBox="0 0 48 48"><path d="M24 3l6 14 15 1-11 10 4 15-14-8-14 8 4-15L3 18l15-1z" fill="#FFD447" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/></svg>',
    stone: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#C9CED6" stroke="#13203A" stroke-width="3"/><path d="M6 6c10 2 18 10 18 18" stroke="#13203A" stroke-width="3" fill="none" stroke-dasharray="4 4"/></svg>',
    wave: '<svg viewBox="0 0 56 40"><path d="M2 26c8-10 14-10 20 0s14 10 20 0 10-6 12-4v16H2z" fill="#BFE3FF" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/><path d="M2 14c8-10 14-10 20 0s14 10 20 0" fill="none" stroke="#13203A" stroke-width="3"/></svg>',
    tree: '<svg viewBox="0 0 48 48"><path d="M22 46V30h4v16z" fill="#8B5A2B" stroke="#13203A" stroke-width="2.5"/><circle cx="24" cy="18" r="15" fill="#3FA34D" stroke="#13203A" stroke-width="3"/><circle cx="17" cy="15" r="3.4" fill="#E63946" stroke="#13203A" stroke-width="1.5"/><circle cx="29" cy="12" r="3.4" fill="#F4A300" stroke="#13203A" stroke-width="1.5"/><circle cx="27" cy="23" r="3.4" fill="#7A3E9D" stroke="#13203A" stroke-width="1.5"/><path d="M38 44l3-7 3 7M34 44l2-5 2 5" fill="none" stroke="#5A4632" stroke-width="2.5"/></svg>',
    tablet: '<svg viewBox="0 0 48 48"><path d="M6 44V14a9 9 0 0118 0v30zM24 44V14a9 9 0 0118 0v30z" fill="#E8DCC6" stroke="#13203A" stroke-width="3" stroke-linejoin="round"/></svg>'
  };

  I.lamp = G.lamp;

  /* ---------- card scenery: one landscape per game, drawn behind its picture ---------- */
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".85"><circle cx="0" cy="0" r="7"/><circle cx="9" cy="-3" r="9"/><circle cx="19" cy="0" r="7"/><rect x="0" y="0" width="19" height="7"/></g>`;
  const BG = {
    hills: `${cloud(14, 26, .9)}${cloud(122, 18, .7)}<path d="M0 90q34-30 78-10t82-14V120H0z" fill="#3FA34D" opacity=".75"/><path d="M0 104q46-18 94-4t66-6V120H0z" fill="#22803F"/>`,
    meadow: `${cloud(10, 22, .8)}${cloud(126, 28, .9)}<path d="M0 94q40-20 82-8t78-8V120H0z" fill="#5CC25A"/><path d="M0 108q50-10 94-2t66-4V120H0z" fill="#2E9E4F"/><g fill="#FFF3A0" stroke="#13203A" stroke-width=".8"><circle cx="18" cy="104" r="2.4"/><circle cx="140" cy="100" r="2.4"/><circle cx="118" cy="111" r="2"/></g><g fill="#FF8FA3" stroke="#13203A" stroke-width=".8"><circle cx="34" cy="112" r="2.2"/><circle cx="148" cy="112" r="2"/></g>`,
    sea: `${cloud(16, 20, .8)}<path d="M0 88q20-8 40 0t40 0 40 0 40 0V120H0z" fill="#5DA9F0"/><path d="M0 100q20-8 40 0t40 0 40 0 40 0V120H0z" fill="#1F55D6"/><path d="M0 88q20-8 40 0t40 0 40 0 40 0" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8"/><path d="M0 100q20-8 40 0t40 0 40 0 40 0" fill="none" stroke="#BFE3FF" stroke-width="2" opacity=".7"/>`,
    deep: `<g fill="#fff" opacity=".45"><circle cx="24" cy="30" r="3"/><circle cx="30" cy="20" r="2"/><circle cx="136" cy="40" r="3.4"/><circle cx="130" cy="28" r="2"/></g><path d="M0 104q12-16 20 0t20 0 20-10 20 4M120 106q10-18 18-2t22-2" fill="none" stroke="#2FBF8E" stroke-width="4" stroke-linecap="round"/><path d="M0 108q40-8 80-2t80-2V120H0z" fill="#0E5960"/>`,
    palace: `<g fill="#3A1C66" opacity=".55"><rect x="6" y="62" width="12" height="44"/><rect x="142" y="62" width="12" height="44"/><path d="M4 62h16l-2-6H6zM140 62h16l-2-6h-12z"/><path d="M40 106V70h80v36z"/><path d="M58 70a22 22 0 0144 0z"/><rect x="78" y="40" width="4" height="8"/></g><path d="M0 106h160v14H0z" fill="#2A1450" opacity=".7"/><g fill="#FFD447" opacity=".85"><circle cx="30" cy="22" r="1.6"/><circle cx="134" cy="16" r="1.8"/></g>`,
    road: `${cloud(12, 24, .8)}${cloud(124, 16, .7)}<path d="M0 92q40-12 80-4t80-4V120H0z" fill="#4E8FE8" opacity=".55"/><path d="M0 100h160v20H0z" fill="#3B4660"/><path d="M0 110h160" stroke="#FFD447" stroke-width="2.6" stroke-dasharray="10 8"/><path d="M0 100h160" stroke="#fff" stroke-width="1.6" opacity=".7"/><g transform="translate(140 74)"><path d="M0 0v26" stroke="#13203A" stroke-width="2"/><path d="M0 0h14v9H0z" fill="#fff" stroke="#13203A" stroke-width="1.4"/><path d="M0 0h4v3H0zM8 0h4v3H8zM4 3h4v3H4zM12 3h2v3h-2zM0 6h4v3H0zM8 6h4v3H8z" fill="#13203A"/></g>`,
    night: `<circle cx="134" cy="22" r="14" fill="#FFF3C4" opacity=".25"/><circle cx="134" cy="22" r="9" fill="#FFF3C4"/><g fill="#fff">${[[16, 16], [38, 30], [58, 12], [104, 34], [118, 10], [26, 52], [148, 48], [86, 18]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.1 : 1.8}" opacity=".9"/>`).join('')}</g><path d="M0 98q36-14 80-6t80-6V120H0z" fill="#0B1022" opacity=".7"/>`,
    library: `<g stroke="#13203A" stroke-width="1.4"><rect x="6" y="66" width="7" height="30" fill="#C0392B"/><rect x="14" y="70" width="7" height="26" fill="#1F55D6"/><rect x="22" y="64" width="6" height="32" fill="#14946B"/><rect x="132" y="68" width="7" height="28" fill="#7A3E9D"/><rect x="140" y="64" width="6" height="32" fill="#F2A007"/><rect x="147" y="70" width="7" height="26" fill="#D7263D"/></g><rect x="0" y="96" width="160" height="7" fill="#8B5A2B" stroke="#13203A" stroke-width="1.6"/><path d="M0 103h160v17H0z" fill="#6B4220" opacity=".7"/>`,
    mountain: `${cloud(18, 22, .7)}<path d="M18 104L80 30l62 74z" fill="#8A6F47" opacity=".7"/><path d="M66 47l14-17 14 17-6 4-8-6-8 6z" fill="#fff" opacity=".9"/><path d="M0 104q50-10 90-2t70-2V120H0z" fill="#C9A86A"/>`
  };
  // Thumbnail scene: sky gradient, soft light rays, the game's landscape and its picture.
  function scene(g, a, b, id, bg) {
    const pic = (G[g] || '').replace('<svg ', '<svg x="48" y="20" width="64" height="64" ');
    return `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="sg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <radialGradient id="sr-${id}" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <rect width="160" height="120" fill="url(#sg-${id})"/>
      <g fill="#fff" opacity=".12">${Array.from({ length: 10 }, (_, i) => { const t = i / 10 * Math.PI * 2; return `<path d="M80 52L${80 + Math.cos(t) * 140} ${52 + Math.sin(t) * 140}L${80 + Math.cos(t + .22) * 140} ${52 + Math.sin(t + .22) * 140}z"/>`; }).join('')}</g>
      <circle cx="80" cy="52" r="56" fill="url(#sr-${id})"/>
      ${BG[bg] || BG.hills}
      <ellipse cx="80" cy="90" rx="26" ry="5" fill="#13203A" opacity=".22"/>
      <g class="pic">${pic}</g>
    </svg>`;
  }

  /* ---------- gameplay type icons ---------- */
  const TYPE = {
    action: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>',
    race: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 22V3" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M6 4h13l-3 4 3 4H6z" fill="currentColor"/></svg>',
    match: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="10" height="14" rx="2" fill="currentColor"/><rect x="12.5" y="5" width="10" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    puzzle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h4a2.5 2.5 0 115 0h4v4a2.5 2.5 0 110 5v4H4z" fill="currentColor"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a2 2 0 012 2v10a2 2 0 01-2 2h-8l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2z" fill="currentColor"/><path d="M10 8a2 2 0 113 1.7c-.7.4-1 .9-1 1.6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="12" cy="14" r="1" fill="#fff"/></svg>',
    story: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6C9 4 5 4 2 5v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1z" fill="currentColor"/><path d="M12 6v14" stroke="#fff" stroke-width="1.6"/></svg>',
    seek: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>'
  };
  const typeChip = t => t && TYPE[t] ? `<span class="tchip">${TYPE[t]}${(window.ARK_TYPES || {})[t] || t}</span>` : '';

  /* ---------- Pip, the KoG Arcade lamb ---------- */
  const pip = (cls = '') => `<svg class="pip ${cls}" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="112" rx="34" ry="5" fill="#13203A" opacity=".18"/>
    <g fill="#5A4632" stroke="#13203A" stroke-width="3"><rect x="38" y="88" width="9" height="20" rx="4"/><rect x="73" y="88" width="9" height="20" rx="4"/></g>
    <g fill="#fff" stroke="#13203A" stroke-width="3"><circle cx="40" cy="72" r="16"/><circle cx="60" cy="66" r="19"/><circle cx="80" cy="72" r="16"/><circle cx="50" cy="88" r="15"/><circle cx="72" cy="88" r="15"/></g>
    <path d="M44 74a16 16 0 0132 0v4H44z" fill="#fff"/>
    <g stroke="#13203A" stroke-width="3" stroke-linejoin="round"><path d="M34 44c-12-2-18 6-16 12 8 1 14-3 17-8z" fill="#5A4632"/><path d="M86 44c12-2 18 6 16 12-8 1-14-3-17-8z" fill="#5A4632"/>
    <ellipse cx="60" cy="50" rx="25" ry="22" fill="#6B5440"/></g>
    <g fill="#fff" stroke="#13203A" stroke-width="2.6"><circle cx="48" cy="32" r="8"/><circle cx="60" cy="28" r="9"/><circle cx="72" cy="32" r="8"/></g>
    <path d="M47 18l4 9 9-11 9 11 4-9 2 14H45z" fill="#FFD447" stroke="#13203A" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="60" cy="22" r="2" fill="#D7263D"/>
    <g fill="#13203A"><ellipse cx="50" cy="50" rx="4" ry="5"/><ellipse cx="70" cy="50" rx="4" ry="5"/></g>
    <g fill="#fff"><circle cx="51.5" cy="48" r="1.6"/><circle cx="71.5" cy="48" r="1.6"/></g>
    <g fill="#FF8FA3" opacity=".8"><ellipse cx="42" cy="59" rx="4" ry="2.6"/><ellipse cx="78" cy="59" rx="4" ry="2.6"/></g>
    <path d="M54 60q6 6 12 0" stroke="#13203A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </svg>`;

  /* ---------- quick-launch tile (homepage "Jump Straight In" and "Play next") ---------- */
  const jtile = x => `<a class="jtile" href="#${x.id}" data-pre="${x.id}" style="--c1:${x.sky[0]};--c2:${x.sky[1]}" aria-label="Play ${esc(x.t)}">
      <span class="ji">${G[x.g] || ''}</span><b>${x.s || x.t}</b>${x.type ? `<span class="jt">${TYPE[x.type] || ''}</span>` : ''}</a>`;
  // Up to n games to try next: ones without stars first, never the game just played.
  function nextGames(exclude, n = 3) {
    const all = (window.ARK_CATALOG || []).filter(g => g.play && g.id !== exclude);
    const fresh = shuf(all.filter(g => !bestStars(g.id))), rest = shuf(all.filter(g => bestStars(g.id)));
    return fresh.concat(rest).slice(0, n);
  }

  return { games, store, storeJSON, toast, shuf, toTop, tok, esc, say, hush, setVoice, voiceOn: () => voice, canSpeak,
    DIFFS, DLABEL, starsOf, bestStars, totalStars, award, STAR, starRow, I, UI,
    ctl, pause, resume, wireBar, setFull, isFull: () => full, bar, setBar, steps, learn, menu, finish, story, scene, G, TYPE, typeChip, pip, jtile, nextGames };
})();
