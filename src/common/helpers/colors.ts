import { match } from 'ramda';
import tinygradient from 'tinygradient';

import { limit } from './math';
import { isNullOrEmpty } from './ramda';

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export const rgba = ({ r, g, b, a }: RGBA): string => `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;

export const rgb = (r: number, g: number, b: number): string => rgba({ r, g, b, a: 1 });

export const rgbaFromString = (raw: string): RGBA => {
    const parsed = match(/\d+/g, raw);
    return { r: +parsed[0], g: +parsed[1], b: +parsed[2], a: parsed[3] ? +parsed[3] : 1 };
};

export const opacity = (color: string, opacity: number): string => {
    if (!isHex(color)) {
        throw new Error('Not implemented');
    }

    return hexToRGBA(color, opacity);
};

const hexToRGBA = (hex: string, opacity: number): string =>
    'rgba(' +
    (hex = hex.replace('#', ''))
        .match(new RegExp('(.{' + hex.length / 3 + '})', 'g'))
        .map(function (l) {
            return parseInt(hex.length % 2 ? l + l : l, 16);
        })
        .concat(isFinite(opacity) ? limit(0, 1, opacity) : 1)
        .join(',') +
    ')';

const isHex = (color: string) => color && color.startsWith('#') && (color.length === 4 || color.length === 7);

const defaultColorStep = 50;

export const colorGradient = (palette: string[]): tinycolor.Instance[] =>
    isNullOrEmpty(palette) ? null : tinygradient(palette).rgb(defaultColorStep + 2);

export const shadeColor = (color: string, percent: number) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(String((R * (100 + percent)) / 100));
    G = parseInt(String((G * (100 + percent)) / 100));
    B = parseInt(String((B * (100 + percent)) / 100));

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    let RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
    let GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
    let BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

    return '#' + RR + GG + BB;
};
