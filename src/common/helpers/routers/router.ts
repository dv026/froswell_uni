// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as R from 'ramda';

import { WellBrief } from '../../entities/wellBrief';
import { WellModel } from '../../entities/wellModel';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { findOrDefault, isNullOrEmpty } from '../ramda';
import { makeQueryFromWell } from './query';

const urlWellParam = (well: WellBrief): string => makeQueryFromWell(well);

export const to = (route: string, well: WellBrief): string => {
    return `${route}${urlWellParam(well)}`;
};

/**
 * Возвращает текущую скважину в том случае, если она есть в списке. В противном случае создается новая скважина
 * из первого элемента списка
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const wellToGo = (well: WellBrief, list: any[]): WellBrief =>
    R.cond([
        [x => containsWell(well, x) || (containsProductionObject(well, x) && R.isNil(well.id)), R.always(well)],
        [x => containsWellWithoutCharwork(well, x), x => appendCharwork(well, x)],
        [
            R.T,
            x =>
                makeWellBrief(
                    firstByProdObjOrNull(well.prodObjId, x) ||
                        firstByOilfieldOrNull(well.oilFieldId, x) ||
                        firstByList(x)
                )
        ]
    ])(list);

/**
 * Возвращает текущую объект в том случае, если она есть в списке. В противном случае первый объект из списква
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const productionObjectToGo = (well: WellBrief, list: any[]): WellBrief =>
    R.cond([
        [(x: any) => containsProductionObject(well, x), R.always(well)],
        [R.T, (x: any) => makeWellBrief(firstByProdObjOrNull(well.prodObjId, x) || firstByList(x))]
    ])(list);

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWell = (well: WellBrief, list: any[]): boolean => {
    if (!well) {
        return false;
    }

    return R.any(
        (x: any) => x.oilFieldId === well.oilFieldId && x.id === well.id && x.productionObjectId === well.prodObjId
        //x.charWorkId === well.charWorkId
    )(list || []);
};

/**
 * Проверяет наличие скважины в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsWellWithoutCharwork = (well: WellBrief, list: any[]): boolean =>
    R.any((x: any) => x.oilFieldId === well.oilFieldId && x.id === well.id && x.productionObjectId === well.prodObjId)(
        list || []
    );

/**
 * Проверяет наличие запрашиваемого в списке
 * @param well  текущая скважина по url
 * @param list  Список скважин с сервера
 */
export const containsProductionObject = (well: WellBrief, list: any[]): boolean =>
    R.any((x: any) => x.oilFieldId === well.oilFieldId && x.productionObjectId === well.prodObjId)(list || []);

export const containsOilfield = (well: WellBrief, list: any[]): boolean =>
    R.any((x: any) => x.oilFieldId === well.oilFieldId)(list || []);

/**
 * Возвращает первую скважину из списка, у которой есть объект разработки с идентификатором искомого объекта разработки.
 * Если такая скважина не найдена, возвращается null
 * @param id    Идентификатор искомого объекта разработки
 * @param list  Список скважин с сервера
 */
const firstByProdObjOrNull = (id: number, list: any[]): boolean =>
    findOrDefault<any, any>(
        x => x.productionObjectId === id,
        x => x,
        null,
        list
    );

/**
 * Возвращает первую скважину из списка, у которой есть объект разработки с идентификатором искомого месторождения.
 * Если такая скважина не найдена, возвращается null
 * @param id    Идентификатор искомого месторождения
 * @param list  Список скважин с сервера
 */
const firstByOilfieldOrNull = (id: number, list: []): boolean =>
    findOrDefault<any, any>(
        x => x.productionObjectId === id,
        x => x,
        null,
        list
    );

/**
 * Возвращает первую скважину из списка
 * Если список пуст или не определен, генерируется исключение
 * @param list  Список скважин с сервера
 */
const firstByList = (list: []) => {
    if (isNullOrEmpty(list)) {
        throw new Error("List doesn't contain any element");
    }

    return R.head(list);
};

/**
 * Возвращает скважину WellBrief на основании элемента списка
 * @param list  Элемент списка скважин с сервера
 */
const makeWellBrief = (listItem: any): WellBrief =>
    new WellBrief(listItem.oilFieldId, listItem.id, listItem.productionObjectId, listItem.charWorkId);

const stubWithCharwork: WellModel = { charWorkId: WellTypeEnum.Unknown } as WellModel;
const appendCharwork = (well: WellBrief, list: WellModel[]): WellBrief =>
    new WellBrief(
        well.oilFieldId,
        well.id,
        well.prodObjId,
        (
            R.find(
                x => x.oilFieldId === well.oilFieldId && x.productionObjectId === well.prodObjId && x.id === well.id,
                list
            ) ?? stubWithCharwork
        ).charWorkId,
        null
    );
