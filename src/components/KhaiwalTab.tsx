import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, Trash2 } from 'lucide-react';

interface Khaiwal {
  id: string;
  name: string;
  phone: string;
  area: string;
}

export default function KhaiwalTab() {
  const [khaiwalList, setKhaiwalList] = useState<Khaiwal[]>(() => {
    try {
      const stored = localStorage.getItem('khaiwal_list');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ name: '', phone: '', area: '' });
  const [showForm, setShowForm] = useState(false);

  const saveList = (list: Khaiwal[]) => {
    setKhaiwalList(list);
    localStorage.setItem('khaiwal_list', JSON.stringify(list));
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const entry: Khaiwal = {
      id: `${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      area: form.area.trim(),
    };
    saveList([...khaiwalList, entry]);
    setForm({ name: '', phone: '', area: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    saveList(khaiwalList.filter((k) => k.id !== id));
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-teal-400" />
          <h1 className="text-xl font-bold text-teal-400">खैवाल लिस्ट</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-teal-400/10 hover:bg-teal-400/20 text-teal-400 px-3 py-1.5 rounded-lg border border-teal-400/30 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          नया
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">खैवाल जोड़ें</h2>
          <input
            type="text"
            placeholder="नाम *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <input
            type="tel"
            placeholder="फोन नंबर"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <input
            type="text"
            placeholder="एरिया / लोकेशन"
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-teal-400 text-slate-900 font-semibold py-2 rounded-xl text-sm hover:bg-teal-300 transition-colors"
            >
              सेव करें
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-[#1F2937] text-slate-400 font-semibold py-2 rounded-xl text-sm hover:bg-[#374151] transition-colors border border-slate-700"
            >
              रद्द करें
            </button>
          </div>
        </div>
      )}

      {khaiwalList.length === 0 ? (
        <div className="text-center p-8 bg-[#111827] border border-slate-800 rounded-2xl text-slate-400 text-sm">
          कोई खैवाल नहीं मिला। नया जोड़ने के लिए ऊपर बटन दबाएं।
        </div>
      ) : (
        <div className="space-y-3">
          {khaiwalList.map((k) => (
            <div
              key={k.id}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="text-white font-semibold">{k.name}</div>
                {k.phone && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    {k.phone}
                  </div>
                )}
                {k.area && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {k.area}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(k.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
