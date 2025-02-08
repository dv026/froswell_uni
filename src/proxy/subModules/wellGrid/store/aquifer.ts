import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { AquiferCalculationParams } from '../../../entities/proxyMap/calculationSettingsModel';
import { getAquiferCalculationParams } from '../../../gateways/wellGrid/gateway';

export const aquiferIsLoadingState = atom<boolean>({
    key: 'proxyWellGrid__aquiferIsLoadingState',
    default: false
});

const aquiferSettings = selector<AquiferCalculationParams>({
    key: 'proxy__aquiferSettings',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const scenarioId = get(currentScenarioId);

        const { data } = await getAquiferCalculationParams(scenarioId, plastId);

        return data;
    }
});

const indentWaterOilContact = selector<number>({
    key: 'proxy__indentWaterOilContact',
    get: async ({ get }) => {
        const settings = get(aquiferSettings);

        return settings?.indentWaterOilContact ?? 300;
    }
});

export const indentWaterOilContactState = atom<number>({
    key: 'proxyWellGrid__indentWaterOilContactState',
    default: indentWaterOilContact
});
