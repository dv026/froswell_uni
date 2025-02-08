import React, { memo } from 'react';

import { useRecoilValue } from 'recoil';

import { CompareChart } from '../../../../../common/components/compareChart/compareChart';
import { chartCompareColumns, chartCompareData } from '../../store/chartCompare';

export const ModuleCompareChart = memo(() => {
    const initialData = useRecoilValue(chartCompareData);
    const columns = useRecoilValue(chartCompareColumns);

    return <CompareChart data={initialData} columns={columns} />;
});
