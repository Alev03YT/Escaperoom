/* Protocollo X V2 — laboratorio dedicato premium */
(() => {
  const $ = s => document.querySelector(s);
  const lab = { selected:null, focus:0, circuit:[] };
  const oldPlay = $('#playBtn').onclick;
  const oldHint = $('#hintBtn').onclick;
  const oldNotes = $('#notesBtn').onclick;
  const oldExit = $('#exitBtn').onclick;

  const active = () => selected && selected.id === 'laboratorio';
  const has = n => state && state.inventory.some(x => x.name === n);
  const chosen = n => lab.selected === n && has(n);
  const add = (name,icon) => { if(!has(name)) state.inventory.push({name,icon}); drawInventory(); };
  const remove = name => { state.inventory=state.inventory.filter(x=>x.name!==name); if(lab.selected===name) lab.selected=null; drawInventory(); };
  const note = t => { if(state && !state.notes.includes(t)) state.notes.push(t); };
  const popup = html => modal(html);

  function drawInventory(){
    const box=$('#inventoryItems');
    box.innerHTML=state.inventory.length?state.inventory.map(i=>`<button class="inventory-item px-inv ${lab.selected===i.name?'selected':''}" data-px-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join(''):'<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-px-item]').forEach(b=>b.onclick=()=>{lab.selected=lab.selected===b.dataset.pxItem?null:b.dataset.pxItem;drawInventory();status(lab.selected?`${lab.selected} selezionato`:'Oggetto deselezionato')});
  }
  function status(t){const e=$('.px-status');if(!e)return;e.textContent=t;clearTimeout(status.t);status.t=setTimeout(()=>e.textContent='Analizza gli strumenti del laboratorio',2500)}
  const hot=(id,label,done)=>`<button class="px-hot px-${id} ${done?'solved':''}" data-px="${id}" aria-label="${label}"><span>${label}</span></button>`;

  function drawScene(){
    const f=state.flags;
    document.body.classList.add('px-active');
    $('#sceneBackdrop').style.background='transparent';
    $('#sceneObjects').innerHTML=`<div class="px-scene ${f.power?'powered':''} ${f.alarm?'safe':''}">
      <div class="px-wall"></div><div class="px-floor"></div><div class="px-window"><div class="subject">08</div><i></i></div>
      <div class="px-bench"><div class="px-log-shape">REGISTRO</div><div class="px-scope-shape"><i></i><b></b></div><div class="px-sample"><span>08</span></div></div>
      <div class="px-incubator-shape"><div class="display">${f.incubator?'OPEN':'LOCK'}</div><div class="chamber"></div></div>
      <div class="px-locker-shape"><div>STERILE</div><i></i></div>
      <div class="px-panel-shape"><span class="red"></span><span class="blue"></span><span class="green"></span><span class="yellow"></span></div>
      <div class="px-terminal-shape"><div class="screen">${f.terminal?'SUBJECT 08 VERIFIED':f.power?'SYSTEM READY':'NO POWER'}</div><div class="keys"></div></div>
      <div class="px-alarm-shape"><b></b><span>${f.alarm?'DISARMED':'BIOHAZARD'}</span></div>
      <div class="px-door-shape"><div class="glass"></div><div class="reader"></div><strong>USCITA</strong></div>
      ${hot('log','Registro tecnico',f.log)}${hot('scope','Microscopio',f.scope)}${hot('incubator','Incubatore',f.incubator)}${hot('locker','Armadietto sterile',f.locker)}${hot('panel','Quadro elettrico',f.power)}${hot('terminal','Terminale principale',f.terminal)}${hot('alarm','Allarme biologico',f.alarm)}${hot('door','Uscita sterile',f.door)}
      <div class="px-scan"></div><div class="px-vignette"></div><div class="px-status">Analizza gli strumenti del laboratorio</div>
    </div>`;
    document.querySelectorAll('[data-px]').forEach(b=>b.onclick=()=>inspect(b.dataset.px));
  }

  function begin(){
    clearInterval(timerId);
    state={time:selected.minutes*60,hints:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};
    lab.selected=null;lab.focus=0;lab.circuit=[];
    $('#gameCase').textContent='CASO 03';$('#gameTitle').textContent='Protocollo X — Settore sterile';$('#hintCount').textContent=state.hints;
    drawScene();drawInventory();updateTimer();show('game');
    setTimeout(()=>popup('<h2>Protocollo X</h2><p>Le paratie si sigillano e una voce automatica annuncia la sterilizzazione totale del settore.</p><p><strong>Obiettivo:</strong> ricostruisci l’identità del campione e disattiva il protocollo prima dello scarico chimico.</p><button id="pxstart" class="action-btn">ENTRA NEL SETTORE</button>'),100);
    setTimeout(()=>{const b=$('#pxstart');if(b)b.onclick=closeModal},180);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);popup('<h2>Protocollo eseguito</h2><p>Il vetro si copre di vapore bianco. Il settore viene sterilizzato.</p><button id="pxretry" class="action-btn">RIPROVA</button>');setTimeout(()=>{const b=$('#pxretry');if(b)b.onclick=()=>{closeModal();begin()}},0)}},1000);
  }

  function inspect(id){({log,scope,incubator,locker,panel,terminal,alarm,door}[id]||(()=>{}))()}
  function log(){
    if(state.flags.log)return popup('<h2>Registro tecnico</h2><p>La pagina utile è già stata acquisita.</p>');
    state.flags.log=true;state.step=1;add('Scheda campione 08','📋');note('Campione 08 stabilizzato alle 14:25. Sul margine compare il simbolo di messa a fuoco.');drawScene();
    popup('<h2>Registro tecnico</h2><p>L’ultima annotazione è stata scritta pochi minuti prima dell’evacuazione.</p><p class="tool-success">CAMPIONE 08 — STABILE ORE 14:25</p>');
  }
  function scope(){
    if(state.flags.scope)return popup('<h2>Microscopio</h2><p>La sequenza sul vetrino resta visibile: 1–4–2–5.</p>');
    if(!has('Scheda campione 08'))return popup('<h2>Microscopio</h2><p>Ci sono molti vetrini. Non sai quale campione analizzare.</p>');
    popup('<h2>Microscopio — Campione 08</h2><p>Regola la messa a fuoco finché le quattro cellule diventano nitide.</p><div class="px-focus"><button id="pxminus">−</button><div><span id="pxblur">◉  ◉  ◉  ◉</span><small id="pxfocusvalue">Fuoco 0</small></div><button id="pxplus">+</button></div><button id="pxfocusok" class="puzzle-action" style="width:100%">OSSERVA</button><p id="pxfocusmsg"></p>');
    setTimeout(()=>{const upd=()=>{$('#pxfocusvalue').textContent=`Fuoco ${lab.focus}`;$('#pxblur').style.filter=`blur(${Math.abs(4-lab.focus)}px)`};$('#pxminus').onclick=()=>{lab.focus=Math.max(0,lab.focus-1);upd()};$('#pxplus').onclick=()=>{lab.focus=Math.min(8,lab.focus+1);upd()};$('#pxfocusok').onclick=()=>{if(lab.focus===4){state.flags.scope=true;state.step=2;add('Sequenza cellulare 1425','🔬');note('Il vetrino del campione 08 forma la sequenza 1–4–2–5.');drawScene();$('#pxfocusmsg').innerHTML='<span class="success">Le cellule si allineano: 1 — 4 — 2 — 5.</span>'}else $('#pxfocusmsg').innerHTML='<span class="error">L’immagine è ancora fuori fuoco.</span>'};upd()},0);
  }
  function incubator(){
    if(state.flags.incubator)return popup('<h2>Incubatore</h2><p>Il vano sterile è già aperto.</p>');
    if(!has('Sequenza cellulare 1425'))return popup('<h2>Incubatore</h2><p>Il tastierino richiede una sequenza biologica di quattro cifre.</p>');
    popup('<h2>Incubatore criogenico</h2><p>Inserisci la sequenza osservata al microscopio.</p><div class="code-input"><input id="pxincode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="pxinopen">APRI</button></div><p id="pxinmsg"></p>');
    setTimeout(()=>$('#pxinopen').onclick=()=>{if($('#pxincode').value==='1425'){state.flags.incubator=true;state.step=3;add('Chiave sterile','🔑');note('L’incubatore 08 contiene una chiave sterile triangolare.');drawScene();$('#pxinmsg').innerHTML='<span class="success">Pressione equalizzata. Recuperi una chiave sterile.</span>'}else $('#pxinmsg').innerHTML='<span class="error">Sequenza biologica non riconosciuta.</span>'},0);
  }
  function locker(){
    if(state.flags.locker)return popup('<h2>Armadietto sterile</h2><p>È aperto e non contiene altro.</p>');
    if(!chosen('Chiave sterile'))return popup('<h2>Armadietto sterile</h2><p>La serratura triangolare richiede una chiave particolare. Se la possiedi, selezionala.</p>');
    remove('Chiave sterile');state.flags.locker=true;state.step=4;add('Fusibile criogenico','🔌');note('Nell’armadietto trovi un fusibile e lo schema colori: BLU, ROSSO, GIALLO, VERDE.');drawScene();
    popup('<h2>Armadietto aperto</h2><p>Tra le tute protettive trovi un fusibile criogenico.</p><p class="tool-success">Schema circuito: BLU → ROSSO → GIALLO → VERDE</p>');
  }
  function panel(){
    if(state.flags.power)return popup('<h2>Quadro elettrico</h2><p>Il circuito principale è stabile.</p>');
    if(!chosen('Fusibile criogenico'))return popup('<h2>Quadro elettrico</h2><p>Manca il fusibile centrale. Se ne trovi uno, selezionalo prima di intervenire.</p>');
    popup('<h2>Ripristino circuito</h2><p>Inserisci il fusibile, poi attiva i contatti nell’ordine indicato dall’armadietto.</p><div class="px-wires"><button data-wire="B">BLU</button><button data-wire="R">ROSSO</button><button data-wire="Y">GIALLO</button><button data-wire="G">VERDE</button></div><p id="pxwiremsg">Sequenza: —</p>');
    setTimeout(()=>document.querySelectorAll('[data-wire]').forEach(b=>b.onclick=()=>{lab.circuit.push(b.dataset.wire);$('#pxwiremsg').textContent='Sequenza: '+lab.circuit.join(' → ');if(lab.circuit.length===4){if(lab.circuit.join('')==='BRYG'){remove('Fusibile criogenico');state.flags.power=true;state.step=5;add('Sistema alimentato','⚡');note('Il terminale principale è tornato operativo.');drawScene();$('#pxwiremsg').innerHTML='<span class="success">Circuito stabile. Terminale alimentato.</span>'}else{lab.circuit=[];$('#pxwiremsg').innerHTML='<span class="error">Sovraccarico. La sequenza si azzera.</span>'}}}),0);
  }
  function terminal(){
    if(state.flags.terminal)return popup('<h2>Terminale</h2><p>Profilo del soggetto 08 verificato.</p>');
    if(!state.flags.power)return popup('<h2>Terminale principale</h2><p>Lo schermo è spento. Il settore non riceve energia.</p>');
    popup('<h2>Terminale principale</h2><p>Il sistema richiede l’identificativo del campione e l’orario di stabilizzazione.</p><div class="px-terminal-form"><input id="pxsubject" inputmode="numeric" maxlength="2" placeholder="Soggetto"><input id="pxtime" inputmode="numeric" maxlength="4" placeholder="Ora"><button id="pxlogin">VERIFICA</button></div><p id="pxloginmsg"></p>');
    setTimeout(()=>$('#pxlogin').onclick=()=>{if($('#pxsubject').value==='08'&&$('#pxtime').value==='1425'){state.flags.terminal=true;state.step=6;add('Badge soggetto 08','🪪');note('Il terminale genera un badge biologico per il soggetto 08.');drawScene();$('#pxloginmsg').innerHTML='<span class="success">IDENTITÀ CONFERMATA — Badge biologico emesso.</span>'}else $('#pxloginmsg').innerHTML='<span class="error">Identità o timestamp non validi.</span>'},0);
  }
  function alarm(){
    if(state.flags.alarm)return popup('<h2>Allarme biologico</h2><p>Il protocollo di sterilizzazione è stato interrotto.</p>');
    if(!chosen('Badge soggetto 08'))return popup('<h2>Allarme biologico</h2><p>Il lettore richiede un’identità biologica autorizzata.</p>');
    remove('Badge soggetto 08');state.flags.alarm=true;state.step=7;add('Autorizzazione uscita','✅');note('Il badge del soggetto 08 interrompe la sterilizzazione e abilita l’uscita.');drawScene();
    popup('<h2>Protocollo interrotto</h2><p>Il sistema riconosce che il campione è ancora nel settore.</p><p class="tool-success">STERILIZZAZIONE ANNULLATA — USCITA ABILITATA</p>');
  }
  function door(){
    if(state.flags.door)return;
    if(!has('Autorizzazione uscita'))return popup('<h2>Uscita sterile</h2><p>La paratia è bloccata dal protocollo biologico.</p>');
    popup('<h2>Uscita sterile</h2><p>Inserisci il codice di stabilizzazione del campione per completare la decontaminazione.</p><div class="code-input"><input id="pxdoorcode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="pxunlock">SBLOCCA</button></div><p id="pxdoormsg"></p>');
    setTimeout(()=>$('#pxunlock').onclick=()=>{if($('#pxdoorcode').value==='1425'){state.flags.door=true;state.escaped=true;drawScene();document.body.classList.remove('px-active');finish()}else $('#pxdoormsg').innerHTML='<span class="error">Codice di decontaminazione errato.</span>'},0);
  }
  function hint(){
    if(state.hints<=0)return popup('<h2>Nessun indizio rimasto</h2><p>Rileggi gli appunti e osserva gli strumenti già sbloccati.</p>');
    const h=['Il registro sul banco contiene il primo riferimento al campione.','Usa il numero del campione per scegliere il vetrino e porta il fuoco esattamente a 4.','La sequenza del microscopio apre l’incubatore.','Seleziona la chiave sterile e usala sull’armadietto.','Seleziona il fusibile; l’ordine dei colori è negli appunti.','Il terminale richiede soggetto 08 e ora 1425.','Seleziona il badge e appoggialo al lettore dell’allarme.','La porta usa ancora il codice 1425.'];
    state.hints--;state.hintsUsed++;$('#hintCount').textContent=state.hints;popup(`<h2>Indizio</h2><p>${h[Math.min(state.step,h.length-1)]}</p>`);
  }

  $('#playBtn').onclick=()=>active()?begin():oldPlay();
  $('#hintBtn').onclick=()=>active()?hint():oldHint();
  $('#notesBtn').onclick=()=>active()?popup(`<h2>Appunti Protocollo X</h2>${state.notes.length?'<ul>'+state.notes.map(n=>`<li>${n}</li>`).join('')+'</ul>':'<p>Non hai ancora registrato alcuna osservazione.</p>'}`):oldNotes();
  $('#exitBtn').onclick=()=>{document.body.classList.remove('px-active');oldExit()};
})();