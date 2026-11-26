import { useId } from "react";
import anim from "./duck.module.css";

/**
 * Gari — maskot bebek kuning JelajahGaris. Gambar SVG orisinal.
 * Skin = kombinasi topi + aksesori mata + aksesori leher. Skin bebas dipilih siswa (personalisasi,
 * BUKAN hadiah/poin — PP-10).
 */
export const SKINS = [
  { id: "klasik", name: "Klasik", hat: "cap", eyes: "glasses" },
  { id: "polos", name: "Polos", hat: "tuft", eyes: "none" },
  { id: "wisuda", name: "Wisuda", hat: "grad", eyes: "glasses" },
  {
    id: "sporty",
    name: "Sporty",
    hat: "redcap",
    eyes: "none",
    neck: "whistle",
  },
  {
    id: "musim-dingin",
    name: "Musim Dingin",
    hat: "beanie",
    eyes: "none",
    neck: "scarf",
  },
  {
    id: "raja",
    name: "Raja Garis",
    hat: "crown",
    eyes: "none",
    neck: "bowtie",
  },
  { id: "manis", name: "Pita Manis", hat: "bow", eyes: "none" },
  { id: "dj", name: "DJ", hat: "headphones", eyes: "shades" },
  { id: "taman", name: "Taman", hat: "flower", eyes: "none" },
  { id: "koki", name: "Koki", hat: "chef", eyes: "none", neck: "bowtie" },
  { id: "pesta", name: "Pesta", hat: "party", eyes: "none" },
  { id: "astronot", name: "Astronot", hat: "astronaut", eyes: "none" },
];
export const DEFAULT_SKIN = "klasik";

const LEGACY = {
  cap: "klasik",
  grad: "wisuda",
  redcap: "sporty",
  beanie: "musim-dingin",
  none: "polos",
};

function Hat({ type }) {
  switch (type) {
    case "tuft":
      return (
        <g
          fill="none"
          stroke="var(--duck-shade)"
          strokeWidth="6"
          strokeLinecap="round"
        >
          <path d="M94 34 C86 20 98 12 102 24" />
          <path d="M104 32 C108 16 122 18 114 32" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path
            d="M44 72 C42 30 72 18 102 18 C136 18 160 38 156 72 Z"
            fill="#C4E86B"
          />
          <path
            d="M44 72 C42 30 72 18 102 18 C80 26 64 46 60 72 Z"
            fill="#B2D957"
          />
          <path
            d="M58 68 C38 64 12 74 8 88 C30 88 52 82 72 74 Z"
            fill="#7FB83A"
          />
          <circle cx="102" cy="20" r="6" fill="#9FCB4A" />
          <path
            d="M122 34 q12 8 13 20"
            stroke="#fff"
            strokeOpacity="0.6"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "redcap":
      return (
        <g>
          <path
            d="M44 72 C42 30 72 18 102 18 C136 18 160 38 156 72 Z"
            fill="#FF6B6B"
          />
          <path
            d="M44 72 C42 30 72 18 102 18 C80 26 64 46 60 72 Z"
            fill="#F25555"
          />
          <path
            d="M142 68 C162 64 188 74 192 88 C170 88 148 82 128 74 Z"
            fill="#D93D3D"
          />
          <circle cx="102" cy="20" r="6" fill="#D93D3D" />
          <text
            x="100"
            y="56"
            textAnchor="middle"
            fontSize="20"
            fontWeight="900"
            fill="#fff"
          >
            m
          </text>
        </g>
      );
    case "grad":
      return (
        <g>
          <path
            d="M62 54 C62 42 138 42 138 54 L138 66 C120 60 80 60 62 66 Z"
            fill="#26323A"
          />
          <path d="M100 14 L172 38 L100 62 L28 38 Z" fill="#34434D" />
          <path
            d="M100 38 L152 46 L152 78"
            stroke="#FFD43B"
            strokeWidth="3.5"
            fill="none"
          />
          <circle cx="152" cy="82" r="6" fill="#FFD43B" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M46 70 C46 22 154 22 154 70 Z" fill="#74C0FC" />
          <path
            d="M66 34 v30 M84 28 v38 M102 26 v40 M120 28 v38 M138 34 v30"
            stroke="#4DABF7"
            strokeWidth="4"
          />
          <rect x="42" y="62" width="116" height="16" rx="8" fill="#339AF0" />
          <circle cx="100" cy="22" r="12" fill="#fff" />
        </g>
      );
    case "crown":
      return (
        <g>
          <path
            d="M56 58 L62 20 L82 42 L100 14 L118 42 L138 20 L144 58 Z"
            fill="#FFC107"
            stroke="#E8A800"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="54" y="52" width="92" height="12" rx="5" fill="#E8A800" />
          <circle cx="100" cy="40" r="6" fill="#FF6B9D" />
          <circle cx="72" cy="46" r="4" fill="#4DABF7" />
          <circle cx="128" cy="46" r="4" fill="#51CF66" />
        </g>
      );
    case "bow":
      return (
        <g transform="translate(132 40) rotate(18)">
          <path d="M0 0 C-26 -22 -34 10 -6 6 Z" fill="#FF8CC6" />
          <path d="M0 0 C26 -22 34 10 6 6 Z" fill="#FF8CC6" />
          <circle cx="0" cy="2" r="7" fill="#F06595" />
          <circle cx="-16" cy="-6" r="2.5" fill="#fff" opacity="0.8" />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path
            d="M42 92 C38 30 162 30 158 92"
            fill="none"
            stroke="#5C5F66"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <rect x="28" y="78" width="24" height="38" rx="11" fill="#845EF7" />
          <rect x="148" y="78" width="24" height="38" rx="11" fill="#845EF7" />
          <rect x="33" y="84" width="8" height="26" rx="4" fill="#B197FC" />
          <rect x="159" y="84" width="8" height="26" rx="4" fill="#B197FC" />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(64 38)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-11"
              rx="7"
              ry="11"
              fill="#fff"
              stroke="#FFD8E8"
              strokeWidth="1.5"
              transform={`rotate(${a})`}
            />
          ))}
          <circle r="7" fill="#FFA94D" />
          <path
            d="M8 10 q10 12 22 8"
            stroke="#69DB7C"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "chef":
      return (
        <g>
          <rect
            x="66"
            y="40"
            width="68"
            height="22"
            rx="6"
            fill="#F1F3F5"
            stroke="#DEE2E6"
            strokeWidth="2"
          />
          <circle cx="76" cy="30" r="16" fill="#fff" />
          <circle cx="100" cy="20" r="20" fill="#fff" />
          <circle cx="124" cy="30" r="16" fill="#fff" />
          <rect x="66" y="30" width="68" height="16" fill="#fff" />
        </g>
      );
    case "party":
      return (
        <g transform="rotate(-10 100 40)">
          <path d="M78 56 L100 2 L122 56 Z" fill="#4DABF7" />
          <path
            d="M84 42 L116 42 M90 28 L110 28 M95 15 L105 15"
            stroke="#FFD43B"
            strokeWidth="5"
          />
          <circle cx="100" cy="2" r="7" fill="#FF6B9D" />
        </g>
      );
    default:
      return null;
  }
}

