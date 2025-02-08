/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Flex, HStack } from '@chakra-ui/react';
import { forEachObjIndexed, head, map } from 'ramda';
import { useRecoilValue } from 'recoil';

import colors from '../../../../../../theme/colors';
import { DownIcon, DropIcon } from '../../../../../common/components/customIcon/tree';
import { isOil } from '../../../../../common/enums/wellTypeEnum';
import { round0 } from '../../../../../common/helpers/math';
import { between } from '../../../../../common/helpers/number';
import { groupByProp } from '../../../../../common/helpers/ramda';
import { UpdateOptimisationModel } from '../../../../../proxy/entities/proxyMap/updateOptimisationModel';
import { WellPoint } from '../../../../../proxy/entities/proxyMap/wellPoint';
import { ImaginaryCharWorkHistory } from '../../../../../proxy/entities/proxyMap/wellPoint';
import { OptimisationParamEnum } from '../../../../../proxy/enums/wellGrid/optimisationParam';
import { optimizationParametersState } from '../../../../../proxy/store/map/optimizationParameters';
import { useProxyMapMutations } from '../../../../../proxy/store/map/proxyMapMutations';
import { SliderTypes } from '../../enums/sliderTypes';
import { optimisationData } from '../optimization/dataManager';
import { Slider } from '../slider';

interface IProps {
    well: WellPoint;
}

export const PressureSlider: FC<IProps> = (p: IProps): JSX.Element => {
    const model = useRecoilValue(optimizationParametersState);

    const dispatcher = useProxyMapMutations();

    let presetData = [];

    forEachObjIndexed((group: ImaginaryCharWorkHistory[]) => {
        const it = head(group);
        const data = optimisationData(model, OptimisationParamEnum.PresureZab, p.well.id, it.type);

        presetData.push({
            min: { value: data.minValue, view: round0(data.minValue).toString() },
            max: { value: data.maxValue, view: round0(data.maxValue).toString() },
            value: data.currentValue,
            type: it.type,
            dataset: [
                between(data.defaultValue, data.minValue, data.maxValue)
                    ? {
                          value: data.defaultValue,
                          mark: round0(data.defaultValue).toString()
                      }
                    : null,
                between(data.additionalValue, data.minValue, data.maxValue)
                    ? {
                          value: data.additionalValue,
                          mark: round0(data.additionalValue).toString()
                      }
                    : null
            ]
        });
    }, groupByProp('type', p.well.typeHistory ?? []));

    const onChange = (type: number, value: number) => {
        dispatcher.updateOptimisationPresureZab(
            new UpdateOptimisationModel(p.well.id, type, OptimisationParamEnum.PresureZab, value)
        );
    };

    return (
        <Flex direction='column'>
            {map(
                it => (
                    <HStack key={it.type}>
                        {isOil(it.type) ? (
                            <DropIcon boxSize={7} color={colors.bg.brand} />
                        ) : (
                            <DownIcon boxSize={7} color={colors.bg.brand} />
                        )}
                        <Slider
                            min={it.min}
                            max={it.max}
                            value={it.value}
                            type={SliderTypes.Pressure}
                            dataset={it.dataset}
                            onChange={v => onChange(it.type, v)}
                        />
                    </HStack>
                ),
                presetData
            )}
        </Flex>
    );
};
