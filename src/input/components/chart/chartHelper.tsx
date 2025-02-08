import React from 'react';

import { any } from 'ramda';

import { ColumnType } from '../../../common/components/chart';
import { Parameter } from '../../../common/components/charts/legends/parameter';
import {
    lineBottomHolePressure,
    lineDynamicLevel,
    lineGas,
    lineInjection,
    lineInjectionWithRepairs,
    lineLiquid,
    lineOil,
    lineOilWithRepairs,
    linePlastPressure,
    lineWatercut
} from '../../../common/components/charts/lines';
import {
    DynamicLevelTooltipLine,
    GasTooltipLine,
    InjectionTooltipLine,
    LiquidTooltipLine,
    OilTooltipLine,
    PressureTooltipLine,
    StockTooltipLine,
    WatercutTooltipLine
} from '../../../common/components/charts/tooltips/nameValueTooltip';
import { ChartParamEnum } from '../../../common/enums/chartParamEnum';
import { ModeTypeEnum } from '../../../common/enums/modeType';
import { getLabel, ParamNameEnum } from '../../../common/enums/paramNameEnum';
import { UnitsEnum } from '../../../common/enums/unitsEnum';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import * as Prm from '../../../common/helpers/parameters';

export const merWells: ColumnType[] = [
    {
        key: 'liquidVolumeRate',
        yAxisId: 'left',
        name: Prm.liqrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', 'liquidVolumeRate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='liquidVolumeRate'
                title={Prm.liqrate()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === 'liquidVolumeRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('liquidVolumeRate')}
            />
        ),
        tooltip: () => <LiquidTooltipLine key='liquidVolumeRate' dataKey='liquidVolumeRate' title={Prm.liqrate()} />
    },
    {
        key: 'sumLiquidProductionTonnesMonth',
        yAxisId: 'left',
        name: Prm.liqProduction(),
        type: ModeTypeEnum.Monthly,
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', 'sumLiquidProductionTonnesMonth', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumLiquidProductionTonnesMonth'
                title={Prm.liqProduction()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === 'sumLiquidProductionTonnesMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumLiquidProductionTonnesMonth')}
            />
        ),
        tooltip: () => (
            <LiquidTooltipLine
                key='sumLiquidProductionTonnesMonth'
                dataKey='sumLiquidProductionTonnesMonth'
                title={Prm.liqProduction()}
            />
        )
    },
    {
        key: 'oilTonnesRate',
        yAxisId: 'left',
        name: Prm.oilrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,
        order: 1,

        line: showRepairs =>
            showRepairs
                ? lineOilWithRepairs('left', 'oilTonnesRate', undefined, false, true)
                : lineOil('left', 'oilTonnesRate', false, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='oilTonnesRate'
                title={Prm.oilrate()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === 'oilTonnesRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('oilTonnesRate')}
            />
        ),
        tooltip: () => <OilTooltipLine key='oilTonnesRate' dataKey='oilTonnesRate' title={Prm.oilrate()} />
    },
    {
        key: 'sumOilProductionTonnesMonth',
        yAxisId: 'left',
        name: Prm.oilProduction(),
        type: ModeTypeEnum.Monthly,
        wellType: WellTypeEnum.Oil,

        line: showRepairs =>
            showRepairs
                ? lineOilWithRepairs('left', 'sumOilProductionTonnesMonth', undefined, false, true)
                : lineOil('left', 'sumOilProductionTonnesMonth', false, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumOilProductionTonnesMonth'
                title={Prm.oilrate()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === 'sumOilProductionTonnesMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumOilProductionTonnesMonth')}
            />
        ),
        tooltip: () => (
            <OilTooltipLine
                key='sumOilProductionTonnesMonth'
                dataKey='sumOilProductionTonnesMonth'
                title={Prm.oilProduction()}
            />
        )
    },
    {
        key: 'gasVolumeRate',
        yAxisId: 'right',
        name: Prm.gasVolumeRate(),
        visible: false,
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineGas('right', 'gasVolumeRate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='gasVolumeRate'
                title={Prm.gasVolumeRate()}
                type={ChartParamEnum.Gas}
                visible={!any(x => x === 'gasVolumeRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('gasVolumeRate')}
            />
        ),
        tooltip: () => <GasTooltipLine key='gasVolumeRate' dataKey='gasVolumeRate' title={Prm.gasVolumeRate()} />
    },
    {
        key: 'sumGasProductionVolumeMonth',
        yAxisId: 'right',
        name: Prm.gasVolumeRate(ParamNameEnum.GasVolumeRate, UnitsEnum.ThousandM3PerMonth),
        visible: false,
        type: ModeTypeEnum.Monthly,
        wellType: WellTypeEnum.Oil,

        line: () => lineGas('right', 'sumGasProductionVolumeMonth', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumGasProductionVolumeMonth'
                title={Prm.gasVolumeRate(ParamNameEnum.GasVolumeRate, UnitsEnum.ThousandM3PerMonth)}
                type={ChartParamEnum.Gas}
                visible={!any(x => x === 'sumGasProductionVolumeMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumGasProductionVolumeMonth')}
            />
        ),
        tooltip: () => (
            <GasTooltipLine
                key='sumGasProductionVolumeMonth'
                dataKey='sumGasProductionVolumeMonth'
                title={Prm.gasVolumeRate(ParamNameEnum.GasVolumeRate, UnitsEnum.ThousandM3PerMonth)}
            />
        )
    },
    {
        key: 'watercutVolume',
        yAxisId: 'right',
        name: Prm.watercut(),
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => lineWatercut('right', 'watercutVolume', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='watercutVolume'
                title={Prm.watercut()}
                type={ChartParamEnum.Watercut}
                visible={!any(x => x === 'watercutVolume', disabledLines)}
                dashed={false}
                onClick={() => onClick('watercutVolume')}
            />
        ),
        tooltip: () => <WatercutTooltipLine key='watercutVolume' dataKey='watercutVolume' title={Prm.watercut()} />
    },
    {
        key: 'pressureZab',
        yAxisId: 'right',
        name: Prm.pressureZab(),
        visible: false,
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => lineBottomHolePressure('right', 'pressureZab', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZab'
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZab', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZab')}
            />
        ),
        tooltip: () => <PressureTooltipLine key='pressureZab' dataKey='pressureZab' title={Prm.pressureZab()} />
    },
    {
        key: 'pressureZabOil',
        yAxisId: 'right',
        name: Prm.pressureZabOil(),
        visible: false,
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => lineBottomHolePressure('right', 'pressureZabOil', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZabOil'
                title={Prm.pressureZabOil()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZabOil', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZabOil')}
            />
        ),
        tooltip: () => (
            <PressureTooltipLine key='pressureZabOil' dataKey='pressureZabOil' title={Prm.pressureZabOil()} />
        )
    },
    {
        key: 'pressureZabInjection',
        yAxisId: 'right',
        name: Prm.pressureZabInjection(),
        visible: false,
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => lineBottomHolePressure('right', 'pressureZabInjection', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZabInjection'
                title={Prm.pressureZabInjection()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZabInjection', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZabInjection')}
            />
        ),
        tooltip: () => (
            <PressureTooltipLine
                key='pressureZabInjection'
                dataKey='pressureZabInjection'
                title={Prm.pressureZabInjection()}
            />
        )
    },
    {
        key: 'pressureRes',
        yAxisId: 'right',
        name: Prm.pressureRes(),
        visible: false,
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => linePlastPressure('right', 'pressureRes'),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureRes'
                title={Prm.pressureRes()}
                type={ChartParamEnum.PlastPressure}
                visible={!any(x => x === 'pressureRes', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureRes')}
            />
        ),
        tooltip: () => <PressureTooltipLine key='pressureRes' dataKey='pressureRes' title={Prm.pressureRes()} />
    },

    {
        key: 'injectionRate',
        yAxisId: 'left',
        name: Prm.injectionRate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Injection,
        order: 1,

        line: showRepairs =>
            showRepairs
                ? lineInjectionWithRepairs('left', 'injectionRate', undefined, false)
                : lineInjection('left', 'injectionRate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='injectionRate'
                title={Prm.injectionRate()}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === 'injectionRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('injectionRate')}
            />
        ),
        tooltip: () => <InjectionTooltipLine key='injectionRate' dataKey='injectionRate' title={Prm.injectionRate()} />
    },
    {
        key: 'sumInjectionMonth',
        yAxisId: 'left',
        name: Prm.injectionRate(ParamNameEnum.InjectionRate, UnitsEnum.M3PerMonth),
        type: ModeTypeEnum.Monthly,
        wellType: WellTypeEnum.Injection,

        line: showRepairs =>
            showRepairs
                ? lineInjectionWithRepairs('left', 'sumInjectionMonth', undefined, false)
                : lineInjection('left', 'sumInjectionMonth', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumInjectionMonth'
                title={Prm.injectionRate(ParamNameEnum.InjectionRate, UnitsEnum.M3PerMonth)}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === 'sumInjectionMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumInjectionMonth')}
            />
        ),
        tooltip: () => (
            <InjectionTooltipLine
                key='sumInjectionMonth'
                dataKey='sumInjectionMonth'
                title={Prm.injectionRate(ParamNameEnum.InjectionRate, UnitsEnum.M3PerMonth)}
            />
        )
    },
    {
        key: 'pressureZab',
        yAxisId: 'right',
        name: Prm.pressureZab(),
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Injection,

        line: () => lineBottomHolePressure('right', 'pressureZab', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZabInj'
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZab', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZab')}
            />
        ),
        tooltip: () => <PressureTooltipLine key='pressureZabInj' dataKey='pressureZab' title={Prm.pressureZab()} />
    },
    {
        key: 'sumNakOilProductionTonnesMonth',
        yAxisId: 'left',
        name: Prm.accumulatedOilProduction(),
        type: ModeTypeEnum.Accumulated,
        wellType: WellTypeEnum.Oil,

        line: showRepairs =>
            showRepairs
                ? lineOilWithRepairs('left', 'sumNakOilProductionTonnesMonth', undefined, false, true)
                : lineOil('left', 'sumNakOilProductionTonnesMonth', false, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumNakOilProductionTonnesMonth'
                title={Prm.accumulatedOilProduction()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === 'sumNakOilProductionTonnesMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumNakOilProductionTonnesMonth')}
            />
        ),
        tooltip: () => (
            <OilTooltipLine
                key='sumNakOilProductionTonnesMonth'
                dataKey='sumNakOilProductionTonnesMonth'
                title={Prm.accumulatedOilProduction()}
            />
        )
    },
    {
        key: 'sumNakLiquidProductionTonnesMonth',
        yAxisId: 'left',
        name: Prm.accumulatedLiqRate(),
        type: ModeTypeEnum.Accumulated,
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', 'sumNakLiquidProductionTonnesMonth', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumNakLiquidProductionTonnesMonth'
                title={Prm.accumulatedLiqRate()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === 'sumNakLiquidProductionTonnesMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumNakLiquidProductionTonnesMonth')}
            />
        ),
        tooltip: () => (
            <LiquidTooltipLine
                key='sumNakLiquidProductionTonnesMonth'
                dataKey='sumNakLiquidProductionTonnesMonth'
                title={Prm.accumulatedLiqRate()}
            />
        )
    },
    {
        key: 'sumNakGasVolumeProductionMonth',
        yAxisId: 'right',
        name: Prm.accumulatedGasVolumeProduction(),
        visible: false,
        type: ModeTypeEnum.Accumulated,
        wellType: WellTypeEnum.Oil,

        line: () => lineGas('right', 'sumNakGasVolumeProductionMonth', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumNakGasVolumeProductionMonth'
                title={Prm.accumulatedGasVolumeProduction()}
                type={ChartParamEnum.Gas}
                visible={!any(x => x === 'sumNakGasVolumeProductionMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumNakGasVolumeProductionMonth')}
            />
        ),
        tooltip: () => (
            <GasTooltipLine
                key='sumNakGasVolumeProductionMonth'
                dataKey='sumNakGasVolumeProductionMonth'
                title={Prm.accumulatedGasVolumeProduction()}
            />
        )
    },
    {
        key: 'sumNakInjectionMonth',
        yAxisId: 'left',
        name: Prm.accumulatedInjectionRate(),
        type: ModeTypeEnum.Accumulated,
        wellType: WellTypeEnum.Injection,

        line: showRepairs =>
            showRepairs
                ? lineInjectionWithRepairs('left', 'sumNakInjectionMonth', undefined, false)
                : lineInjection('left', 'sumNakInjectionMonth', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='sumNakInjectionMonth'
                title={Prm.accumulatedInjectionRate()}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === 'sumNakInjectionMonth', disabledLines)}
                dashed={false}
                onClick={() => onClick('sumNakInjectionMonth')}
            />
        ),
        tooltip: () => (
            <InjectionTooltipLine
                key='sumNakInjectionMonth'
                dataKey='sumNakInjectionMonth'
                title={Prm.accumulatedInjectionRate()}
            />
        )
    }
];

