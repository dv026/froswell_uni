import { url } from 'common/helpers/serverPath';
import { DateResults } from 'commonEfficiency/entities/dateResults';
import { ReportExportModel } from 'commonEfficiency/entities/exportModel';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { forEach } from 'ramda';

import { WellBrief } from '../../../../common/entities/wellBrief';
import { yyyymmdd } from '../../../../common/helpers/date';
import {
    axiosGetBlobWithAuth,
    axiosGetWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';

const controllerName: string = 'efficiency';

export const efficiencyUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url(controllerName, actionName, opts, query);

export const getDynamicData = async (
    well: WellBrief,
    plastId: number,
    gtmType: GtmTypeEnum,
    date: Date = null
): Promise<ServerResponse<DateResults[]>> => {
    const params: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['productionObjectId', str(well.prodObjId)],
        ['wellId', str(well.id)],
        ['wellType', str(well.charWorkId)],
        ['scenarioId', str(well.scenarioId)],
        //['plastId', str(plastId)],
        ['gtmType', str(gtmType)],
        ['date', date ? yyyymmdd(date) : null]
    ];

    return handleResponsePromise(axiosGetWithAuth(efficiencyUrl('dynamic', [], params)));
};

export const getAdaptationData = async (
    well: WellBrief,
    plastId: number,
    gtmType: GtmTypeEnum,
    date: Date = null
): Promise<ServerResponse<DateResults[]>> => {
    const params: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['productionObjectId', str(well.prodObjId)],
        ['wellId', str(well.id)],
        ['wellType', str(well.charWorkId)],
        ['scenarioId', str(well.scenarioId)],
        ['plastId', str(plastId)],
        ['gtmType', str(gtmType)],
        ['date', date ? yyyymmdd(date) : null]
    ];

    return handleResponsePromise(axiosGetWithAuth(efficiencyUrl('adaptation', [], params)));
};

export const getMapByParams = async (
    well: WellBrief,
    plastId: number,
    date: Date = null,
    selectedWells: number[] = null,
    evaluationType: EvaluationTypeEnum,
    gtmType: number,
    accumulated: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['prodObjId', str(well.prodObjId)],
        ['scenarioId', str(well.scenarioId)],
        ['plastId', str(plastId)],
        ['wellId', str(well.id)],
        ['wellType', str(well.charWorkId)],
        ['date', date ? yyyymmdd(date) : null],
        ['evaluationType', str(evaluationType)],
        ['gtmType', str(gtmType)],
        ['accumulated', str(accumulated)]
    ];

    // отправить выбраные скважины для отображения потоков
    if (selectedWells && selectedWells.length > 1) {
        forEach(it => query.push(['selectedWells', str(it)]), selectedWells);
    }

    return handleResponsePromise(axiosGetWithAuth(efficiencyUrl('map', [], query)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reportExport = async (model: ReportExportModel): Promise<any> => {
    const query: Array<[string, string]> = [
        ['scenarioId', str(model.scenarioId)],
        ['productionObjectId', str(model.productionObjectId)],
        ['plastId', str(model.plastId)],
        ['evaluationType', str(model.evaluationType)],
        ['gtmType', str(model.gtmType)]
    ];

    return axiosGetBlobWithAuth(efficiencyUrl('report', [], query));
};

export const getTabletData = async (
    productionObjectId: number,
    scenarioId: number,
    wells: number[],
    evaluationType: EvaluationTypeEnum,
    gtmType: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(productionObjectId)],
        ['scenarioId', str(scenarioId)],
        ['evaluationType', str(evaluationType)],
        ['gtmType', str(gtmType)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(efficiencyUrl('tablet-data', [], params)));
};
