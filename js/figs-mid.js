/* ===================== figs-mid.js : figures for the midterm chapters (1, 2, 3, 9, 10) ===================== */
/* Each FIGS[id]() returns an SVG drawn with diagram.js, so every figure follows light and dark mode. */
const FIGS = {};
const L = D.line, R = D.rect, C = D.circle, E = D.ellipse, TX = D.T;
/* accent arrows are the main data path of a figure: they get a moving packet */
const arrow = (pts, o) => L(pts, Object.assign({ end: 'arrow' }, o || {}, o && /dg-acc/.test(o.cls || '') && o.packet == null ? { packet: true } : {}));
/* a vertical stack of labelled boxes: rows = [[label, cls, height]] */
function stack(x, y, w, rows, gap) {
  const k = []; let yy = y;
  rows.forEach(([lab, cls, hh]) => { k.push(R(x, yy, w, hh || 34, lab, { cls: cls || 'dg-fill3', rx: 3, tcls: 'dg-t2' })); yy += (hh || 34) + (gap || 0); });
  return k;
}
/* a memory column: cells = [[label, height, cls]] from top to bottom; addr = [[y-offset, text]] on the left */
function memCol(x, y, w, cells, opts) {
  opts = opts || {};
  const k = []; let yy = y;
  cells.forEach(([lab, hh, cls]) => { k.push(R(x, yy, w, hh, lab, { cls: cls || 'dg-fill3', rx: 0, tcls: opts.tcls || 'dg-t2' })); yy += hh; });
  (opts.addr || []).forEach(([dy, t]) => k.push(TX(x - 8, y + dy, t, 'dg-m', 'end')));
  (opts.right || []).forEach(([dy, t]) => k.push(TX(x + w + 8, y + dy, t, 'dg-m', 'start')));
  return k;
}

/* ================= Chapter 1: Introduction ================= */
FIGS['sys-components'] = () => {
  const k = [];
  ['user 1', 'user 2', 'user 3', '…', 'user n'].forEach((u, i) => {
    const cx = 110 + i * 100;
    if (u === '…') { k.push(TX(cx, 40, '…', 'dg-t')); return; }
    k.push(D.actor(cx, 4, null), TX(cx, 76, u, 'dg-s'));
    k.push(L([[cx, 84], [cx, 108]], { end: 'arrow', cls: 'dg-thin' }));
  });
  k.push(R(40, 108, 480, 66, null, { cls: 'dg-fill1', rx: 6 }));
  k.push(TX(280, 124, 'system and application programs', 'dg-t'));
  ['compiler', 'assembler', 'text editor', '…', 'database system'].forEach((t, i) => k.push(TX(90 + i * 100, 154, t, 'dg-s')));
  k.push(R(40, 192, 480, 40, 'operating system', { cls: 'dg-fill2', rx: 6 }));
  k.push(R(40, 250, 480, 56, null, { cls: 'dg-fill3', rx: 6 }), TX(280, 266, 'computer hardware', 'dg-t'), TX(280, 290, 'CPU · memory · I/O devices', 'dg-s'));
  k.push(L([[280, 174], [280, 192]], { start: 'arrow', end: 'arrow', cls: 'dg-thin' }), L([[280, 232], [280, 250]], { start: 'arrow', end: 'arrow', cls: 'dg-thin' }));
  return D.svg(560, 316, 'Abstract view of the components of a computer system: users, programs, operating system, hardware', k);
};

FIGS['user-kernel'] = () => {
  const k = [
    R(10, 10, 680, 92, null, { cls: 'dg-fill1', rx: 8 }), TX(24, 26, 'user mode  (mode bit = 1)', 'dg-t2 dg-acct', 'start'),
    R(10, 126, 680, 92, null, { cls: 'dg-fill2', rx: 8 }), TX(24, 202, 'kernel mode  (mode bit = 0)', 'dg-t2 dg-acct', 'start'),
    R(40, 46, 150, 40, 'user process\nexecuting', { tcls: 'dg-t2' }), R(260, 46, 150, 40, 'calls system call', { tcls: 'dg-t2' }), R(500, 46, 170, 40, 'return from\nsystem call', { tcls: 'dg-t2' }),
    R(330, 146, 170, 40, 'execute system call', { tcls: 'dg-t2' }),
    arrow([[190, 66], [260, 66]]), arrow([[335, 86], [360, 146]], { label: 'trap\nmode bit = 0', dx: -48, dy: 4, cls: 'dg-acc' }),
    arrow([[470, 146], [560, 86]], { label: 'return\nmode bit = 1', dx: 52, dy: 6, cls: 'dg-acc' }),
    arrow([[590, 46], [590, 30], [115, 30], [115, 46]], { cls: 'dg-thin', label: 'user process continues', at: 0.5, dy: -1 })
  ];
  return D.svg(700, 228, 'Transition from user to kernel mode on a system call and back', k);
};

FIGS['vm-arch'] = () => {
  const k = [TX(150, 14, '(a) without virtualization', 'dg-t'), TX(520, 14, '(b) with virtualization', 'dg-t')];
  ['processes', 'processes', 'processes', 'processes'].forEach((t, i) => k.push(R(20 + i * 66, 34, 60, 70, 'proc', { cls: 'dg-fill1', tcls: 'dg-s' })));
  k.push(R(20, 116, 258, 52, 'kernel', { cls: 'dg-fill2' }), R(20, 180, 258, 52, 'hardware', { cls: 'dg-fill3' }));
  k.push(L([[20, 110], [278, 110]], { cls: 'dg-thin', dash: true }), TX(150, 254, 'programming interface', 'dg-s'));
  [0, 1, 2].forEach((v) => {
    const x = 330 + v * 128;
    k.push(R(x, 34, 116, 26, 'processes', { cls: 'dg-fill1', tcls: 'dg-s' }), R(x, 64, 116, 40, 'kernel', { cls: 'dg-fill2', tcls: 'dg-t2' }));
    k.push(TX(x + 58, 118, 'VM' + (v + 1), 'dg-t2 dg-acct'));
  });
  k.push(R(330, 132, 372, 36, 'virtual machine manager (VMM)', { cls: 'dg-fill1' }), R(330, 180, 372, 52, 'hardware', { cls: 'dg-fill3' }));
  return D.svg(720, 262, 'System models: a single kernel on hardware versus several virtual machines on a VMM', k);
};

FIGS['client-server'] = () => {
  const k = [];
  [['desktop', 30], ['laptop', 100], ['smartphone', 170]].forEach(([t, y]) => {
    k.push(R(20, y, 120, 46, 'client\n' + t, { cls: 'dg-fill1', tcls: 'dg-t2' }));
    k.push(L([[140, y + 23], [250, 120]], { cls: 'dg-thin', packet: true, pcls: 'ac', dur: 2.2, delay: y / 90 }));
  });
  k.push(E(300, 120, 54, 34, 'network', { cls: 'dg-fill3' }), arrow([[354, 120], [430, 120]], { start: 'arrow', packet: true, dur: 1.6 }), L([[430, 128], [354, 128]], { cls: 'dg-fillonly', packet: true, pcls: 'ok', dur: 1.6, delay: 0.8 }));
  k.push(R(430, 84, 120, 72, 'server', { cls: 'dg-fill2' }));
  return D.svg(570, 240, 'General structure of a client–server system', k);
};

FIGS['p2p'] = () => {
  const k = [];
  const pos = [[70, 40], [370, 40], [40, 200], [400, 200], [220, 250]];
  pos.forEach(([x, y]) => { k.push(L([[x, y], [220, 135]], { cls: 'dg-thin' })); });
  k.push(E(220, 135, 70, 40, 'network', { cls: 'dg-fill3' }));
  pos.forEach(([x, y]) => k.push(R(x - 44, y - 20, 88, 40, 'client', { cls: 'dg-fill1', tcls: 'dg-t2' })));
  return D.svg(450, 280, 'Peer-to-peer system with no centralized service', k);
};

