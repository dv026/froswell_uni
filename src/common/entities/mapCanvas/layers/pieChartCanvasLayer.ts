// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { WellPointDonut, isInj, isOil, InjWellPoint } from '../../../entities/wellPoint';
import { ModeMapEnum } from '../../../enums/modeMapEnum';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas, wellRadius } from '../../canvas/commonCanvas';
import { InitMapModel, MapModel } from './../mapModel';
import { MapLayer } from './mapLayer';

const baseColors = [colors.control.grey300, colors.map.blue];
const oilColors = [colors.control.grey300, colors.map.blue];
const injColors = [colors.map.blue, colors.map.blue];
const effectiveInjectionColors = [colors.map.blue, colors.colors.turquoise];

const defaultMinRadius = 150;
const defaultMaxPercent = 100;

const defaultRadiusFactor = 27;

const activeRadiusMult = 1;

const activeFillStyle = colors.map.selected;

class Entry {
    public x: number;
    public y: number;
    public radius: number;
    public colors: string[];
    public value: number[];
    public pie: any;
    public active: boolean;
    public activeRadius: number;
    public activePie: any;
}

export class PieChartCanvasLayer extends CommonCanvas implements MapLayer {
    public activeWell: number;
    public mode: ModeMapEnum;
    public wells: WellPointDonut[];
    public pieScale: number;
    public showAnimateForActiveWell: boolean;
    public visible: boolean;
    public canvasSize: CanvasSize;

    private oilWells: Entry[];
    private injWells: Entry[];

    private arc: any;

    public constructor(
        activeWell: number,
        mode: ModeMapEnum,
        wells: WellPointDonut[],
        pieScale: number,
        showAnimateForActiveWell: boolean,
        visible: boolean,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.activeWell = activeWell;
        this.mode = mode;
        this.wells = wells;
        this.pieScale = pieScale;
        this.showAnimateForActiveWell = showAnimateForActiveWell;
        this.visible = visible;

        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.75 * this.canvasScale;

    public zoomWellRadius = (): number => wellRadius * 2 * 0.9 * this.canvasScale;

    public equals(other: PieChartCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.activeWell, other.activeWell) &&
            shallowEqual(this.mode, other.mode) &&
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.pieScale, other.pieScale) &&
            shallowEqual(this.showAnimateForActiveWell, other.showAnimateForActiveWell) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        this.setCanvasScale(model?.scale);

        this.oilWells = R.sortBy(
            x => x.radius,
            R.flatten(R.map((w: WellPointDonut) => this.pieData(w, oilColors), R.filter(isOil, this.wells)))
        );
        this.injWells = R.sortBy(
            x => x.radius,
            R.flatten(R.map((w: WellPointDonut) => this.pieData(w, injColors), R.filter(isInj, this.wells)))
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

        if (isNullOrEmpty(this.oilWells) && isNullOrEmpty(this.injWells)) {
            return;
        }

        this.renderWells(model, this.oilWells);
        this.renderWells(model, this.injWells);
    };

    private pie = d3
        .pie()
        .sort(null)
        .value(d => +d);

    private renderWells = (model: MapModel, data) => {
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
                model.context.arc(0, 0, radius + activeRadiusMult * zoom, 0, 2 * Math.PI);
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
                model.context.strokeStyle = colors.colors.grey;
                model.context.fillStyle = activeFillStyle;
                model.context.fillStyle = item.colors[i];
                model.context.closePath();
                model.context.fill();
                model.context.stroke();
            });

            model.context.restore();
        }
    };

    private pieData(well: WellPointDonut, colorsByType: Array<string>): Entry[] {
        const x = this.cx(well.x);
        const y = this.cy(well.y);

        const getRadius = (doublePie: boolean) => {
            let radius =
                this.mode === ModeMapEnum.Accumulated
                    ? doublePie
                        ? well.donut.oilRadius
                        : well.donut.p2Accumulated
                    : well.donut.p2;

            radius = radius * this.pieScale * this.canvasScale;

            return radius ? defaultMinRadius + radius : radius;
        };

        const getWatercut = (doublePie: boolean) => {
            let watercut =
                this.mode === ModeMapEnum.Accumulated
                    ? doublePie
                        ? well.donut.oilRadius
                        : well.donut.injRadius
                    : well.donut.p3;

            return watercut > defaultMaxPercent ? defaultMaxPercent : watercut;
        };

        let radius = getRadius(false);
        let radius2 = getRadius(true);
        let activeRadius = radius !== null && radius < defaultMinRadius ? defaultMinRadius : radius;

        let watercut = getWatercut(false);
        let watercut2 = getWatercut(true);

        const data = [{ value: defaultMaxPercent - watercut }, { value: watercut }];

        const result = [];

        const donut1 = new Entry();
        donut1.x = x;
        donut1.y = y;
        donut1.radius = radius / defaultRadiusFactor;
        donut1.colors = [colorsByType[1], colorsByType[0]];
        donut1.value = [data[1].value, data[0].value];
        donut1.pie = this.pie(donut1.value);
        donut1.active = this.activeWell === well.id;
        if (donut1.active) {
            donut1.activeRadius = donut1.active ? activeRadius / defaultRadiusFactor : 0;
            donut1.activePie = this.pie([100, 0]);
        }

        result.push(donut1);

        // EffectiveInjection
        if (isInj(well)) {
            const effectiveInjection = (well as InjWellPoint).effectiveInjection * 100;
            const dataEI = [{ value: defaultMaxPercent - effectiveInjection }, { value: effectiveInjection }];

            const donutEI = new Entry();
            donutEI.x = x;
            donutEI.y = y;
            donutEI.radius = radius / defaultRadiusFactor;
            donutEI.colors = [effectiveInjectionColors[1], effectiveInjectionColors[0]];
            donutEI.value = [dataEI[1].value, dataEI[0].value];
            donutEI.pie = this.pie(donutEI.value);
            result.push(donutEI);
        }

        if (well.donut.p4Accumulated && this.mode === ModeMapEnum.Accumulated) {
            const data2 = [{ value: defaultMaxPercent - watercut2 }, { value: watercut2 }];

            const donut2 = new Entry();
            donut2.x = x;
            donut2.y = y;
            donut2.radius = radius2 / defaultRadiusFactor;
            donut2.colors = [baseColors[1], baseColors[0]];
            donut2.value = [data2[1].value, data2[0].value];
            donut2.pie = this.pie(donut2.value);
            result.push(donut2);
        }

        return result;
    }
}
