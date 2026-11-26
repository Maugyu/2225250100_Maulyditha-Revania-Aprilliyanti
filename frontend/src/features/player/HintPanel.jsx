import { DuckMascot, Button } from '@/components/ui';
import RichText from '@/components/ui/RichText';
import { useSession } from '@/features/auth/SessionContext';
import { useSkin } from '@/lib/storage/skin';
import TanyaGari from './TanyaGari';
import styles from './player.module.css';

const LEVEL_NAME = ['Arahan', 'Strategi', 'Langkah contoh'];

/**
 * Panel Gari. mode="hint": petunjuk bertingkat (F-09), dibuka berurutan, tidak pernah berisi jawaban akhir (PP-04).
 * mode="gari": langsung ngobrol dengan Tanya Gari (F-24) lewat tombol khusus.
 */
export default function HintPanel({ mode = 'hint', hints, level, onMore, onClose, onSwitch, ai }) {
  const { user } = useSession() || {};
  const skin = useSkin(user?.username);
  const chatOnly = mode === 'gari';
  return (
    <aside className={styles.hintPanel} aria-label={chatOnly ? 'Ngobrol dengan Gari' : 'Petunjuk dari Gari'}>
      <div className={styles.hintHead}>
        <DuckMascot size={56} skin={skin} mood={chatOnly ? 'happy' : 'think'} />
        <div>
          <strong>{chatOnly ? 'Ngobrol dengan Gari' : 'Gari bantu sedikit, ya!'}</strong>
          <div className={styles.help}>
            {chatOnly ? 'Gari bertanya balik supaya kamu menemukan jawabannya sendiri' : `Petunjuk ${level} dari ${hints.length}`}
          </div>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Tutup panel Gari">
          ×
        </button>
      </div>
      {!chatOnly && (
        <>
          <ol className={styles.hintList}>
            {hints.slice(0, level).map((h, i) => (
              <li key={i}>
                <span className={styles.hintLevel}>{LEVEL_NAME[i] || `Petunjuk ${i + 1}`}</span>
                <RichText text={h} as="span" />
              </li>
            ))}
          </ol>
          {level < hints.length && (
            <Button variant="secondary" size="sm" onClick={onMore}>
              Petunjuk berikutnya
            </Button>
          )}
          {ai?.available && (
            <Button variant="ghost" size="sm" onClick={() => onSwitch?.('gari')}>
              💬 Masih bingung? Ngobrol dengan Gari
            </Button>
          )}
        </>
      )}
      {chatOnly && ai?.available && (
        <TanyaGari
          key={ai.step.key}
          activityId={ai.activityId}
          step={ai.step}
          process={ai.step.process}
          currentAnswer={ai.currentAnswer}
          feedbackCode={ai.feedbackCode}
        />
      )}
    </aside>
  );
}
