import React, { FC } from 'react';

import { repairModeState } from 'commonEfficiency/store/repairMode';
import { useRecoilState, useRecoilValue } from 'recoil';

import { CurtainSettings } from '../../../../commonEfficiency/components/curtainSettings';
import { PrimaryChart } from '../../../../commonEfficiency/components/primaryChart';
import { RepairOptionsWrapper } from '../../../../commonEfficiency/components/repairOptionsWrapper';
import { accumulatedGrowth, averageGrowth, chartFilteredData, efficiencyRepairs } from '../store/efficiency/chartData';

export const ModuleGtm = () => {
    const repairs = useRecoilValue(efficiencyRepairs);

    const avgGrowth = useRecoilValue(averageGrowth);
    const accumGrowth = useRecoilValue(accumulatedGrowth);
    const chartData = useRecoilValue(chartFilteredData);

    const [repairMode, setRepairMode] = useRecoilState(repairModeState);

    return (
        <>
            <PrimaryChart accumGrowth={accumGrowth} chartData={chartData} repairMode={repairMode} />
            <RepairOptionsWrapper repairs={repairs} repairMode={repairMode} onChangeRepair={setRepairMode} />
            <CurtainSettings avgGrowth={avgGrowth} accumGrowth={accumGrowth} repairMode={repairMode} />
        </>
    );
};
