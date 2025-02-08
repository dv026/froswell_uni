import React, { FC, PureComponent, ReactNode } from 'react';

import { opacity } from 'common/helpers/colors';

import { LineDotWithPayloadProps } from './index';

import css from './repairIcon.module.less';

export type RepairDotProps = LineDotWithPayloadProps & {
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
export class DotWithText extends PureComponent<RepairDotProps, null> {
    public render(): ReactNode {
        const { cx, cy, payload, dataKey, fill } = this.props;
        if (!cx || !cy) {
            return null;
        }

        return <Dot cx={cx} cy={cy} text={payload[dataKey]} fill={fill} />;
    }
}

interface DotProps {
    cx: number;
    cy: number;
    text: string;
    fill: string;
}

export const Dot: FC<DotProps> = payload => {
    const { cx, cy, text, fill } = payload;

    return (
        <>
            <filter x='0' y='0' width='1' height='1' id='solid'>
                <feFlood floodColor={opacity('#ffffff', 0.5)} />
                <feComposite in='SourceGraphic' />
            </filter>
            <text filter='url(#solid)' className={css.repairLabel} x={cx} y={cy - 20} fontSize={12}>
                {text}
            </text>
            <svg x={cx - 20} y={cy - 20} width={40} height={40} viewBox='0 0 40 40' className={css.icon}>
                <circle cx={20} cy={20} r={7} fill={fill} />
            </svg>
        </>
    );
};
