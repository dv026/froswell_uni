import React, { FC, useState } from 'react';

import { Box, Button, Checkbox, CheckboxGroup, Flex, Heading, HStack, Spacer } from '@chakra-ui/react';
import { any, append, assoc, filter, head, map, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { currentPlastId, currentPlastName } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { Curtain } from '../../../../common/components/curtain';
import { NextIcon } from '../../../../common/components/customIcon/general';
import { FormField } from '../../../../common/components/formField';
import { InputNumber } from '../../../../common/components/inputNumber';
import { shallow } from '../../../../common/helpers/ramda';
import { currentSpot } from '../../../store/well';
import { PermeabilityParams } from '../entities/permeabilityParams';
import { calculatePermeabilities, savePermeabilities } from '../gateways/gateway';
import { dataState } from '../store/data';
import { paramsIsLoadingState, paramsState } from '../store/params';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const getChecked = (id: number, checked: boolean, tests: number[]) =>
    checked ? append(id, tests) : reject(x => x === id, tests);

export const SequentialUserActions = () => {
    const { t } = useTranslation();

    const params = useRecoilValue(paramsState);
    const plastName = useRecoilValue(currentPlastName);
    const plasts = useRecoilValue(allPlasts);
    const isLoading = useRecoilValue(paramsIsLoadingState);

    const [plastId, setPlast] = useRecoilState(currentPlastId);

    const [model, setModel] = useState(params);

    const save = useRecoilCallback(({ snapshot, set }) => async (params: PermeabilityParams) => {
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);

        set(paramsIsLoadingState, true);

        const response = await calculatePermeabilities(plastId, well.prodObjId, params.optimizeBL, params.tests);

        await savePermeabilities(plastId, well.prodObjId, params.optimizeBL, params.tests, params.stepSize);

        set(dataState, response.data);
        set(paramsState, params);
        set(paramsIsLoadingState, false);
    });

    const nextPlast = head(filter(it => it.id > plastId, plasts));

    const allowCalculation = true;
    const allowNextPlast = true;

    function updateSettings<K extends keyof PermeabilityParams>(key: K, value: PermeabilityParams[K]) {
        setModel(shallow(model, assoc(key, value, model)));
    }

    return (
        <Curtain position={'top-right'}>
            <Box p={0}>
                <Heading size='h5' py='8px'>
                    {t(dict.common.plast)}: {plastName}
                </Heading>
                <Box w='350px'>
                    <FormField title={t(dict.proxy.constructionStep)}>
                        <InputNumber
                            value={model.stepSize}
                            step={0.001}
                            min={0.001}
                            max={0.1}
                            w={'100px'}
                            onChange={value => updateSettings('stepSize', +value)}
                        />
                    </FormField>
                    <FormField title={t(dict.proxy.minimizeBuckleyLeverettFunction)}>
                        <Checkbox
                            isChecked={model.optimizeBL}
                            onChange={e => updateSettings('optimizeBL', e.target.checked)}
                        />
                    </FormField>
                    <FormField title={t(dict.proxy.permeabilities.test)}>
                        <CheckboxGroup>
                            <HStack spacing={5}>
                                {map(
                                    (x: number) => (
                                        <Checkbox
                                            key={x}
                                            isChecked={any(y => y === x, model.tests)}
                                            onChange={e => {
                                                updateSettings('tests', getChecked(x, e.target.checked, model.tests));
                                            }}
                                        >
                                            {x.toString()}
                                        </Checkbox>
                                    ),
                                    [1, 2]
                                )}
                            </HStack>
                        </CheckboxGroup>
                    </FormField>
                </Box>
            </Box>
            <Box>
                <Flex>
                    <Button
                        isLoading={isLoading}
                        variant='primary'
                        isDisabled={!allowCalculation}
                        minW='120px'
                        onClick={() => save(model)}
                    >
                        {t(dict.common.calc)}
                    </Button>
                    <Spacer />
                    {nextPlast ? (
                        <Button
                            rightIcon={<NextIcon boxSize={6} />}
                            variant='nextStage'
                            isDisabled={!allowNextPlast}
                            onClick={() => setPlast(nextPlast.id)}
                        >
                            {t(dict.proxy.wellGrid.nextPlast)}
                        </Button>
                    ) : null}
                </Flex>
            </Box>
        </Curtain>
    );
};
