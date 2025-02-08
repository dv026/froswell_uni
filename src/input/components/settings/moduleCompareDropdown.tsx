import React, { FC } from 'react';

import { FormControl, FormLabel } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { compareDropdownOptions } from '../../../common/components/compareChart/compareChartHelper';
import { Dropdown } from '../../../common/components/dropdown/dropdown';
import { tryParse } from '../../../common/helpers/number';
import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { chartCompareState } from '../../store/chart/chartCompare';
import { selectedWellsState } from '../../store/selectedWells';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const ModuleCompareDropdown = () => {
    const { t } = useTranslation();

    const selectedWells = useRecoilValue(selectedWellsState);

    const [compareParam, setCompareParam] = useRecoilState(chartCompareState);

    if (isNullOrEmpty(selectedWells)) {
        return null;
    }

    return (
        <FormControl variant='inline'>
            <FormLabel>{t(dict.common.chart)}:</FormLabel>
            <Dropdown
                options={compareDropdownOptions}
                value={compareParam}
                onChange={e => {
                    setCompareParam(tryParse(e.target.value));
                }}
            />
        </FormControl>
    );
};
