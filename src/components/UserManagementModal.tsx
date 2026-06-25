import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, ShieldOff, ShieldCheck } from 'lucide-react';
import { AppUser, getUsers, addUser, toggleUserAccess, deleteUser } from '../utils/auth';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setError('');
      setNewUsername('');
      setNewPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('यूजर का नाम दर्ज करें');
      return;
    }
    if (!newPassword.trim()) {
      setError('यूजर का पासवर्ड दर्ज करें');
      return;
    }
    
    try {
      await addUser(newUsername.trim(), newPassword.trim());
      await fetchUsers();
      setNewUsername('');
      setNewPassword('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error adding user');
    }
  };

  const handleToggle = async (id: string) => {
    await toggleUserAccess(id);
    await fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('क्या आप वाकई इस यूजर को डिलीट करना चाहते हैं?')) {
      await deleteUser(id);
      await fetchUsers();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1F2D] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-[#13151E] p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-400/10 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-white font-semibold">यूजर मैनेजमेंट</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="space-y-4 bg-[#13151E] p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-medium text-slate-300">नया यूजर बनाएं</h3>
            
            <div className="space-y-3">
              <input 
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="यूजर का नाम"
                className="w-full bg-[#1C1F2D] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
              />
              <input 
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="यूजर का पासवर्ड"
                className="w-full bg-[#1C1F2D] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs">{error}</p>}
            
            <button 
              type="submit"
              className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>यूजर जोड़ें</span>
            </button>
          </form>

          {/* User List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>सभी यूजर्स</span>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded-full">{users.length}</span>
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {users.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">कोई यूजर नहीं है</p>
              ) : (
                users.map(user => (
                  <div key={user.id} className="bg-[#13151E] border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium capitalize text-sm">{user.username}</span>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          पासवर्ड: <span className="text-slate-300">{user.password}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleToggle(user.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            user.isActive 
                              ? 'bg-teal-400/10 border-teal-400/30 text-teal-400 hover:bg-teal-400/20' 
                              : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
                          }`}
                          title={user.isActive ? 'यूजर को ब्लॉक करें' : 'यूजर को अनब्लॉक करें'}
                        >
                          {user.isActive ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="डिलीट करें"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {!user.isActive && (
                      <div className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded w-fit">
                        अकाउंट ब्लॉक है
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                        }
