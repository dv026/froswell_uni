import React, { FC, PropsWithChildren } from 'react';

import css from './index.module.less';

export const TooltipBox: FC<PropsWithChildren> = ({ children }) => {
    return <div className={css.tooltip}>{children}</div>;
};
