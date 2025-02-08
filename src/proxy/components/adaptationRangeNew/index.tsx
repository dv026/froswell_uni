import React, { FC } from 'react';

import { RangeChartLegend } from '../../../calculation/components/rangeChartLegend';
import { Range } from '../../../common/entities/range';
import { DateRangeNew, DateRangeProps } from './../../../common/components/dateRangeNew';

export const AdaptationRangeNew: FC<DateRangeProps<Range<Date>>> = (p: DateRangeProps<Range<Date>>) => {
    return (
        <DateRangeNew offset='bottom' showEdges={{ min: true, max: true }} {...p}>
            <RangeChartLegend hideCalc={!p.disabled} />
        </DateRangeNew>
    );
};
