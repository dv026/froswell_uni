import React, { FC, memo } from 'react';

import { cond, always, T, equals } from 'ramda';
import { useRecoilValue } from 'recoil';

import { DisplayModeEnum } from '../../../../../common/enums/displayModeEnum';
import { displayModeState } from '../../store/displayMode';
import { ChartSettings } from './chartSettings';
import { MapSettings } from './mapSettings';
import { TabletSettings } from './tabletSettings';

export const Settings: FC = memo(() => {
    const displayMode = useRecoilValue(displayModeState);

    return cond([
        [equals(DisplayModeEnum.Chart), always(<ChartSettings />)],
        [equals(DisplayModeEnum.Map), always(<MapSettings />)],
        [equals(DisplayModeEnum.Tablet), always(<TabletSettings />)],
        [equals(DisplayModeEnum.TabletNew), always(<TabletSettings />)],
        [T, always(null)]
    ])(displayMode);
});
