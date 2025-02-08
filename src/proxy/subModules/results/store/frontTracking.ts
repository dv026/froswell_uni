import { filter, find, sortBy } from 'ramda';
import { selectorFamily } from 'recoil';

import { DateSaturation } from '../../../entities/frontTracking/frontTracking';
import { ResultDataTypeEnum } from '../../calculation/enums/resultDataTypeEnum';
import { reportState } from './report';

type InputType = {
    neighborId: number;
    plastId: number;
};

export const frontTrackingSelector = selectorFamily({
    key: 'proxyResults__frontTrackingSelector',
    get:
        (input: InputType) =>
        ({ get }) => {
            const report = get(reportState);

            const neighborDates =
                find(
                    x => x.neighborWellId === input.neighborId && x.plastId === input.plastId,
                    report?.insim?.frontTracking?.neighbors ?? []
                )?.dates ?? [];

            let filtered;
            if (report?.dataType === ResultDataTypeEnum.All) {
                filtered = neighborDates;
            } else if (report?.dataType === ResultDataTypeEnum.Adaptation) {
                filtered = report?.insim?.predictionStart
                    ? filter(x => x.date.getTime() < report.insim.predictionStart.getTime(), neighborDates)
                    : neighborDates;
            } else {
                filtered = report?.insim?.predictionStart
                    ? filter(x => x.date.getTime() >= report.insim.predictionStart.getTime(), neighborDates)
                    : [];
            }

            return sortBy((x: DateSaturation) => x.date.getTime(), filtered);
        }
});
