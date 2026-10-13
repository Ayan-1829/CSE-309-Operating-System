/* ===================== figs-final.js : figures for the final-term chapters (4, 5, 6, 8) ===================== */

/* ================= Chapter 4: Threads & Concurrency ================= */
function squiggle(x, y, hh) {
  let d = `M${x} ${y}`;
  for (let i = 0; i < 6; i++) d += ` q ${i % 2 ? -8 : 8} ${hh / 12} 0 ${hh / 6}`;
  return sv('path', { d, class: 'dg-ln dg-acc', 'stroke-width': 2.4 });
}
FIGS['threads-single-multi'] = () => {
  const k = [TX(150, 14, 'single-threaded process', 'dg-t'), TX(500, 14, 'multithreaded process', 'dg-t')];
  ['code', 'data', 'files'].forEach((t, i) => k.push(R(40 + i * 74, 30, 70, 34, t, { cls: 'dg-fill1', tcls: 'dg-t2' })));
  ['registers', 'PC', 'stack'].forEach((t, i) => k.push(R(40 + i * 74, 70, 70, 34, t, { cls: 'dg-fill2', tcls: 'dg-t2' })));
  k.push(squiggle(150, 120, 120), TX(180, 180, 'thread', 'dg-s', 'start'));
  ['code', 'data', 'files'].forEach((t, i) => k.push(R(360 + i * 96, 30, 90, 34, t, { cls: 'dg-fill1', tcls: 'dg-t2' })));
  [0, 1, 2].forEach((j) => {
    ['registers', 'PC', 'stack'].forEach((t, i) => k.push(R(360 + j * 96, 70 + i * 32, 90, 30, t, { cls: 'dg-fill2', tcls: 'dg-s' })));
    k.push(squiggle(405 + j * 96, 172, 90));
  });
  k.push(TX(500, 280, 'each thread: own registers, PC and stack; code, data and files are shared', 'dg-s'));
  return D.svg(700, 292, 'Single-threaded and multithreaded processes', k);
};

FIGS['conc-par'] = () => {
  const k = [], cols = ['dg-fill1', 'dg-fill2', 'dg-fill3', 'dg-fill1'];
  k.push(TX(10, 24, 'concurrent execution on a single-core system', 'dg-t2', 'start'), TX(10, 104, 'parallelism on a multi-core system', 'dg-t2', 'start'));
  k.push(TX(60, 52, 'single core', 'dg-s', 'end'));
  for (let i = 0; i < 12; i++) k.push(R(70 + i * 50, 36, 50, 32, 'T' + (i % 4 + 1), { rx: 0, cls: cols[i % 4], tcls: 'dg-m' }));
  k.push(TX(60, 132, 'core 1', 'dg-s', 'end'), TX(60, 170, 'core 2', 'dg-s', 'end'));
  for (let i = 0; i < 6; i++) { k.push(R(70 + i * 100, 116, 100, 32, i % 2 ? 'T3' : 'T1', { rx: 0, cls: cols[i % 2 ? 2 : 0], tcls: 'dg-m' }), R(70 + i * 100, 154, 100, 32, i % 2 ? 'T4' : 'T2', { rx: 0, cls: cols[i % 2 ? 3 : 1], tcls: 'dg-m' })); }
  k.push(arrow([[70, 200], [680, 200]], { label: 'time', at: 0.97, dy: -12, cls: 'dg-thin' }));
  return D.svg(700, 212, 'Concurrency on one core versus parallelism on two cores', k);
};

