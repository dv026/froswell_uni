import { ProxyAccumOilPlanFact } from 'calculation/entities/proxyAccumOilPlanFact';
import { ProxyLiquidBalance } from 'calculation/entities/proxyLiquidBalance';
import { WaterRateSourceRaw } from 'calculation/entities/waterRateSourceRaw';
import { forEach } from 'ramda';

import { PlastDistributionRaw } from '../../../../calculation/entities/plastDistributionRaw';
import { RelativePermeabilityWrapper } from '../../../../calculation/entities/relativePermeabilityWrapper';
import { ReserveDevelopmentWrapper } from '../../../../calculation/entities/reserveDevelopmentWrapper';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { InputCompareModel } from '../../../../input/entities/inputCompareModel';
import { AdaptationsWellsSummary } from '../../../entities/adaptationsWells/adaptationsWellsSummary';
import { PlastInfoRaw } from '../../../entities/report/plastInfo';
import { proxyUrl } from '../../../gateways/gateway';
import { BestAdaptationEnum } from '../../calculation/enums/bestAdaptationEnum';
import { ResultDataTypeEnum } from '../../calculation/enums/resultDataTypeEnum';

export const requestData = async (
    id: number,
    prodObjId: number,
    plastId: number,
    dataType: ResultDataTypeEnum,
    bestModelType: BestAdaptationEnum,
    schemaId: [number, number]
): Promise<ServerResponse<DataResponse>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(prodObjId)],
        ['wellId', str(id)],
        ['plastId', str(plastId || null)],
        ['bestModelType', str(bestModelType)],
        ['dataType', str(dataType)],
        ['scenarioId', str(schemaId[0])],
        ['subScenarioId', str(schemaId[1] || null)]
    ];

    return handleResponsePromise<DataResponse>(axiosGetWithAuth(proxyUrl('proxy-adaptations-wells', [], params)));
};

interface DataResponse {
    plastInformation: PlastInfoRaw[];
    data: AdaptationsWellsSummary[];
}

export const loadInsim = async (
    wellId: number,
    productionObjectId: number,
    bestByOil: boolean,
    topCount: number,
    schemaId: [number, number],
    selectedWells: number[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(productionObjectId)],
        ['bestByOil', str(bestByOil)],
        ['scenarioId', str(schemaId[0])],
        ['subScenarioId', str(schemaId[1] || null)],
        ['topCount', str(topCount)]
    ];

    if (selectedWells && selectedWells.length > 1) {
        forEach(it => params.push(['wellIds', str(it)]), selectedWells);
    } else {
        params.push(['wellIds', str(wellId)]);
    }

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('coefficients-insim', [], params)));
};

export const getMultipleInsim = async (wells: WellBrief[]): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('multiple-coefficients-insim'), { wells: wells }));
};

export const getTabletData = async (
    productionObjectId: number,
    scenarioId: number,
    wells: number[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(productionObjectId)],
        ['scenarioId', str(scenarioId)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('tablet-data', [], params)));
};

export const getPlastDistributions = async (
    well: WellBrief,
    wells: number[],
    optimization: boolean = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<PlastDistributionRaw[]>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(well.prodObjId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['optimization', str(optimization)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('plast-distributions', [], params)));
};

export const getWaterRateSource = async (
    well: WellBrief,
    wells: number[],
    plastId: number,
    allData: boolean = false,
    optimization: boolean = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<WaterRateSourceRaw[]>> => {
    const params: [string, string][] = [
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['plastId', str(plastId)],
        ['allData', str(allData)],
        ['optimization', str(optimization)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('water-rate-source', [], params)));
};

export const getReserveDevelopment = async (
    well: WellBrief,
    wells: number[],
    optimization: boolean = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<ReserveDevelopmentWrapper>> => {
    const params: [string, string][] = [
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['plastId', str(null)],
        ['optimization', str(optimization)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('reserve-development', [], params)));
};

export const getRelativePermeabilities = async (
    well: WellBrief,
    plastId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<RelativePermeabilityWrapper>> => {
    const params: [string, string][] = [
        ['scenarioId', str(well.scenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('relative-permeabilities', [], params)));
};

export const getChartCompareData = async (
    param: ChartCompareEnum,
    wells: WellBrief[],
    plastId: number,
    optimization: boolean
): Promise<ServerResponse<InputCompareModel[]>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('chart-compare'), { plastId, param, optimization, wells }));
};

export const getAccumOilPlanFact = async (
    well: WellBrief
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<ProxyAccumOilPlanFact[]>> => {
    const params: [string, string][] = [['scenarioId', str(well.scenarioId)]];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('accum-oil-plan-fact', [], params)));
};

export const getLiquidBalance = async (
    well: WellBrief,
    plastId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<ProxyLiquidBalance[]>> => {
    const params: [string, string][] = [
        ['scenarioId', str(well.scenarioId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('liquid-balance', [], params)));
};
