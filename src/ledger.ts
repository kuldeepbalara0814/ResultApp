import { getTrackerEntries, getInitialCapital } from './storage';

export const calculateLedger = () => {
  const initialCapital = getInitialCapital();
  const entries = getTrackerEntries().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentCash = initialCapital;
  let currentBank = 0;

  const history = entries.map(entry => {
    // Calculate ratio based on current cash vs 15000 baseline
    const ratio = Math.max(0.1, currentCash / 15000); 
    
    // Calculate rates rounded to nearest 5
    const rates = {
      FD: Math.max(5, Math.round((10 * ratio) / 5) * 5),
      GB: Math.max(5, Math.round((15 * ratio) / 5) * 5),
      GL: Math.max(5, Math.round((20 * ratio) / 5) * 5),
      DS: Math.max(5, Math.round((25 * ratio) / 5) * 5),
    };

    const dailyCostLimit = (rates.FD + rates.GB + rates.GL + rates.DS) * 30;
    
    let cost = 0;
    let grossReturn = 0;
    let netProfit = 0;

    if (entry.isPlay && entry.passLocation && entry.passLocation !== 'PENDING') {
      if (entry.passLocation === 'FD') {
        cost = rates.FD * 30;
        grossReturn = rates.FD * 90;
      } else if (entry.passLocation === 'GB') {
        cost = (rates.FD + rates.GB) * 30;
        grossReturn = rates.GB * 90;
      } else if (entry.passLocation === 'GL') {
        cost = (rates.FD + rates.GB + rates.GL) * 30;
        grossReturn = rates.GL * 90;
      } else if (entry.passLocation === 'DS') {
        cost = dailyCostLimit;
        grossReturn = rates.DS * 90;
      } else if (entry.passLocation === 'FAIL') {
        cost = dailyCostLimit;
        grossReturn = 0;
      }

      netProfit = grossReturn - cost;
      
      // 50-50 Split if Profit, otherwise absorb full loss
      if (netProfit > 0) {
        currentBank += netProfit / 2;
        currentCash += netProfit / 2;
      } else {
        currentCash += netProfit; 
      }
    }

    return {
      ...entry,
      rates,
      cost,
      grossReturn,
      netProfit,
      runningCash: currentCash,
      runningBank: currentBank,
      dailyCostLimit
    };
  });

  // Calculate state for the NEXT upcoming play
  const currentRatio = Math.max(0.1, currentCash / 15000);
  const currentRates = {
    FD: Math.max(5, Math.round((10 * currentRatio) / 5) * 5),
    GB: Math.max(5, Math.round((15 * currentRatio) / 5) * 5),
    GL: Math.max(5, Math.round((20 * currentRatio) / 5) * 5),
    DS: Math.max(5, Math.round((25 * currentRatio) / 5) * 5),
  };

  return {
    initialCapital,
    history: history.reverse(), // Reverse for UI display (newest first)
    finalCash: currentCash,
    finalBank: currentBank,
    currentRates,
    currentDailyLimit: (currentRates.FD + currentRates.GB + currentRates.GL + currentRates.DS) * 30
  };
};
