import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAjOW3p1vYxAH1s4lJ90caLR7A1qSjVgcY',
  authDomain: 'medina-app-7682d.firebaseapp.com',
  projectId: 'medina-app-7682d',
  storageBucket: 'medina-app-7682d.firebasestorage.app',
  messagingSenderId: '794314377489',
  appId: '1:794314377489:web:03ad94f9513eb0b4f8e4b0',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
