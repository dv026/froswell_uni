import { map, prop, sortBy } from 'ramda';
import { selector } from 'recoil';

import { proxySharedState } from '../../calculation/store/sharedCalculation';
import { KeyValue } from '../../common/entities/keyValue';

export const allPlasts = selector<KeyValue[]>({
    key: 'calculation__allPlasts',
    get: async ({ get }) => {
        const shared = get(proxySharedState);

        return sortBy(prop('id'))(map(x => new KeyValue(x.id, x.name), shared?.plasts ?? []));
    }
});
