import * as d3 from 'd3';
import { map } from 'ramda';

import { round1 } from './math';
import { isNullOrEmpty } from './ramda';

export const myInterpolate = (line: number[][], n: number = 20): number[][] => {
    if (isNullOrEmpty(line)) {
        return null;
    }

    const lon = d3.interpolateBasis(line.map(d => d[0]));
    const lat = d3.interpolateBasis(line.map(d => d[1]));

    const result = d3.zip(d3.quantize(lon, n), d3.quantize(lat, n));

    return map(it => [round1(it[0]), round1(it[1]), line[0][2], line[0][3]], result);
};
