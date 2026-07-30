/* Motel 13 V2 — stanza dedicata premium */
(() => {
  const $ = s => document.querySelector(s);
  const motel = { selected:null, channel:1 };
  const oldPlay = $('#playBtn').onclick;
  const oldHint = $('#hintBtn').onclick;
  const oldNotes = $('#notesBtn').onclick;
  const oldExit = $('#exitBtn').onclick;

  const has = name => state && state.inventory.some(x => x.name === name);
  const chosen = name => motel.selected === name && has(name);
  const add = (name,icon) => { if(!has(name)) state.inventory.push({name,icon}); drawInventory(); };
  const remove = name => { state.inventory = state.inventory.filter(x => x.name !== name); if(motel.selected===name) motel.selected=null; drawInventory(); };
  const note = text => { if(state && !state.notes.includes(text)) state.notes.push(text); };

  function drawInventory(){
    const box=$('#inventoryItems');
    box.innerHTML=state.inventory.length?state.inventory.map(i=>`<button class="inventory-item m13-inv ${motel.selected===i.name?'selected':''}" data-m13-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join(''):'<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-m13-item]').forEach(b=>b.onclick=()=>{
      motel.selected=motel.selected===b.dataset.m13Item?null:b.dataset.m13Item;
      drawInventory(); status(motel.selected?`${motel.selected} selezionato`:'Oggetto deselezionato');
    });
  }

  function status(text){
    const el=$('.m13-status'); if(!el)return;
    el.textContent=text; clearTimeout(status.t);
    status.t=setTimeout(()=>el.textContent='Tocca direttamente gli oggetti della camera',2600);
  }

  const hot=(id,label,done=false)=>`<button class="m13-hot m13-${id} ${done?'solved':''}" data-m13="${id}" aria-label="${label}"><span>${label}</span></button>`;

  function drawScene(){
    const f=state.flags;
    document.body.classList.add('m13-active');
    $('#sceneBackdrop').style.background='transparent';
    $('#sceneObjects').innerHTML=`<div class="m13-scene ${f.power?'powered':''} ${f.tv?'tv-on':''} ${f.bath?'bath-open':''}">
      <div class="m13-wall"></div><div class="m13-floor"></div><div class="m13-window"><i></i><b></b></div>
      <div class="m13-curtain left"></div><div class="m13-curtain right"></div>
      <div class="m13-bed"><div class="headboard"></div><div class="pillow p1"></div><div class="pillow p2"></div><div class="blanket"></div></div>
      <div class="m13-nightstand-shape"><div class="drawer"></div><div class="lamp"><i></i><b></b></div></div>
      <div class="m13-phone-shape"><i></i><b></b></div>
      <div class="m13-frame-shape"><div>13</div></div>
      <div class="m13-tv-shape"><div class="screen"><span>NO SIGNAL</span></div><div class="stand"></div></div>
      <div class="m13-suitcase-shape"><i></i><b></b></div>
      <div class="m13-mirror-shape"><i></i></div>
      <div class="m13-bath-door"><div class="fog"></div><span>BAGNO</span></div>
      <div class="m13-exit-door"><div class="number">13</div><div class="reader"></div><div class="handle"></div></div>
      ${hot('door','Porta 13',f.door)}${hot('bath','Bagno',f.bath)}${hot('tv','Televisore',f.tv)}${hot('mirror','Specchio',f.mirror)}${hot('suitcase','Valigia',f.suitcase)}${hot('nightstand','Comodino',f.nightstand)}${hot('phone','Telefono',f.phone)}${hot('frame','Quadro storto',f.frame)}
      <div class="m13-rain"></div><div class="m13-vignette"></div><div class="m13-status">Tocca direttamente gli oggetti della camera</div>
    </div>`;
    document.querySelectorAll('[data-m13]').forEach(b=>b.onclick=()=>inspect(b.dataset.m13));
  }

  function begin(){
    clearInterval(timerId);
    state={time:selected.minutes*60,hints:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};
    motel.selected=null;motel.channel=1;
    $('#gameCase').textContent='CASO 02';
    $('#gameTitle').textContent='Motel 13 — Camera fuori mappa';
    $('#hintCount').textContent=state.hints;
    drawScene();drawInventory();updateTimer();show('game');
    setTimeout(()=>modal('<h2>Motel 13</h2><p>La serratura scatta dietro di te. Fuori piove, il telefono emette un solo squillo e la lampada si spegne.</p><p><strong>Esplora la camera:</strong> ogni indizio appartiene davvero all’ambiente.</p><button id="m13start" class="action-btn">ENTRA NELLA CAMERA</button>'),100);
    setTimeout(()=>{const b=$('#m13start');if(b)b.onclick=closeModal},180);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);modal('<h2>Tempo scaduto</h2><p>Dal corridoio arriva il rumore di una chiave che gira.</p><button id="m13retry" class="action-btn">RIPROVA</button>');setTimeout(()=>{const b=$('#m13retry');if(b)b.onclick=()=>{closeModal();begin()}},0)}},1000);
  }

  function inspect(id){({frame,phone,nightstand,suitcase,mirror,tv,bath,door}[id]||(()=>{}))();}

  function frame(){
    if(state.flags.frame)return modal('<h2>Quadro storto</h2><p>Dietro la cornice non è rimasto altro.</p>');
    state.flags.frame=true;state.step=1;add('Ricevuta telefonica','🧾');
    note('Dietro il quadro trovi una ricevuta: chiamata interna registrata alle 23:16.');
    drawScene();modal('<h2>Dietro il quadro</h2><p>La cornice nasconde una vecchia ricevuta della reception.</p><p class="tool-success">Chiamata interna: 23:16 — Camera 13.</p>');
  }

  function phone(){
    if(state.flags.phone)return modal('<h2>Telefono</h2><p>La linea ora trasmette solo il rumore della pioggia.</p>');
    if(!has('Ricevuta telefonica'))return modal('<h2>Telefono</h2><p>La linea è attiva, ma non sai quale interno comporre.</p>');
    modal('<h2>Telefono della camera</h2><p>La ricevuta mostra quattro cifre. Inseriscile sul tastierino.</p><div class="code-input"><input id="m13phonecode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="m13call">CHIAMA</button></div><p id="m13phonemsg"></p>');
    setTimeout(()=>$('#m13call').onclick=()=>{if($('#m13phonecode').value==='2316'){state.flags.phone=true;state.step=2;add('Chiave della valigia','🗝️');note('Una voce al telefono sussurra: “La chiave dorme sotto il cuscino sinistro”.');drawScene();$('#m13phonemsg').innerHTML='<span class="success">Una voce sussurra. Sollevi il cuscino sinistro e trovi una chiave.</span>'}else $('#m13phonemsg').innerHTML='<span class="error">Nessuno risponde.</span>'},0);
  }

  function nightstand(){
    if(state.flags.nightstand)return modal('<h2>Comodino</h2><p>Il doppio fondo è già aperto.</p>');
    if(!state.flags.phone)return modal('<h2>Comodino</h2><p>Il cassetto è vuoto, ma il legno del fondo suona stranamente cavo.</p>');
    state.flags.nightstand=true;state.step=3;add('Gettone del televisore','🪙');
    note('Nel doppio fondo del comodino trovi un gettone con inciso il numero 13.');
    drawScene();modal('<h2>Doppio fondo</h2><p>Premi la tavola interna e il fondo si solleva.</p><p class="tool-success">Trovi un gettone metallico marcato 13.</p>');
  }

  function suitcase(){
    if(state.flags.suitcase)return modal('<h2>Valigia</h2><p>È aperta e vuota.</p>');
    if(!chosen('Chiave della valigia'))return modal('<h2>Valigia</h2><p>La serratura è chiusa. Se hai una chiave adatta, selezionala nell’inventario.</p>');
    remove('Chiave della valigia');state.flags.suitcase=true;state.step=4;add('Frammento di specchio','🔺');
    note('Nella valigia trovi un frammento di specchio avvolto in un asciugamano con la scritta “completa il volto”.');
    drawScene();modal('<h2>Valigia aperta</h2><p>Dentro non ci sono vestiti, soltanto un asciugamano umido.</p><p class="tool-success">Raccogli un frammento di specchio.</p>');
  }

  function mirror(){
    if(state.flags.mirror)return modal('<h2>Specchio</h2><p>La scritta sul vetro resta visibile: CANALE 13.</p>');
    if(!chosen('Frammento di specchio'))return modal('<h2>Specchio rotto</h2><p>Manca un pezzo al centro. Il bordo sembra combaciare con qualcosa.</p>');
    remove('Frammento di specchio');state.flags.mirror=true;state.step=5;
    note('Completando lo specchio compare nella condensa la frase “CANALE 13”.');
    drawScene();modal('<h2>Il volto completo</h2><p>Il frammento entra perfettamente. Sul vetro appannato affiora una frase.</p><p class="tool-success">CANALE 13</p>');
  }

  function tv(){
    if(state.flags.tv)return modal('<h2>Televisore</h2><p>Sul canale 13 resta congelata l’immagine del bagno.</p>');
    if(!chosen('Gettone del televisore'))return modal('<h2>Televisore</h2><p>Un vecchio apparecchio a gettone. La fessura è vuota.</p>');
    if(!state.flags.mirror)return modal('<h2>Televisore</h2><p>Il gettone può accenderlo, ma non sai ancora quale canale cercare.</p>');
    remove('Gettone del televisore');
    modal('<h2>Televisore</h2><p>Il gettone avvia l’apparecchio. Cerca il canale indicato dallo specchio.</p><div class="m13-channel"><button id="m13prev">−</button><strong id="m13channel">1</strong><button id="m13next">+</button></div><button id="m13confirmchannel" class="puzzle-action" style="width:100%;margin-top:12px">GUARDA CANALE</button><p id="m13tvmsg"></p>');
    setTimeout(()=>{const update=()=>$('#m13channel').textContent=motel.channel;$('#m13prev').onclick=()=>{motel.channel=motel.channel<=1?20:motel.channel-1;update()};$('#m13next').onclick=()=>{motel.channel=motel.channel>=20?1:motel.channel+1;update()};$('#m13confirmchannel').onclick=()=>{if(motel.channel===13){state.flags.tv=true;state.step=6;add('Schema del bagno','📺');note('Il canale 13 mostra il bagno: dietro la griglia di aerazione lampeggia una tessera.');drawScene();$('#m13tvmsg').innerHTML='<span class="success">L’immagine mostra una griglia nel bagno e qualcosa dietro le lamelle.</span>'}else $('#m13tvmsg').innerHTML='<span class="error">Solo neve e interferenze.</span>'}},0);
  }

  function bath(){
    if(state.flags.bath)return modal('<h2>Bagno</h2><p>La griglia è aperta. Non c’è più nulla nel condotto.</p>');
    if(!has('Schema del bagno'))return modal('<h2>Bagno</h2><p>Lo specchio è appannato e la griglia sembra normale. Non sai dove cercare.</p>');
    state.flags.bath=true;state.step=7;add('Tessera Motel 13','🎫');
    note('Dietro la griglia del bagno trovi la tessera magnetica della porta. Sul retro è scritto 2316.');
    drawScene();modal('<h2>Dietro la griglia</h2><p>Le lamelle si sganciano con una lieve pressione.</p><p class="tool-success">Trovi la tessera magnetica della Camera 13.</p>');
  }

  function door(){
    if(state.flags.door)return;
    if(!chosen('Tessera Motel 13'))return modal('<h2>Porta 13</h2><p>Il lettore richiede una tessera magnetica valida.</p>');
    modal('<h2>Uscita della Camera 13</h2><p>La tessera viene accettata. Il display chiede l’orario dell’ultima chiamata.</p><div class="code-input"><input id="m13doorcode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="m13unlock">SBLOCCA</button></div><p id="m13doormsg"></p>');
    setTimeout(()=>$('#m13unlock').onclick=()=>{if($('#m13doorcode').value==='2316'){motel.selected=null;state.flags.door=true;drawScene();document.body.classList.remove('m13-active');finish()}else $('#m13doormsg').innerHTML='<span class="error">Il corridoio resta chiuso.</span>'},0);
  }

  function hint(){
    if(state.hints<=0)return modal('<h2>Nessun indizio rimasto</h2><p>Controlla gli appunti e gli oggetti raccolti.</p>');
    const hints=['Il quadro sopra il letto non è perfettamente allineato.','Usa le quattro cifre della ricevuta sul telefono.','Controlla il comodino dopo aver ascoltato la telefonata.','Seleziona la chiave e usala sulla valigia.','Completa lo specchio con il frammento.','Il televisore funziona a gettone: cerca il canale 13.','L’immagine televisiva indica dove cercare nel bagno.','Seleziona la tessera e usa 2316 sulla porta.'];
    state.hints--;state.hintsUsed++;$('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step,hints.length-1)]}</p>`);
  }

  $('#playBtn').onclick=()=>selected.id==='motel13'?begin():oldPlay();
  $('#hintBtn').onclick=()=>selected&&selected.id==='motel13'?hint():oldHint();
  $('#notesBtn').onclick=()=>selected&&selected.id==='motel13'?modal(`<h2>Appunti</h2>${state.notes.length?'<ul>'+state.notes.map(n=>`<li>${n}</li>`).join('')+'</ul>':'<p>Non hai ancora scoperto nulla.</p>'}`):oldNotes();
  $('#exitBtn').onclick=()=>{document.body.classList.remove('m13-active');oldExit();};
})();