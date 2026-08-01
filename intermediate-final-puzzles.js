/* Finali intermedi reali — Museo, Bunker Omega, Profondità Zero */
(() => {
  const originalFinish = window.finish;
  if (typeof originalFinish !== 'function') return;

  const completed = new Set();
  const roomId = () => window.selected && window.selected.id;

  function openPuzzle(html, setup) {
    if (typeof window.modal !== 'function') return;
    window.modal(html);
    setTimeout(setup, 0);
  }

  function complete(id) {
    completed.add(id);
    if (window.state) {
      window.state.flags = window.state.flags || {};
      window.state.flags.intermediateFinalPuzzle = true;
      window.state.notes = window.state.notes || [];
      const notes = {
        museo: 'Enigma finale completato: i fasci di luce sono stati riallineati.',
        bunker: 'Enigma finale completato: energia distribuita ai sistemi vitali.',
        sottomarino: 'Enigma finale completato: rotta di risalita confermata.'
      };
      if (notes[id] && !window.state.notes.includes(notes[id])) window.state.notes.push(notes[id]);
    }
    setTimeout(() => originalFinish(), 350);
  }

  function museumPuzzle() {
    const chosen = [];
    openPuzzle(`
      <h2>Ultimo enigma — Sala degli specchi</h2>
      <p>Il portone resta bloccato: tre specchi devono riflettere la luce nell’ordine indicato dai reperti.</p>
      <div class="final-puzzle-grid">
        <button data-final="2">II</button><button data-final="6">VI</button><button data-final="4">IV</button>
      </div>
      <p id="finalPuzzleMessage"></p>`, () => {
      document.querySelectorAll('[data-final]').forEach(button => button.onclick = () => {
        chosen.push(button.dataset.final);
        button.disabled = true;
        if (chosen.length === 3) {
          const message = document.querySelector('#finalPuzzleMessage');
          if (chosen.join('') === '264') {
            message.innerHTML = '<span class="success">I fasci convergono sul portone.</span>';
            complete('museo');
          } else {
            chosen.length = 0;
            document.querySelectorAll('[data-final]').forEach(x => x.disabled = false);
            message.innerHTML = '<span class="error">La luce si disperde. Riprova.</span>';
          }
        }
      });
    });
  }

  function bunkerPuzzle() {
    const chosen = [];
    openPuzzle(`
      <h2>Ultimo enigma — Ripartitore Omega</h2>
      <p>Prima di aprire il portello devi alimentare, nell’ordine, ventilazione, comunicazioni e serratura.</p>
      <div class="final-puzzle-grid">
        <button data-final="V">VENT</button><button data-final="C">COM</button><button data-final="S">LOCK</button>
      </div>
      <p id="finalPuzzleMessage"></p>`, () => {
      document.querySelectorAll('[data-final]').forEach(button => button.onclick = () => {
        chosen.push(button.dataset.final);
        button.disabled = true;
        if (chosen.length === 3) {
          const message = document.querySelector('#finalPuzzleMessage');
          if (chosen.join('') === 'VCS') {
            message.innerHTML = '<span class="success">Energia stabile. Portello autorizzato.</span>';
            complete('bunker');
          } else {
            chosen.length = 0;
            document.querySelectorAll('[data-final]').forEach(x => x.disabled = false);
            message.innerHTML = '<span class="error">Sovraccarico evitato. Sequenza annullata.</span>';
          }
        }
      });
    });
  }

  function depthPuzzle() {
    const chosen = [];
    openPuzzle(`
      <h2>Ultimo enigma — Triangolazione di risalita</h2>
      <p>Conferma la rotta usando i dati raccolti: settore, ora e minuti.</p>
      <div class="final-puzzle-grid">
        <button data-final="52">52</button><button data-final="04">04</button><button data-final="37">37</button>
      </div>
      <p id="finalPuzzleMessage"></p>`, () => {
      document.querySelectorAll('[data-final]').forEach(button => button.onclick = () => {
        chosen.push(button.dataset.final);
        button.disabled = true;
        if (chosen.length === 3) {
          const message = document.querySelector('#finalPuzzleMessage');
          if (chosen.join('-') === '52-04-37') {
            message.innerHTML = '<span class="success">Rotta confermata. Inizio risalita.</span>';
            complete('sottomarino');
          } else {
            chosen.length = 0;
            document.querySelectorAll('[data-final]').forEach(x => x.disabled = false);
            message.innerHTML = '<span class="error">Coordinate incompatibili.</span>';
          }
        }
      });
    });
  }

  window.finish = function () {
    const id = roomId();
    if (!['museo', 'bunker', 'sottomarino'].includes(id) || completed.has(id)) {
      return originalFinish.apply(this, arguments);
    }
    if (id === 'museo') return museumPuzzle();
    if (id === 'bunker') return bunkerPuzzle();
    return depthPuzzle();
  };

  const style = document.createElement('style');
  style.textContent = `
    .final-puzzle-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
    .final-puzzle-grid button{min-height:56px;border:1px solid #4f8192;border-radius:12px;background:#102730;color:#e9fbff;font-weight:800;letter-spacing:1px}
    .final-puzzle-grid button:disabled{opacity:.42;transform:scale(.97)}
  `;
  document.head.appendChild(style);
})();
