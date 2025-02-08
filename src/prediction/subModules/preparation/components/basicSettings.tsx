import React, { FC, Suspense } from 'react';

import { Box, Button, Checkbox, Flex, Text } from '@chakra-ui/react';
import { EngineSelector } from 'proxy/subModules/preparation/components/engineSelector';
import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { PredictionRange, PredictionRangeProps } from '../../../../calculation/components/predictionRange';
import { creationOpts, toPeriodValue, updPeriod } from '../../../../calculation/enums/periodEnum';
import { insimCalcParams } from '../../../../calculation/store/insimCalcParams';
import { oilRateDiffDynamic } from '../../../../calculation/store/oilRateDynamic';
import { currentScenarioErrors } from '../../../../calculation/store/sharedCalculation';
import { DatePicker } from '../../../../common/components/datePicker';
import { Dropdown } from '../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../common/components/formField';
import { Info } from '../../../../common/components/info/info';
import { InputNumber } from '../../../../common/components/inputNumber';
import { SingleField } from '../../../../common/components/singleField';
import { SkeletonBreadcrumb } from '../../../../common/components/skeleton/skeletonBreadcrumb';
import { Spinner } from '../../../../common/components/spinner';
import { addMonth, firstDay } from '../../../../common/helpers/date';
import { shallow } from '../../../../common/helpers/ramda';
import { PreviousInfo } from '../../../../proxy/subModules/preparation/components/previousInfo';
import { Breadcrumb } from '../../../components/breadcrumb';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';

import dict from './../../../../common/helpers/i18n/dictionary/main.json';

export const BasicSettings = () => {
    const { t } = useTranslation();

    const oilRateDiff = useRecoilValue(oilRateDiffDynamic);
    const scenarioErrors = useRecoilValue(currentScenarioErrors);

    const [params, setParams] = useRecoilState(insimCalcParams);

    const setStep = useSetRecoilState(currentStepState);

    if (isNil(params)) {
        return <Spinner show={true} />;
    }

    const rangeProps: PredictionRangeProps = {
        adaptation: {
            data: oilRateDiff,
            startDate: params.adaptationStart,
            endDate: params.adaptationEnd
        }
    };

    return (
        <Flex w='100%'>
            <Box p={'20px'} w='60%'>
                <Suspense fallback={<SkeletonBreadcrumb />}>
                    <Breadcrumb />
                </Suspense>
                <Box pt={'20px'}>
                    <FormField title={t(dict.proxy.calculationStep)}>
                        <Dropdown
                            onChange={e => setParams(updPeriod(params, +e.target.value))}
                            options={creationOpts()}
                            width={150}
                            disabled={true}
                            value={toPeriodValue(params.period, params.periodType)}
                        />
                        <Info tip={t(dict.proxy.calculationStep)} />
                    </FormField>
                    <FormField title={`${t(dict.proxy.params.shutdownWellsWatercut)}, ${t(dict.common.units.percent)}`}>
                        <InputNumber
                            w='100px'
                            value={params.watercutLimit}
                            onChange={val => setParams(shallow(params, { watercutLimit: +val }))}
                        />
                        <Info tip={t(dict.proxy.tips.maximumWatercutAfterWellStopped)} />
                    </FormField>
                    <FormField
                        title={`${t(dict.proxy.params.shutdownWellsOilProduction)}, ${t(dict.common.units.tonsPerDay)}`}
                    >
                        <InputNumber
                            w='100px'
                            value={params.oilRateLimit}
                            onChange={val => setParams(shallow(params, { oilRateLimit: +val }))}
                        />
                        <Info tip={t(dict.proxy.tips.minimumOilProductionWellStopped)} />
                    </FormField>
                    <EngineSelector />
                    {/*<PreviousInfo oilError={scenarioErrors[0]} liquidError={scenarioErrors[1]} />*/}
                    <SingleField>
                        <Text fontWeight='bold'>{t(dict.proxy.adaptation)}</Text>
                        <Box w='100%' h='200px'>
                            <PredictionRange {...rangeProps} />
                        </Box>
                    </SingleField>
                    <FormField title={t(dict.prediction.calc.startDate)}>
                        <DatePicker selected={addMonth(params.adaptationEnd, 1)} width='150px' disabled={true} />
                        <Info tip={null} />
                    </FormField>
                    <FormField title={t(dict.prediction.calc.endDate)}>
                        <DatePicker
                            selected={params.forecastEnd}
                            width='150px'
                            disabled={false}
                            onChange={d => setParams(shallow(params, { forecastEnd: firstDay(d) }))}
                        />
                        <Info tip={null} />
                    </FormField>
                    <SingleField>
                        <Checkbox
                            isChecked={params.saveAllFrontTracking}
                            onChange={e => setParams(shallow(params, { saveAllFrontTracking: e.target.checked }))}
                        >
                            {t(dict.proxy.saveAllFrontTracking)}
                        </Checkbox>
                    </SingleField>

                    <SingleField>
                        <Checkbox
                            isChecked={params.constantLiqRate}
                            onChange={e => setParams(shallow(params, { constantLiqRate: e.target.checked }))}
                        >
                            {t(dict.prediction.constantLiqRate)}
                        </Checkbox>
                    </SingleField>
                    <SingleField>
                        <Checkbox
                            isChecked={params.constantInjection}
                            onChange={e => setParams(shallow(params, { constantInjection: e.target.checked }))}
                        >
                            {t(dict.prediction.constantInjection)}
                        </Checkbox>
                    </SingleField>

                    <SingleField>
                        <Button variant='primary' mt={'20px'} onClick={() => setStep(DirectedStageEnum.CreateModel)}>
                            {t(dict.common.create)}
                        </Button>
                    </SingleField>
                </Box>
            </Box>
        </Flex>
    );
};
