import React, { PureComponent, ReactNode } from 'react';

import {
    any,
    cond,
    equals,
    forEach,
    forEachObjIndexed,
    prop,
    T,
    sortBy,
    isNil,
    find,
    unnest,
    map,
    head,
    concat
} from 'ramda';
import { Line, LineProps } from 'recharts';

import colors from '../../../../theme/colors';
import { InputCompareModel } from '../../../input/entities/inputCompareModel';
import { WellBrief } from '../../entities/wellBrief';
import { ChartCompareEnum } from '../../enums/chartCompareEnum';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { opacity } from '../../helpers/colors';
import i18n from '../../helpers/i18n';
import * as Prm from '../../helpers/parameters';
import { groupByProp, isNullOrEmpty, mapIndexed, nul } from '../../helpers/ramda';
import { ColumnType } from '../chart';
import { getDot, NoDot } from '../charts/dots';
import { RepairIcon } from '../charts/dots/repairIcon';
import { RepairDotProps } from '../charts/dots/repairsDot';
import { OptionalParameter } from '../charts/legends/parameter';
import { NameValueTooltipLine } from '../charts/tooltips/nameValueTooltip';
import { DropdownOption } from '../dropdown/dropdown';

import dict from '../../helpers/i18n/dictionary/main.json';
import mainDict from '../../helpers/i18n/dictionary/main.json';

export const getColorByKey = (type: ChartCompareEnum, wellType: WellTypeEnum = WellTypeEnum.Oil) =>
    cond([
        [equals(ChartCompareEnum.OilRate), () => colors.paramColors.oil],
        [
            equals(ChartCompareEnum.LiquidOrInjectionRate),
            () => (wellType === WellTypeEnum.Oil ? colors.paramColors.liquid : colors.paramColors.injection)
        ],
        [equals(ChartCompareEnum.GasVolumeRate), () => colors.paramColors.gas],
        [equals(ChartCompareEnum.WatercutVolume), () => colors.paramColors.watercut],
        [equals(ChartCompareEnum.WatercutWeight), () => colors.paramColors.watercut],
        [equals(ChartCompareEnum.PressureRes), () => colors.paramColors.pressure],
        [equals(ChartCompareEnum.PressureZab), () => colors.paramColors.pressure],
        [equals(ChartCompareEnum.AccumOilProduction), () => colors.paramColors.oil],
        [equals(ChartCompareEnum.AccumLiquidProduction), () => colors.paramColors.liquid],
        [equals(ChartCompareEnum.AccumGasVolumeProduction), () => colors.paramColors.gas],
        [equals(ChartCompareEnum.AccumInjection), () => colors.paramColors.injection],
        [T, nul]
    ])(type);

// (Дебит жидкости, м3/сут) у нагнетательных (Закачка воды, м3/сут)

export const getCompareParam = (type: ChartCompareEnum, wellType: WellTypeEnum = WellTypeEnum.Oil) =>
    cond([
        [equals(ChartCompareEnum.OilRate), () => Prm.oilrate()],
        [
            equals(ChartCompareEnum.LiquidOrInjectionRate),
            () => (wellType === WellTypeEnum.Oil ? Prm.liqrate() : Prm.injectionRate())
        ],
        [equals(ChartCompareEnum.GasVolumeRate), () => Prm.gasVolumeRate()],
        [equals(ChartCompareEnum.WatercutVolume), () => Prm.watercut()],
        [equals(ChartCompareEnum.WatercutWeight), () => Prm.watercutWeight()],
        [equals(ChartCompareEnum.PressureRes), () => Prm.pressureRes()],
        [equals(ChartCompareEnum.PressureZab), () => Prm.pressureZab()],
        [equals(ChartCompareEnum.AccumOilProduction), () => Prm.accumulatedOilProduction()],
        [equals(ChartCompareEnum.AccumLiquidProduction), () => Prm.accumulatedLiqRate()],
        [equals(ChartCompareEnum.AccumGasVolumeProduction), () => Prm.accumulatedGasVolumeProduction()],
        [equals(ChartCompareEnum.AccumInjection), () => Prm.accumulatedInjectionRate()],
        [T, nul]
    ])(type);

const baseName = (prefix: string, well: WellBrief) => {
    return `${prefix}_${well.toString()}`;
};

export const valueName = (well: WellBrief) => {
    return baseName('value', well);
};

export const valueRealName = (well: WellBrief) => {
    return baseName('valueReal', well);
};

export const repairName = (well: WellBrief) => {
    return baseName('repairName', well);
};

export const repairNameInjection = (well: WellBrief) => {
    return baseName('repairNameInjection', well);
};

