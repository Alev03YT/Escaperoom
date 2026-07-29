import { firebaseConfig, firebaseConfigured, ADMIN_EMAIL } from './firebase-config.js';

const $ = (selector) => document.querySelector(selector);
const states = ['setupState', 'loginState', 'deniedState', 'dashboardState'];
const showState = (id) => states.forEach((x) => document.getElementById(x)?.classList.toggle('hidden', x !== id));
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.remove('hidden'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.add('hidden'),2800); }

if (!firebaseConfigured) {
  showState('setupState');
} else {
  const [{ initializeApp }, authModule, fs] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js')
  ]);
  const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, sendPasswordResetEmail } = authModule;
  const { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, serverTimestamp, query, orderBy } = fs;
  const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
  await setPersistence(auth,browserLocalPersistence);

  async function isAdmin(user){
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;
    const snap=await getDoc(doc(db,'admins',user.uid));
    return snap.exists() && snap.data()?.active===true && snap.data()?.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase();
  }

  async function loadDashboard(){
    const [roomsSnap, usersSnap, completionsSnap, settingsSnap]=await Promise.all([
      getDocs(query(collection(db,'rooms'),orderBy('title'))).catch(()=>getDocs(collection(db,'rooms'))),
      getDocs(collection(db,'users')),
      getDocs(collection(db,'completions')),
      getDoc(doc(db,'settings','public'))
    ]);
    $('#statRooms').textContent=roomsSnap.size; $('#statUsers').textContent=usersSnap.size; $('#statCompletions').textContent=completionsSnap.size;
    $('#roomsList').innerHTML=roomsSnap.empty?'<p class="muted">Nessuna stanza nel database. Le 12 stanze attuali restano nel gioco locale finché non verranno importate.</p>':roomsSnap.docs.map(d=>{const r=d.data();return `<article class="data-row"><div><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.difficulty)} · ${escapeHtml(r.theme)} · ${Number(r.minutes)||15} min ${r.published?'· Pubblicata':'· Nascosta'}</small></div><div><button class="secondary compact" data-edit-room="${d.id}">Modifica</button><button class="secondary compact" data-delete-room="${d.id}">Elimina</button></div></article>`}).join('');
    $('#usersList').innerHTML=usersSnap.empty?'<p class="muted">Nessun giocatore registrato.</p>':usersSnap.docs.slice(0,20).map(d=>{const u=d.data();return `<article class="data-row"><div><strong>${escapeHtml(u.displayName||u.email||'Giocatore')}</strong><small>${escapeHtml(u.email||d.id)}</small></div></article>`}).join('');
    if(settingsSnap.exists()){const s=settingsSnap.data();$('#globalMessage').value=s.globalMessage||'';$('#maintenanceMode').checked=s.maintenanceMode===true;}
    document.querySelectorAll('[data-edit-room]').forEach(b=>b.onclick=()=>editRoom(b.dataset.editRoom));
    document.querySelectorAll('[data-delete-room]').forEach(b=>b.onclick=()=>removeRoom(b.dataset.deleteRoom));
  }

  async function editRoom(id){const snap=await getDoc(doc(db,'rooms',id));if(!snap.exists())return;const r=snap.data();$('#roomId').value=id;$('#roomTitle').value=r.title||'';$('#roomTheme').value=r.theme||'mistero';$('#roomDifficulty').value=r.difficulty||'facile';$('#roomMinutes').value=r.minutes||15;$('#roomDescription').value=r.description||'';$('#roomPublished').checked=r.published!==false;$('#cancelEditBtn').classList.remove('hidden');window.scrollTo({top:document.querySelector('#roomForm').offsetTop-20,behavior:'smooth'});}
  async function removeRoom(id){if(!confirm('Eliminare definitivamente questa stanza dal database?'))return;await deleteDoc(doc(db,'rooms',id));toast('Stanza eliminata');await loadDashboard();}
  function resetRoomForm(){$('#roomForm').reset();$('#roomId').value='';$('#roomMinutes').value=15;$('#roomPublished').checked=true;$('#cancelEditBtn').classList.add('hidden');}

  onAuthStateChanged(auth,async(user)=>{
    if(!user){showState('loginState');return;}
    try{if(!(await isAdmin(user))){showState('deniedState');return;}$('#adminEmail').textContent=user.email||user.uid;showState('dashboardState');await loadDashboard();}catch(e){console.error(e);showState('deniedState');}
  });

  $('#loginForm').addEventListener('submit',async(e)=>{e.preventDefault();$('#loginError').textContent='';try{await signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value);}catch(err){console.error(err);$('#loginError').textContent='Email o password non corretti, oppure account non ancora autorizzato.';}});
  $('#resetPasswordBtn').onclick=async()=>{const email=$('#email').value.trim()||ADMIN_EMAIL;try{await sendPasswordResetEmail(auth,email);toast('Email per reimpostare la password inviata');}catch(e){console.error(e);toast('Impossibile inviare l’email di recupero');}};
  $('#logoutBtn').onclick=()=>signOut(auth); $('#deniedLogout').onclick=()=>signOut(auth);

  $('#roomForm').addEventListener('submit',async(e)=>{e.preventDefault();const existing=$('#roomId').value.trim();const id=existing||crypto.randomUUID();await setDoc(doc(db,'rooms',id),{title:$('#roomTitle').value.trim(),theme:$('#roomTheme').value,difficulty:$('#roomDifficulty').value,minutes:Number($('#roomMinutes').value),description:$('#roomDescription').value.trim(),published:$('#roomPublished').checked,updatedAt:serverTimestamp(),createdAt:existing?undefined:serverTimestamp()},{merge:true});resetRoomForm();toast(existing?'Stanza aggiornata':'Stanza creata');await loadDashboard();});
  $('#cancelEditBtn').onclick=resetRoomForm;
  $('#settingsForm').addEventListener('submit',async(e)=>{e.preventDefault();await setDoc(doc(db,'settings','public'),{globalMessage:$('#globalMessage').value.trim(),maintenanceMode:$('#maintenanceMode').checked,updatedAt:serverTimestamp()},{merge:true});toast('Impostazioni salvate');});
}
