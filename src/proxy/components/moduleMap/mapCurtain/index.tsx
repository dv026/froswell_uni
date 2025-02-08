import React, { FC } from 'react';

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox,
    CheckboxGroup,
    Divider,
    Stack
} from '@chakra-ui/react';
import i18n from 'i18next';
import * as R from 'ramda';
import { any, append, equals, filter, includes, isNil, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { currentGridMap } from '../../../../calculation/store/gridMap';
import { mapIsolineSettings } from '../../../../calculation/store/mapIsolineSettings';
import { Appearance, ExpandItem, Group, Heading } from '../../../../common/components/appearanceView';
import { CheckListOption } from '../../../../common/components/checkList';
import { FoldingCurtain } from '../../../../common/components/curtain';
import { IsolinePanel } from '../../../../common/components/isolinePanel';
import { RadioGroup, RadioGroupOption, RadioGroupProps } from '../../../../common/components/radioGroup';
import { WellDateEnum, WellDateLabel } from '../../../../common/entities/mapCanvas/wellDateLabel';
import { FundTypeEnum } from '../../../../common/enums/fundTypeEnum';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { shallow, trueOrNull } from '../../../../common/helpers/ramda';
import { hasValue } from '../../../../common/helpers/recoil';
import { u } from '../../../../common/helpers/strings';
import { cls } from '../../../../common/helpers/styles';
import { uSyllabify } from '../../../../common/helpers/syllabify/ru';
import { gridMapSettings } from '../../../store/map/gridMapSettings';
import { availableGridsSelector } from '../../../store/map/mapSettings';
import { wellGridState } from '../../../store/map/wellGrid';
import { wellStockState } from '../../../store/map/wellStock';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    withInterwells?: boolean;
    withIntermediate?: boolean;
    isProxy?: boolean;
    isImprovement?: boolean;
}

export const MapCurtain: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const gridSettingsLoadable = useRecoilValueLoadable(gridMapSettings);

    const availableGrids = useRecoilValue(availableGridsSelector);

    const [gridMap, setGridMap] = useRecoilState(currentGridMap);
    const [stock, setStock] = useRecoilState(wellStockState);
    const [wellGrid, setWellGrid] = useRecoilState(wellGridState);

    const setIsolineSettings = useSetRecoilState(mapIsolineSettings);

    const gridSettings = hasValue(gridSettingsLoadable) ? gridSettingsLoadable.contents : null;

    const updateWellStock = (type: FundTypeEnum, add: boolean) => {
        const newValue = add ? append(type, stock) : reject(equals(type), stock);

        setStock(newValue);
    };

    const updateDateLabels = (fund: FundTypeEnum, wd: WellDateEnum, show: boolean) => {
        const model = new WellDateLabel(fund, wd as unknown as WellDateEnum, show);

        let labels = R.reject(
            (it: WellDateLabel) => it.type === model.type && it.param === model.param,
            wellGrid.dateLabels
        );

        labels.push(model);

        setWellGrid(shallow(wellGrid, { dateLabels: labels }));
    };

    const renderExpandItem = (title: string, activeFund: FundTypeEnum, disabled: boolean = false) => {
        return (
            <ExpandItem
                main={{
                    title: title,
                    disabled: disabled,
                    onChange: (checked: boolean) => updateWellStock(activeFund, checked),
                    checked: includes<FundTypeEnum>(activeFund, stock)
                }}
                listOptions={reject(isNil, options(filter(it => it.type === activeFund, wellGrid.dateLabels || [])))}
                onListOptionChange={(type: WellDateEnum, show) => {
                    updateDateLabels(activeFund, type, show);
                }}
            />
        );
    };

    return (
        <FoldingCurtain position='top-left' btnLabel={t(dict.common.appearance)}>
            <Appearance>
                <Heading text={t(dict.common.appearance)} />
                <Group text={t(dict.common.wellFund)} />
                {renderExpandItem(t(dict.common.activeStock), FundTypeEnum.ActiveStock, true)}
                {renderExpandItem(t(dict.common.drilledStock), FundTypeEnum.DrilledFoundation)}
                {renderExpandItem(t(dict.common.virtual), FundTypeEnum.VirtualWells)}
                {renderExpandItem(t(dict.common.intermediate), FundTypeEnum.IntermediateWells)}

                <Divider />
                <CheckboxGroup>
                    <Stack spacing={1} direction={'column'}>
                        {p.withInterwells && (
                            <>
                                <Checkbox
                                    isChecked={wellGrid.showInterwells}
                                    onChange={e => setWellGrid(shallow(wellGrid, { showInterwells: e.target.checked }))}
                                >
                                    {t(dict.common.interwellConnections)}
                                </Checkbox>
                                <Checkbox
                                    isChecked={wellGrid.showAquifer}
                                    onChange={e => setWellGrid(shallow(wellGrid, { showAquifer: e.target.checked }))}
                                >
                                    {t(dict.common.aquifer)}
                                </Checkbox>
                            </>
                        )}
                        <Checkbox
                            isChecked={wellGrid.showPlastNames}
                            onChange={e => setWellGrid(shallow(wellGrid, { showPlastNames: e.target.checked }))}
                        >
                            {t(dict.proxy.wellGrid.plastNames)}
                        </Checkbox>
                    </Stack>
                </CheckboxGroup>
            </Appearance>
            <Appearance>
                <Group text={t(dict.common.map)} />
                <RadioGroup
                    {...radioGroupOpts(
                        gridMap,
                        (val: string) => setGridMap(val as GridMapEnum),
                        [new RadioGroupOption(GridMapEnum.None, t(dict.common.withoutGrid))],
                        true
                    )}
                />
                <Accordion defaultIndex={[0]} my='10px'>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {t(dict.common.properties)}
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
                                {t(dict.common.structural)}
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
                    {p.isProxy && !p.isImprovement ? null : (
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
                    )}
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
                </Accordion>
                <IsolinePanel model={gridSettings?.isolineSettings} onChange={model => setIsolineSettings(model)} />
            </Appearance>
        </FoldingCurtain>
    );
};

