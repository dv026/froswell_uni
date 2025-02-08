import React, { FC, PropsWithChildren } from 'react';

import { always, append, cond, equals, pipe, T } from 'ramda';

import { trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { ControlWithClassProps, ControlWithDisabledProps, disabledAction } from '../customControl';

import css from './index.module.less';

interface Props extends ControlWithClassProps, ControlWithDisabledProps {
    onClick: () => void;
    type?: LinkBtnTypeEnum;
}

export enum LinkBtnTypeEnum {
    Default = 1,
    Red = 2,
    Grey = 3,
    Green = 4
}

export const LinkBtn: FC<Props> = (p: PropsWithChildren<Props>) => (
    <div className={makeCls(p.className, p.type, p.disabled)} onClick={disabledAction(p.onClick, p.disabled)}>
        {p.children}
    </div>
);

const makeCls = (classname, type: LinkBtnTypeEnum, disabled?: boolean) =>
    pipe(
        cond([
            [equals(LinkBtnTypeEnum.Red), always(css.linkBtn_red)],
            [equals(LinkBtnTypeEnum.Grey), always(css.linkBtn_grey)],
            [equals(LinkBtnTypeEnum.Green), always(css.linkBtn_green)],
            [T, always('')]
        ]),
        x => [css.linkBtn, x],
        x => append(trueOrNull(disabled, css.linkBtn_disabled), x),
        append(classname),
        cls
    )(type || LinkBtnTypeEnum.Default);
