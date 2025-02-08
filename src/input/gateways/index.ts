// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { tryParse } from 'common/helpers/number';
import { InputMapContourModel } from 'input/entities/inputMapContourModel';
import { DistributionType } from 'input/enums/distributionType';
import { forEach, map, mergeRight } from 'ramda';

import { IsolineModel } from '../../common/entities/mapCanvas/isolineModel';
import { WellBrief } from '../../common/entities/wellBrief';
import { ChartCompareEnum } from '../../common/enums/chartCompareEnum';
import { DataTypeEnum } from '../../common/enums/dataTypeEnum';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { colorGradient } from '../../common/helpers/colors';
import { yyyymmdd } from '../../common/helpers/date';
import { paletteByKey } from '../../common/helpers/map/palette';
import {
    axiosGetBlobWithAuth,
    axiosGetWithAuth,
    axiosPostBlobWithAuth,
    axiosPostWithAuth,
    enm,
    handleResponsePromise,
    ServerResponse,
    str,
    url,
    urlRobot
} from '../../common/helpers/serverPath';
import { InputCompareModel } from '../entities/inputCompareModel';
import { KrigingCalcSettingsModel } from './../entities/krigingCalcSettings';

const inputUrl = (actionName: string, opts: Array<string> = [], query: Array<[string, string]> = []) =>
    url('input', actionName, opts, query);

const inputUrlRobot = (actionName: string, opts: Array<string> = [], query: Array<[string, string]> = []) =>
    urlRobot('input', actionName, opts, query);

export const getMapGrid = async (
    propName: GridMapEnum,
    wells: WellBrief[],
    plastId: number,
    date: Date = null,
    isolineSettings: IsolineModel = null,
    optimization: boolean = false
): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(inputUrl('mapGrid'), {
            propName: tryParse(propName),
            wells: wells,
            plastId: plastId,
            date: date ? yyyymmdd(date) : null,
            isolineStep: isolineSettings?.step,
            isolineMin: isolineSettings?.min,
            isolineMax: isolineSettings?.max,
            optimization: optimization,
            palette: map(it => it.toHexString().substring(1, 7), colorGradient(paletteByKey(propName)))
        })
    );
};

export const getMapGridForce = async (
    propName: GridMapEnum,
    model: KrigingCalcSettingsModel,
    isolineSettings: IsolineModel = null,
    optimization: boolean = false
): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(
            inputUrl('mapGridForce'),
            mergeRight(model, {
                params: [+propName],
                startDate: yyyymmdd(model.startDate),
                endDate: yyyymmdd(model.endDate),
                palette: map(it => it.toHexString().substring(1, 7), colorGradient(paletteByKey(propName))),
                isolineStep: isolineSettings?.step,
                isolineMin: isolineSettings?.min,
                isolineMax: isolineSettings?.max,
                optimization: optimization
            })
        )
    );
};

export const getMapVariationLosses = async (model: KrigingCalcSettingsModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(inputUrl('variation-losses'), {
            plastId: model.plastId,
            productionObjectId: model.productionObjectId,
            startDate: yyyymmdd(model.startDate),
            endDate: yyyymmdd(model.endDate)
        })
    );
};

export const getExportMapGrid = async (
    propName: GridMapEnum,
    well: WellBrief,
    plastId: number,
    date: Date = null,
    optimization: boolean = false
): Promise<any> => {
    const query: Array<[string, string]> = [
        ['propName', enm(propName)],
        ['oilFieldId', str(well.oilFieldId)],
        ['prodObjId', str(well.prodObjId)],
        ['scenarioId', str(well.scenarioId)],
        ['plastId', str(plastId)],
        ['date', date ? yyyymmdd(date) : null],
        ['optimization', str(optimization)]
    ];

    return axiosGetBlobWithAuth(inputUrl(plastId ? 'export-map-grid' : 'export-map-grid-zip', [], query));
};

export const getMers = async (): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosGetWithAuth(inputUrl('mers')));
};

