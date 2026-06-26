import { getTrackerEntries } from './storage';

export function calculateLedger() {
  const entries = getTrackerEntries();
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const TOTAL_CAPITAL = 15000;
  const EMERGENCY_FUND = 12900;
  const DAILY_PLAY_COST = 2100;
  
  // रेट्स जो PredictTab.tsx को चाहिए
  const currentRates = { FD: 10, GB: 15, GL: 20, DS: 25 };

  let currentCash = TOTAL_CAPITAL; 
  let currentBank = 0; 
  
  const history = [];

  for (const entry of sortedEntries) {
    if (!entry.isPlay || entry.passLocation === 'PENDING') {
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

    const cost = DAILY_PLAY_COST;
    let grossReturn = 0;

    // रिजल्ट पास होने पर 95 के रेट से कैलकुलेशन
    if (entry.passLocation !== 'FAIL') {
      if (entry.passLocation === 'FD') grossReturn = currentRates.FD * 95;
      if (entry.passLocation === 'GB') grossReturn = currentRates.GB * 95;
      if (entry.passLocation === 'GL') grossReturn = currentRates.GL * 95;
      if (entry.passLocation === 'DS') grossReturn = currentRates.DS * 95;
    }
    
    const netProfit = grossReturn - cost;
    
    // 50-50 कंपाउंडिंग लॉजिक
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

  // PredictTab और Tracker दोनों के लिए रिटर्न वैल्यू
  return {
    history: history.reverse(),
    finalCash: Math.round(currentCash),
    finalBank: Math.round(currentBank),
    currentDailyLimit: DAILY_PLAY_COST,
    emergencyFund: EMERGENCY_FUND,
    initialCapital: TOTAL_CAPITAL,
    
    // PredictTab के लिए ज़रूरी डेटा
    currentRates: currentRates,
    totalDayBet: DAILY_PLAY_COST,
    wallet: {
      compound: Math.round(currentCash),
      emergency: EMERGENCY_FUND
    }
  };
}
