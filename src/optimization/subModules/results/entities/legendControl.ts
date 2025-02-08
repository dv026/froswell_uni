import * as d3 from 'd3';

import colors from '../../../../../theme/colors';
import { nul } from '../../../../common/helpers/ramda';

export const legendWidth = 300;

export class LegendControl {
    public init = (
        el: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        color: any,
        title: string,
        tickSize = 6,
        width = legendWidth,
        height = 44 + tickSize,
        marginTop = 18,
        marginRight = 5,
        marginBottom = 16 + tickSize,
        marginLeft = 5,
        ticks = width / 64,
        tickFormat = null,
        tickValues = null
    ): void => {
        let tickAdjust = g => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height);
        let x;

        let svg = d3
            .select(el)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .attr('viewBox', [0, 0, width - marginLeft, height] as any)
            .attr('font-size', 20);

        svg.selectAll('*').remove();

        // Continuous
        if (color.interpolate) {
            const n = Math.min(color.domain().length, color.range().length);

            x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

            svg.append('image')
                .attr('x', marginLeft)
                .attr('y', marginTop)
                .attr('width', width - marginLeft - marginRight)
                .attr('height', height - marginTop - marginBottom)
                .attr('preserveAspectRatio', 'none')
                .attr('xlink:href', ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
        }

        // Sequential
        else if (color.interpolator) {
            x = Object.assign(color.copy().interpolator(d3.interpolateRound(marginLeft, width - marginRight)), {
                range() {
                    return [marginLeft, width - marginRight];
                }
            });

            svg.append('image')
                .attr('x', marginLeft)
                .attr('y', marginTop)
                .attr('width', width - marginLeft - marginRight)
                .attr('height', height - marginTop - marginBottom)
                .attr('preserveAspectRatio', 'none')
                .attr('xlink:href', ramp(color.interpolator()).toDataURL());

            // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
            if (!x.ticks) {
                if (tickValues === undefined) {
                    const n = Math.round(ticks + 1);
                    tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
                }

                if (typeof tickFormat !== 'function') {
                    tickFormat = d3.format(tickFormat === undefined ? ',f' : tickFormat);
                }
            }
        }

        // Threshold
        else if (color.invertExtent) {
            const thresholds = color.thresholds
                ? color.thresholds() // scaleQuantize
                : color.quantiles
                ? color.quantiles() // scaleQuantile
                : color.domain(); // scaleThreshold

            const thresholdFormat =
                tickFormat === undefined ? d => d : typeof tickFormat === 'string' ? d3.format(tickFormat) : tickFormat;

            x = d3
                .scaleLinear()
                .domain([-1, color.range().length - 1])
                .rangeRound([marginLeft, width - marginRight]);

            svg.append('g')
                .selectAll('rect')
                .data(color.range())
                .join('rect')
                .attr('x', (d, i) => x(i - 1))
                .attr('y', marginTop)
                .attr('width', (d, i) => x(i) - x(i - 1))
                .attr('height', height - marginTop - marginBottom)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('fill', d => d as any);

            tickValues = d3.range(thresholds.length);
            tickFormat = i => thresholdFormat(thresholds[i], i);
        }

        // Ordinal
        else {
            x = d3
                .scaleBand()
                .domain(color.domain())
                .rangeRound([marginLeft, width - marginRight]);

            svg.append('g')
                .selectAll('rect')
                .data(color.domain())
                .join('rect')
                .attr('x', x)
                .attr('y', marginTop)
                .attr('width', Math.max(0, x.bandwidth() - 1))
                .attr('height', height - marginTop - marginBottom)
                .attr('fill', color);

            tickAdjust = nul;
        }

        svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
                    .tickFormat(typeof tickFormat === 'function' ? tickFormat : undefined)
                    .tickSize(tickSize)
                    .tickValues(tickValues)
            )
            .call(tickAdjust)
            .call(g => g.select('.domain').remove())
            .call(g =>
                g
                    .append('text')
                    .attr('x', marginLeft)
                    .attr('y', marginTop + marginBottom - height - 6)
                    .attr('fill', colors.typo.secondary)
                    .attr('text-anchor', 'start')
                    .attr('font-size', 14)
                    .attr('line-height', 18)
                    .text(title)
            );

        //return svg.node();
    };
}

const ramp = (color, n = 256) => {
    const canvas = d3.create('canvas').attr('width', n).attr('height', 1).node();
    const context = canvas.getContext('2d');
    for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
    }

    return canvas;
};

