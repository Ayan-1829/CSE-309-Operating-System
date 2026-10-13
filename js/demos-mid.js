/* ===================== demos-mid.js : interactive tools for chapters 1, 2, 3, 9, 10 ===================== */
/* Mounted by page.js on <div data-demo="id">. Shared helpers used by demos-final.js live here too. */
const DEMOS = {};
function demoBox(title, sub, ...kids) { return h('div', { class: 'demo' }, h('h3', null, title), sub ? h('p', { class: 'sub' }, sub) : null, ...kids); }
const btn = (label, onclick, cls) => h('button', { type: 'button', class: 'btn sm' + (cls ? ' ' + cls : ''), onclick }, label);
const pc = (i) => 'pc' + (i % 6);   /* process colour class */
function chip(label, i, extra) { return h('span', { class: 'os-chip ' + (i == null ? 'pcx' : pc(i)) + (extra ? ' ' + extra : '') }, label); }
function scoreGame(root, title, sub, items, choices) {
  let score = 0, done = 0;
  const head = h('div', { class: 'qhead' }), list = h('div', { class: 'game' });
  const paint = () => { clear(head).append(h('span', null, `${done} of ${items.length} answered`), h('span', null, `Score ${score}`)); };
  items.forEach((it) => {
    const why = h('div', { class: 'gwhy' });
    const btns = choices.map((c, ci) => h('button', { type: 'button', class: 'btn sm', onclick: () => {
      if (row.dataset.done) return; row.dataset.done = '1'; done++;
      const ok = c.v === it.a; if (ok) score++;
      btns.forEach((b, i) => { b.disabled = true; if (choices[i].v === it.a) b.classList.add('right'); else if (i === ci) b.classList.add('wrong'); });
      why.append(h('b', null, ok ? 'Correct. ' : 'Not quite: ' + choices.find((x) => x.v === it.a).l + '. '), it.w || '');
      paint();
    } }, c.l));
    const row = h('div', { class: 'grow' }, h('div', { class: 'gq' }, it.t), h('div', { class: 'row tight' }, btns), why);
    list.append(row);
  });
  paint();
  root.append(demoBox(title, sub, head, list, h('div', { class: 'row gap' }, btn('Start again', () => { clear(root); scoreGame(root, title, sub, items, choices); }))));
}
/* a step-through controller: render(i) draws step i of n */
function stepper(n, render, opts) {
  opts = opts || {};
  let i = 0, timer = null;
  const count = h('span', { class: 'os-count' });
  const prev = btn('◀ Back', () => go(i - 1)), next = btn('Next ▶', () => go(i + 1), 'pri'), reset = btn('Reset', () => { stop(); go(0); });
  const play = btn('▶ Play', () => { if (timer) stop(); else { if (i >= n - 1) go(0); play.textContent = '❚❚ Pause'; timer = setInterval(() => { if (i >= n - 1) stop(); else go(i + 1); }, opts.ms || 1300); } });
  function stop() { if (timer) clearInterval(timer); timer = null; play.textContent = '▶ Play'; }
  function go(k) { i = Math.max(0, Math.min(n - 1, k)); prev.disabled = i === 0; next.disabled = i === n - 1; count.textContent = `Step ${i + 1} of ${n}`; render(i); }
  const el = h('div', { class: 'row os-ctl' }, prev, next, play, reset, count);
  return { el, go, get: () => i, setN(m) { n = m; go(Math.min(i, n - 1)); } };
}

/* ================= Chapter 1 ================= */
DEMOS['dual-mode'] = (root) => {
  const steps = [
    { at: 'u0', bit: 1, t: 'A user program is running in <b>user mode</b>. The hardware mode bit is 1.' },
    { at: 'u1', bit: 1, t: 'It needs an OS service (for example reading a file), so it <b>calls a system call</b>. It is still in user mode.' },
    { at: 'trap', bit: 0, t: 'The system call executes a <b>trap</b> instruction. Hardware switches the mode bit to 0 and jumps into the kernel.' },
    { at: 'k', bit: 0, t: 'The kernel <b>executes the system call</b>. Privileged instructions are allowed now, because the mode bit is “kernel”.' },
    { at: 'ret', bit: 1, t: '<b>Return from the system call</b>: the mode bit is reset to 1 before control goes back to the user program.' },
    { at: 'u0', bit: 1, t: 'The user process continues in user mode with the result of the call.' }];
  const box = (id, t) => h('div', { class: 'os-step', 'data-id': id }, t);
  const user = h('div', { class: 'os-lane' }, h('div', { class: 'os-lane-h' }, 'user mode'), box('u0', 'user process executing'), box('u1', 'calls system call'), box('ret', 'return from system call'));
  const kern = h('div', { class: 'os-lane k' }, h('div', { class: 'os-lane-h' }, 'kernel mode'), box('trap', 'trap: mode bit = 0'), box('k', 'execute system call'), box('ret2', 'return: mode bit = 1'));
  const bit = h('div', { class: 'os-bit' }), msg = h('div', { class: 'out' });
  let priv = h('div');
  const st = stepper(steps.length, (i) => {
    const s = steps[i];
    root.querySelectorAll('.os-step').forEach((b) => b.classList.toggle('on', b.getAttribute('data-id') === s.at || (s.at === 'ret' && b.getAttribute('data-id') === 'ret2')));
    clear(bit).append(h('span', null, 'mode bit '), h('b', { class: s.bit ? '' : 'acc' }, String(s.bit)), h('span', null, s.bit ? ' = user' : ' = kernel'));
    msg.innerHTML = s.t; clear(priv);
  });
  const tryPriv = btn('Try a privileged instruction now', () => {
    const k = steps[st.get()].bit === 0;
    clear(priv).append(h('div', { class: 'verdict ' + (k ? 'ok' : 'bad') }, k ? 'Allowed: the CPU is in kernel mode, so the privileged instruction (e.g. setting the timer) runs.' : 'Blocked: the CPU is in user mode. The hardware does not execute it and traps to the OS, which treats it as an illegal instruction.'));
  });
  root.append(demoBox('Dual-mode operation', 'Step through a system call and watch the mode bit. At any step, try to run a privileged instruction.', h('div', { class: 'os-lanes' }, user, kern), h('div', { class: 'row' }, bit, tryPriv), msg, priv, st.el));
  st.go(0);
};

