import React, { useState } from 'react';

const KhaiwalTab = () => {
  // 30 जोड़ी लिखने के लिए स्टेट (आपका पुराना लॉजिक सुरक्षित है)
  const [jodiText, setJodiText] = useState("");
  
  // गेम सेलेक्ट करने के लिए स्टेट (FD, GB, GL, DS)
  const [selectedGame, setSelectedGame] = useState("FD");
  
  // यहाँ अपना WhatsApp नंबर लिखें
  const phoneNumber = "919876543210"; 

  // WhatsApp पर भेजने का फंक्शन
  const handleWhatsAppClick = () => {
    if (!jodiText.trim()) {
      alert("कृपया पहले बॉक्स में अपनी 30 जोड़ी लिखें या Generate करें!");
      return;
    }

    const message = `नमस्ते, मैं ${selectedGame} गेम खेलना चाहता/चाहती हूँ।\n\nये रही मेरी आज की 30 जोड़ियाँ:\n\n${jodiText}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // यहाँ आपका असली फॉर्मूला जुड़ेगा
  const handleGenerateClick = () => {
    alert("यहाँ आपका असली फ़ॉर्मूला कनेक्ट होगा! जो अपने आप 30 जोड़ी निकालकर बॉक्स में भर देगा।");
    // भविष्य में हम यहाँ लिखेंगे: setJodiText(yourFormulaResult);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 mb-24">
      
      {/* हेडर (Header) */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">खाईवाल</h1>
        <p className="text-slate-400 text-sm">30 जोड़ी खाईवाल को भेजें</p>
      </div>

      {/* Trusted VIP Khaiwal Card (Peacock Theme) */}
      <div className="bg-[#0f9d58] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        {/* Card Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-white font-bold text-lg">Trusted VIP Khaiwal</h2>
          </div>
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-md font-medium">
            Verified
          </span>
        </div>

        {/* Rates Grid */}
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

        <p className="text-teal-50 text-xs mb-4 text-center">
          Sabse tez payment, 100% bharosemand aur safe.
        </p>

        {/* WhatsApp & Play Now Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2 bg-white text-[#0f9d58] font-bold py-2.5 rounded-xl hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
          <button 
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2 bg-[#0B1120]/40 text-white font-bold py-2.5 rounded-xl hover:bg-[#0B1120]/60 transition border border-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Play Now
          </button>
        </div>
      </div>

      {/* Game Selection (खेल चुनें) */}
      <div className="bg-[#131C31] rounded-2xl p-4 border border-gray-800">
        <h3 className="text-slate-300 text-sm mb-3">खेल चुनें</h3>
        <div className="grid grid-cols-4 gap-2">
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
      </div>

      {/* Text Area (Dark Theme me styled) */}
      <div className="bg-[#131C31] rounded-2xl p-4 border border-gray-800">
        <textarea
          className="w-full bg-[#0B1120] text-teal-400 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-center"
          rows={5}
          placeholder="आपकी 30 जोड़ी यहाँ आएँगी..."
          value={jodiText}
          onChange={(e) => setJodiText(e.target.value)}
        ></textarea>
      </div>

      {/* Generate Button (Bottom) */}
      <button
        onClick={handleGenerateClick}
        className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] transition duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        30 जोड़ी Generate करें
      </button>

    </div>
  );
};

export default KhaiwalTab;
