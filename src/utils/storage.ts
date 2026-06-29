import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GameResult, TrackerEntry } from '../types';

const STORAGE_KEY = 'sahil_master_results';
const TRACKER_KEY = 'sahil_master_tracker_v3';
const INITIAL_CAPITAL_KEY = 'sahil_master_initial_capital';

// ==========================================
// 1. RESULTS (प्रेडिक्शन/गेम रिजल्ट) - Hybrid Save
// ==========================================
export const saveResult = async (result: GameResult) => {
  // 1. तुरंत लोकल सेव (ताकि वेबसाइट तेज़ चले)
  const existing = getAllResults();
  existing[result.date] = result;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  // 2. बैकग्राउंड में Firebase पर लाइव सेव
  try {
    await setDoc(doc(db, 'results', result.date), result);
  } catch (error) {
    console.error("Firebase Results Save Error:", error);
  }
};

export const saveMultipleResults = async (results: GameResult[]) => {
  const existing = getAllResults();
  results.forEach(r => {
    existing[r.date] = r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  // Firebase Batch Save
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
  return all[date] || null;
};

export const getAllResults = (): Record<string, GameResult> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading results:", error);
    return {};
  }
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

  // Firebase पर लाइव सेव
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

  // Firebase से लाइव डिलीट
  try {
    await deleteDoc(doc(db, 'tracker', id));
  } catch (error) {
    console.error("Firebase Tracker Delete Error:", error);
  }
};


// ==========================================
// 3. FIREBASE SYNC (मैनुअल सिंक के लिए पुराना कोड)
// ==========================================
export const syncDataFromFirebase = async () => {
  try {
    // 1. Results Sync
    const resultsSnap = await getDocs(collection(db, 'results'));
    const resultsData: Record<string, GameResult> = {};
    resultsSnap.forEach(doc => {
      resultsData[doc.id] = doc.data() as GameResult;
    });
    if (Object.keys(resultsData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resultsData));
    }

    // 2. Tracker Sync
    const trackerSnap = await getDocs(collection(db, 'tracker'));
    const trackerData: TrackerEntry[] = [];
    trackerSnap.forEach(doc => {
      trackerData.push(doc.data() as TrackerEntry);
    });
    if (trackerData.length > 0) {
      localStorage.setItem(TRACKER_KEY, JSON.stringify(trackerData));
    }

    // 3. Capital Sync
    const capitalSnap = await getDocs(collection(db, 'settings'));
    capitalSnap.forEach(doc => {
      if (doc.id === 'capital') {
        localStorage.setItem(INITIAL_CAPITAL_KEY, doc.data().amount.toString());
      }
    });

    console.log("Firebase Data Synced Successfully!");
    return true;
  } catch (error) {
    console.error("Error syncing from Firebase:", error);
    return false;
  }
};

// ==========================================
// 3.5. REAL-TIME LIVE SYNC (ऑटोमैटिक अपडेट के लिए नया कोड)
// ==========================================
export const setupLiveSync = (onDataChange?: () => void) => {
  try {
    // 1. Live Results Listener (बिना रिफ्रेश के रिजल्ट अपडेट करेगा)
    onSnapshot(collection(db, 'results'), (snapshot) => {
      const resultsData: Record<string, GameResult> = {};
      snapshot.forEach(docSnap => {
        resultsData[docSnap.id] = docSnap.data() as GameResult;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resultsData));
      
      // UI को तुरंत जगाने (re-render) के लिए एक इवेंट छोड़ना
      window.dispatchEvent(new Event('firebase-data-updated'));
      if (onDataChange) onDataChange();
    });

    // 2. Live Tracker Listener
    onSnapshot(collection(db, 'tracker'), (snapshot) => {
      const trackerData: TrackerEntry[] = [];
      snapshot.forEach(docSnap => {
        trackerData.push(docSnap.data() as TrackerEntry);
      });
      localStorage.setItem(TRACKER_KEY, JSON.stringify(trackerData));
      
      window.dispatchEvent(new Event('firebase-data-updated'));
      if (onDataChange) onDataChange();
    });

    // 3. Live Capital Listener
    onSnapshot(doc(db, 'settings', 'capital'), (docSnap) => {
      if (docSnap.exists()) {
        localStorage.setItem(INITIAL_CAPITAL_KEY, docSnap.data().amount.toString());
        window.dispatchEvent(new Event('firebase-data-updated'));
        if (onDataChange) onDataChange();
      }
    });

    console.log("🔥 Firebase Live Sync Started Successfully!");
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

    if (Object.keys(results).length === 0 && tracker.length === 0) {
      alert("बैकअप के लिए अभी कोई डेटा मौजूद नहीं है!");
      return false;
    }

    const backupData = {
      results,
      tracker,
      initialCapital,
      backupDate: new Date().toISOString()
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    link.download = `Sahil_Master_Backup_${today}.json`;
    
    link.href = url;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Backup failed:", error);
    alert("बैकअप डाउनलोड करने में कोई तकनीकी खराबी आ गई है।");
    return false;
  }
};
