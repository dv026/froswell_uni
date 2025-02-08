import * as R from 'ramda';

import { ScenarioModel } from '../../../calculation/entities/scenarioModel';
import { KeyValue } from '../../../common/entities/keyValue';
import { isNullOrEmpty } from '../../../common/helpers/ramda';

export class SubScenarioModel extends KeyValue {
    public scenarioId: number;

    public constructor(id: number, name: string, scenarioId: number) {
        super(id, name);

        this.scenarioId = scenarioId;
    }
}

export const getCurrentSubScenarioId = (
    scenarios: ScenarioModel[],
    currentScenarioId: number = 0,
    currentSubScenarioId: number = 0
): number => {
    const scenario = R.find(it => it.id === currentScenarioId, scenarios || []);

    if (!scenario) {
        return null;
    }

    const subScenarios = isNullOrEmpty(scenario.subScenarios) ? [] : scenario.subScenarios;
    const firstSubScenarios = isNullOrEmpty(subScenarios) ? null : R.head(subScenarios).id;

    if (!!currentSubScenarioId) {
        return R.any(x => x.id === currentSubScenarioId, subScenarios) ? currentSubScenarioId : firstSubScenarios;
    }

    return firstSubScenarios;
};
