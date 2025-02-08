import React, { useEffect } from 'react';

import { Outlet } from 'react-router-dom';
import { useRecoilRefresher_UNSTABLE, useResetRecoilState, useSetRecoilState } from 'recoil';

import { currentGridMap } from '../calculation/store/gridMap';
import { proxySharedState } from '../calculation/store/sharedCalculation';
import { DirectedStageEnum } from './enums/directedStageEnum';
import { currentStep } from './store/currentStep';

const ProxyPage = () => {
    const setStep = useSetRecoilState(currentStep);

    const sharedRefresher = useRecoilRefresher_UNSTABLE(proxySharedState);

    const resetGridMap = useResetRecoilState(currentGridMap);

    useEffect(() => {
        return () => {
            setStep(DirectedStageEnum.Preparation);

            sharedRefresher();

            resetGridMap();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Outlet />;
};

export default ProxyPage;
