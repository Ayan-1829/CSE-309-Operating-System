/* ===================== demos-final.js : interactive tools for chapters 4, 5, 6, 8 ===================== */

/* ================= Chapter 4 ================= */
DEMOS['amdahl'] = (root) => {
  const sS = h('input', { type: 'range', min: 0, max: 100, value: 25, 'aria-label': 'serial portion' }), nS = h('input', { type: 'range', min: 1, max: 64, value: 2, 'aria-label': 'number of cores' });
  const sL = h('b'), nL = h('b'), out = h('div'), pic = h('div', { class: 'fig-box' });
  const sp = (S, N) => 1 / (S + (1 - S) / N);
  function draw() {
    const S = +sS.value / 100, N = +nS.value; sL.textContent = sS.value + '%'; nL.textContent = String(N);
    clear(out).append(h('div', { class: 'out', html: `speedup ≤ 1 / (S + (1 − S) / N) = 1 / (${S.toFixed(2)} + ${(1 - S).toFixed(2)} / ${N}) = <b>${sp(S, N).toFixed(2)}×</b>` }),
      h('div', { class: 'row' }, h('div', { class: 'kv ok' }, h('small', null, `speedup on ${N} core${N > 1 ? 's' : ''}`), h('b', null, sp(S, N).toFixed(2) + '×')), h('div', { class: 'kv warn' }, h('small', null, 'limit as N → ∞ (1 / S)'), h('b', null, S ? (1 / S).toFixed(2) + '×' : '∞'))));
    const W = 520, H = 250, x0 = 50, y0 = 210, NN = 64, top = Math.min(20, S ? 1 / S + 1 : 20), sx = (n) => x0 + Math.log2(n) / 6 * (W - 80), sy = (v) => y0 - Math.min(v, top) / top * 180, k = [];
    k.push(L([[x0, y0], [W - 20, y0]], { end: 'arrow' }), L([[x0, y0], [x0, 14]], { end: 'arrow' }), TX(W / 2, y0 + 32, 'number of cores N (log scale)', 'dg-t2'));
    [1, 2, 4, 8, 16, 32, 64].forEach((n) => k.push(TX(sx(n), y0 + 14, String(n), 'dg-m')));
    [1, Math.round(top / 2), Math.round(top)].forEach((v) => k.push(TX(x0 - 8, sy(v), v + '×', 'dg-m', 'end')));
    [[0.05, 'dg-thin'], [0.5, 'dg-thin'], [S, 'dg-acc']].forEach(([s, c]) => {
      const pts = []; for (let n = 1; n <= NN; n *= 1.15) pts.push([sx(n), sy(sp(s, n))]); pts.push([sx(NN), sy(sp(s, NN))]);
      k.push(sv('path', { d: 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), class: 'dg-ln ' + c }));
      if (c === 'dg-thin') k.push(TX(sx(NN) + 4, sy(sp(s, NN)), 'S = ' + s * 100 + '%', 'dg-s', 'start'));
    });
    if (S) k.push(L([[x0, sy(1 / S)], [W - 20, sy(1 / S)]], { dash: true, cls: 'dg-thin' }));
    k.push(sv('circle', { cx: sx(N), cy: sy(sp(S, N)), r: 6, class: 'dg-press' }));
    clear(pic).append(D.svg(W + 40, H, 'Speedup versus number of cores', k, { scale: 1 }));
  }
  [sS, nS].forEach((i) => i.addEventListener('input', draw));
  root.append(demoBox('Amdahl’s law', 'S is the serial (non-parallel) fraction. Even a small serial part caps the speedup at 1 / S.',
    h('div', { class: 'row' }, h('label', { class: 'fld' }, h('span', null, 'serial portion S ', sL), sS), h('label', { class: 'fld' }, h('span', null, 'cores N ', nL), nS), btn('75% parallel, 2 cores', () => { sS.value = 25; nS.value = 2; draw(); })), out, pic));
  draw();
};

DEMOS['thread-models'] = (root) => {
  const blocked = [false, false, false, false];
  const model = seg([{ v: 'm2o', l: 'Many-to-one' }, { v: 'o2o', l: 'One-to-one' }, { v: 'm2m', l: 'Many-to-many' }, { v: 'two', l: 'Two-level' }], 'm2o', draw);
  const pic = h('div', { class: 'fig-box' }), list = h('div', { class: 'row' }), out = h('div');
  function draw() {
    const m = model.get(), nb = blocked.filter(Boolean).length, free = blocked.map((b) => !b);
    let run = [], why = '';
    if (m === 'm2o') { run = nb ? [] : free.map((f, i) => i); why = nb ? 'A blocking system call blocks the single kernel thread, so <b>every</b> user thread is blocked.' : 'All four share one kernel thread: only one can be in the kernel at a time, so no parallelism on a multicore system.'; }
    else if (m === 'o2o') { run = free.map((f, i) => (f ? i : -1)).filter((i) => i >= 0); why = 'Each user thread has its own kernel thread: one blocking does not stop the others, and threads run in parallel on different cores.'; }
    else if (m === 'm2m') { const K = 3, avail = K - nb; run = free.map((f, i) => (f ? i : -1)).filter((i) => i >= 0).slice(0, Math.max(0, avail)); why = `Four user threads share ${K} kernel threads. A blocked thread holds its kernel thread; the others use the remaining ${Math.max(0, avail)}.`; }
    else { const shared = [0, 1, 2].filter((i) => free[i]), avail = 2 - [0, 1, 2].filter((i) => blocked[i]).length; run = shared.slice(0, Math.max(0, avail)); if (free[3]) run.push(3); why = 'T4 is <b>bound</b> to its own kernel thread; T1–T3 are multiplexed many-to-many on two kernel threads.'; }
    clear(pic).append(threadMap(m));
    clear(list).append(...[0, 1, 2, 3].map((i) => h('div', { class: 'os-th' + (blocked[i] ? ' blocked' : run.includes(i) ? ' run' : ' wait') }, h('b', null, 'T' + (i + 1)), h('small', null, blocked[i] ? 'blocked in I/O' : run.includes(i) ? 'can run' : 'cannot run'),
      btn(blocked[i] ? 'I/O done' : 'block on I/O', () => { blocked[i] = !blocked[i]; draw(); }))));
    out.innerHTML = why;
  }
  out.className = 'out';
  root.append(demoBox('Multithreading models', 'Block some user threads on a system call and see which of the others can still run.', h('div', { class: 'row' }, model.el), pic, list, out));
  draw();
};

