import { color } from '@chakra-ui/react';
import { LithologyType } from 'common/entities/lithologyType';
import { SaturationType } from 'common/entities/saturationType';
import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import i18n from 'i18next';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletLithologyFill, TabletSaturationColor } from 'input/entities/tabletModel';
import { assoc, curry, map, propEq, when } from 'ramda';

import colors from '../../../../../theme/colors';
import * as Prm from '../../../helpers/parameters';

import dict from '../../../helpers/i18n/dictionary/main.json';

const defaultStrokeWidth = 1.5;
const defaultBoldStrokeWidth = 3;
const defaultStrokeGridWidth = 0.75;
const defaultFontSize = 24;

const defaultPerforationStep = 60;
const defaultColumnVerticalHeight = 150;
const defaultPackerMargin = 150;

const colorNone = 'none';
const colorBlack = 'black';
const colorWhite = 'white';
const colorBlue = 'blue';
const colorGray = 'gray';
const colorRed = 'red';
const colorGreen = 'green';
const colorPorosity = colors.colors.green;
const colorPermeability = '#808080';
const colorOilSaturation = '#800080';
export const colorAvgVolume = '#808000';
export const colorAvgTransmissibility = '#808080';
export const colorEffectiveInjection = colors.colors.lightblue;

const pathPacker = (w = 30, h = 50) => `M0 0 ${w} ${h} 0 ${h} ${w} 0 0 0 0 ${h} ${w} 0 ${w} ${h}`;

const pathNonHermeticPacker = (w = 20, h = 50) => `M0 0 ${w} ${h} 0 ${h} ${w} 0 0 0 0 ${h} ${w} 0 ${w} ${h}`;

const alter = curry((range, key, items) => map(when(propEq('dataKey', key), assoc('range', range)), items));

const alterScale = curry((scale, key, items) => map(when(propEq('dataKey', key), assoc('scale', scale)), items));

export const saturationColor: Array<TabletSaturationColor> = [
    { type: SaturationType.Oil, color: colors.colors.brown },
    { type: SaturationType.Water, color: colors.colors.blue },
    { type: SaturationType.Unknown, color: colors.control.grey500 },
    { type: SaturationType.UnclearCharacterInCollector, color: colors.control.grey500 },
    { type: SaturationType.OilPlusWater, color: colors.colors.green },
    { type: SaturationType.WaterPlusOil, color: colors.colors.blue },
    { type: SaturationType.Gas, color: colors.colors.yellow }
];

export const lithologyFill: Array<TabletLithologyFill> = [
    { type: LithologyType.LimestoneCarbonate, fill: '/images/tablet/limestone.svg' },
    { type: LithologyType.Sandstone, fill: '/images/tablet/sandstone.svg' },
    { type: LithologyType.Clay, fill: '/images/tablet/clay.png' }
];

export const inputColumns: TabletColumn[] = [
    {
        index: TabletColumnEnum.Object,
        label: i18n.t(dict.common.object),
        dataKey: 'productionObjectName',
        width: 40,
        background: colors.colors.lightyellow
    },
    {
        index: TabletColumnEnum.Plast,
        label: i18n.t(dict.common.plast),
        dataKey: 'plastName',
        width: 40,
        background: colors.bg.selected
    },
    {
        index: TabletColumnEnum.Depth,
        label: Prm.absDepth(),
        dataKey: 'absDepth',
        width: 70,
        background: colors.bg.grey100
    },
    {
        index: TabletColumnEnum.Saturation,
        label: Prm.saturation(),
        dataKey: 'saturation',
        width: 40,
        background: colors.bg.grey100
    },
    {
        index: TabletColumnEnum.Lithology,
        label: Prm.lithology(),
        dataKey: 'lithology',
        width: 40,
        background: colors.bg.grey100
    },
    {
        index: TabletColumnEnum.Perforation,
        label: Prm.perforation(),
        dataKey: 'perforation',
        width: 40,
        background: colors.bg.grey100
    },
    {
        index: TabletColumnEnum.HydraulicFracturing,
        label: i18n.t(dict.common.hydraulicFracturing),
        dataKey: 'hydraulicFracturing',
        width: 40
    },
    {
        index: TabletColumnEnum.Logging,
        label: i18n.t(dict.tablet.loggingTitle),
        dataKey: 'logging',
        width: 394,
        horizontal: true
    },
    {
        index: TabletColumnEnum.PackerHistory,
        label: i18n.t(dict.tablet.input.params.packer),
        dataKey: 'packer',
        width: 110,
        horizontal: true
    },

    {
        index: TabletColumnEnum.Porosity,
        label: i18n.t(dict.tablet.input.params.porosity),
        //label: 'Пористость,\n%',
        dataKey: 'porosity',
        width: 110,
        range: [0, 30],
        rangeStep: 6,
        horizontal: true
    },
    {
        index: TabletColumnEnum.Permeability,
        label: i18n.t(dict.tablet.input.params.permeability),
        //label: 'Проницае-\nмость, мД',
        dataKey: 'permeability',
        width: 110,
        range: [0, 100],
        rangeStep: 4,
        horizontal: true
    },
    {
        index: TabletColumnEnum.OilSaturation,
        label: i18n.t(dict.tablet.input.params.oilSaturation),
        //label: 'Нефтенасы-\nщенность, %',
        dataKey: 'oilSaturation',
        width: 110,
        range: [30, 90],
        rangeStep: 6,
        horizontal: true
    }
];

