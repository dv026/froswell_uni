import React, { FC, memo } from 'react';

import { Box, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../../../../common/components/dropdown/dropdown';
import { tryParse } from '../../../../../common/helpers/number';
import { currentPlastId, modulePlasts } from '../../../../../prediction/subModules/results/store/currentPlastId';
import { mapSettingsState } from '../../store/mapSettings';
import { CalculationGridModal } from '../modal/calculationGridModal';
import { ModeMapDropdown } from './modeMapDropdown';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const MapSettings: FC = memo(() => {
    const { t } = useTranslation();

    const plasts = useRecoilValue(modulePlasts);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const resetMapSettings = useResetRecoilState(mapSettingsState);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.common.currentPlast)}:</FormLabel>
                        <Dropdown
                            className='action__selector'
                            options={prepend(
                                new DropdownOption(null, t(dict.common.dataBy.object)),
                                map(p => new DropdownOption(p.id, p.name), plasts)
                            )}
                            value={plastId}
                            onChange={e => {
                                setPlastId(tryParse(e.target.value));
                                resetMapSettings();
                            }}
                        />
                    </FormControl>
                    <ModeMapDropdown />
                    <CalculationGridModal />
                </HStack>
            </Flex>
        </Box>
    );
});
