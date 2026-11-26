import { useEffect, useRef } from 'react';
import { DuckMascot } from '@/components/ui';
import TanyaGari from '@/features/player/TanyaGari';
import styles from './layout.module.css';

/**
 * Laci obrolan "Tanya Gari" dari bilah samping (ADR-021): obrolan umum, tidak terikat satu langkah.
 * Tetap terbuka saat siswa berpindah halaman; ditutup dengan × atau Esc.
 */
export default function GariDrawer({ open, onClose, skin }) {
  const headRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    headRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <aside className={styles.gariDrawer} aria-labelledby="gari-drawer-title">
      <div className={styles.gariDrawerHead}>
        <DuckMascot size={48} skin={skin} mood="happy" headOnly />
        <div>
          <h2 id="gari-drawer-title" ref={headRef} tabIndex={-1}>
            Tanya Gari
          </h2>
          <span>Teman belajar AI · dipakai bersama orang tua/wali</span>
        </div>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Tutup obrolan Gari">
          ×
        </button>
      </div>
      <div className={styles.gariDrawerBody}>
        <TanyaGari />
      </div>
    </aside>
  );
}
