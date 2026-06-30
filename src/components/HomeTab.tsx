import React, { useState, useMemo } from 'react';
import { Zap, Save, LogOut, Shield, Users, Cloud, Bot, AlertTriangle, BookOpen, ChevronDown, ChevronUp, TrendingUp, ShieldCheck, Banknote, BrainCircuit, Info, Activity } from 'lucide-react';
import UserManagementModal from './UserManagementModal';
import GeminiAssistantModal from './GeminiAssistantModal';
import { getCurrentUser, getCurrentRole } from '../utils/auth';
import { getTrackerEntries, downloadBackupData } from '../utils/storage'; 

export default function HomeTab({ setActiveTab, onLogout }: { setActiveTab: (t: string) => void, onLogout: () => void }) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGeminiAssistant, setShowGeminiAssistant] = useState(false);
  const [showRules, setShowRules] = useState(false); // 4 नियमों के लिए
  const [showFormulas, setShowFormulas] = useState(false); // नए फॉर्मूला गाइड के लिए
  
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

  // --- DISCIPLINE SCORE LOGIC (नया अनुशासन मीटर) ---
  const disciplineScore = useMemo(() => {
    let score = 100;
    // पेंडिंग एंट्रीज (समय पर हिसाब न डालना) पर पेनाल्टी (-15 प्रति पेंडिंग)
    if (stats.pending > 0) score -= (stats.pending * 15);
    
    // बहुत ज्यादा लगातार फेल (Overtrading) पर पेनाल्टी (-5 प्रति फेल, 5 फेल के बाद)
    if (stats.totalFail > 5) score -= ((stats.totalFail - 5) * 5);
    
    return Math.max(10, Math.min(100, score)); // स्कोर 10 से 100 के बीच ही रहेगा
  }, [stats.pending, stats.totalFail]);

  const handleLocalBackup = () => {
    downloadBackupData();
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      {/* === Header === */}
      <div className="flex items-center justify-between mb-2">
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

      {/* === Discipline Score (अनुशासन मीटर) === */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" /> अनुशासन मीटर
          </h2>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${disciplineScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/30' : disciplineScore >= 50 ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {disciplineScore >= 80 ? 'Excellent' : disciplineScore >= 50 ? 'Warning' : 'Danger'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background Circle */}
              <path
                className="text-slate-800"
                stroke="currentColor"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Foreground Progress Circle */}
              <path
                className={`${disciplineScore >= 80 ? 'text-green-500' : disciplineScore >= 50 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                strokeDasharray={`${disciplineScore}, 100`}
                stroke="currentColor"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white">{disciplineScore}%</span>
              <span className="text-[10px] text-slate-400 mt-0.5">SCORE</span>
            </div>
          </div>

          {/* Warning / Success Message */}
          <div className="mt-5 w-full">
            {disciplineScore >= 80 ? (
              <div className="flex items-start gap-3 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-green-400/90 leading-relaxed">
                  <strong>बेहतरीन!</strong> आप सिस्टम के नियमों का पूरी तरह पालन कर रहे हैं। लालच पर आपका कंट्रोल एकदम परफेक्ट है।
                </p>
              </div>
            ) : disciplineScore >= 50 ? (
              <div className="flex items-start gap-3 bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-400/90 leading-relaxed">
                  <strong>चेतावनी:</strong> आपका अनुशासन स्कोर गिर रहा है। समय पर रिजल्ट अपडेट करें और ओवरट्रेडिंग से बचें।
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400/90 leading-relaxed">
                  <strong>खतरा!</strong> आपका स्कोर बहुत कम है। यह जुआ नहीं है! "जीतने के बाद No Play" नियम को याद रखें और शांत हो जाएँ।
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Stats Section === */}
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

      {/* === Quick Actions === */}
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

      {/* === Disclaimer Section === */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-400 font-bold text-sm">चेतावनी (Disclaimer)</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            यह कोई सट्टा या जुआ खेलने वाली ऐप नहीं है। यह केवल एक गणितीय और AI आधारित 'प्रेडिक्शन (अनुमान)' और 'रिस्क मैनेजमेंट' टूल है। कृपया अपने जोखिम (Risk) और समझदारी से खेलें। हम किसी भी वित्तीय नुकसान के लिए ज़िम्मेदार नहीं हैं।
          </p>
        </div>
      </div>

      {/* === 4 Rules Plan (आपकी दी हुई जानकारी) === */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="w-full p-4 flex items-center justify-between bg-[#1F2937]/30 hover:bg-[#1F2937]/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-white text-sm">साहिल मास्टर सिस्टम के 4 नियम</span>
          </div>
          {showRules ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        
        {showRules && (
          <div className="p-4 space-y-5 border-t border-slate-800 bg-[#0B1120]">
            <div className="flex gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg h-fit border border-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">1. 1991 का संकट और अर्थशास्त्र</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हमारा सिस्टम हवा में नहीं, बल्कि महान अर्थशास्त्रियों के नियमों पर बना है। पहला मकसद आपकी मूल पूंजी बचाना है, और फिर रिस्क को सुरक्षित अनुपात में बाँटकर खेलना है।
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-orange-500/10 p-2 rounded-lg h-fit border border-orange-500/20">
                <Banknote className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">2. 100% सुरक्षित बजट मैनेजमेंट</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हम सिर्फ ₹15,000 के बेस से शुरू करते हैं। ₹12,900 'इमरजेंसी फंड' में सुरक्षित रहते हैं। रोज़ का रिस्क सिर्फ ₹2,100 होता है। अगर 5 दिन गेम फेल हो, तो भी आप ज़ीरो (0) पर नहीं आएंगे।
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg h-fit border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">3. जादुई '50-50' रूल (कंपाउंडिंग)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  मुनाफे का 50% सीधा आपके बैंक खाते में जाता है और 50% अगले दिन के खेल में जुड़ता है। यही कंपाउंडिंग की ताकत कुछ ही महीनों में आपके बेस को सेफ बना देती है।
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg h-fit border border-purple-500/20">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">4. AI की ताकत (गलतियों से आज़ादी)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हमारा AI सिस्टम 1 सेकंड में 15 फॉर्मूलों से छनकर सटीक 30 जोड़ियाँ देता है। लगातार 20 मार्केट (5 दिन) फेल होना नामुमकिन है।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === नया: फॉर्मूला और कैलकुलेशन गाइड === */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 flex items-center justify-between bg-[#1F2937]/30 hover:bg-[#1F2937]/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white text-sm">सिस्टम के फॉर्मूले कैसे काम करते हैं?</span>
          </div>
          {showFormulas ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        
        {showFormulas && (
          <div className="p-4 space-y-4 bg-[#0B1120] border-t border-slate-800">
            
            <div className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <h4 className="text-teal-400 font-bold text-sm mb-1">1. दाना (Difference) ट्रैप</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  हम आज की जोड़ी और पिछले 4 दिन के रिजल्ट का अंतर निकालते हैं। <br/>
                  • <b>हाई ट्रैप (+10 पॉइंट):</b> अगर अंतर 1, 2, 3 दाने या 10, 20, 30 है।<br/>
                  • <b>लो ट्रैप (+5 पॉइंट):</b> अगर अंतर 4 से 9 के बीच है। 
                </p>
            </div>

            <div className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <h4 className="text-teal-400 font-bold text-sm mb-1">2. 3rd Step (गैप) और कैलेंडर लॉजिक</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  सिस्टम 15 दिन के डेटा में देखता है कि कोई जोड़ी कितने दिन के गैप से रिपीट हो रही है। ऑपरेटर की चाल पकड़ने के लिए:<br/>
                  • <b>+9 पॉइंट:</b> अगर जोड़ी बिल्कुल सटीक दिन (Same Day) पर आ रही है।<br/>
                  • <b>+7 पॉइंट / +5 पॉइंट:</b> अगर ऑपरेटर 1 दिन जल्दी या 1 दिन लेट चलता है।
                </p>
            </div>

            <div className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <h4 className="text-teal-400 font-bold text-sm mb-1">3. मुर्दा (Repeat) और फैमिली</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  जो नंबर पिछले 3 दिनों में आ चुका है। डायरेक्ट नंबर आने पर <b>+10 पॉइंट</b> और उसकी फैमिली आने पर <b>+6 पॉइंट</b> मिलते हैं।
                </p>
            </div>

            <div className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <h4 className="text-teal-400 font-bold text-sm mb-1">4. यूनिवर्सल और 15 दिन बंद घर</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  • <b>यूनिवर्सल:</b> महीने की 1, 2 और 3 तारीख को 14 फिक्स जोड़ियों (जैसे 02, 20, 04) को सीधा <b>+10 पॉइंट</b> मिलता है।<br/>
                  • <b>बंद घर:</b> जो फैमिली 15 दिन से नहीं खुली है, उसे <b>+2 पॉइंट</b> और रेड (🔥) अलर्ट मिलता है।
                </p>
            </div>

            <div className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                <h4 className="text-teal-400 font-bold text-sm mb-1">5. मैजिक और एवरग्रीन</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  मैजिक जोड़ियों (12, 23, 84, 96) को सीधा <b>+15 पॉइंट</b> और एवरग्रीन नंबरों (3, 8, 6, 1, 9, 0, 7, 2) से बनी जोड़ियों को <b>+7 पॉइंट</b> मिलते हैं।
                </p>
            </div>

          </div>
        )}
      </div>

      {showUserModal && <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />}
      {showGeminiAssistant && <GeminiAssistantModal onClose={() => setShowGeminiAssistant(false)} />}
    </div>
  );
}
