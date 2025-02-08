export interface CalculationOptDetails {
    scenarioId: number;

    scenarioName: string;

    subScenarioId: number;

    subScenarioName: string;

    periods: OptPeriod[];

    wells: WellDetails[];

    currentT: number;

    maxT: number;

    modelId: number;
}

export interface OptPeriod {
    startDate: string;

    endDate: string;

    stats: OptTrialStats[];
}

export interface OptTrialStats {
    id: number;

    avgInjWellsPressure: number;

    avgOilWellsPressure: number;

    sumLiquid: number;

    sumOil: number;

    isBest: boolean;
}

export interface WellDetails {
    id: number;

    charworkId: number;

    name: string;

    defaultValue: number;

    dynamic: ParamDynamic[];
}

export interface ParamDynamic {
    periodStart: string;

    minValue: number;

    value: number;

    maxValue: number;
}
