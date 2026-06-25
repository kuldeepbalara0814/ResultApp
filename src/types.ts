export interface PredictionInput {
  date: string;
  fd: string;
  gb: string;
  gl: string;
  ds: string;
}

export interface TokariItem {
  id: string; // e.g., "04/40" or "22"
  jodis: string[]; // e.g., ["04", "40"] or ["22"]
  count: number;
}

export interface PredictionResult {
  l1: string[];
  l2: string[];
  l3: string[];
  tokari: TokariItem[];
}

export interface GameResult {
  date: string;
  fd: string;
  gb: string;
  gl: string;
  ds: string;
}

export type PassLocation = 'FD' | 'GB' | 'GL' | 'DS' | 'FAIL' | 'PENDING';

export interface TrackerEntry {
  id: string;
  date: string;
  isPlay: boolean;
  passLocation: PassLocation | null;
}
