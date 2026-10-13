/* ===================== demos-anim.js : animated data-flow walkthroughs and live simulations ===================== */
/* DEMOS['flow'] draws ANIM[name]: boxes, the path data takes between them, and one step at a time a packet
   travelling along the current edge while a panel explains the step and shows changing values. */
const ANIM = {};

function flowSvg(spec, step, visited) {
  const N = spec.nodes, k = [];
  const box = (id) => { const n = N[id]; return { x: n.x, y: n.y, w: n.w || 140, h: n.h || 50 }; };
  const centre = (b) => [b.x + b.w / 2, b.y + b.h / 2];
  const clip = (b, t) => { const c = centre(b), dx = t[0] - c[0], dy = t[1] - c[1]; if (!dx && !dy) return c; const s = Math.min(b.w / 2 / Math.abs(dx || 1e-9), b.h / 2 / Math.abs(dy || 1e-9)); return [c[0] + dx * s, c[1] + dy * s]; };
  const path = (a, b, via) => {
    const A = box(a), B = box(b);
    if (via && via.length) return [clip(A, via[0]), ...via, clip(B, via[via.length - 1])];
    return [clip(A, centre(B)), clip(B, centre(A))];
  };
  (spec.lanes || []).forEach((l) => k.push(R(4, l.y, spec.w - 8, l.h, null, { cls: l.cls || 'dg-fill3', rx: 10 }), TX(16, l.y + 16, l.label, 'dg-t2 dg-acct', 'start')));
  (spec.edges || []).forEach(([a, b, o]) => k.push(L(path(a, b, o && o.via), { end: 'arrow', cls: 'dg-thin', label: o && o.label, dy: o && o.dy, dx: o && o.dx })));
  const viaFor = (a, b) => { const e = (spec.edges || []).find((x) => (x[0] === a && x[1] === b) || (x[0] === b && x[1] === a)); if (!e || !e[2] || !e[2].via) return null; return e[0] === a ? e[2].via : e[2].via.slice().reverse(); };
  if (step.from) {
    const pts = path(step.from, step.at, step.via || viaFor(step.from, step.at));
    k.push(L(pts, { end: 'arrow', cls: 'dg-acc', packet: step.packets || 2, pcls: step.pcls || '', dur: step.dur || 1.6, label: step.edge, dy: -12 }));
  }
  Object.keys(N).forEach((id) => {
    const n = N[id], b = box(id), on = id === step.at || (step.also || []).includes(id), seen = visited.has(id);
    const g = R(b.x, b.y, b.w, b.h, n.label, { cls: on ? 'dg-fill2 dg-acc' : seen ? 'dg-fill1' : n.cls || '', tcls: n.tcls || 'dg-t2', rx: n.rx == null ? 8 : n.rx });
    k.push(g);
    const v = step.show && step.show[id];
    if (v != null) k.push(TX(b.x + b.w / 2, b.y + b.h + 14, v, 'dg-m dg-acct'));
  });
  return D.svg(spec.w, spec.h, spec.title, k, { scale: spec.scale || 1.2 });
}

DEMOS['flow'] = (root) => {
  const spec = ANIM[root.getAttribute('data-anim')];
  const pic = h('div', { class: 'fig-box os-flowpic' }), note = h('div', { class: 'out os-flownote' }), vars = h('div', { class: 'row os-vars' });
  let prev = {};
  const st = stepper(spec.steps.length, (i) => {
    const visited = new Set(); spec.steps.slice(0, i).forEach((s) => { visited.add(s.at); if (s.from) visited.add(s.from); });
    const s = spec.steps[i];
    clear(pic).append(flowSvg(spec, s, visited));
    const svg = pic.querySelector('svg'); try { svg.setCurrentTime(0); } catch (e) { /* older browsers */ }
    note.innerHTML = `<b>${i + 1}.</b> <span>${s.text}</span>`;
    clear(vars);
    const cur = Object.assign({}, ...spec.steps.slice(0, i + 1).map((x) => x.vars || {}));
    Object.keys(cur).forEach((key) => vars.append(h('div', { class: 'kv' + (prev[key] !== undefined && prev[key] !== cur[key] ? ' warn' : '') }, h('small', null, key), h('b', null, String(cur[key])))));
    prev = cur;
  }, { ms: spec.ms || 2600 });
  root.append(demoBox(spec.title, spec.sub, pic, note, vars, st.el));
  st.go(0);
};