export const dailyWells: ColumnType[] = [
    {
        key: 'liqRate',
        yAxisId: 'left',
        name: Prm.liqrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', 'liqRate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='liqRate'
                title={Prm.liqrate()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === 'liqRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('liqRate')}
            />
        ),
        tooltip: () => <LiquidTooltipLine key='liqRate' dataKey='liqRate' title={Prm.liqrate()} />
    },
    {
        key: 'oilRate',
        yAxisId: 'left',
        name: Prm.oilrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,
        order: 1,

        line: () => lineOil('left', 'oilRate', false, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='oilRate'
                title={Prm.oilrate()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === 'oilRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('oilRate')}
            />
        ),
        tooltip: () => <OilTooltipLine key='oilRate' dataKey='oilRate' title={Prm.oilrate()} />
    },
    {
        key: 'dynLevel',
        yAxisId: 'right',
        name: Prm.dynLevel(),
        visible: false,
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineDynamicLevel('right', 'dynLevel', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='dynLevel'
                title={Prm.dynLevel()}
                type={ChartParamEnum.DynamicLevel}
                visible={!any(x => x === 'dynLevel', disabledLines)}
                dashed={false}
                onClick={() => onClick('dynLevel')}
            />
        ),
        tooltip: () => <DynamicLevelTooltipLine key='dynLevel' dataKey='dynLevel' title={Prm.dynLevel()} />
    },
    {
        key: 'watercutVolume',
        yAxisId: 'right',
        name: Prm.watercut(),
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => lineWatercut('right', 'watercutVolume', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='watercutVolume'
                title={Prm.watercut()}
                type={ChartParamEnum.Watercut}
                visible={!any(x => x === 'watercutVolume', disabledLines)}
                dashed={false}
                onClick={() => onClick('watercutVolume')}
            />
        ),
        tooltip: () => <WatercutTooltipLine key='watercutVolume' dataKey='watercutVolume' title={Prm.watercut()} />
    },
    {
        key: 'pressureZab',
        yAxisId: 'right',
        name: Prm.pressureZab(),
        visible: false,
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Oil,

        line: () => lineBottomHolePressure('right', 'pressureZab', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZab'
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZab', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZab')}
            />
        ),
        tooltip: () => <PressureTooltipLine key='pressureZab' dataKey='pressureZab' title={Prm.pressureZab()} />
    },

    {
        key: 'intakeLiqrate',
        yAxisId: 'left',
        name: Prm.injectionRate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Injection,
        order: 1,

        line: () => lineInjection('left', 'intakeLiqrate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='intakeLiqrate'
                title={Prm.injectionRate()}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === 'intakeLiqrate', disabledLines)}
                dashed={false}
                onClick={() => onClick('intakeLiqrate')}
            />
        ),
        tooltip: () => <InjectionTooltipLine key='intakeLiqrate' dataKey='intakeLiqrate' title={Prm.injectionRate()} />
    },
    {
        key: 'pressureZab',
        yAxisId: 'right',
        name: Prm.pressureZab(),
        type: ModeTypeEnum.All,
        wellType: WellTypeEnum.Injection,

        line: () => lineBottomHolePressure('right', 'pressureZab', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZab'
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZab', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZab')}
            />
        ),
        tooltip: () => <PressureTooltipLine dataKey='pressureZab' title={Prm.pressureZab()} />
    }
];

