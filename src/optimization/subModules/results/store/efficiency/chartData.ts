import { repairModeState } from 'commonEfficiency/store/repairMode';
import i18n from 'i18next';
import { getAdaptationData } from 'prediction/subModules/efficiency/gateways/gateway';
import { filter, flatten, isNil, map, mean, pipe, prop, reject, sortBy, sum } from 'ramda';
import { selector } from 'recoil';

import { currentPlastId } from '../../../../../calculation/store/currentPlastId';
import { KeyValue } from '../../../../../common/entities/keyValue';
import { mmyyyy } from '../../../../../common/helpers/date';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { ChartData, fromDateResults } from '../../../../../commonEfficiency/entities/chartData';
import { DateResults } from '../../../../../commonEfficiency/entities/dateResults';
import { currentSpot } from '../../../../store/well';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

const chartInsimDataLoad = selector<ChartData[]>({
    key: 'optimizationResults__chartInsimDataLoad',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        if (!well?.id) {
            return null;
        }

        const { data } = await getAdaptationData(well, plastId, true);

        if (isNil(data)) {
            return null;
        }

        return map(x => fromDateResults(x), data);
    }
});

export const chartFilteredData = selector<ChartData[]>({
    key: 'optimizationResults__chartFilteredData',
    get: async ({ get }) => {
        const mode = get(repairModeState);
        const data = get(chartInsimDataLoad);

        if (isNullOrEmpty(data)) {
            return [];
        }

        return pipe(
            map(
                (x: DateResults) =>
                    ({
                        dt: x.dt,
                        gtmNum: x.gtmNum,
                        liquidVolumeRate: x.liquidVolumeRate,
                        watercutVolume: x.watercutVolume,
                        factOil: x.factOil,
                        baseOil: x.gtmNum === mode ? x.baseOil : null,
                        areaOil: [x.factOil, x.gtmNum === mode ? x.baseOil : null],
                        effectiveOil: x.effectiveOil,
                        effectiveOilMonth: x.effectiveOilMonth,
                        operationId: x.operationId,
                        operationName: x.operationName,
                        repairName: x.operationName,
                        repairNameInjection: x.operationName
                    } as ChartData)
            ),
            sortBy(prop('dt'))
        )(mode ? filter((it: DateResults) => it.gtmNum === mode, data) : data);
    }
});

export const chartFilteredDataForOptions = selector<ChartData[]>({
    key: 'optimizationResults__chartFilteredDataForOptions',
    get: async ({ get }) => {
        const mode = get(repairModeState);
        const data = get(chartFilteredData);

        return filter((it: DateResults) => it.gtmNum === mode, data);
    }
});

export const averageGrowth = selector<number>({
    key: 'optimizationResults__averageGrowth',
    get: async ({ get }) => {
        const data = get(chartFilteredDataForOptions);

        return mean(
            reject(
                isNil,
                map((x: DateResults) => x.effectiveOil, data)
            )
        );
    }
});

export const accumulatedGrowth = selector<number>({
    key: 'optimizationResults__accumulatedGrowth',
    get: async ({ get }) => {
        const data = get(chartFilteredDataForOptions);

        return sum(
            reject(
                isNil,
                map((x: DateResults) => x.effectiveOilMonth, data)
            )
        );
    }
});

export const efficiencyRepairs = selector<KeyValue[]>({
    key: 'optimizationResults__efficiencyRepairs',
    get: async ({ get }) => {
        const data = get(chartInsimDataLoad);

        return flatten([
            new KeyValue(0, i18n.t(dict.efficiency.settings.overallView)),
            map(
                (it: DateResults) => new KeyValue(it.gtmNum, `${it.operationName} ${mmyyyy(it.dt)}`),
                filter((it: DateResults) => !isNil(it.operationId), data ?? [])
            )
        ]);
    }
});
