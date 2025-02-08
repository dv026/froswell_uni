import React, { FC } from 'react';

import { ParamDateOrig } from '../../../common/entities/paramDateOrig';
import { Range } from '../../../common/entities/range';
import { AdaptationRange } from '../adaptationRange';

import css from './index.module.less';

export type PredictionRangeProps = {
    adaptation: {
        data: ParamDateOrig[];
        startDate: Date;
        endDate: Date;
    };
};

export const PredictionRange: FC<PredictionRangeProps> = ({ adaptation }) => {
    return (
        <div className={css.range}>
            <div className={css.range__adaptation}>
                <AdaptationRange
                    background={{
                        data: adaptation.data,
                        type: 'oil'
                    }}
                    disabled={false}
                    limits={new Range<Date>(adaptation.startDate, adaptation.endDate)}
                />
            </div>
        </div>
    );
};
