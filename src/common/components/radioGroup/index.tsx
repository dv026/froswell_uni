import React, { FC, PureComponent } from 'react';

import { Radio as ChakraRadio } from '@chakra-ui/react';
import { always, equals, ifElse, isNil, map } from 'ramda';

import { notFn, trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { EllipseIcon } from '../customIcon/general';
import { Option } from '../option';

import css from './index.module.less';

export class RadioGroupOption implements Option {
    public text: string;
    public value: string;
    public disabled: boolean;
    public showStatus: boolean;

    public constructor(value: string | number, text: string, disabled: boolean = false, showStatus: boolean = false) {
        this.text = text;
        this.value = value.toString();
        this.disabled = disabled;
        this.showStatus = showStatus;
    }
}

export interface RadioGroupProps {
    className?: string;
    disabled?: boolean;
    name: string;
    onChange?: (v: string) => void;
    options?: Array<RadioGroupOption>;

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
}

export class RadioGroupGeneric<P extends RadioGroupProps> extends PureComponent<P, null> {
    public render(): JSX.Element {
        const makeOpt = this.makeOption.bind(this);
        const disabledClass = this.props.disabled ? css.radiogroup_disabled : '';

        return (
            <div className={cls([css.radiogroup, this.props.className, disabledClass])}>
                {map(makeOpt, this.props.options)}
            </div>
        );
    }

    protected onChange(newValue: string): void {
        if (notFn(this.props.onChange)) {
            return;
        }

        this.props.onChange(newValue);
    }

    protected makeOption(o: RadioGroupOption): JSX.Element {
        const toStr = x => ifElse(isNil, always(''), (x: string | number) => x.toString())(x);
        const checked = ifElse(isNil, always(false), equals(o.value))(toStr(this.props.value));

        return (
            <div key={o.value} className={cls(css.option, trueOrNull(o.disabled, css.option_disabled))}>
                {o.showStatus && <EllipseIcon color={'icons.red'} boxSize={2} mr={'3px'} />}
                <ChakraRadio
                    value={o.value}
                    isChecked={checked}
                    isDisabled={o.disabled}
                    onChange={() => this.onChange(o.value)}
                >
                    {o.text}
                </ChakraRadio>
            </div>
        );
    }
}

export const RadioGroup: FC<RadioGroupProps> = (props: RadioGroupProps) => <RadioGroupGeneric {...props} />;
