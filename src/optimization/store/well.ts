import { filter, find, isNil } from 'ramda';
import { selector, selectorFamily } from 'recoil';

import { SubModuleType } from '../../calculation/enums/subModuleType';
import { currentScenarioItem } from '../../calculation/store/currentScenarioId';
import { currentSubScenarioItem } from '../../calculation/store/currentSubScenarioId';
import { userWell } from '../../calculation/store/userWell';
import { KeyValue } from '../../common/entities/keyValue';
import { WellBrief } from '../../common/entities/wellBrief';
import { firstWellFromList } from '../../prediction/store/well';
import { submoduleState } from './submodule';
import { wellListForResults, wellListState } from './wellList';

/**
 * Возвращает текущий отображаемый элемент (месторождение/объект/сценарий/подсценарий/скважина)
 */
export const currentSpot = selector<WellBrief>({
    key: 'optimization__currentSpot',
    get: ({ get }) => {
        const wellByUser = get(userWell);

        if (wellByUser) {
            return wellByUser;
        }

        // попробовать найти первую скважину в списке
        const list = get(wellListState);

        return firstWellFromList(list);
    }
    /*
    set: ({ get, reset, set }, well: WellBrief) => {
        const listForPreparation = get(wellListState);
        const listForResults = get(wellListForResults);
        const subModule = get(submoduleState);
        const currentStep = get(currentStepState);

        const isCalculation = subModule === SubModuleType.Calculation;
        const list = isCalculation ? listForPreparation : listForResults;
        const route = isCalculation ? RouteEnum.OptimizationPreparation : RouteEnum.OptimizationResults;

        let currentWell = null;

        if (!well) {
            currentWell = isCalculation ? firstScenarioFromList(list) : firstWellFromList(list);
        } else {
            if (isCalculation) {
                if (currentStep === DirectedStageEnum.Calculation && router.containsSubScenario(well, list)) {
                    currentWell = well;
                } else if (router.containsScenario(well, list)) {
                    currentWell = firstScenarioFromList(list, well.scenarioId);
                } else {
                    currentWell = firstScenarioFromList(list);
                }

                reset(proxySharedState);
            } else {
                if (router.containsWellWithSubScenario(well, list) || router.containsSubScenario(well, list)) {
                    currentWell = well;
                } else {
                    currentWell = firstWellFromList(list);
                }

                reset(mapSettingsSelector);
            }
        }

        h.replace(router.to(route, currentWell));
        set(userWell, currentWell);
    }
    */
});

export const currentWellNames = selector<KeyValue[]>({
    key: 'optimization__names',
    get: ({ get }) => {
        const scenario = get(currentScenarioItem);
        const subModule = get(submoduleState);
        const subScenario = get(currentSubScenarioItem);
        const well = get(currentSpot);
        const wells = subModule === SubModuleType.Calculation ? get(wellListState) : get(wellListForResults);

        let obj = null;

        if (subModule === SubModuleType.Calculation) {
            obj = find(
                it =>
                    it.oilFieldId === well.oilFieldId &&
                    (it.productionObjectId === well.prodObjId || isNil(well.prodObjId)),
                wells ?? []
            );
        } else {
            obj = find(
                it =>
                    it.oilFieldId === well.oilFieldId &&
                    (it.productionObjectId === well.prodObjId || isNil(well.prodObjId)) &&
                    (it.scenarioId === well.scenarioId || isNil(well.scenarioId)) &&
                    (it.subScenarioId === well.subScenarioId || isNil(well.subScenarioId)) &&
                    (it.id === well.id || isNil(well.id)),
                wells ?? []
            );
        }

        if (isNil(obj)) {
            return [];
        }

        const isResults = subModule === SubModuleType.Results;

        return filter(
            it => !isNil(it),
            [
                new KeyValue(obj.oilFieldId, obj.oilFieldName),
                new KeyValue(obj.productionObjectId, obj.productionObjectName),
                scenario?.id ? new KeyValue(scenario.id, scenario.name) : null,
                subScenario?.id ? new KeyValue(subScenario.id, subScenario.name) : null,
                isResults && well?.id ? new KeyValue(well.id, obj.name) : null
            ]
        );
    }
});

export const wellNameById = selectorFamily({
    key: 'optimization__wellNameById',
    get:
        (wellId: number) =>
        ({ get }) => {
            const wells = get(wellListState);

            const item = find(it => it.id === wellId && !isNil(it.name), wells ?? []);

            return item?.name;
        }
});
