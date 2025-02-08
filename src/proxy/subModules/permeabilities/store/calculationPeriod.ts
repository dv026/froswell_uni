import { selectorFamily } from 'recoil';

import { optimalCalculatePeriod } from '../gateways/gateway';

export const calculationPeriod = selectorFamily({
    key: 'proxyPermeability__calculationPeriod',
    get: (scenarioId: number) => async () => {
        const response = await optimalCalculatePeriod(scenarioId);
        return response.data;
    }
});
