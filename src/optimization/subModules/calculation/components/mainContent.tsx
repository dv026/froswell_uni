import React from 'react';

import { Box, Divider, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CalculationOptDetails } from '../../../../calculation/entities/computation/calculationOptDetails';
import { SubModuleType } from '../../../../calculation/enums/subModuleType';
import { computationStatusState } from '../../../../calculation/store/computationStatus';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { useInsimMutations } from '../../../../calculation/store/insimMutations';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { RouteEnum } from '../../../../common/enums/routeEnum';
import * as router from '../../../../common/helpers/routers/predictionRouter';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';
import { submoduleState } from '../../../store/submodule';
import { currentSpot } from '../../../store/well';
import { CalculationProgress } from './calculationProgress';
import { BestByPeriodChart } from './charts/bestByPeriodChart';
import { TrialsChart } from './charts/trialsChart';
import { WellDynamics } from './charts/wellDynamics';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const MainContent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const computationStatus = useRecoilValue(computationStatusState);
    const scenarioId = useRecoilValue(currentScenarioId);
    const subScenarioId = useRecoilValue(currentSubScenarioId);
    const well = useRecoilValue(currentSpot);

    const setSubmodule = useSetRecoilState(submoduleState);
    const setCurrentStep = useSetRecoilState(currentStepState);

    const dispatcher = useInsimMutations();

    const allowDetailsStatus = !isNil(computationStatus);

    if (!computationStatus) {
        return null;
    }

    const details = computationStatus?.details as unknown as CalculationOptDetails;

    const allowResults = !isNil(details) && !isNullOrEmpty(details.periods);

    const toResults = async () => {
        const currentWell = new WellBrief(well.oilFieldId, null, well.prodObjId, null, scenarioId, subScenarioId);

        setSubmodule(SubModuleType.Results);
        setCurrentStep(DirectedStageEnum.Preparation);

        navigate(router.to(RouteEnum.OptimizationResults, currentWell));
    };

    const abort = () => {
        dispatcher.abort();
    };

    return (
        <Box p={'20px'} w='100%' h='100%'>
            <Box>
                <CalculationProgress toResults={toResults} abort={abort} collapsed={allowResults} />
            </Box>
            <Divider />
            <Tabs isLazy pt='10px'>
                <TabList>
                    <Tab isDisabled={!allowDetailsStatus}>{t(dict.optimization.variants)}</Tab>
                    <Tab isDisabled={!allowDetailsStatus}>{t(dict.optimization.periods)}</Tab>
                    <Tab isDisabled={!allowDetailsStatus}>{t(dict.common.wells)}</Tab>
                </TabList>
                <TabPanels pt={4}>
                    <TabPanel>
                        <Box className='calculation__info'>
                            <TrialsChart details={details} />
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box className='calculation__info'>
                            <BestByPeriodChart details={details} />
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box className='calculation__info'>
                            <WellDynamics details={details} />
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};
