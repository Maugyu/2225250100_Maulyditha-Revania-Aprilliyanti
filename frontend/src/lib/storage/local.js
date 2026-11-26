/** Pembungkus localStorage yang aman (mode privat dapat menolak akses). */
export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* abaikan */
    }
  },
  keys(prefix) {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
};

/* ---------- Draf jawaban per langkah (PWA_SPECIFICATION §5.1) ---------- */
const draftKey = (user, activityId) => `draft:${user}:${activityId}`;

export const drafts = {
  load(user, activityId) {
    try {
      return JSON.parse(storage.get(draftKey(user, activityId)) || 'null');
    } catch {
      return null;
    }
  },
  save(user, activityId, data) {
    storage.set(draftKey(user, activityId), JSON.stringify(data));
  },
  clear(user, activityId) {
    storage.remove(draftKey(user, activityId));
  },
  clearAll() {
    storage.keys('draft:').forEach((k) => storage.remove(k));
  },
};
