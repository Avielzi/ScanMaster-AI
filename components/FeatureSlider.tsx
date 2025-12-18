
import React, { useState, useEffect } from 'react';

const features = [
  {
    id: 1,
    title: "זיהוי שפות מרובות",
    description: "כולל יוונית, אנגלית ואירופאית עם תרגום מיידי לעברית.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
    ),
    previewContent: [
      { text: "Receipt from Athens", color: "bg-blue-50" },
      { text: "Invoice #4429", color: "bg-slate-50" },
      { text: "Εστιατόριο -> מסעדה", color: "bg-green-50" }
    ]
  },
  {
    id: 2,
    title: "איתור מע\"מ",
    description: "מזהה רכיבי מס (כמו ΦΠΑ ביוון) ומפריד אותם באופן אוטומטי.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    ),
    previewContent: [
      { text: "Subtotal: €45.00", color: "bg-slate-50" },
      { text: "ΦΠΑ (VAT) 24%: €10.80", color: "bg-blue-100" },
      { text: "Total: €55.80", color: "bg-blue-50" }
    ]
  },
  {
    id: 3,
    title: "המרה לשקלים",
    description: "חישוב מדויק לפי שער החליפין הנוכחי בזמן הסריקה.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-12c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>
    ),
    previewContent: [
      { text: "Rate: 1 EUR = 4.02 ILS", color: "bg-blue-50" },
      { text: "Converted: 224.32 ₪", color: "bg-green-100" },
      { text: "Fee: 0.00 ₪", color: "bg-slate-50" }
    ]
  },
  {
    id: 4,
    title: "ייצוא מהיר",
    description: "סנכרון ישיר ל-Google Sheets בלחיצת כפתור אחת.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    previewContent: [
      { text: "Syncing to Drive...", color: "bg-blue-50" },
      { text: "Sheet Created Successfully", color: "bg-green-50" },
      { text: "Folder: ScanMaster Exports", color: "bg-slate-100" }
    ]
  }
];

const FeatureSlider: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] p-6 md:p-12 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-right overflow-hidden relative">
      <div className="space-y-8 z-10">
        <div className="flex items-center gap-4 mb-2">
           <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
           </div>
           <h3 className="text-3xl font-black text-slate-900">העוזר האישי שלך</h3>
        </div>

        <div className="space-y-4">
          {features.map((feature, idx) => (
            <button
              key={feature.id}
              onClick={() => {
                setActiveIdx(idx);
                setIsAutoPlaying(false);
              }}
              className={`w-full flex gap-5 p-5 rounded-3xl transition-all duration-500 group relative border-2 ${
                activeIdx === idx 
                ? 'bg-white border-blue-600 shadow-xl scale-[1.02]' 
                : 'bg-transparent border-transparent hover:bg-slate-50'
              }`}
            >
              <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                activeIdx === idx ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-200'
              }`}>
                {feature.id}
              </span>
              <div className="flex-1 text-right">
                <span className={`block font-black text-lg transition-colors duration-300 ${activeIdx === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                  {feature.title}
                </span>
                <span className={`text-sm font-medium leading-relaxed transition-opacity duration-300 ${activeIdx === idx ? 'opacity-100 text-slate-600' : 'opacity-60 text-slate-400'}`}>
                  {feature.description}
                </span>
              </div>
              {activeIdx === idx && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 animate-pulse">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group/preview">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl group-hover/preview:bg-blue-200/40 transition-colors duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl group-hover/preview:bg-slate-200/60 transition-colors duration-700"></div>

        <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 relative overflow-hidden shadow-inner backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900/10 overflow-hidden">
            <div 
              className="h-full bg-slate-900 transition-all duration-[4500ms] linear" 
              key={activeIdx}
              style={{ width: isAutoPlaying ? '100%' : '0%' }}
            ></div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Premium Mobile Preview</span>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 scale-110 ${activeIdx % 2 === 0 ? 'bg-blue-600 rotate-6' : 'bg-slate-900 -rotate-6'}`}>
              {features[activeIdx].icon}
            </div>
          </div>

          <div className="space-y-4">
            {features[activeIdx].previewContent.map((item, i) => (
              <div 
                key={`${activeIdx}-${i}`} 
                className={`border border-slate-200/50 rounded-2xl p-5 shadow-sm transform transition-all duration-500 delay-[${i * 100}ms] animate-slide-up ${item.color}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="h-2.5 w-20 bg-slate-900/5 rounded-full"></div>
                  <div className="h-2.5 w-8 bg-slate-900/5 rounded-full"></div>
                </div>
                <div className="font-black text-slate-800 text-sm">{item.text}</div>
                <div className="mt-3 h-1.5 w-full bg-slate-900/5 rounded-full"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 flex justify-center gap-2">
            {features.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${activeIdx === i ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`}
              ></div>
            ))}
          </div>

          <p className="mt-8 text-[11px] text-slate-400 font-bold text-center tracking-tight uppercase">תצוגת כרטיסים נוחה המותאמת לטלפון הנייד</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureSlider;
