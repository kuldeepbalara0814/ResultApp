import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Check, Copy, Send, Target, RefreshCw, Shield, Flame, BarChart2 } from 'lucide-react';
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
  { id: '9', label: '9 - Month Trend' },
  { id: '10', label: '10 - Zero/Panja (0/5)' },
  { id: '11', label: '11 - Dana/Gap Scanner' }
];

export default function PredictTab() {
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>('auto');
  const [isProMode, setIsProMode] = useState(false);
  
  const [inputs, setInputs] = useState<PredictionInput>({
    date: new Date().toISOString().split('T')[0],
    fd: '', gb: '', gl: '', ds: ''
  });
  
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>(FORMULAS.map(f => f.id));
  const [result, setResult] = useState<ExtendedPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerMsg, setOptimizerMsg] = useState('');
  
  const [selectedGame, setSelectedGame] = useState<'FD' | 'GB' | 'GL' | 'DS'>('FD');
  const [copied, setCopied] = useState(false);
  const [logged, setLogged] = useState(false);

  const ledger = useMemo(() => calculateLedger(), []);

  useEffect(() => {
    if (inputMode === 'auto') {
      const allResults = getAllResultsSorted();
      if (allResults.length > 0) {
        const latest = allResults[0];
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

  const handleBacktest = () => {
    setIsOptimizing(true);
    setOptimizerMsg('');
    setTimeout(() => {
      const pastResults = getAllResultsSorted();
      const testDays = pastResults.slice(0, 30);
      
      if (testDays.length === 0) {
        setOptimizerMsg('बैकटेस्ट के लिए पर्याप्त डेटा नहीं है।');
        setIsOptimizing(false);
        return;
      }

      let passCount = 0;
      let totalTestDays = 0;

      const validTestDays = testDays.filter(d => d.fd || d.gb || d.gl || d.ds).slice(0, 30);

      validTestDays.forEach((targetDay) => {
        const idxInAll = pastResults.findIndex(r => r.date === targetDay.date);
        if (idxInAll === -1) return;

        const historicalPast = pastResults.slice(idxInAll + 1);
        if (historicalPast.length === 0) return;

        const histMurda: string[] = [];
        historicalPast.slice(0, 3).forEach(r => {
          if (r.fd) histMurda.push(r.fd); if (r.gb) histMurda.push(r.gb);
          if (r.gl) histMurda.push(r.gl); if (r.ds) histMurda.push(r.ds);
        });

        const histYm = targetDay.date.substring(0, 7);
        const histMonthNums: string[] = [];
        historicalPast.filter(r => r.date.startsWith(histYm)).forEach(r => {
          if (r.fd) histMonthNums.push(r.fd); if (r.gb) histMonthNums.push(r.gb);
          if (r.gl) histMonthNums.push(r.gl); if (r.ds) histMonthNums.push(r.ds);
        });

        const histTodaysRes: string[] = [];
        if (historicalPast[0]) {
          if (historicalPast[0].ds) histTodaysRes.push(historicalPast[0].ds);
          if (historicalPast[0].gl) histTodaysRes.push(historicalPast[0].gl);
          if (historicalPast[0].gb) histTodaysRes.push(historicalPast[0].gb);
          if (historicalPast[0].fd) histTodaysRes.push(historicalPast[0].fd);
        }

        const hist20Days: string[] = [];
        historicalPast.slice(0, 20).forEach(r => {
          if (r.fd) hist20Days.push(r.fd); if (r.gb) hist20Days.push(r.gb);
          if (r.gl) hist20Days.push(r.gl); if (r.ds) hist20Days.push(r.ds);
        });

        const dummyInputs = { date: targetDay.date, fd: '', gb: '', gl: '', ds: '' };
        
        const res = calculatePrediction(
          dummyInputs, selectedFormulas, histMurda, histMonthNums,
          histTodaysRes, [], [], hist20Days, isProMode, historicalPast
        );

        const final30 = [...res.l1, ...res.l2, ...res.l3];
        const hasPass = [targetDay.fd, targetDay.gb, targetDay.gl, targetDay.ds].some(v => v && final30.includes(v));

        if (hasPass) passCount++;
        totalTestDays++;
      });

      if (totalTestDays > 0) {
        const pct = Math.round((passCount / totalTestDays) * 100);
        setOptimizerMsg(`चुने गए फॉर्मूलों ने पिछले 30 दिनों में ${passCount} दिन (${pct}%) पासिंग दी है!`);
      }
      setIsOptimizing(false);
    }, 600);
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setResult(null);
    setCopied(false);
    setLogged(false);
    setOptimizerMsg('');

    setTimeout(() => {
      const pastResults = getAllResultsSorted();
      const pastResultsForCalc = pastResults.filter(r => new Date(r.date) < new Date(inputs.date)).slice(0, 30);
      
      const pastMurda: string[] = [];
      pastResultsForCalc.slice(0, 3).forEach(r => {
        if (r.fd) pastMurda.push(r.fd); if (r.gb) pastMurda.push(r.gb);
        if (r.gl) pastMurda.push(r.gl); if (r.ds) pastMurda.push(r.ds);
      });

      const currentYm = inputs.date.substring(0, 7);
      const currentMonthNums: string[] = [];
      pastResults.filter(r => r.date.startsWith(currentYm)).forEach(r => {
        if (r.fd) currentMonthNums.push(r.fd); if (r.gb) currentMonthNums.push(r.gb);
        if (r.gl) currentMonthNums.push(r.gl); if (r.ds) currentMonthNums.push(r.ds);
      });

      const todaysRes: string[] = [];
      const userInputs = [inputs.ds, inputs.gl, inputs.gb, inputs.fd].filter(v => v !== '');
      todaysRes.push(...userInputs);

      if (todaysRes.length < 4) {
        const allPastNums: string[] = [];
        pastResults.forEach(r => {
          if (r.ds) allPastNums.push(r.ds); if (r.gl) allPastNums.push(r.gl);
          if (r.gb) allPastNums.push(r.gb); if (r.fd) allPastNums.push(r.fd);
        });
        for (let i = 0; i < allPastNums.length && todaysRes.length < 4; i++) {
          todaysRes.push(allPastNums[i]);
        }
      }

      const past20DaysNums: string[] = [];
      pastResultsForCalc.slice(0, 20).forEach(r => {
        if (r.fd) past20DaysNums.push(r.fd); if (r.gb) past20DaysNums.push(r.gb);
        if (r.gl) past20DaysNums.push(r.gl); if (r.ds) past20DaysNums.push(r.ds);
      });

      const getTargetDates = (baseDateStr: string, monthsBack: number) => {
        const [y, m, d] = baseDateStr.split('-').map(Number);
        const dates: string[] = [];
        for (let i = 0; i < 3; i++) {
          const dateObj = new Date(y, m - 1 - monthsBack, d - i);
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          dates.push(`${yyyy}-${mm}-${dd}`);
        }
        return dates;
      };

      const m1Dates = getTargetDates(inputs.date, 1);
      const m2Dates = getTargetDates(inputs.date, 2);

      const pastMonth1Nums: string[] = [];
      const pastMonth2Nums: string[] = [];

      pastResults.forEach(r => {
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
        todaysRes.slice(0, 4), pastMonth1Nums, pastMonth2Nums, past20DaysNums, isProMode, pastResultsForCalc
      );
      
      const userRole = sessionStorage.getItem('sahil_master_current_role') || 'guest';
      const isGuestUser = userRole !== 'admin' && userRole !== 'user';
      
      if (isGuestUser) {
        res = {
          l1: ['01', '02', '03', '04'],
          l2: ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],
          l3: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
          tokari: [],
          alerts: []
        };
      }

      const final30Jodis = [...res.l1, ...res.l2, ...res.l3];
      localStorage.setItem("lastPrediction", JSON.stringify(final30Jodis));

      setResult(res);
      setIsPredicting(false);
    }, 800);
  };

  const allJodis = result ? [...result.l1, ...result.l2, ...result.l3] : [];
  const currentRate = ledger.currentRates[selectedGame];
  const totalAmount = allJodis.length * currentRate;

  const copyToClipboard = () => {
    const text = `📅 Date: ${inputs.date}\n🎯 Game: ${selectedGame}\n🎲 Jodis (${allJodis.length}):\n${allJodis.join(', ')}\n\n💰 Rate: ${currentRate} Into\n💵 Total: ₹${totalAmount}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogToTracker = () => {
    saveTrackerEntry({ id: inputs.date, date: inputs.date, isPlay: true, passLocation: 'PENDING' });
    setLogged(true);
    setTimeout(() => setLogged(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-teal-400">आज की प्रेडिक्शन</h1>
        <button 
          onClick={() => setIsProMode(!isProMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            isProMode 
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' 
              : 'bg-green-500/10 text-green-400 border-green-500/30'
          }`}
        >
          {isProMode ? <Flame className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          {isProMode ? 'Pro Mode' : 'Safe Mode'}
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-6 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">नंबर दर्ज करें</h2>
          <div className="flex bg-[#0B1120] rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setInputMode('auto')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${inputMode === 'auto' ? 'bg-teal-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              ऑटो (पिछला)
            </button>
            <button 
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${inputMode === 'manual' ? 'bg-teal-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}
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
            className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-colors"
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
                    ? 'bg-slate-800/50 border-slate-700 text-slate-400' 
                    : 'bg-[#0B1120] border-slate-800 focus:border-teal-400 focus:ring-1 focus:ring-teal-400'
                }`}
              />
            </div>
          ))}
        </div>
        
        {inputMode === 'auto' && (
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> लेटेस्ट रिजल्ट से डेटा ऑटो-फेच किया गया है।
          </div>
        )}
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-5 shadow-md">
        <div className="flex items-center justify-between">
           <h2 className="text-white font-semibold">फॉर्मूला चुनें</h2>
           <button 
             onClick={handleBacktest}
             disabled={isOptimizing}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] rounded-lg text-xs font-medium text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
           >
             <BarChart2 className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-pulse text-teal-400' : ''}`} />
             {isOptimizing ? 'टेस्टिंग...' : 'बैकटेस्ट'}
           </button>
        </div>
        
        {optimizerMsg && (
          <div className="bg-teal-400/10 border border-teal-400/30 text-teal-300 text-sm p-3 rounded-lg flex items-center justify-center text-center font-medium animate-in fade-in">
            {optimizerMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {FORMULAS.map(formula => {
            const isSelected = selectedFormulas.includes(formula.id);
            return (
              <button 
                key={formula.id}
                onClick={() => toggleFormula(formula.id)}
                className="flex items-center space-x-3 text-left"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected ? 'bg-teal-400 border-teal-400' : 'border-slate-600'
                }`}>
                  <Check className={`w-3 h-3 text-slate-900 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className="text-sm text-slate-200">{formula.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button 
        onClick={handlePredict}
        disabled={isPredicting || !inputs.fd || !inputs.gb || !inputs.gl || !inputs.ds}
        className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className={`w-5 h-5 ${isPredicting ? 'animate-pulse' : ''}`} />
        <span>{isPredicting ? 'प्रेडिक्शन निकालें' : 'प्रेडिक्शन निकालें'}</span>
      </button>

      {result && (
        <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-teal-400 text-center">प्रेडिक्शन का रिजल्ट</h2>

          {/* 🔴 Dana/Gap Scanner Alert Box 🔴 */}
          {result.alerts && result.alerts.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 shadow-lg">
              {result.alerts.map((alert, i) => (
                <p key={i} className="text-orange-400 font-bold text-[15px] text-center animate-pulse drop-shadow-md">
                  {alert}
                </p>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-b from-[#374151] to-[#111827] border border-slate-700 rounded-2xl p-5 shadow-xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-400" />
              प्ले ऑप्शन और शेयर
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-[#0B1120] rounded-xl overflow-hidden">
                {(['FD', 'GB', 'GL', 'DS'] as const).map(game => (
                  <button
                    key={game}
                    onClick={() => setSelectedGame(game)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                      selectedGame === game 
                        ? 'bg-teal-400 text-slate-900' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>

              <div className="bg-[#0B1120] rounded-xl p-4 border border-slate-800 text-center font-mono">
                <div className="text-slate-400 text-sm mb-1">{selectedGame} प्ले इन्फो</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {currentRate} <span className="text-sm font-normal text-slate-500">Into</span>
                </div>
                <div className="text-teal-400 font-medium">कुल: ₹{totalAmount}</div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-[#1F2937] hover:bg-[#374151] border border-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'कॉपी हो गया!' : 'खाईवाल के लिए कॉपी करें'}
                </button>

                <button 
                  onClick={handleLogToTracker}
                  className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    logged 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : 'bg-teal-400/10 hover:bg-teal-400/20 text-teal-400 border border-teal-400/30'
                  }`}
                >
                  {logged ? <Check className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  {logged ? 'ट्रैकर में सेव हो गया!' : 'ट्रैकर में प्ले कन्फर्म करें'}
                </button>
              </div>
            </div>
          </div>

          <div className="border border-green-500/30 rounded-2xl overflow-hidden bg-[#111827]">
            <div className="bg-green-500/10 px-4 py-3 border-b border-green-500/20">
              <h3 className="text-green-500 font-medium">L1 - सुपर VIP ({result.l1.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l1.map((num, i) => (
                <div key={i} className="bg-green-500/20 text-green-400 font-mono text-lg px-3 py-2 rounded-lg border border-green-500/30">
                  {num}
                </div>
              ))}
              {result.l1.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          <div className="border border-blue-500/30 rounded-2xl overflow-hidden bg-[#111827]">
            <div className="bg-blue-500/10 px-4 py-3 border-b border-blue-500/20">
              <h3 className="text-blue-500 font-medium">L2 - मेन ({result.l2.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l2.map((num, i) => (
                <div key={i} className="bg-blue-500/20 text-blue-400 font-mono text-lg px-3 py-2 rounded-lg border border-blue-500/30">
                  {num}
                </div>
              ))}
              {result.l2.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          <div className="border border-teal-400/30 rounded-2xl overflow-hidden bg-[#111827]">
            <div className="bg-teal-400/10 px-4 py-3 border-b border-teal-400/20">
              <h3 className="text-teal-400 font-medium">L3 - सपोर्ट ({result.l3.length} जोड़ी)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {result.l3.map((num, i) => (
                <div key={i} className="bg-teal-400/20 text-teal-300 font-mono text-lg px-3 py-2 rounded-lg border border-teal-400/30">
                  {num}
                </div>
              ))}
              {result.l3.length === 0 && <p className="text-slate-500 text-sm">कोई नंबर नहीं</p>}
            </div>
          </div>

          {result.tokari && result.tokari.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">टोकरी काउंट्स</h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {result.tokari.map((item, i) => (
                  <div key={i} className="bg-[#374151] rounded-lg p-2 flex flex-col items-center justify-center border border-slate-700/50">
                    <div className="text-white font-mono font-medium text-sm md:text-base">
                      {item.id}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
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
