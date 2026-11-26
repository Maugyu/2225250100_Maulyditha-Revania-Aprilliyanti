import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TanyaGari, { speakable, starterChoices } from '@/features/player/TanyaGari';

const step = { key: 'hitung', type: 'numeric' };

const reply = (payload) =>
  vi.fn(async () => ({ ok: true, status: 200, json: async () => payload }));

afterEach(() => {
  vi.unstubAllGlobals();
  try {
    sessionStorage.clear();
  } catch {
    /* abaikan */
  }
});

function openChat(props = {}) {
  render(<TanyaGari activityId={10} step={step} process="employ" {...props} />);
  fireEvent.click(screen.getByRole('button', { name: /Orang tuaku/ }));
}

describe('TanyaGari', () => {
  it('wajib konfirmasi pendamping sebelum bisa bertanya', () => {
    render(<TanyaGari activityId={10} step={step} />);
    expect(screen.queryByLabelText('Pertanyaan untuk Gari')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Orang tuaku sedang mendampingi/ }));
    expect(screen.getByLabelText('Pertanyaan untuk Gari')).toBeInTheDocument();
  });

  it('menyapa sesuai proses langkah dan menawarkan pilihan cepat (tanpa memanggil AI)', () => {
    const fetchMock = reply({});
    vi.stubGlobal('fetch', fetchMock);
    openChat();
    expect(screen.getByText(/Sekarang saatnya menghitung/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aku bingung mulai dari mana' })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mengirim pertanyaan (supervised: true) dan menampilkan balasan Gari', async () => {
    const fetchMock = reply({ reply: 'Coba substitusi $x = 8$ dulu ya!', choices: [], status: 'ok' });
    vi.stubGlobal('fetch', fetchMock);
    openChat({ currentAnswer: { value: '20000' } });
    fireEvent.change(screen.getByLabelText('Pertanyaan untuk Gari'), { target: { value: 'bingung mulai dari mana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(await screen.findByText(/Coba substitusi/)).toBeInTheDocument();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ activity_id: 10, step_key: 'hitung', supervised: true, question: 'bingung mulai dari mana' });
    expect(body.history).toEqual([]); // sapaan lokal tidak dikirim sebagai riwayat
  });

  it('pilihan cepat langsung terkirim, menyertakan kode umpan balik, lalu menampilkan pilihan dari Gari', async () => {
    const fetchMock = reply({ reply: 'Coba lihat tandanya. Naik atau turun?', choices: ['Naik', 'Turun'], status: 'ok' });
    vi.stubGlobal('fetch', fetchMock);
    openChat({ feedbackCode: 'SIGN_FLIP' });
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa jawabanku belum tepat?' }));
    expect(await screen.findByRole('button', { name: 'Naik' })).toBeInTheDocument();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ question: 'Kenapa jawabanku belum tepat?', feedback_code: 'SIGN_FLIP' });
  });

  it('percakapan tetap ada saat panel dibuka lagi', async () => {
    vi.stubGlobal('fetch', reply({ reply: 'Halo lagi!', choices: [], status: 'ok' }));
    openChat();
    fireEvent.click(screen.getByRole('button', { name: 'Apa maksud soal ini?' }));
    await screen.findByText('Halo lagi!');
    const { unmount } = render(<TanyaGari activityId={10} step={step} />);
    unmount();
    expect(sessionStorage.getItem('gari-chat:10:hitung')).toMatch(/Halo lagi!/);
  });
});

describe('helper Tanya Gari', () => {
  it('starterChoices', () => {
    expect(starterChoices({ feedbackCode: 'ARITH', hasAnswer: true })[0]).toBe('Kenapa jawabanku belum tepat?');
    expect(starterChoices({ hasAnswer: true })).toContain('Cek caraku dong');
  });
  it('speakable membuang LaTeX', () => {
    expect(speakable('Ingat $m = \\frac{2}{3}$ ya **ok**')).toBe('Ingat m = 2 per 3 ya ok');
  });
});
