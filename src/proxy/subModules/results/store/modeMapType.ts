import { atom } from 'recoil';

import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';

export const modeMapTypeState = atom<ModeMapEnum>({
    key: 'proxyResults__modeMapTypeState',
    default: ModeMapEnum.Daily
});
