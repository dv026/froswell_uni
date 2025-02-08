import React, { FC } from 'react';

import { FormControl, FormLabel } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { tabletDisplayModeState } from '../../store/tabletDisplayMode';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const TabletViewSetting = () => {
    const { t } = useTranslation();

    const [tabletDisplayMode, setTabletDisplayMode] = useRecoilState(tabletDisplayModeState);

    return (
        <FormControl variant='inline'>
            <FormLabel>{t(dict.common.mode)}:</FormLabel>
            <Dropdown
                options={[
                    new DropdownOption(DisplayModeEnum.TabletNew, t(dict.common.tablet)),
                    new DropdownOption(DisplayModeEnum.Table, t(dict.proxy.table))
                ]}
                value={tabletDisplayMode}
                onChange={e => {
                    setTabletDisplayMode(+e.target.value as DisplayModeEnum);
                }}
            />
        </FormControl>
    );
};