/* ---------- Chapter 1 ---------- */
ANIM['boot'] = {
  title: 'Booting: from power-on to a running system', sub: 'Follow control from the firmware to the kernel. The highlighted arrow is what happens in this step.', w: 740, h: 300,
  nodes: { power: { x: 10, y: 30, w: 120, label: 'power on' }, rom: { x: 170, y: 30, w: 170, label: 'firmware in ROM\n(BIOS / UEFI)' }, loader: { x: 380, y: 30, w: 160, label: 'bootstrap loader\n(GRUB)' }, kernel: { x: 580, y: 30, w: 150, label: 'kernel starts' },
    disk: { x: 380, y: 150, w: 160, h: 60, label: 'disk\nboot block · kernel image' }, mem: { x: 580, y: 150, w: 150, h: 60, label: 'main memory' },
    daemons: { x: 580, y: 245, w: 150, h: 44, label: 'system daemons' }, ready: { x: 380, y: 245, w: 160, h: 44, label: 'running, waiting\nfor events' } },
  edges: [['power', 'rom'], ['rom', 'disk'], ['disk', 'loader'], ['loader', 'mem'], ['mem', 'kernel'], ['kernel', 'daemons'], ['daemons', 'ready']],
  steps: [
    { at: 'power', text: 'Power is switched on. The CPU starts executing at a fixed memory address.', vars: { 'running code': '—' } },
    { from: 'power', at: 'rom', text: 'That address is in ROM / EEPROM: the <b>firmware</b> (BIOS or UEFI) runs, tests the hardware and initializes it.', vars: { 'running code': 'firmware' } },
    { from: 'rom', at: 'disk', text: 'The firmware reads the <b>boot block</b> from a fixed place on the disk.', vars: { 'running code': 'firmware' } },
    { from: 'disk', at: 'loader', text: 'The boot block loads the <b>bootstrap loader</b> (e.g. GRUB), which can offer a choice of kernels.', vars: { 'running code': 'GRUB' } },
    { from: 'loader', at: 'mem', text: 'The loader copies the kernel image (vmlinuz) from the disk into <b>main memory</b>.', vars: { 'running code': 'GRUB' } },
    { from: 'mem', at: 'kernel', text: 'Control jumps to the <b>kernel</b>. It initializes memory management, devices and the scheduler.', vars: { 'running code': 'kernel' } },
    { from: 'kernel', at: 'daemons', text: 'The kernel starts the <b>system daemons</b>: services that run outside the kernel.', vars: { 'running code': 'kernel + daemons' } },
    { from: 'daemons', at: 'ready', text: 'The system is <b>running</b>. From now on the kernel only runs when an interrupt or a system call happens.', vars: { 'running code': 'user programs' } }]
};
ANIM['interrupt'] = {
  title: 'How the kernel handles an interrupt', sub: 'A key press interrupts a running user program. Watch the mode bit and the program counter.', w: 740, h: 290,
  nodes: { prog: { x: 10, y: 30, w: 190, h: 56, label: 'user program\nrunning' }, dev: { x: 10, y: 200, w: 190, h: 56, label: 'keyboard\n(device controller)' }, cpu: { x: 280, y: 115, w: 150, h: 60, label: 'CPU' },
    save: { x: 520, y: 20, w: 210, h: 50, label: 'save PC and registers' }, vec: { x: 520, y: 115, w: 210, h: 60, label: 'interrupt vector\n(handler addresses)' }, isr: { x: 520, y: 215, w: 210, h: 56, label: 'interrupt service routine\n(in the kernel)' } },
  edges: [['dev', 'cpu'], ['cpu', 'save'], ['cpu', 'vec'], ['vec', 'isr'], ['prog', 'cpu']],
  steps: [
    { at: 'prog', text: 'A user program is running in user mode.', vars: { 'mode bit': '1 (user)', PC: '0x4012' } },
    { from: 'dev', at: 'cpu', text: 'A key is pressed. The device controller raises an <b>interrupt</b> signal to the CPU.', vars: { 'mode bit': '1 (user)', PC: '0x4012' } },
    { from: 'cpu', at: 'save', text: 'The CPU finishes the current instruction, <b>saves</b> the PC and registers, and switches the mode bit to kernel.', vars: { 'mode bit': '0 (kernel)', 'saved PC': '0x4012' } },
    { from: 'cpu', at: 'vec', text: 'The interrupt number indexes the <b>interrupt vector</b>, which holds the address of the right handler.', vars: { PC: '0x8000 (handler)' } },
    { from: 'vec', at: 'isr', text: 'The <b>interrupt service routine</b> runs: it reads the key code from the controller into a kernel buffer.', vars: { PC: '0x8000 (handler)' } },
    { from: 'isr', at: 'save', text: 'The handler finishes. The saved state is restored …', vars: { 'mode bit': '0 (kernel)' } },
    { from: 'save', at: 'prog', via: [[440, 45], [220, 45]], text: '… the mode bit returns to user and the program continues at 0x4012, as if nothing had happened.', vars: { 'mode bit': '1 (user)', PC: '0x4012' } }]
};

