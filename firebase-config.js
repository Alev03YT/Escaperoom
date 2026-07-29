// Configurazione Firebase di EscapeVerse.
// I dati di configurazione web Firebase non sono password, ma il progetto deve
// essere protetto con Firebase Authentication e Firestore Security Rules.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);
