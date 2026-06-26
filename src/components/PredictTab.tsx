import React, { useState } from 'react';
import { Calendar, Settings, Play, Beaker, CheckCircle2 } from 'lucide-react';
import { PredictionInput, PredictionResult } from '../types';
import { calculatePrediction } from '../utils/formulas';

export default function PredictTab() {
  const [inputs, setInputs] = useState<PredictionInput>({
    date: new Date().toISOString().split('T')[0],
    fd: '',
    gb: '',
    gl: '',
    ds: ''
  });

  const [useAdvanced, setUseAdvanced] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate calculation delay for effect
    setTimeout(() => {
      // In a real app, we would fetch history blocks here based on inputs
      const historyBlocks: string[][] = [
        ['12', '34', '56', '78'], // Mock history for testing
        ['90', '12', '34', '56']
      ];
      
      const prediction = calculatePrediction(
        inputs,
        [], // Formulas selected
        [inputs.fd, inputs.gb, inputs.gl, inputs.ds], // Today's results
        ['11', '22', '33'], // Past murda 
        ['45', '67'], // Current month nums
        historyBlocks,
        useAdvanced
      );
      
      setResult(prediction);
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-[#13151E] p-5 border-b border-slate-800/60 sticky top-0 z-10 shadow-lg shadow-black/20">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400/10 rounded-lg flex items-center justify-center">
            <Beaker className="w-5 h-5 text-teal-400" />
          </div>
          Prediction Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">Advanced algorithm for L1, L2, L3 generation</p>
      </div>

      <div className="px-4 space-y-6">
        {/* Date Selection */}
        <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            Prediction Date
          </label>
          <input
            type="date"
            value={inputs.date}
            onChange={(e) => setInputs({ ...inputs, date: e.target.value })}
            className="w-full bg-[#13151E] border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all"
          />
        </div>

        {/* Input Results */}
        <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">Previous Day Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider">FD RESULT</label>
              <input
                type="number"
                value={inputs.fd}
                onChange={(e) => setInputs({ ...inputs, fd: e.target.value })}
                placeholder="00"
                className="w-full bg-[#13151E] border border-slate-700 rounded-xl p-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all placeholder:text-slate-600 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider">GB RESULT</label>
              <input
                type="number"
                value={inputs.gb}
                onChange={(e) => setInputs({ ...inputs, gb: e.target.value })}
                placeholder="00"
                className="w-full bg-[#13151E] border border-slate-700 rounded-xl p-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all placeholder:text-slate-600 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider">GL RESULT</label>
              <input
                type="number"
                value={inputs.gl}
                onChange={(e) => setInputs({ ...inputs, gl: e.target.value })}
                placeholder="00"
                className="w-full bg-[#13151E] border border-slate-700 rounded-xl p-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all placeholder:text-slate-600 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider">DS RESULT</label>
              <input
                type="number"
                value={inputs.ds}
                onChange={(e) => setInputs({ ...inputs, ds: e.target.value })}
                placeholder="00"
                className="w-full bg-[#13151E] border border-slate-700 rounded-xl p-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all placeholder:text-slate-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Engine Settings */}
        <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              Advanced Scan
            </h3>
            <p className="text-xs text-slate-500 mt-1">Include deep historical patterns</p>
          </div>
          <button
            onClick={() => setUseAdvanced(!useAdvanced)}
            className={`w-12 h-6 rounded-full transition-colors relative ${useAdvanced ? 'bg-teal-400' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${useAdvanced ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isCalculating ? (
            <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span className="text-lg">Generate Output</span>
            </>
          )}
        </button>

        {/* Results Area */}
        {result && (
          <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Tokari Counts */}
            <div className="bg-[#1C1F2D] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center">
                  <span className="text-purple-400 text-xs">📊</span>
                </div>
                टोकरी काउंट्स (Base Points)
              </h3>
              {result.tokari && result.tokari.length > 0 ? (
                <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {result.tokari.map((t, idx) => (
                    <div key={idx} className="bg-[#13151E] border border-slate-800 rounded-xl p-3 min-w-[70px] flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xl font-bold text-white font-mono relative z-10">{t.id}</span>
                      <span className="text-xs text-purple-400 font-medium relative z-10 mt-1 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {t.count}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  कोई टोकरी डेटा नहीं
                </div>
              )}
            </div>

            <div className="bg-[#1C1F2D] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-red-500/20 to-transparent p-4 border-b border-red-500/20">
                <h3 className="text-red-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  L1 - सुपर VIP (4 जोड़ी)
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-3">
                  {result.l1.map((num, i) => (
                    <div key={i} className="aspect-square bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-500/20 font-mono">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1C1F2D] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-blue-500/20 to-transparent p-4 border-b border-blue-500/20">
                <h3 className="text-blue-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  L2 - मेन (10 जोड़ी)
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-5 gap-3">
                  {result.l2.map((num, i) => (
                    <div key={i} className="aspect-square bg-[#13151E] border border-blue-500/30 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-inner font-mono">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1C1F2D] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-teal-500/10 to-transparent p-4 border-b border-teal-500/10">
                <h3 className="text-teal-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  L3 - सपोर्ट (16 जोड़ी)
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-5 gap-2">
                  {result.l3.map((num, i) => (
                    <div key={i} className="aspect-square bg-[#13151E] border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 text-lg font-medium font-mono hover:border-teal-500/30 transition-colors">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                const text = `Sahil Bhai Prediction\n\nL1 (Super VIP): ${result.l1.join(', ')}\nL2 (Main): ${result.l2.join(', ')}\nL3 (Support): ${result.l3.join(', ')}`;
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
              }}
              className="w-full py-3 bg-[#13151E] border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              Copy Slip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
