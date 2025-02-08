import * as R from 'ramda';

import { KeyCodeEnum, keyFromEvent } from '../enums/keyCodesEnum';
import { nul } from '../helpers/ramda';

export interface ControlWithClassProps {
    className?: string | string[];
}

export interface ControlWithDisabledProps {
    disabled?: boolean;
}

export interface CustomControlProps extends ControlWithClassProps {
    disabled?: boolean;
    tabIndex?: number | boolean;
}

export const keyup = (e: React.KeyboardEvent<HTMLDivElement>, act: () => void): void => {
    if (R.either(R.equals(KeyCodeEnum.ENTER), R.equals(KeyCodeEnum.SPACE))(keyFromEvent(e))) {
        act();
    }
};

export const tab = (tabIndex?: number | boolean, disabled: boolean = false): number => {
    if (disabled || R.isNil(tabIndex) || !R.equals(false, tabIndex)) {
        return null;
    }

    return R.equals(true, tabIndex) ? 0 : (tabIndex as number);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const disabledAction = (fn: (...args) => void, disabled: boolean) => (disabled ? nul : fn);
