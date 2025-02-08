import { atom } from 'recoil';

import { BestAdaptationEnum } from '../../../../proxy/subModules/calculation/enums/bestAdaptationEnum';

export const modeState = atom<BestAdaptationEnum>({
    key: 'predictionResults__modeState',
    default: BestAdaptationEnum.ByOil
});
