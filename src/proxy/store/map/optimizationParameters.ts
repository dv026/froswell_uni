import { filter } from 'ramda';
import { atom, selector, selectorFamily } from 'recoil';

import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { currentSubScenarioId } from '../../../calculation/store/currentSubScenarioId';
import { OptimizationChangesModel } from '../../entities/optimization/OptimizationChangesModel';
import { OptimizationState } from '../../entities/optimization/optimizationState';
import { OptimisationModel } from '../../entities/proxyMap/optimisationModel';
import { OptimisationSkinFactorModel } from '../../entities/proxyMap/optimisationSkinFactorModel';
import { getOptimizationParameters } from '../../gateways/wellGrid/gateway';

const optimizationParametersRefresherState = atom({
    key: 'proxyMap__optimizationParametersRefresherState',
    default: 0
});

export const optimizationParametersRefresher = selector({
    key: 'proxyMap__optimizationParametersRefresher',
    get: async ({ get }) => {
        return get(optimizationParametersRefresherState);
    },
    set: ({ get, set }) => {
        const previous = get(optimizationParametersRefresherState);

        set(optimizationParametersRefresherState, previous + 1);
    }
});

const optimizationParametersLoad = selector<OptimizationState>({
    key: 'proxyMap__optimizationParametersLoad',
    get: async ({ get }) => {
        const subSenarioId = get(currentSubScenarioId);
        const plastId = get(currentPlastId);

        get(optimizationParametersRefresher);

        const { data: response } = await getOptimizationParameters(subSenarioId, plastId);

        if (!response) {
            return null;
        }

        return {
            optimisation: response.pressureZab,
            originalOptimisation: response.pressureZab,
            optimisationSkinFactor: response.skinFactor,
            originalOptimisationSkinFactor: response.skinFactor
        };
    }
});

export const optimizationParametersState = atom<OptimizationState>({
    key: 'proxyMap__optimizationParametersState',
    default: optimizationParametersLoad
});

export const optimizationPressureZabParameters = selector<OptimisationModel[]>({
    key: 'proxyMap__optimizationPressureZabParameters',
    get: async ({ get }) => {
        const model = get(optimizationParametersState);

        return model.optimisation;
    }
});

export const optimizationSkinFactorParameters = selector<OptimisationSkinFactorModel[]>({
    key: 'proxyMap__optimizationSkinFactorParameters',
    get: async ({ get }) => {
        const model = get(optimizationParametersState);

        return model.optimisationSkinFactor;
    }
});

export const optimizationSkinFactorParametersByWell = selectorFamily({
    key: 'optimization__optimizationSkinFactorParametersByWell',
    get:
        (wellId: number) =>
        ({ get }) => {
            const model = get(optimizationParametersState);

            return filter(it => it.wellId === wellId, model.optimisationSkinFactor);
        }
});

export const optimizationParametersChangesState = atom<OptimizationChangesModel>({
    key: 'proxyMap__optimizationParametersChangesState',
    default: new OptimizationChangesModel()
});
