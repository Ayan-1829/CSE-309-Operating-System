/* ===================== diagram.js : small SVG kit for DFD, UML and process diagrams ===================== */
/* Every shape is plain SVG styled by classes in style.css (dg-*), so diagrams follow light/dark mode.
   Coordinates are in viewBox units; a 13-unit label renders at about 16px when the figure is at full size. */
const D = (() => {
  const LH = 15.5;

  function svg(w, hh, label, kids, opt) {
    opt = opt || {};
    return sv('svg', {
      viewBox: `0 0 ${w} ${hh}`, class: 'dg' + (opt.cls ? ' ' + opt.cls : ''), role: 'img', 'aria-label': label,
      /* drawn up to 1.45x larger than first designed so 13-unit labels stay readable on a projector */
      style: { maxWidth: Math.round(w * (opt.scale || 1.22) * 1.45) + 'px', minWidth: Math.round(w * (opt.min || 0.62) * 1.35) + 'px' }
    }, kids);
  }

  /* text, centred on (x, y); "\n" makes extra lines */
  function T(x, y, str, cls, anchor) {
    const lines = String(str).split('\n');
    const y0 = y - (lines.length - 1) * LH / 2;
    return sv('text', { class: 'dg-tx ' + (cls || ''), 'text-anchor': anchor || 'middle' },
      lines.map((ln, i) => sv('tspan', { x, y: y0 + i * LH, dy: '.35em' }, ln)));
  }

  const pathD = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  function unit(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; }
  function along(pts, f) {
    let total = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(L); total += L; }
    let d = total * f;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) { const t = seg[i] ? Math.min(1, d / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; }
      d -= seg[i];
    }
    return pts[0];
  }
  const HEADLEN = { tri: 14, dia: 18, odia: 18 };
  /* arrowheads drawn as shapes (no <marker>), u = unit vector pointing into the tip */
  function head(type, tip, u, cls) {
    const n = [-u[1], u[0]];
    const P = (a, b) => [tip[0] - u[0] * a + n[0] * b, tip[1] - u[1] * a + n[1] * b];
    const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    if (type === 'arrow') return sv('polygon', { points: pts([tip, P(11, 5), P(11, -5)]), class: 'dg-ah ' + cls });
    if (type === 'open') return sv('polyline', { points: pts([P(11, 6), tip, P(11, -6)]), class: 'dg-ln dg-head ' + cls });
    if (type === 'tri') return sv('polygon', { points: pts([tip, P(14, 8), P(14, -8)]), class: 'dg-hollow ' + cls });
    if (type === 'dia') return sv('polygon', { points: pts([tip, P(9, 6), P(18, 0), P(9, -6)]), class: 'dg-ah ' + cls });
    if (type === 'odia') return sv('polygon', { points: pts([tip, P(9, 6), P(18, 0), P(9, -6)]), class: 'dg-hollow ' + cls });
    if (type === 'x') return sv('path', { d: `M${tip[0] - 8} ${tip[1] - 8} L${tip[0] + 8} ${tip[1] + 8} M${tip[0] + 8} ${tip[1] - 8} L${tip[0] - 8} ${tip[1] + 8}`, class: 'dg-ln dg-bold ' + cls });
    if (type === 'dot') return sv('circle', { cx: tip[0], cy: tip[1], r: 6, class: 'dg-solid ' + cls });
    return null;
  }

  /* polyline edge. o: end/start ('arrow'|'open'|'tri'|'dia'|'odia'|'dot'), dash, cls, label, at (0..1), dx, dy, anchor, lcls */
  function line(pts, o) {
    o = o || {};
    const orig = pts;
    pts = pts.map((p) => p.slice());
    const cls = o.cls || '', kids = [];
    let sH = null, eH = null;
    if (o.end) {
      const n = pts.length, u = unit(pts[n - 2], pts[n - 1]), L = HEADLEN[o.end] || 0;
      eH = head(o.end, pts[n - 1].slice(), u, cls);
      pts[n - 1] = [pts[n - 1][0] - u[0] * L, pts[n - 1][1] - u[1] * L];
    }
    if (o.start) {
      const u = unit(pts[1], pts[0]), L = HEADLEN[o.start] || 0;
      sH = head(o.start, pts[0].slice(), u, cls);
      pts[0] = [pts[0][0] - u[0] * L, pts[0][1] - u[1] * L];
    }
    kids.push(sv('path', { d: pathD(pts), class: 'dg-ln ' + (o.dash ? 'dg-dash ' : '') + cls }));
    if (sH) kids.push(sH);
    if (eH) kids.push(eH);
    if (o.label != null && o.label !== '') {
      const p = along(orig, o.at == null ? 0.5 : o.at);
      kids.push(T(p[0] + (o.dx || 0), p[1] + (o.dy || 0), o.label, 'dg-lbl ' + (o.lcls || ''), o.anchor));
    }
    return sv('g', { class: 'dg-edge' + (o.g ? ' ' + o.g : '') }, kids);
  }

  /* points along a circular arc (for curved arrows) */
  function arcPts(cx, cy, r, a0, a1, n) {
    n = n || 16; const out = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return out;
  }
  /* point on a circle's edge facing (tx, ty) */
  function edge(cx, cy, r, tx, ty) { const u = unit([cx, cy], [tx, ty]); return [cx + u[0] * r, cy + u[1] * r]; }

  function rect(x, y, w, hh, label, o) {
    o = o || {};
    return sv('g', { class: 'dg-node ' + (o.g || '') },
      sv('rect', { x, y, width: w, height: hh, rx: o.rx == null ? 6 : o.rx, class: 'dg-box ' + (o.cls || '') + (o.dash ? ' dg-dash' : '') }),
      label != null ? T(x + w / 2, y + hh / 2, label, o.tcls || 'dg-t') : null);
  }
  function circle(cx, cy, r, label, o) {
    o = o || {};
    return sv('g', { class: 'dg-node ' + (o.g || '') },
      sv('circle', { cx, cy, r, class: 'dg-box ' + (o.cls || '') + (o.dash ? ' dg-dash' : '') }),
      label != null ? T(cx, cy, label, o.tcls || 'dg-t') : null);
  }
  function ellipse(cx, cy, rx, ry, label, o) {
    o = o || {};
    return sv('g', { class: 'dg-node ' + (o.g || '') },
      sv('ellipse', { cx, cy, rx, ry, class: 'dg-box ' + (o.cls || 'dg-fill1') + (o.dash ? ' dg-dash' : '') }),
      label != null ? T(cx, cy, label, o.tcls || 'dg-t') : null);
  }
  /* data store drawn open on the right, with an id compartment (e.g. D1) */
  function store(x, y, w, hh, id, label, o) {
    o = o || {};
    return sv('g', { class: 'dg-node ' + (o.g || '') },
      sv('rect', { x, y, width: w, height: hh, class: 'dg-fillonly ' + (o.cls || 'dg-fill3') }),
      sv('path', { d: `M${x + w} ${y} H${x} V${y + hh} H${x + w}`, class: 'dg-ln dg-strong' }),
      id ? sv('path', { d: `M${x + 34} ${y} V${y + hh}`, class: 'dg-ln dg-strong' }) : null,
      id ? T(x + 17, y + hh / 2, id, 'dg-t') : null,
      T(id ? x + 34 + (w - 34) / 2 : x + w / 2, y + hh / 2, label, 'dg-t'));
  }
  /* Yourdon two-line store (no id compartment) */
  function store2(x, y, w, hh, label) {
    return sv('g', { class: 'dg-node' },
      sv('rect', { x, y, width: w, height: hh, class: 'dg-fillonly dg-fill3' }),
      sv('path', { d: `M${x} ${y} H${x + w} M${x} ${y + hh} H${x + w}`, class: 'dg-ln dg-strong' }),
      T(x + w / 2, y + hh / 2, label, 'dg-t'));
  }
  /* stick-figure actor; (cx, top) is the top of the head */
  function actor(cx, top, label, o) {
    o = o || {};
    return sv('g', { class: 'dg-actor ' + (o.g || '') },
      sv('circle', { cx, cy: top + 9, r: 9, class: 'dg-box dg-fill1' }),
      sv('path', { d: `M${cx} ${top + 18} V${top + 42} M${cx - 16} ${top + 27} H${cx + 16} M${cx} ${top + 42} L${cx - 13} ${top + 62} M${cx} ${top + 42} L${cx + 13} ${top + 62}`, class: 'dg-ln dg-strong' }),
      label ? T(cx, top + 78, label, 'dg-t') : null);
  }
  function startDot(cx, cy) { return sv('circle', { cx, cy, r: 9, class: 'dg-solid' }); }
  function endDot(cx, cy) { return sv('g', null, sv('circle', { cx, cy, r: 12, class: 'dg-box' }), sv('circle', { cx, cy, r: 7, class: 'dg-solid' })); }

  /* UML class box. spec: {name, stereo, abstract, attrs:[], ops:[], cls, hl} -> {el, x, y, w, h, ...ports} */
  function umlClass(x, y, w, spec) {
    const attrs = spec.attrs || [], ops = spec.ops || [];
    const headH = spec.stereo ? 40 : 28, rowH = 17, pad = 6;
    const aH = spec.mini ? 10 : (attrs.length ? attrs.length * rowH + pad * 2 - 4 : 12);
    const oH = spec.mini ? 10 : (ops.length ? ops.length * rowH + pad * 2 - 4 : 12);
    const hh = headH + aH + oH;
    const k = [
      sv('rect', { x, y, width: w, height: hh, rx: 3, class: 'dg-box ' + (spec.cls || '') }),
      sv('rect', { x, y, width: w, height: headH, rx: 3, class: 'dg-fillonly ' + (spec.headCls || 'dg-fill1') }),
      sv('rect', { x, y, width: w, height: hh, rx: 3, class: 'dg-outline' + (spec.hl ? ' dg-hl' : '') }),
      sv('path', { d: `M${x} ${y + headH} H${x + w} M${x} ${y + headH + aH} H${x + w}`, class: 'dg-ln dg-sep' })
    ];
    if (spec.stereo) k.push(T(x + w / 2, y + 13, '«' + spec.stereo + '»', 'dg-s'));
    k.push(T(x + w / 2, y + (spec.stereo ? 28 : 14), spec.name, 'dg-t' + (spec.abstract ? ' dg-i' : '')));
    attrs.forEach((a, i) => k.push(T(x + 8, y + headH + pad + 6 + i * rowH, a, 'dg-m' + (/^\/\/?/.test(a) ? '' : ''), 'start')));
    ops.forEach((a, i) => {
      const it = a.charAt(0) === '~';
      k.push(T(x + 8, y + headH + aH + pad + 6 + i * rowH, it ? a.slice(1) : a, 'dg-m' + (it ? ' dg-i' : ''), 'start'));
    });
    const el = sv('g', { class: 'dg-class' + (spec.g ? ' ' + spec.g : ''), 'data-name': spec.name }, k);
    const box = { el, x, y, w, h: hh, cx: x + w / 2, cy: y + hh / 2 };
    box.top = (f) => [x + w * (f == null ? 0.5 : f), y];
    box.bottom = (f) => [x + w * (f == null ? 0.5 : f), y + hh];
    box.left = (f) => [x, y + hh * (f == null ? 0.5 : f)];
    box.right = (f) => [x + w, y + hh * (f == null ? 0.5 : f)];
    return box;
  }

  return { svg, T, line, head, arcPts, edge, rect, circle, ellipse, store, store2, actor, startDot, endDot, umlClass, along, unit };
})();

