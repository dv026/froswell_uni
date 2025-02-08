import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { AccumOilPlanFactChart } from 'calculation/components/results/accumOilPlanFactChart';
import { useRecoilValue } from 'recoil';

import { accumOilPlanFactSelector } from '../store/report';

import commonCss from './common.module.less';

export const ModuleAccumOilPlanFactChart = () => {
    const data = useRecoilValue(accumOilPlanFactSelector);

    return (
        <Box className={commonCss.results__chart}>
            <AccumOilPlanFactChart data={data} />
        </Box>
    );
};
