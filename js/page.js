/* ===================== page.js : mounts code blocks, figures, demos and quizzes ===================== */
function mountPage(root) {
  root = root || document;
  const fail = (ph, what, e) => { ph.append(h('p', { class: 'bad' }, `This ${what} could not start: ${e.message}`)); if (window.console) console.error(e); };
  root.querySelectorAll('pre.code:not([data-hl])').forEach((pre) => {
    try { CLang.render(pre.textContent, pre, { nums: !pre.classList.contains('nonum'), marks: pre.getAttribute('data-mark') }); } catch (e) { /* leave plain text */ }
  });
  root.querySelectorAll('figure.fig[data-fig]').forEach((fig) => {
    const id = fig.getAttribute('data-fig');
    try { fig.insertBefore(h('div', { class: 'fig-box' }, FIGS[id]()), fig.querySelector('figcaption')); } catch (e) { fail(fig, 'figure', e); }
  });
  root.querySelectorAll('[data-demo]').forEach((ph) => {
    const id = ph.getAttribute('data-demo');
    try { DEMOS[id](ph); } catch (e) { fail(ph, 'demo', e); }
  });
  root.querySelectorAll('.quiz-host').forEach((ph) => {
    const j = ph.parentNode.querySelector('script.quiz-json');
    if (j) mountQuiz(ph, JSON.parse(j.textContent), ph.getAttribute('data-quiz-key'));
  });
}
