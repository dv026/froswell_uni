import { atom } from 'recoil';

import { ChartType } from '../enums/chartType';

export const chartTypeState = atom<ChartType>({
    key: 'predictionResults__chartTypeState',
    default: ChartType.Dynamic
});
