import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '@/features/auth/SessionContext';
import StudentLayout from '@/components/StudentLayout';
import HomePage from '@/pages/HomePage';
import SkinPage from '@/pages/SkinPage';

const module = {
  slug: 'pgl',
  units: [
    { slug: 'u1-tabel-grafik', order_index: 1, title: 'Dari Tabel ke Grafik', is_optional: false, activities: [{ id: 2, slug: 'u1-jelajah' }] },
    { slug: 'u2-gradien', order_index: 2, title: 'Gradien', is_optional: false, activities: [{ id: 5, slug: 'u2-jelajah' }] },
  ],
  glossary: [],
};
const responses = {
  '/api/v1/me/resume': { activity_id: 2, unit_title: 'Dari Tabel ke Grafik', activity_title: 'Tabungan Dina', is_new: true },
  '/api/v1/me/progress': {
    units: [
      { slug: 'u1-tabel-grafik', status: 'in_progress', activities_done: 0, activities_total: 1 },
      { slug: 'u2-gradien', status: 'not_started', activities_done: 0, activities_total: 1 },
    ],
    completed_units: 0,
    total_required_units: 2,
    activities: {},
    reflections: 0,
    active_days: [new Date().toISOString().slice(0, 10)],
  },
  '/api/v1/modules/pgl': module,
  '/api/v1/me/assessments': [],
};

function setup(path) {
  localStorage.setItem('auth_token', 't');
  localStorage.setItem('auth_user', JSON.stringify({ username: 'DEMO-01', role: 'student', class_code: 'DEMO' }));
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const key = String(url).split('?')[0];
    return { ok: true, status: 200, json: async () => responses[key] ?? [] };
  }));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <Routes>
          <Route element={<StudentLayout />}>
            <Route path="/beranda" element={<HomePage />} />
            <Route path="/gari" element={<SkinPage />} />
          </Route>
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('Beranda baru', () => {
  it('menampilkan Langkah pertama, banner, hari belajar, dan misi', async () => {
    setup('/beranda');
    expect(await screen.findByText('Langkah pertama')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dari Tabel ke Grafik' })).toBeInTheDocument();
    expect(screen.getByText(/dari 7 hari belajar minggu ini/)).toBeInTheDocument();
    expect(screen.getByText('Misi belajar')).toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument(); // PP-10
  });

  it('memilih skin Gari tersimpan per siswa', async () => {
    setup('/gari');
    const btn = await screen.findByRole('button', { name: /Astronot/ });
    btn.click();
    expect(localStorage.getItem('skin:DEMO-01')).toBe('astronot');
  });
});
