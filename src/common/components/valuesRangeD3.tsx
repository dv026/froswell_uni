import React, { FC, useEffect, useRef } from 'react';

import * as d3 from 'd3';

const defaultTitleFontSize = 18;
const defaultFontSize = 14;
const defaultLineWidth = 100;

interface Props {
    height: number;
    strokeColor?: string;
    strokeWidth?: number;
    title: string;
    width: number;
    x: number;
    y: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xScale: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tickFormat?: any;
    onChangeScale?: (down: boolean) => void;
}

export const ValuesRangeD3: FC<Props> = ({
    x,
    y,
    width,
    height,
    xScale,
    title,
    strokeColor,
    tickFormat,
    onChangeScale
}: Props) => {
    const ref = useRef();

    const tickSize = 6,
        marginTop = 18,
        marginBottom = 16 + tickSize,
        ticks = width / 64;

    height = height + tickSize;

    const midWidth = width / 2;

    useEffect(() => {
        const xAxis = d3.axisBottom(xScale);

        if (tickFormat) {
            xAxis.ticks(ticks, '');
        }

        const svg = d3.select(ref.current);

        svg.selectAll('*').remove();

        svg.append('g').attr('class', 'x axis').style('font-size', defaultFontSize).call(xAxis);

        const textElement = svg.append('g').call(g =>
            g
                .append('text')
                .attr('x', midWidth)
                .attr('y', marginTop + marginBottom - height)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'middle')
                .attr('font-size', defaultTitleFontSize)
                .attr('class', 'title')
                .text(title)
        );

        const bbox = textElement.node().getBBox();

        const midTextWidth = bbox.width / 2;

        svg.append('g').call(p =>
            p
                .append('line')
                .attr('x1', midTextWidth + midWidth - bbox.width - defaultLineWidth)
                .attr('y1', marginTop + marginBottom - height - defaultTitleFontSize / 2)
                .attr('x2', midTextWidth + midWidth - bbox.width - 10)
                .attr('y2', marginTop + marginBottom - height - defaultTitleFontSize / 2)
                .style('stroke', strokeColor ?? 'red')
                .style('stroke-width', 5)
        );

        svg.append('svg:image')
            .attr('x', 6)
            .attr('y', -30)
            .attr('width', 24)
            .attr('height', 24)
            .attr('cursor', 'pointer')
            .attr('xlink:href', '/images/tablet/minus.png')
            .on('click', () => onChangeScale(true));

        svg.append('svg:image')
            .attr('x', width - 24 - 6)
            .attr('y', -30)
            .attr('width', 24)
            .attr('height', 24)
            .attr('cursor', 'pointer')
            .attr('xlink:href', '/images/tablet/plus.png')
            .on('click', () => onChangeScale(false));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xScale.domain()]);

    return (
        <svg
            ref={ref}
            x={x}
            y={y}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ overflow: 'visible', display: 'block', fontSize: '34px' }}
        />
    );
};
