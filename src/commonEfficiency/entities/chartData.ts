import { DateResults } from './dateResults';

export type ChartData = DateResults & { areaOil: number[]; repairName: string; repairNameInjection: string };

export const fromDateResults = (x: DateResults): ChartData => ({
    wellID: x.wellID,
    dt: x.dt,
    gtmNum: x.gtmNum,
    liquidVolumeRate: x.liquidVolumeRate,
    watercutVolume: x.watercutVolume,
    factOil: x.factOil,
    baseOil: x.baseOil,
    areaOil: [],
    effectiveOil: x.effectiveOil,
    effectiveOilMonth: x.effectiveOilMonth,
    operationId: x.operationId,
    operationName: x.operationName,
    repairName: x.operationName,
    repairNameInjection: x.operationName
});
