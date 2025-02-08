import { WellGroupItemRaw } from '../../../../calculation/entities/wellGroupItem';
import { axiosGetWithAuth, handleResponsePromise, ServerResponse, str } from '../../../../common/helpers/serverPath';
import { proxyUrl } from '../../../../proxy/gateways/gateway';

export const loadOptimizationWells = async (subScenarioId: number): Promise<ServerResponse<WellGroupItemRaw[]>> => {
    return handleResponsePromise(
        axiosGetWithAuth(proxyUrl('optimization-wells', [], [['subScenarioId', str(subScenarioId)]]))
    );
};