DEMOS['multiprog'] = (root) => {
  const JOBS = [{ n: 'A', b: [3, 4, 2, 3, 2] }, { n: 'B', b: [2, 3, 3, 2, 1] }, { n: 'C', b: [4, 2, 2] }];   /* CPU, I/O, CPU, ... */
  function run(multi) {
    const st = JOBS.map((j) => ({ k: 0, left: j.b[0], done: false })), cpu = [], rows = JOBS.map(() => []);
    let t = 0, cur = -1, next = 0;
    const onCpuPhase = (i) => !st[i].done && st[i].k % 2 === 0;
    const first = () => st.findIndex((s) => !s.done);
    while (st.some((s) => !s.done) && t < 200) {
      if (cur < 0 || !onCpuPhase(cur)) {
        cur = -1;
        if (multi) { for (let d = 0; d < JOBS.length; d++) { const i = (next + d) % JOBS.length; if (onCpuPhase(i)) { cur = i; break; } } }
        else if (first() >= 0 && onCpuPhase(first())) cur = first();
      }
      cpu.push(cur);
      JOBS.forEach((j, i) => {
        const s = st[i], loaded = multi || i === first();
        rows[i].push(s.done || !loaded ? '' : i === cur ? 'c' : s.k % 2 ? 'i' : 'w');
      });
      JOBS.forEach((j, i) => {
        const s = st[i];
        if (s.done || !(multi || i === first())) return;
        if (i === cur || s.k % 2) {
          if (--s.left === 0) {
            s.k++;
            if (s.k >= j.b.length) s.done = true; else s.left = j.b[s.k];
            if (i === cur) { next = (i + 1) % JOBS.length; cur = -1; }
          }
        }
      });
      t++;
    }
    return { cpu, rows, T: t };
  }
  const out = h('div'), mode = seg([{ v: 0, l: 'One job at a time' }, { v: 1, l: 'Multiprogramming' }], 1, draw);
  function draw() {
    const multi = mode.get(), r = run(multi), busy = r.cpu.filter((c) => c >= 0).length;
    const grid = h('div', { class: 'os-tl', style: { '--n': r.T } });
    const row = (lab, cells) => { grid.append(h('div', { class: 'os-tl-h' }, lab)); cells.forEach((c) => grid.append(c)); };
    row('CPU', r.cpu.map((c) => h('div', { class: 'os-cell ' + (c >= 0 ? pc(c) : 'idle') }, c >= 0 ? JOBS[c].n : '')));
    JOBS.forEach((j, i) => row('job ' + j.n, r.rows[i].map((c) => h('div', { class: 'os-cell ' + (c === 'c' ? pc(i) : c === 'i' ? 'io' : c === 'w' ? 'wait' : '') }, c === 'i' ? 'I/O' : ''))));
    row('', range(r.T).map((t) => h('div', { class: 'os-tick' }, t % 2 ? '' : String(t))));
    clear(out).append(h('div', { class: 'scrollx' }, grid), h('div', { class: 'row' },
      h('div', { class: 'kv' }, h('small', null, 'all jobs finish at'), h('b', null, r.T + ' units')),
      h('div', { class: 'kv' + (busy / r.T > 0.8 ? ' ok' : ' warn') }, h('small', null, 'CPU utilization'), h('b', null, Math.round(busy / r.T * 100) + '%')),
      h('p', { class: 'small muted', style: { margin: 0 } }, multi ? 'When the running job starts I/O, the OS switches the CPU to another job that is ready.' : 'While the only job in memory waits for I/O, the CPU sits idle (grey).')));
  }
  root.append(demoBox('Multiprogramming keeps the CPU busy', 'Three jobs alternate CPU bursts and I/O. Compare running them one at a time with keeping all three in memory.', h('div', { class: 'row' }, mode.el), out,
    h('div', { class: 'row small' }, chip('CPU burst', 0), h('span', { class: 'os-chip io' }, 'I/O'), h('span', { class: 'os-chip wait' }, 'ready, waiting for CPU'), h('span', { class: 'os-chip idle' }, 'CPU idle'))));
  draw();
};

/* ================= Chapter 2 ================= */
DEMOS['syscall-sort'] = (root) => scoreGame(root, 'Which type of system call?', 'Pick the category for each call, using the six types from the slides.', [
  { t: 'create process, terminate process', a: 'pc', w: 'Process control also covers end/abort, load/execute and wait for an event.' },
  { t: 'open( ), close( ) a file', a: 'fm', w: 'File management: create, delete, open, close, read, write, reposition.' },
  { t: 'request device, release device', a: 'dm', w: 'Device management. Devices are requested before use and released after.' },
  { t: 'get time or date, get system data', a: 'im', w: 'Information maintenance.' },
  { t: 'send, receive messages; create a communication connection', a: 'cm', w: 'Communications, in the message-passing model.' },
  { t: 'get and set permissions; allow or deny user access', a: 'pr', w: 'Protection controls access to resources.' },
  { t: 'allocate and free memory', a: 'pc', w: 'Listed under process control on the slide.' },
  { t: 'UNIX ioctl( )  —  Windows SetConsoleMode( )', a: 'dm', w: 'Both configure a device.' },
  { t: 'UNIX getpid( )  —  Windows GetCurrentProcessID( )', a: 'im', w: 'Asking the system for information about a process.' },
  { t: 'UNIX shm_open( ), mmap( )  —  Windows CreateFileMapping( )', a: 'cm', w: 'Shared-memory model of communication.' },
  { t: 'UNIX chmod( ), umask( ), chown( )', a: 'pr', w: 'They change who may access a file.' },
  { t: 'locks for managing access to shared data between processes', a: 'pc', w: 'Listed under process control on the slide.' }],
  [{ v: 'pc', l: 'Process control' }, { v: 'fm', l: 'File management' }, { v: 'dm', l: 'Device management' }, { v: 'im', l: 'Information maintenance' }, { v: 'cm', l: 'Communications' }, { v: 'pr', l: 'Protection' }]);

DEMOS['copy-file'] = (root) => {
  const opt = { missing: false, exists: false, blocks: 3 };
  let steps = [];
  function build() {
    steps = [['Acquire input file name', 'write prompt to screen', 1], ['', 'accept input', 1], ['Acquire output file name', 'write prompt to screen', 1], ['', 'accept input', 1], ['Open the input file', 'open(input)', 1]];
    if (opt.missing) { steps.push(['', 'file does not exist: abort', 1]); return; }
    steps.push(['Create output file', 'create(output)', 1]);
    if (opt.exists) { steps.push(['', 'file exists: abort', 1]); return; }
    for (let b = 1; b <= opt.blocks; b++) steps.push([b === 1 ? 'Loop' : '', `read block ${b} from input file`, 1], ['', `write block ${b} to output file`, 1]);
    steps.push(['', 'read fails: end of file, leave loop', 1], ['Close output file', 'close(output)', 1], ['', 'write completion message to screen', 1], ['', 'terminate normally', 1]);
  }
  const list = h('ol', { class: 'os-calls' }), files = h('div', { class: 'os-files' }), cnt = h('div', { class: 'kv' });
  const missing = tsw('input file missing', false, (v) => { opt.missing = !!v; reb(); }), exists = tsw('output file already exists', false, (v) => { opt.exists = !!v; reb(); });
  const blocks = selectEl([1, 2, 3, 5, 10].map((v) => ({ v, l: v + (v === 1 ? ' block' : ' blocks') })), 3, (v) => { opt.blocks = +v; reb(); });
  let st;
  function render(i) {
    clear(list);
    steps.forEach(([grp, call], k) => list.append(h('li', { class: k < i ? 'done' : k === i ? 'cur' : 'todo' }, grp ? h('b', null, grp + ': ') : null, call)));
    const copied = steps.slice(0, i + 1).filter((s) => /^write block/.test(s[1])).length;
    clear(files).append(h('div', { class: 'os-file' }, h('b', null, 'in.txt'), h('div', { class: 'os-blocks' }, opt.missing ? h('i', null, 'does not exist') : range(opt.blocks).map((b) => h('span', { class: 'on' })))),
      h('span', { class: 'os-arrow' }, '→'),
      h('div', { class: 'os-file' }, h('b', null, 'out.txt'), h('div', { class: 'os-blocks' }, range(opt.blocks).map((b) => h('span', { class: b < copied ? 'on' : '' })))));
    clear(cnt).append(h('small', null, 'system calls so far'), h('b', null, String(i + 1)));
  }
  function reb() { build(); st.setN(steps.length); st.go(0); }
  build();
  st = stepper(steps.length, render, { ms: 700 });
  root.append(demoBox('System calls to copy one file', 'Even a tiny copy program makes many system calls. Step through it and change the situation.',
    h('div', { class: 'row' }, missing.el, exists.el, field('file size', blocks)), h('div', { class: 'cols' }, h('div', null, list), h('div', null, files, cnt)), st.el));
  st.go(0);
};

