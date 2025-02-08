/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ascend, descend, filter, map, prop, sortWith } from 'ramda';
import { atom, selector } from 'recoil';

import { PredictionListWell } from '../../common/entities/wellModel';
import { getWellPredictionList } from '../../common/gateway';
import { isNullOrEmpty, shallow } from '../../common/helpers/ramda';

const sortList = (list: PredictionListWell[]) =>
    sortWith<PredictionListWell>(
        [
            ascend(prop('oilFieldId')),
            ascend(prop('productionObjectId')),
            descend(prop('favorite')),
            ascend(prop('isVirtual')),
            ascend(prop('name'))
        ],
        list
    );

export const shapeList = (raw: any): PredictionListWell[] => {
    const result = map(
        x =>
            shallow<PredictionListWell>(x, {
                isVirtual: isNullOrEmpty(x.name),
                name: isNullOrEmpty(x.name) ? x.id.toString() : x.name
            }),
        raw || []
    );

    return sortList(result);
};

export const predictionWellList = async (): Promise<PredictionListWell[]> => {
    const data = await getWellPredictionList();

    return shapeList(data.data);
};

const wellList = selector<PredictionListWell[]>({
    key: 'prediction__listLoader',
    get: async () => {
        return predictionWellList();
    }
});

export const wellListState = atom<PredictionListWell[]>({
    key: 'prediction__wellListState',
    default: wellList
});

export const wellListForResults = selector<PredictionListWell[]>({
    key: 'prediction__wellListForResults',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.subScenarioId > 0 && it.optState > 0, list); // todo mb filter by server
    }
});

export const wellListForEfficiency = selector<PredictionListWell[]>({
    key: 'prediction__wellListForEfficiency',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.efficiency, list); // todo mb filter by server
    }
});
