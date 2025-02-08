import { atom } from 'recoil';

import { InputParamEnum } from '../enums/inputParamEnum';

export const disabledOilLinesState = atom<InputParamEnum[]>({
    key: 'filtration__disabledOilLinesState',
    default: [InputParamEnum.BottomHolePressure, InputParamEnum.BottomHolePressureOld]
});
