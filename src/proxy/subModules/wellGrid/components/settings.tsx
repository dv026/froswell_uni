import React from 'react';

import { Box, Button, Flex, HStack, Spacer } from '@chakra-ui/react';
import { SelectPlast } from 'common/components/selectPlast';
import i18n from 'i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { NextIcon } from '../../../../common/components/customIcon/general';
import { DirectedPlast } from '../../../../common/components/directedPlast';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: React.FC = () => {
    const plasts = useRecoilValue(allPlasts);
    const setStep = useSetRecoilState(currentStep);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    return (
        <Box w='100%'>
            <Flex>
                <HStack>
                    {/* todo mb */}
                    {plasts.length > 25 ? (
                        <SelectPlast selected={plastId} dictionary={plasts} onChange={id => setPlastId(id)} />
                    ) : (
                        <DirectedPlast selected={plastId} dictionary={plasts} onChange={id => setPlastId(id)} />
                    )}
                </HStack>
                <Spacer />
                <Box>
                    <Button
                        rightIcon={<NextIcon boxSize={6} />}
                        variant='nextStage'
                        isDisabled={false}
                        onClick={() => setStep(DirectedStageEnum.WellGroup)}
                    >
                        {i18n.t(dict.optimization.wellGroups)}
                    </Button>
                </Box>
            </Flex>
        </Box>
    );
};
