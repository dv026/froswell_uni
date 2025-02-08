import * as R from 'ramda';

const str = (val: string | number, postfix: string) => `${val.toString()}${postfix}`;

/**
 * Преобразует входной параметр в строку с названиями классов. При этом значения null и undefined
 * интерпретируются как пустая строка. Также результирующая строка избавляется лишних пробелов.
 * Например:
 *      className(['a', ' ', null, undefined, 'b']) = 'a b'
 *      className('c') = 'c'
 * @param classes строка с названием класса | массив строк с названиями классов
 */
export type StrOrArr = string | string[];
export function cls(...classes: StrOrArr[]): string {
    if (R.isNil(classes) || !classes.length) {
        return '';
    }

    const arr: string[] = R.reduce<StrOrArr, string[]>((acc: string[], x: StrOrArr) => {
        if (R.is(String)(x)) {
            return R.append(x as string, acc);
        }

        if (R.is(Array)(x)) {
            return R.concat(acc, x as string[]);
        }

        return acc;
    }, [])(classes);

    return R.pipe(R.reject(R.isNil), R.map(R.trim), R.reject(R.equals('')), R.join(' '))(arr);
}

/**
 * Добавляет окончание 'px' к значению val.
 * Например:
 *      px(50) = '50px'
 *      px('100') = '100px'
 * @param val значение
 */
export const px = (val: string | number): string => str(val, 'px');

/**
 * Добавляет окончание '%' к значению val.
 * Например:
 *      px(50) = '50%'
 *      px('100') = '100%'
 * @param val значение
 */
export const pc = (val: string | number): string => str(val, '%');

export const modifier = (block: string, mod: string): string => `${block}_${mod}`;

export const literal = (block: string, literal: string): string => `${block}-${literal}`;
