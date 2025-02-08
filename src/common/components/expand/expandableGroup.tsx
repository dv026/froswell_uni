import React, { FC, PropsWithChildren, useCallback, useState } from 'react';

import { isNil } from 'ramda';

import { trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { ArrowDirection, ArrowInCircle } from '../arrowInCircle';
import { ControlWithClassProps } from '../customControl';
import { HorizontalSeparator } from '../separator/separator';

import css from './expandableGroup.module.less';

export interface GroupProps
    extends PropsWithChildren<{ text?: string; onExpand?: (x: boolean) => void; opened?: boolean }>,
        ControlWithClassProps {}

export const ExpandableGroup: FC<GroupProps> = (p: GroupProps) => {
    const [maxHeight, setMaxHeight] = useState<number>(0);

    const containerEl = useCallback((node: HTMLDivElement) => {
        if (!node) {
            return;
        }

        setMaxHeight(node.getBoundingClientRect().height);
    }, []);

    return (
        <div
            className={cls(
                css.group,
                p.className,
                trueOrNull(readyForContent(!!maxHeight, p.opened, p.text), css.group_opened)
            )}
            style={styles(isOpened(p.opened, p.text), maxHeight)}
            ref={containerEl}
        >
            {!isNil(p.text) && (
                <div className={css.group__title}>
                    <div className={css.group__titleText}>{p.text}</div>
                    <div onClick={() => p.onExpand(!p.opened)}>
                        <ArrowInCircle direction={p.opened ? ArrowDirection.Bottom : ArrowDirection.Right} />
                    </div>
                    <HorizontalSeparator className={css.group__separator} />
                </div>
            )}
            <div>{p.children}</div>
        </div>
    );
};

const styles = (opened: boolean, maxHeight: number) => (opened && maxHeight ? { maxHeight } : null);

const readyForContent = (initialized: boolean, opened: boolean, text: string) =>
    !initialized ? true : isOpened(opened, text);

const isOpened = (opened: boolean, text: string) => (!!text && opened) || !text;
