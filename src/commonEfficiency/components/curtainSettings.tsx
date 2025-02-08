import React, { FC } from 'react';

import { Box, Heading, Text } from '@chakra-ui/react';
import { Curtain } from 'common/components/curtain';
import { round2 } from 'common/helpers/math';
import { useTranslation } from 'react-i18next';

import { accumulatedGrowth } from '../../proxy/subModules/efficiency/store/chartData';

import dict from 'common/helpers/i18n/dictionary/main.json';

interface CurtainSettingsProps {
    avgGrowth: number;
    accumGrowth: number;
    repairMode: number;
}

export const CurtainSettings: FC<CurtainSettingsProps> = (props: CurtainSettingsProps) => {
    const { avgGrowth, accumGrowth, repairMode } = props;

    const { t } = useTranslation();

    if (!avgGrowth || !accumulatedGrowth || !repairMode) {
        return null;
    }

    return (
        <Curtain position='top-right'>
            <Box w='330px'>
                <Heading mb={3}>{t(dict.common.options)}</Heading>
                <Text>
                    {t(dict.efficiency.settings.averageOilGrowth)}:{' '}
                    <b>
                        {round2(avgGrowth)} {t(dict.common.units.tonsPerDay)}
                    </b>
                </Text>
                <Text>
                    {t(dict.efficiency.settings.accumulatedOilGain)}:{' '}
                    <b>
                        {round2(accumGrowth / 1000)} {t(dict.common.units.tonsAccumulated)}
                    </b>
                </Text>
            </Box>
        </Curtain>
    );
};