/* ---------- Chapter 2 ---------- */
ANIM['syscall'] = {
  title: 'The journey of a system call: read()', sub: 'The program reads 100 bytes from a file. Follow the call from user mode into the kernel and back.', w: 740, h: 360,
  lanes: [{ y: 4, h: 150, label: 'user mode', cls: 'dg-fill1' }, { y: 166, h: 190, label: 'kernel mode', cls: 'dg-fill3' }],
  nodes: { app: { x: 24, y: 40, w: 200, h: 62, label: 'user program\nn = read(fd, buf, 100);', tcls: 'dg-m' }, lib: { x: 270, y: 40, w: 190, h: 62, label: 'C library (API)\nread() wrapper' }, buf: { x: 520, y: 40, w: 200, h: 62, label: 'buf[100]\nin user memory' },
    trap: { x: 270, y: 196, w: 190, h: 56, label: 'trap instruction\nsystem-call number i' }, table: { x: 24, y: 196, w: 200, h: 56, label: 'system-call table\nentry i → sys_read' },
    handler: { x: 270, y: 286, w: 190, h: 56, label: 'sys_read( )\nkernel handler' }, driver: { x: 520, y: 286, w: 200, h: 56, label: 'file system +\ndisk driver' } },
  edges: [['app', 'lib'], ['lib', 'trap'], ['trap', 'table'], ['table', 'handler', { via: [[124, 314]] }], ['handler', 'driver'], ['driver', 'buf'], ['handler', 'app', { via: [[365, 270], [124, 270]] }]],
  steps: [
    { at: 'app', text: 'The program calls <code>read()</code>. To the program this is an ordinary C function call.', vars: { 'mode bit': 'user', register: '—', n: '?' } },
    { from: 'app', at: 'lib', text: '<code>read()</code> is a library wrapper (the API). It puts the <b>system-call number</b> and the arguments (fd, buf, 100) in registers.', vars: { register: 'i, fd, buf, 100' } },
    { from: 'lib', at: 'trap', text: 'It executes the <b>trap</b> instruction: the hardware switches the mode bit to kernel and jumps to the kernel’s entry point.', vars: { 'mode bit': 'kernel' } },
    { from: 'trap', at: 'table', text: 'The <b>system-call interface</b> uses the number i to index its table.' },
    { from: 'table', at: 'handler', text: 'Entry i points to <code>sys_read</code>, which checks that fd is open and buf is in the caller’s memory.' },
    { from: 'handler', at: 'driver', text: 'The handler asks the file system and the disk driver for the data. The process may <b>wait</b> here while the disk works.' },
    { from: 'driver', at: 'buf', text: 'The kernel copies the 100 bytes into <code>buf</code> in the program’s own memory.', pcls: 'ok' },
    { from: 'handler', at: 'app', text: 'The handler returns 100. The mode bit goes back to user and <code>read()</code> returns <b>n = 100</b> to the program.', vars: { 'mode bit': 'user', n: '100' } }]
};

/* ---------- Chapter 3 ---------- */
ANIM['ctx'] = {
  title: 'A context switch, register by register', sub: 'The timer interrupts P0. The OS saves P0’s CPU state into PCB0 and loads P1’s from PCB1.', w: 740, h: 300,
  nodes: { cpu: { x: 270, y: 20, w: 200, h: 70, label: 'CPU\nPC · SP · registers' }, os: { x: 270, y: 150, w: 200, h: 56, label: 'OS scheduler\n(kernel mode)' },
    pcb0: { x: 20, y: 200, w: 200, h: 80, label: 'PCB0\n(P0’s saved state)' }, pcb1: { x: 520, y: 200, w: 200, h: 80, label: 'PCB1\n(P1’s saved state)' } },
  edges: [['cpu', 'os'], ['cpu', 'pcb0'], ['pcb1', 'cpu']],
  steps: [
    { at: 'cpu', text: '<b>P0 is running.</b> Its program counter and registers are in the CPU.', vars: { running: 'P0', 'CPU PC': '0x1000', 'PCB0 PC': '—', 'PCB1 PC': '0x2400', 'P0': 'running', 'P1': 'ready' } },
    { from: 'cpu', at: 'os', text: 'The <b>timer interrupt</b> fires. The CPU enters kernel mode and runs the scheduler.', vars: { running: 'OS', 'CPU PC': 'kernel' } },
    { from: 'cpu', at: 'pcb0', text: '<b>Save</b> P0: its PC (0x1004), stack pointer and registers are copied into PCB0. P0 becomes ready.', vars: { 'PCB0 PC': '0x1004', 'P0': 'ready' } },
    { from: 'pcb1', at: 'cpu', text: '<b>Load</b> P1: its saved PC and registers are copied from PCB1 into the CPU.', vars: { 'CPU PC': '0x2400' } },
    { at: 'cpu', text: '<b>P1 runs.</b> Steps 2–4 did no useful work for either process: context-switch time is pure overhead.', vars: { running: 'P1', 'P1': 'running' } },
    { from: 'cpu', at: 'pcb1', text: 'Later, another interrupt: P1’s state (PC 0x2410) is saved into PCB1 …', vars: { 'PCB1 PC': '0x2410', 'P1': 'ready', running: 'OS' } },
    { from: 'pcb0', at: 'cpu', via: [[120, 55]], text: '… and P0 is reloaded from PCB0. It continues at 0x1004, exactly where it stopped.', vars: { 'CPU PC': '0x1004', running: 'P0', 'P0': 'running' } }]
};
ANIM['ipc-shm'] = {
  title: 'Shared memory: data moves without the kernel', sub: 'After setting up, the producer and consumer use ordinary memory reads and writes.', w: 720, h: 250,
  nodes: { prod: { x: 10, y: 30, w: 170, h: 56, label: 'producer\nprocess' }, shm: { x: 270, y: 30, w: 180, h: 56, label: 'shared memory\nregion' }, cons: { x: 540, y: 30, w: 170, h: 56, label: 'consumer\nprocess' }, kernel: { x: 200, y: 180, w: 320, h: 50, label: 'kernel' } },
  edges: [['prod', 'kernel'], ['kernel', 'shm'], ['prod', 'shm'], ['shm', 'cons']],
  steps: [
    { from: 'prod', at: 'kernel', text: '<code>shm_open()</code>, <code>ftruncate()</code>, <code>mmap()</code>: system calls ask the kernel to create the region.', vars: { 'system calls': 3, 'region holds': '—' } },
    { from: 'kernel', at: 'shm', also: ['cons'], text: 'The kernel maps the <b>same physical pages</b> into both processes’ address spaces.', vars: {} },
    { from: 'prod', at: 'shm', text: 'The producer writes the message with an ordinary memory write: no system call, no copy through the kernel.', vars: { 'region holds': '"Hello"' } },
    { from: 'shm', at: 'cons', text: 'The consumer reads the same memory directly. Fast — but the two processes must synchronize themselves.', pcls: 'ok', vars: { 'consumer got': '"Hello"' } }]
};
ANIM['ipc-msg'] = {
  title: 'Message passing: the kernel carries the data', sub: 'Every message is copied into the kernel and out again.', w: 720, h: 250,
  nodes: { p: { x: 10, y: 30, w: 170, h: 56, label: 'process P\nsend(Q, m)' }, q: { x: 540, y: 30, w: 170, h: 56, label: 'process Q\nreceive(P, m)' }, queue: { x: 230, y: 170, w: 260, h: 56, label: 'message queue\nin the kernel' } },
  edges: [['p', 'queue'], ['queue', 'q']],
  steps: [
    { at: 'p', text: 'P calls <code>send(Q, m)</code>.', vars: { 'system calls': 0, copies: 0, 'queue length': 0 } },
    { from: 'p', at: 'queue', text: 'System call: the kernel <b>copies</b> m from P into a message queue in kernel memory.', vars: { 'system calls': 1, copies: 1, 'queue length': 1 } },
    { at: 'queue', text: 'The message waits in the queue (bounded buffering). With a full queue a blocking send would wait.', vars: {} },
    { from: 'queue', at: 'q', text: 'Q calls <code>receive(P, m)</code>: the kernel copies the message into Q’s memory.', pcls: 'ok', vars: { 'system calls': 2, copies: 2, 'queue length': 0 } },
    { at: 'q', text: 'Two system calls and two copies per message: easy to use and works across a network, but slower than shared memory for large data.', vars: {} }]
};

