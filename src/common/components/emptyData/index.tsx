import React, { FC } from 'react';

import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { ChartIcon } from '../customIcon/general';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    text?: string;
    hideIcon?: boolean;
}

export const EmptyData: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    return (
        <Text color='typo.secondary' p={'20px'}>
            {p.hideIcon ? null : <ChartIcon boxSize={8} />} {p.text ? p.text : t(dict.common.nodata)}
        </Text>
    );
};
