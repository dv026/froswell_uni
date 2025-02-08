import { cosinus, eqA, eqG, getPoints, perpendicular } from '../../../src/common/helpers/geometry';

const fixedExpect = (real: number, expected: number, digits: number): void =>
    expect(real.toFixed(digits)).toBe(expected.toFixed(digits));
describe('eqG function: ', () => {
    it('should return correct result', () => {
        let equation = eqG([1, 1], [2, 2]);
        expect(equation[0]).toBe(-1);
        expect(equation[1]).toBe(1);
        expect(equation[2]).toBe(0);

        equation = eqG([-3, 2], [-7, 3]);
        expect(equation[0]).toBe(-1);
        expect(equation[1]).toBe(-4);
        expect(equation[2]).toBe(5);
    });
});

describe('eqA function: ', () => {
    it('should return correct result', () => {
        let equation = eqA([-1, 1, 0]);
        expect(equation[0]).toBe(1);
        expect(equation[1]).toBe(0);
    });
});

describe('cosinus function: ', () => {
    it('should return correct result', () => {
        let c = cosinus([0, 1], [1, 0]);
        expect(c).toBe(0);
    });

    it('should return correct result', () => {
        let c = cosinus([1, -3], [2, 4]);

        expect(c.toFixed(4)).toBe((Math.sqrt(2) / -2).toFixed(4));
    });
});

describe('getPoints function: ', () => {
    it('should return correct result', () => {
        const sortByX = ([p1, p2]) => (p1[0] < p2[0] ? [p1, p2] : [p2, p1]);

        let points = sortByX(getPoints([-1, 1, 0], [0, 0], Math.sqrt(2)));
        expect(points[0][0].toFixed(4)).toBe((-1).toFixed(4));
        expect(points[0][1].toFixed(4)).toBe((-1).toFixed(4));

        expect(points[1][0].toFixed(4)).toBe((1).toFixed(4));
        expect(points[1][1].toFixed(4)).toBe((1).toFixed(4));

        points = sortByX(getPoints([1, 1, 0], [0, 0], Math.sqrt(2)));
        expect(points[0][0].toFixed(4)).toBe((-1).toFixed(4));
        expect(points[0][1].toFixed(4)).toBe((1).toFixed(4));

        expect(points[1][0].toFixed(4)).toBe((1).toFixed(4));
        expect(points[1][1].toFixed(4)).toBe((-1).toFixed(4));
    });

    it('should return correct result if line is x=0', () => {
        const sortByY = ([p1, p2]) => (p1[1] < p2[1] ? [p1, p2] : [p2, p1]);

        let points = sortByY(getPoints([1, 0, 0], [0, 0], 1));
        expect(points[0][0].toFixed(4)).toBe((0).toFixed(4));
        expect(points[0][1].toFixed(4)).toBe((-1).toFixed(4));

        expect(points[1][0].toFixed(4)).toBe((0).toFixed(4));
        expect(points[1][1].toFixed(4)).toBe((1).toFixed(4));
    });

    it('should return correct result if line is y=0', () => {
        const sortByX = ([p1, p2]) => (p1[0] < p2[0] ? [p1, p2] : [p2, p1]);

        let points = sortByX(getPoints([0, 1, 0], [0, 0], 1));
        expect(points[0][0].toFixed(4)).toBe((-1).toFixed(4));
        expect(points[0][1].toFixed(4)).toBe((0).toFixed(4));

        expect(points[1][0].toFixed(4)).toBe((1).toFixed(4));
        expect(points[1][1].toFixed(4)).toBe((0).toFixed(4));
    });
});

describe('perpendicular function', () => {
    it('should return correct result', () => {
        let p = perpendicular([-1, 1, 0], [1, 1]);
        expect(p[0]).toBe(-1);
        expect(p[1]).toBe(-1);
        expect(p[2]).toBe(2);

        p = perpendicular([1, -3, -14], [7, -9]);
        expect(p[0]).toBe(3);
        expect(p[1]).toBe(1);
        expect(p[2]).toBe(-12);
    });
});
