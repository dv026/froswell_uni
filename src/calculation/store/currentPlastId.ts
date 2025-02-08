import { find, head } from 'ramda';
import { atom, selector } from 'recoil';

import { mapSettingsRefresher, mapSettingsState } from '../../proxy/store/map/mapSettings';
import {
    optimizationParametersRefresher,
    optimizationParametersState
} from '../../proxy/store/map/optimizationParameters';
import { dataState } from '../../proxy/subModules/permeabilities/store/data';
import { indentWaterOilContactState } from '../../proxy/subModules/wellGrid/store/aquifer';
import { currentVolumeReservoirState } from '../../proxy/subModules/wellGrid/store/geologicalReserves';
import { allPlasts } from './plasts';

const defaultPlast = selector<number>({
    key: 'calculation__defaultPlast',
    get: async ({ get }) => {
        const plasts = get(allPlasts);

        return head(plasts)?.id;
    }
});

const currentPlastIdState = atom<number>({
    key: 'calculation__currentPlastIdState',
    default: defaultPlast
});

export const currentPlastId = selector<number>({
    key: 'calculation__currentPlastId',
    get: async ({ get }) => {
        return get(currentPlastIdState);
    },
    set: ({ set, reset }, newValue: number) => {
        reset(dataState);
        reset(indentWaterOilContactState);
        reset(mapSettingsState);
        reset(optimizationParametersState);
        reset(currentVolumeReservoirState);

        reset(optimizationParametersRefresher);
        reset(mapSettingsRefresher);

        set(currentPlastIdState, newValue);
    }
});

export const currentPlastName = selector<string>({
    key: 'calculation__currentPlastName',
    get: async ({ get }) => {
        const id = get(currentPlastIdState);
        const plasts = get(allPlasts);

        return find(it => it.id === id, plasts)?.name;
    }
});
