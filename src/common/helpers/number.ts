/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { isNumber } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tryParse = (value: any): number => {
    if (isNumber(value)) {
        return value || null;
    }

    return parseInt(value) || null;
};

export const between = (x: number, min: number, max: number): boolean => x >= min && x <= max;
