import { getTrackerEntries, getInitialCapital } from './storage';

export interface DailyLedger {
  id: string;
  date: string;
  isPlay: boolean;
  passLocation: string | null;
  cost: number;
  grossReturn: number;
  netProfit: number;
  runningCash: number;
  runningBank: number;
  pocket: number;
  rates: { FD: number; GB: number; GL: number; DS: number };
}

export const calculateLedger = () => {
  const entries = getTrackerEntries().reverse();
  const initialCapital = getInitialCapital();
  
  let runningCash = initialCapital;
  let runningBank = 0;
  let compoundPool = 0;
  
  const history = entries.map(entry => {
    let pocket = 2100 + compoundPool;
    if (runningCash < pocket && runningCash > 0) {
      pocket = runningCash;
    } else if (runningCash <= 0) {
      pocket = 0;
    }
    
    const multiplier = pocket / 2100;
    const rates = {
      FD: Math.round(10 * multiplier),
      GB: Math.round(15 * multiplier),
      GL: Math.round(20 * multiplier),
      DS: Math.round(25 * multiplier)
    };
    
    let cost = 0;
    let grossReturn = 0;
    
    if (entry.isPlay && entry.passLocation && entry.passLocation !== 'PENDING') {
      if (entry.passLocation === 'FD') {
        cost = rates.FD * 30;
        grossReturn = rates.FD * 95;
      } else if (entry.passLocation === 'GB') {
        cost = (rates.FD + rates.GB) * 30;
        grossReturn = rates.GB * 95;
      } else if (entry.passLocation === 'GL') {
        cost = (rates.FD + rates.GB + rates.GL) * 30;
        grossReturn = rates.GL * 95;
      } else if (entry.passLocation === 'DS') {
        cost = (rates.FD + rates.GB + rates.GL + rates.DS) * 30;
        grossReturn = rates.DS * 95;
      } else if (entry.passLocation === 'FAIL') {
        cost = (rates.FD + rates.GB + rates.GL + rates.DS) * 30;
        grossReturn = 0;
      }
    }
    
    let netProfit = 0;
    if (entry.isPlay && entry.passLocation && entry.passLocation !== 'PENDING') {
      netProfit = grossReturn - cost;
      runningCash += netProfit;
      
      if (netProfit > 0) {
        const halfProfit = Math.floor(netProfit / 2);
        runningBank += halfProfit;
        runningCash -= halfProfit;
        compoundPool += (netProfit - halfProfit);
      } else if (netProfit < 0) {
        compoundPool += netProfit;
        if (compoundPool < 0) compoundPool = 0;
      }
    }
    
    return {
      ...entry,
      cost,
      grossReturn,
      netProfit,
      runningCash,
      runningBank,
      pocket,
      rates
    };
  }).reverse();
  
  let currentPocket = 2100 + compoundPool;
  if (runningCash < currentPocket && runningCash > 0) {
    currentPocket = runningCash;
  } else if (runningCash <= 0) {
    currentPocket = 0;
  }
  
  const currentMultiplier = currentPocket / 2100;
  const currentRates = {
    FD: Math.round(10 * currentMultiplier),
    GB: Math.round(15 * currentMultiplier),
    GL: Math.round(20 * currentMultiplier),
    DS: Math.round(25 * currentMultiplier)
  };
  
  const currentDailyLimit = (currentRates.FD + currentRates.GB + currentRates.GL + currentRates.DS) * 30;
  
  return {
    initialCapital,
    finalCash: runningCash,
    finalBank: runningBank,
    currentPocket,
    currentDailyLimit,
    currentRates,
    history
  };
};

export const getCurrentBalance = (): number => {
  const ledger = calculateLedger();
  return ledger.finalCash;
};
