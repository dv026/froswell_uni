import React from 'react';

import { Flex } from '@chakra-ui/react';
import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import { ChartType } from '../../../../prediction/subModules/results/enums/chartType';
import { DataModeEnum } from '../enums/dataModeEnum';
import { chartCompareState } from '../store/chartCompare';
import { chartTypeState } from '../store/chartType';
import { dataModeState } from '../store/dataMode';
import { Chart } from './chart/allScenarios/chart';
import { ModuleChartBestMainO } from './chart/moduleChartBestMainO';
import { ModuleProductionCalculationChart } from './chart/moduleProductionCalculationChart';
import { OptimizationPlastDistributionChart } from './chart/optimizationPlastDistributionChart';
import { ModuleCompareChart } from './compareChart';
import { ModuleMultipleChart } from './moduleMultipleChart';

export const ModuleChart = () => {
    const chartType = useRecoilValue(chartTypeState);
    const dataMode = useRecoilValue(dataModeState);
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
        [equals(ChartType.Dynamic), always(dataMode === DataModeEnum.SummaryO ? <Chart /> : <ModuleChartBestMainO />)],
        [equals(ChartType.PlastDistributionPercent), always(<OptimizationPlastDistributionChart />)],
        [equals(ChartType.PlastDistribution), always(<OptimizationPlastDistributionChart />)],
        [equals(ChartType.ProductionCalculation), always(<ModuleProductionCalculationChart />)],
        [T, always(null)]
    ])(chartType);
};
