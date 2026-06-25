import React, { useState } from 'react';
import { X, Save, Lock } from 'lucide-react';
import { setPassword as updatePassword, checkPassword } from '../utils/auth';

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPassword(current)) {
      setError('Current password is wrong');
      return;
    }
    if (newPass.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }
    updatePassword(newPass);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-400" />
            Change Password
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-green-500 text-center py-8 font-medium">
              Password updated successfully!
            </div>
          ) : (
            <>
              {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Current Password</label>
                <input 
                  type="password"
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">New Password</label>
                <input 
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 mt-4 transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>Save New Password</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
