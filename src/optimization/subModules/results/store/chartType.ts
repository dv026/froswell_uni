import { atom } from 'recoil';

import { ChartType } from '../../../../prediction/subModules/results/enums/chartType';

export const chartTypeState = atom<ChartType>({
    key: 'optimizationResults__chartTypeState',
    default: ChartType.Dynamic
});
