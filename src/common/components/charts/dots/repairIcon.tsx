import React, { FC } from 'react';

import css from './repairIcon.module.less';

interface RepairIconProps {
    cx: number;
    cy: number;
    text: string;
}

/**
 * Компонент, отображающий иконку ремонта
 */
export const RepairIcon: FC<RepairIconProps> = payload => {
    const { cx, cy, text } = payload;

    return (
        <>
            <filter x='0' y='0' width='1' height='1' id='solid'>
                <feFlood floodColor='white' />
                <feComposite in='SourceGraphic' />
            </filter>
            <text filter='url(#solid)' className={css.repairLabel} x={cx} y={cy - 25} fontSize={12}>
                {text}
            </text>
            {/* <Icon x={cx - 20} y={cy - 20} width={40} height={40} color={colors.bg.brand} /> */}
            <svg x={cx - 20} y={cy - 20} width={40} height={40} viewBox='0 0 40 40' className={css.icon}>
                <circle cx={20} cy={20} r={15} className={css.icon__background} />
                <path
                    className={css.icon__wrench}
                    transform='translate(8, 8)'
                    d='M12 3a9 9 0 100 18 9 9 0 100-18zm5.193 8.36a3.319 3.319 0 01-3.52.983l-4.45 5.119a1.308 1.308 0 01-1.974-1.719l4.457-5.123a3.311 3.311 0 013.8-4.643L13.8 7.967l.557 1.622 1.687.328 1.709-1.994a3.306 3.306 0 01-.559 3.439l-.001-.001z'
                />
            </svg>
        </>
    );
};
