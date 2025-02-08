import { filter, find, head, isEmpty, isNil, map, pipe, reject, sortBy } from 'ramda';
import { selectorFamily } from 'recoil';

import { fnAsIs } from '../../../../common/helpers/ramda';
import {
    DateSaturation,
    DistanceSaturation,
    MinLDateSaturation,
    NeighborFrontTracking
} from '../../../entities/frontTracking/frontTracking';
import { ResultDataTypeEnum } from '../../calculation/enums/resultDataTypeEnum';
import { reportState } from './report';

type InputType = {
    neighborId: number;
    plastId: number;
};

export const minByDate = selectorFamily({
    key: 'proxyResults__minByDate',
    get:
        (input: InputType) =>
        ({ get }) => {
            const report = get(reportState);

            const dates = (
                find(
                    (x: NeighborFrontTracking) => x.neighborWellId === input.neighborId && x.plastId === input.plastId,
                    report?.insim?.frontTracking?.neighbors ?? []
                ) ?? { neighborWellId: input.neighborId, plastId: input.plastId, dates: [] }
            ).dates;

            const byDate = !!report?.insim?.predictionStart
                ? report?.dataType === ResultDataTypeEnum.Adaptation
                    ? x => x.date.getTime() < report.insim.predictionStart.getTime()
                    : report?.dataType === ResultDataTypeEnum.Prediction
                    ? x => x.date.getTime() >= report.insim.predictionStart.getTime()
                    : fnAsIs
                : fnAsIs;

            return pipe(
                map(
                    (x: DateSaturation): MinLDateSaturation => ({
                        date: x.date,
                        saturation: first(x.byDistance)
                    })
                ),
                reject((x: MinLDateSaturation) => isNil(x.saturation)),
                sortBy(x => x.date),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filter(byDate as any)
            )(dates);
        }
});

const first = (x: DistanceSaturation[]) => (isEmpty(x) ? null : head(sortBy(x => x.l, x)));
