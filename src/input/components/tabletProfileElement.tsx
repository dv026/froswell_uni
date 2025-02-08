import React from 'react';

import * as d3 from 'd3';
import { ScaleLinear } from 'd3-scale';
import i18n from 'i18next';
import * as R from 'ramda';
import { filter, forEach, includes, isNil, mapObjIndexed } from 'ramda';

import { ValuesRangeD3 } from '../../common/components/valuesRangeD3';
import { Point } from '../../common/entities/canvas/point';
import { SaturationType } from '../../common/entities/saturationType';
import { ddmmyyyy } from '../../common/helpers/date';
import { path } from '../../common/helpers/map/sizeResolver';
import { round1 } from '../../common/helpers/math';
import * as Prm from '../../common/helpers/parameters';
import { groupByProp, isNullOrEmpty, mapIndexed } from '../../common/helpers/ramda';
import { TabletColumn } from '../entities/tabletColumn';
import { TabletLoggingChart } from '../entities/tabletLoggingChart';
import {
    TabletLogging,
    TabletModel,
    TabletPerforation,
    TabletResearchInflowProfile,
    TabletSaturationColor,
    TabletTrajectory
} from '../entities/tabletModel';
import { WellLoggingEnum } from '../enums/wellLoggingEnum';
import {
    ascBy,
    descBy,
    getExtremum,
    getExtremumByObject,
    tooltipLabelSaturationParameter,
    tooltipLabelStringParameter
} from '../helpers/tabletHelper';
import { defaultHeaderHeight, defaultTabletMargin, defaultTabletStep } from './tablet';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

const defaultStrokeWidth = 1.5;
const defaultBoldStrokeWidth = 3;
const defaultFontSize = 24;

const defaultColumnVerticalHeight = 150;

const colorNone = 'none';
const colorBlack = 'black';
const colorWhite = 'white';
const colorBlue = 'blue';
const colorRed = 'red';

const stratigraphyColumns: Array<TabletColumn> = [
    { index: 1, label: i18n.t(mainDict.common.object), dataKey: 'productionObjectName', width: 50 },
    { index: 2, label: i18n.t(mainDict.common.plast), dataKey: 'plastName', width: 50 },
    { index: 3, label: Prm.absDepth(), dataKey: 'absDepth', width: 100 }
];

const columns: Array<TabletColumn> = [
    { index: 1, label: '', dataKey: '', width: 100, strokeColor: colorNone, background: colorNone },
    { index: 2, label: Prm.saturation(), dataKey: 'saturation', width: 40 },
    {
        index: 3,
        label: Prm.perforation(),
        dataKey: 'perforation',
        width: 100,
        horizontal: true,
        strokeColor: colorNone,
        background: colorNone
    }
];

const saturationColor: TabletSaturationColor[] = [
    { type: SaturationType.Oil, color: '#A25F2A' },
    { type: SaturationType.Water, color: '#4682B4' },
    { type: SaturationType.Unknown, color: 'gray' },
    { type: SaturationType.UnclearCharacterInCollector, color: 'gray' },
    { type: SaturationType.OilPlusWater, color: '#CCFF99' },
    { type: SaturationType.WaterPlusOil, color: '#7FD4FF' }
];

export const columnStratigraphyWidth = R.sum(R.map(it => it.width, stratigraphyColumns));

export const columnWidth = R.sum(R.map(it => it.width, columns));

export interface TabletProfileElementProps {
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

    wellName: string;
    data: TabletModel[];
    nextData: TabletModel[];
    perforation: TabletPerforation[];
    trajectories: TabletTrajectory[];
    wellLogging: TabletLogging[];
    researchInflowProfile: TabletResearchInflowProfile[];

    selectedLogging: WellLoggingEnum[];

    showStratigraphy: boolean;

    loggingChart: TabletLoggingChart[];
    trajectoryScale: ScaleLinear<number, number, never>;
}

interface TabletProfileElementState {
    loggingChart: TabletLoggingChart[];
}

export class TabletProfileElement extends React.PureComponent<TabletProfileElementProps, TabletProfileElementState> {
    public constructor(props: TabletProfileElementProps, context: unknown) {
        super(props, context);

        this.state = {
            loggingChart: this.props.loggingChart
        };
    }

    public render(): React.ReactNode {
        const { offsetX, width, height, data, nextData, perforation, wellName } = this.props;
        return (
            <svg id={`tablet_${wellName}`} x={offsetX} y={0} width={width + 100} height={height}>
                {this.renderSvgBody(data, nextData, perforation)}
                {this.renderSvgHeader(wellName)}
            </svg>
        );
    }

    private columnWidth = R.sum(R.map(it => it.width, columns));

    private currentRealDepth = value => this.props.trajectoryScale(value);

    private columns = () =>
        mapIndexed(
            (it: TabletColumn, i) => {
                let item = it;
                item.index = i + 1;
                return item;
            },
            this.props.showStratigraphy ? R.concat(stratigraphyColumns, columns) : columns
        ) as Array<TabletColumn>;

