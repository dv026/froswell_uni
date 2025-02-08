import React, { FC, useEffect, useState } from 'react';

import { DateRangeNew } from 'common/components/dateRangeNew';
import { useTranslation } from 'react-i18next';

import { ParamDate } from '../../../../common/entities/paramDate';
import { Range } from '../../../../common/entities/range';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';

import css from './index.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export interface HistoryRangeProps {
    minRange: Date;
    maxRange: Date;
    defaultDate?: Date;
    data: ParamDate[];
    onChange: (date: Date) => void;
    wellType: WellTypeEnum;
}

export const HistoryRange: FC<HistoryRangeProps> = ({ wellType, data, minRange, maxRange, defaultDate, onChange }) => {
    const { t } = useTranslation();
    const [current, setCurrent] = useState<Date>(defaultDate ?? maxRange);

    useEffect(() => {
        setCurrent(defaultDate ?? maxRange);
    }, [defaultDate, maxRange]);

    return (
        <div className={css.history}>
            <div className={css.history__title}>
                {t(
                    wellType === WellTypeEnum.Injection
                        ? dict.common.historyRange.injectionRate
                        : dict.common.historyRange.oilRate
                )}
            </div>
            <div className={css.history__range}>
                <DateRangeNew
                    background={{ data: data, type: wellType === WellTypeEnum.Injection ? 'injection' : 'oil' }}
                    limits={new Range<Date>(minRange, maxRange)}
                    current={current}
                    isRange={false}
                    size='s'
                    onChange={(date: Date) => {
                        setCurrent(date);
                        onChange(date);
                    }}
                />
            </div>
        </div>
    );
};
