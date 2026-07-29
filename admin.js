import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const $ = (selector) => document.querySelector(selector);
const states = ['setupState', 'loginState', 'deniedState', 'dashboardState'];

function showState(id) {
  states.forEach((stateId) => {
    const element = document.getElementById(stateId);
    if (element) element.classList.toggle('hidden', stateId !== id);
  });
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.add('hidden'), 2600);
}

if (!firebaseConfigured) {
  showState('setupState');
} else {
  const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js')
  ]);

  const {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
  } = authModule;
  const { getFirestore, doc, getDoc } = firestoreModule;

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await setPersistence(auth, browserLocalPersistence);

  async function userIsAdmin(user) {
    const adminDocument = await getDoc(doc(db, 'admins', user.uid));
    return adminDocument.exists() && adminDocument.data()?.active === true;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showState('loginState');
      return;
    }

    try {
      if (!(await userIsAdmin(user))) {
        showState('deniedState');
        return;
      }

      $('#adminEmail').textContent = user.email || user.uid;
      showState('dashboardState');
    } catch (error) {
      console.error(error);
      showState('deniedState');
    }
  });

  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = $('#email').value.trim();
    const password = $('#password').value;
    const errorBox = $('#loginError');
    errorBox.textContent = '';

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      errorBox.textContent = 'Email o password non corretti, oppure accesso non consentito.';
    }
  });

  $('#logoutBtn').addEventListener('click', () => signOut(auth));
  $('#deniedLogout').addEventListener('click', () => signOut(auth));

  document.querySelectorAll('[data-coming]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('Sezione predisposta: verrà collegata al database nella prossima fase.');
    });
  });
}