/* ================= Chapter 5: CPU scheduling ================= */
const SCHED = {
  fcfs: 'FCFS', sjf: 'SJF (non-preemptive)', srtf: 'SRTF (preemptive SJF)', rr: 'Round Robin', prio: 'Priority (non-preemptive)', pprio: 'Priority (preemptive)', prr: 'Priority + Round Robin'
};
/* procs: [{id, at, bt, pr}] -> {segs:[{id|null, s, e}], res:{id:{ct, tat, wt, rt}}, T} */
function schedule(procs, algo, q) {
  q = Math.max(1, q || 4);
  const P = procs.map((p, i) => ({ id: p.id, at: Math.max(0, Math.round(p.at || 0)), bt: Math.max(1, Math.round(p.bt)), pr: p.pr == null ? 0 : +p.pr, i, rem: Math.max(1, Math.round(p.bt)), first: null, ct: null }));
  const segs = [], add = (id, s, e) => { if (e > s) segs.push({ id, s, e }); };
  let t = 0;
  const left = () => P.filter((p) => p.ct == null);
  const arrived = () => left().filter((p) => p.at <= t);
  const byArr = (a, b) => a.at - b.at || a.i - b.i;
  if (algo === 'fcfs' || algo === 'sjf' || algo === 'prio') {
    while (left().length) {
      let c = arrived();
      if (!c.length) { const nx = Math.min(...left().map((p) => p.at)); add(null, t, nx); t = nx; continue; }
      c.sort(algo === 'fcfs' ? byArr : algo === 'sjf' ? (a, b) => a.bt - b.bt || byArr(a, b) : (a, b) => a.pr - b.pr || byArr(a, b));
      const p = c[0]; p.first = t; add(p.id, t, t + p.bt); t += p.bt; p.rem = 0; p.ct = t;
    }
  } else if (algo === 'srtf' || algo === 'pprio') {
    let cur = null;
    while (left().length && t < 10000) {
      const c = arrived();
      if (!c.length) { cur = null; const nx = Math.min(...left().map((p) => p.at)); add(null, t, nx); t = nx; continue; }
      const key = (p) => (algo === 'srtf' ? p.rem : p.pr);
      c.sort((a, b) => key(a) - key(b) || (a === cur ? -1 : b === cur ? 1 : 0) || byArr(a, b));
      cur = c[0]; if (cur.first == null) cur.first = t;
      add(cur.id, t, t + 1); t++; cur.rem--; if (!cur.rem) { cur.ct = t; cur = null; }
    }
  } else {   /* rr and prr: a single FIFO queue; prr picks the first process of the best priority in it */
    const queue = [], seen = new Set();
    const admit = (upto) => P.filter((p) => !seen.has(p) && p.at <= upto).sort(byArr).forEach((p) => { seen.add(p); queue.push(p); });
    admit(t);
    while (left().length && t < 10000) {
      if (!queue.length) { const nx = Math.min(...left().map((p) => p.at)); add(null, t, nx); t = nx; admit(t); continue; }
      let k = 0;
      if (algo === 'prr') { const best = Math.min(...queue.map((p) => p.pr)); k = queue.findIndex((p) => p.pr === best); }
      const p = queue.splice(k, 1)[0]; if (p.first == null) p.first = t;
      let run = 0;
      while (run < q && p.rem) {
        t++; run++; p.rem--; admit(t);
        if (algo === 'prr' && p.rem && queue.some((x) => x.pr < p.pr)) break;
      }
      add(p.id, t - run, t);
      if (p.rem) queue.push(p); else p.ct = t;
    }
  }
  /* merge neighbouring pieces of the same process (Round Robin keeps every quantum visible) */
  const out = [];
  segs.forEach((s) => { const l = out[out.length - 1]; if (l && l.id === s.id && l.e === s.s && (algo !== 'rr' || s.id == null)) l.e = s.e; else out.push(Object.assign({}, s)); });
  const res = {};
  P.forEach((p) => { res[p.id] = { at: p.at, bt: p.bt, pr: p.pr, ct: p.ct, tat: p.ct - p.at, wt: p.ct - p.at - p.bt, rt: p.first - p.at }; });
  return { segs: out, res, T: t };
}
function ganttEl(segs, ids, upto) {
  const T = segs.length ? segs[segs.length - 1].e : 0, g = h('div', { class: 'os-gantt', style: { '--T': T } });
  segs.forEach((s, j) => {
    const shown = upto == null || j < upto, idx = ids.indexOf(s.id);
    g.append(h('div', { class: 'os-gseg ' + (s.id == null ? 'idle' : pc(idx)) + (shown ? '' : ' fut') + (j === segs.length - 1 ? ' last' : ''), style: { gridColumn: `${s.s + 1} / ${s.e + 1}` }, 'data-s': String(s.s), 'data-e': String(s.e) }, shown ? (s.id == null ? 'idle' : s.id) : ''));
  });
  return h('div', { class: 'os-gantt-wrap' }, g);
}
function schedTable(r, ids, cols) {
  const C = { at: 'Arrival', bt: 'Burst', pr: 'Priority', ct: 'Completion', tat: 'Turnaround', wt: 'Waiting', rt: 'Response' };
  const rows = ids.map((id) => [id, ...cols.map((c) => String(r.res[id][c]))]);
  const avg = (c) => +(ids.reduce((a, id) => a + r.res[id][c], 0) / ids.length).toFixed(2);
  rows.push(['Average', ...cols.map((c) => (['tat', 'wt', 'rt'].includes(c) ? h('b', null, String(avg(c))) : ''))]);
  return tableEl(['Process', ...cols.map((c) => C[c])], rows, 'tt os-st');
}
const parseProcs = (s) => JSON.parse(s).map((p) => ({ id: p[0], at: p[1], bt: p[2], pr: p[3] }));
/* a fixed example from the slides: data-procs='[["P1",0,24],...]' data-algo="fcfs" [data-q] [data-cols] */
DEMOS['gantt'] = (root) => {
  const procs = parseProcs(root.getAttribute('data-procs')), algos = (root.getAttribute('data-algo') || 'fcfs').split(','), q = +(root.getAttribute('data-q') || 4);
  const cols = (root.getAttribute('data-cols') || 'wt').split(','), ids = procs.map((p) => p.id), box = h('div', { class: 'os-gbox' });
  const runs = algos.map((a) => ({ a, r: schedule(procs, a, q) }));
  let upto = 0, timer = null;
  function draw() {
    clear(box);
    runs.forEach(({ a, r }) => {
      if (algos.length > 1) box.append(h('h4', { class: 'os-gh' }, SCHED[a] + (a === 'rr' || a === 'prr' ? ` (q = ${q})` : '') + ' · average waiting time ' + +(ids.reduce((s, id) => s + r.res[id].wt, 0) / ids.length).toFixed(2)));
      box.append(ganttEl(r.segs, ids, upto >= r.segs.length ? null : upto));
    });
    if (algos.length === 1 && upto >= runs[0].r.segs.length) {
      const r = runs[0].r;
      box.append(h('div', { class: 'out small', html: cols.map((c) => { const lab = { wt: 'waiting time', tat: 'turnaround time', rt: 'response time' }[c]; return `${lab}: ` + ids.map((id) => `${id} = ${r.res[id][c]}`).join(', ') + ` → average (${ids.map((id) => r.res[id][c]).join(' + ')}) / ${ids.length} = <b>${+(ids.reduce((s, id) => s + r.res[id][c], 0) / ids.length).toFixed(2)}</b>`; }).join('<br>') }));
    }
  }
  const max = Math.max(...runs.map((x) => x.r.segs.length));
  const play = btn('▶ Build the chart', () => {
    if (timer) return; upto = 0; draw();
    timer = setInterval(() => { upto++; draw(); if (upto >= max) { clearInterval(timer); timer = null; } }, 650);
  });
  root.append(h('div', { class: 'demo os-gdemo' }, box, h('div', { class: 'row' }, play, btn('Show all', () => { if (timer) { clearInterval(timer); timer = null; } upto = max; draw(); }))));
  upto = max; draw();
};

