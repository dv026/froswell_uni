import React, { FC } from 'react';

import { Divider } from '@chakra-ui/react';
import { TFunction } from 'i18next';
import { append, equals, filter, includes, isNil, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { Appearance, ExpandItem, Group, Heading, SubGroup } from '../../common/components/appearanceView';
import { FoldingCurtain } from '../../common/components/curtain';
import { IsolinePanel } from '../../common/components/isolinePanel';
import { RadioGroup, RadioGroupOption, RadioGroupProps } from '../../common/components/radioGroup';
import { WellDateEnum, WellDateLabel } from '../../common/entities/mapCanvas/wellDateLabel';
import { FundTypeEnum } from '../../common/enums/fundTypeEnum';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { trueOrNull } from '../../common/helpers/ramda';
import { u } from '../../common/helpers/strings';
import { cls } from '../../common/helpers/styles';
import { uSyllabify } from '../../common/helpers/syllabify/ru';
import { options } from '../../input/components/settings/mapCurtain';
import { mapDateLabels } from '../../input/store/map/mapDateLabels';
import { currentGridMap } from '../store/gridMap';
import { gridMapSettings } from '../store/gridMapSettings';
import { mapIsolineSettings } from '../store/mapIsolineSettings';
import { mapSettingsState } from '../store/mapSettings';
import { wellStockState } from '../store/wellStock';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const MapCurtain = () => {
    const { t } = useTranslation();

    const gridSettings = useRecoilValue(gridMapSettings);
    const mapSettings = useRecoilValue(mapSettingsState);

    const [gridMap, setGridMap] = useRecoilState(currentGridMap);
    const [stock, setStock] = useRecoilState(wellStockState);
    const [dateLabels, setDateLabels] = useRecoilState(mapDateLabels);

    const setIsolineSettings = useSetRecoilState(mapIsolineSettings);

    if (equals(gridMap, GridMapEnum.CalculationMode)) {
        return null;
    }

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
                <Group text={t(dict.common.map)} />
                <RadioGroup
                    {...radioGroupOpts(
                        gridMap,
                        setGridMap,
                        [new RadioGroupOption(GridMapEnum.None, t(dict.common.withoutGrid))],
                        true
                    )}
                />
                <Divider />
                <SubGroup text={t(dict.geoModel.paramsRequired)} />
                <RadioGroup
                    {...radioGroupOpts(gridMap, setGridMap, groupProperties(mapSettings.availableGrids ?? [], t))}
                />
                <Divider />
                <SubGroup text={t(dict.geoModel.paramsAdditional)} />
                <RadioGroup
                    {...radioGroupOpts(gridMap, setGridMap, groupStructure(mapSettings.availableGrids ?? [], t))}
                />
                <RadioGroup
                    {...radioGroupOpts(gridMap, setGridMap, groupDevelopment(mapSettings.availableGrids ?? [], t))}
                />
                <IsolinePanel model={gridSettings?.isolineSettings} divider={true} onChange={setIsolineSettings} />
            </Appearance>
        </FoldingCurtain>
    );
};

export const groupProperties = (availableGrids: GridMapEnum[], t: TFunction<'translation'>): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.Power,
        t(dict.common.params.initialPower),
        !includes(GridMapEnum.Power, availableGrids),
        !includes(GridMapEnum.Power, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Porosity,
        t(dict.common.params.porosity),
        !includes(GridMapEnum.Porosity, availableGrids),
        !includes(GridMapEnum.Porosity, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.Permeability,
        t(dict.common.params.permeability),
        !includes(GridMapEnum.Permeability, availableGrids),
        !includes(GridMapEnum.Permeability, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.OilSaturation,
        u(uSyllabify(t(dict.common.params.oilSaturation))),
        !includes(GridMapEnum.OilSaturation, availableGrids),
        !includes(GridMapEnum.OilSaturation, availableGrids)
    )
];

export const groupStructure = (availableGrids: GridMapEnum[], t: TFunction<'translation'>): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.TopAbs,
        t(dict.common.params.topAbs),
        !includes(GridMapEnum.TopAbs, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.BottomAbs,
        t(dict.common.params.bottomAbs),
        !includes(GridMapEnum.BottomAbs, availableGrids)
    )
];

export const groupDevelopment = (availableGrids: GridMapEnum[], t: TFunction<'translation'>): RadioGroupOption[] => [
    new RadioGroupOption(
        GridMapEnum.PressureZab,
        t(dict.common.params.pressureZab),
        !includes(GridMapEnum.PressureZab, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SWL,
        t(dict.proxy.wellGrid.params.SWL),
        !includes(GridMapEnum.SWL, availableGrids)
    ),
    new RadioGroupOption(
        GridMapEnum.SOWCR,
        t(dict.proxy.wellGrid.params.SOWCR),
        !includes(GridMapEnum.SOWCR, availableGrids)
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
