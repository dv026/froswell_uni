import { append, clone, find, isNil, pipe, reject } from 'ramda';
import { atom, selector } from 'recoil';

import { round0 } from '../../common/helpers/math';
import { shallow } from '../../common/helpers/ramda';
import { InsimCalculationParams } from '../../proxy/entities/insimCalculationParams';
import { createModeParams } from '../../proxy/helpers/calculationParamsHelper';
import { AdaptationTypeRatios } from '../entities/adaptationTypeRatios';
import { CalculationModeEnum } from '../enums/calculationModeEnum';
import { calculationModeState } from './calculationMode';
import { currentScenarioId } from './currentScenarioId';
import { proxySharedState } from './sharedCalculation';

const defaultModeParams = selector<[CalculationModeEnum, InsimCalculationParams][]>({
    key: 'calculation__defaultModeParams',
    get: async ({ get }) => {
        const scenarioId = get(currentScenarioId);
        const shared = get(proxySharedState);

        if (!shared) {
            return null;
        }

        return createModeParams(shared.templates, shared.templateNew, scenarioId, shared.adaptationRange);
    }
});

export const modeParamsState = atom<[CalculationModeEnum, InsimCalculationParams][]>({
    key: 'calculation__modeParamsState',
    default: defaultModeParams
});

export const resultsAreAvailable = atom<boolean>({
    key: 'calculation__resultsAreAvailable',
    default: false
});

export const insimCalcParams = selector<InsimCalculationParams>({
    key: 'calculation__insimCalcParams',
    get: ({ get }) => {
        const calculationMode = get(calculationModeState);
        const modeParams = get(modeParamsState);

        if (isNil(modeParams)) {
            return null;
        }

        const item = find(x => x[0] === calculationMode, modeParams);
        return item && item.length > 1 ? item[1] : null;
    },
    set: ({ get, set }, params: InsimCalculationParams) => {
        const calculationMode = get(calculationModeState);
        const modeParams = get(modeParamsState);

        const newMode: [CalculationModeEnum, InsimCalculationParams] = [calculationMode, params];

        const newValue = pipe(
            reject<[CalculationModeEnum, InsimCalculationParams]>(x => x[0] === calculationMode),
            (x: [CalculationModeEnum, InsimCalculationParams][]) => append(newMode, x)
        )(modeParams);

        set(modeParamsState, clone(newValue));
    }
});

export const adaptationsNumberParam = selector<number>({
    key: 'calculation__adaptationsNumber',
    get: ({ get }) => {
        const params = get(insimCalcParams);

        return params?.adaptations;
    },
    set: ({ get, set }, value: number) => {
        const params = get(insimCalcParams);
        const ratios = get(adaptationRatioParam);

        const lengths = convertRatiosToLength(ratios, value);

        set(
            insimCalcParams,
            shallow(params, {
                adaptations: value,
                sprintGeoModelLength: lengths.sprintGeoModelLength,
                sprintSkinFactorLength: lengths.sprintSkinFactorLength,
                sprintPermeabilitiesLength: lengths.sprintPermeabilitiesLength
            })
        );
    }
});

export const adaptationRatioParam = selector<AdaptationTypeRatios>({
    key: 'calculation__adaptationRatioParam',
    get: ({ get }) => {
        const params = get(insimCalcParams);

        if (!params) {
            return null;
        }

        return convertLengthToRatios(params, params.adaptations);
    },
    set: ({ get, set }, value: AdaptationTypeRatios) => {
        const params = get(insimCalcParams);

        set(insimCalcParams, shallow(params, convertRatiosToLength(value, params.adaptations)));
    }
});

const getGeoModelLength = (adaptations: number, geoModelRatio: number) =>
    Math.ceil((adaptations * geoModelRatio) / 100);
const getSkinFactorLength = (adaptations: number, geoModelLength: number, permLength: number) =>
    adaptations - geoModelLength - permLength;
const getPermeabilitiesLength = (adaptations: number, permRatio: number) => Math.floor((adaptations * permRatio) / 100);

const toPercent = (numerator: number, denominator: number) =>
    denominator === 0 ? 0 : round0((numerator / denominator) * 100);

type TypeLengths = Pick<
    InsimCalculationParams,
    'sprintSkinFactorLength' | 'sprintPermeabilitiesLength' | 'sprintGeoModelLength'
>;

const convertRatiosToLength = (ratios: AdaptationTypeRatios, adaptations: number): TypeLengths => {
    const geo = getGeoModelLength(adaptations, ratios.geoModel);
    const perm = getPermeabilitiesLength(adaptations, ratios.permeabilities);
    const skin = getSkinFactorLength(adaptations, geo, perm);

    return {
        sprintGeoModelLength: geo,
        sprintPermeabilitiesLength: perm,
        sprintSkinFactorLength: skin
    };
};

const convertLengthToRatios = (lengths: TypeLengths, adaptations: number): AdaptationTypeRatios => {
    const geo = toPercent(lengths.sprintGeoModelLength, adaptations);
    const perm = toPercent(lengths.sprintPermeabilitiesLength, adaptations);
    const skin = adaptations > 0 ? 100 - geo - perm : 0;

    return {
        geoModel: geo,
        permeabilities: perm,
        skinFactor: skin
    };
};
