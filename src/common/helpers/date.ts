import { differenceInCalendarMonths } from 'date-fns';
import * as R from 'ramda';

import { isFn, trueOrNull } from './ramda';

export const extendIfOneDigit = (dt: number): string =>
    R.ifElse(
        x => x.toString().length === 1,
        x => `${extendByZero(1)}${x.toString()}`,
        x => x
    )(dt);

const extendBy = (symb: string, count: number) => Array.prototype.join.call({ length: (count || -1) + 1 }, symb);
const extendByZero = (count: number) => extendBy('0', count);

/**
 * Отображает дату в строке формата: 'dd.mm.yyyy'
 * Например:
 *      ddmmyyyy(new Date('2010-01-01')) = '01.01.2010'
 *      ddmmyyyy(new Date('2010-11-01')) = '01.11.2010'
 * @param dt Дата
 */
export const ddmmyyyy = (dt: Date): string =>
    R.ifElse(
        R.either(R.isNil, isInvalidDate),
        () => '',
        (x: Date) => `${extendIfOneDigit(x.getDate())}.${extendIfOneDigit(x.getMonth() + 1)}.${x.getFullYear()}`
    )(dt);

/**
 * Отображает дату в строке формата: 'yyyy-mm-dd'
 * Например:
 *      yyyymmdd(new Date('2010-01-01')) = '2010-01-01'
 *      yyyymmdd(new Date('2010-11-01')) = '2010-11-01'
 * @param dt Дата
 */
export const yyyymmdd = (dt: Date): string =>
    R.ifElse(
        R.either(R.isNil, isInvalidDate),
        () => '',
        (x: Date) =>
            `${extendIfOneDigit(x.getFullYear())}-${extendIfOneDigit(x.getMonth() + 1)}-${extendIfOneDigit(
                x.getDate()
            )}`
    )(dt);

export const mmyyyy = (dt: Date): string =>
    R.ifElse(
        R.either(R.isNil, isInvalidDate),
        () => '',
        (x: Date) => `${extendIfOneDigit(x.getMonth() + 1)}.${x.getFullYear()}`
    )(dt);

export const ddmm = (dt: Date): string =>
    R.ifElse(
        R.either(R.isNil, isInvalidDate),
        () => '',
        (x: Date) => `${ddmmyyyy(x).substring(0, 5)}`
    )(dt);

export const yyyymm = (dt: Date): string =>
    R.ifElse(
        R.either(R.isNil, isInvalidDate),
        () => '',
        (x: Date) => `${x.getFullYear()}-${extendIfOneDigit(x.getMonth() + 1)}`
    )(dt);

export const yyyy = (dt: Date): string =>
    R.ifElse(
        R.either(R.isNil, isInvalidDate),
        () => '',
        (x: Date) => `${x.getFullYear()}`
    )(dt);

export const isValidDate = (dt: Date): boolean => {
    if (
        R.isNil(dt) ||
        !isFn(dt.getTime) ||
        isNaN(dt.getTime()) ||
        dt < new Date(1900, 1, 1) ||
        dt > new Date(2200, 1, 1)
    ) {
        return false;
    }

    return true;
};

export const isInvalidDate = (dt: Date): boolean => !isValidDate(dt);

export const addMonth = (dt: Date, count = 1): Date => {
    const newDate = new Date(dt.getTime());
    newDate.setMonth(dt.getMonth() + count);

    return newDate;
};

export const addDay = (dt: Date, count: number = 1): Date => {
    const newDate = new Date(dt.getTime());
    newDate.setDate(dt.getDate() + count);

    return newDate;
};

export const addYears = (dt: Date, count = 1): Date => new Date(dt.getFullYear() + count, dt.getMonth(), dt.getDate());

export const monthDiff = (d1: Date, d2: Date): number => {
    if (!R.is(Date, d1) || !R.is(Date, d2)) {
        return 0;
    }

    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
};

export const datesDiff = (d1: Date, d2: Date): number => {
    if (!R.is(Date, d1) || !R.is(Date, d2)) {
        return 0;
    }

    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return Math.floor((t2 - t1) / (24 * 3600 * 1000));
};

export const limitBottom = (dt: Date, limit: Date): Date => (dt < limit ? limit : dt);
export const limitTop = (dt: Date, limit: Date): Date => (dt > limit ? limit : dt);
export const limit = (dt: Date, bottomLimit: Date, topLimit: Date): Date =>
    limitTop(limitBottom(dt, bottomLimit), topLimit);

export const firstDay = (dt: Date): Date => new Date(dt.getFullYear(), dt.getMonth(), 1);

export const firstDayOfYear = (dt: Date): Date => new Date(dt.getFullYear(), 0, 1);

export const equalsTo = (dt1: Date, dt2: Date): boolean =>
    !R.isNil(dt1) &&
    !R.isNil(dt2) &&
    dt1.getDate() === dt2.getDate() &&
    dt1.getMonth() === dt2.getMonth() &&
    dt1.getFullYear() === dt2.getFullYear();

export const dateWithoutZone = (d: Date): Date =>
    isValidDate(d) ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) : null;

/**
 * Осуществляет парсинг строкового представления даты
 *      Возвращает **Date**, если преобразование было успешно.
 *      Возвращает **null** в противном случае.
 * @param raw строка с датой
 */
export const parse = (raw: string | Date): Date =>
    R.pipe(
        x => new Date(x),
        x => trueOrNull(isValidDate(x), x)
    )(raw);

export const parseRU = (raw: string): Date => {
    const parts = raw.split('.');
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

export const parseShortRU = (raw: string): Date => {
    const parts = raw.split('.');
    return new Date(Number(parts[1]), Number(parts[0]) - 1, 1);
};

export const timestamp = (): string => {
    const dt = new Date(Date.now());
    return `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`;
};

export const gteByMonth = (a: Date, b: Date): boolean => differenceInCalendarMonths(a, b) >= 0;

export const gtByMonth = (a: Date, b: Date): boolean => differenceInCalendarMonths(a, b) > 0;

export const lteByMonth = (a: Date, b: Date): boolean => differenceInCalendarMonths(a, b) <= 0;

export const ltByMonth = (a: Date, b: Date): boolean => differenceInCalendarMonths(a, b) < 0;

export const daysInMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), 0).getDate();

export const isBetweenTwoDates = (check: Date, dates: Date[]) =>
    check.getTime() >= dates[0].getTime() && check.getTime() <= dates[1].getTime();