/* ================= Chapter 3 ================= */
DEMOS['proc-states'] = (root) => {
  const T = { admit: ['new', 'ready', 'admitted'], dispatch: ['ready', 'running', 'dispatch'], interrupt: ['running', 'ready', 'interrupt'], wait: ['running', 'waiting', 'io-wait'], done: ['waiting', 'ready', 'io-done'], exit: ['running', 'terminated', 'exit'] };
  const LBL = { admit: 'admitted', dispatch: 'scheduler dispatch', interrupt: 'interrupt (time slice over)', wait: 'I/O or event wait', done: 'I/O or event completion', exit: 'exit' };
  let state = 'new', edge = null;
  const pic = h('div'), log = h('ol', { class: 'os-log' }), btns = h('div', { class: 'row tight' });
  function draw() {
    clear(pic).append(procStateSvg(state, edge));
    clear(btns);
    Object.keys(T).forEach((k) => btns.append(h('button', { type: 'button', class: 'btn sm' + (T[k][0] === state ? ' pri' : ''), disabled: T[k][0] !== state, onclick: () => { edge = T[k][2]; log.append(h('li', null, `${T[k][0]} → ${T[k][1]}: ${LBL[k]}`)); state = T[k][1]; draw(); } }, LBL[k])));
    btns.append(btn('New process', () => { state = 'new'; edge = null; clear(log); draw(); }));
    btns.append(lifeBtn);
  }
  /* play a typical lifecycle: admitted, run, I/O, run, preempted, run, exit */
  let life = null;
  const LIFE = ['admit', 'dispatch', 'wait', 'done', 'dispatch', 'interrupt', 'dispatch', 'exit'];
  const lifeBtn = btn('▶ Play a lifecycle', () => {
    if (life) { clearInterval(life); life = null; lifeBtn.textContent = '▶ Play a lifecycle'; return; }
    state = 'new'; edge = null; clear(log); draw(); let k = 0; lifeBtn.textContent = '❚❚ Stop';
    life = setInterval(() => {
      const e = LIFE[k++]; if (!e) { clearInterval(life); life = null; lifeBtn.textContent = '▶ Play a lifecycle'; return; }
      edge = T[e][2]; log.append(h('li', null, `${T[e][0]} → ${T[e][1]}: ${LBL[e]}`)); state = T[e][1]; draw();
    }, 1300);
  });
  root.append(demoBox('Drive a process through its states', 'Only the events that can happen in the current state are enabled.', pic, btns, log));
  draw();
};

const FORK_PROGS = {
  hello: { title: 'fork( ) then printf', files: { main: `#include <stdio.h>
#include <unistd.h>

int main()
{
    fork();

    printf("Hello World, PID = %d\\n", getpid());

    return 0;
}` }, steps: [
    { p: { P: ['main', 6] }, n: 'One process (PID 4100) starts executing main().' },
    { p: { P: ['main', 8], C: ['main', 8] }, n: 'fork() creates a child (PID 4101): a copy of the parent. Both continue from the line after fork().' },
    { p: { P: ['main', 10], C: ['main', 8] }, o: 'Hello World, PID = 4100', n: 'The parent prints its own PID.' },
    { p: { P: ['main', 10], C: ['main', 10] }, o: 'Hello World, PID = 4101', n: 'The child prints its PID. The scheduler decides which of the two prints first, so the order can change from run to run.' },
    { p: {}, n: 'Both processes return 0 and terminate: the message appears twice.' }] },
  exec: { title: 'execl( ) replaces the program', files: { main: `#include <stdio.h>
#include <unistd.h>

int main()
{
    printf("Program 1: Starting...\\n");
    printf("PID of Program 1 = %d\\n", getpid());
    execl("./program2", "program2", NULL);

    printf("Program 1: Finished\\n");

    return 0;
}`, program2: `#include <stdio.h>
#include <unistd.h>

int main()
{
    printf("Program 2: I am running now!\\n");
    printf("PID of Program 2 = %d\\n", getpid());

    return 0;
}` }, steps: [
    { p: { P: ['main', 6] }, o: 'Program 1: Starting...', n: 'Program 1 starts.' },
    { p: { P: ['main', 7] }, o: 'PID of Program 1 = 4200', n: 'It prints its PID: 4200.' },
    { p: { P: ['main', 8] }, n: 'execl() asks the OS to load ./program2 into this process.' },
    { p: { P: ['program2', 6] }, o: 'Program 2: I am running now!', n: 'The memory image is replaced: Program 2’s code now runs in the same process. No new process was created.' },
    { p: { P: ['program2', 7] }, o: 'PID of Program 2 = 4200', n: 'Same PID, 4200, because exec() replaces the program, not the process.' },
    { p: {}, n: '“Program 1: Finished” is never printed: after a successful exec() the old code is gone. exec() only returns if it fails.' }] },
  wait: { title: 'fork( ) + exec( ) + wait( )', files: { main: `#include <sys/types.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main()
{
    pid_t pid;

    /* fork a child process */
    pid = fork();

    if (pid < 0) { /* error occurred */
        fprintf(stderr, "Fork Failed");
        return 1;
    }
    else if (pid == 0) { /* child process */
        execlp("/bin/ls", "ls", NULL);
    }
    else { /* parent process */
        /* parent will wait for the child to complete */
        wait(NULL);
        printf("Child Complete");
    }

    return 0;
}`, ls: `/* /bin/ls : lists the directory */` }, steps: [
    { p: { P: ['main', 11] }, n: 'The parent (PID 4300) calls fork().' },
    { p: { P: ['main', 13], C: ['main', 13] }, n: 'fork() returns twice: the child’s PID (4301) in the parent, and 0 in the child.', v: 'parent: pid = 4301   child: pid = 0' },
    { p: { P: ['main', 22], C: ['main', 18] }, n: 'pid > 0, so the parent reaches wait(NULL) and blocks. pid == 0, so the child calls execlp().', w: 'P' },
    { p: { P: ['main', 22], C: ['ls', 1] }, o: 'a.out  fork.c  program2', n: 'The child now runs /bin/ls and prints the directory listing. The parent is still waiting.', w: 'P' },
    { p: { P: ['main', 23] }, n: 'ls exits. The OS wakes the parent: wait() returns.' },
    { p: { P: ['main', 26] }, o: 'Child Complete', n: 'The parent prints “Child Complete” and returns 0.' }] }
};
DEMOS['fork-run'] = (root) => {
  const pick = seg(Object.keys(FORK_PROGS).map((k) => ({ v: k, l: FORK_PROGS[k].title })), root.getAttribute('data-prog') || 'hello', (v) => load(v));
  const panes = h('div', { class: 'cols' }), con = consoleEl('Terminal'), note = h('div', { class: 'out' });
  let P, st;
  const host = h('div');
  function render(i) {
    const s = P.steps[i];
    clear(panes);
    const hasChild = P.steps.some((x) => x.p.C), pids = { hello: [4100, 4101], exec: [4200], wait: [4300, 4301] }[pick.get()];
    [['P', 'parent'], ['C', 'child']].forEach(([k, lab], j) => {
      if (k === 'C' && !hasChild) return;
      const at = s.p[k], pid = pids[j], head = `${lab} · PID ${pid}`;
      if (!at) {
        const seen = P.steps.slice(0, i).some((x) => x.p[k]);
        panes.append(h('div', { class: 'os-pane off' }, h('div', { class: 'os-pane-h' }, head), h('p', { class: 'muted small' }, seen ? 'terminated' : 'not created yet')));
        return;
      }
      const pre = CLang.render(P.files[at[0]], null, { marks: String(at[1]) });
      pre.classList.add('small-code');
      const prog = at[0] === 'main' ? (pick.get() === 'exec' ? 'program1' : 'program') : at[0] === 'ls' ? '/bin/ls' : at[0];
      panes.append(h('div', { class: 'os-pane' + (s.w === k ? ' blocked' : '') }, h('div', { class: 'os-pane-h' }, `${head} · ${prog}` + (s.w === k ? ' · waiting' : '')), pre));
    });
    con.set(P.steps.slice(0, i + 1).filter((x) => x.o).map((x) => x.o).join('\n') || ' ');
    note.innerHTML = s.n + (s.v ? `<br><b>${s.v}</b>` : '');
  }
  function load(k) {
    P = FORK_PROGS[k];
    st = stepper(P.steps.length, render, { ms: 1800 });
    clear(host).append(panes, note, con.el, st.el);
    st.go(0);
  }
  root.append(demoBox('Run fork( ) and exec( ) step by step', 'The three programs from the class handout. Each running process gets its own pane; the highlighted line is where it is now.', h('div', { class: 'row' }, pick.el), host));
  load(pick.get());
};

