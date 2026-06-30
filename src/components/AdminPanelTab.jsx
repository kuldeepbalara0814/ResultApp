import React, { useState } from 'react';
// 🛡️ फ़ायरबेस के ज़रूरी फंक्शन्स इम्पोर्ट किए
import { doc, setDoc } from 'firebase/firestore'; 
// 🎯 आपके स्क्रीनशॉट "8385.jpg" के आधार पर फ़ायरबेस का बिल्कुल सही रास्ता (Path)
import { db } from '../firebase/config'; 

export default function AdminPanelTab({ userRole, setUserRole }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [subAdminEmail, setSubAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // 👥 ग्राहकों की आईडी बनाने या पासवर्ड बदलने का असली फंक्शन
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // { merge: true } सुनिश्चित करता है कि पुराना कुछ भी डिलीट न हो, सिर्फ़ अपडेट हो
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

  // 👑 केवल आपके (Super Admin) लिए सब-एडमिन बनाने का असली फंक्शन
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

  // 🛑 सब-एडमिन की पावर हटाने का फंक्शन
  const handleRemoveSubAdmin = async () => {
    if (!subAdminEmail) {
      alert("कृपया पहले उस सब-एडमिन की आईडी ऊपर बॉक्स में लिखें जिसे हटाना है।");
      return;
    }
    
    if (window.confirm(`क्या आप सचमुच ${subAdminEmail} से सब-एडमिन की power हटाना चाहते हैं?`)) {
      setLoading(true);
      try {
        await setDoc(doc(db, "users", subAdminEmail.trim()), {
          role: 'user', // रोल बदलकर नॉर्मल यूज़र कर दिया, डिलीट कुछ नहीं हुआ
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

  return (
    <div className="p-4 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-200">
      
      {/* 🔄 टेस्टिंग बटन */}
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

      {/* 👑 केवल मुख्य एडमिन (Super Admin - आपको) को दिखेगा */}
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

      {/* 👥 यूज़र मैनेजमेंट - यह एडमिन (आपको) और सब-एडमिन (भाई) दोनों को दिखेगा */}
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
    </div>
  );
}
