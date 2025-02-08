import { selector } from 'recoil';

import { getCurrentDb } from '../gateways';

export const dbState = selector<string>({
    key: 'maintain__dbState',
    get: async () => {
        const { data } = await getCurrentDb();

        return data;
    }
});
