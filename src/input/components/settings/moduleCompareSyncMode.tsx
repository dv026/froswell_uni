import React from 'react';

import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import { ChartCompareEnum } from 'common/enums/chartCompareEnum';
import { chartCompareSyncMode } from 'input/store/chart/chartCompareSyncMode';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { chartCompareState } from '../../store/chart/chartCompare';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const ModuleCompareSyncMode = () => {
    const { t } = useTranslation();

    const compareParam = useRecoilValue(chartCompareState);

    const [syncMode, setSyncMode] = useRecoilState(chartCompareSyncMode);

    if (compareParam !== ChartCompareEnum.Multiple) {
        return null;
    }

    return (
        <FormControl variant='inline'>
            <FormLabel>{t(dict.common.syncMode)}:</FormLabel>
            <Checkbox isChecked={syncMode} onChange={e => setSyncMode(e.target.checked)} />
        </FormControl>
    );
};
