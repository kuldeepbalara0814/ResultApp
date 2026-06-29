import React, { useState, useEffect } from 'react';

// Purane Components Import
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import PredictTab from './components/PredictTab';
import ResultTab from './components/ResultTab';
import RecordsTab from './components/RecordsTab';
import TrackerTab from './components/TrackerTab';
import LoginScreen from './components/LoginScreen';

// Naye Components Import
import KhaiwalTab from './components/KhaiwalTab';
import MembershipTab from './components/MembershipTab';

import { logoutUser } from './utils/auth';
// 👇 यहाँ हमने आपका नया लाइव सिंक फंक्शन इम्पोर्ट किया है
import { setupLiveSync } from './utils/storage'; 

// 👇 यह लाइन ठीक कर दी गई है (अब यह सही जगह से फाइल उठाएगा)
import StrategyCalculator from './components/StrategyCalculator';

// --- टारगेट और ग्राफ लाइन (Target Trend Bar) ---
const TargetTracker = () => {
    const [progress, setProgress] = useState(50);
    const [status, setStatus] = useState("बेस लेवल (शुरुआत)");
    const [isProfit, setIsProfit] = useState(true);

    // लाइव अपडेट को पकड़ने के लिए इसे भी रिफ्रेश करने का लॉजिक
    const calculateTrend = () => {
        try {
            const history = JSON.parse(localStorage.getItem('sahil_master_tracker_v3') || '[]');
            const wins = history.filter((h: any) => h.status === 'pass').length;
            const losses = history.filter((h: any) => h.status === 'fail').length;

            if (wins === 0 && losses === 0) {
                setProgress(50);
                setStatus("बेस लेवल (शुरुआत)");
                setIsProfit(true);
            } else if (wins > losses) {
                setProgress(Math.min(100, 50 + (wins - losses) * 10)); 
                setStatus("टारगेट से ऊपर (Profit 🚀)");
                setIsProfit(true);
            } else {
                setProgress(Math.max(10, 50 - (losses - wins) * 10)); 
                setStatus("रिकवरी मोड (Loss 📉)");
                setIsProfit(false);
            }
        } catch (e) {
            console.log("Trend calculation error");
        }
    };

    useEffect(() => {
        calculateTrend();
        // फायरबेस के लाइव अपडेट पर ग्राफ को भी तुरंत बदलने का लिसनर
        window.addEventListener('firebase-data-updated', calculateTrend);
        return () => window.removeEventListener('firebase-data-updated', calculateTrend);
    }, []);

    return (
        <div className="bg-[#131C31] px-4 py-3 border-b border-gray-800">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">TARGET TREND LINE</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isProfit ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'}`}>
                    {status}
                </span>
            </div>
            <div className="w-full bg-[#0B1120] rounded-full h-2 overflow-hidden border border-gray-800 shadow-inner">
                <div
                    className={`h-2 rounded-full transition-all duration-1000 ${isProfit ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

// --- डायरी (Diary) कम्पोनेंट ---
const DiaryTab = () => {
    const [notes, setNotes] = useState(localStorage.getItem('diary_notes') || '');
    const saveNotes = (e: any) => {
        setNotes(e.target.value);
        localStorage.setItem('diary_notes', e.target.value);
    };
    return (
        <div className="p-4 mb-24 animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-4">डायरी (Notes)</h2>
            <textarea
                value={notes}
                onChange={saveNotes}
                placeholder="अपनी रोज़ की रणनीति, पेंडिंग हिसाब या कल की प्लानिंग यहाँ लिखें..."
                className="w-full h-96 bg-[#131C31] text-teal-400 p-4 rounded-xl border border-gray-700 focus:outline-none focus:border-teal-500 font-mono resize-none shadow-inner"
            />
        </div>
    );
};

// --- कैलकुलेटर (Calculator) कम्पोनेंट ---
const CalculatorTab = () => {
    const [calc, setCalc] = useState("");
    const [result, setResult] = useState("");
    const ops = ['/', '*', '+', '-', '.'];

    const updateCalc = (value: string) => {
        if ((ops.includes(value) && calc === '') || (ops.includes(value) && ops.includes(calc.slice(-1)))) return;
        setCalc(calc + value);
        if (!ops.includes(value)) {
            try { setResult(eval(calc + value).toString()); } catch(e) {}
        }
    };
    const calculate = () => {
        try { setCalc(eval(calc).toString()); setResult(''); } catch(e) { setResult('Error'); }
    };
    const deleteLast = () => {
        if (calc === '') return;
        const value = calc.slice(0, -1);
        setCalc(value);
        try { if (value === '' || ops.includes(value.slice(-1))) { setResult(''); } else { setResult(eval(value).toString()); } } catch(e) {}
    };
    const clearAll = () => { setCalc(''); setResult(''); };

    return (
        <div className="p-4 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-bold text-white mb-4">कैलकुलेटर</h2>
            <div className="bg-[#131C31] p-4 rounded-3xl border border-gray-700 shadow-xl">
                <div className="bg-[#0B1120] p-4 rounded-2xl mb-4 text-right overflow-x-auto h-24 flex flex-col justify-end border border-gray-800">
                    <div className="text-gray-400 text-sm h-5">{result ? `=${result}` : ''}</div>
                    <div className="text-3xl font-bold text-teal-400 tracking-wider">{calc || '0'}</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    <button onClick={clearAll} className="col-span-2 bg-red-500/10 text-red-400 p-4 rounded-2xl font-bold hover:bg-red-500/20 transition-all active:scale-95">C</button>
                    <button onClick={deleteLast} className="bg-orange-500/10 text-orange-400 p-4 rounded-2xl font-bold hover:bg-orange-500/20 transition-all active:scale-95">DEL</button>
                    <button onClick={() => updateCalc('/')} className="bg-teal-500/10 text-teal-400 p-4 rounded-2xl font-bold hover:bg-teal-500/20 transition-all active:scale-95">÷</button>
                    {[7,8,9].map(num => <button key={num} onClick={() => updateCalc(num.toString())} className="bg-[#1E293B] text-white p-4 rounded-2xl font-bold hover:bg-[#2A3B52] transition-all active:scale-95 shadow-sm">{num}</button>)}
                    <button onClick={() => updateCalc('*')} className="bg-teal-500/10 text-teal-400 p-4 rounded-2xl font-bold hover:bg-teal-500/20 transition-all active:scale-95">×</button>
                    {[4,5,6].map(num => <button key={num} onClick={() => updateCalc(num.toString())} className="bg-[#1E293B] text-white p-4 rounded-2xl font-bold hover:bg-[#2A3B52] transition-all active:scale-95 shadow-sm">{num}</button>)}
                    <button onClick={() => updateCalc('-')} className="bg-teal-500/10 text-teal-400 p-4 rounded-2xl font-bold hover:bg-teal-500/20 transition-all active:scale-95">-</button>
                    {[1,2,3].map(num => <button key={num} onClick={() => updateCalc(num.toString())} className="bg-[#1E293B] text-white p-4 rounded-2xl font-bold hover:bg-[#2A3B52] transition-all active:scale-95 shadow-sm">{num}</button>)}
                    <button onClick={() => updateCalc('+')} className="bg-teal-500/10 text-teal-400 p-4 rounded-2xl font-bold hover:bg-teal-500/20 transition-all active:scale-95">+</button>
                    <button onClick={() => updateCalc('.')} className="bg-[#1E293B] text-white p-4 rounded-2xl font-bold hover:bg-[#2A3B52] transition-all active:scale-95">.</button>
                    <button onClick={() => updateCalc('0')} className="bg-[#1E293B] text-white p-4 rounded-2xl font-bold hover:bg-[#2A3B52] transition-all active:scale-95">0</button>
                    <button onClick={calculate} className="col-span-2 bg-teal-500 text-white p-4 rounded-2xl font-bold hover:bg-teal-600 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all active:scale-95">=</button>
                </div>
            </div>
        </div>
    );
};

// --- मुख्य App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [nextGame, setNextGame] = useState({ name: 'LOAD...', time: '00:00:00' });

  // 👇 यहाँ हमने फायरबेस लाइव सिंक को चालू कर दिया है
  useEffect(() => {
    // ऐप खुलते ही फायरबेस से रियल-टाइम कनेक्शन बन जाएगा
    setupLiveSync();
  }, []);

  // PWA Install Logic
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setDeferredPrompt(null);
        });
    }
  };

  // Live Timer Logic
  useEffect(() => {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
        const now = new Date();
        const currentTotalSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        
        const games = [
            { name: 'GL/DS', s: (1 * 3600) + (40 * 60) }, 
            { name: 'FD', s: (17 * 3600) + (20 * 60) },   
            { name: 'GB', s: (21 * 3600) + (20 * 60) }    
        ];

        let found = false;
        for (let game of games) {
            if (currentTotalSeconds < game.s) {
                setNextGame({ name: game.name, time: formatTime(game.s - currentTotalSeconds) });
                found = true;
                break;
            }
        }
        if (!found) {
            const nextDayGLDS = (24 * 3600) + (1 * 3600) + (40 * 60); 
            setNextGame({ name: 'GL/DS', time: formatTime(nextDayGLDS - currentTotalSeconds) });
        }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('is_auth');
    if (sessionAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-teal-400/30 flex justify-center relative overflow-hidden">
      
      {/* एनिमेटेड बैकग्राउंड (हल्की चमक) */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 via-[#0B1120] to-blue-900/10 animate-pulse pointer-events-none"></div>

      <div className="w-full max-w-md relative min-h-screen bg-[#0B1120]/95 backdrop-blur-sm shadow-2xl flex flex-col border-x border-gray-900/50">
        
        {/* === TOP HEADER PANEL === */}
        <div className="bg-[#131C31] px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
            {/* Live Watch */}
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest">{nextGame.name} CLOSING IN</span>
                    <span className="text-teal-400 font-bold font-mono text-sm">{nextGame.time}</span>
                </div>
            </div>

            {/* Top Navigation Icons */}
            <div className="flex items-center gap-2">
                {/* 👇 नया लेज़र कैलकुलेटर आइकॉन */}
                <button onClick={() => setActiveTab('strategy')} className={`p-2 rounded-xl transition-all duration-300 ${activeTab==='strategy' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'bg-[#1E293B] text-slate-400 hover:text-white hover:bg-[#2A3B52]'}`} title="Ledger Strategy">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
                
                {deferredPrompt && (
                    <button onClick={handleInstallClick} className="bg-teal-500/10 text-teal-400 p-2 rounded-xl border border-teal-500/30 hover:bg-teal-500/30 transition-all hover:scale-105 active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                )}
                <button onClick={() => setActiveTab('calculator')} className={`p-2 rounded-xl transition-all duration-300 ${activeTab==='calculator' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105' : 'bg-[#1E293B] text-slate-400 hover:text-white hover:bg-[#2A3B52]'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </button>
                <button onClick={() => setActiveTab('diary')} className={`p-2 rounded-xl transition-all duration-300 ${activeTab==='diary' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105' : 'bg-[#1E293B] text-slate-400 hover:text-white hover:bg-[#2A3B52]'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </button>
            </div>
        </div>

        <TargetTracker />
        
        {/* Main Content Area - एनिमेशन के साथ */}
        <div className="overflow-y-auto flex-1 w-full pb-20 p-2 sm:p-4">
          <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Purane Tabs */}
            {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} onLogout={handleLogout} />}
            {activeTab === 'predict' && <PredictTab />}
            {activeTab === 'result' && <ResultTab />}
            {activeTab === 'records' && <RecordsTab setActiveTab={setActiveTab} />}
            {activeTab === 'tracker' && <TrackerTab />}
            {activeTab === 'khaiwal' && <KhaiwalTab />}
            {activeTab === 'membership' && <MembershipTab />}

            {/* Naye Tabs */}
            {activeTab === 'calculator' && <CalculatorTab />}
            {activeTab === 'diary' && <DiaryTab />}
            
            {/* 👇 नया स्ट्रेटेजी कैलकुलेटर टैब */}
            {activeTab === 'strategy' && <StrategyCalculator />}
          </div>
        </div>
        
        {/* Niche ka Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
