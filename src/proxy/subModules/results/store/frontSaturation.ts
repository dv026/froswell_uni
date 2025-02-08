import { concat, filter, find, groupBy, map, mapObjIndexed, pipe, reduce, sortBy } from 'ramda';
import { selectorFamily } from 'recoil';

import {
    DateSaturation,
    DistanceSaturation,
    NeighborFrontTracking,
    SaturationOnDate
} from '../../../entities/frontTracking/frontTracking';
import { reportState } from './report';

export const frontSaturations = selectorFamily({
    key: 'proxyResults__frontSaturations',
    get:
        (neighborId: number) =>
        ({ get }) => {
            const report = get(reportState);

            const neighborValues = find(
                x => x.neighborWellId === neighborId,
                report?.insim?.frontTracking?.neighbors ?? []
            ) ?? { dates: [] };

            const allDistances = reduce(distances, [], neighborValues.dates);
            const grouped = groupBy(x => x.frontSaturation.toString(), allDistances);
            return grouped;
        }
});

const distances = (acc: DistanceSaturation[], elem: DateSaturation): DistanceSaturation[] =>
    concat(acc, elem.byDistance || []);
