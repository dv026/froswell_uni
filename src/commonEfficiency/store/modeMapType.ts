import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { atom } from 'recoil';

export const modeMapTypeState = atom<ModeMapEnum>({
    key: 'commonEfficiency__modeMapTypeState',
    default: ModeMapEnum.Accumulated
});
