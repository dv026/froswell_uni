import React, { FC } from 'react';

import { Box, Heading, Text, Stack, Divider, Flex, Image } from '@chakra-ui/react';
import { isNil, toLower } from 'ramda';
import { useTranslation } from 'react-i18next';

import { FoldingCurtain } from '../curtain';
import { CommentsTool } from './commentsTool';

import dict from '../../helpers/i18n/dictionary/main.json';

interface IShowProps {
    inflowProfile?: boolean;
    compensation?: boolean;
    tracerResearch?: boolean;
    liquidDistribution?: boolean;
    flowInterwells?: boolean;
    scaleLiquidDistributionByWell?: boolean;
    openingMode?: boolean;
    variationLoss?: boolean;
}

interface IProps {
    accumulated?: boolean;
    plastId?: number;
    show?: IShowProps;
}

export const LegendTool: FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    return (
        <FoldingCurtain position='top-right' btnLabel={t(dict.common.legend)} defaultIsOpened={true}>
            <Box w={'250px'} fontSize={'12px'} lineHeight={'16px'}>
                <Heading>{t(dict.common.legend)}</Heading>
                <Stack spacing={3} pt={3}>
                    {p.show.variationLoss ? (
                        <>
                            <Flex>
                                <Box flexShrink={0} mr={2} alignSelf='center'>
                                    <Image src='/images/legend/variation_loss.svg' />
                                </Box>
                                <Box alignSelf='center'>
                                    <Text>{t(dict.map.legend.well)}</Text>
                                    <Divider borderColor='control.grey400' mt={1} mb={1} />
                                    <Text>{t(dict.map.legend.variationLoss)}</Text>
                                </Box>
                            </Flex>
                            <Flex>
                                <Box flexShrink={0} mr={2} alignSelf='center'>
                                    <Image src='/images/legend/variation_gain.svg' />
                                </Box>
                                <Box alignSelf='center'>
                                    <Text>{t(dict.map.legend.well)}</Text>
                                    <Divider borderColor='control.grey400' mt={1} mb={1} />
                                    <Text>
                                        <Text>{t(dict.map.legend.variationGain)}</Text>
                                    </Text>
                                </Box>
                            </Flex>
                        </>
                    ) : (
                        <>
                            <Flex>
                                <Box flexShrink={0} mr={2} alignSelf='center'>
                                    <Image src='/images/legend/oil_donut.svg' />
                                </Box>
                                <Box alignSelf='center'>
                                    <Text>{t(dict.map.legend.well)}</Text>
                                    <Divider borderColor='control.grey400' mt={1} mb={1} />
                                    <Text>
                                        {p.accumulated
                                            ? t(dict.map.legend.oilWellInfoAccumulated)
                                            : t(dict.map.legend.oilWellInfo)}
                                        {p.show?.openingMode ? ` - ${t(dict.map.legend.percentOpeningMode)}` : null}
                                    </Text>
                                </Box>
                            </Flex>
                            <Flex>
                                <Box flexShrink={0} mr={2} alignSelf='center'>
                                    <Image src='/images/legend/inj_donut.svg' />
                                </Box>
                                <Box alignSelf='center'>
                                    <Text>{t(dict.map.legend.well)}</Text>
                                    <Divider borderColor='control.grey400' mt={1} mb={1} />
                                    <Text>
                                        {p.accumulated
                                            ? t(dict.map.legend.injWellInfoAccumulated)
                                            : t(dict.map.legend.injWellInfo)}
                                        {p.show?.openingMode ? ` - ${t(dict.map.legend.percentOpeningMode)}` : null}
                                    </Text>
                                </Box>
                            </Flex>
                        </>
                    )}
                    {isNil(p.plastId) ? (
                        p.show.inflowProfile ? (
                            <Flex>
                                <Box flexShrink={0} mr={2} alignSelf='center'>
                                    <Image src='/images/legend/inflow_profile.svg' />
                                </Box>
                                <Box alignSelf='center'>
                                    <Text>{t(dict.map.inflowProfile)}</Text>
                                </Box>
                            </Flex>
                        ) : null
                    ) : p.show.compensation ? (
                        <Flex>
                            <Box flexShrink={0} mr={2} alignSelf='center'>
                                <Image src='/images/legend/сompensation.svg' />
                            </Box>
                            <Box alignSelf='center'>
                                <Text>{t(dict.map.сompensation)}</Text>
                            </Box>
                        </Flex>
                    ) : null}
                    {p.show.tracerResearch ? (
                        <Flex>
                            <Box flexShrink={0} mr={2} alignSelf='center'>
                                <Image src='/images/legend/tracer.svg' />
                            </Box>
                            <Box alignSelf='center'>
                                <Text>{t(dict.common.tracerResearch)}</Text>
                            </Box>
                        </Flex>
                    ) : null}
                    {p.show.liquidDistribution ? (
                        <Flex>
                            <Box flexShrink={0} mr={2} alignSelf='center'>
                                <Image src='/images/legend/flow.svg' />
                            </Box>
                            <Box alignSelf='center'>
                                <Text>
                                    {t(dict.map.liquidDistribution)},{' '}
                                    {toLower(
                                        p.show.scaleLiquidDistributionByWell
                                            ? t(dict.common.dataBy.well)
                                            : t(dict.common.dataBy.object)
                                    )}
                                </Text>
                            </Box>
                        </Flex>
                    ) : null}
                    {p.show.flowInterwells ? (
                        <Flex>
                            <Box flexShrink={0} mr={2} alignSelf='center'>
                                <Image src='/images/legend/flow_interwells.svg' />
                            </Box>
                            <Box alignSelf='center'>
                                <Text>
                                    {t(dict.map.flowInterwells)} {t(dict.common.oil)}
                                </Text>
                                <Text>
                                    {t(dict.map.flowInterwells)} {t(dict.common.water)}
                                </Text>
                            </Box>
                        </Flex>
                    ) : null}
                </Stack>
            </Box>
            <CommentsTool />
        </FoldingCurtain>
    );
};
