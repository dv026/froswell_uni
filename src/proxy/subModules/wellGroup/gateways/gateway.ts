import { filter, map } from 'ramda';

import { WellGroupItem, WellGroupItemRaw } from '../../../../calculation/entities/wellGroupItem';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { proxyUrl } from '../../../../proxy/gateways/gateway';

export const loadProxyWells = async (scenarioId: number): Promise<ServerResponse<WellGroupItemRaw[]>> => {
    return handleResponsePromise(axiosGetWithAuth(proxyUrl('adaptation-wells', [], [['scenarioId', str(scenarioId)]])));
};

export const saveAdaptationWellGroup = async (
    model: WellGroupItem[],
    scenarioId: number
): Promise<ServerResponse<number>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('save-adaptation-well-group'), {
            wells: map(
                (it: WellGroupItem) => it.id,
                filter(x => x.selected, model)
            ),
            scenarioId: scenarioId
        })
    );
};
