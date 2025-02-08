import React, { FC, PropsWithChildren } from 'react';

import ReactTooltip from 'react-tooltip';

import css from './tools.module.less';

export interface ToolProps {
    /**
     * Если указан текст, то при наведении на тул, этот текст будет отображаться в тултипе
     */
    tooltipText?: string;

    /**
     * Обработчик нажатия на тул
     */
    onClick: () => void;
}

export const Tool: FC<PropsWithChildren<ToolProps>> = ({ tooltipText, onClick, children }) => (
    <div className={css.tool} onClick={onClick} data-tip={tooltipText}>
        {children}
        {tooltipText && <ReactTooltip className={css.tool__tooltip} />}
    </div>
);