export const interpolateTurboColors = [
    '#23171b',
    '#271a28',
    '#2b1c33',
    '#2f1e3f',
    '#32204a',
    '#362354',
    '#39255f',
    '#3b2768',
    '#3e2a72',
    '#402c7b',
    '#422f83',
    '#44318b',
    '#453493',
    '#46369b',
    '#4839a2',
    '#493ca8',
    '#493eaf',
    '#4a41b5',
    '#4a44bb',
    '#4b46c0',
    '#4b49c5',
    '#4b4cca',
    '#4b4ecf',
    '#4b51d3',
    '#4a54d7',
    '#4a56db',
    '#4959de',
    '#495ce2',
    '#485fe5',
    '#4761e7',
    '#4664ea',
    '#4567ec',
    '#446aee',
    '#446df0',
    '#426ff2',
    '#4172f3',
    '#4075f5',
    '#3f78f6',
    '#3e7af7',
    '#3d7df7',
    '#3c80f8',
    '#3a83f9',
    '#3985f9',
    '#3888f9',
    '#378bf9',
    '#368df9',
    '#3590f8',
    '#3393f8',
    '#3295f7',
    '#3198f7',
    '#309bf6',
    '#2f9df5',
    '#2ea0f4',
    '#2da2f3',
    '#2ca5f1',
    '#2ba7f0',
    '#2aaaef',
    '#2aaced',
    '#29afec',
    '#28b1ea',
    '#28b4e8',
    '#27b6e6',
    '#27b8e5',
    '#26bbe3',
    '#26bde1',
    '#26bfdf',
    '#25c1dc',
    '#25c3da',
    '#25c6d8',
    '#25c8d6',
    '#25cad3',
    '#25ccd1',
    '#25cecf',
    '#26d0cc',
    '#26d2ca',
    '#26d4c8',
    '#27d6c5',
    '#27d8c3',
    '#28d9c0',
    '#29dbbe',
    '#29ddbb',
    '#2adfb8',
    '#2be0b6',
    '#2ce2b3',
    '#2de3b1',
    '#2ee5ae',
    '#30e6ac',
    '#31e8a9',
    '#32e9a6',
    '#34eba4',
    '#35eca1',
    '#37ed9f',
    '#39ef9c',
    '#3af09a',
    '#3cf197',
    '#3ef295',
    '#40f392',
    '#42f490',
    '#44f58d',
    '#46f68b',
    '#48f788',
    '#4af786',
    '#4df884',
    '#4ff981',
    '#51fa7f',
    '#54fa7d',
    '#56fb7a',
    '#59fb78',
    '#5cfc76',
    '#5efc74',
    '#61fd71',
    '#64fd6f',
    '#66fd6d',
    '#69fd6b',
    '#6cfd69',
    '#6ffe67',
    '#72fe65',
    '#75fe63',
    '#78fe61',
    '#7bfe5f',
    '#7efd5d',
    '#81fd5c',
    '#84fd5a',
    '#87fd58',
    '#8afc56',
    '#8dfc55',
    '#90fb53',
    '#93fb51',
    '#96fa50',
    '#99fa4e',
    '#9cf94d',
    '#9ff84b',
    '#a2f84a',
    '#a6f748',
    '#a9f647',
    '#acf546',
    '#aff444',
    '#b2f343',
    '#b5f242',
    '#b8f141',
    '#bbf03f',
    '#beef3e',
    '#c1ed3d',
    '#c3ec3c',
    '#c6eb3b',
    '#c9e93a',
    '#cce839',
    '#cfe738',
    '#d1e537',
    '#d4e336',
    '#d7e235',
    '#d9e034',
    '#dcdf33',
    '#dedd32',
    '#e0db32',
    '#e3d931',
    '#e5d730',
    '#e7d52f',
    '#e9d42f',
    '#ecd22e',
    '#eed02d',
    '#f0ce2c',
    '#f1cb2c',
    '#f3c92b',
    '#f5c72b',
    '#f7c52a',
    '#f8c329',
    '#fac029',
    '#fbbe28',
    '#fdbc28',
    '#feb927',
    '#ffb727',
    '#ffb526',
    '#ffb226',
    '#ffb025',
    '#ffad25',
    '#ffab24',
    '#ffa824',
    '#ffa623',
    '#ffa323',
    '#ffa022',
    '#ff9e22',
    '#ff9b21',
    '#ff9921',
    '#ff9621',
    '#ff9320',
    '#ff9020',
    '#ff8e1f',
    '#ff8b1f',
    '#ff881e',
    '#ff851e',
    '#ff831d',
    '#ff801d',
    '#ff7d1d',
    '#ff7a1c',
    '#ff781c',
    '#ff751b',
    '#ff721b',
    '#ff6f1a',
    '#fd6c1a',
    '#fc6a19',
    '#fa6719',
    '#f96418',
    '#f76118',
    '#f65f18',
    '#f45c17',
    '#f25916',
    '#f05716',
    '#ee5415',
    '#ec5115',
    '#ea4f14',
    '#e84c14',
    '#e64913',
    '#e44713',
    '#e24412',
    '#df4212',
    '#dd3f11',
    '#da3d10',
    '#d83a10',
    '#d5380f',
    '#d3360f',
    '#d0330e',
    '#ce310d',
    '#cb2f0d',
    '#c92d0c',
    '#c62a0b',
    '#c3280b',
    '#c1260a',
    '#be2409',
    '#bb2309',
    '#b92108',
    '#b61f07',
    '#b41d07',
    '#b11b06',
    '#af1a05',
    '#ac1805',
    '#aa1704',
    '#a81604',
    '#a51403',
    '#a31302',
    '#a11202',
    '#9f1101',
    '#9d1000',
    '#9b0f00',
    '#9a0e00',
    '#980e00',
    '#960d00',
    '#950c00',
    '#940c00',
    '#930c00',
    '#920c00',
    '#910b00',
    '#910c00',
    '#900c00',
    '#900c00',
    '#900c00'
];