const SCHED_PRESETS = {
  'FCFS: P1 24, P2 3, P3 3': { algo: 'fcfs', p: [['P1', 0, 24, 0], ['P2', 0, 3, 0], ['P3', 0, 3, 0]] },
  'FCFS: order P2, P3, P1': { algo: 'fcfs', p: [['P2', 0, 3, 0], ['P3', 0, 3, 0], ['P1', 0, 24, 0]] },
  'SJF: P1 6, P2 8, P3 7, P4 3': { algo: 'sjf', p: [['P1', 0, 6, 0], ['P2', 0, 8, 0], ['P3', 0, 7, 0], ['P4', 0, 3, 0]] },
  'SJF with arrivals 0, 2, 4, 5': { algo: 'sjf', p: [['P1', 0, 6, 0], ['P2', 2, 8, 0], ['P3', 4, 7, 0], ['P4', 5, 3, 0]] },
  'SRTF example': { algo: 'srtf', p: [['P1', 0, 8, 0], ['P2', 1, 4, 0], ['P3', 2, 9, 0], ['P4', 3, 5, 0]] },
  'RR, q = 4': { algo: 'rr', q: 4, p: [['P1', 0, 24, 0], ['P2', 0, 3, 0], ['P3', 0, 3, 0]] },
  'Priority example': { algo: 'prio', p: [['P1', 0, 10, 3], ['P2', 0, 1, 1], ['P3', 0, 2, 4], ['P4', 0, 1, 5], ['P5', 0, 5, 2]] },
  'Priority + RR, q = 2': { algo: 'prr', q: 2, p: [['P1', 0, 4, 3], ['P2', 0, 5, 2], ['P3', 0, 8, 2], ['P4', 0, 7, 1], ['P5', 0, 3, 3]] },
  'Deterministic evaluation (q = 10)': { algo: 'rr', q: 10, p: [['P1', 0, 10, 0], ['P2', 0, 29, 0], ['P3', 0, 3, 0], ['P4', 0, 7, 0], ['P5', 0, 12, 0]] }
};
DEMOS['sched-sim'] = (root) => {
  let rows = SCHED_PRESETS['SRTF example'].p.map((r) => r.slice());
  const algoSel = selectEl(Object.keys(SCHED).map((k) => ({ v: k, l: SCHED[k] })), root.getAttribute('data-algo') || 'srtf', () => draw());
  const qIn = numInput(4, { min: 1, max: 50, style: { width: '80px' }, oninput: () => draw() });
  const preset = selectEl([{ v: '', l: 'Load an example from the slides…' }, ...Object.keys(SCHED_PRESETS).map((k) => ({ v: k, l: k }))], '', (v) => {
    if (!v) return; const P = SCHED_PRESETS[v]; rows = P.p.map((r) => r.slice()); algoSel.value = P.algo; if (P.q) qIn.value = P.q; table(); draw();
  });
  const tbl = h('div'), out = h('div'), cmp = h('div');
  function table() {
    clear(tbl).append(h('table', { class: 'tt os-edit' }, h('thead', null, h('tr', null, ['Process', 'Arrival', 'Burst', 'Priority', ''].map((x) => h('th', null, x)))),
      h('tbody', null, rows.map((r, i) => h('tr', null, h('td', null, chip(r[0], i)),
        ...[1, 2, 3].map((c) => h('td', null, numInput(r[c], { min: c === 2 ? 1 : 0, max: 99, style: { width: '64px' }, 'aria-label': r[0] + ' ' + ['', 'arrival', 'burst', 'priority'][c], oninput: (e) => { r[c] = Math.max(c === 2 ? 1 : 0, Math.round(+e.target.value || 0)); draw(); } }))),
        h('td', null, rows.length > 1 ? h('button', { type: 'button', class: 'btn sm', 'aria-label': 'remove ' + r[0], onclick: () => { rows.splice(i, 1); table(); draw(); } }, '✕') : null))))),
    rows.length < 8 ? btn('+ Add process', () => { rows.push(['P' + (rows.length + 1), 0, 5, 1]); table(); draw(); }) : null);
  }
  function draw() {
    const procs = rows.map((r) => ({ id: r[0], at: r[1], bt: r[2], pr: r[3] })), ids = procs.map((p) => p.id), a = algoSel.value, q = +qIn.value || 4;
    qIn.disabled = !(a === 'rr' || a === 'prr');
    const r = schedule(procs, a, q);
    clear(out).append(ganttEl(r.segs, ids), schedTable(r, ids, ['at', 'bt', ...(a.includes('prio') || a === 'prr' ? ['pr'] : []), 'ct', 'tat', 'wt', 'rt']),
      h('p', { class: 'small muted' }, 'turnaround = completion − arrival · waiting = turnaround − burst · response = first run − arrival'));
    const all = Object.keys(SCHED).map((k) => { const x = schedule(procs, k, q); const av = (c) => +(ids.reduce((s, id) => s + x.res[id][c], 0) / ids.length).toFixed(2); return [k === a ? h('b', null, SCHED[k]) : SCHED[k], String(av('wt')), String(av('tat')), String(av('rt'))]; });
    clear(cmp).append(h('h4', { style: { margin: '14px 0 6px' } }, 'All algorithms on this workload' + (qIn.disabled ? '' : '')), tableEl(['Algorithm', 'Avg waiting', 'Avg turnaround', 'Avg response'], all, 'tt'), h('p', { class: 'small muted' }, `Round Robin and Priority + RR use q = ${q}. Smaller priority number = higher priority.`));
  }
  root.append(demoBox('CPU-scheduling simulator', 'Edit the processes, pick an algorithm and read the Gantt chart and the times. Every example from the slides is in the list.',
    h('div', { class: 'row' }, preset), h('div', { class: 'row' }, field('algorithm', algoSel), field('time quantum q', qIn)), tbl, out, cmp));
  table(); draw();
};

