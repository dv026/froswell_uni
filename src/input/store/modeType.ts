import { atom } from 'recoil';

import { ModeTypeEnum } from '../../common/enums/modeType';

export const modeTypeState = atom<ModeTypeEnum>({
    key: 'input__modeTypeState',
    default: ModeTypeEnum.Daily
});
