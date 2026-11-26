/** Klien API terpusat: token, format galat seragam, deteksi offline. */
import { storage } from '@/lib/storage/local';

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  get isNetwork() {
    return this.status === 0;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export const session = {
  get token() {
    return storage.get(TOKEN_KEY);
  },
  get user() {
    try {
      return JSON.parse(storage.get(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(token, user) {
    storage.set(TOKEN_KEY, token);
    storage.set(USER_KEY, JSON.stringify(user));
  },
  clear() {
    storage.remove(TOKEN_KEY);
    storage.remove(USER_KEY);
  },
};

export async function request(path, { method = 'GET', body, raw = false } = {}) {
  const headers = { Accept: raw ? 'text/csv' : 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (session.token) headers.Authorization = `Bearer ${session.token}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Tidak dapat terhubung. Periksa koneksi internetmu.');
  }
  if (res.status === 401 && path !== '/auth/login') onUnauthorized();
  if (!res.ok) {
    let err = { code: 'HTTP_ERROR', message: 'Terjadi kendala. Coba lagi.' };
    try {
      err = (await res.json()).error || err;
    } catch {
      /* respons bukan JSON */
    }
    throw new ApiError(res.status, err.code, err.message, err.details);
  }
  if (raw) return res.blob();
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (username, pin) => request('/auth/login', { method: 'POST', body: { username, pin } }),
  me: () => request('/auth/me'),
  modules: () => request('/modules'),
  module: (slug) => request(`/modules/${slug}`),
  activity: (id) => request(`/activities/${id}`),
  progress: () => request('/me/progress'),
  resume: () => request('/me/resume'),
  createAttempt: (body) => request('/attempts', { method: 'POST', body }),
  patchAttempt: (clientId, body) => request(`/attempts/${clientId}`, { method: 'PATCH', body }),
  sendResponse: (clientId, body) => request(`/attempts/${clientId}/responses`, { method: 'POST', body }),
  sendReflection: (body) => request('/reflections', { method: 'POST', body }),
  myAssessments: () => request('/me/assessments'),
  startSubmission: (id) => request(`/assessments/${id}/submissions`, { method: 'POST' }),
  submission: (id) => request(`/submissions/${id}`),
  saveItem: (subId, itemId, response) =>
    request(`/submissions/${subId}/responses/${itemId}`, { method: 'PUT', body: { response } }),
  submit: (subId) => request(`/submissions/${subId}/submit`, { method: 'POST' }),
  researcher: {
    classes: () => request('/researcher/classes'),
    progress: (code) => request(`/researcher/classes/${code}/progress`),
    toggle: (code, id, isOpen) =>
      request(`/researcher/classes/${code}/assessments/${id}`, { method: 'PATCH', body: { is_open: isOpen } }),
    exportCsv: (dataset, code) =>
      request(`/researcher/export/${dataset}.csv?class_code=${encodeURIComponent(code)}`, { raw: true }),
    queue: () => request('/researcher/scoring/queue?blind=true'),
    score: (id, scores) => request(`/researcher/scoring/${id}`, { method: 'PUT', body: { scores } }),
    aiStatus: () => request('/researcher/ai/status'),
    diagnostics: (code) => request(`/researcher/classes/${code}/diagnostics`),
    toggleStudentAi: (code, on) => request(`/researcher/classes/${code}/ai`, { method: 'PATCH', body: { is_open: on } }),
    aiScore: (id) => request(`/researcher/ai/score-suggestion/${id}`, { method: 'POST' }),
    aiSummary: (code, unit) =>
      request(`/researcher/ai/reflection-summary?class_code=${encodeURIComponent(code)}&unit_slug=${encodeURIComponent(unit)}`, {
        method: 'POST',
      }),
  },
};

export function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
