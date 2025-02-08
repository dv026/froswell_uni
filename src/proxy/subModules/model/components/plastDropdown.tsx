import React from 'react';

import { map } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { Dropdown, DropdownOption, DropdownProps } from '../../../../common/components/dropdown/dropdown';
import { KeyValue } from '../../../../common/entities/keyValue';
import { tryParse } from '../../../../common/helpers/number';

export const PlastDropdown: React.FC = () => {
    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const plasts = useRecoilValue(allPlasts);

    return <Dropdown {...plastsOpts(plastId, plasts, s => setPlastId(s))} />;
};

const plastToOption = p => new DropdownOption(p.id, p.name);
const plastsOpts = (plastId: number, selectedPlasts: KeyValue[], setPlastId: (s) => void): DropdownProps => ({
    onChange: e => setPlastId(tryParse(e.target.value)),
    options: map(plastToOption, selectedPlasts),
    value: plastId
});
