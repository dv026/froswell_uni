import { appRouter } from 'common/helpers/history';
import { find } from 'ramda';
import { selector } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';
import * as router from '../../common/helpers/routers/proxyRouter';
import { allSubScenarios } from '../../prediction/subModules/model/store/subScenarios';
import { getCurrentSubScenarioId, SubScenarioModel } from '../../proxy/entities/proxyMap/subScenarioModel';
import { mapSettingsRefresher } from '../../proxy/store/map/mapSettings';
import { scenariosState } from './scenarios';
import { userWell } from './userWell';

export const defaultSubScenarioId = selector<number>({
    key: 'calculation__defaultSubScenarioId',
    get: async ({ get }) => {
        const well = get(userWell);
        const scenarios = get(scenariosState);

        return getCurrentSubScenarioId(scenarios, well.scenarioId, well.subScenarioId);
    }
});

export const currentSubScenarioId = selector<number>({
    key: 'calculation__currentSubScenarioId',
    get: async ({ get }) => {
        const well = get(userWell);

        return well?.subScenarioId;
    },
    set: ({ get, set, reset }, subScenarioId: number) => {
        const well = get(userWell);

        if (!well) {
            return;
        }

        const currentWell = new WellBrief(
            well.oilFieldId,
            well.id,
            well.prodObjId,
            well.charWorkId,
            well.scenarioId,
            subScenarioId
        );

        appRouter.navigate(router.to(window.location.pathname, currentWell));

        set(userWell, currentWell);

        reset(mapSettingsRefresher);
    }
});

export const currentSubScenarioItem = selector<SubScenarioModel>({
    key: 'calculation__currentSubScenarioItem',
    get: async ({ get }) => {
        const list = get(allSubScenarios);
        const well = get(userWell);

        return find(it => it.id === well?.subScenarioId, list ?? []);
    }
});
