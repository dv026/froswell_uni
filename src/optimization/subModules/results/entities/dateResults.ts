import { shapeRaw } from '../../../../common/gateway';

export type DateResults = Omit<DateResultsRaw, 'date'> & { date: Date };

/**
 * Структура данных, возвращаемая сервером
 */
export type DateResultsRaw = {
    mainO: number;

    date: string;

    subScenarioId: number;

    liqRateINSIM: number;

    injectionINSIM: number;

    pressureINSIM: number;

    oilRateINSIM: number;

    pressureZab: number;

    correctedPressureZab: number;

    volumeWaterCutINSIM: number;

    skinFactor: number;

    repairName: string;

    repairNameInjection: string;

    sumLiqRateINSIM: number;

    sumOilRateINSIM: number;

    sumInjectionINSIM: number;
};

export const shape = (raw: DateResultsRaw): DateResults => shapeRaw<DateResultsRaw, DateResults>(raw, ['date']);
