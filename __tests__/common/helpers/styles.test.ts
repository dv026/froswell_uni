import { cls } from '../../../src/common/helpers/styles';

describe('className', () => {
    test('should return null if nil-entity passes', () => {
        expect(cls()).toBe('');
        expect(cls(null)).toBe('');
        expect(cls(undefined)).toBe('');
        expect(cls('')).toBe('');
        expect(cls([])).toBe('');
    });

    test('should return correct string', () => {
        expect(cls(['a', 'b'])).toBe('a b');
    });

    test('should return correct string if any number of arguments are passed', () => {
        expect(cls('a', 'b')).toBe('a b');
    });

    test('should return correct string if arrays and strings are passed', () => {
        expect(cls(['a', 'b'], 'c')).toBe('a b c');
    });

    test('should return correct string if arrays are passed', () => {
        expect(cls(['a', 'b'], ['c', 'd'])).toBe('a b c d');
    });

    test('should return correct string if arrays with nulls or empty spaces are passed', () => {
        expect(cls(['a', 'b'], ['   ', 'd'])).toBe('a b d');
        expect(cls(['a', ' b ', 'c ', ' d', 'e'])).toBe('a b c d e');
    });

    test('should return correct string if strings with whitespaces are passed', () => {
        expect(cls('a', ' b ', null, '')).toBe('a b');
    });
});
