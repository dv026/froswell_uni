import React, { FC, memo, useEffect, useState } from 'react';

import { Box, Flex } from '@chakra-ui/react';
import { filter, head, last } from 'ramda';

import { Range } from '../../../common/entities/range';
import { WithDate } from '../../../input/entities/merModel';
import { ParamDate } from '../../entities/paramDate';
import { gteByMonth, lteByMonth } from '../../helpers/date';
import { BackgroundType, DateRangeNew } from '../dateRangeNew';

import css from './index.module.less';

interface Props {
    background?: {
        data: ParamDate[];
        type: BackgroundType;
    };
    data: WithDate[];
    onChangeRange: (list: WithDate[]) => void;
}

export const DateRangeWrapper: FC<Props> = memo((props: Props) => {
    const { background, data, onChangeRange } = props;

    const [currentRange, setCurrentRange] = useState<Range<Date>>(null);
    const [currentLimits, setCurrentLimits] = useState<Range<Date>>(null);

    useEffect(() => {
        setCurrentRange(new Range(head(data).dt, last(data).dt));
        setCurrentLimits(new Range(head(data).dt, last(data).dt));
    }, [data]);

    return (
        <div className={css.chartDates}>
            {currentLimits && currentRange && (
                <DateRangeNew
                    background={background}
                    isRange={true}
                    current={currentRange}
                    limits={currentLimits}
                    size='xs'
                    showEdges={{ min: true, max: true }}
                    onChange={(current: Range<Date>) => {
                        const sorted = filter(
                            (x: WithDate) => gteByMonth(x.dt, current.min) && lteByMonth(x.dt, current.max),
                            data
                        );

                        setCurrentRange(current);
                        onChangeRange(sorted);
                    }}
                />
            )}
        </div>
    );
});
