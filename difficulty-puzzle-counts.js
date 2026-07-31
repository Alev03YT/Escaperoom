/* EscapeVerse 1.0 — numero enigmi per difficoltà
   Facile 5 · Intermedio 6 · Difficile 8 · Incubo 10 */
(() => {
  if (typeof rooms === 'undefined' || !Array.isArray(rooms)) return;

  const counts = {
    easy: 5,
    medium: 6,
    hard: 8,
    nightmare: 10
  };

  rooms.forEach(room => {
    room.puzzles = counts[room.difficulty] ?? room.puzzles;
  });
})();
