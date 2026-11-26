import RichText, { MathText } from '@/components/ui/RichText';
import styles from '../player.module.css';

export function InfoStep({ step }) {
  return <RichText text={step.body} className={styles.prose} />;
}

export function ChoiceInput({ question, value, onChange, disabled, name }) {
  return (
    <fieldset className={styles.choices} disabled={disabled}>
      <legend className={styles.prompt}>
        <RichText text={question.prompt} as="span" />
      </legend>
      {question.options.map((o) => (
        <label key={o.id} className={`${styles.choice} ${value === o.id ? styles.choiceOn : ''}`}>
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          <RichText text={o.text} as="span" />
        </label>
      ))}
    </fieldset>
  );
}

export function ChoiceStep({ step, value, onChange, disabled }) {
  return (
    <ChoiceInput
      name={step.key}
      question={step}
      value={value?.selected}
      onChange={(selected) => onChange({ selected })}
      disabled={disabled}
    />
  );
}

export function NumericStep({ step, value, onChange, disabled }) {
  const id = `num-${step.key}`;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </label>
      <div className={styles.inline}>
        <input
          id={id}
          className={styles.numInput}
          inputMode="text"
          autoComplete="off"
          placeholder="Jawabanmu"
          value={value?.value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ value: e.target.value })}
        />
        {step.unit && <span className={styles.unit}>{step.unit}</span>}
      </div>
      <p className={styles.help}>Boleh ditulis seperti 3, -2, 0,5, 1/2, atau 25.000.</p>
    </div>
  );
}

export function LinearModelStep({ step, value, onChange, disabled }) {
  const v = value || {};
  return (
    <div className={styles.field}>
      <div className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </div>
      {(step.x_label || step.y_label) && (
        <p className={styles.help}>
          <MathText tex="x" /> = {step.x_label || '…'}, <MathText tex="y" /> = {step.y_label || '…'}
        </p>
      )}
      <div className={styles.model}>
        <MathText tex="y =" />
        <input
          aria-label="Nilai m (gradien)"
          className={styles.numInput}
          placeholder="m"
          value={v.m ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...v, m: e.target.value })}
        />
        <MathText tex="x \;+" />
        <input
          aria-label="Nilai c (konstanta)"
          className={styles.numInput}
          placeholder="c"
          value={v.c ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...v, c: e.target.value })}
        />
      </div>
      <p className={styles.help}>Jika c negatif, tulis tanda minus di kotak c (misalnya -4).</p>
    </div>
  );
}

export function DefineVariablesStep({ step, value, onChange, disabled }) {
  const v = value || {};
  return (
    <div className={styles.field}>
      <div className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </div>
      {['x', 'y'].map((k) => (
        <div key={k} className={styles.varRow}>
          <label htmlFor={`var-${step.key}-${k}`}>
            <MathText tex={k} /> menyatakan
          </label>
          <select
            id={`var-${step.key}-${k}`}
            value={v[k] || ''}
            disabled={disabled}
            onChange={(e) => onChange({ ...v, [k]: e.target.value })}
          >
            <option value="">— pilih —</option>
            {step.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export const OPEN_LIMIT = 500;

export function OpenStep({ step, value, onChange, disabled }) {
  const id = `open-${step.key}`;
  const max = step.max_length || OPEN_LIMIT;
  const text = value?.text ?? '';
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </label>
      <textarea
        id={id}
        maxLength={max}
        value={text}
        disabled={disabled}
        placeholder="Tulis dengan kalimatmu sendiri…"
        onChange={(e) => onChange({ ...value, text: e.target.value })}
      />
      <p className={styles.help}>
        {text.length}/{max} karakter
      </p>
    </div>
  );
}
