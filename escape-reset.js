(() => {
  const $ = (s) => document.querySelector(s);
  const GAME_SECONDS = 12 * 60;
  let timerId = null;
  let state = null;
  let selectedItem = null;

  const screens = ['home', 'briefing', 'game', 'ending'];
  function show(id) {
    screens.forEach((name) => $('#' + name).classList.toggle('active', name === id));
    window.scrollTo(0, 0);
  }

  function modal(html) {
    $('#modalContent').innerHTML = html;
    $('#modal').classList.remove('hidden');
  }

  function closeModal() {
    $('#modal').classList.add('hidden');
  }

  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateTimer() {
    $('#timer').textContent = formatTime(state.time);
  }

  function inventory() {
    const box = $('#items');
    box.innerHTML = state.inventory.length
      ? state.inventory.map((item) => `<button class="item ${selectedItem === item.name ? 'selected' : ''}" data-item="${item.name}"><span>${item.icon}</span>${item.name}</button>`).join('')
      : '<span style="color:#697586;font-size:.8rem">Vuoto</span>';
    box.querySelectorAll('[data-item]').forEach((button) => {
      button.onclick = () => {
        selectedItem = selectedItem === button.dataset.item ? null : button.dataset.item;
        inventory();
      };
    });
  }

  function addItem(name, icon) {
    if (!state.inventory.some((item) => item.name === name)) {
      state.inventory.push({ name, icon });
    }
    inventory();
  }

  function removeItem(name) {
    state.inventory = state.inventory.filter((item) => item.name !== name);
    if (selectedItem === name) selectedItem = null;
    inventory();
  }

  function chosen(name) {
    return selectedItem === name && state.inventory.some((item) => item.name === name);
  }

  function renderRoom() {
    const f = state.flags;
    $('#roomObjects').innerHTML = `
      <div class="room"><div class="wall-lines"></div><div class="door"></div><div class="desk"></div><div class="clock"></div><div class="frame"></div><div class="drawer"></div>
      <button class="hot h-frame ${f.frame ? 'done' : ''}" data-hot="frame" aria-label="Quadro"></button>
      <button class="hot h-clock ${f.clock ? 'done' : ''}" data-hot="clock" aria-label="Orologio"></button>
      <button class="hot h-drawer ${f.drawer ? 'done' : ''}" data-hot="drawer" aria-label="Cassetto"></button>
      <button class="hot h-door ${f.door ? 'done' : ''}" data-hot="door" aria-label="Porta"></button>
      <div class="status">Esamina la stanza. Ogni oggetto serve una sola volta.</div></div>`;
    $('#roomObjects').querySelectorAll('[data-hot]').forEach((button) => {
      button.onclick = () => inspect(button.dataset.hot);
    });
  }

  function startGame() {
    clearInterval(timerId);
    state = {
      time: GAME_SECONDS,
      hints: 3,
      hintsUsed: 0,
      step: 0,
      notes: [],
      inventory: [],
      flags: {},
      escaped: false
    };
    selectedItem = null;
    $('#hintCount').textContent = state.hints;
    renderRoom();
    inventory();
    updateTimer();
    show('game');
    modal('<h2>Stanza 01 — L’Ufficio Chiuso</h2><p>La porta si è bloccata alle tue spalle. Sul muro resta acceso soltanto un vecchio orologio.</p><p>Hai 12 minuti per completare quattro enigmi e uscire.</p><button id="introClose" class="primary">INIZIA</button>');
    setTimeout(() => { const b = $('#introClose'); if (b) b.onclick = closeModal; }, 0);
    timerId = setInterval(() => {
      if (state.time > 0 && !state.escaped) {
        state.time -= 1;
        updateTimer();
      } else if (!state.escaped) {
        clearInterval(timerId);
        modal('<h2>Tempo scaduto</h2><p>La serratura si blocca definitivamente.</p><button id="retry" class="primary">RIPROVA</button>');
        setTimeout(() => { const b = $('#retry'); if (b) b.onclick = () => { closeModal(); startGame(); }; }, 0);
      }
    }, 1000);
  }

  function inspect(id) {
    if (id === 'frame') return framePuzzle();
    if (id === 'clock') return clockPuzzle();
    if (id === 'drawer') return drawerPuzzle();
    if (id === 'door') return doorPuzzle();
  }

  function framePuzzle() {
    if (state.flags.frame) {
      return modal('<h2>Quadro numerato</h2><p>Dietro il quadro hai già trovato il biglietto.</p>');
    }
    state.flags.frame = true;
    state.step = 1;
    state.notes.push('Il quadro porta il numero 47. Dietro c’è scritto: “Il tempo si fermò alle dieci e dieci”.');
    addItem('Biglietto piegato', '📝');
    renderRoom();
    modal('<h2>1. Il quadro</h2><p>Stacchi il quadro dalla parete.</p><div class="clue">NUMERO 47<br>“IL TEMPO SI FERMÒ ALLE DIECI E DIECI”</div>');
  }

  function clockPuzzle() {
    if (!state.flags.frame) {
      return modal('<h2>Orologio</h2><p>Le lancette sono mobili, ma non sai ancora su quale ora fermarle.</p>');
    }
    if (state.flags.clock) {
      return modal('<h2>Orologio</h2><p>È già regolato sulle 10:10.</p>');
    }
    modal('<h2>2. Regola l’orologio</h2><p>Inserisci l’ora indicata dal biglietto senza i due punti.</p><div class="code"><input id="clockCode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="clockTry">PROVA</button></div><p id="clockMsg"></p>');
    setTimeout(() => {
      $('#clockTry').onclick = () => {
        if ($('#clockCode').value === '1010') {
          state.flags.clock = true;
          state.step = 2;
          state.notes.push('Orologio regolato alle 10:10. Ha espulso una piccola chiave.');
          addItem('Chiave del cassetto', '🗝️');
          renderRoom();
          $('#clockMsg').innerHTML = '<span class="success">Un piccolo vano si apre sotto il quadrante.</span>';
        } else {
          $('#clockMsg').innerHTML = '<span class="error">L’orologio torna indietro.</span>';
        }
      };
    }, 0);
  }

  function drawerPuzzle() {
    if (!state.flags.clock) {
      return modal('<h2>Cassetto</h2><p>È chiuso a chiave.</p>');
    }
    if (state.flags.drawer) {
      return modal('<h2>Cassetto</h2><p>Dentro non è rimasto altro.</p>');
    }
    if (!chosen('Chiave del cassetto')) {
      return modal('<h2>Cassetto</h2><p>Seleziona la Chiave del cassetto nell’inventario e tocca di nuovo il cassetto.</p>');
    }
    removeItem('Chiave del cassetto');
    state.flags.drawer = true;
    state.step = 3;
    state.notes.push('Nel cassetto: una tessera con 47 e la frase “numero del quadro + ultimi due numeri dell’ora”.');
    addItem('Tessera della porta', '💳');
    renderRoom();
    modal('<h2>3. Il cassetto</h2><p>La chiave gira. Dentro trovi una tessera magnetica.</p><div class="clue">47 + ULTIME DUE CIFRE DELL’ORA</div>');
  }

  function doorPuzzle() {
    if (!state.flags.drawer) {
      return modal('<h2>Porta</h2><p>Il lettore non riconosce ancora nessuna tessera.</p>');
    }
    if (!chosen('Tessera della porta')) {
      return modal('<h2>Porta</h2><p>Seleziona la Tessera della porta nell’inventario.</p>');
    }
    modal('<h2>4. Serratura finale</h2><p>Combina il numero del quadro con le ultime due cifre dell’ora.</p><div class="code"><input id="doorCode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="doorTry">APRI</button></div><p id="doorMsg"></p>');
    setTimeout(() => {
      $('#doorTry').onclick = () => {
        if ($('#doorCode').value === '4710') {
          state.flags.door = true;
          state.escaped = true;
          clearInterval(timerId);
          removeItem('Tessera della porta');
          closeModal();
          const elapsed = GAME_SECONDS - state.time;
          localStorage.setItem('escapeResetRoom1', JSON.stringify({ completed: true, best: elapsed }));
          $('#finalTime').textContent = formatTime(elapsed);
          show('ending');
        } else {
          $('#doorMsg').innerHTML = '<span class="error">Codice errato.</span>';
        }
      };
    }, 0);
  }

  function useHint() {
    if (state.hints <= 0) return modal('<h2>Indizi terminati</h2><p>Controlla appunti e inventario.</p>');
    const hints = [
      'Comincia dal quadro con il numero 47.',
      'Regola l’orologio sulle 10:10: inserisci 1010.',
      'Seleziona la chiave nell’inventario e apri il cassetto.',
      'Seleziona la tessera. Il codice finale è numero del quadro + ultime due cifre dell’ora.'
    ];
    state.hints -= 1;
    state.hintsUsed += 1;
    $('#hintCount').textContent = state.hints;
    modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step, hints.length - 1)]}</p>`);
  }

  $('#openRoom').onclick = () => show('briefing');
  $('#backHome').onclick = () => show('home');
  $('#play').onclick = startGame;
  $('#exit').onclick = () => modal('<h2>Uscire?</h2><p>La partita attuale verrà persa.</p><button id="confirmExit" class="primary">ESCI</button>');
  document.addEventListener('click', (event) => {
    if (event.target.id === 'confirmExit') {
      clearInterval(timerId);
      closeModal();
      show('home');
    }
  });
  $('#hint').onclick = useHint;
  $('#notes').onclick = () => modal(`<h2>Appunti</h2>${state.notes.length ? '<ul>' + state.notes.map((note) => `<li>${note}</li>`).join('') + '</ul>' : '<p>Nessun appunto.</p>'}`);
  $('#audio').onclick = () => modal('<h2>Audio</h2><p>Gli effetti sonori verranno aggiunti dopo aver verificato che la struttura della prima stanza funzioni perfettamente.</p>');
  $('#closeModal').onclick = closeModal;
  $('#modal').onclick = (event) => { if (event.target.id === 'modal') closeModal(); };
  $('#endingHome').onclick = () => show('home');
})();