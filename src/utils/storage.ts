import { format, parseISO } from 'date-fns';
import { ResultData, TrackerEntry } from '../types';

const STORAGE_KEY = 'sahil_master_results';
const TRACKER_KEY = 'sahil_master_tracker_v2';
const INITIAL_CAPITAL_KEY = 'sahil_master_initial_capital';

export const saveResult = (date: Date, result: ResultData) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const existing = getAllResults();
  
  if (result.isOff) {
    existing[dateStr] = { isOff: true, date: dateStr };
  } else {
    existing[dateStr] = {
      ...result,
      date: dateStr,
      isOff: false
    };
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const saveMultipleResults = (results: Record<string, ResultData>) => {
  const existing = getAllResults();
  const updated = { ...existing, ...results };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getResultByDate = (date: Date): ResultData | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const all = getAllResults();
  return all[dateStr] || null;
};

export const getAllResults = (): Record<string, ResultData> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const getAllResultsSorted = (): ResultData[] => {
  const all = getAllResults();
  return Object.values(all).sort((a, b) => {
    return parseISO(b.date!).getTime() - parseISO(a.date!).getTime();
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
  return stored ? parseFloat(stored) : 50000;
};

export const saveTrackerEntry = (entry: Omit<TrackerEntry, 'id'>) => {
  const existing = getTrackerEntries();
  const newEntry: TrackerEntry = {
    ...entry,
    id: Date.now().toString(),
  };
  
  // Update profit/loss based on status
  if (newEntry.status === 'win' && newEntry.profitAmount !== undefined) {
    newEntry.profitLoss = newEntry.profitAmount;
  } else if (newEntry.status === 'loss') {
    newEntry.profitLoss = -newEntry.amount;
  } else {
    newEntry.profitLoss = 0;
  }
  
  existing.push(newEntry);
  localStorage.setItem(TRACKER_KEY, JSON.stringify(existing));
  return newEntry;
};

export const getTrackerEntries = (): TrackerEntry[] => {
  const stored = localStorage.getItem(TRACKER_KEY);
  if (!stored) return [];
  
  const entries: TrackerEntry[] = JSON.parse(stored);
  return entries.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });
};

export const deleteTrackerEntry = (id: string) => {
  const existing = getTrackerEntries();
  const updated = existing.filter(entry => entry.id !== id);
  localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
};

export const updateTrackerEntryStatus = (id: string, status: 'win' | 'loss' | 'pending', profitAmount?: number) => {
  const existing = getTrackerEntries();
  const updated = existing.map(entry => {
    if (entry.id === id) {
      let profitLoss = 0;
      if (status === 'win' && profitAmount !== undefined) {
        profitLoss = profitAmount;
      } else if (status === 'loss') {
        profitLoss = -entry.amount;
      }
      
      return { ...entry, status, profitLoss, profitAmount };
    }
    return entry;
  });
  localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
};
