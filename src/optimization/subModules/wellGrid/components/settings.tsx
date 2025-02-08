import React, { FC, memo } from 'react';

import { Box, Button, Flex, HStack, Spacer } from '@chakra-ui/react';
import { flatten, map, sortBy } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { NextIcon } from '../../../../common/components/customIcon/general';
import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { shallowEqual } from '../../../../common/helpers/compare';
import { PlastDropdown } from '../../../../proxy/subModules/model/components/plastDropdown';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';
import { createOrUpdate } from '../../limits/gateways/gateway';
import { defaultLimitsSelector, moduleState } from '../../limits/store/moduleState';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const module = useRecoilValue(moduleState);
    const defaultLimits = useRecoilValue(defaultLimitsSelector);

    const setStep = useSetRecoilState(currentStepState);

    const saveDefaultLimits = async () => {
        const defaultWells = sortBy(it => it, flatten(map(it => it.wells, defaultLimits)));
        const savedWells = sortBy(
            (it: number) => it,
            map(it => it.wellId, module.saved)
        );
        const clear = !shallowEqual(defaultWells, savedWells);

        if (!clear) {
            return;
        }

        await createOrUpdate(defaultLimits, clear);
    };

    const toNextStep = async () => {
        await saveDefaultLimits();

        setStep(DirectedStageEnum.WellGroup);
    };

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack>
                    <Dropdown
                        value={2}
                        options={[
                            new DropdownOption(1, t(dict.optimization.byObject)),
                            new DropdownOption(2, t(dict.optimization.byPlast))
                        ]}
                    />
                    <PlastDropdown />
                </HStack>
                <Spacer />
                <Box>
                    <Button
                        rightIcon={<NextIcon boxSize={6} />}
                        variant='nextStage'
                        isDisabled={false}
                        onClick={toNextStep}
                    >
                        {t(dict.proxy.selectionWellGroups)}
                    </Button>
                </Box>
            </Flex>
        </Box>
    );
});
