/* Bunker Omega V3 — stanza dedicata */
(() => {
  const $ = s => document.querySelector(s);
  const omega = { selected:null, radio:[], fuses:[], valveOrder:[] };
  const oldPlay=$('#playBtn').onclick, oldHint=$('#hintBtn').onclick, oldNotes=$('#notesBtn').onclick, oldExit=$('#exitBtn').onclick;
  const has=n=>state&&state.inventory.some(x=>x.name===n);
  const chosen=n=>omega.selected===n&&has(n);
  const add=(name,icon)=>{if(!has(name))state.inventory.push({name,icon});drawInventory();};
  const remove=name=>{state.inventory=state.inventory.filter(x=>x.name!==name);if(omega.selected===name)omega.selected=null;drawInventory();};
  const note=text=>{if(state&&!state.notes.includes(text))state.notes.push(text);};
  function drawInventory(){
    const box=$('#inventoryItems');
    box.innerHTML=state.inventory.length?state.inventory.map(i=>`<button class="inventory-item omega-inv ${omega.selected===i.name?'selected':''}" data-omega-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join(''):'<span class="empty">Vuoto</span>';
    box.querySelectorAll('[data-omega-item]').forEach(b=>b.onclick=()=>{omega.selected=omega.selected===b.dataset.omegaItem?null:b.dataset.omegaItem;drawInventory();status(omega.selected?`${omega.selected} selezionato`:'Oggetto deselezionato');});
  }
  function status(text){const el=$('.omega-status');if(!el)return;el.textContent=text;clearTimeout(status.t);status.t=setTimeout(()=>el.textContent='Esamina il bunker e interrompi il lancio',2600);}
  const hot=(id,label,done=false)=>`<button class="omega-hot omega-hot-${id} ${done?'solved':''}" data-omega="${id}" aria-label="${label}"><span>${label}</span></button>`;
  function drawScene(){
    const f=state.flags;document.body.classList.add('omega-active');$('#sceneBackdrop').style.background='transparent';
    $('#sceneObjects').innerHTML=`<div class="omega-scene ${f.power?'power-on':''} ${f.alarmOff?'alarm-off':''} ${f.hatch?'hatch-open':''}">
      <div class="omega-wall"></div><div class="omega-floor"></div><div class="omega-pipes"></div><div class="omega-sign">BUNKER Ω</div>
      <div class="omega-radio"><div class="dial"></div><div class="speaker"></div><b>31</b></div>
      <div class="omega-clock"><span>06:18</span></div><div class="omega-locker"><i></i><b>ARCHIVIO</b></div>
      <div class="omega-generator"><span>GEN-04</span><i></i><i></i><i></i></div>
      <div class="omega-panel"><span>LAUNCH CONTROL</span><div class="lights"><i></i><i></i><i></i></div></div>
      <div class="omega-valves"><i></i><i></i><i></i></div><div class="omega-hatch"><div class="wheel"></div><div class="lock"></div></div>
      <div class="omega-alarm"></div><div class="omega-countdown">${f.alarmOff?'STANDBY':'00:07:42'}</div>
      ${hot('radio','Radio',f.radio)}${hot('clock','Cronometro',f.clock)}${hot('locker','Archivio',f.locker)}${hot('generator','Generatore',f.generator)}${hot('panel','Quadro di lancio',f.panel)}${hot('valves','Valvole',f.valves)}${hot('hatch','Portello',f.hatch)}
      <div class="omega-fog"></div><div class="omega-vignette"></div><div class="omega-status">Esamina il bunker e interrompi il lancio</div></div>`;
    document.querySelectorAll('[data-omega]').forEach(b=>b.onclick=()=>inspect(b.dataset.omega));
  }
  function begin(){
    clearInterval(timerId);state={time:selected.minutes*60,hints:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};omega.selected=null;omega.radio=[];omega.fuses=[];omega.valveOrder=[];
    $('#gameCase').textContent='CASO 05';$('#gameTitle').textContent='Bunker Omega';$('#hintCount').textContent=state.hints;drawScene();drawInventory();updateTimer();show('game');
    setTimeout(()=>modal('<h2>Bunker Omega</h2><p>Le luci d’emergenza si accendono. Una sirena annuncia: <strong>SEQUENZA DI LANCIO ATTIVA</strong>.</p><p>Una trasmissione spezzata continua a ripetere due numeri.</p><button id="omegaStart" class="action-btn">ENTRA NELLA SALA COMANDO</button>'),80);
    setTimeout(()=>{const b=$('#omegaStart');if(b)b.onclick=closeModal},140);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);modal('<h2>Tempo scaduto</h2><p>Il bunker si sigilla e il conto alla rovescia raggiunge zero.</p><button id="omegaRetry" class="action-btn">RIPROVA</button>');setTimeout(()=>{const b=$('#omegaRetry');if(b)b.onclick=()=>{closeModal();begin()}},0)}},1000);
  }
  function inspect(id){({radio,clock,locker,generator,panel,valves,hatch}[id]||(()=>{}))();}
  function radio(){
    if(state.flags.radio)return modal('<h2>Radio militare</h2><p>La frequenza è stabile: squadra 31.</p>');
    omega.radio=[];modal('<h2>Radio militare</h2><p>Imposta la frequenza 3-1-6.</p><div class="omega-radio-puzzle">'+['3','1','6'].map(n=>`<button data-radio="${n}">${n}</button>`).join('')+'</div><p id="omegaRadioMsg"></p>');
    setTimeout(()=>document.querySelectorAll('[data-radio]').forEach(b=>b.onclick=()=>{omega.radio.push(b.dataset.radio);b.disabled=true;if(omega.radio.length===3){if(omega.radio.join('')==='316'){state.flags.radio=true;state.step=1;add('Trascrizione Omega','📄');note('Squadra 31. Sincronizzazione 06:18.');drawScene();$('#omegaRadioMsg').innerHTML='<span class="success">SEGNALE DECODIFICATO</span>'}else{omega.radio=[];document.querySelectorAll('[data-radio]').forEach(x=>x.disabled=false);$('#omegaRadioMsg').innerHTML='<span class="error">Frequenza instabile.</span>'}}}),0);
  }
  function clock(){if(state.flags.clock)return modal('<h2>Cronometro</h2><p>Sincronizzato sulle 06:18.</p>');if(!has('Trascrizione Omega'))return modal('<h2>Cronometro</h2><p>Manca un riferimento.</p>');modal('<h2>Sincronizzazione</h2><div class="code-input"><input id="omegaClockCode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="omegaClockBtn">SINCRONIZZA</button></div><p id="omegaClockMsg"></p>');setTimeout(()=>$('#omegaClockBtn').onclick=()=>{if($('#omegaClockCode').value==='0618'){state.flags.clock=true;state.step=2;add('Chiave archivio','🔑');drawScene();$('#omegaClockMsg').innerHTML='<span class="success">SINCRONIZZAZIONE COMPLETA</span>'}else $('#omegaClockMsg').innerHTML='<span class="error">Orario non valido.</span>'},0);}
  function locker(){if(state.flags.locker)return modal('<h2>Archivio blindato</h2><p>Già aperto.</p>');if(!chosen('Chiave archivio'))return modal('<h2>Archivio blindato</h2><p>Seleziona la chiave archivio.</p>');remove('Chiave archivio');state.flags.locker=true;state.step=3;add('Schema elettrico','📋');note('GEN-04 — fusibili 3-1-2.');drawScene();modal('<h2>Fascicolo Omega</h2><p class="tool-success">GEN-04 — FUSIBILI 3 → 1 → 2</p>');}
  function generator(){if(state.flags.generator)return modal('<h2>Generatore</h2><p>Alimentazione attiva.</p>');if(!has('Schema elettrico'))return modal('<h2>Generatore</h2><p>Serve lo schema.</p>');omega.fuses=[];modal('<h2>Generatore ausiliario</h2><div class="omega-fuses">'+['1','2','3'].map(n=>`<button data-fuse="${n}">${n}</button>`).join('')+'</div><p id="omegaFuseMsg"></p>');setTimeout(()=>document.querySelectorAll('[data-fuse]').forEach(b=>b.onclick=()=>{omega.fuses.push(b.dataset.fuse);b.disabled=true;if(omega.fuses.length===3){if(omega.fuses.join('')==='312'){state.flags.generator=true;state.flags.power=true;state.step=4;add('Leva di sicurezza','🕹️');drawScene();$('#omegaFuseMsg').innerHTML='<span class="success">ALIMENTAZIONE RIPRISTINATA</span>'}else{omega.fuses=[];document.querySelectorAll('[data-fuse]').forEach(x=>x.disabled=false);$('#omegaFuseMsg').innerHTML='<span class="error">Sequenza errata.</span>'}}}),0);}
  function panel(){if(state.flags.panel)return modal('<h2>Quadro di lancio</h2><p>Sequenza disattivata.</p>');if(!state.flags.power)return modal('<h2>Quadro di lancio</h2><p>Il pannello è spento.</p>');if(!chosen('Leva di sicurezza'))return modal('<h2>Quadro di lancio</h2><p>Seleziona la leva di sicurezza.</p>');remove('Leva di sicurezza');state.flags.panel=true;state.step=5;add('Carta comando','💳');note('Valvole: destra, sinistra, centro.');drawScene();modal('<h2>Arresto manuale</h2><p>Il circuito principale è interrotto.</p>');}
  function valves(){if(state.flags.valves)return modal('<h2>Valvole</h2><p>Pressione stabile.</p>');if(!has('Carta comando'))return modal('<h2>Valvole</h2><p>Serve la carta comando.</p>');omega.valveOrder=[];modal('<h2>Valvole di pressione</h2><div class="omega-valve-puzzle"><button data-valve="D">→</button><button data-valve="S">←</button><button data-valve="C">•</button></div><p id="omegaValveMsg"></p>');setTimeout(()=>document.querySelectorAll('[data-valve]').forEach(b=>b.onclick=()=>{omega.valveOrder.push(b.dataset.valve);if(omega.valveOrder.length===3){if(omega.valveOrder.join('')==='DSC'){state.flags.valves=true;state.flags.alarmOff=true;state.step=6;add('Chiave portello','🗝️');drawScene();$('#omegaValveMsg').innerHTML='<span class="success">PRESSIONE STABILE</span>'}else{omega.valveOrder=[];$('#omegaValveMsg').innerHTML='<span class="error">Sequenza errata.</span>'}}}),0);}
  function hatch(){if(state.flags.hatch)return;if(!state.flags.alarmOff)return modal('<h2>Portello</h2><p>La pressione impedisce l’apertura.</p>');if(!chosen('Chiave portello'))return modal('<h2>Portello</h2><p>Seleziona la chiave del portello.</p>');modal('<h2>Portello Omega</h2><div class="code-input"><input id="omegaExitCode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="omegaExitBtn">APRI</button></div><p id="omegaExitMsg"></p>');setTimeout(()=>$('#omegaExitBtn').onclick=()=>{if($('#omegaExitCode').value==='3118'){state.flags.hatch=true;drawScene();document.body.classList.remove('omega-active');finish()}else $('#omegaExitMsg').innerHTML='<span class="error">Codice rifiutato.</span>'},0);}
  function hint(){if(state.hints<=0)return modal('<h2>Nessun indizio rimasto</h2><p>Controlla appunti e inventario.</p>');const hints=['Imposta la radio su 3-1-6.','L’orario è 06:18.','Seleziona la chiave e apri l’archivio.','Lo schema indica 3-1-2.','Seleziona la leva e usala sul quadro.','Valvole: destra, sinistra, centro.','Codice finale: 3118.'];state.hints--;state.hintsUsed++;$('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(state.step,hints.length-1)]}</p>`);}
  $('#playBtn').onclick=()=>selected&&selected.id==='bunker'?begin():oldPlay();
  $('#hintBtn').onclick=()=>selected&&selected.id==='bunker'?hint():oldHint();
  $('#notesBtn').onclick=()=>selected&&selected.id==='bunker'?modal(`<h2>Appunti</h2>${state.notes.length?'<ul>'+state.notes.map(n=>`<li>${n}</li>`).join('')+'</ul>':'<p>Non hai ancora scoperto nulla.</p>'}`):oldNotes();
  $('#exitBtn').onclick=()=>{document.body.classList.remove('omega-active');oldExit();};
})();