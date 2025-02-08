import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentSpot } from '../../../store/well';
import { PermeabilitiesData } from '../entities/permeabilitiesData';
import { calculatePermeabilities } from '../gateways/gateway';
import { paramsState } from './params';

const calculatedParamsLoad = selector<PermeabilitiesData>({
    key: 'proxyPermeability__calculatedParamsLoad',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const well = get(currentSpot);
        const params = get(paramsState);

        const response = await calculatePermeabilities(plastId, well.prodObjId, params.optimizeBL, params.tests);

        return response.data;
    }
});

export const dataState = atom<PermeabilitiesData>({
    key: 'proxyPermeability__dataState',
    default: calculatedParamsLoad
});
