/* ===================== page.js : mounts code blocks, figures, demos and quizzes ===================== */
function mountPage(root) {
  root = root || document;
  const fail = (ph, what, e) => { ph.append(h('p', { class: 'bad' }, `This ${what} could not start: ${e.message}`)); if (window.console) console.error(e); };
  root.querySelectorAll('pre.code:not([data-hl])').forEach((pre) => {
    try { CLang.render(pre.textContent, pre, { nums: !pre.classList.contains('nonum'), marks: pre.getAttribute('data-mark'), start: +pre.getAttribute('data-start') || 1 }); } catch (e) { /* leave plain text */ }
  });
  root.querySelectorAll('figure.fig[data-fig]').forEach((fig) => {
    const id = fig.getAttribute('data-fig');
    try { fig.insertBefore(h('div', { class: 'fig-box' }, FIGS[id]()), fig.querySelector('figcaption')); } catch (e) { fail(fig, 'figure', e); }
  });
  root.querySelectorAll('[data-demo]').forEach((ph) => {
    const id = ph.getAttribute('data-demo');
    try { DEMOS[id](ph); } catch (e) { fail(ph, 'demo', e); }
  });
  /* terminals with a Run button: the output types itself in, line by line */
  root.querySelectorAll('.console.runnable').forEach((con) => {
    const body = con.querySelector('.console-body'), b = con.querySelector('.run-btn'), cmd = con.getAttribute('data-cmd'), out = con.getAttribute('data-out').split('\n');
    let timer = null;
    const idle = () => { body.innerHTML = ''; body.append(h('span', { class: 'prompt' }, '$ '), cmd, '\n', h('span', { class: 'cursor' }, ' ')); };
    idle();
    b.addEventListener('click', () => {
      if (timer) clearInterval(timer);
      idle(); body.lastChild.remove();
      let i = 0;
      timer = setInterval(() => {
        if (i >= out.length) { clearInterval(timer); timer = null; body.append(h('span', { class: 'prompt' }, '$ '), h('span', { class: 'cursor' }, ' ')); b.textContent = '↻ Run again'; return; }
        body.append(out[i++] + '\n');
      }, 380);
    });
  });
  root.querySelectorAll('.quiz-host').forEach((ph) => {
    const j = ph.parentNode.querySelector('script.quiz-json');
    if (j) mountQuiz(ph, JSON.parse(j.textContent), ph.getAttribute('data-quiz-key'));
  });
}
