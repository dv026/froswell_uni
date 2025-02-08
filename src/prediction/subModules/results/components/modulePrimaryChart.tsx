import React, { useState } from 'react';

import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { isNil, not } from 'ramda';
import { useRecoilValue } from 'recoil';

import { ChartItem } from '../entities/chartItem';
import { currentPlastId } from '../store/currentPlastId';
import { modeMapTypeState } from '../store/modeMapType';
import { showRepairsState } from '../store/showRepairs';
import { wellDetailsState } from '../store/wellDetails';
import { getInitialChartData, PrimaryChart } from './primaryChart';

export const ModulePrimaryChart = () => {
    const modeMapType = useRecoilValue(modeMapTypeState);
    const plastId = useRecoilValue(currentPlastId);
    const showRepairs = useRecoilValue(showRepairsState);
    const wellDetails = useRecoilValue(wellDetailsState);

    const [hiddenLines, setHiddenLines] = useState<string[]>(['skinFactorCalc', 'skinFactorReal']);

    return (
        <PrimaryChart
            data={getInitialChartData(wellDetails.data, wellDetails.id, plastId, modeMapType)}
            modeMapType={modeMapType}
            plastId={plastId}
            showRepairs={showRepairs}
            wellId={wellDetails.id}
            hiddenLines={hiddenLines}
            setHiddenLines={setHiddenLines}
        />
    );
};
