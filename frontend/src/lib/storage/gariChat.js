/** Penyimpanan obrolan Tanya Gari (sessionStorage: hilang saat browser/tab ditutup). */
export const SUPERVISED_KEY = 'gari-ai-supervised';
export const CHAT_PREFIX = 'gari-chat:';

export const chatKey = (activityId, stepKey) =>
  stepKey ? `${CHAT_PREFIX}${activityId}:${stepKey}` : `${CHAT_PREFIX}umum`;

/** Dipanggil saat keluar: percakapan & konfirmasi pendamping tidak boleh terbawa ke pengguna lain. */
export function clearGariChats() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(CHAT_PREFIX) || k === SUPERVISED_KEY)
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* abaikan */
  }
}
