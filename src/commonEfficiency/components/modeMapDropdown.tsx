import React from 'react';

import { FormControl, FormLabel } from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../common/components/dropdown/dropdown';
import { ModeMapEnum } from '../../common/enums/modeMapEnum';
import { modeMapTypeState } from '../store/modeMapType';

import dict from '../../common/helpers/i18n/dictionary/main.json';

// obsolete
export const ModeMapDropdown: React.FC = () => {
    const [modeMapType, setModeMapType] = useRecoilState(modeMapTypeState);

    return (
        <FormControl variant='inline'>
            <FormLabel>{i18n.t(dict.common.mode)}:</FormLabel>
            <Dropdown
                className='action__selector'
                value={modeMapType}
                options={opts()}
                onChange={e => setModeMapType(+e.target.value)}
            />
        </FormControl>
    );
};

const opts = () => [
    new DropdownOption(ModeMapEnum.Daily, i18n.t(dict.common.daily)),
    new DropdownOption(ModeMapEnum.Accumulated, i18n.t(dict.common.accumulated))
];
