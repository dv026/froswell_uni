import React from 'react';

import { Box, Button } from '@chakra-ui/react';
import { BackgroundType } from 'common/components/dateRangeNew';
import i18n from 'i18next';
import { EngineSelector } from 'proxy/subModules/preparation/components/engineSelector';
import { isNil } from 'ramda';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { upd } from '../../../../calculation/enums/periodEnum';
import { insimCalcParams } from '../../../../calculation/store/insimCalcParams';
import { oilRateDynamic } from '../../../../calculation/store/oilRateDynamic';
import { FormField } from '../../../../common/components/formField';
import { Info } from '../../../../common/components/info/info';
import { InputNumber } from '../../../../common/components/inputNumber';
import { SingleField } from '../../../../common/components/singleField';
import { Range } from '../../../../common/entities/range';
import { firstDay } from '../../../../common/helpers/date';
import { shallow } from '../../../../common/helpers/ramda';
import { AdaptationRangeNew } from '../../../components/adaptationRangeNew';
import { InsimCalculationParams } from '../../../entities/insimCalculationParams';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';

import mainDict from './../../../../common/helpers/i18n/dictionary/main.json';

export const Creation = () => {
    const [params, setParams] = useRecoilState(insimCalcParams);
    const oilRate = useRecoilValue(oilRateDynamic);
    const setStep = useSetRecoilState(currentStep);

    if (isNil(params)) {
        return null;
    }

    const rangeProps = {
        background: {
            data: oilRate,
            type: 'oil' as BackgroundType
        },
        limits: new Range(params.defaultAdaptationStart, params.defaultAdaptationEnd),
        current: new Range(params.adaptationStart, params.adaptationEnd),
        isRange: true,
        onChange: (x: Range<Date>) => setParams(updAdaptationPeriod(params, x))
    };

    return (
        <>
            <EngineSelector />
            <FormField title={i18n.t(mainDict.proxy.ensembleSizeModels)} disabled={true}>
                <InputNumber
                    w='100px'
                    value={params.modelCount}
                    onChange={val => setParams(shallow(params, { modelCount: +val }))}
                />
                <Info tip={i18n.t(mainDict.proxy.ensembleSizeModels)} disabled={true} />
            </FormField>
            <SingleField>
                {i18n.t(mainDict.proxy.adaptationPeriod)}:
                <Box p='20px' h='200px'>
                    <Box w='100%' h='100px'>
                        <AdaptationRangeNew {...rangeProps} />
                    </Box>
                </Box>
            </SingleField>
            <SingleField>
                <Button variant='primary' onClick={() => setStep(DirectedStageEnum.CreateModel)}>
                    {i18n.t(mainDict.proxy.preparation.createModel)}
                </Button>
            </SingleField>
        </>
    );
};

export const updAdaptationPeriod = (old: InsimCalculationParams, fresh: Range<Date>): InsimCalculationParams =>
    upd(old, { adaptationStart: firstDay(fresh.min), adaptationEnd: firstDay(fresh.max) });
