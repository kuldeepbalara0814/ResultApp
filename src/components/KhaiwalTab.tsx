import React from 'react';
import { ShieldCheck, MessageCircle, Gamepad2 } from 'lucide-react';

export default function KhaiwalTab() {
  // यह आपके ट्रस्टेड खाईवाल की डिफ़ॉल्ट लिस्ट है
  const khaiwals = [
    { 
      id: '1', 
      name: 'Trusted VIP Khaiwal', 
      whatsapp: '919876543210', 
      verified: true, 
      jodiRate: '10 Ka 900', 
      harufRate: '100 Ka 900' 
    }
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-xl font-bold text-white mb-4">Trusted Khaiwal</h2>
      
      {khaiwals.map((k) => (
        <div key={k.id} className="bg-[#131C31] rounded-xl shadow-md border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-teal-100" />
              <h3 className="font-bold text-lg">{k.name}</h3>
            </div>
            {k.verified && <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Verified</span>}
          </div>
          
          {/* Rate Boxes */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
                <div className="text-xs text-slate-400 font-bold mb-1">Jodi Rate</div>
                <div className="text-lg font-black text-teal-400">{k.jodiRate}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
                <div className="text-xs text-slate-400 font-bold mb-1">Haruf Rate</div>
                <div className="text-lg font-black text-teal-400">{k.harufRate}</div>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 text-center font-medium">
              Sabse tez payment, 100% bharosemand aur safe.
            </p>
            
            {/* Buttons */}
            <div className="flex gap-2">
              <a href={`https://wa.me/${k.whatsapp}?text=Hello%20sir,%20Mujhe%20game%20play%20karna%20hai`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-green-600 transition-colors">
                <MessageCircle size={18} />
                WhatsApp
              </a>
              <button className="flex-1 bg-teal-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-teal-700 transition-colors">
                <Gamepad2 size={18} />
                Play Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Ad Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center mt-6">
        <h4 className="font-bold text-teal-400 mb-2">Apna Ad Yahan Lagwayein</h4>
        <p className="text-sm text-slate-400 mb-3">Best khaiwal banne ke liye yahan ad lagwaye. Hum trusted khaiwal se contact karke promotion karte hain.</p>
        <button className="bg-slate-700 text-white border border-slate-600 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-600 transition-colors text-sm">
          Contact For Ad
        </button>
      </div>
    </div>
  );
}
