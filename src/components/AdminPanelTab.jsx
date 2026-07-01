import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase/config'; 

import { getAllResultsSorted } from '../utils/storage'; 
import { getShuffleSuggestion, saveWeights } from '../utils/formulas';
import { BrainCircuit, Check, X, AlertTriangle, Activity } from 'lucide-react';

export default function AdminPanelTab({ userRole, setUserRole }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [subAdminEmail, setSubAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, "users", userId.trim()), {
        username: userId.trim(),
        password: password.trim(),
        role: 'user',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert(`सफलतापूर्वक डेटाबेस में सुरक्षित किया गया! ID: ${userId}`);
      setUserId(''); 
      setPassword('');
    } catch (error) {
      console.error("Error updating user:", error);
      alert("डेटाबेस एरर: कोड सही है पर कनेक्शन में समस्या है।");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, "users", subAdminEmail.trim()), {
        username: subAdminEmail.trim(),
        role: 'sub-admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert(`नया सब-एडमिन डेटाबेस में जोड़ा गया: ${subAdminEmail}`);
      setSubAdminEmail('');
    } catch (error) {
      console.error("Error creating sub-admin:", error);
      alert("त्रुटि: सब-एडमिन जोड़ने में समस्या आई।");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubAdmin = async () => {
    if (!subAdminEmail) {
      alert("कृपया पहले उस सब-एडमिन की आईडी ऊपर बॉक्स में लिखें जिसे हटाना है।");
      return;
    }
    
    if (window.confirm(`क्या आप सचमुच ${subAdminEmail} से सब-एडमिन की power हटाना चाहते हैं?`)) {
      setLoading(true);
      try {
        await setDoc(doc(db, "users", subAdminEmail.trim()), {
          role: 'user',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        alert(`${subAdminEmail} की पावर हटाकर नॉर्मल यूज़र बना दिया गया है।`);
        setSubAdminEmail('');
      } catch (error) {
        alert("पावर हटाने में समस्या आई।");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnalyzeOperator = () => {
    setIsAnalyzing(true);
    setAiSuggestion(null);

    setTimeout(() => {
      try {
        const allResults = getAllResultsSorted();
        const validResults = allResults.filter(r => r.fd || r.gb || r.gl || r.ds);
        
        const past15DaysNums = [];
        validResults.slice(0, 15).forEach(r => {
          if (r.fd) past15DaysNums.push(r.fd);
          if (r.gb) past15DaysNums.push(r.gb);
          if (r.gl) past15DaysNums.push(r.gl);
          if (r.ds) past15DaysNums.push(r.ds);
        });

        const suggestion = getShuffleSuggestion(past15DaysNums);
        setAiSuggestion(suggestion);

        if (!suggestion.detected) {
          alert("✅ AI रिपोर्ट: " + suggestion.message);
        }
      } catch (error) {
        console.error("Analysis Error:", error);
        alert("डेटा एनालाइज़ करने में समस्या आई।");
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500); 
  };

  const handleApproveShuffle = () => {
    if (aiSuggestion && aiSuggestion.proposedWeights) {
      saveWeights(aiSuggestion.proposedWeights);
      alert("✅ सफलता! AI ने फॉर्मूले के नए पॉइंट्स डेटाबेस में अपडेट कर दिए हैं। अब प्रेडिक्शन नई चाल के हिसाब से होगी।");
      setAiSuggestion(null);
    }
  };

  return (
    <div className="p-4 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-200">
      
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setUserRole(userRole === 'super-admin' ? 'sub-admin' : 'super-admin')}
          className="bg-[#008080]/20 text-[11px] font-bold text-[#00e6e6] px-3 py-1.5 rounded-xl border border-[#008080]/40 active:scale-95"
        >
          🔄 टेस्टिंग बदलें: {userRole === 'super-admin' ? 'अभी आप एडमिन हैं' : 'अभी आप भाई (Sub) हैं'}
        </button>
      </div>

      <h2 className="text-2xl font-bold text-[#e6007a] mb-1 drop-shadow-[0_0_5px_rgba(230,0,122,0.4)]">
        नियंत्रण पैनल (Admin Panel)
      </h2>
      
      <div className="mb-6 p-2.5 bg-[#051014] rounded-xl border border-[#008080]/20 text-xs">
        {userRole === 'super-admin' ? (
          <p className="text-[#00e6e6]">👑 <strong>Super Admin (आप):</strong> आपके पास इस पूरे सिस्टम का 100% कंट्रोल है। आप सब-एडमिन की पावर भी नियंत्रित कर सकते हैं।</p>
        ) : (
          <p className="text-orange-400">🤝 <strong>Sub Admin (भाई की पावर):</strong> आपके पास सिर्फ ग्राहकों की लॉगिन आईडी बनाने और पासवर्ड रीसेट करने का अधिकार है।</p>
        )}
      </div>

      {userRole === 'super-admin' && (
        <div className="bg-gradient-to-br from-[#0b171e] to-[#1a0b1e] p-5 rounded-2xl border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] mb-6">
          <h3 className="text-sm font-bold text-purple-400 tracking-wider mb-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" /> AI ऑटो-शफल (ऑपरेटर चाल ट्रैकर)
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            यह सिस्टम पिछले 15 दिनों के डेटा का विश्लेषण करके ऑपरेटर की नई चाल (जैसे दाना ट्रैप या मुर्दा) को पकड़ता है। AI सिर्फ सलाह देगा, अंतिम मंज़ूरी आपकी होगी।
          </p>

          <button 
            onClick={handleAnalyzeOperator}
            disabled={isAnalyzing}
            className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? <Activity className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {isAnalyzing ? 'डेटा एनालाइज़ हो रहा है...' : 'ऑपरेटर की चाल चेक करें'}
          </button>

          {aiSuggestion && aiSuggestion.detected && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 animate-in zoom-in duration-300">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-400/90 leading-relaxed font-medium">
                  {aiSuggestion.message}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleApproveShuffle}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Check className="w-4 h-4" /> परमिशन दें (Approve)
                </button>
                <button 
                  onClick={() => setAiSuggestion(null)}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" /> रिजेक्ट करें
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {userRole === 'super-admin' && (
        <div className="bg-[#0b171e] p-4 rounded-2xl border border-[#e6007a]/40 shadow-lg mb-6">
          <h3 className="text-sm font-bold text-[#e6007a] tracking-wider mb-3 flex items-center gap-2">
            <span>🛡️</span> सब-एडमिन मैनेजमेंट (Sub-Admin Control)
          </h3>
          <p className="text-xs text-slate-400 mb-4">यहाँ से आप पार्टनर/भाई को जोड़ सकते हैं या उनकी पावर हटा सकते हैं।</p>
          
          <form onSubmit={handleCreateSubAdmin} className="space-y-3">
            <input 
              type="text" 
              placeholder="भाई/पार्टनर की लॉगिन आईडी या ईमेल" 
              value={subAdminEmail}
              onChange={(e) => setSubAdminEmail(e.target.value)}
              className="w-full bg-[#051014] text-[#00e6e6] p-3 text-sm rounded-xl border border-[#008080]/30 focus:outline-none focus:border-[#e6007a]"
              required
              disabled={loading}
            />
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-[#e6007a] to-[#700080] text-white text-xs font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'प्रक्रिया जारी...' : 'सब-एडमिन जोड़ें'}
              </button>
              <button 
                type="button" 
                onClick={handleRemoveSubAdmin} 
                className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold px-4 rounded-xl active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                पावर हटाएँ
              </button>
            </div>
          </form>
        </div>
      )}

      {(userRole === 'super-admin' || userRole === 'sub-admin') && (
        <div className="bg-[#0b171e] p-4 rounded-2xl border border-[#008080]/40 shadow-lg">
          <h3 className="text-sm font-bold text-[#00e6e6] tracking-wider mb-3 flex items-center gap-2">
            <span>👥</span> ग्राहक आईडी और पासवर्ड जनरेटर
          </h3>
          <p className="text-xs text-slate-400 mb-4">यहाँ से नए ग्राहकों को लाइव आईडी दी जा सकती है या उनका पासवर्ड बदला जा सकता है।</p>

          <form onSubmit={handleCreateUser} className="space-y-3">
            <input 
              type="text" 
              placeholder="नई यूज़र आईडी (User ID)" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-[#051014] text-[#00e6e6] p-3 text-sm rounded-xl border border-[#008080]/30 focus:outline-none focus:border-[#00e6e6]"
              required
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="नया पासवर्ड (Password)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#051014] text-[#00e6e6] p-3 text-sm rounded-xl border border-[#008080]/30 focus:outline-none focus:border-[#00e6e6]"
              required
              disabled={loading}
            />
            <button 
              type="submit" 
              className="w-full bg-[#008080] text-white text-xs font-bold py-3 rounded-xl hover:bg-[#00e6e6] transition-all active:scale-95 shadow-[0_0_10px_rgba(0,128,128,0.3)] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'डेटाबेस में सुरक्षित हो रहा है...' : 'आईडी जनरेट / पासवर्ड अपडेट करें'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
