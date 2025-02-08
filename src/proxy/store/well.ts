import { filter, find, flatten, isNil } from 'ramda';
import { selector, selectorFamily } from 'recoil';

import { SubModuleType } from '../../calculation/enums/subModuleType';
import { currentScenarioItem } from '../../calculation/store/currentScenarioId';
import { userWell } from '../../calculation/store/userWell';
import { KeyValue } from '../../common/entities/keyValue';
import { WellBrief } from '../../common/entities/wellBrief';
import { ProxyListWell } from '../../common/entities/wellModel';
import { findOrDefault } from '../../common/helpers/ramda';
import { DirectedStageEnum } from '../enums/directedStageEnum';
import { currentStep } from './currentStep';
import { mapSettingsState } from './map/mapSettings';
import { submoduleState } from './submodule';
import { wellListForResults, wellListState } from './wellList';

export const firstObjectFromList = (list: ProxyListWell[]): WellBrief =>
    findOrDefault(
        x => !!x.productionObjectId,
        x => new WellBrief(x.oilFieldId, null, x.productionObjectId, null, x.scenarioId),
        null,
        list
    );

export const firstObjectWithScenario = (list: ProxyListWell[], objectId: number): WellBrief =>
    findOrDefault(
        x => !!x.productionObjectId && x.productionObjectId === objectId && !!x.scenarioId,
        x => new WellBrief(x.oilFieldId, null, x.productionObjectId, null, x.scenarioId),
        null,
        list
    );

export const firstWellFromList = (list: ProxyListWell[], scenarioId: number = null): WellBrief =>
    findOrDefault(
        x => !!x.productionObjectId && !!x.id && (!scenarioId || x.scenarioId === scenarioId),
        x => new WellBrief(x.oilFieldId, x.id, x.productionObjectId, x.charWorkId, x.scenarioId),
        null,
        list
    );

/**
 * Возвращает текущий отображаемый элемент (месторождение/объект/сценарий/подсценарий/скважина)
 */
export const currentSpot = selector<WellBrief>({
    key: 'proxy__currentSpot',
    get: async ({ get }) => {
        const wellByUser = get(userWell);

        if (wellByUser) {
            return wellByUser;
        }

        // попробовать найти первую скважину в списке
        const list = get(wellListState);

        return firstObjectFromList(list);
    }
});

export const currentWellNames = selector<KeyValue[]>({
    key: 'proxy__names',
    get: ({ get }) => {
        const scenario = get(currentScenarioItem);
        const step = get(currentStep);
        const subModule = get(submoduleState);
        const well = get(currentSpot);
        const wells = subModule === SubModuleType.Calculation ? get(wellListState) : get(wellListForResults);

        const isResults = subModule !== SubModuleType.Calculation;
        const isPreparation = subModule === SubModuleType.Calculation && step === DirectedStageEnum.Preparation;

        let item = null;

        if (subModule === SubModuleType.Calculation) {
            item = find(
                it =>
                    it.oilFieldId === well.oilFieldId &&
                    (it.productionObjectId === well.prodObjId || isNil(well.prodObjId)),
                wells ?? []
            );
        } else {
            item = find(
                it =>
                    it.oilFieldId === well.oilFieldId &&
                    (it.productionObjectId === well.prodObjId || isNil(well.prodObjId)) &&
                    (it.scenarioId === well.scenarioId || isNil(well.scenarioId)) &&
                    (it.id === well.id || isNil(well.id)),
                wells ?? []
            );
        }

        if (isNil(item)) {
            return [];
        }

        return filter(
            it => !isNil(it),
            [
                new KeyValue(item.oilFieldId, item.oilFieldName),
                new KeyValue(item.productionObjectId, item.productionObjectName),
                !isPreparation && scenario?.id ? new KeyValue(scenario.id, scenario.name) : null,
                isResults && well?.id && item?.id ? new KeyValue(item.id, item.name) : null
            ]
        );
    }
});

export const wellNameById = selectorFamily({
    key: 'proxy__wellNameById',
    get:
        (wellId: number) =>
        ({ get }) => {
            const wells = get(wellListState);

            const item = find(it => it.id === wellId && !isNil(it.name), wells ?? []);

            return item?.name;
        }
});

export const wellById = selectorFamily({
    key: 'proxy__wellById',
    get:
        (wellId: number) =>
        ({ get }) => {
            const mapSettings = get(mapSettingsState);

            const concatedPoints = flatten([
                mapSettings.imaginaryPoints,
                mapSettings.drilledPoints,
                mapSettings.currentFundWithImaginary
            ]);

            return find(it => it.id === wellId, concatedPoints ?? []);
        }
});
