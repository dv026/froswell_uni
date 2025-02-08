import React, { FC } from 'react';

import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';

import { AdaptationDynamics } from '../../../../../calculation/entities/computation/calculationDetails';
import { cls } from '../../../../../common/helpers/styles';
import { AdaptationParameter } from '../adaptationParameter';
import { getLabelByType } from '../utils';

import css from './index.module.less';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface AdaptationCardProps {
    adaptation: AdaptationDynamics;
    best: AdaptationDynamics;
    title?: string;
}

export const AdaptationCard: FC<AdaptationCardProps> = (props: AdaptationCardProps) => {
    const { t } = useTranslation();

    const title = props.title ? `${props.title} (${getLabelByType(props.adaptation.adaptationType)})` : '';

    const iterationCls = () =>
        isNil(props.best) || props.best.a === props.adaptation.a ? css.aCard__iteration_best : '';

    if (isNil(props.adaptation)) {
        return <div className={cls([css.aCard, 'is-non-visible'])} />;
    }

    return (
        <div className={css.aCard}>
            <div className={cls([css.aCard__iteration, iterationCls()])}>
                {props.adaptation.a}
                {props.adaptation.isBest && <span>*</span>}
            </div>
            <div className={css.aCard__container}>
                <div className={css.aCard__title}>{title}</div>
                <AdaptationParameter
                    best={props.best?.error}
                    current={props.adaptation?.error}
                    className={cls([css.aCard__param, css.aParam_learning])}
                    moreBetter={false}
                    diffInPercent={false}
                    text={t(dict.calculation.errorTotal)}
                />
                <AdaptationParameter
                    best={props.best?.bhpError}
                    current={props.adaptation.bhpError}
                    className={css.aCard__param}
                    moreBetter={false}
                    diffInPercent={false}
                    text={t(dict.calculation.bhpError)}
                />
                <AdaptationParameter
                    best={props.best?.oilError}
                    current={props.adaptation.oilError}
                    className={css.aCard__param}
                    moreBetter={false}
                    diffInPercent={false}
                    text={t(dict.calculation.errorMapeOil)}
                />
                <AdaptationParameter
                    best={props.best?.oilProduction}
                    current={props.adaptation.oilProduction}
                    className={css.aCard__param}
                    moreBetter={true}
                    diffInPercent={true}
                    text={t(dict.calculation.adaptationChart.legend.productionTotal)}
                />
                <AdaptationParameter
                    best={props.best?.liquidError}
                    current={props.adaptation.liquidError}
                    className={css.aCard__param}
                    moreBetter={false}
                    diffInPercent={false}
                    text={t(dict.calculation.errorMapeLiquid)}
                />
                <AdaptationParameter
                    best={props.best?.liquidProduction}
                    current={props.adaptation.liquidProduction}
                    className={css.aCard__param}
                    moreBetter={true}
                    diffInPercent={true}
                    text={t(dict.calculation.liquidProduction)}
                />
            </div>
        </div>
    );
};
