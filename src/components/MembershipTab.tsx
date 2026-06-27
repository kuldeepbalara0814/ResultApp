import React from 'react';
import { Crown, CheckCircle, MessageCircle } from 'lucide-react';

const plans = [
  {
    id: 'yearly',
    label: '1 Year Plan',
    price: '₹21,000',
    period: '/ year',
    badge: 'BEST VALUE',
    features: [
      '2 Jodi special (Month me 4 baar)',
      '30 Jodi daily with risk management par',
      'Compound magic janane ke liye chat box me chat karein',
    ],
    btnLabel: 'Plan Kharidein',
    cardClass: 'bg-gradient-to-br from-amber-500 to-yellow-400',
    badgeClass: 'bg-red-500 text-white',
    textClass: 'text-white',
    subTextClass: 'text-yellow-100',
    btnClass: 'bg-white text-amber-600 hover:bg-yellow-50',
    iconColor: 'text-yellow-200',
    featured: true,
  },
  {
    id: 'monthly',
    label: 'Monthly Plan',
    price: '₹3,500',
    period: '/ month',
    badge: '',
    features: [
      '30 Jodi daily access',
      'Risk management support',
      'Standard Chat Support',
    ],
    btnLabel: 'Plan Kharidein',
    cardClass: 'bg-gradient-to-br from-teal-600 to-teal-500',
    badgeClass: '',
    textClass: 'text-white',
    subTextClass: 'text-teal-100',
    btnClass: 'bg-white text-teal-700 hover:bg-teal-50',
    iconColor: 'text-teal-200',
    featured: false,
  },
  {
    id: 'trial',
    label: '7 Day Trial Plan',
    price: '₹1,500',
    period: '/ 7 days',
    badge: '',
    features: [
      '7 Days full access',
      '30 Jodi daily',
    ],
    btnLabel: 'Trial Shuru Karein',
    cardClass: 'bg-[#1E293B] border border-slate-700',
    badgeClass: '',
    textClass: 'text-white',
    subTextClass: 'text-slate-400',
    btnClass: 'bg-white text-slate-800 hover:bg-slate-100',
    iconColor: 'text-teal-400',
    featured: false,
  },
];

export default function MembershipTab() {
  const handleBuy = (plan: typeof plans[0]) => {
    const msg = `Namaste, mujhe ${plan.label} (${plan.price}${plan.period}) lena hai.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h1 className="text-xl font-bold text-white">VIP Membership</h1>
      </div>

      <p className="text-slate-400 text-sm">
        Apni zaroorat ke hisab se sahi plan chunein aur apni prediction ki takat badhayein.
      </p>

      {/* Plan Cards */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-2xl p-5 relative overflow-hidden ${plan.cardClass}`}>
            {/* BEST VALUE badge */}
            {plan.badge && (
              <div className={`absolute top-0 right-0 ${plan.badgeClass} text-xs font-bold px-3 py-1.5 rounded-bl-2xl rounded-tr-2xl`}>
                {plan.badge}
              </div>
            )}

            {/* Plan name + icon */}
            <div className="flex items-center justify-between mb-1">
              <h2 className={`text-lg font-bold ${plan.textClass}`}>{plan.label}</h2>
              {plan.featured && <Crown className={`w-6 h-6 ${plan.iconColor}`} />}
            </div>

            {/* Price */}
            <div className={`mb-4 ${plan.textClass}`}>
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className={`text-base ml-1 ${plan.subTextClass}`}>{plan.period}</span>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className={`flex items-start gap-2 text-sm ${plan.textClass}`}>
                  <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.iconColor}`} />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleBuy(plan)}
              className={`w-full py-3 rounded-xl font-bold text-base transition-colors ${plan.btnClass}`}
            >
              {plan.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* WhatsApp contact */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <MessageCircle className="w-8 h-8 text-[#25D366] shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">किसी plan के बारे में पूछना है?</p>
          <p className="text-slate-400 text-xs mt-0.5">WhatsApp पर message करें, तुरंत जवाब मिलेगा।</p>
        </div>
        <button
          onClick={() => window.open('https://wa.me/?text=Mujhe%20membership%20ke%20baare%20mein%20jaanna%20hai', '_blank')}
          className="ml-auto shrink-0 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          Chat
        </button>
      </div>
    </div>
  );
}
