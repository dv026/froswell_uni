import * as R from 'ramda';

import { WellBrief } from '../../entities/wellBrief';
import { PredictionListWell } from '../../entities/wellModel';
import { isCorrectNumber } from '../ramda';
import { makeQueryFromWell } from './query';

const urlWellParam = (well: WellBrief) => makeQueryFromWell(well);

export const to = (route: string, well: WellBrief): string => {
    return `${route}${urlWellParam(well)}`;
};

/**
 * Возвращает текущую скважину в том случае, если она есть в списке. В противном случае создается новая скважина
 * из первого элемента списка
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const wellToGo = (well: WellBrief, list: PredictionListWell[]): WellBrief =>
    R.cond([
        [(x: PredictionListWell[]) => containsWellWithSubScenario(well, x), R.always(well)],
        [() => hasWellParam(well), (x: PredictionListWell[]) => makeWellToGo(well, x)],
        [R.T, (x: PredictionListWell[]) => makeSubScenarioToGo(well, x)]
    ])(list);

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWell = (well: WellBrief, list: PredictionListWell[]): boolean =>
    R.any<PredictionListWell>(
        x => x.oilFieldId === well.oilFieldId && x.id === well.id && x.productionObjectId === well.prodObjId
    )(list || []);

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWellWithScenario = (well: WellBrief, list: PredictionListWell[]): boolean =>
    R.any<PredictionListWell>(
        x =>
            x.oilFieldId === well.oilFieldId &&
            x.id === well.id &&
            x.productionObjectId === well.prodObjId &&
            x.scenarioId === well.scenarioId
    )(list || []);

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWellWithSubScenario = (well: WellBrief, list: PredictionListWell[]): boolean =>
    R.any<PredictionListWell>(
        x =>
            x.oilFieldId === well.oilFieldId &&
            x.id === well.id &&
            x.productionObjectId === well.prodObjId &&
            x.scenarioId === well.scenarioId &&
            x.subScenarioId === well.subScenarioId
    )(list || []);

/**
 * Проверяет наличие сценария в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsScenario = (well: WellBrief, list: PredictionListWell[]): boolean =>
    R.any<PredictionListWell>(
        x =>
            x.oilFieldId === well.oilFieldId &&
            x.productionObjectId === well.prodObjId &&
            x.scenarioId === well.scenarioId
    )(list || []);

/**
 * Проверяет наличие сценария и подценария в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsSubScenario = (well: WellBrief, list: PredictionListWell[]): boolean =>
    R.any<PredictionListWell>(
        x =>
            x.oilFieldId === well.oilFieldId &&
            x.productionObjectId === well.prodObjId &&
            x.scenarioId === well.scenarioId &&
            x.subScenarioId === well.subScenarioId
    )(list || []);

/**
 * Проверяет наличие запрашиваемого объекта в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsProductionObject = (well: WellBrief, list: PredictionListWell[]): boolean => {
    if (!well) {
        return false;
    }

    return R.any<PredictionListWell>(x => x.oilFieldId === well.oilFieldId && x.productionObjectId === well.prodObjId)(
        list || []
    );
};

const hasScenarioParam = (x: WellBrief) => !!x.scenarioId;
const hasSubScenarioParam = (x: WellBrief) => !!x.subScenarioId;
const hasWellParam = (x: WellBrief) => !!x.id;

const numOrTrue = (x, n) => (isCorrectNumber(x) ? R.equals(+x, n) : true);
const makeWellToGo = (well: WellBrief, list: PredictionListWell[]): WellBrief => {
    let firstWell = R.find(
        x =>
            x.id === well.id &&
            numOrTrue(well.scenarioId, x.scenarioId) &&
            numOrTrue(well.subScenarioId, x.subScenarioId),
        list
    );
    if (firstWell) {
        return new WellBrief(
            firstWell.oilFieldId,
            firstWell.id,
            firstWell.productionObjectId,
            firstWell.charWorkId,
            firstWell.scenarioId,
            firstWell.subScenarioId
        );
    }

    // не было найдено ни одной скважины по id. Проверить наличие параметра подсценария
    if (hasSubScenarioParam(well)) {
        firstWell = R.find(x => x.subScenarioId === well.subScenarioId, list);
        if (firstWell) {
            return new WellBrief(
                firstWell.oilFieldId,
                firstWell.id,
                firstWell.productionObjectId,
                null,
                firstWell.scenarioId,
                firstWell.subScenarioId
            );
        }
    }

    // не было найдено ни одной скважины по id. Проверить наличие параметра сценария
    if (hasScenarioParam(well)) {
        // параметр сценария есть -> попытаться найти первую скважину для этого сценария в списке
        firstWell = R.find(x => x.scenarioId === well.scenarioId, list);
        if (firstWell) {
            return new WellBrief(
                firstWell.oilFieldId,
                firstWell.id,
                firstWell.productionObjectId,
                null,
                firstWell.scenarioId,
                firstWell.subScenarioId
            );
        }
    }

    // не было найдено ни одной скважины по подсценарию в параметрах. Перейти на первый подсценарий в списке
    const first = R.head(list);
    return new WellBrief(first.oilFieldId, null, first.productionObjectId, null, first.scenarioId, first.subScenarioId);
};

const makeSubScenarioToGo = (well: WellBrief, list: PredictionListWell[]): WellBrief => {
    if (
        R.any(
            x =>
                x.oilFieldId === well.oilFieldId &&
                x.productionObjectId === well.prodObjId &&
                x.scenarioId === well.scenarioId &&
                x.subScenarioId === well.subScenarioId,
            list
        )
    ) {
        return new WellBrief(
            well.oilFieldId,
            null,
            well.prodObjId,
            well.charWorkId,
            well.scenarioId,
            well.subScenarioId
        );
    }

    let first =
        R.find(
            x =>
                x.oilFieldId === well.oilFieldId &&
                x.productionObjectId === well.prodObjId &&
                x.scenarioId === well.scenarioId &&
                x.subScenarioId === well.subScenarioId,
            list
        ) ||
        R.find(x => x.oilFieldId === well.oilFieldId && x.productionObjectId === well.prodObjId, list) ||
        R.find(x => x.oilFieldId === well.oilFieldId, list) ||
        R.head(list);
    return new WellBrief(
        first.oilFieldId,
        null,
        first.productionObjectId,
        null,
        first.scenarioId,
        first.subScenarioId !== null && first.subScenarioId !== 0 ? first.subScenarioId : well.subScenarioId
    );
};
