import React, { FC } from 'react';

import { Box, Heading, Text, Stack, Divider, Flex, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { FoldingCurtain } from '../../../../../common/components/curtain';

import css from './index.module.less';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const LegendTool = () => {
    const { t } = useTranslation();

    return (
        <FoldingCurtain position='top-right' btnLabel={t(dict.common.legend)} defaultIsOpened={true}>
            <div className={css.legendTool}>
                <Heading>{t(dict.common.legend)}</Heading>
                <Stack spacing={8} pt='10'>
                    <Flex>
                        <Box boxSize='64px' mr='10px'>
                            <Image src='/images/legend/oil.png' />
                        </Box>
                        <Box>
                            <Text>{t(dict.map.legend.well)}</Text>
                            <Divider borderColor='control.grey400' mt={1} mb={1} />
                            <Text>{t(dict.map.legend.wellInfoPressureSkin)}</Text>
                        </Box>
                    </Flex>

                    <Flex>
                        <Box boxSize='64px' mr='10px'>
                            <Image src='/images/legend/inj.png' />
                        </Box>
                        <Box>
                            <Text>{t(dict.map.legend.well)}</Text>
                            <Divider borderColor='control.grey400' mt={1} mb={1} />
                            <Text>{t(dict.map.legend.wellInfoPressureSkin)}</Text>
                        </Box>
                    </Flex>
                </Stack>
            </div>
        </FoldingCurtain>
    );
};
