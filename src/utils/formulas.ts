import { ResultData, PredictionData } from '../types';

// Helper function to extract individual digits
const getDigits = (numStr: string | undefined): number[] => {
  if (!numStr) return [];
  return numStr.split('').map(d => parseInt(d, 10)).filter(n => !isNaN(n));
};

// Strategy 1: FBD + GB Cross Addition
// Logic: FBD(A) + GB(B), FBD(B) + GB(A) -> Form Harup and Jodi
export const strategy1 = (fbd: string, gb: string): PredictionData | null => {
  if (!fbd || !gb || fbd.length !== 2 || gb.length !== 2) return null;
  
  const fbdA = parseInt(fbd[0]);
  const fbdB = parseInt(fbd[1]);
  const gbA = parseInt(gb[0]);
  const gbB = parseInt(gb[1]);
  
  let val1 = (fbdA + gbB) % 10;
  let val2 = (fbdB + gbA) % 10;
  
  // Apply cut/rashi for variation
  const rashi = {0:5, 1:6, 2:7, 3:8, 4:9, 5:0, 6:1, 7:2, 8:3, 9:4};
  
  const harupInt = [val1, val2];
  const harupExt = [(val1 + 1) % 10, rashi[val2 as keyof typeof rashi]];
  
  const mainJodi = [
    `${val1}${val2}`,
    `${val2}${val1}`,
    `${val1}${rashi[val2 as keyof typeof rashi]}`,
    `${rashi[val1 as keyof typeof rashi]}${val2}`
  ];
  
  return {
    strategyName: 'Cross Addition V1',
    description: 'FBD & GB Cross digit calculation',
    harup: {
      internal: harupInt,
      external: harupExt
    },
    jodi: {
      main: mainJodi,
      support: [`${harupInt[0]}${harupExt[0]}`, `${harupInt[1]}${harupExt[1]}`],
      single: mainJodi[0]
    },
    confidence: 75
  };
};

// Strategy 2: GL + DS Difference & Multiplier
// Logic: |GL - DS| * 2, extract digits
export const strategy2 = (gl: string, ds: string): PredictionData | null => {
  if (!gl || !ds) return null;
  
  const glNum = parseInt(gl);
  const dsNum = parseInt(ds);
  
  if (isNaN(glNum) || isNaN(dsNum)) return null;
  
  const diff = Math.abs(glNum - dsNum);
  const mult = (diff * 2).toString().padStart(2, '0');
  
  const h1 = parseInt(mult.charAt(mult.length - 1));
  const h2 = (h1 + 5) % 10; // Rashi
  
  const mainJodi = [
    mult,
    `${h1}${h2}`,
    `${h2}${h1}`,
    (diff % 100).toString().padStart(2, '0')
  ];
  
  return {
    strategyName: 'Differential Multiplier',
    description: 'Based on difference between GL and DS',
    harup: {
      internal: [h1],
      external: [h2]
    },
    jodi: {
      main: mainJodi,
      support: [`${h1}1`, `${h1}6`, `${h2}2`, `${h2}7`],
      single: mult
    },
    confidence: 65
  };
};

// Strategy 3: Sum of all 4 markets
// Logic: Sum all, take last 2 digits, apply +1/-1
export const strategy3 = (results: ResultData): PredictionData | null => {
  const vals = [results.fbd, results.gb, results.gl, results.ds]
    .map(v => parseInt(v || '0'))
    .filter(v => !isNaN(v));
    
  if (vals.length < 3) return null; // Need at least 3 results
  
  const sum = vals.reduce((a, b) => a + b, 0);
  const lastTwo = (sum % 100).toString().padStart(2, '0');
  
  const base1 = parseInt(lastTwo) + 1;
  const base2 = parseInt(lastTwo) - 1;
  
  const j1 = base1.toString().padStart(2, '0');
  const j2 = base2.toString().padStart(2, '0');
  
  return {
    strategyName: 'Aggregate Summation',
    description: 'Total sum of all markets ± 1',
    harup: {
      internal: [parseInt(lastTwo[0])],
      external: [parseInt(lastTwo[1])]
    },
    jodi: {
      main: [lastTwo, j1, j2],
      support: [
        `${lastTwo[1]}${lastTwo[0]}`, 
        `${j1[1]}${j1[0]}`,
        `${j2[1]}${j2[0]}`
      ],
      single: lastTwo
    },
    confidence: 80
  };
};