function Eyes({ type, look }) {
  return (
    <g>
      {[78, 122].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="90" rx="15" ry="18" fill="#fff" />
          <ellipse
            cx={cx + look.x}
            cy={92 + look.y}
            rx="10.5"
            ry="12"
            fill="var(--duck-ink)"
          />
          <circle
            cx={cx + look.x + 4}
            cy={92 + look.y - 5}
            r="4.5"
            fill="#fff"
          />
          <circle
            cx={cx + look.x - 3}
            cy={92 + look.y + 5}
            r="2"
            fill="#fff"
            opacity="0.9"
          />
        </g>
      ))}
      {type === "glasses" && (
        <g fill="none" stroke="#1AA39A" strokeWidth="5">
          <circle cx="78" cy="90" r="21" />
          <circle cx="122" cy="90" r="21" />
          <path d="M99 88 q1 -4 2 0" />
          <path d="M57 86 l-12 -5 M143 86 l12 -5" strokeLinecap="round" />
        </g>
      )}
      {type === "shades" && (
        <g>
          <path
            d="M54 80 h46 v10 c0 14 -10 20 -23 20 c-13 0 -23 -6 -23 -20 Z"
            fill="#212529"
          />
          <path
            d="M100 80 h46 v10 c0 14 -10 20 -23 20 c-13 0 -23 -6 -23 -20 Z"
            fill="#212529"
          />
          <path
            d="M60 86 l10 -4 M106 86 l10 -4"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      )}
    </g>
  );
}

function Neck({ type }) {
  if (type === "scarf")
    return (
      <g>
        <path
          d="M54 130 C80 146 120 146 146 130 L146 144 C120 158 80 158 54 144 Z"
          fill="#FF6B6B"
        />
        <path d="M120 146 l8 30 l14 -4 l-6 -28 Z" fill="#F25555" />
        <path
          d="M70 140 v8 M90 144 v8 M110 144 v8 M130 140 v8"
          stroke="#fff"
          strokeWidth="3"
          opacity="0.6"
        />
      </g>
    );
  if (type === "bowtie")
    return (
      <g transform="translate(100 140)">
        <path
          d="M0 0 L-18 -10 L-18 10 Z M0 0 L18 -10 L18 10 Z"
          fill="#845EF7"
        />
        <circle r="5" fill="#7048E8" />
      </g>
    );
  if (type === "whistle")
    return (
      <g>
        <path
          d="M64 132 C80 150 120 150 136 132"
          fill="none"
          stroke="#FF922B"
          strokeWidth="3"
        />
        <rect x="92" y="146" width="18" height="10" rx="5" fill="#ADB5BD" />
      </g>
    );
  return null;
}

