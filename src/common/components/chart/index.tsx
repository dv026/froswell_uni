// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useLayoutEffect, useState } from 'react';
import { ReactElement, ReactNode, WheelEvent } from 'react';
import { PropsWithChildren } from 'react';

import { ParamDate } from 'common/entities/paramDate';
import i18n from 'i18next';
import { WithDate } from 'input/entities/merModel';
import {
    ascend,
    descend,
    filter,
    find,
    head,
    includes,
    isNil,
    map,
    partial,
    prop,
    sortBy,
    sortWith,
    uniqBy
} from 'ramda';
import { AutoSizer } from 'react-virtualized';
import { CartesianGrid, ComposedChart, LineChart, ReferenceArea, Tooltip } from 'recharts';

import colors from '../../../../theme/colors';
import { Range } from '../../entities/range';
import { ModeTypeEnum } from '../../enums/modeType';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { getFirstIndex } from '../../helpers/charts';
import { mmyyyy } from '../../helpers/date';
import { min, max } from '../../helpers/math';
import { isNullOrEmpty } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { AxisYCommon } from '../charts/axes';
import { NameValueTooltipLineProps } from '../charts/tooltips/nameValueTooltip';
import { DateRangeProps } from '../dateRangeNew';
import { DateRangeWrapper } from '../dateRangeWrapper';

import cssTools from '../tools/tools.module.less';
import css from './index.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

const tickFormatter = date => {
    return mmyyyy(new Date(Date.parse(date)));
};

export type AxisYStock = 'stock';
export type AxesY = AxisYCommon | AxisYStock;
export const DefaultMarginOffset = 30;

export interface ColumnType {
    key: string;
    name: string;
    order?: number;
    type?: ModeTypeEnum;
    visible?: boolean;
    wellType?: WellTypeEnum;
    yAxisId?: AxesY;

    line?: (showRepairs: boolean) => ReactNode;
    legend?: (disabledLines: string[], onClick: (dataKey: string) => void) => ReactNode;
    tooltip?: () => ReactElement<NameValueTooltipLineProps>;
}

interface MarginProps {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export interface ChartProps extends PropsWithChildren {
    className?: string;
    columns?: Array<ColumnType>;
    composed?: boolean;
    data: any;
    disabled?: Array<string>;
    disabledZoom?: boolean;
    margin?: MarginProps;
    rangeDataKey?: string;
    rangeStroke?: string;
    rangeXAxisDataKey?: string;
    showBrush?: boolean;
    syncId?: string;
    syncMethod?: (ticks: any[], data: any) => void;
    onChangeDisabledLines?: (list: Array<string>) => void;
}

export const Chart = memo((props: ChartProps) => {
    const [refAreaLeft, setRefAreaLeft] = useState('');
    const [refAreaRight, setRefAreaRight] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [uploadId, setUploadId] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [activeTooltipIndex, setActiveTooltipIndex] = useState(0);
    const [dragStartIndex, setDragStartIndex] = useState(0);

    const [data, setData] = useState([]);

    useLayoutEffect(() => {
        setData(props.data);
    }, [props.data]);

    if (!data) {
        return null;
    }

    const makeColumnData = partial<ColumnType[], string[], boolean, boolean, boolean, ColumnType[]>(getColumnData, [
        props.columns,
        props.disabled
    ]);

    const allowDrag = startIndex > 0 || (endIndex > 0 && endIndex < data.length - 1);

    const allowAreaZoom = !allowDrag && refAreaLeft && refAreaRight && !props.disabledZoom;

    const showTooltip = !isZooming && !isDragging && !(refAreaLeft && refAreaRight);

    const children = filter(it => !isNil(it) && it.type !== Tooltip, props.children as any[]);

    const tooltip = find(it => !isNil(it) && it.type === Tooltip, props.children as any[]);

    const classes = cls(props.className ?? '', isDragging ? 'grabbing' : allowDrag ? 'allow-grab' : '');

    const chartProps = {
        key: uploadId,
        data: data,
        className: classes,
        margin: {
            top: props.margin?.top ?? DefaultMarginOffset,
            right: props.margin?.right ?? DefaultMarginOffset,
            left: props.margin?.left ?? DefaultMarginOffset,
            bottom: props.margin?.bottom ?? 0
        },
        syncId: props.syncId,
        syncMethod: props.syncMethod,
        onMouseDown: e => {
            if (!allowDrag) {
                !isNil(e) && setRefAreaLeft(e.activeLabel);
            } else {
                setDragStartIndex(!isNil(e) ? e.activeTooltipIndex : dragStartIndex);
                setIsDragging(true);
            }
        },
        onMouseMove: e => {
            if (isDragging) {
                const offset = dragStartIndex - e.activeTooltipIndex;
                if (offset !== 0) {
                    setDragStartIndex(e.activeTooltipIndex);
                    if (endIndex - startIndex === endIndex - startIndex) {
                        setStartIndex(max([0, startIndex + offset]));
                        setEndIndex(min([data.length - 1, endIndex + offset]));
                        setUploadId(uploadId + 1);
                    }
                }
            } else {
                return refAreaLeft && !isNil(e) && setRefAreaRight(e.activeLabel);
            }
        },
        onMouseUp: () => {
            if (!allowDrag) {
                zoom();
            }

            setIsDragging(false);
        },
        onMouseOver: e => {
            if (!isNil(e)) {
                setActiveTooltipIndex(e.activeTooltipIndex);
            }
        },
        onMouseOut: e => {
            if (isNil(e)) {
                setIsDragging(false);
            }
        }
    };

    const cartesian = <CartesianGrid vertical={false} stroke={colors.control.grey300} />;
    const brush =
        props.showBrush && props.data.length > 0 ? (
            <DateRangeWrapper
                data={props.data}
                background={getDateRangeBg(makeColumnData(false, false, true), props.data)}
                onChangeRange={setData}
            />
        ) : null;

    const areaZoom = allowAreaZoom && (
        <ReferenceArea yAxisId='right' x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.2} />
    );

    const onWheel = (e: WheelEvent) => {
        if (isNullOrEmpty(data)) {
            return;
        }

        const deltaY = e.deltaMode === 1 ? e.deltaY / 3 : e.deltaY / 100;

        const val = deltaY * -1 * max([Math.round(data.length / 40), 1]);

        const tooltipIndex = min([startIndex + activeTooltipIndex, data.length - 1]);

        const leftOffset = tooltipIndex - startIndex;
        const rightOffset = min([data.length - 1, endIndex]) - tooltipIndex;
        const maxOffset = max([leftOffset, rightOffset]);

        const left = deltaY < 0 ? Math.round((val * leftOffset) / maxOffset) : val;
        const right = deltaY < 0 ? Math.round((val * rightOffset) / maxOffset) : val;

        const startIndexLocal = startIndex + left < 0 ? 0 : startIndex + left;

        const endIndexLocal = min([data.length - 1, endIndex === 0 ? data.length - 1 : endIndex - right]);

        if (endIndex - startIndex > 1) {
            setStartIndex(left ? Math.round(startIndex) : startIndex);
            setEndIndex(right ? Math.round(endIndex) : endIndex);
            setUploadId(uploadId + 1);
            setIsZooming(true);

            setTimeout(() => {
                setIsZooming(false);
            }, 2000);
        }
    };

    const zoomOut = () => {
        setRefAreaLeft('');
        setRefAreaRight('');
        setStartIndex(0);
        setEndIndex(0);
        setUploadId(uploadId + 1);
    };

    const zoom = () => {
        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setRefAreaLeft('');
            setRefAreaRight('');
            return;
        }

        // xAxis domain
        //if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

        const left = getFirstIndex(data, props.rangeXAxisDataKey ?? '', new Date(refAreaLeft));
        const right = getFirstIndex(data, props.rangeXAxisDataKey ?? '', new Date(refAreaRight));

        setRefAreaLeft('');
        setRefAreaRight('');
        setStartIndex(Math.min(left, right));
        setEndIndex(Math.max(left, right));
        setUploadId(uploadId + 1);
    };

