import { BestAdaptationEnum } from 'proxy/subModules/calculation/enums/bestAdaptationEnum';
import { atom } from 'recoil';

export const modeState = atom<BestAdaptationEnum>({
    key: 'predictionResults__modeState',
    default: BestAdaptationEnum.ByOil
});
