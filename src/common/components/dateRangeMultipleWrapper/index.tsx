import React, { FC, memo, useEffect, useState } from 'react';

import { isNullOrEmpty } from 'common/helpers/ramda';
import { filter, head, last, map, reduce } from 'ramda';

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
    data: WithDate[][];
    onChangeRange: (list: WithDate[][]) => void;
}

export const DateRangeMultipleWrapper: FC<Props> = memo((props: Props) => {
    const { background, data, onChangeRange } = props;

    const [currentRange, setCurrentRange] = useState<Range<Date>>(null);
    const [currentLimits, setCurrentLimits] = useState<Range<Date>>(null);

    const startDate = new Date(head(head(data))?.dt ?? new Date());
    const endDate = new Date(last(head(data))?.dt ?? new Date());

    useEffect(() => {
        setCurrentRange(new Range(startDate, endDate));
        setCurrentLimits(new Range(startDate, endDate));
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
                        const sorted = map(
                            it =>
                                filter(
                                    (x: WithDate) => gteByMonth(x.dt, current.min) && lteByMonth(x.dt, current.max),
                                    it
                                ),
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