    return (
        <>
            {allowDrag && (
                <div className={css.zoomOut}>
                    <div
                        className={cssTools.tool}
                        data-tip={i18n.t(dict.map.startPosition)}
                        onClick={zoomOut.bind(this)}
                    >
                        -
                    </div>
                </div>
            )}
            <div onWheel={onWheel} className={css.mapWheelWrapper}>
                <AutoSizer>
                    {({ width, height }) =>
                        width && height ? (
                            !!props.composed ? (
                                <ComposedChart {...chartProps} width={width} height={height}>
                                    {cartesian}
                                    {areaZoom}
                                    {children}
                                    {showTooltip ? tooltip : null}
                                </ComposedChart>
                            ) : (
                                <LineChart {...chartProps} width={width} height={height}>
                                    {cartesian}
                                    {areaZoom}
                                    {children}
                                    {showTooltip ? tooltip : null}
                                </LineChart>
                            )
                        ) : null
                    }
                </AutoSizer>
            </div>
            {brush}
        </>
    );
});

const getDateRangeBg = (columns: ColumnType[], data: WithDate[]): DateRangeProps<Range<Date>>['background'] => {
    const mainColumn = head(sortBy(prop('order'), columns));
    if (!mainColumn) {
        return { data: [], type: 'oil' };
    }

    return {
        data: map<WithDate, ParamDate>(x => ({ date: x.dt, value: x[mainColumn.key] }), data),
        type: mainColumn.wellType === WellTypeEnum.Injection ? 'injection' : 'oil'
    };
};

const getColumnData = (
    columns: ColumnType[],
    disabled: string[],
    includeDisabled: boolean,
    toSort: boolean,
    sortDesc: boolean
): ColumnType[] => {
    const byOrder = (x: ColumnType) => x.order;
    const sortAscFn = sortWith([ascend(byOrder)]);
    const sortDescFn = sortWith([descend(byOrder)]);

    return uniqBy(
        (x: ColumnType) => x.key,
        filter(
            w => !includeDisabled || (includeDisabled && !includes(w.key, disabled)),
            toSort ? ((sortDesc ? sortDescFn(columns) : sortAscFn(columns)) as Array<ColumnType>) : columns
        )
    );
};
