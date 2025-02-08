import { PlastModel } from 'common/entities/plastModel';
import { any, flatten, map, path, pipe, sortBy } from 'ramda';
import { selector } from 'recoil';

import { currentPlastId as currentPlastIdBase } from '../../../../calculation/store/currentPlastId';
import { currentProductionObjectId, currentWellId } from '../../../../calculation/store/userWell';
import { getPlasts } from '../gateways/gateway';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plastsOnObject = (x: any, prodObjId: number, prodObjName: string): PlastModel[] =>
    map(plast => new PlastModel(plast.id, plast.name, prodObjId, prodObjName, false), x);

export const modulePlasts = selector<PlastModel[]>({
    key: 'predictionResults__modulePlasts',
    get: async ({ get }) => {
        const productionObjectId = get(currentProductionObjectId);
        const wellId = get(currentWellId);

        const { data: initialPlasts } = await getPlasts(productionObjectId, wellId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plasts = pipe<any, PlastModel[][], PlastModel[]>(
            x => map(po => plastsOnObject(po.plasts, po.id, po.name), x),
            flatten
        )(initialPlasts);

        return sortBy(path(['id']), plasts);
    }
});

export const currentPlastId = selector<number>({
    key: 'predictionResults__currentPlastId',
    get: async ({ get }) => {
        const plasts = get(modulePlasts);

        let plastId = get(currentPlastIdBase);

        // если у новой скважины есть пласт текущей скважины, установить его текущим
        // если нет, то оставить значение по умолчанию (по объекту)
        if (!any(x => x.id === plastId, plasts || [])) {
            plastId = null;
        }

        return plastId;
    },
    set: ({ set }, plastId: number) => {
        set(currentPlastIdBase, plastId);
    }
});
