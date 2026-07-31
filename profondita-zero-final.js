/* Profondità Zero FINAL — launcher isolato, indipendente dai vecchi motori */
(() => {
  const q = s => document.querySelector(s);
  let selectedItem = null;
  let sequence = [];

  const isDepth = () => typeof selected !== 'undefined' && selected?.id === 'sottomarino';
  const has = name => state?.inventory?.some(i => i.name === name);
  const chosen = name => selectedItem === name && has(name);

  function addItem(name, icon) {
    if (!has(name)) state.inventory.push({ name, icon });
    renderInventoryFinal();
  }

  function removeItem(name) {
    state.inventory = state.inventory.filter(i => i.name !== name);
    if (selectedItem === name) selectedItem = null;
    renderInventoryFinal();
  }

  function renderInventoryFinal() {
    const box = q('#inventoryItems');
    if (!box || !state) return;
    box.innerHTML = state.inventory.length
      ? state.inventory.map(i => `<button class="inventory-item depth3-inv ${selectedItem === i.name ? 'selected' : ''}" data-pzf-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join('')
      : '<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-pzf-item]').forEach(btn => {
      btn.onclick = () => {
        selectedItem = selectedItem === btn.dataset.pzfItem ? null : btn.dataset.pzfItem;
        renderInventoryFinal();
      };
    });
  }

  function hotspot(name, label, solved) {
    return `<button class="depth3-hot ${name} ${solved ? 'solved' : ''}" data-pzf="${name}" aria-label="${label}"><span>${label}</span></button>`;
  }

  function renderScene() {
    const f = state.flags;
    document.body.classList.add('depth3-active');
    q('#sceneBackdrop').style.background = 'transparent';
    q('#sceneObjects').innerHTML = `
      <div class="depth3 ${f.ballast ? 'balanced' : ''} ${f.oxygen ? 'oxygen-ok' : ''} ${f.hatch ? 'hatch-open' : ''}">
        <div class="depth3-shell"></div>
        <div class="depth3-window">
          <div class="depth3-seabed"></div><div class="depth3-lightcone"></div><div class="depth3-creature"></div>
          <div class="depth3-crack"></div>${f.leak ? '' : '<div class="depth3-leak"></div>'}
        </div>
        <div class="depth3-toolbox"></div><div class="depth3-chart"></div>
        <div class="depth3-console">
          <div class="depth3-screen left"><div class="depth3-radar"></div></div>
          <div class="depth3-screen center"><div class="depth3-tanks"><i></i><i></i><i></i></div></div>
          <div class="depth3-screen right"><div class="depth3-o2">${f.oxygen ? '92%' : '18%'}<small>${f.oxygen ? 'STABILE' : 'CRITICO'}</small></div></div>
        </div>
        <div class="depth3-wheel"></div><div class="depth3-hatch"><i></i></div>
        ${hotspot('chart','Carta batimetrica',f.chart)}${hotspot('sonar','Sonar',f.sonar)}${hotspot('toolbox','Kit di recupero',f.toolbox)}
        ${hotspot('leak','Crepa nella vetrata',f.leak)}${hotspot('ballast','Zavorra',f.ballast)}${hotspot('oxygen','Sistema ossigeno',f.oxygen)}
        ${hotspot('wheel','Timone',f.route)}${hotspot('hatch','Portello',f.hatch)}
        <div class="depth3-bubbles"></div><div class="depth3-vignette"></div>
        <div class="depth3-status">Sigilla la cabina, stabilizza la zavorra e prepara la risalita</div>
      </div>`;
    q('.look-hint')?.style.setProperty('display','none','important');
    q('#sceneObjects').querySelectorAll('[data-pzf]').forEach(btn => btn.onclick = () => inspect(btn.dataset.pzf));
  }

  function beginFinal() {
    if (!isDepth()) return;
    clearInterval(timerId);
    state = { time: 25 * 60, hints: 3, hintsUsed: 0, step: 0, inventory: [], notes: [], escaped: false, flags: {} };
    selectedItem = null; sequence = [];
    q('#gameCase').textContent = 'CASO 06';
    q('#gameTitle').textContent = 'Profondità Zero';
    q('#hintCount').textContent = '3';
    renderScene(); renderInventoryFinal(); updateTimer(); show('game');
    modal('<h2>Profondità Zero</h2><p>La cabina panoramica perde pressione. L’ossigeno è al 18% e qualcosa si muove oltre il vetro.</p><button id="pzfStart" class="action-btn">PRENDI IL CONTROLLO</button>');
    setTimeout(() => { const b=q('#pzfStart'); if(b) b.onclick=closeModal; }, 0);
    timerId = setInterval(() => {
      if (state.time > 0 && !state.escaped) { state.time--; updateTimer(); }
      else if (!state.escaped) { clearInterval(timerId); modal('<h2>Ossigeno esaurito</h2><p>Il sottomarino resta sul fondale.</p>'); }
    }, 1000);
  }

  function inspect(id) {
    const f = state.flags;
    if (id === 'chart') {
      if (f.chart) return modal('<h2>Carta batimetrica</h2><p>Settore 52 · rotta △ ○ □ · immersione 04:37.</p>');
      f.chart = true; state.step = 1; addItem('Carta batimetrica','🗺️'); renderScene();
      return modal('<h2>Carta batimetrica</h2><p>La rotta segnata è:</p><p class="tool-success">△ → ○ → □</p>');
    }
    if (id === 'sonar') {
      if (!f.chart) return modal('<h2>Sonar</h2><p>Serve prima una rotta di riferimento.</p>');
      if (f.sonar) return modal('<h2>Sonar</h2><p>Relitto localizzato a 52 metri.</p>');
      sequence=[]; modal('<h2>Sonar panoramico</h2><p>Ripeti la rotta della carta.</p><div class="depth3-puzzle"><button data-pzf-seq="T">△</button><button data-pzf-seq="C">○</button><button data-pzf-seq="Q">□</button></div><p id="pzfMsg"></p>');
      setTimeout(()=>q('#modalContent').querySelectorAll('[data-pzf-seq]').forEach(b=>b.onclick=()=>{sequence.push(b.dataset.pzfSeq);b.disabled=true;if(sequence.length===3){if(sequence.join('')==='TCQ'){f.sonar=true;state.step=2;addItem('Coordinate relitto','📡');renderScene();q('#pzfMsg').textContent='Relitto localizzato a 52 metri.';}else{sequence=[];q('#modalContent').querySelectorAll('[data-pzf-seq]').forEach(x=>x.disabled=false);q('#pzfMsg').textContent='Sequenza errata.';}}}),0); return;
    }
    if (id === 'toolbox') {
      if (!f.sonar) return modal('<h2>Braccio di recupero</h2><p>Non hai ancora localizzato il relitto.</p>');
      if (f.toolbox) return modal('<h2>Vano tecnico</h2><p>Il contenitore è già stato recuperato.</p>');
      f.toolbox=true; state.step=3; addItem('Resina pressurizzata','🧪'); renderScene();
      return modal('<h2>Recupero completato</h2><p>Nel contenitore trovi una resina adatta alla riparazione subacquea.</p>');
    }
    if (id === 'leak') {
      if (f.leak) return modal('<h2>Vetrata</h2><p>La crepa è sigillata.</p>');
      if (!chosen('Resina pressurizzata')) return modal('<h2>Perdita</h2><p>Seleziona la resina dall’inventario e tocca di nuovo la crepa.</p>');
      removeItem('Resina pressurizzata'); f.leak=true; state.step=4; renderScene();
      return modal('<h2>Pressione stabilizzata</h2><p>La crepa è sigillata. I serbatoi mostrano 4, 3 e 7.</p>');
    }
    if (id === 'ballast') {
      if (!f.leak) return modal('<h2>Zavorra</h2><p>Prima devi fermare la perdita.</p>');
      if (f.ballast) return modal('<h2>Zavorra</h2><p>Assetto già stabile.</p>');
      sequence=[]; modal('<h2>Bilanciamento zavorra</h2><p>Scarica dalla pressione più alta alla più bassa.</p><div class="depth3-puzzle"><button data-pzf-tank="4">4</button><button data-pzf-tank="3">3</button><button data-pzf-tank="7">7</button></div><p id="pzfTankMsg"></p>');
      setTimeout(()=>q('#modalContent').querySelectorAll('[data-pzf-tank]').forEach(b=>b.onclick=()=>{sequence.push(b.dataset.pzfTank);b.disabled=true;if(sequence.length===3){if(sequence.join('')==='743'){f.ballast=true;state.step=5;addItem('Cella ossigeno','🔋');renderScene();q('#pzfTankMsg').textContent='Assetto stabilizzato.';}else{sequence=[];q('#modalContent').querySelectorAll('[data-pzf-tank]').forEach(x=>x.disabled=false);q('#pzfTankMsg').textContent='Ordine errato.';}}}),0); return;
    }
    if (id === 'oxygen') {
      if (f.oxygen) return modal('<h2>Ossigeno</h2><p>Livello stabile al 92%.</p>');
      if (!chosen('Cella ossigeno')) return modal('<h2>Ossigeno</h2><p>Seleziona la cella dall’inventario.</p>');
      removeItem('Cella ossigeno'); f.oxygen=true; state.step=6; addItem('Chiave di risalita','🔷'); renderScene();
      return modal('<h2>Ossigeno ripristinato</h2><p>Il sistema di risalita è nuovamente disponibile.</p>');
    }
    if (id === 'wheel') {
      if (!f.oxygen) return modal('<h2>Timone</h2><p>Il sistema è bloccato con ossigeno critico.</p>');
      if (f.route) return modal('<h2>Timone</h2><p>Rotta 04:37 già caricata.</p>');
      modal('<h2>Rotta di risalita</h2><p>Inserisci l’ora dell’immersione.</p><div class="code-input"><input id="pzfRoute" inputmode="numeric" maxlength="4"><button id="pzfRouteBtn">CONFERMA</button></div><p id="pzfRouteMsg"></p>');
      setTimeout(()=>q('#pzfRouteBtn').onclick=()=>{if(q('#pzfRoute').value==='0437'){f.route=true;state.step=7;renderScene();q('#pzfRouteMsg').textContent='Rotta caricata.';}else q('#pzfRouteMsg').textContent='Codice errato.';},0); return;
    }
    if (id === 'hatch') {
      if (!f.route || !f.ballast) return modal('<h2>Portello</h2><p>Rotta e assetto non sono ancora pronti.</p>');
      if (!chosen('Chiave di risalita')) return modal('<h2>Portello</h2><p>Seleziona la chiave di risalita.</p>');
      f.hatch=true; state.escaped=true; renderScene(); clearInterval(timerId);
      setTimeout(()=>{ document.body.classList.remove('depth3-active'); q('.look-hint')?.style.removeProperty('display'); finish(); },700);
    }
  }

  function installLauncher() {
    const play = q('#playBtn');
    if (!play || q('#pzfLauncher')) return;
    const launcher = document.createElement('button');
    launcher.id='pzfLauncher'; launcher.type='button'; launcher.textContent='INIZIA LA FUGA';
    launcher.className='primary';
    Object.assign(launcher.style,{position:'absolute',inset:'auto 0 0 0',width:'100%',height:'58px',zIndex:'9999',display:'none'});
    play.parentElement.style.position='relative'; play.parentElement.appendChild(launcher);
    launcher.onclick=beginFinal;
    const refresh=()=>launcher.style.display=isDepth()?'block':'none';
    new MutationObserver(refresh).observe(q('#briefingTitle'),{childList:true,subtree:true,characterData:true});
    document.querySelectorAll('.room-card').forEach(c=>c.addEventListener('click',()=>setTimeout(refresh,0)));
    refresh();
  }

  const oldHint = q('#hintBtn')?.onclick;
  q('#hintBtn')?.addEventListener('click',e=>{
    if(!isDepth() || !document.body.classList.contains('depth3-active')) return;
    e.preventDefault();e.stopImmediatePropagation();
    const hints=['Apri la carta batimetrica.','Ripeti △ ○ □ sul sonar.','Recupera il contenitore dal relitto.','Seleziona la resina e ripara la crepa.','Ordina 7, 4, 3.','Seleziona la cella ossigeno.','Inserisci 0437 sul timone.','Seleziona la chiave e apri il portello.'];
    if(state.hints<=0) return modal('<h2>Indizi terminati</h2>'); state.hints--;state.hintsUsed++;q('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step,hints.length-1)]}</p>`);
  },true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installLauncher); else installLauncher();
})();