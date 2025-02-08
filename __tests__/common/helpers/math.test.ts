import { asc, p10, p50, p90 } from '../../../src/common/helpers/math';


describe('sortAsc function: ', () => {
    it('should sortCorrectly', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10 ];
        const sorted = asc(v);

        for (let i = 0; i < v.length - 1; i++) {
            expect(sorted[i]).toBe(i + 1);
        }
    });
});

describe('p50 function: ', () => {
    it('should return median value if there are more than 10 values and count is even', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10 ];
        // sorted [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        // indices[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
        
        expect(p50(v)).toBe(5);
    });

    it('should return median value if there are more than 10 values and count is odd', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10, 11 ];
        // sorted [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
        // indices[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,  10 ];
        
        expect(p50(v)).toBe(6);
    });

    it('should return the only value if there are only 1 value', () => {
        const v = [ 1 ];
        
        expect(p50(v)).toBe(1);
    });

    it('should return the only value if there are 2 values', () => {
        const v = [ 1, 2 ];
        
        expect(p50(v)).toBe(1);
    });

    it('should return the only value if there are 3 values', () => {
        const v = [ 1, 2, 3 ];
        
        expect(p50(v)).toBe(2);
    });
});

describe('p10 function: ', () => {
    it('should return median value if there are more than 10 values and count is even', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10 ];
        // sorted [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        // indices[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
        
        expect(p10(v)).toBe(2);
    });

    it('should return median value if there are more than 10 values and count is odd', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10, 11 ];
        // sorted [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
        // indices[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,  10 ];
        
        expect(p10(v)).toBe(2);
    });

    it('should return the only value if there are only 1 value', () => {
        const v = [ 1 ];
        
        expect(p10(v)).toBe(1);
    });

    it('should return the only value if there are 2 values', () => {
        const v = [ 1, 2 ];
        
        expect(p10(v)).toBe(1);
    });

    it('should return the only value if there are 3 values', () => {
        const v = [ 1, 2, 3 ];
        
        expect(p10(v)).toBe(1);
    });
});

describe('p90 function: ', () => {
    it('should return median value if there are more than 10 values and count is even', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10 ];
        // sorted [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        // indices[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
        
        expect(p90(v)).toBe(9);
    });

    it('should return median value if there are more than 10 values and count is odd', () => {
        const v = [ 1, 3, 5, 7, 9, 2, 4, 6, 8, 10, 11 ];
        // sorted [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
        // indices[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,  10 ];
        
        expect(p90(v)).toBe(10);
    });

    it('should return the only value if there are only 1 value', () => {
        const v = [ 1 ];
        
        expect(p90(v)).toBe(1);
    });

    it('should return the only value if there are 2 values', () => {
        const v = [ 1, 2 ];
        
        expect(p90(v)).toBe(2);
    });

    it('should return the only value if there are 3 values', () => {
        const v = [ 1, 2, 3 ];
        
        expect(p90(v)).toBe(3);
    });
});