/* Il Museo Silenzioso V3 — stanza dedicata e indipendente */
(() => {
  const q = s => document.querySelector(s);
  const museum = {selected:null, sequence:[], directions:[]};
  const basePlay = q('#playBtn').onclick;
  const baseHint = q('#hintBtn').onclick;
  const baseNotes = q('#notesBtn').onclick;
  const baseExit = q('#exitBtn').onclick;

  const active = () => selected && selected.id === 'museo';
  const has = name => !!state && state.inventory.some(i => i.name === name);
  const selectedItem = name => museum.selected === name && has(name);
  const remember = text => { if (state && !state.notes.includes(text)) state.notes.push(text); };

  function inventory(){
    const box=q('#inventoryItems');
    if(!box || !state) return;
    box.innerHTML=state.inventory.length ? state.inventory.map(i =>
      `<button class="inventory-item museum-item ${museum.selected===i.name?'selected':''}" data-museum-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`
    ).join('') : '<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-museum-item]').forEach(btn => btn.onclick=()=>{
      museum.selected = museum.selected===btn.dataset.museumItem ? null : btn.dataset.museumItem;
      inventory();
      status(museum.selected ? `${museum.selected} selezionato` : 'Oggetto deselezionato');
    });
  }
  function add(name,icon){if(!has(name)){state.inventory.push({name,icon});inventory();}}
  function remove(name){state.inventory=state.inventory.filter(i=>i.name!==name);if(museum.selected===name)museum.selected=null;inventory();}
  function status(text){const el=q('.museum-status');if(!el)return;el.textContent=text;clearTimeout(status.t);status.t=setTimeout(()=>{if(el)el.textContent='Tocca gli elementi della sala per esaminarli';},2400);}
  function zone(id,label,done){return `<button class="museum-zone museum-zone--${id} ${done?'done':''}" data-museum-zone="${id}" aria-label="${label}"><span>${label}</span></button>`;}

  function render(){
    const f=state.flags;
    document.body.classList.add('museum-active');
    q('#sceneBackdrop').style.background='transparent';
    q('#sceneObjects').innerHTML=`
      <div class="museum-scene ${f.lasers?'lasers-off':''} ${f.vault?'vault-open':''}">
        <div class="museum-ceiling"></div><div class="museum-wall"></div><div class="museum-floor"></div>
        <div class="museum-column c1"></div><div class="museum-column c2"></div>
        <div class="museum-door"><div class="museum-door-panel"></div><div class="museum-scanner"></div></div>
        <div class="museum-statue"><div class="statue-head"></div><div class="statue-body"></div><div class="statue-base"><b>26</b></div></div>
        <div class="museum-candelabrum"><i></i><b></b><em></em><span></span></div>
        <div class="museum-map"><div>✦</div></div>
        <div class="museum-case"><div class="case-glass"><span>${f.case?'VUOTA':'RELIQUIA'}</span></div><div class="case-plinth"></div></div>
        <div class="museum-painting"><div class="portrait"></div></div>
        <div class="museum-console"><strong>SECURITY</strong><div><i></i><i></i><i></i><i></i></div></div>
        <div class="museum-vault"><div class="vault-wheel"></div><div class="vault-slot"></div></div>
        <div class="museum-laser l1"></div><div class="museum-laser l2"></div><div class="museum-laser l3"></div>
        ${zone('statue','Statua del Custode',f.statue)}
        ${zone('candles','Candelabro',f.candles)}
        ${zone('map','Mappa antica',f.map)}
        ${zone('case','Vetrina',f.case)}
        ${zone('painting','Ritratto del fondatore',f.painting)}
        ${zone('console','Console di sicurezza',f.console)}
        ${zone('vault','Caveau',f.vault)}
        ${zone('door','Portone principale',f.exit)}
        <div class="museum-dust"></div><div class="museum-vignette"></div>
        <div class="museum-status">Tocca gli elementi della sala per esaminarli</div>
      </div>`;
    q('#sceneObjects').querySelectorAll('[data-museum-zone]').forEach(btn=>btn.onclick=()=>inspect(btn.dataset.museumZone));
  }

  function begin(){
    clearInterval(timerId);
    state={time:selected.minutes*60,hints:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};
    museum.selected=null; museum.sequence=[]; museum.directions=[];
    q('#gameCase').textContent='CASO 04'; q('#gameTitle').textContent='Il Museo Silenzioso'; q('#hintCount').textContent=state.hints;
    render(); inventory(); updateTimer(); show('game');
    setTimeout(()=>modal('<h2>Il Museo Silenzioso</h2><p>Le luci di emergenza si accendono. Una voce metallica annuncia: <strong>INTRUSO RILEVATO</strong>.</p><p>Recupera il reperto scomparso e riapri il portone prima che il museo venga sigillato.</p><button id="museumIntro" class="action-btn">ENTRA NELLA GALLERIA</button>'),80);
    setTimeout(()=>{const b=q('#museumIntro');if(b)b.onclick=closeModal;},120);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer();}else if(!state.escaped){clearInterval(timerId);modal('<h2>Tempo scaduto</h2><p>Le serrande blindate si chiudono. Il museo torna completamente silenzioso.</p><button id="museumRetry" class="action-btn">RIPROVA</button>');setTimeout(()=>{const b=q('#museumRetry');if(b)b.onclick=()=>{closeModal();begin();};},0);}},1000);
  }

  function inspect(id){({statue, candles, map, case:displayCase, painting, console:security, vault, door:exitDoor}[id]||(()=>{}))();}
  function statue(){
    if(state.flags.statue)return modal('<h2>Statua del Custode</h2><p>La targhetta del restauro è già stata rimossa.</p>');
    state.flags.statue=true;state.step=1;add('Targhetta del restauro','🏷️');remember('Targhetta: RESTAURO 19:42 — REPERTO 26.');render();
    modal('<h2>Statua del Custode</h2><p>Sotto la base trovi una targhetta metallica allentata.</p><div class="clue">RESTAURO 19:42<br>REPERTO 26</div>');
  }
  function candles(){
    if(state.flags.candles)return modal('<h2>Candelabro</h2><p>Il vano segreto è già aperto.</p>');
    if(!has('Targhetta del restauro'))return modal('<h2>Candelabro</h2><p>Quattro pulsanti numerati sono nascosti alla base. Ti manca l’ordine corretto.</p>');
    museum.sequence=[];
    modal('<h2>Candelabro cronologico</h2><p>Premi i numeri nell’ordine indicato dall’orario del restauro.</p><div class="museum-puzzle-grid">'+['1','9','4','2'].map(n=>`<button data-candle="${n}">${n}</button>`).join('')+'</div><p id="museumPuzzleMsg"></p>');
    setTimeout(()=>q('#modalContent').querySelectorAll('[data-candle]').forEach(btn=>btn.onclick=()=>{
      museum.sequence.push(btn.dataset.candle);btn.classList.add('pressed');
      if(museum.sequence.length===4){
        if(museum.sequence.join('')==='1942'){state.flags.candles=true;state.step=2;add('Lente del curatore','🔍');remember('Il candelabro nascondeva una lente del curatore.');render();q('#museumPuzzleMsg').innerHTML='<span class="success">Vano aperto: hai trovato una lente.</span>';}
        else{museum.sequence=[];q('#modalContent').querySelectorAll('[data-candle]').forEach(x=>x.classList.remove('pressed'));q('#museumPuzzleMsg').innerHTML='<span class="error">Ordine errato. Il meccanismo si azzera.</span>';}
      }
    }),0);
  }
  function map(){
    if(state.flags.map)return modal('<h2>Mappa antica</h2><p>La scritta nascosta dice: NORD → EST → OVEST → SUD.</p>');
    if(!selectedItem('Lente del curatore'))return modal('<h2>Mappa antica</h2><p>La superficie presenta segni sottilissimi. Potrebbe servire uno strumento ottico.</p>');
    remove('Lente del curatore');state.flags.map=true;state.step=3;add('Sequenza delle sale','🗺️');remember('La lente rivela: NORD → EST → OVEST → SUD.');render();
    modal('<h2>Inchiostro invisibile</h2><p>Passando la lente sulla mappa compare una sequenza.</p><div class="clue">NORD → EST → OVEST → SUD</div>');
  }
  function displayCase(){
    if(state.flags.case)return modal('<h2>Vetrina</h2><p>Il piedistallo è vuoto.</p>');
    if(!has('Sequenza delle sale'))return modal('<h2>Vetrina</h2><p>Quattro sensori direzionali bloccano il vetro.</p>');
    museum.directions=[];
    modal('<h2>Sensori della vetrina</h2><p>Riproduci la sequenza scoperta sulla mappa.</p><div class="museum-puzzle-grid arrows"><button data-dir="N">↑</button><button data-dir="E">→</button><button data-dir="O">←</button><button data-dir="S">↓</button></div><p id="museumPuzzleMsg"></p>');
    setTimeout(()=>q('#modalContent').querySelectorAll('[data-dir]').forEach(btn=>btn.onclick=()=>{
      museum.directions.push(btn.dataset.dir);btn.classList.add('pressed');setTimeout(()=>btn.classList.remove('pressed'),180);
      if(museum.directions.length===4){
        if(museum.directions.join('')==='NEOS'){state.flags.case=true;state.step=4;add('Sigillo d’ottone','🔘');remember('La vetrina conteneva un sigillo d’ottone inciso con il numero 26.');render();q('#museumPuzzleMsg').innerHTML='<span class="success">Sensori disattivati. Il vetro si solleva.</span>';}
        else{museum.directions=[];q('#museumPuzzleMsg').innerHTML='<span class="error">Sequenza errata.</span>';}
      }
    }),0);
  }
  function painting(){
    if(state.flags.painting)return modal('<h2>Ritratto del fondatore</h2><p>Dietro il quadro resta aperto un piccolo vano.</p>');
    if(!selectedItem('Sigillo d’ottone'))return modal('<h2>Ritratto del fondatore</h2><p>La cornice sporge dal muro. Dietro intravedi una cavità circolare.</p>');
    remove('Sigillo d’ottone');state.flags.painting=true;state.step=5;add('Chiave del caveau','🗝️');remember('Il sigillo apre il vano dietro il ritratto: contiene la chiave del caveau.');render();
    modal('<h2>Dietro il ritratto</h2><p>Il sigillo entra perfettamente nella cavità. La cornice scatta in avanti.</p><p class="success">Hai trovato la chiave del caveau.</p>');
  }
  function security(){
    if(state.flags.console)return modal('<h2>Console di sicurezza</h2><p>I laser sono già disattivati.</p>');
    if(!state.flags.painting)return modal('<h2>Console di sicurezza</h2><p>Lo schermo richiede il numero del reperto seguito dall’orario del restauro.</p>');
    modal('<h2>Console di sicurezza</h2><p>Inserisci reperto e orario, senza spazi.</p><div class="code-input"><input id="museumSecurityCode" inputmode="numeric" maxlength="6" placeholder="000000"><button id="museumSecurityBtn">DISATTIVA</button></div><p id="museumPuzzleMsg"></p>');
    setTimeout(()=>q('#museumSecurityBtn').onclick=()=>{
      if(q('#museumSecurityCode').value==='261942'){state.flags.console=true;state.flags.lasers=true;state.step=6;add('Pass del custode','🎟️');remember('Codice console: 261942. La macchina ha rilasciato il pass del custode.');render();q('#museumPuzzleMsg').innerHTML='<span class="success">LASER DISATTIVATI — PASS RILASCIATO</span>';}
      else q('#museumPuzzleMsg').innerHTML='<span class="error">Credenziali non valide.</span>';
    },0);
  }
  function vault(){
    if(state.flags.vault)return modal('<h2>Caveau</h2><p>Il piedistallo interno è vuoto.</p>');
    if(!state.flags.lasers)return modal('<h2>Caveau</h2><p>I fasci laser impediscono di raggiungere la serratura.</p>');
    if(!selectedItem('Chiave del caveau'))return modal('<h2>Caveau</h2><p>La serratura richiede una chiave antica.</p>');
    remove('Chiave del caveau');state.flags.vault=true;state.step=7;add('Idolo silenzioso','🗿');remember('Nel caveau hai recuperato l’Idolo silenzioso. Sul retro è inciso: NON VOLTARTI.');render();
    modal('<h2>Il caveau si apre</h2><p>La porta blindata ruota lentamente. Sul piedistallo si trova il reperto scomparso.</p><p class="success">Hai recuperato l’Idolo silenzioso.</p>');
  }
  function exitDoor(){
    if(state.flags.exit)return;
    if(!selectedItem('Pass del custode'))return modal('<h2>Portone principale</h2><p>Lo scanner richiede il pass del custode selezionato nell’inventario.</p>');
    if(!has('Idolo silenzioso'))return modal('<h2>Portone principale</h2><p>Il pass è valido, ma il sistema segnala che il reperto è ancora disperso.</p>');
    modal('<h2>Uscita del museo</h2><p>Conferma il numero del reperto recuperato.</p><div class="code-input"><input id="museumExitCode" inputmode="numeric" maxlength="2" placeholder="00"><button id="museumExitBtn">APRI</button></div><p id="museumPuzzleMsg"></p>');
    setTimeout(()=>q('#museumExitBtn').onclick=()=>{
      if(q('#museumExitCode').value==='26'){state.flags.exit=true;state.escaped=true;document.body.classList.remove('museum-active');finish();}
      else q('#museumPuzzleMsg').innerHTML='<span class="error">Numero di reperto errato.</span>';
    },0);
  }
  function museumHint(){
    if(state.hints<=0)return modal('<h2>Nessun indizio rimasto</h2><p>Rileggi gli appunti e controlla l’inventario.</p>');
    const hints=['Esamina la base della statua.','L’orario 19:42 indica l’ordine dei quattro pulsanti.','Seleziona la lente e usala sulla mappa.','Riproduci NORD, EST, OVEST, SUD sulla vetrina.','Seleziona il sigillo e usalo sul ritratto.','La console vuole 26 seguito da 1942.','Disattiva i laser, seleziona la chiave e apri il caveau.','Seleziona il pass e inserisci 26 sul portone.'];
    state.hints--;state.hintsUsed++;q('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step,hints.length-1)]}</p>`);
  }
  function cleanup(){document.body.classList.remove('museum-active');museum.selected=null;}

  q('#playBtn').onclick=()=>active()?begin():basePlay();
  q('#hintBtn').onclick=()=>active()?museumHint():baseHint();
  q('#notesBtn').onclick=()=>active()?modal(`<h2>Appunti</h2>${state.notes.length?'<ul>'+state.notes.map(n=>`<li>${n}</li>`).join('')+'</ul>':'<p>Non hai ancora scoperto nulla.</p>'}`):baseNotes();
  q('#exitBtn').onclick=()=>{if(active())cleanup();baseExit();};
  document.addEventListener('click',e=>{if(e.target.id==='confirmExit'&&active())cleanup();});
})();