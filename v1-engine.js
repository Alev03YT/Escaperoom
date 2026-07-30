/* EscapeVerse 1.0 — 12 stanze statiche interattive con meccaniche uniche */
(() => {
  const $ = s => document.querySelector(s);
  const game = { room:null, selected:null, flags:{}, values:{}, sequence:[], memory:[], started:false };

  const designs = {
    archivio47:{theme:'archive', labels:['Scaffale 7','Orologio','Scrivania','Grata','Porta blindata']},
    motel13:{theme:'motel', labels:['Quadro storto','Telefono','Valigia','Specchio','Porta 13']},
    laboratorio:{theme:'lab', labels:['Registro','Incubatore','Microscopio','Quadro elettrico','Uscita']},
    museo:{theme:'museum', labels:['Statue','Faretti','Mappa','Vetrina','Portone']},
    bunker:{theme:'bunker', labels:['Radio','Interruttori','Archivio','Generatore','Portello']},
    sottomarino:{theme:'sub', labels:['Sonar','Valvole','Bussola','Pressione','Camera stagna']},
    tempio:{theme:'temple', labels:['Pergamena','Disco solare','Altare','Idoli','Portale']},
    astronave:{theme:'space', labels:['Terminale','Costellazioni','Nucleo','Rotta','Capsula']},
    prigione:{theme:'prison', labels:['Registro','Telecamere','Sbarre','Muro','Cancello']},
    hotel:{theme:'hotel', labels:['Registro ospiti','Campanello','Corridoio','Candela','Ascensore']},
    navefantasma:{theme:'ship', labels:['Diario','Bussola','Nodi','Argano','Cabina']},
    culto:{theme:'ritual', labels:['Libro','Clessidra','Sigilli','Altare','Cerchio']}
  };

  const puzzles = {
    motel13:[
      {type:'rotate',title:'Quadro storto',prompt:'Raddrizza il quadro fino a far combaciare la cornice.',answer:0,item:['Gettone telefonico','🪙'],note:'Dietro il quadro trovi tre gocce: corta, lunga, corta.'},
      {type:'rhythm',title:'Telefono',prompt:'Ripeti il ritmo della chiamata: corto, lungo, corto.',answer:'SLS',item:['Chiave valigia','🗝️'],note:'Una voce sussurra: “La valigia ricorda 13-2-6”.'},
      {type:'dials',title:'Valigia',prompt:'Imposta le tre rotelle secondo il messaggio.',answer:[1,3,2,6],item:['Panno','🧽'],note:'Nella valigia trovi un panno umido.'},
      {type:'reveal',title:'Specchio',prompt:'Usa il panno sullo specchio appannato.',need:'Panno',item:['Tessera 13','🎫'],note:'Sullo specchio compare: NON PREMERE 13.'},
      {type:'choice',title:'Porta 13',prompt:'Il pannello mostra 12, 13 e 14. Quale pulsante apre davvero la porta?',options:['12','13','14'],answer:'12'}
    ],
    laboratorio:[
      {type:'order',title:'Registro campioni',prompt:'Ordina le provette dal pH più acido al più basico.',options:['pH 9','pH 2','pH 7','pH 4'],answer:['pH 2','pH 4','pH 7','pH 9'],item:['Campione X','🧪'],note:'Il campione X reagisce a 37 °C.'},
      {type:'slider',title:'Incubatore',prompt:'Porta l’incubatore alla temperatura corretta.',min:20,max:50,answer:37,item:['Vetrino','🔬'],note:'Il campione stabilizzato rivela cellule disposte 2-4-1.'},
      {type:'sequence',title:'Microscopio',prompt:'Seleziona le cellule nell’ordine osservato.',options:['1','2','3','4'],answer:['2','4','1'],item:['Fusibile','🔌'],note:'Sul vetrino compare la sigla B-A-C.'},
      {type:'switches',title:'Quadro elettrico',prompt:'Attiva i canali seguendo B-A-C.',labels:['A','B','C'],answer:['B','A','C'],item:['Badge sterile','🪪'],note:'Il badge autorizza l’uscita.'},
      {type:'use',title:'Uscita sterilizzazione',prompt:'Avvicina il badge al lettore.',need:'Badge sterile'}
    ],
    museo:[
      {type:'rotate3',title:'Statue',prompt:'Orienta le statue verso il reperto centrale.',answer:[1,3,2],item:['Lente antica','🔍'],note:'Le ombre indicano: sinistra, destra, centro.'},
      {type:'lights',title:'Faretti',prompt:'Accendi i faretti nell’ordine mostrato dalle ombre.',options:['Sinistra','Centro','Destra'],answer:['Sinistra','Destra','Centro'],item:['Frammento mappa','🗺️'],note:'La luce rivela tre sale: Egizia, Romana, Etrusca.'},
      {type:'path',title:'Mappa del museo',prompt:'Traccia il percorso senza passare due volte nella stessa sala.',answer:'ERET',item:['Sigillo del custode','🔘'],note:'Il percorso forma la parola ERET.'},
      {type:'symbols',title:'Vetrina',prompt:'Componi il sigillo seguendo il percorso.',options:['E','R','T'],answer:['E','R','E','T'],item:['Pass custode','🎟️'],note:'Il pass è ancora valido.'},
      {type:'use',title:'Portone',prompt:'Inserisci il pass del custode.',need:'Pass custode'}
    ],
    bunker:[
      {type:'tuner',title:'Radio militare',prompt:'Sintonizza la frequenza della trasmissione.',min:80,max:110,step:.5,answer:98.5,item:['Trascrizione Omega','📄'],note:'Trasmissione: ROSSO, VERDE, VERDE, BLU.'},
      {type:'sequence',title:'Interruttori',prompt:'Ripeti la sequenza comunicata via radio.',options:['Rosso','Verde','Blu'],answer:['Rosso','Verde','Verde','Blu'],item:['Chiave archivio','🔑'],note:'Il quadro mostra coordinate 3-1-4.'},
      {type:'dials',title:'Archivio tattico',prompt:'Imposta le coordinate Omega.',answer:[3,1,4],item:['Leva generatore','🕹️'],note:'La leva deve essere tirata dopo aver bilanciato la potenza.'},
      {type:'balance',title:'Generatore',prompt:'Distribuisci 10 unità fra i tre circuiti: 2, 5, 3.',answer:[2,5,3],item:['Carta comando','💳'],note:'Il generatore alimenta il portello.'},
      {type:'use',title:'Portello Omega',prompt:'Inserisci la carta comando.',need:'Carta comando'}
    ],
    sottomarino:[
      {type:'sonar',title:'Sonar',prompt:'Individua l’eco che si ripete ogni tre impulsi.',answer:3,item:['Scheda sonar','💳'],note:'L’eco proviene da 240°.'},
      {type:'valves',title:'Valvole di zavorra',prompt:'Bilancia le valvole fino a 4-2-6.',answer:[4,2,6],item:['Manovella','⚙️'],note:'La pressione torna stabile a 8 bar.'},
      {type:'compass',title:'Bussola',prompt:'Orienta la nave verso l’eco.',answer:240,item:['Chiave nautica','🗝️'],note:'La rotta libera il circuito di emergenza.'},
      {type:'slider',title:'Pressione',prompt:'Regola la camera stagna alla pressione corretta.',min:0,max:12,answer:8,item:['Maschera','🤿'],note:'La camera può essere aperta.'},
      {type:'use',title:'Camera stagna',prompt:'Indossa la maschera e aziona l’apertura.',need:'Maschera'}
    ],
    tempio:[
      {type:'symbols',title:'Pergamena',prompt:'Ricostruisci la frase solare.',options:['☀','◐','◆'],answer:['☀','◆','◐'],item:['Occhio di pietra','🔶'],note:'Il sole illumina prima l’occhio, poi la luna.'},
      {type:'rotate3',title:'Disco solare',prompt:'Allinea i tre anelli del disco.',answer:[2,1,3],item:['Scalpello','⛏️'],note:'Il disco proietta tre pesi: 2, 4, 1.'},
      {type:'balance',title:'Altare',prompt:'Distribuisci i pesi sulle tre coppe.',answer:[2,4,1],item:['Frammento idolo','🗿'],note:'Il frammento completa l’idolo centrale.'},
      {type:'order',title:'Idoli',prompt:'Disponi gli idoli dal più piccolo al più grande.',options:['Giaguaro','Serpente','Falco'],answer:['Serpente','Falco','Giaguaro'],item:['Medaglione nero','🏅'],note:'Il medaglione assorbe la luce.'},
      {type:'use',title:'Portale',prompt:'Inserisci il medaglione nel sole nero.',need:'Medaglione nero'}
    ],
    astronave:[
      {type:'memory',title:'Terminale Eos',prompt:'Memorizza e ripeti la sequenza luminosa.',options:['α','β','γ','δ'],answer:['β','δ','α','γ'],item:['Log stellare','💾'],note:'Il log indica le stelle Vega, Altair, Deneb.'},
      {type:'order',title:'Mappa stellare',prompt:'Ordina le stelle dalla più vicina alla più lontana.',options:['Deneb','Vega','Altair'],answer:['Vega','Altair','Deneb'],item:['Cella energetica','🔋'],note:'La rotta richiede 3 unità a motori e 2 agli scudi.'},
      {type:'balance',title:'Nucleo',prompt:'Distribuisci 5 unità: motori, scudi, supporto vitale.',answer:[3,2,0],item:['ID comandante','🪪'],note:'Il nucleo riavvia la navigazione.'},
      {type:'path',title:'Rotta',prompt:'Inserisci la rotta abbreviata Vega-Altair-Deneb-Terra.',answer:'VADT',item:['Chiave quantica','🔷'],note:'La capsula è pronta.'},
      {type:'use',title:'Capsula',prompt:'Inserisci la chiave quantica.',need:'Chiave quantica'}
    ],
    prigione:[
      {type:'order',title:'Registro detenuti',prompt:'Ordina i turni dal più vecchio al più recente.',options:['23:10','18:40','21:05'],answer:['18:40','21:05','23:10'],item:['Ritaglio 88','📰'],note:'Il detenuto 88 lasciava segnali: alto, basso, alto.'},
      {type:'switches',title:'Telecamere',prompt:'Disattiva le telecamere seguendo il segnale.',labels:['Alto','Basso'],answer:['Alto','Basso','Alto'],item:['Lima','🪚'],note:'La telecamera 3 inquadra una sbarra allentata.'},
      {type:'sequence',title:'Sbarre',prompt:'Colpisci le sbarre nell’ordine 3-1-2.',options:['1','2','3'],answer:['3','1','2'],item:['Martello','🔨'],note:'Dietro la sbarra c’è un muro cavo.'},
      {type:'use',title:'Muro debole',prompt:'Usa il martello sul punto cavo.',need:'Martello',item:['Badge guardia','🪪'],note:'Trovi il badge di una guardia.'},
      {type:'use',title:'Cancello',prompt:'Passa il badge nel lettore.',need:'Badge guardia'}
    ],
    hotel:[
      {type:'choice',title:'Registro ospiti',prompt:'Quale ospite non proietta un’ombra?',options:['Camera 7','Camera 44','Camera 99'],answer:'Camera 99',item:['Chiave 99','🗝️'],note:'Accanto al nome: due colpi, pausa, tre colpi.'},
      {type:'rhythm',title:'Campanello',prompt:'Riproduci il ritmo scritto nel registro.',answer:'SSLLL',item:['Candela nera','🕯️'],note:'La candela rivela porte che non esistono.'},
      {type:'path',title:'Corridoio',prompt:'Segui le porte visibili alla candela: 9-9-4-4.',answer:'9944',item:['Gettone ascensore','🪙'],note:'Il corridoio termina davanti a un ascensore.'},
      {type:'reveal',title:'Parete dell’ascensore',prompt:'Usa la candela per rivelare il pulsante nascosto.',need:'Candela nera',item:['Pulsante −1','🔘'],note:'Compare il piano −1.'},
      {type:'use',title:'Ascensore',prompt:'Inserisci il gettone e premi il pulsante nascosto.',need:'Gettone ascensore'}
    ],
    navefantasma:[
      {type:'reveal',title:'Diario bagnato',prompt:'Asciuga le pagine muovendo il dito sulla pergamena.',item:['Mappa nautica','🗺️'],note:'La rotta indica ovest, nord, sud, ovest.'},
      {type:'compass',title:'Bussola maledetta',prompt:'Imposta la prima direzione della rotta.',answer:270,item:['Corda','🪢'],note:'Sul bordo: nodo piano, gassa, nodo piano.'},
      {type:'sequence',title:'Nodi',prompt:'Esegui i nodi nell’ordine del bordo.',options:['Piano','Gassa'],answer:['Piano','Gassa','Piano'],item:['Gancio','🪝'],note:'La corda può raggiungere l’argano.'},
      {type:'balance',title:'Argano',prompt:'Bilancia le tre vele a 4-1-3.',answer:[4,1,3],item:['Medaglione pirata','☠️'],note:'Il medaglione apre la cabina.'},
      {type:'use',title:'Cabina del capitano',prompt:'Inserisci il medaglione nel timone.',need:'Medaglione pirata'}
    ],
    culto:[
      {type:'symbols',title:'Libro rituale',prompt:'Ripeti i simboli che chiudono il cerchio.',options:['△','○','⅃'],answer:['○','△','⅃','○'],item:['Clessidra rossa','⏳'],note:'Il rito si interrompe capovolgendo il tempo.'},
      {type:'timing',title:'Clessidra',prompt:'Premi FERMA quando il conteggio raggiunge 3.',answer:3,item:['Sigillo primo','🔻'],note:'Il primo sigillo va a nord.'},
      {type:'rotate3',title:'Sigilli',prompt:'Ruota i sigilli verso nord, est e ovest.',answer:[0,1,3],item:['Pugnale spento','🗡️'],note:'Il pugnale non richiede sangue, ma luce.'},
      {type:'lights',title:'Altare',prompt:'Accendi le candele bianca, rossa, bianca.',options:['Bianca','Rossa'],answer:['Bianca','Rossa','Bianca'],item:['Sigillo finale','⭕'],note:'Il cerchio è pronto a essere spezzato.'},
      {type:'use',title:'Cerchio',prompt:'Posiziona il sigillo finale al centro.',need:'Sigillo finale'}
    ]
  };

  function inventory(){const box=$('#inventoryItems');box.innerHTML=state.inventory.length?state.inventory.map(i=>`<button class="inventory-item interactive ${game.selected===i.name?'selected':''}" data-v1-item="${i.name}"><span>${i.icon}</span>${i.name}</button>`).join(''):'<span class="empty">Vuoto</span>';box.querySelectorAll('[data-v1-item]').forEach(b=>b.onclick=()=>{game.selected=game.selected===b.dataset.v1Item?null:b.dataset.v1Item;inventory();toast(game.selected?`${game.selected} selezionato`:'Oggetto deselezionato')})}
  function addItem(item){if(!item)return;if(!state.inventory.some(x=>x.name===item[0]))state.inventory.push({name:item[0],icon:item[1]});inventory()}
  function note(text){if(text&&!state.notes.includes(text))state.notes.push(text)}
  function toast(text){const el=$('.v1-status');if(!el)return;el.textContent=text;clearTimeout(toast.t);toast.t=setTimeout(()=>el.textContent='Tocca un elemento della stanza',2200)}
  function scene(){const d=designs[selected.id]||designs.archivio47;$('#sceneBackdrop').style.background='transparent';$('#sceneObjects').innerHTML=`<div class="v1-scene theme-${d.theme}" style="--accent:${selected.colors[2]};--dark:${selected.colors[1]}"><div class="v1-ambient"></div><div class="v1-wall"></div><div class="v1-floor"></div><div class="v1-light"></div>${d.labels.map((x,i)=>`<button class="v1-object object-${i+1} ${game.flags[i]?'solved':''}" data-v1-puzzle="${i}"><span class="v1-object-art">${selected.objects[i]||'◆'}</span><span class="v1-object-label">${x}</span></button>`).join('')}<div class="v1-status">Tocca un elemento della stanza</div><div class="v1-vignette"></div></div>`;document.querySelectorAll('[data-v1-puzzle]').forEach(b=>b.onclick=()=>openPuzzle(+b.dataset.v1Puzzle))}
  function begin(){if(selected.id==='archivio47')return;clearInterval(timerId);state={time:selected.minutes*60,hints:selected.difficulty==='nightmare'?2:3,hintsUsed:0,step:0,inventory:[],notes:[],escaped:false};game.room=selected.id;game.selected=null;game.flags={};game.values={};game.started=true;$('#gameCase').textContent=selected.case;$('#gameTitle').textContent=selected.title;$('#hintCount').textContent=state.hints;scene();inventory();updateTimer();show('game');timerId=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer()}else if(!state.escaped){clearInterval(timerId);modal('<h2>Tempo scaduto</h2><p>La stanza si richiude. Puoi riprovare dal briefing.</p>')}},1000)}
  function complete(i,p){game.flags[i]=true;state.step=Math.max(state.step,i+1);addItem(p.item);note(p.note);scene();modal(`<h2>${p.title}</h2><p class="success">Enigma risolto.</p>${p.note?`<div class="clue">${p.note}</div>`:''}`)}
  function guard(i,p){if(game.flags[i]){modal(`<h2>${p.title}</h2><p>Hai già risolto questo elemento.</p>`);return false}if(i>0&&!game.flags[i-1]){modal(`<h2>${p.title}</h2><p>Ti manca ancora qualcosa. Esamina prima gli elementi precedenti.</p>`);return false}return true}
  function openPuzzle(i){const ps=puzzles[selected.id];if(!ps)return;if(!guard(i,ps[i]))return;renderPuzzle(i,ps[i])}
  function buttons(options,attr='data-pick'){return options.map(o=>`<button class="v1-pick" ${attr}="${o}">${o}</button>`).join('')}
  function renderPuzzle(i,p){
    if(p.type==='choice'){modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-options">${buttons(p.options)}</div><p id="v1msg"></p>`);bindPick(v=>v===p.answer?complete(i,p):msg('Scelta errata.'))}
    else if(['sequence','symbols','switches','lights'].includes(p.type)){game.sequence=[];const opts=p.options||p.labels;modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-options">${buttons(opts)}</div><div class="v1-sequence" id="v1seq">—</div><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);bindPick(v=>{game.sequence.push(v);$('#v1seq').textContent=game.sequence.join(' → ')});$('#v1confirm').onclick=()=>JSON.stringify(game.sequence)===JSON.stringify(p.answer)?complete(i,p):(game.sequence=[], $('#v1seq').textContent='—',msg('Sequenza errata. Riprova.'))}
    else if(p.type==='order'){let arr=[...p.options];modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div id="v1order" class="v1-order"></div><button id="v1confirm" class="puzzle-action">CONFERMA ORDINE</button><p id="v1msg"></p>`);const draw=()=>{$('#v1order').innerHTML=arr.map((x,n)=>`<button data-move="${n}">${x}</button>`).join('');document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const n=+b.dataset.move;arr.push(arr.splice(n,1)[0]);draw()})};draw();$('#v1confirm').onclick=()=>JSON.stringify(arr)===JSON.stringify(p.answer)?complete(i,p):msg('Ordine non corretto.')}
    else if(p.type==='slider'||p.type==='tuner'){modal(`<h2>${p.title}</h2><p>${p.prompt}</p><input id="v1range" class="v1-range" type="range" min="${p.min}" max="${p.max}" step="${p.step||1}" value="${p.min}"><strong id="v1read">${p.min}</strong><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);$('#v1range').oninput=e=>$('#v1read').textContent=e.target.value;$('#v1confirm').onclick=()=>Math.abs(+$ ('#v1range').value-p.answer)<.01?complete(i,p):msg('Valore non corretto.')}
    else if(p.type==='dials'||p.type==='valves'||p.type==='balance'){const vals=p.answer.map(()=>0);modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-dials">${vals.map((_,n)=>`<button data-dial="${n}"><span>0</span><small>TOCCA</small></button>`).join('')}</div><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);document.querySelectorAll('[data-dial]').forEach(b=>b.onclick=()=>{const n=+b.dataset.dial;vals[n]=(vals[n]+1)%10;b.querySelector('span').textContent=vals[n]});$('#v1confirm').onclick=()=>JSON.stringify(vals)===JSON.stringify(p.answer)?complete(i,p):msg('Configurazione errata.')}
    else if(p.type==='rotate'||p.type==='rotate3'){const count=p.type==='rotate'?1:3, vals=Array(count).fill(0),ans=Array.isArray(p.answer)?p.answer:[p.answer];modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-rotors">${vals.map((_,n)=>`<button data-rotor="${n}" style="--r:0deg">◆</button>`).join('')}</div><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);document.querySelectorAll('[data-rotor]').forEach(b=>b.onclick=()=>{const n=+b.dataset.rotor;vals[n]=(vals[n]+1)%4;b.style.setProperty('--r',vals[n]*90+'deg')});$('#v1confirm').onclick=()=>JSON.stringify(vals)===JSON.stringify(ans)?complete(i,p):msg('Allineamento errato.')}
    else if(p.type==='compass'){let v=0;modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-compass"><div id="needle">↑</div></div><input id="v1range" class="v1-range" type="range" min="0" max="350" step="10" value="0"><strong id="v1read">0°</strong><button id="v1confirm" class="puzzle-action">CONFERMA ROTTA</button><p id="v1msg"></p>`);$('#v1range').oninput=e=>{v=+e.target.value;$('#needle').style.transform=`rotate(${v}deg)`;$('#v1read').textContent=v+'°'};$('#v1confirm').onclick=()=>v===p.answer?complete(i,p):msg('Direzione errata.')}
    else if(p.type==='rhythm'){let seq='';modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-options"><button id="short">COLPO CORTO</button><button id="long">COLPO LUNGO</button></div><div id="v1seq" class="v1-sequence">—</div><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);$('#short').onclick=()=>{$('#v1seq').textContent=(seq+='S')};$('#long').onclick=()=>{$('#v1seq').textContent=(seq+='L')};$('#v1confirm').onclick=()=>seq===p.answer?complete(i,p):(seq='', $('#v1seq').textContent='—',msg('Ritmo errato.'))}
    else if(p.type==='path'){modal(`<h2>${p.title}</h2><p>${p.prompt}</p><input id="v1text" class="v1-text" maxlength="8" autocomplete="off"><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);$('#v1confirm').onclick=()=>$('#v1text').value.trim().toUpperCase()===p.answer?complete(i,p):msg('Percorso errato.')}
    else if(p.type==='use'||p.type==='reveal'){if(p.need&&game.selected!==p.need)return modal(`<h2>${p.title}</h2><p>${p.prompt}</p><p class="tool-warning">Seleziona “${p.need}” nell’inventario e tocca nuovamente questo punto.</p>`);game.selected=null;complete(i,p)}
    else if(p.type==='sonar'){modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-options">${[1,2,3,4].map(n=>`<button data-echo="${n}">ECO ${n}</button>`).join('')}</div><p id="v1msg"></p>`);document.querySelectorAll('[data-echo]').forEach(b=>b.onclick=()=>+b.dataset.echo===p.answer?complete(i,p):msg('Non è l’eco periodico.'))}
    else if(p.type==='memory'){let seq=[];modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div class="v1-memory">${p.answer.join(' · ')}</div><button id="v1start" class="puzzle-action">HO MEMORIZZATO</button>`);$('#v1start').onclick=()=>{modal(`<h2>${p.title}</h2><p>Ripeti ora la sequenza.</p><div class="v1-options">${buttons(p.options)}</div><div id="v1seq" class="v1-sequence">—</div><button id="v1confirm" class="puzzle-action">CONFERMA</button><p id="v1msg"></p>`);bindPick(v=>{seq.push(v);$('#v1seq').textContent=seq.join(' → ')});$('#v1confirm').onclick=()=>JSON.stringify(seq)===JSON.stringify(p.answer)?complete(i,p):msg('Memoria errata.')}}
    else if(p.type==='timing'){let n=6,t;modal(`<h2>${p.title}</h2><p>${p.prompt}</p><div id="count" class="v1-count">6</div><button id="stop" class="puzzle-action">FERMA</button><p id="v1msg"></p>`);t=setInterval(()=>{n=n>0?n-1:6;$('#count').textContent=n},700);$('#stop').onclick=()=>{clearInterval(t);n===p.answer?complete(i,p):msg('Momento sbagliato.')}}
  }
  function bindPick(fn){document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>fn(b.dataset.pick))}
  function msg(t){const e=$('#v1msg');if(e)e.innerHTML=`<span class="error">${t}</span>`}
  function v1Hint(){if(selected.id==='archivio47')return;if(state.hints<=0)return modal('<h2>Nessun indizio rimasto</h2><p>Controlla gli appunti e gli oggetti già raccolti.</p>');const p=puzzles[selected.id][Math.min(state.step,puzzles[selected.id].length-1)];state.hints--;state.hintsUsed++;$('#hintCount').textContent=state.hints;modal(`<h2>Indizio</h2><p>Concentrati su <strong>${p.title}</strong>.</p><p>${p.prompt}</p>`)}

  const oldPlay=$('#playBtn').onclick, oldHint=$('#hintBtn').onclick, oldNotes=$('#notesBtn').onclick;
  $('#playBtn').onclick=()=>selected.id==='archivio47'?oldPlay():begin();
  $('#hintBtn').onclick=()=>selected.id==='archivio47'?oldHint():v1Hint();
  $('#notesBtn').onclick=()=>selected.id==='archivio47'?oldNotes():modal(`<h2>Appunti</h2><p>${state.notes.length?state.notes.map(x=>'• '+x).join('<br><br>'):'Non hai ancora trovato indizi.'}</p>`);
})();