import React from 'react';

import { useRecoilValue } from 'recoil';

import { PlastDistributionChart } from '../../../../../calculation/components/results/plastDistributionChart';
import { ChartType } from '../../../../../prediction/subModules/results/enums/chartType';
import { chartTypeState } from '../../store/chartType';
import { modeMapTypeState } from '../../store/modeMapType';
import { plastDistributions, siteDetailsState } from '../../store/siteDetails';

export const OptimizationPlastDistributionChart: React.FC = () => <Chart />;

const Chart: React.FC = () => {
    const data = useRecoilValue(plastDistributions);
    const site = useRecoilValue(siteDetailsState);

    const chartType = useRecoilValue(chartTypeState);
    const modeMapType = useRecoilValue(modeMapTypeState);

    const isPercent = chartType === ChartType.PlastDistributionPercent;

    return (
        <PlastDistributionChart
            key={'odc'}
            data={data}
            dataMode={modeMapType}
            plasts={site.plasts}
            unit={isPercent ? '%' : ''}
        />
    );
};
