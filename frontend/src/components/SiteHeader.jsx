import { NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '@/features/auth/SessionContext';
import { Button, Logo, SoundToggle, ThemeToggle } from '@/components/ui';
import styles from './site.module.css';

/** Kepala halaman. Publik: navigasi + Masuk + Mulai Belajar. Masuk: sapaan + Keluar. */
export default function SiteHeader() {
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const doLogout = async () => {
    if (await logout()) navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Logo to={user ? (user.role === 'researcher' ? '/peneliti' : '/beranda') : '/'} />
        {!user && (
          <nav className={styles.nav} aria-label="Navigasi utama">
            <a href="/#materi">Materi</a>
            <a href="/#cara-belajar">Cara Belajar</a>
            <NavLink to="/pasang">Pasang Aplikasi</NavLink>
          </nav>
        )}
        {user?.role === 'student' && (
          <nav className={styles.nav} aria-label="Navigasi siswa">
            <NavLink to="/beranda">Beranda</NavLink>
            <NavLink to="/modul/pgl">Materi</NavLink>
            <NavLink to="/asesmen">Asesmen</NavLink>
          </nav>
        )}
        <div className={styles.headerActions}>
          <SoundToggle />
          <ThemeToggle />
          {user ? (
            <>
              <span className={styles.userTag}>{user.username}</span>
              <Button variant="ghost" size="sm" onClick={doLogout}>
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/masuk" className={styles.hideXs}>
                Masuk
              </Button>
              <Button variant="primary" to="/masuk" aria-label="Mulai belajar">
                Mulai<span className={styles.hideXs}>Belajar</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
