/**
 * Parser markup konten (tanpa HTML mentah):
 *   $...$          → matematika (KaTeX)
 *   [[key|label]]  → istilah glosarium
 *   **teks**       → tebal
 *   `teks`         → kode/contoh ketikan
 *   {{id|teks}}    → frasa yang dapat ditandai (identify_info); di luar langkah itu tampil polos
 */
const TOKEN = /(\$[^$]+\$|\[\[[a-z0-9_]+(?:\|[^\]]+)?\]\]|\*\*[^*]+\*\*|`[^`]+`|\{\{[a-z0-9]+\|[^}]+\}\})/g;

export function tokenize(text) {
  const out = [];
  let last = 0;
  String(text || '').replace(TOKEN, (m, _g, idx) => {
    if (idx > last) out.push({ type: 'text', value: text.slice(last, idx) });
    if (m.startsWith('$')) out.push({ type: 'math', value: m.slice(1, -1) });
    else if (m.startsWith('[[')) {
      const [key, label] = m.slice(2, -2).split('|');
      out.push({ type: 'term', key, label: label || null });
    } else if (m.startsWith('**')) out.push({ type: 'bold', value: m.slice(2, -2) });
    else if (m.startsWith('`')) out.push({ type: 'code', value: m.slice(1, -1) });
    else {
      const [id, value] = m.slice(2, -2).split('|');
      out.push({ type: 'span', id, value });
    }
    last = idx + m.length;
    return m;
  });
  if (last < String(text || '').length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}

export function plainSituation(text) {
  return String(text || '').replace(/\{\{[a-z0-9]+\|([^}]+)\}\}/g, '$1');
}

// \hl{...} = sorotan bagian yang berubah (signaling, PP-06). Warna teks dipaksa gelap agar terbaca di tema gelap.
export const KATEX_MACROS = { '\\hl': '\\colorbox{#FFE58F}{$\\color{#17191d}{#1}$}' };
