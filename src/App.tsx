
import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageCircle, Gamepad2, Crown } from 'lucide-react';

// Aapke purane components import ho rahe hain
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import PredictTab from './components/PredictTab';
import ResultTab from './components/ResultTab';
import RecordsTab from './components/RecordsTab';
import TrackerTab from './components/TrackerTab';
import LoginScreen from './components/LoginScreen';
import { logoutUser } from './utils/auth';

const DEFAULT_KHAIWALS = [
  { id: '1', name: 'VIP Khaiwal', whatsapp: '919876543210', verified: true, jodiRate: '10 Ka 900', harufRate: '100 Ka 900' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Khaiwals ke liye State & LocalStorage
  const [khaiwals, setKhaiwals] = useState(() => {
    const saved = localStorage.getItem('app_khaiwals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_KHAIWALS;
  });

  useEffect(() => {
    localStorage.setItem('app_khaiwals', JSON.stringify(khaiwals));
  }, [khaiwals]);

  // Khaiwal Admin State
  const [newKhaiwalName, setNewKhaiwalName] = useState('');
  const [newKhaiwalWhatsapp, setNewKhaiwalWhatsapp] = useState('');

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

  // Khaiwal add karne ka function
  const handleAddKhaiwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKhaiwalName || !newKhaiwalWhatsapp) return;
    
    const newK = {
      id: Date.now().toString(),
      name: newKhaiwalName,
      whatsapp: newKhaiwalWhatsapp,
      verified: true,
      jodiRate: '10 Ka 900',
      harufRate: '100 Ka 900'
    };
    
    setKhaiwals([...khaiwals, newK]);
    setNewKhaiwalName('');
    setNewKhaiwalWhatsapp('');
    alert('Khaiwal add ho gaya!');
  };

  // Khaiwal hatane ka function
  const handleDeleteKhaiwal = (id: string) => {
    if(window.confirm('Kya aap is khaiwal ko hatana chahte hain?')) {
      setKhaiwals(khaiwals.filter((k: any) => k.id !== id));
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-teal-400/30">
      <div className="max-w-md mx-auto relative min-h-screen bg-[#0B1120] shadow-2xl flex flex-col">
        
        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 w-full pb-20 p-4">
          
          {/* Aapke purane Tabs */}
          {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} onLogout={handleLogout} />}
          {activeTab === 'predict' && <PredictTab />}
          {activeTab === 'result' && <ResultTab />}
          {activeTab === 'records' && <RecordsTab setActiveTab={setActiveTab} />}
          {activeTab === 'tracker' && <TrackerTab />}

          {/* 🌟 Naya Membership Tab 🌟 */}
          {activeTab === 'membership' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">VIP Membership</h2>
              {/* Yearly Plan */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg border border-yellow-300 p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold">1 Year Plan</h3>
                  <Crown size={24} className="text-yellow-100" />
                </div>
                <div className="text-3xl font-black mb-4">₹21,000 <span className="text-sm font-medium opacity-80">/ year</span></div>
                <ul className="space-y-2 text-sm font-medium mb-5">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0"></div> 
                    <span>2 Jodi special (Month me 4 baar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0"></div> 
                    <span>30 Jodi daily with risk management par</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0"></div> 
                    <span>Compound magic janane ke liye chat box me chat karein</span>
                  </li>
                </ul>
                <button className="w-full bg-white text-yellow-600 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  Plan Kharidein
                </button>
              </div>

              {/* Monthly Plan */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md border border-teal-400 p-5 text-white">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold">Monthly Plan</h3>
                </div>
                <div className="text-3xl font-black mb-4">₹3,500 <span className="text-sm font-medium opacity-80">/ month</span></div>
                <ul className="space-y-2 text-sm font-medium mb-5">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-100 rounded-full"></div> 30 Jodi daily access</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-100 rounded-full"></div> Risk management support</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-100 rounded-full"></div> Standard Chat Support</li>
                </ul>
                <button className="w-full bg-white text-teal-700 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  Plan Kharidein
                </button>
              </div>

              {/* 7 Day Trial Plan */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-md border border-slate-600 p-5 text-white">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-gray-100">7 Day Trial Plan</h3>
                </div>
                <div className="text-3xl font-black mb-4">₹1,500 <span className="text-sm font-medium opacity-80 text-gray-300">/ 7 days</span></div>
                <ul className="space-y-2 text-sm font-medium mb-5 text-gray-200">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> 7 Days full access</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> 30 Jodi daily</li>
                </ul>
                <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  Trial Shuru Karein
                </button>
              </div>
            </div>
          )}

          {/* 🌟 Naya Khaiwal Tab 🌟 */}
          {activeTab === 'khaiwal' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Trusted Khaiwal</h2>
              
              {khaiwals.map((k: any) => (
                <div key={k.id} className="bg-[#131C31] rounded-xl shadow-md border border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-teal-100" />
                      <h3 className="font-bold text-lg">{k.name}</h3>
                    </div>
                    {k.verified && <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Verified</span>}
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
                        <div className="text-xs text-slate-400 font-bold mb-1">Jodi Rate</div>
                        <div className="text-lg font-black text-teal-400">{k.jodiRate}</div>
                      </div>
                      <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
                        <div className="text-xs text-slate-400 font-bold mb-1">Haruf Rate</div>
                        <div className="text-lg font-black text-teal-400">{k.harufRate}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-4 text-center font-medium">
                      Sabse tez payment, 100% bharosemand aur safe.
                    </p>
                    
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${k.whatsapp}?text=Hello%20sir,%20Mujhe%20game%20play%20karna%20hai`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-green-600 transition-colors">
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                      <a href={`https://wa.me/${k.whatsapp}?text=Hello%20sir,%20Mujhe%20game%20play%20karna%20hai`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-teal-700 transition-colors">
                        <Gamepad2 size={18} />
                        Play Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center mt-6">
                <h4 className="font-bold text-teal-400 mb-2">Apna Ad Yahan Lagwayein</h4>
                <p className="text-sm text-slate-400 mb-3">Best khaiwal banne ke liye yahan ad lagwaye. Hum trusted khaiwal se contact karke promotion karte hain.</p>
                <button className="bg-slate-700 text-white border border-slate-600 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-600 transition-colors text-sm">
                  Contact For Ad
                </button>
              </div>
            </div>
          )}

          {/* 🌟 Naya Admin Tab 🌟 */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Admin Panel</h2>

              {/* Add Khaiwal Form */}
              <div className="bg-[#131C31] rounded-xl shadow-sm border border-slate-700 p-5">
                <h2 className="text-lg font-bold text-white mb-4">Khaiwal Add Karein</h2>
                <form onSubmit={handleAddKhaiwal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Khaiwal Ka Naam</label>
                    <input 
                      type="text" 
                      value={newKhaiwalName}
                      onChange={(e) => setNewKhaiwalName(e.target.value)}
                      placeholder="e.g. VIP Khaiwal"
                      className="w-full border border-slate-600 rounded-lg p-2.5 bg-slate-800 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Number (with country code)</label>
                    <input 
                      type="text" 
                      value={newKhaiwalWhatsapp}
                      onChange={(e) => setNewKhaiwalWhatsapp(e.target.value)}
                      placeholder="e.g. 919876543210"
                      className="w-full border border-slate-600 rounded-lg p-2.5 bg-slate-800 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-green-500 text-white font-bold rounded-lg p-3 hover:bg-green-600 transition-all shadow-md"
                  >
                    Khaiwal Add Karein
                  </button>
                </form>

                {/* Active Khaiwal List */}
                {khaiwals.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">Active Khaiwals</h3>
                    <div className="space-y-2">
                      {khaiwals.map((k: any) => (
                        <div key={k.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg border border-slate-700">
                          <div>
                            <p className="font-bold text-sm text-white">{k.name}</p>
                            <p className="text-xs text-slate-400">+{k.whatsapp}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteKhaiwal(k.id)}
                            className="bg-red-500/10 text-red-400 text-xs px-3 py-1.5 rounded font-bold hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        
        {/* Aapka Purana BottomNav */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
