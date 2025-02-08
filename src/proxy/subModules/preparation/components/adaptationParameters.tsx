import React, { FC } from 'react';

import { Accordion, Box } from '@chakra-ui/react';
import { useRecoilState } from 'recoil';

import {
    adaptationRatioParam,
    adaptationsNumberParam,
    insimCalcParams
} from '../../../../calculation/store/insimCalcParams';
import {
    CommonSettings,
    GeoModelSettings,
    PermeabilitiesSettings,
    SkinFactorSettings,
    WeightsSettings
} from '../../../components/settings';

export const AdaptationParameters = () => {
    const [params] = useRecoilState(insimCalcParams);

    // TODO: если убрать получение состояния из сторов, то аккордион некорректно рендерится (отображается не только
    //  первый айтем, но и второй. Также при скрытии/раскрытии блоков и клике по чекбоксам появляются визуальные проблемы.
    //  Необходимо разобраться в причинах:
    //      - возможно происходят лишние рендеры в Settings компонентах
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [adaptationRatio, setAdaptationRatio] = useRecoilState(adaptationRatioParam);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [adaptations, setAdaptations] = useRecoilState(adaptationsNumberParam);

    if (!params) {
        return null;
    }

    return (
        <Box className='adaptation-parameters' p={'20px'} bg='bg.grey100' w='40%' overflow='auto'>
            <Accordion defaultIndex={[0]} allowMultiple>
                <CommonSettings />
                <GeoModelSettings />
                <SkinFactorSettings />
                <PermeabilitiesSettings />
                <WeightsSettings />
            </Accordion>
        </Box>
    );
};
