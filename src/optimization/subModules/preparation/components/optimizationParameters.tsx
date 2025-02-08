import React, { FC } from 'react';

import { Box, Checkbox } from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilState } from 'recoil';

import colors from '../../../../../theme/colors';
import { insimCalcParams } from '../../../../calculation/store/insimCalcParams';
import { optimizationIterations, optimizationRatioParam } from '../../../../calculation/store/optimizationRatio';
import { DatePicker } from '../../../../common/components/datePicker';
import { FormField } from '../../../../common/components/formField';
import { Info } from '../../../../common/components/info/info';
import { InputNumber } from '../../../../common/components/inputNumber';
import { SingleField } from '../../../../common/components/singleField';
import { OptimizationTargetEnum } from '../../../../common/enums/optimizationTargetEnum';
import { firstDay } from '../../../../common/helpers/date';
import { shallow } from '../../../../common/helpers/ramda';
import { Nullable } from '../../../../common/helpers/types';
import { OptimizationParams } from '../../../../proxy/entities/optimizationParams';
import { OptimizationTypeSlider } from '../../../components/optimizationTypeSlider';
import { OptimizationPeriodDropdown } from './optimizationPeriodDropdown';
import { TargetDropdown } from './targetDropdown';

import dict from './../../../../common/helpers/i18n/dictionary/main.json';

export const OptimizationParameters = () => {
    const [params, setParams] = useRecoilState(insimCalcParams);
    const [ratio, setRatio] = useRecoilState(optimizationRatioParam);
    const [iterations, setIterations] = useRecoilState(optimizationIterations);

    if (!params) {
        return null;
    }

    function updateParam<K extends keyof OptimizationParams>(key: K, value: OptimizationParams[K]) {
        let fresh = {} as Nullable<OptimizationParams>;
        fresh[key] = value;

        setParams(
            shallow(params, {
                optimizationParams: shallow(params.optimizationParams, fresh)
            })
        );
    }

    return (
        <Box>
            <FormField title={i18n.t(dict.proxy.optimization.numberPredictedScenarios)}>
                <InputNumber
                    w='100px'
                    value={params.optimizationParams.modelCount}
                    onChange={val => updateParam('modelCount', +val)}
                />
                <Info tip={i18n.t(dict.proxy.optimization.numberPredictedScenarios)} />
            </FormField>
            <FormField title={i18n.t(dict.proxy.optimization.numberOptionsInScenario)}>
                <InputNumber w='100px' value={iterations} onChange={val => setIterations(+val)} />
                <Info tip={i18n.t(dict.proxy.optimization.numberOptionsInScenario)} />
            </FormField>
            <FormField title={i18n.t(dict.proxy.optimization.typeLabel)} contentPosition='new-line'>
                <OptimizationTypeSlider value={ratio} onChange={setRatio} />
            </FormField>
            <FormField title={i18n.t(dict.proxy.optimization.objectiveFunction)}>
                <TargetDropdown value={OptimizationTargetEnum.MaxOil} />
                <Info tip={i18n.t(dict.proxy.optimization.objectiveFunction)} />
            </FormField>
            <FormField
                title={`${i18n.t(dict.proxy.optimization.permissibleChangePressureZab)}, ${i18n.t(
                    dict.common.units.percent
                )}`}
            >
                <InputNumber
                    w='100px'
                    value={params.optimizationParams.pressureVariance}
                    onChange={val => updateParam('pressureVariance', +val)}
                />
                <Info
                    tip={`${i18n.t(dict.proxy.optimization.permissibleChangePressureZab)}, ${i18n.t(
                        dict.common.units.percent
                    )}`}
                />
            </FormField>
            <FormField title={i18n.t(dict.proxy.optimization.optimizationStep)}>
                <OptimizationPeriodDropdown
                    value={params.optimizationParams.period}
                    onChange={e => updateParam('period', +e.target.value)}
                />
                <Info tip={i18n.t(dict.proxy.selectionScenarioForImprovement)} />
            </FormField>
            <SingleField>
                <Checkbox
                    isChecked={params.optimizationParams.saveOnlyBestO}
                    onChange={e => updateParam('saveOnlyBestO', e.target.checked)}
                >
                    {i18n.t(dict.proxy.optimization.saveOnlyBestO)}
                </Checkbox>
            </SingleField>
            <SingleField>
                <Checkbox
                    isChecked={params.optimizationParams.usePredictionSkinFactors}
                    onChange={e => updateParam('usePredictionSkinFactors', e.target.checked)}
                >
                    {i18n.t(dict.proxy.optimization.usePredictionSkinFactors)}
                </Checkbox>
            </SingleField>

            {params.optimizationParams.iterationsBhp > 0 && (
                <FormField title={i18n.t(dict.proxy.optimization.bhpStartDate)}>
                    <DatePicker
                        selected={params.optimizationParams.optimizeBhpStartDate}
                        width='150px'
                        styles={{
                            background: colors.bg.white
                        }}
                        onChange={e => updateParam('optimizeBhpStartDate', firstDay(e))}
                        minDate={params.predictionStart()}
                    />
                    <Info tip={null} />
                </FormField>
            )}

            {params.optimizationParams.iterationsGtm > 0 && (
                <FormField title={i18n.t(dict.proxy.optimization.skinFactorStartDate)}>
                    <DatePicker
                        selected={params.optimizationParams.optimizeSkinFactorStartDate}
                        width='150px'
                        styles={{
                            background: colors.bg.white
                        }}
                        onChange={e => updateParam('optimizeSkinFactorStartDate', firstDay(e))}
                        minDate={params.predictionStart()}
                    />
                    <Info tip={null} />
                </FormField>
            )}

            {params.optimizationParams.iterationsGtm > 0 && (
                <FormField title={i18n.t(dict.proxy.optimization.skinFactorWells)}>
                    <InputNumber
                        w='100px'
                        value={params.optimizationParams.skinFactorWells}
                        onChange={val => updateParam('skinFactorWells', +val)}
                    />
                    <Info tip={i18n.t(dict.proxy.optimization.skinFactorWells)} />
                </FormField>
            )}
        </Box>
    );
};
