import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnline } from '@/features/auth/SessionContext';
import { onOutboxChange, outboxSize } from '@/lib/storage/outbox';
import { Button, uiStyles } from '@/components/ui';

/** Banner status offline (US-20 AC2) + jumlah jawaban yang menunggu terkirim. */
export function OfflineBanner() {
  const online = useOnline();
  const [pending, setPending] = useState(outboxSize());
  useEffect(() => onOutboxChange(setPending), []);
  if (online && !pending) return null;
  return (
    <div className={uiStyles.banner} role="status">
      {online
        ? `Mengirim ${pending} jawaban yang tersimpan…`
        : `Kamu sedang offline. Materi & penjelajah tetap bisa dipakai. ${
            pending ? `${pending} jawaban disimpan di perangkat dan dikirim saat online.` : ''
          }`}
    </div>
  );
}

/**
 * Prompt pembaruan versi PWA (registerType: 'prompt').
 * Tidak ditampilkan selama asesmen agar siswa tidak terganggu (PWA_SPECIFICATION §6).
 */
export function UpdatePrompt() {
  const [reg, setReg] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
    let cancelled = false;
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        const update = registerSW({
          onNeedRefresh() {
            if (!cancelled) setReg(() => update);
          },
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!reg || location.pathname.startsWith('/asesmen')) return null;
  return (
    <div className={uiStyles.toast} role="alert">
      <span>Versi baru tersedia.</span>
      <Button variant="secondary" size="sm" onClick={() => reg(true)}>
        Muat ulang
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setReg(null)}>
        Nanti
      </Button>
    </div>
  );
}

/** Menyimpan event instalasi PWA (Chrome/Edge) agar bisa dipicu dari tombol. */
let deferredPrompt = null;
const installListeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach((fn) => fn(true));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
  });
}

export function useInstallPrompt() {
  const [available, setAvailable] = useState(Boolean(deferredPrompt));
  useEffect(() => {
    installListeners.add(setAvailable);
    return () => installListeners.delete(setAvailable);
  }, []);
  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setAvailable(false);
    return outcome === 'accepted';
  };
  return { available, install };
}

export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}
