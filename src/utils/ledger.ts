import { getTrackerEntries, getInitialCapital } from './storage';

export const calculateLedger = () => {
  const entries = getTrackerEntries().reverse(); // Chronological
  const initialCapital = getInitialCapital();
  
  const currentRates = { FD: 95, GB: 95, GL: 95, DS: 95 }; // Default base rates
  const currentDailyLimit = 15000;
  
  let runningCash = initialCapital;
  let runningBank = 0;
  
  const history = entries.map(entry => {
    let cost = entry.isPlay ? 1500 : 0; // Simple placeholder logic
    let grossReturn = 0;
    
    if (entry.isPlay && entry.passLocation && entry.passLocation !== 'PENDING' && entry.passLocation !== 'FAIL') {
      grossReturn = 14250; // simple placeholder
    }
    
    let netProfit = entry.isPlay && entry.passLocation !== 'PENDING' ? grossReturn - cost : 0;
    
    if (entry.isPlay && entry.passLocation !== 'PENDING') {
      runningCash += netProfit;
      
      // Auto-banking 50% of profits above limit
      if (runningCash > currentDailyLimit) {
        const excess = runningCash - currentDailyLimit;
        const bankAmount = Math.floor(excess * 0.5);
        runningBank += bankAmount;
        runningCash -= bankAmount;
      }
    }
    
    return {
      ...entry,
      cost,
      grossReturn,
      netProfit,
      runningCash,
      runningBank
    };
  }).reverse();
  
  return {
    initialCapital,
    finalCash: runningCash,
    finalBank: runningBank,
    currentDailyLimit,
    currentRates,
    history
  };
};

export const getCurrentBalance = (): number => {
  const ledger = calculateLedger();
  return ledger.finalCash;
};
