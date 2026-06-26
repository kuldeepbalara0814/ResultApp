import { GameResult, TrackerEntry } from '../types';

const STORAGE_KEY = 'sahil_master_results';
const TRACKER_KEY = 'sahil_master_tracker_v3';
const INITIAL_CAPITAL_KEY = 'sahil_master_initial_capital';

export const saveResult = (result: GameResult) => {
  const existing = getAllResults();
  existing[result.date] = result;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const saveMultipleResults = (results: GameResult[]) => {
  const existing = getAllResults();
  results.forEach(r => {
    existing[r.date] = r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getResultByDate = (date: string): GameResult | null => {
  const all = getAllResults();
  return all[date] || null;
};

export const getAllResults = (): Record<string, GameResult> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const getAllResultsSorted = (): GameResult[] => {
  const all = getAllResults();
  return Object.values(all).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Tracker Functions

export const setInitialCapital = (amount: number) => {
  localStorage.setItem(INITIAL_CAPITAL_KEY, amount.toString());
};

export const getInitialCapital = (): number => {
  const stored = localStorage.getItem(INITIAL_CAPITAL_KEY);
  return stored ? parseFloat(stored) : 15000;
};

export const saveTrackerEntry = (entry: TrackerEntry) => {
  const existing = getTrackerEntries();
  const index = existing.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    existing[index] = entry;
  } else {
    existing.push(entry);
  }
  localStorage.setItem(TRACKER_KEY, JSON.stringify(existing));
};

export const getTrackerEntries = (): TrackerEntry[] => {
  const stored = localStorage.getItem(TRACKER_KEY);
  if (!stored) return [];
  const entries: TrackerEntry[] = JSON.parse(stored);
  return entries.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const deleteTrackerEntry = (id: string) => {
  const existing = getTrackerEntries();
  const updated = existing.filter(entry => entry.id !== id);
  localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
};

// ==========================================
// [NEW] BACKUP DOWNLOAD FEATURE
// ==========================================
export const downloadBackupData = () => {
  try {
    // 1. सारा सेव किया हुआ डेटा निकालें (Results, Tracker, aur Capital)
    const results = getAllResults();
    const tracker = getTrackerEntries();
    const initialCapital = getInitialCapital();

    // अगर कोई भी डेटा मौजूद नहीं है, तो एरर दिखाएं
    if (Object.keys(results).length === 0 && tracker.length === 0) {
      alert("बैकअप के लिए अभी कोई डेटा मौजूद नहीं है!");
      return false;
    }

    // 2. पूरे डेटा को एक ऑब्जेक्ट में पैक करें
    const backupData = {
      results,
      tracker,
      initialCapital,
      backupDate: new Date().toISOString()
    };

    // 3. डेटा को JSON (फाइल) फॉर्मेट में बदलें
    const jsonData = JSON.stringify(backupData, null, 2);
    
    // 4. एक डाउनलोड करने योग्य फाइल (Blob) बनाएं
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 5. फाइल का नाम आज की तारीख के साथ सेट करें
    const today = new Date().toISOString().split('T')[0];
    link.download = `Sahil_Master_Backup_${today}.json`;
    
    // 6. डाउनलोड स्टार्ट करें
    link.href = url;
    document.body.appendChild(link);
    link.click();
    
    // 7. मेमोरी साफ़ करें (Cleanup)
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Backup failed:", error);
    alert("बैकअप डाउनलोड करने में कोई तकनीकी खराबी आ गई है।");
    return false;
  }
};
