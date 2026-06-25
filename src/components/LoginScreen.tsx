import React, { useState } from 'react';
import { Lock, ArrowRight, User, Users } from 'lucide-react';
import { checkPassword, loginUser, checkUserLogin } from '../utils/auth';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loginMode, setLoginMode] = useState<'guest' | 'user' | 'admin'>('guest');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (loginMode === 'admin') {
      if (checkPassword(password)) {
        loginUser('Admin', 'admin');
        onLogin();
      } else {
        setErrorMsg('गलत पासवर्ड!');
      }
    } else if (loginMode === 'user') {
      if (!userName.trim() || !password.trim()) {
        setErrorMsg('नाम और पासवर्ड दोनों दर्ज करें!');
        return;
      }
      const status = await checkUserLogin(userName.trim(), password.trim());
      if (status === true) {
        loginUser(userName.trim(), 'user');
        onLogin();
      } else if (status === 'inactive') {
        setErrorMsg('आपका अकाउंट एडमिन द्वारा ब्लॉक कर दिया गया है!');
      } else if (status === 'not_found') {
        setErrorMsg('अकाउंट नहीं मिला!');
      } else {
        setErrorMsg('पासवर्ड गलत है!');
      }
    } else {
      if (userName.trim().length > 0) {
        loginUser(userName.trim(), 'guest');
        onLogin();
      } else {
        setErrorMsg('कृपया अपना नाम दर्ज करें!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-teal-400/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-sm z-10 space-y-6">
        {/* Toggle */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-1 flex">
          <button 
            type="button"
            onClick={() => { setLoginMode('guest'); setErrorMsg(''); setPassword(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMode === 'guest' ? 'bg-teal-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            गेस्ट (Trial)
          </button>
          <button 
            type="button"
            onClick={() => { setLoginMode('user'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMode === 'user' ? 'bg-teal-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            यूजर लॉगिन
          </button>
          <button 
            type="button"
            onClick={() => { setLoginMode('admin'); setErrorMsg(''); setUserName(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMode === 'admin' ? 'bg-teal-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            एडमिन
          </button>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-400/10 rounded-full flex items-center justify-center border border-teal-400/20">
              {loginMode === 'admin' ? <Lock className="w-8 h-8 text-teal-400" /> : 
               loginMode === 'user' ? <Users className="w-8 h-8 text-teal-400" /> : 
               <User className="w-8 h-8 text-teal-400" />}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {loginMode === 'admin' ? 'एडमिन लॉगिन' : 
             loginMode === 'user' ? 'यूजर लॉगिन' : 'गेस्ट लॉगिन (Trial)'}
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            {loginMode === 'admin' 
              ? <>एडमिन पैनल में जाने के लिए पासवर्ड डालें<br/><span className="text-xs opacity-70">(Default: admin123)</span></>
              : loginMode === 'user' ? 'एडमिन द्वारा दिया गया नाम और पासवर्ड डालें' 
              : 'ट्रायल के लिए अपना नाम दर्ज करें'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMode !== 'admin' && (
              <div>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="अपना नाम दर्ज करें"
                  className={`w-full bg-[#0B1120] border ${errorMsg && !userName ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-400 transition-colors text-center text-lg capitalize`}
                />
              </div>
            )}
            
            {loginMode !== 'guest' && (
              <div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड दर्ज करें"
                  className={`w-full bg-[#0B1120] border ${errorMsg && !password ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-400 transition-colors text-center text-lg tracking-widest`}
                />
              </div>
            )}

            {errorMsg && <p className="text-red-500 text-xs text-center mt-2 animate-pulse">{errorMsg}</p>}
            
            <button 
              type="submit"
              className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-2"
            >
              <span>लॉगिन करें</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
