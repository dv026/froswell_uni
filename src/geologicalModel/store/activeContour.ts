import { ContourModelBrief } from 'common/entities/contourModelBrief';
import { find } from 'ramda';
import { atom, selector, useRecoilValue } from 'recoil';

import { mapSettingsState } from './mapSettings';

export const activeContourIdState = atom<number>({
    key: 'geologicalModel__activeContourIdState',
    default: null
});

export const intialActiveContourState = atom<ContourModelBrief>({
    key: 'geologicalModel__intialActiveContourState',
    default: null
});

export const activeContourSelector = selector<ContourModelBrief>({
    key: 'geologicalModel__activeContourSelector',
    get: async ({ get }) => {
        const contour = get(intialActiveContourState);
        const contourId = get(activeContourIdState);

        if (contour && contour.id === contourId) {
            return contour;
        }

        const mapSettings = get(mapSettingsState);

        return find(it => it.id === contourId, mapSettings.contour ?? []);
    },
    set: ({ set }, value: ContourModelBrief) => {
        set(intialActiveContourState, value);
    }
});
