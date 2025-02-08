/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil, map, mergeRight, reject } from 'ramda';

import { ScenarioModel } from '../../../calculation/entities/scenarioModel';
import { AquiferModel } from '../../../common/entities/aquiferModel';
import { WellBrief } from '../../../common/entities/wellBrief';
import { dateWithoutZone, yyyymmdd } from '../../../common/helpers/date';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str,
    urlRobot
} from '../../../common/helpers/serverPath';
import { OptimizationChangesModel } from '../../entities/optimization/OptimizationChangesModel';
import { OptimizationState } from '../../entities/optimization/optimizationState';
import { WellGridCalculationEnum } from '../../entities/proxyMap/calculationModel';
import {
    AquiferCalculationParams,
    CalculationSettingsModel,
    GeologicalReservesCalculationParams,
    InterwellsCalculationParams
} from '../../entities/proxyMap/calculationSettingsModel';
import { InterwellConnection } from '../../entities/proxyMap/interwellConnection';
import { MapSettingModel } from '../../entities/proxyMap/mapSettingModel';
import { ModifiedImaginaryModel } from '../../entities/proxyMap/modifiedImaginaryModel';
import { WellGridBatchStatus } from '../../entities/proxyMap/wellGridBatchStatus';
import { WellGroup } from '../../entities/proxyMap/wellGroup';
import { ImaginaryCharWorkHistory, WellPoint } from '../../entities/proxyMap/wellPoint';
import { proxyUrl } from '../gateway';

export const getMap = async (well: WellBrief, plastId: number): Promise<ServerResponse<any>> => {
    const params: Array<[string, string]> = [
        ['oilfieldId', str(well.oilFieldId)],
        ['prodObjId', str(well.prodObjId)],
        ['plastId', str(plastId)],
        ['activeStock', str(true)],
        ['drilledFoundation', str(true)],
        ['imaginaryWells', str(true)],
        ['intermediateWells', str(true)],
        ['optimisationMode', str(false)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('map-well-grid', [], params)));
};

export const addNewScenario = async (model: ScenarioModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('add-new-scenario'), model));
};

export const renameScenario = async (s: ScenarioModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise<any>(axiosPostWithAuth(proxyUrl('update-scenario'), s));
};

export const deleteScenario = async (id: number): Promise<ServerResponse<any>> => {
    return await handleResponsePromise<any>(axiosPostWithAuth(proxyUrl('remove-scenario'), new ScenarioModel(id, '')));
};

export const favoriteScenario = async (id: number): Promise<ServerResponse<any>> => {
    return await handleResponsePromise<any>(
        axiosPostWithAuth(proxyUrl('favorite-scenario'), new ScenarioModel(id, ''))
    );
};

export const checkScenarioBatchStatus = async (jobId: number): Promise<ServerResponse<WellGridBatchStatus>> => {
    const query: Array<[string, string]> = [['id', str(jobId)]];

    return await handleResponsePromise(axiosGetWithAuth(urlRobot('scenario', 'check', [], query)));
};

export const startScenarioCalculationBatch = async (
    model: CalculationSettingsModel
): Promise<ServerResponse<WellGridBatchStatus>> => {
    const path = urlRobot('scenario', 'start');

    const calcItems = [
        model.checkedSevenPoint
            ? { calcType: WellGridCalculationEnum.SevenPoint, numberScenarios: model.numberSevenPoint }
            : null,
        model.checkedSquare ? { calcType: WellGridCalculationEnum.Square, numberScenarios: model.numberSquare } : null,
        model.checkedMitchell
            ? { calcType: WellGridCalculationEnum.Mitchell, numberScenarios: model.numberMitchell }
            : null,
        model.checkedPoisson
            ? { calcType: WellGridCalculationEnum.Poisson, numberScenarios: model.numberPoisson }
            : null
    ];

    const reqModel = {
        calcInterwellConnections: model.calcInterwellConnections,
        calcItems: reject(isNil, calcItems),
        cleanAllData: model.cleanAllData,
        clearCalcGrid: model.clearCalcGrid,
        contourIndent: model.contourIndent,
        countLoop: model.countLoop,
        countStep: model.countStep,
        distance: model.distance,
        drillingRate: model.useDevelopmentMode ? model.drillingRate : null,
        drillingStartDate: model.useDevelopmentMode ? dateWithoutZone(model.drillingStartDate) : null,
        horizontalCalculation: model.horizontalCalculation,
        minDistanceToLicense: model.minDistanceToLicense,
        oilFieldId: model.oilFieldId,
        plastId: model.plastId,
        baseScenarioId: model.scenarioId,
        productionObjectId: model.productionObjectId,
        selectedPolygon: model.selectedPolygon,
        step: model.distance, // Шаг изменения равен расстоянию между скважинами
        useContour: model.useContour
    };

    return handleResponsePromise(axiosPostWithAuth(path, reqModel));
};

export const abortScenarioCalculation = async (jobId: number): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(axiosPostWithAuth(urlRobot('scenario', 'abort'), { id: jobId }));
};

