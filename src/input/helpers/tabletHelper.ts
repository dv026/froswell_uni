import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import i18n from 'i18next';
import * as R from 'ramda';

import { LithologyType } from '../../common/entities/lithologyType';
import { SaturationType } from '../../common/entities/saturationType';
import { ddmmyyyy } from '../../common/helpers/date';
import { round0, round1 } from '../../common/helpers/math';
import { TabletColumn } from '../entities/tabletColumn';
import { TabletDownholeHistory, TabletModel, TabletResearchInflowProfile } from '../entities/tabletModel';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';
import { getDownholeLabel } from 'input/enums/downholeType';

// const data: Array<TabletModel> = [
//   { id: 37, top: 1858.7, bottom: 1859.4, topAbs: 1045.5, bottomAbs: 1045.8, porosity: 13.9, oilSaturation: 83.8, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 38, top: 1859.4, bottom: 1860.8, topAbs: 1045.8, bottomAbs: 1046.5, porosity: 17.4, oilSaturation: 88	,  permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 39, top: 1860.8, bottom: 1862	,  topAbs: 1046.5, bottomAbs: 1047.1, porosity: 20.7, oilSaturation: 84.5, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 40, top: 1862	,  bottom: 1863.3, topAbs: 1047.1, bottomAbs: 1047.7, porosity: 19.1, oilSaturation: 83.5, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 41, top: 1863.3, bottom: 1864.1, topAbs: 1047.7, bottomAbs: 1048.1, porosity: 23.2, oilSaturation: 85.8, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 42, top: 1864.1, bottom: 1865.1, topAbs: 1048.1, bottomAbs: 1048.6, porosity: 20.2, oilSaturation: 84.7, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 43, top: 1874.7, bottom: 1875.3, topAbs: 1053.3, bottomAbs: 1053.6, porosity: 15.8, oilSaturation: 75.4, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 44, top: 1875.3, bottom: 1876.5, topAbs: 1053.6, bottomAbs: 1054.1, porosity: 16.3, oilSaturation: 77	,  permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 45, top: 1876.5, bottom: 1877.2, topAbs: 1054.1, bottomAbs: 1054.5, porosity: 18.4, oilSaturation: 68.1, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 1, lithologyId: 1 },
//   { id: 46, top: 1877.2, bottom: 1877.9, topAbs: 1054.5, bottomAbs: 1054.8, porosity: 16.5, oilSaturation: 59.1, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 7, lithologyId: 1 },
//   { id: 47, top: 1884.4, bottom: 1885.1, topAbs: 1057.9, bottomAbs: 1058.3, porosity: 8	  , oilSaturation: 54.5, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 5, lithologyId: 1 },
//   { id: 48, top: 1885.1, bottom: 1886	,  topAbs: 1058.3, bottomAbs: 1058.7, porosity: 8.1	, oilSaturation: 59.2, permeability: 88.57, wellId: 100609, plastId: 1, saturationTypeId: 5, lithologyId: 1 },
//   { id: 49, top: 1891.2, bottom: 1892	,  topAbs: 1061.2, bottomAbs: 1061.6, porosity: 16.5, oilSaturation: 76.2, permeability: 20	 ,  wellId: 100609, plastId: 3, saturationTypeId: 1, lithologyId: 1 },
//   { id: 50, top: 1898.4, bottom: 1898.9, topAbs: 1064.7, bottomAbs: 1064.9, porosity: 6.1	, oilSaturation: 72.1, permeability: 20	 ,  wellId: 100609, plastId: 3, saturationTypeId: 1, lithologyId: 1 },
//   { id: 51, top: 1900	,  bottom: 1900.5, topAbs: 1065.4, bottomAbs: 1065.7, porosity: 7.9	, oilSaturation: 85.8, permeability: 20	 ,  wellId: 100609, plastId: 3, saturationTypeId: 1, lithologyId: 1 },
//   { id: 52, top: 1900.5, bottom: 1901.3, topAbs: 1065.7, bottomAbs: 1066.1, porosity: 14	, oilSaturation: 89.8, permeability: 20	 ,  wellId: 100609, plastId: 3, saturationTypeId: 1, lithologyId: 1 },
// ];

// const perforationData: Array<TabletPerforation> = [
//   { id: 5,  dt: new Date('2018-09-28 00:00:00.000'), top: 1770.6, bottom: 1771.6, topAbs: 1050.9, bottomAbs: 1051.5, closingDate: new Date('2018-08-02 00:00:00.000'), wellId: 100604 },
//   { id: 12, dt: new Date('2018-08-29 00:00:00.000'), top: 1772.6, bottom: 1773.6, topAbs: 1052.9, bottomAbs: 1053.5, closingDate: null, wellId: 100604 },
//   { id: 13, dt: new Date('2018-08-29 00:00:00.000'), top: 1778.1, bottom: 1779.6, topAbs: 1056.2, bottomAbs: 1057.2, closingDate: null, wellId: 100604 },
//   { id: 14, dt: new Date('2018-08-29 00:00:00.000'), top: 1781.6, bottom: 1782.2, topAbs: 1058.4, bottomAbs: 1058.7, closingDate: null, wellId: 100604 },
//   { id: 15, dt: new Date('2018-08-29 00:00:00.000'), top: 1783.7, bottom: 1784.5, topAbs: 1059.7, bottomAbs: 1060.2, closingDate: null, wellId: 100604 },
// ];

type Measure = 'topAbs' | 'bottomAbs';

export const descBy = (propName: Measure): (<T>(a: Record<Measure, T>, b: Record<Measure, T>) => number) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    R.descend(R.prop(propName));
export const ascBy = (propName: Measure): (<T>(a: Record<Measure, T>, b: Record<Measure, T>) => number) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    R.ascend<>(R.prop(propName));

