import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import {
    CalculationSettingsModel,
    getDefaultInterwellsCalculationParams,
    InterwellsCalculationParams
} from '../../../entities/proxyMap/calculationSettingsModel';
import { getInterwellsCalculationParams } from '../../../gateways/wellGrid/gateway';

export const calculationSettingsState = atom<CalculationSettingsModel>({
    key: 'proxyModel__calculationSettingsState',
    default: new CalculationSettingsModel()
});

/**
 * Определяет состояние параметров для расчета межскважинных соединений
 */
const interwellsSettingsGetter = selector<InterwellsCalculationParams>({
    key: 'proxy__interwellsCalculationParams',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const scenarioId = get(currentScenarioId);

        const response = await getInterwellsCalculationParams(scenarioId, plastId);

        if (response.error || !response.data) {
            return getDefaultInterwellsCalculationParams();
        }

        return response.data;
    }
});

export const interwellsCalculationParamsState = atom<InterwellsCalculationParams>({
    key: 'proxy__interwellsCalculationParamsAtom',
    default: interwellsSettingsGetter
});