export const getMersByParams = async (well: WellBrief): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['wellId', str(well.id)],
        ['prodObjId', enm(well.prodObjId)],
        ['charWorkId', enm(well.charWorkId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(inputUrl('mersByParams', [], query)));
};

export const getDailyByParams = async (well: WellBrief): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['wellId', str(well.id)],
        ['prodObjId', enm(well.prodObjId)],
        ['charWorkId', enm(well.charWorkId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(inputUrl('dailyByParams', [], query)));
};

export const getChartDataByParams = async (selectedWell: WellBrief): Promise<any> => {
    return axios.all([getMersByParams(selectedWell), getDailyByParams(selectedWell)]);
};

export const getMap = async (): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosGetWithAuth(inputUrl('map')));
};

export const getMapHistoryRange = async (wells: WellBrief[], source: DataTypeEnum): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(inputUrl('mapHistoryRange'), {
            wells: wells,
            source: source
        })
    );
};

export const getMapByParams = async (
    wells: WellBrief[],
    plastId: number,
    radius: number,
    source: DataTypeEnum,
    distribution: DistributionType,
    date: Date = null,
    showNaturalRadius: boolean = false
): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(inputUrl('map'), {
            wells: wells,
            plastId: plastId,
            radius: radius,
            source: source,
            distribution: distribution,
            date: date ? yyyymmdd(date) : null,
            showNaturalRadius: showNaturalRadius
        })
    );
};

export const getAvailableGrids = async (wells: WellBrief[], plastId: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(inputUrl('available-grids'), {
            wells: wells,
            plastId: plastId
        })
    );
};

export const getKrigingDefaultDates = async (prodObjId: number): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [['productionObjectId', str(prodObjId)]];

    return handleResponsePromise(axiosGetWithAuth(inputUrl('kriging-default-dates', [], query)));
};

export const getTabletData = async (
    productionObjectId: number,
    wells: number[],
    indent: number = 1000
): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['productionObjectId', str(productionObjectId)],
        ['indent', str(indent)]
    ];

    forEach(it => query.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(inputUrl('tablet-data', [], query)));
};

export const getMultipleMers = async (wells: WellBrief[]): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrl('multiple-mers'), { wells: wells }));
};

export const getChartDataOnlySelectedWells = async (wells: WellBrief[]): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrl('chart-data-selected-wells'), { wells: wells }));
};

export const getChartCompareData = async (
    param: ChartCompareEnum,
    wells: WellBrief[]
): Promise<ServerResponse<InputCompareModel[]>> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrl('chart-compare'), { param, wells }));
};

export const mapContourAdd = async (model: InputMapContourModel): Promise<any> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrl('map-contour-add'), model));
};

export const mapContourUpdate = async (model: InputMapContourModel): Promise<any> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrl('map-contour-update'), model));
};

export const mapContourRemove = async (model: InputMapContourModel): Promise<any> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrl('map-contour-remove'), model));
};

export const exportTabletData = async (productionObjectId: number, wells: number[]): Promise<any> => {
    const query: Array<[string, string]> = [['productionObjectId', str(productionObjectId)]];

    forEach(it => query.push(['wells', str(it)]), wells);

    return axiosGetBlobWithAuth(inputUrl('export-tablet-data', [], query));
};

export const exportMapData = async (wells: WellBrief[]): Promise<any> => {
    return axiosPostBlobWithAuth(inputUrl('export-map-data'), { wells });
};

export const checkBatchStatusGet = async (jobId: number): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [['id', str(jobId)]];

    return handleResponsePromise(axiosGetWithAuth(inputUrlRobot('check', [], query)));
};

export const startKrigingBatchPost = async (model: KrigingCalcSettingsModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(
            inputUrlRobot('start'),
            mergeRight(model, {
                startDate: model.startDate ? yyyymmdd(model.startDate) : null,
                endDate: model.endDate ? yyyymmdd(model.endDate) : null,
                params: map(it => +it, model.params),
                byPlast: model.byObject === 2 // todo mb
            })
        )
    );
};

export const abortKrigingPost = async (jobId: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(inputUrlRobot('abort'), { id: jobId }));
};
