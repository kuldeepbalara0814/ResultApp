import React from 'react';
import { Home, Zap, FileText, History, Activity, CreditCard, Users } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'होम', icon: Home },
  { id: 'predict', label: 'प्रेडिक्ट', icon: Zap },
  { id: 'result', label: 'रिजल्ट', icon: FileText },
  { id: 'records', label: 'रिकॉर्ड', icon: History },
  { id: 'tracker', label: 'ट्रैकर', icon: Activity },
  { id: 'membership', label: 'मेंबर', icon: CreditCard },
  { id: 'khaiwal', label: 'खैवाल', icon: Users },
];

export default function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0B1120] border-t border-slate-800 z-50">
      <div className="flex justify-around items-center h-16 px-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-0.5 transition-colors ${
              activeTab === id ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-[9px] font-medium truncate w-full text-center">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