/**
 * @param {{ size?: number, skin?: string, hat?: string, glasses?: boolean, mood?: 'happy'|'think'|'cheer',
 *           className?: string, title?: string, headOnly?: boolean, animated?: boolean, hop?: boolean }} props
 * `hat`/`glasses` dipertahankan untuk kompatibilitas: hat lama dipetakan ke skin.
 * `animated`: Gari bergerak pelan (mengayun, berkedip, mengepak) — ADR-022; `hop`: melompat sekali.
 */
export default function DuckMascot({
  size = 160,
  skin,
  hat,
  glasses,
  mood = "happy",
  className,
  title,
  headOnly = false,
  animated = false,
  hop = false,
}) {
  const uid = useId().replace(/:/g, "");
  const s =
    SKINS.find((k) => k.id === (skin || LEGACY[hat] || DEFAULT_SKIN)) ||
    SKINS[0];
  const eyes =
    glasses === false
      ? "none"
      : glasses === true && s.eyes === "none"
        ? "glasses"
        : s.eyes;
  const look = mood === "think" ? { x: 3, y: -5 } : { x: 2, y: 1 };
  const vb = headOnly ? "14 0 172 160" : "0 0 200 214";
  const h = headOnly ? size * (160 / 172) : size * (214 / 200);
  const astro = s.hat === "astronaut";

  return (
    <svg
      width={size}
      height={h}
      viewBox={vb}
      className={
        [className, animated && anim.alive, hop && anim.hop]
          .filter(Boolean)
          .join(" ") || undefined
      }
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <radialGradient id={`b${uid}`} cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#FFF08A" />
          <stop offset="60%" stopColor="var(--duck-body)" />
          <stop offset="100%" stopColor="var(--duck-shade)" />
        </radialGradient>
      </defs>

      <g className={anim.body}>
        {!headOnly && (
          <g>
            {/* badan bulat + perut krem */}
            <ellipse cx="100" cy="164" rx="60" ry="44" fill={`url(#b${uid})`} />
            <ellipse cx="100" cy="174" rx="36" ry="28" fill="#FFF4C2" />
            {/* sayap mungil */}
            <g className={anim.wingL}>
              <ellipse
                cx="44"
                cy="162"
                rx="15"
                ry="22"
                fill="var(--duck-shade)"
                transform="rotate(20 44 162)"
              />
            </g>
            <g className={anim.wingR}>
              <ellipse
                cx="156"
                cy="162"
                rx="15"
                ry="22"
                fill="var(--duck-shade)"
                transform={
                  mood === "cheer"
                    ? "rotate(-60 156 150)"
                    : "rotate(-20 156 162)"
                }
              />
            </g>
            {/* kaki */}
            <ellipse cx="80" cy="206" rx="15" ry="7" fill="var(--duck-beak)" />
            <ellipse cx="120" cy="206" rx="15" ry="7" fill="var(--duck-beak)" />
          </g>
        )}

        <g className={anim.head}>
          {astro && (
            <circle
              cx="100"
              cy="86"
              r="72"
              fill="#E7F5FF"
              opacity="0.55"
              stroke="#ADB5BD"
              strokeWidth="5"
            />
          )}

          {/* kepala tembam */}
          <ellipse cx="100" cy="86" rx="60" ry="57" fill={`url(#b${uid})`} />

          {/* pipi */}
          <ellipse
            cx="54"
            cy="112"
            rx="12"
            ry="7.5"
            fill="#FF8FA3"
            opacity="0.55"
          />
          <ellipse
            cx="146"
            cy="112"
            rx="12"
            ry="7.5"
            fill="#FF8FA3"
            opacity="0.55"
          />

          <g className={anim.eyes}>
            <Eyes type={eyes} look={look} />
          </g>
          {mood === "think" && (
            <path
              d="M110 62 q12 -7 24 0"
              stroke="var(--duck-ink)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* paruh mungil + senyum */}
          <path
            d="M86 110 C92 102 108 102 114 110 C108 118 92 118 86 110 Z"
            fill="#FFA94D"
          />
          {mood === "cheer" ? (
            <path d="M90 113 C94 128 106 128 110 113 Z" fill="#E8590C" />
          ) : (
            <path
              d="M92 114 q8 7 16 0"
              stroke="#E8590C"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          <ellipse cx="95" cy="107" rx="1.8" ry="1.3" fill="#C2410C" />
          <ellipse cx="105" cy="107" rx="1.8" ry="1.3" fill="#C2410C" />

          <Hat type={s.hat} />
          {astro && (
            <g>
              <path
                d="M44 48 a72 72 0 0 1 40 -30"
                stroke="#fff"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
              <rect x="88" y="6" width="24" height="10" rx="4" fill="#ADB5BD" />
              <circle cx="100" cy="2" r="5" fill="#FF6B6B" />
            </g>
          )}
        </g>
        {!headOnly && <Neck type={s.neck} />}
      </g>
    </svg>
  );
}