DEMOS['mlfq-sim'] = (root) => {
  let rows = [['A', 0, 6], ['B', 0, 20], ['C', 2, 30], ['D', 10, 4]];
  const QS = [8, 16, Infinity], tbl = h('div'), out = h('div');
  function sim() {
    const P = rows.map((r, i) => ({ id: r[0], at: r[1], rem: r[2], i, lvl: 0, used: 0, ct: null })), Q = [[], [], []], segs = [];
    let t = 0;
    const admit = () => P.filter((p) => p.at === t).forEach((p) => Q[0].push(p));
    admit();
    while (P.some((p) => p.ct == null) && t < 2000) {
      const l = Q.findIndex((q) => q.length);
      if (l < 0) { segs.push({ id: null, s: t, e: t + 1, l: -1 }); t++; admit(); continue; }
      const p = Q[l][0];
      p.rem--; p.used++; t++;
      const last = segs[segs.length - 1];
      if (last && last.id === p.id && last.l === l && last.e === t - 1) last.e = t; else segs.push({ id: p.id, s: t - 1, e: t, l });
      admit();
      if (!p.rem) { Q[l].shift(); p.ct = t; } else if (p.used >= QS[l]) { Q[l].shift(); p.lvl = l + 1; p.used = 0; Q[l + 1].push(p); }
    }
    return { segs, P };
  }
  function table() {
    clear(tbl).append(h('table', { class: 'tt os-edit' }, h('thead', null, h('tr', null, ['Process', 'Arrival', 'Burst', ''].map((x) => h('th', null, x)))),
      h('tbody', null, rows.map((r, i) => h('tr', null, h('td', null, chip(r[0], i)), ...[1, 2].map((c) => h('td', null, numInput(r[c], { min: c === 2 ? 1 : 0, max: 99, style: { width: '64px' }, oninput: (e) => { r[c] = Math.max(c === 2 ? 1 : 0, Math.round(+e.target.value || 0)); draw(); } }))),
        h('td', null, rows.length > 1 ? h('button', { type: 'button', class: 'btn sm', onclick: () => { rows.splice(i, 1); table(); draw(); } }, '✕') : null))))),
    rows.length < 6 ? btn('+ Add process', () => { rows.push([String.fromCharCode(65 + rows.length), 0, 10]); table(); draw(); }) : null);
  }
  function draw() {
    const { segs, P } = sim(), ids = rows.map((r) => r[0]);
    const T = segs.length ? segs[segs.length - 1].e : 0, wrap = h('div', { class: 'os-mlfq', style: { '--T': T } });
    ['Q0 · RR q = 8', 'Q1 · RR q = 16', 'Q2 · FCFS'].forEach((lab, l) => {
      wrap.append(h('div', { class: 'os-mlfq-h' }, lab));
      const lane = h('div', { class: 'os-gantt', style: { '--T': T } });
      segs.filter((s) => s.l === l).forEach((s) => lane.append(h('div', { class: 'os-gseg ' + pc(ids.indexOf(s.id)), style: { gridColumn: `${s.s + 1} / ${s.e + 1}` }, 'data-s': String(s.s), 'data-e': String(s.e) }, s.id)));
      wrap.append(lane);
    });
    clear(out).append(h('div', { class: 'scrollx' }, wrap), tableEl(['Process', 'Completion', 'Turnaround', 'Finished in'], P.map((p) => [p.id, String(p.ct), String(p.ct - p.at), ['Q0', 'Q1', 'Q2'][p.lvl]]), 'tt'),
      h('p', { class: 'small muted' }, 'New processes enter Q0. Using a whole quantum without finishing moves a process down one queue. A lower queue runs only when every higher queue is empty, and an arrival in Q0 preempts it.'));
  }
  root.append(demoBox('Multilevel feedback queue', 'The three-queue example from the slide: Q0 (RR, 8 ms), Q1 (RR, 16 ms), Q2 (FCFS). Short jobs finish in Q0; long jobs sink.', tbl, out));
  table(); draw();
};

