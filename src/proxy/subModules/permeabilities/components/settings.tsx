import React from 'react';

import { Box, Flex, HStack, Spacer } from '@chakra-ui/react';
import { SelectPlast } from 'common/components/selectPlast';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { DirectedPlast } from '../../../../common/components/directedPlast';
import { LaunchAdaptationModal } from './modal/launchAdaptationModal';

export const Settings: React.FC = () => {
    const plasts = useRecoilValue(allPlasts);

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
                    <LaunchAdaptationModal />
                </Box>
            </Flex>
        </Box>
    );
};
