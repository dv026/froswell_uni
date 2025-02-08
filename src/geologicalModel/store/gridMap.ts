import { atom, selector } from 'recoil';

import { GridMapEnum } from '../../common/enums/gridMapEnum';

const gridMapState = atom<GridMapEnum>({
    key: 'geologicalModel__gridMapState',
    default: GridMapEnum.None
});

export const currentGridMap = selector<GridMapEnum>({
    key: 'geologicalModel__currentGridMap',
    get: async ({ get }) => {
        return get(gridMapState);
    },
    set: ({ set }, value: GridMapEnum) => {
        set(gridMapState, value);
    }
});
