import { PlastModel } from 'common/entities/plastModel';
import { forEach } from 'ramda';

import { WellBrief } from '../../../../common/entities/wellBrief';
import { yyyymmdd } from '../../../../common/helpers/date';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { Nullable } from '../../../../common/helpers/types';
import { optimizationUrl } from '../../../gateways/gateway';
import { HeatmapSettings } from '../entities/heatmapSettings';
import { SiteResultsRaw } from '../entities/siteResultsRaw';

/**
 * Возвращает с сервера список результатов оптимизации.
 * @param info - объект скважины
 * @param plastId - ид пласта (если null, результат возвращается по всем пластам)
 * @param selectedWells - выбранные скважины
 */
export const requestSiteResults = async (
    info: WellBrief,
    plastId: Nullable<number>,
    selectedWells: number[]
): Promise<ServerResponse<SiteResultsRaw>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(info.prodObjId)],
        ['scenarioId', str(info.scenarioId)],
        ['subScenarioId', str(info.subScenarioId)],
        ['plastId', str(plastId)]
    ];

    if (selectedWells && selectedWells.length > 1) {
        forEach(it => params.push(['wellIds', str(it)]), selectedWells);
    } else {
        params.push(['wellIds', str(info.id)]);
    }

    return handleResponsePromise<SiteResultsRaw>(axiosGetWithAuth(optimizationUrl('data', [], params)));
};

export const getMultipleOptimization = async (wells: WellBrief[], plastId: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(optimizationUrl('multiple-data'), { wells: wells, plastId: plastId })
    );
};

export const requestOnlyMap = async (
    well: WellBrief,
    plastId: number,
    date: Date,
    accumulated: boolean,
    selectedWells: number[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    plastId = plastId === PlastModel.byObject().id ? null : plastId;
    const params: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['wellId', str(well.id)],
        ['prodObjId', str(well.prodObjId)],
        ['charWorkId', str(well.charWorkId)],
        ['plastId', str(plastId === -1 ? null : plastId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId || null)],
        ['date', date ? yyyymmdd(date) : null],
        ['accumulated', str(accumulated)]
    ];

    // отправить выбраные скважины для отображения потоков
    if (selectedWells && selectedWells.length > 1) {
        forEach(it => params.push(['selectedWells', str(it)]), selectedWells);
    }

    return handleResponsePromise(axiosGetWithAuth(optimizationUrl('map', [], params)));
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
    return handleResponsePromise(axiosGetWithAuth(optimizationUrl('available-grids', [], query)));
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

    return handleResponsePromise(axiosGetWithAuth(optimizationUrl('kriging-default-dates', [], query)));
};

export const requestHeatmap = async (info: WellBrief, plastId: number): Promise<ServerResponse<HeatmapSettings>> => {
    const query: Array<[string, string]> = [
        ['subScenarioId', str(info.subScenarioId)],
        ['plastId', str(plastId === -1 ? null : plastId)],
        ['wellId', str(info.id)]
    ];

    return handleResponsePromise<HeatmapSettings>(axiosGetWithAuth(optimizationUrl('heatmap', [], query)));
};
