import React, { FC } from 'react';

import i18n from 'i18next';
import { map } from 'ramda';

import { ScenarioModel } from '../../calculation/entities/scenarioModel';
import { Dropdown, DropdownOption, DropdownProps } from '../../common/components/dropdown/dropdown';

import dict from '../../common/helpers/i18n/dictionary/main.json';

interface ScenarioDropdownProps {
    scenarioId: number;
    scenarios: ScenarioModel[];
    onChange: (id: number) => void;
}

export const ScenarioDropdown: FC<ScenarioDropdownProps> = (p: ScenarioDropdownProps) => {
    return (
        <Dropdown
            className='settings__dropdown-scenarios'
            {...scenariosOpts(p.scenarios, p.scenarioId, (s: number) => p.onChange(s))}
        />
    );
};

const scenariosOptions = (scenarios: ScenarioModel[]) => {
    if (!scenarios) return [new DropdownOption('null', i18n.t(dict.common.nodata))];

    return map(it => new DropdownOption(it.id, it.name), scenarios);
};

const scenariosOpts = (
    scenarios: ScenarioModel[],
    scenarioId: number,
    onChange: (s: number) => void
): DropdownProps => ({
    onChange: e => onChange(+e.target.value),
    options: scenariosOptions(scenarios),
    value: scenarioId
});