FIGS['data-task'] = () => {
  const k = [TX(170, 14, 'data parallelism', 'dg-t'), TX(530, 14, 'task parallelism', 'dg-t')];
  k.push(R(30, 30, 280, 40, null, { cls: 'dg-fill3' }), TX(170, 50, 'data', 'dg-t2'));
  k.push(R(390, 30, 280, 40, null, { cls: 'dg-fill3' }), TX(530, 50, 'data', 'dg-t2'));
  for (let i = 0; i < 4; i++) {
    k.push(R(30 + i * 70, 30, 70, 40, null, { rx: 0, cls: ['dg-fill1', 'dg-fill2', 'dg-fill1', 'dg-fill2'][i] }));
    k.push(arrow([[65 + i * 70, 70], [65 + i * 70, 120]], { cls: 'dg-thin' }), R(35 + i * 70, 120, 60, 40, 'core ' + i, { cls: 'dg-fill3', tcls: 'dg-s' }), TX(65 + i * 70, 180, 'sum( )', 'dg-m'));
    k.push(arrow([[530, 70], [425 + i * 70, 120]], { cls: 'dg-thin' }), R(395 + i * 70, 120, 60, 40, 'core ' + i, { cls: 'dg-fill3', tcls: 'dg-s' }), TX(425 + i * 70, 180, ['sum( )', 'max( )', 'sort( )', 'avg( )'][i], 'dg-m'));
  }
  k.push(TX(170, 214, 'same operation on different subsets', 'dg-s'), TX(530, 214, 'different operations', 'dg-s'));
  return D.svg(700, 226, 'Data parallelism and task parallelism', k);
};

function threadMap(model) {
  const k = [], ux = [60, 140, 220, 300], kx = model === 'm2o' ? [180] : model === 'o2o' ? [60, 140, 220, 300] : model === 'm2m' ? [100, 180, 260] : [90, 180, 300];
  k.push(L([[20, 110], [360, 110]], { dash: true, cls: 'dg-thin' }), TX(20, 22, 'user threads', 'dg-s', 'start'), TX(20, 230, 'kernel threads', 'dg-s', 'start'));
  ux.forEach((x) => k.push(squiggle(x, 36, 54)));
  kx.forEach((x) => k.push(C(x, 162, 18, 'K', { cls: 'dg-fill2', tcls: 'dg-t2' }), squiggle(x, 182, 30)));
  const links = model === 'm2o' ? ux.map((x) => [x, 180]) : model === 'o2o' ? ux.map((x) => [x, x]) : model === 'm2m' ? [[60, 100], [60, 180], [140, 100], [140, 260], [220, 180], [220, 260], [300, 180], [300, 260]] : [[60, 90], [140, 90], [140, 180], [220, 90], [220, 180], [300, 300]];
  links.forEach(([a, b]) => k.push(L([[a, 92], [b, 144]], { cls: model === 'two' && a === 300 ? 'dg-acc' : 'dg-thin' })));
  if (model === 'two') k.push(TX(330, 128, 'bound', 'dg-s dg-acct', 'start'));
  return D.svg(380, 240, { m2o: 'Many-to-one model', o2o: 'One-to-one model', m2m: 'Many-to-many model', two: 'Two-level model' }[model], k, { scale: 1 });
}
FIGS['m2o'] = () => threadMap('m2o');
FIGS['o2o'] = () => threadMap('o2o');
FIGS['m2m'] = () => threadMap('m2m');
FIGS['two-level-model'] = () => threadMap('two');

FIGS['user-kernel-threads'] = () => {
  const k = [R(10, 10, 500, 100, null, { cls: 'dg-fill1', rx: 8 }), TX(24, 26, 'user space', 'dg-t2 dg-acct', 'start'), TX(380, 70, 'user threads', 'dg-s', 'start'),
    R(10, 130, 500, 100, null, { cls: 'dg-fill2', rx: 8 }), TX(24, 146, 'kernel space', 'dg-t2 dg-acct', 'start'), TX(380, 190, 'kernel threads', 'dg-s', 'start')];
  [80, 160, 240, 320].forEach((x) => k.push(squiggle(x, 40, 54)));
  [120, 220, 320].forEach((x) => k.push(squiggle(x, 160, 54)));
  return D.svg(520, 240, 'User threads and kernel threads', k, { scale: 1 });
};

