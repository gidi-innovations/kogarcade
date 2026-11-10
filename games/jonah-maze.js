/* Jonah and the Big Fish Maze (Jonah 1–3): three mazes. Story scrolls inside each maze tell Jonah's story as you play. */
(() => {
  const { store, say, hush, bar, setBar, steps, learn } = Ark;
  const ink = '#13203A';
  const S = 600;
  const CH = [
    { title: 'Inside the big fish', line: 'Jonah ran from God and was swallowed by a big fish! Help him get out.', bg: '#F6C1C1', floor: '#FBE2DF', wall: '#9C2F45', goal: 'mouth',
      scrolls: [['God asked Jonah to go to Nineveh, but Jonah ran away on a ship.', 'Jonah 1:3'], ['A great storm came, and Jonah was thrown into the sea.', 'Jonah 1:15'], ['Inside the fish, Jonah prayed to God.', 'Jonah 2:1']],
      done: ['God spoke to the fish, and it spat Jonah out onto dry land!', 'Jonah 2:10'] },
    { title: 'From the beach to the road', line: 'Jonah is safe on the beach! Help him find the road.', bg: '#F2D49B', floor: '#FBEBC8', wall: '#B07A2E', goal: 'sign',
      scrolls: [['Jonah was safe on dry land. God had kept him alive!', 'Jonah 2:10'], ['God spoke to Jonah a second time: “Arise, go unto Nineveh.”', 'Jonah 3:1–2'], ['This time Jonah obeyed and set off.', 'Jonah 3:3']],
      done: ['Jonah made it to the road to Nineveh.', 'Jonah 3:3'] },
    { title: 'The road to Nineveh', line: 'Guide Jonah all the way to the city gate.', bg: '#B9DFA8', floor: '#E3F3D6', wall: '#3E7B39', goal: 'gate',
      scrolls: [['Nineveh was a very big city. It took three days to walk across!', 'Jonah 3:3'], ['Jonah told the people to stop doing wrong.', 'Jonah 3:4'], ['The people were sorry, and they prayed to God.', 'Jonah 3:5']],
      done: ['God saw that the people turned from their wrong ways, and He forgave them.', 'Jonah 3:10'] }
  ];
  const D = {
    easy: { sizes: [5, 6, 7], hints: Infinity, fog: false, scrollsOff: false },
    normal: { sizes: [6, 8, 10], hints: 2, fog: false, scrollsOff: false },
    hard: { sizes: [8, 10, 11], hints: 0, fog: true, scrollsOff: true }
  };
  let el, st = null, run = null, timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const onKey = e => {
    if (!st) return;
    const d = { ArrowUp: 'n', ArrowDown: 's', ArrowLeft: 'w', ArrowRight: 'e' }[e.key];
    if (d) { e.preventDefault(); move(d); }
  };
  const onResize = () => st && st.size();

  function css() {
    if (document.getElementById('jonah-css')) return;
    const s = document.createElement('style'); s.id = 'jonah-css';
    s.textContent = `
      .jm-board{width:100%;max-width:min(760px,calc(100vh - var(--gbh,60px) - 250px));min-width:min(100%,280px);aspect-ratio:1;height:auto;margin:0 auto;display:block;border:3px solid var(--line);border-radius:16px;touch-action:none;order:2}
      .jm-lay{display:flex;flex-direction:column;gap:12px}.jm-side{display:contents}.jm-side>.hud{order:0}.jm-side>.jm-scrolls{order:1}.jm-side>#jmLearn{order:3}.jm-side>.jm-pad{order:4}
      @media (orientation:landscape) and (min-width:640px){.jm-lay{display:grid;grid-template-columns:min(calc(100vh - var(--gbh,60px) - 40px),calc(min(100vw, 1240px) - 300px)) minmax(220px,1fr);align-items:center;gap:16px}.jm-side{display:grid;gap:12px;align-content:center}.jm-board{width:100%;max-width:none;min-width:0;margin:0;order:0}}
      .jm-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,56px);gap:8px;justify-content:center}
      .jm-pad button{font:inherit;font-size:24px;font-weight:800;border-radius:14px;border:3px solid var(--line);background:var(--chip);color:var(--ink);cursor:pointer;box-shadow:0 3px 0 var(--line)}
      .jm-pad button:active{transform:translateY(2px);box-shadow:0 1px 0 var(--line)}
      .jm-pad [data-d=n]{grid-column:2}.jm-pad [data-d=w]{grid-column:1;grid-row:2}.jm-pad [data-d=s]{grid-column:2;grid-row:2}.jm-pad [data-d=e]{grid-column:3;grid-row:2}
      .jm-scrolls{display:flex;gap:6px;align-items:center;font-weight:800;font-size:14px}
      .jm-scrolls svg{width:26px;height:26px;opacity:.3}.jm-scrolls svg.on{opacity:1}`;
    document.head.appendChild(s);
  }

  function makeMaze(n) {
    const cells = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ n: 1, e: 1, s: 1, w: 1 })));
    const seen = Array.from({ length: n }, () => Array(n).fill(false));
    const D = { n: [0, -1, 's'], s: [0, 1, 'n'], e: [1, 0, 'w'], w: [-1, 0, 'e'] };
    const stack = [[0, 0]]; seen[0][0] = true;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const opts = Object.keys(D).filter(d => { const nx = x + D[d][0], ny = y + D[d][1]; return nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny][nx]; });
      if (!opts.length) { stack.pop(); continue; }
      const d = opts[Math.floor(Math.random() * opts.length)], nx = x + D[d][0], ny = y + D[d][1];
      cells[y][x][d] = 0; cells[ny][nx][D[d][2]] = 0; seen[ny][nx] = true; stack.push([nx, ny]);
    }
    return cells;
  }
  function solve(m, sx, sy, n) {
    const D = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }, prev = {}, q = [[sx, sy]], key = (x, y) => x + ',' + y;
    prev[key(sx, sy)] = null;
    while (q.length) {
      const [x, y] = q.shift();
      if (x === n - 1 && y === n - 1) break;
      for (const d in D) if (!m[y][x][d]) { const nx = x + D[d][0], ny = y + D[d][1], k = key(nx, ny); if (!(k in prev)) { prev[k] = [x, y]; q.push([nx, ny]); } }
    }
    const path = []; let cur = [n - 1, n - 1];
    while (cur) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
    return path;
  }


  function menu() {
    stop();
    Ark.menu(el, {
      id: 'jonah-maze', title: 'Jonah and the Big Fish', icon: 'fish', color: '#62D2C6',
      blurb: 'Follow Jonah’s story through three mazes.',
      how: [['arrows', 'Move Jonah'], ['scroll', 'Collect story scrolls'], ['star', 'Reach the goal']],
      listen: 'Move Jonah with the arrows, or swipe on the maze. Collect the story scrolls to read what happened to Jonah, then reach the goal.',
      diffs: { easy: 'Small mazes. Scrolls are on the way, and Help shows the path.', normal: 'Bigger mazes, with 2 helps in each.', hard: 'Big mazes in the dark. Find every scroll to open the way!' },
      start: d => { run = { diff: d, i: 0, stars: [] }; chapter(); }
    });
  }

  function chapter() {
    stop();
    const c = CH[run.i];
    el.innerHTML = `${bar(run.i / 3, `Chapter ${run.i + 1} of 3`, 'blue')}
      <h2>Chapter ${run.i + 1}: ${c.title}</h2>
      <p class="story">${c.line}</p>
      <div class="row"><button class="btn big" id="go">${Ark.UI.play} Start</button>${Ark.canSpeak ? `<button class="btn ghost" id="ls">${Ark.UI.listen} Listen</button>` : ''}</div>`;
    el.querySelector('#go').onclick = play;
    const l = el.querySelector('#ls'); if (l) l.onclick = () => say(c.line, true);
    say(c.line);
    Ark.ctl({ help: () => say(c.line, true), restart: chapter });
  }

  function play() {
    stop(); hush();
    const C = D[run.diff], c = CH[run.i], n = C.sizes[run.i];
    const m = makeMaze(n), path = solve(m, 0, 0, n);
    // Story scrolls: along the path on Easy/Normal, tucked into dead ends on Hard.
    let spots;
    if (C.scrollsOff) {
      const onPath = new Set(path.map(p => p.join(',')));
      const dead = [];
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const w = m[y][x]; if ((w.n + w.e + w.s + w.w) === 3 && !onPath.has(x + ',' + y) && (x + y) > 2) dead.push([x, y]); }
      spots = Ark.shuf(dead).slice(0, 3);
      while (spots.length < 3) spots.push(path[Math.floor(path.length * (spots.length + 1) / 4)]);
    } else spots = [1, 2, 3].map(k => path[Math.floor(path.length * k / 4)]);
    st = { c, n, m, x: 0, y: 0, px: 0, py: 0, steps: 0, shortest: path.length - 1, trail: new Set(['0,0']), hint: null, hints: C.hints, used: 0, fog: C.fog, scrolls: spots.map(([x, y], k) => ({ x, y, k, got: false })), raf: 0, done: false };
    if (C.scrollsOff) {
      // On Hard the shortest walk visits every scroll first, so stars stay fair.
      let at = [0, 0], left = spots.slice(), total = 0;
      const far = (a, b) => solveTo(m, a[0], a[1], n, b).length - 1;
      while (left.length) { left.sort((p, q) => far(at, p) - far(at, q)); total += far(at, left[0]); at = left.shift(); }
      st.shortest = total + far(at, [n - 1, n - 1]);
    }
    el.innerHTML = `<div class="jm-lay"><canvas class="jm-board" id="jm" width="${S}" height="${S}" aria-label="Maze. Move Jonah to the goal in the bottom right corner."></canvas>
      <div class="jm-side"><div class="hud"><span>Chapter ${run.i + 1} of 3</span><span id="jmSteps">Steps: 0</span></div>
      <div class="jm-scrolls" id="jmScrolls" aria-label="Story scrolls found">Scrolls: ${st.scrolls.map(() => Ark.I.scroll).join('')}</div>
      <div id="jmLearn"></div>
      <div class="jm-pad"><button data-d="n" aria-label="Up">▲</button><button data-d="w" aria-label="Left">◀</button><button data-d="s" aria-label="Down">▼</button><button data-d="e" aria-label="Right">▶</button></div></div></div>`;
    learn(el.querySelector('#jmLearn'), C.scrollsOff ? 'Find all 3 scrolls in the dark to open the way!' : 'Collect the scrolls to read Jonah’s story.', '', { icon: Ark.I.scroll });
    const cv = el.querySelector('#jm');
    st.cv = cv; st.cx = cv.getContext('2d');
    st.size = () => { const d = Math.min(3, devicePixelRatio || 1), w = cv.clientWidth || S; cv.width = cv.height = Math.round(w * d); st.cx.setTransform(cv.width / S, 0, 0, cv.height / S, 0, 0); };
    st.size();
    el.querySelectorAll('[data-d]').forEach(b => (b.onclick = () => move(b.dataset.d)));
    let sx = 0, sy = 0;
    cv.onpointerdown = e => { sx = e.clientX; sy = e.clientY; try { cv.setPointerCapture(e.pointerId); } catch (_) {} };
    cv.onpointerup = e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
        const r = cv.getBoundingClientRect(), cs = r.width / n;
        const tx = (e.clientX - r.left) / cs - (st.x + .5), ty = (e.clientY - r.top) / cs - (st.y + .5);
        if (Math.max(Math.abs(tx), Math.abs(ty)) < .5) return;
        move(Math.abs(tx) > Math.abs(ty) ? (tx > 0 ? 'e' : 'w') : (ty > 0 ? 's' : 'n'));
      } else move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : (dy > 0 ? 's' : 'n'));
    };
    const loop = () => { if (!st) return; st.px += (st.x - st.px) * .35; st.py += (st.y - st.py) * .35; draw(); st.raf = requestAnimationFrame(loop); };
    st.raf = requestAnimationFrame(loop);
    Ark.ctl({
      help: C.hints ? () => {
        if (st.hints <= 0) return Ark.toast('No helps left in this maze. You can do it!');
        const target = st.scrolls.find(s => !s.got && C.scrollsOff);
        st.hint = solveTo(st.m, st.x, st.y, n, target ? [target.x, target.y] : [n - 1, n - 1]);
        st.hints--; st.used++;
        clearTimers(); timers.push(setTimeout(() => st && (st.hint = null), 2600));
        say('Follow the golden path!', true);
      } : null,
      restart: play
    });
  }

  function solveTo(m, sx, sy, n, [tx, ty]) {
    const D = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }, prev = { [sx + ',' + sy]: null }, q = [[sx, sy]];
    while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break; for (const d in D) if (!m[y][x][d]) { const nx = x + D[d][0], ny = y + D[d][1], k = nx + ',' + ny; if (!(k in prev)) { prev[k] = [x, y]; q.push([nx, ny]); } } }
    const path = []; let cur = [tx, ty]; while (cur) { path.unshift(cur); cur = prev[cur[0] + ',' + cur[1]]; } return path;
  }

  function move(d) {
    if (!st || st.done) return;
    if (st.m[st.y][st.x][d]) { learn(el.querySelector('#jmLearn'), 'Bump! That way is blocked. Try another way.', '', { icon: Ark.I.arrows }); return; }
    st.x += { e: 1, w: -1 }[d] || 0; st.y += { s: 1, n: -1 }[d] || 0;
    st.steps++; st.trail.add(st.x + ',' + st.y);
    el.querySelector('#jmSteps').textContent = 'Steps: ' + st.steps;
    const sc = st.scrolls.find(s => !s.got && s.x === st.x && s.y === st.y);
    if (sc) {
      sc.got = true;
      const [t, r] = st.c.scrolls[sc.k];
      learn(el.querySelector('#jmLearn'), t, r, { icon: Ark.I.scroll, speak: true });
      el.querySelector('#jmScrolls').innerHTML = 'Scrolls: ' + st.scrolls.map(s => s.got ? Ark.I.scroll.replace('<svg ', '<svg class="on" ') : Ark.I.scroll).join('');
    }
    if (st.x === st.n - 1 && st.y === st.n - 1) {
      if (st.fog && st.scrolls.some(s => !s.got)) { learn(el.querySelector('#jmLearn'), `The way is shut! Find ${st.scrolls.filter(s => !s.got).length} more scroll${st.scrolls.filter(s => !s.got).length > 1 ? 's' : ''} first.`, '', { icon: Ark.I.scroll, speak: true }); return; }
      st.done = true;
      const s = st; timers.push(setTimeout(() => s === st && chapterDone(), 500));
    }
  }

  function draw() {
    const { cx: c, n, m, c: C } = st, cs = S / n;
    c.fillStyle = C.bg; c.fillRect(0, 0, S, S);
    c.fillStyle = C.floor; c.fillRect(cs * .12, cs * .12, S - cs * .24, S - cs * .24);
    c.fillStyle = C.wall; c.globalAlpha = .25;
    st.trail.forEach(k => { const [x, y] = k.split(',').map(Number); c.beginPath(); c.arc((x + .5) * cs, (y + .5) * cs, cs * .1, 0, 7); c.fill(); });
    c.globalAlpha = 1;
    if (st.hint) {
      c.strokeStyle = '#F2A007'; c.lineWidth = cs * .18; c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([cs * .15, cs * .25]);
      c.beginPath(); st.hint.forEach(([x, y], k) => (k ? c.lineTo : c.moveTo).call(c, (x + .5) * cs, (y + .5) * cs)); c.stroke(); c.setLineDash([]);
    }
    st.scrolls.forEach(s => { if (!s.got) scroll(c, (s.x + .5) * cs, (s.y + .5) * cs, cs * .3); });
    c.strokeStyle = C.wall; c.lineWidth = Math.max(4, cs * .12); c.lineCap = 'round';
    c.beginPath();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const w = m[y][x], X = x * cs, Y = y * cs;
      if (w.n) { c.moveTo(X, Y); c.lineTo(X + cs, Y); }
      if (w.w) { c.moveTo(X, Y); c.lineTo(X, Y + cs); }
      if (y === n - 1 && w.s) { c.moveTo(X, Y + cs); c.lineTo(X + cs, Y + cs); }
      if (x === n - 1 && w.e) { c.moveTo(X + cs, Y); c.lineTo(X + cs, Y + cs); }
    }
    c.stroke();
    if (st.fog) {
      const fx = (st.px + .5) * cs, fy = (st.py + .5) * cs, r = cs * 2.3;
      const gr = c.createRadialGradient(fx, fy, r * .55, fx, fy, r);
      gr.addColorStop(0, 'rgba(10,16,30,0)'); gr.addColorStop(1, 'rgba(10,16,30,.94)');
      c.fillStyle = gr; c.beginPath(); c.rect(0, 0, S, S); c.fill();
    }
    goal(c, C.goal, (n - .5) * cs, (n - .5) * cs, cs);
    jonah(c, (st.px + .5) * cs, (st.py + .5) * cs, cs * .36);
  }
  function scroll(c, x, y, r) {
    c.lineWidth = 2; c.strokeStyle = ink; c.fillStyle = '#FBEBC8';
    c.fillRect(x - r * .8, y - r, r * 1.6, r * 2); c.strokeRect(x - r * .8, y - r, r * 1.6, r * 2);
    c.fillStyle = '#E3C48C'; c.beginPath(); c.arc(x - r * .8, y - r, r * .3, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(x + r * .8, y + r, r * .3, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = '#B07A2E'; c.lineWidth = 2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x - r * .5, y + k * r * .5); c.lineTo(x + r * .5, y + k * r * .5); c.stroke(); }
  }
  function jonah(c, x, y, r) {
    c.lineWidth = 2.5; c.strokeStyle = ink;
    c.fillStyle = '#3F6FE0'; c.beginPath(); c.moveTo(x - r * .9, y + r); c.lineTo(x + r * .9, y + r); c.lineTo(x + r * .5, y - r * .1); c.lineTo(x - r * .5, y - r * .1); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#B5753C'; c.beginPath(); c.arc(x, y - r * .45, r * .55, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#4A2E17'; c.beginPath(); c.moveTo(x - r * .45, y - r * .3); c.quadraticCurveTo(x, y + r * .35, x + r * .45, y - r * .3); c.fill();
    c.fillStyle = ink; c.beginPath(); c.arc(x - r * .2, y - r * .55, r * .08, 0, 7); c.arc(x + r * .2, y - r * .55, r * .08, 0, 7); c.fill();
  }
  function goal(c, kind, x, y, cs) {
    const r = cs * .38; c.lineWidth = 2.5; c.strokeStyle = ink;
    if (kind === 'mouth') {
      c.fillStyle = '#FFF7C2'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#fff'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * r * .35 - r * .15, y - r * .55); c.lineTo(x + k * r * .35 + r * .15, y - r * .55); c.lineTo(x + k * r * .35, y - r * .2); c.closePath(); c.fill(); c.stroke(); }
      c.fillStyle = '#5BA4E6'; c.beginPath(); c.arc(x, y + r * .35, r * .3, 0, 7); c.fill();
    } else if (kind === 'sign') {
      c.fillStyle = '#8B5A2B'; c.fillRect(x - r * .1, y - r * .4, r * .2, r * 1.3); c.strokeRect(x - r * .1, y - r * .4, r * .2, r * 1.3);
      c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(x - r, y - r * .85); c.lineTo(x + r * .7, y - r * .85); c.lineTo(x + r, y - r * .5); c.lineTo(x + r * .7, y - r * .15); c.lineTo(x - r, y - r * .15); c.closePath(); c.fill(); c.stroke();
    } else {
      c.fillStyle = '#D9C29A';
      c.fillRect(x - r, y - r * .8, r * .55, r * 1.8); c.strokeRect(x - r, y - r * .8, r * .55, r * 1.8);
      c.fillRect(x + r * .45, y - r * .8, r * .55, r * 1.8); c.strokeRect(x + r * .45, y - r * .8, r * .55, r * 1.8);
      c.fillRect(x - r * .45, y - r * .4, r * .9, r * 1.4); c.strokeRect(x - r * .45, y - r * .4, r * .9, r * 1.4);
      c.fillStyle = '#6B4423'; c.beginPath(); c.moveTo(x - r * .3, y + r); c.lineTo(x - r * .3, y + r * .1); c.arc(x, y + r * .1, r * .3, Math.PI, 0); c.lineTo(x + r * .3, y + r); c.closePath(); c.fill(); c.stroke();
    }
  }


  function chapterDone() {
    const { steps, shortest, used, scrolls, c } = st;
    const extra = steps - shortest + (run.diff === 'normal' ? used * 4 : 0);
    const stars = extra <= Math.max(2, shortest * .3) ? 3 : extra <= shortest * 1.2 + 4 ? 2 : 1;
    run.stars.push(stars); run.i++;
    stop();
    if (run.i < 3) {
      el.innerHTML = `${bar(run.i / 3, `Chapter ${run.i} of 3 complete!`, 'blue')}
        <div class="fin"><div class="bigstars">${[0, 1, 2].map(k => Ark.STAR(k < stars)).join('')}</div>
        <h2>Chapter ${run.i} complete!</h2><p class="story">${c.done[0]}</p><span class="ref">${c.done[1]}</span>
        <p style="margin:0;font-weight:800;color:var(--muted)">${steps} steps · ${scrolls.filter(s => s.got).length} of 3 scrolls</p>
        <div class="row"><button class="btn big" id="nx">Next chapter ${Ark.UI.play}</button><button class="btn ghost" id="rp">Play this maze again</button></div></div>`;
      say(c.done[0]);
      el.querySelector('#nx').onclick = chapter;
      el.querySelector('#rp').onclick = () => { run.i--; run.stars.pop(); play(); };
      Ark.ctl({ restart: () => { run.i--; run.stars.pop(); play(); } });
    } else {
      const avg = Math.round(run.stars.reduce((a, b) => a + b, 0) / 3), diff = run.diff;
      Ark.finish(el, {
        id: 'jonah-maze', diff, stars: avg, title: 'Jonah made it to Nineveh!',
        html: `<p class="story">${c.done[0]}</p><span class="ref">${c.done[1]}</span>`,
        verse: ['Salvation is of the LORD.', 'Jonah 2:9'],
        lesson: 'Jonah ran away, but God didn’t give up on him. God gave Jonah a second chance, and the people of Nineveh too. When we go the wrong way, God still loves us and calls us back.',
        again: () => { run = { diff, i: 0, stars: [] }; chapter(); }, menu,
        next: diff !== 'hard' ? [`Try ${diff === 'easy' ? 'Normal' : 'Hard'}`, () => { const d = diff === 'easy' ? 'normal' : 'hard'; store('diff-jonah-maze', d); run = { diff: d, i: 0, stars: [] }; chapter(); }] : null
      });
    }
  }

  function stop() { if (st) cancelAnimationFrame(st.raf); st = null; clearTimers(); }

  Ark.games['jonah-maze'] = {
    mount(stage) { el = stage; css(); addEventListener('keydown', onKey); addEventListener('resize', onResize); menu(); },
    unmount() { stop(); hush(); removeEventListener('keydown', onKey); removeEventListener('resize', onResize); },
    _test: { state: () => st, run: () => run, move: d => move(d), solveTo: (t) => st && solveTo(st.m, st.x, st.y, st.n, t) }
  };
})();
