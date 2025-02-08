// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import { ReactElement, ReactNode, WheelEvent } from 'react';
import { PropsWithChildren } from 'react';

import i18n from 'i18next';
import { filter, find, isNil } from 'ramda';
import { AutoSizer } from 'react-virtualized';
import {
    Area,
    AreaChart,
    Brush,
    CartesianGrid,
    ComposedChart,
    LineChart,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    YAxis
} from 'recharts';

import colors from '../../../../theme/colors';
import { ModeTypeEnum } from '../../enums/modeType';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { getFirstIndex } from '../../helpers/charts';
import { mmyyyy } from '../../helpers/date';
import { min, max } from '../../helpers/math';
import { isNullOrEmpty } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { AxisYCommon } from '../charts/axes';
import { NameValueTooltipLineProps } from '../charts/tooltips/nameValueTooltip';

import cssTools from '../tools/tools.module.less';
import css from './index.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

const tickFormatter = date => {
    return mmyyyy(new Date(Date.parse(date)));
};

export type AxisYStock = 'stock';
export type AxesY = AxisYCommon | AxisYStock;

export interface ColumnType {
    key: string;
    name: string;
    order?: number;
    type?: ModeTypeEnum;
    visible?: boolean;
    wellType?: WellTypeEnum;
    yAxisId?: AxesY;

    line: (showRepairs: boolean) => ReactNode;
    legend?: (disabledLines: string[], onClick: (dataKey: string) => void) => ReactNode;
    tooltip?: () => ReactElement<NameValueTooltipLineProps>;
}

export interface ChartProps extends PropsWithChildren {
    data: any;
    className?: string;
    composed?: boolean;
    showBrush?: boolean;
    rangeDataKey?: string;
    rangeXAxisDataKey?: string;
    rangeStroke?: string;
    columns?: Array<ColumnType>;
    disabled?: Array<string>;
    disabledZoom?: boolean;
    bottom?: number;
    right?: number;
    onChangeDisabledLines?: (list: Array<string>) => void;
}

interface ChartState {
    animation: boolean;
    left: string;
    right: string;
    refAreaLeft: string;
    refAreaRight: string;
    startIndex: number;
    endIndex: number;
    uploadId: number;
    isZooming: boolean;
    isDragging: boolean;
}

export class Chart extends Component<ChartProps, ChartState> {
    private activeTooltipIndex: number;
    private dragStartIndex: number;

    private onWheelHandler;

    public constructor(props: ChartProps, context: unknown) {
        super(props, context);

        this.activeTooltipIndex = 0;
        this.dragStartIndex = 0;

        this.state = {
            left: '0',
            right: '0',
            refAreaLeft: '',
            refAreaRight: '',
            animation: true,
            startIndex: 0,
            endIndex: 0,
            uploadId: 0,
            isZooming: false,
            isDragging: false
        };

        this.onWheelHandler = this.onWheel.bind(this);
    }

