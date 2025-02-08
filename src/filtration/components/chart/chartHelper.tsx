import React from 'react';

import { any } from 'ramda';

import { ColumnType } from '../../../common/components/chart';
import { Parameter } from '../../../common/components/charts/legends/parameter';
import {
    lineBottomHolePressure,
    lineBottomHolePressureDotted,
    lineInjection,
    lineInjectionDotted,
    lineLiquid,
    lineLiquidDotted,
    lineOil,
    lineWatercut,
    lineWatercutDotted
} from '../../../common/components/charts/lines';
import {
    InjectionTooltipLine,
    LiquidTooltipLine,
    OilTooltipLine,
    PressureTooltipLine,
    WatercutTooltipLine
} from '../../../common/components/charts/tooltips/nameValueTooltip';
import { ChartParamEnum } from '../../../common/enums/chartParamEnum';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import * as Prm from '../../../common/helpers/parameters';
import { nul } from '../../../common/helpers/ramda';
import { InputParamEnum } from '../../enums/inputParamEnum';

export const inputParams: ColumnType[] = [
    {
        yAxisId: 'left',
        key: InputParamEnum.LiquidVolumeRate,
        name: Prm.liqrate(),
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquid('left', InputParamEnum.LiquidVolumeRate, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key={InputParamEnum.LiquidVolumeRate}
                title={Prm.liqrate()}
                type={ChartParamEnum.Liquid}
                visible={!any(x => x === InputParamEnum.LiquidVolumeRate, disabledLines)}
                dashed={true}
                onClick={() => onClick(InputParamEnum.LiquidVolumeRate)}
            />
        ),
        tooltip: () => (
            <LiquidTooltipLine
                key={InputParamEnum.LiquidVolumeRate}
                dataKey={InputParamEnum.LiquidVolumeRate}
                title={Prm.liqrate()}
            />
        )
    },
    {
        yAxisId: 'left',
        key: InputParamEnum.LiquidVolumeRateOld,
        name: Prm.liqrate(),
        wellType: WellTypeEnum.Oil,

        line: () => lineLiquidDotted('left', InputParamEnum.LiquidVolumeRateOld),
        legend: nul,
        tooltip: nul
    },

    {
        yAxisId: 'left',
        key: InputParamEnum.OilTonnesRate,
        name: Prm.oilrate(),
        wellType: WellTypeEnum.Oil,
        order: 1,

        line: () => lineOil('left', InputParamEnum.OilTonnesRate, true, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key={InputParamEnum.OilTonnesRate}
                title={Prm.oilrate()}
                type={ChartParamEnum.Oil}
                visible={!any(x => x === InputParamEnum.OilTonnesRate, disabledLines)}
                dashed={true}
                onClick={() => onClick(InputParamEnum.OilTonnesRate)}
            />
        ),
        tooltip: () => (
            <OilTooltipLine
                key={InputParamEnum.OilTonnesRate}
                dataKey={InputParamEnum.OilTonnesRate}
                title={Prm.oilrate()}
            />
        )
    },

    {
        yAxisId: 'right',
        key: InputParamEnum.WatercutVolume,
        name: Prm.watercut(),
        wellType: WellTypeEnum.Oil,

        line: () => lineWatercut('right', InputParamEnum.WatercutVolume, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key={InputParamEnum.WatercutVolume}
                title={Prm.watercut()}
                type={ChartParamEnum.Watercut}
                visible={!any(x => x === InputParamEnum.WatercutVolume, disabledLines)}
                dashed={true}
                onClick={() => onClick(InputParamEnum.WatercutVolume)}
            />
        ),
        tooltip: () => (
            <WatercutTooltipLine
                key={InputParamEnum.WatercutVolume}
                dataKey={InputParamEnum.WatercutVolume}
                title={Prm.watercut()}
            />
        )
    },
    {
        yAxisId: 'right',
        key: InputParamEnum.WatercutVolumeOld,
        name: Prm.watercut(),
        wellType: WellTypeEnum.Oil,

        line: () => lineWatercutDotted('right', InputParamEnum.WatercutVolumeOld),
        legend: nul,
        tooltip: nul
    },

    {
        yAxisId: 'right',
        key: InputParamEnum.BottomHolePressure,
        name: Prm.pressureZab(),
        wellType: WellTypeEnum.Oil,

        line: () => lineBottomHolePressure('right', InputParamEnum.BottomHolePressure, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key={InputParamEnum.BottomHolePressure}
                title={Prm.pressureZab()}
                type={ChartParamEnum.BottomHolePressure}
                visible={!any(x => x === InputParamEnum.BottomHolePressure, disabledLines)}
                dashed={true}
                onClick={() => onClick(InputParamEnum.BottomHolePressure)}
            />
        ),
        tooltip: () => (
            <PressureTooltipLine
                key={InputParamEnum.BottomHolePressure}
                dataKey={InputParamEnum.BottomHolePressure}
                title={Prm.pressureZab()}
            />
        )
    },
    {
        yAxisId: 'right',
        key: InputParamEnum.BottomHolePressureOld,
        name: Prm.pressureZab(),
        wellType: WellTypeEnum.Oil,

        line: () => lineBottomHolePressureDotted('right', InputParamEnum.BottomHolePressureOld),
        legend: nul,
        tooltip: nul
    },

    {
        yAxisId: 'left',
        key: InputParamEnum.InjectionRate,
        name: Prm.injectionRate(),
        wellType: WellTypeEnum.Injection,
        order: 1,

        line: () => lineInjection('left', InputParamEnum.InjectionRate, true),
        legend: (disabledLines, onClick) => (
            <Parameter
                key={InputParamEnum.InjectionRate}
                title={Prm.injectionRate()}
                type={ChartParamEnum.InjectionRate}
                visible={!any(x => x === InputParamEnum.InjectionRate, disabledLines)}
                dashed={true}
                onClick={() => onClick(InputParamEnum.InjectionRate)}
            />
        ),
        tooltip: () => (
            <InjectionTooltipLine
                key={InputParamEnum.InjectionRate}
                dataKey={InputParamEnum.InjectionRate}
                title={Prm.injectionRate()}
            />
        )
    },
    {
        yAxisId: 'left',
        key: InputParamEnum.InjectionRateOld,
        name: Prm.injectionRate(),
        wellType: WellTypeEnum.Injection,
        order: 1,

        line: () => lineInjectionDotted('left', InputParamEnum.InjectionRateOld),
        legend: nul,
        tooltip: nul
    },
    // {
    //     yAxisId: 'right',
    //     key: InputParamEnum.BottomHolePressure,
    //     name: Prm.pressureZab(),
    //     wellType: WellTypeEnum.Injection,

    //     line: () => lineBottomHolePressure('right', InputParamEnum.BottomHolePressure, true),
    //     legend: (disabledLines, onClick) => (
    //         <Parameter
    //             key={`${InputParamEnum.BottomHolePressure}Inj`}
    //             title={Prm.pressureZab()}
    //             type={ChartParamEnum.BottomHolePressure}
    //             visible={!any(x => x === InputParamEnum.BottomHolePressure, disabledLines)}
    //             dashed={true}
    //             onClick={() => onClick(InputParamEnum.BottomHolePressure)}
    //         />
    //     ),
    //     tooltip: () => (
    //         <PressureTooltipLine
    //             key={`${InputParamEnum.BottomHolePressure}Inj`}
    //             dataKey={InputParamEnum.BottomHolePressure}
    //             title={Prm.pressureZab()}
    //         />
    //     )
    // },
    {
        yAxisId: 'right',
        key: InputParamEnum.BottomHolePressureOld,
        name: Prm.pressureZab(),
        wellType: WellTypeEnum.Injection,

        line: () => lineBottomHolePressureDotted('right', InputParamEnum.BottomHolePressureOld),
        legend: nul,
        tooltip: nul
    }
];
