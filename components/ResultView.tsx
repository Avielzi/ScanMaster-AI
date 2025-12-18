
import React, { useState, useEffect } from 'react';

interface ResultViewProps {
  markdown: string;
  images: string[];
  onClear: () => void;
}

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

const getCategoryStyles = (category: string) => {
  const styles: Record<string, string> = {
    'מזון ואירוח': 'bg-orange-50 text-orange-700 border-orange-100',
    'תחבורה ודלק': 'bg-blue-50 text-blue-700 border-blue-100',
    'ציוד ומכשור': 'bg-purple-50 text-purple-700 border-purple-100',
    'תקשורת ומחשוב': 'bg-cyan-50 text-cyan-700 border-cyan-100',
    'תחזוקה ומשרד': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'טיסות ולינה': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'שירותים מקצועיים': 'bg-slate-100 text-slate-700 border-slate-200',
    'שיווק ופרסום': 'bg-rose-50 text-rose-700 border-rose-100',
    'אחר': 'bg-gray-100 text-gray-600 border-gray-200'
  };
  return styles[category.trim()] || 'bg-slate-50 text-slate-600 border-slate-100';
};

const Lightbox: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    if (Math.abs(endY - startY) > 100) handleClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-6 right-6 z-10">
        <button className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <img 
        src={imageUrl} 
        alt="Full size receipt" 
        className="max-w-[95%] max-h-[90%] object-contain rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-10 text-white/50 text-xs font-bold uppercase tracking-widest text-center">
        החלקה למעלה או למטה לסגירה
      </div>
    </div>
  );
};

const ReceiptCard: React.FC<{
  merchant: string;
  date: string;
  amount: string;
  category: string;
  notes: string;
}> = ({ merchant, date, amount, category, notes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const catStyles = getCategoryStyles(category);
  const isLong = notes.length > 80;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-right">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${catStyles}`}>
          {category}
        </span>
        <span className="text-slate-400 text-xs font-bold">{date}</span>
      </div>
      <h4 className="text-xl font-black text-slate-900 mb-2">{merchant}</h4>
      <div className="text-2xl font-black text-blue-600 mb-4">{amount}</div>
      <div className="relative">
        <div 
          className={`text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all duration-300 overflow-hidden ${
            !isExpanded && isLong ? 'max-h-24' : 'max-h-[500px]'
          }`}
        >
          <p className={!isExpanded && isLong ? 'line-clamp-2' : ''}>
            {notes}
          </p>
        </div>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors mr-auto"
          >
            {isExpanded ? 'סגור' : 'קרא עוד...'}
          </button>
        )}
      </div>
    </div>
  );
};

