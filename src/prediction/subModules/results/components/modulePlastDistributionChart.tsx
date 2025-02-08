import React, { FC } from 'react';

import { useRecoilValue } from 'recoil';

import { PlastDistributionChart } from '../../../../calculation/components/results/plastDistributionChart';
import { ChartType } from '../enums/chartType';
import { chartTypeState } from '../store/chartType';
import { modulePlasts } from '../store/currentPlastId';
import { modeMapTypeState } from '../store/modeMapType';
import { plastDistributions } from '../store/wellDetails';

export const ModulePlastDistributionChart = () => {
    const data = useRecoilValue(plastDistributions);
    const dataMode = useRecoilValue(modeMapTypeState);
    const plasts = useRecoilValue(modulePlasts);
    const chartType = useRecoilValue(chartTypeState);

    const isPercent = chartType === ChartType.PlastDistributionPercent;

    return (
        <PlastDistributionChart
            key={'pdc'}
            data={data}
            dataMode={dataMode}
            plasts={plasts}
            unit={isPercent ? '%' : ''}
        />
    );
};
