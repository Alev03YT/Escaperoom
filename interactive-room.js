/* EscapeVerse — motore immersivo */
(() => {
  const game = { selectedItem:null, hour:12, minute:0 };
  const hasItem=name=>state&&state.inventory.some(x=>x.name===name);
  const selectedIs=name=>game.selectedItem===name&&hasItem(name);
  const addNote=text=>{if(state&&!state.notes.includes(text))state.notes.push(text)};
  const roomLabel=()=>selected.id==='archivio47'?'Archivio 47 — Sala documenti':selected.names?.[0]||selected.title;

  function addItem(name,icon){if(!hasItem(name))state.inventory.push({name,icon});renderInteractiveInventory()}
  function removeItem(name){state.inventory=state.inventory.filter(x=>x.name!==name);if(game.selectedItem===name)game.selectedItem=null;renderInteractiveInventory()}
  function renderInteractiveInventory(){
    const box=document.querySelector('#inventoryItems');
    if(!state||!state.inventory.length){box.innerHTML='<span class="empty">Vuoto</span>';return}
    box.innerHTML=state.inventory.map(i=>`<button class="inventory-item interactive ${game.selectedItem===i.name?'selected':''}" data-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join('');
    box.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{game.selectedItem=game.selectedItem===b.dataset.item?null:b.dataset.item;renderInteractiveInventory();status(game.selectedItem?`${game.selectedItem} selezionato: usalo su un elemento della stanza`:'Oggetto deselezionato')})
  }
  function status(text){const s=document.querySelector('.room-status');if(!s)return;s.textContent=text;clearTimeout(status.t);status.t=setTimeout(()=>s.textContent='Esplora la stanza e osserva ogni dettaglio',3000)}
  function palette(){const [a,b,c]=selected.colors;return `--room-top:${a};--room-bottom:${b};--room-accent:${c};--room-side:${b};--room-center:${a};--floor-a:${b};--floor-b:${a}`}
  function archiveButton(i,name,style,art,done=false){return `<button class="room-hotspot archive-extra ${done?'solved':''}" data-target="${i}" aria-label="${name}" style="${style}"><span class="room-object" style="${art}"></span><small>${name}</small></button>`}
  function renderArchiveScene(){
    const f=state.flags||{};
    return `<div class="immersive-scene" data-theme="archive" style="${palette()}">
      <div class="immersive-room"></div><div class="immersive-floor"></div>
      ${archiveButton(0,'Lampada da tavolo','left:37%;top:34%;width:10%;height:22%','border-radius:50% 50% 8px 8px;background:linear-gradient(#796b45,#262116);box-shadow:0 0 34px rgba(244,211,124,.18)',f.lamp)}
      ${archiveButton(1,'Scaffale dei fascicoli','left:4%;top:15%;width:28%;height:53%','border:8px solid #15100d;background:repeating-linear-gradient(180deg,#3b291f 0 29%,#120d0a 29% 32%)',f.photo)}
      ${archiveButton(2,'Fotografia incorniciata','left:38%;top:12%;width:17%;height:19%','border:9px solid #2d2018;background:linear-gradient(135deg,#b4aa91,#5d5548);transform:rotate(-3deg)',f.frame)}
      ${archiveButton(3,'Orologio fermo','left:58%;top:12%;width:13%;aspect-ratio:1','border:8px solid #5d452a;border-radius:50%;background:radial-gradient(circle,#d7cba9 0 59%,#987b49 60% 68%,#201912 69%)',f.clock)}
      ${archiveButton(4,'Scrivania','right:5%;top:39%;width:31%;height:31%','background:linear-gradient(#4b3428 0 16%,#2c211a 17%);border:6px solid #17110e',f.desk)}
      ${archiveButton(5,'Schedario metallico','left:34%;bottom:10%;width:18%;height:29%','border:7px solid #1a2026;background:repeating-linear-gradient(180deg,#46515b 0 23%,#232a30 23% 25%)',f.cabinet)}
      ${archiveButton(6,'Grata di aerazione','left:54%;bottom:10%;width:16%;height:12%','border:6px solid #4b5158;background:repeating-linear-gradient(90deg,#080a0d 0 8%,#a0a7ad 8% 11%,#080a0d 11% 19%)',f.vent)}
      ${archiveButton(7,'Porta blindata','right:7%;bottom:5%;width:20%;height:45%','border:9px solid #10141a;background:linear-gradient(90deg,#30363c,#171c22 48%,#363c43)',f.door)}
      <div class="room-status">Esplora la stanza e osserva ogni dettaglio</div><div class="immersive-flicker"></div>
    </div>`
  }
  function renderScene(){
    document.querySelector('#sceneBackdrop').style.background='transparent';
    const solved=state.flags||{};
    document.querySelector('#sceneObjects').innerHTML=selected.id==='archivio47'?renderArchiveScene():`<div class="immersive-scene" data-theme="${selected.theme}" style="${palette()}"><div class="immersive-room"></div><div class="immersive-floor"></div>${selected.objects.map((o,i)=>`<button class="room-hotspot ${solved['p'+i]?'solved':''}" data-target="${i}" aria-label="${selected.names[i]}"><span class="room-object">${o}</span><small>${selected.names[i]}</small></button>`).join('')}<div class="room-status">Esplora la stanza e osserva ogni dettaglio</div><div class="immersive-flicker"></div></div>`;
    document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>inspect(Number(b.dataset.target)))
  }
  function startImmersive(){
    clearInterval(timerId);state={time:selected.minutes*60,hints:selected.difficulty==='nightmare'?1:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false,flags:{}};game.selectedItem=null;game.hour=12;game.minute=0;
    document.querySelector('#gameCase').textContent=selected.id==='archivio47'?'ARCHIVIO 47':selected.case;document.querySelector('#gameTitle').textContent=roomLabel();document.querySelector('#hintCount').textContent=state.hints;renderScene();renderInteractiveInventory();updateTimer();show('game');
    if(selected.id==='archivio47')setTimeout(()=>modal('<h2>Archivio 47</h2><p>La porta si chiude alle tue spalle. La sala è senza corrente e il lettore d’uscita è spento.</p><p>Trova il fascicolo scomparso e riattiva il sistema prima che il blocco di sicurezza diventi definitivo.</p><button id="beginArchive" class="action-btn">INIZIA A ESPLORARE</button>'),150),setTimeout(()=>{const b=document.querySelector('#beginArchive');if(b)b.onclick=closeModal},250);
    timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);modal(`<h2>Tempo scaduto</h2><p>${selected.title} si richiude.</p><button id="retryImmersive" class="action-btn">Riprova</button>`);setTimeout(()=>document.querySelector('#retryImmersive').onclick=()=>{closeModal();startImmersive()},0)}},1000)
  }
  function inspect(i){if(selected.id==='archivio47')return [archiveLamp,archiveShelf,archiveFrame,archiveClock,archiveDesk,archiveCabinet,archiveVent,archiveDoor][i]();return [genericClue,genericFirstLock,genericSecondLock,genericTool,genericDoor][i]()}
  function codePuzzle(title,icon,text,code,onSuccess,max=4){modal(`<h2>${title}</h2><div class="object-art">${icon}</div><p>${text}</p><div class="code-input"><input id="immersiveCode" inputmode="numeric" maxlength="${max}" placeholder="${'0'.repeat(max)}"><button id="tryImmersiveCode">PROVA</button></div><div id="immersiveMsg"></div>`);setTimeout(()=>document.querySelector('#tryImmersiveCode').onclick=()=>{if(document.querySelector('#immersiveCode').value===code){onSuccess();document.querySelector('#immersiveMsg').innerHTML='<p class="success">Il meccanismo si sblocca.</p>'}else document.querySelector('#immersiveMsg').innerHTML='<p class="error">Non succede nulla. Ricontrolla gli indizi nella stanza.</p>'},0)}

  function archiveLamp(){
    if(state.flags.lamp)return modal('<h2>Lampada accesa</h2><p>Ora riesci a distinguere meglio i dettagli della stanza.</p>');
    if(!selectedIs('Fusibile'))return modal('<h2>Lampada da tavolo</h2><p>L’interruttore scatta, ma la lampada non riceve corrente. Sul retro manca un piccolo fusibile.</p>');
    removeItem('Fusibile');state.flags.lamp=true;state.step=Math.max(state.step,5);addNote('Con la lampada accesa è comparso un riflesso sulla cornice della fotografia.');renderScene();modal('<h2>La luce ritorna</h2><p class="tool-success">Inserisci il fusibile. La lampada illumina la parete e sulla fotografia compare un piccolo simbolo a forma di occhio.</p>')
  }
  function archiveShelf(){
    if(state.flags.photo)return modal('<h2>Scaffale dei fascicoli</h2><p>Hai già controllato il fascicolo 47.</p>');
    modal('<h2>Scaffale dei fascicoli</h2><p>Le etichette sono consumate. Un cartellino sul ripiano dice: “Il caso che cerchi è quello segnato sulla porta”.</p><div class="puzzle-grid"><button class="puzzle-choice" data-file="17">17</button><button class="puzzle-choice" data-file="47">47</button><button class="puzzle-choice" data-file="74">74</button></div><div id="fileResult"></div>');
    setTimeout(()=>document.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>{const r=document.querySelector('#fileResult');if(b.dataset.file!=='47'){r.innerHTML='<p class="error">Contiene solo pratiche amministrative.</p>';return}state.flags.photo=true;state.step=1;addItem('Foto strappata','📷');addNote('Nel fascicolo 47 trovi una fotografia strappata: mostra un orologio e la scritta “prima la luce”.');renderScene();r.innerHTML='<p class="success">Tra i documenti trovi una fotografia strappata. Mostra un orologio e la frase “prima la luce”.</p>'}),0)
  }
  function archiveFrame(){
    if(!state.flags.lamp)return modal('<h2>Fotografia incorniciata</h2><p>È troppo buio per distinguere ciò che c’è sotto il vetro. La cornice sembra avere un doppio fondo.</p>');
    if(state.flags.frame)return modal('<h2>Cornice aperta</h2><p>Dietro la fotografia non è rimasto altro.</p>');
    state.flags.frame=true;state.step=Math.max(state.step,6);addItem('Lancetta corta','➖');addNote('Dietro la cornice trovi la lancetta delle ore. Sulla parete compare il numero 10.');renderScene();modal('<h2>Doppio fondo</h2><p>Premendo il simbolo illuminato, la cornice si apre.</p><p class="tool-success">Trovi una lancetta corta. Dietro è inciso il numero 10.</p>')
  }
  function updateClock(){const h=document.querySelector('.clock-hand.hour'),m=document.querySelector('.clock-hand.minute');if(h)h.style.transform=`rotate(${(game.hour%12)*30+game.minute*.5}deg)`;if(m)m.style.transform=`rotate(${game.minute*6}deg)`;const r=document.querySelector('#clockReadout');if(r)r.textContent=`${String(game.hour).padStart(2,'0')}:${String(game.minute).padStart(2,'0')}`}
  function archiveClock(){
    if(!hasItem('Lancetta corta'))return modal('<h2>Orologio fermo</h2><p>Manca la lancetta delle ore. Il meccanismo non può essere regolato.</p>');
    if(state.flags.clock)return modal('<h2>Orologio aperto</h2><p>Lo scomparto nascosto è vuoto.</p>');
    modal('<h2>Orologio fermo</h2><p>Rimetti la lancetta e usa gli indizi trovati. La fotografia strappata mostrava i minuti sul 2.</p><div class="clock-puzzle"><div class="clock-face"><div class="clock-hand hour"></div><div class="clock-hand minute"></div><div class="clock-center"></div></div><strong id="clockReadout">12:00</strong><div class="clock-controls"><button id="hourBtn">+ 1 ORA</button><button id="minuteBtn">+ 5 MIN</button></div><button id="confirmClock" class="puzzle-action" style="width:100%;margin-top:10px">CONFERMA</button><p id="clockMsg"></p></div>');
    setTimeout(()=>{updateClock();document.querySelector('#hourBtn').onclick=()=>{game.hour=game.hour%12+1;updateClock()};document.querySelector('#minuteBtn').onclick=()=>{game.minute=(game.minute+5)%60;updateClock()};document.querySelector('#confirmClock').onclick=()=>{if(game.hour===10&&game.minute===10){removeItem('Lancetta corta');state.flags.clock=true;state.step=Math.max(state.step,7);addItem('Chiave schedario','🗝️');addNote('L’orologio impostato alle 10:10 apre un vano con una chiave.');renderScene();document.querySelector('#clockMsg').innerHTML='<span class="success">Si apre un piccolo vano: dentro c’è una chiave.</span>'}else document.querySelector('#clockMsg').innerHTML='<span class="error">Il meccanismo resta fermo.</span>'}},0)
  }
  function archiveDesk(){
    if(state.flags.desk)return modal('<h2>Scrivania</h2><p>Hai già esaminato tutti i cassetti.</p>');
    if(!state.flags.photo)return modal('<h2>Scrivania</h2><p>I cassetti sono chiusi. Sulla superficie c’è un’impronta rettangolare, come se mancasse una fotografia.</p>');
    state.flags.desk=true;state.step=Math.max(state.step,2);addItem('Cacciavite','🪛');addNote('Sotto la scrivania trovi un cacciavite fissato con del nastro.');renderScene();modal('<h2>Sotto la scrivania</h2><p>Seguendo il bordo indicato nella fotografia trovi un oggetto nascosto.</p><p class="tool-success">Raccogli un cacciavite.</p>')
  }
  function archiveCabinet(){
    if(state.flags.cabinet)return modal('<h2>Schedario</h2><p>I cassetti sono ormai aperti.</p>');
    if(!selectedIs('Chiave schedario'))return modal('<h2>Schedario metallico</h2><p>È chiuso da una serratura piccola. Serve la chiave giusta.</p>');
    removeItem('Chiave schedario');state.flags.cabinet=true;state.step=Math.max(state.step,8);addItem('Tessera 47','💳');addNote('Nel cassetto “47-B” trovi la tessera del lettore della porta.');renderScene();modal('<h2>Cassetto 47-B</h2><p>La chiave apre il secondo cassetto.</p><p class="tool-success">All’interno trovi una tessera magnetica contrassegnata 47.</p>')
  }
  function archiveVent(){
    if(state.flags.vent)return modal('<h2>Grata rimossa</h2><p>Il condotto è vuoto.</p>');
    if(!selectedIs('Cacciavite'))return modal('<h2>Grata di aerazione</h2><p>Quattro viti la tengono ferma. Serve uno strumento adatto.</p>');
    game.selectedItem=null;state.flags.vent=true;state.step=Math.max(state.step,3);addItem('Fusibile','⚡');addNote('Nel condotto trovi il fusibile della lampada.');renderScene();modal('<h2>Condotto di aerazione</h2><p>Rimuovi le viti una alla volta.</p><p class="tool-success">Dietro la grata trovi un fusibile avvolto nella carta.</p>')
  }
  function archiveDoor(){
    if(!state.flags.cabinet)return modal('<h2>Porta blindata</h2><p>Il lettore è acceso, ma richiede una tessera autorizzata.</p>');
    if(!selectedIs('Tessera 47'))return modal('<h2>Lettore della porta</h2><p>Seleziona la Tessera 47 nell’inventario e usala qui.</p>');
    codePuzzle('Verifica archivio','💳','Il display chiede l’orario dell’evento mostrato nella fotografia. Inseriscilo senza i due punti.','1010',()=>{game.selectedItem=null;state.flags.door=true;renderScene();finish()})
  }

  function genericClue(){if(state.flags.p0)return modal(`<h2>${selected.names[0]}</h2><p>Hai già raccolto l’indizio.</p>`);modal(`<h2>${selected.names[0]}</h2><div class="object-art">${selected.objects[0]}</div><p>Osservando con attenzione trovi un dettaglio nascosto.</p><div class="clue">${selected.clue}</div><button id="collectClue" class="puzzle-action" style="width:100%;margin-top:12px">RACCOGLI INDIZIO</button>`);setTimeout(()=>document.querySelector('#collectClue').onclick=()=>{state.flags.p0=true;state.step=1;addItem(selected.items[0][0],selected.items[0][1]);addNote(selected.clue);renderScene();closeModal()},0)}
  function genericFirstLock(){if(!state.flags.p0)return modal(`<h2>${selected.names[1]}</h2><p>Non hai ancora abbastanza informazioni.</p>`);if(state.flags.p1)return modal(`<h2>${selected.names[1]}</h2><p>Il vano è già aperto.</p>`);codePuzzle(selected.names[1],selected.objects[1],'Usa l’orario indicato nell’indizio, senza i due punti.',selected.codes[0],()=>{state.flags.p1=true;state.step=2;addItem(selected.items[1][0],selected.items[1][1]);renderScene()})}
  function genericSecondLock(){const tool=selected.items[1][0];if(!state.flags.p1)return modal(`<h2>${selected.names[2]}</h2><p>È bloccato.</p>`);if(state.flags.p2)return modal(`<h2>${selected.names[2]}</h2><p>Non è rimasto altro.</p>`);if(!selectedIs(tool))return modal(`<h2>${selected.names[2]}</h2><p class="tool-warning">Seleziona “${tool}” nell’inventario.</p>`);codePuzzle(selected.names[2],selected.objects[2],'Inserisci il numero principale citato nell’indizio.',selected.codes[1],()=>{state.flags.p2=true;state.step=3;game.selectedItem=null;addItem(selected.items[2][0],selected.items[2][1]);renderScene()},2)}
  function genericTool(){const tool=selected.items[2][0];if(!state.flags.p2)return modal(`<h2>${selected.names[3]}</h2><p>Non riesci ad aprirlo a mani nude.</p>`);if(state.flags.p3)return modal(`<h2>${selected.names[3]}</h2><p>Hai già recuperato ciò che conteneva.</p>`);if(!selectedIs(tool))return modal(`<h2>${selected.names[3]}</h2><p class="tool-warning">Seleziona “${tool}” e usalo qui.</p>`);state.flags.p3=true;state.step=4;game.selectedItem=null;addItem(selected.items[3][0],selected.items[3][1]);renderScene();modal(`<h2>${selected.names[3]}</h2><p class="tool-success">Recuperi ${selected.items[3][0]}.</p>`)}
  function genericDoor(){const pass=selected.items[3][0];if(!state.flags.p3)return modal(`<h2>${selected.names[4]}</h2><p>Il sistema finale non è ancora pronto.</p>`);if(!selectedIs(pass))return modal(`<h2>${selected.names[4]}</h2><p class="tool-warning">Seleziona “${pass}” e usalo sull’uscita.</p>`);codePuzzle(selected.names[4],selected.objects[4],'Combina il numero principale con le ultime due cifre dell’orario.',selected.codes[2],()=>{game.selectedItem=null;finish()})}

  function immersiveHint(){
    if(!state||state.hints<=0)return modal('<h2>Nessun indizio rimasto</h2><p>Rileggi gli appunti e prova a usare gli oggetti raccolti.</p>');
    const archiveHints=[
      'La porta porta il numero del fascicolo che devi cercare.',
      'Dopo aver trovato la fotografia, controlla sotto la scrivania.',
      'Il cacciavite può aprire qualcosa fissato con quattro viti.',
      'Il fusibile appartiene alla lampada da tavolo.',
      'Con la luce accesa osserva meglio la fotografia incorniciata.',
      'La lancetta trovata appartiene all’orologio. Gli indizi indicano le 10:10.',
      'La chiave dell’orologio apre lo schedario metallico.',
      'Seleziona la Tessera 47 e usala sulla porta. Il codice finale è l’orario già scoperto.'
    ];
    const genericHints=['Esamina il primo oggetto per trovare l’indizio.','Usa l’orario dell’indizio sul secondo oggetto.','Seleziona l’oggetto appena ottenuto prima di toccare il terzo.','Usa lo strumento sul quarto oggetto.','Seleziona l’ultimo oggetto e usa il codice combinato sull’uscita.'];
    state.hints--;state.hintsUsed++;document.querySelector('#hintCount').textContent=state.hints;const list=selected.id==='archivio47'?archiveHints:genericHints;modal(`<h2>Indizio</h2><p>${list[Math.min(state.step,list.length-1)]}</p>`)
  }

  document.querySelector('#playBtn').onclick=startImmersive;
  document.querySelector('#hintBtn').onclick=immersiveHint;
  document.querySelector('#notesBtn').onclick=()=>modal(`<h2>Appunti</h2><p>${state&&state.notes.length?state.notes.map(x=>'• '+x).join('<br><br>'):'Non hai ancora trovato indizi.'}</p>`);
})();