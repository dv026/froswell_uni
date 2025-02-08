import React, { PureComponent, ReactNode } from 'react';

import { isNil } from 'ramda';

import { cls, StrOrArr } from '../../../helpers/styles';
import { ActiveDot, LineDotWithPayloadProps, NoDot } from './index';
import { RepairIcon } from './repairIcon';

import css from './index.module.less';

export type RepairDotProps = LineDotWithPayloadProps & {
    /**
     * Классы-модификаторы для отображения точки на те даты, на которые отсутствуют ремонты (на даты ремонтов отображается
     * специальная точка)
     */
    dotCls?: StrOrArr;

    /**
     * Тип точки для отображения. False - точка, всегда отображаемая на линии графика. True - точка,
     *      отображаемая на линии графика только при наведении на нее
     */
    isActive: boolean;

    /**
     * Название проперти объекта данных, из значения которого берутся данные данные для отображения точки
     */
    dataKey: string;
};

/**
 * Компонент, отображающий точку с ремонтом на линии графика.
 *      Если на указанную дату есть ремонт, то отображается ремонт,
 *      в противном случае отображается базовое представление точки на линии графика
 */
export class RepairsDot extends PureComponent<RepairDotProps, null> {
    public render(): ReactNode {
        const { cx, cy, payload, dotCls, isActive, dataKey, isInjection } = this.props;
        if (!cx || !cy) {
            return null;
        }

        if (!isNil(payload.repairName) && !isInjection) {
            return <RepairIcon cx={cx} cy={cy} text={payload.repairName} />;
        }

        if (!isNil(payload.repairNameInjection) && isInjection) {
            return <RepairIcon cx={cx} cy={cy} text={payload.repairNameInjection} />;
        }

        return isActive ? (
            <ActiveDot cx={cx} cy={cy} className={cls(css.dot, dotCls)} dataKey={dataKey} payload={payload} />
        ) : (
            <NoDot />
        );
    }
}
