import { GameResult, TrackerEntry } from '../types';
import { getCurrentRole, getCurrentUser } from './auth';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const getPrefix = () => {
  const role = getCurrentRole();
  if (role === 'admin') return 'admin_';
  const user = getCurrentUser().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `user_${user}_`;
};

const CAPITAL_KEY = 'sahil_master_capital';

export const getInitialCapital = (): number => {
  const cap = localStorage.getItem(`${getPrefix()}${CAPITAL_KEY}`);
  return cap ? parseInt(cap, 10) : 15000;
};

export const setInitialCapital = (capital: number) => {
  localStorage.setItem(`${getPrefix()}${CAPITAL_KEY}`, capital.toString());
};

const getUserId = () => {
  const role = getCurrentRole();
  return role === 'admin' ? 'admin' : getCurrentUser().toLowerCase().replace(/[^a-z0-9]/g, '');
};

// We will fetch everything async now, but since existing code uses sync, we need to adapt.
// However, rewriting the entire app to async might be too much for this step.
// Let's use localStorage as a cache and sync to Firebase in the background.

export const getResults = (): Record<string, GameResult> => {
  try {
    const data = localStorage.getItem(`${getPrefix()}results`);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const saveResult = (result: GameResult) => {
  const results = getResults();
  results[result.date] = result;
  localStorage.setItem(`${getPrefix()}results`, JSON.stringify(results));
  
  // Sync to Firebase
  setDoc(doc(db, 'results', `${getUserId()}_${result.date}`), {
    ...result,
    userId: getUserId()
  }).catch(console.error);
};

export const saveMultipleResults = (newResults: GameResult[]) => {
  const results = getResults();
  newResults.forEach(r => {
    results[r.date] = r;
    setDoc(doc(db, 'results', `${getUserId()}_${r.date}`), {
      ...r,
      userId: getUserId()
    }).catch(console.error);
  });
  localStorage.setItem(`${getPrefix()}results`, JSON.stringify(results));
};

export const getResultByDate = (date: string): GameResult | null => {
  const results = getResults();
  return results[date] || null;
};

export const getAllResultsSorted = (): GameResult[] => {
  const results = getResults();
  return Object.values(results).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTrackerEntries = (): TrackerEntry[] => {
  try {
    const data = localStorage.getItem(`${getPrefix()}tracker`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveTrackerEntry = (entry: TrackerEntry) => {
  const entries = getTrackerEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(`${getPrefix()}tracker`, JSON.stringify(entries));
  
  // Sync to Firebase
  setDoc(doc(db, 'tracker_entries', `${getUserId()}_${entry.id}`), {
    ...entry,
    userId: getUserId()
  }).catch(console.error);
};

export const deleteTrackerEntry = (id: string) => {
  const entries = getTrackerEntries();
  const newEntries = entries.filter(e => e.id !== id);
  localStorage.setItem(`${getPrefix()}tracker`, JSON.stringify(newEntries));
  
  // Sync to Firebase
  deleteDoc(doc(db, 'tracker_entries', `${getUserId()}_${id}`)).catch(console.error);
};