FIGS['cloud'] = () => {
  const k = [
    E(70, 150, 56, 36, 'Internet', { cls: 'dg-fill3' }), TX(70, 206, 'customer\nrequests', 'dg-s'),
    R(160, 120, 90, 60, 'firewall', { cls: 'dg-fill2', tcls: 'dg-t2' }), R(285, 120, 100, 60, 'load\nbalancer', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(430, 30, 150, 60, 'virtual\nmachines', { cls: 'dg-fill1', tcls: 'dg-t2' }), R(430, 120, 150, 60, 'servers', { cls: 'dg-fill1', tcls: 'dg-t2' }), R(430, 210, 150, 60, 'storage', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(610, 100, 120, 100, 'cloud\nmanagement\nservices', { cls: 'dg-fill3', tcls: 'dg-t2' }),
    arrow([[126, 150], [160, 150]], { packet: 2, dur: 1.2 }), arrow([[250, 150], [285, 150]], { packet: 2, dur: 1.2, delay: 0.3 }),
    arrow([[385, 140], [430, 60]], { packet: true, dur: 1.8 }), arrow([[385, 150], [430, 150]], { packet: true, dur: 1.8, delay: 0.6 }), arrow([[385, 160], [430, 240]], { packet: true, dur: 1.8, delay: 1.2 }),
    L([[610, 150], [580, 150]], { end: 'arrow', cls: 'dg-thin' }), L([[610, 130], [580, 60]], { end: 'arrow', cls: 'dg-thin' }), L([[610, 170], [580, 240]], { end: 'arrow', cls: 'dg-thin' }),
    TX(670, 228, 'cloud management\ncommands', 'dg-s'), TX(670, 76, 'cloud customer\ninterface', 'dg-s')
  ];
  return D.svg(740, 290, 'Cloud computing: firewall, load balancer, virtual machines, servers and storage, managed by cloud management services', k);
};

/* ================= Chapter 2: Operating-System Services ================= */
FIGS['os-services'] = () => {
  const k = [R(10, 10, 700, 34, 'user and other system programs', { cls: 'dg-fill1' })];
  k.push(R(10, 56, 700, 300, null, { cls: 'dg-fill3', rx: 8 }), TX(24, 72, 'operating system', 'dg-t2 dg-acct', 'start'));
  ['GUI', 'touch screen', 'command line'].forEach((t, i) => k.push(R(200 + i * 110, 86, 100, 30, t, { tcls: 'dg-t2' })));
  k.push(TX(110, 101, 'user interfaces', 'dg-s'));
  k.push(R(30, 130, 660, 30, 'system calls', { cls: 'dg-fill2' }));
  const sv1 = ['program\nexecution', 'I/O\noperations', 'file\nsystems', 'commu-\nnication', 'resource\nallocation', 'accounting', 'error\ndetection', 'protection\nand security'];
  sv1.forEach((t, i) => k.push(R(30 + i * 83, 176, 77, 52, t, { cls: 'dg-fill1', tcls: 'dg-s' })));
  k.push(TX(360, 246, 'services', 'dg-t2'));
  k.push(R(30, 262, 660, 76, null, { cls: 'dg-box' }), TX(360, 300, 'kernel: manages the hardware on behalf of the services above', 'dg-s'));
  k.push(R(10, 368, 700, 34, 'hardware', { cls: 'dg-fill2' }));
  k.push(L([[360, 44], [360, 56]], { cls: 'dg-thin' }));
  return D.svg(720, 412, 'A view of operating-system services', k);
};

FIGS['api-syscall'] = () => {
  const k = [
    R(170, 10, 200, 40, 'user application', { cls: 'dg-fill1' }), TX(270, 66, 'open( )', 'dg-m dg-b'),
    L([[20, 90], [520, 90]], { dash: true, cls: 'dg-thin' }), TX(500, 80, 'user mode', 'dg-s', 'end'), TX(500, 102, 'kernel mode', 'dg-s', 'end'),
    R(130, 118, 280, 180, null, { cls: 'dg-fill3' }), TX(180, 150, 'system call\ninterface', 'dg-t2')
  ];
  for (let r = 0; r < 6; r++) k.push(R(230, 150 + r * 22, 80, 22, r === 3 ? 'i' : '', { rx: 0, cls: r === 3 ? 'dg-fill2' : '', tcls: 'dg-m' }));
  k.push(R(170, 330, 200, 60, 'open( )\nimplementation of open( )\nsystem call', { cls: 'dg-fill1', tcls: 'dg-s' }), TX(270, 404, '⋮  return', 'dg-s'));
  k.push(arrow([[270, 74], [270, 150]], { cls: 'dg-acc' }), arrow([[310, 227], [360, 227], [360, 330]], { cls: 'dg-acc' }), arrow([[180, 330], [180, 300], [100, 300], [100, 40], [170, 40]], { cls: 'dg-thin', label: 'return', at: 0.45, dx: -24 }));
  return D.svg(540, 416, 'The API, system-call interface and OS: open() invoked by a user application', k);
};

FIGS['printf-flow'] = () => {
  const k = [
    R(20, 10, 300, 84, null, { cls: 'dg-fill1' }), TX(36, 28, '#include <stdio.h>', 'dg-m', 'start'), TX(36, 46, 'int main() {', 'dg-m', 'start'), TX(56, 64, 'printf("Greetings");', 'dg-m dg-b', 'start'), TX(36, 82, '}', 'dg-m', 'start'),
    TX(340, 52, 'user mode', 'dg-s', 'start'),
    R(20, 124, 300, 50, 'standard C library\nprintf( ) calls write( )', { cls: 'dg-fill3', tcls: 'dg-t2' }),
    L([[10, 196], [430, 196]], { dash: true, cls: 'dg-thin' }), TX(340, 210, 'kernel mode', 'dg-s', 'start'),
    R(20, 222, 300, 44, 'write( ) system call', { cls: 'dg-fill2', tcls: 'dg-t2' }),
    arrow([[130, 94], [130, 124]], { cls: 'dg-acc' }), arrow([[130, 174], [130, 222]], { cls: 'dg-acc' }),
    arrow([[230, 222], [230, 174]], { cls: 'dg-thin' }), arrow([[230, 124], [230, 94]], { cls: 'dg-thin' })
  ];
  return D.svg(440, 276, 'C program invoking the printf() library call, which calls the write() system call', k);
};

FIGS['unix-structure'] = () => {
  const k = [R(10, 10, 700, 30, '(the users)', { cls: 'dg-fill1', tcls: 'dg-t2' }), R(10, 46, 700, 48, 'shells and commands\ncompilers and interpreters · system libraries', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(10, 100, 700, 26, 'system-call interface to the kernel', { cls: 'dg-fill2', tcls: 'dg-t2' })];
  const col = [['signals · terminal handling\ncharacter I/O system\nterminal drivers'], ['file system · swapping\nblock I/O system\ndisk and tape drivers'], ['CPU scheduling · page replacement\ndemand paging\nvirtual memory']];
  col.forEach(([t], i) => k.push(R(10 + i * 235, 132, 230, 70, t, { cls: 'dg-fill3', tcls: 'dg-s' })));
  k.push(TX(16, 216, 'kernel', 'dg-t2 dg-acct', 'start'));
  k.push(R(10, 226, 700, 26, 'kernel interface to the hardware', { cls: 'dg-fill2', tcls: 'dg-t2' }));
  [['terminal controllers\nterminals'], ['device controllers\ndisks and tapes'], ['memory controllers\nphysical memory']].forEach(([t], i) => k.push(R(10 + i * 235, 258, 230, 48, t, { cls: 'dg-fill1', tcls: 'dg-s' })));
  return D.svg(720, 316, 'Traditional UNIX system structure: beyond simple but not fully layered', k);
};

FIGS['linux-structure'] = () => {
  const k = [R(20, 10, 420, 34, 'applications', { cls: 'dg-fill1' }), R(20, 52, 420, 34, 'glibc standard C library', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(20, 94, 420, 30, 'system-call interface', { cls: 'dg-fill2', tcls: 'dg-t2' }),
    R(20, 132, 420, 150, null, { cls: 'dg-fill3' }), TX(30, 148, 'Linux kernel', 'dg-t2 dg-acct', 'start')];
  ['file\nsystems', 'CPU\nscheduler', 'networks\n(TCP/IP)', 'memory\nmanager', 'block\ndevices', 'character\ndevices', 'network\ndevices', 'loadable\nmodules'].forEach((t, i) => {
    k.push(R(32 + (i % 4) * 102, 162 + Math.floor(i / 4) * 58, 94, 50, t, { tcls: 'dg-s', cls: i === 7 ? 'dg-fill2' : '' }));
  });
  k.push(R(20, 290, 420, 30, 'device drivers', { cls: 'dg-fill1', tcls: 'dg-t2' }), R(20, 328, 420, 32, 'hardware', { cls: 'dg-fill2' }));
  return D.svg(460, 370, 'Linux system structure: monolithic plus modular design', k);
};

FIGS['layered'] = () => {
  const k = [], cx = 210, cy = 210, rs = [190, 150, 110, 70];
  const lab = ['layer N\nuser interface', '⋮', 'layer 1', 'layer 0\nhardware'];
  rs.forEach((r, i) => k.push(sv('circle', { cx, cy, r, class: 'dg-box ' + ['dg-fill1', 'dg-fill3', 'dg-fill1', 'dg-fill2'][i] })));
  k.push(TX(cx, cy, lab[3], 'dg-t2'), TX(cx, cy - 90, lab[2], 'dg-t2'), TX(cx, cy - 130, lab[1], 'dg-t2'), TX(cx, cy - 166, lab[0], 'dg-t2'));
  return D.svg(420, 420, 'A layered operating system: layer 0 is the hardware, layer N the user interface', k, { scale: 0.95 });
};

FIGS['microkernel'] = () => {
  const k = [
    R(10, 10, 700, 120, null, { cls: 'dg-fill1', rx: 8 }), TX(24, 26, 'user mode', 'dg-t2 dg-acct', 'start'),
    R(40, 46, 160, 60, 'application\nprogram', { tcls: 'dg-t2' }), R(280, 46, 160, 60, 'file\nsystem', { tcls: 'dg-t2' }), R(520, 46, 160, 60, 'device\ndriver', { tcls: 'dg-t2' }),
    R(10, 150, 700, 92, null, { cls: 'dg-fill2', rx: 8 }), TX(24, 166, 'kernel mode · microkernel', 'dg-t2 dg-acct', 'start'),
    R(40, 182, 190, 46, 'interprocess\ncommunication', { tcls: 'dg-t2' }), R(265, 182, 190, 46, 'memory\nmanagement', { tcls: 'dg-t2' }), R(490, 182, 190, 46, 'CPU\nscheduling', { tcls: 'dg-t2' }),
    R(10, 256, 700, 34, 'hardware', { cls: 'dg-fill3' }),
    L([[120, 106], [120, 182]], { start: 'arrow', end: 'arrow' }), L([[360, 106], [150, 182]], { start: 'arrow', end: 'arrow' }), L([[600, 106], [180, 182]], { start: 'arrow', end: 'arrow' }),
    TX(250, 128, 'messages', 'dg-lbl')
  ];
  return D.svg(720, 300, 'Microkernel system structure: services run in user mode and talk by message passing', k);
};

FIGS['macos-ios'] = () => {
  const k = [R(20, 10, 420, 32, 'applications', { cls: 'dg-fill1' }), R(20, 48, 420, 32, 'user experience (Aqua / Springboard)', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(20, 86, 420, 32, 'application frameworks (Cocoa / Cocoa Touch)', { cls: 'dg-fill1', tcls: 'dg-t2' }), R(20, 124, 420, 32, 'core frameworks', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(20, 166, 420, 120, null, { cls: 'dg-fill3' }), TX(30, 182, 'kernel environment (Darwin)', 'dg-t2 dg-acct', 'start'),
    R(36, 196, 180, 40, 'Mach kernel', { cls: 'dg-fill2', tcls: 'dg-t2' }), R(244, 196, 180, 40, 'BSD', { cls: 'dg-fill2', tcls: 'dg-t2' }),
    R(36, 242, 180, 34, 'I/O kit', { tcls: 'dg-t2' }), R(244, 242, 180, 34, 'kernel extensions', { tcls: 'dg-t2' })];
  return D.svg(460, 296, 'Architecture of Apple’s macOS and iOS', k);
};

FIGS['ios-stack'] = () => D.svg(260, 196, 'iOS layers', stack(20, 10, 220, [['Cocoa Touch', 'dg-fill1', 40], ['Media Services', 'dg-fill1', 40], ['Core Services', 'dg-fill3', 40], ['Core OS', 'dg-fill2', 40]], 4), { scale: 1 });

FIGS['android-arch'] = () => {
  const k = [R(20, 10, 580, 36, 'Applications', { cls: 'dg-fill1' }), R(20, 54, 580, 36, 'Application framework', { cls: 'dg-fill1' }),
    R(20, 98, 380, 108, null, { cls: 'dg-fill3' }), TX(30, 114, 'Libraries', 'dg-t2 dg-acct', 'start')];
  ['surface\nmanager', 'media\nframework', 'SQLite', 'webkit', 'openGL', 'libc'].forEach((t, i) => k.push(R(32 + (i % 3) * 122, 124 + Math.floor(i / 3) * 40, 114, 34, t, { tcls: 'dg-s' })));
  k.push(R(410, 98, 190, 108, null, { cls: 'dg-fill2' }), TX(505, 114, 'Android runtime', 'dg-t2'), R(424, 128, 162, 30, 'core libraries', { tcls: 'dg-s' }), R(424, 164, 162, 30, 'Dalvik virtual machine', { tcls: 'dg-s' }));
  k.push(R(20, 214, 580, 36, 'Linux kernel', { cls: 'dg-fill2' }));
  return D.svg(620, 260, 'Architecture of Google’s Android', k);
};

/* ================= Chapter 3: Processes ================= */
FIGS['proc-mem'] = () => {
  const k = memCol(70, 20, 180, [['stack', 60, 'dg-fill1'], ['', 90, 'dg-fill3'], ['heap', 50, 'dg-fill1'], ['data', 44, 'dg-fill2'], ['text', 44, 'dg-fill2']], { addr: [[0, 'max'], [288, '0']] });
  k.push(arrow([[160, 84], [160, 104]], { cls: 'dg-acc' }), arrow([[160, 166], [160, 146]], { cls: 'dg-acc' }));
  return D.svg(300, 310, 'Layout of a process in memory: text, data, heap and stack', k, { scale: 1 });
};

function procStateSvg(active, edge, onPick) {
  const N = { new: [80, 50], ready: [220, 160], running: [500, 160], waiting: [360, 262], terminated: [640, 50] };
  const k = [];
  const ed = (id, pts, label, o) => L(pts, Object.assign({ end: 'arrow', label, cls: edge === id ? 'dg-acc' : '', g: 'ps-e', lcls: edge === id ? 'dg-acct' : '' }, o));
  k.push(ed('admitted', [[120, 66], [178, 140]], 'admitted', { dx: -40 }));
  k.push(ed('interrupt', D.arcPts(360, 250, 150, 301, 239, 18), 'interrupt', { dy: -12 }));
  k.push(ed('dispatch', [[262, 172], [458, 172]], 'scheduler dispatch', { dy: 14 }));
  k.push(ed('io-wait', [[490, 182], [404, 250]], 'I/O or event wait', { dx: 64, dy: 6 }));
  k.push(ed('io-done', [[316, 250], [230, 182]], 'I/O or event\ncompletion', { dx: -60, dy: 8 }));
  k.push(ed('exit', [[540, 140], [600, 66]], 'exit', { dx: 22 }));
  Object.keys(N).forEach((s) => {
    const [x, y] = N[s];
    const g = E(x, y, 56, 22, s, { cls: s === active ? 'dg-fill2' : 'dg-fill1', tcls: s === active ? 'dg-t dg-acct' : 'dg-t' });
    if (onPick) { g.style.cursor = 'pointer'; g.addEventListener('click', () => onPick(s)); }
    k.push(g);
  });
  return D.svg(720, 296, 'Diagram of process states', k);
}
FIGS['proc-state'] = () => procStateSvg(null, null);

FIGS['pcb'] = () => D.svg(240, 330, 'Process control block', stack(20, 10, 200, [['process state'], ['process number'], ['program counter'], ['registers', 'dg-fill1', 48], ['memory limits'], ['list of open files'], ['• • •', 'dg-fill3', 50]]), { scale: 1 });

FIGS['sched-queues'] = () => {
  const k = [], q = (x, y, w, lab) => {
    const g = [R(x, y, w, 30, null, { rx: 0 })];
    for (let i = 1; i < 5; i++) g.push(L([[x + w - i * 18, y], [x + w - i * 18, y + 30]], { cls: 'dg-thin' }));
    g.push(TX(x + (w - 72) / 2, y + 15, lab, 'dg-s'));
    return g;
  };
  k.push(...q(40, 20, 260, 'ready queue'), C(380, 35, 30, 'CPU', { cls: 'dg-fill2' }), arrow([[300, 35], [350, 35]], { packet: true, dur: 1.2 }), arrow([[410, 35], [470, 35]], { packet: true, dur: 1.2, delay: 0.6 }));
  const rows = [['I/O request', 'I/O wait queue', 'I/O', 90], ['time slice expired', null, null, 150], ['create child process', 'child termination\nwait queue', 'child\nterminates', 200], ['wait for an\ninterrupt', 'interrupt\nwait queue', 'interrupt\noccurs', 270]];
  rows.forEach(([a, qq, ev, y]) => {
    k.push(R(470, y - 18, 140, 36, a, { cls: 'dg-fill1', tcls: 'dg-s' }), L([[440, 35], [440, y], [470, y]], { cls: 'dg-thin' }));
    if (qq) {
      k.push(...q(170, y - 15, 230, qq.replace('\n', ' ')), L([[470, y], [400, y]], { end: 'arrow' }));
      k.push(R(60, y - 18, 80, 36, ev, { cls: 'dg-fill3', tcls: 'dg-s' }), arrow([[170, y], [140, y]]), L([[60, y], [20, y], [20, 35], [40, 35]], { end: 'arrow', cls: 'dg-thin', packet: true, pcls: 'ac', dur: 3, delay: y / 60 }));
    } else k.push(L([[470, y], [30, y], [30, 35], [40, 35]], { end: 'arrow', cls: 'dg-thin', packet: true, pcls: 'ac', dur: 4 }));
  });
  return D.svg(630, 300, 'Queueing-diagram representation of process scheduling', k);
};

FIGS['ctx-switch'] = () => {
  const k = [TX(90, 14, 'process P0', 'dg-t'), TX(330, 14, 'operating system', 'dg-t'), TX(570, 14, 'process P1', 'dg-t')];
  const bar = (x, y1, y2, run) => sv('rect', { x: x - 8, y: y1, width: 16, height: y2 - y1, class: run ? 'dg-box dg-fill2' : 'dg-box dg-fill3' });
  k.push(bar(90, 30, 90, true), TX(110, 60, 'executing', 'dg-s', 'start'), bar(90, 90, 330, false), TX(110, 210, 'idle', 'dg-s', 'start'), bar(90, 330, 400, true), TX(110, 370, 'executing', 'dg-s', 'start'));
  k.push(bar(570, 30, 140, false), TX(550, 80, 'idle', 'dg-s', 'end'), bar(570, 140, 260, true), TX(550, 200, 'executing', 'dg-s', 'end'), bar(570, 260, 400, false), TX(550, 330, 'idle', 'dg-s', 'end'));
  k.push(R(250, 96, 160, 30, 'save state into PCB0', { tcls: 'dg-s', cls: 'dg-fill1' }));
  k.push(R(250, 132, 160, 30, 'reload state from PCB1', { tcls: 'dg-s', cls: 'dg-fill1' }));
  k.push(R(250, 266, 160, 30, 'save state into PCB1', { tcls: 'dg-s', cls: 'dg-fill1' }), R(250, 302, 160, 30, 'reload state from PCB0', { tcls: 'dg-s', cls: 'dg-fill1' }));
  k.push(arrow([[98, 90], [250, 104]], { label: 'interrupt or\nsystem call', dy: -18, dx: -6 }), arrow([[410, 150], [562, 146]]));
  k.push(arrow([[562, 260], [410, 276]], { label: 'interrupt or\nsystem call', dy: -18 }), arrow([[250, 320], [98, 332]]));
  return D.svg(660, 410, 'A context switch from process P0 to P1 and back', k);
};

FIGS['fork-flow'] = () => {
  const k = [R(10, 60, 80, 36, 'parent', { cls: 'dg-fill1' }), arrow([[90, 78], [150, 78]], { label: 'pid = fork( )', dy: -12 }),
    L([[150, 78], [190, 30]], { cls: 'dg-thin' }), L([[150, 78], [190, 126]], { cls: 'dg-thin' }),
    R(190, 110, 90, 34, 'child', { cls: 'dg-fill2' }), arrow([[280, 127], [360, 127]], { label: 'exec( )', dy: -12 }), R(360, 110, 90, 34, 'new program', { tcls: 'dg-s' }), arrow([[450, 127], [520, 127]], { label: 'exit( )', dy: -12 }),
    R(190, 14, 90, 34, 'parent', { cls: 'dg-fill1' }), arrow([[280, 31], [400, 31]], { label: 'wait( )', dy: -12 }),
    L([[520, 127], [560, 31]], { end: 'arrow', dash: true, cls: 'dg-thin' }), R(560, 14, 90, 34, 'resumes', { cls: 'dg-fill1', tcls: 'dg-t2' }), L([[400, 31], [560, 31]], { dash: true, cls: 'dg-thin' })];
  return D.svg(660, 156, 'Process creation using fork(): the parent waits while the child execs a new program', k);
};

FIGS['linux-tree'] = () => {
  const k = [], node = (x, y, n, p, hl) => R(x - 54, y - 20, 108, 40, n + '\npid = ' + p, { cls: hl ? 'dg-fill2' : 'dg-fill1', tcls: 'dg-s' });
  const P = { init: [360, 26, 'init', 1], login: [130, 106, 'login', 8415], kthreadd: [360, 106, 'kthreadd', 2], sshd: [590, 106, 'sshd', 3028],
    bash: [130, 186, 'bash', 8416], khelper: [300, 186, 'khelper', 6], pdflush: [420, 186, 'pdflush', 200], sshd2: [590, 186, 'sshd', 3610],
    ps: [60, 266, 'ps', 9298], emacs: [200, 266, 'emacs', 9204], tcsch: [590, 266, 'tcsch', 4005] };
  [['init', 'login'], ['init', 'kthreadd'], ['init', 'sshd'], ['login', 'bash'], ['kthreadd', 'khelper'], ['kthreadd', 'pdflush'], ['sshd', 'sshd2'], ['bash', 'ps'], ['bash', 'emacs'], ['sshd2', 'tcsch']]
    .forEach(([a, b]) => k.push(L([[P[a][0], P[a][1] + 20], [P[b][0], P[b][1] - 20]], { cls: 'dg-thin' })));
  Object.keys(P).forEach((id) => k.push(node(P[id][0], P[id][1], P[id][2], P[id][3], id === 'init')));
  return D.svg(720, 292, 'A tree of processes on a typical Linux system', k);
};

FIGS['chrome'] = () => {
  const k = [];
  [0, 1, 2].forEach((i) => k.push(L([[180, 65], [294 + i * 120, 41]], { cls: 'dg-thin' })));
  k.push(R(10, 30, 170, 70, 'Browser\nUI · disk · network I/O', { cls: 'dg-fill2', tcls: 'dg-t2' }));
  ['Renderer\nsite A', 'Renderer\nsite B', 'Renderer\nsite C'].forEach((t, i) => k.push(R(240 + i * 120, 14, 108, 54, t, { cls: 'dg-fill1', tcls: 'dg-t2' })));
  k.push(R(240, 90, 348, 30, 'sandbox: restricted disk and network I/O', { cls: 'dg-fill3', tcls: 'dg-s', dash: true }));
  k.push(R(610, 30, 110, 70, 'Plug-in\nprocess', { cls: 'dg-fill3', tcls: 'dg-t2' }));
  return D.svg(730, 130, 'Chrome is multiprocess: one browser process, one renderer per site and plug-in processes', k);
};

FIGS['ipc-models'] = () => {
  const k = [TX(170, 14, '(a) shared memory', 'dg-t'), TX(530, 14, '(b) message passing', 'dg-t')];
  k.push(R(20, 30, 300, 60, 'process A', { cls: 'dg-fill1' }), R(20, 96, 300, 54, 'shared memory', { cls: 'dg-fill2' }), R(20, 156, 300, 60, 'process B', { cls: 'dg-fill1' }), R(20, 222, 300, 60, 'kernel', { cls: 'dg-fill3' }));
  k.push(arrow([[90, 90], [90, 108]], { cls: 'dg-acc' }), arrow([[250, 138], [250, 156]], { cls: 'dg-acc' }));
  k.push(R(380, 30, 300, 60, 'process A', { cls: 'dg-fill1' }), R(380, 96, 300, 60, 'process B', { cls: 'dg-fill1' }), R(380, 162, 300, 120, null, { cls: 'dg-fill3' }), TX(530, 270, 'kernel', 'dg-t'));
  ['m0', 'm1', 'm2', 'm3', '…', 'mn'].forEach((m, i) => k.push(R(410 + i * 40, 196, 40, 34, m, { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' })));
  k.push(TX(530, 182, 'message queue', 'dg-s'));
  k.push(arrow([[400, 90], [400, 140], [360, 140], [360, 213], [410, 213]], { cls: 'dg-acc' }), arrow([[650, 213], [700, 213], [700, 126], [680, 126]], { cls: 'dg-acc' }));
  return D.svg(720, 292, 'Communication models: (a) shared memory, (b) message passing', k);
};

FIGS['win-lpc'] = () => {
  const k = [R(20, 60, 120, 120, 'Client', { cls: 'dg-fill1' }), R(560, 60, 120, 120, 'Server', { cls: 'dg-fill1' }),
    R(270, 10, 160, 40, 'connection port', { cls: 'dg-fill2', tcls: 'dg-t2' }),
    R(220, 90, 120, 40, 'client\ncommunication port', { tcls: 'dg-s' }), R(360, 90, 120, 40, 'server\ncommunication port', { tcls: 'dg-s' }),
    R(240, 170, 220, 46, 'shared section object\n(> 256 bytes)', { cls: 'dg-fill3', tcls: 'dg-s' }),
    arrow([[140, 80], [270, 34]], { label: 'connection request', dy: -12, dx: -20 }), L([[430, 30], [600, 30], [600, 60]], { end: 'arrow', cls: 'dg-thin', label: 'handle', at: 0.6, dy: -10 }),
    L([[140, 110], [220, 110]], { start: 'arrow', end: 'arrow', label: 'handle', dy: -10 }), L([[480, 110], [560, 110]], { start: 'arrow', end: 'arrow', label: 'handle', dy: -10 }),
    L([[140, 160], [240, 192]], { start: 'arrow', end: 'arrow', cls: 'dg-thin' }), L([[560, 160], [460, 192]], { start: 'arrow', end: 'arrow', cls: 'dg-thin' })];
  return D.svg(700, 226, 'Advanced local procedure calls in Windows', k);
};

/* ================= Chapter 9: Main Memory ================= */
FIGS['base-limit'] = () => {
  const k = memCol(130, 14, 180, [['operating system', 60, 'dg-fill2'], ['process', 50], ['process', 64, 'dg-fill1'], ['process', 60], ['', 60, 'dg-fill3']],
    { addr: [[0, '0'], [60, '256000'], [110, '300040'], [174, '420940'], [234, '880000'], [294, '1024000']] });
  k.push(R(350, 104, 110, 34, '300040', { cls: 'dg-fill2', tcls: 'dg-m' }), TX(405, 152, 'base', 'dg-t2'), arrow([[350, 121], [312, 124]], { cls: 'dg-acc' }));
  k.push(R(350, 176, 110, 34, '120900', { cls: 'dg-fill2', tcls: 'dg-m' }), TX(405, 224, 'limit', 'dg-t2'));
  k.push(L([[320, 124], [334, 124], [334, 188], [320, 188]], { cls: 'dg-acc' }));
  return D.svg(480, 330, 'A base and a limit register define a logical address space', k, { scale: 1.05 });
};

FIGS['hw-protect'] = () => {
  const k = [R(10, 60, 70, 50, 'CPU', { cls: 'dg-fill1' }), D.ellipse(170, 85, 56, 30, 'address\n≥ base?', { cls: 'dg-fill3', tcls: 'dg-t2' }),
    D.ellipse(370, 85, 72, 30, 'address <\nbase + limit?', { cls: 'dg-fill3', tcls: 'dg-t2' }), R(520, 60, 110, 50, 'memory', { cls: 'dg-fill2' }),
    R(220, 170, 260, 40, 'trap to operating system:\naddressing error', { cls: 'dg-fill2', tcls: 'dg-s' }),
    TX(120, 30, 'base', 'dg-m'), TX(370, 30, 'base + limit', 'dg-m'), L([[120, 38], [150, 56]], { end: 'arrow', cls: 'dg-thin' }), L([[370, 38], [370, 55]], { end: 'arrow', cls: 'dg-thin' }),
    arrow([[80, 85], [114, 85]], { label: 'address', dy: -12, packet: true, dur: 1 }), arrow([[226, 85], [298, 85]], { label: 'yes', dy: -12, lcls: 'dg-okt', packet: true, pcls: 'ok', dur: 1.3, delay: 0.5 }), arrow([[442, 85], [520, 85]], { label: 'yes', dy: -12, lcls: 'dg-okt', packet: true, pcls: 'ok', dur: 1.3, delay: 1 }),
    arrow([[170, 115], [170, 190], [220, 190]], { label: 'no', at: 0.3, dx: 14, lcls: 'dg-badt', cls: 'dg-bad', packet: true, pcls: 'bad', dur: 2.4 }), arrow([[370, 115], [370, 170]], { label: 'no', dx: 14, lcls: 'dg-badt', cls: 'dg-bad' })];
  return D.svg(640, 220, 'Hardware address protection with base and limit registers', k);
};

FIGS['addr-format'] = () => {
  const k = [R(60, 20, 200, 40, 'page number  p', { cls: 'dg-fill1', rx: 0 }), R(260, 20, 160, 40, 'page offset  d', { cls: 'dg-fill2', rx: 0 }), TX(160, 78, 'm − n bits', 'dg-s'), TX(340, 78, 'n bits', 'dg-s')];
  return D.svg(480, 92, 'A logical address split into page number and page offset', k, { scale: 1 });
};

FIGS['paging-hw'] = () => {
  const k = [R(10, 50, 60, 44, 'CPU', { cls: 'dg-fill1' }), R(100, 52, 40, 40, 'p', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(140, 52, 40, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), TX(140, 36, 'logical address', 'dg-s'),
    R(380, 52, 40, 40, 'f', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(420, 52, 40, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), TX(420, 36, 'physical address', 'dg-s'),
    arrow([[70, 72], [100, 72]], { packet: true, dur: 0.9 }), arrow([[460, 72], [540, 72]], { packet: true, dur: 1.2, delay: 1 })];
  for (let r = 0; r < 6; r++) k.push(R(220, 130 + r * 22, 80, 22, r === 3 ? 'f' : '', { rx: 0, cls: r === 3 ? 'dg-fill2' : '', tcls: 'dg-m' }));
  k.push(TX(260, 274, 'page table', 'dg-t2'), arrow([[120, 92], [120, 207], [220, 207]], { label: 'p', at: 0.6, dx: -10, cls: 'dg-acc', dur: 2 }), arrow([[300, 207], [400, 207], [400, 92]], { cls: 'dg-acc', dur: 2, delay: 1 }), arrow([[160, 92], [160, 110], [440, 110], [440, 92]], { cls: 'dg-thin', packet: true, pcls: 'ac', dur: 2.6 }));
  k.push(R(540, 10, 140, 250, null, { cls: 'dg-fill3' }), TX(610, 274, 'physical memory', 'dg-t2'), R(540, 60, 140, 40, 'frame f', { cls: 'dg-fill2', tcls: 'dg-t2', rx: 0 }));
  return D.svg(700, 286, 'Paging hardware: the page number indexes the page table to find the frame', k);
};

FIGS['paging-model'] = () => {
  const k = [TX(80, 14, 'logical memory', 'dg-t2'), TX(250, 14, 'page table', 'dg-t2'), TX(520, 14, 'physical memory', 'dg-t2')];
  const tbl = [1, 4, 3, 7];
  for (let p = 0; p < 4; p++) {
    k.push(R(30, 30 + p * 44, 100, 44, 'page ' + p, { rx: 0, cls: 'dg-fill1', tcls: 'dg-t2' }), TX(150, 52 + p * 44, String(p), 'dg-m'));
    k.push(R(220, 40 + p * 34, 60, 34, String(tbl[p]), { rx: 0, tcls: 'dg-m' }), TX(205, 57 + p * 34, String(p), 'dg-m'));
  }
  for (let f = 0; f < 8; f++) {
    const p = tbl.indexOf(f);
    k.push(TX(440, 52 + f * 40, String(f), 'dg-m'), R(460, 32 + f * 40, 120, 40, p >= 0 ? 'page ' + p : '', { rx: 0, cls: p >= 0 ? 'dg-fill1' : 'dg-fill3', tcls: 'dg-t2' }));
  }
  k.push(TX(500, 360, 'frame number', 'dg-s'));
  return D.svg(600, 372, 'Paging model of logical and physical memory', k);
};

FIGS['free-frames'] = () => {
  const k = [TX(150, 14, '(a) before allocation', 'dg-t'), TX(520, 14, '(b) after allocation', 'dg-t')];
  const col = (x, used) => { for (let f = 13; f <= 21; f++) { const u = used[f]; k.push(TX(x - 10, 46 + (f - 13) * 30, String(f), 'dg-m', 'end'), R(x, 32 + (f - 13) * 30, 120, 30, u || '', { rx: 0, cls: u ? 'dg-fill1' : (f === 16 || f === 17 || f === 19 || f === 21) ? 'dg-fill3' : '', tcls: 'dg-s' })); } };
  k.push(R(10, 40, 100, 80, 'free-frame list\n14 13 18 20 15', { cls: 'dg-fill2', tcls: 'dg-s' }), R(10, 150, 100, 100, 'new process\npage 0 … page 3', { cls: 'dg-fill1', tcls: 'dg-s' }));
  col(170, {});
  k.push(R(380, 40, 100, 50, 'free-frame list\n15', { cls: 'dg-fill2', tcls: 'dg-s' }), R(380, 120, 100, 110, 'page table\n0 → 14\n1 → 13\n2 → 18\n3 → 20', { cls: 'dg-fill3', tcls: 'dg-s' }));
  col(540, { 14: 'page 0', 13: 'page 1', 18: 'page 2', 20: 'page 3' });
  return D.svg(680, 310, 'Free frames before and after allocating a four-page process', k);
};

FIGS['tlb'] = () => {
  const k = [R(10, 40, 60, 44, 'CPU', { cls: 'dg-fill1' }), R(100, 42, 40, 40, 'p', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(140, 42, 40, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), TX(154, 34, 'logical address', 'dg-s', 'end'),
    arrow([[70, 62], [100, 62]]), TX(300, 32, 'TLB', 'dg-t2')];
  for (let r = 0; r < 5; r++) { k.push(R(240, 40 + r * 22, 60, 22, '', { rx: 0, cls: 'dg-fill1' }), R(300, 40 + r * 22, 60, 22, '', { rx: 0, cls: 'dg-fill2' })); }
  k.push(TX(270, 160, 'page no.', 'dg-s'), TX(330, 160, 'frame no.', 'dg-s'));
  k.push(arrow([[120, 82], [120, 100], [240, 95]], { label: 'p', at: 0.2, dx: -18, packet: true, dur: 1.4 }), arrow([[360, 62], [440, 62]], { label: 'TLB hit', dy: -12, cls: 'dg-acc', lcls: 'dg-okt' }));
  k.push(R(440, 42, 40, 40, 'f', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(480, 42, 40, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), TX(496, 34, 'physical address', 'dg-s', 'end'), arrow([[520, 62], [580, 62]]));
  k.push(arrow([[160, 42], [160, 14], [500, 14], [500, 42]], { cls: 'dg-thin' }));
  for (let r = 0; r < 5; r++) k.push(R(280, 200 + r * 22, 70, 22, r === 2 ? 'f' : '', { rx: 0, tcls: 'dg-m' }));
  k.push(TX(315, 324, 'page table', 'dg-t2'), arrow([[120, 100], [120, 255], [280, 255]], { label: 'TLB miss', at: 0.75, dy: -12, cls: 'dg-bad', lcls: 'dg-badt', packet: true, pcls: 'bad', dur: 2.4 }), arrow([[350, 255], [460, 255], [460, 82]], { packet: true, pcls: 'bad', dur: 2.4, delay: 1.2 }));
  k.push(R(580, 10, 120, 300, null, { cls: 'dg-fill3' }), TX(640, 324, 'physical memory', 'dg-t2'));
  return D.svg(710, 334, 'Paging hardware with a translation look-aside buffer (TLB)', k);
};

FIGS['valid-bit'] = () => {
  const k = [TX(70, 14, 'logical pages', 'dg-t2'), TX(265, 14, 'page table', 'dg-t2'), TX(510, 14, 'physical memory', 'dg-t2')];
  const pt = [[2, 'v'], [3, 'v'], [4, 'v'], [7, 'v'], [8, 'v'], [9, 'v'], [0, 'i'], [0, 'i']];
  for (let p = 0; p < 6; p++) k.push(R(20, 30 + p * 40, 100, 40, 'page ' + p, { rx: 0, cls: 'dg-fill1', tcls: 'dg-t2' }));
  k.push(TX(140, 30, '00000', 'dg-m', 'start'), TX(140, 270, '10468', 'dg-m', 'start'), TX(140, 290, '12287', 'dg-m', 'start'));
  pt.forEach(([f, b], i) => { k.push(TX(210, 47 + i * 34, String(i), 'dg-m'), R(225, 30 + i * 34, 60, 34, String(f), { rx: 0, tcls: 'dg-m' }), R(285, 30 + i * 34, 30, 34, b, { rx: 0, cls: b === 'v' ? 'dg-fill1' : 'dg-fill2', tcls: 'dg-m' })); });
  k.push(TX(300, 330, 'valid–invalid bit', 'dg-s'), TX(255, 312, 'frame', 'dg-s'));
  for (let f = 0; f < 10; f++) {
    const p = pt.findIndex((x) => x[0] === f && x[1] === 'v');
    k.push(TX(445, 42 + f * 30, String(f), 'dg-m', 'end'), R(455, 28 + f * 30, 110, 30, p >= 0 ? 'page ' + p : '', { rx: 0, cls: p >= 0 ? 'dg-fill1' : 'dg-fill3', tcls: 'dg-s' }));
  }
  return D.svg(580, 342, 'Valid (v) or invalid (i) bit in a page table', k);
};

FIGS['shared-pages'] = () => {
  const k = [];
  const procs = [['P1', 'data 1', [3, 4, 6, 1]], ['P2', 'data 2', [3, 4, 6, 7]], ['P3', 'data 3', [3, 4, 6, 2]]];
  procs.forEach(([p, d, t], i) => {
    const x = 10 + (i % 2) * 230, y = i < 2 ? 10 : 200;
    const labs = ['ed 1', 'ed 2', 'ed 3', d];
    labs.forEach((l, r) => k.push(R(x, y + r * 34, 70, 34, l, { rx: 0, cls: r < 3 ? 'dg-fill1' : 'dg-fill2', tcls: 'dg-s' })));
    t.forEach((f, r) => k.push(R(x + 100, y + 10 + r * 28, 40, 28, String(f), { rx: 0, tcls: 'dg-m' })));
    k.push(TX(x + 35, y + 150, 'process ' + p, 'dg-t2'), TX(x + 120, y + 136, 'page table', 'dg-s'));
  });
  const mem = { 1: 'data 1', 2: 'data 3', 3: 'ed 1', 4: 'ed 2', 6: 'ed 3', 7: 'data 2' };
  for (let f = 0; f < 11; f++) k.push(TX(570, 26 + f * 32, String(f), 'dg-m', 'end'), R(580, 10 + f * 32, 110, 32, mem[f] || '', { rx: 0, cls: mem[f] ? (/ed/.test(mem[f]) ? 'dg-fill1' : 'dg-fill2') : 'dg-fill3', tcls: 'dg-s' }));
  k.push(TX(635, 372, 'physical memory', 'dg-t2'));
  return D.svg(700, 384, 'Three processes share one copy of the editor’s code pages; each has private data', k);
};

FIGS['two-level'] = () => {
  const k = [TX(80, 14, 'outer page table', 'dg-t2'), TX(290, 14, 'pages of the page table', 'dg-t2'), TX(520, 14, 'memory', 'dg-t2')];
  [1, 500, '⋮', 100, '⋮'].forEach((v, i) => k.push(R(40, 30 + i * 30, 80, 30, String(v), { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' })));
  [[40, ['1', '⋮', '500']], [150, ['100', '⋮', '708']], [260, ['900', '⋮', '929']]].forEach(([y, vs], j) => vs.forEach((v, i) => k.push(R(250, y + i * 26, 80, 26, v, { rx: 0, cls: 'dg-fill3', tcls: 'dg-m' }))));
  k.push(arrow([[120, 45], [250, 53]], { cls: 'dg-thin' }), arrow([[120, 75], [250, 163]], { cls: 'dg-thin' }), arrow([[120, 135], [250, 273]], { cls: 'dg-thin' }));
  [0, 1, 100, 500, 708, 900, 929].forEach((v, i) => k.push(TX(578, 47 + i * 40, String(v), 'dg-m', 'start'), R(480, 32 + i * 40, 90, 30, '', { rx: 0, cls: 'dg-fill1' })));
  k.push(arrow([[330, 53], [480, 87]], { cls: 'dg-thin' }), arrow([[330, 105], [480, 167]], { cls: 'dg-thin' }), arrow([[330, 163], [480, 127]], { cls: 'dg-thin' }), arrow([[330, 215], [480, 207]], { cls: 'dg-thin' }), arrow([[330, 273], [480, 247]], { cls: 'dg-thin' }), arrow([[330, 325], [480, 287]], { cls: 'dg-thin' }));
  return D.svg(620, 344, 'A two-level page-table scheme: the page table itself is paged', k);
};

FIGS['two-level-addr'] = () => {
  const k = [TX(170, 14, 'page number', 'dg-s'), TX(370, 14, 'page offset', 'dg-s'),
    R(70, 24, 100, 40, 'p1', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(170, 24, 100, 40, 'p2', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(270, 24, 200, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }),
    TX(120, 80, '10', 'dg-m'), TX(220, 80, '10', 'dg-m'), TX(370, 80, '12', 'dg-m')];
  return D.svg(540, 92, 'Two-level paging: a 32-bit address is p1 (10 bits), p2 (10 bits), d (12 bits)', k, { scale: 1 });
};

FIGS['two-level-xlate'] = () => {
  const k = [TX(130, 14, 'logical address', 'dg-s'), R(40, 24, 60, 34, 'p1', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(100, 24, 60, 34, 'p2', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(160, 24, 60, 34, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' })];
  for (let i = 0; i < 4; i++) k.push(R(60, 110 + i * 24, 70, 24, '', { rx: 0, cls: i === 2 ? 'dg-fill2' : '' }));
  k.push(TX(95, 220, 'outer page\ntable', 'dg-s'), arrow([[70, 58], [70, 170], [60, 170]], { cls: 'dg-acc' }));
  for (let i = 0; i < 4; i++) k.push(R(280, 90 + i * 24, 70, 24, '', { rx: 0, cls: i === 1 ? 'dg-fill2' : 'dg-fill3' }));
  k.push(TX(315, 200, 'page of\npage table', 'dg-s'), arrow([[130, 170], [280, 102]], { cls: 'dg-acc' }), arrow([[130, 41], [250, 41], [250, 126], [280, 126]], { cls: 'dg-thin' }));
  k.push(R(500, 40, 110, 150, null, { cls: 'dg-fill3' }), R(500, 100, 110, 40, 'desired page', { rx: 0, cls: 'dg-fill1', tcls: 'dg-s' }), arrow([[350, 126], [500, 112]], { cls: 'dg-acc' }), arrow([[220, 41], [460, 41], [460, 128], [500, 128]], { cls: 'dg-thin', label: 'd', at: 0.4, dy: -10 }));
  return D.svg(630, 236, 'Address translation for a two-level 32-bit paging architecture', k);
};

FIGS['addr-64'] = () => {
  const k = [TX(10, 16, 'two-level', 'dg-t2', 'start')];
  [['outer page  p1', 42, 'dg-fill1'], ['inner page  p2', 10, 'dg-fill1'], ['offset  d', 12, 'dg-fill2']].reduce((x, [l, b, c]) => { const w = 110 + b * 2.4; k.push(R(x, 26, w, 34, l, { rx: 0, cls: c, tcls: 'dg-m' }), TX(x + w / 2, 72, String(b), 'dg-m')); return x + w; }, 10);
  k.push(TX(10, 104, 'three-level', 'dg-t2', 'start'));
  [['2nd outer page  p1', 32, 'dg-fill1'], ['outer page  p2', 10, 'dg-fill1'], ['inner page  p3', 10, 'dg-fill1'], ['offset  d', 12, 'dg-fill2']].reduce((x, [l, b, c]) => { const w = 92 + b * 2.4; k.push(R(x, 114, w, 34, l, { rx: 0, cls: c, tcls: 'dg-m' }), TX(x + w / 2, 160, String(b), 'dg-m')); return x + w; }, 10);
  return D.svg(620, 172, 'Splitting a 64-bit logical address for two-level and three-level paging', k);
};

FIGS['hashed'] = () => {
  const k = [TX(80, 14, 'logical address', 'dg-s'), R(40, 24, 40, 34, 'p', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(80, 24, 40, 34, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }),
    R(20, 110, 100, 50, 'hash\nfunction', { cls: 'dg-fill2', tcls: 'dg-t2' }), arrow([[60, 58], [60, 110]])];
  for (let i = 0; i < 6; i++) k.push(R(180, 40 + i * 30, 60, 30, '', { rx: 0, cls: i === 3 ? 'dg-fill1' : '' }));
  k.push(TX(210, 240, 'hash table', 'dg-s'), arrow([[120, 135], [180, 135]]));
  k.push(R(300, 120, 30, 30, 'q', { rx: 0, tcls: 'dg-m' }), R(330, 120, 30, 30, 's', { rx: 0, tcls: 'dg-m' }), R(360, 120, 20, 30, '', { rx: 0 }), R(430, 120, 30, 30, 'p', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(460, 120, 30, 30, 'r', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), R(490, 120, 20, 30, '', { rx: 0 }));
  k.push(arrow([[240, 135], [300, 135]], { packet: true, dur: 1.2 }), arrow([[370, 135], [430, 135]], { packet: true, dur: 1.2, delay: 0.6 }), TX(470, 168, 'match on p', 'dg-s'));
  k.push(R(560, 24, 40, 34, 'r', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(600, 24, 40, 34, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), TX(600, 14, 'physical address', 'dg-s'), arrow([[475, 120], [475, 41], [560, 41]], { cls: 'dg-acc' }), arrow([[640, 41], [680, 41]]));
  k.push(R(680, 10, 40, 240, null, { cls: 'dg-fill3' }), TX(700, 262, 'memory', 'dg-s'));
  return D.svg(730, 272, 'Hashed page table: the page number is hashed and the chain is searched for a match', k);
};

FIGS['inverted'] = () => {
  const k = [R(10, 40, 60, 44, 'CPU', { cls: 'dg-fill1' }), TX(150, 26, 'logical address', 'dg-s'), R(90, 42, 40, 40, 'pid', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(130, 42, 40, 40, 'p', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(170, 42, 40, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }),
    arrow([[70, 62], [90, 62]]), TX(460, 26, 'physical address', 'dg-s'), R(420, 42, 40, 40, 'i', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), R(460, 42, 40, 40, 'd', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), arrow([[500, 62], [580, 62]])];
  for (let r = 0; r < 6; r++) k.push(TX(195, 132 + r * 26, r === 3 ? 'i' : '', 'dg-m', 'end'), R(200, 120 + r * 26, 60, 26, r === 3 ? 'pid' : '', { rx: 0, cls: r === 3 ? 'dg-fill2' : '', tcls: 'dg-m' }), R(260, 120 + r * 26, 40, 26, r === 3 ? 'p' : '', { rx: 0, cls: r === 3 ? 'dg-fill2' : '', tcls: 'dg-m' }));
  k.push(TX(250, 290, 'page table', 'dg-t2'), arrow([[130, 82], [130, 211], [200, 211]], { label: 'search', at: 0.6, dx: -24, cls: 'dg-acc', dur: 2 }), arrow([[300, 211], [440, 211], [440, 82]], { label: 'i', at: 0.5, dy: -10, cls: 'dg-acc', dur: 2, delay: 1 }), arrow([[190, 82], [190, 100], [480, 100], [480, 82]], { cls: 'dg-thin' }));
  k.push(R(580, 10, 110, 270, null, { cls: 'dg-fill3' }), TX(635, 292, 'physical memory', 'dg-t2'));
  return D.svg(700, 302, 'Inverted page table: one entry per physical frame, searched for <pid, p>', k);
};

FIGS['swapping'] = () => {
  const k = [R(20, 10, 220, 290, null, { cls: 'dg-fill3' }), R(20, 10, 220, 60, 'operating\nsystem', { cls: 'dg-fill2', rx: 0, tcls: 'dg-t2' }), TX(130, 120, 'user\nspace', 'dg-t2'), TX(130, 318, 'main memory', 'dg-t2'),
    R(380, 90, 160, 160, null, { cls: 'dg-fill3', rx: 18 }), TX(460, 270, 'backing store', 'dg-t2'),
    R(400, 110, 120, 44, 'process P1', { cls: 'dg-fill1', tcls: 'dg-t2' }), R(400, 186, 120, 44, 'process P2', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    R(70, 150, 120, 44, 'P1', { cls: 'dg-fill1', tcls: 'dg-t2' }),
    arrow([[190, 160], [400, 132]], { label: '① swap out', dy: -14, cls: 'dg-acc' }), arrow([[400, 208], [190, 230]], { label: '② swap in', dy: 14, cls: 'dg-acc' })];
  return D.svg(560, 330, 'Swapping of two processes using a disk as a backing store', k);
};

FIGS['swap-paging'] = () => {
  const k = [R(20, 10, 220, 290, null, { cls: 'dg-fill3' }), TX(130, 318, 'main memory', 'dg-t2'), R(400, 10, 220, 290, null, { cls: 'dg-fill3', rx: 18 }), TX(510, 318, 'backing store', 'dg-t2')];
  const mem = ['A0', '', 'B1', 'A3', '', 'A1', '', 'B0', 'A2', '', 'B3', '', '', 'A5', '', 'B2'];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const m = mem[i * 4 + j];
    k.push(R(36 + j * 50, 26 + i * 64, 42, 50, m, { rx: 0, cls: m ? (m[0] === 'A' ? 'dg-fill1' : 'dg-fill2') : '', tcls: 'dg-m' }));
    const b = (i < 2 ? 'A' : 'B') + ((i % 2) * 4 + j);
    k.push(R(416 + j * 50, 26 + i * 64, 42, 50, b, { rx: 0, cls: b[0] === 'A' ? 'dg-fill1' : 'dg-fill2', tcls: 'dg-m' }));
  }
  k.push(arrow([[240, 110], [400, 110]], { label: 'page out', dy: -12, cls: 'dg-acc' }), arrow([[400, 200], [240, 200]], { label: 'page in', dy: -12, cls: 'dg-acc' }));
  return D.svg(640, 330, 'Swapping with paging: individual pages, not whole processes, move to and from the backing store', k);
};

/* ================= Chapter 10: Virtual Memory ================= */
FIGS['demand-pt'] = () => {
  const k = [TX(60, 14, 'logical memory', 'dg-t2'), TX(215, 14, 'page table', 'dg-t2'), TX(400, 14, 'physical memory', 'dg-t2'), TX(600, 14, 'backing store', 'dg-t2')];
  const pt = { 0: 4, 2: 6, 5: 9 };
  'ABCDEFGH'.split('').forEach((c, i) => {
    k.push(TX(16, 47 + i * 34, String(i), 'dg-m', 'end'), R(24, 30 + i * 34, 70, 34, c, { rx: 0, cls: 'dg-fill1', tcls: 'dg-t2' }));
    const v = pt[i] != null;
    k.push(TX(172, 47 + i * 34, String(i), 'dg-m', 'end'), R(180, 30 + i * 34, 50, 34, v ? String(pt[i]) : '', { rx: 0, tcls: 'dg-m' }), R(230, 30 + i * 34, 30, 34, v ? 'v' : 'i', { rx: 0, cls: v ? 'dg-fill1' : 'dg-fill2', tcls: 'dg-m' }));
  });
  for (let f = 0; f < 12; f++) {
    const p = Object.keys(pt).find((x) => pt[x] === f);
    k.push(TX(342, 44 + f * 26, String(f), 'dg-m', 'end'), R(350, 31 + f * 26, 100, 26, p != null ? 'ABCDEFGH'[p] : '', { rx: 0, cls: p != null ? 'dg-fill1' : 'dg-fill3', tcls: 'dg-t2' }));
  }
  k.push(R(520, 60, 170, 200, null, { cls: 'dg-fill3', rx: 18 }));
  'ABCDEFGH'.split('').forEach((c, i) => k.push(R(536 + (i % 4) * 38, 90 + Math.floor(i / 4) * 70, 34, 50, c, { rx: 0, cls: 'dg-fill1', tcls: 'dg-t2' })));
  return D.svg(700, 346, 'Page table when some pages are not in main memory', k);
};

FIGS['page-replace-steps'] = () => {
  const k = [TX(80, 14, 'page table', 'dg-t2'), R(30, 60, 70, 32, '0   i', { rx: 0, cls: 'dg-fill2', tcls: 'dg-m' }), R(30, 92, 70, 32, 'f   v', { rx: 0, cls: 'dg-fill1', tcls: 'dg-m' }), TX(16, 76, '②', 'dg-t dg-acct'), TX(16, 108, '④', 'dg-t dg-acct'), TX(65, 46, 'frame  valid–invalid bit', 'dg-s'),
    R(250, 30, 150, 220, null, { cls: 'dg-fill3' }), R(250, 110, 150, 40, 'f  victim', { rx: 0, cls: 'dg-fill2', tcls: 'dg-t2' }), TX(325, 266, 'physical memory', 'dg-t2'),
    R(520, 50, 170, 180, null, { cls: 'dg-fill3', rx: 18 }), TX(605, 246, 'backing store', 'dg-t2'), R(560, 80, 90, 40, 'victim', { cls: 'dg-fill2', tcls: 'dg-t2' }), R(560, 160, 90, 40, 'desired page', { cls: 'dg-fill1', tcls: 'dg-s' }),
    arrow([[400, 120], [560, 100]], { label: '① swap out victim page', dy: -14, cls: 'dg-acc' }), arrow([[560, 180], [400, 140]], { label: '③ swap desired page in', dy: 18, cls: 'dg-acc' }),
    arrow([[250, 120], [100, 76]], { cls: 'dg-thin', label: 'change to invalid', dy: -12 }), arrow([[250, 140], [100, 108]], { cls: 'dg-thin', label: 'reset page table for new page', at: 0.55, dy: 18 })];
  return D.svg(700, 276, 'Page replacement in four steps', k);
};

FIGS['need-replace'] = () => {
  const k = [TX(70, 14, 'logical memory\nfor user 1', 'dg-s'), TX(70, 196, 'logical memory\nfor user 2', 'dg-s'), TX(200, 14, 'page table', 'dg-s'), TX(200, 196, 'page table', 'dg-s')];
  [['H', 'load M', 'J', 'M'], ['A', 'B', 'D', 'E']].forEach((col, u) => col.forEach((c, i) => k.push(R(30, 36 + u * 182 + i * 32, 80, 32, c, { rx: 0, cls: c === 'load M' ? 'dg-fill2' : 'dg-fill1', tcls: 'dg-t2' }))));
  [[['3', 'v'], ['4', 'v'], ['5', 'v'], ['', 'i']], [['6', 'v'], ['', 'i'], ['2', 'v'], ['7', 'v']]].forEach((col, u) => col.forEach(([f, b], i) => { k.push(R(170, 36 + u * 182 + i * 32, 40, 32, f, { rx: 0, tcls: 'dg-m' }), R(210, 36 + u * 182 + i * 32, 26, 32, b, { rx: 0, cls: b === 'v' ? 'dg-fill1' : 'dg-fill2', tcls: 'dg-m' })); }));
  const mem = ['monitor', '', 'D', 'H', 'load M', 'J', 'A', 'E'];
  mem.forEach((m, f) => k.push(TX(352, 52 + f * 36, String(f), 'dg-m', 'end'), R(360, 34 + f * 36, 120, 36, m || '(OS)', { rx: 0, cls: f < 2 ? 'dg-fill3' : 'dg-fill1', tcls: 'dg-t2' })));
  k.push(TX(420, 336, 'physical memory: no free frame', 'dg-s dg-badt'), arrow([[110, 148], [150, 148], [150, 180], [300, 180], [356, 180]], { cls: 'dg-bad', label: 'M?', at: 0.62, dy: -12, lcls: 'dg-badt' }));
  k.push(R(540, 90, 150, 200, null, { cls: 'dg-fill3', rx: 18 }), TX(615, 306, 'backing store', 'dg-t2'));
  ['A', 'B', 'D', 'E', 'H', 'J', 'M'].forEach((c, i) => k.push(R(556 + (i % 3) * 44, 110 + Math.floor(i / 3) * 56, 38, 46, c, { rx: 0, cls: 'dg-fill1', tcls: 'dg-t2' })));
  return D.svg(700, 352, 'Need for page replacement: user 1 needs page M but every frame is in use', k);
};

FIGS['faults-graph'] = () => {
  const k = [], x0 = 70, y0 = 250, w = 400, hh = 210;
  k.push(L([[x0, y0], [x0 + w, y0]], { end: 'arrow' }), L([[x0, y0], [x0, y0 - hh]], { end: 'arrow' }));
  k.push(TX(x0 + w / 2, y0 + 34, 'number of frames', 'dg-t2'), sv('text', { class: 'dg-tx dg-t2', transform: `translate(26 ${y0 - hh / 2}) rotate(-90)`, 'text-anchor': 'middle' }, 'number of page faults'));
  const pts = []; for (let i = 1; i <= 6; i++) pts.push([x0 + i * 60, y0 - 10 - 180 / Math.pow(i, 1.25)]);
  k.push(sv('path', { d: 'M' + pts.map((p) => p.join(' ')).join(' L'), class: 'dg-ln dg-acc' }));
  pts.forEach((p, i) => { k.push(sv('circle', { cx: p[0], cy: p[1], r: 4, class: 'dg-solid' }), TX(p[0], y0 + 14, String(i + 1), 'dg-m')); });
  [4, 8, 12, 16].forEach((v) => k.push(TX(x0 - 10, y0 - v * 12, String(v), 'dg-m', 'end')));
  return D.svg(500, 300, 'Expected graph of page faults versus the number of frames', k, { scale: 1 });
};

FIGS['lru-stack'] = () => {
  const ref = '4 7 0 7 1 0 1 2 1 2 7 1 2'.split(' ');
  const k = [TX(330, 14, 'reference string', 'dg-t2')];
  ref.forEach((r, i) => k.push(TX(80 + i * 44, 40, r, 'dg-m dg-b')));
  k.push(TX(80 + 7 * 44 + 22, 64, 'a', 'dg-t dg-acct'), TX(80 + 10 * 44 + 22, 64, 'b', 'dg-t dg-acct'), L([[80 + 7 * 44 + 22, 52], [80 + 7 * 44 + 22, 80]], { cls: 'dg-acc' }), L([[80 + 10 * 44 + 22, 52], [80 + 10 * 44 + 22, 80]], { cls: 'dg-acc' }));
  [[150, ['2', '1', '0', '7', '4'], 'stack before a'], [430, ['7', '2', '1', '0', '4'], 'stack after b']].forEach(([x, s, t]) => {
    s.forEach((v, i) => k.push(R(x, 100 + i * 34, 60, 34, v, { rx: 0, cls: i === 0 ? 'dg-fill2' : 'dg-fill1', tcls: 'dg-m' })));
    k.push(TX(x + 30, 290, t, 'dg-s'), TX(x - 10, 117, 'top', 'dg-s', 'end'), TX(x - 10, 253, 'bottom', 'dg-s', 'end'));
  });
  k.push(arrow([[230, 185], [400, 185]], { cls: 'dg-thin', label: 'references 2 1 2 7', dy: -12 }));
  return D.svg(660, 300, 'Use of a stack to record the most recent page references', k);
};

FIGS['second-chance'] = () => {
  const k = [TX(150, 14, '(a) before', 'dg-t'), TX(500, 14, '(b) after', 'dg-t')];
  const col = (x, bits, ptr, lab) => {
    bits.forEach((b, i) => { k.push(R(x, 40 + i * 36, 40, 36, String(b), { rx: 0, cls: b ? 'dg-fill2' : 'dg-fill1', tcls: 'dg-m' }), R(x + 40, 40 + i * 36, 80, 36, '', { rx: 0, cls: 'dg-fill3' })); });
    k.push(TX(x + 20, 30, 'ref. bit', 'dg-s'), TX(x + 80, 30, 'pages', 'dg-s'), arrow([[x - 70, 58 + ptr * 36], [x, 58 + ptr * 36]], { cls: 'dg-acc', label: lab, at: 0.1, dy: -12 }));
    k.push(L([[x + 120, 58], [x + 140, 58], [x + 140, 40 + bits.length * 36 - 18], [x + 120, 40 + bits.length * 36 - 18]], { start: 'arrow', cls: 'dg-thin' }));
  };
  col(110, [0, 0, 1, 1, 0, 1, 1, 1], 2, 'next victim');
  col(460, [0, 0, 0, 0, 1, 1, 1, 1], 4, '');
  k.push(TX(570, 362, 'pages with bit 1 got a second chance (bit cleared);\nthe first page with bit 0 is replaced', 'dg-s'));
  return D.svg(700, 384, 'Second-chance (clock) page-replacement algorithm', k);
};
