import React, { FC, PureComponent } from 'react';

import { Checkbox } from '@chakra-ui/react';
import { both, either, ifElse, isEmpty, isNil, map } from 'ramda';

import { isFn, isTruthy } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { EllipseIcon, InfoIcon } from '../customIcon/general';
import { Option } from '../option';

import css from './index.module.less';

export class CheckListOption implements Option {
    public checked?: boolean;
    public disabled?: boolean;
    public text: string;
    public value: string;
    public showStatus: boolean;

    public constructor(
        text: string,
        value: string,
        checked: boolean = false,
        disabled: boolean = false,
        showStatus: boolean = false
    ) {
        this.text = text;
        this.value = value;
        this.checked = checked;
        this.disabled = disabled;
        this.showStatus = showStatus;
    }
}

export interface CheckListProps {
    className?: string;
    disabled?: boolean;
    onChange?: (val: string, checked: boolean) => void;
    options?: Array<CheckListOption>;
    validate?: boolean;
}

export class CheckListGeneric<P extends CheckListProps> extends PureComponent<P, null> {
    public render(): JSX.Element {
        return ifElse(
            either(isNil, isEmpty),
            () => null,
            () => this.renderCheckList()
        )(this.props.options);
    }

    private renderCheckList(): JSX.Element {
        return <div className={this.makeCls()}>{map(x => this.renderOption(x), this.props.options)}</div>;
    }

    private renderOption(opt: CheckListOption): JSX.Element {
        return (
            <div key={opt.value} className={this.makeOptionCls(opt)}>
                <Status show={opt.showStatus} />
                <div className='checklist__opt-check'>
                    <Checkbox
                        isDisabled={opt.disabled}
                        isChecked={isTruthy(opt.checked)}
                        onChange={e => this.onCheck(e.target.checked, opt.value, opt.disabled)}
                    >
                        {opt.text}
                    </Checkbox>
                </div>
                {opt.showStatus && <InfoIcon color='icons.grey' boxSize={7} />}
            </div>
        );
    }

    protected onCheck(checked: boolean, value: string, disabled: boolean): void {
        ifElse(
            both(isFn, () => !disabled),
            () => this.props.onChange(value, checked),
            () => null
        )(this.props.onChange);
    }

    private makeOptionCls(opt: CheckListOption): string {
        return cls(css.checklist__opt, opt.disabled && css.checklist__opt_disabled);
    }

    private makeCls(): string {
        return cls(css.checklist, this.props.className, this.props.disabled ? css.checklist_disabled : null);
    }
}

const Status: FC<{ show: boolean }> = ({ show }) => (
    <EllipseIcon color={'colors.yellow'} boxSize={2} mr={'3px'} visibility={show ? 'visible' : 'hidden'} />
);

export const CheckList: React.FC<CheckListProps> = (props: CheckListProps) => <CheckListGeneric {...props} />;
