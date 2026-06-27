import React from 'react';
import { Crown } from 'lucide-react';

export default function MembershipTab() {
  return (
    <div className="space-y-4 p-4">
      {/* Yearly Plan */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg border border-yellow-300 p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">1 Year Plan</h3>
          <Crown size={24} className="text-yellow-100" />
        </div>
        <div className="text-3xl font-black mb-4">₹21,000 <span className="text-sm font-medium opacity-80">/ year</span></div>
        <ul className="space-y-2 text-sm font-medium mb-5">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0"></div> 
            <span>2 Jodi special (Month me 4 baar)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0"></div> 
            <span>30 Jodi daily with risk management par</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0"></div> 
            <span>Compound magic janane ke liye chat box me chat karein</span>
          </li>
        </ul>
        <button className="w-full bg-white text-yellow-600 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Plan Kharidein
        </button>
      </div>

      {/* Monthly Plan */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md border border-teal-400 p-5 text-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">Monthly Plan</h3>
        </div>
        <div className="text-3xl font-black mb-4">₹3,500 <span className="text-sm font-medium opacity-80">/ month</span></div>
        <ul className="space-y-2 text-sm font-medium mb-5">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-100 rounded-full"></div> 30 Jodi daily access</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-100 rounded-full"></div> Risk management support</li>
        </ul>
        <button className="w-full bg-white text-teal-700 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Plan Kharidein
        </button>
      </div>

      {/* 7 Day Trial Plan */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-md border border-gray-600 p-5 text-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-100">7 Day Trial Plan</h3>
        </div>
        <div className="text-3xl font-black mb-4">₹1,500 <span className="text-sm font-medium opacity-80 text-gray-300">/ 7 days</span></div>
        <ul className="space-y-2 text-sm font-medium mb-5 text-gray-200">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> 7 Days full access</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> 30 Jodi daily</li>
        </ul>
        <button className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Trial Shuru Karein
        </button>
      </div>
    </div>
  );
}