    private startBlockWidth = columnIndex =>
        R.sum(R.map<TabletColumn, number>(it => it.width, R.take(columnIndex - 1, this.columns())));
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

    private renderSvgHeader = (wellName: string) => {
        const y = this.props.headerOffset >= 0 ? 0 : Math.abs(this.props.headerOffset / this.props.zoom);

        let headerElements = [];

        for (let i = 0, w = 0; i < this.columns().length; i++) {
            let it = this.columns()[i];
            headerElements.push(
                <>
                    <rect
                        x={w}
                        y={0}
                        width={it.width}
                        height={defaultHeaderHeight}
                        fill={colorWhite}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                    />
                    {it.horizontal ? (
                        <text x={w + 50} y={defaultHeaderHeight / 2} fontSize={defaultFontSize} fontWeight='bold'>
                            <tspan fontWeight='bold'>{it.label}</tspan>
                        </text>
                    ) : (
                        <text
                            transform='rotate(-90)'
                            x={defaultHeaderHeight * -1 + 50}
                            y={w + it.width / 2 + defaultFontSize / 2}
                            fontSize={defaultFontSize}
                            fontWeight='bold'
                        >
                            <tspan fontWeight='bold'>{it.label}</tspan>
                        </text>
                    )}
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
                        key={index}
                        x={250}
                        y={defaultHeaderHeight - 30 - index * 60}
                        width={500}
                        height={50}
                        title={it.label}
                        xScale={it.scale}
                    />
                ),
                logging
            );
        }