/* ---------- sequence diagram builder ----------
   spec = { w, top, parts:[{id, label, actor, x}], items:[ ... ] }
   item kinds: {m:[from, to, label, type]} type = sync|reply|async|self|create|destroy|found|lost,
               {frag:'alt'|'opt'|'loop', guard, x1, x2}, {els:'[guard]'}, {end:true}, {gap:n}, {note:[x, text]}
   upto: messages numbered above 'upto' are drawn faint (used by the step-through demo). */
function seqDiagram(spec, upto, label) {
  const k = [], parts = {}, top = spec.top || 14, headH = spec.headH || 40;
  spec.parts.forEach((p) => { parts[p.id] = p; });
  let y = top + headH + (spec.firstGap || 26);
  const used = {}, msgs = [], frags = [], stack = [];
  let n = 0;
  spec.items.forEach((it) => {
    if (it.gap) { y += it.gap; return; }
    if (it.frag) { const f = { type: it.frag, guard: it.guard, x1: it.x1, x2: it.x2, y1: y - 8, els: [], step: n + 1 }; stack.push(f); frags.push(f); y += 28; return; }
    if (it.els) { const f = stack[stack.length - 1]; f.els.push({ y: y - 4, guard: it.els }); y += 26; return; }
    if (it.end) { const f = stack.pop(); f.y2 = y - 6; y += 16; return; }
    if (it.note) { msgs.push({ note: it.note, y }); y += it.noteH || 36; return; }
    n++;
    const [a, b, text, type] = it.m;
    const m = { a, b, text, type: type || 'sync', y, n };
    msgs.push(m);
    [a, b].forEach((id) => { if (!parts[id]) return; used[id] = used[id] || { first: y, last: y }; used[id].first = Math.min(used[id].first, y); used[id].last = Math.max(used[id].last, y); });
    y += m.type === 'self' ? 44 : 36;
  });
  const bottom = y + 8, H = bottom + 14;
  const faint = (s) => (upto != null && s > upto ? ' dg-future' : '') + (upto != null && s === upto ? ' dg-hl' : '');
  frags.forEach((f) => {
    k.push(sv('g', { class: 'dg-frag' + faint(f.step) },
      sv('rect', { x: f.x1, y: f.y1, width: f.x2 - f.x1, height: f.y2 - f.y1, class: 'dg-fragbox' }),
      sv('path', { d: `M${f.x1} ${f.y1 + 20} H${f.x1 + 44} L${f.x1 + 52} ${f.y1 + 12} V${f.y1}`, class: 'dg-ln' }),
      D.T(f.x1 + 22, f.y1 + 10, f.type, 'dg-t'),
      D.T(f.x1 + 60, f.y1 + 10, f.guard, 'dg-s dg-guard', 'start'),
      f.els.map((e) => [sv('path', { d: `M${f.x1} ${e.y} H${f.x2}`, class: 'dg-ln dg-dash' }), D.T(f.x1 + 10, e.y + 11, e.guard, 'dg-s dg-guard', 'start')])));
  });
  spec.parts.forEach((p) => {
    const x = p.x;
    if (p.actor) k.push(D.actor(x, top - 6, null), D.T(x, top + headH + 18 - 6, p.label, 'dg-t'));
    else k.push(D.rect(x - (p.w || 110) / 2, top, p.w || 110, headH - 6, p.label, { cls: 'dg-fill1', rx: 3, tcls: 'dg-t dg-u' }));
    const lTop = p.actor ? top + headH + 30 : top + headH - 6;
    k.push(sv('path', { d: `M${x} ${lTop} V${bottom}`, class: 'dg-ln dg-dash dg-life' }));
    const u = used[p.id];
    if (u && !p.noAct) k.push(sv('rect', { x: x - 5, y: Math.min(u.first, lTop + 4) - (p.actor ? 0 : 6), width: 10, height: (u.last - Math.min(u.first, lTop + 4)) + 14, class: 'dg-box dg-act' }));
  });
  msgs.forEach((m) => {
    if (m.note) { k.push(D.rect(m.note[0], m.y - 12, m.note[2] || 200, 28, m.note[1], { cls: 'dg-fill2', rx: 2, tcls: 'dg-s' })); return; }
    const A = parts[m.a], B = parts[m.b];
    const cls = faint(m.n);
    const lbl = (spec.numbered === false ? '' : m.n + ': ') + m.text;
    if (m.type === 'self') {
      const x = A.x + 5;
      k.push(sv('g', { class: 'dg-msg' + cls }, D.line([[x, m.y - 6], [x + 34, m.y - 6], [x + 34, m.y + 14], [x + 1, m.y + 14]], { end: 'arrow' }), D.T(x + 42, m.y + 4, lbl, 'dg-s dg-mlbl', 'start')));
      return;
    }
    if (m.type === 'found' || m.type === 'lost') {
      const tx = (m.type === 'found' ? B.x : A.x), dir = m.type === 'found' ? 1 : -1;
      const x1 = m.type === 'found' ? tx - 150 : tx + 5, x2 = m.type === 'found' ? tx - 5 : tx + 150;
      k.push(sv('g', { class: 'dg-msg' + cls }, D.line([[x1, m.y], [x2, m.y]], { end: 'arrow', start: m.type === 'found' ? 'dot' : null }),
        m.type === 'lost' ? sv('circle', { cx: x2 + 6, cy: m.y, r: 6, class: 'dg-solid' }) : null,
        D.T((x1 + x2) / 2, m.y - 11, lbl, 'dg-s dg-mlbl')));
      return void dir;
    }
    const dir = B.x > A.x ? 1 : -1;
    let x1 = A.x + 5 * dir, x2 = B.x - 5 * dir;
    if (m.type === 'create') x2 = B.x - dir * ((B.w || 110) / 2);
    const o = { end: m.type === 'reply' || m.type === 'async' || m.type === 'create' ? 'open' : 'arrow', dash: m.type === 'reply' || m.type === 'create' };
    const g = sv('g', { class: 'dg-msg' + cls }, D.line([[x1, m.y], [x2, m.y]], o), D.T((x1 + x2) / 2, m.y - 11, lbl, 'dg-s dg-mlbl'));
    if (m.type === 'destroy') g.append(D.head('x', [B.x, m.y + 16], [1, 0], ''));
    k.push(g);
  });
  return D.svg(spec.w, spec.h || H, label || 'Sequence diagram', k, { scale: spec.scale || 1.2, min: spec.min });
}
