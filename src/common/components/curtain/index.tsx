import React, { Children, FC, PropsWithChildren, ReactElement } from 'react';

import { Button } from '@chakra-ui/react';
import { useRecoilState } from 'recoil';

import { cls } from '../../helpers/styles';
import { expandCurtainState } from '../../store/expandCurtain';
import { CloseIcon, PinIcon, SettingsIcon } from '../customIcon/general';

import css from './index.module.less';

type XPosition = 'left' | 'right';
type YPosition = 'top' | 'bottom';
type Position = `${YPosition}-${XPosition}`;

export type CurtainProps = PropsWithChildren<{
    position: Position;
}>;

const Group: FC<PropsWithChildren<unknown>> = ({ children }) => (
    <div className={css.curtain__contentGroup}>{children}</div>
);

type BaseCurtainProps = CurtainProps & { controls?: () => ReactElement };

const BaseCurtain: FC<BaseCurtainProps> = ({ children, controls, position }) => (
    <div className={cls(css.curtain, getPositionCls(position))}>
        {controls && <div className={css.curtain__latch}>{controls()}</div>}
        {React.Children.map(children, child => (child ? <Group>{child}</Group> : null))}
    </div>
);

export const Curtain: FC<CurtainProps> = ({ position, children }) => (
    <BaseCurtain position={position}>{children}</BaseCurtain>
);

export type FoldingCurtainProps = CurtainProps & {
    btnLabel: string;
    defaultIsOpened?: boolean;
    ns?: string;
};

export const FoldingCurtain: FC<FoldingCurtainProps> = ({ btnLabel, children, position }) => {
    const [opened, setOpened] = useRecoilState(
        expandCurtainState(`${btnLabel}_${Children.count(children).toString()}`)
    );

    if (!opened) {
        return (
            <div className={cls(css.latchBtn, getBtnCls(position))}>
                <Button leftIcon={<SettingsIcon boxSize={7} />} variant='callWindow' onClick={() => setOpened(!opened)}>
                    {btnLabel}
                </Button>
            </div>
        );
    }

    return (
        <BaseCurtain
            position={position}
            controls={() => (
                <>
                    <div>
                        <PinIcon boxSize={7} color='typo.link' />
                    </div>
                    <div onClick={() => setOpened(!opened)}>
                        <CloseIcon color='icons.grey' boxSize={8} />
                    </div>
                </>
            )}
        >
            {children}
        </BaseCurtain>
    );
};

const getPositionCls = (position: Position): string => {
    switch (position) {
        case 'bottom-left':
            return css.curtain_bottomLeft;
        case 'bottom-right':
            return css.curtain_bottomRight;
        case 'top-left':
            return css.curtain_topLeft;
        case 'top-right':
            return css.curtain_topRight;
        default:
            throw new Error('Unknown position');
    }
};

const getBtnCls = (position: Position): string => {
    switch (position) {
        case 'bottom-left':
            return css.latchBtn_bottomLeft;
        case 'bottom-right':
            return css.latchBtn_bottomRight;
        case 'top-left':
            return css.latchBtn_topLeft;
        case 'top-right':
            return css.latchBtn_topRight;
        default:
            throw new Error('Unknown position');
    }
};
