import React, { useState } from 'react';
import { ShieldCheck, Plus, Phone, MapPin, Trash2, MessageCircle, PlayCircle, Star } from 'lucide-react';

interface Khaiwal {
  id: string;
  name: string;
  phone: string;
  area: string;
  jodiRate: string;
  harufRate: string;
}

const FEATURED_KHAIWAL = {
  name: 'Trusted VIP Khaiwal',
  jodiRate: '10 Ka 900',
  harufRate: '100 Ka 900',
  tagline: 'Sabse tez payment, 100% bharosemand aur safe.',
  phone: '',
};

export default function KhaiwalTab() {
  const [khaiwalList, setKhaiwalList] = useState<Khaiwal[]>(() => {
    try {
      const stored = localStorage.getItem('khaiwal_list');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ name: '', phone: '', area: '', jodiRate: '', harufRate: '' });
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
      jodiRate: form.jodiRate.trim() || '10 Ka 900',
      harufRate: form.harufRate.trim() || '100 Ka 900',
    };
    saveList([...khaiwalList, entry]);
    setForm({ name: '', phone: '', area: '', jodiRate: '', harufRate: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    saveList(khaiwalList.filter((k) => k.id !== id));
  };

  const openWhatsApp = (phone: string, name: string) => {
    const num = phone.replace(/\D/g, '');
    const msg = `नमस्ते ${name}, मुझे जोड़ी खेलनी है।`;
    if (num) {
      window.open(`https://wa.me/91${num}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const KhaiwalCard = ({ k, featured = false }: { k: typeof FEATURED_KHAIWAL | Khaiwal; featured?: boolean }) => (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-700/50">
      {/* Card Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${featured ? 'bg-gradient-to-r from-teal-600 to-teal-500' : 'bg-gradient-to-r from-teal-700 to-teal-600'}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm">{k.name}</span>
        </div>
        {featured && (
          <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full border border-white/30">
            Verified
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="bg-[#111827] p-4 space-y-4">
        {/* Rate Boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1F2937] rounded-xl p-3 text-center border border-slate-700">
            <div className="text-slate-400 text-xs mb-1">Jodi Rate</div>
            <div className="text-white font-bold text-base">{k.jodiRate}</div>
          </div>
          <div className="bg-[#1F2937] rounded-xl p-3 text-center border border-slate-700">
            <div className="text-slate-400 text-xs mb-1">Haruf Rate</div>
            <div className="text-white font-bold text-base">{k.harufRate}</div>
          </div>
        </div>

        {'tagline' in k && (
          <p className="text-slate-400 text-sm text-center">{k.tagline}</p>
        )}
        {'area' in k && (k as Khaiwal).area && (
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            {(k as Khaiwal).area}
          </div>
        )}
        {'phone' in k && (k as Khaiwal).phone && (
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Phone className="w-3.5 h-3.5" />
            {(k as Khaiwal).phone}
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openWhatsApp(('phone' in k ? (k as Khaiwal).phone : '') || '', k.name)}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            <PlayCircle className="w-4 h-4" />
            Play Now
          </button>
        </div>

        {/* Delete button for user-added entries */}
        {'id' in k && (
          <button
            onClick={() => handleDelete((k as Khaiwal).id)}
            className="w-full flex items-center justify-center gap-1 text-red-400/60 hover:text-red-400 text-xs py-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> हटाएं
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-400">Trusted Khaiwal</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-teal-400/10 hover:bg-teal-400/20 text-teal-400 px-3 py-1.5 rounded-lg border border-teal-400/30 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          नया जोड़ें
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">खैवाल जोड़ें</h2>
          {[
            { key: 'name', placeholder: 'नाम *', type: 'text' },
            { key: 'phone', placeholder: 'फोन नंबर (WhatsApp)', type: 'tel' },
            { key: 'area', placeholder: 'एरिया / लोकेशन', type: 'text' },
            { key: 'jodiRate', placeholder: 'Jodi Rate (जैसे 10 Ka 900)', type: 'text' },
            { key: 'harufRate', placeholder: 'Haruf Rate (जैसे 100 Ka 900)', type: 'text' },
          ].map(({ key, placeholder, type }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={(form as any)[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          ))}
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

      {/* Featured Trusted Khaiwal */}
      <KhaiwalCard k={FEATURED_KHAIWAL} featured />

      {/* User-added list */}
      {khaiwalList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">आपके खैवाल</h2>
          {khaiwalList.map((k) => (
            <KhaiwalCard key={k.id} k={k} />
          ))}
        </div>
      )}

      {/* Ad Section */}
      <div className="bg-[#111827] border border-dashed border-teal-400/40 rounded-2xl p-5 text-center space-y-2">
        <Star className="w-6 h-6 text-teal-400 mx-auto" />
        <h3 className="text-white font-bold">Apna Ad Yahan Lagwayein</h3>
        <p className="text-slate-400 text-sm">
          Best khaiwal banne ke liye yahan ad lagwaye. Hum trusted khaiwal se contact karke promotion karte hain.
        </p>
        <button
          onClick={() => window.open('https://wa.me/?text=Mujhe%20khaiwal%20ad%20lagwana%20hai', '_blank')}
          className="mt-2 inline-flex items-center gap-2 bg-teal-400/10 hover:bg-teal-400/20 text-teal-400 border border-teal-400/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          Contact For Ad
        </button>
      </div>
    </div>
  );
}
