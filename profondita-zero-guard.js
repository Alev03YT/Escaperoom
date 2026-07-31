/* Compatibilità vecchie build: forza il caricamento dell'index aggiornato. */
(() => {
  const BUILD = '202607312148';
  const hasV3 = [...document.scripts].some(s => (s.getAttribute('src') || '').includes('profondita-zero-v3.js'));

  if (hasV3) return;

  const key = `escapeverse-depth-migration-${BUILD}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  const url = new URL(window.location.href);
  url.searchParams.set('build', BUILD);
  window.location.replace(url.toString());
})();
