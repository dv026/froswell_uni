import * as d3 from 'd3';
import { map, uniq, all, equals, isNil, zip } from 'ramda';

import colors from '../../../../../theme/colors';
import { ddmmyyyy } from '../../../../common/helpers/date';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { interpolateTurboColors } from './legendControl';

const height = 16;

const margin = { top: 20, right: 5, bottom: 50, left: 65 };

export interface HeatmapModel {
    min: number;
    max: number;
    names: string[];
    accumulated: string[];
    changes: string[];
    accumulatedAndChanges: string[][];
    values: number[][];
    groups: number[][];
}

export interface HeatmapYearModel extends Omit<HeatmapModel, 'min' | 'max' | 'chartOptions'> {
    year: number;
    years: number[];
}

export class Heatmap {
    private width: number;
    private initialData: HeatmapModel;

    private data2: HeatmapYearModel;
    private innerHeight: number;
    private years: number[];

    public constructor(width: number, initialData: HeatmapModel) {
        this.width = width;
        this.initialData = initialData;
    }

    public init = (el: string, initialData: HeatmapModel, isOil: boolean): void => {
        this.initialData = initialData;
        this.data2 = this.dataPreparation(this.initialData);
        this.innerHeight = height * this.data2.names.length;

        const x = d3
            .scaleLinear()
            .domain([d3.min(this.data2.years), d3.max(this.data2.years) + 1])
            .rangeRound([margin.left, this.width - margin.right]);

        const y = d3
            .scaleBand()
            .domain(this.data2.names)
            .rangeRound([margin.top, margin.top + this.innerHeight]);

        const color = d3.scaleSequentialSqrt(
            [this.initialData.min, this.initialData.max],
            d3.interpolateRgbBasis(interpolateTurboColors)
        );

        const makeDate = it => {
            if (it >= this.years.length || isNil(this.years[it])) {
                return null;
            }

            return new Date(
                `${this.years[it].toString().substring(0, 4)}-${this.years[it].toString().substring(4, 6)}-01`
            );
        };

        const xAxis = g =>
            g
                .call(g =>
                    g
                        .append('g')
                        .attr('transform', `translate(0,${margin.top})`)
                        .call(
                            d3
                                .axisTop(x)
                                .tickFormat((it: number) =>
                                    !isNil(makeDate(it)) ? d3.timeFormat('%m/%Y')(makeDate(it)) : ''
                                )
                        )
                        .call(g => {
                            g.select('.domain').remove();
                            g.selectAll('.tick text').attr('fill', colors.typo.secondary);
                        })
                )
                .call(g =>
                    g
                        .append('g')
                        .attr('transform', `translate(0,${this.innerHeight + margin.top + 4})`)
                        .call(
                            d3
                                .axisBottom(x)
                                .tickValues([this.data2.year])
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                .tickFormat(x => x as any)
                                .tickSize(-this.innerHeight - 10)
                        )
                        .call(g =>
                            g
                                .select('.tick text')
                                .clone()
                                .attr('dy', '2em')
                                .style('font-weight', 'bold')
                                .text('Measles vaccine introduced')
                        )
                        .call(g => g.select('.domain').remove())
                );
        const yAxis = g =>
            g
                .attr('transform', `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSize(0))
                .call(g => {
                    g.select('.domain').remove();
                    g.selectAll('.tick text').attr('font-size', 12).attr('fill', colors.typo.secondary);
                });

        const format = d => (isNaN(d) ? 'N/A' : d === 0 ? '0' : d < 1 ? '<1' : d < 1.5 ? '1' : `${d3.format(',d')(d)}`);

        const svg = d3
            .select(el)
            .attr('viewBox', [
                0,
                0,
                this.width + margin.left + margin.right,
                this.innerHeight + margin.top + margin.bottom
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ] as any)
            .attr('font-family', 'Inter')
            .attr('font-size', 12)
            .attr('line-height', 16);

        svg.selectAll('*').remove();

        svg.append('g').call(xAxis);

        svg.append('g').call(yAxis);

        svg.append('g')
            .selectAll('g')
            .data(this.data2.values)
            .join('g')
            .attr('transform', (d, i) => `translate(0,${y(this.data2.names[i])})`)
            .selectAll('rect')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .data(d => d as any)
            .join('rect')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('x', (d, i) => x(this.data2.years[i]) + 1)
            .attr('width', (d, i) => x(this.data2.years[i] + 1) - x(this.data2.years[i]) - 1)
            .attr('height', y.bandwidth() - 1)
            .attr('fill', (d: number) => (isNaN(d) ? '#eee' : d === 0 ? '#fff' : color(d)))
            .append('title')
            .text((d, i) => `${ddmmyyyy(makeDate(i))}: ${format(d)}`)
            .attr('fill', colors.typo.secondary);

        this.accumulatedValues(svg, isOil);
        this.braces(svg);
    };

    private accumulatedValues = (svg, isOil) => {
        const yh = (d, i) => i * height + margin.top + 12;

        svg.append('g')
            .append('image')
            .attr('transform', `translate(${this.width + 5},0)`)
            .attr('width', 20)
            .attr('height', 20);

        svg.append('text')
            .attr('font-size', 12)
            .attr('transform', `translate(${this.width},${this.innerHeight + height})`)
            .attr('dy', '1.25em')
            .text(isOil ? 'тыс. тонн' : 'тыс. м3')
            .attr('fill', colors.typo.secondary);

        if (isNullOrEmpty(this.data2.accumulatedAndChanges)) {
            svg.append('g')
                .attr('transform', `translate(${this.width},0)`)
                .attr('font-size', 12)
                .attr('text-anchor', 'start')
                .selectAll('text')
                .data(this.data2.accumulated)
                .enter()
                .append('text')
                .attr('y', yh)
                .text(d => d)
                .attr('fill', colors.typo.secondary);
        } else {
            svg.append('g')
                .attr('transform', `translate(${this.width},0)`)
                .attr('font-size', 12)
                .attr('text-anchor', 'start')
                .selectAll('text')
                .data(this.data2.accumulatedAndChanges)
                .enter()
                .append('text')
                .attr('y', yh)
                .text(d => d[0])
                .append('tspan')
                .text(d => d[1])
                .attr('fill', isOil ? 'red' : '#668CCF');
        }
    };

    private braces = svg => {
        const braceData = data => {
            //const brace = 7;
            const padding = 3;
            const marginLeft = 5;

            return map(x => {
                const pos = margin.top + x[0] * height;
                const length = pos + x[1] * height;
                return [
                    //[marginLeft + brace, pos + padding],
                    [marginLeft + 0, pos + padding],
                    [marginLeft + 0, length - padding]
                    //[marginLeft + brace, length - padding]
                ];
            }, data);
        };

        svg.append('g')
            .selectAll('path')
            .data(braceData(this.data2.groups))
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '3')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .attr('d', (d: any) => d3.line()(d));
    };

    private dataPreparation = (data0: HeatmapModel): HeatmapYearModel => {
        if (!data0) {
            return null;
        }

        const customDate = date => {
            const d = new Date(date);
            return d.getFullYear() * 100 + d.getMonth() + 1;
        };

        const values = [];
        const names = data0.names;
        const accumulated = data0.accumulated;
        const groups = data0.groups;
        const changes = all(equals('(0)'))(data0.changes) ? [] : data0.changes;
        const accumulatedAndChanges = zip(accumulated, changes);

        let year0 = d3.min(data0.values, d => d[0]);
        let year1 = d3.max(data0.values, d => d[0]);

        this.years = uniq(map(it => customDate(it[0]), data0.values));
        const years = d3.range(0, this.years.length - 1);

        year0 = this.years.findIndex(x => x === customDate(year0));
        year1 = this.years.findIndex(x => x === customDate(year1));

        for (const [year, i, value] of data0.values) {
            if (value === null) {
                continue;
            }

            (values[i] || (values[i] = []))[this.years.findIndex(x => x === customDate(year)) - year0] = value;
        }

        return {
            accumulated,
            accumulatedAndChanges,
            changes,
            groups,
            names,
            values,
            year: 2000,
            years
        };
    };
}
