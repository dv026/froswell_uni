import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { KrigingCalcSettingsModel } from '../../../input/entities/krigingCalcSettings';
import { ParamDate } from '../../entities/paramDate';
import { Range } from '../../entities/range';
import { firstDay } from '../../helpers/date';
import { shallow } from '../../helpers/ramda';
import { DateRangeNew } from '../dateRangeNew';

import dict from '../../helpers/i18n/dictionary/main.json';

interface PeriodProps {
    data: ParamDate[];
    model: KrigingCalcSettingsModel;
    show: boolean;
    onChange: (model: KrigingCalcSettingsModel) => void;
}

export const Period: FC<PeriodProps> = (p: PeriodProps) => {
    const { t } = useTranslation();

    if (!p.show) {
        return null;
    }

    return (
        <div className='kriging__period'>
            <div className='kriging__period-title'>{t(dict.kriging.period)}:</div>
            <DateRangeNew
                className='kriging__period-range'
                isRange={true}
                size='xxs'
                background={{
                    data: p.data,
                    type: 'oil'
                }}
                showEdges={{ min: true, max: true }}
                current={new Range<Date>(new Date(p.model.startDate), new Date(p.model.endDate))}
                limits={new Range<Date>(new Date(p.model.defaultDates.minDate), new Date(p.model.defaultDates.maxDate))}
                onChange={(v: Range<Date>) =>
                    p.onChange(
                        shallow<KrigingCalcSettingsModel>(p.model, {
                            startDate: firstDay(v.min),
                            endDate: firstDay(v.max)
                        })
                    )
                }
            />
        </div>
    );
};
