import { filter, map, pick, uniq, values, zipObj } from 'ramda';
import { atom, selector, selectorFamily } from 'recoil';

import { KeyValue } from '../../common/entities/keyValue';
import { WellModel } from '../../common/entities/wellModel';
import { getCommonWell, getWellList } from '../../common/gateway';
import { isNullOrEmpty, shallow } from '../../common/helpers/ramda';
import { currentSpot } from './well';

const convert = (x): KeyValue => new KeyValue(x.id, x.name);

const shapeList = (raw): WellModel[] =>
    map(
        x =>
            shallow<WellModel>(x, {
                name: isNullOrEmpty(x.name) ? x.id.toString() : x.name
            }),
        raw || []
    );

const wellList = selector<WellModel[]>({
    key: 'input__wellList',
    get: async () => {
        const response = await getWellList();

        if (response?.error) {
            return [];
        }

        return response?.data ? shapeList(response.data) : [];
    }
});

export const wellListState = atom<WellModel[]>({
    key: 'input__wellListState',
    default: wellList
});

export const wellListForEfficiency = selector<WellModel[]>({
    key: 'input__wellListForEfficiency',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.efficiency, list); // todo mb filter by server
    }
});

export const objectsSelector = selectorFamily({
    key: 'input__objectsSelector',
    get:
        (wellId: number) =>
        ({ get }) => {
            const list = get(wellListState);

            let wellObj = filter(it => it.id === wellId, list);

            return map(
                convert,
                uniq(
                    map(
                        x => zipObj(['id', 'name'], values(pick(['productionObjectId', 'productionObjectName'], x))),
                        wellObj
                    )
                )
            );
        }
});

export const wellTypesSelector = selector<KeyValue[]>({
    key: 'input__wellTypesSelector',
    get: async ({ get }) => {
        const well = get(currentSpot);

        if (!well) {
            return [];
        }

        const { data } = await getCommonWell(well);

        let wellObj = filter(it => it.id === well.id, data);

        return map(
            convert,
            uniq(map(x => zipObj(['id', 'name'], values(pick(['charWorkId', 'charWorkName'], x))), wellObj))
        );
    }
});
