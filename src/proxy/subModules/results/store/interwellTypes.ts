import { find } from 'ramda';
import { selectorFamily } from 'recoil';

import { proxySharedState } from '../../../../calculation/store/sharedCalculation';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';

export const interwellTypesSelector = selectorFamily({
    key: 'proxyResults__interwellTypesSelector',
    get:
        (neighborId: number) =>
        ({ get }) => {
            const shared = get(proxySharedState);

            const well = find(x => x.id === shared?.well?.id, shared.wells || []);
            const neighbor = find(x => x.id === neighborId, shared?.wells || []);

            return [
                { name: well?.name ?? '', type: well?.charWorkId ?? WellTypeEnum.Unknown },
                { name: neighbor?.name ?? '', type: neighbor?.charWorkId ?? WellTypeEnum.Unknown }
            ];
        }
});
