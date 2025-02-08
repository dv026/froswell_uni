import React, { FC, memo } from 'react';

import { Box, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { TabletViewSetting } from 'calculation/components/tablet/tabletViewSetting';
import { Dropdown, DropdownOption } from 'common/components/dropdown/dropdown';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { tryParse } from 'common/helpers/number';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { currentPlastId, modulePlasts } from '../../../../commonEfficiency/store/currentPlastId';
import { displayModeState } from '../../../../commonEfficiency/store/displayMode';
import { evaluationTypeState } from '../../../../commonEfficiency/store/evaluationType';
import { gtmModeState } from '../../../../commonEfficiency/store/gtmMode';
import { modeMapTypeState } from '../../../../commonEfficiency/store/modeMapType';
import { mapSettingsState } from '../store/mapSettings';
import { selectedOperationState } from '../store/operationDistribution';

import dict from 'common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const displayMode = useRecoilValue(displayModeState);
    const plasts = useRecoilValue(modulePlasts);

    const [evaluationType, setEvaluationType] = useRecoilState(evaluationTypeState);
    const [gtmMode, setGtmMode] = useRecoilState(gtmModeState);
    const [modeMapType, setModeMapType] = useRecoilState(modeMapTypeState);
    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const resetMapSettings = useResetRecoilState(mapSettingsState);
    const resetSelectedOperation = useResetRecoilState(selectedOperationState);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>
                    {evaluationType === EvaluationTypeEnum.Insim && displayMode !== DisplayModeEnum.TabletNew ? (
                        <FormControl variant='inline'>
                            <FormLabel>{t(dict.common.currentPlast)}:</FormLabel>
                            <Dropdown
                                options={prepend(
                                    new DropdownOption(null, t(dict.common.dataBy.object)),
                                    map(p => new DropdownOption(p.id, p.name), plasts)
                                )}
                                value={plastId}
                                onChange={e => {
                                    setPlastId(tryParse(e.target.value));

                                    resetMapSettings();
                                    resetSelectedOperation();
                                }}
                            />
                        </FormControl>
                    ) : null}
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
                            onChange={e => {
                                setGtmMode(+e.target.value);

                                resetMapSettings();
                                resetSelectedOperation();
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
                    {displayMode === DisplayModeEnum.TabletNew ? <TabletViewSetting /> : null}
                </HStack>
            </Flex>
        </Box>
    );
});
