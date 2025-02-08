import React from 'react';

import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';

import css from './index.module.less';

interface IProps {
    className?: string;
}

type Props = ControlWithClassProps & IProps;

export const Page: React.FC<React.PropsWithChildren<Props>> = (p: React.PropsWithChildren<Props>) => {
    return <div className={cls(css.page, p.className)}>{p.children}</div>;
};
