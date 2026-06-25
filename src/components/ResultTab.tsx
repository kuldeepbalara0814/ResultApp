import React, { useState, useEffect } from 'react';
import { Save, Calendar, CheckCircle, Upload } from 'lucide-react';
import { GameResult } from '../types';
import { getResultByDate, saveResult, saveMultipleResults } from '../utils/storage';

export default function ResultTab() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputs, setInputs] = useState({
    fd: '',
    gb: '',
    gl: '',
    ds: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Load existing data when date changes
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

  const handleSave = () => {
    const resultToSave: GameResult = {
      date,
      fd: inputs.fd,
      gb: inputs.gb,
      gl: inputs.gl,
      ds: inputs.ds
    };
    saveResult(resultToSave);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleBulkImport = () => {
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
        
        // basic date validation YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          newResults.push({
            date: dateStr,
            fd: fdVal,
            gb: gbVal,
            gl: glVal,
            ds: dsVal
          });
          imported++;
        }
      }
    }
    
    if (newResults.length > 0) {
      saveMultipleResults(newResults);
      setBulkSuccess(`सफलतापूर्वक ${imported} दिन का रिज़ल्ट इंपोर्ट हो गया!`);
      setBulkText('');
      
      // Reload current date data
      const existingData = getResultByDate(date);
      if (existingData) {
        setInputs({
          fd: existingData.fd || '',
          gb: existingData.gb || '',
          gl: existingData.gl || '',
          ds: existingData.ds || ''
        });
      }
      
      setTimeout(() => {
        setBulkSuccess('');
        setShowBulkImport(false);
      }, 3000);
    } else {
      setBulkSuccess('कोई सही रिज़ल्ट डेटा नहीं मिला। फॉर्मेट चेक करें।');
      setTimeout(() => setBulkSuccess(''), 3000);
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
        रिजल्ट दर्ज करें। DS का रिजल्ट अगली सुबह आता है, पर उसे पिछली रात की तारीख (मेन डेट) के अंदर ही फीड करें।
      </p>

      {showBulkImport && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-medium">3 महीने का रिज़ल्ट पेस्ट करें (Bulk Import)</h2>
          <p className="text-xs text-slate-400">
            फॉर्मेट: YYYY-MM-DD | FD | GB | GL | DS<br/>
            उदाहरण: 2024-04-25 | 45 | 67 | 89 | 12
          </p>
          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="2024-04-25 | 45 | 67 | 89 | 12&#10;2024-04-26 | 10 | 20 | 30 | 40"
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
    </div>
  );
      }
