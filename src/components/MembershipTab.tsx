import React from 'react';
import { CreditCard, CheckCircle, Star } from 'lucide-react';

const plans = [
  {
    name: 'बेसिक',
    price: '₹299/माह',
    features: ['5 प्रेडिक्शन/दिन', 'बेसिक एनालिटिक्स', 'ईमेल सपोर्ट'],
    highlight: false,
  },
  {
    name: 'प्रो',
    price: '₹599/माह',
    features: ['अनलिमिटेड प्रेडिक्शन', 'एडवांस एनालिटिक्स', 'प्राथमिकता सपोर्ट', 'डेटा बैकअप'],
    highlight: true,
  },
  {
    name: 'प्रीमियम',
    price: '₹999/माह',
    features: ['सब कुछ प्रो में', 'AI असिस्टेंट', 'कस्टम रिपोर्ट', 'डेडिकेटेड सपोर्ट'],
    highlight: false,
  },
];

export default function MembershipTab() {
  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="w-5 h-5 text-teal-400" />
        <h1 className="text-xl font-bold text-teal-400">मेंबरशिप प्लान्स</h1>
      </div>

      <p className="text-slate-400 text-sm">
        अपनी जरूरत के हिसाब से सही प्लान चुनें और अपनी प्रेडिक्शन क्षमता बढ़ाएं।
      </p>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-4 ${
              plan.highlight
                ? 'bg-teal-400/10 border-teal-400/50'
                : 'bg-[#111827] border-slate-800'
            }`}
          >
            {plan.highlight && (
              <div className="flex items-center gap-1 text-teal-400 text-xs font-semibold mb-2">
                <Star className="w-3.5 h-3.5" />
                सबसे लोकप्रिय
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-bold ${plan.highlight ? 'text-teal-400' : 'text-white'}`}>
                {plan.name}
              </h2>
              <span className={`text-sm font-semibold ${plan.highlight ? 'text-teal-400' : 'text-slate-300'}`}>
                {plan.price}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-teal-400 text-slate-900 hover:bg-teal-300'
                  : 'bg-[#1F2937] text-white hover:bg-[#374151] border border-slate-700'
              }`}
            >
              प्लान चुनें
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
