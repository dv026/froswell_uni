import React, { FC, memo } from 'react';

import { Box, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { displayModeState } from 'commonEfficiency/store/displayMode';
import { modeMapTypeState } from 'commonEfficiency/store/modeMapType';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { tryParse } from '../../../../common/helpers/number';
import { currentPlastId, modulePlasts } from '../../../../prediction/subModules/results/store/currentPlastId';
import { mapSettingsState } from '../store/mapSettings';
import { selectedOperationState } from '../store/operationDistribution';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const plasts = useRecoilValue(modulePlasts);
    const displayMode = useRecoilValue(displayModeState);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);
    const [modeMapType, setModeMapType] = useRecoilState(modeMapTypeState);

    const resetSelectedOperation = useResetRecoilState(selectedOperationState);
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
                    {displayMode === DisplayModeEnum.Map ? (
                        <FormControl variant='inline'>
                            <FormLabel>{t(dict.common.mode)}:</FormLabel>
                            <Dropdown
                                value={modeMapType}
                                options={[
                                    new DropdownOption(ModeMapEnum.Daily, t(dict.common.daily)),
                                    new DropdownOption(ModeMapEnum.Accumulated, t(dict.common.accumulated))
                                ]}
                                onChange={e => {
                                    setModeMapType(+e.target.value);

                                    resetMapSettings();
                                    resetSelectedOperation();
                                }}
                            />
                        </FormControl>
                    ) : null}
                </HStack>
            </Flex>
        </Box>
    );
});
