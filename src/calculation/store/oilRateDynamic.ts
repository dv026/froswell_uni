import { filter, isNil, pipe, sortBy } from 'ramda';
import { selector } from 'recoil';

import { addMissingDates, ParamDate } from '../../common/entities/paramDate';
import { createEmptyParamDateOrig, ParamDateOrig } from '../../common/entities/paramDateOrig';
import { Range } from '../../common/entities/range';
import { InsimCalculationParams } from '../../proxy/entities/insimCalculationParams';
import { insimCalcParams } from './insimCalcParams';
import { proxySharedState } from './sharedCalculation';

export const oilRateDynamic = selector<ParamDate[]>({
    key: 'calculation__oilRateDynamic',
    get: async ({ get }) => {
        const shared = get(proxySharedState);
        const params = get(insimCalcParams);

        return pipe(
            () => sortBy((x: ParamDate) => x.date, shared?.well?.oilRateDynamic ?? []),
            p => filterByAdaptationDates(p, params)
        )();
    }
});

export const oilRateDiffDynamic = selector<ParamDateOrig[]>({
    key: 'calculation__oilRateDiffDynamic',
    get: async ({ get }) => {
        const shared = get(proxySharedState);
        const params = get(insimCalcParams);

        if (isNil(params)) {
            return null;
        }

        return pipe(
            () => sortBy(x => x.date, shared?.well?.oilRateDiffDynamic ?? []),
            p => filterByAdaptationDates(p, params),
            p =>
                addMissingDates(p, createEmptyParamDateOrig, params.defaultAdaptationStart, params.defaultAdaptationEnd)
        )();
    }
});

function filterByAdaptationDates<T extends ParamDate | ParamDateOrig>(p: T[], params: InsimCalculationParams): T[] {
    const adaptationDates = new Range(
        params?.defaultAdaptationStart ?? new Date(1970, 0, 1),
        params?.defaultAdaptationEnd ?? new Date()
    );

    return filter((p: T) => p.date >= adaptationDates.min && p.date <= adaptationDates.max, p);
}
