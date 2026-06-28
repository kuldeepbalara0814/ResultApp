import React, { useState } from 'react';
import { Lock, ArrowRight, User, Users, KeyRound, ArrowLeft } from 'lucide-react';
import { checkPassword, loginUser, checkUserLogin } from '../utils/auth';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loginMode, setLoginMode] = useState<'guest' | 'user' | 'admin'>('guest');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // पासवर्ड बदलने वाले मोड के लिए स्टेट
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // मोड बदलते समय सब कुछ रिसेट करने के लिए
  const handleModeChange = (mode: 'guest' | 'user' | 'admin') => {
    setLoginMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setNewPassword('');
    setUserName('');
    setIsChangingPassword(false);
  };

  // -----------------------------------------------------
  // 1. लॉगिन करने का फंक्शन (पुराना वाला सुरक्षित है)
  // -----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
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

  // -----------------------------------------------------
  // 2. पासवर्ड बदलने का नया फंक्शन
  // -----------------------------------------------------
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password.trim() || !newPassword.trim()) {
      setErrorMsg('पुराना और नया पासवर्ड दोनों दर्ज करें!');
      return;
    }
    if (password === newPassword) {
      setErrorMsg('नया पासवर्ड पुराने पासवर्ड से अलग होना चाहिए!');
      return;
    }

    if (loginMode === 'admin') {
      if (checkPassword(password)) {
        // एडमिन का पासवर्ड अपडेट करें (Local Storage / Firebase Point 9)
        localStorage.setItem('adminPassword', newPassword); 
        setSuccessMsg('एडमिन पासवर्ड सफलतापूर्वक बदल गया है! कृपया नए पासवर्ड से लॉगिन करें।');
        setTimeout(() => { setIsChangingPassword(false); setPassword(''); setNewPassword(''); setSuccessMsg(''); }, 2000);
      } else {
        setErrorMsg('आपका पुराना पासवर्ड गलत है!');
      }
    } else if (loginMode === 'user') {
      if (!userName.trim()) {
        setErrorMsg('कृपया अपना नाम दर्ज करें!');
        return;
      }
      const status = await checkUserLogin(userName.trim(), password.trim());
      if (status === true) {
        // यूज़र का पासवर्ड अपडेट करें (Local Storage Backup for now)
        const usersStr = localStorage.getItem('users');
        if (usersStr) {
          let users = JSON.parse(usersStr);
          const uIndex = users.findIndex((u: any) => u.username.toLowerCase() === userName.trim().toLowerCase());
          if (uIndex > -1) {
            users[uIndex].password = newPassword.trim();
            localStorage.setItem('users', JSON.stringify(users));
          }
        }
        setSuccessMsg('आपका पासवर्ड सफलतापूर्वक बदल गया है! कृपया नए पासवर्ड से लॉगिन करें।');
        setTimeout(() => { setIsChangingPassword(false); setPassword(''); setNewPassword(''); setSuccessMsg(''); }, 2000);
      } else {
        setErrorMsg('पुराना पासवर्ड या नाम गलत है!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-teal-400/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-sm z-10 space-y-6">
        
        {/* Toggle Buttons */}
        {!isChangingPassword && (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-1 flex">
            <button 
              type="button"
              onClick={() => handleModeChange('guest')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMode === 'guest' ? 'bg-teal-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              गेस्ट (Trial)
            </button>
            <button 
              type="button"
              onClick={() => handleModeChange('user')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMode === 'user' ? 'bg-teal-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              यूजर लॉगिन
            </button>
            <button 
              type="button"
              onClick={() => handleModeChange('admin')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMode === 'admin' ? 'bg-teal-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              एडमिन
            </button>
          </div>
        )}

        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Change Password Back Button */}
          {isChangingPassword && (
            <button 
              onClick={() => { setIsChangingPassword(false); setErrorMsg(''); setSuccessMsg(''); setPassword(''); setNewPassword(''); }}
              className="absolute top-4 left-4 text-slate-400 hover:text-teal-400 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          <div className="flex justify-center mb-6 mt-2">
            <div className="w-16 h-16 bg-teal-400/10 rounded-full flex items-center justify-center border border-teal-400/20">
              {isChangingPassword ? <KeyRound className="w-8 h-8 text-teal-400" /> :
               loginMode === 'admin' ? <Lock className="w-8 h-8 text-teal-400" /> : 
               loginMode === 'user' ? <Users className="w-8 h-8 text-teal-400" /> : 
               <User className="w-8 h-8 text-teal-400" />}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {isChangingPassword ? 'पासवर्ड बदलें' :
             loginMode === 'admin' ? 'एडमिन लॉगिन' : 
             loginMode === 'user' ? 'यूजर लॉगिन' : 'गेस्ट लॉगिन (Trial)'}
          </h1>
          
          <p className="text-slate-400 text-center text-sm mb-8">
            {isChangingPassword ? 'अपना पुराना और नया पासवर्ड दर्ज करें' :
             loginMode === 'admin' ? <>एडमिन पैनल में जाने के लिए पासवर्ड डालें<br/><span className="text-xs opacity-70">(Default: admin123)</span></> : 
             loginMode === 'user' ? 'एडमिन द्वारा दिया गया नाम और पासवर्ड डालें' : 
             'ट्रायल के लिए अपना नाम दर्ज करें'}
          </p>
          
          <form onSubmit={isChangingPassword ? handleChangePasswordSubmit : handleLoginSubmit} className="space-y-4">
            
            {/* User Name Input (Not for Admin) */}
            {loginMode !== 'admin' && (
              <div>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="अपना नाम दर्ज करें"
                  disabled={isChangingPassword && userName !== ''}
                  className={`w-full bg-[#0B1120] border ${errorMsg && !userName ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-400 transition-colors text-center text-lg capitalize ${isChangingPassword ? 'opacity-50' : ''}`}
                />
              </div>
            )}
            
            {/* Password Input */}
            {loginMode !== 'guest' && (
              <div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isChangingPassword ? "पुराना पासवर्ड (Old)" : "पासवर्ड दर्ज करें"}
                  className={`w-full bg-[#0B1120] border ${errorMsg && !password ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-400 transition-colors text-center text-lg tracking-widest`}
                />
              </div>
            )}

            {/* New Password Input (Only in Change Mode) */}
            {isChangingPassword && loginMode !== 'guest' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="नया पासवर्ड (New)"
                  className={`w-full bg-[#0B1120] border ${errorMsg && !newPassword ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-400 transition-colors text-center text-lg tracking-widest mt-2`}
                />
              </div>
            )}

            {/* Messages */}
            {errorMsg && <p className="text-red-500 text-xs text-center mt-2 animate-pulse">{errorMsg}</p>}
            {successMsg && <p className="text-teal-400 text-xs text-center mt-2 font-bold">{successMsg}</p>}
            
            <button 
              type="submit"
              className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-2"
            >
              <span>{isChangingPassword ? 'पासवर्ड सेव करें' : 'लॉगिन करें'}</span>
              {!isChangingPassword && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Change Password Link for Admin and User */}
          {!isChangingPassword && loginMode !== 'guest' && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => { setIsChangingPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-slate-400 hover:text-teal-400 text-xs font-medium transition underline underline-offset-4"
              >
                पासवर्ड बदलना चाहते हैं? (Change Password)
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
