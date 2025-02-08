import React, { FC, Suspense } from 'react';

import { always, cond, equals, T } from 'ramda';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentScenarioId, defaultScenarioId } from '../../../calculation/store/currentScenarioId';
import { ContentContainer } from '../../../common/components/contentContainer';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { SettingsPanel } from '../../../common/components/settingsPanel';
import { Spinner } from '../../../common/components/spinner';
import { ActionLinks } from '../../components/actionLinks';
import { ModuleStages } from '../../components/moduleStages';
import { DirectedStageEnum } from '../../enums/directedStageEnum';
import { currentStep } from '../../store/currentStep';
import { Settings as EditModelSettings } from '../editModel/components/settings';
import { Settings as ModelSettings } from '../model/components/settings';
import { Settings as WellGroupSettings } from '../wellGroup/components/settings';
import { ModuleMapWrapper } from './components/moduleMapWrapper';
import { Settings as WellGridSettings } from './components/settings';

export const ProxyWellGrid = () => {
    const scenarioId = useRecoilValue(currentScenarioId);
    const scenarioIdDefault = useRecoilValue(defaultScenarioId);
    const step = useRecoilValue(currentStep);

    const setScenarioId = useSetRecoilState(currentScenarioId);

    React.useEffect(() => {
        if (!scenarioId) {
            setScenarioId(scenarioIdDefault);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenarioId]);

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
                            {cond([
                                [equals(DirectedStageEnum.CreateModel), always(<ModelSettings />)],
                                [equals(DirectedStageEnum.EditModel), always(<EditModelSettings />)],
                                [equals(DirectedStageEnum.WellGrid), always(<WellGridSettings />)],
                                [equals(DirectedStageEnum.WellGroup), always(<WellGroupSettings />)],
                                [T, always(null)]
                            ])(step)}
                        </Suspense>
                    </SettingsPanel>
                    <ContentContainer>
                        <Suspense fallback={<Spinner show={true} />}>
                            <ModuleMapWrapper />
                        </Suspense>
                    </ContentContainer>
                </Suspense>
            </PageColumn>
        </Page>
    );
};
