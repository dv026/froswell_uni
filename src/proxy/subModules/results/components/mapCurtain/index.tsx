import React, { FC } from 'react';

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox,
    Switch
} from '@chakra-ui/react';
import i18n from 'i18next';
import { includes, isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { KrigingVariationSettingModule } from '../../../../../calculation/components/kriging/krigingVariationSettingModule';
import { currentPlastId } from '../../../../../calculation/store/currentPlastId';
import { currentGridMap } from '../../../../../calculation/store/gridMap';
import { mapIsolineSettings } from '../../../../../calculation/store/mapIsolineSettings';
import { Appearance, Group, Heading } from '../../../../../common/components/appearanceView';
import { FoldingCurtain } from '../../../../../common/components/curtain';
import { IsolinePanel } from '../../../../../common/components/isolinePanel';
import { RadioGroup, RadioGroupOption, RadioGroupProps } from '../../../../../common/components/radioGroup';
import { SingleField } from '../../../../../common/components/singleField';
import { GridMapEnum } from '../../../../../common/enums/gridMapEnum';
import { shallow, trueOrNull } from '../../../../../common/helpers/ramda';
import { hasValue } from '../../../../../common/helpers/recoil';
import { u } from '../../../../../common/helpers/strings';
import { cls } from '../../../../../common/helpers/styles';
import { uSyllabify } from '../../../../../common/helpers/syllabify/ru';
import { appearanceSettingsState } from '../../store/appearanceSettings';
import { gridMapSettings } from '../../store/gridMapSettings';
import { availableGridsSelector, krigingPeriodSelector } from '../../store/mapSettings';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const MapCurtain = () => {
    const { t } = useTranslation();

    const gridSettingsLoadable = useRecoilValueLoadable(gridMapSettings);

    const plastId = useRecoilValue(currentPlastId);
    const availableGrids = useRecoilValue(availableGridsSelector);
    const krigingPeriod = useRecoilValue(krigingPeriodSelector);

    //const selectedWells = useRecoilValue(selectedWellsState);

    const [appearance, setAppearance] = useRecoilState(appearanceSettingsState);
    const [gridMap, setGridMap] = useRecoilState(currentGridMap);

    const setIsolineSettings = useSetRecoilState(mapIsolineSettings);

    const gridSettings = hasValue(gridSettingsLoadable) ? gridSettingsLoadable.contents : null;

    // const selectedWellName = () =>
    //     well && well.id && mapSettings.points ? find(it => it.id === well.id, mapSettings.points)?.name : null;

    return (
        <FoldingCurtain position='top-left' btnLabel={t(dict.common.appearance)}>
            <Appearance>
                <Heading text={t(dict.common.appearance)} />
                <SingleField>
                    <Checkbox
                        isChecked={appearance.showTrajectory}
                        onChange={v => setAppearance(shallow(appearance, { showTrajectory: v.target.checked }))}
                    >
                        {i18n.t(dict.common.wellTrajectories)}
                    </Checkbox>
                </SingleField>
                {isNil(plastId) ? (
                    <SingleField>
                        <Checkbox
                            isChecked={appearance.showInflowProfile}
                            onChange={v => setAppearance(shallow(appearance, { showInflowProfile: v.target.checked }))}
                        >
                            {i18n.t(dict.map.inflowProfile)}
                        </Checkbox>
                    </SingleField>
                ) : (
                    <SingleField>
                        <Checkbox
                            isChecked={appearance.showCompensation}
                            onChange={v => setAppearance(shallow(appearance, { showCompensation: v.target.checked }))}
                        >
                            {i18n.t(dict.map.сompensation)}
                        </Checkbox>
                    </SingleField>
                )}
                <SingleField>
                    <Checkbox
                        isChecked={appearance.showTracerResearch}
                        onChange={v => setAppearance(shallow(appearance, { showTracerResearch: v.target.checked }))}
                    >
                        {i18n.t(dict.common.tracerResearch)}
                    </Checkbox>
                </SingleField>
                <SingleField>
                    <Checkbox
                        isChecked={appearance.showOpeningMode}
                        onChange={v => setAppearance(shallow(appearance, { showOpeningMode: v.target.checked }))}
                    >
                        {i18n.t(dict.common.openingMode)}
                    </Checkbox>
                </SingleField>
                <SingleField>
                    <Checkbox
                        isChecked={appearance.showLiquidDistribution}
                        onChange={v => setAppearance(shallow(appearance, { showLiquidDistribution: v.target.checked }))}
                    >
                        {i18n.t(dict.map.liquidDistribution)}
                        {appearance.showLiquidDistribution ? (
                            <Switch
                                size='sm'
                                ml={1}
                                title={i18n.t(dict.map.scaleByObjectWell)}
                                isChecked={appearance.scaleLiquidDistributionByWell}
                                onChange={v =>
                                    setAppearance(
                                        shallow(appearance, { scaleLiquidDistributionByWell: v.target.checked })
                                    )
                                }
                            />
                        ) : null}
                    </Checkbox>
                </SingleField>
                <SingleField>
                    <Checkbox
                        isChecked={appearance.showFlowInterwells}
                        onChange={v => setAppearance(shallow(appearance, { showFlowInterwells: v.target.checked }))}
                    >
                        {i18n.t(dict.map.flowInterwells)}
                    </Checkbox>
                </SingleField>
                {/* {!isNil(well.id) && isEmpty(selectedWells) && appearance.showFlowInterwells ? (
                    <div>
                        <span>{selectedWellName()}</span>
                        <span className='actions-panel__label'>
                            <Button variant='link' >
                                {i18n.t(dict.common.reset)}
                            </Button>
                        </span>
                    </div>
                ) : null} */}
            </Appearance>
            <Appearance>
                <Group text={i18n.t(dict.common.map)} />
                <RadioGroup
                    {...radioGroupOpts(gridMap, (val: string) => setGridMap(val as GridMapEnum), groupCommon(), true)}
                />
                <Accordion defaultIndex={[0]} my='10px'>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {i18n.t(dict.common.properties)}
                            </Box>
                            <AccordionIcon color='icons.grey' />
                        </AccordionButton>
                        <AccordionPanel>
                            <RadioGroup
                                {...radioGroupOpts(
                                    gridMap,
                                    (val: string) => setGridMap(val as GridMapEnum),
                                    groupProperties(availableGrids || [])
                                )}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {i18n.t(dict.common.structural)}
                            </Box>
                            <AccordionIcon color='icons.grey' />
                        </AccordionButton>
                        <AccordionPanel>
                            <RadioGroup
                                {...radioGroupOpts(
                                    gridMap,
                                    (val: string) => setGridMap(val as GridMapEnum),
                                    groupStructure(availableGrids || [])
                                )}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {i18n.t(dict.common.development)}
                            </Box>
                            <AccordionIcon color='icons.grey' />
                        </AccordionButton>
                        <AccordionPanel>
                            <RadioGroup
                                {...radioGroupOpts(
                                    gridMap,
                                    (val: string) => setGridMap(val as GridMapEnum),
                                    groupDevelopment(availableGrids || [])
                                )}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {t(dict.proxy.wellGrid.groups.relativePermeability)}
                            </Box>
                            <AccordionIcon color='icons.grey' />
                        </AccordionButton>
                        <AccordionPanel>
                            <RadioGroup
                                {...radioGroupOpts(
                                    gridMap,
                                    (val: string) => setGridMap(val as GridMapEnum),
                                    groupRelativePermeability(availableGrids || [])
                                )}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {t(dict.map.deviationMaps)}
                            </Box>
                            <AccordionIcon color='icons.grey' />
                        </AccordionButton>
                        <AccordionPanel>
                            <KrigingVariationSettingModule period={krigingPeriod} />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
                <IsolinePanel model={gridSettings?.isolineSettings} onChange={model => setIsolineSettings(model)} />
            </Appearance>
        </FoldingCurtain>
    );
};

const radioGroupOpts = (
    grid: GridMapEnum,
    updateWellGrid: (type: GridMapEnum) => void,
    opts: RadioGroupOption[],
    root: boolean = false
): RadioGroupProps => ({
    className: cls('tree-grid__grids', trueOrNull(root, 'tree-grid__grids_root-level')),
    options: opts,
    name: 'tree-grid__grids',
    onChange: updateWellGrid,
    value: grid
});

export const groupCommon = (): RadioGroupOption[] => [
    new RadioGroupOption(GridMapEnum.None, i18n.t(dict.common.withoutGrid))
];

export const groupProperties = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.Power,
        i18n.t(dict.common.params.initialPower),
        !includes(GridMapEnum.Power, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Porosity,
        i18n.t(dict.common.params.porosity),
        !includes(GridMapEnum.Porosity, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Permeability,
        i18n.t(dict.common.params.permeability),
        !includes(GridMapEnum.Permeability, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.OilSaturation,
        u(uSyllabify(i18n.t(dict.common.params.initialOilSaturation))),
        !includes(GridMapEnum.OilSaturation, availableGrids)
    )
];

export const groupStructure = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.TopAbs,
        i18n.t(dict.common.params.topAbs),
        !includes(GridMapEnum.TopAbs, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.BottomAbs,
        i18n.t(dict.common.params.bottomAbs),
        !includes(GridMapEnum.BottomAbs, availableGrids)
    )
];

export const groupDevelopment = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.InitialTransmissibilityBeforeAdaptation,
        i18n.t(dict.common.params.initialTransmissibilityBeforeAdaptation),
        !includes(GridMapEnum.InitialTransmissibilityBeforeAdaptation, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.InitialTransmissibilityAfterAdaptation,
        i18n.t(dict.common.params.initialTransmissibilityAfterAdaptation),
        !includes(GridMapEnum.InitialTransmissibilityAfterAdaptation, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.InitialInterwellVolumeBeforeAdaptation,
        u(uSyllabify(i18n.t(dict.common.params.initialInterwellVolumeBeforeAdaptation))),
        !includes(GridMapEnum.InitialInterwellVolumeBeforeAdaptation, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.InitialInterwellVolumeAfterAdaptation,
        u(uSyllabify(i18n.t(dict.common.params.initialInterwellVolumeAfterAdaptation))),
        !includes(GridMapEnum.InitialInterwellVolumeAfterAdaptation, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Pressure,
        i18n.t(dict.common.params.pressureRes),
        !includes(GridMapEnum.Pressure, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.VolumeWaterCut,
        u(uSyllabify(i18n.t(dict.common.params.oilSaturation))),
        !includes(GridMapEnum.VolumeWaterCut, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.CurrentOilSaturatedThickness,
        u(uSyllabify(i18n.t(dict.common.params.currentOilSaturatedThickness))),
        !includes(GridMapEnum.CurrentOilSaturatedThickness, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.CurrentKH,
        u(uSyllabify(i18n.t(dict.common.params.currentKH))),
        !includes(GridMapEnum.CurrentKH, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.CurrentK,
        u(uSyllabify(i18n.t(dict.common.params.currentK))),
        !includes(GridMapEnum.CurrentK, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SkinFactor,
        u(uSyllabify(i18n.t(dict.common.params.skinFactor))),
        !includes(GridMapEnum.SkinFactor, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.InitialSaturationAdaptation,
        u(uSyllabify(i18n.t(dict.common.params.initialSaturationAdaptation))),
        !includes(GridMapEnum.InitialSaturationAdaptation, availableGrids)
    )
];

export const groupRelativePermeability = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.SWL,
        i18n.t(dict.proxy.wellGrid.params.SWL),
        !includes(GridMapEnum.SWL, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SWLAdaptation,
        i18n.t(dict.proxy.wellGrid.params.SWLAdaptation),
        !includes(GridMapEnum.SWLAdaptation, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SWCR,
        i18n.t(dict.proxy.wellGrid.params.SWCR),
        !includes(GridMapEnum.SWCR, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SOWCR,
        i18n.t(dict.proxy.wellGrid.params.SOWCR),
        !includes(GridMapEnum.SOWCR, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SOWCRAdaptation,
        i18n.t(dict.proxy.wellGrid.params.SOWCRAdaptation),
        !includes(GridMapEnum.SOWCRAdaptation, availableGrids)
    )
];
