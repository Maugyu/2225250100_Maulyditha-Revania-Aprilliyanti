import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { SessionProvider, useSession } from '@/features/auth/SessionContext';
import SiteHeader from '@/components/SiteHeader';
import StudentLayout from '@/components/StudentLayout';
import { OfflineBanner, UpdatePrompt } from '@/components/AppChrome';
import { Loading } from '@/components/ui';
import { installTapSound } from '@/lib/sound';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import ModulePage from '@/pages/ModulePage';
import ActivityPage from '@/pages/ActivityPage';
import SkinPage from '@/pages/SkinPage';
import { AssessmentListPage, AssessmentRunPage } from '@/pages/AssessmentPages';
import { InstallPage, NotFoundPage } from '@/pages/MiscPages';

// Area peneliti dimuat terpisah agar bundel siswa tetap kecil (NFR-02).
const ResearcherPage = lazy(() => import('@/pages/ResearcherPage'));

function RequireRole({ role }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/masuk" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'researcher' ? '/peneliti' : '/beranda'} replace />;
  return <Outlet />;
}

function WithHeader() {
  return (
    <>
      <SiteHeader />
      <main id="konten">
        <Outlet />
      </main>
    </>
  );
}

/** Halaman yang dipakai publik & siswa (mis. /pasang): siswa tetap melihat sidebar. */
function Adaptive() {
  const { user } = useSession();
  return user?.role === 'student' ? <StudentLayout /> : <WithHeader />;
}

export default function App() {
  useEffect(() => installTapSound(), []); // suara ketuk untuk semua tombol (F-26)
  return (
    <SessionProvider>
      <OfflineBanner />
      <Routes>
        <Route element={<WithHeader />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/masuk" element={<LoginPage />} />
          <Route element={<RequireRole role="researcher" />}>
            <Route
              path="/peneliti"
              element={
                <Suspense fallback={<Loading />}>
                  <ResearcherPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Area siswa setelah masuk: sidebar seperti referensi desain. */}
        <Route element={<RequireRole role="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="/beranda" element={<HomePage />} />
            <Route path="/modul/:slug" element={<ModulePage />} />
            <Route path="/asesmen" element={<AssessmentListPage />} />
            <Route path="/asesmen/:id" element={<AssessmentRunPage />} />
            <Route path="/gari" element={<SkinPage />} />
          </Route>
          {/* Pemutar aktivitas layar penuh: tanpa navigasi agar fokus (PP-02). */}
          <Route path="/aktivitas/:id" element={<ActivityPage />} />
        </Route>

        <Route element={<Adaptive />}>
          <Route path="/pasang" element={<InstallPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <UpdatePrompt />
    </SessionProvider>
  );
}
