import React from 'react';

import { trueOrNull } from '../../../helpers/ramda';
import { cls } from '../../../helpers/styles';

import css from '../wellRoster.module.less';

export const MarkInsim: React.FC = () => <div className={cls(css.mark, css.mark_stamp, css.mark_insim)}>insim</div>;

interface MarkSummProps {
    calculated: boolean;
}

export const MarkSumm: React.FC<MarkSummProps> = (p: MarkSummProps) => (
    <div className={cls(css.mark, css.mark_stamp, trueOrNull(p.calculated, css.mark_insim))}>summ</div>
);
