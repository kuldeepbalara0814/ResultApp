import React from 'react';

const MembershipTab = () => {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6 mb-24">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-orange-500/20 p-3 rounded-xl">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" className="hidden" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="hidden"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">VIP Membership</h1>
          <p className="text-slate-400 text-sm">Premium access unlock करें</p>
        </div>
      </div>

      {/* Free Account Active Status */}
      <div className="bg-[#131C31] border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h3 className="text-orange-400 font-bold text-sm">Free Account Active</h3>
            <p className="text-slate-400 text-xs mt-0.5">VIP plan lein aur 30 jodi daily paayen</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>

      {/* 1 Year Plan (Orange) */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 relative shadow-[0_8px_30px_rgb(249,115,22,0.3)] overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          BEST VALUE
        </div>
        <h2 className="text-white text-xl font-bold mb-1">1 Year Plan</h2>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-white text-4xl font-extrabold">₹21,000</span>
          <span className="text-orange-100 text-sm">/ year</span>
        </div>
        <div className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg inline-block mb-5">
          Save ₹21,000 vs Monthly
        </div>
        
        <ul className="space-y-3 mb-6">
          {['2 Jodi special (Month me 4 baar)', '30 Jodi daily with risk management', 'Priority Chat Support', 'Compound magic access', 'VIP WhatsApp Group'].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/90 text-sm">
              <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {feature}
            </li>
          ))}
        </ul>
        <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-50 transition">
          Plan Kharidein
        </button>
      </div>

      {/* Monthly Plan (Teal/Peacock) */}
      <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-6 relative shadow-lg">
        <h2 className="text-white text-xl font-bold mb-1">Monthly Plan</h2>
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-white text-4xl font-extrabold">₹3,500</span>
          <span className="text-teal-100 text-sm">/ month</span>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['30 Jodi daily access', 'Risk management support', 'Standard Chat Support', 'WhatsApp Group Access'].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/90 text-sm">
              <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {feature}
            </li>
          ))}
        </ul>
        <button className="w-full bg-white text-teal-600 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-50 transition">
          Plan Kharidein
        </button>
      </div>

      {/* 7 Day Trial Plan (Dark Slate) */}
      <div className="bg-[#1E293B] rounded-2xl p-6 relative border border-slate-700 shadow-lg">
        <div className="absolute top-4 right-4 bg-slate-700 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full">
          STARTER
        </div>
        <h2 className="text-white text-xl font-bold mb-1">7 Day Trial</h2>
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-white text-4xl font-extrabold">₹1,500</span>
          <span className="text-slate-400 text-sm">/ 7 days</span>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['7 Days full access', '30 Jodi daily', 'Basic Support'].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {feature}
            </li>
          ))}
        </ul>
        <button className="w-full bg-white text-slate-800 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-200 transition">
          Trial Shuru Karein
        </button>
      </div>

    </div>
  );
};

export default MembershipTab;
