import { DistributionType } from 'input/enums/distributionType';
import { atom } from 'recoil';

export const distributionTypeState = atom<DistributionType>({
    key: 'input__distributionTypeState',
    default: DistributionType.Rigis
});
