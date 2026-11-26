import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SlopeExplorer from '@/features/graph/SlopeExplorer';
import HintPanel from '@/features/player/HintPanel';
import ActivityPlayer from '@/features/player/ActivityPlayer';
import { SessionProvider } from '@/features/auth/SessionContext';

describe('SlopeExplorer', () => {
  it('slider m memperbarui persamaan (US-05)', () => {
    const { container } = render(<SlopeExplorer step={{ mode: 'single', initial: { m: '1', c: '0' } }} />);
    const slider = screen.getByLabelText(/^m/);
    expect(container.textContent).toContain('y=x');
    fireEvent.change(slider, { target: { value: '14' } }); // indeks 14 → m = 2
    expect(container.textContent).toContain('y=2x');
  });

  it('mode dua garis menandai tegak lurus (US-06)', () => {
    render(<SlopeExplorer step={{ mode: 'two', initial: { m: '2', c: '0', m2: '-1/2', c2: '1' } }} />);
    expect(screen.getByText(/Tegak lurus/)).toBeInTheDocument();
  });
});

describe('HintPanel', () => {
  it('hanya menampilkan level yang sudah dibuka (US-14)', () => {
    render(<HintPanel hints={['satu', 'dua', 'tiga']} level={1} onMore={() => {}} onClose={() => {}} />);
    expect(screen.getByText('satu')).toBeInTheDocument();
    expect(screen.queryByText('dua')).not.toBeInTheDocument();
  });
});

describe('ActivityPlayer', () => {
  const activity = {
    id: 99,
    title: 'Uji',
    content_version: 'x',
    module_slug: 'pgl',
    unit: { slug: 'u2', title: 'Unit' },
    next_activity_id: null,
    current_attempt: null,
    content: {
      steps: [
        { key: 'a', type: 'numeric', title: 'Hitung', prompt: 'Berapa?', answer: '2', hints: ['h1', 'h2', 'h3'], solution: 'Dua.' },
        { key: 'b', type: 'info', body: 'Langkah penutup' },
      ],
    },
  };
  const setup = () =>
    render(
      <MemoryRouter>
        <SessionProvider>
          <ActivityPlayer activity={activity} username="UJI" />
        </SessionProvider>
      </MemoryRouter>,
    );

  it('salah tanda → pesan spesifik; 3× salah → pembahasan (US-15)', () => {
    setup();
    const input = screen.getByLabelText(/Berapa/);
    const check = screen.getByRole('button', { name: 'Cek jawaban' });
    fireEvent.change(input, { target: { value: '-2' } });
    fireEvent.click(check);
    expect(screen.getByRole('status').textContent).toMatch(/tanda/);
    fireEvent.click(check);
    expect(screen.getByRole('status').textContent).toMatch(/petunjuk/i);
    expect(screen.queryByText('Lihat pembahasan')).not.toBeInTheDocument();
    fireEvent.click(check);
    fireEvent.click(screen.getByText('Lihat pembahasan'));
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeEnabled();
  });

  it('jawaban benar membuka tombol Lanjut, hanya satu aksi utama', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Berapa/), { target: { value: '4/2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cek jawaban' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.getByText('Langkah penutup')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Selesai' })).toBeInTheDocument();
  });
});

describe('Gari bergerak (ADR-022)', () => {
  it('animated menambah kelas animasi; tanpa prop tetap diam', async () => {
    const { default: Duck } = await import('@/components/ui/DuckMascot');
    const { container, rerender } = render(<Duck skin="taman" animated />);
    expect(container.querySelector('svg').getAttribute('class')).toMatch(/alive/);
    rerender(<Duck skin="taman" />);
    expect(container.querySelector('svg').getAttribute('class') || '').not.toMatch(/alive/);
  });
});