DEMOS['fork-count'] = (root) => {
  const out = h('div'), n = seg([1, 2, 3, 4].map((v) => ({ v, l: v + ' fork' + (v > 1 ? 's' : '') })), 2, draw);
  function draw() {
    const N = n.get(), P = [{ id: 0, par: -1, born: 0 }];
    for (let s = 1; s <= N; s++) { const cur = P.slice(); cur.forEach((p) => P.push({ id: P.length, par: p.id, born: s })); }
    /* row order: depth-first, children in order of creation */
    const order = [], kids = (id) => P.filter((p) => p.par === id);
    (function dfs(id) { order.push(id); kids(id).forEach((c) => dfs(c.id)); })(0);
    const y = {}; order.forEach((id, i) => { y[id] = 24 + i * 32; });
    const CW = 130, W = 120 + N * CW, Hh = 30 + order.length * 32, k = [];
    for (let s = 1; s <= N; s++) k.push(L([[40 + s * CW, 8], [40 + s * CW, Hh - 4]], { dash: true, cls: 'dg-thin' }), TX(40 + s * CW, Hh + 10, 'fork() #' + s, 'dg-s'));
    P.forEach((p) => {
      const x0 = 40 + p.born * CW;
      if (p.par >= 0) k.push(L([[x0, y[p.par]], [x0, y[p.id]]], { cls: 'dg-thin', end: 'arrow' }));
      k.push(L([[x0, y[p.id]], [W - 10, y[p.id]]], { cls: p.id === 0 ? 'dg-acc' : '' }));
      k.push(sv('circle', { cx: x0, cy: y[p.id], r: 4.5, class: 'dg-solid' }), TX(x0 + 10, y[p.id] - 10, 'P' + p.id, 'dg-m dg-b', 'start'));
    });
    const code = 'int main()\n{\n' + range(N).map(() => '    fork();').join('\n') + '\n    printf("hello\\n");\n    return 0;\n}';
    clear(out).append(h('div', { class: 'cols' }, CLang.render(code, null, {}), h('div', null,
      h('div', { class: 'kv ok' }, h('small', null, 'processes at the end'), h('b', null, `2^${N} = ${P.length}`)),
      h('div', { class: 'kv' }, h('small', null, '"hello" is printed'), h('b', null, P.length + ' times')),
      h('p', { class: 'small muted' }, 'Every fork() is executed by every process that exists at that moment, so the number of processes doubles each time.'))),
      h('div', { class: 'fig-box' }, D.svg(W, Hh + 24, 'Process tree for repeated fork calls', k, { scale: 1.3, min: 0.8 })));
  }
  root.append(demoBox('How many processes does fork( ) create?', 'Each line is a process; an arrow is a fork(). P0 is the original process.', h('div', { class: 'row' }, n.el), out));
  draw();
};

DEMOS['bounded-buffer'] = (root) => {
  let N = 5, buf = Array(N).fill(null), inP = 0, outP = 0, count = 0, item = 1, unbounded = false, ub = [];
  const ring = h('div', { class: 'os-buf' }), msg = h('div', { class: 'out' }), stats = h('div', { class: 'row' });
  const size = seg([3, 5, 8].map((v) => ({ v, l: 'size ' + v })), 5, (v) => { N = v; reset(); });
  const kind = seg([{ v: 0, l: 'bounded buffer' }, { v: 1, l: 'unbounded buffer' }], 0, (v) => { unbounded = !!v; reset(); });
  function reset() { buf = Array(N).fill(null); inP = outP = count = 0; item = 1; ub = []; msg.textContent = 'Empty buffer. The consumer would have to wait.'; draw(); }
  function produce() {
    if (unbounded) { ub.push(item); msg.textContent = `Producer added item ${item++}. With an unbounded buffer the producer never waits.`; return draw(); }
    if (count === N) { msg.innerHTML = '<b>Buffer full:</b> the producer must wait until the consumer removes an item.'; return draw('pw'); }
    buf[inP] = item; msg.textContent = `Producer put item ${item++} in slot ${inP}; in = (in + 1) % ${N} = ${(inP + 1) % N}.`; inP = (inP + 1) % N; count++; draw();
  }
  function consume() {
    if (unbounded) { if (!ub.length) { msg.innerHTML = '<b>Buffer empty:</b> the consumer must wait.'; return draw('cw'); } msg.textContent = `Consumer took item ${ub.shift()}.`; return draw(); }
    if (count === 0) { msg.innerHTML = '<b>Buffer empty:</b> the consumer must wait until the producer adds an item.'; return draw('cw'); }
    const it = buf[outP]; buf[outP] = null; msg.textContent = `Consumer took item ${it} from slot ${outP}; out = ${(outP + 1) % N}.`; outP = (outP + 1) % N; count--; draw();
  }
  function draw(wait) {
    clear(ring);
    if (unbounded) ring.append(...ub.map((v) => h('div', { class: 'os-slot on' }, String(v))), h('div', { class: 'os-slot more' }, '…'));
    else buf.forEach((v, i) => ring.append(h('div', { class: 'os-slot' + (v != null ? ' on' : '') }, h('span', null, v == null ? '' : String(v)),
      h('small', null, (i === inP ? 'in ' : '') + (i === outP ? 'out' : '')))));
    clear(stats).append(h('div', { class: 'kv' + (wait === 'pw' ? ' warn' : '') }, h('small', null, 'producer'), h('b', null, wait === 'pw' ? 'waiting' : 'ready')),
      h('div', { class: 'kv' + (wait === 'cw' ? ' warn' : '') }, h('small', null, 'consumer'), h('b', null, wait === 'cw' ? 'waiting' : 'ready')),
      h('div', { class: 'kv' }, h('small', null, 'items in buffer'), h('b', null, String(unbounded ? ub.length : count))));
  }
  let auto = null;
  const autoBtn = btn('▶ Auto run', () => {
    if (auto) { clearInterval(auto); auto = null; autoBtn.textContent = '▶ Auto run'; return; }
    autoBtn.textContent = '❚❚ Pause';
    auto = setInterval(() => (Math.random() < 0.55 ? produce() : consume()), 800);
  });
  root.append(demoBox('Producer–consumer with a shared buffer', 'Produce and consume items. With a bounded buffer, in and out wrap around: the buffer is full when it holds N items.',
    h('div', { class: 'row' }, kind.el, size.el), ring, stats, msg, h('div', { class: 'row' }, btn('Produce', produce, 'pri'), btn('Consume', consume), autoBtn, btn('Reset', reset))));
  reset();
};

