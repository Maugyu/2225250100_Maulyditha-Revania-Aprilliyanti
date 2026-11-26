/** Skin Gari pilihan siswa — kenyamanan per perangkat (localStorage), bukan data penelitian. */
import { useEffect, useState } from 'react';
import { DEFAULT_SKIN, SKINS } from '@/components/ui/DuckMascot';
import { storage } from './local';

const EVT = 'gari-skin-change';
const key = (u) => `skin:${u || 'tamu'}`;
const chosenKey = (u) => `skin-chosen:${u || 'tamu'}`;

export function getSkin(username) {
  const id = storage.get(key(username));
  return SKINS.some((s) => s.id === id) ? id : DEFAULT_SKIN;
}

export function setSkin(username, id) {
  storage.set(key(username), id);
  storage.set(chosenKey(username), '1');
  window.dispatchEvent(new CustomEvent(EVT));
}

export function hasChosenSkin(username) {
  return storage.get(chosenKey(username)) === '1';
}

export function useSkin(username) {
  const [skin, set] = useState(() => getSkin(username));
  useEffect(() => {
    const update = () => set(getSkin(username));
    update();
    window.addEventListener(EVT, update);
    return () => window.removeEventListener(EVT, update);
  }, [username]);
  return skin;
}
