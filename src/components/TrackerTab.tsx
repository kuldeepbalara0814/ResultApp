import React, { useState, useMemo, useEffect } from 'react';
import { Target, Wallet, Landmark, TrendingUp, Edit2, Trash2, Settings, BarChart2, Activity, Download, X } from 'lucide-react';
import { TrackerEntry, PassLocation } from '../types';
import { getTrackerEntries, saveTrackerEntry, deleteTrackerEntry, setInitialCapital } from '../utils/storage';
import { calculateLedger } from '../utils/ledger';

export default function TrackerTab() {
  const [entries, setEntries] = useState<TrackerEntry[]>(getTrackerEntries());
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDates, setExportDates] = useState({ start: '', end: '' });
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

  const marketPerformance = useMemo(() => {
    const stats: Record<string, { wins: number, recentDates: string[] }> = {
      FD: { wins: 0, recentDates: [] },
      GB: { wins: 0, recentDates: [] },
      GL: { wins: 0, recentDates: [] },
      DS: { wins: 0, recentDates: [] }
    };
    let totalCompletedPlays = 0;
    ledger.history.forEach(h => {
      if (h.isPlay && h.passLocation !== 'PENDING') {
        totalCompletedPlays++;
        if (h.passLocation !== 'FAIL' && stats[h.passLocation]) {
          stats[h.passLocation].wins += 1;
          stats[h.passLocation].recentDates.unshift(h.date); 
        }
      }
    });
    return { stats, totalCompletedPlays };
  }, [ledger.history]);

  useEffect(() => {
    setCapitalInput(ledger.initialCapital.toString());
  }, [ledger.initialCapital]);

  const handleSaveCapital = () => {
    setInitialCapital(parseInt(capitalInput, 10) || 15000);
    setEntries(getTrackerEntries());
    setShowSettings(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTrackerEntry({ 
      id: formData.id || formData.date, 
      date: formData.date, 
      isPlay: formData.isPlay, 
      passLocation: formData.isPlay ? formData.passLocation : null 
    });
    setEntries(getTrackerEntries());
    setFormData({ id: undefined, date: new Date().toISOString().split('T')[0], isPlay: true, passLocation: 'PENDING' });
  };

  const handleEdit = (entry: TrackerEntry) => {
    setFormData({ id: entry.id, date: entry.date, isPlay: entry.isPlay, passLocation: entry.passLocation || 'PENDING' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('क्या आप इस एंट्री को डिलीट करना चाहते हैं?')) {
      deleteTrackerEntry(id);
      setEntries(getTrackerEntries());
    }
  };

  // ==========================================
  // [UPDATED] Custom Date CSV Export Logic
  // ==========================================
  const handleExportCSV = () => {
    const headers = ['Date', 'Play Status', 'Location', 'Investment(Rs)', 'Return(Rs)', 'Net Profit(Rs)', 'Total Cash', 'Safe Bank'];
    
    let filteredHistory = ledger.history;

    // Filter by Date Logic
    if (exportDates.start) {
      filteredHistory = filteredHistory.filter(r => r.date >= exportDates.start);
    }
    if (exportDates.end) {
      filteredHistory = filteredHistory.filter(r => r.date <= exportDates.end);
    }

    if (filteredHistory.length === 0) {
      alert('इन तारीखों के बीच कोई डेटा नहीं मिला!');
      return;
    }

    const rows = filteredHistory.map(record => {
      const status = record.isPlay ? 'Played' : 'No Play';
      const loc = record.passLocation || '-';
      return [
        record.date, 
        status, 
        loc, 
        record.cost, 
        record.grossReturn, 
        record.netProfit, 
        record.runningCash, 
        record.runningBank
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Report_${exportDates.start || 'Start'}_to_${exportDates.end || 'End'}.csv`;
    link.click();
    
    // Modal बंद करें और डेट रीसेट करें
    setShowExportModal(false);
    setExportDates({ start: '', end: '' });
  };

  const currentPocket = Math.min(ledger.finalCash, ledger.currentDailyLimit);
  const currentEmergency = Math.max(0, ledger.finalCash - currentPocket);
  const recentHistory = [...ledger.history].slice(0, 7).reverse();
  const maxProfitAbs = Math.max(...recentHistory.map(r => Math.abs(r.netProfit || 0)), 1);

  return (
    <div className="p-4 space-y-6 pb-24 font-sans relative">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-teal-400 flex items-center gap-2">
          <Target className="w-6 h-6" /> Risk Management
        </h1>
        <div className="flex items-center gap-2">
          {/* Download Button triggers Modal now */}
          <button onClick={() => setShowExportModal(true)} className="p-2 text-teal-400 hover:text-teal-300 bg-teal-400/10 rounded-full transition-colors" title="Custom Data Download">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Export Date Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-400" /> Export Ledger
            </h3>
            <p className="text-xs text-slate-400 mb-5">कस्टम तारीख चुनें या खाली छोड़कर पूरा डेटा डाउनलोड करें</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">From Date (कब से)</label>
                <input 
                  type="date" 
                  value={exportDates.start} 
                  onChange={e => setExportDates({...exportDates, start: e.target.value})} 
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-400 focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">To Date (कब तक)</label>
                <input 
                  type="date" 
                  value={exportDates.end} 
                  onChange={e => setExportDates({...exportDates, end: e.target.value})} 
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-400 focus:outline-none" 
                />
              </div>
              <button 
                onClick={handleExportCSV} 
                className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-3 rounded-xl mt-2 transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Market Performance Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-teal-400" />
          मार्केट रिपोर्ट (Performance)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {['FD', 'GB', 'GL', 'DS'].map((m) => {
            const data = marketPerformance.stats[m];
            const winRate = marketPerformance.totalCompletedPlays > 0
              ? Math.round((data.wins / marketPerformance.totalCompletedPlays) * 100)
              : 0;
            const recentText = data.recentDates.length > 0
              ? data.recentDates.slice(0, 2).map(d => {
                  const parts = d.split('-');
                  return `${parts[2]}/${parts[1]}`;
                }).join(', ')
              : '--';

            return (
              <div key={m} className="bg-[#0B1120] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-300">{m}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    winRate >= 25 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {winRate}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {data.wins} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">Wins</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-auto">
                  <div className={`w-1.5 h-1.5 rounded-full ${data.recentDates.length > 0 ? 'bg-teal-400/60' : 'bg-slate-700'}`}></div>
                  <span>Last: {recentText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* P&L Chart */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-teal-400" />
          पिछले 7 दिन का P&L ग्राफ़
        </h2>
        {recentHistory.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-6">ग्राफ़ दिखाने के लिए अभी कोई डेटा नहीं है</div>
        ) : (
          <div className="flex items-end justify-between h-36 px-1 border-b border-slate-700/50">
            {recentHistory.map((record) => {
              const val = record.netProfit || 0;
              const isProfit = val > 0;
              const isLoss = val < 0;
              const absVal = Math.abs(val);
              const heightPct = val === 0 ? 5 : Math.max((absVal / maxProfitAbs) * 100, 5);
              const displayVal = absVal > 999 ? (absVal / 1000).toFixed(1) + 'k' : absVal;
              const dateStr = record.date.split('-')[2];

              return (
                <div key={record.id} className="flex flex-col items-center gap-1.5 w-8 group">
                  <span className={`text-[10px] font-bold font-mono transition-opacity ${isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-slate-500'}`}>
                    {val !== 0 ? (isProfit ? '+' : '-') : ''}{displayVal}
                  </span>
                  
                  <div className="w-full h-24 flex items-end justify-center bg-slate-800/30 rounded-t-md overflow-hidden relative">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                        isProfit ? 'bg-gradient-to-t from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 
                        isLoss ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]' : 
                        'bg-slate-700'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] font-medium text-slate-400 mt-1">
                    {dateStr}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