export const merPlusDailyWells: ColumnType[] = [
    {
        key: 'liquidVolumeRate',
        yAxisId: 'left',
        name: Prm.liqrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', 'liquidVolumeRate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='liquidVolumeRate'
                title={Prm.liqrate()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === 'liquidVolumeRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('liquidVolumeRate')}
            />
        ),
        tooltip: () => <LiquidTooltipLine key='liquidVolumeRate' dataKey='liquidVolumeRate' title={Prm.liqrate()} />
    },
    {
        key: 'liqRate',
        yAxisId: 'left',
        name: Prm.liqrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', 'liqRate', true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='liqRate'
                title={Prm.liqrate()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === 'liqRate', disabledLines)}
                dashed={true}
                onClick={() => onClick('liqRate')}
            />
        ),
        tooltip: () => <LiquidTooltipLine key='liqRate' dataKey='liqRate' title={Prm.liqrate()} />
    },
    {
        key: 'oilTonnesRate',
        yAxisId: 'left',
        name: Prm.oilrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,
        order: 1,

        line: () => lineOil('left', 'oilTonnesRate', false, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='oilTonnesRate'
                title={Prm.oilrate()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === 'oilTonnesRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('oilTonnesRate')}
            />
        ),
        tooltip: () => <OilTooltipLine key='oilTonnesRate' dataKey='oilTonnesRate' title={Prm.oilrate()} />
    },
    {
        key: 'oilRate',
        yAxisId: 'left',
        name: Prm.oilrate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineOil('left', 'oilRate', true, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='oilRate'
                title={Prm.oilrate()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === 'oilRate', disabledLines)}
                dashed={true}
                onClick={() => onClick('oilRate')}
            />
        ),
        tooltip: () => <OilTooltipLine key='oilRate' dataKey='oilRate' title={Prm.oilrate()} />
    },
    {
        key: 'watercutVolumeMer',
        yAxisId: 'right',
        name: Prm.watercut(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineWatercut('right', 'watercutVolumeMer', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='watercutVolumeMer'
                title={Prm.watercut()}
                type={ChartParamEnum.Watercut}
                visible={!any(x => x === 'watercutVolumeMer', disabledLines)}
                dashed={false}
                onClick={() => onClick('watercutVolumeMer')}
            />
        ),
        tooltip: () => (
            <WatercutTooltipLine key='watercutVolumeMer' dataKey='watercutVolumeMer' title={Prm.watercut()} />
        )
    },
    {
        key: 'watercutVolumeDaily',
        yAxisId: 'right',
        name: Prm.watercut(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Oil,

        line: () => lineWatercut('right', 'watercutVolumeDaily', true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='watercutVolumeDaily'
                title={Prm.watercut()}
                type={ChartParamEnum.Watercut}
                visible={!any(x => x === 'watercutVolumeDaily', disabledLines)}
                dashed={true}
                onClick={() => onClick('watercutVolumeDaily')}
            />
        ),
        tooltip: () => (
            <WatercutTooltipLine key='watercutVolumeDaily' dataKey='watercutVolumeDaily' title={Prm.watercut()} />
        )
    },

    {
        key: 'injectionRate',
        yAxisId: 'left',
        name: Prm.injectionRate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Injection,
        order: 1,

        line: () => lineInjection('left', 'injectionRate', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='injectionRate'
                title={Prm.injectionRate()}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === 'injectionRate', disabledLines)}
                dashed={false}
                onClick={() => onClick('injectionRate')}
            />
        ),
        tooltip: () => <InjectionTooltipLine key='injectionRate' dataKey='injectionRate' title={Prm.injectionRate()} />
    },
    {
        key: 'intakeLiqrate',
        yAxisId: 'left',
        name: Prm.injectionRate(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Injection,

        line: () => lineInjection('left', 'intakeLiqrate', true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='intakeLiqrate'
                title={Prm.injectionRate()}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === 'intakeLiqrate', disabledLines)}
                dashed={true}
                onClick={() => onClick('intakeLiqrate')}
            />
        ),
        tooltip: () => <InjectionTooltipLine key='intakeLiqrate' dataKey='intakeLiqrate' title={Prm.injectionRate()} />
    },
    {
        key: 'pressureZabMer',
        yAxisId: 'right',
        name: Prm.pressureZab(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Injection,

        line: () => lineBottomHolePressure('right', 'pressureZabMer', false),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZabMer'
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZabMer', disabledLines)}
                dashed={false}
                onClick={() => onClick('pressureZabMer')}
            />
        ),
        tooltip: () => <PressureTooltipLine key='pressureZabMer' dataKey='pressureZabMer' title={Prm.pressureZab()} />
    },
    {
        key: 'pressureZabDaily',
        yAxisId: 'right',
        name: Prm.pressureZab(),
        type: ModeTypeEnum.Daily,
        wellType: WellTypeEnum.Injection,

        line: () => lineBottomHolePressure('right', 'pressureZabDaily', true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key='pressureZabDaily'
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === 'pressureZabDaily', disabledLines)}
                dashed={true}
                onClick={() => onClick('pressureZabDaily')}
            />
        ),
        tooltip: () => (
            <PressureTooltipLine key='pressureZabDaily' dataKey='pressureZabDaily' title={Prm.pressureZab()} />
        )
    }
];

export const stockBar = (): ColumnType => ({
    key: 'wellsInWork',
    yAxisId: 'stock',
    name: getLabel(ParamNameEnum.Stock),
    type: ModeTypeEnum.All,
    wellType: WellTypeEnum.Oil,

    line: () => null,
    legend: (disabledLines, onClick) => (
        <Parameter
            key='wellsInWork'
            title={getLabel(ParamNameEnum.Stock)}
            type={ChartParamEnum.Stock}
            visible={!any(x => x === 'wellsInWork', disabledLines)}
            dashed={false}
            onClick={() => onClick('wellsInWork')}
        />
    ),
    tooltip: () => <StockTooltipLine key='wellsInWork' dataKey='wellsInWork' title={getLabel(ParamNameEnum.Stock)} />
});