FIGS['fork-join'] = () => {
  const k = [R(10, 70, 90, 40, 'main\nthread', { cls: 'dg-fill1', tcls: 'dg-t2' }), C(150, 90, 22, 'fork', { cls: 'dg-fill2', tcls: 'dg-s' }), arrow([[100, 90], [128, 90]])];
  [20, 70, 120, 160].forEach((y, i) => { k.push(arrow([[172, 90], [240, y + 12]], { cls: 'dg-thin', packet: true, pcls: 'ac', dur: 1.6 }), R(240, y, 140, 26, 'task ' + (i + 1), { cls: 'dg-fill3', tcls: 'dg-s' }), arrow([[380, y + 13], [456, 90]], { cls: 'dg-thin', packet: true, pcls: 'ok', dur: 1.6, delay: 0.8 })); });
  k.push(C(478, 90, 22, 'join', { cls: 'dg-fill2', tcls: 'dg-s' }), arrow([[500, 90], [540, 90]]), R(540, 70, 90, 40, 'main\nthread', { cls: 'dg-fill1', tcls: 'dg-t2' }));
  return D.svg(640, 196, 'Fork-join parallelism: tasks are forked and then joined', k);
};

FIGS['fork-join-tree'] = () => {
  const k = [];
  const node = (x, y, lab, leaf) => R(x - 46, y - 16, 92, 32, lab, { cls: leaf ? 'dg-fill1' : 'dg-fill3', tcls: 'dg-m' });
  const lv = [[[330, 30, '0 … 999']], [[170, 110, '0 … 499'], [490, 110, '500 … 999']], [[90, 190, '0 … 249'], [250, 190, '250 … 499'], [410, 190, '500 … 749'], [570, 190, '750 … 999']]];
  for (let d = 1; d < lv.length; d++) lv[d].forEach(([x, y], i) => { const p = lv[d - 1][i >> 1]; k.push(L([[p[0], p[1] + 16], [x, y - 16]], { end: 'arrow', cls: 'dg-thin', label: 'fork', dx: i % 2 ? 18 : -18 })); });
  lv.forEach((row, d) => row.forEach(([x, y, t]) => k.push(node(x, y, t, d === 2))));
  k.push(TX(330, 240, 'leaves are small enough: sum directly; results are joined back up the tree', 'dg-s'));
  return D.svg(660, 254, 'Fork-join: summing an array by recursively splitting the problem', k);
};

FIGS['win-thread-ds'] = () => {
  const k = [R(10, 10, 620, 250, null, { cls: 'dg-fill2', rx: 8 }), TX(24, 28, 'kernel space', 'dg-t2 dg-acct', 'start'), R(10, 280, 620, 120, null, { cls: 'dg-fill1', rx: 8 }), TX(24, 298, 'user space', 'dg-t2 dg-acct', 'start')];
  k.push(R(40, 50, 200, 190, null, { cls: 'dg-box' }), TX(140, 66, 'ETHREAD', 'dg-t'), TX(140, 98, 'thread start\naddress', 'dg-s'), TX(140, 140, 'pointer to\nparent process', 'dg-s'), TX(140, 176, '• • •', 'dg-s'));
  k.push(R(310, 50, 200, 190, null, { cls: 'dg-box' }), TX(410, 66, 'KTHREAD', 'dg-t'), TX(410, 98, 'scheduling and\nsynchronization\ninformation', 'dg-s'), TX(410, 150, 'kernel stack', 'dg-s'), TX(410, 176, '• • •', 'dg-s'));
  k.push(R(310, 312, 200, 80, null, { cls: 'dg-box' }), TX(410, 326, 'TEB', 'dg-t'), TX(410, 352, 'thread identifier · user stack', 'dg-s'), TX(410, 372, 'thread-local storage · • • •', 'dg-s'));
  k.push(arrow([[240, 210], [310, 210]], { cls: 'dg-acc' }), arrow([[410, 240], [410, 312]], { cls: 'dg-acc' }));
  return D.svg(640, 410, 'Data structures of a Windows thread: ETHREAD, KTHREAD and TEB', k);
};

