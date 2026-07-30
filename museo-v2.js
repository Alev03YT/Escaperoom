/* Il Museo Silenzioso V2 — stanza dedicata premium */
(() => {
  const $ = s => document.querySelector(s);
  const museum = { selected:null, symbols:[], order:[] };
  const oldPlay=$('#playBtn').onclick, oldHint=$('#hintBtn').onclick, oldNotes=$('#notesBtn').onclick, oldExit=$('#exitBtn').onclick;

  const has=n=>state&&state.inventory.some(x=>x.name===n);
  const chosen=n=>museum.selected===n&&has(n);
  const add=(name,icon)=>{if(!has(name))state.inventory.push({name,icon});drawInventory();};
  const remove=name=>{state.inventory=state.inventory.filter(x=>x.name!==name);if(museum.selected===name)museum.selected=null;drawInventory();};
  const note=text=>{if(state&&!state.notes.includes(text))state.notes.push(text);};

  function drawInventory(){
    const box=$('#inventoryItems');
    box.innerHTML=state.inventory.length?state.inventory.map(i=>`<button class="inventory-item museum-inv ${museum.selected===i.name?'selected':''}" data-museum-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join(''):'<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-museum-item]').forEach(b=>b.onclick=()=>{museum.selected=museum.selected===b.dataset.museumItem?null:b.dataset.museumItem;drawInventory();status(museum.selected?`${museum.selected} selezionato`:'Oggetto deselezionato');});
  }
  function status(text){const el=$('.museum-status');if(!el)return;el.textContent=text;clearTimeout(status.t);status.t=setTimeout(()=>el.textContent='Esamina le opere e gli arredi del museo',2600);}
  const hot=(id,label,done=false)=>`<button class="museum-hot museum-${id} ${done?'solved':''}" data-museum="${id}" aria-label="${label}"><span>${label}</span></button>`;

  function drawScene(){
    const f=state.flags;document.body.classList.add('museum-active');$('#sceneBackdrop').style.background='transparent';
    $('#sceneObjects').innerHTML=`<div class="museum-scene ${f.lasers?'lasers-off':''} ${f.vault?'vault-open':''}">
      <div class="museum-wall"></div><div class="museum-floor"></div><div class="museum-arch a1"></div><div class="museum-arch a2"></div>
      <div class="museum-statue"><div class="head"></div><div class="body"></div><div class="base"><b>26</b></div></div>
      <div class="museum-candelabrum"><i></i><b></b><em></em></div>
      <div class="museum-map"><div>✦</div></div>
      <div class="museum-case"><div class="glass"><span>RELIQUIA</span></div><div class="plinth"></div></div>
      <div class="museum-painting"><div class="portrait"></div></div>
      <div class="museum-console"><span>SECURITY</span><i></i><i></i><i></i><i></i></div>
      <div class="museum-vault"><div class="wheel"></div><div class="slot"></div></div>
      <div class="museum-exit"><div class="scanner"></div><div class="handle"></div></div>
      <div class="museum-laser l1"></div><div class="museum-laser l2"></div><div class="museum-laser l3"></div>
      ${hot('statue','Statua',f.statue)}${hot('candelabrum','Candelabro',f.candelabrum)}${hot('map','Mappa antica',f.map)}${hot('case','Vetrina',f.case)}${hot('painting','Quadro',f.painting)}${hot('console','Console sicurezza',f.console)}${hot('vault','Caveau',f.vault)}${hot('exit','Portone',f.exit)}
      <div class="museum-dust"></div><div class="museum-vignette"></div><div class="museum-status">Esamina le opere e gli arredi del museo</div>
    </div>`;
    document.querySelectorAll('[data-museum]').forEach(b=>b.onclick=()=>inspect(b.dataset.museum));
  }

  function begin(){
    clearInterval(timerId);state={time:selected.minutes*60,hints:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};museum.selected=null;museum.symbols=[];museum.order=[];
    $('#gameCase').textContent='CASO 04';$('#gameTitle').textContent='Il Museo Silenzioso';$('#hintCount').textContent=state.hints;drawScene();drawInventory();updateTimer();show('game');
    setTimeout(()=>modal('<h2>Il Museo Silenzioso</h2><p>Le luci di emergenza si accendono. Una voce metallica annuncia: <strong>INTRUSO RILEVATO</strong>.</p><p>La statua scomparsa sembra essere ancora qui, ma nessuna telecamera la vede.</p><button id="museumStart" class="action-btn">ENTRA NELLA GALLERIA</button>'),100);
    setTimeout(()=>{const b=$('#museumStart');if(b)b.onclick=closeModal},180);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);modal('<h2>Tempo scaduto</h2><p>Le serrande calano e il museo torna completamente silenzioso.</p><button id="museumRetry" class="action-btn">RIPROVA</button>');setTimeout(()=>{const b=$('#museumRetry');if(b)b.onclick=()=>{closeModal();begin()}},0)}},1000);
  }
  function inspect(id){({statue,candelabrum,map,case:displayCase,painting,console:security,vault,exit}[id]||(()=>{}))();}

  function statue(){
    if(state.flags.statue)return modal('<h2>Statua del Custode</h2><p>La targhetta è già stata rimossa.</p>');
    state.flags.statue=true;state.step=1;add('Targhetta del restauro','🏷️');note('Sulla base della statua: “Restauro 19:42 — Reperto 26”.');drawScene();
    modal('<h2>Statua del Custode</h2><p>La figura tiene una mano davanti agli occhi. Sotto la base trovi una targhetta allentata.</p><p class="tool-success">RESTAURO 19:42 — REPERTO 26</p>');
  }
  function candelabrum(){
    if(state.flags.candelabrum)return modal('<h2>Candelabro</h2><p>La candela centrale resta abbassata.</p>');
    if(!has('Targhetta del restauro'))return modal('<h2>Candelabro</h2><p>Quattro candele di altezza diversa. La base mostra piccoli numeri consumati.</p>');
    modal('<h2>Candelabro cronologico</h2><p>Abbassa le candele nell’ordine indicato dall’orario del restauro.</p><div class="museum-sequence">${['1','9','4','2'].map(n=>`<button data-candle="${n}">${n}</button>`).join('')}</div><p id="museumCandleMsg"></p>');
    setTimeout(()=>document.querySelectorAll('[data-candle]').forEach(b=>b.onclick=()=>{museum.order.push(b.dataset.candle);b.disabled=true;if(museum.order.length===4){if(museum.order.join('')==='1942'){state.flags.candelabrum=true;state.step=2;add('Lente del curatore','🔍');note('Il candelabro nasconde una lente d’ingrandimento.');drawScene();$('#museumCandleMsg').innerHTML='<span class="success">Scatta un vano segreto: trovi una lente.</span>'}else{museum.order=[];document.querySelectorAll('[data-candle]').forEach(x=>x.disabled=false);$('#museumCandleMsg').innerHTML='<span class="error">Il meccanismo torna in posizione.</span>'}}}),0);
  }
  function map(){
    if(state.flags.map)return modal('<h2>Mappa antica</h2><p>La frase nascosta è ormai leggibile: NORD, EST, OVEST, SUD.</p>');
    if(!chosen('Lente del curatore'))return modal('<h2>Mappa antica</h2><p>La pergamena è piena di graffi troppo sottili per essere letti.</p>');
    remove('Lente del curatore');state.flags.map=true;state.step=3;add('Sequenza delle sale','🗺️');note('Con la lente leggi: NORD → EST → OVEST → SUD.');drawScene();modal('<h2>Inchiostro invisibile</h2><p>La lente rivela una traccia nascosta tra le vie della città.</p><p class="tool-success">NORD → EST → OVEST → SUD</p>');
  }
  function displayCase(){
    if(state.flags.case)return modal('<h2>Vetrina</h2><p>La reliquia non è più sul piedistallo.</p>');
    if(!has('Sequenza delle sale'))return modal('<h2>Vetrina</h2><p>Il vetro è bloccato da quattro sensori direzionali.</p>');
    modal('<h2>Sensori della vetrina</h2><p>Imposta la sequenza letta sulla mappa.</p><div class="museum-arrows">${[['N','↑'],['E','→'],['O','←'],['S','↓']].map(x=>`<button data-dir="${x[0]}">${x[1]}</button>`).join('')}</div><p id="museumCaseMsg"></p>');
    setTimeout(()=>document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{museum.symbols.push(b.dataset.dir);if(museum.symbols.length===4){if(museum.symbols.join('')==='NEOS'){state.flags.case=true;state.step=4;add('Sigillo d’ottone','🔘');note('Nella vetrina trovi un sigillo d’ottone con il numero 26.');drawScene();$('#museumCaseMsg').innerHTML='<span class="success">Il vetro si solleva senza rumore.</span>'}else{museum.symbols=[];$('#museumCaseMsg').innerHTML='<span class="error">Sequenza errata.</span>'}}}),0);
  }
  function painting(){
    if(state.flags.painting)return modal('<h2>Ritratto del fondatore</h2><p>Dietro il quadro resta visibile una serratura circolare.</p>');
    if(!chosen('Sigillo d’ottone'))return modal('<h2>Ritratto del fondatore</h2><p>La cornice sporge dal muro. Dietro si intravede una cavità rotonda.</p>');
    remove('Sigillo d’ottone');state.flags.painting=true;state.step=5;add('Chiave del caveau','🗝️');note('Il sigillo apre il pannello dietro il ritratto. All’interno c’è la chiave del caveau.');drawScene();modal('<h2>Dietro il ritratto</h2><p>Il sigillo ruota nella cavità e libera un piccolo vano blindato.</p><p class="tool-success">Raccogli la chiave del caveau.</p>');
  }
  function security(){
    if(state.flags.console)return modal('<h2>Console sicurezza</h2><p>I laser sono disattivati.</p>');
    if(!state.flags.painting)return modal('<h2>Console sicurezza</h2><p>Richiede il numero del reperto e l’orario del restauro.</p>');
    modal('<h2>Console di sicurezza</h2><p>Inserisci prima il reperto, poi l’orario.</p><div class="code-input"><input id="museumSecurityCode" inputmode="numeric" maxlength="6" placeholder="000000"><button id="museumSecurityBtn">DISATTIVA</button></div><p id="museumSecurityMsg"></p>');
    setTimeout(()=>$('#museumSecurityBtn').onclick=()=>{if($('#museumSecurityCode').value==='261942'){state.flags.console=true;state.flags.lasers=true;state.step=6;add('Pass del custode','🎟️');note('La console accetta 26-1942 e rilascia il pass del custode.');drawScene();$('#museumSecurityMsg').innerHTML='<span class="success">LASER DISATTIVATI — PASS RILASCIATO</span>'}else $('#museumSecurityMsg').innerHTML='<span class="error">Credenziali non valide.</span>'},0);
  }
  function vault(){
    if(state.flags.vault)return modal('<h2>Caveau</h2><p>Il piedistallo interno è vuoto.</p>');
    if(!state.flags.lasers)return modal('<h2>Caveau</h2><p>Tre fasci laser impediscono di raggiungere la serratura.</p>');
    if(!chosen('Chiave del caveau'))return modal('<h2>Caveau</h2><p>La serratura meccanica richiede una chiave antica.</p>');
    remove('Chiave del caveau');state.flags.vault=true;state.step=7;add('Idolo silenzioso','🗿');note('Nel caveau trovi l’idolo scomparso. Sul fondo è inciso: “Non voltarti”.');drawScene();modal('<h2>Il caveau si apre</h2><p>La porta ruota lentamente. Sul piedistallo c’è la statua dichiarata scomparsa.</p><p class="tool-success">Hai recuperato l’Idolo silenzioso.</p>');
  }
  function exit(){
    if(state.flags.exit)return;
    if(!chosen('Pass del custode'))return modal('<h2>Portone principale</h2><p>Lo scanner richiede il pass del custode.</p>');
    if(!has('Idolo silenzioso'))return modal('<h2>Portone principale</h2><p>Il sistema accetta il pass, ma il caso non è ancora risolto.</p>');
    modal('<h2>Uscita del museo</h2><p>Lo scanner riconosce il pass. Conferma il numero del reperto scomparso.</p><div class="code-input"><input id="museumExitCode" inputmode="numeric" maxlength="2" placeholder="00"><button id="museumExitBtn">APRI</button></div><p id="museumExitMsg"></p>');
    setTimeout(()=>$('#museumExitBtn').onclick=()=>{if($('#museumExitCode').value==='26'){museum.selected=null;state.flags.exit=true;drawScene();document.body.classList.remove('museum-active');finish()}else $('#museumExitMsg').innerHTML='<span class="error">Reperto non riconosciuto.</span>'},0);
  }
  function hint(){
    if(state.hints<=0)return modal('<h2>Nessun indizio rimasto</h2><p>Controlla appunti e inventario.</p>');
    const hints=['Controlla la base della statua.','L’orario 19:42 indica l’ordine delle candele.','Seleziona la lente e usala sulla mappa.','Segui i punti cardinali sulla vetrina.','Seleziona il sigillo e prova il quadro.','La console vuole reperto seguito da orario: 26 e 1942.','Seleziona la chiave e apri il caveau.','Seleziona il pass, poi usa il numero 26 sul portone.'];
    state.hints--;state.hintsUsed++;$('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step,hints.length-1)]}</p>`);
  }
  $('#playBtn').onclick=()=>selected.id==='museo'?begin():oldPlay();
  $('#hintBtn').onclick=()=>selected&&selected.id==='museo'?hint():oldHint();
  $('#notesBtn').onclick=()=>selected&&selected.id==='museo'?modal(`<h2>Appunti</h2>${state.notes.length?'<ul>'+state.notes.map(n=>`<li>${n}</li>`).join('')+'</ul>':'<p>Non hai ancora scoperto nulla.</p>'}`):oldNotes();
  $('#exitBtn').onclick=()=>{document.body.classList.remove('museum-active');oldExit();};
})();