const ResultView: React.FC<ResultViewProps> = ({ markdown, images, onClear }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [showImages, setShowImages] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const parseTableData = () => {
    const lines = markdown.trim().split('\n');
    const dataRows: string[][] = [];
    const summaryRows: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
        const cells = trimmed
          .split('|')
          .map(c => c.trim())
          .filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (cells.length > 0) dataRows.push(cells);
      } else if (trimmed.startsWith('סה"כ')) {
        summaryRows.push(trimmed);
      }
    });

    return { dataRows, summaryRows };
  };

  const handleExportToSheets = async () => {
    if (!(window as any).google?.accounts?.oauth2) {
      alert('ספריית Google נטענת...');
      return;
    }
    setIsExporting(true);
    setExportStep('מתחבר ל-Google...');
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error !== undefined) { 
            setIsExporting(false); 
            setExportStep(null);
            return; 
          }
          await createSpreadsheet(response.access_token);
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      setIsExporting(false);
      setExportStep(null);
    }
  };

  const createSpreadsheet = async (accessToken: string) => {
    setExportStep('יוצר גיליון חדש...');
    const { dataRows, summaryRows } = parseTableData();
    if (dataRows.length === 0) return;
    const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
    
    try {
      const createResponse = await fetch('https://sheets.googleapis.com/v1/spreadsheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: { title: `ScanMaster AI - ייצוא ${dateStr}`, locale: 'he_IL' },
          sheets: [{ properties: { title: 'Sheet1', rightToLeft: true, gridProperties: { frozenRowCount: 1 } } }]
        }),
      });
      const spreadsheet = await createResponse.json();
      const spreadsheetId = spreadsheet.spreadsheetId;

      setExportStep('מעדכן נתונים...');
      const values: string[][] = [...dataRows];
      if (summaryRows.length > 0) {
        values.push([""]);
        summaryRows.forEach(s => values.push([s]));
      }
      const columnCount = Math.max(...values.map(v => v.length));
      const range = `A1:${String.fromCharCode(64 + columnCount)}${values.length}`;
      await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/Sheet1!${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ range: `Sheet1!${range}`, majorDimension: 'ROWS', values: values }),
      });

      setExportStep('מסנכרן ל-Google Drive...');
      const folderName = 'ScanMaster AI Exports';
      const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const searchResult = await searchResponse.json();
      let folderId;

      if (searchResult.files && searchResult.files.length > 0) {
        folderId = searchResult.files[0].id;
      } else {
        const createFolderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder' })
        });
        const newFolder = await createFolderResponse.json();
        folderId = newFolder.id;
      }

      const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=parents`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const fileInfo = await fileResponse.json();
      const previousParents = fileInfo.parents.join(',');

      await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&removeParents=${previousParents}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      setSheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    } catch (err) {
      alert('חלה שגיאה בסנכרון ל-Drive.');
    } finally {
      setIsExporting(false);
      setExportStep(null);
    }
  };

  const downloadCSV = () => {
    const { dataRows, summaryRows } = parseTableData();
    let csvContent = dataRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    if (summaryRows.length > 0) csvContent += '\n\n' + summaryRows.map(s => `"${s.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="mt-8 md:mt-12 space-y-8 md:space-y-12 animate-slide-up">
      {activeImage && <Lightbox imageUrl={activeImage} onClose={() => setActiveImage(null)} />}

      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 px-2">
        <div className="text-right w-full lg:w-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">סקירת ScanMaster AI</h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium">המערכת ניתחה {images.length} מסמכים.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={() => setShowImages(!showImages)}
            className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-black shadow-sm text-sm"
          >
            {showImages ? 'הסתר מקור' : 'הצג מקור'}
          </button>
          
          {sheetUrl ? (
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 font-black shadow-xl shadow-green-100 text-sm">
              פתח ב-Sheets
            </a>
          ) : (
            <button 
              onClick={handleExportToSheets} 
              disabled={isExporting} 
              className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 text-sm font-black"
            >
              {isExporting ? exportStep : 'ייצוא ל-Sheets'}
            </button>
          )}
          
          <button onClick={downloadCSV} className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-black text-sm">
            CSV
          </button>
          <button onClick={onClear} className="flex-1 sm:flex-none px-5 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-black text-sm">
            נקה
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${showImages ? 'lg:grid-cols-[1fr_350px]' : 'grid-cols-1'}`}>
        <div className="space-y-8 md:space-y-12 overflow-hidden">
          {/* Quick Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
             {parseMarkdownToCards(markdown)}
          </div>

          {/* Table View */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_15px_45px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden text-right">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="markdown-content p-4 md:p-8">
                <style dangerouslySetInnerHTML={{ __html: `
                  .markdown-content table { 
                    width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 2rem; border-radius: 1rem; overflow: hidden; border: 1px solid #e2e8f0; min-width: 800px;
                    transition: all 0.3s ease;
                  }
                  .markdown-content th { background-color: #0f172a; color: #f8fafc; padding: 1.25rem 1rem; text-align: right; font-weight: 800; font-size: 0.75rem; border-left: 1px solid #1e293b; }
                  .markdown-content td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.9rem; font-weight: 600; border-left: 1px solid #f1f5f9; white-space: nowrap; transition: all 0.2s ease; position: relative; }
                  .markdown-content tr:nth-child(even) { background-color: #fcfdfe; }
                  
                  /* Hover Effects */
                  .markdown-content tr:hover td { 
                    background-color: #f8fafc; 
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
                  }
                  .markdown-content td:hover {
                    background-color: #ffffff !important;
                    z-index: 5;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05), inset 0 0 0 1px #e2e8f0;
                  }

                  /* Responsive Table Tweaks */
                  @media (max-width: 768px) {
                    .markdown-content table { min-width: 600px; font-size: 0.85rem; }
                    .markdown-content td, .markdown-content th { padding: 0.85rem 0.65rem; }
                    .markdown-content th { font-size: 0.7rem; }
                    .markdown-content td { font-size: 0.8rem; }
                  }

                  /* Mobile-optimized Summary */
                  .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2rem; padding: 2rem; margin-top: 2rem; }
                  .summary-item { font-size: 1rem; font-weight: 700; color: #334155; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; padding: 1.25rem; background: #ffffff; border-radius: 1.25rem; border: 1px solid #eef2f6; transition: transform 0.2s ease, box-shadow 0.2s ease; }
                  .summary-item:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                  @media (min-width: 640px) { .summary-item { flex-direction: row; justify-content: space-between; align-items: center; } }
                  .summary-item.weighted { background: #0f172a; color: #ffffff; font-size: 1.4rem; font-weight: 900; margin-top: 1.5rem; padding: 1.75rem; }
                  .summary-title { font-size: 1.75rem; font-weight: 900; color: #0f172a; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
                  .summary-title::after { content: ''; flex: 1; height: 3px; background: #cbd5e1; border-radius: 3px; opacity: 0.3; }
                ` }} />
                <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(markdown) }} />
              </div>
            </div>
          </div>
        </div>

        {showImages && (
          <aside className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl lg:sticky lg:top-24 max-h-[80vh] lg:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar border border-slate-800">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 text-right">מסמכי מקור (לחץ פעמיים להגדלה)</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="group relative rounded-2xl md:rounded-3xl overflow-hidden border-2 border-slate-800 transition-all duration-300 hover:border-blue-500/50 shadow-lg cursor-pointer aspect-square lg:aspect-auto"
                    onDoubleClick={() => setActiveImage(img)}
                    title="דאבל קליק להגדלה"
                  >
                    <img src={img} alt={`Source ${idx}`} className="w-full h-full object-cover lg:object-contain bg-black/40 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      Quick View
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

function parseMarkdownToCards(md: string) {
  const cards: React.ReactElement[] = [];
  const blocks = md.split('---');
  
  blocks.forEach((block, idx) => {
    const lines = block.trim().split('\n');
    if (lines.some(l => l.includes('📍'))) {
      const cardData: Record<string, string> = {};
      lines.forEach(line => {
        if (line.includes('📍')) cardData.merchant = line.replace('📍 מקום ההוצאה:', '').trim();
        if (line.includes('📅')) cardData.date = line.replace('📅 מועד הפעילות:', '').trim();
        if (line.includes('💰')) cardData.amount = line.replace('💰 עלות כוללת:', '').trim();
        if (line.includes('📁')) cardData.category = line.replace('📁 סוג הוצאה:', '').trim();
        if (line.includes('📝')) cardData.notes = line.replace('📝 פרטים נוספים:', '').trim();
      });

      if (cardData.merchant) {
        cards.push(
          <ReceiptCard 
            key={idx}
            merchant={cardData.merchant}
            date={cardData.date || ''}
            amount={cardData.amount || ''}
            category={cardData.category || ''}
            notes={cardData.notes || ''}
          />
        );
      }
    }
  });
  return cards;
}

function parseMarkdownToHtml(md: string) {
  const lines = md.trim().split('\n');
  let html = '';
  let inTable = false;
  let inSummary = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('📍') || trimmed.startsWith('📅') || trimmed.startsWith('💰') || trimmed.startsWith('📁') || trimmed.startsWith('📝') || (trimmed === '---' && !inSummary)) {
      if (trimmed === '---' && inTable) { html += '</tbody></table>'; inTable = false; }
      return; 
    }
    
    if (trimmed.startsWith('סה"כ קבלות') || trimmed.startsWith('סה"כ לתשלום')) {
      if (!inSummary) {
        if (inTable) { html += '</tbody></table>'; inTable = false; }
        html += '<div class="summary-box"><span class="summary-title">סיכום ScanMaster</span>';
        inSummary = true;
      }
      const isWeighted = trimmed.includes('לתשלום');
      const parts = trimmed.split(':');
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      html += `<span class="summary-item ${isWeighted ? 'weighted' : ''}"><span>${key}</span> <span class="font-black">${val}</span></span>`;
      return;
    }

    if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) return;
      const cells = trimmed.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (!inTable) {
        html += '<table><thead><tr>';
        cells.forEach(cell => html += `<th>${cell}</th>`);
        html += '</tr></thead><tbody>';
        inTable = true;
      } else {
        html += '<tr>';
        cells.forEach(cell => html += `<td>${cell}</td>`);
        html += '</tr>';
      }
    }
  });

  if (inTable) html += '</tbody></table>';
  if (inSummary) html += '</div>';
  return html;
}

export default ResultView;
