import type { ComponentType } from 'react';

interface StepProps {
  faultActive?: boolean;
}

export type ScenarioRegistry = Record<string, Record<number, ComponentType<StepProps>>>;

export const scenarioRegistry: ScenarioRegistry = {};
