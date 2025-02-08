import * as R from 'ramda';
import { filter, map } from 'ramda';

import { WellTypeEnum } from '../../../../../common/enums/wellTypeEnum';
import { parse } from '../../../../../common/helpers/date';
import { max, min, round0 } from '../../../../../common/helpers/math';
import { OptimizationState } from '../../../../../proxy/entities/optimization/optimizationState';
import { OptimisationModel } from '../../../../../proxy/entities/proxyMap/optimisationModel';
import { OptimisationSkinFactorModel } from '../../../../../proxy/entities/proxyMap/optimisationSkinFactorModel';
import { OptimisationParamEnum } from '../../../../../proxy/enums/wellGrid/optimisationParam';

const skinFactorMin = -20;
const skinFactorMax = 20;

export interface OptimisationBriefType {
    minValue: number;
    maxValue: number;
    defaultValue: number;
    currentValue: number;
    additionalValue: number;
}

export interface OptimisationSkinFactorBriefType {
    minValue: number;
    maxValue: number;
    defaultValue: number;
    currentValue: number;
    startDate: Date;
    endDate: Date;
    spike: number;
}

export const optimisationData = (
    model: OptimizationState,
    param: OptimisationParamEnum,
    wellId: number,
    wellType: WellTypeEnum
): OptimisationBriefType => {
    let currentValue = 0;
    let minValue = 0;
    let maxValue = 0;
    let defaultValue = 0;
    let additionalValue = 0;

    if (R.equals(param, OptimisationParamEnum.PresureZab)) {
        const filteredByWellType = filter(it => it.wellType === wellType, model.optimisation);

        const opt: OptimisationModel = R.find(it => it.wellId === wellId, filteredByWellType);
        if (opt) {
            currentValue = opt.currentPressureZab ? opt.currentPressureZab : opt.defaultPressureZab;
            minValue = opt.minPressureZab;
            maxValue = opt.maxPressureZab;
        } else {
            currentValue = Math.round(
                R.mean(
                    R.map(
                        it => (it.currentPressureZab ? it.currentPressureZab : it.defaultPressureZab),
                        filteredByWellType
                    )
                )
            );

            minValue = round0(min(map(it => it.minPressureZab, filteredByWellType)));
            maxValue = round0(max(map(it => it.maxPressureZab, filteredByWellType)));
        }

        if (currentValue < minValue || currentValue > maxValue) {
            currentValue = 0;
        }

        const origOpt = R.find(it => it.wellId === wellId && it.wellType === wellType, model.originalOptimisation);
        if (origOpt) {
            defaultValue = origOpt.defaultPressureZab;
            additionalValue = origOpt.bubblePointPressure;
        } else {
            defaultValue = Math.round(R.mean(R.map(it => it.defaultPressureZab, model.originalOptimisation)));
        }
    } else {
        minValue = skinFactorMin;
        maxValue = skinFactorMax;

        const opt = R.find(it => it.wellId === wellId, model.optimisationSkinFactor);
        if (opt) {
            currentValue = opt.value;
        }
    }

    return { minValue, maxValue, defaultValue, currentValue, additionalValue };
};

export const optimisationSkinFactorData = (
    model: OptimisationSkinFactorModel[],
    wellId: number
): OptimisationSkinFactorBriefType[] => {
    return map(
        (it: OptimisationSkinFactorModel) => ({
            minValue: skinFactorMin,
            maxValue: skinFactorMax,
            defaultValue: null,
            currentValue: it.value,
            startDate: it.startDate ? parse(it.startDate) : null,
            endDate: it.endDate ? parse(it.endDate) : null,
            spike: it.spike
        }),
        R.filter(it => it.wellId === wellId, model)
    );
};
