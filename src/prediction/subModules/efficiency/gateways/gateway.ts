import { url } from 'common/helpers/serverPath';
import { DateResults } from 'commonEfficiency/entities/dateResults';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { ReportExportEfficiencyModel } from 'prediction/subModules/results/entities/exportEfficiencyModel';
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

const controllerName: string = 'predictionEfficiency';

export const predictionEfficiencyUrl = (
    actionName: string,
    opts: string[] = [],
    query: [string, string][] = []
): string => url(controllerName, actionName, opts, query);

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

    return handleResponsePromise(axiosGetWithAuth(predictionEfficiencyUrl('dynamic', [], params)));
};

export const getAdaptationData = async (
    well: WellBrief,
    plastId: number,
    optimization: boolean = false
): Promise<ServerResponse<DateResults[]>> => {
    const params: Array<[string, string]> = [
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['wellId', str(well.id)],
        ['plastId', str(plastId)],
        ['optimization', str(optimization)]
    ];

    return handleResponsePromise(axiosGetWithAuth(predictionEfficiencyUrl('adaptation', [], params)));
};

export const getMapByParams = async (
    well: WellBrief,
    plastId: number,
    date: Date = null,
    selectedWells: number[] = null,
    evaluationType: EvaluationTypeEnum,
    gtmType: number,
    accumulated: boolean,
    optimization: boolean = false
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
        ['evaluationType', str(evaluationType)],
        ['gtmType', str(gtmType)],
        ['accumulated', str(accumulated)],
        ['optimization', str(optimization)]
    ];

    // отправить выбраные скважины для отображения потоков
    if (selectedWells && selectedWells.length > 1) {
        forEach(it => query.push(['selectedWells', str(it)]), selectedWells);
    }

    return handleResponsePromise(axiosGetWithAuth(predictionEfficiencyUrl('map', [], query)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reportExport = async (model: ReportExportEfficiencyModel): Promise<any> => {
    const query: Array<[string, string]> = [
        ['scenarioId', str(model.scenarioId)],
        ['subScenarioId', str(model.subScenarioId)],
        ['productionObjectId', str(model.productionObjectId)],
        ['plastId', str(model.plastId)],
        ['optimization', str(model.optimization)]
    ];

    return axiosGetBlobWithAuth(predictionEfficiencyUrl('report', [], query));
};

export const getTabletData = async (
    well: WellBrief,
    wells: number[],
    evaluationType: EvaluationTypeEnum,
    gtmType: number,
    optimization: boolean = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(well.prodObjId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)],
        ['evaluationType', str(evaluationType)],
        ['gtmType', str(gtmType)],
        ['optimization', str(optimization)]
    ];

    forEach(it => params.push(['wells', str(it)]), wells);

    return handleResponsePromise(axiosGetWithAuth(predictionEfficiencyUrl('tablet-data', [], params)));
};
