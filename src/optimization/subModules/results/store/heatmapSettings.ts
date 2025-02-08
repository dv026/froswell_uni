import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentSpot } from '../../../store/well';
import { HeatmapSettings } from '../entities/heatmapSettings';
import { requestHeatmap } from '../gateways/gateway';

const heatmapLoad = selector<HeatmapSettings>({
    key: 'optimizationResults__heatmapLoad',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const plastId = get(currentPlastId);

        const { data: response } = await requestHeatmap(well, plastId);

        return response;
    }
});

export const heatmapSettingsState = atom<HeatmapSettings>({
    key: 'optimizationResults__heatmapSettingsState',
    default: heatmapLoad
});
