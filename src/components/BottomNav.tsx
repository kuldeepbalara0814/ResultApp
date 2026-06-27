import React from 'react';

// Props का टाइप डिफाइन किया गया है ताकि TypeScript में कोई एरर न आए
interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  // यहाँ हमने आपके पुराने बटनों के बीच में 'VIP' (membership) को सुरक्षित जोड़ दिया है
  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'predict', 
      label: 'Predict', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      id: 'khaiwal', 
      label: 'Khaiwal', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: 'membership', 
      label: 'VIP', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="hidden" />
          {/* नया प्रीमियम क्राउन (Crown) मुकुट आइकॉन VIP के लिए */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    },
    { 
      id: 'tracker', 
      label: 'Tracker', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="absolute bottom-0 w-full bg-[#131C31] border-t border-gray-800 px-1 py-3 rounded-t-2xl z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center distribution-even">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out ${
                isActive ? 'text-teal-400 transform -translate-y-1' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* आइकॉन */}
              <div className={`mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' : ''}`}>
                {item.icon}
              </div>
              
              {/* नाम */}
              <span className={`text-[9px] font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              
              {/* एक्टिव टैब के नीचे एक छोटा सा डॉट */}
              {isActive && (
                <div className="w-1 h-1 bg-teal-400 rounded-full mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
