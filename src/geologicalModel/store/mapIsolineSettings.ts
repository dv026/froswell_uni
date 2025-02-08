import { atom, selector } from 'recoil';

import { IsolineModel } from '../../common/entities/mapCanvas/isolineModel';

const isolineSettingsState = atom<IsolineModel>({
    key: 'geologicalModel__isolineSettingsState',
    default: null
});

export const mapIsolineSettings = selector<IsolineModel>({
    key: 'geologicalModel__isolineSettings',
    get: async ({ get }) => {
        return get(isolineSettingsState);
    },
    set: ({ set }, value: IsolineModel) => {
        set(isolineSettingsState, value);
    }
});
