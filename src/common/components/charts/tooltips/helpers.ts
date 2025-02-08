// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as R from 'ramda';

import { TooltipPayload } from '../../../../vendor/types/recharts';
import { round2 } from '../../../helpers/math';

export const findPayloadValue = (key: string, payload: any): number => {
    if (R.isNil(payload)) {
        return null;
    }

    return (R.find((x: TooltipPayload<number, string>) => x.dataKey === key, payload) || { value: null })
        .value as number;
};

export const roundPayloadValue = (val: number): string | number => R.ifElse(R.isNil, R.always('-'), round2)(val);
export const payloadValue = (key: string, payload: any) => roundPayloadValue(findPayloadValue(key, payload));
