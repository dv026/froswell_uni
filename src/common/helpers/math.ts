import { both, equals, lt, pipe, reduce, repeat, sort, min as minR, max as maxR } from 'ramda';

const coeff = (x: number): number => reduce<number, number>((a, b) => a * b, 1, repeat(10, x));

export const NV = 1.70141e10;

/**
 * Возвращает округленное значение
 * Наример:
 *      round(1.123, 2) = 1.12
 * @param x значение
 * @param digits количество знаков после запятой
 */
export const round = (x: number, digits: number): number => Math.round(x * coeff(digits)) / coeff(digits);
export const round0 = (x: number): number => round(x, 0);
export const round1 = (x: number): number => round(x, 1);
export const round2 = (x: number): number => round(x, 2);
export const round3 = (x: number): number => round(x, 3);
export const round4 = (x: number): number => round(x, 4);
export const round5 = (x: number): number => round(x, 5);

/**
 * Возвращает округленное значение до десятков/сотен/...
 * Наример:
 *      round10(127) = 130
 * @param x значение
 */
export const round10 = (x: number): number => Math.round(x * 100) / 100;
export const round100 = (x: number): number => Math.round(x * 100) / 100;

/**
 * Возвращает округленное(в нижную сторону) значение до десятков
 * Наример:
 *      ceil10(127) = 120
 * @param x значение
 */
export const ceil10 = (x: number): number => Math.ceil(x / 10) * 10;
export const ceil50 = (x: number): number => Math.ceil(x / 50) * 50;
export const ceil100 = (x: number): number => Math.ceil(x / 100) * 100;

export const limitTop = (max: number, val: number): number => (max > val ? val : max);
export const limitBottom = (min: number, val: number): number => (min < val ? val : min);
export const limit = (min: number, max: number, val: number): number =>
    pipe(
        (x: number) => limitBottom(min, x),
        (x: number) => limitTop(max, x)
    )(val);

const diff = (x, y) => x - y;
export const asc = (x: number[]): number[] => sort(diff, x);

export const isNatural = (x: number): boolean =>
    both(
        (x: number) => lt(0, x),
        (x: number) => equals(Math.floor(x), x)
    )(x);

/**
 * Возвращает квантиль p50 от списка значений
 * @param values список значений
 */
export const p50 = (values: Array<number>): number => {
    // TODO: сделать обработку ошибка и вывод предупреждений
    return asc(values)[Math.round(values.length / 2) - 1];
};

/**
 * Возвращает квантиль p10 от списка значений
 * @param values cписок значений
 */
export const p10 = (values: Array<number>): number => {
    const idx = Math.round(values.length / 10);

    // TODO: сделать обработку ошибка и вывод предупреждений
    return asc(values)[idx];
};

/**
 * Возвращает квантиль p90 от списка значений
 * @param values cписок значений
 */
export const p90 = (values: Array<number>): number => {
    const idx = values.length - 1 - Math.round(values.length / 10);

    // TODO: сделать обработку ошибка и вывод предупреждений
    return asc(values)[idx];
};

export enum QuantileType {
    P10 = 'p10',
    P50 = 'p50',
    P90 = 'p90'
}

export const getQuantile = (type: QuantileType): ((x: number[]) => number) =>
    type === QuantileType.P10 ? p10 : type === QuantileType.P90 ? p90 : p50;

export const div = (numerator: number, denominator: number, zeroValue: number = 0): number =>
    denominator === 0 ? zeroValue : numerator / denominator;

/**
 * Возвращает количество символов после точки у числа
 * Примечание: не работает с числами в экспоненциальной форме
 * @param val       число
 * @param trim      true - нули в конце числа не учитываются, false - нули в конце числа учитываются
 */
// TODO: сделать обработку чисел в экспоненциальной форме
export const digitsAfterDot = (val: number): number => val.toString().split('.')[1].length;

export const even = (x: number): boolean => x % 2 === 0;

export const distance = (x1: number, y1: number, x2: number, y2: number, precision: number = 0): number =>
    Number(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(precision));

export const min = (points: Array<number>): number => reduce<number, number>(minR, Number.MAX_VALUE, points);

export const max = (points: Array<number>): number => reduce<number, number>(maxR, -1 * Number.MAX_VALUE, points);

export const minMax = (points: Array<number>): [number, number] => [min(points), max(points)];
