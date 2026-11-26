import RichText from '@/components/ui/RichText';
import SlopeExplorer from '@/features/graph/SlopeExplorer';
import { PlotPoints, ReadPoints } from '@/features/graph/PointPlotter';
import { ChoiceInput } from './BasicSteps';
import styles from '../player.module.css';

export function ExploreStep({ step, value, onChange, disabled }) {
  return (
    <div className={styles.split}>
      <div className={styles.splitText}>
        <RichText text={step.prompt} className={styles.prose} />
        {step.question && (
          <ChoiceInput
            name={step.key}
            question={step.question}
            value={value?.selected}
            onChange={(selected) => onChange({ ...value, selected })}
            disabled={disabled}
          />
        )}
      </div>
      <div className={styles.splitVisual}>
        <SlopeExplorer step={step} onChange={(state) => onChange({ ...value, state })} />
      </div>
    </div>
  );
}

export function PlotPointsStep({ step, value, onChange, solved }) {
  return (
    <div className={styles.split}>
      <div className={styles.splitText}>
        <RichText text={step.prompt} className={styles.prose} />
        <p className={styles.help}>Ketuk grid untuk menempatkan titik. Ketuk titik yang sama untuk menghapus.</p>
      </div>
      <div className={styles.splitVisual}>
        <PlotPoints step={step} points={value?.points} solved={solved} onChange={(points) => onChange({ points })} />
      </div>
    </div>
  );
}

export function ReadPointStep({ step, value, onChange, solved }) {
  const help = {
    1: 'Ketuk dua titik kuning pada garis — koordinatnya terisi otomatis.',
    2: 'Titik kuning menunjukkan tempat yang tepat. Tulis koordinatnya sendiri.',
    3: 'Cari sendiri titik yang tepat berada di persilangan grid.',
  }[step.level];
  return (
    <div className={styles.split}>
      <div className={styles.splitText}>
        <RichText text={step.prompt} className={styles.prose} />
        <p className={styles.help}>{help}</p>
      </div>
      <div className={styles.splitVisual}>
        <ReadPoints step={step} points={value?.points} solved={solved} onChange={(points) => onChange({ points })} />
      </div>
    </div>
  );
}