export const getExtremum = (
    comparator: (propName: Measure) => (a: TabletModel, b: TabletModel) => number,
    propName: Measure,
    plasts: TabletModel[]
): { [index: string]: number } =>
    R.pipe(
        x => R.filter<TabletModel>(x => !!x.plastName)(x),
        R.groupBy<TabletModel>(x => x.plastName.toString()),
        grouped => R.mapObjIndexed(x => getValue(comparator(propName), propName, x), grouped)
    )(plasts);

// todo mb
export const getExtremumByObject = (
    comparator: (propName: Measure) => (a: TabletModel, b: TabletModel) => number,
    propName: Measure,
    plasts: TabletModel[]
): { [index: string]: number } =>
    R.pipe(
        x => R.filter<TabletModel>(x => !!x.productionObjectName)(x),
        R.groupBy<TabletModel>(x => x.productionObjectName.toString()),
        grouped => R.mapObjIndexed(x => getValue(comparator(propName), propName, x), grouped)
    )(plasts);

export const getValue = (
    comparator: (a: TabletModel, b: TabletModel) => number,
    propName: Measure,
    list: TabletModel[]
): number => R.pipe(R.sort<TabletModel>(comparator), x => x[0], R.prop(propName))(list);

export const colorScale = scaleOrdinal(schemeCategory10);
export const widthScale = (column: TabletColumn, value: number): number => {
    let res = scaleLinear().domain(column.range).range([0, column.width])(
        value > column.range[1] ? column.range[1] : value
    );
    return res < 0 ? 0 : res;
};

export const getLithologyName = (type: LithologyType): string => {
    switch (type) {
        case LithologyType.LimestoneCarbonate:
            return i18n.t(mainDict.tablet.lithology.limestoneCarbonate);
        case LithologyType.Sandstone:
            return i18n.t(mainDict.tablet.lithology.sandstone);
        case LithologyType.Clay:
            return i18n.t(mainDict.tablet.lithology.clay);
        case LithologyType.ClaySandstone:
            return i18n.t(mainDict.tablet.lithology.claySandstone);
        default:
            return '';
    }
};

export const getSaturationName = (type: SaturationType): string => {
    switch (type) {
        case SaturationType.Oil:
            return i18n.t(mainDict.tablet.saturation.oil);
        case SaturationType.Gas:
            return i18n.t(mainDict.tablet.saturation.gas);
        case SaturationType.Water:
            return i18n.t(mainDict.tablet.saturation.water);
        case SaturationType.Unknown:
            return i18n.t(mainDict.tablet.saturation.unknown);
        case SaturationType.UnclearCharacterInCollector:
            return i18n.t(mainDict.tablet.saturation.unclearСharacterInCollector);
        case SaturationType.OilPlusWater:
            return i18n.t(mainDict.tablet.saturation.oilPlusWater);
        case SaturationType.WaterPlusOil:
            return i18n.t(mainDict.tablet.saturation.waterPlusOil);
        case SaturationType.Irrigation:
            return i18n.t(mainDict.tablet.saturation.irrigation);
        case SaturationType.FreshwaterIrrigation:
            return i18n.t(mainDict.tablet.saturation.freshwaterIrrigation);
        case SaturationType.NoInflow:
            return i18n.t(mainDict.tablet.saturation.noInflow);
        default:
            return '';
    }
};

export const tooltipLabelNumberParameter = (column: TabletColumn, value: number): string[] => [
    `${column.label.replace('\n', '')}: ${Math.round(value * 100) / 100}`
];

export const tooltipLabelStringParameter = (column: TabletColumn, value: string): string[] => [
    `${column.label.replace('\n', '')}: ${value}`
];

export const tooltipHydraulicFracturingParameter = (value: string): string[] => [
    `${value}`
];

export const tooltipLabelSaturationParameter = (column: TabletColumn, obj: TabletModel): string => {
    return R.join('|', [
        `${i18n.t(mainDict.tablet.objectPlast)}: ${
            obj.productionObjectName && obj.plastName
                ? `${obj.productionObjectName}/${obj.plastName}`
                : i18n.t(mainDict.common.nodata)
        }`,
        `H_start(abs/md): ${round1(obj.topAbs)}/${round1(obj.top)}`,
        `H_stop(abs/md): ${round1(obj.bottomAbs)}/${round1(obj.bottom)}`,
        `${i18n.t(mainDict.tablet.lithologyName)}: ${getLithologyName(obj.lithologyId)}`,
        tooltipLabelStringParameter(column, getSaturationName(obj.saturationTypeId))
    ]);
};

export const tooltipLabelLithologyParameter = (column: TabletColumn, value: LithologyType): string => 
    `${column.label}: ${getLithologyName(value)}`
;

export const tooltipLabelResearchParameter = (column: TabletColumn, it: TabletResearchInflowProfile): string =>
    R.join('|', [
        `${i18n.t(mainDict.tablet.research)}: ${ddmmyyyy(new Date(it.dt))}`,
        `${i18n.t(mainDict.tablet.researchInflowProfile)}: ${round0(it.value)}%`,
        `${i18n.t(mainDict.common.params.saturation)}: ${getSaturationName(it.saturationTypeId)}`
    ]);

export const tooltipLabelDownholeParameter = (column: TabletColumn, it: TabletDownholeHistory): string =>
    R.join('|', [
        `${ddmmyyyy(new Date(it.dt))} / ${round0(it.depth)}${i18n.t(mainDict.common.units.meter)} / ${getDownholeLabel(it.downholeType)}`,
    ]);