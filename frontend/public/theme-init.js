// Terapkan tema tersimpan sebelum render agar tidak berkedip (file terpisah agar lolos CSP script-src 'self').
try {
  var t = localStorage.getItem('theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