/* ---------- Chapter 9 ---------- */
ANIM['xlate'] = {
  title: 'Translating one address, step by step', sub: '4 KB pages. Logical address 0x1A3C is translated through the TLB and the page table.', w: 740, h: 330,
  nodes: { cpu: { x: 10, y: 30, w: 120, h: 56, label: 'CPU\n0x1A3C' }, split: { x: 170, y: 30, w: 150, h: 56, label: 'p = 1 | d = 0xA3C', tcls: 'dg-m' }, tlb: { x: 370, y: 30, w: 150, h: 56, label: 'TLB\n(cache of entries)' },
    pt: { x: 370, y: 160, w: 150, h: 56, label: 'page table\n(in memory)' }, phys: { x: 570, y: 30, w: 160, h: 56, label: 'f = 9 | d = 0xA3C', tcls: 'dg-m' }, mem: { x: 570, y: 160, w: 160, h: 140, label: 'physical\nmemory\nframe 9' } },
  edges: [['cpu', 'split'], ['split', 'tlb'], ['tlb', 'pt'], ['pt', 'phys', { via: [[545, 188], [545, 70]] }], ['tlb', 'phys'], ['phys', 'mem']],
  steps: [
    { at: 'cpu', text: 'The CPU issues logical address <b>0x1A3C</b>.', vars: { 'memory accesses': 0 } },
    { from: 'cpu', at: 'split', text: 'With 4 KB (2<sup>12</sup>) pages, the low 12 bits are the offset d = 0xA3C and the rest is the page number p = 1.' },
    { from: 'split', at: 'tlb', text: 'The TLB is searched for page 1 (all entries in parallel). This time it is a <b>miss</b>.', pcls: 'bad', vars: { TLB: 'miss' } },
    { from: 'tlb', at: 'pt', text: 'The page table in memory is read: entry 1 says <b>frame 9</b>. That costs one memory access.', vars: { 'memory accesses': 1 } },
    { from: 'pt', at: 'phys', text: 'The entry is copied into the TLB for next time, and the physical address is built: frame 9, same offset → <b>0x9A3C</b>.', vars: { TLB: 'page 1 → frame 9 loaded' } },
    { from: 'phys', at: 'mem', text: 'The data is read from physical address 0x9A3C: the second memory access. A TLB hit would have needed only this one.', pcls: 'ok', vars: { 'memory accesses': 2 } }]
};

