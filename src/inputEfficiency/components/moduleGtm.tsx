import React from 'react';

import { repairModeState } from 'commonEfficiency/store/repairMode';
import { currentSpot } from 'input/store/well';
import { useRecoilState, useRecoilValue } from 'recoil';

import { EmptyData } from '../../common/components/emptyData';
import { CurtainSettings } from '../../commonEfficiency/components/curtainSettings';
import { PrimaryChart } from '../../commonEfficiency/components/primaryChart';
import { RepairOptionsWrapper } from '../../commonEfficiency/components/repairOptionsWrapper';
import { accumulatedGrowth, averageGrowth, chartFilteredData, efficiencyRepairs } from '../store/chartData';

export const ModuleGtm = () => {
    const well = useRecoilValue(currentSpot);

    const repairs = useRecoilValue(efficiencyRepairs);

    const avgGrowth = useRecoilValue(averageGrowth);
    const accumGrowth = useRecoilValue(accumulatedGrowth);
    const chartData = useRecoilValue(chartFilteredData);

    const [repairMode, setRepairMode] = useRecoilState(repairModeState);

    if (!well?.id) {
        return <EmptyData />;
    }

    return (
        <>
            <PrimaryChart accumGrowth={accumGrowth} chartData={chartData} repairMode={repairMode} />
            <RepairOptionsWrapper repairs={repairs} repairMode={repairMode} onChangeRepair={setRepairMode} />
            <CurtainSettings avgGrowth={avgGrowth} accumGrowth={accumGrowth} repairMode={repairMode} />
        </>
    );
};
