import { Link } from 'react-router-dom';
import { DuckMascot } from '@/components/ui';
import { MathText } from '@/components/ui/RichText';
import { useSession } from '@/features/auth/SessionContext';
import styles from './landing.module.css';

function Squiggle({ className, d, color }) {
  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Sparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
    </svg>
  );
}

function MiniGraph() {
  const pts = [
    [20, 92],
    [48, 74],
    [76, 56],
    [104, 38],
  ];
  return (
    <svg viewBox="0 0 130 110" className={styles.miniSvg} aria-hidden="true">
      {[20, 48, 76, 104].map((x) => (
        <line key={x} x1={x} x2={x} y1="10" y2="100" className={styles.miniGrid} />
      ))}
      {[20, 38, 56, 74, 92].map((y) => (
        <line key={y} y1={y} y2={y} x1="10" x2="120" className={styles.miniGrid} />
      ))}
      <line x1="10" y1="98" x2="120" y2="30" className={styles.miniLine} />
      {pts.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="5" className={styles.miniPoint} />
      ))}
    </svg>
  );
}

const CARDS = [
  {
    key: 'grafik',
    title: 'Grafik',
    text: 'Dari tabel jadi titik, dari titik jadi garis lurus.',
    hat: 'grad',
    visual: (
      <div className={styles.visRow}>
        <table className={styles.miniTable}>
          <thead>
            <tr>
              <th>x</th>
              <th>y</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>20</td>
            </tr>
            <tr>
              <td>1</td>
              <td>25</td>
            </tr>
            <tr>
              <td>2</td>
              <td>30</td>
            </tr>
          </tbody>
        </table>
        <span className={styles.arrow}>⟶</span>
        <MiniGraph />
      </div>
    ),
  },
  {
    key: 'gradien',
    title: 'Gradien',
    text: 'Geser nilai m, lihat kemiringan garis berubah langsung.',
    hat: 'redcap',
    visual: (
      <div className={styles.visCol}>
        <div className={styles.eqChip}>
          <MathText tex="y = 2x + 1" />
        </div>
        <div className={styles.fakeSlider}>
          <span>m</span>
          <div className={styles.track}>
            <div className={styles.thumb} />
          </div>
          <b>2</b>
        </div>
        <div className={styles.fakeSlider}>
          <span>c</span>
          <div className={styles.track}>
            <div className={styles.thumb} style={{ left: '45%' }} />
          </div>
          <b>1</b>
        </div>
      </div>
    ),
  },
  {
    key: 'cerita',
    title: 'Soal Cerita',
    text: 'Tandai info penting, susun model, lalu tafsirkan hasilnya.',
    hat: 'cap',
    visual: (
      <div className={styles.visCol}>
        <p className={styles.storyText}>
          Ojek: <mark>biaya awal Rp5.000</mark>, lalu <mark>Rp2.500 per km</mark>. Jaraknya <mark>8 km</mark>.
        </p>
        <div className={`${styles.answerChip} ${styles.answerOk}`}>
          <MathText tex="y = 2500x + 5000" /> <span className={styles.okDot}>✓</span>
        </div>
      </div>
    ),
  },
  {
    key: 'dua-garis',
    title: 'Dua Garis',
    text: 'Sejajar atau tegak lurus? Cek hubungan gradiennya secara visual.',
    hat: 'beanie',
    visual: (
      <div className={styles.visRow}>
        <svg viewBox="0 0 110 100" className={styles.miniSvg} aria-hidden="true">
          <line x1="15" y1="90" x2="95" y2="10" className={styles.miniLine} />
          <line x1="15" y1="10" x2="95" y2="90" className={styles.miniLine2} />
          <polyline points="55,40 62,47 55,54 48,47" className={styles.miniRight} />
        </svg>
        <div className={styles.visCol}>
          <div className={styles.answerChip}>
            <MathText tex="m_1 \times m_2 = -1" />
          </div>
          <div className={`${styles.answerChip} ${styles.answerOk}`}>Tegak lurus ⟂</div>
        </div>
      </div>
    ),
  },
];

const STEPS = [
  { n: 1, title: 'Rumuskan', text: 'Tandai info penting, tulis yang diketahui & ditanya, lalu susun model matematika.' },
  { n: 2, title: 'Selesaikan', text: 'Hitung langkah demi langkah dengan tempomu sendiri. Gari siap memberi petunjuk bertahap.' },
  { n: 3, title: 'Tafsirkan', text: 'Jelaskan arti hasilmu dalam cerita dan cek: apakah jawabannya masuk akal?' },
];

export default function LandingPage() {
  const { user } = useSession();
  const target = user ? (user.role === 'researcher' ? '/peneliti' : '/modul/pgl') : '/masuk';

  return (
    <div className={styles.landing}>
      <Squiggle className={`${styles.deco} ${styles.d1}`} color="var(--color-mint)" d="M5 40 C25 5 45 55 65 25 S100 10 115 35" />
      <Squiggle className={`${styles.deco} ${styles.d2}`} color="var(--color-lime)" d="M5 50 C30 50 40 10 70 20 S95 50 115 15" />
      <Squiggle className={`${styles.deco} ${styles.d3}`} color="var(--color-sky)" d="M10 30 Q35 5 55 30 T100 30" />
      <Sparkle className={`${styles.spark} ${styles.s1}`} />
      <Sparkle className={`${styles.spark} ${styles.s2}`} />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Belajar bareng Gari di JelajahGaris</p>
          <h1 className={styles.title}>
            Kamu mau jelajahi <span className={styles.underline}>apa?</span>
          </h1>
          <p className={styles.subtitle}>Pilih satu, nanti Gari temani kamu belajar garis lurus — selangkah demi selangkah.</p>
        </div>
        <div className={styles.heroArt}>
          <span className={`${styles.float} ${styles.fHello}`}>Hai! Aku Gari.</span>
          <span className={`${styles.float} ${styles.fChip}`}>
            📐 <MathText tex="m = 2" />
          </span>
          <span className={`${styles.float} ${styles.fOk}`}>
            <span className={styles.okDot}>✓</span> Betul!
          </span>
          <Sparkle className={styles.heroSpark} />
          <DuckMascot size={330} hat="cap" mood="cheer" className={styles.heroDuck} title="Gari, bebek kuning maskot JelajahGaris" />
        </div>
      </section>

      <section id="materi" className={styles.cards} aria-label="Pilih topik">
        {CARDS.map((c) => (
          <Link key={c.key} to={target} className={styles.card}>
            <div className={styles.cardVisual}>{c.visual}</div>
            <div className={styles.cardHead}>
              <DuckMascot size={92} hat={c.hat} className={styles.cardDuck} />
              <h2>{c.title}</h2>
            </div>
            <p className={styles.cardText}>{c.text}</p>
            <span className={styles.cardArrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>

      {!user && (
        <p className={styles.already}>
          Sudah punya kode siswa? <Link to="/masuk">Masuk</Link>
        </p>
      )}

      <section id="cara-belajar" className={styles.how}>
        <h2>Cara belajar di JelajahGaris</h2>
        <ol className={styles.howList}>
          {STEPS.map((s) => (
            <li key={s.n} className={styles.howItem}>
              <span className={styles.howNum}>{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className={styles.footer}>
        Prototipe penelitian Pendidikan Matematika · Tanpa iklan · Data siswa memakai kode samaran.
      </footer>
    </div>
  );
}
