import React from 'react';

import { currentPlastId } from 'calculation/store/currentPlastId';
import { useRecoilValue } from 'recoil';

import { modeMapTypeState } from '../../store/modeMapType';
import { showRepairsState } from '../../store/showRepairs';
import { chartBestMainOData } from '../../store/siteDetails';
import { ChartBestMainO } from '../chart/bestMainO/chartBestMainO';

export const ModuleChartBestMainO = () => {
    const initialChartData = useRecoilValue(chartBestMainOData);
    const plastId = useRecoilValue(currentPlastId);
    const showRepairs = useRecoilValue(showRepairsState);
    const modeMapType = useRecoilValue(modeMapTypeState);

    const [hiddenLines, setHiddenLines] = React.useState<string[]>([]);

    return (
        <ChartBestMainO
            initialChartData={initialChartData}
            plastId={plastId}
            showRepairs={showRepairs}
            modeMapType={modeMapType}
            hiddenLines={hiddenLines}
            setHiddenLines={setHiddenLines}
        />
    );
};
