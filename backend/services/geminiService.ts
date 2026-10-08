import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Helper to extract clean human-readable error messages from GenAI errors
export function formatErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  const raw = err.message || String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error && parsed.error.message) {
      return parsed.error.message;
    }
  } catch {
    // raw string is not JSON
  }
  return raw || fallback;
}

// Server-side Gemini initialization with mandatory telemetry header
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});
