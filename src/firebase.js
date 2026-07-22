import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyASoEhc2v4HWdT0rTaySkUxz64bJqXzy5s',
  authDomain: 'prayer-quran-app.firebaseapp.com',
  projectId: 'prayer-quran-app',
  storageBucket: 'prayer-quran-app.firebasestorage.app',
  messagingSenderId: '893686880813',
  appId: '1:893686880813:web:0a427f71ba8600ece3f6a4',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
