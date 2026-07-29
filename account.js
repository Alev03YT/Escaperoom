import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
await setPersistence(auth, browserLocalPersistence);

const $ = (selector) => document.querySelector(selector);
const modal = $('#accountModal');
const guest = $('#accountGuest');
const userView = $('#accountUser');
const errorBox = $('#accountError');
let mode = 'login';

function openAccount(){ modal.classList.remove('hidden'); document.body.style.overflow='hidden'; }
function closeAccount(){ modal.classList.add('hidden'); document.body.style.overflow=''; }
function setError(message=''){ errorBox.textContent=message; }
function localStats(){
  try{
    const raw = JSON.parse(localStorage.getItem('escapeVerseProgress') || localStorage.getItem('escapeverseProgress') || '{}');
    const entries = Object.values(raw.rooms || raw || {}).filter(v => v && typeof v === 'object');
    const completed = entries.filter(v => v.completed).length;
    const stars = entries.reduce((sum,v)=>sum+(Number(v.stars)||0),0);
    const records = entries.filter(v=>v.bestTime || v.record).length;
    return {completed,stars,records};
  }catch{return {completed:0,stars:0,records:0};}
}
async function ensureProfile(user){
  const ref=doc(db,'users',user.uid); const snap=await getDoc(ref); const stats=localStats();
  if(!snap.exists()) await setDoc(ref,{email:user.email,name:user.displayName||'Giocatore',createdAt:serverTimestamp(),lastLoginAt:serverTimestamp(),stats},{merge:true});
  else await setDoc(ref,{lastLoginAt:serverTimestamp(),stats},{merge:true});
  return (await getDoc(ref)).data();
}
async function isAdmin(user){
  const snap=await getDoc(doc(db,'admins',user.uid));
  return snap.exists() && snap.data()?.active===true;
}
function switchMode(next){
  mode=next; document.querySelectorAll('[data-account-tab]').forEach(b=>b.classList.toggle('active',b.dataset.accountTab===next));
  $('#nameField').classList.toggle('hidden',next!=='register');
  $('#accountName').required=next==='register';
  $('#accountPassword').autocomplete=next==='register'?'new-password':'current-password';
  $('#accountSubmit').textContent=next==='register'?'CREA ACCOUNT':'ACCEDI';
  $('#forgotPassword').classList.toggle('hidden',next==='register'); setError();
}

$('#accountBtn').addEventListener('click',openAccount);
$('#closeAccount').addEventListener('click',closeAccount);
modal.addEventListener('click',e=>{if(e.target===modal) closeAccount();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden')) closeAccount();});
document.querySelectorAll('[data-account-tab]').forEach(b=>b.addEventListener('click',()=>switchMode(b.dataset.accountTab)));

$('#accountForm').addEventListener('submit',async e=>{
  e.preventDefault(); setError(); const button=$('#accountSubmit'); button.disabled=true;
  const email=$('#accountEmail').value.trim(); const password=$('#accountPassword').value;
  try{
    if(mode==='register'){
      const credential=await createUserWithEmailAndPassword(auth,email,password);
      const name=$('#accountName').value.trim()||'Giocatore';
      await updateProfile(credential.user,{displayName:name});
      await setDoc(doc(db,'users',credential.user.uid),{email,name,createdAt:serverTimestamp(),lastLoginAt:serverTimestamp(),stats:localStats()},{merge:true});
    }else await signInWithEmailAndPassword(auth,email,password);
  }catch(error){
    const messages={'auth/email-already-in-use':'Esiste già un account con questa email.','auth/invalid-credential':'Email o password non corretti.','auth/weak-password':'Usa una password di almeno 8 caratteri.','auth/invalid-email':'Inserisci un indirizzo email valido.','auth/too-many-requests':'Troppi tentativi. Riprova più tardi.'};
    setError(messages[error.code]||'Accesso non riuscito. Controlla i dati e riprova.');
  }finally{button.disabled=false;}
});

$('#forgotPassword').addEventListener('click',async()=>{
  const email=$('#accountEmail').value.trim(); if(!email){setError('Inserisci prima la tua email.');return;}
  try{await sendPasswordResetEmail(auth,email);setError('Email di recupero inviata. Controlla anche lo spam.');}catch{setError('Non è stato possibile inviare il recupero password.');}
});
$('#logoutAccount').addEventListener('click',()=>signOut(auth));

onAuthStateChanged(auth,async user=>{
  if(!user){
    guest.classList.remove('hidden'); userView.classList.add('hidden'); $('#accountLabel').textContent='Accedi'; $('#accountAvatar').textContent='👤'; $('#adminAccess').classList.add('hidden'); return;
  }
  guest.classList.add('hidden'); userView.classList.remove('hidden');
  $('#accountLabel').textContent=user.displayName?.split(' ')[0]||'Profilo'; $('#accountAvatar').textContent='●';
  $('#profileName').textContent=user.displayName||'Giocatore'; $('#profileEmail').textContent=user.email||'';
  try{
    const profile=await ensureProfile(user); const stats=profile?.stats||localStats();
    $('#cloudCompleted').textContent=stats.completed||0; $('#cloudStars').textContent=stats.stars||0; $('#cloudRecords').textContent=stats.records||0;
    $('#adminAccess').classList.toggle('hidden',!(await isAdmin(user)));
  }catch(error){console.error('Profilo non sincronizzato:',error); const stats=localStats(); $('#cloudCompleted').textContent=stats.completed; $('#cloudStars').textContent=stats.stars; $('#cloudRecords').textContent=stats.records;}
});