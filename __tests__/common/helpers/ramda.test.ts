import * as R from 'ramda';

import { isFn, notFn, stringProp, groupByProp } from '../../../src/common/helpers/ramda';

describe('isFn function: ', () => {
    it('should return true if pass Math.max', () => {
        expect(isFn(Math.max)).toBe(true);
    });

    it('should return false if pass null or undefined', () => {
        expect(isFn(null)).toBe(false);
        expect(isFn(undefined)).toBe(false);
    });

    it('should return false if pass object', () => {
        expect(isFn({ a: '1' })).toBe(false);
    });

    it('should return false if pass value', () => {
        expect(isFn('1')).toBe(false);
        expect(isFn(1)).toBe(false);
        expect(isFn(false)).toBe(false);
    });
});

describe('notFn function: ', () => {
    it('should return false if pass Math.max', () => {
        expect(notFn(Math.max)).toBe(false);
    });

    it('should return true if pass null or undefined', () => {
        expect(notFn(null)).toBe(true);
        expect(notFn(undefined)).toBe(true);
    });

    it('should return true if pass object', () => {
        expect(notFn({ a: '1' })).toBe(true);
    });

    it('should return true if pass value', () => {
        expect(notFn('1')).toBe(true);
        expect(notFn(1)).toBe(true);
        expect(notFn(true)).toBe(true);
    });
});

describe('stringProp function: ', () => {
    it('should return false if pass Math.max', () => {
        const obj: { prop: number } = { prop: 5 };

        expect(stringProp<{ prop: number }>('prop')(obj)).toBe('5');
    });
});

describe('groupByProp function: ', () => {
    it('should split to groups correctly', () => {
        const arr: { key: number; prop: number }[] = [
            { key: 1, prop: 5 },
            { key: 1, prop: 6 },
            { key: 2, prop: 7 },
            { key: 3, prop: 8 }
        ];

        const grouped = groupByProp('key', arr);
        expect(R.keys(grouped).length).toBe(3);
        expect(R.includes('1', R.keys(grouped))).toBe(true);
        expect(R.includes('2', R.keys(grouped))).toBe(true);
        expect(R.includes('3', R.keys(grouped))).toBe(true);

        expect(R.includes({ key: 1, prop: 5 }, grouped['1'])).toBe(true);
        expect(R.includes({ key: 1, prop: 6 }, grouped['1'])).toBe(true);
    });
});
