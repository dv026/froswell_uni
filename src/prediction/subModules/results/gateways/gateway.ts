import { forEach } from 'ramda';

import { ReserveDevelopmentWrapper } from '../../../../calculation/entities/reserveDevelopmentWrapper';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { yyyymmdd } from '../../../../common/helpers/date';
import {
    axiosGetBlobWithAuth,
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { AdaptationBriefModel } from '../../../entities/adaptationBriefModel';
import { predictionUrl } from '../../../gateways/gateway';
import { ReportExportModel } from '../entities/exportModel';

export const getPlasts = async (prodObjId: number, wellId: number): Promise<ServerResponse<unknown>> => {
    const params: [string, string][] = [
        ['wellId', str(wellId)],
        ['productionObjectId', str(prodObjId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('plasts', [], params)));
};

export const getAdaptations = async (scenarioId: number): Promise<ServerResponse<AdaptationBriefModel[]>> => {
    const params: Array<[string, string]> = [['scenarioId', str(scenarioId)]];

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('adaptations', [], params)));
};

export const getPrediction = async (
    selectedWells: number[],
    well: WellBrief,
    plastId: number,
    bestByOil: boolean,
    accumulated: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    let params: [string, string][] = [
        ['productionObjectId', str(well.prodObjId)],
        ['plastId', str(plastId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId || null)],
        ['bestByOil', str(bestByOil)],
        ['accumulated', str(accumulated)]
    ];

    if (selectedWells && selectedWells.length > 1) {
        forEach(it => params.push(['wellIds', str(it)]), selectedWells);
    } else {
        params.push(['wellIds', str(well.id)]);
    }

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('prediction', [], params)));
};

export const getMultiplePrediction = async (wells: WellBrief[], plastId: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(predictionUrl('multiple-prediction'), { wells: wells, plastId: plastId })
    );
};

export const getMapByParams = async (
    well: WellBrief,
    plastId: number,
    accumulated: boolean,
    date: Date = null,
    selectedWells: number[] = null,
    byEndDate: boolean = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['wellId', str(well.id)],
        ['prodObjId', str(well.prodObjId)],
        ['charWorkId', str(well.charWorkId)],
        ['plastId', str(plastId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId || null)],
        ['date', date ? yyyymmdd(date) : null],
        ['accumulated', str(accumulated)],
        ['byEndDate', str(byEndDate)]
    ];

    // отправить выбраные скважины для отображения потоков
    if (selectedWells && selectedWells.length > 1) {
        forEach(it => query.push(['selectedWells', str(it)]), selectedWells);
    }

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('map', [], query)));
};

export const getKrigingDefaultDates = async (
    prodObjId: number,
    scenarioId: number,
    subScenarioId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['productionObjectId', str(prodObjId)],
        ['scenarioId', str(scenarioId)],
        ['subScenarioId', str(subScenarioId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('kriging-default-dates', [], query)));
};

export const getAvailableGrids = async (
    prodObjId: number,
    plastId: number,
    scenarioId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const query: [string, string][] = [
        ['prodObjId', str(prodObjId)],
        ['plastId', str(plastId)],
        ['scenarioId', str(scenarioId)]
    ];
    return handleResponsePromise(axiosGetWithAuth(predictionUrl('available-grids', [], query)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reportExport = async (model: ReportExportModel): Promise<any> => {
    const query: Array<[string, string]> = [
        ['scenarioId', str(model.scenarioId)],
        ['subScenarioId', str(model.subScenarioId || null)],
        ['productionObjectId', str(model.productionObjectId)],
        ['plastId', str(model.plastId === -1 ? null : model.plastId)],
        ['onlyInLicenseBorder', str(model.onlyInLicenseBorder)],
        ['dataType', str(model.dataType)],
        ['optimization', str(model.optimization)]
    ];

    return axiosGetBlobWithAuth(predictionUrl('report', [], query));
};

export const getReserveDevelopment = async (
    well: WellBrief,
    plastId: number,
    wells: number[],
    optimization: boolean = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<ReserveDevelopmentWrapper>> => {
    const params: [string, string][] = [
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['plastId', str(plastId)],
        ['optimization', str(optimization)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('reserve-development', [], params)));
};
