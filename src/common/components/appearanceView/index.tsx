import React, { FC, PropsWithChildren } from 'react';

import { Checkbox } from '@chakra-ui/react';

import { CheckList, CheckListOption } from '../checkList';
import { Expand } from '../expand/expand';

import css from './index.module.less';

interface PlainTextProps {
    text: string;
}

export const Appearance: FC<PropsWithChildren<unknown>> = ({ children }) => (
    <div className={css.appearance}>{children}</div>
);

export const Heading: FC<PlainTextProps> = ({ text }) => <div className={css.appearance__heading}>{text}</div>;

export const Group: FC<PlainTextProps> = ({ text }) => <div className={css.appearance__groupHeading}>{text}:</div>;

export const SubGroup: FC<PlainTextProps> = ({ text }) => (
    <div className={css.appearance__subGroupHeading}>{text}:</div>
);

interface ExpandItemProps {
    listOptions: CheckListOption[];
    onListOptionChange: (type: string, show: boolean) => void;

    main: {
        disabled: boolean;
        checked: boolean;
        title: string;
        onChange: (checked: boolean) => void;
    };
}

export const ExpandItem: FC<ExpandItemProps> = ({ listOptions, onListOptionChange, main }: ExpandItemProps) => (
    <div className={css.appearance__expand}>
        <Expand>
            <div expand-title='true'>
                <Checkbox
                    isDisabled={main.disabled}
                    isChecked={main.checked}
                    onChange={e => main.onChange(e.target.checked)}
                >
                    {main.title}
                </Checkbox>
            </div>

            <div className={css.appearance__expandList}>
                <CheckList options={listOptions} onChange={onListOptionChange} />
            </div>
        </Expand>
    </div>
);
