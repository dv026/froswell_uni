import React, { Suspense } from 'react';

import { Box, Button, ButtonGroup, Divider, Flex, HStack, Spacer, Spinner } from '@chakra-ui/react';
import i18n from 'i18next';
import { ScenarioActionMenu } from 'proxy/components/scenarioActionMenu';
import { find, isNil } from 'ramda';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import colors from '../../../../../theme/colors';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { scenariosState } from '../../../../calculation/store/scenarios';
import { CreateIcon } from '../../../../common/components/customIcon/actions';
import { FavoriteIcon, NextIcon } from '../../../../common/components/customIcon/general';
import { ScenarioDropdown } from '../../../components/scenarioDropdown';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';
import { interwellsCalculationParamsState } from '../store/calculcationSettings';
import { useScenarioMutations } from '../store/scenarioMutations';
import { СalculationScenariosModal } from './modal/calculationScenariosModal';
import { CopyScenarioModal } from './modal/copyScenarioModal';
import { DeleteScenarioModal } from './modal/deleteScenarioModal';
import { RenameScenarioModal } from './modal/renameScenarioModal';
import { PlastDropdown } from './plastDropdown';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: React.FC = () => {
    const scenarios = useRecoilValue(scenariosState);

    const [scenarioId, setScenarioId] = useRecoilState(currentScenarioId);

    const resetInterwellsParams = useResetRecoilState(interwellsCalculationParamsState);

    const setStep = useSetRecoilState(currentStep);

    const dispatcher = useScenarioMutations();

    const onChangeScenarioHandler = (id: number) => {
        resetInterwellsParams();
        setScenarioId(id);
    };

    const scenarioItem = find(it => it.id === scenarioId, scenarios);

    if (isNil(scenarioItem)) {
        return null;
    }

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack>
                    <PlastDropdown />
                    <ScenarioDropdown
                        scenarioId={scenarioId}
                        scenarios={scenarios}
                        onChange={onChangeScenarioHandler}
                    />
                </HStack>
                <HStack pl={4} spacing={3}>
                    <Button
                        leftIcon={<CreateIcon boxSize={4} />}
                        variant='unstyled'
                        onClick={() => dispatcher.addItem()}
                    >
                        {i18n.t(dict.common.createNew)}
                    </Button>
                    <Divider orientation='vertical' />
                    <ScenarioActionMenu />
                    <Divider orientation='vertical' />
                    <Suspense fallback={<Spinner />}>
                        <СalculationScenariosModal />
                    </Suspense>
                </HStack>
                <Spacer />
                <Box>
                    <Button
                        rightIcon={<NextIcon boxSize={6} />}
                        variant='nextStage'
                        onClick={() => setStep(DirectedStageEnum.WellGrid)}
                    >
                        {i18n.t(dict.proxy.wellGridEditing)}
                    </Button>
                </Box>
            </Flex>
        </Box>
    );
};
