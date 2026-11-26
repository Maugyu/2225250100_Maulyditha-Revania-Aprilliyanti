import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Node ≥ 25 punya global `localStorage` sendiri (undefined tanpa --localstorage-file) yang menimpa
// milik jsdom. Pasang penyimpanan memori sederhana agar tes bisa memakai localStorage.
if (!globalThis.localStorage || typeof globalThis.localStorage.setItem !== 'function') {
  const data = new Map();
  const memory = {
    getItem: (k) => (data.has(String(k)) ? data.get(String(k)) : null),
    setItem: (k, v) => data.set(String(k), String(v)),
    removeItem: (k) => data.delete(String(k)),
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: memory, configurable: true, writable: true });
}

// Isolasi antar-tes: draf jawaban & skin tidak boleh terbawa ke tes berikutnya.
afterEach(() => globalThis.localStorage.clear());
