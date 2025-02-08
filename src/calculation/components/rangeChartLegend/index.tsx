import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { cls } from '../../../common/helpers/styles';

import css from './index.module.less';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    hideReal?: boolean;
    hideCalc?: boolean;
}

export const RangeChartLegend: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    return (
        <div className={cls(css.daterange__legend)}>
            <div className={css.daterange__legendTitle}>{t(dict.calculation.oilProduction)}:</div>
            {p.hideReal ? null : (
                <div className={css.daterange__legendItem}>
                    <div className={cls(css.daterange__thumb, css.daterange__thumb_real)} />
                    {t(dict.common.dataType.fact)}
                </div>
            )}
            {p.hideCalc ? null : (
                <div className={css.daterange__legendItem}>
                    <div className={cls(css.daterange__thumb, css.daterange__thumb_calc)} />
                    {t(dict.common.dataType.calc)}
                </div>
            )}
        </div>
    );
};
