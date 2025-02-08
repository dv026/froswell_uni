import { find } from 'ramda';
import { atom, selector, selectorFamily } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { GeologicalReservesCalculationParams } from '../../../entities/proxyMap/calculationSettingsModel';
import { getGeologicalReservesCalculationParams } from '../../../gateways/wellGrid/gateway';
import { GeologicalReserveType } from '../enums/geologicalReserveType';

export const geologicalReservesIsLoadingState = atom<boolean>({
    key: 'proxy__geologicalReservesIsLoadingState',
    default: false
});

export const geologicalReservesSettings = selector<GeologicalReservesCalculationParams[]>({
    key: 'proxy__geologicalReservesSettings',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const scenarioId = get(currentScenarioId);

        const { data } = await getGeologicalReservesCalculationParams(scenarioId, plastId);

        return data;
    }
});

export const geologicalReservesByType = selectorFamily({
    key: 'proxy__geologicalReservesByType',
    get:
        (type: number) =>
        ({ get }) => {
            const settings = get(geologicalReservesSettings);

            return find(it => it.typeReserves === type, settings ?? []);
        }
});

const currentVolumeReservoir = selector<number>({
    key: 'proxy__currentVolumeReservoir',
    get: async ({ get }) => {
        const settings = get(geologicalReservesByType(GeologicalReserveType.All));

        return settings?.currentVolumeReservoir ?? 0;
    }
});

export const currentVolumeReservoirState = atom<number>({
    key: 'proxy__currentVolumeReservoirState',
    default: currentVolumeReservoir
});
