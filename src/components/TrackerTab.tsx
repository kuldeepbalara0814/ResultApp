import React, { useState, useMemo, useEffect } from 'react';
import { Target, Wallet, Landmark, TrendingUp, Edit2, Trash2, Settings } from 'lucide-react';
import { TrackerEntry, PassLocation } from '../types';
import { getTrackerEntries, saveTrackerEntry, deleteTrackerEntry, setInitialCapital } from '../utils/storage';
import { calculateLedger } from '../utils/ledger';

export default function TrackerTab() {
  const [entries, setEntries] = useState<TrackerEntry[]>(getTrackerEntries());
  const [showSettings, setShowSettings] = useState(false);
  const [capitalInput, setCapitalInput] = useState('15000');
  
  const [formData, setFormData] = useState<{
    id?: string;
    date: string;
    isPlay: boolean;
    passLocation: PassLocation | null;
  }>({
    date: new Date().toISOString().split('T')[0],
    isPlay: true,
    passLocation: 'PENDING'
  });

  const ledger = useMemo(() => calculateLedger(), [entries]);

  useEffect(() => {
    setCapitalInput(ledger.initialCapital.toString());
  }, [ledger.initialCapital]);

  const handleSaveCapital = () => {
    setInitialCapital(parseInt(capitalInput, 10) || 15000);
    setEntries(getTrackerEntries()); // Trigger recalculation
    setShowSettings(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TrackerEntry = {
      id: formData.id || formData.date, // Use date as ID if new
      date: formData.date,
      isPlay: formData.isPlay,
      passLocation: formData.isPlay ? formData.passLocation : null
    };
    
    saveTrackerEntry(newEntry);
    setEntries(getTrackerEntries());
    
    setFormData({
      id: undefined,
      date: new Date().toISOString().split('T')[0],
      isPlay: true,
      passLocation: 'PENDING'
    });
  };

  const handleEdit = (entry: TrackerEntry) => {
    setFormData({
      id: entry.id,
      date: entry.date,
      isPlay: entry.isPlay,
      passLocation: entry.passLocation || 'PENDING'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('क्या आप इस एंट्री को डिलीट करना चाहते हैं?')) {
      deleteTrackerEntry(id);
      setEntries(getTrackerEntries());
    }
  };

  const currentPocket = Math.min(ledger.finalCash, ledger.currentDailyLimit);
  const currentEmergency = Math.max(0, ledger.finalCash - currentPocket);

  return (
    <div className="p-4 space-y-6 pb-24 font-sans">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-teal-400 flex items-center gap-2">
          <Target className="w-6 h-6" /> Risk Management
        </h1>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 animate-in slide-in-from-top-2">
          <label className="text-sm text-slate-400 block mb-2">Initial Starting Capital</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={capitalInput}
              onChange={e => setCapitalInput(e.target.value)}
              className="flex-1 bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
            />
            <button onClick={handleSaveCapital} className="bg-teal-400 text-slate-900 px-4 py-2 rounded-lg font-bold">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl p-4 text-slate-900 shadow-lg shadow-teal-400/20">
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
            <span className="text-sm font-medium text-slate-400">Safe Bank (50%)</span>
            <Landmark className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">₹{ledger.finalBank.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Stored Profit</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-teal-400/10 flex items-center justify-center border border-teal-400/20">
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Current Base Rates (₹)</div>
            <div className="font-bold text-white text-sm">
              FD:{ledger.currentRates.FD} | GB:{ledger.currentRates.GB} | GL:{ledger.currentRates.GL} | DS:{ledger.currentRates.DS}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 border-t border-slate-800 pt-2">
          Daily Total Limit: <strong className="text-teal-400">₹{ledger.currentDailyLimit.toLocaleString()}</strong>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-5 relative overflow-hidden">
        {formData.id && (
          <div className="absolute top-0 left-0 right-0 bg-teal-400 text-slate-900 text-xs font-bold text-center py-1">
            एंट्री अपडेट (EDITING ENTRY)
          </div>
        )}
        <h2 className="text-white font-semibold flex items-center mt-2">
          {formData.id ? 'एंट्री अपडेट करें' : 'मैनुअल एंट्री'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">तारीख (Date)</label>
            <input 
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex space-x-4">
            <label className="flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors bg-[#0B1120] hover:border-teal-400/50 peer-checked:border-teal-400 has-[:checked]:border-teal-400 has-[:checked]:bg-teal-400/10 border-slate-700">
              <input 
                type="radio" 
                name="playToggle" 
                className="hidden"
                checked={formData.isPlay === true}
                onChange={() => setFormData({...formData, isPlay: true})}
              />
              <span className="font-medium text-sm text-white">Played</span>
            </label>
            <label className="flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors bg-[#0B1120] hover:border-slate-500/50 has-[:checked]:border-slate-500 has-[:checked]:bg-slate-800 border-slate-700">
              <input 
                type="radio" 
                name="playToggle" 
                className="hidden"
                checked={formData.isPlay === false}
                onChange={() => setFormData({...formData, isPlay: false})}
              />
              <span className="font-medium text-sm text-slate-400">No Play</span>
            </label>
          </div>

          {formData.isPlay && (
            <div className="space-y-2">
              <label className="text-sm text-slate-400">स्टेटस / कहाँ पास हुआ?</label>
              <select 
                value={formData.passLocation || 'PENDING'}
                onChange={(e) => setFormData({...formData, passLocation: e.target.value as PassLocation})}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400 appearance-none"
              >
                <option value="PENDING">पेंडिंग (रिजल्ट की प्रतीक्षा)</option>
                <option value="FD">FD (Faridabad)</option>
                <option value="GB">GB (Ghaziabad)</option>
                <option value="GL">GL (Gali)</option>
                <option value="DS">DS (Desawar)</option>
                <option value="FAIL">फेल (सब में फेल)</option>
              </select>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button 
              type="submit"
              className="flex-1 bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-3.5 rounded-xl transition-colors"
            >
              {formData.id ? 'डेटा अपडेट करें' : 'डेटा सेव करें'}
            </button>
            {formData.id && (
              <button 
                type="button"
                onClick={() => setFormData({ id: undefined, date: new Date().toISOString().split('T')[0], isPlay: true, passLocation: 'PENDING' })}
                className="px-4 border border-slate-600 rounded-xl text-slate-300"
              >
                रद्द करें
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Ledger History Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Ledger History</h2>
        
        <div className="space-y-3">
          {ledger.history.length === 0 && (
            <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl text-slate-500">
              No entries yet. Start adding your daily results above.
            </div>
          )}

          {ledger.history.map((record) => (
            <div key={record.id} className={`bg-[#111827] border ${record.passLocation === 'PENDING' ? 'border-teal-400/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-slate-800'} rounded-2xl overflow-hidden shadow-md transition-all`}>
              <div className="bg-[#1F2937] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white text-sm">{record.date}</span>
                  {!record.isPlay ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">NO PLAY</span>
                  ) : record.passLocation === 'PENDING' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-400 border border-teal-400/30 animate-pulse">PENDING</span>
                  ) : record.passLocation === 'FAIL' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">FAILED</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">PASS: {record.passLocation}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleEdit(record)} className="text-slate-400 hover:text-white">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {record.isPlay && record.passLocation === 'PENDING' && (
                <div className="px-4 py-3 text-center text-sm text-teal-400/70 italic">
                  प्रॉफिट/लॉस कैलकुलेट करने के लिए रिजल्ट की प्रतीक्षा कर रहे हैं।
                </div>
              )}

              {record.isPlay && record.passLocation !== 'PENDING' && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Investment</div>
                      <div className="text-sm font-mono text-slate-300">-₹{record.cost}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5 text-right">Return</div>
                      <div className="text-sm font-mono text-slate-300 text-right">+₹{record.grossReturn}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5 text-right">Net Profit</div>
                      <div className={`text-base font-bold font-mono text-right ${record.netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {record.netProfit > 0 ? '+' : ''}₹{record.netProfit}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-xs">
                    <div className="text-slate-400">
                      Cash: <span className="text-white font-medium">₹{record.runningCash.toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400">
                      Bank: <span className="text-white font-medium">₹{record.runningBank.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              {!record.isPlay && (
                <div className="px-4 py-3 flex justify-between items-center text-xs text-slate-500">
                  <span>Balance carried forward</span>
                  <div className="flex space-x-4">
                    <span>Cash: ₹{record.runningCash.toLocaleString()}</span>
                    <span>Bank: ₹{record.runningBank.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
              }
