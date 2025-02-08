import React, { FC, useEffect } from 'react';

import { selectedWellsState } from 'input/store/selectedWells';
import { currentSpot } from 'input/store/well';
import { useRecoilValue, useResetRecoilState } from 'recoil';

import { ChartCompareEnum } from '../../common/enums/chartCompareEnum';
import { chartCompareState } from '../store/chart/chartCompare';
import { ModuleChart } from './chart';
import { ModuleCompareChart } from './compareChart';
import { ModuleMultipleChart } from './moduleMultipleChart';

export const ModuleChartWrapper = () => {
    const compareParam = useRecoilValue(chartCompareState);
    const well = useRecoilValue(currentSpot);

    const resetCompareType = useResetRecoilState(chartCompareState);

    useEffect(() => {
        return () => {
            resetCompareType();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (compareParam === ChartCompareEnum.Sum) {
        return <ModuleChart />;
    }

    if (compareParam === ChartCompareEnum.Multiple) {
        return <ModuleMultipleChart />;
    }

    return <ModuleCompareChart />;
};
