import { map } from 'ramda';

import { BatchStatus } from '../../../../common/entities/batchStatus';
import { dateWithoutZone } from '../../../../common/helpers/date';
import { shallow } from '../../../../common/helpers/ramda';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str,
    urlRobot
} from '../../../../common/helpers/serverPath';
import { KrigingCalcSettingsModel } from '../../../../input/entities/krigingCalcSettings';

export const checkBatchStatus = async (jobId: number): Promise<ServerResponse<BatchStatus>> => {
    const query: Array<[string, string]> = [['id', str(jobId)]];

    return handleResponsePromise(axiosGetWithAuth(urlRobot('prediction', 'check', [], query)));
};

export const calcKriging = async (
    model: KrigingCalcSettingsModel,
    scenarioId: number,
    subScenarioId: number
): Promise<ServerResponse<BatchStatus>> => {
    const path = urlRobot('prediction', 'start');

    const postModel = shallow(model, {
        endDate: dateWithoutZone(model.endDate),
        startDate: dateWithoutZone(model.startDate),
        scenarioId: scenarioId,
        subScenarioId: subScenarioId,
        optimization: model.optimization
    });

    return handleResponsePromise(
        axiosPostWithAuth(path, {
            ...postModel,
            params: map(it => +it, model.params)
        })
    );
};

export const abortKriging = async (jobId: number): Promise<ServerResponse<boolean>> => {
    const path = urlRobot('prediction', 'abort');
    return handleResponsePromise(axiosPostWithAuth(path, { id: jobId }));
};
