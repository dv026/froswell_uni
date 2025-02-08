import React, { FC, Suspense } from 'react';

import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { CalculationModeEnum } from '../../../../calculation/enums/calculationModeEnum';
import { calculationModeState } from '../../../../calculation/store/calculationMode';
import { Spinner } from '../../../../common/components/spinner';
import { ModuleMap } from '../../../components/moduleMap';
import { MapCurtain } from '../../../components/moduleMap/mapCurtain';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';
import { ToolMapControls as EditModelToolMapControls } from '../../editModel/components/toolMapControls';
import { ToolMapControls as ModelToolMapControls } from '../../model/components/toolMapControls';
import { isLoadingState } from '../../model/store/scenarioMutations';
import { ToolMapControls as WellGroupToolMapControls } from '../../wellGroup/components/toolMapControls';
import { WellGroupsCurtain } from '../../wellGroup/components/wellGroupsCurtain';
import { SequentialUserActions } from '../components/sequentialUserActions';
import { ToolMapControls as WellGridToolMapControls } from '../components/toolMapControls';

export const ModuleMapWrapper = () => {
    const isLoading = useRecoilValue(isLoadingState);
    const mode = useRecoilValue(calculationModeState);
    const step = useRecoilValue(currentStep);

    const isWellGrid = step === DirectedStageEnum.WellGrid || step === DirectedStageEnum.EditModel;
    const isWellGroup = step === DirectedStageEnum.WellGroup;
    const isImprovement = mode === CalculationModeEnum.Improvement;

    return (
        <>
            <Spinner show={isLoading} />
            <Suspense fallback={<Spinner show={true} />}>
                <MapCurtain isProxy={true} withInterwells={isWellGrid} isImprovement={isImprovement} />
            </Suspense>
            <Suspense fallback={<Spinner show={true} />}>
                {cond([
                    [equals(DirectedStageEnum.CreateModel), always(<ModelToolMapControls />)],
                    [
                        equals(DirectedStageEnum.EditModel),
                        always(
                            <>
                                <SequentialUserActions />
                                <EditModelToolMapControls />
                            </>
                        )
                    ],
                    [
                        equals(DirectedStageEnum.WellGrid),
                        always(
                            <>
                                <SequentialUserActions />
                                <WellGridToolMapControls />
                            </>
                        )
                    ],
                    [
                        equals(DirectedStageEnum.WellGroup),
                        always(
                            <>
                                <WellGroupsCurtain />
                                <WellGroupToolMapControls />
                            </>
                        )
                    ],
                    [T, always(null)]
                ])(step)}
            </Suspense>
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleMap mode={mode} isWellGrid={isWellGrid} isWellGroup={isWellGroup} />
            </Suspense>
        </>
    );
};
