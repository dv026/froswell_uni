import React from 'react';

import i18n from 'i18next';

import { Dropdown, DropdownOption, DropdownProps } from '../../../../common/components/dropdown/dropdown';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const OptimizationPeriodDropdown: React.FC<Pick<DropdownProps, 'value' | 'onChange'>> = ({
    value,
    onChange
}) => <Dropdown className='dropdown_well-types' options={opts()} value={value} onChange={onChange} />;

const opts = () => [
    new DropdownOption(1, i18n.t(dict.proxy.period.month)),
    new DropdownOption(2, i18n.t(dict.proxy.period.twoMonths)),
    new DropdownOption(3, i18n.t(dict.proxy.period.threeMonths)),
    new DropdownOption(6, i18n.t(dict.proxy.period.sixMonths)),
    new DropdownOption(12, i18n.t(dict.proxy.period.oneYear)),
    new DropdownOption(18, i18n.t(dict.proxy.period.oneHalfYear)),
    new DropdownOption(24, i18n.t(dict.proxy.period.twoYears))
];