export const generateCompareData = (data: InputCompareModel[]) => {
    let result = [];

    forEachObjIndexed((group, key) => {
        if (isNullOrEmpty(group)) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let item: any = {
            dt: new Date(key)
        };

        forEach(it => {
            const well = new WellBrief(
                it.oilfieldId,
                it.wellId,
                it.productionObjectId,
                it.wellType,
                it.scenarioId,
                it.subScenarioId
            );

            item[valueName(well)] = it.value;
            item[valueRealName(well)] = it.valueReal;

            if (it.repairName) {
                item[repairName(well)] = it.repairName;
            }

            if (it.repairNameInjection) {
                item[repairNameInjection(well)] = it.repairNameInjection;
            }
        }, group);

        result.push(item);
    }, groupByProp('dt', data));

    return sortBy(prop('dt'), result && result.length ? result : [{ dt: new Date() }]);
};

export const getCompareColumns = (
    data: InputCompareModel[],
    selectedWells: WellBrief[],
    type: ChartCompareEnum,
    withRepairs: boolean,
    isProxy: boolean = false
) => {
    if (isNullOrEmpty(selectedWells)) {
        return [];
    }

    const firstWell = head(selectedWells);
    const isWell = !!firstWell.id;
    const isLiquidOrInjection = type === ChartCompareEnum.LiquidOrInjectionRate;

    const newSelectedWells = unnest(
        map(
            wellType =>
                map(
                    x => new WellBrief(x.oilFieldId, x.id, x.prodObjId, wellType, x.scenarioId, x.subScenarioId),
                    selectedWells
                ),
            [WellTypeEnum.Oil, WellTypeEnum.Injection]
        )
    );

    const currentSelectedWells = isLiquidOrInjection && !isWell ? newSelectedWells : selectedWells;

    const count = currentSelectedWells.length;

    let columns = mapIndexed((it: WellBrief, index: number) => {
        const dataKey = valueName(
            new WellBrief(
                it.oilFieldId,
                it.id,
                it.prodObjId,
                isLiquidOrInjection ? it.charWorkId : null,
                it.scenarioId,
                it.subScenarioId
            )
        );
        const color = opacity(getColorByKey(type, it.charWorkId), 1 - index / count);
        const name = getCompareParam(type, it.charWorkId);

        const obj = find(
            x =>
                x.oilfieldId === it.oilFieldId &&
                x.productionObjectId === it.prodObjId &&
                x.wellId === it.id &&
                (!isProxy || x.scenarioId === it.scenarioId) &&
                (!isProxy || x.subScenarioId === it.subScenarioId),
            data
        );

        const objName = getItemName(firstWell, obj);

        return {
            key: dataKey,
            yAxisId: 'left',
            name: name,
            wellType: WellTypeEnum.Oil,

            line: () =>
                LineComponent(
                    {
                        yAxisId: 'left',
                        dataKey: dataKey,
                        stroke: color
                    },
                    withRepairs
                ),
            legend: (disabledLines, onClick) => (
                <OptionalParameter
                    key={dataKey}
                    title={objName}
                    visible={!any(x => x === dataKey, disabledLines)}
                    color={color}
                    onClick={() => onClick(dataKey)}
                />
            ),
            tooltip: () => (
                <NameValueTooltipLine key={dataKey} dataKey={dataKey} title={`${name}, ${objName}`} color={color} />
            )
        };
    }, currentSelectedWells);

    // реальные данные
    if (isProxy) {
        const proxyColumns = mapIndexed((it: WellBrief, index: number) => {
            const dataKey = valueRealName(
                new WellBrief(
                    it.oilFieldId,
                    it.id,
                    it.prodObjId,
                    isLiquidOrInjection ? it.charWorkId : null,
                    it.scenarioId,
                    it.subScenarioId
                )
            );

            const obj = find(
                x =>
                    x.oilfieldId === it.oilFieldId &&
                    x.productionObjectId === it.prodObjId &&
                    x.wellId === it.id &&
                    (!isProxy || x.scenarioId === it.scenarioId) &&
                    (!isProxy || x.subScenarioId === it.subScenarioId),
                data
            );

            const color = opacity(getColorByKey(type, it.charWorkId), 1 - index / count);
            const name = getCompareParam(type, it.charWorkId);

            const objName = `${i18n.t(mainDict.common.fact)} ${getItemName(firstWell, obj)}`;

            return {
                key: dataKey,
                yAxisId: 'left',
                name: name,
                wellType: WellTypeEnum.Oil,

                line: () =>
                    LineComponent({
                        yAxisId: 'left',
                        dataKey: dataKey,
                        stroke: color,
                        strokeDasharray: '5 5'
                    }),
                legend: (disabledLines, onClick) => (
                    <OptionalParameter
                        key={dataKey}
                        title={objName}
                        dashed={true}
                        visible={!any(x => x === dataKey, disabledLines)}
                        color={color}
                        onClick={() => onClick(dataKey)}
                    />
                ),
                tooltip: () => (
                    <NameValueTooltipLine key={dataKey} dataKey={dataKey} title={`${name}, ${objName}`} color={color} />
                )
            };
        }, currentSelectedWells);

        columns = concat(columns, proxyColumns);
    }

    return columns as ColumnType[];
};

