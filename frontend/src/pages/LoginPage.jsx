import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSession } from '@/features/auth/SessionContext';
import { Button, Card, DuckMascot } from '@/components/ui';
import styles from './pages.module.css';

export default function LoginPage() {
  const { user, login } = useSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'researcher' ? '/peneliti' : '/beranda'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !pin.trim()) {
      setError('Isi kode siswa dan PIN.');
      return;
    }
    setBusy(true);
    try {
      const u = await login(username, pin);
      navigate(u.role === 'researcher' ? '/peneliti' : '/beranda', { replace: true });
    } catch (err) {
      setError(err.message);
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.loginWrap}>
      <Card className={styles.loginCard}>
        <form onSubmit={submit} className={styles.loginCard} noValidate>
          <div className={styles.loginTop}>
            <DuckMascot size={84} hat="cap" />
            <div>
              <h1>Masuk</h1>
              <p className={styles.muted}>Belajar garis lurus, selangkah demi selangkah.</p>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="username">Kode siswa</label>
            <input
              id="username"
              autoComplete="username"
              autoCapitalize="characters"
              placeholder="contoh: KLS8A-07"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pin">PIN</label>
            <div className={styles.pinRow}>
              <input
                id="pin"
                type={show ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="current-password"
                placeholder="6 angka"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => setShow((v) => !v)} aria-pressed={show}>
                {show ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
            </div>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button variant="primary" type="submit" block disabled={busy}>
            {busy ? 'Memeriksa…' : 'Masuk'}
          </Button>
          <p className={styles.muted}>Belum punya kode? Minta ke guru atau peneliti. Kami tidak meminta nama, email, atau nomor HP.</p>
          {import.meta.env.DEV && (
            <p className={styles.demo}>
              <b>Mode pengembangan:</b> akun demo <code>DEMO-01</code> (siswa) atau <code>PENELITI-DEMO</code>, PIN{' '}
              <code>123456</code>.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
