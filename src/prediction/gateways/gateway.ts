import { CopyCharworkModel } from '../../calculation/entities/copyCharworkModel';
import { ScenarioModel } from '../../calculation/entities/scenarioModel';
import { WellBrief } from '../../common/entities/wellBrief';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str,
    url
} from '../../common/helpers/serverPath';

const controllerName: string = 'prediction';

export const predictionUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url(controllerName, actionName, opts, query);

// todo mb why?
export const getScenarios = async (well: WellBrief): Promise<ServerResponse<ScenarioModel[]>> => {
    const params: [string, string][] = [
        ['wellId', str(well.id)],
        ['productionObjectId', str(well.prodObjId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(predictionUrl('scenarios', [], params)));
};

export const copyCharworks = async (model: CopyCharworkModel): Promise<ServerResponse<number>> => {
    return handleResponsePromise(axiosPostWithAuth(predictionUrl('copy-charworks'), model));
};