export const groupProperties = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.Power,
        i18n.t(dict.common.params.initialPower),
        !R.includes(GridMapEnum.Power, availableGrids),
        !R.includes(GridMapEnum.Power, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Porosity,
        i18n.t(dict.common.params.porosity),
        !R.includes(GridMapEnum.Porosity, availableGrids),
        !R.includes(GridMapEnum.Porosity, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Permeability,
        i18n.t(dict.common.params.permeability),
        !R.includes(GridMapEnum.Permeability, availableGrids),
        !R.includes(GridMapEnum.Permeability, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.OilSaturation,
        u(uSyllabify(i18n.t(dict.common.params.oilSaturation))),
        !R.includes(GridMapEnum.OilSaturation, availableGrids),
        !R.includes(GridMapEnum.OilSaturation, availableGrids)
    )
];

export const groupStructure = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.TopAbs,
        i18n.t(dict.common.params.topAbs),
        !R.includes(GridMapEnum.TopAbs, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.BottomAbs,
        i18n.t(dict.common.params.bottomAbs),
        !R.includes(GridMapEnum.BottomAbs, availableGrids)
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
        i18n.t(dict.common.params.currentOilSaturatedThickness),
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
        !R.includes(GridMapEnum.SWL, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SWCR,
        i18n.t(dict.proxy.wellGrid.params.SWCR),
        !R.includes(GridMapEnum.SWCR, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SOWCR,
        i18n.t(dict.proxy.wellGrid.params.SOWCR),
        !R.includes(GridMapEnum.SOWCR, availableGrids)
    )
];

export const radioGroupOpts = (
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

// todo mb double
const options = (dateLabels: WellDateLabel[]) => [
    new CheckListOption(
        i18n.t(dict.common.trajectories),
        WellDateEnum.Trajectory,
        any(x => x.param === WellDateEnum.Trajectory && x.value, dateLabels)
    )
];
