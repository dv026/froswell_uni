import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';

import { Spinner } from '../../../../common/components/spinner';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { currentSpot } from '../../../store/well';
import { isLoadingState } from '../store/isLoading';
import { moduleState } from '../store/moduleState';
import { settingsState } from '../store/settings';
import { TargetZoneWrapper } from './targetZoneWrapper';

export const MainContent = () => {
    const isLoading = useRecoilValue(isLoadingState);
    const module = useRecoilValue(moduleState);
    const settings = useRecoilValue(settingsState);
    const well = useRecoilValue(currentSpot);

    const chartData = module.chartData;
    const targetZones = module.targetZones;

    if (isNullOrEmpty(targetZones) && isNullOrEmpty(chartData)) {
        return null;
    }

    return (
        <Box w='100%' h='100%'>
            <Spinner show={isLoading} />
            <TargetZoneWrapper zones={targetZones} data={chartData} well={well} settings={settings} />
        </Box>
    );
};
