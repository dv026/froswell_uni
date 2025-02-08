import { Point } from '../../../../common/entities/canvas/point';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { proxyUrl } from '../../../../proxy/gateways/gateway';
import { AdaptationWellPropertyRaw } from '../entities/adaptationWellPropertyRaw';

export const loadProxyEditModel = async (
    scenarioId: number,
    plastId: number
): Promise<ServerResponse<AdaptationWellPropertyRaw[]>> => {
    return handleResponsePromise(
        axiosGetWithAuth(
            proxyUrl(
                'adaptation-wells-properties',
                [],
                [
                    ['scenarioId', str(scenarioId)],
                    ['plastId', str(plastId)]
                ]
            )
        )
    );
};

export const saveAdaptationEditModel = async (
    scenarioId: number,
    plastId: number,
    volume: number,
    transmissibility: number,
    allPlasts: boolean,
    polygon: Point[]
): Promise<ServerResponse<number>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('save-adaptation-edit-model'), {
            scenarioId: scenarioId,
            plastId: plastId,
            prevolumeMultiplier: volume,
            transmissibilityMultiplier: transmissibility,
            allPlasts: allPlasts,
            polygon: polygon
        })
    );
};

export const copyAreaEditModel = async (
    sourceScenarioId: number,
    targetScenarioId: number,
    plastId: number,
    allPlasts: boolean,
    polygon: Point[]
): Promise<ServerResponse<number>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('copy-area-edit-model'), {
            sourceScenarioId: sourceScenarioId,
            targetScenarioId: targetScenarioId,
            plastId: plastId,
            allPlasts: allPlasts,
            polygon: polygon
        })
    );
};
