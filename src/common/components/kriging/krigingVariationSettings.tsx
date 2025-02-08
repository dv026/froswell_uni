import React, { FC, useEffect, useState } from 'react';

import { Button, FormControl, FormLabel, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { DatePicker } from '../../../common/components/datePicker';
import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { SingleField } from '../../../common/components/singleField';
import {
    initialKrigingVariationState,
    KrigingVariationState
} from '../../../common/entities/kriging/krigingVariationState';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { isNullOrEmpty, shallow } from '../../../common/helpers/ramda';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    period: Date[];
    submit: (settings: KrigingVariationState) => void;
}

export const KrigingVariationSettings: FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    const [settings, setSettings] = useState(initialKrigingVariationState);

    useEffect(() => {
        if (!isNullOrEmpty(p.period)) {
            setSettings(
                shallow(settings, {
                    startDate: new Date(p.period[0]),
                    endDate: new Date(p.period[1])
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.period]);

    return (
        <>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.parameter)}:</FormLabel>
                <Spacer />
                <Dropdown
                    options={[
                        new DropdownOption(GridMapEnum.LiqRateVariation, t(dict.common.params.liqRate)),
                        new DropdownOption(GridMapEnum.OilRateVariation, t(dict.common.params.oilRate)),
                        new DropdownOption(GridMapEnum.VolumeWaterCutVariation, t(dict.common.params.watercutVolume)),
                        new DropdownOption(GridMapEnum.InjectionRateVariation, t(dict.common.params.injectionRate)),
                        new DropdownOption(GridMapEnum.PressureZabVariation, t(dict.common.params.pressureZab)),
                        new DropdownOption(
                            GridMapEnum.MultiplePressureLiqRate,
                            'Карта изменения коэффициента (жидкость*забойное давление)'
                        )
                    ]}
                    value={settings.parameter}
                    onChange={e => {
                        setSettings(shallow(settings, { parameter: e.target.value as GridMapEnum }));
                    }}
                />
            </FormControl>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.startDate)}:</FormLabel>
                <Spacer />
                <DatePicker
                    selected={settings.startDate}
                    width='130px'
                    withPortal={true}
                    onChange={d => setSettings(shallow(settings, { startDate: d }))}
                />
            </FormControl>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.endDate)}:</FormLabel>
                <Spacer />
                <DatePicker
                    selected={settings.endDate}
                    width='130px'
                    withPortal={true}
                    onChange={d => setSettings(shallow(settings, { endDate: d }))}
                />
            </FormControl>
            <SingleField>
                <Button variant='primary' onClick={() => p.submit(settings)}>
                    {t(dict.common.calc)}
                </Button>
            </SingleField>
        </>
    );
};
