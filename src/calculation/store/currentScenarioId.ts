import { appRouter } from 'common/helpers/history';
import { find } from 'ramda';
import { selector } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';
//import { history as h } from '../../common/helpers/history';
import * as router from '../../common/helpers/routers/proxyRouter';
import { getCurrentScenarioId, ScenarioModel } from '../entities/scenarioModel';
import { scenariosState } from './scenarios';
import { userWell } from './userWell';

export const defaultScenarioId = selector<number>({
    key: 'calculation__defaultScenarioId',
    get: async ({ get }) => {
        const well = get(userWell);
        const scenarios = get(scenariosState);

        return getCurrentScenarioId(scenarios, well.scenarioId);
    }
});

export const currentScenarioId = selector<number>({
    key: 'calculation__currentScenarioId',
    get: async ({ get }) => {
        const well = get(userWell);

        return well?.scenarioId;
    },
    set: ({ get, set }, scenarioId: number) => {
        const well = get(userWell);

        if (!well) {
            return;
        }

        const currentWell = new WellBrief(
            well.oilFieldId,
            well.id,
            well.prodObjId,
            well.charWorkId,
            scenarioId,
            well.subScenarioId
        );

        appRouter.navigate(router.to(window.location.pathname, currentWell));

        set(userWell, currentWell);
    }
});

export const currentScenarioItem = selector<ScenarioModel>({
    key: 'calculation__currentScenarioItem',
    get: async ({ get }) => {
        const scenarios = get(scenariosState);
        const well = get(userWell);

        return find(it => it.id === well.scenarioId, scenarios);
    }
});
