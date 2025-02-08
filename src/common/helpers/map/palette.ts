import { find } from 'ramda';

import colors from '../../../../theme/colors';
import { GridMapEnum } from '../../enums/gridMapEnum';

export const inputPalette = [
    { key: GridMapEnum.Power, colors: ['#7dbeff', '#cafdff', '#b3ffb5', '#fcffbe', '#ffbfbf'] },
    { key: GridMapEnum.Porosity, colors: ['#fafff4', '#ebffd7', '#bbff77', '#c7ce00'] },
    { key: GridMapEnum.Permeability, colors: ['#fffffd', '#fffff0', '#ffffca', '#fbfb00'] },
    { key: GridMapEnum.OilSaturation, colors: ['#fff9fc', '#fff9fc', '#ffd7eb', '#ffd7eb', '#ff97cb', '#ff93c9'] },
    {
        key: GridMapEnum.TopAbs,
        colors: ['#ffdfff', '#ffdfff', '#ffd9da', '#ffd9d9', '#fffbc1', '#fffafa', '#fff4ff']
    },
    {
        key: GridMapEnum.BottomAbs,
        colors: ['#ffdfff', '#ffdfff', '#ffd9da', '#ffd9d9', '#fffbc1', '#fffafa', '#fff4ff']
    },
    { key: GridMapEnum.PressureZab, colors: ['#b2ffd1', '#7fffb1', '#4cff92', '#19ff73', '#00ff5a'] },
    { key: GridMapEnum.CurrentPower, colors: ['#fffacc', '#fff066', '#ffe600', '#ffd200', '#ffd200'] },
    { key: GridMapEnum.SWL, colors: ['#B5EEFF', '#00C7FF', '#00A5FF', '#006EFF', '#0019FF'] },
    { key: GridMapEnum.SWLAdaptation, colors: ['#B5EEFF', '#00C7FF', '#00A5FF', '#006EFF', '#0019FF'] },
    { key: GridMapEnum.SWCR, colors: ['#B5EEFF', '#00C7FF', '#00A5FF', '#006EFF', '#0019FF'] },
    { key: GridMapEnum.SOWCR, colors: ['#fff9fc', '#fff9fc', '#ffd7eb', '#ffd7eb', '#ff97cb', '#ff93c9'] },
    { key: GridMapEnum.SOWCRAdaptation, colors: ['#fff9fc', '#fff9fc', '#ffd7eb', '#ffd7eb', '#ff97cb', '#ff93c9'] },
    {
        key: GridMapEnum.InitialTransmissibilityBeforeAdaptation,
        colors: ['#fafff4', '#ebffd7', '#bbff77', '#c7ce00']
    },
    {
        key: GridMapEnum.InitialTransmissibilityAfterAdaptation,
        colors: ['#fafff4', '#ebffd7', '#bbff77', '#c7ce00']
    },
    { key: GridMapEnum.Pressure, colors: ['#b2ffd1', '#7fffb1', '#4cff92', '#19ff73', '#00ff5a'] },
    { key: GridMapEnum.VolumeWaterCut, colors: ['#7dbeff', '#cafdff', '#b3ffb5', '#fcffbe', '#ffbfbf'] },
    {
        key: GridMapEnum.InitialInterwellVolumeBeforeAdaptation,
        colors: ['#fafff4', '#ebffd7', '#bbff77', '#c7ce00']
    },
    {
        key: GridMapEnum.InitialInterwellVolumeAfterAdaptation,
        colors: ['#fafff4', '#ebffd7', '#bbff77', '#c7ce00']
    },
    {
        key: GridMapEnum.LiqRateVariation,
        colors: ['#FFF', colors.paramColors.liquid]
    },
    {
        key: GridMapEnum.OilRateVariation,
        colors: ['#FFF', colors.paramColors.oil]
    },
    {
        key: GridMapEnum.VolumeWaterCutVariation,
        colors: ['#FFF', colors.paramColors.watercut]
    },
    {
        key: GridMapEnum.InjectionRateVariation,
        colors: ['#FFF', colors.paramColors.injection]
    },
    {
        key: GridMapEnum.PressureZabVariation,
        colors: ['#b2ffd1', '#7fffb1', '#4cff92', '#19ff73', '#00ff5a']
    },
    {
        key: GridMapEnum.MultiplePressureLiqRate,
        colors: ['#FFF', colors.paramColors.liquid]
    },
    {
        key: GridMapEnum.CurrentOilSaturatedThickness,
        colors: ['#7dbeff', '#cafdff', '#b3ffb5', '#fcffbe', '#ffbfbf']
    },
    {
        key: GridMapEnum.CurrentKH,
        colors: ['#fffffd', '#fffff0', '#ffffca', '#fbfb00']
    },
    {
        key: GridMapEnum.CurrentK,
        colors: ['#fffffd', '#fffff0', '#ffffca', '#fbfb00']
    },
    {
        key: GridMapEnum.SkinFactor,
        colors: ['#FFF', colors.colors.ligthGrey, colors.colors.grey]
    },
    {
        key: GridMapEnum.InitialSaturationAdaptation,
        colors: ['#fff9fc', '#fff9fc', '#ffd7eb', '#ffd7eb', '#ff97cb', '#ff93c9']
    }
];

export const paletteByKey = (key: GridMapEnum): string[] => find(it => it.key === key, inputPalette)?.colors;
