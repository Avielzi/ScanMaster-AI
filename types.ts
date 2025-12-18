
export interface ReceiptData {
  merchantName: string;
  date: string;
  currency: string;
  amount: number;
  category: string;
  notes: string;
}

export interface ProcessingResult {
  markdown: string;
  rawResponse?: string;
}

export interface FileWithPreview extends File {
  preview: string;
}
