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
import AdminPanelTab from './components/AdminPanelTab';
import GeminiAssistantModal from './components/GeminiAssistantModal'; // ЁЯдЦ AI рдмреЛрдЯ

import { logoutUser } from './utils/auth';
import { setupLiveSync } from './utils/storage'; 
import StrategyCalculator from './components/StrategyCalculator';

// --- рдирдпрд╛ рд╡реЗрд▓рдХрдо рд╕реЗрдХреНрд╢рди (Welcome Mission Component) ---
const WelcomeSection = () => {
    return (
        <div className="bg-[#0b171e] p-5 rounded-3xl border border-[#008080]/40 shadow-[0_8px_20px_rgba(0,128,128,0.15)] text-center animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-[#00e6e6] mb-1 drop-shadow-[0_0_5px_rgba(0,230,230,0.4)] tracking-wide">
                рд╕рд╛рд╣рд┐рд▓ рдорд╛рд╕реНрдЯрд░ рд╕рд┐рд╕реНрдЯрдо
            </h2>
            <p className="text-[#e6007a] font-bold text-xs tracking-wider mb-4 uppercase">
                "рдЖрдкрдХрд╛ рдкреИрд╕рд╛, рдЖрдкрдХрд╛ CONTROL, рд╣рдорд╛рд░рд╛ рдбрд┐рд╕рд┐рдкреНрд▓рд┐рдиред"
            </p>
            
            <div className="w-full h-px bg-[#008080]/20 mb-4"></div>
            
            <div className="text-left text-slate-300 text-[13px] space-y-3.5 leading-relaxed">
                <p className="flex items-start gap-2">
                    <span className="text-base mt-0.5">ЁЯЫС</span>
                    <span>
                        <strong className="text-white">рд╣рдо рдХреЛрдИ рд╕рдЯреНрдЯрд╛ рдкреНрд▓реЗрдЯрдлреЙрд░реНрдо рдпрд╛ рд╡реЙрд▓реЗрдЯ рдирд╣реАрдВ рд╣реИрдВ:</strong> рдпрд╣рд╛рдБ рди рдХреЛрдИ UPI рдкреЗрдореЗрдВрдЯ рд╣реИ, рди рдХреЛрдИ OTPред рдЖрдкрдХрд╛ рдкреИрд╕рд╛ рдЖрдкрдХреЗ рдкрд╛рд╕, рдЖрдкрдХреЗ рдЦреБрдж рдХреЗ рдмреИрдВрдХ рдЦрд╛рддреЗ рдореЗрдВ рдкреВрд░реА рддрд░рд╣ рд╕реБрд░рдХреНрд╖рд┐рдд рд╣реИред
                    </span>
                </p>
                <p className="flex items-start gap-2">
                    <span className="text-base mt-0.5">тЪая╕П</span>
                    <span>
                        <strong className="text-white">рдСрдкрд░реЗрдЯрд░ рдХреЗ рдЬрд╛рд▓ рд╕реЗ рд╕реБрд░рдХреНрд╖рд╛:</strong> 1964 рд╕реЗ рдЪрд▓рд╛ рдЖ рд░рд╣рд╛ '10 рдХреЗ 900' рдХрд╛ рд▓рд╛рд▓рдЪ рдЖрдЬ AI рдСрдкрд░реЗрдЯрд░реЛрдВ рдХреЗ реЫрд░рд┐рдП рдЖрдкрдХреЛ рд▓реВрдЯ ╪▒█Б╪з рд╣реИред рдпрд╣ рд╕рд┐рд╕реНрдЯрдо рдЖрдкрдХреЛ 'рдЕрдореАрд░' рдмрдирд╛рдиреЗ рдХрд╛ рдЭреВрдард╛ рд▓рд╛рд▓рдЪ рдирд╣реАрдВ рджреЗрддрд╛, рдмрд▓реНрдХрд┐ рдЖрдкрдХреЛ <span className="text-[#e6007a] font-bold">"рд░реЛрдб рдкрд░ рдЖрдиреЗ" рд╕реЗ рдмрдЪрд╛рддрд╛ рд╣реИ</span>ред
                    </span>
                </p>
                <p className="flex items-start gap-2">
                    <span className="text-base mt-0.5">ЁЯдЭ</span>
                    <span>
                        <strong className="text-white">рдПрдХ рд╕рдЪреНрдЪреЗ рджреЛрд╕реНрдд рдХреА рддрд░рд╣ рдЕрдиреБрд╢рд╛рд╕рди:</strong> 20 рд╕рд╛рд▓ рдХреА рд░рд┐рд╕рд░реНрдЪ рд╕реЗ рдмрдирд╛ рдпрд╣ рдЯреВрд▓ рдЖрдкрдХреЛ рддрдм рдЦреЗрд▓рдиреЗ рд╕реЗ рд░реЛрдХреЗрдЧрд╛ (No Play) when рдЖрдкрдХреА рдореЗрд╣рдирдд рдХреА рдХрдорд╛рдИ рдЦрддрд░реЗ рдореЗрдВ рд╣реЛрдЧреАред
                    </span>
                </p>
            </div>
            
            <div className="w-full h-px bg-[#008080]/20 mt-4 mb-3"></div>
            <p className="text-[11px] text-slate-400 italic">
                "рдЬреБреЬрд┐рдпреЗ рдФрд░ рд╕рдЯреНрдЯреЗ рдХреЗ рдирд╢реЗ рдХреЛ рдореИрдиреЗрдЬрдореЗрдВрдЯ рдореЗрдВ рдмрджрд▓рд┐рдПред"
            </p>
        </div>
    );
};