DEMOS['msg-pass'] = (root) => {
  let cap = 2, sb = true, rb = true, q = [], senderWait = null, recvWait = false, n = 1;
  const log = h('ol', { class: 'os-log' }), view = h('div');
  const capS = seg([{ v: 0, l: 'zero capacity' }, { v: 2, l: 'bounded (2)' }, { v: -1, l: 'unbounded' }], 2, (v) => { cap = v; reset(); });
  const sS = seg([{ v: 1, l: 'blocking send' }, { v: 0, l: 'non-blocking send' }], 1, (v) => { sb = !!v; reset(); });
  const rS = seg([{ v: 1, l: 'blocking receive' }, { v: 0, l: 'non-blocking receive' }], 1, (v) => { rb = !!v; reset(); });
  const say = (t) => { log.append(h('li', { html: t })); };
  function reset() { q = []; senderWait = null; recvWait = false; n = 1; clear(log); draw(); }
  function send() {
    const m = 'm' + n++;
    if (recvWait) { recvWait = false; say(`send(${m}): the receiver was waiting, so ${m} is handed over directly.`); return draw(); }
    const full = cap === 0 || (cap > 0 && q.length >= cap);
    if (!full) { q.push(m); say(`send(${m}): queued on the link; the sender continues.`); return draw(); }
    if (sb) { senderWait = m; say(`send(${m}): ${cap === 0 ? 'no buffer, so the sender must wait for the receiver (rendezvous)' : 'the link is full, so the sender <b>blocks</b>'}.`); }
    else say(`send(${m}): ${cap === 0 ? 'no receiver is waiting and nothing can be queued' : 'the link is full'}; a non-blocking send returns at once and the message is not sent.`);
    draw();
  }
  function recv() {
    if (q.length) {
      const m = q.shift(); say(`receive(): got ${m}.`);
      if (senderWait) { q.push(senderWait); say(`the blocked sender wakes up; ${senderWait} goes into the freed slot.`); senderWait = null; }
      return draw();
    }
    if (senderWait) { say(`receive(): got ${senderWait} straight from the waiting sender (rendezvous); the sender continues.`); senderWait = null; return draw(); }
    if (rb) { recvWait = true; say('receive(): nothing to receive, so the receiver <b>blocks</b> until a message arrives.'); }
    else say('receive(): nothing there; a non-blocking receive returns a <b>null</b> message.');
    draw();
  }
  function draw() {
    clear(view).append(h('div', { class: 'os-mp' },
      h('div', { class: 'os-actor' + (senderWait ? ' blocked' : '') }, h('b', null, 'Sender P'), h('small', null, senderWait ? `blocked with ${senderWait}` : 'running')),
      h('div', { class: 'os-link' }, h('small', null, cap === 0 ? 'link: no queue' : cap > 0 ? `link: ${q.length} / ${cap}` : `link: ${q.length} queued`),
        h('div', { class: 'os-q' }, cap === 0 ? h('i', { class: 'muted small' }, 'zero capacity') : q.length ? q.map((m) => chip(m, 1)) : h('i', { class: 'muted small' }, 'empty'))),
      h('div', { class: 'os-actor' + (recvWait ? ' blocked' : '') }, h('b', null, 'Receiver Q'), h('small', null, recvWait ? 'blocked, waiting' : 'running'))));
  }
  root.append(demoBox('Message passing: blocking, non-blocking and buffering', 'Choose the link’s capacity and the send/receive semantics, then press send and receive in any order.',
    h('div', { class: 'row' }, capS.el), h('div', { class: 'row' }, sS.el, rS.el), view,
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn sm pri', onclick: () => { if (!senderWait) send(); else say('The sender is blocked and cannot send again.'); } }, 'Sender: send( )'),
      h('button', { type: 'button', class: 'btn sm pri', onclick: () => { if (!recvWait) recv(); else say('The receiver is already blocked.'); } }, 'Receiver: receive( )'), btn('Reset', reset)), log));
  draw();
};

/* ================= Chapter 9 ================= */
DEMOS['base-limit'] = (root) => {
  const base = numInput(300040, { min: 0 }), limit = numInput(120900, { min: 1 }), addr = numInput(350000, { min: 0 });
  const out = h('div'), bar = h('div', { class: 'os-membar' });
  function draw() {
    const b = +base.value, l = +limit.value, a = +addr.value, max = Math.max(b + l, a) * 1.15 + 1;
    const ok1 = a >= b, ok2 = a < b + l;
    clear(bar).append(h('div', { class: 'os-mb-seg proc', style: { left: (b / max * 100) + '%', width: (l / max * 100) + '%' } }, 'process'),
      h('div', { class: 'os-mb-mark ' + (ok1 && ok2 ? 'ok' : 'bad'), style: { left: (a / max * 100) + '%' } }, String(a)));
    clear(out).append(h('div', { class: 'out' }, h('div', null, `${a} ≥ base ${b} ?  `, h('b', { class: ok1 ? 'ok' : 'bad' }, ok1 ? 'yes' : 'no')),
      ok1 ? h('div', null, `${a} < base + limit = ${b + l} ?  `, h('b', { class: ok2 ? 'ok' : 'bad' }, ok2 ? 'yes' : 'no')) : null),
      h('div', { class: 'verdict ' + (ok1 && ok2 ? 'ok' : 'bad') }, ok1 && ok2 ? 'Legal: the access goes to memory.' : 'Trap to the operating system: addressing error.'));
  }
  [base, limit, addr].forEach((i) => i.addEventListener('input', draw));
  const tries = [300040, 420939, 420940, 256000].map((v) => btn(String(v), () => { addr.value = v; draw(); }));
  root.append(demoBox('Check an address against base and limit', 'This is the check the hardware makes on every memory access in user mode.',
    h('div', { class: 'row' }, field('base register', base), field('limit register', limit), field('address from CPU', addr)), h('div', { class: 'row tight' }, h('span', { class: 'small muted' }, 'try:'), tries), bar, out));
  draw();
};