DEMOS['little'] = (root) => {
  const lam = numInput(7, { min: 0, step: 'any' }), W = numInput(2, { min: 0, step: 'any' }), n = numInput(14, { min: 0, step: 'any' });
  const solve = seg([{ v: 'W', l: 'find W' }, { v: 'n', l: 'find n' }, { v: 'l', l: 'find λ' }], 'W', draw), out = h('div');
  function draw() {
    const s = solve.get(); [lam, W, n].forEach((i) => { i.disabled = false; });
    if (s === 'W') { W.disabled = true; W.value = +(+n.value / +lam.value).toFixed(3); }
    if (s === 'n') { n.disabled = true; n.value = +(+lam.value * +W.value).toFixed(3); }
    if (s === 'l') { lam.disabled = true; lam.value = +(+n.value / +W.value).toFixed(3); }
    out.innerHTML = `n = λ × W &nbsp;→&nbsp; <b>${n.value}</b> = ${lam.value} × ${W.value}`;
  }
  [lam, W, n].forEach((i) => i.addEventListener('input', draw)); out.className = 'out';
  root.append(demoBox('Little’s formula', 'n = average queue length, λ = average arrival rate, W = average waiting time in the queue.', h('div', { class: 'row' }, solve.el), h('div', { class: 'row' }, field('λ (processes / s)', lam), field('W (seconds)', W), field('n (processes)', n)), out));
  draw();
};

/* ================= Chapter 6: Synchronization ================= */
DEMOS['race-pid'] = (root) => {
  const CODE = ['reg = next_available_pid;', 'next_available_pid = reg + 1;', 'child pid = reg;'];
  let s;
  const view = h('div'), log = h('ol', { class: 'os-log' });
  function reset() { s = { v: 2615, pc: [0, 0], reg: [null, null], kid: [null, null] }; clear(log); draw(); }
  function step(i) {
    const k = s.pc[i]; if (k > 2) return;
    if (k === 0) { s.reg[i] = s.v; log.append(h('li', null, `P${i} reads next_available_pid = ${s.v} into its register`)); }
    if (k === 1) { s.v = s.reg[i] + 1; log.append(h('li', null, `P${i} writes next_available_pid = ${s.v}`)); }
    if (k === 2) { s.kid[i] = s.reg[i]; log.append(h('li', null, `P${i} gives its child pid ${s.reg[i]}`)); }
    s.pc[i]++; draw();
  }
  function run(order) { reset(); order.forEach(step); }
  function draw() {
    const clash = s.kid[0] != null && s.kid[0] === s.kid[1];
    const pane = (i) => h('div', { class: 'os-pane' }, h('div', { class: 'os-pane-h' }, `P${i} calls fork( )` + (s.kid[i] != null ? ` · child pid ${s.kid[i]}` : '')),
      h('ol', { class: 'os-code' }, CODE.map((c, j) => h('li', { class: j < s.pc[i] ? 'done' : j === s.pc[i] ? 'cur' : '' }, h('code', null, c)))),
      h('div', { class: 'small' }, 'register: ', h('b', null, s.reg[i] == null ? '—' : String(s.reg[i]))), btn(`Run next line of P${i}`, () => step(i), s.pc[i] < 3 ? 'pri' : ''));
    clear(view).append(h('div', { class: 'cols' }, pane(0), pane(1)), h('div', { class: 'row' }, h('div', { class: 'kv' }, h('small', null, 'shared kernel variable next_available_pid'), h('b', null, String(s.v)))),
      s.kid[0] != null && s.kid[1] != null ? h('div', { class: 'verdict ' + (clash ? 'bad' : 'ok') }, clash ? `Race condition: both children got pid ${s.kid[0]}!` : `Correct: the children got different pids (${s.kid[0]} and ${s.kid[1]}).`) : '');
  }
  root.append(demoBox('Race on next_available_pid', 'Two processes call fork() at the same time. Each fork reads, updates and uses the shared counter. Choose the interleaving.',
    h('div', { class: 'row' }, btn('Unlucky interleaving', () => run([0, 1, 0, 1, 0, 1])), btn('One after the other', () => run([0, 0, 0, 1, 1, 1])), btn('Reset', reset)), view, log));
  reset();
};

