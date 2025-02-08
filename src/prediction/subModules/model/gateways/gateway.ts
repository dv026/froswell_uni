import { BatchStatus } from '../../../../common/entities/batchStatus';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str,
    urlRobot
} from '../../../../common/helpers/serverPath';
import { ImprovementBatchStatus } from '../../../../proxy/entities/proxyMap/ImprovementBatchStatus';
import { CalculationSubScenariosModel } from '../../../../proxy/entities/proxyMap/calculationSubScenariosModel';
import { ImprovementModel } from '../../../../proxy/entities/proxyMap/improvementModel';
import { SubScenarioModel } from '../../../../proxy/entities/proxyMap/subScenarioModel';
import { proxyUrl } from '../../../../proxy/gateways/gateway';

export const addSubScenario = async (model: SubScenarioModel): Promise<ServerResponse<number>> => {
    const path = proxyUrl('add-sub-scenario');
    return handleResponsePromise(axiosPostWithAuth(path, model));
};

export const copySubScenario = async (model: SubScenarioModel): Promise<ServerResponse<number>> => {
    const path = proxyUrl('copy-sub-scenario');
    return handleResponsePromise(axiosPostWithAuth(path, model));
};

export const removeSubScenario = async (id: number): Promise<ServerResponse<boolean>> => {
    const path = proxyUrl('remove-sub-scenario');
    return handleResponsePromise(axiosPostWithAuth(path, new SubScenarioModel(id, '', null)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editSubScenario = async (s: SubScenarioModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('update-sub-scenario'), s));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calcSubScenarios = async (model: CalculationSubScenariosModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('calc-sub-scenarios'), model));
};

export const checkSubScenarioBatchStatus = async (jobId: number): Promise<ServerResponse<BatchStatus>> => {
    const query: Array<[string, string]> = [['id', str(jobId)]];
    return handleResponsePromise(axiosGetWithAuth(urlRobot('subscenario', 'check', [], query)));
};

export const startSubScenarioCalculationBatch = async (
    model: CalculationSubScenariosModel
): Promise<ServerResponse<BatchStatus>> => {
    return handleResponsePromise(axiosPostWithAuth(urlRobot('subscenario', 'start'), model));
};

export const abortSubScenarioCalculation = async (jobId: number): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(axiosPostWithAuth(urlRobot('subscenario', 'abort'), { id: jobId }));
};

export const checkImprovementBatchStatus = async (jobId: number): Promise<ServerResponse<ImprovementBatchStatus>> => {
    const query: Array<[string, string]> = [['id', str(jobId)]];
    return handleResponsePromise(axiosGetWithAuth(urlRobot('scenarioImprovement', 'check', [], query)));
};

export const startImprovementBatch = async (model: ImprovementModel): Promise<ServerResponse<BatchStatus>> => {
    return handleResponsePromise(axiosPostWithAuth(urlRobot('scenarioImprovement', 'start'), model));
};

export const abortImprovementBatch = async (jobId: number): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(axiosPostWithAuth(urlRobot('scenarioImprovement', 'abort'), { id: jobId }));
};
