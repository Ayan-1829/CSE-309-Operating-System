/* ===================== art.js : one decorative illustration per topic ===================== */
/* Shown on each topic's title slide and as a thumbnail in the topic list.
   Mount with <span class="topic-art" data-art="3" aria-hidden="true"></span>; colours come from the
   theme variables, so the drawings follow light and dark mode. */
const TOPIC_ART = (() => {
  const bg = '<circle cx="200" cy="165" r="142" class="ta-bg"/>';
  const head = (id) => `<defs><marker id="ta${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ta-fill-ink"/></marker></defs>`;
  const arrow = (id) => `marker-end="url(#ta${id})"`;
  return {
    /* 1. Introduction: users, programs, OS and hardware as a stack */
    1: `${bg}
      <rect x="96" y="58" width="208" height="42" rx="10" class="ta-soft1"/><text x="200" y="86" class="ta-s">users</text>
      <rect x="96" y="108" width="208" height="42" rx="10" class="ta-card"/><text x="200" y="136" class="ta-s">applications</text>
      <rect x="96" y="158" width="208" height="46" rx="10" class="ta-ac"/><text x="200" y="188" class="ta-t ta-on-ac">OS</text>
      <rect x="96" y="212" width="208" height="56" rx="10" class="ta-bar"/>
      <rect x="116" y="226" width="40" height="28" rx="5" class="ta-acc"/><rect x="166" y="226" width="56" height="28" rx="5" class="ta-faint"/><rect x="232" y="226" width="52" height="28" rx="5" class="ta-faint"/>`,
    /* 2. OS services: a terminal making a system call */
    2: `${bg}${head(2)}
      <rect x="74" y="64" width="252" height="168" rx="14" class="ta-card"/>
      <rect x="74" y="64" width="252" height="30" rx="14" class="ta-bar"/><rect x="74" y="80" width="252" height="14" class="ta-bar"/>
      <circle cx="96" cy="79" r="6" class="ta-dot1"/><circle cx="116" cy="79" r="6" class="ta-dot2"/><circle cx="136" cy="79" r="6" class="ta-dot3"/>
      <text x="96" y="132" class="ta-m" style="text-anchor:start">$ cp a b</text>
      <text x="96" y="166" class="ta-m" style="text-anchor:start;opacity:.6">open() read()</text>
      <rect x="96" y="186" width="14" height="22" class="ta-acc"/>
      <path d="M300,232 V276" class="ta-line" ${arrow(2)}/><rect x="236" y="276" width="128" height="34" rx="10" class="ta-ac"/><text x="300" y="299" class="ta-s ta-on-ac">kernel</text>`,
    /* 3. Processes: a process tree */
    3: `${bg}
      <path d="M200,92 L120,178 M200,92 L280,178 M120,178 L84,258 M120,178 L156,258 M280,178 L280,258" class="ta-line"/>
      <circle cx="200" cy="84" r="30" class="ta-ac"/><text x="200" y="91" class="ta-s ta-on-ac">init</text>
      <circle cx="120" cy="178" r="26" class="ta-soft1"/><circle cx="280" cy="178" r="26" class="ta-soft2"/>
      <circle cx="84" cy="258" r="20" class="ta-card"/><circle cx="156" cy="258" r="20" class="ta-card"/><circle cx="280" cy="258" r="20" class="ta-acc"/>`,
    /* 4. Main memory: frames and a page table */
    4: `${bg}
      <rect x="70" y="80" width="90" height="176" rx="8" class="ta-card"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="80" y="${92 + i * 40}" width="70" height="32" rx="5" class="${['ta-ac', 'ta-acc', 'ta-ok', 'ta-faint'][i]}"/>`).join('')}
      <rect x="226" y="52" width="104" height="232" rx="8" class="ta-card"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="236" y="${62 + i * 31}" width="84" height="25" rx="4" class="${{ 1: 'ta-acc', 3: 'ta-ac', 5: 'ta-ok' }[i] || 'ta-faint'}"/>`).join('')}
      <path d="M160,108 C196,108 196,170 236,170 M160,148 C196,148 196,76 236,76 M160,188 C196,188 196,232 236,232" class="ta-line-thin"/>`,
    /* 5. Virtual memory: pages moving between memory and disk */
    5: `${bg}${head(5)}
      <rect x="64" y="70" width="120" height="190" rx="10" class="ta-card"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="78" y="${84 + i * 42}" width="92" height="34" rx="5" class="${['ta-ac', 'ta-faint', 'ta-acc', 'ta-faint'][i]}"/>`).join('')}
      <ellipse cx="300" cy="104" rx="66" ry="20" class="ta-soft2"/><path d="M234,104 V226 A66,20 0 0 0 366,226 V104" class="ta-soft2"/>
      <ellipse cx="300" cy="104" rx="66" ry="20" class="ta-soft2"/>
      <path d="M190,138 C220,120 230,130 246,140" class="ta-line" ${arrow(5)}/><path d="M246,200 C226,212 214,206 190,190" class="ta-line" ${arrow(5)}/>`,
    /* 6. Threads: one process, several threads */
    6: `${bg}
      <rect x="84" y="56" width="232" height="56" rx="12" class="ta-card"/>
      <rect x="100" y="70" width="60" height="28" rx="6" class="ta-faint"/><rect x="170" y="70" width="60" height="28" rx="6" class="ta-faint"/><rect x="240" y="70" width="60" height="28" rx="6" class="ta-faint"/>
      ${[0, 1, 2].map((i) => { const x = 130 + i * 70; return `<path d="M${x},124 q16,22 0,44 q-16,22 0,44 q16,22 0,44" class="ta-strand-${['ac', 'acc', 'ok'][i]}"/><circle cx="${x}" cy="262" r="10" class="ta-tip-${['ac', 'acc', 'ok'][i]}"/>`; }).join('')}`,
    /* 7. CPU scheduling: a Gantt chart and a clock */
    7: `${bg}
      <rect x="62" y="98" width="276" height="136" rx="12" class="ta-card"/>
      <rect x="78" y="118" width="90" height="24" rx="5" class="ta-ac"/><rect x="168" y="118" width="40" height="24" rx="5" class="ta-acc"/><rect x="208" y="118" width="110" height="24" rx="5" class="ta-ok"/>
      <rect x="78" y="152" width="40" height="24" rx="5" class="ta-acc"/><rect x="118" y="152" width="120" height="24" rx="5" class="ta-ac"/><rect x="238" y="152" width="80" height="24" rx="5" class="ta-faint"/>
      <path d="M78,198 H318" class="ta-line-thin"/>
      <circle cx="310" cy="88" r="40" class="ta-soft2"/><path d="M310,88 V62 M310,88 L330,98" class="ta-line"/>`,
    /* 8. Synchronization: a padlock guarding a critical section */
    8: `${bg}
      <path d="M150,150 V112 A50,50 0 0 1 250,112 V150" class="ta-shackle"/>
      <rect x="118" y="146" width="164" height="124" rx="16" class="ta-ac"/>
      <circle cx="200" cy="196" r="16" class="ta-paper"/><rect x="194" y="200" width="12" height="36" rx="5" class="ta-paper"/>
      <circle cx="96" cy="250" r="20" class="ta-soft1"/><circle cx="304" cy="250" r="20" class="ta-soft2"/>`,
    /* 9. Deadlocks: a circular wait */
    9: `${bg}${head(9)}
      <path d="M136,110 A90,90 0 0 1 270,104" class="ta-line" ${arrow(9)}/><path d="M290,140 A90,90 0 0 1 250,254" class="ta-line" ${arrow(9)}/>
      <path d="M214,266 A90,90 0 0 1 112,220" class="ta-line" ${arrow(9)}/><path d="M104,184 A90,90 0 0 1 114,136" class="ta-line" ${arrow(9)}/>
      <circle cx="122" cy="118" r="30" class="ta-ac"/><text x="122" y="125" class="ta-s ta-on-ac">P1</text>
      <rect x="252" y="96" width="60" height="50" rx="8" class="ta-soft2"/><text x="282" y="127" class="ta-s">R1</text>
      <circle cx="270" cy="236" r="30" class="ta-acc"/><text x="270" y="243" class="ta-s ta-on-ac">P2</text>
      <rect x="84" y="196" width="60" height="50" rx="8" class="ta-soft1"/><text x="114" y="227" class="ta-s">R2</text>`
  };
})();

(function mountTopicArt() {
  document.querySelectorAll('[data-art]').forEach((el) => {
    const art = TOPIC_ART[el.getAttribute('data-art')];
    if (art) el.innerHTML = `<svg viewBox="0 0 400 320" class="ta-svg" focusable="false">${art}</svg>`;
  });
})();