/* ---------- Chapter 10 ---------- */
ANIM['pagefault'] = {
  title: 'Handling a page fault', sub: 'The instruction “load M” touches a page that is on the backing store, not in memory.', w: 740, h: 320,
  nodes: { instr: { x: 10, y: 30, w: 150, h: 56, label: 'CPU\nload M' }, pt: { x: 220, y: 30, w: 150, h: 56, label: 'page table\nM: i (invalid)' }, os: { x: 220, y: 200, w: 150, h: 56, label: 'operating\nsystem' },
    bs: { x: 440, y: 200, w: 140, h: 90, label: 'backing\nstore\n(page M)' }, mem: { x: 600, y: 20, w: 130, h: 150, label: 'physical\nmemory\n(free frame)' } },
  edges: [['instr', 'pt'], ['pt', 'os'], ['os', 'bs'], ['bs', 'mem'], ['mem', 'pt'], ['pt', 'instr']],
  steps: [
    { from: 'instr', at: 'pt', text: '① <b>Reference</b>: the instruction refers to page M. The page-table entry for M is marked invalid.', vars: { 'M is': 'on disk', 'page faults': 0 } },
    { from: 'pt', at: 'os', text: '② <b>Trap</b>: the invalid bit causes a page-fault trap to the operating system.', pcls: 'bad', vars: { 'page faults': 1 } },
    { from: 'os', at: 'bs', text: '③ The OS checks the reference is legal and finds that <b>page M is on the backing store</b>.' },
    { from: 'bs', at: 'mem', text: '④ It finds a <b>free frame</b> (or picks a victim with a replacement algorithm) and reads page M into it. The process waits for the disk.', vars: { 'M is': 'being read' } },
    { from: 'mem', at: 'pt', text: '⑤ <b>Reset the page table</b>: entry M now holds the frame number and the valid bit v.', vars: { 'M is': 'in memory' } },
    { from: 'pt', at: 'instr', text: '⑥ <b>Restart the instruction</b>. This time the reference succeeds, as if the page had always been there.', pcls: 'ok' }]
};

/* ================= live simulations ================= */

/* CPU scheduling, animated: ready queue, CPU, finished, and the Gantt chart growing with time */
DEMOS['sched-anim'] = (root) => {
  const presets = Object.keys(SCHED_PRESETS);
  const preset = selectEl(presets.map((k) => ({ v: k, l: k })), root.getAttribute('data-preset') || 'SRTF example', () => load());
  const algoSel = selectEl(Object.keys(SCHED).map((k) => ({ v: k, l: SCHED[k] })), 'srtf', () => load());
  const view = h('div'), ctl = h('div', { class: 'row os-ctl' });
  let procs, ids, r, T, t = 0, timer = null;
  function load() {
    const P = SCHED_PRESETS[preset.value];
    if (load.lastPreset !== preset.value) { algoSel.value = P.algo; load.lastPreset = preset.value; }
    procs = P.p.map((x) => ({ id: x[0], at: x[1], bt: x[2], pr: x[3] })); ids = procs.map((p) => p.id);
    r = schedule(procs, algoSel.value, P.q || 4); T = r.T; stop(); t = 0; draw();
  }
  const runningAt = (x) => { const s = r.segs.find((g) => g.s <= x && x < g.e); return s ? s.id : null; };
  function readyAt(x) {
    const a = algoSel.value, cur = runningAt(x);
    const live = procs.filter((p) => p.at <= x && r.res[p.id].ct > x && p.id !== cur);
    const done = (p) => r.segs.filter((g) => g.id === p.id && g.e <= x).reduce((s, g) => s + g.e - g.s, 0);
    const lastEnq = (p) => Math.max(p.at, ...r.segs.filter((g) => g.id === p.id && g.e <= x).map((g) => g.e));
    const key = { fcfs: (p) => p.at, sjf: (p) => p.bt, srtf: (p) => p.bt - done(p), prio: (p) => p.pr, pprio: (p) => p.pr, rr: lastEnq, prr: (p) => p.pr * 1e4 + lastEnq(p) }[a];
    return live.sort((p, q) => key(p) - key(q) || ids.indexOf(p.id) - ids.indexOf(q.id));
  }
  function draw() {
    const cur = runningAt(t), ready = t < T ? readyAt(t) : [], fin = procs.filter((p) => r.res[p.id].ct <= t), future = procs.filter((p) => p.at > t);
    const segs = r.segs.filter((g) => g.s < t).map((g) => Object.assign({}, g, { e: Math.min(g.e, t) }));
    const chipOf = (p, extra) => chip(p.id + (extra || ''), ids.indexOf(p.id));
    clear(view).append(
      h('div', { class: 'os-sa' },
        h('div', { class: 'os-sa-col' }, h('small', null, 'not arrived yet'), h('div', { class: 'os-q' }, future.length ? future.map((p) => h('span', { class: 'os-chip pcx' }, `${p.id} @${p.at}`)) : h('i', { class: 'muted small' }, 'none'))),
        h('div', { class: 'os-sa-col' }, h('small', null, 'ready queue  →'), h('div', { class: 'os-q os-rq' }, ready.length ? ready.map((p) => chipOf(p, ` (${p.bt - r.segs.filter((g) => g.id === p.id && g.e <= t).reduce((s, g) => s + g.e - g.s, 0)})`)) : h('i', { class: 'muted small' }, 'empty'))),
        h('div', { class: 'os-sa-cpu' + (cur ? ' busy' : '') }, h('small', null, 'CPU'), cur ? chip(cur, ids.indexOf(cur)) : h('i', { class: 'muted small' }, t >= T ? 'done' : 'idle')),
        h('div', { class: 'os-sa-col' }, h('small', null, 'finished'), h('div', { class: 'os-q' }, fin.length ? fin.map((p) => chipOf(p, ` ✓${r.res[p.id].ct}`)) : h('i', { class: 'muted small' }, 'none')))),
      h('div', { class: 'row' }, h('div', { class: 'kv' }, h('small', null, 'time'), h('b', null, `t = ${t}`)), h('span', { class: 'small muted' }, 'Numbers in brackets are the remaining burst. ✓ shows the completion time.')),
      segs.length ? ganttEl(segs, ids) : h('p', { class: 'small muted' }, 'The Gantt chart grows here as time passes.'),
      t >= T ? schedTable(r, ids, ['at', 'bt', 'ct', 'tat', 'wt']) : '');
  }
  function stop() { if (timer) clearInterval(timer); timer = null; play.textContent = '▶ Play'; }
  const play = btn('▶ Play', () => { if (timer) return stop(); if (t >= T) t = 0; play.textContent = '❚❚ Pause'; timer = setInterval(() => { t++; draw(); if (t >= T) stop(); }, 650); });
  ctl.append(play, btn('+1 time unit', () => { stop(); if (t < T) { t++; draw(); } }), btn('Reset', () => { stop(); t = 0; draw(); }));
  root.append(demoBox('Watch the scheduler run', 'Pick an example from the slides and an algorithm, then play time forward one unit at a time.', h('div', { class: 'row' }, field('example', preset), field('algorithm', algoSel)), view, ctl));
  load();
};

