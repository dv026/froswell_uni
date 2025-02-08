import React, { Suspense, useEffect } from 'react';

import { Outlet } from 'react-router-dom';
import { useRecoilRefresher_UNSTABLE, useResetRecoilState, useSetRecoilState } from 'recoil';

import { SubModuleType } from '../calculation/enums/subModuleType';
import { currentGridMap } from '../calculation/store/gridMap';
import { proxySharedState } from '../calculation/store/sharedCalculation';
import { Spinner } from '../common/components/spinner';
import { DirectedStageEnum } from './enums/directedStageEnum';
import { currentStepState } from './store/currentStep';
import { submoduleState } from './store/submodule';

const PredictionPage = () => {
    const setStep = useSetRecoilState(currentStepState);

    const setSubmodule = useSetRecoilState(submoduleState);

    const sharedRefresher = useRecoilRefresher_UNSTABLE(proxySharedState);

    const resetGridMap = useResetRecoilState(currentGridMap);

    useEffect(() => {
        return () => {
            setStep(DirectedStageEnum.Preparation);
            setSubmodule(SubModuleType.Calculation);

            sharedRefresher();

            resetGridMap();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Suspense fallback={<Spinner show={true} />}>
            <Outlet />
        </Suspense>
    );
};

export default PredictionPage;
