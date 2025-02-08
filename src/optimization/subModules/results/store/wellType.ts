import { any } from 'ramda';
import { atom, selector } from 'recoil';

import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { currentSpot } from '../../../store/well';
import { DateResults } from '../entities/dateResults';
import { siteDetailsState } from './siteDetails';

const defaultWellType = selector<WellTypeEnum>({
    key: 'optimizationResults__defaultWellType',
    get: async ({ get }) => {
        const site = get(siteDetailsState);
        const well = get(currentSpot);

        return well.id
            ? any((x: DateResults) => x.injectionINSIM > 0 && x.mainO === site.bestMainO, site.dynamic)
                ? WellTypeEnum.Injection
                : WellTypeEnum.Oil
            : WellTypeEnum.Oil;
    }
});

export const wellTypeState = atom<WellTypeEnum>({
    key: 'optimizationResults__wellTypeState',
    default: defaultWellType
});
