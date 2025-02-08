// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScenarioModel } from '../../calculation/entities/scenarioModel';
import { axiosGetWithAuth, handleResponsePromise, str, url, ServerResponse } from '../../common/helpers/serverPath';

const controllerName: string = 'proxy';

export const proxyUrl = (actionName: string, opts: Array<string> = [], query: Array<[string, string]> = []): string =>
    url(controllerName, actionName, opts, query);

export const getPreparationObject = async (
    productionObjectId: number,
    oilfieldId: number,
    scenarioId: number
): Promise<ServerResponse<any>> => {
    const params: Array<[string, string]> = [
        ['productionObjectId', str(productionObjectId)],
        ['oilfieldId', str(oilfieldId)],
        ['scenarioId', str(scenarioId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('preparation', [], params)));
};

export const getScenarios = async (productionObjectId: number): Promise<ServerResponse<ScenarioModel[]>> => {
    const params: Array<[string, string]> = [['productionObjectId', str(productionObjectId)]];

    return handleResponsePromise(axiosGetWithAuth(proxyUrl('get-scenarios', [], params)));
};
