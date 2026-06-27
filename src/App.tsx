import React, { useState, useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';

// Purane Components Import
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import PredictTab from './components/PredictTab';
import ResultTab from './components/ResultTab';
import RecordsTab from './components/RecordsTab';
import TrackerTab from './components/TrackerTab';
import LoginScreen from './components/LoginScreen';

// Naye Components Import (Jo humne abhi banaye hain)
import MembershipTab from './components/MembershipTab';
import KhaiwalTab from './components/KhaiwalTab';

import { logoutUser } from './utils/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('is_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    await deferredPromptRef.current.userChoice;
    deferredPromptRef.current = null;
    setShowInstallBanner(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-teal-400/30">
      <div className="max-w-md mx-auto relative min-h-screen bg-[#0B1120] shadow-2xl flex flex-col">

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-2 z-50">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Download className="w-4 h-4 shrink-0" />
              <span>ऐप इंस्टॉल करें — मोबाइल में चलाएं</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstall}
                className="bg-white text-teal-700 text-xs font-bold px-3 py-1 rounded-full"
              >
                इंस्टॉल
              </button>
              <button onClick={dismissBanner} className="text-white/80">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 w-full pb-20 p-4">

          {/* Purane Tabs */}
          {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} onLogout={handleLogout} />}
          {activeTab === 'predict' && <PredictTab />}
          {activeTab === 'result' && <ResultTab />}
          {activeTab === 'records' && <RecordsTab setActiveTab={setActiveTab} />}
          {activeTab === 'tracker' && <TrackerTab />}

          {/* Naye Tabs (Bilkul Safe Tarike Se Linked) */}
          {activeTab === 'membership' && <MembershipTab />}
          {activeTab === 'khaiwal' && <KhaiwalTab />}

        </div>

        {/* Niche ka Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
