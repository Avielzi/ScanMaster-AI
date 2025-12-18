
import React, { useRef, useState, useEffect } from 'react';

interface ReceiptUploaderProps {
  onFilesAdded: (files: FileList) => void;
  onOpenCamera: () => void;
  isLoading: boolean;
}

const loadingMessages = [
  "מזהה קבלות וחשבוניות...",
  "מחלץ נתונים מכל קבלה...",
  "מתרגם שמות עסקים לעברית...",
  "ממיר מטבעות לשקלים...",
  "מכין את הטבלה לגיליון...",
  "עוד רגע וזה מוכן..."
];

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onFilesAdded, onOpenCamera, isLoading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className={`relative dashed-border-animated p-14 transition-all flex flex-col items-center justify-center cursor-pointer group shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]
          ${isLoading ? 'bg-slate-50/80 cursor-wait' : 'bg-white hover:bg-blue-50/20 active:scale-[0.99]'}`}
        onClick={() => !isLoading && inputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={inputRef}
          onChange={handleFileChange}
          disabled={isLoading}
        />
        
        {/* Bulk Support Badge */}
        <div className="absolute top-6 left-6 bg-green-100 text-green-700 text-[11px] font-black px-4 py-1.5 rounded-full border border-green-200 uppercase tracking-tighter shadow-sm animate-pulse">
          Bulk Scan Ready
        </div>

        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">גררו קבלות לכאן</h3>
        <p className="text-slate-500 text-center font-bold text-lg max-w-sm leading-relaxed">ניתן להעלות עשרות קבלות בבת אחת. המערכת תזהה את כולן אוטומטית.</p>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/98 backdrop-blur-md rounded-[24px] flex items-center justify-center z-10 px-12">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-10 scale-125">
                <div className="animate-spin rounded-full h-20 w-20 border-[6px] border-blue-100 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-blue-600 rounded-full animate-ping"></div>
                </div>
              </div>
              <span className="text-slate-900 font-black text-2xl mb-4 tracking-tight">{loadingMessages[msgIdx]}</span>
              <p className="text-blue-600/70 text-base font-black uppercase tracking-widest">Processing Entity Data...</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenCamera(); }}
          disabled={isLoading}
          className={`flex items-center justify-center gap-4 py-6 rounded-3xl font-black text-lg transition-all shadow-xl active:scale-95
            ${isLoading ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-1 shadow-slate-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          צילום במצלמה
        </button>
        <button 
          disabled={isLoading}
          onClick={() => !isLoading && inputRef.current?.click()}
          className={`flex items-center justify-center gap-4 py-6 rounded-3xl font-black text-lg transition-all shadow-xl active:scale-95
            ${isLoading ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-100'}`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          בחירה מהגלריה
        </button>
      </div>
    </div>
  );
};

export default ReceiptUploader;
