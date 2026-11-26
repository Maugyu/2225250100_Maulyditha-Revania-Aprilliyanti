/** Ikon garis sederhana (24×24, stroke = currentColor). */
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const IconHome = () => (
  <svg {...base}>
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </svg>
);
export const IconLearn = () => (
  <svg {...base}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M8 8l8 8" />
    <circle cx="6" cy="18" r="1.5" />
  </svg>
);
export const IconAssess = () => (
  <svg {...base}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6" />
  </svg>
);
export const IconDuck = () => (
  <svg {...base}>
    <circle cx="11" cy="9" r="5" />
    <path d="M16 9h4l-3 2" />
    <path d="M6 13c-2 5 1 8 6 8s8-2 8-6" />
    <circle cx="10" cy="8" r="0.6" fill="currentColor" />
  </svg>
);
export const IconDownload = () => (
  <svg {...base}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);
export const IconLogout = () => (
  <svg {...base}>
    <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
  </svg>
);
export const IconChevron = () => (
  <svg {...base} width={18} height={18}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const IconChat = () => (
  <svg {...base}>
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);
