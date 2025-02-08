import React, { FC, Suspense } from 'react';

import { useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { LegendTool } from '../../../../common/components/mapCanvas/legendTool';
import { Spinner } from '../../../../common/components/spinner';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { appearanceSettingsState } from '../store/appearanceSettings';
import { modeMapTypeState } from '../store/modeMapType';
import { isLoadingState } from '../store/moduleMapMutations';
import { MapCurtain } from './map/mapCurtain';
import { ModuleHistoryRange } from './moduleHistoryRange';
import { ModuleMap } from './moduleMap';

export const ModuleMapWrapper = () => {
    const appearance = useRecoilValue(appearanceSettingsState);
    const isLoading = useRecoilValue(isLoadingState);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const plastId = useRecoilValue(currentPlastId);

    return (
        <>
            <Spinner show={isLoading} />
            <Suspense fallback={<Spinner show={true} />}>
                <MapCurtain />
            </Suspense>
            <LegendTool
                accumulated={modeMapType === ModeMapEnum.Accumulated}
                plastId={plastId}
                show={{
                    inflowProfile: true,
                    compensation: true,
                    tracerResearch: true,
                    liquidDistribution: true,
                    flowInterwells: true,
                    scaleLiquidDistributionByWell: appearance.scaleLiquidDistributionByWell
                }}
            />
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleHistoryRange />
            </Suspense>
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleMap />
            </Suspense>
        </>
    );
};
