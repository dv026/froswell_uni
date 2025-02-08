import React, { FC, PropsWithChildren } from 'react';

import {
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox,
    Flex,
    FormControl,
    Text
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import {
    adaptationRatioParam,
    adaptationsNumberParam,
    insimCalcParams
} from '../../../calculation/store/insimCalcParams';
import { FormField } from '../../../common/components/formField';
import { Info } from '../../../common/components/info/info';
import { InputNumber } from '../../../common/components/inputNumber';
import { SingleField } from '../../../common/components/singleField';
import { shallow } from '../../../common/helpers/ramda';
import { AdaptationTypeSlider } from '../../subModules/preparation/components/adaptationTypeSlider';
import { ParameterMinMax } from '../../subModules/preparation/components/parameterMinMax';

import dict from './../../../common/helpers/i18n/dictionary/main.json';

interface GroupProps {
    title: string;
}

export const Group: FC<PropsWithChildren<GroupProps>> = ({ children, title }) => (
    <AccordionItem>
        <AccordionButton>
            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                {title}
            </Box>
            <AccordionIcon color='icons.grey' />
        </AccordionButton>
        <AccordionPanel>{children}</AccordionPanel>
    </AccordionItem>
);

export const PermeabilitiesSettings = () => {
    const { t } = useTranslation();
    const [params, setParams] = useRecoilState(insimCalcParams);

    return (
        <Group title={t(dict.proxy.preparation.groupPermeabilities)} key={'perm'}>
            <FormField title={`${t(dict.proxy.deviationPermeabilities)}, %`}>
                <InputNumber
                    w='100px'
                    value={params.permeabilitiesLimit}
                    onChange={val => setParams(shallow(params, { permeabilitiesLimit: +val }))}
                />
                <Info tip={t(dict.proxy.deviationPermeabilities)} />
            </FormField>
            <FormField title={`${t(dict.proxy.deviationVolumeReservoir)}, %`}>
                <InputNumber
                    w='100px'
                    value={params.reservesLimit}
                    onChange={val => setParams(shallow(params, { reservesLimit: +val }))}
                />
                <Info tip={t(dict.proxy.deviationVolumeReservoir)} />
            </FormField>
            <SingleField>
                <Checkbox
                    isChecked={params.adaptSaturations}
                    onChange={e => setParams(shallow(params, { adaptSaturations: e.target.checked }))}
                >
                    {t(dict.proxy.adaptSaturations)}
                </Checkbox>
            </SingleField>
            <SingleField>
                <Checkbox
                    isChecked={params.adaptRegions}
                    onChange={e => setParams(shallow(params, { adaptRegions: e.target.checked }))}
                >
                    {t(dict.proxy.adaptRegions)}
                </Checkbox>
            </SingleField>
            <Text padding='5px 0'>{t(dict.proxy.preparation.permeabilitiesCoefficients)}:</Text>
            <Flex>
                <Box flex='0 0 50%' paddingLeft='24px'>
                    <FormControl variant='brand'>
                        <Checkbox
                            isChecked={params.adaptOilC1}
                            onChange={e => setParams(shallow(params, { adaptOilC1: e.target.checked }))}
                        >
                            {t(dict.proxy.adaptOilC1)}
                        </Checkbox>
                    </FormControl>
                    <FormControl variant='brand'>
                        <Checkbox
                            isChecked={params.adaptOilC2}
                            onChange={e => setParams(shallow(params, { adaptOilC2: e.target.checked }))}
                        >
                            {t(dict.proxy.adaptOilC2)}
                        </Checkbox>
                    </FormControl>
                </Box>
                <Box flex='0 0 50%'>
                    <FormControl variant='brand'>
                        <Checkbox
                            isChecked={params.adaptWaterC1}
                            onChange={e => setParams(shallow(params, { adaptWaterC1: e.target.checked }))}
                        >
                            {t(dict.proxy.adaptWaterC1)}
                        </Checkbox>
                    </FormControl>
                    <FormControl variant='brand'>
                        <Checkbox
                            isChecked={params.adaptWaterC2}
                            onChange={e => setParams(shallow(params, { adaptWaterC2: e.target.checked }))}
                        >
                            {t(dict.proxy.adaptWaterC2)}
                        </Checkbox>
                    </FormControl>
                </Box>
            </Flex>
        </Group>
    );
};

export const SkinFactorSettings = () => {
    const { t } = useTranslation();
    const [params, setParams] = useRecoilState(insimCalcParams);

    return (
        <Group title={t(dict.proxy.preparation.groupSkinFactor)} key={'skin'}>
            <ParameterMinMax
                title={t(dict.proxy.preparation.skinFactor)}
                min={params.minSkinFactor}
                max={params.maxSkinFactor}
                step={1}
                onMinChange={value => setParams(shallow(params, { minSkinFactor: value }))}
                onMaxChange={value => setParams(shallow(params, { maxSkinFactor: value }))}
            />
        </Group>
    );
};

export const GeoModelSettings = () => {
    const { t } = useTranslation();
    const [params, setParams] = useRecoilState(insimCalcParams);

    return (
        <Group title={t(dict.proxy.preparation.groupGeoModel)} key={'geo'}>
            <FormField title={`${t(dict.proxy.deviationTransmissibilities)}, %`}>
                <InputNumber
                    w='100px'
                    value={params.transmissibilitiesLimit}
                    onChange={val => setParams(shallow(params, { transmissibilitiesLimit: +val }))}
                />
                <Info tip={t(dict.proxy.deviationTransmissibilities)} />
            </FormField>
            <FormField title={`${t(dict.proxy.deviationPreVolume)}, %`}>
                <InputNumber
                    w='100px'
                    value={params.preVolumeLimit}
                    onChange={val => setParams(shallow(params, { preVolumeLimit: +val }))}
                />
                <Info tip={t(dict.proxy.deviationPreVolume)} />
            </FormField>
            <SingleField>
                <Checkbox
                    isChecked={params.useInjectionRepairs}
                    onChange={e => setParams(shallow(params, { useInjectionRepairs: e.target.checked }))}
                >
                    {t(dict.proxy.useInjectionRepairs)}
                </Checkbox>
            </SingleField>
            <SingleField>
                <Checkbox
                    isChecked={params.adaptSaturationsOfInterwellPoints}
                    onChange={e => setParams(shallow(params, { adaptSaturationsOfInterwellPoints: e.target.checked }))}
                >
                    {t(dict.proxy.adaptSaturationsOfInterwellPoints)}
                </Checkbox>
            </SingleField>
        </Group>
    );
};

export const CommonSettings = () => {
    const { t } = useTranslation();

    const [adaptationRatio, setAdaptationRatio] = useRecoilState(adaptationRatioParam);
    const [adaptations, setAdaptations] = useRecoilState(adaptationsNumberParam);
    const [params, setParams] = useRecoilState(insimCalcParams);

    return (
        <Group title={t(dict.proxy.preparation.adaptationParameters)}>
            <FormField title={t(dict.proxy.adaptationsNumber)}>
                <InputNumber
                    w='100px'
                    min={0}
                    value={adaptations}
                    changeOnBlurOnly={true}
                    onChange={val => setAdaptations(+val)}
                />
                <Info tip={t(dict.proxy.adaptationsNumber)} />
            </FormField>
            <FormField title={t(dict.proxy.preparation.typeLabel)} contentPosition='new-line'>
                <AdaptationTypeSlider value={adaptationRatio} onChange={setAdaptationRatio} />
            </FormField>

            <SingleField>
                <Checkbox
                    isChecked={false}
                    disabled={true}
                    // isChecked={!params.saveOnlyBestA}
                    // onChange={e => setParams(shallow(params, { saveOnlyBestA: !e.target.checked }))}
                >
                    {t(dict.proxy.saveAllA)}
                </Checkbox>
            </SingleField>
            <SingleField>
                <Checkbox
                    isChecked={false}
                    disabled={true}
                    // isChecked={params.saveAllFrontTracking}
                    // onChange={e => setParams(shallow(params, { saveAllFrontTracking: e.target.checked }))}
                >
                    {t(dict.proxy.saveAllFrontTracking)}
                </Checkbox>
            </SingleField>
        </Group>
    );
};

export const WeightsSettings = () => {
    const { t } = useTranslation();

    const [params, setParams] = useRecoilState(insimCalcParams);

    return (
        <Group title={t(dict.proxy.preparation.influenceParameterDeviationsAdaptationError)} key={'weight'}>
            <FormField title={t(dict.common.dataBy.oil)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.oilErrorWeight}
                    onChange={value => setParams(shallow(params, { oilErrorWeight: +value }))}
                />
            </FormField>
            <FormField title={t(dict.common.dataBy.liquid)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.liquidErrorWeight}
                    onChange={value => setParams(shallow(params, { liquidErrorWeight: +value }))}
                />
            </FormField>
            <FormField title={t(dict.common.dataBy.injection)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.injectionErrorWeight}
                    onChange={value => setParams(shallow(params, { injectionErrorWeight: +value }))}
                />
            </FormField>
            <FormField title={t(dict.common.dataBy.pressure)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.pressureErrorWeight}
                    onChange={value => setParams(shallow(params, { pressureErrorWeight: +value }))}
                />
            </FormField>
            <FormField title={t(dict.common.dataBy.flow)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.flowErrorWeight}
                    onChange={value => setParams(shallow(params, { flowErrorWeight: +value }))}
                />
            </FormField>
            <FormField title={t(dict.common.dataBy.pressureZab)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.pressureZabErrorWeight}
                    onChange={value => setParams(shallow(params, { pressureZabErrorWeight: +value }))}
                />
            </FormField>
            <FormField title={t(dict.common.dataBy.watercut)}>
                <InputNumber
                    w='100px'
                    size='sm'
                    min={1}
                    max={400}
                    value={params.watercutErrorWeight}
                    onChange={value => setParams(shallow(params, { watercutErrorWeight: +value }))}
                />
            </FormField>
        </Group>
    );
};