export const intermediateWells = (scenarioId: number, plastId: number): Promise<ServerResponse<WellPoint[]>> => {
    const params: [string, string][] = [
        ['scenarioId', str(scenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('map-intermediate-wells', [], params)));
};

export const saveImaginaryWellsNew = (
    well: WellBrief,
    plastId: number,
    model: ModifiedImaginaryModel,
    optimization: OptimizationChangesModel,
    allPlasts: boolean
): Promise<ServerResponse<boolean>> => {
    const path = proxyUrl('save-imaginary-wells-new');
    const prepareModel = mergeRight(model, { modified: map(prepareWellForSave, model.modified) });

    return handleResponsePromise(
        axiosPostWithAuth(path, {
            productionObjectId: well.prodObjId,
            scenarioId: well.scenarioId,
            subScenarioId: well.subScenarioId,
            plastId: plastId,
            model: prepareModel,
            optimisation: optimization,
            allPlasts: allPlasts
        })
    );
};

export const getOptimizationParameters = (subScenarioId: number, plastId: number): Promise<ServerResponse<any>> => {
    const params: [string, string][] = [
        ['subScenarioId', str(subScenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('optimization-parameters', [], params)));
};

export const getInterwellsCalculationParams = (
    scenarioId: number,
    plastId: number
): Promise<ServerResponse<InterwellsCalculationParams>> => {
    const params: [string, string][] = [
        ['scenarioId', str(scenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('interwells-calculation-params', [], params)));
};

export const getAquiferCalculationParams = (
    scenarioId: number,
    plastId: number
): Promise<ServerResponse<AquiferCalculationParams>> => {
    const params: [string, string][] = [
        ['scenarioId', str(scenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('aquifer-calculation-params', [], params)));
};

export const getGeologicalReservesCalculationParams = (
    scenarioId: number,
    plastId: number
): Promise<ServerResponse<GeologicalReservesCalculationParams[]>> => {
    const params: [string, string][] = [
        ['scenarioId', str(scenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('geological-reserves-params', [], params)));
};

// post

export const saveWellGroup = (
    groups: WellGroup[],
    scenarioId: number,
    plastId: number,
    isCreation: boolean
): Promise<ServerResponse<WellGroup[]>> => {
    const path = proxyUrl('save-well-group');

    return handleResponsePromise(axiosPostWithAuth(path, prepareGroups(groups, scenarioId, plastId, isCreation)));
};

export const deleteWellGroup = (scenarioId: number): Promise<ServerResponse<WellGroup[]>> => {
    const path = proxyUrl('remove-well-group');

    return handleResponsePromise(axiosPostWithAuth(path, { scenarioId }));
};

// post methods

export const calculationInterwellConnections = (
    scenarioId: number,
    plastId: number,
    model: InterwellsCalculationParams,
    improvement: boolean
): Promise<ServerResponse<InterwellConnection[]>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('save-interwell-connections'), {
            plastId: plastId,
            scenarioId: scenarioId,
            interwellDeadRadius: model.deadRadius,
            interwellRadius: model.radius,
            interwellSearchAngle: model.searchAngle,
            interwellIntermediateWells: model.intermediateWells,
            improvement: improvement
        })
    );
};

export const removeInterwellConnections = (scenarioId: number, plastId: number): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('remove-interwell-connections'), {
            plastId: plastId,
            scenarioId: scenarioId
        })
    );
};

export const postSaveAquifer = (
    well: WellBrief,
    plastId: number,
    offset: number
): Promise<ServerResponse<AquiferModel[]>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('save-aquifer'), {
            oilFieldId: well.oilFieldId,
            productionObjectId: well.prodObjId,
            scenarioId: well.scenarioId,
            plastId: plastId,
            aquiferOffset: offset
        })
    );
};

export const postRemoveAquifer = (well: WellBrief, plastId: number): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('remove-aquifer'), {
            scenarioId: well.scenarioId,
            plastId: plastId
        })
    );
};

export const postSaveCurrentGeologicalReserves = (
    well: WellBrief,
    plastId: number,
    value: number
): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('save-current-geological-reserves'), {
            scenarioId: well.scenarioId,
            plastId: plastId,
            value: value
        })
    );
};

// helpers

const prepareWellForSave = (w: WellPoint) =>
    mergeRight(w, {
        typeHistory: map(prepareCharworkForSave, w.typeHistory || [])
    });

const prepareCharworkForSave = (cw: ImaginaryCharWorkHistory) =>
    mergeRight(cw, {
        startDate: cw.startDate ? yyyymmdd(cw.startDate) : null,
        closingDate: cw.closingDate ? yyyymmdd(cw.closingDate) : null
    });

const prepareGroups = (groups: WellGroup[], scenarioId: number, plastId: number, isCreation: boolean) => ({
    scenarioId,
    plastId,
    isCreation,
    groups: map(x => {
        return {
            groupId: x.id,
            isCalcGroup: x.isCalcGroup,
            wellIds: x.wells,
            polygon: x.polygon
        };
    }, groups)
});
