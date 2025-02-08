import { atom } from 'recoil';

import { InputParamEnum } from '../enums/inputParamEnum';

export const disabledInjectionLinesState = atom<InputParamEnum[]>({
    key: 'filtration__disabledInjectionLinesState',
    default: []
});
