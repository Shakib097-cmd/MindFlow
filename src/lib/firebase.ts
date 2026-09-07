import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  getIdToken,
  reload,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  type IdTokenResult,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  enableNetwork,
  disableNetwork,
  getDocFromServer,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  addDoc,
  limit,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Get Firestore safely with database ID support
let firestoreInstance;
try {
  firestoreInstance = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);
} catch (e) {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Set Firestore log level to silent to prevent internal network reconnect logs from bubbling up
try {
  setLogLevel('silent');
} catch {
  // Ignore in environments where setLogLevel is restricted
}

// Graceful network state management for Firestore
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    try {
      enableNetwork(db).catch(() => {});
    } catch {}
  });
  window.addEventListener('offline', () => {
    try {
      disableNetwork(db).catch(() => {});
    } catch {}
  });

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    try {
      disableNetwork(db).catch(() => {});
    } catch {}
  }
}

// Validate connection to Firestore on initial boot
async function testConnection() {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is operating in offline mode.');
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getIdTokenResult,
  getIdToken,
  reload,
  enableNetwork,
  disableNetwork,
  setLogLevel,
  getDocFromServer,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  addDoc,
  limit,
};

export type { FirebaseUser, IdTokenResult };
