import React, { useState } from 'react';

export default function AdminPanelTab({ userRole, setUserRole }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [subAdminEmail, setSubAdminEmail] = useState('');

  const handleCreateUser = (e) => {
    e.preventDefault();
    alert(`सफलतापूर्वक नया ग्राहक बनाया गया! ID: ${userId}`);
    setUserId(''); setPassword('');
  };

  const handleCreateSubAdmin = (e) => {
    e.preventDefault();
    alert(`नया सब-एडमिन जोड़ा गया: ${subAdminEmail}`);
    setSubAdminEmail('');
  };

  return (
    <div className="p-4 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-200">
      
      {/* 🔄 टेस्टिंग के लिए रोल चेंज करने का गुप्त बटन (इसे बाद में हटा सकते हैं) */}
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
      
      {/* 📢 वर्तमान रोल की जानकारी और भाषा */}
      <div className="mb-6 p-2.5 bg-[#051014] rounded-xl border border-[#008080]/20 text-xs">
        {userRole === 'super-admin' ? (
          <p className="text-[#00e6e6]">👑 <strong>Super Admin (आप):</strong> आपके पास इस पूरे सिस्टम का 100% कंट्रोल है। आप सब-एडमिन की पावर भी छीन सकते हैं।</p>
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
          <p className="text-xs text-slate-400 mb-4">यहाँ से आप पार्टनर/भाई को जोड़ सकते हैं या उनकी पावर डिलीट कर सकते हैं।</p>
          
          <form onSubmit={handleCreateSubAdmin} className="space-y-3">
            <input 
              type="email" 
              placeholder="भाई/पार्टनर की ईमेल आईडी" 
              value={subAdminEmail}
              onChange={(e) => setSubAdminEmail(e.target.value)}
              className="w-full bg-[#051014] text-[#00e6e6] p-3 text-sm rounded-xl border border-[#008080]/30 focus:outline-none focus:border-[#e6007a]"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-[#e6007a] to-[#700080] text-white text-xs font-bold py-3 rounded-xl transition-all active:scale-95">
                सब-एडमिन जोड़ें
              </button>
              <button type="button" onClick={() => alert('सब-एडमिन की पावर हटा दी गई!')} className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold px-4 rounded-xl active:scale-95">
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
          />
          <input 
            type="password" 
            placeholder="नया पासवर्ड (Password)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#051014] text-[#00e6e6] p-3 text-sm rounded-xl border border-[#008080]/30 focus:outline-none focus:border-[#00e6e6]"
            required
          />
          <button type="submit" className="w-full bg-[#008080] text-white text-xs font-bold py-3 rounded-xl hover:bg-[#00e6e6] transition-all active:scale-95 shadow-[0_0_10px_rgba(0,128,128,0.3)]">
            आईडी जनरेट / पासवर्ड अपडेट करें
          </button>
        </form>
      </div>
    </div>
  );
}