// Strategy 4: Yesterday's DS repeating pattern
export const strategy4 = (yesterdayDs: string): PredictionData | null => {
  if (!yesterdayDs || yesterdayDs.length !== 2) return null;
  
  const d1 = parseInt(yesterdayDs[0]);
  const d2 = parseInt(yesterdayDs[1]);
  
  // +2 / -2 pattern on DS
  const p1 = (d1 + 2) % 10;
  const p2 = (d2 + 2) % 10;
  const m1 = (d1 - 2 + 10) % 10;
  const m2 = (d2 - 2 + 10) % 10;
  
  return {
    strategyName: 'DS Shift Pattern',
    description: 'Based on previous day DS shifted by ±2',
    harup: {
      internal: [p1, m1],
      external: [p2, m2]
    },
    jodi: {
      main: [`${p1}${p2}`, `${m1}${m2}`, `${p1}${m2}`, `${m1}${p2}`],
      support: [`${p2}${p1}`, `${m2}${m1}`],
      single: `${p1}${p2}`
    },
    confidence: 60
  };
};

// Advanced Formula 1: Triple Cross Pattern
// Requires 3 consecutive days of results for a specific market (e.g. DS)
export const advancedFormula1 = (day1: string, day2: string, day3: string): PredictionData | null => {
    if(!day1 || !day2 || !day3) return null;
    const d1 = parseInt(day1);
    const d2 = parseInt(day2);
    const d3 = parseInt(day3);

    if(isNaN(d1) || isNaN(d2) || isNaN(d3)) return null;

    const pattern = Math.abs((d1 + d3) - d2);
    const resultNum = pattern % 100;
    const strRes = resultNum.toString().padStart(2, '0');

    const h1 = parseInt(strRes[0]);
    const h2 = parseInt(strRes[1]);

    const rashi = {0:5, 1:6, 2:7, 3:8, 4:9, 5:0, 6:1, 7:2, 8:3, 9:4};

    return {
        strategyName: 'Triple Cross Pattern',
        description: 'Analyzes 3-day trend for hidden sequences',
        harup: {
            internal: [h1, rashi[h1 as keyof typeof rashi]],
            external: [h2, rashi[h2 as keyof typeof rashi]]
        },
        jodi: {
            main: [strRes, `${strRes[1]}${strRes[0]}`, `${rashi[h1 as keyof typeof rashi]}${h2}`],
            support: [`${h1}${rashi[h2 as keyof typeof rashi]}`, `${h1+1}${h2+1}`],
            single: strRes
        },
        confidence: 85
    }
}

// Generate all predictions based on available data
export const generatePredictions = (
  todayResults: ResultData | null, 
  yesterdayResults: ResultData | null,
  dayBeforeYesterdayResults: ResultData | null = null
): PredictionData[] => {
  const predictions: PredictionData[] = [];
  
  if (todayResults) {
    if (todayResults.fbd && todayResults.gb) {
      const p1 = strategy1(todayResults.fbd, todayResults.gb);
      if (p1) predictions.push(p1);
    }
    
    if (todayResults.gl && todayResults.ds) {
      const p2 = strategy2(todayResults.gl, todayResults.ds);
      if (p2) predictions.push(p2);
    }
    
    const p3 = strategy3(todayResults);
    if (p3) predictions.push(p3);
  }
  
  if (yesterdayResults?.ds) {
    const p4 = strategy4(yesterdayResults.ds);
    if (p4) predictions.push(p4);
  }

  if (todayResults?.ds && yesterdayResults?.ds && dayBeforeYesterdayResults?.ds) {
      const p5 = advancedFormula1(dayBeforeYesterdayResults.ds, yesterdayResults.ds, todayResults.ds);
      if(p5) predictions.push(p5);
  }
  
  // Filter out any nulls just in case
  return predictions.filter(Boolean) as PredictionData[];
};

// Analyze hit rate of a strategy
export const analyzeHitRate = (
    strategyResult: PredictionData,
    actualResult: string
): { hit: boolean, type: 'jodi' | 'harup-int' | 'harup-ext' | 'none' } => {
    
    if(!actualResult || actualResult.length !== 2) return { hit: false, type: 'none' };

    const actualInt = parseInt(actualResult[0]);
    const actualExt = parseInt(actualResult[1]);

    // Check Jodi
    if (strategyResult.jodi.main.includes(actualResult) || 
        strategyResult.jodi.support?.includes(actualResult) || 
        strategyResult.jodi.single === actualResult) {
        return { hit: true, type: 'jodi' };
    }

    // Check Harup Internal
    if (strategyResult.harup.internal.includes(actualInt)) {
        return { hit: true, type: 'harup-int' };
    }

    // Check Harup External
    if (strategyResult.harup.external.includes(actualExt)) {
        return { hit: true, type: 'harup-ext' };
    }

    return { hit: false, type: 'none' };
  }
