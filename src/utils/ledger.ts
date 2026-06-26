import { getTrackerEntries, getInitialCapital } from './storage';
import { TrackerEntry } from '../types';

export interface LedgerResult {
  history: any[];
  finalCash: number;
  finalBank: number;
  currentDailyLimit: number;
  initialCapital: number;
}

export function calculateLedger(): LedgerResult {
  const entries = getTrackerEntries();
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const initialCap = getInitialCapital();
  let currentCash = initialCap;
  let currentBank = 0;
  
  const history = [];

  for (const entry of sortedEntries) {
    if (!entry.isPlay) {
      history.push({
        ...entry,
        cost: 0,
        grossReturn: 0,
        netProfit: 0,
        runningCash: currentCash,
        runningBank: currentBank
      });
      continue;
    }

    if (entry.passLocation === 'PENDING') {
      history.push({
        ...entry,
        cost: 0,
        grossReturn: 0,
        netProfit: 0,
        runningCash: currentCash,
        runningBank: currentBank
      });
      continue;
    }

    const currentLimit = Math.min(Math.floor(currentCash), 100000); 
    const cost = Math.round(currentLimit * 0.10); 
    
    let grossReturn = 0;
    if (entry.passLocation !== 'FAIL' && entry.passLocation !== 'PENDING' && entry.passLocation !== null) {
      grossReturn = Math.round(cost * 9.5);
    }
    
    const netProfit = grossReturn - cost;
    
    if (netProfit > 0) {
      const bankShare = Math.floor(netProfit / 2);
      const cashShare = netProfit - bankShare;
      
      currentBank += bankShare;
      currentCash += cashShare;
    } else {
      currentCash += netProfit; 
    }

    history.push({
      ...entry,
      cost,
      grossReturn,
      netProfit,
      runningCash: Math.round(currentCash),
      runningBank: Math.round(currentBank)
    });
  }

  const finalLimit = Math.min(Math.floor(currentCash), 100000);

  return {
    history: history.reverse(),
    finalCash: Math.round(currentCash),
    finalBank: Math.round(currentBank),
    currentDailyLimit: finalLimit,
    initialCapital: initialCap
  };
}
