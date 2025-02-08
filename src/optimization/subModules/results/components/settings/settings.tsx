import React, { FC, memo } from 'react';

import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { DisplayModeEnum } from '../../../../../common/enums/displayModeEnum';
import { displayModeState } from '../../store/displayMode';
import { ChartSettings } from './chartSettings';
import { HeatmapSettings } from './heatmapSettings';
import { MapSettings } from './mapSettings';
import { TabletSettings } from './tabletSettings';

export const Settings: FC = memo(() => {
    const displayMode = useRecoilValue(displayModeState);

    return cond([
        [equals(DisplayModeEnum.Chart), always(<ChartSettings />)],
        [equals(DisplayModeEnum.Map), always(<MapSettings />)],
        [equals(DisplayModeEnum.Tablet), always(<TabletSettings />)],
        [equals(DisplayModeEnum.TabletNew), always(<TabletSettings />)],
        [equals(DisplayModeEnum.Heatmap), always(<HeatmapSettings />)],
        [T, always(null)]
    ])(displayMode);
});
