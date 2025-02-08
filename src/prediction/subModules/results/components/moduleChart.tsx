import React from 'react';

import { Flex } from '@chakra-ui/react';
import { equals, cond, T, always } from 'ramda';
import { useRecoilValue } from 'recoil';

import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import { ChartType } from '../enums/chartType';
import { chartCompareState } from '../store/chartCompare';
import { chartTypeState } from '../store/chartType';
import { ModuleCompareChart } from './compareChart';
import { ModuleMultipleChart } from './moduleMultipleChart';
import { ModulePlastDistributionChart } from './modulePlastDistributionChart';
import { ModulePrimaryChart } from './modulePrimaryChart';
import { ModuleProductionCalculationChart } from './moduleProductionCalculationChart';

export const ModuleChart = () => {
    const chartType = useRecoilValue(chartTypeState);
    const compareParam = useRecoilValue(chartCompareState);

    if (compareParam === ChartCompareEnum.Multiple) {
        return (
            <Flex width='100%' flexDirection={'column'}>
                <ModuleMultipleChart />
            </Flex>
        );
    }

    if (compareParam !== ChartCompareEnum.Sum) {
        return (
            <Flex width='100%' flexDirection={'column'}>
                <ModuleCompareChart />
            </Flex>
        );
    }

    return cond([
        [equals(ChartType.Dynamic), always(<ModulePrimaryChart />)],
        [equals(ChartType.PlastDistribution), always(<ModulePlastDistributionChart />)],
        [equals(ChartType.PlastDistributionPercent), always(<ModulePlastDistributionChart />)],
        [equals(ChartType.ProductionCalculation), always(<ModuleProductionCalculationChart />)],
        [T, always(null)]
    ])(chartType);
};
