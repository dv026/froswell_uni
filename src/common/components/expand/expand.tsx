import React, { Children, FC, PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react';

import { isNil } from 'ramda';

import { trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { ArrowInCircle, ArrowDirection } from '../arrowInCircle';

import css from './expand.module.less';

type Props = PropsWithChildren<{
    expanded?: boolean;
    removeLatch?: boolean;
}>;

export const Expand: FC<Props> = (p: Props) => {
    const [expanded, setExpanded] = useState<boolean>(true);
    const elBody = useRef(null);

    useEffect(() => {
        setExpanded(p.expanded);
    }, [p.expanded]);

    const latch = !!p.removeLatch ? null : (
        <div className={css.expand__latch} onClick={() => setExpanded(!expanded)}>
            <ArrowInCircle direction={expanded ? ArrowDirection.Bottom : ArrowDirection.Right} />
        </div>
    );

    return (
        <div className={cls(css.expand, trueOrNull(!expanded, css.expand_collapsed))}>
            <div className={css.expand__title}>
                <div className={css.expand__titleContent}>{Children.map(p.children, onlyForTitle)}</div>
                {latch}
            </div>

            <div className={css.expand__body} ref={elBody}>
                {Children.map(p.children, onlyForBody)}
            </div>
        </div>
    );
};

const titleChild = (c: ReactElement) => !isNil(c) && !isNil(c.props['expand-title']);

const onlyForTitle = (c: ReactElement) => (titleChild(c) ? c : null);
const onlyForBody = (c: ReactElement) => (!titleChild(c) ? c : null);