export const LineComponent = (props: LineProps, withRepairs?: boolean): ReactNode => {
    const { name } = props;

    const dataKey = props.dataKey as string;

    return (
        <Line
            {...props}
            key={dataKey.toString()}
            name={name}
            type='monotone'
            strokeWidth='2'
            dot={getDot(
                withRepairs
                    ? {
                          static: <RepairsDot isActive={false} dataKey={dataKey} />,
                          active: <RepairsDot isActive={false} dataKey={dataKey} />
                      }
                    : null,
                dataKey,
                false
            )}
            isAnimationActive={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={props.ref as any}
        />
    );
};

class RepairsDot extends PureComponent<RepairDotProps, null> {
    public render(): ReactNode {
        const { cx, cy, payload, dataKey } = this.props;
        if (!cx || !cy) {
            return null;
        }

        const well = WellBrief.fromString(dataKey.replace('_', '*').split('*')[1]);

        const name = repairName(well);
        const nameInjection = repairNameInjection(well);

        if (!isNil(payload[name])) {
            return <RepairIcon cx={cx} cy={cy} text={payload[name]} />;
        }

        if (!isNil(payload[nameInjection])) {
            return <RepairIcon cx={cx} cy={cy} text={payload[nameInjection]} />;
        }

        return <NoDot />;
    }
}

const getItemName = (well: WellBrief, item: InputCompareModel) => {
    if (!item) {
        return '';
    }

    const isWell = !!well.id;
    const isSubScenario = !isWell && !!well.subScenarioId;
    const isScenario = !isSubScenario && !!well.scenarioId;
    const isObject = !isScenario && !!well.prodObjId;
    const isOilfield = !isObject && !!well.oilFieldId;

    if (isWell) {
        return `${i18n.t(dict.common.wellAbbr)} ${item.wellName}`;
    }

    if (isSubScenario) {
        return item.subScenarioName;
    }

    if (isScenario) {
        return item.scenarioName;
    }

    if (isObject) {
        return item.productionObjectName;
    }

    if (isOilfield) {
        return item.oilfieldName;
    }

    return '';
};

export const compareDropdownOptions = [
    new DropdownOption(ChartCompareEnum.Sum, i18n.t(dict.common.aggregated)),
    new DropdownOption(ChartCompareEnum.Multiple, i18n.t(dict.input.comparisonMultiWells)),
    new DropdownOption(ChartCompareEnum.OilRate, i18n.t(dict.common.params.oilRate)),
    new DropdownOption(
        ChartCompareEnum.LiquidOrInjectionRate,
        `${i18n.t(dict.common.params.liqRate)}/${i18n.t(dict.common.params.injectionRate)}`
    ),
    new DropdownOption(ChartCompareEnum.GasVolumeRate, i18n.t(dict.common.params.gasVolumeRate)),
    new DropdownOption(ChartCompareEnum.WatercutVolume, i18n.t(dict.common.params.watercutVolume)),
    new DropdownOption(ChartCompareEnum.WatercutWeight, i18n.t(dict.common.params.watercutWeight)),
    new DropdownOption(ChartCompareEnum.PressureRes, i18n.t(dict.common.params.pressureRes)),
    new DropdownOption(ChartCompareEnum.PressureZab, i18n.t(dict.common.params.pressureZab)),
    new DropdownOption(ChartCompareEnum.AccumOilProduction, i18n.t(dict.common.params.accumulatedOilProduction)),
    new DropdownOption(ChartCompareEnum.AccumLiquidProduction, i18n.t(dict.common.params.accumulatedLiqRate)),
    new DropdownOption(
        ChartCompareEnum.AccumGasVolumeProduction,
        i18n.t(dict.common.params.accumulatedGasVolumeProduction)
    ),
    new DropdownOption(ChartCompareEnum.AccumInjection, i18n.t(dict.common.params.accumulatedInjectionRate))
];
