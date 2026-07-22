import { doc, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function watchFavorites(uid, callback) {
  const ref = doc(db, 'users', uid, 'data', 'favorites');
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data().surahs || [] : []);
  });
}

export async function toggleFavorite(uid, surahNumber, currentFavorites) {
  const ref = doc(db, 'users', uid, 'data', 'favorites');
  const isFav = currentFavorites.includes(surahNumber);
  const next = isFav
    ? currentFavorites.filter((n) => n !== surahNumber)
    : [...currentFavorites, surahNumber];
  await setDoc(ref, { surahs: next });
}

export async function saveReadingProgress(uid, surahNumber, surahName) {
  const ref = doc(db, 'users', uid, 'data', 'progress');
  await setDoc(ref, { surahNumber, surahName, updatedAt: Date.now() });
}

export async function getReadingProgress(uid) {
  const ref = doc(db, 'users', uid, 'data', 'progress');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export function watchAzkarCounts(uid, callback) {
  const ref = doc(db, 'users', uid, 'data', 'azkarCounts');
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
}

export async function incrementAzkarCount(uid, azkarId, currentCounts) {
  const ref = doc(db, 'users', uid, 'data', 'azkarCounts');
  const next = { ...currentCounts, [azkarId]: (currentCounts[azkarId] || 0) + 1 };
  await setDoc(ref, next);
}

export async function resetAzkarCount(uid, azkarId, currentCounts) {
  const ref = doc(db, 'users', uid, 'data', 'azkarCounts');
  const next = { ...currentCounts, [azkarId]: 0 };
  await setDoc(ref, next);
}
