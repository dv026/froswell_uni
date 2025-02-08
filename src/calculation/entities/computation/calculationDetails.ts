import { AdaptationTypeEnum } from './adaptationTypeEnum';
import { PlastDetails } from './plastDetails';

export interface CalculationDetails {
    id: string;

    scenarioId: number;

    subScenarioId: number;

    minA: number;

    currentA: number;

    maxA: number;

    startDate: string;

    endDate: string;

    percent: number;

    type: AdaptationTypeEnum;

    /**
     * Адаптируемый на текущей итерации юнит (может быть null)
     */
    unitId: string;

    wellErrors: WellError[];

    adaptationDynamics: AdaptationDynamics[];

    plasts: PlastDetails[];
}

export interface WellError {
    id: number;

    orderNumber: number;

    type: number;

    name: string;

    oil: ParameterDynamics;

    liquid: ParameterDynamics;

    injection: ParameterDynamics;

    bottomHolePressure: ParameterDynamics;

    dynamicLevel: ParameterDynamics;
}

export interface ParameterDynamics {
    currentValue: number;

    difference: number;
}

export interface AdaptationDynamics {
    a: number;

    adaptationType: AdaptationTypeEnum;

    isBest: boolean;

    isBestNow: boolean;

    /**
     * Композитная ошибка за весь период расчета
     */
    error: number;

    oilError: number;

    liquidError: number;

    oilProduction: number;

    oilProductionReal: number;

    liquidProduction: number;

    liquidProductionReal: number;

    bhpError: number;

    oilSMAPE: number;

    liquidSMAPE: number;

    pressureSMAPE: number;

    injectionSMAPE: number;

    bottomHolePressureSMAPE: number;

    researchSMAPE: number;

    watercutMAE: number;
}
