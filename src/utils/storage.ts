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
