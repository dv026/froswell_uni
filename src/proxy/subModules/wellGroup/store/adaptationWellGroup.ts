import { filter, map } from 'ramda';
import { atom, selector, useResetRecoilState, useSetRecoilState } from 'recoil';

import { fromRaw, WellGroupItem } from '../../../../calculation/entities/wellGroupItem';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { loadProxyWells } from '../gateways/gateway';

const adaptationWellGroupRequestId = atom<number>({
    key: 'proxyWellGroup__adaptationWellGroupRequestId',
    default: 0
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useRefetchAdaptationWellGroup = () => {
    const setRequestId = useSetRecoilState(adaptationWellGroupRequestId);

    const reset = useResetRecoilState(adaptationWellGroupState);

    return () => {
        reset();
        setRequestId(id => id + 1);
    };
};

const adaptationWellGroupLoad = selector<WellGroupItem[]>({
    key: 'proxyWellGroup__adaptationWellGroupLoad',
    get: async ({ get }) => {
        get(adaptationWellGroupRequestId);

        const scenarioId = get(currentScenarioId);

        const response = await loadProxyWells(scenarioId);

        return map(fromRaw, response.data);
    }
});

export const adaptationWellGroupState = atom<WellGroupItem[]>({
    key: 'proxyWellGroup__adaptationWellGroupState',
    default: adaptationWellGroupLoad
});

export const adaptationWellGroupNumbers = selector<number[]>({
    key: 'proxyWellGroup__adaptationWellGroupNumbers',
    get: async ({ get }) => {
        const wells = get(adaptationWellGroupState);

        return map(
            (x: WellGroupItem) => x.id,
            filter(it => it.selected, wells)
        );
    }
});
