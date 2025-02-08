import { WellBrief } from '../../../../common/entities/wellBrief';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { proxyUrl } from '../../../../proxy/gateways/gateway';
import { WellSetupCopyModel } from '../entities/wellSetupCopyModel';
import { WellSetupModel } from '../entities/wellSetupModel';
import { WellSetupRaw } from '../entities/wellSetupRaw';
import { WellSetupSavedModel } from '../entities/wellSetupSavedModel';

interface DataResponse {
    data: WellSetupRaw[];
    saved: WellSetupModel[];
}

export const requestWellSetups = async (well: WellBrief): Promise<ServerResponse<DataResponse>> => {
    const params: [string, string][] = [
        ['productionObjectId', str(well.prodObjId)],
        ['scenarioId', str(well.scenarioId)],
        ['subScenarioId', str(well.subScenarioId)]
    ];

    return handleResponsePromise<DataResponse>(axiosGetWithAuth(proxyUrl('get-well-setups', [], params)));
};

export const createOrUpdate = (
    model: WellSetupSavedModel[],
    clear: boolean = false
): Promise<ServerResponse<number>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('create-or-update-well-setup'), { model: model, clear: clear })
    );
};

export const copyLimits = (model: WellSetupCopyModel): Promise<ServerResponse<number>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('copy-limits-well-setup'), { model: model }));
};
