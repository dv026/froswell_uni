import * as R from 'ramda';

type Comparable = Date | number;

/**
 * Определяет объект диапазона со следующими ограничениями:
 *      - левая граница должна быть меньше или равна правой границе диапазона
 *      - значения границ являются неизменными после создания объекта диапазона
 */
export class Range<T extends Comparable> {
    private _min: T;
    private _max: T;

    public get min(): T {
        return this._min;
    }

    public get max(): T {
        return this._max;
    }

    public constructor(min: T, max: T) {
        if (R.not(R.eqBy(R.type, max, min))) {
            throw new TypeError('Range contructor: types of "min" and "max" arguments are not compatible');
        }

        if (min > max) {
            throw new RangeError('Range constructor: "min" argument can\'t be greater than "max" argument');
        }

        this._min = min;
        this._max = max;
    }
}

// TODO: типизация
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const rangeLike = (value: any): boolean => {
    if (R.isNil(value)) {
        return false;
    }

    return R.not(R.isNil(value.min)) && R.not(R.isNil(value.max)) && R.eqBy(R.type, value.max, value.min);
};
