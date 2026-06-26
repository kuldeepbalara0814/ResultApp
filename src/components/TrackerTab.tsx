import React, { useState, useMemo } from 'react';
import { Target, Wallet, Landmark, Activity, Edit2, Trash2 } from 'lucide-react';
import { getTrackerEntries, deleteTrackerEntry } from '../utils/storage';
import { calculateLedger } from '../utils/ledger';

export default function TrackerTab() {
  const [entries, setEntries] = useState(getTrackerEntries());
  const ledger = useMemo(() => calculateLedger(), [entries]);

  const handleDelete = (id: string) => {
    if (confirm('क्या आप डिलीट करना चाहते हैं?')) {
      deleteTrackerEntry(id);
      setEntries(getTrackerEntries());
    }
  };

  // यहाँ हमने NaN को रोकने के लिए || 0 लगाया है
  const currentPocket = ledger.currentDailyLimit || 2100;
  const currentEmergency = ledger.emergencyFund || 12900;

  return (
    <div className="p-4 space-y-6 pb-24 font-sans text-white">
      <h1 className="text-xl font-bold text-teal-400 flex items-center gap-2">
        <Target className="w-6 h-6" /> Risk Management
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl p-4 text-slate-900 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Total Cash</span>
            <Wallet className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-2xl font-bold">₹{ledger.finalCash.toLocaleString()}</div>
          <div className="text-xs font-medium opacity-80 mt-1">
            Pocket: ₹{currentPocket.toLocaleString()} <br/> Emg: ₹{currentEmergency.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">Safe Bank</span>
            <Landmark className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">₹{ledger.finalBank.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Stored Profit</div>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">History</h2>
        {ledger.history.map((record: any) => (
          <div key={record.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{record.date}</div>
              <div className="text-xs text-slate-400">Profit: ₹{record.netProfit}</div>
            </div>
            <button onClick={() => handleDelete(record.id)} className="text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
