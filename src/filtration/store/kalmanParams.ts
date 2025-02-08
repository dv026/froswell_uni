import { atom } from 'recoil';

import { KalmanChartModel } from '../entities/kalmanChartModel';

export const kalmanParamsState = atom<KalmanChartModel>({
    key: 'filtration__kalmanParamsState',
    default: new KalmanChartModel()
});

export const showToolState = atom<boolean>({
    key: 'filtration__showToolState',
    default: true
});
