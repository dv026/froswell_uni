/**
 * Возвращает уравнение прямой в общем виде (Ax + By + C = 0), проведенной через две точки плоскости
 * по формуле (y1-y2)x + (x2 - x1)y + (x1y2 - x2y1) = 0
 * @param p1 первая точка
 * @param p2 вторая точка
 * @returns уравнение прямой в виде кортежа [number, number, number],
 *          обозначающем коэффициенты уравнения [A, B, C]
 */
const eqG = (p1: [number, number], p2: [number, number]): [number, number, number] => [
    p1[1] - p2[1],
    p2[0] - p1[0],
    p1[0] * p2[1] - p2[0] * p1[1]
];

// http://www.pm298.ru/reshenie/defs32.php
// возвращает уравнение прямой с угловым коэффициентом

/**
 * Конвертирует уравнение прямой в общем виде в уравнение прямой с угловым коэффициентом
 * Положительный угловой коэффициент - функция возрастает
 * @param eq уравнение прямой в общем виде (Ax + By + C = 0)
 * @returns уравнение прямой в виде кортежа [number, number], обозначающим
 *          [угловой-коэффициент, параметр]
 */
const eqA = (eq: [number, number, number]): [number, number] => [
    (-1 * eq[0]) / eq[1], // k = -A / B
    eq[2] / eq[1] // C / B
];

/**
 * Определяет, является ли прямая возрастающей
 * @param eq уравнение прямой с угловым коэффициентом
 */
const isRising = (eq: [number, number, number]): boolean => eqA(eq)[0] < 0;

// через точку p1
// A(y-y1)-B(x-x1)=0
// Прямая, проходящая через точку M1(x1; y1) и перпендикулярная прямой Ax+By+C=0, представляется уравнением
// A(y-y1)-B(x-x1)=0 (2)
const perpendicular = (eq: [number, number, number], p: [number, number]): [number, number, number] => [
    -1 * eq[1],
    eq[0],
    eq[1] * p[0] - eq[0] * p[1]
];

const sqrSumSqrt = (a: number, b: number): number => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

//
// https://function-x.ru/line7.html
/**
 * Возвращает косинус угла между прямыми, заданными общими уравнениями
 * @param l1 первая прямая
 * @param l2 вторая прямая
 * @returns косинус угла
 */
const cosinus = (l1: [number, number], l2: [number, number]): [number, number] => {
    const numerator = l1[0] * l2[0] + l1[1] * l2[1];
    const denominator = sqrSumSqrt(l1[0], l1[1]) * sqrSumSqrt(l2[0], l2[1]);

    const absValue = Math.abs(numerator / denominator);
    return [-1 * absValue, absValue];
};

// возвращает синусы угла при известном косинусе
const sinus = (cos: number): [number, number] => {
    const absValue = Math.sqrt(1 - Math.pow(cos, 2));
    return [-1 * absValue, absValue];
};

export const leg = (angle: number, hyp: number): number => hyp * angle;
const legAdjacent = (cos, hyp) => leg(cos, hyp);
const legOpposite = (sin, hyp) => leg(sin, hyp);

const axisX = (): [number, number, number] => [1, 0, 0];

// TODO: реализовать вычисления синуса без revertY
// const getSinus = (revert: boolean) =>

// TODO: на данный момент считает правильно только при revertY = true
const getPoints = (
    l: [number, number, number],
    p: [number, number],
    r: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    revertY = false
): [[number, number], [number, number]] => {
    // найти косинус угла между прямой и осью Х

    // добавить / вычесть катеты к исходной точке
    const qqq: [number, number] = l.slice(0, 2) as [number, number];
    const xxx: [number, number] = axisX().slice(0, 2) as [number, number];
    const c = cosinus(qqq, xxx);
    // const s = sinus(c);

    let c1, s1, c2, s2;
    if (isRising(l)) {
        /* возрастающая функция */
        // III четверть
        c1 = c[0]; // отрицательный cos
        s1 = sinus(c1)[1]; // положительный sin

        // I четверть
        c2 = c[1]; // положительный cos
        s2 = sinus(c2)[0]; // отрицательный sin
    } else {
        /* убывающая функция */
        // II четверть
        c1 = c[0]; // отрицательный cos
        s1 = sinus(c1)[0]; // отрицательный sin

        // IV четверть
        c2 = c[1]; // положительный cos
        s2 = sinus(c2)[1]; // положительный sin
    }

    const p1: [number, number] = [p[0] + legOpposite(s1, r), p[1] + legAdjacent(c1, r)];

    const p2: [number, number] = [p[0] + legOpposite(s2, r), p[1] + legAdjacent(c2, r)];

    return p1[0] < p2[0] ? [p1, p2] : [p2, p1];
};

const equalX = (p0: [number, number], p1: [number, number]): boolean => p0[0] === p1[0];

const sortX = (p0: [number, number], p1: [number, number]): [[number, number], [number, number]] =>
    p0[0] > p1[0] ? [p1, p0] : [p0, p1];

const sortY = (p0: [number, number], p1: [number, number]): [[number, number], [number, number]] =>
    p0[1] > p1[1] ? [p1, p0] : [p0, p1];

const sortXelseY = (p: [[number, number], [number, number]]): [[number, number], [number, number]] =>
    equalX(p[0], p[1]) ? sortY(p[0], p[1]) : sortX(p[0], p[1]);

const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;
const radToDeg = (radians: number): number => (radians * 180) / Math.PI;

const isPointBetweenPoints = (p: number[], a: number[], b: number[], maxDistance: number) => {
    const dxL = b[0] - a[0],
        dyL = b[1] - a[1];
    const dxP = p[0] - a[0],
        dyP = p[1] - a[1];

    const squareLen = dxL * dxL + dyL * dyL;
    const dotProd = dxP * dxL + dyP * dyL;
    const crossProd = dyP * dxL - dxP * dyL;

    // perpendicular distance of point from line
    const distance = Math.abs(crossProd) / Math.sqrt(squareLen);

    return distance <= maxDistance && dotProd >= 0 && dotProd <= squareLen;
};

export { cosinus, eqG, eqA, getPoints, isRising, perpendicular, sortXelseY, degToRad, radToDeg, isPointBetweenPoints };
