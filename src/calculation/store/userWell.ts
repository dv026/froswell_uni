import { atom, selector } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';

export const userWell = atom<WellBrief>({
    key: 'calculation__userWell',
    default: null
});

export const currentOilFieldId = selector<number>({
    key: 'calculation__currentOilFieldId',
    get: async ({ get }) => {
        return get(userWell)?.oilFieldId;
    }
});

export const currentProductionObjectId = selector<number>({
    key: 'calculation__currentProductionObjectId',
    get: async ({ get }) => {
        return get(userWell)?.prodObjId;
    }
});

export const currentWellId = selector<number>({
    key: 'calculation__currentWellId',
    get: async ({ get }) => {
        return get(userWell)?.id;
    }
});
