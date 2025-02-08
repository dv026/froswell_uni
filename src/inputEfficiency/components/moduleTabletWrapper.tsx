import React, { useEffect } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { ModuleTablet } from '../../commonEfficiency/components/moduleTablet';
import { tabletData, tabletSettingsState } from '../store/tablet';

export const ModuleTabletWrapper = () => {
    const model = useRecoilValue(tabletData);

    const [modelSettings, setModelSettings] = useRecoilState(tabletSettingsState);

    const resetTabletSettings = useResetRecoilState(tabletSettingsState);

    useEffect(() => {
        resetTabletSettings();
    }, [model, resetTabletSettings]);

    return <ModuleTablet model={model} modelSettings={modelSettings} setModelSettings={setModelSettings} />;
};