DEMOS['peterson'] = (root) => {
  const ALG = {
    turn: { name: 'Shared turn only', lines: ['while (turn == j) ;   // busy wait', '/* critical section */', 'turn = j;', '/* remainder section */'], cs: 1, rem: 3 },
    pet: { name: 'Peterson’s solution', lines: ['flag[i] = true;', 'turn = j;', 'while (flag[j] && turn == j) ;', '/* critical section */', 'flag[i] = false;', '/* remainder section */'], cs: 3, rem: 5 }
  };
  const alg = seg([{ v: 'pet', l: 'Peterson’s solution' }, { v: 'turn', l: 'Shared turn only' }], root.getAttribute('data-alg') || 'pet', () => reset());
  let s;
  const view = h('div'), log = h('ol', { class: 'os-log' }), verdict = h('div');
  function reset() { s = { pc: [0, 0], flag: [false, false], turn: 0, wants: [true, true], spins: [0, 0], viol: false }; clear(log); clear(verdict); draw(); }
  function step(i) {
    const A = ALG[alg.get()], j = 1 - i, k = s.pc[i], line = A.lines[k];
    if (k === A.rem && !s.wants[i]) { log.append(h('li', null, `P${i} stays in its remainder section.`)); return draw(); }
    if (alg.get() === 'turn') {
      if (k === 0) { if (s.turn === j) { s.spins[i]++; log.append(h('li', null, `P${i}: turn == ${j}, so it spins.`)); return draw(); } }
      if (k === 2) s.turn = j;
    } else {
      if (k === 0) s.flag[i] = true;
      if (k === 1) s.turn = j;
      if (k === 2 && s.flag[j] && s.turn === j) { s.spins[i]++; log.append(h('li', null, `P${i}: flag[${j}] is true and turn == ${j}, so it spins.`)); return draw(); }
      if (k === 4) s.flag[i] = false;
    }
    s.spins[i] = 0;
    s.pc[i] = (k + 1) % A.lines.length;
    log.append(h('li', null, `P${i} executes: ${line}`));
    if (s.pc[0] === A.cs && s.pc[1] === A.cs) s.viol = true;
    draw();
  }
  function draw() {
    const A = ALG[alg.get()];
    const pane = (i) => h('div', { class: 'os-pane' + (s.pc[i] === A.cs ? ' incs' : '') + (s.spins[i] ? ' blocked' : '') },
      h('div', { class: 'os-pane-h' }, `Process P${i}  (i = ${i}, j = ${1 - i})` + (s.pc[i] === A.cs ? ' · in critical section' : s.spins[i] ? ' · spinning' : '')),
      h('ol', { class: 'os-code', start: 1 }, A.lines.map((c, j) => h('li', { class: j === s.pc[i] ? 'cur' : '' }, h('code', null, c)))),
      h('div', { class: 'row tight' }, btn(`Step P${i}`, () => step(i), 'pri'), tsw('wants to enter again', s.wants[i], (v) => { s.wants[i] = !!v; }).el));
    clear(view).append(h('div', { class: 'cols' }, pane(0), pane(1)),
      h('div', { class: 'row' }, alg.get() === 'pet' ? h('div', { class: 'kv' }, h('small', null, 'flag[0], flag[1]'), h('b', null, `${s.flag[0]}, ${s.flag[1]}`)) : null, h('div', { class: 'kv' }, h('small', null, 'turn'), h('b', null, String(s.turn)))));
    if (s.viol) clear(verdict).append(h('div', { class: 'verdict bad' }, 'Both processes are in their critical sections: mutual exclusion violated!'));
  }
  function random() {
    reset(); let both = 0;
    for (let n = 0; n < 400; n++) { step(rnd(2)); if (s.viol) both++; }
    clear(log); log.append(h('li', null, `Ran 400 random steps. Mutual exclusion ${s.viol ? 'was VIOLATED' : 'held every time'}.`));
    clear(verdict).append(h('div', { class: 'verdict ' + (s.viol ? 'bad' : 'ok') }, s.viol ? 'Mutual exclusion violated.' : 'Mutual exclusion held in every interleaving tried.'));
  }
  root.append(demoBox('Two processes, one critical section', 'Step each process in any order. Try to get both into the critical section. With “shared turn only”, untick “wants to enter again” for P1 to see progress fail.',
    h('div', { class: 'row' }, alg.el, btn('400 random steps', random), btn('Reset', reset)), view, verdict, log));
  reset();
};

DEMOS['semaphore'] = (root) => {
  const init = seg([1, 2, 3].map((v) => ({ v, l: 'S = ' + v })), 2, () => reset());
  const mode = seg([{ v: 'q', l: 'with a waiting queue' }, { v: 'b', l: 'busy waiting' }], 'q', () => reset());
  let S, st, q;
  const view = h('div'), log = h('ol', { class: 'os-log' });
  const N = 5;
  function reset() { S = init.get(); st = Array(N).fill('idle'); q = []; clear(log); draw(); }
  const say = (t) => log.append(h('li', { html: t }));
  function wait(i) {
    if (mode.get() === 'q') { S--; if (S < 0) { st[i] = 'blocked'; q.push(i); say(`P${i + 1}: wait(S) → S = ${S} &lt; 0, so P${i + 1} is <b>blocked</b> and put on the semaphore’s queue.`); } else { st[i] = 'in'; say(`P${i + 1}: wait(S) → S = ${S}; P${i + 1} enters.`); } }
    else { if (S <= 0) { st[i] = 'spin'; q.push(i); say(`P${i + 1}: wait(S) finds S = ${S}, so it <b>busy-waits</b> (keeps testing S, using CPU).`); } else { S--; st[i] = 'in'; say(`P${i + 1}: wait(S) → S = ${S}; P${i + 1} enters.`); } }
    draw();
  }
  function signal(i) {
    st[i] = 'idle'; S++;
    if (mode.get() === 'q') { say(`P${i + 1}: signal(S) → S = ${S}.`); if (S <= 0 && q.length) { const w = q.shift(); st[w] = 'in'; say(`wakeup(P${w + 1}): it moves to the ready queue and enters.`); } }
    else { say(`P${i + 1}: signal(S) → S = ${S}.`); if (q.length) { const w = q.shift(); S--; st[w] = 'in'; say(`P${w + 1}’s busy-wait loop sees S &gt; 0, decrements it (S = ${S}) and enters.`); } }
    draw();
  }
  function draw() {
    clear(view).append(h('div', { class: 'row' }, h('div', { class: 'kv' + (S < 0 ? ' warn' : '') }, h('small', null, 'semaphore value S'), h('b', null, String(S))),
      h('div', { class: 'kv' }, h('small', null, mode.get() === 'q' ? 'waiting queue' : 'busy-waiting'), h('b', null, q.length ? q.map((i) => 'P' + (i + 1)).join(', ') : '—'))),
      h('div', { class: 'row' }, range(N).map((i) => h('div', { class: 'os-th ' + ({ idle: '', in: 'run', blocked: 'blocked', spin: 'wait' }[st[i]]) },
        h('b', null, 'P' + (i + 1)), h('small', null, { idle: 'not using it', in: 'using the resource', blocked: 'blocked (sleeping)', spin: 'spinning on S' }[st[i]]),
        st[i] === 'idle' ? btn('wait(S)', () => wait(i)) : st[i] === 'in' ? btn('signal(S)', () => signal(i), 'pri') : null))));
  }
  root.append(demoBox('Counting semaphore', 'S starts at the number of identical resources. Call wait() to take one and signal() to give it back.', h('div', { class: 'row' }, init.el, mode.el, btn('Reset', reset)), view, log));
  reset();
};

