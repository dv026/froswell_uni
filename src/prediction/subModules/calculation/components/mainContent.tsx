import React, { FC } from 'react';

import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { SubModuleType } from '../../../../calculation/enums/subModuleType';
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

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const MainContent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const scenarioId = useRecoilValue(currentScenarioId);
    const subScenarioId = useRecoilValue(currentSubScenarioId);
    const well = useRecoilValue(currentSpot);

    const setCurrentStep = useSetRecoilState(currentStepState);
    const setSubmodule = useSetRecoilState(submoduleState);

    const dispatcher = useInsimMutations();

    const toResults = async () => {
        const currentWell = new WellBrief(well.oilFieldId, null, well.prodObjId, null, scenarioId, subScenarioId);

        setSubmodule(SubModuleType.Results);
        setCurrentStep(DirectedStageEnum.Preparation);

        navigate(router.to(RouteEnum.PredictionResults, currentWell));
    };

    const abort = () => {
        dispatcher.abort();
    };

    return (
        <Box p={'20px'} w='100%' h='100%'>
            <Box>
                <Heading size='h3' pb={4}>
                    {t(dict.proxy.forecast)}
                </Heading>
                <CalculationProgress toResults={toResults} abort={abort} />
            </Box>
        </Box>
    );
};
