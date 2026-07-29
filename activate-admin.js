import { firebaseConfig } from './firebase-config.js';

const EXPECTED_EMAIL = 'alessandro.valerio03@gmail.com';
const EXPECTED_UID = 'SkaKMDb25qSDOkR9uVFWpYr666C3';
const form = document.getElementById('activateForm');
const message = document.getElementById('message');

const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
  import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js'),
  import('https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js')
]);

const { getAuth, signInWithEmailAndPassword, signOut } = authModule;
const { getFirestore, doc, setDoc, serverTimestamp } = firestoreModule;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = 'Verifica account in corso…';
  message.className = 'muted';

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      EXPECTED_EMAIL,
      document.getElementById('password').value
    );

    const user = credential.user;
    const emailMatches = (user.email || '').toLowerCase() === EXPECTED_EMAIL;
    const uidMatches = user.uid === EXPECTED_UID;

    if (!emailMatches || !uidMatches) {
      await signOut(auth);
      throw new Error('L’account autenticato non corrisponde all’amministratore autorizzato.');
    }

    await setDoc(doc(db, 'admins', user.uid), {
      active: true,
      email: EXPECTED_EMAIL,
      name: 'Alessandro',
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    message.textContent = 'Account amministratore attivato. Reindirizzamento al pannello…';
    message.className = 'success';
    window.setTimeout(() => { window.location.href = 'admin.html'; }, 1200);
  } catch (error) {
    console.error(error);
    message.textContent = error?.message || 'Impossibile completare l’attivazione.';
    message.className = 'error';
  }
});
