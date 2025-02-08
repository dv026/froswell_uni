import React from 'react';

import i18n from 'i18next';

import { ControlWithClassProps } from '../customControl';
import { ModalPopup, ModalPopupActions, ModalPopupContent, ModalPopupTitle } from './modalPopup';

import './confirmationPopup.module.less';

import mainDict from '../../helpers/i18n/dictionary/main.json';

interface ConfirmationPopupProps extends ControlWithClassProps {
    onCancel: () => void;
    onConfirm: () => void;
    title?: string;
    cancelText?: string;
    confirmText?: string;
}

export const ConfirmationPopup: React.FC<React.PropsWithChildren<ConfirmationPopupProps>> = (
    p: React.PropsWithChildren<ConfirmationPopupProps>
) => (
    <ModalPopup className='modal-popup_confirm'>
        <ModalPopupTitle>{p.title || 'Подтверждение'}</ModalPopupTitle>
        <ModalPopupContent>{p.children || 'Подтвердите действие'}</ModalPopupContent>
        <ModalPopupActions>
            <div className='button modal-popup_confirm__btn' onClick={p.onConfirm}>
                {p.confirmText || 'ОК'}
            </div>
            <div className='button button_secondary modal-popup_confirm__btn' onClick={p.onCancel}>
                {p.cancelText || i18n.t(mainDict.common.cancel)}
            </div>
        </ModalPopupActions>
    </ModalPopup>
);
