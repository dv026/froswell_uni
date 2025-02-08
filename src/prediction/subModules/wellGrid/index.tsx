import React, { FC, Suspense } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';

import { currentSubScenarioId, defaultSubScenarioId } from '../../../calculation/store/currentSubScenarioId';
import { ContentContainer } from '../../../common/components/contentContainer';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { SettingsPanel } from '../../../common/components/settingsPanel';
import { Spinner } from '../../../common/components/spinner';
import { ActionLinks } from '../../components/actionLinks';
import { ModuleStages } from '../../components/moduleStages';
import { DirectedStageEnum } from '../../enums/directedStageEnum';
import { currentStepState } from '../../store/currentStep';
import { Settings as ModelSettings } from '../model/components/settings';
import { ModuleMapWrapper } from './components/moduleMapWrapper';
import { Settings } from './components/settings';

export const PredictionWellGrid = () => {
    const step = useRecoilValue(currentStepState);
    const subScenarioIdDefault = useRecoilValue(defaultSubScenarioId);

    const [subScenarioId, setSubScenarioId] = useRecoilState(currentSubScenarioId);

    React.useEffect(() => {
        if (!subScenarioId) {
            setSubScenarioId(subScenarioIdDefault);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subScenarioId]);

    const isWellGrid = step === DirectedStageEnum.WellGrid;

    return (
        <Page>
            <PageColumn>
                <Suspense fallback={<Spinner show={true} />}>
                    <NavigationPanel>
                        <Suspense fallback={<Spinner show={true} />}>
                            <ActionLinks />
                            <ModuleStages />
                        </Suspense>
                    </NavigationPanel>
                    <SettingsPanel>
                        <Suspense fallback={<Spinner show={true} />}>
                            {isWellGrid ? <Settings /> : <ModelSettings />}
                        </Suspense>
                    </SettingsPanel>
                    <ContentContainer>
                        <ModuleMapWrapper />
                    </ContentContainer>
                </Suspense>
            </PageColumn>
        </Page>
    );
};
