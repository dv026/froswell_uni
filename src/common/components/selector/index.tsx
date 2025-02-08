import React from 'react';

import { map } from 'ramda';

import { isNullOrEmpty, trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { CustomControlProps } from '../customControl';
import { IdLike, Item, SelectorItem, SelectorItemProps } from './item';

import css from './index.module.less';

interface Props extends CustomControlProps {
    items: SelectorItem[];
    onChange: (newId: IdLike) => void;
    currentId: IdLike;
    customItem?: React.FC<SelectorItemProps>;
}

export const Selector: React.FC<Props> = (p: Props) => {
    if (isNullOrEmpty(p.items)) {
        return null;
    }

    const SelectorItem = p.customItem ?? Item;
    return (
        <div className={cls(css.selector, p.className, trueOrNull(p.disabled, css.selector_disabled))}>
            {map(
                x => (
                    <SelectorItem item={x} isCurrent={x.id === p.currentId} onChange={() => p.onChange(x.id)} />
                ),
                p.items
            )}
        </div>
    );
};
