
import React, { useState, useCallback, useEffect } from 'react';
import ReceiptUploader from './components/ReceiptUploader';
import ResultView from './components/ResultView';
import CameraCapture from './components/CameraCapture';
import FeatureSlider from './components/FeatureSlider';
import { processReceipts } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  // Check if API key is selected on mount
  useEffect(() => {
    const checkKey = async () => {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for environments without the aistudio global
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      // Assume success after triggering the dialog to avoid race conditions
      setHasKey(true);
    }
  };

  const handleProcessImages = async (base64Array: string[]) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      setImages(base64Array);
      const markdown = await processReceipts(base64Array);
      setResult(markdown);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || '';
      
      // Handle the specific "Requested entity was not found" error
      if (errorMessage.includes("Requested entity was not found")) {
        setError('פרויקט ה-API לא נמצא או שאינו מוגדר לחיוב. אנא בחרו מפתח מפרויקט פעיל.');
        setHasKey(false); // Prompt for key selection again
      } else {
        setError('חלה שגיאה בעיבוד התמונות. אנא וודאו שחיבור האינטרנט יציב ונסו שוב.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesAdded = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const base64Promises = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Images = await Promise.all(base64Promises);
      await handleProcessImages(base64Images);
    } catch (err) {
      setError('שגיאה בקריאת הקבצים.');
    }
  }, []);

  const handleCameraCapture = (base64: string) => {
    setShowCamera(false);
    handleProcessImages([base64]);
  };

  const clearAll = () => {
    setImages([]);
    setResult(null);
    setError(null);
  };

  // API Key Gate View
  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-right" dir="rtl">
        <div className="max-w-xl w-full glass-morphism p-12 rounded-[3rem] shadow-2xl border border-white/10 animate-slide-up">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">הגדרת חשבון ScanMaster</h2>
          <p className="text-xl text-slate-600 font-medium mb-10 leading-relaxed">
            כדי ליהנות מביצועי ה-AI המתקדמים ביותר, עליך לחבר מפתח API אישי. המפתח מאפשר לך שליטה מלאה על המכסות והפרטיות שלך.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              התחבר עם מפתח API
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center text-blue-600 font-bold hover:underline"
            >
              למידע נוסף על הגדרת חשבון וחיוב
            </a>
          </div>
          
          <p className="mt-12 text-slate-400 text-sm font-medium">
            * המערכת דורשת פרויקט Google Cloud עם תוכנית חיוב פעילה (Pay-as-you-go).
          </p>
        </div>
      </div>
    );
  }

  // Loading state for the key check
  if (hasKey === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {/* Header */}
      <header className="glass-morphism shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">ScanMaster <span className="text-blue-600">AI</span></h1>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={handleSelectKey}
               className="hidden md:flex items-center gap-2.5 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors"
             >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Premium Active</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-20">
        <section className={`mb-20 transition-all duration-700 ${result ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
          <div className="max-w-4xl mx-auto text-center mb-16 animate-slide-up">
            <h2 className="text-6xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
              הנהלת חשבונות חכמה. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-slate-900 to-slate-700">בדיוק של 100%.</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              ScanMaster AI מזהה, מתרגם וממיין את כל הקבלות שלך באופן אוטומטי. פשוט מצלמים, והמערכת מטפלת בכל השאר.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <ReceiptUploader 
              onFilesAdded={handleFilesAdded} 
              onOpenCamera={() => setShowCamera(true)}
              isLoading={isProcessing} 
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <FeatureSlider />
          </div>
        </section>

        {error && (
          <div className="max-w-3xl mx-auto mt-4 p-8 bg-red-50 border-r-8 border-red-500 text-red-700 rounded-[2rem] shadow-xl animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 p-2 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="font-black text-2xl">שגיאה בתהליך</p>
            </div>
            <p className="mt-4 text-red-600 font-semibold text-lg">{error}</p>
          </div>
        )}

        {/* Previews while processing */}
        {!result && images.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20 animate-slide-up">
            <div className="flex items-end justify-between mb-10 px-4">
               <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-black text-slate-900">סורק מסמכים...</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-slate-900 rounded-full animate-pulse"></span>
                    <p className="text-base text-slate-500 font-bold tracking-tight">סה"כ {images.length} קבלות בתור לעיבוד</p>
                  </div>
               </div>
               {isProcessing && (
                 <div className="flex gap-3 items-center bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-black uppercase tracking-widest">ScanMaster AI analyzing...</span>
                 </div>
               )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`shimmer-container aspect-[3/4] rounded-[1.5rem] overflow-hidden border-2 border-white shadow-xl relative group bg-slate-100 transition-all duration-500 ${isProcessing ? 'scale-95 grayscale' : ''}`}
                >
                  <img 
                    src={img} 
                    alt={`Receipt ${idx}`} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${isProcessing ? 'blur-[4px] opacity-40 scale-105' : 'opacity-100 scale-100'}`} 
                  />
                  {isProcessing && <div className="shimmer-overlay z-10" />}
                  <div className="absolute top-3 right-3 z-20">
                     <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-black tracking-widest">#{idx+1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="max-w-screen-2xl mx-auto">
            <ResultView markdown={result} onClear={clearAll} images={images} />
          </div>
        )}
      </main>

      <footer className="mt-40 border-t border-slate-100 py-24 bg-slate-50/30 text-right">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
            <div className="space-y-6">
              <h4 className="font-black text-slate-900 text-2xl tracking-tight">ScanMaster AI</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">טכנולוגיית OCR מתקדמת מבוססת בינה מלאכותית המבטיחה דיוק מקסימלי בכל שפה.</p>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-slate-900 text-2xl tracking-tight">אבטחת נתונים</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">המסמכים שלך מעובדים באופן מאובטח ואינם נשמרים בשרתים חיצוניים מעבר לזמן העיבוד.</p>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-slate-900 text-2xl tracking-tight">תמיכה גלובלית</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">מערכת חכמה המותאמת לצרכי הנהלת חשבונות בינלאומית עם דגש על השוק הישראלי והאירופאי.</p>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 text-white px-4 py-1.5 rounded-lg font-black text-sm tracking-tighter uppercase">SM AI</div>
              <p className="text-slate-400 text-[11px] font-black tracking-[0.2em] uppercase">© 2025 ScanMaster - Premium Bookkeeping Intelligence</p>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400 hover:text-slate-600 transition-all cursor-default group/credit">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover/credit:opacity-100 transition-opacity">Developed by Aviel.Z 2025</span>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover/credit:scale-125 transition-transform"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
