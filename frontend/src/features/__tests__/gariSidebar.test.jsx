import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '@/features/auth/SessionContext';
import StudentLayout from '@/components/StudentLayout';
import { clearGariChats } from '@/lib/storage/gariChat';

function setup(path, { available = true, chat } = {}) {
  localStorage.setItem('auth_token', 't');
  localStorage.setItem('auth_user', JSON.stringify({ username: 'DEMO-01', role: 'student', class_code: 'DEMO' }));
  const fetchMock = vi.fn(async (url) => {
    const key = String(url).split('?')[0];
    if (key === '/api/v1/me/ai') return { ok: true, status: 200, json: async () => ({ available, limit_per_hour: 20 }) };
    if (key === '/api/v1/ai/chat') return { ok: true, status: 200, json: async () => chat };
    return { ok: true, status: 200, json: async () => [] };
  });
  vi.stubGlobal('fetch', fetchMock);
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <Routes>
          <Route element={<StudentLayout />}>
            <Route path="/beranda" element={<p>beranda</p>} />
            <Route path="/asesmen/:id" element={<p>asesmen</p>} />
          </Route>
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearGariChats();
});

describe('Tanya Gari di bilah samping (ADR-021)', () => {
  it('membuka laci obrolan umum dan mengirim ke /ai/chat', async () => {
    const fetchMock = setup('/beranda', { chat: { reply: 'Gradien itu kemiringan. Naik atau turun?', choices: ['Naik'], status: 'ok' } });
    const [btn] = await screen.findAllByRole('button', { name: /Tanya Gari/ });
    fireEvent.click(btn);
    const drawer = screen.getByRole('complementary', { name: 'Tanya Gari' });
    fireEvent.click(within(drawer).getByRole('button', { name: /Orang tuaku/ }));
    expect(within(drawer).getByText(/Mau tanya apa tentang persamaan garis lurus/)).toBeInTheDocument();
    fireEvent.click(within(drawer).getByRole('button', { name: 'Apa itu gradien?' }));
    expect(await within(drawer).findByRole('button', { name: 'Naik' })).toBeInTheDocument();
    const call = fetchMock.mock.calls.find(([u]) => String(u).includes('/ai/chat'));
    expect(JSON.parse(call[1].body)).toEqual({ question: 'Apa itu gradien?', history: [], supervised: true });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('complementary', { name: 'Tanya Gari' })).not.toBeInTheDocument();
  });

  it('tidak tampil bila kelas belum diizinkan', async () => {
    const fetchMock = setup('/beranda', { available: false });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Tanya Gari/ })).not.toBeInTheDocument();
  });

  it('disembunyikan saat mengerjakan asesmen (PP-09)', async () => {
    const fetchMock = setup('/asesmen/3');
    await vi.waitFor(() => expect(fetchMock.mock.calls.some(([u]) => String(u).includes('/me/ai'))).toBe(true));
    await screen.findByText('asesmen');
    expect(screen.queryByRole('button', { name: /Tanya Gari/ })).not.toBeInTheDocument();
  });

  it('keluar menghapus percakapan & konfirmasi pendamping', () => {
    sessionStorage.setItem('gari-chat:umum', '{}');
    sessionStorage.setItem('gari-ai-supervised', '1');
    sessionStorage.setItem('lain', 'x');
    clearGariChats();
    expect(sessionStorage.getItem('gari-chat:umum')).toBeNull();
    expect(sessionStorage.getItem('gari-ai-supervised')).toBeNull();
    expect(sessionStorage.getItem('lain')).toBe('x');
  });
});
