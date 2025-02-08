import { filter, map } from 'ramda';
import { atom, selector } from 'recoil';

import { fromRaw, WellGroupItem } from '../../../../calculation/entities/wellGroupItem';
import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { loadOptimizationWells } from '../../wellGrid/gateways/gateway';

const optimizationWellsLoad = selector<WellGroupItem[]>({
    key: 'optimizationWellGrid__optimizationWellsLoad',
    get: async ({ get }) => {
        const subScenarioId = get(currentSubScenarioId);

        const response = await loadOptimizationWells(subScenarioId);

        return map(fromRaw, response.data);
    }
});

export const optimizationWellsState = atom<WellGroupItem[]>({
    key: 'optimizationWellGrid__optimizationWellsState',
    default: optimizationWellsLoad
});

export const optimizationWellsNumbers = selector<number[]>({
    key: 'optimizationWellGrid__optimizationWellsNumbers',
    get: async ({ get }) => {
        const optimizationWells = get(optimizationWellsState);

        return map(
            (x: WellGroupItem) => x.id,
            filter(it => it.selected, optimizationWells)
        );
    }
});
