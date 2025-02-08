import React, { FC, PropsWithChildren } from 'react';

import css from './index.module.less';

/**
 * Компонент для отображения горизонтально-ориентированной легенды для графика
 */
export const HorizontalLegend: FC<PropsWithChildren<unknown>> = ({ children }) => (
    <div className={css.legend}>{children}</div>
);
