import { isNil } from 'ramda';

import { yyyymmdd } from '../../common/helpers/date';
import {
    axiosDeleteWithAuth,
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str,
    urlRobot
} from '../../common/helpers/serverPath';
import { InsimCalculationParams } from '../../proxy/entities/insimCalculationParams';
import { ComputationStatus, ComputationStatusBrief } from '../entities/computation/computationStatus';
import { CalculationModeEnum } from '../enums/calculationModeEnum';

export const runInsim = async (
    p: InsimCalculationParams,
    mode: CalculationModeEnum,
    schemaIds: number[], // TODO: переделать. Сейчас schemaIds[0] = ScenarioId, schemaIds[1] = SubScenarioId
    oilfieldId: number,
    productionObjectId: number,
    handleError: (resp: any) => void
): Promise<ServerResponse<ComputationStatus>> => {
    return handleResponsePromise(
        axiosPostWithAuth(urlRobot('insim'), {
            inputParams: {
                forecastEnd: yyyymmdd(p.forecastEnd),
                oilfieldId: oilfieldId,
                plastIds: p.plastIds,
                productionObjectId: productionObjectId,
                radius: p.radius,
                deadRadius: p.deadRadius,
                searchAngle: p.searchAngle,
                mode,
                scenarioId: schemaIds[0],
                subScenarioId: isNil(schemaIds[1]) ? 0 : schemaIds[1],
                startDate: yyyymmdd(p.adaptationStart),
                endDate: yyyymmdd(p.adaptationEnd),
                // saveOnlyBestA: p.saveOnlyBestA,
                saveOnlyBestA: true, // TODO: временное значение до реализации функционала сохранения
                period: p.period,
                periodType: p.periodType,
                watercutLimit: p.watercutLimit,
                oilRateLimit: p.oilRateLimit,
                // saveAllFrontTracking: p.saveAllFrontTracking,
                saveAllFrontTracking: false, // TODO: временное значение до реализации функционала сохранения
                useInjectionRepairs: p.useInjectionRepairs,
                engineType: p.engineType
            },
            adaptationParams: {
                aNumber: p.adaptations,
                adaptRegions: p.adaptRegions,
                adaptSaturations: p.adaptSaturations,
                adaptSaturationsOfInterwellPoints: p.adaptSaturationsOfInterwellPoints,
                // modelCount: p.modelCount,
                modelCount: 1, // TODO: временное значение до реализации функционала сохранения
                sprintSkinFactorLength: p.sprintSkinFactorLength ?? 0,
                sprintGeoModelLength: p.sprintGeoModelLength ?? 0,
                sprintPermeabilitiesLength: p.sprintPermeabilitiesLength ?? 0,
                minSkinFactor: p.minSkinFactor,
                maxSkinFactor: p.maxSkinFactor,
                oilErrorWeight: p.oilErrorWeight,
                liquidErrorWeight: p.liquidErrorWeight,
                injectionErrorWeight: p.injectionErrorWeight,
                pressureErrorWeight: p.pressureErrorWeight,
                flowErrorWeight: p.flowErrorWeight,
                pressureZabErrorWeight: p.pressureZabErrorWeight,
                watercutErrorWeight: p.watercutErrorWeight,
                permeabilitiesLimit: p.permeabilitiesLimit,
                reservesLimit: p.reservesLimit,
                adaptOilC1: p.adaptOilC1,
                adaptOilC2: p.adaptOilC2,
                adaptWaterC1: p.adaptWaterC1,
                adaptWaterC2: p.adaptWaterC2,
                transmissibilitiesLimit: p.transmissibilitiesLimit,
                preVolumeLimit: p.preVolumeLimit
            },
            predictionParams: {
                constantLiqRate: p.constantLiqRate,
                constantInjection: p.constantInjection
            }
        }),
        handleError
    );
};

