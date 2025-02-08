import {
    any,
    append,
    concat,
    dropLast,
    eqBy,
    equals,
    filter,
    find,
    head,
    isNil,
    join,
    pipe,
    reject,
    split
} from 'ramda';

import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { Nullable } from '../../../../common/helpers/types';

export const modeName = (type: string, plastId?: number, neighborId?: number): string =>
    pipe(reject(isNil), joinWithSep)([type, !!plastId ? plastId : !!neighborId ? emptyPart : null, neighborId]);

const separator = '-';
const splitBySep = split(separator);
const joinWithSep = join(separator);
const emptyPart = '_';

export const parseName = (name: string): string[] => splitBySep(name);

export const type = (name: string): Nullable<string> => (name ? parseName(name)[0] : null);

export const neighborId = (name: string): number => (!!name ? parseId(parseName(name)[2]) : null);

export const plastId = (name: string): number => (!!name ? parseId(parseName(name)[1]) : null);

export const typeId = (name: string): string => (!!name ? parseName(name)[0] : null);

export const withNeighbor = (name: string): Nullable<boolean> => (!!name ? neighborId(name) > 0 : null);

export const changeNeighbor = (name: string, newNeighborPlastId: number, newNeighborId: number): string =>
    pipe(
        splitBySep,
        removeNeighborId,
        removePlastId,
        appendPlastId(newNeighborPlastId ? newNeighborPlastId.toString() : emptyPart),
        appendNeighborId(newNeighborId.toString()),
        joinWithSep
    )(name);

export const changePlast = (name: string, newPlastId: number): string =>
    pipe(splitBySep, removePlastId, appendPlastId(newPlastId.toString()), joinWithSep)(name);

export const withPlast = (name: string): boolean => !!plastId(name);

export const findNewMode = (
    paramId: string,
    // neighbors: [number, number][],
    // plastIds: number[],
    allModes: string[]
): string => {
    // нет ни одного доступного режима
    if (isNullOrEmpty(allModes)) {
        return null;
    }

    if (any(equals(paramId), allModes)) {
        // режим с таким же названием существует -> оставить как есть
        return paramId;
    }

    const sameType = filter(eqBy(typeId, paramId), allModes || []);

    // текущий режим отсутствует -> невозможно определить его параметры
    // режим текущего типа отсутствует -> невозможно перейти на режим такого же типа
    if (isNullOrEmpty(paramId) || isNullOrEmpty(sameType)) {
        return head(allModes);
    }

    if (withNeighbor(paramId)) {
        if (isNullOrEmpty(sameType)) {
            // нет ни одного соседа такого же типа
            return head(allModes);
        }

        const firstSameType = find(x => withNeighbor(x), sameType);

        // соседней скважины нет -> заменить на первого соседа из списка
        return !!firstSameType
            ? changeNeighbor(paramId, plastId(firstSameType), neighborId(firstSameType))
            : sameType[0];
    }

    if (withPlast(paramId)) {
        if (isNullOrEmpty(sameType)) {
            // нет ни одного пласта такого же типа
            return head(allModes);
        }

        const firstSamePlast = find(x => withPlast(x), sameType);
        return !!firstSamePlast ? changePlast(paramId, plastId(firstSamePlast)) : sameType[0];
    }

    return paramId;
};

const parseId = (idPart: string) => {
    const id = +idPart;
    return Number.isFinite(id) ? id : null;
};

const removeNeighborId = (splitted: string[]) => (splitted && splitted.length === 3 ? dropLast(1, splitted) : splitted);

const appendNeighborId = (newId: string) => (splitted: string[]) =>
    splitted.length > 2
        ? splitted
        : splitted.length === 2
        ? append(newId, splitted)
        : splitted.length === 1
        ? concat(splitted, [emptyPart, newId])
        : [emptyPart, emptyPart, newId];

const removePlastId = (splitted: string[]) => (splitted && splitted.length === 2 ? dropLast(1, splitted) : splitted);
const appendPlastId = (newId: string) => (splitted: string[]) =>
    splitted.length > 1 ? splitted : splitted.length === 1 ? append(newId, splitted) : [emptyPart, newId];
