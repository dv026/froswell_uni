import React, { FC, useEffect, useState } from 'react';

import { Button, Checkbox, FormControl, FormLabel, Spacer } from '@chakra-ui/react';
import {
    initialKrigingVariationLossesState,
    KrigingVariationLossesState
} from 'common/entities/kriging/krigingVariationLossesState';
import { useTranslation } from 'react-i18next';

import { DatePicker } from '../../../common/components/datePicker';
import { SingleField } from '../../../common/components/singleField';
import { isNullOrEmpty, shallow } from '../../../common/helpers/ramda';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    period: Date[];
    submit: (settings: KrigingVariationLossesState) => void;
    cancel: () => void;
}

export const KrigingVariationLossesSettings: FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    const [settings, setSettings] = useState(initialKrigingVariationLossesState);

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
                <Button ml={2} variant='cancel' onClick={() => p.cancel()}>
                    {t(dict.common.cancel)}
                </Button>
            </SingleField>
        </>
    );
};
