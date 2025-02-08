/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/explicit-module-boundary-types */
import { color } from '@chakra-ui/styled-system';
import * as d3 from 'd3';
import i18n from 'i18next';
import { map } from 'ramda';

import colors from '../../../../../theme/colors';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { opacity } from '../../../../common/helpers/colors';
import { round0, round1 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { WellSetupSavedModel } from '../entities/wellSetupSavedModel';
import { GroupType } from '../enums/groupType';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const defaultNickWidth = 30;
const defaultWidthBar = 20;
const defaultHeightBar = 270;

const paddingLeft = 100;
const startX = 200;
const startY = 0;
const tinyPadding = 3;

const margin = { left: 100, right: 30, top: 40, bottom: 10 };

const oilBarColors = [colors.colors.blue, opacity(colors.colors.brown, 0.2)];
const injBarColors = [colors.colors.blue];

const getBarColor = (i: number, wellType: WellTypeEnum) =>
    wellType === WellTypeEnum.Oil ? oilBarColors[i % oilBarColors.length] : injBarColors[i % injBarColors.length];

interface IBarItem {
    label: number;
    liq: number;
    maxPressureZab: number;
    minPressureZab: number;
    oil: number;
    pressureZab: number;
    wellId: number;
    wellName: string;
    isManual: boolean;
}

interface IProps {
    editablePressureZab: WellSetupSavedModel;
    globalMaxPressureZab: number;
    globalMinPressureZab: number;
    groupType: GroupType;
    items: IBarItem[];
    range?: number[][];
    saturationPressure: number;
    type: number;
    wellType: WellTypeEnum;
    createOrUpdate(model: WellSetupSavedModel): void;
}

export const appendLegend = (svg, groupType: GroupType) => {
    const text =
        groupType === GroupType.WaterCut
            ? i18n.t(dict.optimization.wellSetup.watercut)
            : i18n.t(dict.optimization.wellSetup.oil);
    svg.append('g')
        .attr('class', 'legend')
        .append('text')
        .text(text)
        .attr('fill', 'black')
        .attr('font-size', 18)
        .attr('text-anchor', 'start')
        .attr('transform', `translate(0, 25)`);
};

export const appendBar = (svg, p: IProps) => {
    const minX = startX;
    const maxX = startX + p.items.length * (p.items.length === 1 ? paddingLeft * 1.5 : paddingLeft);
    const minY = startY + margin.top;
    const maxY = startY + defaultHeightBar - margin.bottom;

    const xScale = d3
        .scaleBand()
        .domain(map(it => it.wellName, p.items))
        .range([minX + margin.left, maxX + margin.right]);
    const yScale = d3.scaleLinear().domain([100, 0]).range([minY, maxY]);
    const pZabScale = d3.scaleLinear().domain([p.globalMaxPressureZab, 0]).range([minY, maxY]);
    const stackedData = d3.stack().keys(['liq', 'oil'])(p.items as any);

    const isWatercut = p.groupType === GroupType.WaterCut;

    const renderCommonInfo = () => {
        const group = svg.append('g').attr('class', 'common');

        if (isNullOrEmpty(p.items)) {
            group
                .append('text')
                .text(labelByType())
                .attr('fill', isWatercut ? colors.paramColors.watercut : colors.paramColors.oil)
                .attr('font-size', 20)
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'left')
                .attr('transform', `translate(${0}, ${55})`);

            group
                .append('text')
                .text(i18n.t(dict.common.nodata))
                .attr('fill', colors.typo.primary)
                .attr('font-size', 14)
                .attr('font-style', 'italic')
                .attr('text-anchor', 'start')
                .attr('transform', `translate(${180}, ${55})`);

            return;
        }

        // axis y
        group
            .append('g')
            .call(d3.axisLeft(pZabScale))
            .call(g => {
                g.select('.domain').attr('stroke', colors.control.grey400);
                g.selectAll('.tick line').attr('stroke', colors.control.grey400);
                g.selectAll('.tick text').attr('font-size', 12);
            })
            .attr('color', colors.typo.primary)
            .attr('font-size', 12)
            .attr('transform', `translate(${startX}, 0)`);

        // axis x
        group
            .append('g')
            .append('line')
            .attr('class', 'axis-x-baseline')
            .attr('x1', minX)
            .attr('y1', maxY)
            .attr('x2', maxX)
            .attr('y2', maxY)
            .attr('stroke', colors.control.grey400)
            .attr('stroke-width', '1');

        group
            .append('text')
            .text(i18n.t(dict.optimization.wellSetup.pressureBottomHole))
            .attr('fill', colors.typo.primary)
            .attr('font-size', 12)
            .attr('text-anchor', 'end')
            .attr('transform', `translate(${startX}, ${maxY + 25})`);

        group
            .append('text')
            .text(labelByType())
            .attr('fill', isWatercut ? colors.paramColors.watercut : colors.paramColors.oil)
            .attr('font-size', 20)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'left')
            .attr('transform', `translate(${0}, ${yScale(50)})`);
    };

    const renderBars = () => {
        // bars group
        const commonGroups = svg.append('g').attr('class', 'bars');

        const groups = commonGroups
            .selectAll('g')
            .data(stackedData)
            .enter()
            .append('g')
            .attr('fill', (d, i) => getBarColor(i, p.wellType));

        // bars
        groups
            .selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('x', d => xScale(d.data.wellName))
            .attr('y', d => yScale(d[1]))
            .attr('height', d => yScale(d[0]) - yScale(d[1]))
            .attr('width', defaultWidthBar);

        // nick max pressure zab
        groups
            .selectAll('.line-max')
            .data(d => d)
            .enter()
            .append('line')
            .attr('class', 'line-max')
            .attr('x1', d => xScale(d.data.wellName) - defaultNickWidth / 4)
            .attr('y1', d => pZabScale(d.data.maxPressureZab))
            .attr('x2', d => xScale(d.data.wellName) + defaultNickWidth)
            .attr('y2', d => pZabScale(d.data.maxPressureZab))
            .attr('fill', 'none')
            .attr('stroke', colors.colors.blue)
            .attr('stroke-width', '1');

        groups
            .selectAll('.line-max-text')
            .data(d => d)
            .enter()
            .append('text')
            .text(d => round0(d.data.maxPressureZab))
            .attr('x', d => xScale(d.data.wellName) + defaultNickWidth + tinyPadding)
            .attr('y', d => pZabScale(d.data.maxPressureZab) + tinyPadding)
            .attr('fill', 'gray')
            .attr('font-size', 12)
            .attr('text-anchor', 'left');

        // bar label
        commonGroups
            .append('g')
            .attr('class', 'bar-label')
            .selectAll('text')
            .data(p.items)
            .enter()
            .append('text')
            .text(d => d.label)
            .attr('x', d => xScale(d.wellName) + defaultWidthBar / 2)
            .attr('y', d => pZabScale(d.pressureZab / 2))
            .attr('fill', colors.typo.primary)
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle');
    };

    const renderMinimumPressureZabManual = () => {
        if (isNullOrEmpty(p.items)) {
            return;
        }

        const color = isManual => (isManual ? colors.colors.red : colors.colors.blue);

        const lineClass = id => `line-visible-manual-${id}`;
        const textClass = id => `draggable-text-manual-${id}`;

        const label = value => `${round0(value)}`;
        const dragVisibleLine = (d, node) => d3.select(node.parentNode).select('.' + lineClass(d.wellId)) as any;
        const dragText = (d, node) => d3.select(node.parentNode).select('.' + textClass(d.wellId)) as any;

        const dragended = d => {
            const newValue = Math.max(pZabScale(d.maxPressureZab), Math.min(d3.event.y, pZabScale(0)));
            const model = d;
            model.wells = [d.wellId];
            model.minPressureZab = pZabScale.invert(newValue);
            model.isManual = true;
            p.createOrUpdate(d);
        };

        const dragmove = (d, i, obj) => {
            const newValue = Math.max(pZabScale(d.maxPressureZab), Math.min(d3.event.y, pZabScale(0)));
            d3.select(obj[i]).attr('y1', newValue).attr('y2', newValue).attr('stroke', color(true));
            dragVisibleLine(d, obj[i]).attr('y1', newValue).attr('y2', newValue).attr('stroke', color(true));
            dragText(d, obj[i])
                .text(label(pZabScale.invert(newValue)))
                .attr('y', newValue + tinyPadding);
        };

        const drag = d3.drag().on('drag', dragmove).on('end', dragended);

        const groups = svg.append('g').attr('class', 'group-manual-pressure').selectAll('g').data(p.items).enter();

        // nick min pressure zab
        groups
            .selectAll('line')
            .data(d => [d])
            .enter()
            .append('line')
            .attr('class', d => lineClass(d.wellId))
            .attr('x1', d => xScale(d.wellName))
            .attr('y1', d => pZabScale(d.minPressureZab))
            .attr('x2', d => xScale(d.wellName) + defaultNickWidth)
            .attr('y2', d => pZabScale(d.minPressureZab))
            .attr('fill', 'none')
            .attr('stroke', d => color(d.isManual))
            .attr('stroke-width', '1');

        groups
            .selectAll('.line-min-draggable')
            .data(d => [d])
            .enter()
            .append('line')
            .attr('class', 'line-min-draggable')
            .attr('x1', d => xScale(d.wellName))
            .attr('y1', d => pZabScale(d.minPressureZab))
            .attr('x2', d => xScale(d.wellName) + defaultNickWidth)
            .attr('y2', d => pZabScale(d.minPressureZab))
            .attr('fill', 'none')
            .attr('stroke', d => color(d.isManual))
            .attr('stroke-width', '6')
            .attr('cursor', 'ns-resize')
            .style('opacity', 0.5)
            .call(drag);

        groups
            .selectAll('text')
            .data(d => [d])
            .enter()
            .append('text')
            .attr('class', d => textClass(d.wellId))
            .text(d => round0(d.minPressureZab))
            .attr('x', d => xScale(d.wellName) + defaultNickWidth + tinyPadding)
            .attr('y', d => pZabScale(d.minPressureZab) + tinyPadding)
            .attr('fill', 'gray')
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'left');
    };

    // baselines
    const renderBaselines = () => {
        svg.append('g')
            .attr('class', 'baselines')
            .selectAll('line')
            .data(p.items)
            .enter()
            .append('line')
            .attr('x1', d => xScale(d.wellName) - defaultWidthBar / 2)
            .attr('y1', yScale(0))
            .attr('x2', d => xScale(d.wellName) + defaultWidthBar + defaultWidthBar / 2)
            .attr('y2', yScale(0))
            .attr('fill', 'none')
            .attr('stroke', '#333333')
            .attr('stroke-width', '1');
    };

    // well labels
    const renderWellLabels = () => {
        svg.append('g')
            .attr('class', 'well-labels')
            .selectAll('text')
            .data(p.items)
            .enter()
            .append('text')
            .text(d => d.wellName)
            .attr('fill', 'black')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(${xScale(d.wellName) + defaultWidthBar / 2}, ${yScale(0) + 25})`);
    };

    // saturation pressure line
    const renderSaturationPressureLine = () => {
        if (isNullOrEmpty(p.items)) {
            return;
        }

        const group = svg.append('g').attr('class', 'saturation-pressure-line');
        group
            .append('line')
            .attr('x1', minX)
            .attr('y1', pZabScale(p.saturationPressure))
            .attr('x2', maxX)
            .attr('y2', pZabScale(p.saturationPressure))
            .attr('fill', 'none')
            .attr('stroke', colors.typo.yellow)
            .attr('stroke-width', '1')
            .attr('stroke-dasharray', '3 2');

        group
            .append('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('x', minX + tinyPadding * 2)
            .attr('y', pZabScale(p.saturationPressure) - tinyPadding * 2)
            .attr('height', 40)
            .attr('width', 60)
            .attr('fill', colors.control.lightYellow);

        group
            .append('text')
            .attr('x', minX + 11)
            .attr('y', pZabScale(p.saturationPressure) + 8)
            .attr('fill', colors.typo.secondary)
            .attr('font-size', 12)
            .attr('text-anchor', 'start')
            .append('tspan')
            .text(i18n.t(dict.optimization.wellSetup.pressure))
            .attr('class', 'param')
            .append('tspan')
            .text(`${round1(p.saturationPressure)} ${i18n.t(dict.optimization.wellSetup.atm)}`)
            .attr('class', 'value')
            .attr('x', minX + 11)
            .attr('dx', 0)
            .attr('dy', 18);
    };

    // minimum editable pressure zab
    const renderMinimumPressureZab = () => {
        if (isNullOrEmpty(p.items)) {
            return;
        }

        const label = value => `${round0(value)} ${i18n.t(dict.optimization.wellSetup.atm)}`;
        const dragVisibleLine = node => d3.select(node.parentNode).select('.line-visible') as any;
        const draggableTextNode = node => d3.select(node.parentNode).select('.draggable-text') as any;
        const draggableRectNode = node => d3.select(node.parentNode).select('.draggable-rect') as any;

        const dragended = d => {
            const newValue = Math.max(pZabScale(p.globalMaxPressureZab), Math.min(d3.event.y, pZabScale(0)));
            const model = d;
            model.wells = map(it => it.wellId, p.items);
            model.minPressureZab = pZabScale.invert(newValue);
            model.isManual = false;
            p.createOrUpdate(d);
        };

        const dragmove = (d, i, obj) => {
            const newValue = Math.max(pZabScale(p.globalMaxPressureZab), Math.min(d3.event.y, pZabScale(0)));
            d3.select(obj[i]).attr('y1', newValue).attr('y2', newValue);
            dragVisibleLine(obj[i]).attr('y1', newValue).attr('y2', newValue);
            draggableTextNode(obj[i]).attr('y', newValue - tinyPadding);
            draggableTextNode(obj[i])
                .select('.value')
                .text(label(pZabScale.invert(newValue)));
            draggableRectNode(obj[i]).attr('y', newValue - tinyPadding);
        };

        const drag = d3.drag().on('drag', dragmove).on('end', dragended);

        const group = svg.append('g').attr('class', 'min-pressure-zab');
        group
            .selectAll('.line-visible')
            .data([p.editablePressureZab])
            .enter()
            .append('line')
            .attr('class', 'line-visible')
            .attr('x1', minX)
            .attr('y1', d => pZabScale(d.minPressureZab))
            .attr('x2', maxX)
            .attr('y2', d => pZabScale(d.minPressureZab))
            .attr('fill', 'none')
            .attr('stroke', colors.typo.yellow)
            .attr('stroke-width', '2');

        group
            .selectAll('.draggable')
            .data([p.editablePressureZab])
            .enter()
            .append('line')
            .attr('class', 'draggable')
            .attr('x1', minX)
            .attr('y1', d => pZabScale(d.minPressureZab))
            .attr('x2', maxX)
            .attr('y2', d => pZabScale(d.minPressureZab))
            .attr('fill', 'none')
            .attr('stroke', colors.typo.yellow)
            .attr('stroke-width', '6')
            .attr('cursor', 'ns-resize')
            .style('opacity', 0.5)
            .call(drag);

        group
            .append('g')
            .append('rect')
            .attr('class', 'draggable-rect')
            .attr('transform', `translate(${tinyPadding * 2}, ${-tinyPadding * 2})`)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('x', minX)
            .attr('y', pZabScale(p.editablePressureZab.minPressureZab))
            .attr('height', 40)
            .attr('width', 60)
            .attr('stroke', colors.typo.yellow)
            .attr('fill', colors.control.lightYellow);

        group
            .append('text')
            .attr('class', 'draggable-text')
            .attr('transform', `translate(11, 8)`)
            .attr('x', minX)
            .attr('y', pZabScale(p.editablePressureZab.minPressureZab))
            .attr('fill', colors.typo.secondary)
            .attr('font-size', 12)
            .attr('text-anchor', 'start')
            .append('tspan')
            .text(i18n.t(dict.optimization.wellSetup.pressureBh))
            .attr('class', 'param')
            .append('tspan')
            .text(`${round0(p.editablePressureZab.minPressureZab)} ${i18n.t(dict.optimization.wellSetup.atm)}`)
            .attr('class', 'value')
            .attr('x', minX)
            .attr('dx', 0)
            .attr('dy', 18);
    };

    const labelByType = () => {
        if (p.groupType === GroupType.WaterCut) {
            switch (p.type) {
                case 1:
                    return '0-25%';
                case 2:
                    return '26-50%';
                case 3:
                    return '51-75%';
                default:
                    return '76-100%';
            }
        } else {
            const range = p.range[p.type - 1];
            return `${round1(range[0])}-${round1(range[1])} ${i18n.t(dict.optimization.goals.dayTons)}`;
        }
    };

    renderCommonInfo();
    renderBars();
    //renderBaselines();
    renderWellLabels();
    renderSaturationPressureLine();
    renderMinimumPressureZab();
    renderMinimumPressureZabManual();
};
