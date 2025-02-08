import { atom } from 'recoil';

import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';

export const modeMapTypeState = atom<ModeMapEnum>({
    key: 'optimizationResults__modeMapTypeState',
    default: ModeMapEnum.Daily
});
