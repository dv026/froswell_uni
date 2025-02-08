/* eslint-disable @typescript-eslint/no-explicit-any */
import { ascend, descend, filter, map, prop, sortWith } from 'ramda';
import { atom, selector } from 'recoil';

import { ProxyListWell } from '../../common/entities/wellModel';
import { getWellsProxyList } from '../../common/gateway';
import { isNullOrEmpty, shallow } from '../../common/helpers/ramda';

const sortList = (list: ProxyListWell[]) =>
    sortWith<ProxyListWell>(
        [
            descend(prop('favorite')),
            ascend(prop('oilFieldId')),
            ascend(prop('productionObjectId')),
            ascend(prop('isVirtual')),
            ascend(prop('name'))
        ],
        list
    );

const shapeList = (raw: any): ProxyListWell[] => {
    const result = map(
        x =>
            shallow<ProxyListWell>(x, {
                isVirtual: isNullOrEmpty(x.name),
                name: isNullOrEmpty(x.name) ? x.id.toString() : x.name
            }),
        raw || []
    );

    return sortList(result);
};

export const proxyWellList = async (): Promise<ProxyListWell[]> => {
    const data = await getWellsProxyList();

    return shapeList(data.data);
};

const wellList = selector<ProxyListWell[]>({
    key: 'proxy__listLoader',
    get: async () => {
        return proxyWellList();
    }
});

export const wellListState = atom<ProxyListWell[]>({
    key: 'proxy__wellListState',
    default: wellList
});

export const wellListForResults = selector<ProxyListWell[]>({
    key: 'proxy__wellListForResults',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.scenarioId > 0 && it.optState > 0, list); // todo mb filter by server
    }
});

export const wellListForEfficiency = selector<ProxyListWell[]>({
    key: 'proxy__wellListForEfficiency',
    get: ({ get }) => {
        const list = get(wellListState);

        return filter(it => it.efficiency, list); // todo mb filter by server
    }
});
