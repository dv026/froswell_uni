import React from 'react';

import { Box, Button } from '@chakra-ui/react';
import { BackgroundType } from 'common/components/dateRangeNew';
import { ScenarioActionMenu } from 'proxy/components/scenarioActionMenu';
import { EngineSelector } from 'proxy/subModules/preparation/components/engineSelector';
import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import { creationOpts, toPeriodValue, updPeriod } from '../../../../calculation/enums/periodEnum';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { insimCalcParams, modeParamsState } from '../../../../calculation/store/insimCalcParams';
import { oilRateDiffDynamic } from '../../../../calculation/store/oilRateDynamic';
import { scenariosWithResults } from '../../../../calculation/store/scenarios';
import { currentScenarioErrors } from '../../../../calculation/store/sharedCalculation';
import { Dropdown } from '../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../common/components/formField';
import { Info } from '../../../../common/components/info/info';
import { InputNumber } from '../../../../common/components/inputNumber';
import { SingleField } from '../../../../common/components/singleField';
import { Range } from '../../../../common/entities/range';
import { AdaptationRangeNew } from '../../../components/adaptationRangeNew';
import { ScenarioDropdown } from '../../../components/scenarioDropdown';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';
import { PreviousInfo } from './previousInfo';
import { updAdaptationPeriod } from './сreation';

import dict from './../../../../common/helpers/i18n/dictionary/main.json';

export const Improvement = () => {
    const { t } = useTranslation();

    const oilRateDiff = useRecoilValue(oilRateDiffDynamic);
    const scenarios = useRecoilValue(scenariosWithResults);
    const scenarioErrors = useRecoilValue(currentScenarioErrors);

    const [params, setParams] = useRecoilState(insimCalcParams);
    const [scenarioId, setScenarioId] = useRecoilState(currentScenarioId);

    const setCurrentStep = useSetRecoilState(currentStep);

    const resetModeParams = useResetRecoilState(modeParamsState);

    if (isNil(params)) {
        return null;
    }

    const rangeProps = {
        background: {
            data: oilRateDiff,
            type: 'oil' as BackgroundType
        },
        limits: new Range(params.defaultAdaptationStart, params.defaultAdaptationEnd),
        current: new Range(params.adaptationStart, params.adaptationEnd),
        isRange: true,
        onChange: (x: Range<Date>) => setParams(updAdaptationPeriod(params, x))
    };

    const onChangeScenarioId = (id: number) => {
        setScenarioId(id);
        resetModeParams();
    };

    const runInsimImprovement = () => {
        setCurrentStep(DirectedStageEnum.EditModel);
    };

    return (
        <>
            <EngineSelector />
            <FormField title={t(dict.proxy.selectionScenario)}>
                <ScenarioDropdown scenarioId={scenarioId} scenarios={scenarios} onChange={onChangeScenarioId} />
                <ScenarioActionMenu />
                <Info tip={t(dict.proxy.selectionScenario)} />
            </FormField>
            <PreviousInfo oilError={scenarioErrors[0]} liquidError={scenarioErrors[1]} />
            <FormField title={t(dict.proxy.ensembleSizeModels)} disabled={true}>
                <InputNumber w='100px' value={params.modelCount} />
                <Info tip={t(dict.proxy.ensembleSizeModels)} />
            </FormField>
            <FormField title={t(dict.proxy.calculationStep)}>
                <Dropdown
                    onChange={e => setParams(updPeriod(params, +e.target.value))}
                    options={creationOpts()}
                    value={toPeriodValue(params.period, params.periodType)}
                    width={150}
                />
                <Info tip={t(dict.proxy.calculationStep)} />
            </FormField>
            <SingleField>
                {t(dict.proxy.adaptationPeriod)}:
                <Box p='20px' h='200px'>
                    <Box w='100%' h='100px'>
                        <AdaptationRangeNew {...rangeProps} />
                    </Box>
                </Box>
            </SingleField>
            <SingleField>
                <Button variant='primary' onClick={runInsimImprovement}>
                    {t(dict.proxy.preparation.improveModel)}
                </Button>
            </SingleField>
        </>
    );
};
