import { WithDate } from './merModel';

export interface InputCompareModel extends WithDate {
    oilfieldId: number;
    oilfieldName: string;
    productionObjectId: number;
    productionObjectName: string;
    scenarioId: number;
    scenarioName: string;
    subScenarioId: number;
    subScenarioName: string;
    wellId: number;
    wellName: string;
    wellType: number;
    value: number;
    valueReal: number;
    repairName: string;
    repairNameInjection: string;
}
