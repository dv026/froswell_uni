import React, { FC, useState } from 'react';

import { Badge, Box, Checkbox, Heading, Stack, VStack } from '@chakra-ui/react';
import { Curtain } from 'common/components/curtain';
import { EllipseIcon } from 'common/components/customIcon/general';
import { TextFilter } from 'common/components/textFilter';
import { KeyValue } from 'common/entities/keyValue';
import { round1 } from 'common/helpers/math';
import { toggleListItem } from 'common/helpers/ramda';
import { LegendTool } from 'commonEfficiency/components/legendTool';
import { CumulativeEffectModel } from 'commonEfficiency/entities/cumulativeEffectModel';
import { includes, map, filter, find } from 'ramda';
import { useTranslation } from 'react-i18next';

import { getOperationDistributionColor } from './moduleMap/layers/operationDistributionCanvasLayer';

import dict from 'common/helpers/i18n/dictionary/main.json';

interface OperationDistributionCurtainProps {
    operations: CumulativeEffectModel[];
    selectedOperations: KeyValue[];
    setSelectedOperations: (values: KeyValue[]) => void;
}

export const OperationDistributionCurtain = (props: OperationDistributionCurtainProps) => {
    const { operations, selectedOperations, setSelectedOperations } = props;

    const { t } = useTranslation();

    const [textFilter, setTextFilter] = useState<string>('');

    const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTextFilter(value);
    };

    return (
        <Curtain position='top-right'>
            <LegendTool />
            <Box w={'282px'} minH={'250px'}>
                <VStack align='stretch'>
                    <Heading size='h3'>{t(dict.efficiency.results.workoverActionsFilter)}</Heading>
                    <TextFilter
                        textFilter={textFilter}
                        placeholder={t(dict.common.agt)}
                        handleTextInput={handleTextInput}
                    />
                    <Stack spacing={3} direction='column'>
                        {map(
                            (it: CumulativeEffectModel) => (
                                <Checkbox
                                    isChecked={includes(
                                        new KeyValue(it.operationId, it.operationName),
                                        selectedOperations
                                    )}
                                    onChange={() =>
                                        setSelectedOperations(
                                            toggleListItem(new KeyValue(it.operationId, it.operationName))(
                                                selectedOperations
                                            )
                                        )
                                    }
                                >
                                    <OperationColor id={it.operationId} />
                                    {it.operationName}
                                    <Badge ml='1' colorScheme='green'>
                                        +{round1(find(d => d.operationId === it.operationId, operations)?.value / 1000)}{' '}
                                        {t(dict.common.units.tonsAccumulated)}
                                    </Badge>
                                </Checkbox>
                            ),
                            filter(x => includes(textFilter, x.operationName), operations)
                        )}
                    </Stack>
                </VStack>
            </Box>
        </Curtain>
    );
};

const OperationColor: FC<{ id: number }> = ({ id }) => (
    <EllipseIcon color={getOperationDistributionColor(id)} boxSize={2} mr={'3px'} />
);
