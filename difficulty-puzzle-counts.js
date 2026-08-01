/* EscapeVerse 1.0 — numero enigmi per difficoltà
   Facile 5 · Intermedio 6 · Difficile 8 · Incubo 10 */
(() => {
  if (typeof rooms !== 'undefined' && Array.isArray(rooms)) {
    const counts = {
      easy: 5,
      medium: 6,
      hard: 8,
      nightmare: 10
    };

    rooms.forEach(room => {
      room.puzzles = counts[room.difficulty] ?? room.puzzles;
    });
  }

  function loadIntermediateFinalPuzzles() {
    if (document.querySelector('script[data-intermediate-final-puzzles]')) return;
    const script = document.createElement('script');
    script.src = 'intermediate-final-puzzles.js?v=202608010801';
    script.dataset.intermediateFinalPuzzles = 'true';
    document.body.appendChild(script);
  }

  /* Attende che tutti i motori delle stanze abbiano finito di registrarsi,
     poi applica il controllo finale senza essere sovrascritto. */
  if (document.readyState === 'complete') loadIntermediateFinalPuzzles();
  else window.addEventListener('load', loadIntermediateFinalPuzzles, { once: true });
})();
