import { Button, Card, DuckMascot } from '@/components/ui';
import { isStandalone, useInstallPrompt } from '@/components/AppChrome';
import styles from './pages.module.css';

export function InstallPage() {
  const { available, install } = useInstallPrompt();
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return (
    <div className={`${styles.page} ${styles.narrow}`}>
      <Card>
        <div className={styles.mapHead}>
          <DuckMascot size={80} hat="cap" />
          <div>
            <h1>Pasang JelajahGaris</h1>
            <p className={styles.muted}>Tanpa Play Store. Setelah dipasang, materi bisa dibuka walau sinyal hilang.</p>
          </div>
        </div>
        {isStandalone() ? (
          <p>Aplikasi sudah terpasang di perangkat ini. 🎉</p>
        ) : available ? (
          <Button variant="primary" onClick={install}>
            Pasang sekarang
          </Button>
        ) : ios ? (
          <ol className={styles.installSteps}>
            <li>Buka halaman ini di <b>Safari</b>.</li>
            <li>Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).</li>
            <li>Pilih <b>Tambahkan ke Layar Utama</b>, lalu <b>Tambah</b>.</li>
          </ol>
        ) : (
          <ol className={styles.installSteps}>
            <li>Buka halaman ini di <b>Google Chrome</b>.</li>
            <li>Ketuk menu <b>⋮</b> di kanan atas.</li>
            <li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</li>
            <li>Buka aplikasi sekali saat online agar materi tersimpan untuk offline.</li>
          </ol>
        )}
      </Card>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className={`${styles.page} ${styles.narrow}`} style={{ textAlign: 'center' }}>
      <DuckMascot size={140} hat="none" mood="think" />
      <h1>Halaman tidak ditemukan</h1>
      <p className={styles.muted}>Mungkin tautannya salah, atau halaman ini belum tersimpan untuk offline.</p>
      <Button variant="primary" to="/">
        Ke halaman awal
      </Button>
    </div>
  );
}
