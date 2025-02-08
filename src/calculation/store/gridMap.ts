import { atom, selector } from 'recoil';

import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { mapIsolineSettings } from './mapIsolineSettings';

const gridMapState = atom<GridMapEnum>({
    key: 'calculationMap__gridMapState',
    default: GridMapEnum.None
});

export const currentGridMap = selector<GridMapEnum>({
    key: 'calculationMap__currentGridMap',
    get: async ({ get }) => {
        return get(gridMapState);
    },
    set: ({ set, reset }, value: GridMapEnum) => {
        set(gridMapState, value);
        reset(mapIsolineSettings);
    }
});