DEMOS['fit-alloc'] = (root) => {
  const holesIn = textInput('100, 500, 200, 300, 600', { style: { width: '270px' }, 'aria-label': 'hole sizes in KB' }), reqIn = textInput('212, 417, 112, 426', { style: { width: '220px' }, 'aria-label': 'request sizes in KB' });
  const algo = seg([{ v: 'first', l: 'First-fit' }, { v: 'best', l: 'Best-fit' }, { v: 'worst', l: 'Worst-fit' }], 'first', () => reset());
  const bar = h('div', { class: 'os-mem' }), table = h('div'), sum = h('div', { class: 'row' });
  let blocks, reqs, k;
  const nums = (s) => s.split(/[^0-9]+/).filter(Boolean).map(Number);
  function reset() {
    blocks = []; nums(holesIn.value).forEach((s, i) => { if (i) blocks.push({ size: 40, used: 'used', old: true }); blocks.push({ size: s, used: null }); });
    reqs = nums(reqIn.value).map((s, i) => ({ s, n: 'R' + (i + 1), at: null })); k = 0; draw();
  }
  function step() {
    if (k >= reqs.length) return;
    const r = reqs[k++], cand = blocks.map((b, i) => ({ b, i })).filter((x) => !x.b.used && x.b.size >= r.s);
    let pick = null;
    if (cand.length) pick = algo.get() === 'first' ? cand[0] : algo.get() === 'best' ? cand.reduce((a, c) => (c.b.size < a.b.size ? c : a)) : cand.reduce((a, c) => (c.b.size > a.b.size ? c : a));
    if (pick) {
      const left = pick.b.size - r.s; r.at = `${pick.b.size} KB hole → ${left} KB left`;
      blocks.splice(pick.i, 1, { size: r.s, used: r.n, fresh: true }, ...(left ? [{ size: left, used: null }] : []));
    } else r.at = 'no hole is large enough: must wait';
    draw();
  }
  function draw() {
    const tot = blocks.reduce((a, b) => a + b.size, 0);
    clear(bar).append(...blocks.map((b) => h('div', { class: 'os-blk ' + (b.used ? (b.old ? 'old' : 'new') : 'free'), style: { flexGrow: b.size }, title: (b.used || 'hole') + ' · ' + b.size + ' KB' }, h('span', null, b.used || ''), h('small', null, b.size + ''))));
    clear(table).append(tableEl(['Request', 'Size (KB)', 'Placed in'], reqs.map((r, i) => [r.n, String(r.s), r.at || (i === k ? 'next' : '')]), 'tt'));
    const free = blocks.filter((b) => !b.used).map((b) => b.size);
    clear(sum).append(h('div', { class: 'kv' }, h('small', null, 'free memory (total)'), h('b', null, free.reduce((a, b) => a + b, 0) + ' KB')), h('div', { class: 'kv' }, h('small', null, 'largest hole'), h('b', null, Math.max(0, ...free) + ' KB')),
      h('div', { class: 'kv' }, h('small', null, 'number of holes'), h('b', null, String(free.length))));
    void tot;
  }
  holesIn.addEventListener('change', reset); reqIn.addEventListener('change', reset);
  root.append(demoBox('First-fit, best-fit and worst-fit', 'Holes (white) lie between partitions in use (grey). Place each request and compare the leftover holes.',
    h('div', { class: 'row' }, algo.el), h('div', { class: 'row' }, field('holes (KB)', holesIn), field('requests (KB)', reqIn)), bar, h('div', { class: 'row' }, btn('Place next request', step, 'pri'), btn('Place all', () => { while (k < reqs.length) step(); }), btn('Reset', reset)), sum, table));
  reset();
};

DEMOS['paging-32'] = (root) => {
  const PT = [5, 6, 1, 2], letters = 'abcdefghijklmnop'.split('');
  let sel = 0;
  const lm = h('div', { class: 'os-pg lm' }), pt = h('div', { class: 'os-pg pt' }), pm = h('div', { class: 'os-pg pm' }), calc = h('div', { class: 'out' });
  function draw() {
    const p = sel >> 2, d = sel & 3, f = PT[p], pa = f * 4 + d;
    clear(lm).append(h('div', { class: 'os-pg-h' }, 'logical memory'), ...letters.map((c, i) => h('button', { type: 'button', class: 'os-pg-c' + (i >> 2 === p ? ' pg' : '') + (i === sel ? ' on' : '') + (i % 4 === 0 ? ' top' : ''), onclick: () => { sel = i; draw(); } }, h('small', null, String(i)), c)));
    clear(pt).append(h('div', { class: 'os-pg-h' }, 'page table'), ...PT.map((fr, i) => h('div', { class: 'os-pg-c top' + (i === p ? ' on' : '') }, h('small', null, String(i)), String(fr))));
    const rows = [];
    for (let a = 0; a < 32; a++) { const pg = PT.indexOf(a >> 2); rows.push(h('div', { class: 'os-pg-c' + (a % 4 === 0 ? ' top' : '') + ((a >> 2) === f ? ' pg' : '') + (a === pa ? ' on' : '') }, h('small', null, String(a)), pg >= 0 ? letters[pg * 4 + (a & 3)] : '')); }
    clear(pm).append(h('div', { class: 'os-pg-h' }, 'physical memory'), ...rows);
    calc.innerHTML = `logical address <b>${sel}</b> (“${letters[sel]}”) → page p = ${sel} ÷ 4 = <b>${p}</b>, offset d = ${sel} mod 4 = <b>${d}</b><br>page table[${p}] = frame <b>${f}</b> → physical address = ${f} × 4 + ${d} = <b>${pa}</b>`;
  }
  root.append(demoBox('Paging example: 32-byte memory, 4-byte pages', 'Click any byte of logical memory to translate its address.', h('div', { class: 'os-pg-wrap' }, lm, pt, pm), calc));
  draw();
};

DEMOS['paging-xlate'] = (root) => {
  const size = seg([1024, 2048, 4096].map((v) => ({ v, l: v / 1024 + ' KB pages' })), 4096, draw);
  const ptIn = textInput('5, 9, 2, 7, 1, 0, 3, 8', { style: { width: '200px' }, 'aria-label': 'frame numbers' }), la = numInput(10000, { min: 0, style: { width: '120px' } });
  const out = h('div');
  function draw() {
    const S = size.get(), n = Math.log2(S), PT = ptIn.value.split(/[^0-9]+/).filter(Boolean).map(Number), L0 = Math.max(0, +la.value | 0);
    const p = Math.floor(L0 / S), d = L0 % S, m = n + Math.max(Math.ceil(Math.log2(Math.max(2, PT.length))), Math.ceil(Math.log2(p + 1)));
    const bits = L0.toString(2).padStart(m, '0');
    const bitRow = h('div', { class: 'os-bits' }, ...bits.split('').map((b, i) => h('span', { class: i < m - n ? 'p' : 'd' }, b)));
    const valid = p < PT.length, f = PT[p], pa = valid ? f * S + d : null;
    clear(out).append(h('div', { class: 'small muted' }, `page size 2^${n} = ${S} bytes → offset d is the low ${n} bits; ${PT.length} pages → page number p uses ${m - n} bits (m = ${m})`), bitRow,
      h('div', { class: 'out', html: `p = ${L0} ÷ ${S} = <b>${p}</b> &nbsp; d = ${L0} mod ${S} = <b>${d}</b>` + (valid ? `<br>page table[${p}] = <b>${f}</b> → physical address = ${f} × ${S} + ${d} = <b>${pa}</b>` : '') }),
      valid ? h('div', { class: 'verdict ok' }, `Physical address ${pa}`) : h('div', { class: 'verdict bad' }, `Page ${p} is outside the page table: the hardware traps (invalid address).`));
  }
  ptIn.addEventListener('input', draw); la.addEventListener('input', draw);
  root.append(demoBox('Translate a logical address', 'Enter a logical address and a page table (frame number for page 0, 1, 2, …).', h('div', { class: 'row' }, size.el), h('div', { class: 'row' }, field('logical address', la), field('page table: frames', ptIn)), out));
  draw();
};

