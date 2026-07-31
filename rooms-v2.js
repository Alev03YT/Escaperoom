/* EscapeVerse — router prioritario stanze premium */
(() => {
  const $ = (s) => document.querySelector(s);
  const sea = { selected: null, sonar: [], switches: [], valves: [] };

  const isDepth = () => typeof selected !== 'undefined' && selected?.id === 'sottomarino';
  const has = (name) => state?.inventory?.some((item) => item.name === name);
  const chosen = (name) => sea.selected === name && has(name);
  const note = (text) => { if (!state.notes.includes(text)) state.notes.push(text); };

  function status(text) {
    const el = $('.depth-status');
    if (!el) return;
    el.textContent = text;
    clearTimeout(status.timer);
    status.timer = setTimeout(() => {
      if ($('.depth-status')) $('.depth-status').textContent = 'Ripristina ossigeno e riporta il sottomarino in superficie';
    }, 2400);
  }

  function renderInventoryDepth() {
    const box = $('#inventoryItems');
    box.innerHTML = state.inventory.length
      ? state.inventory.map((item) => `<button class="inventory-item depth-inv ${sea.selected === item.name ? 'selected' : ''}" data-depth-item="${item.name}"><span>${item.icon}</span>${item.name}</button>`).join('')
      : '<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-depth-item]').forEach((button) => {
      button.onclick = () => {
        sea.selected = sea.selected === button.dataset.depthItem ? null : button.dataset.depthItem;
        renderInventoryDepth();
        status(sea.selected ? `${sea.selected} selezionato` : 'Oggetto deselezionato');
      };
    });
  }

  function addItem(name, icon) {
    if (!has(name)) state.inventory.push({ name, icon });
    renderInventoryDepth();
  }

  function removeItem(name) {
    state.inventory = state.inventory.filter((item) => item.name !== name);
    if (sea.selected === name) sea.selected = null;
    renderInventoryDepth();
  }

  const hot = (id, label, solved = false) => `<button class="depth-hot depth-hit-${id} ${solved ? 'solved' : ''}" data-depth="${id}" aria-label="${label}"><span>${label}</span></button>`;

  function drawDepthScene() {
    const f = state.flags;
    document.body.classList.add('depth-active');
    $('#sceneBackdrop').style.background = 'transparent';
    $('#sceneObjects').innerHTML = `<div class="depth-scene ${f.power ? 'power-on' : ''} ${f.oxygen ? 'oxygen-on' : ''} ${f.hatch ? 'hatch-open' : ''}">
      <div class="depth-wall"></div><div class="depth-floor"></div>
      <div class="depth-window"><div class="depth-creature"></div></div>
      <div class="depth-sonar"><i></i><b>SONAR</b></div>
      <div class="depth-clock">04:37</div>
      <div class="depth-safe"><span>SETTORE 52</span></div>
      <div class="depth-panel"><b>ENERGIA</b><i></i><i></i><i></i></div>
      <div class="depth-valves"><i></i><i></i><i></i></div>
      <div class="depth-console"><span>ASSETTO</span><div></div></div>
      <div class="depth-hatch"><div class="wheel"></div></div>
      <div class="depth-oxygen">O₂ ${f.oxygen ? 'STABILE' : '18%'}</div>
      ${hot('sonar', 'Sonar', f.sonar)}${hot('clock', 'Orologio di bordo', f.clock)}${hot('safe', 'Cassaforte', f.safe)}${hot('panel', 'Quadro elettrico', f.panel)}${hot('valves', 'Valvole di zavorra', f.valves)}${hot('console', 'Console di assetto', f.console)}${hot('hatch', 'Camera stagna', f.hatch)}
      <div class="depth-bubbles"></div><div class="depth-vignette"></div>
      <div class="depth-status">Ripristina ossigeno e riporta il sottomarino in superficie</div>
    </div>`;
    document.querySelectorAll('[data-depth]').forEach((button) => button.onclick = () => inspectDepth(button.dataset.depth));
  }

  function startDepth() {
    clearInterval(timerId);
    state = { time: selected.minutes * 60, hints: 3, hintsUsed: 0, step: 0, inventory: [], notes: [], escaped: false, flags: {} };
    sea.selected = null; sea.sonar = []; sea.switches = []; sea.valves = [];
    $('#gameCase').textContent = 'CASO 06';
    $('#gameTitle').textContent = 'Profondità Zero';
    $('#hintCount').textContent = '3';
    drawDepthScene(); renderInventoryDepth(); updateTimer(); show('game');
    setTimeout(() => modal('<h2>Profondità Zero</h2><p>Il sottomarino è fermo sul fondale. Lo scafo geme, l’ossigeno è al 18% e il sonar rileva una presenza enorme oltre l’oblò.</p><button id="depthStart" class="action-btn">ENTRA NELLA SALA DI CONTROLLO</button>'), 60);
    setTimeout(() => { const b = $('#depthStart'); if (b) b.onclick = closeModal; }, 120);
    timerId = setInterval(() => {
      if (state.time > 0 && !state.escaped) { state.time--; updateTimer(); }
      else if (!state.escaped) { clearInterval(timerId); modal('<h2>Ossigeno esaurito</h2><p>Le luci si spengono mentre qualcosa urta lo scafo dall’esterno.</p><button id="depthRetry" class="action-btn">RIPROVA</button>'); setTimeout(() => { const b = $('#depthRetry'); if (b) b.onclick = () => { closeModal(); startDepth(); }; }, 0); }
    }, 1000);
  }

  function inspectDepth(id) {
    ({ sonar: sonarPuzzle, clock: clockPuzzle, safe: safePuzzle, panel: panelPuzzle, valves: valvesPuzzle, console: consolePuzzle, hatch: hatchPuzzle }[id] || (() => {}))();
  }

  function sonarPuzzle() {
    if (state.flags.sonar) return modal('<h2>Sonar</h2><p>La traccia è decodificata: immersione 04:37, settore 52.</p>');
    sea.sonar = [];
    modal('<h2>Sonar</h2><p>Riproduci l’eco rilevato: <strong>breve – lungo – breve</strong>.</p><div class="depth-puzzle"><button data-sonar="B">•</button><button data-sonar="L">—</button><button data-sonar="B">•</button></div><p id="depthMsg"></p>');
    setTimeout(() => document.querySelectorAll('[data-sonar]').forEach((b) => b.onclick = () => {
      sea.sonar.push(b.dataset.sonar); b.disabled = true;
      if (sea.sonar.length === 3) {
        if (sea.sonar.join('') === 'BLB') { state.flags.sonar = true; state.step = 1; addItem('Diario di bordo', '📘'); note('Immersione 04:37, settore 52.'); drawDepthScene(); $('#depthMsg').innerHTML = '<span class="success">ECO DECODIFICATO</span>'; }
        else { sea.sonar = []; document.querySelectorAll('[data-sonar]').forEach((x) => x.disabled = false); $('#depthMsg').innerHTML = '<span class="error">Sequenza errata.</span>'; }
      }
    }), 0);
  }

  function clockPuzzle() {
    if (!has('Diario di bordo')) return modal('<h2>Orologio di bordo</h2><p>Il quadrante è bloccato. Serve prima un riferimento temporale.</p>');
    if (state.flags.clock) return modal('<h2>Orologio di bordo</h2><p>Sincronizzato sulle 04:37.</p>');
    modal('<h2>Sincronizzazione</h2><p>Inserisci l’ora dell’immersione senza i due punti.</p><div class="code-input"><input id="depthClock" inputmode="numeric" maxlength="4" placeholder="0000"><button id="depthClockBtn">SINCRONIZZA</button></div><p id="depthClockMsg"></p>');
    setTimeout(() => $('#depthClockBtn').onclick = () => {
      if ($('#depthClock').value === '0437') { state.flags.clock = true; state.step = 2; addItem('Chiave nautica', '🗝️'); note('L’orologio ha liberato una chiave nautica.'); drawDepthScene(); $('#depthClockMsg').innerHTML = '<span class="success">SINCRONIZZATO</span>'; }
      else $('#depthClockMsg').innerHTML = '<span class="error">Orario errato.</span>';
    }, 0);
  }

  function safePuzzle() {
    if (state.flags.safe) return modal('<h2>Cassaforte</h2><p>È già stata svuotata.</p>');
    if (!chosen('Chiave nautica')) return modal('<h2>Cassaforte</h2><p>Seleziona nell’inventario la chiave nautica.</p>');
    removeItem('Chiave nautica'); state.flags.safe = true; state.step = 3; addItem('Schema elettrico', '📋'); note('Schema: interruttori 5 → 2 → 4. Valvole: sinistra → centro → destra.'); drawDepthScene();
    modal('<h2>Cassaforte aperta</h2><p>Trovi lo schema dei sistemi di emergenza.</p><p class="tool-success">INTERRUTTORI 5–2–4<br>VALVOLE ← • →</p>');
  }

  function panelPuzzle() {
    if (!has('Schema elettrico')) return modal('<h2>Quadro elettrico</h2><p>Tre circuiti sono fuori fase. Serve uno schema.</p>');
    if (state.flags.panel) return modal('<h2>Quadro elettrico</h2><p>L’alimentazione ausiliaria è attiva.</p>');
    sea.switches = [];
    modal('<h2>Quadro elettrico</h2><p>Attiva gli interruttori nell’ordine corretto.</p><div class="depth-puzzle"><button data-switch="2">2</button><button data-switch="4">4</button><button data-switch="5">5</button></div><p id="depthSwitchMsg"></p>');
    setTimeout(() => document.querySelectorAll('[data-switch]').forEach((b) => b.onclick = () => {
      sea.switches.push(b.dataset.switch); b.disabled = true;
      if (sea.switches.length === 3) {
        if (sea.switches.join('') === '524') { state.flags.panel = true; state.flags.power = true; state.step = 4; addItem('Manovella', '⚙️'); note('Energia ripristinata. Il quadro ha espulso una manovella.'); drawDepthScene(); $('#depthSwitchMsg').innerHTML = '<span class="success">ENERGIA RIPRISTINATA</span>'; }
        else { sea.switches = []; document.querySelectorAll('[data-switch]').forEach((x) => x.disabled = false); $('#depthSwitchMsg').innerHTML = '<span class="error">Sequenza errata.</span>'; }
      }
    }), 0);
  }

  function valvesPuzzle() {
    if (!chosen('Manovella')) return modal('<h2>Valvole di zavorra</h2><p>Seleziona la manovella nell’inventario.</p>');
    if (state.flags.valves) return modal('<h2>Valvole di zavorra</h2><p>La pressione è stabile.</p>');
    sea.valves = [];
    modal('<h2>Valvole di zavorra</h2><p>Segui lo schema: sinistra, centro, destra.</p><div class="depth-puzzle"><button data-valve="S">←</button><button data-valve="C">•</button><button data-valve="D">→</button></div><p id="depthValveMsg"></p>');
    setTimeout(() => document.querySelectorAll('[data-valve]').forEach((b) => b.onclick = () => {
      sea.valves.push(b.dataset.valve);
      if (sea.valves.length === 3) {
        if (sea.valves.join('') === 'SCD') { removeItem('Manovella'); state.flags.valves = true; state.step = 5; addItem('Scheda sonar', '💳'); note('Zavorra stabilizzata. Recuperata una scheda sonar.'); drawDepthScene(); $('#depthValveMsg').innerHTML = '<span class="success">PRESSIONE STABILE</span>'; }
        else { sea.valves = []; $('#depthValveMsg').innerHTML = '<span class="error">Sequenza errata.</span>'; }
      }
    }), 0);
  }

  function consolePuzzle() {
    if (!state.flags.power || !has('Scheda sonar')) return modal('<h2>Console di assetto</h2><p>Servono alimentazione e scheda sonar.</p>');
    if (state.flags.console) return modal('<h2>Console di assetto</h2><p>Assetto e ossigeno sono stabili.</p>');
    modal('<h2>Console di assetto</h2><p>Inserisci il settore seguito dalle ultime due cifre dell’orario.</p><div class="code-input"><input id="depthConsole" inputmode="numeric" maxlength="4" placeholder="0000"><button id="depthConsoleBtn">AVVIA RISALITA</button></div><p id="depthConsoleMsg"></p>');
    setTimeout(() => $('#depthConsoleBtn').onclick = () => {
      if ($('#depthConsole').value === '5237') { state.flags.console = true; state.flags.oxygen = true; state.step = 6; addItem('Badge camera stagna', '🪪'); note('Codice 5237 accettato. Ossigeno stabile e camera stagna autorizzata.'); drawDepthScene(); $('#depthConsoleMsg').innerHTML = '<span class="success">RISALITA AUTORIZZATA</span>'; }
      else $('#depthConsoleMsg').innerHTML = '<span class="error">Codice non valido.</span>';
    }, 0);
  }

  function hatchPuzzle() {
    if (!state.flags.oxygen) return modal('<h2>Camera stagna</h2><p>La pressione non è ancora sicura.</p>');
    if (!chosen('Badge camera stagna')) return modal('<h2>Camera stagna</h2><p>Seleziona il badge nell’inventario.</p>');
    state.flags.hatch = true; drawDepthScene(); document.body.classList.remove('depth-active'); finish();
  }

  function depthHint() {
    if (state.hints <= 0) return modal('<h2>Nessun indizio rimasto</h2><p>Controlla appunti e inventario.</p>');
    const hints = ['Inizia dal sonar: breve, lungo, breve.', 'L’orario è 04:37.', 'Seleziona la chiave nautica e apri la cassaforte.', 'Lo schema indica 5–2–4.', 'Seleziona la manovella e usa ← • →.', 'Il codice console è 5237.', 'Seleziona il badge e apri la camera stagna.'];
    state.hints--; state.hintsUsed++; $('#hintCount').textContent = state.hints; modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step, hints.length - 1)]}</p>`);
  }

  document.addEventListener('click', (event) => {
    if (!isDepth()) return;
    const play = event.target.closest('#playBtn');
    if (play) { event.preventDefault(); event.stopImmediatePropagation(); startDepth(); return; }
    const hint = event.target.closest('#hintBtn');
    if (hint && state) { event.preventDefault(); event.stopImmediatePropagation(); depthHint(); return; }
    const notes = event.target.closest('#notesBtn');
    if (notes && state) { event.preventDefault(); event.stopImmediatePropagation(); modal(`<h2>Appunti</h2>${state.notes.length ? '<ul>' + state.notes.map((n) => `<li>${n}</li>`).join('') + '</ul>' : '<p>Non hai ancora scoperto nulla.</p>'}`); }
  }, true);
})();