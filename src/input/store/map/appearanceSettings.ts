import { atom, selector } from 'recoil';

import { currentPlastId } from '../plast';

interface AppearanceSettingsState {
    showTracerResearch: boolean;
    showOpeningMode: boolean;
    showNaturalRadius: boolean;
    showWellComments: boolean;
}

const initialState: AppearanceSettingsState = {
    showTracerResearch: true,
    showOpeningMode: false,
    showNaturalRadius: false,
    showWellComments: false
};

export const appearanceSettingsState = atom<AppearanceSettingsState>({
    key: 'inputMap__appearanceSettingsState',
    default: initialState
});

export const showNaturalRadiusSelector = selector<boolean>({
    key: 'input__showNaturalRadiusSelector',
    get: async ({ get }) => {
        const appearance = get(appearanceSettingsState);
        const plastId = get(currentPlastId);

        return appearance?.showNaturalRadius || plastId > 0;
    }
});
