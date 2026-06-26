import React, { useState } from 'react';
import { Settings, Play, ShieldAlert, Sparkles, AlertTriangle, ChevronDown, Check, Crosshair } from 'lucide-react';
import { PredictionInput, PredictionResult } from '../types';
import { calculatePrediction } from '../utils/formulas';

export default function PredictTab() {
  const [inputs, setInputs] = useState<PredictionInput>({
    date: new Date().toISOString().split('T')[0],
    fd: '',
    gb: '',
    gl: '',
    ds: '',
    budget: '',
    targetMarket: 'FD'
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([
    'master', 'family', 'murda', 'magic', 'joda'
  ]);
  const [showFormulas, setShowFormulas] = useState(false);

  const formulas = [
    { id: 'master', name: 'Master Sheet (100%)', type: 'base' },
    { id: 'family', name: 'Family Scanner', type: 'core' },
    { id: 'murda', name: 'Murda Gap Trap', type: 'core' },
    { id: 'magic', name: 'Magic 4 Jodi', type: 'special' },
    { id: 'joda', name: 'Cut Joda/Murda', type: 'filter' },
    { id: 'haruf', name: 'Haruf Bonus (+5)', type: 'bonus' },
    { id: 'month', name: 'Cross-Month P.', type: 'advanced' },
    { id: 'operator', name: 'Operator Trap', type: 'advanced' },
  ];

  const toggleFormula = (id: string) => {
    setSelectedFormulas(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handlePredict = () => {
    setIsCalculating(true);
    setResult(null);
    
    // Simulate complex calculation delay
    setTimeout(() => {
      const historyBlocks: string[][] = []; // In a real app, this would be actual history
      
      const prediction = calculatePrediction(
        inputs,
        selectedFormulas,
        [inputs.fd, inputs.gb, inputs.gl, inputs.ds],
        [], // past murda
        [], // current month nums
        historyBlocks,
        useAdvanced
      );
      
      setResult(prediction);
      setIsCalculating(false);
    }, 1500);
  };

  const isFormValid = inputs.date && inputs.targetMarket && 
                      (inputs.fd || inputs.gb || inputs.gl || inputs.ds);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          AI प्रेडिक्शन इंजन
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFormulas(!showFormulas)}
            className={`p-2 rounded-xl border transition-all ${
              showFormulas 
                ? 'bg-teal-400/20 border-teal-400/50 text-teal-400' 
                : 'bg-[#1C1F2D] border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-slate-800 space-y-5 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 ml-1">तारीख (Date)</label>
            <input
              type="date"
              value={inputs.date}
              onChange={(e) => setInputs({ ...inputs, date: e.target.value })}
              className="w-full bg-[#13151E] border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 ml-1">मार्केट (Target)</label>
            <select
              value={inputs.targetMarket}
              onChange={(e) => setInputs({ ...inputs, targetMarket: e.target.value })}
              className="w-full bg-[#13151E] border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all appearance-none"
            >
              <option value="FD">Faridabad (FD)</option>
              <option value="GB">Ghaziabad (GB)</option>
              <option value="GL">Gali (GL)</option>
              <option value="DS">Desawar (DS)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <label className="text-xs font-medium text-slate-400 ml-1 flex items-center justify-between">
            <span>पुराने रिजल्ट्स (पिछला दिन / लाइव)</span>
            <span className="text-[10px] text-teal-400/80 bg-teal-400/10 px-2 py-0.5 rounded-full">कम से कम 1 डालें</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'fd', label: 'FD' },
              { id: 'gb', label: 'GB' },
              { id: 'gl', label: 'GL' },
              { id: 'ds', label: 'DS' }
            ].map((mkt) => (
              <div key={mkt.id} className="relative group">
                <input
                  type="number"
                  placeholder={mkt.label}
                  value={inputs[mkt.id as keyof PredictionInput]}
                  onChange={(e) => setInputs({ ...inputs, [mkt.id]: e.target.value })}
                  className="w-full bg-[#13151E] border border-slate-700 rounded-xl px-2 py-3 text-center text-white font-mono focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all text-sm placeholder-slate-600"
                />
                {inputs[mkt.id as keyof PredictionInput] && (
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-400 rounded-full border-2 border-[#1C1F2D]"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulas Panel */}
      {showFormulas && (
        <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-slate-800 shadow-lg animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-teal-400" />
              एक्टिव फॉर्मूले
            </h3>
            <span className="text-xs text-slate-400 bg-[#13151E] px-2 py-1 rounded-lg border border-slate-800">
              {selectedFormulas.length} Selected
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {formulas.map(f => {
              const isSelected = selectedFormulas.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFormula(f.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-teal-400/10 border-teal-400/30 text-white' 
                      : 'bg-[#13151E] border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-teal-400 text-slate-900' : 'bg-slate-800 border border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium leading-none">{f.name}</span>
                    <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{f.type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        disabled={!isFormValid || isCalculating}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
          !isFormValid 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
            : isCalculating
              ? 'bg-teal-400/80 text-slate-900 cursor-wait'
              : 'bg-teal-400 hover:bg-teal-300 text-slate-900 active:scale-[0.98]'
        }`}
      >
        {isCalculating ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            सिस्टम कैलकुलेट कर रहा है...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" fill="currentColor" />
            प्रेडिक्शन रन करें (30 जोड़ी)
          </>
        )}
      </button>

      {/* Results Section */}
      {result && !isCalculating && (
        <div className="space-y-4 animate-slide-up mt-8">
          
          {/* L1 - VIP */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 rounded-2xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles className="w-24 h-24 text-amber-500" />
            </div>
            <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2 relative z-10">
              L1 - सुपर VIP (4 जोड़ी)
            </h3>
            <div className="grid grid-cols-4 gap-3 relative z-10">
              {result.l1.map((num, i) => (
                <div key={i} className="bg-[#1C1F2D] border border-amber-500/40 text-white font-mono text-lg font-bold text-center py-3 rounded-xl shadow-inner">
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* L2 - Main */}
          <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
              L2 - मेन (10 जोड़ी)
            </h3>
            <div className="grid grid-cols-5 gap-2 relative z-10">
              {result.l2.map((num, i) => (
                <div key={i} className="bg-[#13151E] border border-slate-700 text-slate-300 font-mono text-center py-2.5 rounded-xl text-sm">
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* L3 - Support */}
          <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-teal-500/20 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2">
              L3 - सपोर्ट (16 जोड़ी)
            </h3>
            <div className="grid grid-cols-5 gap-2 relative z-10">
              {result.l3.map((num, i) => (
                <div key={i} className="bg-[#13151E] border border-slate-800 text-slate-400 font-mono text-center py-2 rounded-lg text-sm">
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Tokari Counts (As requested) */}
          <div className="bg-[#1C1F2D] p-5 rounded-2xl border border-slate-800 shadow-lg mt-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              टोकरी काउंट्स
            </h3>
            <div className="flex flex-wrap gap-3">
              {result.tokari.map((t, i) => (
                <div key={i} className="bg-[#13151E] flex flex-col items-center justify-center border border-slate-700 py-2 px-4 rounded-xl min-w-[60px]">
                  <span className="text-white font-mono text-base">{t.id}</span>
                  <span className="text-slate-500 text-[10px] font-bold tracking-wider">{t.count}x</span>
                </div>
              ))}
              {result.tokari.length === 0 && (
                <p className="text-slate-500 text-sm">कोई टोकरी डेटा नहीं मिला।</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
