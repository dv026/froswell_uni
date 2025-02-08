import { atom } from 'recoil';

import { WellDateLabel } from '../../../common/entities/mapCanvas/wellDateLabel';
import { WellBrief } from '../../../common/entities/wellBrief';

export interface ProxyWellGridState {
    dateLabels: WellDateLabel[];
    errors: number[];
    showInterwells: boolean;
    showAquifer: boolean;
    showPlastNames: boolean;
    well: WellBrief;
}

const initialState: ProxyWellGridState = {
    dateLabels: [],
    errors: [],
    showInterwells: true,
    showAquifer: true,
    showPlastNames: true,
    well: null
};

export const wellGridState = atom<ProxyWellGridState>({
    key: 'proxyMap__wellGridState',
    default: initialState
});
