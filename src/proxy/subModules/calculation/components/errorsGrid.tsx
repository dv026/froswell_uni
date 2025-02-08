import React, { FC } from 'react';

import {
    Spinner,
    Stat,
    StatArrow,
    StatHelpText,
    StatNumber,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr
} from '@chakra-ui/react';
import i18n from 'i18next';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';

import { WellError } from '../../../../calculation/entities/computation/calculationDetails';
import { CompleteIcon, MoreIcon } from '../../../../common/components/customIcon/general';
import { round2 } from '../../../../common/helpers/math';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface GridProps {
    orderNumber: number;
    rows: WellError[];
    isFinished: boolean;
}

export const ErrorsGrid: FC<GridProps> = (p: GridProps) => {
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <Thead>
                    <Tr>
                        <Th>{t(dict.calculation.status)}</Th>
                        <Th>{t(dict.common.well)}</Th>
                        <Th isNumeric>{t(dict.calculation.errorsGrid.oil)}</Th>
                        <Th isNumeric>{t(dict.calculation.errorsGrid.liquid)}</Th>
                        <Th isNumeric>{t(dict.calculation.errorsGrid.injection)}</Th>
                        <Th isNumeric>{t(dict.calculation.errorsGrid.dynamicLevel)}</Th>
                        <Th isNumeric>{t(dict.calculation.errorsGrid.bottomHolePressure)}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {R.map(
                        row => (
                            <Tr key={`${row.id}`}>
                                <Td>{icon(getAdaptationStatus(p.orderNumber, row.orderNumber), p.isFinished)}</Td>
                                <Td>{`${row.name} (${row.id})`}</Td>
                                <Td isNumeric>
                                    <Diff value={row.oil.currentValue} difference={row.oil.difference} />
                                </Td>
                                <Td isNumeric>
                                    <Diff value={row.liquid.currentValue} difference={row.liquid.difference} />
                                </Td>
                                <Td isNumeric>
                                    <Diff value={row.injection.currentValue} difference={row.injection.difference} />
                                </Td>
                                <Td isNumeric>
                                    <Diff
                                        value={row.dynamicLevel.currentValue}
                                        difference={row.dynamicLevel.difference}
                                    />
                                </Td>
                                <Td isNumeric>
                                    <Diff
                                        value={row.bottomHolePressure.currentValue}
                                        difference={row.bottomHolePressure.difference}
                                    />
                                </Td>
                            </Tr>
                        ),
                        sort(p.rows)
                    )}
                </Tbody>
            </Table>
        </>
    );
};

interface DiffProps {
    value: number;
    difference: number;
}

const Diff: React.FC<DiffProps> = ({ value, difference }: DiffProps) => {
    if (!value) {
        return null;
    }

    return (
        <Stat>
            <StatNumber>{round2(value)}</StatNumber>
            {difference ? (
                <StatHelpText>
                    <StatArrow type={difference > 0 ? 'decrease' : 'increase'} />
                    {Math.abs(round2(difference))}%
                </StatHelpText>
            ) : null}
        </Stat>
    );
};

const icon = (status: AdaptationStatusEnum, isFinished: boolean) => {
    const ri = rowIcon(status, isFinished);
    return ri ? <Tooltip label={rowIconTitle(status)}>{ri}</Tooltip> : null;
};

const rowIconTitle = (status: AdaptationStatusEnum) =>
    R.cond([
        [R.equals(AdaptationStatusEnum.InQueue), R.always(i18n.t(dict.calculation.errorsGrid.statusNotAdapted))],
        [R.equals(AdaptationStatusEnum.InProgress), R.always(i18n.t(dict.calculation.errorsGrid.statusAdapting))],
        [R.equals(AdaptationStatusEnum.Adapted), R.always(i18n.t(dict.calculation.errorsGrid.statusAdapted))],
        [R.T, R.always(i18n.t(dict.calculation.errorsGrid.statusExcluded))]
    ])(status);
const rowIcon = (status: AdaptationStatusEnum, isFinished: boolean) =>
    R.cond([
        [R.equals(AdaptationStatusEnum.InQueue), R.always(<MoreIcon boxSize={6} />)],
        [R.equals(AdaptationStatusEnum.InProgress), R.always(isFinished ? <CompleteIcon boxSize={6} /> : <Spinner />)],
        [R.equals(AdaptationStatusEnum.Adapted), R.always(<CompleteIcon boxSize={6} color='icons.green' />)],
        [R.T, R.always(null)]
    ])(status);

const sortByOrderNumber = (a: WellError, b: WellError) => {
    if (a.orderNumber === b.orderNumber) {
        return 0;
    }

    if (a.orderNumber === 0) {
        return 1;
    }

    if (b.orderNumber === 0) {
        return -1;
    }

    return a.orderNumber - b.orderNumber;
};

const sort = R.sortWith<WellError>([sortByOrderNumber, R.ascend(R.prop('name'))]);

enum AdaptationStatusEnum {
    Adapted = 1,
    InProgress = 2,
    InQueue = 3,
    Excluded = 4
}

const getAdaptationStatus = (currentNumber: number, wellNumber: number): AdaptationStatusEnum =>
    wellNumber === 0
        ? AdaptationStatusEnum.Excluded
        : wellNumber < currentNumber
        ? AdaptationStatusEnum.Adapted
        : wellNumber === currentNumber
        ? AdaptationStatusEnum.InProgress
        : AdaptationStatusEnum.InQueue;
