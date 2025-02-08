import { Note } from 'calculation/entities/note';
import { all, any } from 'ramda';

import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { CalculationModeEnum } from '../../enums/calculationModeEnum';
import {
    CalculationBrief,
    isCalculationFinished,
    isCalculationInProgress,
    CalculationStepEnum,
    isCalculationStarted,
    isCalculationFinishedIncorrectly
} from './calculationBrief';
import { CalculationDetails } from './calculationDetails';

export interface ComputationStatus {
    key: string;

    percent: number;

    type: CalculationModeEnum;

    calculations: CalculationBrief[];

    details: CalculationDetails;

    notes: Note[];
}

export interface ComputationStatusBrief {
    key: string;

    percent: number;

    type: CalculationModeEnum;

    isFinished: boolean;

    oilfieldName: string;

    productionObjectName: string;

    scenarioName: string;

    subScenarioName: string;
}

export const isInProgress = (comp: ComputationStatus): boolean =>
    !isNullOrEmpty(comp?.calculations) && any(isCalculationInProgress, comp.calculations);

export const isStartedProgress = (comp: ComputationStatus): boolean =>
    !isNullOrEmpty(comp?.calculations) && any(isCalculationStarted, comp.calculations);

export const isFinished = (comp: ComputationStatus): boolean =>
    !isNullOrEmpty(comp?.calculations) && all(isCalculationFinished, comp.calculations);

export const isNotFinishedCorrectly = (comp: ComputationStatus): boolean =>
    !isNullOrEmpty(comp?.calculations) && any(isCalculationFinishedIncorrectly, comp.calculations);

export const stoppingByUser = (comp: ComputationStatus): boolean =>
    !isNullOrEmpty(comp?.calculations) &&
    any(x => x.currentStep === CalculationStepEnum.IsStoppingByUser, comp.calculations);

export const stoppedByUser = (comp: ComputationStatus): boolean =>
    !isNullOrEmpty(comp?.calculations) &&
    any(x => x.currentStep === CalculationStepEnum.StoppedByUser, comp.calculations);
