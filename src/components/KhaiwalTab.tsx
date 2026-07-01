import React, { useState, useEffect } from 'react';
import { calculateLedger } from '../utils/ledger'; 

const KhaiwalTab = () => {
  const [jodiText, setJodiText] = useState("");
  const [selectedGame, setSelectedGame] = useState("FD");
  
  const [khaiwalNumber, setKhaiwalNumber] = useState("");
  const [isEditingNumber, setIsEditingNumber] = useState(false);

  const [amountPerJodi, setAmountPerJodi] = useState<number>(10);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // पेज लोड होने पर नंबर मजबूत तरीके से निकालना
  useEffect(() => {
    const savedNumber = localStorage.getItem("khaiwalNumber");
    if (savedNumber && savedNumber.length >= 10) {
      setKhaiwalNumber(savedNumber);
      setIsEditingNumber(false);
    } else {
      setIsEditingNumber(true); 
    }
  }, []);

  // लेजर से ऑटो-रेट सेट करना
  useEffect(() => {
    let rates = { FD: 10, GB: 15, GL: 20, DS: 25 }; 
    
    try {
      const ledgerData = calculateLedger();
      if (ledgerData && ledgerData.currentRates) {
        rates = ledgerData.currentRates; 
      }
    } catch (error) {
      console.log("Ledger error:", error);
    }

    if (selectedGame === 'FD') setAmountPerJodi(rates.FD);
    else if (selectedGame === 'GB') setAmountPerJodi(rates.GB);
    else if (selectedGame === 'GL') setAmountPerJodi(rates.GL);
    else if (selectedGame === 'DS') setAmountPerJodi(rates.DS);
    
  }, [selectedGame]);

  // नंबर सेव करने का 100% पक्का फंक्शन
  const handleSaveNumber = () => {
    const cleanNumber = khaiwalNumber.replace(/\D/g, ''); // सिर्फ नंबर रखें
    if (cleanNumber.length < 10) {
      alert("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें!");
      return;
    }
    localStorage.setItem("khaiwalNumber", cleanNumber);
    setKhaiwalNumber(cleanNumber);
    setIsEditingNumber(false);
    alert("खाईवाल का नंबर सफलतापूर्वक सुरक्षित हो गया है! अब यह हमेशा सेव रहेगा।");
  };

  // WhatsApp मैसेज का नया प्रोफेशनल फॉर्मेट
  const handleWhatsAppClick = () => {
    if (!khaiwalNumber) {
      alert("कृपया पहले खाईवाल का व्हाट्सएप नंबर सेव करें!");
      return;
    }
    if (!jodiText.trim()) {
      alert("कृपया पहले नीचे दिए गए बटन से 30 जोड़ी Generate करें!");
      return;
    }

    const totalAmount = 30 * amountPerJodi; 
    // नया फॉर्मेट
    const message = `**${selectedGame}**\n\n${jodiText}\n\nप्रति जोड़ी: ₹${amountPerJodi}\nकुल राशि (Total Amount): ₹${totalAmount}`;
    
    const formattedNumber = khaiwalNumber.replace(/\D/g, ''); 
    const url = `https://wa.me/91${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleGenerateClick = () => {
    const savedJodis = localStorage.getItem("lastPrediction");
    
    if (savedJodis) {
      try {
        const jodisArr = JSON.parse(savedJodis); 
        if (Array.isArray(jodisArr) && jodisArr.length > 0) {
          setJodiText(jodisArr.join(", ")); 
          return;
        }
      } catch (e) {
        console.error("जोड़ी निकालने में गलती हुई:", e);
      }
    }
    
    alert("अभी कोई नई प्रेडिक्शन नहीं मिली है! कृपया पहले 'आज की प्रेडिक्शन' टैब में जाकर जोड़ियाँ निकालें।");
  };

  const handleDownloadExcel = () => {
    if (!startDate || !endDate) {
      alert("कृपया शुरुआत और अंत की तारीख चुनें!");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8,तारीख (Date),गेम (Game),जोड़ी (Jodis),अमाउंट (Amount),स्टेटस (Status)\n"
      + `${startDate},FD,"12, 14, 15...",300,Pending\n`
      + `${endDate},GB,"22, 24, 25...",300,Pass\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Khaiwal_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 mb-24">
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">खाईवाल</h1>
        <p className="text-slate-400 text-sm">30 जोड़ी खाईवाल को भेजें</p>
      </div>

      <div className="bg-[#131C31] rounded-2xl p-4 border border-gray-800">
        <h3 className="text-slate-300 text-sm mb-3">खाईवाल का व्हाट्सएप नंबर</h3>
        <div className="flex gap-2">
          <span className="bg-[#1E293B] text-slate-400 p-3 rounded-xl border border-gray-700">+91</span>
          <input
            type="tel"
            disabled={!isEditingNumber}
            value={khaiwalNumber}
            onChange={(e) => setKhaiwalNumber(e.target.value)}
            placeholder="10 अंकों का मोबाइल नंबर"
            className={`flex-1 bg-[#0B1120] text-teal-400 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold tracking-widest ${!isEditingNumber ? 'opacity-70' : ''}`}
          />
          {isEditingNumber ? (
            <button onClick={handleSaveNumber} className="bg-teal-500 hover:bg-teal-600 text-white px-4 rounded-xl font-bold transition">
              सेव
            </button>
          ) : (
            <button onClick={() => setIsEditingNumber(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-xl font-bold transition">
              बदलें
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#0f9d58] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-white font-bold text-lg">Trusted VIP Khaiwal</h2>
          </div>
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-md font-medium">Verified</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="text-teal-100 text-xs mb-1">Jodi Rate</p>
            <p className="text-white font-bold text-lg">10 Ka 900</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="text-teal-100 text-xs mb-1">Haruf Rate</p>
            <p className="text-white font-bold text-lg">100 Ka 900</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleWhatsAppClick} className="flex items-center justify-center gap-2 bg-white text-[#0f9d58] font-bold py-2.5 rounded-xl hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
          <button onClick={handleWhatsAppClick} className="flex items-center justify-center gap-2 bg-[#0B1120]/40 text-white font-bold py-2.5 rounded-xl hover:bg-[#0B1120]/60 transition border border-white/20">
            Play Now
          </button>
        </div>
      </div>

      <div className="bg-[#131C31] rounded-2xl p-4 border border-gray-800">
        <h3 className="text-slate-300 text-sm mb-3">गेम और अमाउंट चुनें</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['FD', 'GB', 'GL', 'DS'].map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`py-2 rounded-lg font-bold transition-all duration-300 ${
                selectedGame === game 
                  ? 'bg-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.4)]' 
                  : 'bg-[#1E293B] text-slate-400 hover:bg-[#2A3B52]'
              }`}
            >
              {game}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between bg-[#0B1120] p-3 rounded-xl border border-gray-700">
          <span className="text-slate-400 text-sm">प्रति जोड़ी लगाएं:</span>
          <div className="flex items-center gap-2">
            <span className="text-teal-400 font-bold">₹</span>
            <input
              type="number"
              value={amountPerJodi}
              onChange={(e) => setAmountPerJodi(Number(e.target.value) || 0)}
              className="w-20 bg-transparent text-white font-bold outline-none text-right"
              min="5"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#131C31] rounded-2xl p-4 border border-gray-800">
        <textarea
          className="w-full bg-[#0B1120] text-teal-400 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-center mb-3"
          rows={4}
          placeholder="आपकी 30 जोड़ी यहाँ आएँगी..."
          value={jodiText}
          onChange={(e) => setJodiText(e.target.value)}
        ></textarea>
        
        <button
          onClick={handleGenerateClick}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] transition duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          30 जोड़ी यहाँ लाएँ (Auto-fill)
        </button>
      </div>

      <div className="bg-[#131C31] rounded-2xl p-4 border border-gray-800">
        <h3 className="text-slate-300 text-sm mb-3">खाईवाल एक्सेल रिपोर्ट (Excel/CSV)</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">शुरुआत (From Date)</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#0B1120] text-sm text-slate-300 border border-gray-700 rounded-lg p-2 outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">अंत (To Date)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#0B1120] text-sm text-slate-300 border border-gray-700 rounded-lg p-2 outline-none focus:border-teal-500" />
          </div>
        </div>
        <button onClick={handleDownloadExcel} className="w-full bg-[#1E293B] hover:bg-[#2A3B52] text-teal-400 font-bold py-2 rounded-xl border border-teal-500/30 transition">
          रिपोर्ट डाउनलोड करें
        </button>
      </div>

    </div>
  );
};

export default KhaiwalTab;