// --- рдЯрд╛рд░рдЧреЗрдЯ рдФрд░ рдЧреНрд░рд╛рдл рд▓рд╛рдЗрди (Target Trend Bar) ---
const TargetTracker = () => {
    const [progress, setProgress] = useState(50);
    const [status, setStatus] = useState("рдмреЗрд╕ рд▓реЗрд╡рд▓ (рд╢реБрд░реБрдЖрдд)");
    const [isProfit, setIsProfit] = useState(true);

    const calculateTrend = () => {
        try {
            const history = JSON.parse(localStorage.getItem('sahil_master_tracker_v3') || '[]');
            const wins = history.filter((h: any) => h.status === 'pass').length;
            const losses = history.filter((h: any) => h.status === 'fail').length;

            if (wins === 0 && losses === 0) {
                setProgress(50);
                setStatus("рдмреЗрд╕ рд▓реЗрд╡рд▓ (рд╢реБрд░реБрдЖрдд)");
                setIsProfit(true);
            } else if (wins > losses) {
                setProgress(Math.min(100, 50 + (wins - losses) * 10)); 
                setStatus("рдЯрд╛рд░рдЧреЗрдЯ рд╕реЗ рдКрдкрд░ (Profit ЁЯЪА)");
                setIsProfit(true);
            } else {
                setProgress(Math.max(10, 50 - (losses - wins) * 10)); 
                setStatus("рд░рд┐рдХрд╡рд░реА рдореЛрдб (Loss ЁЯУЙ)");
                setIsProfit(false);
            }
        } catch (e) {
            console.log("Trend calculation error");
        }
    };

    useEffect(() => {
        calculateTrend();
        window.addEventListener('firebase-data-updated', calculateTrend);
        return () => window.removeEventListener('firebase-data-updated', calculateTrend);
    }, []);

    return (
        <div className="bg-[#0b171e] px-4 py-3 border-b border-[#008080]/30 shadow-lg shadow-[#008080]/5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-[#00e6e6] tracking-wider drop-shadow-[0_0_2px_rgba(0,230,230,0.5)]">TARGET TREND LINE</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isProfit ? 'bg-[#e6007a]/20 text-[#ff4d94]' : 'bg-red-500/20 text-red-400'}`}>
                    {status}
                </span>
            </div>
            <div className="w-full bg-[#051014] rounded-full h-2 overflow-hidden border border-[#008080]/40 shadow-inner">
                <div
                    className={`h-2 rounded-full transition-all duration-1000 ${isProfit ? 'bg-[#e6007a] shadow-[0_0_10px_rgba(230,0,122,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

// --- рдбрд╛рдпрд░реА (Diary) рдХрдореНрдкреЛрдиреЗрдВрдЯ ---
const DiaryTab = () => {
    const [notes, setNotes] = useState(localStorage.getItem('diary_notes') || '');
    const saveNotes = (e: any) => {
        setNotes(e.target.value);
        localStorage.setItem('diary_notes', e.target.value);
    };
    return (
        <div className="p-4 mb-24 animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-[0_0_5px_rgba(230,0,122,0.4)]">рдбрд╛рдпрд░реА (Notes)</h2>
            <textarea
                value={notes}
                onChange={saveNotes}
                placeholder="рдЕрдкрдиреА рд░реЛрдЬрд╝ рдХреА рд░рдгрдиреАрддрд┐, рдкреЗрдВрдбрд┐рдВрдЧ рд╣рд┐рд╕рд╛рдм рдпрд╛ рдХрд▓ рдХреА рдкреНрд▓рд╛рдирд┐рдВрдЧ рдпрд╣рд╛рдБ рд▓рд┐рдЦреЗрдВ..."
                className="w-full h-96 bg-[#0b171e] text-[#00e6e6] p-4 rounded-xl border border-[#008080]/40 focus:outline-none focus:border-[#e6007a] focus:ring-1 focus:ring-[#e6007a] font-mono resize-none shadow-inner transition-colors"
            />
        </div>
    );
};

// --- рдХреИрд▓рдХреБрд▓реЗрдЯрд░ (Calculator) рдХрдореНрдкреЛрдиреЗрдВрдЯ ---
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
            <h2 className="text-2xl font-bold text-[#e6007a] mb-4 drop-shadow-[0_0_5px_rgba(230,0,122,0.4)]">рдХреИрд▓рдХреБрд▓реЗрдЯрд░</h2>
            <div className="bg-[#0b171e] p-4 rounded-3xl border border-[#008080]/40 shadow-[0_8px_20px_rgba(0,128,128,0.1)]">
                <div className="bg-[#051014] p-4 rounded-2xl mb-4 text-right overflow-x-auto h-24 flex flex-col justify-end border border-[#008080]/30">
                    <div className="text-[#00e6e6]/60 text-sm h-5">{result ? `=${result}` : ''}</div>
                    <div className="text-3xl font-bold text-[#e6007a] tracking-wider">{calc || '0'}</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    <button onClick={clearAll} className="col-span-2 bg-red-500/10 text-red-400 p-4 rounded-2xl font-bold hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95">C</button>
                    <button onClick={deleteLast} className="bg-orange-500/10 text-orange-400 p-4 rounded-2xl font-bold hover:bg-orange-500/20 border border-orange-500/20 transition-all active:scale-95">DEL</button>
                    <button onClick={() => updateCalc('/')} className="bg-[#e6007a]/10 text-[#ff4d94] p-4 rounded-2xl font-bold hover:bg-[#e6007a]/20 border border-[#e6007a]/30 transition-all active:scale-95">├╖</button>
                    {[7,8,9].map(num => <button key={num} onClick={() => updateCalc(num.toString())} className="bg-[#051014] text-white p-4 rounded-2xl font-bold hover:bg-[#008080]/20 border border-[#008080]/30 transition-all active:scale-95 shadow-sm">{num}</button>)}
                    <button onClick={() => updateCalc('*')} className="bg-[#e6007a]/10 text-[#ff4d94] p-4 rounded-2xl font-bold hover:bg-[#e6007a]/20 border border-[#e6007a]/30 transition-all active:scale-95">├Ч</button>
                    {[4,5,6].map(num => <button key={num} onClick={() => updateCalc(num.toString())} className="bg-[#051014] text-white p-4 rounded-2xl font-bold hover:bg-[#008080]/20 border border-[#008080]/30 transition-all active:scale-95 shadow-sm">{num}</button>)}
                    <button onClick={() => updateCalc('-')} className="bg-[#e6007a]/10 text-[#ff4d94] p-4 rounded-2xl font-bold hover:bg-[#e6007a]/20 border border-[#e6007a]/30 transition-all active:scale-95">-</button>
                    {[1,2,3].map(num => <button key={num} onClick={() => updateCalc(num.toString())} className="bg-[#051014] text-white p-4 rounded-2xl font-bold hover:bg-[#008080]/20 border border-[#008080]/30 transition-all active:scale-95 shadow-sm">{num}</button>)}
                    <button onClick={() => updateCalc('+')} className="bg-[#e6007a]/10 text-[#ff4d94] p-4 rounded-2xl font-bold hover:bg-[#e6007a]/20 border border-[#e6007a]/30 transition-all active:scale-95">+</button>
                    <button onClick={() => updateCalc('.')} className="bg-[#051014] text-white p-4 rounded-2xl font-bold hover:bg-[#008080]/20 border border-[#008080]/30 transition-all active:scale-95">.</button>
                    <button onClick={() => updateCalc('0')} className="bg-[#051014] text-white p-4 rounded-2xl font-bold hover:bg-[#008080]/20 border border-[#008080]/30 transition-all active:scale-95">0</button>
                    <button onClick={calculate} className="col-span-2 bg-gradient-to-r from-[#e6007a] to-[#700080] text-white p-4 rounded-2xl font-bold hover:from-[#ff1a8c] hover:to-[#8b0099] border border-[#e6007a]/50 shadow-[0_0_15px_rgba(230,0,122,0.4)] transition-all active:scale-95">=</button>
                </div>
            </div>
        </div>
    );
};

