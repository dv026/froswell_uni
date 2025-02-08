import React from 'react';

import i18n from 'i18next';

import { Dropdown, DropdownOption, DropdownProps } from '../../../../common/components/dropdown/dropdown';
import { OptimizationTargetEnum } from '../../../../common/enums/optimizationTargetEnum';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const TargetDropdown: React.FC<Pick<DropdownProps, 'value' | 'onChange'>> = ({ value, onChange }) => (
    <Dropdown className='dropdown_well-types' options={opts()} value={value} onChange={onChange} />
);

const opts = () => [
    new DropdownOption(OptimizationTargetEnum.MaxOil, i18n.t(dict.common.params.accumulatedOilProduction))
];