    public render(): ReactNode {
        if (!this.props.data) {
            return null;
        }

        const allowDrag =
            this.state.startIndex > 0 || (this.state.endIndex > 0 && this.state.endIndex < this.props.data.length - 1);

        const allowAreaZoom =
            !allowDrag && this.state.refAreaLeft && this.state.refAreaRight && !this.props.disabledZoom;

        const showTooltip =
            !this.state.isZooming && !this.state.isDragging && !(this.state.refAreaLeft && this.state.refAreaRight);

        const children = filter(it => !isNil(it) && it.type !== Tooltip, this.props.children as any[]);

        const tooltip = find(it => !isNil(it) && it.type === Tooltip, this.props.children as any[]);

        const classes = cls(this.props.className, this.state.isDragging ? 'grabbing' : allowDrag ? 'allow-grab' : '');

        const chartProps = {
            key: this.state.uploadId,
            data: this.props.data,
            className: classes,
            margin: { top: 30, right: this.props.right ?? 30, left: 30, bottom: this.props.bottom ?? 0 },
            onMouseDown: e => {
                if (!allowDrag) {
                    !isNil(e) && this.setState({ refAreaLeft: e.activeLabel });
                } else {
                    this.dragStartIndex = !isNil(e) ? e.activeTooltipIndex : this.dragStartIndex;
                    this.setState({ isDragging: true });
                }
            },
            onMouseMove: e => {
                if (this.state.isDragging) {
                    const offset = this.dragStartIndex - e.activeTooltipIndex;
                    if (offset !== 0) {
                        this.dragStartIndex = e.activeTooltipIndex;
                        const startIndex = max([0, this.state.startIndex + offset]);
                        const endIndex = min([this.props.data.length - 1, this.state.endIndex + offset]);
                        if (endIndex - startIndex === this.state.endIndex - this.state.startIndex)
                            this.setState({
                                startIndex: startIndex,
                                endIndex: endIndex,
                                uploadId: this.state.uploadId + 1
                            });
                    }
                } else {
                    return this.state.refAreaLeft && !isNil(e) && this.setState({ refAreaRight: e.activeLabel });
                }
            },
            onMouseUp: () => {
                if (!allowDrag) {
                    this.zoom();
                }

                this.setState({ isDragging: false });
            },
            onMouseOver: e => {
                if (!isNil(e)) {
                    this.activeTooltipIndex = e.activeTooltipIndex;
                }
            },
            onMouseOut: e => {
                if (isNil(e)) {
                    this.setState({ isDragging: false });
                }
            }
        };

        const cartesian = <CartesianGrid vertical={false} stroke={colors.control.grey300} />;
        const brush =
            this.props.showBrush && this.props.data.length > 0 ? (
                <Brush
                    travellerWidth={6}
                    dataKey={this.props.rangeXAxisDataKey}
                    height={50}
                    tickFormatter={dt => tickFormatter(dt)}
                    startIndex={this.state.startIndex}
                    endIndex={this.state.endIndex}
                    updateId={this.state.uploadId}
                    onChange={e => this.setState({ startIndex: e.startIndex, endIndex: e.endIndex })}
                >
                    <AreaChart margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
                        <CartesianGrid strokeDasharray='2 2' horizontal={false} />
                        <YAxis hide domain={['auto', 'auto']} />
                        {this.genRangeArea()}
                    </AreaChart>
                </Brush>
            ) : null;

        const areaZoom = allowAreaZoom && (
            <ReferenceArea
                yAxisId='right'
                x1={this.state.refAreaLeft}
                x2={this.state.refAreaRight}
                strokeOpacity={0.2}
            />
        );

        return (
            <>
                {allowDrag && (
                    <div className={css.zoomOut}>
                        <div
                            className={cssTools.tool}
                            data-tip={i18n.t(dict.map.startPosition)}
                            onClick={this.zoomOut.bind(this)}
                        >
                            -
                        </div>
                    </div>
                )}
                <div onWheel={this.onWheelHandler} className={css.mapWheelWrapper}>
                    <AutoSizer>
                        {({ width, height }) =>
                            width && height ? (
                                <ResponsiveContainer width={width} height={height} debounce={1}>
                                    {!!this.props.composed ? (
                                        <ComposedChart {...chartProps}>
                                            {cartesian}
                                            {areaZoom}
                                            {children}
                                            {showTooltip ? tooltip : null}
                                            {brush}
                                        </ComposedChart>
                                    ) : (
                                        <LineChart {...chartProps}>
                                            {cartesian}
                                            {areaZoom}
                                            {children}
                                            {showTooltip ? tooltip : null}
                                            {brush}
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            ) : null
                        }
                    </AutoSizer>
                </div>
            </>
        );
    }

    private onWheel = (e: WheelEvent) => {
        if (isNullOrEmpty(this.props.data)) {
            return;
        }

        const deltaY = e.deltaMode === 1 ? e.deltaY / 3 : e.deltaY / 100;

        const val = deltaY * -1 * max([Math.round(this.props.data.length / 40), 1]);

        const tooltipIndex = min([this.state.startIndex + this.activeTooltipIndex, this.props.data.length - 1]);

        const leftOffset = tooltipIndex - this.state.startIndex;
        const rightOffset = min([this.props.data.length - 1, this.state.endIndex]) - tooltipIndex;
        const maxOffset = max([leftOffset, rightOffset]);

        const left = deltaY < 0 ? Math.round((val * leftOffset) / maxOffset) : val;
        const right = deltaY < 0 ? Math.round((val * rightOffset) / maxOffset) : val;

        const startIndex = this.state.startIndex + left < 0 ? 0 : this.state.startIndex + left;

        const endIndex = min([
            this.props.data.length - 1,
            this.state.endIndex === 0 ? this.props.data.length - 1 : this.state.endIndex - right
        ]);

        if (endIndex - startIndex > 1) {
            this.setState(() => ({
                startIndex: left ? Math.round(startIndex) : this.state.startIndex,
                endIndex: right ? Math.round(endIndex) : this.state.endIndex,
                uploadId: this.state.uploadId + 1,
                isZooming: true
            }));

            setTimeout(() => {
                this.setState({ isZooming: false });
            }, 2000);
        }
    };

    private zoomOut() {
        this.setState(() => ({
            refAreaLeft: '',
            refAreaRight: '',
            left: 'dataMin',
            right: 'dataMax',
            startIndex: 0,
            endIndex: 0,
            uploadId: this.state.uploadId + 1
        }));
    }

    private zoom = () => {
        let { refAreaLeft, refAreaRight } = this.state;

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            this.setState(() => ({
                refAreaLeft: '',
                refAreaRight: ''
            }));
            return;
        }

        // xAxis domain
        if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

        const left = getFirstIndex(this.props.data, this.props.rangeXAxisDataKey, new Date(refAreaLeft));
        const right = getFirstIndex(this.props.data, this.props.rangeXAxisDataKey, new Date(refAreaRight));

        this.setState(() => ({
            refAreaLeft: '',
            refAreaRight: '',
            left: refAreaLeft,
            right: refAreaRight,
            startIndex: Math.min(left, right),
            endIndex: Math.max(left, right),
            uploadId: this.state.uploadId + 1
        }));
    };

    private genRangeArea = () => {
        const { rangeDataKey, rangeStroke } = this.props;

        if (!rangeDataKey || !rangeStroke) {
            return null;
        }

        return (
            <Area
                dataKey={rangeDataKey}
                type='monotone'
                stroke={rangeStroke}
                fill={rangeStroke}
                fillOpacity={0.3}
                isAnimationActive={false}
            />
        );
    };
}
