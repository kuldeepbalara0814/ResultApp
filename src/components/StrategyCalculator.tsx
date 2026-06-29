import React, { useState } from 'react';

const StrategyCalculator: React.FC = () => {
  const [capital, setCapital] = useState<number>(15000);
  const [lossDays, setLossDays] = useState<number>(2);
  const [planMode, setPlanMode] = useState<'safe' | 'pro' | 'moderate'>('safe');

  const baseBet = 2100;
  const baseProfit = 900;

  // फ़ैल दिनों को सुरक्षित तरीके से बाँटने का लॉजिक
  const getFailDays = (days: number) => {
    if (days === 1) return [15];
    if (days === 2) return [10, 20];
    if (days === 3) return [8, 16, 24];
    if (days === 4) return [6, 12, 18, 24];
    return [];
  };

  const generateLedger = () => {
    let wallet = capital;
    let bank = 0;
    let currentBet = baseBet;
    const fails = getFailDays(lossDays);
    const records = [];

    // प्लान के हिसाब से सीलिंग और प्रॉफिट शेयरिंग सेट करना
    let ceiling: number | null = null;
    let bankRatio = 0.5;
    let walletRatio = 0.5;

    if (planMode === 'safe') {
      ceiling = 4200; // सेफ मोड में 4200 की लिमिट
      bankRatio = 0.5;
      walletRatio = 0.5;
    } else if (planMode === 'pro') {
      ceiling = null; // प्रो मोड में कोई लिमिट नहीं
      bankRatio = 0.5;
      walletRatio = 0.5;
    } else if (planMode === 'moderate') {
      ceiling = 7800; // बीच के रास्ते में 7800 की लिमिट
      bankRatio = 0.3;
      walletRatio = 0.7;
    }

    for (let day = 1; day <= 30; day++) {
      const isFail = fails.includes(day);
      
      // सीलिंग लिमिट चेक (लालच रोकने के लिए)
      if (ceiling !== null && currentBet > ceiling) {
        currentBet = ceiling;
      }

      const recordBet = currentBet;
      let netProfit = 0;

      if (!isFail) {
        // पास होने पर प्रॉफिट कैलकुलेशन (दांव के अनुपात में)
        const profit = (currentBet / baseBet) * baseProfit;
        const bankAdd = profit * bankRatio;
        const walletAdd = profit * walletRatio;

        bank += bankAdd;
        wallet += walletAdd;
        currentBet += walletAdd; // अगला दांव बढ़ेगा (कंपाउंडिंग)
      } else {
        // फ़ैल होने पर पैसा वॉलेट से कटेगा, वॉलेट खाली तो बैंक से
        wallet -= currentBet;
        if (wallet < 0) {
          bank += wallet;
          wallet = 0;
        }
        currentBet = baseBet; // फ़ैल होने के बाद दांव वापस बेस (2100) पर
      }

      netProfit = (wallet + bank) - capital;

      records.push({
        day,
        bet: Math.round(recordBet),
        status: isFail ? 'FAIL ❌' : 'PASS ✅',
        wallet: Math.round(wallet),
        bank: Math.round(bank),
        netProfit: Math.round(netProfit),
      });
    }
    return records;
  };

  const ledgerData = generateLedger();
  const finalDay = ledgerData[29];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">लेज़र एवं स्ट्रेटेजी कैलकुलेटर (30-Day Plan)</h2>
        
        {/* Input Section */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">शुरुआती फंड (Capital)</label>
              <input 
                type="number" 
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-400 mb-2">महीने में फ़ैल दिन (Loss Days: 0 to 4)</label>
              <input 
                type="number" 
                max="4" min="0"
                value={lossDays}
                onChange={(e) => setLossDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button onClick={() => setPlanMode('safe')} className={`px-4 py-2 rounded-lg font-semibold ${planMode === 'safe' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              Safe Mode (सीलिंग ₹4200)
            </button>
            <button onClick={() => setPlanMode('pro')} className={`px-4 py-2 rounded-lg font-semibold ${planMode === 'pro' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              Pro Mode (कोई लिमिट नहीं)
            </button>
            <button onClick={() => setPlanMode('moderate')} className={`px-4 py-2 rounded-lg font-semibold ${planMode === 'moderate' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              बीच का रास्ता (70-30)
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm">30 दिन बाद बैंक (Safe)</p>
            <p className="text-2xl font-bold text-green-400">₹{finalDay.bank.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm">वॉलेट (खेलने का पैसा)</p>
            <p className="text-2xl font-bold text-blue-400">₹{finalDay.wallet.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm">कुल असली मुनाफा</p>
            <p className={`text-2xl font-bold ${finalDay.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {finalDay.netProfit >= 0 ? '+' : ''}₹{finalDay.netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700 text-slate-300 text-sm">
                  <th className="p-3 border-b border-slate-600">दिन</th>
                  <th className="p-3 border-b border-slate-600">आज का दांव</th>
                  <th className="p-3 border-b border-slate-600">रिजल्ट</th>
                  <th className="p-3 border-b border-slate-600">वॉलेट (CF)</th>
                  <th className="p-3 border-b border-slate-600">बैंक (Safe)</th>
                  <th className="p-3 border-b border-slate-600">शुद्ध मुनाफा</th>
                </tr>
              </thead>
              <tbody>
                {ledgerData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-750 text-sm border-b border-slate-700/50">
                    <td className="p-3 text-slate-400">{row.day}</td>
                    <td className="p-3 font-medium text-slate-200">₹{row.bet}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${row.status.includes('PASS') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-blue-300">₹{row.wallet}</td>
                    <td className="p-3 text-green-300 font-semibold">₹{row.bank}</td>
                    <td className={`p-3 font-bold ${row.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{row.netProfit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCalculator;
