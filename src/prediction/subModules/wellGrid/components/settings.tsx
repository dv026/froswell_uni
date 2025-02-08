import React from 'react';

import { Box, Flex, HStack, Spacer } from '@chakra-ui/react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { SelectPlast } from '../../../../common/components/selectPlast';
import { LaunchCalculationModal } from './modal/launchCalculationModal';

export const Settings: React.FC = () => {
    const plasts = useRecoilValue(allPlasts);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack>
                    <SelectPlast dictionary={plasts} selected={plastId} onChange={setPlastId} />
                </HStack>
                <Spacer />
                <Box>
                    <LaunchCalculationModal />
                </Box>
            </Flex>
        </Box>
    );
};
