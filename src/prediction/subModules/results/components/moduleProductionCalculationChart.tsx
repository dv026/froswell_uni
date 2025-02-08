import React, { FC } from 'react';

import { useRecoilValue } from 'recoil';

import { ProductionCalculationChart } from '../../../../calculation/components/results/productionCalculationChart';
import { reserveDevelopmentSelector } from '../store/wellDetails';

export const ModuleProductionCalculationChart = () => {
    const reserves = useRecoilValue(reserveDevelopmentSelector);

    return (
        <ProductionCalculationChart data={reserves.productionCalculation} dataAvg={reserves.productionCalculationAvg} />
    );
};