/* TLB simulator: a stream of addresses, a 4-entry TLB with LRU replacement, the path each access takes */
DEMOS['tlb-sim'] = (root) => {
  const PT = [5, 9, 2, 7, 1, 0, 3, 8];
  const seqIn = textInput('0x1A3C, 0x1F00, 0x2710, 0x0044, 0x1004, 0x7FFF, 0x2000, 0x3123, 0x4ABC, 0x1888, 0x0FFF, 0x5000', { style: { width: '100%' }, 'aria-label': 'logical addresses' });
  const pic = h('div', { class: 'fig-box os-tlbsim' }), tlbBox = h('div'), stats = h('div', { class: 'row' }), note = h('div', { class: 'out' });
  let seq, i, tlb, hits, miss, clock;
  const N = { cpu: { x: 10, y: 30, w: 130, h: 56, label: 'CPU' }, tlb: { x: 200, y: 30, w: 150, h: 56, label: 'TLB\n4 entries' }, pt: { x: 200, y: 170, w: 150, h: 56, label: 'page table\n(memory)' }, phys: { x: 410, y: 30, w: 160, h: 56, label: 'physical\naddress' }, mem: { x: 410, y: 160, w: 160, h: 70, label: 'memory' } };
  const spec = { w: 590, h: 260, title: 'TLB lookup path', scale: 1.6, nodes: N, edges: [['cpu', 'tlb'], ['tlb', 'pt'], ['pt', 'phys', { via: [[380, 198], [380, 72]] }], ['tlb', 'phys'], ['phys', 'mem']] };
  function reset() { seq = seqIn.value.split(/[^0-9a-fx]+/i).filter(Boolean).map((x) => parseInt(x, 16)).filter((x) => !isNaN(x)); i = 0; tlb = []; hits = 0; miss = 0; clock = 0; render(null); }
  function access() {
    if (i >= seq.length) return;
    const a = seq[i++], p = a >> 12, d = a & 0xfff;
    if (p >= PT.length) { note.innerHTML = `0x${a.toString(16).toUpperCase()}: page ${p} is outside the page table → trap.`; render({ at: 'tlb', from: 'cpu', pcls: 'bad' }); return; }
    const e = tlb.find((x) => x.p === p); clock++;
    let step;
    if (e) { hits++; e.t = clock; step = { from: 'tlb', at: 'phys', pcls: 'ok' }; note.innerHTML = `0x${a.toString(16).toUpperCase().padStart(4, '0')} → page <b>${p}</b>, offset 0x${d.toString(16).toUpperCase()}: <b>TLB hit</b> → frame ${e.f} → physical 0x${((e.f << 12) | d).toString(16).toUpperCase()} (1 memory access)`; }
    else {
      miss++; const f = PT[p];
      if (tlb.length >= 4) { const v = tlb.reduce((m, x) => (x.t < m.t ? x : m)); tlb.splice(tlb.indexOf(v), 1); note.dataset.evict = v.p; } else delete note.dataset.evict;
      tlb.push({ p, f, t: clock });
      step = { from: 'pt', at: 'phys', also: ['tlb'], pcls: 'bad' };
      note.innerHTML = `0x${a.toString(16).toUpperCase().padStart(4, '0')} → page <b>${p}</b>: <b>TLB miss</b> → page table says frame ${f} → loaded into the TLB${note.dataset.evict != null ? ` (evicting page ${note.dataset.evict}, the least recently used)` : ''} → physical 0x${((f << 12) | d).toString(16).toUpperCase()} (2 memory accesses)`;
    }
    render(step);
  }
  function render(step) {
    clear(pic).append(flowSvg(spec, step || { at: 'cpu' }, new Set()));
    try { pic.querySelector('svg').setCurrentTime(0); } catch (e) { /* ignore */ }
    clear(tlbBox).append(tableEl(['TLB page', 'frame', 'last used'], [0, 1, 2, 3].map((k) => (tlb[k] ? [String(tlb[k].p), String(tlb[k].f), String(tlb[k].t)] : ['—', '—', '—'])), 'tt'));
    const n = hits + miss, ratio = n ? hits / n : 0, eat = ratio * 100 + (1 - ratio) * 200;
    clear(stats).append(h('div', { class: 'kv ok' }, h('small', null, 'hits'), h('b', null, String(hits))), h('div', { class: 'kv warn' }, h('small', null, 'misses'), h('b', null, String(miss))),
      h('div', { class: 'kv' }, h('small', null, 'hit ratio'), h('b', null, n ? Math.round(ratio * 100) + '%' : '—')), h('div', { class: 'kv' }, h('small', null, 'EAT (100 ns memory)'), h('b', null, n ? eat.toFixed(0) + ' ns' : '—')),
      h('div', { class: 'kv' }, h('small', null, 'next'), h('b', null, i < seq.length ? '0x' + seq[i].toString(16).toUpperCase() : 'end')));
    if (!step) note.textContent = 'Press “Next address”. Page table: page 0→5, 1→9, 2→2, 3→7, 4→1, 5→0, 6→3, 7→8.';
  }
  let timer = null;
  const play = btn('▶ Play', () => { if (timer) { clearInterval(timer); timer = null; play.textContent = '▶ Play'; return; } play.textContent = '❚❚ Pause'; timer = setInterval(() => { if (i >= seq.length) { clearInterval(timer); timer = null; play.textContent = '▶ Play'; return; } access(); }, 1400); });
  seqIn.addEventListener('change', reset);
  root.append(demoBox('TLB simulator', 'Each address is split into page and offset. Repeated pages hit in the TLB; new pages miss and replace the least recently used entry.',
    h('label', { class: 'fld', style: { width: '100%' } }, 'logical addresses (hex)', seqIn), pic, h('div', { class: 'row os-tlbrow' }, tlbBox, stats), note, h('div', { class: 'row' }, btn('Next address', access, 'pri'), play, btn('Reset', reset))));
  reset();
};

