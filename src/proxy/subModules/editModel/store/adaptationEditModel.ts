import { atom, selector, useResetRecoilState, useSetRecoilState } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { AdaptationWellPropertyRaw } from '../entities/adaptationWellPropertyRaw';
import { loadProxyEditModel } from '../gateways/gateway';

const adaptationEditModelRequestId = atom<number>({
    key: 'proxyEditModel__adaptationEditModelRequestId',
    default: 0
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useRefetchAdaptationEditModel = () => {
    const setRequestId = useSetRecoilState(adaptationEditModelRequestId);

    const reset = useResetRecoilState(adaptationEditModelState);

    return () => {
        reset();
        setRequestId(id => id + 1);
    };
};

const adaptationEditModelLoad = selector<AdaptationWellPropertyRaw[]>({
    key: 'proxyEditModel__adaptationEditModelLoad',
    get: async ({ get }) => {
        get(adaptationEditModelRequestId);

        const scenarioId = get(currentScenarioId);
        const plastId = get(currentPlastId);

        const response = await loadProxyEditModel(scenarioId, plastId);

        return response.data;
    }
});

export const adaptationEditModelState = atom<AdaptationWellPropertyRaw[]>({
    key: 'proxyEditModel__adaptationEditModelState',
    default: adaptationEditModelLoad
});
