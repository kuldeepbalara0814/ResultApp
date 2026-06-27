import React, { useState, useMemo } from 'react';
import { Target, Wallet, Landmark, Settings, TrendingUp, Trash2, Download } from 'lucide-react';
import { getTrackerEntries, deleteTrackerEntry, saveTrackerEntry, getInitialCapital, setInitialCapital } from '../utils/storage';
import { calculateLedger } from '../utils/ledger';

export default function TrackerTab() {
  const [entries, setEntries] = useState(getTrackerEntries() || []);
  const [capitalInput, setCapitalInput] = useState(getInitialCapital().toString());
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); 
  };

  const [date, setDate] = useState(getTodayDate());
  const [isPlayed, setIsPlayed] = useState(true);
  const [status, setStatus] = useState('PENDING');

  const ledger = useMemo(() => {
    try {
      return calculateLedger() || {};
    } catch (e) {
      return { finalCash: 15000, finalBank: 0, currentDailyLimit: 2100, emergencyFund: 12900, history: [], currentRates: {FD: 10, GB: 15, GL: 20, DS: 25} };
    }
  }, [entries, capitalInput]);

  const handleDelete = (id: string) => {
    if (confirm('क्या आप इस एंट्री को डिलीट करना चाहते हैं?')) {
      deleteTrackerEntry(id);
      setEntries(getTrackerEntries());
    }
  };

  const handleSaveCapital = () => {
    const newCap = parseFloat(capitalInput);
    if (isNaN(newCap) || newCap < 15000) {
      alert("कम से कम 15000 रुपये का बजट होना चाहिए!");
      setCapitalInput(getInitialCapital().toString());
      return;
    }
    setInitialCapital(newCap);
    setEntries([...getTrackerEntries()]); 
    alert("नया कैपिटल सेव हो गया है! बेस रेट्स और लिमिट अपडेट कर दी गई हैं।");
  };

  const handleSaveData = () => {
    if (!date) {
      alert("कृपया तारीख दर्ज करें!");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      date: date,
      isPlay: isPlayed,
      passLocation: isPlayed ? status : 'PENDING'
    };

    saveTrackerEntry(newEntry);
    setEntries(getTrackerEntries()); 
    setStatus('PENDING');
  };

  // ⭐️ EXCEL DOWNLOAD FUNCTION ⭐️
  const handleExportExcel = () => {
    if (!ledger.history || ledger.history.length === 0) {
      alert("डाउनलोड करने के लिए अभी कोई डेटा मौजूद नहीं है!");
      return;
    }

    // एक्सेल के 15 कॉलम (आपकी शीट के अनुसार)
    const headers = [
      "तारीख (Date)", "दिन (Play/No-Play)", "कहाँ पास हुआ? (Result)", "कुल वापसी (Auto Win ₹)",
      "आज की कुल लिमिट (Max Risk)", "FD भाव (Into ₹)", "GB भाव (Into ₹)", "GL भाव (Into ₹)", "DS भाव (Into ₹)",
      "असली खर्च (Cost x 30)", "शुद्ध मुनाफा (Net PnL)", "बैंक में जमा (Bank 50%)", 
      "नया खेलने का पैसा (New Pocket)", "नया इमरजेंसी फंड (Safe Fund)", "कुल फंड (Total Cash)", "लगातार फेल"
    ];

    // हिस्ट्री को वापस सीधे क्रम में करना
    const excelData = [...ledger.history].reverse().map((row: any) => [
      row.date, row.isPlay, row.passLocation, row.grossReturn,
      row.dailyLimit, row.rateFD, row.rateGB, row.rateGL, row.rateDS,
      row.cost, row.netProfit, row.bankShare,
      row.pocket, row.safeFund, row.totalCash, row.fails
    ]);

    const csvContent = [
      headers.join(","),
      ...excelData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sahil_Master_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPocket = ledger.currentDailyLimit || 2100;
  const currentEmergency = ledger.emergencyFund || 12900;
  const totalCash = ledger.finalCash || 15000;
  const safeBank = ledger.finalBank || 0;
  const rates = ledger.currentRates || { FD: 10, GB: 15, GL: 20, DS: 25 };

  return (
    <div className="p-4 space-y-6 pb-24 font-sans text-white bg-[#0f172a] min-h-screen">
      
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-400 flex items-center gap-2">
          <Target className="w-6 h-6" /> Risk Management
        </h1>
        <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Initial Starting Capital</label>
        <div className="flex gap-3">
          <input
            type="number"
            value={capitalInput}
            onChange={(e) => setCapitalInput(e.target.value)}
            className="flex-1 bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400"
          />
          <button onClick={handleSaveCapital} className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors shadow-md">
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl p-4 text-slate-900 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold">Total Cash</span>
            <Wallet className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-3xl font-extrabold mb-2">₹{totalCash.toLocaleString()}</div>
          <div className="text-xs font-semibold opacity-90 leading-snug">
            Pocket: ₹{currentPocket.toLocaleString()} <br/> Emg: ₹{currentEmergency.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-400">Safe Bank (50%)</span>
            <Landmark className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">₹{safeBank.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium">Stored Profit</div>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#0f172a] p-2 rounded-full border border-slate-700">
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Current Base Rates (₹)</div>
            <div className="text-sm font-bold text-white tracking-wide mt-0.5">
              FD:{rates.FD} | GB:{rates.GB} | GL:{rates.GL} | DS:{rates.DS}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-3">
          <div className="text-xs font-medium text-slate-400">
            Daily Total Limit: <span className="text-teal-400 font-bold text-sm ml-1">₹{currentPocket.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 shadow-lg space-y-5">
        <h2 className="text-lg font-bold text-white">मैनुअल एंट्री</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">तारीख (Date)</label>
          <div className="relative">
             <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 appearance-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setIsPlayed(true)} className={`py-3 rounded-xl font-medium transition-colors ${isPlayed ? 'bg-[#0f172a] border border-teal-400 text-white' : 'bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white'}`}>Played</button>
          <button onClick={() => setIsPlayed(false)} className={`py-3 rounded-xl font-medium transition-colors ${!isPlayed ? 'bg-[#0f172a] border border-teal-400 text-white' : 'bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white'}`}>No Play</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">स्टेटस / कहाँ पास हुआ?</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!isPlayed} className={`w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 appearance-none ${!isPlayed ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <option value="PENDING">पेंडिंग (रिजल्ट की प्रतीक्षा)</option>
            <option value="FD">FD में पास</option>
            <option value="GB">GB में पास</option>
            <option value="GL">GL में पास</option>
            <option value="DS">DS में पास</option>
            <option value="FAIL">फेल (पूरी लिमिट कटी)</option>
          </select>
        </div>

        <button onClick={handleSaveData} className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold py-3.5 rounded-xl transition-colors shadow-md">
          डेटा सेव करें
        </button>
      </div>

      {/* ⭐️ HISTORY HEADER WITH EXCEL BUTTON ⭐️ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Ledger History</h2>
          
          <button 
            onClick={handleExportExcel} 
            className="text-sm bg-teal-400/10 text-teal-400 px-3 py-1.5 rounded-lg border border-teal-400/30 flex items-center gap-2 hover:bg-teal-400 hover:text-slate-900 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Excel
          </button>

        </div>
        
        {(!ledger.history || ledger.history.length === 0) ? (
          <div className="border border-dashed border-slate-700 rounded-2xl p-8 flex items-center justify-center text-center bg-[#1e293b]/50">
            <span className="text-sm text-slate-500 font-medium">No entries yet. Start adding your daily results above.</span>
          </div>
        ) : (
          ledger.history.map((record: any) => (
            <div key={record.id} className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 flex justify-between items-center shadow-md">
              <div>
                <div className="font-semibold text-white">{record.date}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Profit: <span className={record.netProfit >= 0 ? "text-teal-400 font-medium" : "text-red-400 font-medium"}>
                    ₹{record.netProfit}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg hover:bg-red-400/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
