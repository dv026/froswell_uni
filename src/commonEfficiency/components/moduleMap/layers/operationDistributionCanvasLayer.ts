/* eslint-disable @typescript-eslint/no-explicit-any */
import { OperationDistributionModel } from 'commonEfficiency/entities/operationDistributionModel';
import * as d3 from 'd3';
import * as R from 'ramda';
import { filter, find, forEachObjIndexed, includes, isNil, map, max, sum } from 'ramda';

import colors from '../../../../../theme/colors';
import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { CommonCanvas, wellRadius } from '../../../../common/entities/canvas/commonCanvas';
import { KeyValue } from '../../../../common/entities/keyValue';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellPointDonut } from '../../../../common/entities/wellPoint';
import { shallowEqual } from '../../../../common/helpers/compare';
import { groupByProp, isNullOrEmpty } from '../../../../common/helpers/ramda';

const colorArr = [
    colors.colors.orange,
    colors.colors.yellow,
    colors.colors.red,
    colors.colors.lightRed,
    colors.colors.blue,
    colors.colors.darkblue,
    colors.colors.green,
    colors.colors.pink,
    colors.colors.seagreen,
    colors.colors.brown,
    colors.colors.turquoise,
    colors.colors.lightblue,
    colors.colors.lightyellow,
    colors.colors.purple,
    colors.colors.grey,
    colors.colors.ligthGrey
];

export const getOperationDistributionColor = (index: number): string => colorArr[index % colorArr.length];

interface Entry {
    x: number;
    y: number;
    colors: string[];
    radius: number;
    pie: any;
}

export class OperationDistributionCanvasLayer extends CommonCanvas implements MapLayer {
    public show: boolean;
    public wells: WellPointDonut[];
    public distribution: OperationDistributionModel[];
    public selected: KeyValue[];
    public canvasSize: CanvasSize;

    private data: Entry[];

    private arc: any;
    private radiusScale: any;
    private maxRadius: number;

    public constructor(
        show: boolean,
        wells: WellPointDonut[],
        distribution: OperationDistributionModel[],
        selected: KeyValue[],
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.show = show;
        this.wells = wells;
        this.distribution = distribution;
        this.selected = selected;
        this.canvasSize = canvasSize;
    }

    protected zoomFactor = (k: number): number => k * 0.9;

    protected zoomWellRadius = (k: number): number => k;

    public equals(other: OperationDistributionCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.distribution, other.distribution) &&
            shallowEqual(this.selected, other.selected) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (): void => {
        this.data = [];

        this.maxRadius = 0;

        forEachObjIndexed((group, key) => {
            if (isNullOrEmpty(group)) {
                return;
            }

            const radius = sum(map(it => it.effectiveOilMonth, group));
            const well = find(x => x.id.toString() === key, this.wells);
            const values = map(it => (it.effectiveOilMonth / radius) * 100, group);
            const colors = map(it => getOperationDistributionColor(it.operationId), group);

            if (isNil(well)) {
                return;
            }

            if (radius <= 0) {
                return;
            }

            this.maxRadius = max(this.maxRadius, radius);

            this.data.push({
                x: this.cx(well.x),
                y: this.cy(well.y),
                colors: colors,
                radius: radius,
                pie: this.pie(values)
            });
        }, groupByProp('wellId', filter(x => includes(new KeyValue(x.operationId, x.operationName), this.selected), this.distribution) || []));

        this.data = R.sortBy(x => x.radius, this.data).reverse();

        this.arc = d3.arc();

        this.radiusScale = d3.scaleLinear().domain([0, this.maxRadius]).range([0, 20]);
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show) {
            return;
        }

        if (isNullOrEmpty(this.data)) {
            return;
        }

        for (const item of this.data) {
            const arcs = item.pie;
            const zoom = this.zoomFactor(model.transform.k);
            const [x, y] = model.transform.apply([item.x, item.y]);
            const arc = this.arc
                .innerRadius(wellRadius * zoom)
                .outerRadius((wellRadius + this.radiusScale(item.radius)) * zoom)
                .context(model.context);

            model.context.save();
            model.context.translate(x, y);
            arcs.forEach((d, i) => {
                model.context.beginPath();
                arc(d);
                model.context.strokeStyle = colors.colors.grey;
                model.context.fillStyle = item.colors[i];
                model.context.closePath();
                model.context.fill();
                model.context.stroke();
            });

            model.context.restore();
        }
    };

    private pie = d3
        .pie()
        .sort(null)
        .value(d => +d);
}