/* ================= Chapter 8: Deadlocks ================= */
function ragAnalyse(spec) {
  const P = Object.keys(spec.P), avail = {}, held = {}, want = {};
  Object.keys(spec.R).forEach((r) => { avail[r] = spec.R[r][2]; });
  P.forEach((p) => { held[p] = []; want[p] = []; });
  (spec.asg || []).forEach(([r, p]) => { avail[r]--; held[p].push(r); });
  (spec.req || []).forEach(([p, r]) => want[p].push(r));
  const done = new Set(), steps = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (const p of P) {
      if (done.has(p)) continue;
      const need = {}; want[p].forEach((r) => { need[r] = (need[r] || 0) + 1; });
      if (Object.keys(need).every((r) => avail[r] >= need[r])) {
        done.add(p); held[p].forEach((r) => avail[r]++);
        steps.push(`${p} ${want[p].length ? 'can get ' + want[p].join(', ') : 'is not waiting'}, finishes and releases ${held[p].length ? held[p].join(', ') : 'nothing'}.`);
        progress = true;
      }
    }
  }
  /* cycle search on the graph (P→R request edges, R→P assignment edges) */
  const adj = {}, push = (a, b) => { (adj[a] = adj[a] || []).push(b); };
  (spec.req || []).forEach(([p, r]) => push(p, r)); (spec.asg || []).forEach(([r, p]) => push(r, p));
  let cycle = null;
  const visit = (u, path) => { if (cycle) return; const k = path.indexOf(u); if (k >= 0) { cycle = path.slice(k).concat(u); return; } (adj[u] || []).forEach((v) => visit(v, path.concat(u))); };
  P.forEach((p) => visit(p, []));
  return { stuck: P.filter((p) => !done.has(p)), steps, cycle };
}
DEMOS['rag-check'] = (root) => {
  const G = { example: 'Example graph', deadlock: 'With a deadlock', cycle: 'Cycle, no deadlock' };
  const pick = seg(Object.keys(G).map((k) => ({ v: k, l: G[k] })), root.getAttribute('data-graph') || 'example', draw), pic = h('div', { class: 'fig-box' }), out = h('div');
  function draw() {
    const spec = RAG[pick.get()], a = ragAnalyse(spec), hl = [];
    if (a.cycle) for (let i = 0; i + 1 < a.cycle.length; i++) hl.push(a.cycle[i] + a.cycle[i + 1]);
    a.stuck.forEach((p) => hl.push(p));
    clear(pic).append(ragSvg(Object.assign({ hl }, spec), G[pick.get()]));
    clear(out).append(h('div', { class: 'out' }, a.cycle ? h('div', null, 'Cycle: ', h('b', null, a.cycle.join(' → '))) : h('div', null, 'The graph has ', h('b', null, 'no cycle'), ', so there is no deadlock.')),
      h('ol', { class: 'os-log' }, a.steps.map((s) => h('li', null, s))),
      h('div', { class: 'verdict ' + (a.stuck.length ? 'bad' : 'ok') }, a.stuck.length ? `Deadlock: ${a.stuck.join(', ')} can never finish.` : (a.cycle ? 'There is a cycle, but every process can still finish: no deadlock (some resources have several instances).' : 'Every process can finish: no deadlock.')));
  }
  root.append(demoBox('Is there a deadlock?', 'The tool looks for a cycle, then tries to let each process finish and release what it holds.', h('div', { class: 'row' }, pick.el), pic, out));
  draw();
};

