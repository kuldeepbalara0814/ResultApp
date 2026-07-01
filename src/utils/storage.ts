import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GameResult, TrackerEntry } from '../types';

const STORAGE_KEY = 'sahil_master_results';
const TRACKER_KEY = 'sahil_master_tracker_v3';
const INITIAL_CAPITAL_KEY = 'sahil_master_initial_capital';

// ==========================================
// 1. RESULTS (प्रेडिक्शन/गेम रिजल्ट) - Hybrid Save
// ==========================================
export const getAllResults = (): Record<string, GameResult> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    // अगर डेटा Array की तरह सेव है (जैसे पिछली बार हुआ था), तो उसे Object में बदलें
    if (Array.isArray(parsed)) {
      const record: Record<string, GameResult> = {};
      parsed.forEach(item => {
        if (item && item.date) record[item.date.trim()] = item;
      });
      return record;
    }
    return parsed;
  } catch (error) {
    console.error("Error reading results:", error);
    return {};
  }
};

export const saveResult = async (result: GameResult) => {
  // Trim date to prevent duplicate date entries with spaces
  result.date = result.date.trim();
  const existing = getAllResults();
  existing[result.date] = result;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  try {
    await setDoc(doc(db, 'results', result.date), result);
  } catch (error) {
    console.error("Firebase Results Save Error:", error);
  }
};

export const saveMultipleResults = async (results: GameResult[]) => {
  const existing = getAllResults();
  results.forEach(r => {
    r.date = r.date.trim();
    existing[r.date] = r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  try {
    for (const r of results) {
      await setDoc(doc(db, 'results', r.date), r);
    }
  } catch (error) {
    console.error("Firebase Multiple Results Save Error:", error);
  }
};

export const getResultByDate = (date: string): GameResult | null => {
  const all = getAllResults();
  return all[date.trim()] || null;
};

export const getAllResultsSorted = (): GameResult[] => {
  try {
    const all = getAllResults();
    return Object.values(all).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    return [];
  }
};

export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ==========================================
// 2. TRACKER & CAPITAL - Hybrid Save
// ==========================================
export const setInitialCapital = async (amount: number) => {
  localStorage.setItem(INITIAL_CAPITAL_KEY, amount.toString());
  try {
    await setDoc(doc(db, 'settings', 'capital'), { amount });
  } catch (error) {
    console.error("Firebase Capital Save Error:", error);
  }
};

export const getInitialCapital = (): number => {
  const stored = localStorage.getItem(INITIAL_CAPITAL_KEY);
  return stored ? parseFloat(stored) : 15000;
};

export const saveTrackerEntry = async (entry: TrackerEntry) => {
  const existing = getTrackerEntries();
  const index = existing.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    existing[index] = entry;
  } else {
    existing.push(entry);
  }
  localStorage.setItem(TRACKER_KEY, JSON.stringify(existing));

  try {
    await setDoc(doc(db, 'tracker', entry.id), entry);
  } catch (error) {
    console.error("Firebase Tracker Save Error:", error);
  }
};

export const getTrackerEntries = (): TrackerEntry[] => {
  try {
    const stored = localStorage.getItem(TRACKER_KEY);
    if (!stored) return [];
    const entries: TrackerEntry[] = JSON.parse(stored);
    return entries.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error("Error reading tracker:", error);
    return [];
  }
};

export const deleteTrackerEntry = async (id: string) => {
  const existing = getTrackerEntries();
  const updated = existing.filter(entry => entry.id !== id);
  localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));

  try {
    await deleteDoc(doc(db, 'tracker', id));
  } catch (error) {
    console.error("Firebase Tracker Delete Error:", error);
  }
};

// ==========================================
// 3. FIREBASE SYNC (मैनुअल)
// ==========================================
export const syncDataFromFirebase = async () => {
  try {
    const resultsSnap = await getDocs(collection(db, 'results'));
    const resultsData: Record<string, GameResult> = {};
    resultsSnap.forEach(doc => {
      const data = doc.data() as GameResult;
      if (data.date) resultsData[data.date.trim()] = data;
    });
    if (Object.keys(resultsData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resultsData));
    }

    const trackerSnap = await getDocs(collection(db, 'tracker'));
    const trackerData: TrackerEntry[] = [];
    trackerSnap.forEach(doc => {
      trackerData.push(doc.data() as TrackerEntry);
    });
    if (trackerData.length > 0) {
      localStorage.setItem(TRACKER_KEY, JSON.stringify(trackerData));
    }

    const capitalSnap = await getDocs(collection(db, 'settings'));
    capitalSnap.forEach(doc => {
      if (doc.id === 'capital') {
        localStorage.setItem(INITIAL_CAPITAL_KEY, doc.data().amount.toString());
      }
    });
    return true;
  } catch (error) {
    console.error("Error syncing from Firebase:", error);
    return false;
  }
};

// ==========================================
// 3.5. REAL-TIME LIVE SYNC (ऑटोमैटिक)
// ==========================================
export const setupLiveSync = (onDataChange?: () => void) => {
  try {
    onSnapshot(collection(db, 'results'), (snapshot) => {
      const resultsData: Record<string, GameResult> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as GameResult;
        if (data.date) resultsData[data.date.trim()] = data;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resultsData));
      window.dispatchEvent(new Event('firebase-data-updated'));
      if (onDataChange) onDataChange();
    });

    onSnapshot(collection(db, 'tracker'), (snapshot) => {
      const trackerData: TrackerEntry[] = [];
      snapshot.forEach(docSnap => {
        trackerData.push(docSnap.data() as TrackerEntry);
      });
      localStorage.setItem(TRACKER_KEY, JSON.stringify(trackerData));
      window.dispatchEvent(new Event('firebase-data-updated'));
      if (onDataChange) onDataChange();
    });

    onSnapshot(doc(db, 'settings', 'capital'), (docSnap) => {
      if (docSnap.exists()) {
        localStorage.setItem(INITIAL_CAPITAL_KEY, docSnap.data().amount.toString());
        window.dispatchEvent(new Event('firebase-data-updated'));
        if (onDataChange) onDataChange();
      }
    });
  } catch (error) {
    console.error("Live Sync Setup Error:", error);
  }
};

// ==========================================
// 4. BACKUP FEATURE (JSON Download)
// ==========================================
export const downloadBackupData = () => {
  try {
    const results = getAllResults();
    const tracker = getTrackerEntries();
    const initialCapital = getInitialCapital();

    const backupData = { results, tracker, initialCapital, backupDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Sahil_Master_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    return true;
  } catch (error) {
    return false;
  }
};

// ==========================================
// 5. DELETE BY DATE RANGE (नया फीचर)
// ==========================================
export const deleteResultsByDateRange = async (startDate: string, endDate: string) => {
  const existing = getAllResults();
  const datesToDelete: string[] = [];

  Object.keys(existing).forEach(date => {
    if (date >= startDate && date <= endDate) {
      datesToDelete.push(date);
      delete existing[date];
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  try {
    for (const date of datesToDelete) {
      await deleteDoc(doc(db, 'results', date.trim()));
    }
  } catch (error) { console.error(error); }
  return datesToDelete.length;
};
