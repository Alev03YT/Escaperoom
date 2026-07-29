// Configurazione Firebase pubblica di EscapeVerse.
// La sicurezza è gestita da Authentication e dalle regole Firestore.
export const firebaseConfig = {
  apiKey: "AIzaSyC5u0REjnR80-Ur28ZX5tNwbeKw306tSpM",
  authDomain: "escapeverse-ba4d0.firebaseapp.com",
  projectId: "escapeverse-ba4d0",
  storageBucket: "escapeverse-ba4d0.firebasestorage.app",
  messagingSenderId: "978479405035",
  appId: "1:978479405035:web:903f8d4bbb87d60f366bae",
  measurementId: "G-E0EEDJFT58"
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);
export const ADMIN_EMAIL = "alessandro.valerio03@gmail.com";
