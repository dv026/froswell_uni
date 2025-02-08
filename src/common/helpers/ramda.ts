import * as R from 'ramda';
import {
    append,
    curry,
    either,
    F,
    ifElse,
    includes,
    is,
    isEmpty,
    isNil,
    map,
    pipe,
    reject,
    when,
    without
} from 'ramda';

import { Nilable, Nullable } from './types';

/**
 * Функция, возвращающая принимаемое значение
 * Например:
 *      fnAsIs(1) = 1
 *      fnAsIs('abc') = 'abc'
 *      fnAsIs(undefined) = undefined
 * @param x значение
 */
export function fnAsIs<T>(x: T): T {
    return x;
}

/**
 * Проверяет, является ли получаемый на входе объект функцией
 * @param obj любой объект
 */
export const isFn = (obj: unknown): boolean => obj && R.equals(typeof obj, 'function');

// TODO: разобраться с типизацией
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const elseNull = (condition: R.Pred, onTrue: R.Arity1Fn, x: unknown) =>
    R.ifElse(condition, onTrue, R.always(null))(x);

export function constElseNull<T, U>(condition: (x: U) => boolean, trueValue: T, x: U): Nullable<T> {
    return R.ifElse(condition, R.always(trueValue), R.always(null))(x);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function trueOrNull<T>(cond: boolean, val: T) {
    return elseNull(isTruthy, R.always(val), cond);
}

/**
 * Проверяет, не является ли получаемый на входе объект функцией
 * Например:
 *      notFn('a') = true
 *      notFn(Math.min) = false
 *      notFn(undefined) = true
 * @param obj любой объект
 */
export const notFn = (obj: unknown): boolean => !isFn(obj);

export const add = (x: number, y: number): number => x + y;

export const isFalsy = (x: unknown): boolean => !x;
export const isTruthy = (x: unknown): boolean => !!x;

export const isNullOrEmpty = (list: string | unknown[] | ReadonlyArray<unknown>): boolean =>
    R.either(R.isNil, R.isEmpty)(list);

export const slashOrEmpty = (value: Nilable<string>): string => (value ? '/' + value : '');
export const slashOrNull = (value: Nilable<string>): string => (value ? '/' + value : '/null');

/**
 * Возвращает значение из первого элемента списка, если список определен и не пуст. В противном случае возвращается
 * значение по умолчанию
 * @param seeker        Функция, обеспечивающая поиск по элементам списка по заданному критерию
 * @param getter        Функция, возвращающая значение из первого элемента списка, удовлетворяющего критерию seeker
 * @param defaultValue  Значение по умолчанию
 * @param list          Список, по которому идется поиск
 */
export function findOrDefault<T, P>(seeker: (x: T) => boolean, getter: (x: T) => P, defaultValue: P, list: T[]): P {
    return R.ifElse(
        R.any<T>(seeker), // проверить наличие элемента в списке по условию seeker
        x => getter(R.find<T>(seeker, x)), // элемент найден:    получить свойство элемента по условию getter
        R.always(defaultValue) // элемент не найден: вернуть значение по умолчанию
    )(list || []); // избежать исключения, если список falsy
}

/**
 * Возвращает первый элемент списка, если он определен и не пуст. В противном случае возвращается значение по умолчанию
 * @param defaultValue  Значение по умолчанию
 * @param list          Список, по которому идется поиск
 */
export function headOrDefault<T>(defaultValue: T, list: T[]): T {
    return R.ifElse(isNullOrEmpty, R.always(defaultValue), R.head)(list) as T;
}

export const mapIndexed = R.addIndex(R.map);
export const forEachIndexed = R.addIndex(R.forEach);

/**
 * Функция, всегда возвращающая null
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const nul = () => null;

/**
 * Функция, всегда возвращающая undefined
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const undef = () => undefined;

/**
 * Функция no operation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-module-boundary-types
export const noop = () => {};

/**
 * Функция, возвращающая пустое, nil, значение
 * @param returnUndefined если true - возвращает undefined, в противном случае возвращает null
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const nil = (returnUndefined: boolean = false) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return R.ifElse(R.equals(R.T), undef, nul)(returnUndefined);
};

export function stringProp<T>(key: keyof T): (x: T) => string {
    return (x: T) => R.prop(key, x)?.toString();
}

export function groupByProp<T>(key: keyof T, list: ReadonlyArray<T>): { [index: string]: T[] } {
    return R.groupBy<T>(stringProp(key))(list);
}

export const groupsOf = R.curry(function group(n, list) {
    return R.isEmpty(list) ? [] : R.prepend(R.take(n, list), group(n, R.drop(n, list)));
});

// eslint-disable-next-line @typescript-eslint/ban-types
export function shallow<T extends object>(base: T, mixture: Partial<T>): T {
    return R.mergeRight<T, Partial<T>>(base, mixture) as T;
}

export const isCorrectNumber = (x: unknown): boolean => !R.isNil(x) && !isNaN(+x) && isFinite(+x);

/**
 * Возвращает сумму по списку
 * @param predicate функция-предикат, возвращающая число из элемента списка
 * @param list список
 */
export function sumBy<T>(predicate: (x: T) => number, list: T[]): number {
    return R.reduce((acc, x) => acc + execPredicateSafe(predicate, x), 0, R.reject<T>(R.isNil)(list || []));
}

function execPredicateSafe<T>(predicate: (x: T) => number, obj: T): number {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return R.pipe(
        predicate,
        R.ifElse(Number.isFinite, fnAsIs, R.always(0)) // если результат не число, вернуть 0 по умолчанию
    )(obj);
}

/**
 * Сортирует список чисел по возрастанию
 * @param x Массив чисел
 */
export const sortAsc = (x: number[]): number[] => R.sort((x: number, y: number) => x - y, x);

// TODO: remove, replace usages with R.mean
// export const average = R.converge(R.divide, [R.sum, R.length]);

export const toggleListItem = curry((value, list) => ifElse(includes(value), without([value]), append(value))(list));

export const removeNulls = pipe(
    map(when(is(Object), v => removeNulls(v))),
    reject(ifElse(is(String), F, either(isEmpty, isNil)))
);
