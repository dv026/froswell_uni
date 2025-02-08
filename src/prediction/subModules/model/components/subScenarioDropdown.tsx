import React, { FC } from 'react';

import i18n from 'i18next';
import { map } from 'ramda';

import { Dropdown, DropdownOption, DropdownProps } from '../../../../common/components/dropdown/dropdown';
import { SubScenarioModel } from '../../../../proxy/entities/proxyMap/subScenarioModel';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface SubScenarioDropdownProps {
    subScenarioId: number;
    subScenarios: SubScenarioModel[];
    onChange: (id: number) => void;
}

export const SubScenarioDropdown: FC<SubScenarioDropdownProps> = (p: SubScenarioDropdownProps) => {
    return (
        <Dropdown
            className='settings__dropdown-subScenarios'
            {...subScenariosOpts(p.subScenarios, p.subScenarioId, (s: number) => p.onChange(s))}
        />
    );
};

const subScenariosOptions = (subScenarios: SubScenarioModel[]) => {
    if (!subScenarios) return [new DropdownOption('null', i18n.t(dict.common.nodata))];

    return map(it => new DropdownOption(it.id, it.name), subScenarios);
};

const subScenariosOpts = (
    subScenarios: SubScenarioModel[],
    subScenarioId: number,
    onChange: (s: number) => void
): DropdownProps => ({
    onChange: e => onChange(+e.target.value),
    options: subScenariosOptions(subScenarios),
    value: subScenarioId
});
