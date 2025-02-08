import React from 'react';

import { Box, Button, Flex, HStack, Spacer } from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { NextIcon } from '../../../../common/components/customIcon/general';
import { SelectPlast } from '../../../../common/components/selectPlast';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: React.FC = () => {
    const plasts = useRecoilValue(allPlasts);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const setStep = useSetRecoilState(currentStepState);

    return (
        <Box w='100%'>
            <Flex>
                <HStack>
                    <SelectPlast dictionary={plasts} selected={plastId} onChange={setPlastId} />
                </HStack>
                <Spacer />

                <Button
                    rightIcon={<NextIcon boxSize={6} />}
                    variant='nextStage'
                    isDisabled={false}
                    onClick={() => {
                        setStep(DirectedStageEnum.Limits);
                    }}
                >
                    {i18n.t(dict.proxy.wellSetup)}
                </Button>
            </Flex>
        </Box>
    );
};
