import {
  ChoiceStep,
  DefineVariablesStep,
  InfoStep,
  LinearModelStep,
  NumericStep,
  OpenStep,
} from './steps/BasicSteps';
import { IdentifyInfoStep, KnownAskedStep } from './steps/ContextSteps';
import { ExploreStep, PlotPointsStep, ReadPointStep } from './steps/VisualSteps';
import WorkedExampleStep from './steps/WorkedExampleStep';
import ReflectionStep from './steps/ReflectionStep';
import PlanStep from './steps/PlanStep';

/** Peta jenis langkah → komponen renderer (satu renderer per step.type). */
export const STEP_COMPONENTS = {
  info: InfoStep,
  choice: ChoiceStep,
  numeric: NumericStep,
  check_back: NumericStep,
  linear_model: LinearModelStep,
  define_variables: DefineVariablesStep,
  identify_info: IdentifyInfoStep,
  known_asked: KnownAskedStep,
  explore: ExploreStep,
  plot_points: PlotPointsStep,
  read_point: ReadPointStep,
  worked_example: WorkedExampleStep,
  interpret: OpenStep,
  evaluate: OpenStep,
  explain: OpenStep,
  reflection: ReflectionStep,
  plan: PlanStep,
};

export const PROCESS_LABEL = {
  formulate: 'Rumuskan',
  planning: 'Rencanakan',
  employ: 'Selesaikan',
  interpret: 'Tafsirkan',
  evaluate: 'Evaluasi',
  reasoning: 'Bernalar',
};
