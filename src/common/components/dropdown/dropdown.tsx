import React, { ReactNode } from 'react';

import { Select } from '@chakra-ui/react';
import { any, bind, find, forEach, isNil, map } from 'ramda';

import { KeyValue } from '../../entities/keyValue';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import i18n from '../../helpers/i18n';
import { isNullOrEmpty, notFn } from '../../helpers/ramda';
import { hashCode } from '../../helpers/strings';
import { ArrowDownSmallIcon } from '../customIcon/general';
import { Option } from '../option';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export class DropdownOption implements Option {
    public text: string;
    public value: string;
    public groupname: string;

    public constructor(value: string | number, text: string, groupname?: string) {
        this.text = text;
        this.value = (value ?? 'null').toString();
        this.groupname = groupname || null;
    }
}

export const optsFromKeyValues = (list: KeyValue[]): DropdownOption[] => {
    let result: DropdownOption[] = [];

    if (any(it => it.id === WellTypeEnum.Oil, list)) {
        result.push(new DropdownOption(WellTypeEnum.Oil, i18n.t(dict.common.oilWell)));
    }

    if (any(it => it.id === WellTypeEnum.Injection, list)) {
        result.push(new DropdownOption(WellTypeEnum.Injection, i18n.t(dict.common.injWell)));
    }

    return result;
};

export interface DropdownProps extends GroupProps {
    className?: string;
    disabled?: boolean;
    emptyText?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options?: Array<DropdownOption>;
    value: string | number;
    validate?: boolean;
    size?: string;
    width?: string | number;
}

export interface GroupProps {
    groupSelectable?: boolean;
}

export class DropdownGeneric<P extends DropdownProps> extends React.PureComponent<P, null> {
    public constructor(props: P, context: unknown) {
        super(props, context);

        this.onChange = bind(this.onChange, this);
    }

    public render() {
        if (this.props.validate) {
            // TODO: add validation for uniqueness for values and texts
        }

        return (
            <Select
                icon={<ArrowDownSmallIcon color={'icons.grey'} boxSize={8} />}
                borderColor='control.grey300'
                background='bg.white'
                width={this.props.width ?? 'auto'}
                value={this.props.value ?? 'null'}
                isDisabled={this.props.disabled || isEmpty(this.props.options)}
                onChange={this.onChange}
                size={this.props.size}
            >
                <>{this.renderOptions()}</>
            </Select>
        );
    }

    protected renderOptions() {
        const makeOpt = this.makeOption.bind(this);
        const options = (list: DropdownOption[]): Iterable<ReactNode> => map(makeOpt, list);

        if (!any(x => !isNil(x.groupname), this.props.options)) {
            return options(isEmpty(this.props.options) ? emptyOpt(this.props.emptyText) : this.props.options);
        }

        return map(x => {
            return isNil(x[0]) ? (
                options(x[1])
            ) : (
                <optgroup label={x[0]} key={hashCode(x[0])}>
                    {options(x[1])}
                </optgroup>
            );
        }, groupOrdered(this.props.options));
    }

    protected onChange(e: React.ChangeEvent<HTMLSelectElement>): void {
        if (notFn(this.props.onChange) || this.props.disabled || isEmpty(this.props.options)) {
            return;
        }

        this.props.onChange(e);
    }

    protected makeOption(o: DropdownOption): JSX.Element {
        return (
            <option key={o.value} value={o.value ?? 'null'}>
                {o.text}
            </option>
        );
    }
}

export const Dropdown: React.FC<DropdownProps> = (props: DropdownProps) => <DropdownGeneric {...props} />;

const isEmpty = (opts: DropdownOption[]) => isNullOrEmpty(opts);
const emptyOpt = (emptyText: string) => [new DropdownOption('', isNil(emptyText) ? 'Выберите...' : emptyText)];

const groupOrdered = (options: DropdownOption[]) => {
    if (!any(x => !isNil(x.groupname), options)) {
        return options;
    }

    let groups: [string, DropdownOption[]][] = [];
    forEach(opt => {
        if (any(x => x[0] === opt.groupname, groups)) {
            find(x => x[0] === opt.groupname, groups)[1].push(opt);
        } else {
            groups.push([opt.groupname, [opt]]);
        }
    }, options);

    return groups;
};