DEMOS['frag-calc'] = (root) => {
  const ps = numInput(2048, { min: 1 }), pr = numInput(72766, { min: 1 }), out = h('div');
  function draw() {
    const P = Math.max(1, +ps.value | 0), S = Math.max(1, +pr.value | 0), full = Math.floor(S / P), rem = S % P, frames = full + (rem ? 1 : 0);
    clear(out).append(h('div', { class: 'out', html: `${S} bytes ÷ ${P} = <b>${full}</b> pages + <b>${rem}</b> bytes` }),
      h('div', { class: 'row' }, h('div', { class: 'kv' }, h('small', null, 'frames needed'), h('b', null, String(frames))), h('div', { class: 'kv warn' }, h('small', null, 'internal fragmentation'), h('b', null, (rem ? P - rem : 0) + ' bytes')),
        h('div', { class: 'kv' }, h('small', null, 'worst case'), h('b', null, (P - 1) + ' bytes')), h('div', { class: 'kv' }, h('small', null, 'average'), h('b', null, P / 2 + ' bytes'))));
  }
  [ps, pr].forEach((i) => i.addEventListener('input', draw));
  root.append(demoBox('Internal fragmentation calculator', 'Only the last page of a process can be partly empty.', h('div', { class: 'row' }, field('page size (bytes)', ps), field('process size (bytes)', pr)), out));
  draw();
};

DEMOS['eat-calc'] = (root) => {
  const hr = h('input', { type: 'range', min: 0, max: 100, value: 80, 'aria-label': 'hit ratio' }), mt = numInput(10, { min: 1 }), out = h('div');
  function draw() {
    const a = +hr.value / 100, m = +mt.value || 10, eat = a * m + (1 - a) * 2 * m;
    clear(out).append(h('div', { class: 'out', html: `EAT = ${a.toFixed(2)} × ${m} + ${(1 - a).toFixed(2)} × ${2 * m} = <b>${+eat.toFixed(2)} ns</b>` }),
      h('div', { class: 'os-hbar' }, h('div', { style: { width: (m / (2 * m) * 100) + '%' } }, 'memory access ' + m + ' ns'), h('div', { class: 'acc', style: { width: (eat / (2 * m) * 100) + '%' } }, 'EAT ' + (+eat.toFixed(2)) + ' ns')),
      h('div', { class: 'kv' + (eat / m - 1 > 0.05 ? ' warn' : ' ok') }, h('small', null, 'slowdown'), h('b', null, +((eat / m - 1) * 100).toFixed(1) + '%')));
  }
  [hr, mt].forEach((i) => i.addEventListener('input', () => { lab.textContent = hr.value + '%'; draw(); }));
  const lab = h('b', null, '80%');
  root.append(demoBox('Effective access time with a TLB', 'A TLB hit needs one memory access; a miss needs two (page table, then data).',
    h('div', { class: 'row' }, h('label', { class: 'fld' }, 'TLB hit ratio ', lab, hr), field('memory access (ns)', mt), btn('80%', () => { hr.value = 80; lab.textContent = '80%'; draw(); }), btn('99%', () => { hr.value = 99; lab.textContent = '99%'; draw(); })), out));
  draw();
};

DEMOS['addr-split'] = (root) => {
  const lv = seg([{ v: 1, l: 'one-level' }, { v: 2, l: 'two-level (10 | 10 | 12)' }], 2, draw), hex = textInput('0x00403ABC', { style: { width: '140px' }, 'aria-label': 'address in hex' }), out = h('div');
  function draw() {
    let a = parseInt(hex.value.replace(/^0x/i, ''), 16); if (!isFinite(a)) a = 0; a = a >>> 0;
    const b = a.toString(2).padStart(32, '0');
    const parts = lv.get() === 1 ? [['p', 20], ['d', 12]] : [['p1', 10], ['p2', 10], ['d', 12]];
    let at = 0; const row = h('div', { class: 'os-bits' }), vals = [];
    parts.forEach(([n, w], i) => { const s = b.slice(at, at + w); at += w; row.append(...s.split('').map((c, j) => h('span', { class: (n === 'd' ? 'd' : i % 2 ? 'p2' : 'p') + (j === 0 ? ' first' : '') }, c))); vals.push(`${n} = ${parseInt(s, 2)}`); });
    clear(out).append(row, h('div', { class: 'out' }, vals.join('   ·   ')),
      h('p', { class: 'small muted' }, lv.get() === 1 ? 'One-level: 2^20 = 1,048,576 entries × 4 bytes = 4 MB of page table per process, all of it contiguous.' : 'Two-level: p1 indexes the outer page table (1,024 entries); p2 indexes one 4 KB page of the page table. Only the inner tables that are used need to exist.'));
  }
  hex.addEventListener('input', draw);
  root.append(demoBox('Split a 32-bit address (4 KB pages)', 'Type an address in hexadecimal and see how the bits are divided.', h('div', { class: 'row' }, lv.el, field('logical address', hex)), out));
  draw();
};

DEMOS['swap-calc'] = (root) => {
  const sz = numInput(100, { min: 1 }), rate = numInput(50, { min: 1 }), out = h('div');
  function draw() { const t = +sz.value / +rate.value * 1000; clear(out).append(h('div', { class: 'row' }, h('div', { class: 'kv' }, h('small', null, 'swap out'), h('b', null, +t.toFixed(0) + ' ms')), h('div', { class: 'kv' }, h('small', null, 'swap in'), h('b', null, +t.toFixed(0) + ' ms')), h('div', { class: 'kv warn' }, h('small', null, 'context-switch swapping time'), h('b', null, +(2 * t).toFixed(0) + ' ms')))); }
  [sz, rate].forEach((i) => i.addEventListener('input', draw));
  root.append(demoBox('Swap time', 'Transfer time is proportional to the amount of memory swapped.', h('div', { class: 'row' }, field('process size (MB)', sz), field('transfer rate (MB/s)', rate)), out));
  draw();
};

