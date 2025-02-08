import * as R from 'ramda';

import { WellBrief } from '../../entities/wellBrief';
import { ProxyListWell } from '../../entities/wellModel';
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
export const wellToGo = (well: WellBrief, list: ProxyListWell[]): WellBrief =>
    R.cond([
        [(x: ProxyListWell[]) => containsWellWithScenario(well, x), R.always(well)],
        [() => hasWellParam(well), (x: ProxyListWell[]) => makeWellToGo(well, x)],
        [R.T, (x: ProxyListWell[]) => makeObjectToGo(well, x)]
    ])(list);

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWell = (well: WellBrief, list: ProxyListWell[]): boolean => {
    if (!well) {
        return false;
    }

    return R.any<ProxyListWell>(
        x => x.oilFieldId === well.oilFieldId && x.id === well.id && x.productionObjectId === well.prodObjId
    )(list || []);
};

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWellWithScenario = (well: WellBrief, list: ProxyListWell[]): boolean => {
    if (!well) {
        return false;
    }

    return R.any<ProxyListWell>(
        x =>
            x.oilFieldId === well.oilFieldId &&
            x.id === well.id &&
            x.productionObjectId === well.prodObjId &&
            x.scenarioId === well.scenarioId
    )(list || []);
};

/**
 * Проверяет наличие запрашиваемого в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsScenario = (well: WellBrief, list: ProxyListWell[]): boolean => {
    if (!well) {
        return false;
    }

    return R.any<ProxyListWell>(x => x.scenarioId === well.scenarioId)(list || []);
};

/**
 * Проверяет наличие запрашиваемого объекта в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsProductionObject = (well: WellBrief, list: ProxyListWell[]): boolean => {
    if (!well) {
        return false;
    }

    return R.any<ProxyListWell>(x => x.oilFieldId === well.oilFieldId && x.productionObjectId === well.prodObjId)(
        list || []
    );
};

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWellWithSubScenario = (well: WellBrief, list: ProxyListWell[]): boolean =>
    R.any<ProxyListWell>(
        x =>
            x.oilFieldId === well.oilFieldId &&
            x.id === well.id &&
            x.productionObjectId === well.prodObjId &&
            x.scenarioId === well.scenarioId
    )(list || []);

const hasScenarioParam = (x: WellBrief) => !!x.scenarioId;
const hasWellParam = (x: WellBrief) => !!x.id;

const makeWellToGo = (well: WellBrief, list: ProxyListWell[]): WellBrief => {
    let firstWell = R.find(x => x.id === well.id, list);
    if (firstWell) {
        return new WellBrief(
            firstWell.oilFieldId,
            firstWell.id,
            firstWell.productionObjectId,
            null,
            firstWell.scenarioId
        );
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
                firstWell.scenarioId
            );
        }
    }

    // не было найдено ни одной скважины по сценарию в параметрах. Перейти на первый объект разработки
    return new WellBrief(well.oilFieldId, null, well.prodObjId, null, null);
};

const makeObjectToGo = (well: WellBrief, list: ProxyListWell[]): WellBrief => {
    if (R.any(x => x.productionObjectId === well.prodObjId, list)) {
        return new WellBrief(well.oilFieldId, null, well.prodObjId, null, null);
    }

    // не был найден объект разработки -> попытаться найти первый объект разработки для этого месторождения в списке
    let first = R.find(x => x.oilFieldId === well.oilFieldId, list);
    if (first) {
        return new WellBrief(first.oilFieldId, null, first.productionObjectId, null, null);
    }

    // не было найдено ни одного объекта разработки для этого месторожения. Выбрать самое первое в списке
    first = R.head(list);
    return new WellBrief(first.oilFieldId, null, first.productionObjectId, null, null);
};
