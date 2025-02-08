import { KeyValuePair, map, zip } from 'ramda';
import Gradient from 'tinygradient';

import { valueProp } from '../../helpers/strings';

export enum Quantiles {
    P10 = 'p10',
    P50 = 'p50',
    P90 = 'p90'
}

export const valueP10 = valueProp(Quantiles.P10);
export const valueP50 = valueProp(Quantiles.P50);
export const valueP90 = valueProp(Quantiles.P90);

const basePalette = ['rgb(161, 190, 237)', 'rgb(58, 125, 234)'];

export function createPalette<T>(keys: T[], palette = basePalette): KeyValuePair<T, string>[] {
    const colors =
        keys.length <= palette.length ? palette : map(x => x.toRgbString(), Gradient(palette).rgb(keys.length));

    return zip(keys)(colors);
}

export function createRGBAPalette<T>(keys: T[], palette = basePalette): KeyValuePair<T, string>[] {
    const colors =
        keys.length <= palette.length ? palette : map(x => x.toRgbString(), Gradient(palette).rgb(keys.length));

    return zip(keys)(colors);
}
