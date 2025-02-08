import React, { FC } from 'react';

import { Box, Heading, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { AutoSizer } from 'react-virtualized';

import colors from '../../../../theme/colors';
import { opacity } from '../../../common/helpers/colors';
import { ddmmyyyy } from '../../../common/helpers/date';
import { round1, round3 } from '../../../common/helpers/math';
import { TabletModel, TabletPerforation } from '../../entities/tabletModel';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    rigis?: TabletModel[];
    perforation?: TabletPerforation[];
}

export const TabletTableView: FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    return (
        <AutoSizer>
            {({ width, height }) =>
                width && height ? (
                    <TableContainer maxWidth={width} width={width} height={height} padding='10px 20px'>
                        <Heading padding='10px 0px'>РИГИС</Heading>
                        <Box overflowY='auto' maxHeight='45%'>
                            <Table variant='brand'>
                                <Thead>
                                    <Tr>
                                        <Th>{t(dict.input.wellNumber)}</Th>
                                        <Th>{t(dict.common.plast)}</Th>
                                        <Th isNumeric>Н(нач), {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Н(кон), {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Толщина, {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Н(нач) abs, {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Н(кон) abs, {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Абс. толщина, {t(dict.common.units.meter)}</Th>
                                        <Th>{t(dict.tablet.lithologyName)}</Th>
                                        <Th>Характер насыщения</Th>
                                        <Th isNumeric>
                                            {t(dict.common.params.porosity)}, {t(dict.common.units.percent)}
                                        </Th>
                                        <Th isNumeric>
                                            {t(dict.common.params.permeability)}, {t(dict.common.units.mDarcy)}
                                        </Th>
                                        <Th isNumeric maxWidth='130px'>
                                            {t(dict.common.params.oilSaturation)}, {t(dict.common.units.percent)}
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {map(
                                        it => (
                                            <Tr
                                                backgroundColor={
                                                    !it.perforationState
                                                        ? 'none'
                                                        : it.perforationState === 1
                                                        ? opacity(colors.colors.red, 0.15)
                                                        : colors.bg.grey200
                                                }
                                            >
                                                <Td>{it.wellName}</Td>
                                                <Td>{it.plastName}</Td>
                                                <Td isNumeric>{round1(it.top)}</Td>
                                                <Td isNumeric>{round1(it.bottom)}</Td>
                                                <Td isNumeric>{round1(it.bottom - it.top)}</Td>
                                                <Td isNumeric>{round1(it.topAbs)}</Td>
                                                <Td isNumeric>{round1(it.bottomAbs)}</Td>
                                                <Td isNumeric>{round1(it.bottomAbs - it.topAbs)}</Td>
                                                <Td>{it.lithologyName}</Td>
                                                <Td>{it.saturationTypeName}</Td>
                                                <Td isNumeric>{round3(it.porosity)}</Td>
                                                <Td isNumeric>{round1(it.permeability)}</Td>
                                                <Td isNumeric>{round3(it.oilSaturation)}</Td>
                                            </Tr>
                                        ),
                                        p.rigis
                                    )}
                                </Tbody>
                            </Table>
                        </Box>
                        <Heading padding='10px 0px'>{t(dict.common.params.perforation)}</Heading>
                        <Box overflowY='auto' maxHeight='45%'>
                            <Table variant='brand'>
                                <Thead>
                                    <Tr>
                                        <Th>{t(dict.input.wellNumber)}</Th>
                                        <Th>{t(dict.common.plast)}</Th>
                                        <Th isNumeric>Н(нач), {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Н(кон), {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Н(нач) abs, {t(dict.common.units.meter)}</Th>
                                        <Th isNumeric>Н(кон) abs, {t(dict.common.units.meter)}</Th>
                                        <Th>Дата перфорации</Th>
                                        <Th>Дата закрытия интервала</Th>
                                        <Th>Тип перфорации</Th>
                                        <Th>Кол-во отверстий</Th>
                                        <Th>Примечание</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {map(
                                        it => (
                                            <Tr>
                                                <Td>{it.wellName}</Td>
                                                <Td>{it.plastName}</Td>
                                                <Td isNumeric>{round1(it.top)}</Td>
                                                <Td isNumeric>{round1(it.bottom)}</Td>
                                                <Td isNumeric>{round1(it.topAbs)}</Td>
                                                <Td isNumeric>{round1(it.bottomAbs)}</Td>
                                                <Td>{ddmmyyyy(it.dt)}</Td>
                                                <Td>{ddmmyyyy(it.closingDate)}</Td>
                                                <Td>{it.perforationType}</Td>
                                                <Td>{it.holes}</Td>
                                                <Td>{it.comments}</Td>
                                            </Tr>
                                        ),
                                        p.perforation
                                    )}
                                </Tbody>
                            </Table>
                        </Box>
                    </TableContainer>
                ) : null
            }
        </AutoSizer>
    );
};
