export interface VocabWord {
  id: number;
  day: number;
  chinese: string;
  pinyin: string;
  korean: string;
  memorized: boolean;
  lastReviewed?: string;
  total?: number;
}

export interface SheetData {
  range: string;
  values: string[][];
}

export interface UpdateRequest {
  word: VocabWord;
  action: 'add' | 'update' | 'delete' | 'mark_memorized' | 'increment_total';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}