import { getTrackerEntries } from './storage';

export function calculateLedger() {
  const entries = getTrackerEntries();
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Excel Sheet Constants
  const TOTAL_CAPITAL = 15000;
  const INITIAL_EMERGENCY = 12900;
  const INITIAL_POCKET = 2100;
  const WIN_MULTIPLIER = 90; // शीट के नियम "भाव x 90" के अनुसार 

  let currentPocket = INITIAL_POCKET;      // नया खेलने का पैसा
  let currentSafeFund = INITIAL_EMERGENCY; // नया इमरजेंसी फंड
  let bankAccum = 0;                       // बैंक में जमा (50% मुनाफे का)
  
  const history: any[] = [];

  // Default rates for empty states
  let currentRates = { FD: 10, GB: 15, GL: 20, DS: 25 };
  let currentDailyLimit = INITIAL_POCKET;

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    
    // आज का कुल फंड (Excel Col 15: कुल फंड)
    const currentTotalCash = currentPocket + currentSafeFund + bankAccum;
    
    // डायनामिक रेट मल्टीप्लायर (Excel: MAX(1, INT(Total/15000)))
    const multiplier = Math.max(1, Math.floor(currentTotalCash / 15000));
    
    currentRates = { 
      FD: 10 * multiplier, 
      GB: 15 * multiplier, 
      GL: 20 * multiplier, 
      DS: 25 * multiplier 
    };
    
    // आज की कुल लिमिट (Max Risk)
    currentDailyLimit = (currentRates.FD + currentRates.GB + currentRates.GL + currentRates.DS) * 30;

    // अगर No-Play है या पेंडिंग है तो कोई खर्च/मुनाफा नहीं
    if (!entry.isPlay || entry.passLocation === 'PENDING' || entry.passLocation === 'पेंडिंग (रिजल्ट की प्रतीक्षा)') {
      history.push({
        ...entry,
        cost: 0,
        grossReturn: 0,
        netProfit: 0,
        runningCash: Math.round(currentTotalCash), 
        runningBank: Math.round(bankAccum)
      });
      continue;
    }

    // असली खर्च (Cost x 30): जहां पास हुआ, वहीं तक का खर्च लगेगा (Excel Col 10)
    let cost = 0;
    if (entry.passLocation === 'FD') cost = currentRates.FD * 30;
    else if (entry.passLocation === 'GB') cost = (currentRates.FD + currentRates.GB) * 30;
    else if (entry.passLocation === 'GL') cost = (currentRates.FD + currentRates.GB + currentRates.GL) * 30;
    else if (entry.passLocation === 'DS') cost = currentDailyLimit;
    else cost = currentDailyLimit; // FAIL (पूरा खर्च लगेगा)

    // कुल वापसी (Auto Win ₹) (Excel Col 4)
    let grossReturn = 0;
    if (entry.passLocation !== 'FAIL' && entry.passLocation !== 'PENDING' && entry.passLocation !== 'पेंडिंग (रिजल्ट की प्रतीक्षा)') {
      if (entry.passLocation === 'FD') grossReturn = currentRates.FD * WIN_MULTIPLIER;
      if (entry.passLocation === 'GB') grossReturn = currentRates.GB * WIN_MULTIPLIER;
      if (entry.passLocation === 'GL') grossReturn = currentRates.GL * WIN_MULTIPLIER;
      if (entry.passLocation === 'DS') grossReturn = currentRates.DS * WIN_MULTIPLIER;
    }
    
    // शुद्ध मुनाफा (Net PnL) (Excel Col 11)
    const netProfit = grossReturn - cost;
    
    // बैंक में जमा 50% (Excel Col 12)
    const bankShare = netProfit > 0 ? Math.floor(netProfit * 0.5) : 0;
    bankAccum += bankShare;

    // नया खेलने का पैसा (Temp Pocket calculation before shortfall)
    const tempPocket = currentPocket + (netProfit > 0 ? (netProfit - bankShare) : netProfit);

    // शॉर्टफॉल चेक: अगर पॉकेट में लिमिट से कम पैसा है, तो सेफ फंड से निकालेंगे (Excel Col 13 & 14)
    let shortfall = 0;
    if (tempPocket < currentDailyLimit) {
      shortfall = currentDailyLimit - tempPocket;
    }

    // फाइनल अपडेट
    currentPocket = tempPocket + shortfall;
    currentSafeFund = currentSafeFund - shortfall;
    
    const finalTotalForDay = currentPocket + currentSafeFund + bankAccum;

    history.push({
      ...entry,
      cost,
      grossReturn,
      netProfit,
      runningCash: Math.round(finalTotalForDay), 
      runningBank: Math.round(bankAccum)
    });
  }

  const finalTotalCash = currentPocket + currentSafeFund + bankAccum;

  return {
    history: history.reverse(),
    finalCash: Math.round(finalTotalCash), 
    finalBank: Math.round(bankAccum),           // FIX: यहाँ सिर्फ बैंक का पैसा आएगा
    currentDailyLimit: currentDailyLimit,
    emergencyFund: Math.round(currentSafeFund), // FIX: यहाँ सिर्फ इमरजेंसी फंड आएगा
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
