import React, { FC } from 'react';

import { Button, Flex, HStack, Text } from '@chakra-ui/react';
import { append, forEach, remove, update } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { AddIcon, RemoveIcon } from '../../../../../common/components/customIcon/general';
import { DatePicker } from '../../../../../common/components/datePicker';
import { dateWithoutZone } from '../../../../../common/helpers/date';
import { round0 } from '../../../../../common/helpers/math';
import { isNullOrEmpty, mapIndexed, shallow } from '../../../../../common/helpers/ramda';
import { OptimisationSkinFactorModel } from '../../../../../proxy/entities/proxyMap/optimisationSkinFactorModel';
import { WellPoint } from '../../../../../proxy/entities/proxyMap/wellPoint';
import { optimizationSkinFactorParametersByWell } from '../../../../../proxy/store/map/optimizationParameters';
import { useProxyMapMutations } from '../../../../../proxy/store/map/proxyMapMutations';
import { SliderTypes } from '../../enums/sliderTypes';
import { optimisationSkinFactorData } from '../optimization/dataManager';
import { Slider } from '../slider';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    well: WellPoint;
}

export const SkinFactorSlider: FC<IProps> = (p: IProps): JSX.Element => {
    const { t } = useTranslation();

    const model = useRecoilValue(optimizationSkinFactorParametersByWell(p.well.id));

    const dispatcher = useProxyMapMutations();

    const data = optimisationSkinFactorData(model, p.well.id);

    let presetData = [];

    forEach(it => {
        presetData.push({
            min: { value: it.minValue, view: round0(it.minValue).toString() },
            max: { value: it.maxValue, view: round0(it.maxValue).toString() },
            value: it.currentValue,
            dataset: [
                {
                    value: it.defaultValue,
                    mark: round0(it.defaultValue).toString()
                }
            ],
            startDate: it.startDate,
            endDate: it.endDate,
            spike: it.spike
        });
    }, data);

    return (
        <Flex direction='column'>
            {mapIndexed(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (it: any, index: number) => (
                    <>
                        <HStack spacing={1}>
                            <Button
                                variant='unstyled'
                                onClick={() => {
                                    remove(index, 1, data);

                                    const newList = model.filter((x, i) => i !== index, model);

                                    if (isNullOrEmpty(newList)) {
                                        newList.push(
                                            new OptimisationSkinFactorModel(
                                                p.well.id,
                                                p.well.plastId,
                                                -1,
                                                null,
                                                null,
                                                null,
                                                0
                                            )
                                        );
                                    }

                                    dispatcher.updateOptimisationSkinFactor(p.well.id, newList);
                                }}
                                minW='auto'
                            >
                                <RemoveIcon boxSize={7} color='icons.red' textAlign='center' />
                            </Button>
                            <HStack spacing={1}>
                                <DatePicker
                                    width='120px'
                                    selected={it.startDate}
                                    placeholder='С'
                                    size='sm'
                                    onChange={date =>
                                        dispatcher.updateOptimisationSkinFactor(
                                            p.well.id,
                                            update(
                                                index,
                                                shallow(model[index], { startDate: dateWithoutZone(date) }),
                                                model
                                            )
                                        )
                                    }
                                />
                                <Text>-</Text>
                                <DatePicker
                                    width='120px'
                                    selected={it.endDate}
                                    placeholder='По'
                                    size='sm'
                                    onChange={date =>
                                        dispatcher.updateOptimisationSkinFactor(
                                            p.well.id,
                                            update(
                                                index,
                                                shallow(model[index], { endDate: dateWithoutZone(date) }),
                                                model
                                            )
                                        )
                                    }
                                />
                            </HStack>
                            <Text color='red' fontSize='sm' pl={1}>
                                Cкачок скин-фактора: {round0(it.spike - it.value) * -1}
                            </Text>
                        </HStack>
                        <Slider
                            {...it}
                            onChange={value =>
                                dispatcher.updateOptimisationSkinFactor(
                                    p.well.id,
                                    update(index, shallow(model[index], { value: value }), model)
                                )
                            }
                            type={SliderTypes.SkinFactor}
                        />
                    </>
                ),
                presetData
            )}
            <HStack spacing={1}>
                <Button
                    variant='link'
                    leftIcon={<AddIcon boxSize={7} color='icons.grey' />}
                    onClick={() => {
                        dispatcher.updateOptimisationSkinFactor(
                            p.well.id,
                            append(
                                new OptimisationSkinFactorModel(p.well.id, p.well.plastId, -1, null, null, null, 0),
                                model
                            )
                        );
                    }}
                >
                    {t(dict.prediction.addPeriod)}
                </Button>
            </HStack>
        </Flex>
    );
};
