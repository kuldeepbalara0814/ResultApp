import React, { useState, useEffect } from 'react';
import { Tag, CheckCircle2, Edit3, Save, X } from 'lucide-react';

const MembershipTab = () => {
  // प्लान्स की बेस प्राइस (Base Prices)
  const [prices, setPrices] = useState({
    yearly: 21000,
    monthly: 3500,
    trial: 1500
  });

  // डिस्काउंट और कूपन स्टेट
  const [couponCode, setCouponCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState(0); // 0, 10, 20, 50, 70
  const [couponMessage, setCouponMessage] = useState('');
  
  // एडमिन एडिट मोड स्टेट
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrices, setEditPrices] = useState({ ...prices });

  // पेज लोड होने पर एडमिन चेक करें और सेव की गई कीमतें निकालें
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') setIsAdmin(true);

    const savedPrices = localStorage.getItem('membershipPrices');
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
      setEditPrices(JSON.parse(savedPrices));
    }
  }, []);

  // कूपन अप्लाई करने का फंक्शन
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE10') {
      setActiveDiscount(10);
      setCouponMessage('कूपन लागू! 10% की छूट मिल गई है।');
    } else if (code === 'VIP20') {
      setActiveDiscount(20);
      setCouponMessage('कूपन लागू! 20% की छूट मिल गई है।');
    } else if (code === 'SPECIAL50') {
      setActiveDiscount(50);
      setCouponMessage('कूपन लागू! 50% की बम्पर छूट मिल गई है।');
    } else if (code === 'ADMIN70') {
      setActiveDiscount(70);
      setCouponMessage('एडमिन कूपन लागू! 70% की विशेष छूट मिल गई है।');
    } else {
      setActiveDiscount(0);
      setCouponMessage('❌ अमान्य (Invalid) कूपन कोड!');
    }
  };

  // कूपन हटाने का फंक्शन
  const handleRemoveCoupon = () => {
    setActiveDiscount(0);
    setCouponCode('');
    setCouponMessage('');
  };

  // एडमिन द्वारा नई कीमतें सेव करने का फंक्शन
  const handleSavePrices = () => {
    setPrices(editPrices);
    localStorage.setItem('membershipPrices', JSON.stringify(editPrices));
    setIsEditing(false);
    alert("नए प्लान की कीमतें सफलतापूर्वक सेव हो गई हैं!");
  };

  // डिस्काउंट के बाद की कीमत निकालने का फॉर्मूला
  const getFinalPrice = (basePrice: number) => {
    if (activeDiscount === 0) return basePrice;
    return basePrice - (basePrice * activeDiscount) / 100;
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 mb-24 font-sans relative">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-3 rounded-xl">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">VIP Membership</h1>
            <p className="text-slate-400 text-sm">Premium access unlock करें</p>
          </div>
        </div>
        
        {/* Admin Edit Button */}
        {isAdmin && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-slate-800 text-teal-400 p-2 rounded-lg border border-teal-500/30 flex items-center gap-1 text-xs font-bold shadow-lg">
            <Edit3 className="w-4 h-4" /> एडिट
          </button>
        )}
      </div>

      {/* Admin Edit Panel */}
      {isAdmin && isEditing && (
        <div className="bg-[#1C1F2D] border border-teal-500/50 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-teal-400 font-bold text-sm">प्लान की कीमतें बदलें (Admin)</h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-red-400"><X className="w-5 h-5"/></button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">1 Year Plan (₹):</span>
              <input type="number" value={editPrices.yearly} onChange={(e) => setEditPrices({...editPrices, yearly: Number(e.target.value)})} className="bg-[#0B1120] text-white border border-slate-700 rounded p-1.5 w-24 text-right outline-none focus:border-teal-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Monthly Plan (₹):</span>
              <input type="number" value={editPrices.monthly} onChange={(e) => setEditPrices({...editPrices, monthly: Number(e.target.value)})} className="bg-[#0B1120] text-white border border-slate-700 rounded p-1.5 w-24 text-right outline-none focus:border-teal-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">7 Day Trial (₹):</span>
              <input type="number" value={editPrices.trial} onChange={(e) => setEditPrices({...editPrices, trial: Number(e.target.value)})} className="bg-[#0B1120] text-white border border-slate-700 rounded p-1.5 w-24 text-right outline-none focus:border-teal-400" />
            </div>
            <button onClick={handleSavePrices} className="w-full bg-teal-500 text-slate-900 font-bold py-2 rounded-lg mt-2 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> कीमतें सेव करें
            </button>
          </div>
        </div>
      )}

      {/* Free Account Active Status */}
      <div className="bg-[#131C31] border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-orange-400" />
          <div>
            <h3 className="text-orange-400 font-bold text-sm">Free Account Active</h3>
            <p className="text-slate-400 text-xs mt-0.5">VIP plan lein aur 30 jodi daily paayen</p>
          </div>
        </div>
      </div>

      {/* 1 Year Plan (Orange) */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 relative shadow-[0_8px_30px_rgb(249,115,22,0.3)] overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          BEST VALUE
        </div>
        <h2 className="text-white text-xl font-bold mb-1">1 Year Plan</h2>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-white text-4xl font-extrabold">₹{getFinalPrice(prices.yearly).toLocaleString('en-IN')}</span>
          {activeDiscount > 0 && (
            <span className="text-orange-200 text-lg line-through">₹{prices.yearly.toLocaleString('en-IN')}</span>
          )}
          <span className="text-orange-100 text-sm">/ year</span>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['2 Jodi special (Month me 4 baar)', '30 Jodi daily with risk management', 'Priority Chat Support', 'Compound magic access', 'VIP WhatsApp Group'].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/90 text-sm">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
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
        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-white text-4xl font-extrabold">₹{getFinalPrice(prices.monthly).toLocaleString('en-IN')}</span>
          {activeDiscount > 0 && (
            <span className="text-teal-200 text-lg line-through">₹{prices.monthly.toLocaleString('en-IN')}</span>
          )}
          <span className="text-teal-100 text-sm">/ month</span>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['30 Jodi daily access', 'Risk management support', 'Standard Chat Support', 'WhatsApp Group Access'].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/90 text-sm">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
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
        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-white text-4xl font-extrabold">₹{getFinalPrice(prices.trial).toLocaleString('en-IN')}</span>
          {activeDiscount > 0 && (
            <span className="text-slate-500 text-lg line-through">₹{prices.trial.toLocaleString('en-IN')}</span>
          )}
          <span className="text-slate-400 text-sm">/ 7 days</span>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['7 Days full access', '30 Jodi daily', 'Basic Support'].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <button className="w-full bg-white text-slate-800 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-200 transition">
          Trial Shuru Karein
        </button>
      </div>

      {/* Coupon & Discount Section */}
      <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-teal-400" />
          <h3 className="text-white font-bold text-sm">डिस्काउंट कूपन (Coupon Code)</h3>
        </div>
        
        {activeDiscount === 0 ? (
          <div className="flex gap-2">
            <input 
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="यहाँ कूपन डालें..."
              className="flex-1 bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-teal-400"
            />
            <button 
              onClick={handleApplyCoupon}
              className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-4 rounded-xl transition"
            >
              अप्लाई
            </button>
          </div>
        ) : (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-teal-400 font-bold text-sm">{couponCode} ({activeDiscount}% OFF)</p>
              <p className="text-slate-400 text-xs mt-0.5">कूपन सफलतापूर्ण लागू हो गया है!</p>
            </div>
            <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {couponMessage && activeDiscount === 0 && (
          <p className="text-red-400 text-xs mt-2 font-medium">{couponMessage}</p>
        )}
      </div>

      {/* Available Coupons Hint (Only visible to Admin) */}
      {isAdmin && (
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 mt-2">
          <p className="text-xs text-slate-400 mb-1 font-bold">Admin Only - कूपन कोड्स:</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] bg-slate-700 text-white px-2 py-1 rounded">SAVE10 (10%)</span>
            <span className="text-[10px] bg-slate-700 text-white px-2 py-1 rounded">VIP20 (20%)</span>
            <span className="text-[10px] bg-slate-700 text-white px-2 py-1 rounded">SPECIAL50 (50%)</span>
            <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded">ADMIN70 (70%)</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default MembershipTab;
