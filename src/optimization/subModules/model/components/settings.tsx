import React, { Suspense } from 'react';

import { Box, Button, ButtonGroup, Divider, Flex, HStack, Spacer, Spinner } from '@chakra-ui/react';
import { SubScenarioActionMenu } from 'calculation/components/subScenarioActionMenu';
import i18n from 'i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { CopyIcon, CreateIcon } from '../../../../common/components/customIcon/actions';
import { NextIcon } from '../../../../common/components/customIcon/general';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { СalculationSubScenariosModal } from '../../../../prediction/subModules/model/components/modal/calculationSubScenariosModal';
import { DeleteSubScenarioModal } from '../../../../prediction/subModules/model/components/modal/deleteSubScenarioModal';
import { RenameSubScenarioModal } from '../../../../prediction/subModules/model/components/modal/renameSubScenarioModal';
import { SubScenarioDropdown } from '../../../../prediction/subModules/model/components/subScenarioDropdown';
import { useSubScenarioMutations } from '../../../../prediction/subModules/model/store/subScenarioMutations';
import { allSubScenarios } from '../../../../prediction/subModules/model/store/subScenarios';
import { PlastDropdown } from '../../../../proxy/subModules/model/components/plastDropdown';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';

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
                <HStack pl={5} spacing={5}>
                    <Divider orientation='vertical' />
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
                        {i18n.t(dict.proxy.selectionWellTypes)}
                    </Button>
                </Box>
            </Flex>
        </Box>
    );
};
