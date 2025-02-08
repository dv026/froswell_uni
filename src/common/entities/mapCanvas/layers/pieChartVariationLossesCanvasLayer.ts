// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { VariationLossesModel } from 'common/entities/variationLossesModel';
import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import { roundRect } from 'common/helpers/canvas';
import { opacity } from 'common/helpers/colors';
import { max, min, round1 } from 'common/helpers/math';
import * as d3 from 'd3';
import * as R from 'ramda';
import { filter, map } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas, wellRadius } from '../../canvas/commonCanvas';
import { InitMapModel, MapModel } from './../mapModel';
import { BaseWellsCanvasLayer, CanvasWellPoint } from './baseWellsCanvasLayer';
import { MapLayer } from './mapLayer';

const positiveColors = [colors.colors.blue, opacity(colors.colors.blue, 0.25)];
const negativeColors = [colors.colors.red, opacity(colors.colors.red, 0.25)];

const defaultMinRadius = 5;
const defaultMaxRadius = 10;

const activeRadiusMult = 1;

const activeFillStyle = colors.map.selected;

class Entry {
    public id: number;
    public title: string;
    public wellType: WellTypeEnum;
    public x: number;
    public y: number;
    public radius: number;
    public colors: string[];
    public value: number[];
    public bottom: string;
    public pie: any;
    public active: boolean;
    public activeRadius: number;
    public activePie: any;
}

export class PieChartVariationLossesCanvasLayer extends BaseWellsCanvasLayer implements MapLayer {
    public wells: VariationLossesModel[];
    public pieScale: number;
    public visible: boolean;
    public canvasSize: CanvasSize;

    private data: Entry[];

    private oilPoints: CanvasWellPoint[];
    private injPoints: CanvasWellPoint[];

    private minRadius: number;
    private maxRadius: number;

    private arc: any;

    public constructor(wells: VariationLossesModel[], pieScale: number, visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.wells = wells;
        this.pieScale = pieScale;
        this.visible = visible;

        this.canvasSize = canvasSize;
    }

    private zoomWellRadius = (): number => wellRadius * 2 * 0.9;

    public equals(other: PieChartVariationLossesCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.pieScale, other.pieScale) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        this.setCanvasScale(model?.scale);

        const allRadius = map(it => Math.abs(it.variationVolumeWaterCut + it.variationLiquid), this.wells);

        this.minRadius = min(allRadius);
        this.maxRadius = max(allRadius);

        this.data = R.flatten(R.map((w: VariationLossesModel) => this.pieData(w), this.wells));

        const toCanvasType = (it: Entry) =>
            ({
                x: it.x,
                y: it.y,
                id: it.id,
                title: it.title,
                bottom: it.bottom,
                showBottom: true
            } as CanvasWellPoint);

        this.points = map(toCanvasType, this.data);

        this.oilPoints = map(
            toCanvasType,
            filter(x => x.wellType === WellTypeEnum.Oil, this.data)
        );

        this.injPoints = map(
            toCanvasType,
            filter(x => x.wellType === WellTypeEnum.Injection, this.data)
        );

        this.arc = d3.arc();
    };

    public render = (model: MapModel): void => {
        if (!this.visible) {
            return;
        }

        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.data)) {
            return;
        }

        this.renderDonuts(model, this.data);

        this.renderWells(this.oilPoints, model);
        this.renderInjWells(this.injPoints, model);
    };

    private pie = d3
        .pie()
        .sort(null)
        .value(d => +d);

    private renderDonuts = (model: MapModel, data) => {
        for (const item of data) {
            const arcs = item.pie;
            const zoom = this.zoomFactor(model.transform.k);
            const [x, y] = model.transform.apply([item.x, item.y]);

            const radius = (item.radius !== 0 ? item.radius : this.zoomWellRadius()) * zoom;
            const arc = this.arc.outerRadius(0).innerRadius(radius).context(model.context);

            if (item.active) {
                const [x, y] = model.transform.apply([item.x, item.y]);

                model.context.save();
                model.context.translate(x, y);

                model.context.beginPath();
                model.context.arc(0, 0, radius, 0, 2 * Math.PI);
                model.context.fillStyle = activeFillStyle;
                model.context.closePath();
                model.context.fill();

                model.context.restore();
            }

            model.context.save();
            model.context.translate(x, y);
            arcs.forEach(function (d, i) {
                model.context.beginPath();
                arc(d);
                model.context.fillStyle = item.colors[i];
                model.context.closePath();
                model.context.fill();
            });

            model.context.restore();
        }
    };

    private pieData(well: VariationLossesModel): Entry[] {
        const x = this.cx(well.x);
        const y = this.cy(well.y);

        const absoluteRadius = well.variationVolumeWaterCut + well.variationLiquid;

        const isPositive = absoluteRadius >= 0;

        const getRadius = () => {
            let radius = Math.abs(absoluteRadius / this.maxRadius) * this.pieScale;

            return absoluteRadius ? defaultMinRadius + radius * defaultMaxRadius : 0;
        };

        const getPieData = () => {
            return [well.variationVolumeWaterCut / absoluteRadius, well.variationLiquid / absoluteRadius];
        };

        let radius = getRadius();
        let data = getPieData();

        const result = [];

        const donut1 = new Entry();
        donut1.id = well.wellId;
        donut1.title = well.wellName;
        donut1.wellType = well.wellType;
        donut1.x = x;
        donut1.y = y;
        donut1.radius = radius;
        donut1.colors = isPositive ? positiveColors : negativeColors;
        donut1.value = data;
        donut1.bottom = `${round1(Math.abs(well.variationVolumeWaterCut))}-${round1(Math.abs(well.variationLiquid))}`;
        donut1.pie = this.pie(donut1.value);

        result.push(donut1);

        return result;
    }
}
