/* Archivio 47 V2 — motore dedicato, caricato per ultimo */
(() => {
  const $ = s => document.querySelector(s);
  const game = { selected:null, hour:12, minute:0 };
  const oldPlay = $('#playBtn').onclick;
  const oldHint = $('#hintBtn').onclick;
  const oldNotes = $('#notesBtn').onclick;

  const has = name => state && state.inventory.some(x => x.name === name);
  const chosen = name => game.selected === name && has(name);
  const note = text => { if (state && !state.notes.includes(text)) state.notes.push(text); };
  const add = (name,icon) => { if (!has(name)) state.inventory.push({name,icon}); drawInventory(); };
  const remove = name => { state.inventory = state.inventory.filter(x => x.name !== name); if (game.selected === name) game.selected = null; drawInventory(); };

  function drawInventory(){
    const box = $('#inventoryItems');
    box.innerHTML = state.inventory.length ? state.inventory.map(i => `<button class="inventory-item interactive ${game.selected===i.name?'selected':''}" data-a47-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join('') : '<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-a47-item]').forEach(b => b.onclick = () => {
      game.selected = game.selected === b.dataset.a47Item ? null : b.dataset.a47Item;
      drawInventory();
      status(game.selected ? `${game.selected} selezionato: tocca l’oggetto su cui usarlo` : 'Oggetto deselezionato');
    });
  }

  function status(text){
    const el = $('.a47-status'); if(!el) return;
    el.textContent = text;
    clearTimeout(status.t);
    status.t = setTimeout(() => el.textContent = 'Tocca direttamente un oggetto della stanza', 2800);
  }

  const object = (id,label,done=false) => `<button class="a47-object a47-${id} ${done?'solved':''}" data-a47="${id}" aria-label="${label}"><span class="shape"></span><span class="label">${label}</span></button>`;

  function drawScene(){
    const f = state.flags;
    $('#sceneBackdrop').style.background = 'transparent';
    $('#sceneObjects').innerHTML = `<div class="a47-scene ${f.lamp?'lit':''} ${f.card?'ready':''}">
      <div class="a47-room"></div><div class="a47-floor"></div><div class="a47-light-cone"></div>
      ${object('shelf','Scaffale dei fascicoli',f.file)}
      ${object('frame','Fotografia incorniciata',f.frame)}
      ${object('clock','Orologio fermo',f.clock)}
      ${object('lamp','Lampada da tavolo',f.lamp)}
      ${object('desk','Scrivania',f.desk)}
      ${object('cabinet','Schedario 47-B',f.card)}
      ${object('vent','Grata di aerazione',f.vent)}
      ${object('door','Porta blindata',f.door)}
      ${object('reader','Lettore magnetico',f.door)}
      <div class="a47-status">Tocca direttamente un oggetto della stanza</div><div class="a47-fade"></div>
    </div>`;
    document.querySelectorAll('[data-a47]').forEach(b => b.onclick = () => inspect(b.dataset.a47));
  }

  function begin(){
    clearInterval(timerId);
    state = {time:selected.minutes*60,hints:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};
    game.selected=null; game.hour=12; game.minute=0;
    $('#gameCase').textContent='ARCHIVIO 47';
    $('#gameTitle').textContent='Archivio 47 — Sala documenti';
    $('#hintCount').textContent=state.hints;
    drawScene(); drawInventory(); updateTimer(); show('game');
    setTimeout(()=>modal('<h2>Archivio 47</h2><p>La serratura scatta dietro di te. Il lettore della porta è spento e nella stanza resta solo una debole luce d’emergenza.</p><p><strong>Osserva gli oggetti reali della scena:</strong> ogni elemento si apre toccandolo direttamente.</p><button id="a47start" class="action-btn">INIZIA L’INDAGINE</button>'),120);
    setTimeout(()=>{const b=$('#a47start');if(b)b.onclick=closeModal},220);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);modal('<h2>Tempo scaduto</h2><p>Il blocco di sicurezza diventa definitivo.</p><button id="a47retry" class="action-btn">RIPROVA</button>');setTimeout(()=>{const b=$('#a47retry');if(b)b.onclick=()=>{closeModal();begin()}},0)}},1000);
  }

  function inspect(id){
    ({shelf,frame,clock,lamp,desk,cabinet,vent,door,reader:door}[id]||(()=>{}))();
  }

  function shelf(){
    if(state.flags.file) return modal('<h2>Scaffale</h2><p>Il fascicolo 47 è già stato estratto.</p>');
    modal('<h2>Scaffale dei fascicoli</h2><p>Tre cartelle hanno ancora un’etichetta leggibile. Sulla porta della stanza è dipinto un numero.</p><div class="puzzle-grid"><button class="puzzle-choice" data-file="17">17</button><button class="puzzle-choice" data-file="47">47</button><button class="puzzle-choice" data-file="74">74</button></div><p id="a47msg"></p>');
    setTimeout(()=>document.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>{
      if(b.dataset.file!=='47'){ $('#a47msg').innerHTML='<span class="error">Solo vecchie pratiche amministrative.</span>'; return; }
      state.flags.file=true; state.step=1; add('Fotografia strappata','📷');
      note('Nel fascicolo 47 trovi una fotografia: mostra una lancetta dei minuti sul numero 2 e la frase “prima la luce”.');
      drawScene(); $('#a47msg').innerHTML='<span class="success">Trovi una fotografia strappata e un segno che indica la scrivania.</span>';
    }),0);
  }

  function desk(){
    if(state.flags.desk) return modal('<h2>Scrivania</h2><p>Hai già controllato il vano nascosto.</p>');
    if(!state.flags.file) return modal('<h2>Scrivania</h2><p>I cassetti sono chiusi. Sotto il piano si nota una sagoma rettangolare nella polvere.</p>');
    state.flags.desk=true; state.step=2; add('Cacciavite','🪛');
    note('Seguendo il bordo mostrato nella fotografia trovi un cacciavite fissato sotto la scrivania.');
    drawScene(); modal('<h2>Vano sotto il piano</h2><p>Passando le dita sotto il bordo trovi del nastro adesivo.</p><p class="tool-success">Raccogli un cacciavite.</p>');
  }

  function vent(){
    if(state.flags.vent) return modal('<h2>Grata</h2><p>Il condotto è vuoto.</p>');
    if(!chosen('Cacciavite')) return modal('<h2>Grata di aerazione</h2><p>È fissata con quattro viti. Se possiedi uno strumento adatto, selezionalo nell’inventario.</p>');
    game.selected=null; state.flags.vent=true; state.step=3; add('Fusibile','⚡');
    note('Dietro la grata trovi il fusibile mancante della lampada.');
    drawScene(); modal('<h2>Condotto aperto</h2><p>Sviti la grata una vite alla volta.</p><p class="tool-success">Nel condotto trovi un piccolo fusibile.</p>');
  }

  function lamp(){
    if(state.flags.lamp) return modal('<h2>Lampada accesa</h2><p>Il fascio illumina la cornice e la parete vicina.</p>');
    if(!chosen('Fusibile')) return modal('<h2>Lampada da tavolo</h2><p>L’interruttore scatta a vuoto. Sul retro manca un fusibile.</p>');
    remove('Fusibile'); state.flags.lamp=true; state.step=4;
    note('La lampada accesa rivela un simbolo luminoso sulla fotografia incorniciata.');
    drawScene(); modal('<h2>La luce ritorna</h2><p class="tool-success">La lampada si accende. Sulla cornice compare un piccolo simbolo a forma di occhio.</p>');
  }

  function frame(){
    if(!state.flags.lamp) return modal('<h2>Fotografia incorniciata</h2><p>La stanza è troppo buia per distinguere i dettagli sotto il vetro.</p>');
    if(state.flags.frame) return modal('<h2>Cornice aperta</h2><p>Il doppio fondo è vuoto.</p>');
    state.flags.frame=true; state.step=5; add('Lancetta delle ore','➖');
    note('Nel doppio fondo trovi la lancetta delle ore. Dietro la cornice è inciso il numero 10.');
    drawScene(); modal('<h2>Doppio fondo</h2><p>Premi il simbolo illuminato e la cornice scatta.</p><p class="tool-success">Trovi una lancetta corta. Sul retro è inciso 10.</p>');
  }

  function clock(){
    if(state.flags.clock) return modal('<h2>Orologio</h2><p>Il vano segreto è già aperto.</p>');
    if(!has('Lancetta delle ore')) return modal('<h2>Orologio fermo</h2><p>Manca la lancetta corta. Senza di essa non puoi regolare il meccanismo.</p>');
    modal('<h2>Orologio fermo</h2><p>La fotografia indicava i minuti sul 2; dietro la cornice hai trovato il numero delle ore.</p><div class="clock-puzzle"><div class="clock-face"><div class="clock-hand hour"></div><div class="clock-hand minute"></div><div class="clock-center"></div></div><strong id="clockReadout">12:00</strong><div class="clock-controls"><button id="a47hour">+ 1 ORA</button><button id="a47minute">+ 5 MIN</button></div><button id="a47confirm" class="puzzle-action" style="width:100%;margin-top:10px">CONFERMA ORA</button><p id="a47clockmsg"></p></div>');
    const update=()=>{const h=$('.clock-hand.hour'),m=$('.clock-hand.minute');if(h)h.style.transform=`rotate(${(game.hour%12)*30+game.minute*.5}deg)`;if(m)m.style.transform=`rotate(${game.minute*6}deg)`;$('#clockReadout').textContent=`${String(game.hour).padStart(2,'0')}:${String(game.minute).padStart(2,'0')}`};
    setTimeout(()=>{update();$('#a47hour').onclick=()=>{game.hour=game.hour%12+1;update()};$('#a47minute').onclick=()=>{game.minute=(game.minute+5)%60;update()};$('#a47confirm').onclick=()=>{if(game.hour===10&&game.minute===10){remove('Lancetta delle ore');state.flags.clock=true;state.step=6;add('Chiave schedario','🗝️');note('Alle 10:10 l’orologio apre un vano con la chiave dello schedario.');drawScene();$('#a47clockmsg').innerHTML='<span class="success">Un vano si apre: dentro c’è una chiave.</span>'}else $('#a47clockmsg').innerHTML='<span class="error">Il meccanismo non reagisce.</span>'}},0);
  }

  function cabinet(){
    if(state.flags.card) return modal('<h2>Schedario 47-B</h2><p>Il cassetto è aperto e vuoto.</p>');
    if(!chosen('Chiave schedario')) return modal('<h2>Schedario 47-B</h2><p>La serratura è integra. Serve una chiave piccola.</p>');
    remove('Chiave schedario'); state.flags.card=true; state.step=7; add('Tessera 47','💳');
    note('Nel cassetto 47-B trovi la tessera magnetica della porta.');
    drawScene(); modal('<h2>Cassetto 47-B</h2><p>La serratura gira con uno scatto secco.</p><p class="tool-success">Trovi una tessera magnetica contrassegnata 47.</p>');
  }

  function door(){
    if(state.flags.door) return;
    if(!state.flags.card) return modal('<h2>Porta blindata</h2><p>Il lettore magnetico non riconosce alcuna autorizzazione.</p>');
    if(!chosen('Tessera 47')) return modal('<h2>Lettore magnetico</h2><p>Seleziona la Tessera 47 nell’inventario, poi tocca nuovamente il lettore o la porta.</p>');
    modal('<h2>Verifica finale</h2><p>La tessera viene accettata. Il display chiede l’orario dell’evento mostrato nella fotografia.</p><div class="code-input"><input id="a47code" inputmode="numeric" maxlength="4" placeholder="0000"><button id="a47unlock">SBLOCCA</button></div><p id="a47doormsg"></p>');
    setTimeout(()=>$('#a47unlock').onclick=()=>{if($('#a47code').value==='1010'){game.selected=null;state.flags.door=true;drawScene();finish()}else $('#a47doormsg').innerHTML='<span class="error">Codice non riconosciuto.</span>'},0);
  }

  function hint(){
    if(state.hints<=0) return modal('<h2>Nessun indizio rimasto</h2><p>Controlla gli appunti e gli oggetti raccolti.</p>');
    const hints=['Il numero dipinto sulla porta indica quale fascicolo cercare.','La fotografia trovata indica un punto nascosto sotto la scrivania.','Seleziona il cacciavite e usalo sulla grata.','Il fusibile appartiene alla lampada.','Con la luce accesa osserva la fotografia incorniciata.','La lancetta appartiene all’orologio: ore 10, minuti sul 2.','Seleziona la chiave e apri lo schedario 47-B.','Seleziona la tessera e usala sul lettore. Il codice è 1010.'];
    state.hints--;state.hintsUsed++;$('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step,hints.length-1)]}</p>`);
  }

  $('#playBtn').onclick = () => selected.id === 'archivio47' ? begin() : oldPlay();
  $('#hintBtn').onclick = () => selected.id === 'archivio47' ? hint() : oldHint();
  $('#notesBtn').onclick = () => selected.id === 'archivio47' ? modal(`<h2>Appunti</h2><p>${state&&state.notes.length?state.notes.map(x=>'• '+x).join('<br><br>'):'Non hai ancora trovato indizi.'}</p>`) : oldNotes();
})();
