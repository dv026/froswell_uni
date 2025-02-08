import React, { FC } from 'react';

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox
} from '@chakra-ui/react';
import i18n from 'i18next';
import { any, append, equals, filter, includes, isNil, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { Appearance, Heading, Group, ExpandItem } from '../../../common/components/appearanceView';
import { CheckListOption } from '../../../common/components/checkList';
import { FoldingCurtain } from '../../../common/components/curtain';
import { IsolinePanel } from '../../../common/components/isolinePanel';
import { RadioGroup, RadioGroupOption, RadioGroupProps } from '../../../common/components/radioGroup';
import { SingleField } from '../../../common/components/singleField';
import { WellDateEnum, WellDateLabel } from '../../../common/entities/mapCanvas/wellDateLabel';
import { FundTypeEnum } from '../../../common/enums/fundTypeEnum';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { shallow } from '../../../common/helpers/ramda';
import { u } from '../../../common/helpers/strings';
import { uSyllabify } from '../../../common/helpers/syllabify/ru';
import { appearanceSettingsState } from '../../store/map/appearanceSettings';
import { currentGridMap } from '../../store/map/gridMap';
import { gridMapSettings } from '../../store/map/gridMapSettings';
import { mapDateLabels } from '../../store/map/mapDateLabels';
import { mapIsolineSettings } from '../../store/map/mapIsolineSettings';
import { mapSettingsState } from '../../store/map/mapSettings';
import { wellStockState } from '../../store/map/wellStock';
import { KrigingVariationLossesSettingModule } from './krigingVariationLossesSettingModule';
import { KrigingVariationSettingModule } from './krigingVariationSettingModule';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const MapCurtain = () => {
    const { t } = useTranslation();

    const gridSettingsLoadable = useRecoilValueLoadable(gridMapSettings);

    const mapSettings = useRecoilValue(mapSettingsState);

    const [appearance, setAppearance] = useRecoilState(appearanceSettingsState);
    const [gridMap, setGridMap] = useRecoilState(currentGridMap);
    const [stock, setStock] = useRecoilState(wellStockState);
    const [dateLabels, setDateLabels] = useRecoilState(mapDateLabels);

    const setIsolineSettings = useSetRecoilState(mapIsolineSettings);

    const updateWellStock = (type: FundTypeEnum, add: boolean) => {
        const newValue = add ? append(type, stock) : reject(equals(type), stock);

        setStock(newValue);
    };

    // todo mb
    const updateDateLabels = (fund: FundTypeEnum, wd: WellDateEnum, show: boolean) => {
        const model = new WellDateLabel(fund, wd as unknown as WellDateEnum, show);

        let labels = reject((it: WellDateLabel) => it.type === model.type && it.param === model.param, dateLabels);

        labels.push(model);

        setDateLabels(labels);
    };

    // todo mb
    const renderExpandItem = (title: string, activeFund: FundTypeEnum, disabled: boolean = false) => {
        return (
            <ExpandItem
                main={{
                    title: title,
                    disabled: disabled,
                    onChange: (checked: boolean) => updateWellStock(activeFund, checked),
                    checked: includes<FundTypeEnum>(activeFund, stock)
                }}
                listOptions={reject(isNil, options(filter(it => it.type === activeFund, dateLabels || [])))}
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
            </Appearance>

            <Appearance>
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
                        isChecked={appearance.showNaturalRadius}
                        onChange={v => setAppearance(shallow(appearance, { showNaturalRadius: v.target.checked }))}
                    >
                        {i18n.t(dict.common.naturalRadius)}
                    </Checkbox>
                </SingleField>
                <SingleField>
                    <Checkbox
                        isChecked={appearance.showWellComments}
                        onChange={v => setAppearance(shallow(appearance, { showWellComments: v.target.checked }))}
                    >
                        {i18n.t(dict.map.comments.commentsByWells)}
                    </Checkbox>
                </SingleField>
            </Appearance>

            <Appearance>
                <Group text={t(dict.common.map)} />
                <RadioGroup {...radioGroupOpts(gridMap, setGridMap, groupCommon())} />
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
                                    setGridMap,
                                    groupProperties(mapSettings.availableGrids || [])
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
                                    setGridMap,
                                    groupStructure(mapSettings.availableGrids || [])
                                )}
                            />
                        </AccordionPanel>
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                    {t(dict.common.development)}
                                </Box>
                                <AccordionIcon color='icons.grey' />
                            </AccordionButton>
                            <AccordionPanel>
                                <RadioGroup
                                    {...radioGroupOpts(
                                        gridMap,
                                        setGridMap,
                                        groupDevelopment(mapSettings.availableGrids || [])
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
                                        setGridMap,
                                        groupRelativePermeability(mapSettings.availableGrids || [])
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
                                <KrigingVariationSettingModule period={mapSettings?.krigingPeriod} />
                            </AccordionPanel>
                        </AccordionItem>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                {t(dict.map.lossGainMap)}
                            </Box>
                            <AccordionIcon color='icons.grey' />
                        </AccordionButton>
                        <AccordionPanel>
                            <KrigingVariationLossesSettingModule period={mapSettings?.krigingPeriod} />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
                <IsolinePanel model={gridSettingsLoadable.contents?.isolineSettings} onChange={setIsolineSettings} />
            </Appearance>
        </FoldingCurtain>
    );
};

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
        u(uSyllabify(i18n.t(dict.common.params.oilSaturation))),
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
        GridMapEnum.PressureZab,
        i18n.t(dict.common.params.pressureZab),
        !includes(GridMapEnum.PressureZab, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.CurrentPower,
        i18n.t(dict.common.params.currentPower),
        !includes(GridMapEnum.CurrentPower, availableGrids)
    )
];

export const groupRelativePermeability = (availableGrids: GridMapEnum[]): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.SWL,
        i18n.t(dict.proxy.wellGrid.params.SWL),
        !includes(GridMapEnum.SWL, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SOWCR,
        i18n.t(dict.proxy.wellGrid.params.SOWCR),
        !includes(GridMapEnum.SOWCR, availableGrids)
    )
];

export const options = (dateLabels: WellDateLabel[]): CheckListOption[] => [
    new CheckListOption(
        i18n.t(dict.common.trajectories),
        WellDateEnum.Trajectory,
        any(x => x.param === WellDateEnum.Trajectory && x.value, dateLabels)
    )
];

export const radioGroupOpts = (
    grid: GridMapEnum,
    updateWellGrid: (type: GridMapEnum) => void,
    opts: RadioGroupOption[]
): RadioGroupProps => ({
    options: opts,
    name: 'tree-grid__grids',
    onChange: updateWellGrid,
    value: grid
});
