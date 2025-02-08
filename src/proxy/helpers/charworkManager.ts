import { all, any, append, assoc, isEmpty as isEmptyList, isNil, last, map, reject, sortBy, when } from 'ramda';

import { WellTypeEnum } from '../../common/enums/wellTypeEnum';
import { addDay, equalsTo } from '../../common/helpers/date';
import { ImaginaryCharWorkHistory } from '../entities/proxyMap/wellPoint';

export const sort = (list: ImaginaryCharWorkHistory[]): ImaginaryCharWorkHistory[] => {
    if (!list) {
        return [];
    }

    return sortBy<ImaginaryCharWorkHistory>(x => x.startDate, list);
};

export const add = (list: ImaginaryCharWorkHistory[]): ImaginaryCharWorkHistory[] => {
    const sorted = sort(list);
    return append(
        new ImaginaryCharWorkHistory(
            isEmptyList(sorted) ? new Date() : addDay(new Date(last(sorted).closingDate)),
            null,
            isEmptyList(sorted) ? WellTypeEnum.Oil : last(sorted).type
        ),
        sorted
    );
};

export const isEmpty = (type: ImaginaryCharWorkHistory): boolean =>
    isNil(type) || isNil(type.startDate) || type.type === WellTypeEnum.Unknown;

/**
 * Показывает, может ли новый характер работы быть добавлен к списку, основываясь на существующих в списке характерах
 */
export const couldBeAddedTo = (list: ImaginaryCharWorkHistory[]): boolean =>
    all(type => !isEmpty(type), list || []) && !isNil(last(sort(list)).closingDate);

/**
 * Показывает, может ли новый характер работы быть добавлен к списку после элемента с индексом @param idx
 * @param idx Индекс элемента списка характеров, после которого требуется добавить новый характер работы
 * @param list Список характеров работ
 */
export const couldBeAdded = (idx: number, list: ImaginaryCharWorkHistory[]): boolean => {
    if (!couldBeAddedTo(list)) {
        return false;
    }

    return idx === list.length - 1 || (idx === list.length - 2 && isSolderedWithNext(idx, list));
};

export const removeEmptyFrom = (list: ImaginaryCharWorkHistory[]): ImaginaryCharWorkHistory[] =>
    reject(isEmpty, list || []);

export const solder = (
    closingDate: Date,
    source: ImaginaryCharWorkHistory,
    list: ImaginaryCharWorkHistory[]
): ImaginaryCharWorkHistory[] => {
    const soldered = new ImaginaryCharWorkHistory(source.startDate, closingDate, source.type);

    if (any(it => equalsTo(it.startDate, source.startDate) && it.type === source.type && it.isImaginary, list)) {
        // удалить виртуальный характер работы если он совпадает с реальным характером работы
        if (isNil(closingDate)) {
            list = reject((it: ImaginaryCharWorkHistory) => eq(it, soldered), list);
        }

        return map(
            when(cw => eq(cw, soldered), assoc('closingDate', closingDate)),
            list
        );
    }

    return append(soldered, list);
};

export const areSoldered = (real: ImaginaryCharWorkHistory, virtual: ImaginaryCharWorkHistory): boolean =>
    equalsTo(real.startDate, virtual.startDate) &&
    real.type === virtual.type &&
    !real.alreadyClosed &&
    !real.isImaginary &&
    virtual.isImaginary;

export const isSolderedWithNext = (idx: number, list: ImaginaryCharWorkHistory[]): boolean => {
    if (!list || idx >= list.length - 1 || list.length === 1) {
        return false;
    }

    return areSoldered(list[idx], list[idx + 1]);
};

export const isSolderedWithPrev = (idx: number, list: ImaginaryCharWorkHistory[]): boolean => {
    if (!list || idx === 0 || list.length === 1) {
        return false;
    }

    return areSoldered(list[idx - 1], list[idx]);
};

export const eq = (a: ImaginaryCharWorkHistory, b: ImaginaryCharWorkHistory): boolean =>
    ((isNil(a.startDate) && isNil(b.startDate)) || equalsTo(a.startDate, b.startDate)) &&
    a.type === b.type &&
    a.isImaginary === b.isImaginary;

export const lastNonClosedReal = (idx: number, list: ImaginaryCharWorkHistory[]): boolean =>
    !list[idx].isImaginary && isNil(list[idx].closingDate);
