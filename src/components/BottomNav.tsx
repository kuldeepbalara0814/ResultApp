import React from 'react';
import { Home, Zap, ClipboardCheck, List, Activity } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'predict', icon: Zap, label: 'Predict' },
    { id: 'result', icon: ClipboardCheck, label: 'Result' },
    { id: 'records', icon: List, label: 'Records' },
    { id: 'tracker', icon: Activity, label: 'Tracker' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#161824] border-t border-slate-800 pb-safe">
      <div className="flex justify-between items-center px-2 py-3 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full space-y-1 ${
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
