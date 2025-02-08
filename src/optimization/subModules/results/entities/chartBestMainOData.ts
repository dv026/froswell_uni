import { round2 } from '../../../../common/helpers/math';
import { DateResults } from '../entities/dateResults';

export type ChartBestMainOData = Pick<
    DateResults,
    | 'oilRateINSIM'
    | 'liqRateINSIM'
    | 'pressureZab'
    | 'volumeWaterCutINSIM'
    | 'injectionINSIM'
    | 'skinFactor'
    | 'correctedPressureZab'
    | 'repairName'
    | 'repairNameInjection'
    | 'sumLiqRateINSIM'
    | 'sumOilRateINSIM'
    | 'sumInjectionINSIM'
> & { date: number };

export const fromDateResults = (x: DateResults): ChartBestMainOData => {
    return {
        date: new Date(x.date).getTime(),
        liqRateINSIM: round2(x.liqRateINSIM),
        oilRateINSIM: x.liqRateINSIM > 0 ? round2(x.oilRateINSIM) : null,
        pressureZab: round2(x.pressureZab),
        correctedPressureZab: x.correctedPressureZab === null ? null : round2(x.correctedPressureZab),
        volumeWaterCutINSIM: x.volumeWaterCutINSIM > 0 ? round2(x.volumeWaterCutINSIM) : null,
        injectionINSIM: round2(x.injectionINSIM),
        skinFactor: round2(x.skinFactor),
        repairName: x.repairName,
        repairNameInjection: x.repairNameInjection,
        sumLiqRateINSIM: x.sumLiqRateINSIM,
        sumOilRateINSIM: x.sumOilRateINSIM,
        sumInjectionINSIM: x.sumInjectionINSIM
    };
};
