import React, { Fragment } from 'react';

import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import * as d3 from 'd3';
import { scaleLinear, ScaleLinear, scaleLog } from 'd3-scale';
import i18n from 'i18next';
import { DownholeType, getDownholeBriefLabel } from 'input/enums/downholeType';
import {
    assoc,
    cond,
    curry,
    equals,
    filter,
    find,
    flatten,
    forEach,
    forEachObjIndexed,
    groupBy,
    includes,
    isNil,
    map,
    mapObjIndexed,
    mean,
    propEq,
    reject,
    sortBy,
    sum,
    T,
    toPairs,
    uniq,
    when
} from 'ramda';

import colors from '../../../theme/colors';
import { ValuesRange } from '../../common/components/valuesRange';
import { ValuesRangeD3 } from '../../common/components/valuesRangeD3';
import { Point } from '../../common/entities/canvas/point';
import { LithologyType } from '../../common/entities/lithologyType';
import { SaturationType } from '../../common/entities/saturationType';
import { ddmmyyyy, yyyymmdd } from '../../common/helpers/date';
import { path } from '../../common/helpers/map/sizeResolver';
import { max, min, round0, round1 } from '../../common/helpers/math';
import * as Prm from '../../common/helpers/parameters';
import { groupByProp, isNullOrEmpty, mapIndexed, nul } from '../../common/helpers/ramda';
import { LoggingSettingModel } from '../entities/loggingSettingModel';
import { TabletColumn } from '../entities/tabletColumn';
import { ProxyTabletModel, TabletEfficiencyModel } from '../entities/tabletDataModel';
import { TabletLoggingChart } from '../entities/tabletLoggingChart';
import {
    TabletSaturationColor,
    TabletModel,
    TabletPerforation,
    TabletLithologyFill,
    TabletLogging,
    TabletTrajectory,
    TabletResearchInflowProfile,
    TabletPackerHistory,
    TabletDownholeHistory
} from '../entities/tabletModel';
import { PackerPumpType } from '../enums/packerPumpType';
import { WellLoggingEnum } from '../enums/wellLoggingEnum';
import {
    tinyCali,
    tinyGr,
    tinyGz3,
    tinyIld,
    tinyLld,
    tinyNeut,
    tinyRhob,
    tinySonic,
    tinySp
} from '../helpers/parameters';
import {
    ascBy,
    descBy,
    getExtremum,
    getExtremumByObject,
    tooltipHydraulicFracturingParameter,
    tooltipLabelDownholeParameter,
    tooltipLabelLithologyParameter,
    tooltipLabelNumberParameter,
    tooltipLabelResearchParameter,
    tooltipLabelSaturationParameter,
    tooltipLabelStringParameter,
    widthScale
} from '../helpers/tabletHelper';
import { defaultHeaderHeight, defaultTabletMargin, defaultTabletStep } from './tablet';

import dict from '../../common/helpers/i18n/dictionary/main.json';

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
const colorPorosity = '#808000';
const colorPermeability = '#808080';
const colorOilSaturation = '#800080';
const colorAvgVolume = '#808000';
const colorAvgTransmissibility = '#808080';
const colorEffectiveInjection = colors.colors.lightblue;

const pathPacker = (w = 30, h = 50) => `M0 0 ${w} ${h} 0 ${h} ${w} 0 0 0 0 ${h} ${w} 0 ${w} ${h}`;

const pathNonHermeticPacker = (w = 20, h = 50) => `M0 0 ${w} ${h} 0 ${h} ${w} 0 0 0 0 ${h} ${w} 0 ${w} ${h}`;

const alter = curry((range, key, items) => map(when(propEq('dataKey', key), assoc('range', range)), items));

const alterScale = curry((scale, key, items) => map(when(propEq('dataKey', key), assoc('scale', scale)), items));

const saturationColor: Array<TabletSaturationColor> = [
    { type: SaturationType.Oil, color: '#A25F2A' },
    { type: SaturationType.Water, color: '#4682B4' },
    { type: SaturationType.Unknown, color: 'gray' },
    { type: SaturationType.UnclearCharacterInCollector, color: 'gray' },
    { type: SaturationType.OilPlusWater, color: '#CCFF99' },
    { type: SaturationType.WaterPlusOil, color: '#7FD4FF' }
];

const lithologyFill: Array<TabletLithologyFill> = [
    { type: LithologyType.LimestoneCarbonate, fill: 'url(#lithology1)' },
    { type: LithologyType.Sandstone, fill: 'url(#lithology2)' },
    { type: LithologyType.Clay, fill: 'url(#lithology3)' }
];

const inputColumns = [
    { index: 1, label: i18n.t(dict.common.object), dataKey: 'productionObjectName', width: 50 },
    { index: 2, label: i18n.t(dict.common.plast), dataKey: 'plastName', width: 50 },
    { index: 3, label: Prm.absDepth(), dataKey: 'absDepth', width: 100 },
    { index: 4, label: Prm.saturation(), dataKey: 'saturation', width: 50 },
    { index: 5, label: Prm.perforation(), dataKey: 'perforation', width: 500, horizontal: true },
    { index: 6, label: i18n.t(dict.tablet.packerHistory), dataKey: 'packer', width: 150 },
    { index: 7, label: Prm.lithology(), dataKey: 'lithology', width: 150 },
    {
        index: 8,
        label: Prm.porosity(),
        dataKey: 'porosity',
        width: 150,
        range: [0, 30],
        rangeStep: 6
    },
    {
        index: 9,
        label: Prm.permeability(),
        dataKey: 'permeability',
        width: 150,
        range: [0, 100],
        rangeStep: 4
    },
    {
        index: 10,
        label: Prm.oilSaturation(),
        dataKey: 'oilSaturation',
        width: 150,
        range: [30, 90],
        rangeStep: 6
    }
];

const proxyColumns = [
    {
        index: 11,
        label: i18n.t(dict.tablet.proxy.params.avgVolume),
        dataKey: 'avgVolume',
        width: 150,
        range: [0, 100],
        rangeStep: 4,
        isProxy: true
    },
    {
        index: 12,
        label: i18n.t(dict.tablet.proxy.params.avgTransmissibility),
        dataKey: 'avgTransmissibility',
        width: 150,
        range: [0, 100],
        rangeStep: 4,
        isProxy: true
    },
    {
        index: 13,
        label: i18n.t(dict.tablet.proxy.params.relLiqInje),
        dataKey: 'relLiqInje',
        width: 150,
        range: [0, 100],
        rangeStep: 4,
        isProxy: true
    },
    {
        index: 14,
        label: i18n.t(dict.tablet.proxy.params.relLiqInjeAccum),
        dataKey: 'relLiqInjeAccum',
        width: 150,
        range: [0, 100],
        rangeStep: 4,
        isProxy: true
    },
    {
        index: 15,
        label: i18n.t(dict.tablet.proxy.params.effectiveInjection),
        dataKey: 'effectiveInjection',
        width: 150,
        range: [0, 1],
        rangeStep: 4,
        isProxy: true
    }
];

