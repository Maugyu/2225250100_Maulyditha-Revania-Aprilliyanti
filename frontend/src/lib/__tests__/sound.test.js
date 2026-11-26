import { afterEach, describe, expect, it, vi } from 'vitest';
import { installTapSound, isSoundOn, playSound, setSoundOn } from '@/lib/sound';

function fakeAudio() {
  const started = [];
  const node = () => ({
    connect: (n) => n,
    gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    start: () => started.push(1),
    stop() {},
  });
  class AC {
    currentTime = 0;
    state = 'running';
    destination = {};
    createOscillator = node;
    createGain = node;
  }
  vi.stubGlobal('AudioContext', AC);
  return started;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setSoundOn(true);
});

describe('suara (F-26)', () => {
  it('menyala secara bawaan dan bisa dimatikan', () => {
    expect(isSoundOn()).toBe(true);
    setSoundOn(false);
    expect(isSoundOn()).toBe(false);
  });

  it('memainkan nada benar/salah, dan diam saat dimatikan', () => {
    const started = fakeAudio();
    playSound('correct');
    expect(started.length).toBe(2);
    setSoundOn(false);
    playSound('wrong');
    expect(started.length).toBe(2);
  });

  it('tanpa Web Audio tidak melempar galat', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => playSound('tap')).not.toThrow();
  });

  it('suara ketuk global melewati tombol data-sound="none" dan tombol nonaktif', () => {
    const started = fakeAudio();
    document.body.innerHTML =
      '<button id="a">A</button><button id="b" data-sound="none">B</button><button id="c" disabled>C</button>';
    const off = installTapSound(document);
    document.getElementById('a').click();
    document.getElementById('b').click();
    document.getElementById('c').click();
    off();
    document.getElementById('a').click();
    expect(started.length).toBe(1);
  });
});
