import React from 'react';

import { Text } from '@chakra-ui/react';
import i18n from 'i18next';

import { FormField } from '../../../../../common/components/formField';
import { round2 } from '../../../../../common/helpers/math';
import { pc } from '../../../../../common/helpers/styles';

import mainDict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    oilError: number;
    liquidError: number;
}

export const PreviousInfo: React.FC<Props> = ({ liquidError }: Props) => (
    <FormField title={i18n.t(mainDict.proxy.liquidMAPE)}>
        <Text color='colors.green' fontWeight='bold'>
            {isNaN(liquidError) ? '-' : pc(round2(liquidError))}
        </Text>
    </FormField>
);
