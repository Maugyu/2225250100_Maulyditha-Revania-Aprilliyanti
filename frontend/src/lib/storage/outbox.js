/**
 * Antrean kirim (F-19, versi sederhana berbasis localStorage).
 * Permintaan tulis yang gagal karena offline disimpan lalu dikirim ulang berurutan saat online.
 * Aman diulang karena server idempoten berdasarkan client_id.
 */
import { request, ApiError } from '@/lib/api/client';
import { storage } from '@/lib/storage/local';

const KEY = 'outbox';
const listeners = new Set();

function read() {
  try {
    return JSON.parse(storage.get(KEY) || '[]');
  } catch {
    return [];
  }
}
function write(items) {
  storage.set(KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn(items.length));
}

export function outboxSize() {
  return read().length;
}

export function onOutboxChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Kirim sekarang; bila offline masukkan ke antrean. Menghasilkan respons atau null bila diantrekan. */
export async function sendOrQueue(path, method, body) {
  if (read().length) {
    // Jaga urutan: bila masih ada antrean, antrekan juga.
    write([...read(), { path, method, body }]);
    flushOutbox();
    return null;
  }
  try {
    return await request(path, { method, body });
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      write([...read(), { path, method, body }]);
      return null;
    }
    throw err;
  }
}

let flushing = false;
export async function flushOutbox() {
  if (flushing) return;
  flushing = true;
  try {
    let items = read();
    while (items.length) {
      const [first] = items;
      try {
        await request(first.path, { method: first.method, body: first.body });
      } catch (err) {
        if (err instanceof ApiError && err.isNetwork) break; // masih offline
        if (err instanceof ApiError && err.status === 401) break; // tunggu login
        console.warn('Entri antrean ditolak server dan dibuang:', err.code);
      }
      items = read().slice(1);
      write(items);
    }
  } finally {
    flushing = false;
  }
}

export function clearOutbox() {
  write([]);
}
