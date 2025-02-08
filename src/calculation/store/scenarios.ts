import { innerJoin, pipe } from 'ramda';
import { selector } from 'recoil';

import { proxySharedState } from '../../calculation/store/sharedCalculation';
import { CalculationTemplate } from '../../proxy/entities/wellDetailsModel';
import { getScenarios } from '../../proxy/gateways/gateway';
import { ScenarioModel, sortScenariosById } from '../entities/scenarioModel';
import { currentProductionObjectId } from './userWell';

export const scenariosState = selector<ScenarioModel[]>({
    key: 'calculation__allScenariosLoad',
    get: async ({ get }) => {
        const prodObjId = get(currentProductionObjectId);

        if (!prodObjId) {
            return [];
        }

        const { data } = await getScenarios(prodObjId);

        return sortScenariosById(data || []);
    }
});

export const scenariosForObject = selector<ScenarioModel[]>({
    key: 'calculation__scenariosForObject',
    get: async ({ get }) => {
        const shared = get(proxySharedState);
        const scenarios = get(scenariosState);

        return pipe(
            x =>
                innerJoin(
                    (scenario: ScenarioModel, template: CalculationTemplate) => scenario.id === template.scenarioId,
                    x,
                    shared.templates
                ),
            sortScenariosById
        )(scenarios || []);
    }
});

export const scenariosWithResults = selector<ScenarioModel[]>({
    key: 'calculation__scenariosWithResults',
    get: async ({ get }) => {
        return get(scenariosForObject);
    }
});

// const scenariosForWell = (scenarioId: number, scenarios: ScenarioModel[]): ScenarioModel[] =>
//     reject(isNil, [find(x => x.id === scenarioId, scenarios)]);
