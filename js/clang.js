/* ===================== clang.js : C / pseudocode syntax highlighting ===================== */
const CLang = (() => {
  const KW = new Set(('auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while bool boolean true false NULL monitor procedure condition semaphore atomic_int pid_t size_t DWORD WINAPI PVOID').split(' '));
  const LIT = new Set(['true', 'false', 'NULL']);
  const NUM = /^(0[xX][0-9a-fA-F]+|\d+(\.\d+)?)/;

  /* returns [{c: class|'', t: text}] for the whole source */
  function tokens(src) {
    const out = []; let i = 0; const n = src.length;
    const push = (c, t) => out.push({ c, t });
    while (i < n) {
      const ch = src[i], rest = src.slice(i);
      if (rest.startsWith('//')) { let j = src.indexOf('\n', i); if (j < 0) j = n; push('com', src.slice(i, j)); i = j; continue; }
      if (rest.startsWith('/*')) { let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; push('com', src.slice(i, j)); i = j; continue; }
      if (ch === '#' && (i === 0 || src[i - 1] === '\n' || /^\s*$/.test(src.slice(src.lastIndexOf('\n', i - 1) + 1, i)))) {
        const m = /^#\s*\w+/.exec(rest); if (m) { push('an', m[0]); i += m[0].length; continue; }
      }
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < n && src[j] !== ch && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
        push('str', src.slice(i, j + 1)); i = j + 1; continue;
      }
      if (ch === '<' && /^#\s*include\s*$/.test(src.slice(src.lastIndexOf('\n', i - 1) + 1, i).trim() + ' ')) {
        const m = /^<[\w./]+>/.exec(rest); if (m) { push('str', m[0]); i += m[0].length; continue; }
      }
      if (/[0-9]/.test(ch)) { const m = NUM.exec(rest); if (m && m[0]) { push('num', m[0]); i += m[0].length; continue; } }
      if (/[A-Za-z_]/.test(ch)) {
        const m = /^[A-Za-z_]\w*/.exec(rest), w = m[0];
        let j = i + w.length; while (j < n && src[j] === ' ') j++;
        let c = '';
        if (LIT.has(w)) c = 'lit';
        else if (KW.has(w)) c = 'kw';
        else if (src[j] === '(') c = 'fn';
        else if (/^[A-Z][A-Z0-9_]+$/.test(w)) c = 'cst';
        else if (/_t$/.test(w)) c = 'ty';
        push(c, w); i += w.length; continue;
      }
      if (/\s/.test(ch)) { const m = /^\s+/.exec(rest); push('', m[0]); i += m[0].length; continue; }
      push('op', ch); i++;
    }
    return out;
  }
  function lines(src) {
    const res = [[]];
    tokens(src.replace(/\t/g, '    ')).forEach(({ c, t }) => {
      t.split('\n').forEach((p, k) => { if (k > 0) res.push([]); if (p) res[res.length - 1].push({ c, t: p }); });
    });
    return res;
  }
  function lineEl(toks, num, opts) {
    const body = h('span', { class: 'cc' }, toks.map(({ c, t }) => (c ? h('span', { class: 'tk-' + c }, t) : t)), toks.length ? null : ' ');
    return h('span', { class: 'cl', 'data-n': num }, opts.nums === false ? null : h('span', { class: 'cn', 'aria-hidden': 'true' }, String(num)), body);
  }
  function parseMarks(s) {
    const set = new Set();
    (s || '').split(',').forEach((p) => { const m = /^\s*(\d+)(?:-(\d+))?\s*$/.exec(p); if (!m) return; const a = +m[1], b = m[2] ? +m[2] : a; for (let k = a; k <= b; k++) set.add(k); });
    return set;
  }
  /* render source into an existing <pre class="code"> (or a new one) */
  function render(src, pre, opts = {}) {
    pre = pre || h('pre', { class: 'code' });
    const code = h('code', { class: 'language-c' });
    const marks = parseMarks(opts.marks), st = opts.start || 1;   /* start: first line number of a listing split across slides */
    lines(src.replace(st > 1 ? /\s+$/g : /^\n+|\s+$/g, '')).forEach((toks, k) => {
      const el = lineEl(toks, k + st, opts);
      if (marks.has(k + st)) el.classList.add('mk');
      code.append(el);
    });
    clear(pre).append(code);
    if (opts.nums === false) pre.classList.add('nonum');
    pre.setAttribute('data-hl', '1');
    return pre;
  }
  function highlightAll(root) {
    (root || document).querySelectorAll('pre.code:not([data-hl])').forEach((pre) => {
      render(pre.textContent, pre, { marks: pre.getAttribute('data-mark'), nums: !pre.classList.contains('nonum'), start: +pre.getAttribute('data-start') || 1 });
    });
  }
  return { tokens, lines, render, highlightAll, lineEl };
})();
