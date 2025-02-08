import React from 'react';

import * as ReactDOM from 'react-dom';

import { cls } from '../../helpers/styles';

import './modalPopup.module.less';

export type ModalPopupProps = React.HTMLProps<HTMLDivElement>;

export const ModalPopup: React.FC<ModalPopupProps> = (p: ModalPopupProps) =>
    ReactDOM.createPortal(
        <div className='modal-popup'>
            <div className={cls(['modal-popup__body', p.className])}>{p.children}</div>
        </div>,
        document.getElementById('modals')
    );

export const ModalPopupTitle: React.FC<React.HTMLProps<HTMLDivElement>> = (p: React.HTMLProps<HTMLDivElement>) => (
    <div className={cls(['modal-popup__title', p.className])}>{p.children}</div>
);

export const ModalPopupActions: React.FC<React.HTMLProps<HTMLDivElement>> = (p: React.HTMLProps<HTMLDivElement>) => (
    <div className={cls(['modal-popup__actions', p.className])}>{p.children}</div>
);

export const ModalPopupContent: React.FC<React.HTMLProps<HTMLDivElement>> = (p: ModalPopupProps) => (
    <div className={cls(['modal-popup__content', p.className])}>{p.children}</div>
);