/* ================= Chapter 5: CPU Scheduling ================= */
FIGS['burst-cycle'] = () => {
  const k = [], rows = [['load store\nadd store\nread from file', 'CPU burst'], ['wait for I/O', 'I/O burst'], ['store increment\nindex\nwrite to file', 'CPU burst'], ['wait for I/O', 'I/O burst'], ['load store\nadd store\nread from file', 'CPU burst'], ['wait for I/O', 'I/O burst']];
  let y = 22; k.push(TX(130, 10, '⋮', 'dg-t'));
  rows.forEach(([a, b]) => {
    const cpu = b === 'CPU burst', hh = cpu ? 62 : 36;
    k.push(R(30, y, 200, hh, a, { cls: cpu ? 'dg-fill1' : 'dg-fill2', tcls: 'dg-s', rx: 0 }), TX(250, y + hh / 2, b, 'dg-t2 ' + (cpu ? '' : 'dg-acct'), 'start'));
    y += hh;
  });
  k.push(TX(130, y + 14, '⋮', 'dg-t'));
  return D.svg(360, y + 26, 'Alternating sequence of CPU and I/O bursts', k, { scale: 0.95 });
};

FIGS['burst-hist'] = () => {
  const k = [], x0 = 70, y0 = 240, w = 440, hh = 200;
  k.push(L([[x0, y0], [x0 + w, y0]], { end: 'arrow' }), L([[x0, y0], [x0, y0 - hh]], { end: 'arrow' }));
  k.push(TX(x0 + w / 2, y0 + 36, 'burst duration (milliseconds)', 'dg-t2'), sv('text', { class: 'dg-tx dg-t2', transform: `translate(24 ${y0 - hh / 2}) rotate(-90)`, 'text-anchor': 'middle' }, 'frequency'));
  const pts = []; for (let t = 0; t <= 40; t++) { const v = t < 3 ? 40 + t * 45 : 180 * Math.exp(-(t - 3) / 5.5); pts.push([x0 + t * 10, y0 - v]); }
  k.push(sv('path', { d: 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L'), class: 'dg-ln dg-acc' }));
  [0, 8, 16, 24, 32, 40].forEach((t) => k.push(TX(x0 + t * 10, y0 + 14, String(t), 'dg-m')));
  k.push(TX(200, 60, 'many short bursts', 'dg-s', 'start'), TX(330, 200, 'few long bursts', 'dg-s', 'start'));
  return D.svg(540, 290, 'Histogram of CPU-burst durations', k, { scale: 1 });
};

FIGS['quantum-cs'] = () => {
  const k = [TX(10, 14, 'process time = 10', 'dg-t2', 'start'), TX(560, 14, 'quantum', 'dg-t2'), TX(650, 14, 'context switches', 'dg-t2')];
  const row = (y, q, n) => {
    const seg = []; for (let t = 0; t < 10; t += q) seg.push([t, Math.min(10, t + q)]);
    seg.forEach(([a, b], i) => k.push(R(30 + a * 46, y, (b - a) * 46, 30, '', { rx: 0, cls: i % 2 ? 'dg-fill2' : 'dg-fill1' })));
    for (let t = 0; t <= 10; t++) if (q > 1 || t % 1 === 0) k.push(TX(30 + t * 46, y + 44, String(t), 'dg-m'));
    k.push(TX(560, y + 15, String(q), 'dg-m dg-b'), TX(650, y + 15, String(n), 'dg-m dg-b'));
  };
  row(30, 12, 0); row(100, 6, 1); row(170, 1, 9);
  return D.svg(700, 230, 'A smaller time quantum increases context switches', k);
};

FIGS['mlq'] = () => {
  const k = [];
  for (let i = 0; i < 4; i++) {
    const y = 20 + i * 70, lab = i === 3 ? 'priority = n' : 'priority = ' + i;
    k.push(TX(20, y + 18, lab, 'dg-t2', 'start'));
    const ts = i === 3 ? ['Tx', 'Ty', 'Tz'] : [['T0', 'T1', 'T2', 'T3', 'T4'], ['T5', 'T6', 'T7'], ['T8', 'T9', 'T10', 'T11']][i];
    ts.forEach((t, j) => k.push(R(150 + j * 56, y, 50, 36, t, { cls: 'dg-fill1', tcls: 'dg-m' })));
    if (i === 2) k.push(TX(270, y + 54, '⋮', 'dg-t'));
  }
  return D.svg(450, 300, 'Separate queues for each priority', k, { scale: 1 });
};

FIGS['mlq-type'] = () => {
  const k = [TX(80, 14, 'highest priority', 'dg-s'), TX(80, 300, 'lowest priority', 'dg-s'), L([[80, 26], [80, 286]], { start: 'arrow', cls: 'dg-thin' })];
  ['real-time processes', 'system processes', 'interactive processes', 'batch processes'].forEach((t, i) => {
    k.push(R(160, 30 + i * 66, 260, 46, t, { cls: ['dg-fill2', 'dg-fill1', 'dg-fill1', 'dg-fill3'][i], tcls: 'dg-t2' }));
    k.push(arrow([[420, 53 + i * 66], [470, 53 + i * 66]], { cls: 'dg-thin' }));
  });
  k.push(R(470, 120, 70, 60, 'CPU', { cls: 'dg-fill2' }));
  return D.svg(560, 310, 'Multilevel queue scheduling: prioritization based on process type', k);
};

FIGS['mlfq'] = () => {
  const k = [];
  [['quantum = 8', 'Q0'], ['quantum = 16', 'Q1'], ['FCFS', 'Q2']].forEach(([t, q], i) => {
    const y = 20 + i * 70;
    k.push(TX(20, y + 18, q, 'dg-t dg-acct', 'start'), R(60, y, 280, 36, t, { cls: ['dg-fill1', 'dg-fill1', 'dg-fill3'][i], tcls: 'dg-t2' }), arrow([[340, y + 18], [400, y + 18]], { cls: 'dg-thin' }));
    if (i < 2) k.push(arrow([[370, y + 18], [370, y + 50], [200, y + 50], [200, y + 70]], { cls: 'dg-acc', label: 'not finished', at: 0.45, dy: -10 }));
  });
  k.push(R(400, 40, 70, 140, 'CPU', { cls: 'dg-fill2' }));
  return D.svg(490, 230, 'Multilevel feedback queues', k, { scale: 1.05 });
};

FIGS['sim-eval'] = () => {
  const k = [R(10, 60, 150, 140, 'actual\nprocess\nexecution', { cls: 'dg-fill1', tcls: 'dg-t2' }), arrow([[160, 130], [210, 130]])];
  k.push(R(210, 30, 110, 200, null, { cls: 'dg-fill3' }), TX(265, 46, 'trace tape', 'dg-t2'));
  ['CPU 10', 'I/O 213', 'CPU 12', 'I/O 112', 'CPU 2', 'I/O 147', 'CPU 173', '• • •'].forEach((t, i) => k.push(TX(265, 72 + i * 20, t, 'dg-m')));
  [['FCFS', 40], ['SJF', 115], ['RR (q = 14)', 190]].forEach(([a, y]) => {
    k.push(arrow([[320, 130], [380, y]], { cls: 'dg-thin' }), R(380, y - 22, 150, 44, 'simulation\n' + a, { cls: 'dg-fill2', tcls: 'dg-s' }), arrow([[530, y], [570, y]], { cls: 'dg-thin' }), R(570, y - 22, 150, 44, 'performance\nstatistics for ' + a.split(' ')[0], { cls: 'dg-fill1', tcls: 'dg-s' }));
  });
  return D.svg(730, 240, 'Evaluation of CPU schedulers by simulation', k);
};

/* ================= Chapter 6: Synchronization Tools ================= */
FIGS['monitor'] = () => {
  const k = [TX(60, 20, 'entry queue', 'dg-s')];
  for (let i = 0; i < 4; i++) k.push(C(30 + i * 30, 48, 12, null, { cls: 'dg-fill2' }));
  k.push(arrow([[150, 48], [200, 60]], { cls: 'dg-thin' }));
  k.push(R(200, 30, 300, 330, null, { cls: 'dg-fill3', rx: 30 }), R(240, 60, 220, 60, 'shared data', { cls: 'dg-fill1' }));
  k.push(R(240, 150, 220, 130, null), TX(350, 166, 'operations', 'dg-t2'));
  for (let i = 0; i < 3; i++) k.push(R(260, 180 + i * 30, 180, 24, 'procedure P' + (i + 1), { cls: 'dg-fill1', tcls: 'dg-m' }));
  k.push(R(240, 296, 220, 40, 'initialization\ncode', { cls: 'dg-fill2', tcls: 'dg-s' }), L([[350, 120], [350, 150]], { cls: 'dg-thin', dash: true }));
  return D.svg(520, 370, 'Schematic view of a monitor', k, { scale: 1.05 });
};

FIGS['monitor-cv'] = () => {
  const k = [TX(80, 20, 'entry queue', 'dg-s')];
  for (let i = 0; i < 4; i++) k.push(C(40 + i * 30, 48, 12, null, { cls: 'dg-fill2' }));
  k.push(arrow([[160, 48], [240, 60]], { cls: 'dg-thin' }));
  k.push(R(240, 30, 300, 340, null, { cls: 'dg-fill3', rx: 30 }), R(280, 60, 220, 60, 'shared data', { cls: 'dg-fill1' }));
  k.push(TX(30, 150, 'queues associated with\nx, y conditions', 'dg-s', 'start'));
  [['x', 190], ['y', 240]].forEach(([n, y]) => { k.push(TX(20, y, n, 'dg-t dg-acct', 'start')); for (let i = 0; i < 3; i++) k.push(C(60 + i * 30, y, 12, null, { cls: 'dg-fill1' })); k.push(L([[150, y], [240, y]], { cls: 'dg-thin' })); });
  k.push(R(280, 160, 220, 110, null), TX(390, 176, 'operations', 'dg-t2'));
  for (let i = 0; i < 2; i++) k.push(R(300, 194 + i * 32, 180, 26, 'procedure P' + (i + 1), { cls: 'dg-fill1', tcls: 'dg-m' }));
  k.push(R(280, 290, 220, 40, 'initialization code', { cls: 'dg-fill2', tcls: 'dg-s' }));
  return D.svg(560, 380, 'Monitor with condition variables x and y', k, { scale: 1.05 });
};

/* ================= Chapter 8: Deadlocks ================= */
/* resource-allocation graph. spec: {P:{id:[x,y]}, R:{id:[x,y,n]}, req:[[p,r]], asg:[[r,p,instance]], claim:[[p,r]], hl:[ids], w, h} */
function ragSvg(spec, label) {
  const k = [], hl = new Set(spec.hl || []), RW = 60, RH = 44;
  const P = spec.P, Rs = spec.R;
  const dot = (r, i) => { const [x, y, n] = Rs[r]; const cols = Math.min(n, 3); return [x - (cols - 1) * 8 + (i % 3) * 16, y + (n > 3 ? (Math.floor(i / 3) ? 8 : -8) : 0)]; };
  const toRect = (r, from) => { const [x, y] = Rs[r]; const dx = from[0] - x, dy = from[1] - y; const s = Math.min(RW / 2 / Math.abs(dx || 1e-6), RH / 2 / Math.abs(dy || 1e-6)); return [x + dx * s, y + dy * s]; };
  const toCirc = (p, from) => D.edge(P[p][0], P[p][1], 24, from[0], from[1]);
  (spec.req || []).forEach(([p, r]) => { const a = toCirc(p, Rs[r]), b = toRect(r, P[p]); k.push(L([a, b], { end: 'arrow', cls: hl.has(p + r) ? 'dg-acc' : '' })); });
  (spec.claim || []).forEach(([p, r]) => { const a = toCirc(p, Rs[r]), b = toRect(r, P[p]); k.push(L([a, b], { end: 'arrow', dash: true, cls: 'dg-thin' })); });
  (spec.asg || []).forEach(([r, p, i]) => { const a = dot(r, i || 0), b = toCirc(p, a); k.push(L([a, b], { end: 'arrow', cls: hl.has(r + p) ? 'dg-acc' : '' })); });
  Object.keys(Rs).forEach((r) => {
    const [x, y, n] = Rs[r];
    k.push(R(x - RW / 2, y - RH / 2, RW, RH, null, { cls: 'dg-fill3', rx: 2 }), TX(x, y - RH / 2 - 10, r, 'dg-t2'));
    for (let i = 0; i < n; i++) { const [dx, dy] = dot(r, i); k.push(sv('circle', { cx: dx, cy: dy, r: 4, class: 'dg-solid' })); }
  });
  Object.keys(P).forEach((p) => k.push(C(P[p][0], P[p][1], 24, p, { cls: hl.has(p) ? 'dg-fill2' : 'dg-fill1', tcls: 'dg-t2' })));
  return D.svg(spec.w || 420, spec.h || 360, label, k, { scale: 1 });
}
const RAG = {
  example: { w: 440, h: 340, P: { T1: [80, 170], T2: [220, 170], T3: [360, 170] }, R: { R1: [150, 50, 1], R3: [290, 50, 1], R2: [150, 290, 2], R4: [290, 290, 3] },
    req: [['T1', 'R1'], ['T2', 'R3']], asg: [['R1', 'T2', 0], ['R2', 'T1', 0], ['R2', 'T2', 1], ['R3', 'T3', 0]] },
  deadlock: { w: 440, h: 340, P: { T1: [80, 170], T2: [220, 170], T3: [360, 170] }, R: { R1: [150, 50, 1], R3: [290, 50, 1], R2: [150, 290, 2], R4: [290, 290, 3] },
    req: [['T1', 'R1'], ['T2', 'R3'], ['T3', 'R2']], asg: [['R1', 'T2', 0], ['R2', 'T1', 0], ['R2', 'T2', 1], ['R3', 'T3', 0]] },
  cycle: { w: 420, h: 340, P: { T1: [70, 170], T2: [210, 50], T3: [350, 170], T4: [210, 290] }, R: { R1: [210, 140, 2], R2: [210, 220, 2] },
    req: [['T1', 'R1'], ['T3', 'R2']], asg: [['R1', 'T2', 0], ['R1', 'T3', 1], ['R2', 'T1', 0], ['R2', 'T4', 1]] },
  avoid: { w: 360, h: 300, P: { T1: [80, 150], T2: [280, 150] }, R: { R1: [180, 50, 1], R2: [180, 250, 1] }, req: [['T2', 'R1']], asg: [['R1', 'T1', 0]], claim: [['T1', 'R2'], ['T2', 'R2']] },
  unsafe: { w: 360, h: 300, P: { T1: [80, 150], T2: [280, 150] }, R: { R1: [180, 50, 1], R2: [180, 250, 1] }, req: [['T2', 'R1']], asg: [['R1', 'T1', 0], ['R2', 'T2', 0]], claim: [['T1', 'R2']] }
};
FIGS['rag-example'] = () => ragSvg(RAG.example, 'Resource-allocation graph example');
FIGS['rag-deadlock'] = () => ragSvg(Object.assign({ hl: ['T1R1', 'R1T2', 'T2R3', 'R3T3', 'T3R2', 'R2T1', 'R2T2'] }, RAG.deadlock), 'Resource-allocation graph with a deadlock');
FIGS['rag-cycle'] = () => ragSvg(Object.assign({ hl: ['T1R1', 'R1T3', 'T3R2', 'R2T1'] }, RAG.cycle), 'Graph with a cycle but no deadlock');
FIGS['rag-avoid'] = () => ragSvg(RAG.avoid, 'Resource-allocation graph for deadlock avoidance, with claim edges dashed');
FIGS['rag-unsafe'] = () => ragSvg(RAG.unsafe, 'An unsafe state in a resource-allocation graph');

FIGS['safe-unsafe'] = () => {
  const k = [E(260, 160, 240, 140, null, { cls: 'dg-fill1' }), E(330, 180, 150, 100, null, { cls: 'dg-fill2' }), E(370, 200, 70, 50, 'deadlock', { cls: 'dg-fill3', tcls: 'dg-t' }),
    TX(140, 160, 'safe', 'dg-t'), TX(260, 150, 'unsafe', 'dg-t')];
  return D.svg(520, 320, 'Safe, unsafe and deadlocked state spaces', k, { scale: 1 });
};

FIGS['rag-waitfor'] = () => {
  const k = [TX(170, 14, '(a) resource-allocation graph', 'dg-t'), TX(540, 14, '(b) corresponding wait-for graph', 'dg-t')];
  const P = { P1: [60, 120], P2: [180, 120], P3: [300, 120], P4: [180, 300], P5: [300, 300] };
  const Rr = { R1: [120, 50], R2: [240, 50], R3: [60, 210], R4: [180, 210], R5: [300, 210] };
  const edges = [['P1', 'R1', 'r'], ['R1', 'P2', 'a'], ['P2', 'R2', 'r'], ['R2', 'P3', 'a'], ['P3', 'R5', 'r'], ['R5', 'P5', 'a'], ['P2', 'R4', 'r'], ['R4', 'P4', 'a'], ['P4', 'R3', 'r'], ['R3', 'P1', 'a'], ['P2', 'R5', 'r']];
  const pos = (id) => P[id] || Rr[id];
  edges.forEach(([a, b]) => { const A = pos(a), B = pos(b); const u = D.unit(A, B); const off = (id) => (P[id] ? 22 : 20); k.push(L([[A[0] + u[0] * off(a), A[1] + u[1] * off(a)], [B[0] - u[0] * off(b), B[1] - u[1] * off(b)]], { end: 'arrow', cls: 'dg-thin' })); });
  Object.keys(Rr).forEach((r) => k.push(R(Rr[r][0] - 20, Rr[r][1] - 18, 40, 36, r, { cls: 'dg-fill3', tcls: 'dg-s', rx: 2 })));
  Object.keys(P).forEach((p) => k.push(C(P[p][0], P[p][1], 22, p, { cls: 'dg-fill1', tcls: 'dg-t2' })));
  const W = { P1: [440, 120], P2: [560, 120], P3: [680, 120], P4: [500, 270], P5: [640, 270] };
  const we = [['P1', 'P2'], ['P2', 'P3'], ['P3', 'P5'], ['P2', 'P4'], ['P4', 'P1'], ['P2', 'P5']];
  we.forEach(([a, b]) => { const A = W[a], B = W[b], u = D.unit(A, B); const cyc = ['P1P2', 'P2P4', 'P4P1'].includes(a + b); k.push(L([[A[0] + u[0] * 22, A[1] + u[1] * 22], [B[0] - u[0] * 22, B[1] - u[1] * 22]], { end: 'arrow', cls: cyc ? 'dg-acc' : '' })); });
  Object.keys(W).forEach((p) => k.push(C(W[p][0], W[p][1], 22, p, { cls: 'dg-fill1', tcls: 'dg-t2' })));
  k.push(TX(560, 330, 'cycle P1 → P2 → P4 → P1: deadlock', 'dg-s dg-acct'));
  return D.svg(720, 344, 'A resource-allocation graph and its wait-for graph', k);
};
