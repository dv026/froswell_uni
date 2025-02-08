import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';

import { RelativePermeabilityChart } from '../../../../calculation/components/results/relativePermeabilityChart';
import { relativePermeabilitySelector } from '../store/report';

import commonCss from './common.module.less';

export const ModuleRelativePermeabilityChart = () => {
    const wrapper = useRecoilValue(relativePermeabilitySelector);

    return (
        <Box className={commonCss.results__chart}>
            <RelativePermeabilityChart data={wrapper.data} names={wrapper.names} />
        </Box>
    );
};
