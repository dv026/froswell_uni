import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { SubModuleType } from '../../calculation/enums/subModuleType';
import { proxySharedState } from '../../calculation/store/sharedCalculation';
import { userWell } from '../../calculation/store/userWell';
import { WellBrief } from '../../common/entities/wellBrief';
import { shallowEqual } from '../../common/helpers/compare';
import * as router from '../../common/helpers/routers/predictionRouter';
import { DirectedStageEnum } from '../enums/directedStageEnum';
import { mapSettingsSelector } from '../subModules/results/store/mapSettings';
import { selectedWellsState } from '../subModules/results/store/selectedWells';
import { currentStepState } from './currentStep';
import { submoduleState } from './submodule';
import { firstScenarioFromList, firstSubScenarioFromList, firstWellFromList } from './well';
import { wellListForEfficiency, wellListForResults, wellListState } from './wellList';

export function useWellMutations() {
    const navigate = useNavigate();
    const location = useLocation();

    const set = useRecoilCallback(({ snapshot, set, reset }) => async (well: WellBrief) => {
        const oldWell = await snapshot.getPromise(userWell);
        const subModule = await snapshot.getPromise(submoduleState);
        const step = await snapshot.getPromise(currentStepState);

        let currentWell = null;

        if (!well) {
            if (subModule === SubModuleType.Calculation) {
                const list = await snapshot.getPromise(wellListState);
                currentWell = firstScenarioFromList(list);
            } else if (subModule === SubModuleType.Results) {
                const list = await snapshot.getPromise(wellListForResults);
                currentWell = firstWellFromList(list);
            } else if (subModule === SubModuleType.Efficiency) {
                const list = await snapshot.getPromise(wellListForEfficiency);
                currentWell = firstWellFromList(list);
            }
        } else {
            if (subModule === SubModuleType.Calculation) {
                const list = await snapshot.getPromise(wellListState);

                if (step === DirectedStageEnum.Calculation && router.containsSubScenario(well, list)) {
                    currentWell = well;
                } else if (router.containsScenario(well, list)) {
                    currentWell = firstScenarioFromList(list, well.scenarioId);
                } else {
                    currentWell = firstScenarioFromList(list);
                }

                reset(proxySharedState);
            } else if (subModule === SubModuleType.Results) {
                const list = await snapshot.getPromise(wellListForResults);

                if (
                    router.containsWellWithSubScenario(well, list) ||
                    router.containsWellWithScenario(well, list) ||
                    router.containsSubScenario(well, list)
                ) {
                    currentWell = well;
                } else if (router.containsScenario(well, list)) {
                    currentWell = firstSubScenarioFromList(list, well.scenarioId);
                    if (!currentWell) {
                        currentWell = firstScenarioFromList(list, well.scenarioId);
                    }
                } else {
                    currentWell = firstWellFromList(list);
                }

                reset(mapSettingsSelector);
            } else if (subModule === SubModuleType.Efficiency) {
                const list = await snapshot.getPromise(wellListForEfficiency);

                if (router.containsWellWithSubScenario(well, list)) {
                    currentWell = new WellBrief(
                        well.oilFieldId,
                        well.id,
                        well.prodObjId,
                        well.charWorkId,
                        well.scenarioId,
                        well.subScenarioId
                    );
                } else if (well.scenarioId) {
                    currentWell = firstWellFromList(list, well.scenarioId);
                } else {
                    currentWell = firstWellFromList(list);
                }

                reset(mapSettingsSelector);
            }
        }

        reset(selectedWellsState);

        if (!shallowEqual(oldWell, currentWell)) {
            navigate(router.to(location.pathname, currentWell));

            set(userWell, currentWell);
        }
    });

    return {
        set
    };
}
