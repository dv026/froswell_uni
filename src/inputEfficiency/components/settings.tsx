import React, { FC, memo } from 'react';

import { Box, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { displayModeState } from 'commonEfficiency/store/displayMode';
import { gtmModeState } from 'commonEfficiency/store/gtmMode';
import { modeMapTypeState } from 'commonEfficiency/store/modeMapType';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../common/components/dropdown/dropdown';
import { mapSettingsSelector } from '../store/mapSettings';
import { selectedOperationState } from '../store/operationDistribution';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const displayMode = useRecoilValue(displayModeState);

    const [modeMapType, setModeMapType] = useRecoilState(modeMapTypeState);
    const [gtmMode, setGtmMode] = useRecoilState(gtmModeState);

    const resetSelectedOperation = useResetRecoilState(selectedOperationState);
    const resetMapSettings = useResetRecoilState(mapSettingsSelector);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.efficiency.settings.repairType)}:</FormLabel>
                        <Dropdown
                            options={[
                                new DropdownOption(GtmTypeEnum.ByWell, t(dict.efficiency.settings.repairByWell)),
                                new DropdownOption(
                                    GtmTypeEnum.ByNeighborWells,
                                    t(dict.efficiency.settings.repairByNeighborWells)
                                )
                            ]}
                            value={gtmMode}
                            onChange={e => setGtmMode(+e.target.value)}
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
