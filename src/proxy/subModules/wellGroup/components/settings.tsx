import React from 'react';

import { Box, Button, Flex, HStack, Spacer } from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { CalculationModeEnum } from '../../../../calculation/enums/calculationModeEnum';
import { calculationModeState } from '../../../../calculation/store/calculationMode';
import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { NextIcon } from '../../../../common/components/customIcon/general';
import { SelectPlast } from '../../../../common/components/selectPlast';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';
import { LaunchAdaptationModal } from '../../permeabilities/components/modal/launchAdaptationModal';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: React.FC = () => {
    const calculationMode = useRecoilValue(calculationModeState);
    const plasts = useRecoilValue(allPlasts);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const setStep = useSetRecoilState(currentStep);

    const isImprovement = calculationMode === CalculationModeEnum.Improvement;

    return (
        <Box w='100%'>
            <Flex>
                <HStack>
                    <SelectPlast dictionary={plasts} selected={plastId} onChange={setPlastId} />
                </HStack>
                <Spacer />
                {isImprovement ? (
                    <LaunchAdaptationModal />
                ) : (
                    <Button
                        rightIcon={<NextIcon boxSize={6} />}
                        variant='nextStage'
                        isDisabled={false}
                        onClick={() => {
                            setStep(DirectedStageEnum.Permeability);
                        }}
                    >
                        {i18n.t(dict.proxy.RPPpermeability)}
                    </Button>
                )}
            </Flex>
        </Box>
    );
};
