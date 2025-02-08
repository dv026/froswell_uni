import { enm, str } from '../../../src/common/helpers/serverPath';


describe('str function: ', () => {
    it('should return "null" if pass undefined or null', () => {
        expect(str(null)).toBe('null');
        expect(str(undefined)).toBe('null');
    });

    it('should return string representation if pass value', () => {
        expect(str(1)).toBe('1');
        expect(str('1')).toBe('1');
        expect(str('null')).toBe('null');
    });
});

describe('enm function: ', () => {
    it('should return "null" if pass undefined / null / 0', () => {
        expect(enm(null)).toBe('null');
        expect(enm(undefined)).toBe('null');
        expect(enm(0)).toBe('null');
    });

    it('should return string representation if pass value', () => {
        expect(enm(1)).toBe('1');
        expect(enm('1')).toBe('1');
        expect(enm('null')).toBe('null');
    });
});