// TODO: исследовать возможность унификации с runInsim
export const runOptimization = async (
    p: InsimCalculationParams,
    mode: CalculationModeEnum,
    schemaIds: number[], // TODO: переделать. Сейчас schemaIds[0] = ScenarioId, schemaIds[1] = SubScenarioId
    oilfieldId: number,
    productionObjectId: number,
    excluded: number[], // ид скважин, которые исключаются из расчета - их параметры не должны меняться
    handleError: (resp: any) => void
): Promise<ServerResponse<ComputationStatus>> => {
    return handleResponsePromise(
        axiosPostWithAuth(urlRobot('insimOptimization', ''), {
            inputParams: {
                forecastEnd: yyyymmdd(p.forecastEnd),
                oilfieldId: oilfieldId,
                plastIds: p.plastIds,
                productionObjectId: productionObjectId,
                radius: p.radius,
                deadRadius: p.deadRadius,
                searchAngle: p.searchAngle,
                mode,
                scenarioId: schemaIds[0],
                subScenarioId: schemaIds[1],
                startDate: yyyymmdd(p.adaptationStart),
                endDate: yyyymmdd(p.adaptationEnd),
                saveOnlyBestA: p.saveOnlyBestA,
                period: p.period,
                periodType: p.periodType,
                watercutLimit: p.watercutLimit,
                oilRateLimit: p.oilRateLimit,
                saveAllFrontTracking: p.saveAllFrontTracking,
                engineType: p.engineType
            },
            adaptationParams: {
                aNumber: p.adaptations,
                modelCount: p.modelCount,
                sprintSkinFactorLength: p.sprintSkinFactorLength ?? 0,
                sprintInitialsLength: p.sprintGeoModelLength ?? 0,
                oilErrorWeight: p.oilErrorWeight,
                liquidErrorWeight: p.liquidErrorWeight,
                injectionErrorWeight: p.injectionErrorWeight,
                pressureErrorWeight: p.pressureErrorWeight,
                flowErrorWeight: p.flowErrorWeight,
                pressureZabErrorWeight: p.pressureZabErrorWeight,
                permeabilitiesLimit: p.permeabilitiesLimit,
                reservesLimit: p.reservesLimit,
                adaptOilC1: p.adaptOilC1,
                adaptOilC2: p.adaptOilC2,
                adaptWaterC1: p.adaptWaterC1,
                adaptWaterC2: p.adaptWaterC2,
                transmissibilitiesLimit: p.transmissibilitiesLimit,
                preVolumeLimit: p.preVolumeLimit
            },
            optimizationParams: {
                period: p.optimizationParams.period,
                trials: p.optimizationParams.trials,
                target: p.optimizationParams.target,
                mainOCount: p.optimizationParams.modelCount,
                optimizeSkinFactorStartDate: yyyymmdd(p.optimizationParams.optimizeSkinFactorStartDate),
                optimizeBhpStartDate: yyyymmdd(p.optimizationParams.optimizeBhpStartDate),
                skinFactorWells: p.optimizationParams.skinFactorWells,
                pressureVariance: p.optimizationParams.pressureVariance,
                saveOnlyBestO: p.optimizationParams.saveOnlyBestO,
                excludedIds: excluded,
                usePredictionSkinFactors: p.optimizationParams.usePredictionSkinFactors,
                iterationsBhp: p.optimizationParams.iterationsBhp,
                iterationsGtm: p.optimizationParams.iterationsGtm
            }
        }),
        handleError
    );
};

export const abortInsim = async (key: string): Promise<ServerResponse<ComputationStatus>> => {
    const params: [string, string][] = [['id', key]];

    return handleResponsePromise(axiosDeleteWithAuth(urlRobot('insim', '', [], params)));
};

export const checkInsimBatchStatus = async (key: string): Promise<ServerResponse<ComputationStatus>> => {
    const params: Array<[string, string]> = [['id', str(key)]];

    return handleResponsePromise(axiosGetWithAuth(urlRobot('insim', '', [], params)));
};

export const getActiveComputations = async (): Promise<ServerResponse<ComputationStatusBrief[]>> => {
    return handleResponsePromise(axiosGetWithAuth(urlRobot('insim', 'list')));
};
