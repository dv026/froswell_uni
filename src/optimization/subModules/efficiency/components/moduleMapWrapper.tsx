import React, { FC, Suspense, useCallback } from 'react';

import { Spinner } from 'common/components/spinner';
import { WellBrief } from 'common/entities/wellBrief';
import { gridMapSettings } from 'commonEfficiency/store/gridMapSettings';
import { currentSpot } from 'optimization/store/well';
import { useWellMutations } from 'optimization/store/wellMutations';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { MapCurtain } from '../../../../commonEfficiency/components/mapCurtain';
import { ModuleHistoryRange } from '../../../../commonEfficiency/components/moduleHistoryRange';
import { ModuleMap } from '../../../../commonEfficiency/components/moduleMap';
import { OperationDistributionCurtain } from '../../../../commonEfficiency/components/operationDistributionCurtain';
import { isLoadingState } from '../../../../proxy/subModules/efficiency/store/moduleMapMutations';
import { availableGridsSelector, krigingPeriodSelector, mapSettingsState } from '../store/mapSettings';
import { useModuleMapMutations } from '../store/moduleMapMutations';
import { operationsSelector, selectedOperationState } from '../store/operationDistribution';

export const ModuleMapWrapper = () => {
    const isLoading = useRecoilValue(isLoadingState);
    const operations = useRecoilValue(operationsSelector);
    const mapSettings = useRecoilValue(mapSettingsState);
    const availableGrids = useRecoilValue(availableGridsSelector);
    const krigingPeriod = useRecoilValue(krigingPeriodSelector);
    const well = useRecoilValue(currentSpot);
    const gridSettings = useRecoilValue(gridMapSettings);

    const [selectedOperations, setSelectedOperations] = useRecoilState(selectedOperationState);

    const resetMapSettings = useResetRecoilState(mapSettingsState);

    const dispatcher = useModuleMapMutations();
    const wellMutations = useWellMutations();

    const onChangeWell = useCallback(
        (well: WellBrief) => {
            wellMutations.set(well);
            resetMapSettings();
        },
        [resetMapSettings, wellMutations]
    );

    return (
        <>
            <Spinner show={isLoading} />
            <Suspense fallback={<Spinner show={true} />}>
                <MapCurtain availableGrids={availableGrids} krigingPeriod={krigingPeriod} />
            </Suspense>
            <Suspense fallback={<Spinner show={true} />}>
                <OperationDistributionCurtain
                    operations={operations}
                    selectedOperations={selectedOperations}
                    setSelectedOperations={setSelectedOperations}
                />
            </Suspense>
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleHistoryRange mapSettings={mapSettings} onChange={dispatcher.reload} />
            </Suspense>
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleMap
                    gridSettings={gridSettings}
                    mapSettings={mapSettings}
                    selectedOperations={selectedOperations}
                    well={well}
                    onChangeWell={onChangeWell}
                />
            </Suspense>
        </>
    );
};
