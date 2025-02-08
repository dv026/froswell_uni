import React, { FC, useEffect, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { head, isNil, last, map, prop, sortBy } from 'ramda';

import { Range } from '../../../common/entities/range';
import { ParamDate } from '../../entities/paramDate';
import { WithDate } from '../../entities/paramDateOrig';
import { isNullOrEmpty } from '../../helpers/ramda';
import { DateRangeNew, DateRangeProps } from '../dateRangeNew';

const initialSort = data => sortBy<WithDate>(prop('date'), data && data.length ? data : []);
const initialRange = (data: WithDate[]) => (isNullOrEmpty(data) ? null : new Range(head(data).date, last(data).date));
const initialLimits = (data: WithDate[]) => (isNullOrEmpty(data) ? null : new Range(head(data).date, last(data).date));

interface Props {
    data: WithDate[];
    onChange: (current: Range<Date>) => void;
}

export const ChartDateRange: FC<Props> = (props: Props) => {
    const { data, onChange } = props;

    const [currentRange, setCurrentRange] = useState<Range<Date>>(null);
    const [currentLimits, setCurrentLimits] = useState<Range<Date>>(null);

    useEffect(() => {
        const sorted = initialSort(data);

        setCurrentRange(initialRange(sorted));
        setCurrentLimits(initialLimits(sorted));
    }, [data]);

    return (
        <>
            <Box w='100%' h='60px' px='85px' marginBottom={5}>
                {currentLimits && currentRange && (
                    <DateRangeNew
                        background={getDateRangeBg(data)}
                        isRange={true}
                        current={currentRange}
                        limits={currentLimits}
                        size='xs'
                        showEdges={{ min: true, max: true }}
                        onChange={(current: Range<Date>) => {
                            setCurrentRange(current);
                            onChange(current);
                        }}
                    />
                )}
            </Box>
        </>
    );
};

const getDateRangeBg = (data: WithDate[]): DateRangeProps<Range<Date>>['background'] => {
    return {
        data: map<WithDate, ParamDate>(x => ({ date: new Date(x.date), value: x.value }), data),
        type: 'oil'
    };
};
