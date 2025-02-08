import React, { FC, useEffect, useState } from 'react';

import { Box, Button, ButtonGroup, Heading, SimpleGrid, Spacer } from '@chakra-ui/react';
import { concat, filter, map, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ColumnType } from '../../../common/components/chart';
import { Curtain } from '../../../common/components/curtain';
import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { InputNumber } from '../../../common/components/inputNumber';
import { shallow } from '../../../common/helpers/ramda';
import { CalcModelEnum } from '../../enums/calcModelEnum';
import { ChartParams } from '../../enums/inputParamEnum';
import { MethodEnum } from '../../enums/methodEnum';
import { kalmanParamsState, showToolState } from '../../store/kalmanParams';
import { currentSpot } from '../../store/well';
import { inputParams } from '../chart/chartHelper';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const CalculationParams = () => {
    const { t } = useTranslation();

    const well = useRecoilValue(currentSpot);
    const showTool = useRecoilValue(showToolState);

    const [defaultModel, setDefaultModel] = useRecoilState(kalmanParamsState);

    const [model, setModel] = useState(defaultModel);

    useEffect(() => {
        setModel(defaultModel);
    }, [defaultModel]);

    if (!showTool) {
        return null;
    }

    const submit = () => {
        setDefaultModel(model);
    };

    return (
        <Curtain position='top-left'>
            <Box w='330px'>
                <Heading pb={4}>{t(dict.filtration.paramsTitle)}</Heading>
                {model.method === MethodEnum.Kalman ? (
                    <SimpleGrid columns={2} pb={1}>
                        <Box>
                            <span>{t(dict.filtration.modelSelection)}</span>
                        </Box>
                        <Box>
                            <Dropdown
                                size='sm'
                                onChange={e =>
                                    setModel(shallow(model, { calcModel: +e.target.value as CalcModelEnum }))
                                }
                                options={[
                                    new DropdownOption(CalcModelEnum.Constant, t(dict.filtration.calcModel.constant)),
                                    new DropdownOption(CalcModelEnum.Variable, t(dict.filtration.calcModel.variable))
                                ]}
                                value={model.calcModel}
                            />
                        </Box>
                    </SimpleGrid>
                ) : null}
                <SimpleGrid columns={2} pb={1}>
                    <Box>
                        <span>{t(dict.common.parameter)}</span>
                    </Box>
                    <Box>
                        <Dropdown
                            size='sm'
                            onChange={e => setModel(shallow(model, { parameter: e.target.value as ChartParams }))}
                            options={concat(
                                [new DropdownOption('All', t(dict.common.all))],
                                map<ColumnType, DropdownOption>(
                                    x => new DropdownOption(x.key, x.name),
                                    filter(
                                        (it: ColumnType) => well && it.wellType === well.charWorkId,
                                        // TODO: необходима более корректная выборка типов параметров
                                        reject((x: ColumnType) => x.key.endsWith('Old'), inputParams)
                                    )
                                )
                            )}
                            value={model.parameter}
                        />
                    </Box>
                </SimpleGrid>
                {model.method === MethodEnum.Kalman ? (
                    <>
                        <SimpleGrid columns={2} pb={1}>
                            <Box>
                                <span>{t(dict.filtration.systemNoise)}</span>
                            </Box>
                            <Box>
                                <InputNumber
                                    size='sm'
                                    width='100px'
                                    step={0.1}
                                    min={0}
                                    value={model.qt}
                                    onChange={v => setModel(shallow(model, { qt: +v }))}
                                />
                            </Box>
                        </SimpleGrid>
                        <SimpleGrid columns={2} pb={1}>
                            <Box>
                                <span>{t(dict.filtration.measurementNoise)}</span>
                            </Box>
                            <Box>
                                <InputNumber
                                    size='sm'
                                    width='100px'
                                    step={50}
                                    min={0}
                                    value={model.rt}
                                    onChange={v => setModel(shallow(model, { rt: +v }))}
                                />
                            </Box>
                        </SimpleGrid>
                        <SimpleGrid columns={2} pb={1}>
                            <Box>
                                <span>{t(dict.filtration.errorVariance)}</span>
                            </Box>
                            <Box>
                                <InputNumber
                                    size='sm'
                                    width='100px'
                                    step={1000}
                                    min={0}
                                    value={model.defaultPt}
                                    onChange={v => setModel(shallow(model, { defaultPt: +v }))}
                                />
                            </Box>
                        </SimpleGrid>
                        {model.calcModel === CalcModelEnum.Variable && (
                            <>
                                <SimpleGrid columns={2} pb={1}>
                                    <Box>
                                        <span>{t(dict.filtration.discrete)} Q1</span>
                                    </Box>
                                    <Box>
                                        <InputNumber
                                            size='sm'
                                            width='100px'
                                            value={model.discreteQ1}
                                            onChange={v => setModel(shallow(model, { discreteQ1: +v }))}
                                        />
                                    </Box>
                                </SimpleGrid>
                                <SimpleGrid columns={2} pb={1}>
                                    <Box>
                                        <span>{t(dict.filtration.discrete)} Q2</span>
                                    </Box>
                                    <Box>
                                        <InputNumber
                                            size='sm'
                                            width='100px'
                                            value={model.discreteQ2}
                                            onChange={v => setModel(shallow(model, { discreteQ2: +v }))}
                                        />
                                    </Box>
                                </SimpleGrid>
                                <SimpleGrid columns={2} pb={1}>
                                    <Box>
                                        <span>{t(dict.filtration.discrete)} Q3</span>
                                    </Box>
                                    <Box>
                                        <InputNumber
                                            size='sm'
                                            width='100px'
                                            value={model.discreteQ3}
                                            onChange={v => setModel(shallow(model, { discreteQ3: +v }))}
                                        />
                                    </Box>
                                </SimpleGrid>
                                <SimpleGrid columns={2} pb={1}>
                                    <Box>
                                        <span>{t(dict.filtration.discrete)} Q4</span>
                                    </Box>
                                    <Box>
                                        <InputNumber
                                            size='sm'
                                            width='100px'
                                            value={model.discreteQ4}
                                            onChange={v => setModel(shallow(model, { discreteQ4: +v }))}
                                        />
                                    </Box>
                                </SimpleGrid>
                            </>
                        )}
                    </>
                ) : (
                    model.method === MethodEnum.Slide && (
                        <>
                            <SimpleGrid columns={2} pb={1}>
                                <Box>
                                    <span>{t(dict.filtration.smoothingAmount)}:</span>
                                </Box>
                                <Box>
                                    <InputNumber
                                        size='sm'
                                        width='100px'
                                        step={10}
                                        max={1000}
                                        value={model.smoothLevel}
                                        onChange={v => setModel(shallow(model, { smoothLevel: +v }))}
                                    />
                                </Box>
                            </SimpleGrid>
                        </>
                    )
                )}
            </Box>
            <ButtonGroup display='flex'>
                <Spacer />
                <Button variant='primary' size='sm' onClick={submit}>
                    {t(dict.common.apply)}
                </Button>
            </ButtonGroup>
        </Curtain>
    );
};