/* shared matrix tool for the Banker's algorithm and the detection algorithm */
function matrixTool(root, cfg) {
  let st = JSON.parse(JSON.stringify(cfg.presets[0].s)), hist = [];
  const n = () => st.alloc.length, m = () => st.avail.length, names = () => range(n()).map((i) => 'P' + i), res = () => range(m()).map((j) => String.fromCharCode(65 + j));
  const vec = (v) => '(' + v.join(', ') + ')', le = (a, b) => a.every((x, j) => x <= b[j]);
  const need = () => st.alloc.map((a, i) => (cfg.mode === 'bank' ? st.max[i].map((x, j) => x - a[j]) : st.req[i]));
  const tbl = h('div'), run = h('div'), reqBox = h('div');
  const cell = (arr, i, j) => numInput(arr[i][j], { min: 0, max: 99, style: { width: '46px' }, 'aria-label': `${names()[i]} ${res()[j]}`, oninput: (e) => { arr[i][j] = Math.max(0, +e.target.value | 0); paint(); } });
  function table() {
    const R = res(), N = need();
    const head = h('tr', null, h('th', { rowspan: 2 }, ''), h('th', { colspan: m() }, 'Allocation'), h('th', { colspan: m() }, cfg.mode === 'bank' ? 'Max' : 'Request'), cfg.mode === 'bank' ? h('th', { colspan: m(), class: 'calc' }, 'Need = Max − Allocation') : null);
    const head2 = h('tr', null, ...[0, 1, ...(cfg.mode === 'bank' ? [2] : [])].map((g) => R.map((r) => h('th', { class: g === 2 ? 'calc' : '' }, r))));
    const body = names().map((p, i) => h('tr', null, h('th', null, p), ...range(m()).map((j) => h('td', null, cell(st.alloc, i, j))), ...range(m()).map((j) => h('td', null, cell(cfg.mode === 'bank' ? st.max : st.req, i, j))),
      ...(cfg.mode === 'bank' ? N[i].map((x) => h('td', { class: 'calc' + (x < 0 ? ' bad' : '') }, String(x))) : [])));
    clear(tbl).append(h('div', { class: 'scrollx' }, h('table', { class: 'tt os-mx' }, h('thead', null, head, head2), h('tbody', null, body))),
      h('div', { class: 'row' }, h('span', { class: 'small' }, 'Available'), ...range(m()).map((j) => field(res()[j], numInput(st.avail[j], { min: 0, max: 99, style: { width: '56px' }, oninput: (e) => { st.avail[j] = Math.max(0, +e.target.value | 0); paint(); } })))));
  }
  function safety() {
    const N = need(), work = st.avail.slice(), fin = st.alloc.map((a) => (cfg.mode === 'detect' ? a.every((x) => !x) : false)), seq = [], rows = [];
    let i = 0, idle = 0;
    rows.push([h('i', null, 'start'), vec(work), fin.map((f) => (f ? 'T' : 'F')).join(' '), cfg.mode === 'detect' ? 'processes holding nothing start as finished' : 'Work = Available']);
    while (idle < n()) {
      if (!fin[i] && le(N[i], work)) {
        st.alloc[i].forEach((x, j) => { work[j] += x; }); fin[i] = true; seq.push('P' + i); idle = 0;
        rows.push(['P' + i, vec(work), fin.map((f) => (f ? 'T' : 'F')).join(' '), `${cfg.mode === 'bank' ? 'Need' : 'Request'} ${vec(N[i])} ≤ Work, so P${i} can finish and return its allocation ${vec(st.alloc[i])}`]);
      } else idle++;
      i = (i + 1) % n();
    }
    return { ok: fin.every(Boolean), seq, rows, stuck: fin.map((f, k) => (f ? null : 'P' + k)).filter(Boolean) };
  }
  function paint() {
    const r = safety();
    clear(run).append(h('h4', { style: { margin: '12px 0 6px' } }, cfg.mode === 'bank' ? 'Safety algorithm' : 'Detection algorithm'), tableEl(['Step', 'Work', 'Finish', 'Why'], r.rows, 'tt os-trace'),
      h('div', { class: 'verdict ' + (r.ok ? 'ok' : 'bad') }, r.ok ? (cfg.mode === 'bank' ? 'Safe state. Safe sequence ' : 'No deadlock. Order ') + '<' + r.seq.join(', ') + '>' : (cfg.mode === 'bank' ? `Unsafe state: ${r.stuck.join(', ')} cannot be guaranteed to finish.` : `Deadlock: ${r.stuck.join(', ')} are deadlocked.`)));
    table();
  }
  if (cfg.mode === 'bank') {
    const who = selectEl(range(5).map((i) => ({ v: i, l: 'P' + i })), 1), rv = textInput('1, 0, 2', { style: { width: '110px' }, 'aria-label': 'request vector' }), msg = h('div');
    const doReq = () => {
      const i = +who.value, R = rv.value.split(/[^0-9]+/).filter(Boolean).map(Number).slice(0, m()); while (R.length < m()) R.push(0);
      const N = need()[i], lines = [];
      if (!le(R, N)) { clear(msg).append(h('div', { class: 'verdict bad' }, `Step 1: Request ${vec(R)} > Need ${vec(N)}. Error: P${i} has exceeded its maximum claim.`)); return; }
      lines.push(`Step 1: Request ${vec(R)} ≤ Need ${vec(N)} ✓`);
      if (!le(R, st.avail)) { clear(msg).append(h('div', { class: 'out', html: lines.join('<br>') }), h('div', { class: 'verdict bad' }, `Step 2: Request ${vec(R)} > Available ${vec(st.avail)}. P${i} must wait: the resources are not available.`)); return; }
      lines.push(`Step 2: Request ${vec(R)} ≤ Available ${vec(st.avail)} ✓`);
      const old = JSON.parse(JSON.stringify(st));
      st.avail = st.avail.map((x, j) => x - R[j]); st.alloc[i] = st.alloc[i].map((x, j) => x + R[j]);
      lines.push(`Step 3: pretend to allocate → Available ${vec(st.avail)}, Allocation<sub>${i}</sub> ${vec(st.alloc[i])}, Need<sub>${i}</sub> ${vec(need()[i])}`);
      const r = safety();
      if (r.ok) { hist.push(old); lines.push(`The new state is safe: <${r.seq.join(', ')}>. <b>The request is granted.</b>`); paint(); clear(msg).append(h('div', { class: 'out', html: lines.join('<br>') }), h('div', { class: 'verdict ok' }, `Granted. The table now shows the state after P${i}’s request.`), btn('Undo this request', () => { st = hist.pop(); clear(msg); paint(); })); }
      else { st = old; lines.push(`The new state would be unsafe (${r.stuck.join(', ')} could not finish). <b>P${i} must wait</b>; the old state is restored.`); paint(); clear(msg).append(h('div', { class: 'out', html: lines.join('<br>') }), h('div', { class: 'verdict bad' }, 'Not granted: it would leave the system in an unsafe state.')); }
    };
    clear(reqBox).append(h('h4', { style: { margin: '14px 0 6px' } }, 'Resource-request algorithm'), h('div', { class: 'row' }, field('process', who), field('request vector', rv), btn('Request', doReq, 'pri'),
      ...cfg.tries.map(([p, v]) => btn(`P${p} (${v})`, () => { who.value = p; rv.value = v; doReq(); }))), msg);
  }
  const presets = selectEl(cfg.presets.map((p, i) => ({ v: i, l: p.l })), 0, (v) => { st = JSON.parse(JSON.stringify(cfg.presets[+v].s)); hist = []; paint(); });
  root.append(demoBox(cfg.title, cfg.sub, cfg.presets.length > 1 ? h('div', { class: 'row' }, presets) : null, tbl, run, reqBox));
  paint();
}
DEMOS['bankers'] = (root) => matrixTool(root, {
  mode: 'bank', title: 'Banker’s algorithm', sub: 'Edit Allocation, Max and Available. Need is computed for you, and the safety algorithm runs on every change. Then try the requests from the slides.',
  tries: [[1, '1, 0, 2'], [4, '3, 3, 0'], [0, '0, 2, 0']],
  presets: [{ l: 'Snapshot at time T0 (slide example)', s: { alloc: [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]], max: [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]], avail: [3, 3, 2] } },
    { l: 'After P1’s request (1, 0, 2) is granted', s: { alloc: [[0, 1, 0], [3, 0, 2], [3, 0, 2], [2, 1, 1], [0, 0, 2]], max: [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]], avail: [2, 3, 0] } }]
});
DEMOS['detect'] = (root) => matrixTool(root, {
  mode: 'detect', title: 'Deadlock-detection algorithm', sub: 'Like the safety algorithm, but it uses the current Request matrix instead of Need. Any process left unfinished is deadlocked.',
  presets: [{ l: 'Snapshot at time T0 (slide example)', s: { alloc: [[0, 1, 0], [2, 0, 0], [3, 0, 3], [2, 1, 1], [0, 0, 2]], req: [[0, 0, 0], [2, 0, 2], [0, 0, 0], [1, 0, 0], [0, 0, 2]], avail: [0, 0, 0] } },
    { l: 'P2 requests one more instance of C', s: { alloc: [[0, 1, 0], [2, 0, 0], [3, 0, 3], [2, 1, 1], [0, 0, 2]], req: [[0, 0, 0], [2, 0, 2], [0, 0, 1], [1, 0, 0], [0, 0, 2]], avail: [0, 0, 0] } }]
});
