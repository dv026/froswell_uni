import React, { FC } from 'react';

import { useRecoilValue } from 'recoil';

import { PlastDistributionChart } from '../../../../calculation/components/results/plastDistributionChart';
import { allPlasts } from '../../../../calculation/store/plasts';
import { GraphViewParam } from '../enums/graphViewParam';
import { modeMapTypeState } from '../store/modeMapType';
import { plastDistributions } from '../store/report';
import { viewTypeSelector } from '../store/viewType';

export const ModulePlastDistributionChart = () => {
    const data = useRecoilValue(plastDistributions);
    const dataMode = useRecoilValue(modeMapTypeState);
    const plasts = useRecoilValue(allPlasts);
    const viewType = useRecoilValue(viewTypeSelector);

    const isPercent = viewType === GraphViewParam.PlastDistributionPercent;

    return <PlastDistributionChart data={data} dataMode={dataMode} plasts={plasts} unit={isPercent ? '%' : ''} />;
};
