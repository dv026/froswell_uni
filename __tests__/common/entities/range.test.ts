import { Range, rangeLike } from '../../../src/common/entities/range';

describe('rangeLike', () => {
    test('should return false if falsy object is passed', () => {
        expect(rangeLike(null)).toBe(false);
        expect(rangeLike(undefined)).toBe(false);
    });

    test('should return true if Range consisted of primitive values is passed', () => {
        expect(rangeLike(new Range<number>(1, 2))).toBe(true);
    });

    test('should return true if Range consisted of objects is passed', () => {
        expect(rangeLike(new Range<Date>(new Date(1900, 0, 1), new Date()))).toBe(true);
    });
});

describe('Range', () => {
    test('should throw error if min is greater than max', () => {
        expect(() => new Range(2, 1)).toThrow(RangeError);
        expect(() => new Range(new Date(1901, 0, 1), new Date(1900, 0, 1))).toThrow(RangeError);
    });

    test('should throw error if min is equals to max', () => {
        expect(() => new Range(1, 1)).not.toThrowError();
        expect(() => new Range(new Date(1900, 0, 1), new Date(1900, 0, 1))).not.toThrowError();
    });

    test('should throw error if falsy argument is passed', () => {
        expect(() => new Range(new Date(), null)).toThrow(TypeError);
        expect(() => new Range(new Date(), undefined)).toThrow(TypeError);
    });

    test('should throw error if range properties are reassigned', () => {
        expect(() => {
            const r = new Range(1, 2);
            (r as any)['min'] = 2;
        }).toThrowError();
        expect(() => {
            const r = new Range(1, 2);
            (r as any)['max'] = 2;
        }).toThrowError();
    });
});
