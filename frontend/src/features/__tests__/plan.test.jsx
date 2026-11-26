import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '@/features/auth/SessionContext';
import ActivityPlayer from '@/features/player/ActivityPlayer';
import u3 from '../../../../backend/content/pgl/units/u3.json';

const act = u3.activities.find((a) => a.slug === 'u3-konteks');

describe('Langkah Rencanakan (konten asli U3)', () => {
  it('menyusun rencana, salah lalu benar', () => {
    const idx = act.content.steps.findIndex((s) => s.key === 'rencana');
    localStorage.setItem('draft:UJI:10', JSON.stringify({ attemptClientId: 'x1', index: idx, answers: {}, meta: {} }));
    render(
      <MemoryRouter>
        <SessionProvider>
          <ActivityPlayer
            activity={{ id: 10, title: act.title, content: act.content, content_version: 'x', module_slug: 'pgl', unit: { slug: u3.slug, title: u3.title }, next_activity_id: null, current_attempt: { client_id: 'x1', last_step_key: 'rencana' } }}
            username="UJI"
          />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Rencanaku')).toBeInTheDocument();
    const step = act.content.steps[idx];
    const textOf = (id) => step.items.find((i) => i.id === id).text;
    // urutan salah: p2 dulu
    for (const id of ['p2', 'p1', 'p3', 'p4']) fireEvent.click(screen.getByText(textOf(id)));
    fireEvent.click(screen.getByRole('button', { name: 'Cek jawaban' }));
    expect(screen.getByRole('status').textContent).toMatch(/Langkah ke-1/);
    // kembalikan semua lalu susun benar
    for (const id of ['p2', 'p1', 'p3', 'p4']) fireEvent.click(screen.getByText(textOf(id)));
    for (const id of step.answer) fireEvent.click(screen.getByText(textOf(id)));
    fireEvent.click(screen.getByRole('button', { name: 'Cek jawaban' }));
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeEnabled();
  });
});
