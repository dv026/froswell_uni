import { shapeRaw } from 'common/gateway';

export type DateResults = Omit<DateResultsRaw, 'dt'> & { dt: Date };

/**
 * Структура данных, возвращаемая сервером
 */
export type DateResultsRaw = {
    wellID: number;
    dt: Date;
    gtmNum: number;
    liquidVolumeRate: number;
    watercutVolume: number;
    factOil: number;
    baseOil: number;
    effectiveOil: number;
    effectiveOilMonth: number;
    operationId: number;
    operationName: string;
};

export const shape = (raw: DateResultsRaw): DateResults => shapeRaw<DateResultsRaw, DateResults>(raw, ['dt']);
