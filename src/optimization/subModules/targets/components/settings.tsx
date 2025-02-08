import React, { FC, memo } from 'react';

import {
    Box,
    Checkbox,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Spacer
} from '@chakra-ui/react';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { insimCalcParams } from '../../../../calculation/store/insimCalcParams';
import { allPlasts } from '../../../../calculation/store/plasts';
import { DatePicker } from '../../../../common/components/datePicker';
import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { firstDay } from '../../../../common/helpers/date';
import { tryParse } from '../../../../common/helpers/number';
import { shallow } from '../../../../common/helpers/ramda';
import { currentPlastIdState } from '../store/currentPlast';
import { settingsState } from '../store/settings';
import { LaunchCalculationModal } from './modal/launchCalculationModal';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();
    const plasts = useRecoilValue(allPlasts);

    const [plastId, setPlastId] = useRecoilState(currentPlastIdState);
    const [settings, setSettings] = useRecoilState(settingsState);
    const [params, setParams] = useRecoilState(insimCalcParams);

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={5}>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.common.currentPlast)}: </FormLabel>
                        <Dropdown
                            options={prepend(
                                new DropdownOption(null, t(dict.common.all)),
                                map(p => new DropdownOption(p.id, p.name), plasts)
                            )}
                            value={plastId}
                            onChange={e => setPlastId(tryParse(e.target.value))}
                        />
                    </FormControl>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.optimization.goals.bounds)}: </FormLabel>
                        <Dropdown
                            options={[
                                new DropdownOption(25, '25%'),
                                new DropdownOption(50, '50%'),
                                new DropdownOption(100, '100%'),
                                new DropdownOption(200, '200%'),
                                new DropdownOption(1000, '1000%')
                            ]}
                            value={settings.percentLimit}
                            onChange={e => setSettings(shallow(settings, { percentLimit: +e.target.value }))}
                        />
                    </FormControl>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.optimization.optimizationHorizon)}: </FormLabel>
                        <Slider
                            colorScheme={'brand'}
                            value={settings.horizon}
                            width='150px'
                            onChange={v => setSettings(shallow(settings, { horizon: +v }))}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </FormControl>
                    <Divider orientation='vertical' />
                    <FormControl variant='inline'>
                        <Checkbox
                            isChecked={settings.showPredictionChart}
                            onChange={e => setSettings(shallow(settings, { showPredictionChart: e.target.checked }))}
                        >
                            {t(dict.optimization.goals.showPredictionChart)}
                        </Checkbox>
                    </FormControl>
                    <Divider orientation='vertical' />
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.optimization.calc.endDate)}: </FormLabel>
                        <DatePicker
                            selected={params.forecastEnd}
                            width='150px'
                            onChange={d => setParams(shallow(params, { forecastEnd: firstDay(d) }))}
                        />
                    </FormControl>
                </HStack>
                <Spacer />
                <Box>
                    <LaunchCalculationModal />
                </Box>
            </Flex>
        </Box>
    );
});