/* bounded buffer with semaphores: step the producer and the consumer line by line */
DEMOS['pc-sem'] = (root) => {
  const P = ['wait(empty);', 'wait(mutex);', 'buffer[in] = item; in = (in+1) % N;', 'signal(mutex);', 'signal(full);'];
  const Cn = ['wait(full);', 'wait(mutex);', 'item = buffer[out]; out = (out+1) % N;', 'signal(mutex);', 'signal(empty);'];
  const NB = 3;
  let s;
  const view = h('div'), log = h('ol', { class: 'os-log' });
  function reset() { s = { empty: NB, full: 0, mutex: 1, buf: Array(NB).fill(null), inp: 0, outp: 0, pc: [0, 0], item: 1, blocked: [false, false] }; clear(log); draw(); }
  const say = (t) => { log.append(h('li', { html: t })); log.scrollTop = 1e6; };
  function step(w) {
    const k = s.pc[w], who = w ? 'Consumer' : 'Producer', line = (w ? Cn : P)[k];
    const sem = /wait\((\w+)\)/.exec(line), sig = /signal\((\w+)\)/.exec(line);
    if (sem) { if (s[sem[1]] <= 0) { s.blocked[w] = true; say(`${who}: <code>${line}</code> — ${sem[1]} is 0, so it <b>waits</b>.`); return draw(); } s[sem[1]]--; }
    if (sig) s[sig[1]]++;
    if (k === 2 && !w) { s.buf[s.inp] = s.item; say(`Producer puts item ${s.item} in slot ${s.inp}.`); s.item++; s.inp = (s.inp + 1) % NB; }
    else if (k === 2 && w) { say(`Consumer takes item ${s.buf[s.outp]} from slot ${s.outp}.`); s.buf[s.outp] = null; s.outp = (s.outp + 1) % NB; }
    else say(`${who}: <code>${line}</code>`);
    s.blocked[w] = false; s.pc[w] = (k + 1) % 5; draw();
  }
  function draw() {
    const pane = (w) => h('div', { class: 'os-pane' + (s.blocked[w] ? ' blocked' : '') }, h('div', { class: 'os-pane-h' }, (w ? 'Consumer' : 'Producer') + (s.blocked[w] ? ' · waiting' : '')),
      h('ol', { class: 'os-code' }, (w ? Cn : P).map((c, j) => h('li', { class: j === s.pc[w] ? 'cur' : '' }, h('code', null, c)))), btn(`Step ${w ? 'consumer' : 'producer'}`, () => step(w), 'pri'));
    clear(view).append(h('div', { class: 'cols' }, pane(0), pane(1)),
      h('div', { class: 'row' }, ['empty', 'full', 'mutex'].map((k) => h('div', { class: 'kv' + (s[k] === 0 ? ' warn' : '') }, h('small', null, k), h('b', null, String(s[k])))),
        h('div', { class: 'os-buf' }, s.buf.map((v, i) => h('div', { class: 'os-slot' + (v != null ? ' on' : '') }, h('span', null, v == null ? '' : String(v)), h('small', null, (i === s.inp ? 'in ' : '') + (i === s.outp ? 'out' : '')))))));
  }
  let timer = null;
  const auto = btn('▶ Random run', () => { if (timer) { clearInterval(timer); timer = null; auto.textContent = '▶ Random run'; return; } auto.textContent = '❚❚ Pause'; timer = setInterval(() => step(Math.random() < 0.55 ? 0 : 1), 700); });
  root.append(demoBox('Bounded buffer with semaphores', 'empty counts free slots, full counts items, mutex protects the buffer. Step either process, or let them run in a random order: the buffer never overflows or underflows.', view, h('div', { class: 'row' }, auto, btn('Reset', () => { if (timer) auto.click(); reset(); })), log));
  reset();
};