const efficiencyColumns = [
    {
        index: 16,
        label: `${i18n.t(dict.tablet.efficiency.params.acidInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'acidInjectionVolume',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    },
    {
        index: 17,
        label: `${i18n.t(dict.tablet.efficiency.params.emulsionInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'emulsionInjectionVolume',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    },
    {
        index: 18,
        label: `${i18n.t(dict.tablet.efficiency.params.polyacrylamideInjectionVolume)}, ${i18n.t(
            dict.common.units.m3
        )}`,
        dataKey: 'polyacrylamideInjectionVolume',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    },
    {
        index: 19,
        label: `${i18n.t(dict.tablet.efficiency.params.slurryInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'slurryInjectionVolume',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    },
    {
        index: 20,
        label: `${i18n.t(dict.tablet.efficiency.params.calciumchlorideInjectionVolume)}, ${i18n.t(
            dict.common.units.m3
        )}`,
        dataKey: 'calciumchlorideInjectionVolume',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    },
    {
        index: 21,
        label: `${i18n.t(dict.tablet.efficiency.params.reagentInjectionVolume)}, ${i18n.t(dict.common.units.m3)}`,
        dataKey: 'reagentInjectionVolume',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    },
    {
        index: 22,
        label: `${i18n.t(dict.tablet.efficiency.params.effectiveOilMonth)}, ${i18n.t(
            dict.common.units.tonsAccumulated
        )}`,
        dataKey: 'effectiveOilMonth',
        width: 100,
        range: [0, 1000],
        isEfficiency: true
    }
];

export const getColumns = (
    data: TabletModel[] = null,
    packerHistory: TabletPackerHistory[] = null,
    downholeHistory: TabletDownholeHistory[] = null,
    proxyData: ProxyTabletModel[] = null
): Array<TabletColumn> => {
    let maxPermeability = 1000;

    let input = inputColumns;
    let proxy = proxyColumns;

    if (!isNullOrEmpty(data)) {
        const permeabilities = map(it => it.permeability, data);

        maxPermeability = Math.round(max(permeabilities) * 1.15) || maxPermeability;

        input = alter([0, maxPermeability], 'permeability', input);
    }

    if (isNullOrEmpty(packerHistory) && isNullOrEmpty(downholeHistory)) {
        input = reject((it: TabletColumn) => it.dataKey === 'packer', input);
    }

    if (!isNullOrEmpty(proxyData)) {
        const maxVolume = Math.round(max(map(it => it.avgVolume, proxyData)) * 1.15) || 1000;
        const maxTransmissibility = Math.round(max(map(it => it.avgTransmissibility, proxyData)) * 1.15) || 1000;

        proxy = alter([0, maxVolume], 'avgVolume', proxy);
        proxy = alter([0, maxTransmissibility], 'avgTransmissibility', proxy);

        if (!max(map(it => it.effectiveInjection, proxyData))) {
            proxy = reject((it: TabletColumn) => it.dataKey === 'effectiveInjection', proxy);
        }

        return flatten([input, proxy]);
    }

    return input;
};

export const efficiencyColumnWidth = (efficiencyData: TabletEfficiencyModel[]): number => {
    if (isNullOrEmpty(efficiencyData ?? [])) {
        return 0;
    }

    let width = 0;

    forEachObjIndexed(group => {
        forEach((column: TabletColumn) => {
            if (max(map(it => it[column.dataKey], group))) {
                width += column.width;
            }
        }, efficiencyColumns);
    }, groupByProp('operationName', efficiencyData));

    return width;
};

export const getLoggingChart = (data: TabletLogging[]): Array<TabletLoggingChart> => {
    if (isNullOrEmpty(data)) {
        return null;
    }

    let loggingSettings = [];

    const savedValue = localStorage.getItem('logging_storage');
    if (savedValue !== null) {
        loggingSettings = JSON.parse(savedValue) as LoggingSettingModel[];
    }

    const neut = map(it => it.neut, data);
    const gr = map(it => it.gr, data);
    const sp = map(it => it.sp, data);
    const gz3 = map(it => it.gz3, data);
    const lld = reject(
        x => x <= 0,
        map(it => it.lld, data)
    );
    const ild = reject(
        x => x <= 0,
        map(it => it.ild, data)
    );
    const cali = map(it => it.cali, data);
    const sonic = map(it => it.sonic, data);
    const rhob = map(it => it.rhob, data);

    const maxOffset = 1.15;
    const defaultRange = [0, 500];

    const getRange = (arr: number[], storageValue: number) =>
        min(arr) === max(arr)
            ? [0, 1]
            : [Math.floor(min(arr)), storageValue ? storageValue : Math.ceil(max(arr) * maxOffset)];

    const getLogRange = (arr: number[], storageValue: number) =>
        min(arr) === max(arr) ? [0.1, 1] : [min(arr), storageValue ? storageValue : max(arr)];

    return [
        {
            index: WellLoggingEnum.NEUT,
            label: tinyNeut(),
            dataKey: 'neut',
            scale: scaleLinear()
                .domain(
                    getRange(
                        neut,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.NEUT, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.bg.black,
            strokeWidth: 3,
            scaleStep: 0.5
        },
        {
            index: WellLoggingEnum.GR,
            label: tinyGr(),
            dataKey: 'gr',
            scale: scaleLinear()
                .domain(
                    getRange(
                        gr,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.GR, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.red,
            strokeWidth: 3,
            scaleStep: 0.5
        },
        {
            index: WellLoggingEnum.SP,
            label: tinySp(),
            dataKey: 'sp',
            scale: scaleLinear()
                .domain(
                    getRange(
                        sp,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.SP, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: '#F2242D',
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.GZ3,
            label: tinyGz3(),
            dataKey: 'gz3',
            scale: scaleLinear()
                .domain(
                    getRange(
                        gz3,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.GZ3, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: '#597952',
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.LLD,
            label: tinyLld(),
            dataKey: 'lld',
            scale: scaleLog()
                .domain(
                    getLogRange(
                        lld,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.LLD, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.blue,
            tickFormat: d3.format(',.0f'),
            scaleStep: 50,
            isScaleLog: true
        },
        {
            index: WellLoggingEnum.ILD,
            label: tinyIld(),
            dataKey: 'ild',
            scale: scaleLog()
                .domain(
                    getLogRange(
                        ild,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.ILD, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: '#254AD0',
            tickFormat: d3.format(',.0f'),
            scaleStep: 50,
            isScaleLog: true
        },
        {
            index: WellLoggingEnum.CALI,
            label: tinyCali(),
            dataKey: 'cali',
            scale: scaleLinear()
                .domain(
                    getRange(
                        cali,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.CALI, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: 'green',
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.SONIC,
            label: tinySonic(),
            dataKey: 'sonic',
            scale: scaleLinear()
                .domain(
                    getRange(
                        sonic,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.SONIC, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: 'green',
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.RHOB,
            label: tinyRhob(),
            dataKey: 'rhob',
            scale: scaleLinear()
                .domain(
                    getRange(
                        rhob,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.RHOB, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: 'gray',
            scaleStep: 1
        }
    ];
};

export const columnWidth = (
    packerHistory: TabletPackerHistory[] = null,
    downholeHistory: TabletDownholeHistory[] = null,
    proxyData: ProxyTabletModel[] = null
): number => sum(map(it => it.width, getColumns([], packerHistory, downholeHistory, proxyData)));

export interface TabletGeneralElementProps {
    columns: TabletColumn[];
    scale: number;

    headerOffset: number;
    zoom: number;

    offsetX: number;
    width: number;
    height: number;
    minAbsDepth: number;
    maxAbsDepth: number;
    minRealDepth: number;
    maxRealDepth: number;

    wellId: number;
    wellName: string;
    wellType: WellTypeEnum;
    data: TabletModel[];
    nextData: TabletModel[];
    perforation: TabletPerforation[];
    trajectories: TabletTrajectory[];
    wellLogging: TabletLogging[];
    researchInflowProfile: TabletResearchInflowProfile[];
    proxyData: ProxyTabletModel[];
    packerHistory: TabletPackerHistory[];
    efficiencyData: TabletEfficiencyModel[];
    efficiencyEvaluationType: EvaluationTypeEnum;
    downholeHistory: TabletDownholeHistory[];

    selectedLogging: WellLoggingEnum[];

    loggingChart: TabletLoggingChart[];
    trajectoryScale: ScaleLinear<number, number, never>;
}

interface TabletGeneralElementState {
    loggingChart: TabletLoggingChart[];
}

export class TabletGeneralElement extends React.PureComponent<TabletGeneralElementProps, TabletGeneralElementState> {
    public constructor(props: TabletGeneralElementProps, context: unknown) {
        super(props, context);

        this.state = {
            loggingChart: this.props.loggingChart
        };
    }

    public render(): React.ReactNode {
        const {
            data,
            height,
            nextData,
            offsetX,
            packerHistory,
            downholeHistory,
            perforation,
            proxyData,
            efficiencyData,
            wellId,
            wellName,
            wellType,
            width
        } = this.props;

        return (
            <svg id={`tablet_${wellName}`} x={offsetX} y={0} width={width} height={height} fontFamily='Inter'>
                {this.renderSvgBody(
                    data,
                    nextData,
                    perforation,
                    proxyData,
                    packerHistory,
                    efficiencyData,
                    downholeHistory
                )}
                {this.renderSvgHeader(wellId, wellName, wellType)}
            </svg>
        );
    }

    private efficiencyColumnWidth = () => efficiencyColumnWidth(this.props.efficiencyData);

    private columnWidth = () => sum(map(it => it.width, this.props.columns)) + this.efficiencyColumnWidth();

    private currentRealDepth = value => this.props.trajectoryScale(value);

    private startBlockWidth = columnIndex =>
        sum(
            map(
                (it: TabletColumn) => it.width,
                filter(x => x.index < columnIndex, this.props.columns)
            )
        );

    private currentY = value =>
        defaultHeaderHeight +
        defaultTabletMargin +
        ((value - this.props.minAbsDepth) * this.props.scale) / defaultTabletStep;

    private currentHeight = (top, bottom) => {
        let h = ((bottom - top) * this.props.scale) / defaultTabletStep;
        return h >= 0 ? h : 0;
    };

    private selectedLoggingChart = () =>
        filter(it => includes(it.index, this.props.selectedLogging), this.state.loggingChart ?? []);

    private renderSvgHeader = (wellId: number, wellName: string, wellType: WellTypeEnum) => {
        const y = this.props.headerOffset >= 0 ? 0 : Math.abs(this.props.headerOffset / this.props.zoom);

        let headerElements = [];

        for (let i = 0, w = 0; i < this.props.columns.length; i++) {
            let it = this.props.columns[i];
            headerElements.push(
                <>
                    <rect
                        key={it.dataKey}
                        x={w}
                        y={0}
                        width={it.width}
                        height={defaultHeaderHeight}
                        fill={colorWhite}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                    />
                    {it.horizontal ? (
                        <text
                            x={w + it.width / 2}
                            y={defaultHeaderHeight / 3}
                            fontSize={defaultFontSize}
                            fontWeight='bold'
                            textAnchor='middle'
                        >
                            <tspan fontWeight='bold'>{it.label}</tspan>
                        </text>
                    ) : (
                        <switch>
                            <foreignObject
                                transform='rotate(-90)'
                                x={defaultHeaderHeight * -1 + 50}
                                y={w + it.width / 2 - defaultFontSize}
                                fontSize={defaultFontSize}
                                fontWeight='bold'
                                textAnchor='middle'
                                width='300'
                                height='100'
                            >
                                {it.label}
                            </foreignObject>
                        </switch>
                    )}
                    {it.range && it.range.length > 0 ? (
                        <>
                            <ValuesRange
                                key={i}
                                x={w}
                                y={defaultHeaderHeight - 30}
                                width={it.width}
                                height={30}
                                start={it.range[0]}
                                end={it.range[1]}
                                step={it.rangeStep}
                            />
                        </>
                    ) : null}
                </>
            );
            w += it.width;
        }

        const logging = this.selectedLoggingChart();

        let loggingScaleElements = [];

        if (!isNullOrEmpty(logging)) {
            loggingScaleElements = mapIndexed(
                (it: TabletLoggingChart, index) => (
                    <ValuesRangeD3
                        key={it.index}
                        x={250}
                        y={defaultHeaderHeight - 30 - index * 60}
                        width={500}
                        height={50}
                        title={it.label}
                        xScale={it.scale}
                        strokeColor={it.strokeColor}
                        strokeWidth={it.strokeWidth}
                        tickFormat={it.tickFormat}
                        onChangeScale={(down: boolean) => {
                            // todo mb refactor!
                            const domain = it.scale.domain();

                            if (down && domain[1] - domain[0] <= it.scaleStep) {
                                return;
                            }

                            let newScale = it.scale;
                            let currentScaleStep = (domain[1] - domain[0]) * (it.isScaleLog ? 0.25 : 0.1);

                            it.scale.domain([domain[0], domain[1] + (down ? -currentScaleStep : currentScaleStep)]);

                            this.setState({
                                loggingChart: alterScale(newScale, it.dataKey, this.state.loggingChart)
                            });

                            let storage: LoggingSettingModel[] = [];

                            const savedValue = localStorage.getItem('logging_storage');
                            if (savedValue !== null) {
                                storage = JSON.parse(savedValue) as LoggingSettingModel[];
                            }

                            if (
                                !isNullOrEmpty(storage) &&
                                find(x => x.wellId === wellId && x.param === it.index, storage)
                            ) {
                                storage = reject(
                                    (x: LoggingSettingModel) => x.wellId === wellId && x.param === it.index,
                                    storage
                                );
                            }

                            storage.push(new LoggingSettingModel(wellId, it.index, newScale.domain()[1]));

                            localStorage.setItem('logging_storage', JSON.stringify(storage));
                        }}
                    />
                ),
                logging
            );
        }

        if (!isNullOrEmpty(this.props.efficiencyData)) {
            const fullEfficiencyColumnWidth = this.efficiencyColumnWidth();
            const startRepairs = this.columnWidth() - fullEfficiencyColumnWidth;

            let w = startRepairs;

            forEachObjIndexed((group: TabletEfficiencyModel[], key: string) => {
                const columns = reject((c: TabletColumn) => !max(map(it => it[c.dataKey], group)), efficiencyColumns);

                let currentX = w;

                forEach((column: TabletColumn) => {
                    headerElements.push(
                        <Fragment key={column.dataKey}>
                            <rect
                                x={currentX}
                                y={0}
                                width={column.width}
                                height={defaultHeaderHeight}
                                fill={colorWhite}
                                strokeWidth={defaultStrokeWidth}
                                stroke={colorBlack}
                            />
                            <switch>
                                <foreignObject
                                    x={currentX + column.width / 2 - 40}
                                    y={defaultHeaderHeight - 65}
                                    fontSize={13}
                                    fontWeight='bold'
                                    textAnchor='middle'
                                    width='100'
                                    height='100'
                                >
                                    {column.label}
                                </foreignObject>
                            </switch>
                        </Fragment>
                    );
                    currentX += column.width;
                }, columns);

                const efficiencyColumnWidth = sum(map((it: TabletColumn) => it.width, columns));

                if (efficiencyColumnWidth) {
                    headerElements.push(
                        <Fragment>
                            <rect
                                x={w}
                                y={0}
                                width={efficiencyColumnWidth}
                                height={defaultHeaderHeight - 80}
                                fill={colorWhite}
                                strokeWidth={defaultStrokeWidth}
                                stroke={colorBlack}
                            />
                            <switch>
                                <foreignObject
                                    transform='rotate(-90)'
                                    x={defaultHeaderHeight * -1 + 100}
                                    y={w + efficiencyColumnWidth / 2 - 40}
                                    fontSize={defaultFontSize}
                                    fontWeight='bold'
                                    textAnchor='middle'
                                    width='220'
                                    height='100'
                                >
                                    {key}
                                    <div>
                                        +
                                        {round1(
                                            (this.props.efficiencyEvaluationType === EvaluationTypeEnum.Standart
                                                ? mean(map(it => it.effectiveOilMonth, group))
                                                : sum(map(it => it.effectiveOilMonth, group))) / 1000
                                        )}{' '}
                                        {i18n.t(dict.common.units.tonsAccumulated)}
                                    </div>
                                </foreignObject>
                            </switch>
                        </Fragment>
                    );
                    w += efficiencyColumnWidth;
                }
            }, groupByProp('operationName', this.props.efficiencyData ?? []));

            if (fullEfficiencyColumnWidth) {
                headerElements.push(
                    <>
                        <rect
                            x={startRepairs}
                            y={100}
                            width={this.efficiencyColumnWidth()}
                            height={50}
                            fill={colorWhite}
                            strokeWidth={defaultStrokeWidth}
                            stroke={colorBlack}
                        />
                        <text
                            x={startRepairs + this.efficiencyColumnWidth() / 2}
                            y={125}
                            dominantBaseline={'middle'}
                            textAnchor={'middle'}
                            fontSize={25}
                            fontWeight={'bold'}
                        >
                            {i18n.t(dict.load.repairs)}
                        </text>
                    </>
                );
            }
        }

        const proxyColumnWidth = sum(
            map(
                (it: TabletColumn) => it.width,
                reject((x: TabletColumn) => !x.isProxy, this.props.columns)
            )
        );

        const startProxyWidth = this.columnWidth() - proxyColumnWidth - this.efficiencyColumnWidth();

        return (
            <svg className={'tablet__header'} x={0} y={y} width={this.props.width} height={defaultHeaderHeight}>
                <g>
                    {headerElements}
                    {loggingScaleElements}
                    <rect
                        x={0}
                        y={0}
                        width={this.columnWidth()}
                        height={100}
                        fill={colorWhite}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                    />
                    <text
                        x={this.columnWidth() / 2}
                        y={50}
                        dominantBaseline={'middle'}
                        textAnchor={'middle'}
                        fontSize={40}
                        fontWeight={'bold'}
                    >
                        {wellName}
                    </text>
                    <image
                        href={getImagePath(wellType)}
                        x={(this.columnWidth() - wellName.length * 30) / 2 - 50}
                        y={22}
                        height='50'
                        width='50'
                    />
                    {isNullOrEmpty(this.props.proxyData) ? null : (
                        <>
                            <rect
                                x={startProxyWidth}
                                y={100}
                                width={proxyColumnWidth}
                                height={50}
                                fill={colorWhite}
                                strokeWidth={defaultStrokeWidth}
                                stroke={colorBlack}
                            />
                            <text
                                x={startProxyWidth + proxyColumnWidth / 2}
                                y={125}
                                dominantBaseline={'middle'}
                                textAnchor={'middle'}
                                fontSize={25}
                                fontWeight={'bold'}
                            >
                                {i18n.t(dict.proxy.adaptation)}
                            </text>
                        </>
                    )}
                </g>
            </svg>
        );
    };

    private renderSvgBody = (
        data: TabletModel[],
        nextData: TabletModel[],
        perforationData: TabletPerforation[],
        proxyData: ProxyTabletModel[],
        packerHistory: TabletPackerHistory[],
        efficiencyData: TabletEfficiencyModel[],
        downholeHistory: TabletDownholeHistory[]
    ) => {
        const minTop = getExtremum(ascBy, 'topAbs', data);
        const maxBottom = getExtremum(descBy, 'bottomAbs', data);

        const productionObjectName = (column: TabletColumn) => {
            let startWidth = this.startBlockWidth(column.index);

            return mapIndexed((it: string, index) => {
                if (!it) {
                    return;
                }

                let minTopObject = getExtremumByObject(ascBy, 'topAbs', data);
                let maxBottomObject = getExtremumByObject(descBy, 'bottomAbs', data);

                const topY = this.currentY(minTopObject[it]);
                const bottomY = this.currentY(maxBottomObject[it]);

                const linePath = () => {
                    return path([
                        new Point(startWidth, (bottomY + topY) / 2 + defaultColumnVerticalHeight),
                        new Point(startWidth, (bottomY + topY) / 2 - defaultColumnVerticalHeight)
                    ]);
                };

                let pathId = `path_prod_obj_column_${index}_${this.props.wellName}`;

                return (
                    <g key={`g_prod_obj_${index}`}>
                        <line
                            x1={startWidth}
                            y1={topY}
                            x2={startWidth + column.width}
                            y2={topY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlue}
                        />
                        <line
                            x1={startWidth}
                            y1={bottomY}
                            x2={startWidth + column.width}
                            y2={bottomY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlue}
                        />
                        <path id={pathId} d={linePath()} fill={colorNone} />
                        <text
                            x={defaultColumnVerticalHeight}
                            y={0}
                            dy={35}
                            fontSize={defaultFontSize}
                            textAnchor={'middle'}
                        >
                            <textPath href={`#${pathId}`}>{it}</textPath>
                        </text>
                    </g>
                );
            }, uniq(map(it => it.productionObjectName, data)));
        };

        const plastName = (column: TabletColumn) => {
            let startWidth = this.startBlockWidth(column.index);
            return mapIndexed((it: number, index) => {
                if (!it) {
                    return;
                }

                const topY = this.currentY(minTop[it]);
                const bottomY = this.currentY(maxBottom[it]);

                const linePath = () => {
                    return path([
                        new Point(startWidth, (bottomY + topY) / 2 + defaultColumnVerticalHeight),
                        new Point(startWidth, (bottomY + topY) / 2 - defaultColumnVerticalHeight)
                    ]);
                };

                let pathId = `path_plast_column_${index}_${this.props.wellName}`;
                return (
                    <g key={`g_plast_${index}`}>
                        <path id={pathId} d={linePath()} fill={colorNone} />
                        <text
                            x={defaultColumnVerticalHeight}
                            y={0}
                            dy={35}
                            fontSize={defaultFontSize}
                            textAnchor={'middle'}
                        >
                            <textPath href={`#${pathId}`}>{it}</textPath>
                        </text>
                    </g>
                );
            }, uniq(map(it => it.plastName, data)));
        };

        const absoluteDepth = (column: TabletColumn) => {
            let startWidth = this.startBlockWidth(column.index);
            let depths = [];

            for (
                let i = Math.floor(this.props.minAbsDepth);
                i <= Math.ceil(this.props.maxAbsDepth);
                i += defaultTabletStep
            ) {
                const y = this.currentY(i);
                depths.push(
                    <>
                        <line
                            x1={startWidth}
                            y1={y}
                            x2={startWidth + column.width}
                            y2={y}
                            strokeWidth={defaultStrokeWidth}
                            stroke={colorBlack}
                        />
                        <text x={startWidth + 25} y={y - defaultFontSize / 4} fontSize={defaultFontSize}>
                            {Math.round(this.currentRealDepth(i))}
                        </text>
                        <text x={startWidth + 25} y={y + defaultFontSize} fontSize={defaultFontSize - 2}>
                            {-Math.round(i)}
                        </text>
                    </>
                );
            }

            return depths;
        };

        const plastBorders = () => {
            return map(it => {
                if (!it) {
                    return;
                }

                const topY = this.currentY(minTop[it]);
                const bottomY = this.currentY(maxBottom[it]);

                let nextTopY = 0;
                let nextBottomY = 0;
                if (nextData) {
                    const nextMinTop = getExtremum(ascBy, 'topAbs', nextData);
                    const nextMaxBottom = getExtremum(descBy, 'bottomAbs', nextData);
                    nextTopY = this.currentY(nextMinTop[it]);
                    nextBottomY = this.currentY(nextMaxBottom[it]);
                }

                return (
                    <>
                        <line
                            x1={50}
                            y1={topY}
                            x2={this.columnWidth()}
                            y2={topY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlue}
                        />
                        <line
                            x1={50}
                            y1={bottomY}
                            x2={this.columnWidth()}
                            y2={bottomY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlue}
                        />
                        <text
                            x={this.columnWidth() + 25}
                            y={topY + defaultFontSize / 1.5}
                            fontSize={defaultFontSize}
                        >{`${it} top`}</text>
                        <text x={this.columnWidth() + 25} y={bottomY} fontSize={defaultFontSize}>{`${it} bottom`}</text>
                        {nextData && nextTopY > 0 && nextBottomY > 0 ? (
                            <>
                                <line
                                    x1={this.columnWidth()}
                                    y1={topY + defaultStrokeWidth}
                                    x2={this.columnWidth() + 200}
                                    y2={nextTopY}
                                    strokeWidth={defaultBoldStrokeWidth}
                                    stroke={colorBlue}
                                />
                                <line
                                    x1={this.columnWidth()}
                                    y1={bottomY + defaultStrokeWidth}
                                    x2={this.columnWidth() + 200}
                                    y2={nextBottomY}
                                    strokeWidth={defaultBoldStrokeWidth}
                                    stroke={colorBlue}
                                />
                            </>
                        ) : null}
                    </>
                );
            }, uniq(map(it => it.plastName, data)));
        };

        const perforationGridBorders = (column: TabletColumn) => {
            let grid = [];
            let startPerforationWidth = this.startBlockWidth(column.index);
            for (let i = this.props.minAbsDepth; i <= this.props.maxAbsDepth; i += defaultTabletStep) {
                const y = this.currentY(i);
                grid.push(
                    <>
                        <line
                            x1={this.columnWidth() - (this.columnWidth() - startPerforationWidth)}
                            y1={y}
                            x2={this.columnWidth()}
                            y2={y}
                            strokeWidth={defaultStrokeGridWidth}
                            stroke={colorGray}
                        />
                    </>
                );
            }

            return grid;
        };

        const separatorLine = (column: TabletColumn) => {
            let grid = [];
            let startWidth = this.startBlockWidth(column.index);

            grid.push(
                <line
                    x1={startWidth}
                    y1={defaultHeaderHeight}
                    x2={startWidth}
                    y2={this.props.height}
                    strokeWidth={defaultBoldStrokeWidth}
                    stroke={colorBlack}
                />
            );

            return grid;
        };

        const scaleGrid = (column: TabletColumn) => {
            let grid = [];
            let startPerforationWidth = this.startBlockWidth(column.index);

            const actualStep = column.width / column.rangeStep;
            for (let i = 0; i <= column.width; i += actualStep) {
                grid.push(
                    <line
                        x1={startPerforationWidth + i}
                        y1={defaultHeaderHeight}
                        x2={startPerforationWidth + i}
                        y2={this.props.height}
                        strokeWidth={defaultStrokeGridWidth}
                        stroke={colorGray}
                    />
                );
            }

            return grid;
        };

        const perforation = (column: TabletColumn) => {
            const block = (actualWidth, it: TabletPerforation) => {
                const result = [];

                const topY = this.currentY(it.topAbs);
                const bottomY = this.currentY(it.bottomAbs);

                const tempPath = () => {
                    return path([
                        new Point(actualWidth, (bottomY + topY) / 2 - 70),
                        new Point(actualWidth, (bottomY + topY) / 2 + 70)
                    ]);
                };

                const tempHydraulicFracturingPath = () => {
                    return path([
                        new Point(actualWidth, (bottomY + topY) / 2 - 100),
                        new Point(actualWidth, (bottomY + topY) / 2 + 100)
                    ]);
                };

                const getPerforationPath = () => {
                    return path([
                        new Point(actualWidth - 15, topY),
                        new Point(actualWidth, topY),
                        new Point(actualWidth, bottomY),
                        new Point(actualWidth - 15, bottomY)
                    ]);
                };

                const getGrpPath = () => {
                    return path([new Point(actualWidth - 3, topY), new Point(actualWidth - 3, bottomY)]);
                };

                const element = (id, dt, grpState, color, isClosedPeriod: boolean = false) => {
                    const perfPathProps = {
                        d: grpState ? getGrpPath() : getPerforationPath(),
                        strokeWidth: grpState ? 10 : 5,
                        stroke: grpState ? colorRed : color,
                        fill: isClosedPeriod ? `url(#${color === colorRed ? 'diagonalHatchRed' : ''})` : colorNone
                    };

                    const pathId = `perforation_${color}_${id}_${grpState}_${dt}`;
                    const textDt = `${grpState ? i18n.t(dict.common.hydraulicFracturing) : ''} ${ddmmyyyy(dt)}`;
                    const dataTip = grpState
                        ? tooltipHydraulicFracturingParameter(textDt)
                        : tooltipLabelStringParameter(column, textDt);
                    return (
                        <g data-for='tablet-tooltip' data-tip={dataTip}>
                            <path
                                id={pathId}
                                d={grpState ? tempHydraulicFracturingPath() : tempPath()}
                                fill={colorNone}
                            />
                            <path {...perfPathProps} />
                            <text dx={10} dy={-5} fontSize={defaultFontSize}>
                                <textPath href={`#${pathId}`}>{textDt}</textPath>
                            </text>
                        </g>
                    );
                };

                const isClosedPeriod = !!it.closingDate;

                result.push(element(it.id, it.dt, it.grpState, colorGreen, isClosedPeriod));
                if (isClosedPeriod) {
                    actualWidth += defaultPerforationStep;
                    result.push(element(it.id, it.closingDate, it.grpState, colorRed, isClosedPeriod));
                }

                return result;
            };

            let result = [];

            mapObjIndexed(group => {
                let startPerforationWidth = this.startBlockWidth(column.index) - 20;

                mapObjIndexed(
                    item => {
                        startPerforationWidth += defaultPerforationStep;
                        return map(it => {
                            result.push(block(startPerforationWidth, it));
                            if (it.closingDate) {
                                startPerforationWidth += defaultPerforationStep;
                            }
                        }, item as TabletPerforation[]);
                    },
                    groupByProp(
                        'dt',
                        sortBy(it => it.dt, group)
                    )
                );
            }, groupByProp('groupId', perforationData));

            return result;
        };

        const perforationCharts = (column: TabletColumn) => {
            const startBlockWidth = this.startBlockWidth(column.index);

            //const xRange = [startBlockWidth, startBlockWidth + column.width];

            const minRealDepth = this.props.trajectoryScale(this.props.minAbsDepth - defaultColumnVerticalHeight);
            const maxRealDepth = this.props.trajectoryScale(this.props.maxAbsDepth + defaultColumnVerticalHeight);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const line = (key: string, xScale): any =>
                d3
                    .line()
                    .defined(
                        d =>
                            !isNil(d[key]) &&
                            !isNaN(d[key]) &&
                            d[key] !== 0 &&
                            d['dept'] >= minRealDepth &&
                            d['dept'] <= maxRealDepth
                    )
                    .x(d => round1(startBlockWidth + xScale(d[key])))
                    .y(d => round1(this.currentY(this.props.trajectoryScale.invert(d['dept']))))
                    .curve(d3.curveMonotoneX);

            const svg = d3.select(`#tablet_${this.props.wellName}`);

            svg.selectAll('.logging').remove();

            const logging = svg.insert('g', '.tablet__header').attr('class', 'logging');

            forEach((it: TabletLoggingChart) => {
                logging
                    .append('path')
                    .datum(this.props.wellLogging)
                    .attr('fill', 'none')
                    .attr('stroke', it.strokeColor)
                    .attr('stroke-width', it.strokeWidth ?? 2)
                    .attr('d', line(it.dataKey, it.scale));
            }, this.selectedLoggingChart());
        };

        const researchInflowProfile = (column: TabletColumn) => {
            const startBlockWidth = this.startBlockWidth(column.index);

            const svg = d3.select(`#tablet_${this.props.wellName}`);

            svg.selectAll('.research').remove();

            const research = svg.insert('g', '.tablet__header').attr('class', 'research');

            const width = 75;
            const margin = 30;
            const group = groupBy(x => x.dt.toString(), this.props.researchInflowProfile);
            const length = toPairs(group).length;

            let i = 0;

            forEachObjIndexed((points: TabletResearchInflowProfile[]) => {
                forEach((it: TabletResearchInflowProfile) => {
                    const x = startBlockWidth + column.width + (width + margin) * i - width * length;

                    const topY = this.currentY(this.props.trajectoryScale.invert(it.top));
                    const bottomY = this.currentY(this.props.trajectoryScale.invert(it.bottom));

                    const barWidth = width * (it.value / 100);
                    const barHeight = bottomY - topY;

                    const color = find(c => c.type === it.saturationTypeId, saturationColor);

                    research
                        .append('rect')
                        .attr('height', barHeight - 10)
                        .attr('width', barWidth)
                        .attr('stroke-width', defaultStrokeWidth)
                        .attr('stroke', colorBlack)
                        .attr('fill', color ? color.color : colorNone)
                        .attr('x', x)
                        .attr('y', topY + 5)
                        .attr('data-for', 'tablet-tooltip')
                        .attr('data-tip', tooltipLabelResearchParameter(column, it));

                    research
                        .append('line')
                        .attr('x1', x)
                        .attr('y1', topY)
                        .attr('x2', x)
                        .attr('y2', bottomY)
                        .attr('stroke-width', defaultStrokeWidth)
                        .attr('stroke', colorBlack);

                    research
                        .append('text')
                        .text(`${round0(it.value)}%`)
                        .attr('font-size', defaultFontSize)
                        .attr('x', x + defaultFontSize / 2)
                        .attr('y', topY + barHeight / 2 + 10)
                        .attr('data-for', 'tablet-tooltip')
                        .attr('data-tip', tooltipLabelResearchParameter(column, it));

                    const pathId = `perfResearch_${yyyymmdd(it.dt)}_${it.top}_${it.bottom}`;

                    research
                        .append('path')
                        .attr('id', pathId)
                        .attr(
                            'd',
                            path([new Point(x, (bottomY + topY) / 2 - 70), new Point(x, (bottomY + topY) / 2 + 70)])
                        );

                    research
                        .append('text')
                        .attr('dx', 10)
                        .attr('dy', defaultFontSize)
                        .attr('font-size', defaultFontSize)
                        .append('textPath')
                        .attr('href', `#${pathId}`)
                        .text(ddmmyyyy(it.dt));
                }, points);
                i++;
            }, group);
        };

        const packer = (column: TabletColumn, w: number) => {
            const defaultPackerWidth = 30;
            const defaultPackerDividedWidth = 50;
            const defaultPackerHeight = 50;
            const defaultPackerFilterWidth = 45;
            const defaultPackerFilterHeight = 115;

            const svg = d3.select(`#tablet_${this.props.wellName}`);

            svg.selectAll('.packer').remove();

            const group = svg.insert('g', '.tablet__header').attr('class', 'packer');

            forEach((it: TabletPackerHistory) => {
                if (!it.topPacker && !it.bottomPacker) {
                    return null;
                }

                const topY = this.props.trajectoryScale.invert(it.topPacker);
                const bottomY = this.props.trajectoryScale.invert(it.bottomPacker);

                let packerY = this.currentY(this.props.minAbsDepth - defaultTabletMargin);
                let packerHeight = this.currentHeight(this.props.minAbsDepth - defaultTabletMargin, bottomY);

                let topPackerOffsetY = this.currentY(topY);
                let bottomPackerOffsetY = this.currentY(bottomY) - defaultPackerHeight;

                if (it.topPacker && it.bottomPacker) {
                    if (!it.filterBetweenPackers) {
                        packerHeight += defaultPackerFilterHeight;
                    }

                    if (it.autonomousPipeLayout) {
                        packerY = this.currentY(topY) - defaultPackerMargin;
                        packerHeight =
                            bottomPackerOffsetY -
                            topPackerOffsetY +
                            defaultPackerMargin +
                            defaultPackerHeight +
                            defaultPackerFilterHeight;
                    }
                }

                if (it.topPacker && !it.bottomPacker) {
                    packerHeight =
                        this.currentHeight(this.props.minAbsDepth - defaultTabletMargin, topY) +
                        defaultPackerFilterHeight;
                    topPackerOffsetY = this.currentY(topY) - defaultPackerHeight;
                }

                if (!it.topPacker && it.bottomPacker) {
                    bottomPackerOffsetY = this.currentY(bottomY) - defaultPackerHeight;
                }

                // ствол скважины
                group
                    .append('rect')
                    .attr('x', w + defaultPackerWidth)
                    .attr('y', packerY)
                    .attr('width', column.width - defaultPackerWidth * 2)
                    .attr('height', packerHeight)
                    .attr('fill', 'url(#gradient1)')
                    .attr('stroke', colorBlack)
                    .attr('data-for', 'tablet-tooltip');

                // top packer
                group
                    .append('path')
                    .attr('fill', colorGreen)
                    .attr('stroke', colorBlack)
                    .attr('transform', `translate(${w},${topPackerOffsetY})`)
                    .attr('d', it.hermeticState ? pathPacker() : pathNonHermeticPacker());

                group
                    .append('path')
                    .attr('fill', colorGreen)
                    .attr('stroke', colorBlack)
                    .attr(
                        'transform',
                        `translate(${
                            w + column.width - defaultPackerWidth + (it.hermeticState ? 0 : 10)
                        },${topPackerOffsetY})`
                    )
                    .attr('d', it.hermeticState ? pathPacker() : pathNonHermeticPacker());

                // bottom packer
                group
                    .append('path')
                    .attr('fill', colorGreen)
                    .attr('stroke', colorBlack)
                    .attr('transform', `translate(${w},${bottomPackerOffsetY})`)
                    .attr('d', it.hermeticState ? pathPacker() : pathNonHermeticPacker());

                group
                    .append('path')
                    .attr('fill', colorGreen)
                    .attr('stroke', colorBlack)
                    .attr(
                        'transform',
                        `translate(${
                            w + column.width - defaultPackerWidth + (it.hermeticState ? 0 : 10)
                        },${bottomPackerOffsetY})`
                    )
                    .attr('d', it.hermeticState ? pathPacker() : pathNonHermeticPacker());

                // filter
                if (it.filterBetweenPackers) {
                    if (it.dividedEquipment) {
                        group
                            .append('rect')
                            .attr('x', w + 15)
                            .attr('y', topPackerOffsetY + defaultPackerHeight)
                            .attr('width', 90)
                            .attr('height', bottomPackerOffsetY - topPackerOffsetY - defaultPackerHeight)
                            .attr('transform', `translate(${defaultPackerWidth / 2},0)`)
                            .attr('fill', 'url(#packerFilter)')
                            .attr('data-for', 'tablet-tooltip');
                    } else {
                        group
                            .append('rect')
                            .attr('x', w + defaultPackerWidth)
                            .attr('y', topPackerOffsetY + defaultPackerHeight)
                            .attr('width', defaultPackerFilterWidth)
                            .attr('height', bottomPackerOffsetY - topPackerOffsetY - defaultPackerHeight)
                            .attr('transform', `translate(${defaultPackerWidth / 2},0)`)
                            .attr('fill', 'url(#packerFilter)')
                            .attr('data-for', 'tablet-tooltip');
                    }
                } else {
                    if (it.topPacker && it.bottomPacker) {
                        group
                            .append('image')
                            .attr('x', w + defaultPackerHeight)
                            .attr('y', topPackerOffsetY - defaultPackerFilterHeight)
                            .attr('width', defaultPackerFilterWidth)
                            .attr('height', defaultPackerFilterHeight)
                            .attr('preserveAspectRatio', 'none')
                            .attr('xlink:href', '/images/tablet/filter.svg');
                        group
                            .append('image')
                            .attr('x', w + defaultPackerHeight)
                            .attr('y', bottomPackerOffsetY + defaultPackerHeight)
                            .attr('width', defaultPackerFilterWidth)
                            .attr('height', defaultPackerFilterHeight)
                            .attr('preserveAspectRatio', 'none')
                            .attr('xlink:href', '/images/tablet/filter.svg');
                    }

                    if (it.topPacker && !it.bottomPacker) {
                        group
                            .append('image')
                            .attr('x', w + defaultPackerHeight)
                            .attr('y', topPackerOffsetY + defaultPackerHeight)
                            .attr('width', defaultPackerFilterWidth)
                            .attr('height', defaultPackerFilterHeight)
                            .attr('preserveAspectRatio', 'none')
                            .attr('xlink:href', '/images/tablet/filter.svg');
                    }

                    if (!it.topPacker && it.bottomPacker) {
                        group
                            .append('image')
                            .attr('x', w + defaultPackerHeight)
                            .attr('y', bottomPackerOffsetY - defaultPackerHeight * 2)
                            .attr('width', defaultPackerFilterWidth)
                            .attr('height', defaultPackerFilterHeight)
                            .attr('preserveAspectRatio', 'none')
                            .attr('xlink:href', '/images/tablet/filter.svg');
                    }
                }

                if (it.dividedEquipment) {
                    group
                        .append('rect')
                        .attr('x', w + defaultPackerDividedWidth)
                        .attr('y', this.currentY(this.props.minAbsDepth - defaultTabletMargin))
                        .attr('width', column.width - defaultPackerDividedWidth * 2)
                        .attr('height', packerHeight + defaultPackerFilterHeight)
                        .attr('fill', 'url(#gradient2)')
                        .attr('stroke', colorBlack)
                        .attr('stroke-width', 4)
                        .attr('data-for', 'tablet-tooltip');

                    group
                        .append('rect')
                        .attr('x', w + defaultPackerWidth)
                        .attr('y', bottomPackerOffsetY + defaultPackerHeight)
                        .attr('width', defaultPackerFilterWidth)
                        .attr('height', defaultPackerFilterHeight)
                        .attr('transform', `translate(${defaultPackerWidth / 2},0)`)
                        .attr('fill', 'url(#packerFilter)')
                        .attr('data-for', 'tablet-tooltip');
                }

                if (it.behindPipeInjection) {
                    group
                        .append('image')
                        .attr('x', w + 4)
                        .attr('y', Math.max(topPackerOffsetY, bottomPackerOffsetY) - defaultPackerHeight - 320)
                        .attr('width', 25)
                        .attr('height', 350)
                        .attr('preserveAspectRatio', 'none')
                        .attr('xlink:href', '/images/tablet/arrow-down.svg');
                }
            }, packerHistory);
        };

        const packerPump = (column: TabletColumn, w: number) => {
            const defaultPackerWidth = 30;
            const defaultPackerHeight = 50;
            const defaultPackerFilterHeight = 115;

            const svg = d3.select(`#tablet_${this.props.wellName}`);

            svg.selectAll('.packerPump').remove();

            const group = svg.insert('g', '.tablet__header').attr('class', 'packerPump');

            forEach((it: TabletPackerHistory) => {
                if (!it.topPump) {
                    return null;
                }

                const topY = this.props.trajectoryScale.invert(it.topPump);

                let packerHeight =
                    this.currentHeight(this.props.minAbsDepth - defaultTabletMargin, topY) + defaultPackerFilterHeight;

                let topPackerOffsetY = this.currentY(topY) - defaultPackerHeight;

                // ствол скважины
                group
                    .append('rect')
                    .attr('x', w + defaultPackerWidth)
                    .attr('y', this.currentY(this.props.minAbsDepth - defaultTabletMargin))
                    .attr('width', column.width - defaultPackerWidth * 2)
                    .attr('height', packerHeight)
                    .attr('fill', 'url(#gradient1)')
                    .attr('stroke', colorBlack)
                    .attr('data-for', 'tablet-tooltip');

                if (it.pumpType === PackerPumpType.ElectricSubmersiblePump) {
                    group
                        .append('image')
                        .attr('x', w + 35)
                        .attr('y', topPackerOffsetY - defaultPackerHeight + 105)
                        .attr('width', 81)
                        .attr('height', 103)
                        .attr('preserveAspectRatio', 'none')
                        .attr('xlink:href', '/images/tablet/ESP.svg');
                } else {
                    group
                        .append('image')
                        .attr('x', w + 35)
                        .attr('y', topPackerOffsetY - defaultPackerHeight + 105)
                        .attr('width', 81)
                        .attr('height', 103)
                        .attr('preserveAspectRatio', 'none')
                        .attr('xlink:href', '/images/tablet/SPR.svg');
                }

                group
                    .append('text')
                    .text(it.pumpName)
                    .attr('font-size', defaultFontSize)
                    .attr('x', w)
                    .attr('y', topPackerOffsetY + defaultPackerHeight);
            }, packerHistory);
        };

        const downhole = (column: TabletColumn, w: number) => {
            const svg = d3.select(`#tablet_${this.props.wellName}`);

            svg.selectAll('.downhole').remove();

            const group = svg.insert('g', '.tablet__header').attr('class', 'downhole');

            forEach((it: TabletDownholeHistory) => {
                const topY = this.props.trajectoryScale.invert(it.depth);

                let topPackerOffsetY = this.currentY(topY);

                group.attr('data-for', 'tablet-tooltip');
                group.attr('data-tip', tooltipLabelDownholeParameter(column, it));

                group
                    .append('image')
                    .attr('x', w)
                    .attr('y', topPackerOffsetY)
                    .attr('width', 150)
                    .attr('height', 32)
                    .attr('preserveAspectRatio', 'none')
                    .attr('xlink:href', '/images/tablet/downhole.svg');

                group
                    .append('text')
                    .text(getDownholeBriefLabel(it.downholeType))
                    .attr('font-size', defaultFontSize)
                    .attr('x', w + column.width / 2 - 15)
                    .attr('y', topPackerOffsetY - 10);

                group
                    .append('text')
                    .text(ddmmyyyy(new Date(it.dt)))
                    .attr('font-size', defaultFontSize)
                    .attr('x', w + 10)
                    .attr('y', topPackerOffsetY + 55);

                group
                    .append('text')
                    .text(it.depth)
                    .attr('font-size', defaultFontSize)
                    .attr('x', w + 155)
                    .attr('y', topPackerOffsetY + 10);
            }, downholeHistory);
        };

        const saturation = (column: TabletColumn, w: number) => {
            return map(it => {
                const color = find(c => c.type === it.saturationTypeId, saturationColor);
                return (
                    <rect
                        key={it.id}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={column.width}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={color ? color.color : colorNone}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelSaturationParameter(column, it)}
                    />
                );
            }, data);
        };

        const lithology = (column: TabletColumn, w: number) => {
            return map(it => {
                const type = find((c: TabletLithologyFill) => c.type === it.lithologyId, lithologyFill);
                return type ? (
                    <rect
                        key={it.id}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={column.width}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={type ? type.fill : colorNone}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelLithologyParameter(column, it.lithologyId)}
                    />
                ) : null;
            }, data);
        };

        const porosity = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <rect
                        key={it.id}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={widthScale(column, it.porosity)}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={colorPorosity}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelNumberParameter(column, it.porosity)}
                    />
                ),
                data
            );
        };

        const permeability = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <rect
                        key={it.id}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={widthScale(column, it.permeability)}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={colorPermeability}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelNumberParameter(column, it.permeability)}
                    />
                ),
                data
            );
        };

        const oilSaturation = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <rect
                        key={it.id}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={widthScale(column, it.oilSaturation)}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={colorOilSaturation}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelNumberParameter(column, it.oilSaturation)}
                    />
                ),
                data
            );
        };

        const avgVolume = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <rect
                        key={it.topAbs}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={widthScale(column, it.avgVolume)}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={colorAvgVolume}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelNumberParameter(column, it.avgVolume)}
                    />
                ),
                proxyData
            );
        };

        const avgTransmissibility = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <rect
                        key={it.topAbs}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={widthScale(column, it.avgTransmissibility)}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={colorAvgTransmissibility}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelNumberParameter(column, it.avgTransmissibility)}
                    />
                ),
                proxyData
            );
        };

        const relLiqInje = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <>
                        <rect
                            key={it.topAbs}
                            x={w}
                            y={this.currentY(it.topAbs)}
                            width={widthScale(column, it.relLiqInje)}
                            height={this.currentHeight(it.topAbs, it.bottomAbs)}
                            strokeWidth={defaultStrokeWidth}
                            stroke={colorBlack}
                            fill={find(c => c.type === it.saturationType, saturationColor).color}
                            data-for='tablet-tooltip'
                            data-tip={tooltipLabelNumberParameter(column, it.relLiqInje)}
                        />
                        <text
                            x={w + defaultFontSize / 2 + defaultFontSize}
                            y={this.currentY(it.topAbs) + this.currentHeight(it.topAbs, it.bottomAbs) / 2 + 10}
                            fontSize={defaultFontSize}
                            textAnchor={'middle'}
                        >
                            {round0(it.relLiqInje)}%
                        </text>
                    </>
                ),
                proxyData
            );
        };

        const relLiqInjeAccum = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <>
                        <rect
                            key={it.topAbs}
                            x={w}
                            y={this.currentY(it.topAbs)}
                            width={widthScale(column, it.relLiqInjeAccum)}
                            height={this.currentHeight(it.topAbs, it.bottomAbs)}
                            strokeWidth={defaultStrokeWidth}
                            stroke={colorBlack}
                            fill={find(c => c.type === it.saturationType, saturationColor).color}
                            data-for='tablet-tooltip'
                            data-tip={tooltipLabelNumberParameter(column, it.relLiqInjeAccum)}
                        />
                        <text
                            x={w + defaultFontSize / 2 + defaultFontSize}
                            y={this.currentY(it.topAbs) + this.currentHeight(it.topAbs, it.bottomAbs) / 2 + 10}
                            fontSize={defaultFontSize}
                            textAnchor={'middle'}
                        >
                            {round0(it.relLiqInjeAccum)}%
                        </text>
                    </>
                ),
                proxyData
            );
        };

        const effectiveInjection = (column: TabletColumn, w: number) => {
            return map(
                it => (
                    <rect
                        key={it.topAbs}
                        x={w}
                        y={this.currentY(it.topAbs)}
                        width={widthScale(column, it.effectiveInjection)}
                        height={this.currentHeight(it.topAbs, it.bottomAbs)}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                        fill={colorEffectiveInjection}
                        data-for='tablet-tooltip'
                        data-tip={tooltipLabelNumberParameter(column, it.effectiveInjection)}
                    />
                ),
                proxyData
            );
        };

        const renderEfficiencyColumns = () => {
            if (isNullOrEmpty(efficiencyData)) {
                return;
            }

            let result = [];
            let w = this.columnWidth() - this.efficiencyColumnWidth();

            forEachObjIndexed((group: TabletEfficiencyModel[]) => {
                const columns = reject((c: TabletColumn) => !max(map(it => it[c.dataKey], group)), efficiencyColumns);

                let currentX = w;
                forEach(column => {
                    const maxValue = Math.round(max(map(it => it[column.dataKey], efficiencyData)) * 1.15) || 1000;

                    column.range = [0, maxValue];

                    result.push(
                        <rect
                            key={column.dataKey}
                            x={currentX}
                            y={0}
                            width={column.width}
                            height={this.props.height}
                            fill={colorWhite}
                            strokeWidth={defaultStrokeWidth}
                            stroke={colorBlack}
                        />
                    );

                    if (currentX === w) {
                        result.push(
                            <line
                                x1={currentX}
                                y1={0}
                                x2={currentX}
                                y2={this.props.height}
                                strokeWidth={defaultBoldStrokeWidth}
                                stroke={colorBlack}
                            />
                        );
                    }

                    forEach((it: TabletEfficiencyModel) => {
                        const isEffect = column.dataKey === 'effectiveOilMonth';

                        const top = isEffect
                            ? this.props.trajectoryScale.invert(it.minTopEffect)
                            : this.props.trajectoryScale.invert(it.minTopVolume);
                        const bottom = isEffect
                            ? this.props.trajectoryScale.invert(it.maxBottomEffect)
                            : this.props.trajectoryScale.invert(it.maxBottomVolume);

                        const value = isEffect ? it[column.dataKey] / 1000 : it[column.dataKey];

                        if (value) {
                            result.push(
                                <>
                                    <rect
                                        key={`${it.wellId}_${it.dt}`}
                                        x={currentX}
                                        y={this.currentY(top)}
                                        width={widthScale(column, it[column.dataKey])}
                                        height={this.currentHeight(top, bottom)}
                                        strokeWidth={defaultStrokeWidth}
                                        stroke={colorBlack}
                                        fill={isEffect ? '#B02418' : '#B1D095'}
                                        data-for='tablet-tooltip'
                                        data-tip={tooltipLabelNumberParameter(column, value)}
                                    />
                                    <text
                                        x={currentX + defaultFontSize / 2 + defaultFontSize}
                                        y={this.currentY(top) + this.currentHeight(top, bottom) / 2 + 10}
                                        fontSize={defaultFontSize}
                                        textAnchor={'middle'}
                                    >
                                        {round0(value)}
                                    </text>
                                </>
                            );
                        }
                    }, group);
                    currentX += column.width;
                }, columns);

                w += sum(map((it: TabletColumn) => it.width, columns));
            }, groupByProp('operationName', efficiencyData ?? []));

            return result;
        };

        let bodyElements = [];
        for (let i = 0, w = 0; i < this.props.columns.length; i++) {
            let it = this.props.columns[i];
            bodyElements.push(
                <rect
                    key={it.dataKey}
                    x={w}
                    y={defaultHeaderHeight}
                    width={it.width}
                    height={this.props.height - defaultHeaderHeight}
                    fill={colorWhite}
                    strokeWidth={defaultStrokeWidth}
                    stroke={colorBlack}
                    data-for='tablet-tooltip'
                    data-tip=''
                />
            );
            w += it.width;
        }

        bodyElements.push(renderEfficiencyColumns());

        let w = 0;
        for (let i = 0; i < this.props.columns.length; i++) {
            let it = this.props.columns[i];

            switch (it.dataKey) {
                case 'productionObjectName':
                    bodyElements.push(productionObjectName(it));
                    break;
                case 'plastName':
                    bodyElements.push(plastName(it));
                    break;
                case 'absDepth':
                    bodyElements.push(absoluteDepth(it));
                    bodyElements.push(plastBorders());
                    break;
                case 'saturation':
                    bodyElements.push(saturation(it, w));
                    break;
                case 'perforation':
                    bodyElements.push(perforationGridBorders(it));
                    bodyElements.push(perforation(it));
                    bodyElements.push(perforationCharts(it));
                    bodyElements.push(researchInflowProfile(it));
                    break;
                case 'packer':
                    bodyElements.push(packer(it, w));
                    bodyElements.push(packerPump(it, w));
                    bodyElements.push(downhole(it, w));
                    break;
                case 'lithology':
                    bodyElements.push(lithology(it, w));
                    break;
                case 'porosity':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(porosity(it, w));
                    break;
                case 'permeability':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(permeability(it, w));
                    break;
                case 'oilSaturation':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(oilSaturation(it, w));
                    break;
                case 'avgVolume':
                    bodyElements.push(separatorLine(it));
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(avgVolume(it, w));
                    break;
                case 'avgTransmissibility':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(avgTransmissibility(it, w));
                    break;
                case 'relLiqInje':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(relLiqInje(it, w));
                    break;
                case 'relLiqInjeAccum':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(relLiqInjeAccum(it, w));
                    break;
                case 'effectiveInjection':
                    bodyElements.push(scaleGrid(it));
                    bodyElements.push(effectiveInjection(it, w));
                    break;
            }

            w += it.width;
        }

        return (
            <g className={'tablet__body'} data-for='tablet-tooltip' data-tip=''>
                {bodyElements}
            </g>
        );
    };
}

const getImagePath = (type: WellTypeEnum) => {
    return cond([
        [equals(WellTypeEnum.Oil), () => '/images/well/drop.svg'],
        [equals(WellTypeEnum.Injection), () => '/images/well/down.svg'],
        [equals(WellTypeEnum.Mixed), () => '/images/well/drop_and_down.svg'],
        [equals(WellTypeEnum.Piezometric), () => '/images/well/drop_time.svg'],
        [T, nul]
    ])(type);
};
