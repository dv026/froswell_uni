import { find } from 'ramda';
import { selector } from 'recoil';

import { ScenarioModel } from '../../../../calculation/entities/scenarioModel';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { scenariosState } from '../../../../calculation/store/scenarios';
import { SubScenarioModel } from '../../../../proxy/entities/proxyMap/subScenarioModel';

export const allSubScenarios = selector<SubScenarioModel[]>({
    key: 'predictionModel__allSubScenarios',
    get: async ({ get }) => {
        const scenarioId = get(currentScenarioId);
        const scenarios = get(scenariosState);

        return find<ScenarioModel>(it => it.id === scenarioId, scenarios || [])?.subScenarios;
    }
});
