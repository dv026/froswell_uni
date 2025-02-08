import { selector } from 'recoil';

import { round0 } from '../../common/helpers/math';
import { shallow } from '../../common/helpers/ramda';
import { OptimizationParams } from '../../proxy/entities/optimizationParams';
import { OptimizationTypeRatios } from '../entities/optimizationTypeRatios';
import { insimCalcParams } from './insimCalcParams';

export const optimizationIterations = selector<number>({
    key: 'calculation__optimizationIterations',
    get: ({ get }) => {
        const params = get(insimCalcParams);

        return params?.optimizationParams.trials;
    },
    set: ({ get, set }, value: number) => {
        const params = get(insimCalcParams);
        const ratios = get(optimizationRatioParam);

        const lengths = convertRatiosToLength(ratios, value);

        set(
            insimCalcParams,
            shallow(params, {
                optimizationParams: shallow(params.optimizationParams, {
                    trials: value,
                    iterationsBhp: lengths.iterationsBhp,
                    iterationsGtm: lengths.iterationsGtm
                })
            })
        );
    }
});

export const optimizationRatioParam = selector<OptimizationTypeRatios>({
    key: 'calculation__optimizationRatioParam',
    get: ({ get }) => {
        const params = get(insimCalcParams);

        if (!params) {
            return null;
        }

        return convertLengthToRatios(params.optimizationParams);
    },
    set: ({ get, set }, value: OptimizationTypeRatios) => {
        const params = get(insimCalcParams);

        set(
            insimCalcParams,
            shallow(params, {
                optimizationParams: shallow(
                    params.optimizationParams,
                    convertRatiosToLength(value, params.optimizationParams.trials)
                )
            })
        );
    }
});

const getBhpLength = (iterations: number, bhpRatio: number) => Math.ceil((iterations * bhpRatio) / 100);
const getGtmLength = (iterations: number, bhpLength: number) => iterations - bhpLength;

const toPercent = (numerator: number, denominator: number) =>
    denominator === 0 ? 0 : round0((numerator / denominator) * 100);

type TypeLengths = Pick<OptimizationParams, 'iterationsBhp' | 'iterationsGtm'>;

const convertRatiosToLength = (ratios: OptimizationTypeRatios, iterations: number): TypeLengths => {
    const iterationsBhp = getBhpLength(iterations, ratios.bhp);
    const iterationsGtm = getGtmLength(iterations, iterationsBhp);

    return { iterationsBhp, iterationsGtm };
};

const convertLengthToRatios = (params: OptimizationParams): OptimizationTypeRatios => {
    const bhp = toPercent(params.iterationsBhp, params.trials);
    const gtm = params.trials > 0 ? 100 - bhp : 0;

    return { bhp, gtm };
};
