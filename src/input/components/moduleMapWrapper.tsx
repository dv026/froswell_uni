import React, { FC, Suspense } from 'react';

import { appearanceSettingsState } from 'input/store/map/appearanceSettings';
import { krigingVariationLossesState } from 'input/store/map/krigingVariationLosses';
import { useRecoilValue } from 'recoil';

import { LegendTool } from '../../common/components/mapCanvas/legendTool';
import { Spinner } from '../../common/components/spinner';
import { ModeMapEnum } from '../../common/enums/modeMapEnum';
import { modeMapTypeState } from '../store/map/modeMapType';
import { isLoadingState } from '../store/map/moduleMapMutations';
import { ModuleHistoryRange } from './moduleHistoryRange';
import { ModuleMap } from './moduleMap';
import { MapCurtain } from './settings/mapCurtain';

export const ModuleMapWrapper = () => {
    const isLoading = useRecoilValue(isLoadingState);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const appearance = useRecoilValue(appearanceSettingsState);
    const variationLossesSettings = useRecoilValue(krigingVariationLossesState);

    return (
        <>
            <Spinner show={isLoading} />
            <Suspense fallback={<Spinner show={true} />}>
                <MapCurtain />
            </Suspense>
            <LegendTool
                accumulated={modeMapType === ModeMapEnum.Accumulated}
                show={{
                    tracerResearch: true,
                    openingMode: appearance.showOpeningMode,
                    variationLoss: variationLossesSettings.visible
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
