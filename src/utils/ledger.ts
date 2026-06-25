import { getTrackerEntries, getInitialCapital } from './storage';
import { format, isSameDay, startOfDay } from 'date-fns';

export interface DailyLedger {
  date: string;
  openingBalance: number;
  totalInvestment: number;
  totalProfit: number;
  totalLoss: number;
  closingBalance: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pending: number;
  roi: number;
}

export const calculateDailyLedger = (targetDate?: Date): DailyLedger[] => {
  const entries = getTrackerEntries().reverse(); // Chronological order
  const initialCapital = getInitialCapital();
  
  const dailyStats: Record<string, DailyLedger> = {};
  let currentBalance = initialCapital;

  entries.forEach(entry => {
    // Determine the date for this entry.
    // Use entry.date if available, otherwise fallback to timestamp, otherwise today.
    let entryDateObj = new Date();
    if (entry.date) {
        entryDateObj = new Date(entry.date);
    } else if (entry.timestamp) {
        entryDateObj = new Date(entry.timestamp);
    }
    
    const dateStr = format(entryDateObj, 'yyyy-MM-dd');

    if (!dailyStats[dateStr]) {
      dailyStats[dateStr] = {
        date: dateStr,
        openingBalance: currentBalance,
        totalInvestment: 0,
        totalProfit: 0,
        totalLoss: 0,
        closingBalance: currentBalance,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        pending: 0,
        roi: 0
      };
    }

    const stat = dailyStats[dateStr];
    stat.gamesPlayed++;
    stat.totalInvestment += entry.amount;

    if (entry.status === 'win') {
      stat.wins++;
      stat.totalProfit += (entry.profitLoss || 0);
      currentBalance += (entry.profitLoss || 0);
    } else if (entry.status === 'loss') {
      stat.losses++;
      stat.totalLoss += Math.abs(entry.profitLoss || 0);
      currentBalance -= Math.abs(entry.profitLoss || 0);
    } else {
      stat.pending++;
    }

    stat.closingBalance = currentBalance;
    stat.roi = stat.totalInvestment > 0 
      ? ((stat.totalProfit - stat.totalLoss) / stat.totalInvestment) * 100 
      : 0;
  });

  const sortedLedger = Object.values(dailyStats).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (targetDate) {
    const targetStr = format(targetDate, 'yyyy-MM-dd');
    return sortedLedger.filter(l => l.date === targetStr);
  }

  return sortedLedger;
};

export const getCurrentBalance = (): number => {
  const ledger = calculateDailyLedger();
  if (ledger.length === 0) return getInitialCapital();
  return ledger[0].closingBalance; // First item is the most recent
};

export const getOverallStats = () => {
  const entries = getTrackerEntries();
  const initialCapital = getInitialCapital();
  const currentBalance = getCurrentBalance();
  
  const totalProfit = entries.filter(e => e.status === 'win').reduce((sum, e) => sum + (e.profitLoss || 0), 0);
  const totalLoss = entries.filter(e => e.status === 'loss').reduce((sum, e) => sum + Math.abs(e.profitLoss || 0), 0);
  const totalInvestment = entries.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    initialCapital,
    currentBalance,
    netProfit: totalProfit - totalLoss,
    totalInvestment,
    roi: totalInvestment > 0 ? ((totalProfit - totalLoss) / totalInvestment) * 100 : 0,
    winRate: entries.length > 0 ? (entries.filter(e => e.status === 'win').length / entries.length) * 100 : 0
  };
};
