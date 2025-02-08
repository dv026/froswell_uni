import React, { FC, PropsWithChildren } from 'react';

import { useTranslation } from 'react-i18next';

import { cls } from '../../../../../common/helpers/styles';

import css from './legend.module.less';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const LegendBestO = () => {
    const { t } = useTranslation();
    return (
        <div className={css.chartLegend__clm}>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_wide])}>
                    {t(dict.calculation.bestVariantByOil)}
                </div>
            </div>
            <div className={css.chartLegend__row}>
                <div className={css.chartLegend__cell}>
                    <div className={css.chartLegend__best} />
                </div>
            </div>
        </div>
    );
};

export const LegendPressures = () => {
    const { t } = useTranslation();

    return (
        <div className={css.chartLegend__clm}>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_wide])}>
                    {t(dict.calculation.avgPressureByWell)}
                </div>
            </div>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                    {t(dict.calculation.oilWells)}
                </div>
                <div className={css.chartLegend__cell}>
                    <div
                        className={cls([
                            css.chartLegend__line,
                            css.chartLegend__line_pressure,
                            css.chartLegend__line_calc
                        ])}
                    />
                </div>
            </div>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                    {t(dict.calculation.injWells)}
                </div>
                <div className={css.chartLegend__cell}>
                    <div
                        className={cls([
                            css.chartLegend__line,
                            css.chartLegend__line_pressureInj,
                            css.chartLegend__line_calc
                        ])}
                    />
                </div>
            </div>
        </div>
    );
};

export const LegendProduction = () => {
    const { t } = useTranslation();

    return (
        <div className={css.chartLegend__clm}>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_wide])}>
                    {t(dict.calculation.totalProduction)}
                </div>
            </div>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>{t(dict.common.oil)}</div>
                <div className={css.chartLegend__cell}>
                    <div
                        className={cls([css.chartLegend__line, css.chartLegend__line_oil, css.chartLegend__line_calc])}
                    />
                </div>
            </div>
            <div className={css.chartLegend__row}>
                <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>{t(dict.common.liquid)}</div>
                <div className={css.chartLegend__cell}>
                    <div
                        className={cls([
                            css.chartLegend__line,
                            css.chartLegend__line_liquid,
                            css.chartLegend__line_calc
                        ])}
                    />
                </div>
            </div>
        </div>
    );
};

export const Legend: FC<PropsWithChildren<unknown>> = (p: PropsWithChildren<unknown>) => (
    <div className={css.chartLegendContainer}>
        <div className={css.chartLegend}>{p.children}</div>
    </div>
);
