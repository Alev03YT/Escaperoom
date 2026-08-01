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

  /* Carica i veri enigmi aggiuntivi delle stanze intermedie.
     Il parametro versione impedisce di usare una copia precedente. */
  if (!document.querySelector('script[data-intermediate-final-puzzles]')) {
    const script = document.createElement('script');
    script.src = 'intermediate-final-puzzles.js?v=202608010759';
    script.dataset.intermediateFinalPuzzles = 'true';
    document.head.appendChild(script);
  }
})();
