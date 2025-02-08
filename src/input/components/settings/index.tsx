import React, { FC, memo } from 'react';

import { Box, Flex, HStack } from '@chakra-ui/react';
import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { displayModeState } from '../../store/displayMode';
import { ChartSettings } from './chartSettings';
import { MapSettings } from './mapSettings';
import { TabletSettings } from './tabletSettings';

export const Settings: FC = memo(() => {
    const displayMode = useRecoilValue(displayModeState);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>{renderContent(displayMode)}</HStack>
            </Flex>
        </Box>
    );
});

const renderContent = (type: DisplayModeEnum) =>
    cond([
        [equals(DisplayModeEnum.Chart), always(<ChartSettings />)],
        [equals(DisplayModeEnum.Map), always(<MapSettings />)],
        [equals(DisplayModeEnum.Tablet), always(<TabletSettings />)],
        [equals(DisplayModeEnum.TabletNew), always(<TabletSettings />)],
        [T, always(null)]
    ])(type);