/* ================= Chapter 10 ================= */
/* page-replacement engine: returns [{ref, frames:[...], fault, victim, bits?}] */
function pageReplace(ref, n, algo) {
  const fr = [], steps = [], last = {}, cnt = {}, loaded = {}, bit = {};
  let q = [], hand = 0, t = 0;
  ref.forEach((p, i) => {
    t++;
    if (fr.includes(p)) { last[p] = t; cnt[p] = (cnt[p] || 0) + 1; bit[p] = 1; steps.push({ ref: p, frames: fr.slice(), fault: false, bits: fr.map((x) => bit[x]), hand }); return; }
    let victim = null;
    if (fr.length < n) { fr.push(p); }
    else {
      let vi;
      if (algo === 'fifo') { victim = q.shift(); vi = fr.indexOf(victim); }
      else if (algo === 'lru') { vi = fr.reduce((b, x, j) => (last[x] < last[fr[b]] ? j : b), 0); }
      else if (algo === 'opt') { const nx = (x) => { const k = ref.indexOf(x, i + 1); return k < 0 ? Infinity : k; }; vi = fr.reduce((b, x, j) => (nx(x) > nx(fr[b]) ? j : b), 0); }
      else if (algo === 'lfu' || algo === 'mfu') { vi = fr.reduce((b, x, j) => { const c = cnt[x] - cnt[fr[b]]; return (algo === 'lfu' ? c < 0 : c > 0) || (c === 0 && loaded[x] < loaded[fr[b]]) ? j : b; }, 0); }
      else if (algo === 'clock') { while (bit[fr[hand]]) { bit[fr[hand]] = 0; hand = (hand + 1) % n; } vi = hand; hand = (hand + 1) % n; }
      victim = fr[vi]; fr[vi] = p; delete cnt[victim]; delete bit[victim];
      if (algo !== 'fifo') q = q.filter((x) => x !== victim);
    }
    q.push(p); last[p] = t; cnt[p] = 1; loaded[p] = t; bit[p] = 1;
    steps.push({ ref: p, frames: fr.slice(), fault: true, victim, bits: fr.map((x) => bit[x]), hand });
  });
  return steps;
}
const PR_ALGOS = [{ v: 'fifo', l: 'FIFO' }, { v: 'opt', l: 'Optimal' }, { v: 'lru', l: 'LRU' }, { v: 'clock', l: 'Second chance' }, { v: 'lfu', l: 'LFU' }, { v: 'mfu', l: 'MFU' }];
DEMOS['page-replace'] = (root) => {
  const refIn = textInput(root.getAttribute('data-ref') || '7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1', { style: { width: '100%' }, 'aria-label': 'reference string' });
  const algo = seg(PR_ALGOS, root.getAttribute('data-algo') || 'fifo', () => reset()), frames = seg([1, 2, 3, 4, 5, 6, 7].map((v) => ({ v, l: String(v) })), +(root.getAttribute('data-frames') || 3), () => reset());
  const grid = h('div', { class: 'scrollx' }), stats = h('div', { class: 'row' }), cmp = h('div', { class: 'small' }), note = h('div', { class: 'out' });
  let ref, steps, upto;
  const parse = () => refIn.value.split(/[^0-9]+/).filter((x) => x !== '').map(Number);
  function reset() { ref = parse(); steps = pageReplace(ref, frames.get(), algo.get()); upto = root.getAttribute('data-full') ? steps.length : 0; draw(); }
  function draw() {
    const n = frames.get(), clk = algo.get() === 'clock';
    const head = h('tr', null, h('th', null, 'ref'), ...ref.map((r, i) => h('th', { class: i === upto - 1 ? 'cur' : '' }, String(r))));
    const rows = range(n).map((f) => h('tr', null, h('th', null, 'frame ' + f), ...steps.map((s, i) => {
      if (i >= upto) return h('td', { class: 'fut' });
      const v = s.frames[f], changed = s.fault && (i === 0 ? v != null : steps[i - 1].frames[f] !== v);
      return h('td', { class: (s.fault ? 'flt' : 'hit') + (changed ? ' new' : '') }, v == null ? '' : String(v), clk && v != null ? h('sup', null, String(s.bits[f])) : null, clk && s.hand === f && i === upto - 1 ? h('i', { class: 'hand' }, '◂') : null);
    })));
    const mark = h('tr', null, h('th', null, ''), ...steps.map((s, i) => h('td', { class: 'mk' }, i < upto ? (s.fault ? 'F' : '✓') : '')));
    clear(grid).append(h('table', { class: 'os-pr' }, h('thead', null, head), h('tbody', null, rows, mark)));
    const done = steps.slice(0, upto), f = done.filter((s) => s.fault).length;
    clear(stats).append(h('div', { class: 'kv warn' }, h('small', null, 'page faults'), h('b', null, `${f}${upto < steps.length ? ' so far' : ''}`)), h('div', { class: 'kv ok' }, h('small', null, 'hits'), h('b', null, String(done.length - f))),
      h('div', { class: 'kv' }, h('small', null, 'references'), h('b', null, `${upto} / ${ref.length}`)));
    const s = steps[upto - 1];
    note.textContent = !s ? 'Press Step or Run all.' : s.fault ? (s.victim != null ? `Page ${s.ref} is not in memory: page fault. Victim: page ${s.victim}.` : `Page ${s.ref} is not in memory: page fault; a free frame is used.`) : `Page ${s.ref} is already in memory: no fault.`;
    clear(cmp).append(h('span', { class: 'muted' }, `With ${n} frames on this string: `), ...PR_ALGOS.map((a) => h('span', { class: 'os-tag' + (a.v === algo.get() ? ' on' : '') }, `${a.l} ${pageReplace(ref, n, a.v).filter((x) => x.fault).length}`)));
  }
  refIn.addEventListener('change', reset);
  root.append(demoBox('Page-replacement simulator', 'F marks a page fault (highlighted column); new pages are outlined. Second chance shows each page’s reference bit and the clock hand.',
    field('reference string', refIn), h('div', { class: 'row' }, algo.el, h('span', { class: 'small muted' }, 'frames'), frames.el), grid, note,
    h('div', { class: 'row' }, btn('Step', () => { if (upto < steps.length) { upto++; draw(); } }, 'pri'), btn('Run all', () => { upto = steps.length; draw(); }), btn('Reset', () => { upto = 0; draw(); })), stats, cmp));
  reset();
};

DEMOS['belady'] = (root) => {
  const refIn = textInput('1,2,3,4,1,2,5,1,2,3,4,5', { style: { width: '100%' }, 'aria-label': 'reference string' }), out = h('div');
  function draw() {
    const ref = refIn.value.split(/[^0-9]+/).filter((x) => x !== '').map(Number), F = 7;
    const ser = ['fifo', 'lru', 'opt'].map((a) => range(F).map((i) => pageReplace(ref, i + 1, a).filter((s) => s.fault).length));
    const W = 520, H = 280, x0 = 50, y0 = 240, mx = Math.max(1, ...ser[0], ...ser[1]), sx = (i) => x0 + i * ((W - 80) / (F - 1)), sy = (v) => y0 - v / mx * 200, k = [];
    k.push(L([[x0, y0], [W - 20, y0]], { end: 'arrow' }), L([[x0, y0], [x0, 20]], { end: 'arrow' }), TX((W) / 2, y0 + 32, 'number of frames', 'dg-t2'));
    range(F).forEach((i) => k.push(TX(sx(i), y0 + 14, String(i + 1), 'dg-m')));
    [0, Math.round(mx / 2), mx].forEach((v) => k.push(TX(x0 - 8, sy(v), String(v), 'dg-m', 'end')));
    const cls = ['dg-acc', '', 'dg-thin'];
    ser.forEach((s, j) => { k.push(sv('path', { d: 'M' + s.map((v, i) => sx(i) + ' ' + sy(v)).join(' L'), class: 'dg-ln ' + cls[j], 'stroke-dasharray': j === 2 ? '5 4' : null })); s.forEach((v, i) => k.push(sv('circle', { cx: sx(i), cy: sy(v), r: 3.5, class: j === 0 ? 'dg-press' : 'dg-solid' }))); });
    const anom = []; for (let i = 1; i < F; i++) if (ser[0][i] > ser[0][i - 1]) anom.push(`${i} → ${i + 1} frames: ${ser[0][i - 1]} → ${ser[0][i]} faults`);
    anom.forEach((a, j) => { const i = +a.split(' ')[0]; k.push(sv('circle', { cx: sx(i), cy: sy(ser[0][i]), r: 9, class: 'dg-outline dg-acc' })); });
    clear(out).append(h('div', { class: 'fig-box' }, D.svg(W, H, 'Page faults versus frames for FIFO, LRU and OPT', k, { scale: 1 })),
      h('div', { class: 'row small' }, h('span', { class: 'os-tag on' }, 'FIFO ' + ser[0].join(' ')), h('span', { class: 'os-tag' }, 'LRU ' + ser[1].join(' ')), h('span', { class: 'os-tag' }, 'OPT ' + ser[2].join(' '))),
      anom.length ? h('div', { class: 'verdict bad' }, 'Belady’s anomaly with FIFO: ' + anom.join('; ') + '. More frames, more faults!') : h('div', { class: 'verdict ok' }, 'No anomaly on this string: FIFO faults never increase as frames are added.'));
  }
  refIn.addEventListener('input', draw);
  root.append(demoBox('Belady’s anomaly', 'Page faults for 1 to 7 frames. FIFO (orange) can get worse with more frames; LRU and OPT (stack algorithms) never do.', field('reference string', refIn), out));
  draw();
};
