import React, { useState, useEffect } from 'react';
import { Save, Calendar, CheckCircle, Upload, Database, Download, Trash2, AlertTriangle } from 'lucide-react';
import { GameResult } from '../types';
import { getResultByDate, saveResult, saveMultipleResults, getAllResultsSorted, deleteResultsByDateRange } from '../utils/storage';

// === SMART TIME RULE ===
const getDefaultDate = () => {
  const d = new Date();
  if (d.getHours() < 12) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ResultTab() {
  const [date, setDate] = useState(getDefaultDate()); 
  
  const [inputs, setInputs] = useState({
    fd: '', gb: '', gl: '', ds: ''
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);

  // === Delete Range State ===
  const [delStartDate, setDelStartDate] = useState('');
  const [delEndDate, setDelEndDate] = useState('');
  const [delMessage, setDelMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRecentResults = () => {
    try {
      const all = getAllResultsSorted();
      setRecentResults(all.slice(0, 5)); 
    } catch (e) {
      console.error("Error loading recent results", e);
    }
  };

  useEffect(() => {
    loadRecentResults();
  }, []);

  useEffect(() => {
    const existingData = getResultByDate(date);
    if (existingData) {
      setInputs({
        fd: existingData.fd || '',
        gb: existingData.gb || '',
        gl: existingData.gl || '',
        ds: existingData.ds || ''
      });
    } else {
      setInputs({ fd: '', gb: '', gl: '', ds: '' });
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const resultToSave: GameResult = {
      date,
      fd: inputs.fd,
      gb: inputs.gb,
      gl: inputs.gl,
      ds: inputs.ds
    };
    
    await saveResult(resultToSave); 
    
    setShowSuccess(true);
    loadRecentResults(); 
    
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) return;
    
    const lines = bulkText.split('\n');
    const newResults: GameResult[] = [];
    let imported = 0;
    
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        const dateStr = parts[0];
        const fdVal = parts[1].replace(/--/g, '');
        const gbVal = parts[2].replace(/--/g, '');
        const glVal = parts[3].replace(/--/g, '');
        const dsVal = parts[4].replace(/--/g, '');
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          newResults.push({
            date: dateStr, fd: fdVal, gb: gbVal, gl: glVal, ds: dsVal
          });
          imported++;
        }
      }
    }
    
    if (newResults.length > 0) {
      await saveMultipleResults(newResults); 
      setBulkSuccess(`सफलतापूर्वक ${imported} दिन का रिज़ल्ट इंपोर्ट हो गया!`);
      setBulkText('');
      
      const existingData = getResultByDate(date);
      if (existingData) {
        setInputs({
          fd: existingData.fd || '', gb: existingData.gb || '', gl: existingData.gl || '', ds: existingData.ds || ''
        });
      }
      
      loadRecentResults(); 

      setTimeout(() => {
        setBulkSuccess('');
        setShowBulkImport(false);
      }, 3000);
    } else {
      setBulkSuccess('कोई सही रिज़ल्ट डेटा नहीं मिला। फॉर्मेट चेक करें।');
      setTimeout(() => setBulkSuccess(''), 3000);
    }
  };

  const handleDownloadDatabase = () => {
    try {
      const all = getAllResultsSorted();
      if (all.length === 0) {
        alert("डेटाबेस में अभी कोई रिज़ल्ट नहीं है!");
        return;
      }
      
      let csvContent = "Date,FD,GB,GL,DS\n";
      all.forEach(r => {
        csvContent += `${r.date},${r.fd || '--'},${r.gb || '--'},${r.gl || '--'},${r.ds || '--'}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SahilMaster_Database_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed", e);
      alert("डाउनलोड में कोई समस्या आई।");
    }
  };

  // === Delete Range Handler ===
  const handleDeleteRange = async () => {
    if (!delStartDate || !delEndDate) {
      alert("कृपया शुरुआत और अंत की तारीख चुनें!");
      return;
    }
    if (delStartDate > delEndDate) {
      alert("शुरुआती तारीख (From Date) अंत की तारीख (To Date) से बड़ी नहीं हो सकती!");
      return;
    }

    const confirmDelete = window.confirm(`चेतावनी: क्या आप सच में ${delStartDate} से लेकर ${delEndDate} तक का सारा डेटा हटाना चाहते हैं?\n\nयह डेटा Firebase और आपके फ़ोन दोनों से हमेशा के लिए उड़ जाएगा।`);
    
    if (confirmDelete) {
      setIsDeleting(true);
      const deletedCount = await deleteResultsByDateRange(delStartDate, delEndDate);
      setIsDeleting(false);

      if (deletedCount > 0) {
        setDelMessage(`✅ सफलतापूर्वक ${deletedCount} दिन का डेटा डिलीट कर दिया गया है।`);
        loadRecentResults(); // लिस्ट रिफ्रेश करें
        
        // अगर आज का ही डेटा उड़ गया है, तो इनपुट बॉक्स भी खाली कर दें
        const existingData = getResultByDate(date);
        if (!existingData) {
          setInputs({ fd: '', gb: '', gl: '', ds: '' });
        }
      } else {
        setDelMessage(`⚠️ इस तारीख के बीच कोई रिज़ल्ट डेटा नहीं मिला।`);
      }

      setTimeout(() => setDelMessage(''), 4000);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-400">रिज़ल्ट अपडेट करें</h1>
        <button 
          onClick={() => setShowBulkImport(!showBulkImport)}
          className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-700 transition"
        >
          <Upload className="w-3 h-3" /> बल्क इंपोर्ट
        </button>
      </div>
      
      <p className="text-sm text-slate-400">
        रिजल्ट दर्ज करें। (एडिट करने के लिए बस वही तारीख चुनें और नया रिज़ल्ट सेव कर दें, पुराना अपने आप हट जाएगा)
      </p>

      {/* Bulk Import Section */}
      {showBulkImport && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-300">
          <h2 className="text-white font-medium">3 महीने का रिज़ल्ट पेस्ट करें (Bulk Import)</h2>
          <p className="text-xs text-slate-400">
            फॉर्मेट: YYYY-MM-DD | FD | GB | GL | DS<br/>
            उदाहरण: 2026-03-06 | 36 | 02 | 45 | 38
          </p>
          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="2026-03-06 | 36 | 02 | 45 | 38&#10;2026-03-07 | 62 | 60 | 22 | 45"
            className="w-full h-32 bg-[#0B1120] border border-slate-700 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
          />
          <button 
            onClick={handleBulkImport}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
          >
            इंपोर्ट सेव करें
          </button>
          {bulkSuccess && (
            <div className={`text-sm text-center font-medium ${bulkSuccess.includes('सफलतापूर्वक') ? 'text-teal-400' : 'text-red-400'}`}>
              {bulkSuccess}
            </div>
          )}
        </div>
      )}

      {/* Main Single Result Entry */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            मेन डेट (Main Date)
          </label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Faridabad (FD)</div>
              <div className="text-xs text-slate-500">Timing: ~6:00 PM</div>
            </div>
            <input 
              type="text" 
              name="fd"
              value={inputs.fd}
              onChange={handleInputChange}
              maxLength={2}
              placeholder="--"
              className="w-16 bg-[#111827] border border-slate-700 rounded-lg px-2 py-2 text-center text-xl font-mono text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Ghaziabad (GB)</div>
              <div className="text-xs text-slate-500">Timing: ~8:30 PM</div>
            </div>
            <input 
              type="text" 
              name="gb"
              value={inputs.gb}
              onChange={handleInputChange}
              maxLength={2}
              placeholder="--"
              className="w-16 bg-[#111827] border border-slate-700 rounded-lg px-2 py-2 text-center text-xl font-mono text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Gali (GL)</div>
              <div className="text-xs text-slate-500">Timing: ~11:55 PM</div>
            </div>
            <input 
              type="text" 
              name="gl"
              value={inputs.gl}
              onChange={handleInputChange}
              maxLength={2}
              placeholder="--"
              className="w-16 bg-[#111827] border border-slate-700 rounded-lg px-2 py-2 text-center text-xl font-mono text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-medium text-teal-400">Desawar (DS)</div>
              <div className="text-xs text-slate-500">Next Morning: ~5:00 AM</div>
            </div>
            <input 
              type="text" 
              name="ds"
              value={inputs.ds}
              onChange={handleInputChange}
              maxLength={2}
              placeholder="--"
              className="w-16 bg-[#111827] border border-teal-400/30 rounded-lg px-2 py-2 text-center text-xl font-mono text-teal-400 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors relative overflow-hidden"
        >
          {showSuccess ? (
            <span className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" /> सफलतापूर्वक सेव हो गया!
            </span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>रिज़ल्ट सेव करें</span>
            </>
          )}
        </button>
      </div>

      {/* Database Checklist & Recent Results */}
      <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="flex items-center justify-between">
           <h3 className="text-teal-400 font-bold flex items-center gap-2">
             <Database className="w-5 h-5" /> सिस्टम डेटाबेस चेक
           </h3>
        </div>
        
        <button 
          onClick={handleDownloadDatabase} 
          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-teal-400" /> पूरा रिज़ल्ट डेटाबेस डाउनलोड करें (CSV)
        </button>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-inner">
          <h4 className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">हाल ही में सेव किए गए रिज़ल्ट (Last 5)</h4>
          {recentResults.length > 0 ? (
            <div className="space-y-2">
              {recentResults.map((res, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-[#0B1120] p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-white font-medium">{res.date}</span>
                  <div className="flex gap-3">
                    <span className="text-slate-500">FD: <span className="text-slate-200">{res.fd || '--'}</span></span>
                    <span className="text-slate-500">GB: <span className="text-slate-200">{res.gb || '--'}</span></span>
                    <span className="text-slate-500">GL: <span className="text-slate-200">{res.gl || '--'}</span></span>
                    <span className="text-teal-500 font-medium">DS: <span className="text-teal-400">{res.ds || '--'}</span></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">सिस्टम में कोई पुराना रिज़ल्ट नहीं मिला।</p>
          )}
        </div>
      </div>

      {/* === Danger Zone: Delete by Date Range === */}
      <div className="mt-8 border border-red-900/50 bg-red-950/20 rounded-2xl p-5 space-y-4">
        <h3 className="text-red-500 font-bold flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" /> डेंजर ज़ोन (डेटा हटाएं)
        </h3>
        <p className="text-xs text-slate-400">
          अगर आपने गलती से कोई गलत डेटा या डुप्लीकेट फाइल इंपोर्ट कर ली है, तो आप यहाँ से एक डेट रेंज चुनकर उस बीच का सारा डेटा एक साथ मिटा सकते हैं।
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">कब से? (From Date)</label>
            <input 
              type="date" 
              value={delStartDate}
              onChange={(e) => setDelStartDate(e.target.value)}
              className="w-full bg-[#0B1120] border border-red-900/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">कब तक? (To Date)</label>
            <input 
              type="date" 
              value={delEndDate}
              onChange={(e) => setDelEndDate(e.target.value)}
              className="w-full bg-[#0B1120] border border-red-900/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>

        <button 
          onClick={handleDeleteRange}
          disabled={isDeleting}
          className="w-full bg-red-900/40 hover:bg-red-800 text-red-100 border border-red-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
        >
          {isDeleting ? (
            <span className="animate-pulse">डेटा डिलीट हो रहा है...</span>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>चुनी हुई तारीख का डेटा डिलीट करें</span>
            </>
          )}
        </button>
        
        {delMessage && (
          <div className={`text-xs text-center font-medium p-2 rounded-lg ${delMessage.includes('✅') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            {delMessage}
          </div>
        )}
      </div>

    </div>
  );
}
