import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Check, Copy, Send, Target, RefreshCw, FileText, Shield, ShieldCheck } from 'lucide-react'; 
import { PredictionInput } from '../types';
import { calculatePrediction, ExtendedPredictionResult } from '../utils/formulas';
import { calculateLedger } from '../utils/ledger';
import { saveTrackerEntry, getAllResultsSorted } from '../utils/storage';

const FORMULAS = [
  { id: '2', label: '2 - Evergreen' },
  { id: '3', label: '3 - Universal' },
  { id: '4', label: '4 - Magic' },
  { id: '5', label: '5 - Day Fix' },
  { id: '6', label: '6 - Murda' },
  { id: '7', label: '7 - Haruf' },
  { id: '8', label: '8 - Baki' },
  { id: '9', label: '9 - Month Trend' }
];

export default function PredictTab() {
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>('auto');
  const [playMode, setPlayMode] = useState<'pro' | 'safe'>('pro'); 
  
  const [inputs, setInputs] = useState<PredictionInput>({
    date: new Date().toISOString().split('T')[0],
    fd: '', gb: '', gl: '', ds: ''
  });
  
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>(FORMULAS.map(f => f.id));
  const [result, setResult] = useState<ExtendedPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  
  const [selectedGame, setSelectedGame] = useState<'FD' | 'GB' | 'GL' | 'DS'>('FD');
  const [copied, setCopied] = useState(false);
  const [logged, setLogged] = useState(false);

  const ledger = useMemo(() => calculateLedger(), []);

  useEffect(() => {
    if (inputMode === 'auto') {
      const allResults = getAllResultsSorted();
      const validResults = allResults.filter(r => r.fd || r.gb || r.gl || r.ds);
      
      if (validResults.length > 0) {
        const latest = validResults[0];
        setInputs(prev => ({
          ...prev, fd: latest.fd, gb: latest.gb, gl: latest.gl, ds: latest.ds
        }));
      }
    } else {
      setInputs(prev => ({ ...prev, fd: '', gb: '', gl: '', ds: '' }));
    }
  }, [inputMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleFormula = (id: string) => {
    setSelectedFormulas(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setResult(null);
    setCopied(false);
    setLogged(false);

    setTimeout(() => {
      const pastResults = getAllResultsSorted();
      const validPastResults = pastResults.filter(r => r.fd || r.gb || r.gl || r.ds);
      
      const pastMurda: string[] = [];
      validPastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 3).forEach(r => {
        if (r.fd) pastMurda.push(r.fd); if (r.gb) pastMurda.push(r.gb);
        if (r.gl) pastMurda.push(r.gl); if (r.ds) pastMurda.push(r.ds);
      });

      const past4DaysMurda: string[] = [];
      validPastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 4).forEach(r => {
        if (r.fd) past4DaysMurda.push(r.fd); if (r.gb) past4DaysMurda.push(r.gb);
        if (r.gl) past4DaysMurda.push(r.gl); if (r.ds) past4DaysMurda.push(r.ds);
      });

      const past10DaysNums: string[] = [];
      validPastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 10).forEach(r => {
        if (r.fd) past10DaysNums.push(r.fd); if (r.gb) past10DaysNums.push(r.gb);
        if (r.gl) past10DaysNums.push(r.gl); if (r.ds) past10DaysNums.push(r.ds);
      });

      const past15DaysNums: string[] = [];
      validPastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 15).forEach(r => {
        if (r.fd) past15DaysNums.push(r.fd); if (r.gb) past15DaysNums.push(r.gb);
        if (r.gl) past15DaysNums.push(r.gl); if (r.ds) past15DaysNums.push(r.ds);
      });

      const currentYm = inputs.date.substring(0, 7);
      const currentMonthNums: string[] = [];
      validPastResults.filter(r => r.date.startsWith(currentYm)).forEach(r => {
        if (r.fd) currentMonthNums.push(r.fd); if (r.gb) currentMonthNums.push(r.gb);
        if (r.gl) currentMonthNums.push(r.gl); if (r.ds) currentMonthNums.push(r.ds);
      });

      const todaysRes: string[] = [];
      const userInputs = [inputs.ds, inputs.gl, inputs.gb, inputs.fd].filter(v => v !== '');
      todaysRes.push(...userInputs);

      if (todaysRes.length < 4) {
        const allPastNums: string[] = [];
        validPastResults.forEach(r => {
          if (r.ds) allPastNums.push(r.ds); if (r.gl) allPastNums.push(r.gl);
          if (r.gb) allPastNums.push(r.gb); if (r.fd) allPastNums.push(r.fd);
        });
        for (let i = 0; i < allPastNums.length && todaysRes.length < 4; i++) {
          todaysRes.push(allPastNums[i]);
        }
      }

      const getValidTargetDates = (baseDateStr: string, monthsBack: number) => {
        const [y, m, d] = baseDateStr.split('-').map(Number);
        const targetDate = new Date(y, m - 1 - monthsBack, d);
        
        return validPastResults
          .filter(r => new Date(r.date) <= targetDate)
          .slice(0, 3)
          .map(r => r.date);
      };

      const m1Dates = getValidTargetDates(inputs.date, 1);
      const m2Dates = getValidTargetDates(inputs.date, 2);

      const pastMonth1Nums: string[] = [];
      const pastMonth2Nums: string[] = [];

      validPastResults.forEach(r => {
        if (m1Dates.includes(r.date)) {
          if (r.fd) pastMonth1Nums.push(r.fd); if (r.gb) pastMonth1Nums.push(r.gb);
          if (r.gl) pastMonth1Nums.push(r.gl); if (r.ds) pastMonth1Nums.push(r.ds);
        }
        if (m2Dates.includes(r.date)) {
          if (r.fd) pastMonth2Nums.push(r.fd); if (r.gb) pastMonth2Nums.push(r.gb);
          if (r.gl) pastMonth2Nums.push(r.gl); if (r.ds) pastMonth2Nums.push(r.ds);
        }
      });

      let res = calculatePrediction(
        inputs, selectedFormulas, pastMurda, currentMonthNums, 
        todaysRes.slice(0, 4), past4DaysMurda, past10DaysNums, past15DaysNums, pastMonth1Nums, pastMonth2Nums
      );
      
      const userRole = sessionStorage.getItem('sahil_master_current_role') || 'guest';
      const isGuestUser = userRole !== 'admin' && userRole !== 'user';
      
      if (isGuestUser) {
        res = {
          l1: ['01', '02', '03', '04'],
          l2: ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],
          l3: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
          tokari: [],
          alerts: [],
          report: "गैस्ट यूजर के लिए रिपोर्ट उपलब्ध नहीं है।"
        };
      }

      const final30Jodis = [...res.l1, ...res.l2, ...res.l3];
      localStorage.setItem("lastPrediction", JSON.stringify(final30Jodis));

      setResult(res);
      setIsPredicting(false);
    }, 800);
  };

  const displayedJodis = useMemo(() => {
    if (!result) return [];
    if (playMode === 'safe') return result.l1;
    return [...result.l1, ...result.l2, ...result.l3];
  }, [result, playMode]);

  const currentRate = ledger.currentRates[selectedGame];
  const totalAmount = displayedJodis.length * currentRate;

  const copyToClipboard = () => {
    const text = `📅 Date: ${inputs.date}\n🎯 Game: ${selectedGame}\n🛡️ Mode: ${playMode.toUpperCase()}\n🎲 Jodis (${displayedJodis.length}):\n${displayedJodis.join(', ')}\n\n💰 Rate: ${currentRate} Into\n💵 Total: ₹${totalAmount}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogToTracker = () => {
    saveTrackerEntry({ id: inputs.date, date: inputs.date, isPlay: true, passLocation: 'PENDING' });
    setLogged(true);
    setTimeout(() => setLogged(false), 2000);
  };

  const downloadReport = () => {
      if (!result || !result.report) return;
      const element = document.createElement("a");
      const file = new Blob(["\ufeff" + result.report], {type: 'text/plain;charset=utf-8'});
      element.href = URL.createObjectURL(file);
      element.download = `Sahil_Master_Report_${inputs.date}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-[#e6007a]">आज की प्रेडिक्शन</h1>
        
        <div className="flex bg-[#0b171e] rounded-xl p-1 border border-[#008080]/30">
          <button 
            onClick={() => setPlayMode('safe')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${playMode === 'safe' ? 'bg-[#008080] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Shield className="w-3.5 h-3.5" /> Safe Mode
          </button>
          <button 
            onClick={() => setPlayMode('pro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${playMode === 'pro' ? 'bg-[#e6007a] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Pro Mode
          </button>
        </div>
      </div>

      <div className="bg-[#0b171e] border border-[#008080]/30 rounded-2xl p-5 space-y-6 shadow-lg shadow-[#008080]/5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">नंबर दर्ज करें</h2>
          <div className="flex bg-[#051014] rounded-lg p-1 border border-[#008080]/20">
            <button 
              onClick={() => setInputMode('auto')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${inputMode === 'auto' ? 'bg-[#e6007a] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              ऑटो (पिछला)
            </button>
            <button 
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${inputMode === 'manual' ? 'bg-[#e6007a] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              मैनुअल
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-slate-300">प्रेडिक्शन की तारीख</label>
          <input 
            type="date" 
            name="date"
            value={inputs.date}
            onChange={handleInputChange}
            className="w-full bg-[#051014] border border-[#008080]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e6007a] focus:ring-1 focus:ring-[#e6007a] transition-colors"
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {(['fd', 'gb', 'gl', 'ds'] as const).map((key) => (
            <div key={key} className="space-y-2 text-center">
              <label className="text-sm font-medium text-slate-300 uppercase">{key}</label>
              <input 
                type="text" 
                name={key}
                value={inputs[key]}
                onChange={handleInputChange}
                readOnly={inputMode === 'auto'}
                maxLength={2}
                placeholder="--"
                className={`w-full border rounded-lg px-2 py-3 text-center text-white focus:outline-none transition-colors font-mono ${
                  inputMode === 'auto' 
                    ? 'bg-[#051014]/50 border-[#008080]/20 text-[#00e6e6]/60' 
                    : 'bg-[#051014] border-[#008080]/40 focus:border-[#e6007a] focus:ring-1 focus:ring-[#e6007a]'
                }`}
              />
            </div>
          ))}
        </div>
        
        {inputMode === 'auto' && (
          <div className="text-xs text-[#00e6e6]/70 flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> लेटेस्ट रिजल्ट से डेटा ऑटो-फेच किया गया है।
          </div>
        )}
      </div>

      <div className="bg-[#0b171e] border border-[#008080]/30 rounded-2xl p-5 space-y-5 shadow-lg shadow-[#008080]/5">
        <h2 className="text-white font-semibold">फॉर्मूला चुनें</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {FORMULAS.map(formula => {
            const isSelected = selectedFormulas.includes(formula.id);
            return (
              <button 
                key={formula.id}
                onClick={() => toggleFormula(formula.id)}
                className="flex items-center space-x-3 text-left group"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSelected ? 'bg-[#e6007a] border-[#e6007a] shadow-[0_0_8px_rgba(230,0,122,0.5)]' : 'border-[#008080]/50 group-hover:border-[#e6007a]/50'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <span className="text-sm text-slate-200 group-hover:text-white transition-colors">{formula.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button 
        onClick={handlePredict}
        disabled={isPredicting || !inputs.fd || !inputs.gb || !inputs.gl || !inputs.ds}
        className="w-full bg-gradient-to-r from-[#e6007a] to-[#700080] hover:from-[#ff1a8c] hover:to-[#8b0099] border border-[#e6007a]/50 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(230,0,122,0.3)]"
      >
        <Zap className={`w-5 h-5 ${isPredicting ? 'animate-pulse' : ''}`} />
        <span>{isPredicting ? 'प्रेडिक्शन हो रही है...' : 'प्रेडिक्शन निकालें'}</span>
      </button>

      {result && (
        <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[#e6007a] text-center drop-shadow-[0_0_8px_rgba(230,0,122,0.3)]">
             {playMode === 'safe' ? '🛡️ Safe Mode रिजल्ट' : '🚀 Pro Mode रिजल्ट'}
          </h2>

          <div className="bg-gradient-to-b from-[#0d222b] to-[#051014] border border-[#008080]/40 rounded-2xl p-5 shadow-[0_8px_20px_rgba(0,128,128,0.1)]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#e6007a]" />
              प्ले ऑप्शन और शेयर
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-[#051014] border border-[#008080]/20 rounded-xl overflow-hidden">
                {(['FD', 'GB', 'GL', 'DS'] as const).map(game => (
                  <button
                    key={game}
                    onClick={() => setSelectedGame(game)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                      selectedGame === game 
                        ? 'bg-[#008080] text-white shadow-md' 
                        : 'text-slate-400 hover:bg-[#008080]/20 hover:text-white'
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>

              <div className="bg-[#051014] rounded-xl p-4 border border-[#008080]/30 text-center font-mono">
                <div className="text-slate-400 text-sm mb-1">{selectedGame} प्ले इन्फो ({playMode === 'safe' ? 'Safe' : 'Pro'})</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {currentRate} <span className="text-sm font-normal text-slate-500">Into</span>
                </div>
                <div className="text-[#e6007a] font-medium">कुल: ₹{totalAmount} ({displayedJodis.length} जोड़ी)</div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-[#0b171e] hover:bg-[#0d222b] border border-[#008080]/40 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-[#00e6e6]" /> : <Copy className="w-5 h-5 text-[#00e6e6]" />}
                  {copied ? 'कॉपी हो गया!' : 'खाईवाल के लिए कॉपी करें'}
                </button>

                <button 
                  onClick={handleLogToTracker}
                  className="w-full bg-[#e6007a]/10 hover:bg-[#e6007a]/20 text-[#ff4d94] border border-[#e6007a]/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Target className="w-5 h-5" /> ट्रैकर में प्ले कन्फर्म करें
                </button>

                <button 
                  onClick={downloadReport}
                  className="w-full bg-[#051014] hover:bg-[#0b171e] border border-[#008080]/20 text-slate-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <FileText className="w-5 h-5 text-slate-400" />
                  विस्तृत कैलकुलेशन रिपोर्ट डाउनलोड (TXT)
                </button>
              </div>
            </div>
          </div>

          <div className="border border-[#008080]/40 rounded-2xl overflow-hidden bg-[#0b171e]">
            <div className="bg-[#008080]/15 px-4 py-3 border-b border-[#008080]/30 flex justify-between items-center">
              <h3 className="text-[#00e6e6] font-medium drop-shadow-[0_0_2px_rgba(0,230,230,0.5)]">L1 - सुपर VIP ({result.l1.length} जोड़ी)</h3>
              {playMode === 'safe' && <span className="text-xs bg-[#008080] text-white px-2 py-0.5 rounded font-bold shadow-sm">Safe Mode Active</span>}
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l1.map((num, i) => (
                <div key={i} className="bg-[#008080]/20 text-[#00e6e6] font-mono text-lg px-3 py-2 rounded-lg border border-[#008080]/40 shadow-[0_0_8px_rgba(0,128,128,0.2)]">
                  {num}
                </div>
              ))}
              {result.l1.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          <div className="border border-[#700080]/40 rounded-2xl overflow-hidden bg-[#0b171e]">
            <div className="bg-[#700080]/15 px-4 py-3 border-b border-[#700080]/30">
              <h3 className="text-[#df80ff] font-medium drop-shadow-[0_0_2px_rgba(223,128,255,0.5)]">L2 - मेन ({result.l2.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l2.map((num, i) => (
                <div key={i} className="bg-[#700080]/20 text-[#df80ff] font-mono text-lg px-3 py-2 rounded-lg border border-[#700080]/40 shadow-[0_0_8px_rgba(112,0,128,0.2)]">
                  {num}
                </div>
              ))}
              {result.l2.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          <div className="border border-[#e6007a]/40 rounded-2xl overflow-hidden bg-[#0b171e]">
            <div className="bg-[#e6007a]/15 px-4 py-3 border-b border-[#e6007a]/30">
              <h3 className="text-[#ff4d94] font-medium drop-shadow-[0_0_2px_rgba(255,77,148,0.5)]">L3 - सपोर्ट ({result.l3.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l3.map((num, i) => (
                <div key={i} className="bg-[#e6007a]/20 text-[#ff66b3] font-mono text-lg px-3 py-2 rounded-lg border border-[#e6007a]/40 shadow-[0_0_8px_rgba(230,0,122,0.2)]">
                  {num}
                </div>
              ))}
              {result.l3.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          {result.tokari && result.tokari.length > 0 && (
            <div className="bg-[#0b171e] border border-[#008080]/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white font-semibold mb-4 text-[#00e6e6]">टोकरी काउंट्स</h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {result.tokari.map((item, i) => (
                  <div key={i} className="bg-[#051014] rounded-lg p-2 flex flex-col items-center justify-center border border-[#008080]/40 shadow-inner">
                    <div className="text-white font-mono font-medium text-sm md:text-base">
                      {item.id}
                    </div>
                    <div className="text-xs text-[#e6007a] mt-1 font-bold">
                      {item.count}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
