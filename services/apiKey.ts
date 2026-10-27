// מאיפה מגיע מפתח Gemini, לפי הסדר:
//  1. מפתח שהמשתמש שמר בדפדפן הזה (מסך החיבור). נשאר ב-localStorage שלו
//     ונשלח רק ל-Google.
//  2. מפתח שסביבת האירוח מספקת בזמן ריצה: Google AI Studio עושה את זה
//     אחרי openSelectKey. הוא אף פעם לא חלק מהקבצים שנבנו.
// המפתח לא נצרב יותר ב-bundle: vite.config.ts כבר לא מזריק GEMINI_API_KEY,
// ובנייה שמכילה מפתח Google נכשלת.

export const API_KEY_STORAGE_KEY = 'scanmaster_api_key';

export function getApiKey(): string | undefined {
  try {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY)?.trim();
    if (saved) return saved;
  } catch { /* storage blocked */ }
  try {
    // ביטוי מילולי בכוונה: AI Studio מחליף אותו. בבנייה רגילה אין process.
    const hosted = process.env.API_KEY;
    if (typeof hosted === 'string' && hosted.trim()) return hosted.trim();
  } catch { /* לא סופק ע"י הסביבה */ }
  return undefined;
}

export function saveApiKey(key: string): void {
  const k = key.trim();
  try {
    if (k) localStorage.setItem(API_KEY_STORAGE_KEY, k);
    else localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch { /* storage blocked */ }
}