        return (
            <svg
                className={'tablet__header'}
                x={0}
                y={y}
                width={this.columnWidth + (this.props.showStratigraphy ? 200 : 0)}
                height={defaultHeaderHeight}
            >
                <g>
                    {headerElements}
                    {loggingScaleElements}
                    <rect
                        x={this.props.showStratigraphy ? columnStratigraphyWidth : 0}
                        y={0}
                        width={this.columnWidth}
                        height={defaultHeaderHeight}
                        fill={colorWhite}
                        strokeWidth={defaultStrokeWidth}
                        stroke={colorBlack}
                    />
                    <text
                        x={
                            this.props.showStratigraphy
                                ? columnStratigraphyWidth + this.columnWidth / 2
                                : this.columnWidth / 2
                        }
                        y={defaultHeaderHeight / 2}
                        dominantBaseline={'middle'}
                        textAnchor={'middle'}
                        fontSize={40}
                        fontWeight={'bold'}
                    >
                        {wellName}
                    </text>
                </g>
            </svg>
        );
    };

    private renderSvgBody = (data: TabletModel[], nextData: TabletModel[], perforationData: TabletPerforation[]) => {
        const minTop = getExtremum(ascBy, 'topAbs', data);
        const maxBottom = getExtremum(descBy, 'bottomAbs', data);

        const productionObjectName = (column: TabletColumn) => {
            let startWidth = this.startBlockWidth(column.index);

            return mapIndexed((it: string, index) => {
                if (!it) {
                    return null;
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

                let pathId = `path_prod_obj_column_${index}`;

                return (
                    <g key={`g_prod_obj_${index}`}>
                        <line
                            x1={startWidth}
                            y1={topY}
                            x2={startWidth + column.width}
                            y2={topY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlack}
                        />
                        <line
                            x1={startWidth}
                            y1={bottomY}
                            x2={startWidth + column.width}
                            y2={bottomY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlack}
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
            }, R.uniq(R.map(it => it.productionObjectName, data)));
        };

        const plastName = (column: TabletColumn) => {
            let startWidth = this.startBlockWidth(column.index);
            return mapIndexed((it: number, index) => {
                if (!it) {
                    return null;
                }

                const topY = this.currentY(minTop[it]);
                const bottomY = this.currentY(maxBottom[it]);

                const linePath = () => {
                    return path([
                        new Point(startWidth, (bottomY + topY) / 2 + defaultColumnVerticalHeight),
                        new Point(startWidth, (bottomY + topY) / 2 - defaultColumnVerticalHeight)
                    ]);
                };

                let pathId = `path_plast_column_${index}`;
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
            }, R.uniq(R.map(it => it.plastName, data)));
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

        const plastBorders = (column: TabletColumn) => {
            return R.map(it => {
                let startWidth = this.startBlockWidth(column.index);

                const topY = this.currentY(minTop[it]);
                const bottomY = this.currentY(maxBottom[it]);

                return (
                    <>
                        <line
                            x1={startWidth}
                            y1={topY}
                            x2={startWidth + column.width}
                            y2={topY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlack}
                        />
                        <line
                            x1={startWidth}
                            y1={bottomY}
                            x2={startWidth + column.width}
                            y2={bottomY}
                            strokeWidth={defaultBoldStrokeWidth}
                            stroke={colorBlack}
                        />
                    </>
                );
            }, R.uniq(R.map(it => it.plastName, data)));
        };

        const perforation = (column: TabletColumn) => {
            const block = (actualWidth, it: TabletPerforation) => {
                const result = [];

                const topY = this.currentY(it.topAbs);
                const bottomY = this.currentY(it.bottomAbs);

                const getPerforationPath = () => {
                    return path([
                        new Point(actualWidth - 15, topY),
                        new Point(actualWidth, topY),
                        new Point(actualWidth, bottomY),
                        new Point(actualWidth - 15, bottomY)
                    ]);
                };

                const element = (dt, color, isClosedPeriod: boolean = false) => {
                    const perfPathProps = {
                        d: getPerforationPath(),
                        strokeWidth: 5,
                        stroke: color,
                        fill: isClosedPeriod
                            ? `url(#${color === colorRed ? 'diagonalHatchRed' : 'diagonalHatchGreen'})`
                            : colorNone
                    };

                    return (
                        <g data-for='tablet-tooltip' data-tip={tooltipLabelStringParameter(column, ddmmyyyy(dt))}>
                            <path {...perfPathProps} />
                        </g>
                    );
                };

                result.push(element(it.dt, colorBlack));

                return result;
            };

            let result = [];

            mapObjIndexed(group => {
                let startPerforationWidth = this.startBlockWidth(column.index) + 25;

                mapObjIndexed(item => {
                    return R.map(it => {
                        result.push(block(startPerforationWidth, it));
                    }, item as TabletPerforation[]);
                }, groupByProp('dt', group));
            }, groupByProp('groupId', perforationData));

            return result;
        };

        const perforationCharts = (column: TabletColumn) => {
            const startBlockWidth = this.startBlockWidth(column.index);

            const minRealDepth = this.props.trajectoryScale(this.props.minAbsDepth - defaultColumnVerticalHeight);
            const maxRealDepth = this.props.trajectoryScale(this.props.maxAbsDepth + defaultColumnVerticalHeight);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const line = (key: string, xScale): any =>
                d3
                    .line()
                    .defined(
                        d => !isNil(d[key]) && !isNaN(d[key]) && d['dept'] >= minRealDepth && d['dept'] <= maxRealDepth
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
                    .attr('stroke-width', 1.5)
                    .attr('d', line(it.dataKey, it.scale));
            }, this.selectedLoggingChart());
        };

        const saturation = (column: TabletColumn, w: number) => {
            return R.map(it => {
                const color = R.find(c => c.type === it.saturationTypeId, saturationColor);
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

        const connectSaturation = (column: TabletColumn) => {
            return R.map(it => {
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

                let startWidth = this.startBlockWidth(column.index);

                return (
                    <>
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
                        {nextData && nextTopY > 0 && nextBottomY > 0 ? (
                            <>
                                <line
                                    x1={startWidth + column.width}
                                    y1={topY + defaultStrokeWidth}
                                    x2={startWidth + this.columnWidth}
                                    y2={nextTopY}
                                    strokeWidth={defaultBoldStrokeWidth}
                                    stroke={colorBlue}
                                />
                                <line
                                    x1={startWidth + column.width}
                                    y1={bottomY + defaultStrokeWidth}
                                    x2={startWidth + this.columnWidth}
                                    y2={nextBottomY}
                                    strokeWidth={defaultBoldStrokeWidth}
                                    stroke={colorBlue}
                                />
                            </>
                        ) : null}
                    </>
                );
            }, R.uniq(R.map(it => it.plastName, data)));
        };

        let bodyElements = [];
        for (let i = 0, w = 0; i < this.columns().length; i++) {
            let it = this.columns()[i];
            bodyElements.push(
                <rect
                    x={w}
                    y={defaultHeaderHeight}
                    width={it.width}
                    height={this.props.height - defaultHeaderHeight}
                    fill={it.background ? it.background : colorWhite}
                    strokeWidth={defaultStrokeWidth}
                    stroke={it.strokeColor ? it.strokeColor : colorBlack}
                    data-for='tablet-tooltip'
                    data-tip=''
                />
            );
            w += it.width;
        }

        for (let i = 0, w = 0; i < this.columns().length; i++) {
            let it = this.columns()[i];

            switch (it.dataKey) {
                case 'productionObjectName':
                    bodyElements.push(productionObjectName(it));
                    break;
                case 'plastName':
                    bodyElements.push(plastName(it));
                    bodyElements.push(plastBorders(it));
                    break;
                case 'absDepth':
                    bodyElements.push(absoluteDepth(it));
                    break;
                case 'saturation':
                    bodyElements.push(saturation(it, w));
                    bodyElements.push(connectSaturation(it));
                    break;
                case 'perforation':
                    //bodyElements.push(perforationGridBorders(it, w));
                    bodyElements.push(perforation(it));
                    bodyElements.push(perforationCharts(it));
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
