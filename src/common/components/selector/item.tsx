import React from 'react';

import { trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';

import css from './index.module.less';

export type IdLike = string | number;
export interface SelectorItem {
    id: IdLike;
    text: string;
}

export interface SelectorItemProps {
    isCurrent: boolean;
    item: SelectorItem;
    onChange: () => void;
}

export const Item: React.FC<SelectorItemProps> = (p: SelectorItemProps) => (
    <div className={getCls(p.isCurrent)} onClick={p.onChange}>
        {p.item.text}
    </div>
);

const getCls = (isCurrent: boolean): string =>
    cls(css.selector__item, trueOrNull(isCurrent, css.selector__item_selected));
