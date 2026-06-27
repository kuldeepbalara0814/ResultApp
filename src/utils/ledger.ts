import { getTrackerEntries, getInitialCapital } from './storage';

export function calculateLedger() {
  const entries = getTrackerEntries();
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const TOTAL_CAPITAL = getInitialCapital();
  const baseMultiplier = Math.max(1, Math.floor(TOTAL_CAPITAL / 15000));

  const INITIAL_EMERGENCY = 12900 * baseMultiplier;
  const INITIAL_POCKET = 2100 * baseMultiplier;
  const WIN_MULTIPLIER = 90; 

  let currentPocket = INITIAL_POCKET;      
  let currentSafeFund = INITIAL_EMERGENCY; 
  let bankAccum = 0;                       
  let consecutiveFails = 0; // 'लगातार फेल' का ट्रैक रखने के लिए
  
  const history: any[] = [];

  let currentRates = { FD: 10 * baseMultiplier, GB: 15 * baseMultiplier, GL: 20 * baseMultiplier, DS: 25 * baseMultiplier };
  let currentDailyLimit = INITIAL_POCKET;

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const currentTotalCash = currentPocket + currentSafeFund + bankAccum;
    
    const multiplier = Math.max(baseMultiplier, Math.floor(currentTotalCash / 15000));
    
    currentRates = { 
      FD: 10 * multiplier, GB: 15 * multiplier, GL: 20 * multiplier, DS: 25 * multiplier 
    };
    
    currentDailyLimit = (currentRates.FD + currentRates.GB + currentRates.GL + currentRates.DS) * 30;

    // अगर No-Play या Pending है
    if (!entry.isPlay || entry.passLocation === 'PENDING' || entry.passLocation === 'पेंडिंग (रिजल्ट की प्रतीक्षा)') {
      history.push({
        id: entry.id,
        date: entry.date,
        isPlay: entry.isPlay ? 'Played' : 'No-Play',
        passLocation: entry.passLocation,
        grossReturn: 0,
        dailyLimit: currentDailyLimit,
        rateFD: currentRates.FD, rateGB: currentRates.GB, rateGL: currentRates.GL, rateDS: currentRates.DS,
        cost: 0,
        netProfit: 0,
        bankShare: 0,
        pocket: Math.round(currentPocket),
        safeFund: Math.round(currentSafeFund),
        totalCash: Math.round(currentTotalCash),
        fails: consecutiveFails,
        runningCash: Math.round(currentTotalCash), 
        runningBank: Math.round(bankAccum)
      });
      continue;
    }

    let cost = 0;
    if (entry.passLocation === 'FD') cost = currentRates.FD * 30;
    else if (entry.passLocation === 'GB') cost = (currentRates.FD + currentRates.GB) * 30;
    else if (entry.passLocation === 'GL') cost = (currentRates.FD + currentRates.GB + currentRates.GL) * 30;
    else cost = currentDailyLimit; 

    let grossReturn = 0;
    if (entry.passLocation !== 'FAIL' && entry.passLocation !== 'PENDING') {
      if (entry.passLocation === 'FD') grossReturn = currentRates.FD * WIN_MULTIPLIER;
      if (entry.passLocation === 'GB') grossReturn = currentRates.GB * WIN_MULTIPLIER;
      if (entry.passLocation === 'GL') grossReturn = currentRates.GL * WIN_MULTIPLIER;
      if (entry.passLocation === 'DS') grossReturn = currentRates.DS * WIN_MULTIPLIER;
    }
    
    const netProfit = grossReturn - cost;
    const bankShare = netProfit > 0 ? Math.floor(netProfit * 0.5) : 0;
    bankAccum += bankShare;

    const tempPocket = currentPocket + (netProfit > 0 ? (netProfit - bankShare) : netProfit);

    let shortfall = 0;
    if (tempPocket < currentDailyLimit) {
      shortfall = currentDailyLimit - tempPocket;
    }

    currentPocket = tempPocket + shortfall;
    currentSafeFund = currentSafeFund - shortfall;
    
    const finalTotalForDay = currentPocket + currentSafeFund + bankAccum;

    // लगातार फेल का गणित
    if (entry.passLocation === 'FAIL') {
      consecutiveFails += 1;
    } else {
      consecutiveFails = 0;
    }

    history.push({
      id: entry.id,
      date: entry.date,
      isPlay: 'Played',
      passLocation: entry.passLocation,
      grossReturn: grossReturn,
      dailyLimit: currentDailyLimit,
      rateFD: currentRates.FD, rateGB: currentRates.GB, rateGL: currentRates.GL, rateDS: currentRates.DS,
      cost: cost,
      netProfit: netProfit,
      bankShare: bankShare,
      pocket: Math.round(currentPocket),
      safeFund: Math.round(currentSafeFund),
      totalCash: Math.round(finalTotalForDay),
      fails: consecutiveFails,
      runningCash: Math.round(finalTotalForDay), 
      runningBank: Math.round(bankAccum)
    });
  }

  const finalTotalCash = currentPocket + currentSafeFund + bankAccum;

  return {
    history: history.reverse(),
    finalCash: Math.round(finalTotalCash), 
    finalBank: Math.round(bankAccum), 
    currentDailyLimit: currentDailyLimit,
    emergencyFund: Math.round(currentSafeFund),
    initialCapital: TOTAL_CAPITAL,
    currentRates: currentRates,
    totalDayBet: currentDailyLimit,
    wallet: {
      compound: Math.round(finalTotalCash),
      emergency: Math.round(currentSafeFund),
      pocket: Math.round(currentPocket)
    }
  };
}
