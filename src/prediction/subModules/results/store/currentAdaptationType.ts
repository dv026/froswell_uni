import { atom } from 'recoil';

import { BestAdaptationEnum } from '../../../../proxy/subModules/calculation/enums/bestAdaptationEnum';

export const currentAdaptationTypeState = atom<BestAdaptationEnum>({
    key: 'predictionResults__currentAdaptationTypeState',
    default: BestAdaptationEnum.ByOil
});
