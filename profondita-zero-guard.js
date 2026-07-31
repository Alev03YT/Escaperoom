/* Profondità Zero — blocco definitivo del motore generico */
(() => {
  function protect(selector, active, handler) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.addEventListener('click', event => {
      if (!active()) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      handler(element, event);
    }, true);
  }

  const isDepthRoom = () => typeof selected !== 'undefined' && selected && selected.id === 'sottomarino';

  protect('#playBtn', isDepthRoom, (button, event) => {
    if (typeof button.onclick === 'function') button.onclick.call(button, event);
  });

  protect('#hintBtn', isDepthRoom, (button, event) => {
    if (typeof button.onclick === 'function') button.onclick.call(button, event);
  });

  protect('#notesBtn', isDepthRoom, (button, event) => {
    if (typeof button.onclick === 'function') button.onclick.call(button, event);
  });
})();
