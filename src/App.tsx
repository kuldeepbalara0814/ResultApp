import React, { useState, useEffect } from 'react';

// Purane Components Import
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import PredictTab from './components/PredictTab';
import ResultTab from './components/ResultTab';
import RecordsTab from './components/RecordsTab';
import TrackerTab from './components/TrackerTab';
import LoginScreen from './components/LoginScreen';

// Naye Components Import (Jo humne abhi banaye hain)
import KhaiwalTab from './components/KhaiwalTab';
import MembershipTab from './components/MembershipTab'; // <-- नया VIP पेज लिंक किया गया

import { logoutUser } from './utils/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('is_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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
        
        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 w-full pb-20 p-4">
          
          {/* Purane Tabs */}
          {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} onLogout={handleLogout} />}
          {activeTab === 'predict' && <PredictTab />}
          {activeTab === 'result' && <ResultTab />}
          {activeTab === 'records' && <RecordsTab setActiveTab={setActiveTab} />}
          {activeTab === 'tracker' && <TrackerTab />}

          {/* Naye Tabs (Bilkul Safe Tarike Se Linked) */}
          {activeTab === 'khaiwal' && <KhaiwalTab />}
          {activeTab === 'membership' && <MembershipTab />} {/* <-- यहाँ पेज रेंडर होगा */}

        </div>
        
        {/* Niche ka Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
