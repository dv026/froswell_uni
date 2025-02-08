/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import React, { FC } from 'react';

import * as d3 from 'd3';
import i18n from 'i18next';
import { filter, includes, isNil, join, map } from 'ramda';
import { useTranslation } from 'react-i18next';

import colors from '../../../../../theme/colors';
import { mmyyyy, yyyy } from '../../../../common/helpers/date';
import { max, min, round0 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { ChartModel } from '../entities/chartModel';
import { TargetOptionModel } from '../entities/targetOptionModel';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const dragbarw = 4;
const xTextMargin = 4;
const yTextMargin = 2;

const margin = { top: 50, right: 20, bottom: 100, left: 40 };
const brushMargin = { top: 20, right: 20, bottom: 30, left: 40 };

const mininalOilRectangle = 5;

const focusHeight = 100;

const paramArray = [
    i18n.t(dict.optimization.goals.productionOil),
    i18n.t(dict.optimization.goals.productionLiquid),
    i18n.t(dict.optimization.goals.productionInjection)
];

const rectColorArray = [colors.colors.brown, '#FFF9E9', '#DEE6F4'];
const lineColorArray = [colors.paramColors.oil, colors.paramColors.liquid, colors.paramColors.injection];
const colorDragArray = [colors.paramColors.oil, colors.paramColors.liquid, colors.paramColors.injection];

const rectangleTitle = d => paramArray[d.type - 1];
const rectColorMapper = (type: number): string => rectColorArray[type - 1];
const colorDragRect = (type: number) => colorDragArray[type - 1];
const labelByType = (type: number) =>
    type === 1
        ? ''
        : type === 2
        ? i18n.t(dict.optimization.goals.limitLiquid)
        : i18n.t(dict.optimization.goals.limitInjection);
const unitByType = (type: number) =>
    type === 1 ? i18n.t(dict.optimization.goals.dayTons) : i18n.t(dict.optimization.goals.dayM3);

interface RectRange {
    id: number;
    type: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

interface IRectProps {
    width: number;
    height: number;
    zones: TargetOptionModel[];
    data: ChartModel[];
    xRange: Date[];
    yRange: number[];
    showPredictionChart: boolean;
    updateTargetZone(model: TargetOptionModel): void;
    removeTargetZone(model: TargetOptionModel): void;
}

export const TargetZone: FC<IRectProps> = (p: IRectProps) => {
    const { t } = useTranslation();
    const d3Container = React.useRef(null);
    const brushContainer = React.useRef(null);

    let isDragging = false;
    let selectedZone = null;
    let gb = null;

    const width = p.width - margin.left - margin.right;
    const height = p.height - margin.top - margin.bottom;

    const xScale = d3.scaleTime().domain(p.xRange).range([0, width]);

    const yScale = d3.scaleLinear().domain(p.yRange).range([height, 0]);

    const dataMapper = (data: TargetOptionModel[]): RectRange[] =>
        map(
            it => ({
                id: it.id,
                type: it.type,
                x: xScale(new Date(it.minDate)),
                y: yScale(it.maxValue),
                width: xScale(new Date(it.maxDate)) - xScale(new Date(it.minDate)),
                height: yScale(it.minValue) - yScale(it.maxValue),
                color: rectColorMapper(it.type)
            }),
            data
        );

    const [zones, setDate] = React.useState<RectRange[]>(dataMapper(p.zones));

    const dataOnlyReal = () => filter(x => x.isReal, p.data);

    const xDataRange = () => {
        const x1 = new Date(min(map(it => new Date(it.dt).getTime(), dataOnlyReal())));
        const x2 = new Date(max(map(it => new Date(it.dt).getTime(), dataOnlyReal())));

        return [x1, x2];
    };

    React.useEffect(
        () => {
            setDate(dataMapper(p.zones));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [p.zones, p.data, p.xRange, p.yRange, p.showPredictionChart]
    );

    d3.select(d3Container.current).selectAll('*').remove();

    const svg = d3
        .select(d3Container.current)
        .append('g')
        .attr('font-size', '14px')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const parentGroup = node => d3.select(node.parentNode);
    const dragrect = node => d3.select(node.parentNode).select('.rectangle') as any;
    const dragbarleft = node => d3.select(node.parentNode).select('.dragleft') as any;
    const dragbarright = node => d3.select(node.parentNode).select('.dragright') as any;
    const dragbartop = node => d3.select(node.parentNode).select('.dragtop') as any;
    const dragDashLinetop = node => d3.select(node.parentNode).select('.dash-line') as any;
    const dragbarbottom = node => d3.select(node.parentNode).select('.dragbottom') as any;

    const dragRectangleTitle = node => d3.select(node.parentNode).select('.rectangle-title') as any;

    const dragLeftLabel = node => d3.select(node.parentNode).select('.dragleft-label') as any;
    const dragRightLabel = node => d3.select(node.parentNode).select('.dragright-label') as any;
    const dragTopLabel = node => d3.select(node.parentNode).select('.dragtop-label') as any;
    const dragBottomLabel = node => d3.select(node.parentNode).select('.dragbottom-label') as any;

    const dragLeftGroup = node => d3.select(node.parentNode).select('.dragleft-group') as any;
    const dragRightGroup = node => d3.select(node.parentNode).select('.dragright-group') as any;
    const dragTopGroup = node => d3.select(node.parentNode).select('.dragtop-group') as any;
    const dragBottomGroup = node => d3.select(node.parentNode).select('.dragbottom-group') as any;

    const leftLabelFormat = d => mmyyyy(new Date(xScale.invert(d.x)));
    const rightLabelFormat = d => mmyyyy(new Date(xScale.invert(d.x + d.width)));
    const topLabelFormat = d => `${round0(yScale.invert(d.y))} ${unitByType(d.type)}`;
    const bottomLabelFormat = d => `${round0(yScale.invert(d.y + d.height))} ${unitByType(d.type)}`;

    const titleParameter = d => labelByType(d.type);

    const horizontalLimit = (d, v) => Math.max(xScale(xDataRange()[1]), Math.min(width - d.width, v));
    const verticalLimit = (d, v) => Math.max(0, Math.min(height - d.height, v));

    const dragLabel = item => {
        dragRectangleTitle(item).attr('transform', d => `translate(${d.x + 10}, ${d.y + 10})`);
        dragLeftLabel(item).text(leftLabelFormat);
        dragRightLabel(item).text(rightLabelFormat);
        // dragTopLabel(item)
        //     .attr('x', d =>
        //         d.type === 1
        //             ? d.x + d.width / 2
        //             : xScale(xDataRange()[1]) + (xScale(p.xRange[1]) - xScale(xDataRange()[1])) / 2
        //     )
        //     .attr('y', d => (d.type === 1 ? d.y - dragbarw : d.y - dragbarw))
        //     .text(topLabelFormat);
        // dragBottomLabel(item)
        //     .attr('x', d => d.x + d.width / 2)
        //     .attr('y', d => d.y + d.height + dragbarw * 2.5)
        //     .text(bottomLabelFormat);

        dragLeftGroup(item)
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .select('.dragLeft-label')
            .text(leftLabelFormat);

        dragRightGroup(item)
            .attr('transform', d => `translate(${d.x + d.width}, ${d.y})`)
            .select('.dragRight-label')
            .text(rightLabelFormat);

        dragTopGroup(item)
            .attr('transform', d => `translate(${d.type === 1 ? d.x + d.width / 2 : xScale(xDataRange()[1])}, ${d.y})`)
            .select('.dragtop-label')
            .text(topLabelFormat);

        dragBottomGroup(item)
            .attr('transform', d => `translate(${d.x + d.width / 2}, ${d.y + d.height})`)
            .select('.dragbottom-label')
            .text(bottomLabelFormat);
    };

    const handleRemoveTarget = d => {
        p.removeTargetZone(d);
    };

    const dragstarted = (d, i, obj) => {
        isDragging = true;
        parentGroup(obj[i]).attr('z-index', 1000);
    };

    const dragended = d => {
        isDragging = false;
        p.updateTargetZone({
            id: d.id,
            minDate: new Date(xScale.invert(d.x)),
            maxDate: new Date(xScale.invert(d.x + d.width)),
            minValue: round0(yScale.invert(d.y + d.height)),
            maxValue: round0(yScale.invert(d.y))
        } as TargetOptionModel);
    };

    const dragmove = (d, i, obj) => {
        dragrect(obj[i])
            .attr('x', (d.x = horizontalLimit(d, d3.event.x)))
            .attr('y', (d.y = verticalLimit(d, d3.event.y)));
        dragbarleft(obj[i])
            .attr('x', d => d.x - dragbarw / 2)
            .attr('y', d => d.y + dragbarw / 2);
        dragbarright(obj[i])
            .attr('x', d => d.x + d.width - dragbarw / 2)
            .attr('y', d => d.y + dragbarw / 2);
        dragbartop(obj[i])
            .attr('x', d => d.x + dragbarw / 2)
            .attr('y', d => d.y - dragbarw / 2);
        dragbarbottom(obj[i])
            .attr('x', d => d.x + dragbarw / 2)
            .attr('y', d => d.y + d.height - dragbarw / 2);

        dragLabel(obj[i]);
    };

    const ldragresize = (d, i, obj) => {
        //Max x on the right is x + width - dragbarw
        //Max x on the left is 0 - (dragbarw/2)
        const newx = Math.max(xScale(xDataRange()[1]), Math.min(d.x + d.width, d3.event.x));
        const width = d.width + (d.x - newx);

        dragrect(obj[i])
            .attr('x', (d.x = newx))
            .attr('width', (d.width = width));
        dragbarleft(obj[i]).attr('x', newx - dragbarw / 2);
        dragbartop(obj[i])
            .attr('x', newx + dragbarw / 2)
            .attr('width', width - dragbarw);
        dragbarbottom(obj[i])
            .attr('x', newx + dragbarw / 2)
            .attr('width', width - dragbarw);

        dragLabel(obj[i]);
    };

    const rdragresize = (d, i, obj) => {
        //Max x on the left is x - width
        //Max x on the right is width of screen + (dragbarw/2)
        const dragx = Math.max(d.x, Math.min(width, d.x + d.width + d3.event.dx));
        //recalculate width
        const w = dragx - d.x;

        //resize the drag rectangle
        dragrect(obj[i]).attr('width', (d.width = w));
        //move the right drag handle
        dragbarright(obj[i]).attr('x', dragx - dragbarw / 2);
        //as we are only resizing from the right, the x coordinate does not need to change
        dragbartop(obj[i]).attr('width', w - dragbarw);
        dragbarbottom(obj[i]).attr('width', w - dragbarw);

        dragLabel(obj[i]);
    };

    const tdragresize = (d, i, obj) => {
        //Max x on the right is x + width - dragbarw
        //Max x on the left is 0 - (dragbarw/2)
        const newy = Math.max(0, Math.min(d.y + d.height - mininalOilRectangle, d3.event.y));
        const height = d.height + (d.y - newy);

        dragrect(obj[i])
            .attr('y', (d.y = newy))
            .attr('height', (d.height = height));
        dragbartop(obj[i]).attr('y', newy - dragbarw / 2);
        dragbarleft(obj[i])
            .attr('y', newy + dragbarw / 2)
            .attr('height', height - dragbarw);
        dragbarright(obj[i])
            .attr('y', newy + dragbarw / 2)
            .attr('height', height - dragbarw);

        dragDashLinetop(obj[i])
            .attr('x1', xScale(p.xRange[0]))
            .attr('y1', newy)
            .attr('x2', xScale(p.xRange[1]))
            .attr('y2', newy);

        dragLabel(obj[i]);
    };

    const bdragresize = (d, i, obj) => {
        //Max x on the left is x - width
        //Max x on the right is width of screen + (dragbarw/2)
        const dragy = Math.max(d.y + mininalOilRectangle, Math.min(height, d.y + d.height + d3.event.dy));
        //recalculate width
        const h = dragy - d.y;
        //resize the drag rectangle
        //as we are only resizing from the right, the x coordinate does not need to change
        dragrect(obj[i]).attr('height', (d.height = h));
        //move the right drag handle
        dragbarbottom(obj[i]).attr('y', dragy - dragbarw / 2);
        dragbarleft(obj[i]).attr('height', h - dragbarw);
        dragbarright(obj[i]).attr('height', h - dragbarw);

        dragLabel(obj[i]);
    };

    const appendAxes = () => {
        const formatTick = d => {
            return d;
        };

        svg.selectAll('.background-rect').remove();

        const backRect = svg.append('g').attr('class', 'background-rect');

        // Add background rectangle
        backRect
            .append('rect')
            .attr('fill', '#F4F4F4')
            .attr('fill-opacity', 0.5)
            .attr('width', xScale(xDataRange()[1]))
            .attr('height', height);

        backRect
            .append('text')
            .text(t(dict.optimization.goals.fact))
            .attr('font-size', 18)
            .attr('fill', colors.typo.secondary)
            .attr('transform', `translate(${xScale(xDataRange()[1]) / 2 - margin.left}, -15)`);

        backRect
            .append('text')
            .text(t(dict.optimization.goals.prediction))
            .attr('font-size', 18)
            .attr('fill', colors.typo.secondary)
            .attr(
                'transform',
                `translate(${
                    xScale(xDataRange()[1]) + (xScale(p.xRange[1]) - xScale(xDataRange()[1])) / 2 - margin.left
                }, -15)`
            );

        // xAxis
        const xAxis = svg =>
            svg
                .attr('transform', `translate(0,${height})`)
                .call(
                    d3
                        .axisBottom(xScale)
                        // .ticks(d3.timeMonth.every(3))
                        .tickFormat((d: Date) => (d <= d3.timeYear(d) ? yyyy(d) : mmyyyy(d)))
                )
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick text').attr('font-size', '14px'));

        // yAxis
        const yAxis = svg =>
            svg
                .attr('transform', `translate(${0},0)`)
                .call(d3.axisRight(yScale).tickSize(width).tickFormat(formatTick))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick:not(:first-of-type) line').attr('stroke', colors.control.grey300))
                .call(g => g.selectAll('.tick text').attr('font-size', '14px').attr('x', 4).attr('dy', -4));

        svg.selectAll('.axis').remove();

        svg.append('g').attr('class', 'axis').call(xAxis);
        svg.append('g').attr('class', 'axis').call(yAxis);

        svg.append('g')
            .attr('class', 'axis')
            .append('text')
            .text(join('; ')(paramArray))
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(-15, ${height / 2}) rotate(-90)`);

        const line = (key: string): any =>
            d3
                .line()
                .defined((d: any) => !isNil(d[key]) && d.dt >= p.xRange[0] && d.dt <= p.xRange[1])
                .x((d: any) => xScale(d.dt))
                .y((d: any) => yScale(d[key]))
                .curve(d3.curveMonotoneX); // apply smoothing to the line

        svg.selectAll('.lines').remove();

        const linesGroup = svg.append('g').attr('class', 'lines').attr('transform', `translate(0,0)`);

        // Add the line oilRate
        linesGroup
            .append('path')
            .datum(p.data)
            .attr('fill', 'none')
            .attr('stroke', colors.paramColors.oil)
            .attr('stroke-width', 1.5)
            .attr('d', line('oilRate'));

        // Add the line liqRate
        linesGroup
            .append('path')
            .datum(p.data)
            .attr('fill', 'none')
            .attr('stroke', colors.paramColors.liquid)
            .attr('stroke-width', 1.5)
            .attr('d', line('liqRate'));

        // Add the line injection
        linesGroup
            .append('path')
            .datum(p.data)
            .attr('fill', 'none')
            .attr('stroke', colors.paramColors.injection)
            .attr('stroke-width', 1.5)
            .attr('d', line('injection'));

        if (p.showPredictionChart) {
            // Add the line oilRateForecast
            linesGroup
                .append('path')
                .datum(p.data)
                .attr('fill', 'none')
                .attr('stroke', colors.paramColors.oil)
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '5 5')
                .attr('d', line('oilRateForecast'));

            // Add the line liqRateForecast
            linesGroup
                .append('path')
                .datum(p.data)
                .attr('fill', 'none')
                .attr('stroke', colors.paramColors.liquid)
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '5 5')
                .attr('d', line('liqRateForecast'));

            // Add the line injectionForecast
            linesGroup
                .append('path')
                .datum(p.data)
                .attr('fill', 'none')
                .attr('stroke', colors.paramColors.injection)
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '5 5')
                .attr('d', line('injectionForecast'));
        }
    };

    // const appendBrush = () => {
    //     const svg = d3
    //         .select(brushContainer.current)
    //         .attr('viewBox', `0 0 ${width} ${focusHeight}`)
    //         .style('display', 'block')
    //         .attr('font-size', '14px');

    //     d3.select(brushContainer.current).selectAll('*').remove();

    //     const brushed = () => {
    //         if (d3.event.selection) {
    //             //setBrushSelection(d3.event.selection.map(x.invert, x).map(d3.utcDay.round));

    //             svg.property('dt', d3.event.selection.map(x.invert, x).map(d3.utcDay.round));
    //             svg.dispatch('input');
    //         }
    //     };

    //     const brushended = () => {
    //         if (gb && !d3.event.selection) {
    //             gb.call(brush.move, defaultSelection);
    //         }
    //     };

    //     const brush = d3
    //         .brushX()
    //         .extent([
    //             [brushMargin.left, 0.5],
    //             [width - brushMargin.right, focusHeight - brushMargin.bottom + 0.5]
    //         ])
    //         .on('brush', brushed)
    //         .on('end', brushended);

    //     const x = d3
    //         .scaleTime()
    //         .domain(p.xRange)
    //         .range([brushMargin.left, width - brushMargin.right]);

    //     const y = d3
    //         .scaleLinear()
    //         .domain(p.yRange)
    //         .range([height - brushMargin.bottom, brushMargin.top]);

    //     const defaultSelection = [x(d3.utcYear.offset(x.domain()[1], -3)), x.range()[1]];

    //     const xAxis = (g, x, height) =>
    //         g.attr('transform', `translate(0,${height - brushMargin.bottom})`).call(
    //             d3
    //                 .axisBottom(x)
    //                 .ticks(width / 80)
    //                 .tickSizeOuter(0)
    //         );

    //     // const yAxis = (g, y, title) =>
    //     //     g
    //     //         .attr('transform', `translate(${brushMargin.left},0)`)
    //     //         .call(d3.axisLeft(y))
    //     //         .call(g => g.select('.domain').remove())
    //     //         .call(g =>
    //     //             g
    //     //                 .selectAll('.title')
    //     //                 .data([title])
    //     //                 .join('text')
    //     //                 .attr('class', 'title')
    //     //                 .attr('x', -brushMargin.left)
    //     //                 .attr('y', 10)
    //     //                 .attr('fill', 'currentColor')
    //     //                 .attr('text-anchor', 'start')
    //     //                 .text(title)
    //     //         );

    //     const area = (x, y, key): any =>
    //         d3
    //             .area()
    //             .defined(d => !isNaN(d[key]) && !isNil(d[key]))
    //             .x(d => x(d['dt']))
    //             .y0(y(0))
    //             .y1(d => y(d[key]))
    //             .curve(d3.curveMonotoneX);

    //     svg.append('g').call(xAxis, x, focusHeight);
    //     //svg.append('g').call(yAxis, y, focusHeight);

    //     svg.append('path')
    //         .datum(p.data)
    //         .attr('fill', opacity(colors.paramColors.oil, 0.1))
    //         // .attr('stroke', colors.paramColors.oil)
    //         // .attr('stroke-width', 1.5)
    //         .attr('d', area(x, y.copy().range([focusHeight - brushMargin.bottom, 4]), 'oilRate'));

    //     gb = svg.append('g').call(brush).call(brush.move, defaultSelection);
    // };

    const appendLegends = () => {
        const lineLegend = svg
            .selectAll('.legend')
            .data(paramArray)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(${210 * i},${height + margin.bottom / 2})`);

        lineLegend.append('text').text(d => d);

        lineLegend
            .append('line')
            .attr('x1', 0)
            .attr('y1', 15)
            .attr('x2', 45)
            .attr('y2', 15)
            .attr('stroke', (d, i) => lineColorArray[i])
            .attr('stroke-width', 4)
            .attr('stroke-dasharray', '5 3')
            .attr('stroke-linejoin', 'round');

        lineLegend
            .append('rect')
            .attr('fill', (d, i) => lineColorArray[i])
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('y', 30)
            .attr('width', 45)
            .attr('height', 4);
    };

    const appendMainRectangle = (rects, visible) => {
        if (visible) {
            const text = rects
                .enter()
                .append('text')
                .attr('transform', d => `translate(${d.x + 10}, ${d.y + 10})`)
                .attr('class', 'rectangle-title')
                .attr('fill', colors.typo.primary)
                .attr('font-size', 12)
                .attr('text-anchor', 'start');

            text.append('tspan').text('Планируемая добыча нефти').attr('x', 0).attr('y', '-0.7em').attr('dy', 20);
            //text.append('tspan').text('').attr('x', 0).attr('y', '0.7em').attr('dy', 20);
        }

        rects
            .enter()
            .append('rect')
            .attr('class', 'rectangle')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('x', d => (visible ? d.x : xScale(xDataRange()[1])))
            .attr('y', d => d.y)
            .attr('height', d => d.height)
            .attr('width', visible ? d => d.width : xScale(p.xRange[1]))
            .attr('stroke', colors.colors.brown)
            .attr('stroke-width', 1)
            .attr('fill', d => d.color)
            .attr('fill-opacity', 0.1)
            .attr('cursor', 'move')
            .attr('visibility', visible ? 'visible' : 'hidden')
            .call(drag);
        //.on('mouseenter', handleMouseOver);
    };

    const appendSideRectangle = (
        rects,
        className,
        xTextFn,
        yTextFn,
        xRectFn,
        yRectFn,
        widthFn,
        heightFn,
        labelFormat,
        titleParam,
        onDragFn
    ) => {
        rects
            .enter()
            .call(g => {
                const textAnchor = className === 'dragleft' ? 'start' : className === 'dragright' ? 'end' : 'middle';

                // todo mb
                g.append('text')
                    .attr('font-size', 12)
                    .attr('font-weight', 'bold')
                    .attr('visibility', 'hidden')
                    .attr('text-anchor', textAnchor)
                    .text(labelFormat)
                    .call(getBB);

                const group = g
                    .append('g')
                    .attr('class', `${className}-group`)
                    .attr('transform', d => `translate(${xTextFn(d)}, ${yTextFn(d)})`)
                    .append('g')
                    .attr(
                        'transform',
                        d =>
                            `translate(${titleParam ? xTextMargin + d.bbox.width / 2 : 0}, ${
                                className === 'dragbottom' ? d.bbox.height : -dragbarw
                            })`
                    );

                group
                    .append('rect')
                    .attr('x', d => d.bbox.x)
                    .attr('y', d => d.bbox.y)
                    .style('fill', d => colorDragRect(d.type))
                    .attr('width', d => d.bbox.width + 2 * xTextMargin)
                    .attr('height', d => d.bbox.height + 2 * yTextMargin)
                    .attr('transform', d => `translate(-${xTextMargin}, -${yTextMargin})`)
                    .attr('visibility', includes(className, ['dragleft', 'dragright']) ? 'hidden' : 'visible');

                if (className === 'dragtop') {
                    const gClose = group
                        .append('g')
                        .attr('transform', d => `translate(${d.bbox.x + d.bbox.width}, ${d.bbox.y})`)
                        .call(p =>
                            p
                                .append('rect')
                                .style('fill', d => colorDragRect(d.type))
                                .attr('width', d => 20)
                                .attr('height', d => d.bbox.height + 2 * yTextMargin)
                                .attr('transform', d => `translate(${xTextMargin}, -${yTextMargin})`)
                        )
                        .attr('cursor', 'pointer')
                        .on('click', handleRemoveTarget);

                    gClose
                        .append('g')
                        .attr('transform', d => `translate(8, 1)`)
                        .call(p =>
                            p
                                .append('line')
                                .attr('x1', 1)
                                .attr('y1', 11)
                                .attr('x2', 11)
                                .attr('y2', 1)
                                .style('stroke', colors.typo.light)
                                .style('stroke-width', 2)
                        )
                        .call(p =>
                            p
                                .append('line')
                                .attr('x1', 1)
                                .attr('y1', 1)
                                .attr('x2', 11)
                                .attr('y2', 11)
                                .style('stroke', colors.typo.light)
                                .style('stroke-width', 2)
                        );
                }

                group
                    .append('text')
                    .attr('class', `${className}-label`)
                    .attr('font-size', 12)
                    .attr('font-weight', includes(className, ['dragleft', 'dragright']) ? 'normal' : 'bold')
                    .attr(
                        'fill',
                        includes(className, ['dragleft', 'dragright']) ? colors.typo.secondary : colors.typo.light
                    )
                    .attr('text-anchor', textAnchor)
                    .text(labelFormat);

                group
                    .append('text')
                    .attr('class', `${className}-title`)
                    .attr('font-size', 12)
                    .attr('fill', colors.typo.primary)
                    .attr('text-anchor', 'start')
                    .attr('transform', d => `translate(${xTextMargin * 2 + d.bbox.width / 2 + 20}, -${2})`)
                    .text(titleParam);
            })
            .append('rect')
            .attr('x', xRectFn)
            .attr('y', yRectFn)
            .attr('width', widthFn)
            .attr('height', heightFn)
            .attr('class', className)
            .attr('fill', d => colorDragRect(d.type))
            .attr('fill-opacity', d => (d.type === 1 ? 0 : 1))
            .attr('cursor', includes(className, ['dragleft', 'dragright']) ? 'ew-resize' : 'ns-resize')
            .call(onDragFn);
        //.on('mouseenter', handleMouseOver);
    };

    const generateOilRectangles = () => {
        const groups = svg
            .selectAll('.group')
            .data(filter(it => it.type === 1, zones))
            .enter()
            .append('g')
            .attr('class', 'group');

        const rects = groups.selectAll('rect').data(d => [d]);

        appendMainRectangle(rects, true);

        appendSideRectangle(
            rects,
            'dragleft',
            d => d.x,
            d => d.y,
            d => d.x - dragbarw / 2,
            d => d.y + dragbarw / 2,
            d => dragbarw,
            d => d.height - dragbarw,
            leftLabelFormat,
            null,
            dragleft
        );

        appendSideRectangle(
            rects,
            'dragright',
            d => d.x + d.width,
            d => d.y,
            d => d.x + d.width - dragbarw / 2,
            d => d.y + dragbarw / 2,
            d => dragbarw,
            d => d.height - dragbarw,
            rightLabelFormat,
            null,
            dragright
        );

        appendSideRectangle(
            rects,
            'dragtop',
            d => d.x + d.width / 2,
            d => d.y,
            d => d.x + dragbarw / 2,
            d => d.y - dragbarw / 2,
            d => d.width - dragbarw,
            d => dragbarw,
            topLabelFormat,
            null,
            dragtop
        );

        appendSideRectangle(
            rects,
            'dragbottom',
            d => d.x + d.width / 2,
            d => d.y + d.height,
            d => d.x + dragbarw / 2,
            d => d.y + d.height - dragbarw / 2,
            d => d.width - dragbarw,
            d => dragbarw,
            bottomLabelFormat,
            null,
            dragbottom
        );
    };

    const generateLiqAndInjLimits = () => {
        const groups = svg
            .selectAll('.group-limit')
            .data(filter(it => it.type !== 1, zones))
            .enter()
            .append('g')
            .attr('class', 'group-limit');

        const rects = groups.selectAll('rect').data(d => [d]);

        appendMainRectangle(rects, false);

        rects
            .enter()
            .append('line')
            .attr('class', 'dash-line')
            .attr('x1', xScale(p.xRange[0]))
            .attr('y1', d => d.y)
            .attr('x2', xScale(p.xRange[1]))
            .attr('y2', d => d.y)
            .attr('stroke', d => colorDragRect(d.type))
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '5 5');

        appendSideRectangle(
            rects,
            'dragtop',
            d => xScale(xDataRange()[1]),
            d => d.y,
            d => xScale(xDataRange()[1]),
            d => d.y - dragbarw / 2,
            d => xScale(p.xRange[1]) - xScale(xDataRange()[1]),
            d => dragbarw,
            topLabelFormat,
            titleParameter,
            dragtop
        );
    };

    const appendRectangles = () => {
        svg.selectAll('.group').remove();
        svg.selectAll('.group-limit').remove();

        if (isNullOrEmpty(zones)) {
            return;
        }

        generateOilRectangles();
        generateLiqAndInjLimits();
    };

    const drag = d3.drag().on('drag', dragmove).on('start', dragstarted).on('end', dragended);

    const dragright = d3.drag().on('drag', rdragresize).on('end', dragended);
    const dragleft = d3.drag().on('drag', ldragresize).on('end', dragended);
    const dragtop = d3.drag().on('drag', tdragresize).on('end', dragended);
    const dragbottom = d3.drag().on('drag', bdragresize).on('end', dragended);

    appendAxes();
    appendRectangles();
    appendLegends();
    //appendBrush();

    return (
        <>
            <svg className='d3-component' width={p.width} height={p.height} ref={d3Container} />
            {/* <svg className='d3-component' width={p.width} height={focusHeight} ref={brushContainer} /> */}
        </>
    );
};

const getBB = selection =>
    selection.each(function (d) {
        d.bbox = this.getBBox();
    });
