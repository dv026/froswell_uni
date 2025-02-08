import React, { FC, memo } from 'react';

import { Box, Button, Flex, FormControl, FormLabel, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { NextIcon } from '../../../../common/components/customIcon/general';
import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';
import { GroupType } from '../enums/groupType';
import { groupTypeState } from '../store/groupType';
import { wellTypeState } from '../store/wellType';
import { CopyLimitsModal } from './modal/copyLimitsModal';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const [wellType, setWellType] = useRecoilState(wellTypeState);
    const [group, setGroup] = useRecoilState(groupTypeState);

    const setStep = useSetRecoilState(currentStepState);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.common.charWork)}:</FormLabel>
                        <Dropdown
                            options={[
                                new DropdownOption(WellTypeEnum.Oil, t(dict.optimization.wellSetup.oilWells)),
                                new DropdownOption(WellTypeEnum.Injection, t(dict.optimization.wellSetup.injWells))
                            ]}
                            value={wellType}
                            onChange={e => setWellType(+e.target.value)}
                        />
                    </FormControl>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.optimization.wellSetup.groupBy)}:</FormLabel>
                        <Dropdown
                            options={[
                                new DropdownOption(GroupType.WaterCut, t(dict.optimization.wellSetup.byWatercut)),
                                new DropdownOption(GroupType.Oil, t(dict.optimization.wellSetup.byOil))
                            ]}
                            value={group}
                            onChange={e => setGroup(+e.target.value)}
                        />
                    </FormControl>
                    <CopyLimitsModal />
                </HStack>
                <Spacer />
                <Box>
                    <Button
                        rightIcon={<NextIcon boxSize={6} />}
                        variant='nextStage'
                        isDisabled={false}
                        onClick={() => setStep(DirectedStageEnum.Tagrets)}
                    >
                        {t(dict.proxy.targetOptions)}
                    </Button>
                </Box>
            </Flex>
        </Box>
    );
});
