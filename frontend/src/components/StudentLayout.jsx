import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { request } from '@/lib/api/client';
import { useSession } from '@/features/auth/SessionContext';
import { useSkin } from '@/lib/storage/skin';
import { isStandalone, useInstallPrompt } from '@/components/AppChrome';
import { DuckMascot, Logo, SoundToggle, ThemeToggle } from '@/components/ui';
import { IconAssess, IconChat, IconDownload, IconDuck, IconHome, IconLearn, IconLogout } from './icons';
import GariDrawer from './GariDrawer';
import styles from './layout.module.css';

const NAV = [
  { to: '/beranda', label: 'Beranda', icon: IconHome },
  { to: '/modul/pgl', label: 'Belajar', icon: IconLearn },
  { to: '/asesmen', label: 'Asesmen', icon: IconAssess },
  { to: '/gari', label: 'Gari-ku', icon: IconDuck },
];

/** Tata letak siswa setelah masuk: sidebar (desktop) / bilah bawah (ponsel), mengikuti referensi desain. */
export default function StudentLayout() {
  const { user, logout } = useSession();
  const skin = useSkin(user?.username);
  const navigate = useNavigate();
  const { available, install } = useInstallPrompt();
  const { pathname } = useLocation();
  const [aiOn, setAiOn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const closeChat = useCallback(() => setChatOpen(false), []);
  // PP-09: tidak ada Tanya Gari saat mengerjakan asesmen (server juga menolak).
  const inAssessment = /^\/asesmen\/.+/.test(pathname);
  const showGari = aiOn && !inAssessment;

  useEffect(() => {
    request('/me/ai')
      .then((r) => setAiOn(Boolean(r.available)))
      .catch(() => setAiOn(false));
  }, []);

  useEffect(() => {
    if (inAssessment) setChatOpen(false);
  }, [inAssessment]);

  const doLogout = async () => {
    if (await logout()) navigate('/');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Navigasi siswa">
        <div className={styles.brand}>
          <Logo to="/beranda" />
        </div>

        <label className={styles.moduleSelect}>
          <span className="visually-hidden">Modul</span>
          <select defaultValue="pgl" aria-label="Pilih modul">
            <option value="pgl">Persamaan Garis Lurus</option>
          </select>
        </label>

        <nav className={styles.nav}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navOn : ''}`}>
              <n.icon />
              {n.label}
            </NavLink>
          ))}
          {showGari && (
            <button
              type="button"
              className={`${styles.navItem} ${styles.gariNavBtn} ${chatOpen ? styles.navOn : ''}`}
              onClick={() => setChatOpen((v) => !v)}
              aria-expanded={chatOpen}
            >
              <IconChat />
              Tanya Gari
              <span className={styles.aiBadge}>AI</span>
            </button>
          )}
          <hr className={styles.sep} />
          <NavLink to="/pasang" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navOn : ''}`}>
            <IconDownload />
            Pasang Aplikasi
          </NavLink>
        </nav>

        {!isStandalone() && (
          <div className={styles.promo}>
            <div className={styles.promoText}>
              <span className={styles.promoBrand}>JelajahGaris</span>
              <strong>Belajar walau sinyal hilang</strong>
              {available ? (
                <button type="button" className={styles.promoBtn} onClick={install}>
                  Pasang
                </button>
              ) : (
                <NavLink to="/pasang" className={styles.promoBtn}>
                  Caranya
                </NavLink>
              )}
            </div>
            <DuckMascot size={78} skin="astronot" className={styles.promoDuck} />
          </div>
        )}

        <div className={styles.profile}>
          <NavLink to="/gari" className={styles.avatar} aria-label="Ganti skin Gari">
            <DuckMascot size={44} skin={skin} headOnly />
          </NavLink>
          <div className={styles.profileText}>
            <strong>{user?.username}</strong>
            <span>Kelas {user?.class_code}</span>
          </div>
          <SoundToggle />
          <ThemeToggle />
          <button type="button" className={styles.iconBtn} onClick={doLogout} aria-label="Keluar">
            <IconLogout />
          </button>
        </div>
      </aside>

      <header className={styles.mobileTop}>
        <Logo to="/beranda" />
        <div className={styles.mobileTopActions}>
          <SoundToggle />
          <ThemeToggle />
          <button type="button" className={styles.iconBtn} onClick={doLogout} aria-label="Keluar">
            <IconLogout />
          </button>
        </div>
      </header>

      <main className={styles.main} id="konten">
        <Outlet />
      </main>

      <nav className={`${styles.bottomNav} ${showGari ? styles.bottomNav5 : ''}`} aria-label="Navigasi siswa">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.bottomOn : ''}`}>
            <n.icon />
            <span>{n.label}</span>
          </NavLink>
        ))}
        {showGari && (
          <button
            type="button"
            className={`${styles.bottomItem} ${styles.gariNavBtn} ${chatOpen ? styles.bottomOn : ''}`}
            onClick={() => setChatOpen((v) => !v)}
            aria-expanded={chatOpen}
          >
            <IconChat />
            <span>Tanya Gari</span>
          </button>
        )}
      </nav>

      <GariDrawer open={chatOpen && showGari} onClose={closeChat} skin={skin} />
    </div>
  );
}
