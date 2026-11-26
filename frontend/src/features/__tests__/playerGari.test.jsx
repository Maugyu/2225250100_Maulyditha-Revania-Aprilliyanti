import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '@/features/auth/SessionContext';
import ActivityPlayer from '@/features/player/ActivityPlayer';
import * as sound from '@/lib/sound';
import u3 from '../../../../backend/content/pgl/units/u3.json';

const act = u3.activities.find((a) => a.slug === 'u3-konteks');

function renderAt(key, aiAvailable) {
  const idx = act.content.steps.findIndex((s) => s.key === key);
  localStorage.setItem('draft:UJI:10', JSON.stringify({ attemptClientId: 'x1', index: idx, answers: {}, meta: {} }));
  render(
    <MemoryRouter>
      <SessionProvider>
        <ActivityPlayer
          activity={{ id: 10, title: act.title, content: act.content, content_version: 'x', module_slug: 'pgl', unit: { slug: u3.slug, title: u3.title }, next_activity_id: null, current_attempt: { client_id: 'x1', last_step_key: key } }}
          username="UJI"
          aiAvailable={aiAvailable}
        />
      </SessionProvider>
    </MemoryRouter>,
  );
  return act.content.steps[idx];
}

afterEach(() => vi.restoreAllMocks());

describe('Pemutar: suara & tombol Tanya Gari', () => {
  it('suara salah lalu benar saat cek jawaban; tawaran Tanya Gari muncul saat salah', () => {
    const spy = vi.spyOn(sound, 'playSound').mockImplementation(() => {});
    const step = renderAt('rencana', true);
    const textOf = (id) => step.items.find((i) => i.id === id).text;
    for (const id of ['p2', 'p1', 'p3', 'p4']) fireEvent.click(screen.getByText(textOf(id)));
    fireEvent.click(screen.getByRole('button', { name: 'Cek jawaban' }));
    expect(spy).toHaveBeenCalledWith('wrong');
    expect(screen.getByRole('button', { name: /kenapa belum tepat/ })).toBeInTheDocument();
    for (const id of ['p2', 'p1', 'p3', 'p4']) fireEvent.click(screen.getByText(textOf(id)));
    for (const id of step.answer) fireEvent.click(screen.getByText(textOf(id)));
    fireEvent.click(screen.getByRole('button', { name: 'Cek jawaban' }));
    expect(spy).toHaveBeenCalledWith('correct');
  });

  it('tombol khusus Tanya Gari membuka obrolan langsung', () => {
    renderAt('rencana', true);
    fireEvent.click(screen.getByRole('button', { name: 'Tanya Gari' }));
    expect(screen.getByRole('complementary', { name: 'Ngobrol dengan Gari' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Orang tuaku sedang mendampingi/ })).toBeInTheDocument();
  });

  it('tanpa izin AI, tombol Tanya Gari tidak tampil', () => {
    renderAt('rencana', false);
    expect(screen.queryByRole('button', { name: 'Tanya Gari' })).not.toBeInTheDocument();
  });
});
