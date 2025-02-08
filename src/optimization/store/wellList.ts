import { filter } from 'ramda';
import { atom, selector } from 'recoil';

import { PredictionListWell } from '../../common/entities/wellModel';
import { getWellOptimizationList } from '../../common/gateway';
import { shapeList } from '../../prediction/store/wellList';

export const optimizationWellList = async (): Promise<PredictionListWell[]> => {
    const data = await getWellOptimizationList();

    return shapeList(data.data);
};

const wellList = selector<PredictionListWell[]>({
    key: 'optimization__listLoader',
    get: async () => {
        return optimizationWellList();
    }
});

export const wellListState = atom<PredictionListWell[]>({
    key: 'optimization__wellListState',
    default: wellList
});

export const wellListForResults = selector<PredictionListWell[]>({
    key: 'optimization__wellListForResults',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.subScenarioId > 0 && it.optState > 0, list); // todo mb filter by server
    }
});

export const wellListForEfficiency = selector<PredictionListWell[]>({
    key: 'optimization__wellListForEfficiency',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.efficiency, list); // todo mb filter by server
    }
});