/* two threads, two mutexes: step them into a deadlock (or not, with lock ordering) */
DEMOS['deadlock-run'] = (root) => {
  const order = seg([{ v: 0, l: 'opposite order (as on the slide)' }, { v: 1, l: 'same order (fixed)' }], 0, () => reset());
  const code = (o) => [['lock(first_mutex);', 'lock(second_mutex);', '/* do some work */', 'unlock(second_mutex);', 'unlock(first_mutex);'],
    o ? ['lock(first_mutex);', 'lock(second_mutex);', '/* do some work */', 'unlock(second_mutex);', 'unlock(first_mutex);'] : ['lock(second_mutex);', 'lock(first_mutex);', '/* do some work */', 'unlock(first_mutex);', 'unlock(second_mutex);']];
  let s;
  const view = h('div'), verdict = h('div');
  function reset() { s = { pc: [0, 0], owner: { first: null, second: null }, wait: [null, null] }; draw(); }
  function step(t) {
    const C = code(order.get())[t], k = s.pc[t]; if (k >= C.length) return;
    const m = /(un)?lock\((\w+)_mutex\)/.exec(C[k]);
    if (m && !m[1]) { if (s.owner[m[2]] != null && s.owner[m[2]] !== t) { s.wait[t] = m[2]; return draw(); } s.owner[m[2]] = t; s.wait[t] = null; }
    if (m && m[1]) s.owner[m[2]] = null;
    s.pc[t]++; draw();
  }
  function draw() {
    const C = code(order.get());
    const dead = s.wait[0] && s.wait[1] && s.owner[s.wait[0]] === 1 && s.owner[s.wait[1]] === 0;
    const pane = (t) => h('div', { class: 'os-pane' + (s.wait[t] ? ' blocked' : '') + (s.pc[t] >= 5 ? ' incs' : '') },
      h('div', { class: 'os-pane-h' }, `thread_${t ? 'two' : 'one'}` + (s.wait[t] ? ` · waiting for ${s.wait[t]}_mutex` : s.pc[t] >= 5 ? ' · finished' : '')),
      h('ol', { class: 'os-code' }, C[t].map((c, j) => h('li', { class: j === s.pc[t] ? 'cur' : j < s.pc[t] ? 'done' : '' }, h('code', null, c)))), btn(`Step thread_${t ? 'two' : 'one'}`, () => step(t), 'pri'));
    /* resource-allocation graph of the moment */
    const spec = { w: 380, h: 220, P: { T1: [70, 110], T2: [310, 110] }, R: { first: [190, 40, 1], second: [190, 180, 1] }, req: [], asg: [], hl: [] };
    ['first', 'second'].forEach((m) => { if (s.owner[m] != null) spec.asg.push([m, s.owner[m] ? 'T2' : 'T1', 0]); });
    [0, 1].forEach((t) => { if (s.wait[t]) spec.req.push([t ? 'T2' : 'T1', s.wait[t]]); });
    if (dead) spec.hl = ['T1first', 'firstT1', 'T1second', 'secondT1', 'T2first', 'firstT2', 'T2second', 'secondT2', 'T1', 'T2'];
    clear(view).append(h('div', { class: 'cols' }, h('div', null, h('div', { class: 'cols' }, pane(0), pane(1))), h('div', { class: 'fig-box' }, ragSvg(spec, 'Who holds and who waits for each mutex'))));
    clear(verdict).append(dead ? h('div', { class: 'verdict bad' }, 'Deadlock: each thread holds one mutex and waits for the other. The cycle in the graph will never break.')
      : s.pc[0] >= 5 && s.pc[1] >= 5 ? h('div', { class: 'verdict ok' }, 'Both threads finished.') : h('p', { class: 'small muted' }, 'Arrows from a mutex to a thread: it holds it. From a thread to a mutex: it waits for it.'));
  }
  root.append(demoBox('Step two threads into a deadlock', 'Try: thread_one one step, thread_two one step, then one more step each. Then switch to the same lock order and try every interleaving.',
    h('div', { class: 'row' }, order.el, btn('Unlucky order', () => { reset(); [0, 1, 0, 1].forEach(step); }), btn('Reset', reset)), view, verdict));
  reset();
};

/* lang.js reads the step texts for translation */
window.ANIM = ANIM;
