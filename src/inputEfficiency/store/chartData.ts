import { KeyValue } from 'common/entities/keyValue';
import { mmyyyy } from 'common/helpers/date';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { ChartData, fromDateResults } from 'commonEfficiency/entities/chartData';
import { DateResults } from 'commonEfficiency/entities/dateResults';
import { gtmModeState } from 'commonEfficiency/store/gtmMode';
import { repairModeState } from 'commonEfficiency/store/repairMode';
import i18n from 'i18next';
import { currentSpot } from 'input/store/well';
import { getDynamicData } from 'inputEfficiency/gateways/gateway';
import { filter, flatten, isNil, map, mean, pipe, prop, reject, sortBy, sum } from 'ramda';
import { selector } from 'recoil';

import dict from 'common/helpers/i18n/dictionary/main.json';

const chartDynamicDataLoad = selector<ChartData[]>({
    key: 'inputEfficiency__chartDynamicDataLoad',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const gtmMode = get(gtmModeState);

        if (!well?.id) {
            return null;
        }

        const { data } = await getDynamicData(well, gtmMode);

        if (isNil(data)) {
            return null;
        }

        return map(x => fromDateResults(x), data);
    }
});

export const chartFilteredData = selector<ChartData[]>({
    key: 'inputEfficiency__chartFilteredData',
    get: async ({ get }) => {
        const mode = get(repairModeState);
        const data = get(chartDynamicDataLoad);

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
    key: 'inputEfficiency__chartFilteredDataForOptions',
    get: async ({ get }) => {
        const mode = get(repairModeState);
        const data = get(chartFilteredData);

        return filter((it: DateResults) => it.gtmNum === mode, data);
    }
});

export const averageGrowth = selector<number>({
    key: 'inputEfficiency__averageGrowth',
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
    key: 'inputEfficiency__accumulatedGrowth',
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
    key: 'inputEfficiency__efficiencyRepairs',
    get: async ({ get }) => {
        const data = get(chartDynamicDataLoad);

        return flatten([
            new KeyValue(0, i18n.t(dict.efficiency.settings.overallView)),
            map(
                (it: DateResults) => new KeyValue(it.gtmNum, `${it.operationName} ${mmyyyy(it.dt)}`),
                filter((it: DateResults) => !isNil(it.operationId), data ?? [])
            )
        ]);
    }
});
