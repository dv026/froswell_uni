import { atom } from 'recoil';

import { PermeabilityParams } from '../entities/permeabilityParams';

export const paramsState = atom<PermeabilityParams>({
    key: 'proxyPermeability__paramsState',
    default: new PermeabilityParams()
});

export const paramsIsLoadingState = atom<boolean>({
    key: 'proxyPermeability__paramsIsLoadingState',
    default: false
});
