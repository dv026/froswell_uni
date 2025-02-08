import * as R from 'ramda';
import { descend, ifElse, isNil, prop, sortWith } from 'ramda';

import { KeyValue } from '../../common/entities/keyValue';
import { fnAsIs, isNullOrEmpty } from '../../common/helpers/ramda';
import { SubScenarioModel } from '../../proxy/entities/proxyMap/subScenarioModel';

export class ScenarioModel extends KeyValue {
    public productionObjectId?: number;
    public lastUpdateDate: Date;
    public subScenarios: SubScenarioModel[];
    public isAuto: boolean;
    public calcState: boolean;
    public favorite: boolean;

    public constructor(
        id: number,
        name: string,
        productionObjectId?: number,
        lastUpdateDate: string = '',
        subScenarios: SubScenarioModel[] = [],
        isAuto: boolean = false,
        calcState: boolean = false
    ) {
        super(id, name);

        this.productionObjectId = productionObjectId;
        this.lastUpdateDate = isNullOrEmpty(lastUpdateDate) ? null : new Date(lastUpdateDate);

        this.subScenarios = subScenarios;

        this.isAuto = isAuto;

        this.calcState = calcState;
    }
}

export const getCurrentScenarioId = (scenarios: ScenarioModel[], currentScenarioId: number = 0): number => {
    scenarios = scenarios || [];
    if (!!currentScenarioId) {
        return R.any(x => x.id === currentScenarioId, scenarios)
            ? currentScenarioId
            : R.isEmpty(scenarios)
            ? null
            : R.head(scenarios).id;
    }

    return R.isEmpty(scenarios) ? null : R.head(scenarios).id;
};

export const getCurrentSchemaId = (
    scenarios: ScenarioModel[],
    currentSchemaId: [number, number] = [0, 0]
): [number, number] => {
    if (isNullOrEmpty(scenarios)) {
        return [null, null];
    }

    const scenario = R.find(x => x.id === currentSchemaId[0], scenarios);
    if (!scenario) {
        const first = R.head(R.head(scenarios).subScenarios) || { id: null };

        return [R.head(scenarios).id, first.id];
    }

    if (!R.find(x => x.id === currentSchemaId[1], scenario.subScenarios)) {
        const first = R.head(scenario.subScenarios) || { id: null };
        return [scenario.id, first.id];
    }

    return currentSchemaId;
};

const byUpdateDateThenId = sortWith<ScenarioModel>([descend(prop('lastUpdateDate')), descend(prop('id'))]);
export const sortScenariosById = (scenarios: ScenarioModel[]): ScenarioModel[] =>
    ifElse(isNil, fnAsIs, byUpdateDateThenId)(scenarios);
