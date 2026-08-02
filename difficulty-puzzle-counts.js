/* EscapeVerse 1.0 — numero enigmi per difficoltà
   Facile 5 · Intermedio 6 · Difficile 8 · Incubo 10 */
(() => {
  if (typeof rooms !== 'undefined' && Array.isArray(rooms)) {
    const counts = { easy: 5, medium: 6, hard: 8, nightmare: 10 };
    rooms.forEach(room => { room.puzzles = counts[room.difficulty] ?? room.puzzles; });
  }

  function loadScriptOnce(src, marker) {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.dataset[marker] = 'true';
    document.body.appendChild(script);
  }

  function loadStyleOnce(href, marker) {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset[marker] = 'true';
    document.head.appendChild(link);
  }

  function loadFinalRooms() {
    loadScriptOnce('intermediate-final-puzzles.js?v=202608010801', 'intermediateFinalPuzzles');
    loadStyleOnce('nave-eos-v1.css?v=202608022205', 'naveEosStyle');
    loadScriptOnce('nave-eos-v1.js?v=202608022205', 'naveEosEngine');
  }

  /* I motori dedicati vengono caricati per ultimi, così intercettano
     il pulsante prima del motore generico della stanza. */
  if (document.readyState === 'complete') loadFinalRooms();
  else window.addEventListener('load', loadFinalRooms, { once: true });
})();
