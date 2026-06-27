import React, { useState, useMemo } from 'react';
import { Zap, Save, Activity, Key, LogOut, Shield, Users, Cloud, Bot } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import UserManagementModal from './UserManagementModal';
import GeminiAssistantModal from './GeminiAssistantModal';
import { getCurrentUser, getCurrentRole } from '../utils/auth';
import { getTrackerEntries, downloadBackupData } from '../utils/storage'; 

export default function HomeTab({ setActiveTab, onLogout }: { setActiveTab: (t: string) => void, onLogout: () => void }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGeminiAssistant, setShowGeminiAssistant] = useState(false);
  
  const user = getCurrentUser();
  const role = getCurrentRole();

  const stats = useMemo(() => {
    const entries = getTrackerEntries();
    let totalPass = 0;
    let totalFail = 0;
    let pending = 0;
    let l1Pass = 0;
    let l2Pass = 0;
    let l3Pass = 0;

    entries.forEach(e => {
      if (e.isPlay) {
        if (e.passLocation === 'PENDING') {
          pending++;
        } else if (e.passLocation === 'FAIL') {
          totalFail++;
        } else {
          totalPass++;
          if (e.passLocation === 'FD') l1Pass++;
          else if (e.passLocation === 'GB') l2Pass++;
          else l3Pass++;
        }
      }
    });

    const totalResolved = totalPass + totalFail;
    const successRate = totalResolved > 0 ? Math.round((totalPass / totalResolved) * 100) : 0;

    return { successRate, totalPass, totalResolved, pending, l1Pass, l2Pass, l3Pass, totalFail };
  }, []);

  // Naya aur Safe Backup Function
  const handleLocalBackup = () => {
    downloadBackupData();
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-teal-400">साहिल मास्टर सिस्टम</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
            स्वागत है, <span className="text-white capitalize">{user}</span>
            {role === 'admin' && <Shield className="w-3.5 h-3.5 text-teal-400 ml-1" />}
          </p>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-white p-2 bg-[#111827] border border-slate-800 rounded-xl">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">आज की स्टेट्स</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-teal-400 rounded-xl p-4 text-slate-900 shadow-lg">
            <div className="text-sm font-medium mb-1">सफलता दर</div>
            <div className="text-4xl font-bold mb-2">{stats.successRate}%</div>
            <div className="text-xs font-medium opacity-80">{stats.totalPass} पास / {stats.totalResolved} कुल</div>
          </div>
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="text-sm font-medium text-slate-400">पेंडिंग</div>
            <div className="text-4xl font-bold text-white mb-2">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-400">परिणाम की प्रतीक्षा</div>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 grid grid-cols-4 gap-2 text-center">
          <div><div className="text-xl font-bold text-green-500">{stats.l1Pass}</div><div className="text-[10px] text-slate-400 mt-1">L1 पास</div></div>
          <div><div className="text-xl font-bold text-blue-500">{stats.l2Pass}</div><div className="text-[10px] text-slate-400 mt-1">L2 पास</div></div>
          <div><div className="text-xl font-bold text-teal-400">{stats.l3Pass}</div><div className="text-[10px] text-slate-400 mt-1">L3 पास</div></div>
          <div><div className="text-xl font-bold text-red-500">{stats.totalFail}</div><div className="text-[10px] text-slate-400 mt-1">फेल</div></div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">क्विक एक्शन</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setActiveTab('predict')} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors">
            <Zap className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">नई प्रेडिक्शन</span>
          </button>
          <button onClick={() => setActiveTab('result')} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors">
            <Save className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">रिजल्ट सेव करें</span>
          </button>
          {role === 'admin' && (
            <>
              <button onClick={() => setShowUserModal(true)} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors">
                <Users className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">यूजर मैनेजमेंट</span>
              </button>
              <button onClick={() => setShowPasswordModal(true)} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors">
                <Key className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">एडमिन पासवर्ड</span>
              </button>
              <button onClick={() => setShowGeminiAssistant(true)} className="bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors">
                <Bot className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-teal-400">Gemini सपोर्ट</span>
              </button>
              
              {/* Naya Backup Button jo bina crash ke chalega */}
              <button onClick={handleLocalBackup} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors col-span-2">
                <Cloud className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-medium text-white">डेटा बैकअप डाउनलोड करें</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showUserModal && <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />}
      {showGeminiAssistant && <GeminiAssistantModal onClose={() => setShowGeminiAssistant(false)} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">हालिया प्रेडिक्शन</h2>
          <button onClick={() => setActiveTab('tracker')} className="text-sm text-teal-400 font-medium flex items-center">
            सभी देखें <Activity className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="space-y-3">
          {getTrackerEntries().filter(e => e.isPlay).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map((item) => (
            <div key={item.id} className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{item.date}</div>
                <div className="text-xs text-slate-400 mt-1 uppercase">Pass at: {item.passLocation || 'None'}</div>
              </div>
              {item.passLocation === 'PENDING' ? (
                <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded">पेंडिंग</div>
              ) : item.passLocation === 'FAIL' ? (
                <div className="bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-bold px-2 py-1 rounded">फेल</div>
              ) : (
                <div className="bg-teal-400/20 border border-teal-400/30 text-teal-400 text-[10px] font-bold px-2 py-1 rounded">पास</div>
              )}
            </div>
          ))}
          {getTrackerEntries().filter(e => e.isPlay).length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">अभी कोई प्रेडिक्शन नहीं है</div>
          )}
        </div>
      </div>
    </div>
  );
}
