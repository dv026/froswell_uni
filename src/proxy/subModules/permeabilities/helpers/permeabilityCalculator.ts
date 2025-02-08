import * as R from 'ramda';

import { div, limit, limitBottom, NV } from '../../../../common/helpers/math';
import { Coefficients } from '../entities/coefficients';
import { Permeability, PermeabilityChartModel } from '../entities/permeability';

const getKro = (oilA: number, oilB: number, s: number, sor: number, sdrn: number): number =>
    limit(0, 1, oilA * Math.pow(div(1 - s - sor, sdrn), oilB));

const getKrw = (waterA: number, waterB: number, s: number, swr: number, sdrn: number): number =>
    limit(0, 1, waterA * Math.pow(div(s - swr, sdrn), waterB));

export const calcPermeabilities = (coeffs: Coefficients, stepSize: number): Permeability[] => {
    let points: Permeability[] = [];

    let currentS = 0;
    const maxS = 1;
    let prdS = -1;
    let currentFbl = 1;

    while (currentS < maxS + stepSize) {
        points.push(PermeabilityChartModel.newWithS(currentS));
        currentS += stepSize;
    }

    for (let i = 0; i < points.length; i++) {
        const kro = getKro(coeffs.oilA, coeffs.oilB, points[i].s, coeffs.sor, coeffs.sdrn);
        const krw = getKrw(coeffs.waterA, coeffs.waterB, points[i].s, coeffs.swr, coeffs.sdrn);
        const fbl = div(krw, krw + coeffs.muWO * kro);
        const dfbl = prdS > -1 ? div(fbl - currentFbl, points[i].s - prdS) : 0;

        points[i].kro = kro;
        points[i].krw = krw;
        points[i].fbl = fbl;
        points[i].dfbl = dfbl;

        prdS = points[i].s;
        currentFbl = fbl;
    }

    return points;
};

// поиск точки скачка (FindFBLKink)
export const findJumpPoint = (permeabilities: Permeability[], swr: number): Permeability => {
    let cutVal = 0;
    let cutMin = 0;

    let q = getLineCoeffsQ(permeabilities, 1, 1, swr);
    let i = permeabilities.length - 2;
    let qMin = q;
    while (q > 0 && i > -1) {
        q = getLineCoeffsQ(permeabilities, permeabilities[i].s, permeabilities[i].fbl, swr);
        cutVal = i;
        if (qMin > q) {
            qMin = q;
            cutMin = i;
        }

        i -= 1;
    }

    if (cutVal === 0) {
        cutVal = cutMin;
    }

    return R.mergeRight({}, permeabilities[cutVal]);
};

interface StepCoeffs {
    a: number;
    b: number;
}

const getLineCoeffsQ = (permeabilities: Permeability[], x2: number, y2: number, swr: number) => {
    const coeffs = kfsLinear(
        sumInPow(sumInPow(0, swr, 2), x2, 2),
        sumInPow(sumInPow(0, 0, 2), y2, 2),
        sumInPow(sumInPow(0, swr, 1), x2, 1),
        sumInPow(sumInPow(0, 0, 1), y2, 1),
        sumBoth(sumBoth(0, swr, 0), x2, y2)
    );

    let q = 0;
    for (let i = 0; i < permeabilities.length; i++) {
        if (permeabilities[i].s < swr) {
            continue;
        }

        if (permeabilities[i].fbl > coeffs.a * permeabilities[i].s + coeffs.b) {
            q++;
        }
    }

    return q;
};

const kfsLinear = (sum2v1: number, sum2v2: number, sumv1: number, sumv2: number, sumv1v2: number): StepCoeffs => {
    let a = Math.sqrt(div(disp(sum2v2, sumv2, 2), disp(sum2v1, sumv1, 2)));

    if (sumv1v2 < (sumv1 * sumv2) / 2) {
        a *= -1;
    }

    return {
        a: a,
        b: sumv2 / 2 - (sumv1 / 2) * a
    };
};

const disp = (s2: number, s: number, q: number): number => {
    if (q < 1) {
        return NV;
    }

    if (q === 1) {
        return 0;
    }

    return limitBottom(0, div(s2 - (s * s) / q, q - 1));
};

const sumInPow = (initial: number, v: number, pow: number = 1, aw: number = 1): number =>
    initial + Math.pow(v * aw, pow);
const sumBoth = (initial: number, v1: number, v2: number, aw: number = 1): number => initial + v1 * aw * v2 * aw;

export class KnownPermeability {}
