import React, { useState, useMemo } from 'react';
import { Zap, Save, LogOut, Shield, Users, Cloud, Bot, AlertTriangle, BookOpen, ChevronDown, ChevronUp, TrendingUp, ShieldCheck, Banknote, BrainCircuit } from 'lucide-react';
import UserManagementModal from './UserManagementModal';
import GeminiAssistantModal from './GeminiAssistantModal';
import { getCurrentUser, getCurrentRole } from '../utils/auth';
import { getTrackerEntries, downloadBackupData } from '../utils/storage'; 

export default function HomeTab({ setActiveTab, onLogout }: { setActiveTab: (t: string) => void, onLogout: () => void }) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGeminiAssistant, setShowGeminiAssistant] = useState(false);
  const [showRules, setShowRules] = useState(false); // प्लान दिखाने/छुपाने के लिए
  
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
        if (e.passLocation === 'PENDING' || e.passLocation === 'पेंडिंग (रिजल्ट की प्रतीक्षा)') {
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

  const handleLocalBackup = () => {
    downloadBackupData();
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-teal-400">साहिल मास्टर सिस्टम</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
            स्वागत है, <span className="text-white capitalize">{user}</span>
            {role === 'admin' && <Shield className="w-3.5 h-3.5 text-teal-400 ml-1" />}
          </p>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-white p-2 bg-[#111827] border border-slate-800 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Section */}
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

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">क्विक एक्शन</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setActiveTab('predict')} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors shadow-sm">
            <Zap className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">नई प्रेडिक्शन</span>
          </button>
          <button onClick={() => setActiveTab('result')} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors shadow-sm">
            <Save className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">रिजल्ट सेव करें</span>
          </button>
          {role === 'admin' && (
            <>
              <button onClick={() => setShowUserModal(true)} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors shadow-sm">
                <Users className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-white">यूजर मैनेजमेंट</span>
              </button>
              <button onClick={() => setShowGeminiAssistant(true)} className="bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors shadow-sm">
                <Bot className="w-6 h-6 text-teal-400" /><span className="text-sm font-medium text-teal-400">Gemini सपोर्ट</span>
              </button>
              <button onClick={handleLocalBackup} className="bg-[#111827] hover:bg-[#1F2937] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-colors col-span-2 shadow-sm">
                <Cloud className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-medium text-white">डेटा बैकअप डाउनलोड करें</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Point 7: Disclaimer Section */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-400 font-bold text-sm">चेतावनी (Disclaimer)</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            यह कोई सट्टा या जुआ खेलने वाली ऐप नहीं है। यह केवल एक गणितीय और AI आधारित 'प्रेडिक्शन (अनुमान)' और 'रिस्क मैनेजमेंट' टूल है। कृपया अपने जोखिम (Risk) और समझदारी से खेलें। हम किसी भी वित्तीय नुकसान के लिए ज़िम्मेदार नहीं हैं।
          </p>
        </div>
      </div>

      {/* Point 8: Compounding & Rules Plan (Collapsible) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="w-full p-4 flex items-center justify-between bg-[#1F2937]/30 hover:bg-[#1F2937]/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-white text-sm">साहिल मास्टर सिस्टम कैसे काम करता है?</span>
          </div>
          {showRules ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        
        {showRules && (
          <div className="p-4 space-y-5 border-t border-slate-800 bg-[#0B1120]">
            
            {/* Rule 1 */}
            <div className="flex gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg h-fit border border-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">1. 1991 का संकट और अर्थशास्त्र के नियम</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हमारा सिस्टम हवा में नहीं, बल्कि बेंजामिन ग्राहम और एडवर्ड थोर्प जैसे महान अर्थशास्त्रियों के नियमों पर बना है। हमारा पहला मकसद है आपकी मूल पूंजी बचाना, और फिर रिस्क को 4 बाज़ारों में सुरक्षित अनुपात में बाँटकर खेलना।
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-3">
              <div className="bg-orange-500/10 p-2 rounded-lg h-fit border border-orange-500/20">
                <Banknote className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">2. 100% सुरक्षित बजट मैनेजमेंट</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हम सिर्फ ₹15,000 के छोटे बजट से शुरू करते हैं। इसमें से ₹12,900 'इमरजेंसी फंड' में सुरक्षित रहते हैं। रोज़ का रिस्क सिर्फ ₹2,100 होता है। अगर 5 दिन भी गेम फेल हो जाए, तो भी आप कभी ज़ीरो (0) पर या सड़क पर नहीं आएंगे।
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg h-fit border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">3. जादुई '50-50' रूल और कंपाउंडिंग</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  गेम पास होने पर मुनाफे का 50% सीधा आपके बैंक खाते (परिवार के लिए) में जाता है और 50% अगले दिन के खेल में जुड़ता है। यही कंपाउंडिंग की ताकत कुछ ही महीनों में आपके छोटे से बेस को हज़ारों के सेफ बेस में बदल देती है।
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg h-fit border border-purple-500/20">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">4. AI की ताकत (गलतियों से आज़ादी)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हाथ से खेलते वक्त 56 की जगह 65 लिखने की गलती हो सकती है। हमारा AI सिस्टम आपको 1 सेकंड में 15 फॉर्मूलों से छनकर आई सटीक 30 जोड़ियाँ देता है। लगातार 20 मार्केट (5 दिन) फेल होना नामुमकिन है।
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {showUserModal && <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />}
      {showGeminiAssistant && <GeminiAssistantModal onClose={() => setShowGeminiAssistant(false)} />}
    </div>
  );
}
