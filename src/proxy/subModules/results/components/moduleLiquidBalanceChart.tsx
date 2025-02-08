import React from 'react';

import { Box } from '@chakra-ui/react';
import { LiquidBalanceChart } from 'calculation/components/results/liquidBalanceChart';
import { useRecoilValue } from 'recoil';

import { liquidBalanceSelector } from '../store/report';

import commonCss from './common.module.less';

export const ModuleLiquidBalanceChart = () => {
    const data = useRecoilValue(liquidBalanceSelector);

    return <LiquidBalanceChart chartData={data} />;
};
