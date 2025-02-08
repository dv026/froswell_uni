import {
    any,
    concat,
    eqBy,
    filter,
    find,
    forEach,
    head,
    isEmpty,
    isNil,
    join,
    last,
    pipe,
    propEq,
    reject,
    sortBy
} from 'ramda';

import { WellGroup } from '../entities/mapCanvas/wellGroup';
import { isNullOrEmpty, sortAsc } from './ramda';

export const emptyGroup = (): WellGroup => ({
    id: 0,
    wells: [],
    inAdd: true,
    isCalcGroup: false,
    polygon: []
});

/**
 * Возвращает отсортированный по возрастанию id список групп указанного типа
 * @param isCalc - true: расчетные группы, false: порядковые группы
 * @param groups - список всех групп (и расчетных и порядковых)
 */
export const sort = (isCalc: boolean, groups: WellGroup[]): WellGroup[] =>
    pipe(
        filter(propEq('isCalcGroup', isCalc)),
        (x: WellGroup[]) => (isNullOrEmpty(x) ? [emptyGroup()] : x),
        sortBy(x => x.id)
    )(groups || []);

export const remove = (id: number, groups: WellGroup[]): WellGroup[] =>
    find(propEq<string>('id', id), groups).isCalcGroup ? removeCalcGroup(id, groups) : removeOrderGroup(id, groups);

const lastGroup = (isCalc: boolean, groups: WellGroup[]) =>
    pipe(
        x => sort(isCalc, x),
        x => (isCalc ? head(x) : last(x))
    )(groups);

export const lastOrderGroupId = (groups: WellGroup[]): number => lastGroup(false, groups).id;
export const nextId = (isCalc: boolean, groups: WellGroup[]): number =>
    pipe(
        x => lastGroup(isCalc, x),
        x => next(x.id, isCalc)
    )(groups);

const next = (currentId: number, isCalc: boolean) => (isCalc ? currentId - 1 : currentId + 1);

export const calcGroups = (groups: WellGroup[]): WellGroup[] =>
    filter(x => x.isCalcGroup && !isEmpty(x.polygon), groups);
export const orderGroups = (groups: WellGroup[]): WellGroup[] =>
    filter(x => !x.isCalcGroup && !isEmpty(x.polygon), groups);

export const reapplyOrderIds = (id: number, groups: WellGroup[]): WellGroup[] =>
    forEach((x: WellGroup) => {
        x.id = x.id < id ? x.id : x.id - 1;
    })(orderGroups(groups));

export const reapplyCalcIds = (id: number, groups: WellGroup[]): WellGroup[] =>
    forEach((x: WellGroup) => {
        x.id = x.id > id ? x.id : x.id + 1;
    })(calcGroups(groups));

const removeCalcGroup = (id: number, groups: WellGroup[]): WellGroup[] =>
    pipe(
        reject<WellGroup>(x => x.id === id),
        sortBy(x => x.id),
        x => concat(orderGroups(x), reapplyCalcIds(id, x))
    )(groups);

const removeOrderGroup = (id: number, groups: WellGroup[]): WellGroup[] =>
    pipe(
        reject<WellGroup>(x => x.id === id),
        sortBy(x => x.id),
        x => concat(calcGroups(x), reapplyOrderIds(id, x))
    )(groups);

/**
 * Создается уникальный хэш для группы по скважинам, включенным в группу. Уникальность среди групп разных
 * пластов не гарантируется.
 * @param x Группа скважин
 */
const groupHash = (x: WellGroup): string => pipe(sortAsc, join(''))(x?.wells || []);

/**
 * Возвращает результат сравнения двух групп по их хэшам
 */
const groupsAreEqual = (a: WellGroup, b: WellGroup) => eqBy(groupHash, a, b);

/**
 * Проверяет наличие группы в списке групп
 * @param group группа скважин
 * @param groups список групп
 */
export const groupExists = (group: WellGroup, groups: WellGroup[]): boolean =>
    any(x => groupsAreEqual(group, x), groups);

export const anyGroup = (groups: WellGroup[]): boolean => calcGroupExists(groups) || ordinalGroupExists(groups);

export const calcGroupExists = (groups: WellGroup[]): boolean =>
    !isNil(calcGroup(groups)) && !isNil(calcGroup(groups).polygon);
export const ordinalGroupExists = (groups: WellGroup[]): boolean =>
    !isNil(ordinalGroup(groups)) && !isNil(ordinalGroup(groups));

export const calcGroup = (groups: WellGroup[]): WellGroup => head(calcGroups(groups));
export const ordinalGroup = (groups: WellGroup[]): WellGroup => head(orderGroups(groups));
