import React, { Suspense } from 'react';

import { Box, Button, Divider, Flex, HStack, Spacer, Spinner } from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SubScenarioActionMenu } from '../../../../calculation/components/subScenarioActionMenu';
import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { CreateIcon } from '../../../../common/components/customIcon/actions';
import { NextIcon } from '../../../../common/components/customIcon/general';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { PlastDropdown } from '../../../../proxy/subModules/model/components/plastDropdown';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';
import { useSubScenarioMutations } from '../store/subScenarioMutations';
import { allSubScenarios } from '../store/subScenarios';
import { СalculationSubScenariosModal } from './modal/calculationSubScenariosModal';
import { SubScenarioDropdown } from './subScenarioDropdown';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: React.FC = () => {
    const subScenarios = useRecoilValue(allSubScenarios);

    const [subScenarioId, setSubScenarioId] = useRecoilState(currentSubScenarioId);

    const setStep = useSetRecoilState(currentStepState);

    const dispatcher = useSubScenarioMutations();

    const emptySubScenarios = isNullOrEmpty(subScenarios);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack>
                    <PlastDropdown />
                    <SubScenarioDropdown
                        subScenarioId={subScenarioId}
                        subScenarios={subScenarios}
                        onChange={setSubScenarioId}
                    />
                </HStack>
                <HStack pl={3} spacing={3}>
                    <Button
                        leftIcon={<CreateIcon boxSize={4} />}
                        variant='unstyled'
                        onClick={() => dispatcher.addItem()}
                    >
                        {i18n.t(dict.common.createNew)}
                    </Button>
                    <Divider orientation='vertical' />
                    <SubScenarioActionMenu />
                    <Divider orientation='vertical' />
                    <Suspense fallback={<Spinner />}>
                        <СalculationSubScenariosModal />
                    </Suspense>
                </HStack>
                <Spacer />
                <Box>
                    <Button
                        rightIcon={<NextIcon boxSize={6} />}
                        variant='nextStage'
                        isDisabled={emptySubScenarios}
                        onClick={() => setStep(DirectedStageEnum.WellGrid)}
                    >
                        {i18n.t(dict.proxy.wellTypeEditing)}
                    </Button>
                </Box>
            </Flex>
        </Box>
    );
};