// --- рдореБрдЦреНрдп App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // рд╡рд╛рдкрд╕ 'super-admin' рд╕реЗрдЯ рдХрд┐рдпрд╛ рдЧрдпрд╛ рддрд╛рдХрд┐ рдЖрдкрдХреЛ (рдлрд╛рдЙрдВрдбрд░ рдХреЛ) рд╢реАрд▓реНрдб рджрд┐рдЦ рд╕рдХреЗред
  const [userRole, setUserRole] = useState<string>('super-admin'); 
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [nextGame, setNextGame] = useState({ name: 'LOAD...', time: '00:00:00' });
  
  // ЁЯдЦ AI Bot State
  const [isBotOpen, setIsBotOpen] = useState(false);
  // ЁЯМР Offline tracker
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    setupLiveSync();
  }, []);

  // Offline detection logic
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

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
    
    // рд╕реБрд░рдХреНрд╖рд┐рдд рд░реЛрд▓ рдЪреЗрдХрд┐рдВрдЧ - рдЕрдЧрд░ рд╕реЗрдЯ рдирд╣реАрдВ рд╣реИ, рддреЛ 'super-admin' рд░рд╣реЗрдЧрд╛ рддрд╛рдХрд┐ рдЖрдкрдХреЛ рджрд┐рдЦреЗред 
    // (рдЧреЗрд╕реНрдЯ рд▓реЙрдЧрд┐рди рдХрд░рддреЗ рд╡рдХреНрдд LoginScreen.tsx рдореЗрдВ рд░реЛрд▓ 'guest' рд╕реЗрдЯ рд╣реЛрдирд╛ рдЬрд╝рд░реВрд░реА рд╣реИ)
    const sessionRole = sessionStorage.getItem('user_role') || 'super-admin';
    setUserRole(sessionRole);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setActiveTab('home');
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#051014] text-slate-200 font-sans flex justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e6007a]/10 via-[#051014] to-[#008080]/10 animate-pulse pointer-events-none"></div>
        <div className="w-full max-w-md flex flex-col gap-4 relative z-10">
          <WelcomeSection />
          <LoginScreen onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051014] text-slate-200 font-sans selection:bg-[#e6007a]/30 flex justify-center relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-[#e6007a]/10 via-[#051014] to-[#008080]/10 animate-pulse pointer-events-none"></div>

      <div className="w-full max-w-md relative min-h-screen bg-[#051014]/95 backdrop-blur-sm shadow-2xl flex flex-col border-x border-[#008080]/30">
        
        {/* ЁЯМР Offline Warning Banner */}
        {isOffline && (
            <div className="bg-red-500 text-white text-xs font-bold text-center py-1.5 animate-pulse">
                тЪая╕П рдЗрдВрдЯрд░рдиреЗрдЯ рдХрдиреЗрдХреНрд╢рди рдЯреВрдЯ рдЧрдпрд╛ рд╣реИред рдХреГрдкрдпрд╛ рдиреЗрдЯрд╡рд░реНрдХ рдЪреЗрдХ рдХрд░реЗрдВред
            </div>
        )}

        {/* === TOP HEADER PANEL === */}
        <div className="bg-[#0b171e] px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-[0_4px_15px_rgba(0,128,128,0.1)] border-b border-[#008080]/30">
            {/* Live Watch */}
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#e6007a] rounded-full animate-pulse shadow-[0_0_8px_rgba(230,0,122,0.8)]"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#00e6e6]/80 font-bold tracking-widest">{nextGame.name} CLOSING IN</span>
                    <span className="text-[#e6007a] font-bold font-mono text-sm">{nextGame.time}</span>
                </div>
            </div>

            {/* Top Navigation Icons */}
            <div className="flex items-center gap-2">
                
                {/* ЁЯЫбя╕П рдПрдбрдорд┐рди рдкреИрдирд▓ рд╢реАрд▓реНрдб (рд╕рд┐рд░реНрдл рдФрд░ рд╕рд┐рд░реНрдл 'super-admin' рдХреЗ рд▓рд┐рдП) */}
                {userRole === 'super-admin' && (
                  <button 
                    onClick={() => {
                    const pin = window.prompt('ЁЯЫбя╕П Admin PIN рджрд░реНрдЬ рдХрд░реЗрдВ');
                    if (pin === '0814') {
                      setActiveTab('admin');
                    } else if (pin !== null) {
                      alert('тЭМ рдЧрд▓рдд PIN');
                    }
                  }} 
                    className={`p-2 rounded-xl transition-all duration-300 border ${activeTab === 'admin' ? 'bg-[#e6007a] border-[#e6007a] text-white shadow-[0_0_15px_rgba(230,0,122,0.5)] scale-105' : 'bg-[#051014] border-[#008080]/40 text-slate-400 hover:text-white hover:border-[#e6007a]/50 hover:bg-[#e6007a]/10'}`} 
                    title="рдирд┐рдпрдВрддреНрд░рдг рдкреИрдирд▓ (Admin)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                )}

                {/* рд▓реЗреЫрд░ рдХреИрд▓рдХреБрд▓реЗрдЯрд░ рдЖрдЗрдХреЙрди */}
                <button onClick={() => setActiveTab('strategy')} className={`p-2 rounded-xl transition-all duration-300 border ${activeTab==='strategy' ? 'bg-[#e6007a] border-[#e6007a] text-white shadow-[0_0_15px_rgba(230,0,122,0.5)] scale-105' : 'bg-[#051014] border-[#008080]/40 text-slate-400 hover:text-white hover:border-[#e6007a]/50 hover:bg-[#e6007a]/10'}`} title="Ledger Strategy">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
                
                {deferredPrompt && (
                    <button onClick={handleInstallClick} className="bg-[#008080]/20 text-[#00e6e6] p-2 rounded-xl border border-[#008080]/50 hover:bg-[#008080]/40 transition-all hover:scale-105 active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                )}
            </div>
        </div>

        <TargetTracker />
        
        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 w-full pb-20 p-2 sm:p-4">
          <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} onLogout={handleLogout} />}
            {activeTab === 'predict' && <PredictTab />}
            {activeTab === 'result' && <ResultTab />}
            {activeTab === 'records' && <RecordsTab setActiveTab={setActiveTab} />}
            {activeTab === 'tracker' && <TrackerTab />}
            {activeTab === 'khaiwal' && <KhaiwalTab />}
            {activeTab === 'membership' && <MembershipTab />}
            {activeTab === 'calculator' && <CalculatorTab />}
            {activeTab === 'diary' && <DiaryTab />}
            {activeTab === 'strategy' && <StrategyCalculator />}

            {/* ЁЯЫбя╕П рдПрдбрдорд┐рди рдкреИрдирд▓ рдЯреИрдм (рд╕рд┐рд░реНрдл super-admin рдХреЗ рд▓рд┐рдП) */}
            {activeTab === 'admin' && userRole === 'super-admin' && (
              <AdminPanelTab userRole={userRole} setUserRole={setUserRole} />
            )}
          </div>
        </div>
        
        {/* Niche ka Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* ЁЯТм Floating AI Bot Button (рдпрд╣рд╛рдБ рдмреЛрдЯ рдХрд╛ рдЖрдЗрдХреЙрди рдФрд░ рдкреЙрдкрдЕрдк рд╣реИ) */}
        <button
            onClick={() => setIsBotOpen(true)}
            className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-[#00e6e6] to-[#008080] text-[#051014] p-3.5 rounded-full shadow-[0_0_20px_rgba(0,230,230,0.4)] hover:scale-110 transition-transform flex items-center justify-center border border-[#00e6e6]/50"
            title="AI рд╣реЗрд▓реНрдк рдЕрд╕рд┐рд╕реНрдЯреЗрдВрдЯ"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        </button>

        {/* ЁЯдЦ Modal Window for Gemini Bot */}
        {isBotOpen && <GeminiAssistantModal onClose={() => setIsBotOpen(false)} />}

      </div>
    </div>
  );
}
