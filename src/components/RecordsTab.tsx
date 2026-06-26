import React, { useState, useEffect } from 'react';
import { History, Edit3, Calendar, Download } from 'lucide-react';
import { GameResult } from '../types';
import { getAllResultsSorted, downloadBackupData } from '../utils/storage';

export default function RecordsTab({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [records, setRecords] = useState<GameResult[]>([]);

  useEffect(() => {
    setRecords(getAllResultsSorted());
  }, []);

  const handleEdit = (date: string) => {
    setActiveTab('result');
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header with Title and Backup Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-slate-400" />
          <h1 className="text-xl font-bold text-teal-400">History Records</h1>
        </div>
        
        {/* Backup Download Button */}
        <button
          onClick={downloadBackupData}
          className="flex items-center space-x-1.5 bg-teal-400/10 hover:bg-teal-400/20 text-teal-400 px-3 py-1.5 rounded-lg border border-teal-400/30 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Backup</span>
        </button>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center p-8 bg-[#111827] border border-slate-800 rounded-2xl text-slate-400">
            No records found. Update results from the Result tab.
          </div>
        ) : (
          records.map((record) => (
            <div key={record.date} className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-[#1F2937] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span className="font-semibold text-white">{record.date}</span>
                </div>
                <button
                  onClick={() => handleEdit(record.date)}
                  className="p-1 text-slate-400 hover:text-teal-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-4 gap-2 text-center divide-x divide-slate-800">
                <div>
                  <div className="text-xs text-slate-500 mb-1">FD</div>
                  <div className="text-lg font-mono font-medium text-white">{record.fd || '--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">GB</div>
                  <div className="text-lg font-mono font-medium text-white">{record.gb || '--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">GL</div>
                  <div className="text-lg font-mono font-medium text-white">{record.gl || '--'}</div>
                </div>
                <div>
                  <div className="text-xs text-teal-400 mb-1">DS</div>
                  <div className="text-lg font-mono font-medium text-teal-400">{record.ds || '--'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
