import { find } from 'ramda';
import { selectorFamily } from 'recoil';

import { reportState } from './report';

export const frontTrackingBoundaries = selectorFamily({
    key: 'proxyResults__frontTrackingBoundaries',
    get:
        (plastId: number) =>
        ({ get }) => {
            const report = get(reportState);

            return (
                find(x => x.plastId === plastId, report?.insim?.frontTrackingBoundaries ?? []) ?? {
                    plastId: plastId,
                    initialWaterSaturation: null,
                    residualOilSaturation: null
                }
            );
        }
});
