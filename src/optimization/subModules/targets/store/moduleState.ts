import { atom, selector } from 'recoil';

import { currentSpot } from '../../../store/well';
import { optimizationWellsNumbers } from '../../wellGroup/store/optimizationWells';
import { ModuleModel } from '../entities/moduleModel';
import { requestTargetZones } from '../gateways/gateway';
import { currentPlastIdState } from './currentPlast';

const moduleRefresherState = atom({
    key: 'optimizationTargets__moduleRefresherState',
    default: 0
});

export const moduleRefresher = selector({
    key: 'optimizationTargets__moduleRefresher',
    get: async ({ get }) => {
        return get(moduleRefresherState);
    },
    set: ({ get, set }) => {
        const previous = get(moduleRefresherState);
        set(moduleRefresherState, previous + 1);
    }
});

const moduleInitialLoad = selector<ModuleModel>({
    key: 'optimizationTargets__moduleInitialLoad',
    get: async ({ get }) => {
        const plastId = get(currentPlastIdState);
        const well = get(currentSpot);
        const filteredWells = get(optimizationWellsNumbers);

        const { data: response } = await requestTargetZones(well, plastId, filteredWells);

        return { chartData: response.chartData, targetZones: response.targetZones };
    }
});

export const moduleState = atom<ModuleModel>({
    key: 'optimizationTargets__moduleState',
    default: moduleInitialLoad
});
