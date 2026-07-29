const $=s=>document.querySelector(s);
const state={time:900,hints:3,hintsUsed:0,inventory:[],foundNote:false,clockSolved:false,deskSolved:false,ventOpened:false,escaped:false,timer:null};

const screens=["intro","game","ending"];
function show(id){screens.forEach(x=>$("#"+x).classList.toggle("active",x===id))}
function save(){localStorage.setItem("archivio47",JSON.stringify({...state,timer:null}));$("#continueBtn").classList.remove("hidden")}
function load(){const x=JSON.parse(localStorage.getItem("archivio47")||"null");if(x)Object.assign(state,x)}
function reset(){localStorage.removeItem("archivio47");Object.assign(state,{time:900,hints:3,hintsUsed:0,inventory:[],foundNote:false,clockSolved:false,deskSolved:false,ventOpened:false,escaped:false,timer:null});renderInv();updateTimer()}
function start(){show("game");clearInterval(state.timer);state.timer=setInterval(()=>{if(state.time>0&&!state.escaped){state.time--;updateTimer();if(state.time%5===0)save()}else if(state.time<=0){clearInterval(state.timer);modal(`<h2>Tempo scaduto</h2><p>Le luci si spengono. L'Archivio 47 torna silenzioso.</p><button class="action-btn" onclick="location.reload()">Riprova</button>`) }},1000)}
function updateTimer(){const m=String(Math.floor(state.time/60)).padStart(2,"0"),s=String(state.time%60).padStart(2,"0");$("#timer").textContent=`${m}:${s}`}
function renderInv(){const box=$("#inventoryItems");box.innerHTML=state.inventory.length?state.inventory.map(i=>`<div class="inventory-item"><span>${i.icon}</span>${i.name}</div>`).join(""):`<span class="empty">Vuoto</span>`}
function addItem(id,name,icon){if(!state.inventory.some(x=>x.id===id)){state.inventory.push({id,name,icon});renderInv();save()}}
function has(id){return state.inventory.some(x=>x.id===id)}
function modal(html){$("#modalContent").innerHTML=html;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
function msg(el,text,ok=false){el.innerHTML=`<p class="${ok?"success":"error"}">${text}</p>`}

const actions={
shelf(){
 if(!state.foundNote){modal(`<h2>Scaffale 7</h2><div class="object-art">📚</div><p>Tra vecchi fascicoli trovi una fotografia strappata. Sul retro è scritto:</p><div class="clue">“Quando il tempo si fermò, erano le <strong>10:10</strong>. Il numero del fascicolo era <strong>47</strong>.”</div><button class="action-btn" id="takeNote">Prendi la fotografia</button>`);setTimeout(()=>$("#takeNote").onclick=()=>{state.foundNote=true;addItem("photo","Foto strappata","📷");closeModal()},0)}
 else modal(`<h2>Scaffale 7</h2><p>Non c'è altro di utile. La polvere copre quasi tutte le etichette.</p>`)
},
clock(){
 if(state.clockSolved)return modal(`<h2>Orologio fermo</h2><p>Il vano segreto è vuoto.</p>`);
 modal(`<h2>Orologio fermo</h2><div class="object-art">🕰️</div><p>Le lancette possono essere spostate. Inserisci l'ora corretta nel formato HHMM.</p><div class="code-input"><input id="clockCode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="clockTry">PROVA</button></div><div id="clockMsg"></div>`);
 setTimeout(()=>$("#clockTry").onclick=()=>{const out=$("#clockMsg");if($("#clockCode").value==="1010"){state.clockSolved=true;addItem("key","Chiave piccola","🗝️");msg(out,"Scatto metallico. Dietro il quadrante trovi una piccola chiave.",true)}else msg(out,"Le lancette tornano lentamente alla posizione iniziale.")},0)
},
desk(){
 if(!has("key"))return modal(`<h2>Scrivania</h2><div class="object-art">🗄️</div><p>Il cassetto è chiuso con una piccola serratura.</p>`);
 if(state.deskSolved)return modal(`<h2>Scrivania</h2><p>Nel cassetto non è rimasto altro.</p>`);
 modal(`<h2>Cassetto della scrivania</h2><div class="object-art">📻</div><p>La chiave apre il cassetto. Dentro trovi un vecchio registratore e un tastierino a due cifre.</p><div class="clue">Trascrizione: “Il fascicolo che cerchi porta lo stesso numero del luogo in cui sei entrato.”</div><div class="code-input"><input id="deskCode" inputmode="numeric" maxlength="2" placeholder="00"><button id="deskTry">PROVA</button></div><div id="deskMsg"></div>`);
 setTimeout(()=>$("#deskTry").onclick=()=>{const out=$("#deskMsg");if($("#deskCode").value==="47"){state.deskSolved=true;addItem("screwdriver","Cacciavite","🪛");msg(out,"Il fondo del cassetto si solleva. Trovi un cacciavite.",true)}else msg(out,"Il tastierino emette un segnale basso.")},0)
},
vent(){
 if(state.ventOpened)return modal(`<h2>Grata di aerazione</h2><p>Hai già recuperato il foglio nascosto nel condotto.</p>`);
 if(!has("screwdriver"))return modal(`<h2>Grata di aerazione</h2><div class="object-art">▥</div><p>È fissata con quattro viti. A mani nude non riesci ad aprirla.</p>`);
 state.ventOpened=true;addItem("card","Tessera magnetica","💳");
 modal(`<h2>Condotto aperto</h2><div class="object-art">💳</div><p>Con il cacciavite rimuovi la grata. Dentro trovi una tessera magnetica con una frase incisa:</p><div class="clue">“La porta ricorda soltanto chi ha ricostruito il passato.”</div><p class="success">Tessera aggiunta all'inventario.</p>`)
},
door(){
 if(!has("card"))return modal(`<h2>Porta blindata</h2><div class="object-art">🚪</div><p>Il lettore magnetico lampeggia in rosso. Serve una tessera.</p>`);
 modal(`<h2>Porta blindata</h2><div class="object-art">🔐</div><p>Inserisci la tessera. Il sistema richiede il codice finale a quattro cifre.</p><p>Unisci il numero del fascicolo all'ora in cui il tempo si è fermato, usando le <strong>ultime due cifre dell'ora</strong>.</p><div class="code-input"><input id="doorCode" inputmode="numeric" maxlength="4" placeholder="0000"><button id="doorTry">APRI</button></div><div id="doorMsg"></div>`);
 setTimeout(()=>$("#doorTry").onclick=()=>{const out=$("#doorMsg");if($("#doorCode").value==="4710"){escapeGame()}else msg(out,"ACCESSO NEGATO. La serratura resta bloccata.")},0)
}
};

function escapeGame(){state.escaped=true;clearInterval(state.timer);save();closeModal();$("#finalTime").textContent=$("#timer").textContent;$("#finalHints").textContent=state.hintsUsed;$("#endingText").textContent="La porta si apre su un corridoio vuoto. Sul pavimento c'è un nuovo fascicolo: CASO 48. Qualcuno sapeva che saresti arrivato fin qui.";show("ending")}

const hints=[
"Esamina lo scaffale: una fotografia potrebbe indicare l'ora giusta.",
"L'ora della fotografia serve per sbloccare l'orologio.",
"Il numero 47 compare più volte. Potrebbe aprire il cassetto.",
"Per aprire la grata ti serve ciò che è nascosto nella scrivania.",
"Il codice finale combina il fascicolo 47 con le ultime due cifre dell'ora 10:10."
];
let hintIndex=0;
$("#hintBtn").onclick=()=>{if(state.hints<=0)return modal("<h2>Nessun indizio rimasto</h2><p>Osserva gli oggetti già trovati nell'inventario.</p>");state.hints--;state.hintsUsed++;$("#hintCount").textContent=state.hints;modal(`<h2>Indizio</h2><p>${hints[Math.min(hintIndex++,hints.length-1)]}</p>`);save()};
$("#notesBtn").onclick=()=>modal(`<h2>Appunti del caso</h2><p>${state.foundNote?"• L'orologio si fermò alle 10:10.<br>• Il fascicolo è il numero 47.":"Non hai ancora trovato informazioni importanti."}</p><p>${state.deskSolved?"• Nel cassetto era nascosto un cacciavite.":""}</p>`);
let sound=true;$("#soundBtn").onclick=()=>{sound=!sound;$("#soundBtn").textContent=sound?"🔊 Audio":"🔇 Audio"};
document.querySelectorAll(".hotspot").forEach(b=>b.onclick=()=>actions[b.dataset.action]());
$("#closeModal").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#startBtn").onclick=()=>{reset();start()};
$("#continueBtn").onclick=()=>{load();renderInv();$("#hintCount").textContent=state.hints;updateTimer();start()};
$("#restartBtn").onclick=()=>{reset();show("intro")};
if(localStorage.getItem("archivio47"))$("#continueBtn").classList.remove("hidden");
updateTimer();renderInv();