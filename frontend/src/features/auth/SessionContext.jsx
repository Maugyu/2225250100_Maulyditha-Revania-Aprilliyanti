import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, session, setUnauthorizedHandler } from '@/lib/api/client';
import { drafts } from '@/lib/storage/local';
import { clearOutbox, flushOutbox, outboxSize } from '@/lib/storage/outbox';
import { clearGariChats } from '@/lib/storage/gariChat';

const SessionContext = createContext(null);

/** Ambil seluruh konten modul agar tersimpan di cache service worker untuk offline (PWA §3.3). */
async function prefetchContent() {
  try {
    const mods = await api.modules();
    for (const m of mods) {
      const detail = await api.module(m.slug);
      for (const u of detail.units) {
        for (const a of u.activities) await api.activity(a.id);
      }
    }
  } catch {
    /* prefetch bersifat opsional */
  }
}

export function SessionProvider({ children }) {
  const [user, setUser] = useState(() => (session.token ? session.user : null));

  const logout = useCallback(async ({ force = false } = {}) => {
    if (!force && outboxSize() > 0) {
      const ok = window.confirm(
        'Masih ada jawaban yang belum terkirim karena offline. Jika keluar sekarang, jawaban itu hilang. Tetap keluar?',
      );
      if (!ok) return false;
    }
    session.clear();
    drafts.clearAll();
    clearGariChats();
    clearOutbox();
    try {
      await caches?.delete('user-v1');
    } catch {
      /* Cache API mungkin tidak tersedia */
    }
    setUser(null);
    return true;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      session.clear();
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    flushOutbox();
    const onOnline = () => flushOutbox();
    window.addEventListener('online', onOnline);
    const timer = setInterval(() => navigator.onLine && outboxSize() && flushOutbox(), 60_000);
    return () => {
      window.removeEventListener('online', onOnline);
      clearInterval(timer);
    };
  }, [user]);

  const login = useCallback(async (username, pin) => {
    const res = await api.login(username.trim().toUpperCase(), pin.trim());
    session.save(res.access_token, res.user);
    setUser(res.user);
    if (res.user.role === 'student') prefetchContent();
    return res.user;
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