export const proxyColumns: TabletColumn[] = [
    {
        index: TabletColumnEnum.ProxyAvgVolume,
        label: i18n.t(dict.tablet.proxy.params.avgVolume),
        dataKey: 'avgVolume',
        width: 110,
        range: [0, 100],
        rangeStep: 4,
        horizontal: true,
        isProxy: true
    },
    {
        index: TabletColumnEnum.ProxyAvgTransmissibility,
        label: i18n.t(dict.tablet.proxy.params.avgTransmissibility),
        dataKey: 'avgTransmissibility',
        width: 110,
        range: [0, 100],
        rangeStep: 4,
        horizontal: true,
        isProxy: true
    },
    {
        index: TabletColumnEnum.ProxyRelLiqInje,
        label: i18n.t(dict.tablet.proxy.params.relLiqInje),
        dataKey: 'relLiqInje',
        width: 110,
        range: [0, 100],
        rangeStep: 4,
        horizontal: true,
        isProxy: true
    },
    {
        index: TabletColumnEnum.ProxyRelLiqInjeAccum,
        label: i18n.t(dict.tablet.proxy.params.relLiqInjeAccum),
        dataKey: 'relLiqInjeAccum',
        width: 110,
        range: [0, 100],
        rangeStep: 4,
        horizontal: true,
        isProxy: true
    },
    {
        index: TabletColumnEnum.ProxyEffectiveInjection,
        label: i18n.t(dict.tablet.proxy.params.effectiveInjection),
        dataKey: 'effectiveInjection',
        width: 110,
        range: [0, 1],
        rangeStep: 4,
        horizontal: true,
        isProxy: true
    }
];

export const efficiencyColumns: TabletColumn[] = [
    {
        index: TabletColumnEnum.EfficiencyAcidInjectionVolume,
        label: `${i18n.t(dict.tablet.efficiency.params.acidInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'acidInjectionVolume',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    },
    {
        index: TabletColumnEnum.EfficiencyEmulsionInjectionVolume,
        label: `${i18n.t(dict.tablet.efficiency.params.emulsionInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'emulsionInjectionVolume',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    },
    {
        index: TabletColumnEnum.EfficiencyPolyacrylamideInjectionVolume,
        label: `${i18n.t(dict.tablet.efficiency.params.polyacrylamideInjectionVolume)}, ${i18n.t(
            dict.common.units.m3
        )}`,
        dataKey: 'polyacrylamideInjectionVolume',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    },
    {
        index: TabletColumnEnum.EfficiencySlurryInjectionVolume,
        label: `${i18n.t(dict.tablet.efficiency.params.slurryInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'slurryInjectionVolume',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    },
    {
        index: TabletColumnEnum.EfficiencyCalciumchlorideInjectionVolume,
        label: `${i18n.t(dict.tablet.efficiency.params.calciumchlorideInjectionVolume)}, ${i18n.t(
            dict.common.units.m3
        )}`,
        dataKey: 'calciumchlorideInjectionVolume',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    },
    {
        index: TabletColumnEnum.EfficiencyReagentInjectionVolume,
        label: `${i18n.t(dict.tablet.efficiency.params.reagentInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'reagentInjectionVolume',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    },
    {
        index: TabletColumnEnum.EfficiencyOilMonth,
        label: `${i18n.t(dict.tablet.efficiency.params.effectiveOilMonth)}, ${i18n.t(
            dict.common.units.tonsAccumulated
        )}`,
        dataKey: 'effectiveOilMonth',
        width: 70,
        range: [0, 1000],
        horizontal: true,
        isEfficiency: true
    }
];
