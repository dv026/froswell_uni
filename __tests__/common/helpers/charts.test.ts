import { digitsCount, ticksLessThan } from '../../../src/common/helpers/charts';


describe('ticksLessThan function: ', () => {
    it('should return [0, 20, 35] if min = 0, max = 35 and maxTicksCount = 3', () => {
        const ticks = ticksLessThan(3, 0, 35);
        const correct = [0, 20, 35];

        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [0, 10, 20, 30, 35] if min = 0, max = 35 and maxTicksCount = 5', () => {
        const ticks = ticksLessThan(5, 0, 35);
        const correct = [0, 10, 20, 30, 35];

        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [20, 40, 60, 80, 100] if min = 20, max = 100 and maxTicksCount = 5', () => {
        const ticks = ticksLessThan(5, 20, 100);
        const correct = [20, 40, 60, 80, 100];

        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [220, 400, 600, 800, 1000] if min = 220, max = 1000 and maxTicksCount = 5', () => {
        const ticks = ticksLessThan(5, 220, 1000);
        const correct = [220, 400, 600, 800, 1000];

        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [0, 1, 2, 3, 4, 5, 6, 7] if min = 0, max = 7 and maxTicksCount = 10', () => {
        const ticks = ticksLessThan(10, 0, 7);
        const correct = [0, 1, 2, 3, 4, 5, 6, 7];
        
        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [2, 3, 4, 5, 6, 7] if min = 2, max = 7 and maxTicksCount = 10', () => {
        const ticks = ticksLessThan(3, 2, 7);
        const correct = [2, 7];
        
        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [0.2, 20, 40, 60, 80, 100, 112] if min = 0.2, max = 112 and maxTicksCount = 10', () => {
        const ticks = ticksLessThan(10, 0.2, 112);
        const correct = [0.2, 20, 40, 60, 80, 100, 112];
        
        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    it('should return [0.02, 0.2] if min = 0.02, max = 0.2 and maxTicksCount = 10', () => {
        const ticks = ticksLessThan(10, 0.02, 0.2);
        const correct = [0.02, 0.1, 0.2];
        
        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });

    
    it('should return [7] if min = 7, max = 7 and maxTicksCount = 10', () => {
        const ticks = ticksLessThan(10, 7, 7);
        const correct = [ 7 ];
        
        ticks.forEach((x, idx) => {
            expect(x).toBe(correct[idx]);
        });
        expect(ticks.length).toBe(correct.length);
    });
});

describe('digitsCount function: ', () => {
    it('should return 1 for 20', () => {
        expect(digitsCount(20)).toBe(1);
    });

    it('should return 2 for 703', () => {
        expect(digitsCount(703)).toBe(2);
    });

    it('should return 0 for 7', () => {
        expect(digitsCount(7)).toBe(0);
    });

    it('should return -1 for 0.12', () => {
        expect(digitsCount(7)).toBe(0);
    });

    it('should return -2 for 0.0712', () => {
        expect(digitsCount(7)).toBe(0);
    });
});