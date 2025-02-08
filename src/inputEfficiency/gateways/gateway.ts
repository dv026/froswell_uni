import { url } from 'common/helpers/serverPath';
import { DateResults } from 'commonEfficiency/entities/dateResults';
import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { ReportExportEfficiencyModel } from 'prediction/subModules/results/entities/exportEfficiencyModel';
import { forEach } from 'ramda';

import { WellBrief } from '../../common/entities/wellBrief';
import { yyyymmdd } from '../../common/helpers/date';
import {
    axiosGetBlobWithAuth,
    axiosGetWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../common/helpers/serverPath';

const controllerName: string = 'inputEfficiency';

export const inputEfficiencyUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url(controllerName, actionName, opts, query);

export const getDynamicData = async (well: WellBrief, gtmType: GtmTypeEnum): Promise<ServerResponse<DateResults[]>> => {
    const params: Array<[string, string]> = [
        ['productionObjectId', str(well.prodObjId)],
        ['wellId', str(well.id)],
        ['gtmType', str(gtmType)]
    ];

    return handleResponsePromise(axiosGetWithAuth(inputEfficiencyUrl('dynamic', [], params)));
};

export const getMapByParams = async (
    well: WellBrief,
    plastId: number,
    date: Date = null,
    gtmType: number,
    accumulated: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const query: Array<[string, string]> = [
        ['oilFieldId', str(well.oilFieldId)],
        ['prodObjId', str(well.prodObjId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['plastId', str(plastId)],
        ['wellId', str(well.id)],
        ['wellType', str(well.charWorkId)],
        ['date', date ? yyyymmdd(date) : null],
        ['gtmType', str(gtmType)],
        ['accumulated', str(accumulated)]
    ];

    return handleResponsePromise(axiosGetWithAuth(inputEfficiencyUrl('map', [], query)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reportExport = async (model: ReportExportEfficiencyModel): Promise<any> => {
    const query: Array<[string, string]> = [
        ['productionObjectId', str(model.productionObjectId)],
        ['plastId', str(model.plastId)]
    ];

    return axiosGetBlobWithAuth(inputEfficiencyUrl('report', [], query));
};

export const getTabletData = async (
    well: WellBrief,
    wells: number[],
    gtmType: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(well.prodObjId)],
        ['gtmType', str(gtmType)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(inputEfficiencyUrl('tablet-data', [], params)));
};
