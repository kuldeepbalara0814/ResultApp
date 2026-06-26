import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function AppLock({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');

  const handleCheck = (val: string) => {
    setInput(val);
    // 1234 आपका नॉर्मल पिन है, Kuldeep0814 आपका मास्टर पिन
    if (val === '1234' || val === 'Kuldeep0814') {
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B1120] z-50 flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-[#111827] border border-slate-700 p-8 rounded-3xl text-center shadow-2xl w-full max-w-sm">
        <Lock className="w-16 h-16 text-teal-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">App Locked</h2>
        <p className="text-slate-400 mb-8">सुरक्षा के लिए पिन दर्ज करें</p>
        
        <input 
          type="password"
          maxLength={15}
          value={input}
          onChange={(e) => handleCheck(e.target.value)}
          placeholder="Enter PIN"
          className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl font-mono text-teal-400 focus:outline-none focus:border-teal-400"
        />
      </div>
    </div>
  );
}
