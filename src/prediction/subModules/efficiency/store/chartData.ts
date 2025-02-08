import { KeyValue } from 'common/entities/keyValue';
import { mmyyyy } from 'common/helpers/date';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { ChartData, fromDateResults } from 'commonEfficiency/entities/chartData';
import { DateResults } from 'commonEfficiency/entities/dateResults';
import { currentPlastId } from 'commonEfficiency/store/currentPlastId';
import { repairModeState } from 'commonEfficiency/store/repairMode';
import i18n from 'i18next';
import { filter, flatten, isNil, map, mean, pipe, prop, reject, sortBy, sum } from 'ramda';
import { selector } from 'recoil';

import { currentSpot } from '../../../store/well';
import { getAdaptationData } from '../gateways/gateway';

import dict from 'common/helpers/i18n/dictionary/main.json';

const chartInsimDataLoad = selector<ChartData[]>({
    key: 'predictionResults__chartInsimDataLoad',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        if (!well?.id) {
            return null;
        }

        const { data } = await getAdaptationData(well, plastId);

        if (isNil(data)) {
            return null;
        }

        return map(x => fromDateResults(x), data);
    }
});

export const chartFilteredData = selector<ChartData[]>({
    key: 'predictionResults__chartFilteredData',
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
        )(filter((it: DateResults) => mode === 0 || it.gtmNum === mode || it.gtmNum === mode - 1, data));
    }
});

export const chartFilteredDataForOptions = selector<ChartData[]>({
    key: 'predictionResults__chartFilteredDataForOptions',
    get: async ({ get }) => {
        const mode = get(repairModeState);
        const data = get(chartFilteredData);

        return filter((it: DateResults) => it.gtmNum === mode, data);
    }
});

export const averageGrowth = selector<number>({
    key: 'predictionResults__averageGrowth',
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
    key: 'predictionResults__accumulatedGrowth',
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
    key: 'predictionResults__efficiencyRepairs',
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
