/* eslint-disable @typescript-eslint/no-explicit-any */
import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import { roundRect } from 'common/helpers/canvas';
import { opacity } from 'common/helpers/colors';
import * as R from 'ramda';
import { descend, forEach, isNil, map, mapObjIndexed, prop, sortWith } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { max, round1 } from '../../../helpers/math';
import { groupByProp, isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { WellPointDonut } from '../../wellPoint';
import { InitMapModel, MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const colorArr = [
    colors.colors.orange,
    colors.colors.yellow,
    colors.colors.red,
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
    colors.colors.grey
];

const defaultFontSize = 2;
const defaultFontSizePercent = 1.75;
const defaultInflowHeight = 2.25;
const defaultInflowWidth = 2;
const defaultOffsetX = 2.15;
const defaultOffsetY = 2;

export const getOperationDistributionColor = (index: number): string => colorArr[index % colorArr.length];

const title = value => `${round1(value)}м`;

interface Entry {
    wellId: number;
    wellType: WellTypeEnum;
    x: number;
    y: number;
    radius: number;
    plastId: number;
    plastName: string;
    plastNumber: number;
}

export class PieChartNaturalCanvasLayer extends CommonCanvas implements MapLayer {
    public show: boolean;
    public wells: WellPointDonut[];
    public canvasSize: CanvasSize;

    private data: Entry[];

    private distribution: {
        [index: string]: Entry[];
    };

    public constructor(show: boolean, wells: WellPointDonut[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.show = show;
        this.wells = wells;
        this.canvasSize = canvasSize;
    }

    protected zoomFactor = (k: number): number => k * 0.9 * this.canvasScale;

    protected zoomWellRadius = (k: number): number => k;

    public equals(other: PieChartNaturalCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        this.setCanvasScale(model.scale);

        this.data = [];

        forEach(well => {
            if (!well.donut.liquidRadiusNatural && !well.donut.injectionRadiusNatural) {
                return;
            }

            const isInj = well.type === WellTypeEnum.Injection;

            const radius = isInj ? well.donut.injectionRadiusNatural : well.donut.liquidRadiusNatural;

            if (isNil(well)) {
                return;
            }

            if (radius <= 0) {
                return;
            }

            this.data.push({
                wellId: well.id,
                wellType: well.type,
                x: this.cx(well.x),
                y: this.cy(well.y),
                radius: radius,
                plastId: well.plastId,
                plastName: well.plastName,
                plastNumber: well.plastNumber
            });
        }, this.wells);

        const sortDescFn = sortWith<Entry>([descend(x => x.radius)]);
        this.data = sortDescFn(this.data);

        const sortByPlastNumber = list => sortWith<Entry>([descend(prop('plastNumber'))], list);
        this.distribution = groupByProp('wellId', sortByPlastNumber(this.data));
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
            const zoom = this.zoomWellRadius(model.transform.k);
            const [x, y] = model.transform.apply([item.x, item.y]);

            //circle
            model.context.beginPath();
            model.context.moveTo(x, y);
            model.context.arc(x, y, (item.radius / 18) * zoom, 0, 2 * Math.PI);
            model.context.fillStyle = opacity(colors.colors.grey, 0);
            model.context.closePath();
            model.context.fill();
            model.context.strokeStyle = item.wellType === WellTypeEnum.Oil ? colors.colors.grey : colors.colors.blue;
            model.context.stroke();

            model.context.restore();
        }

        this.renderDistribution(model);
    };

    public renderDistribution = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.distribution || !this.show) {
            return;
        }

        if (model.transform.k < 3) {
            return;
        }

        const zoom = this.zoomFactor(model.transform.k);

        const fontSize = defaultFontSize * zoom;
        const fontSizePercent = defaultFontSizePercent * zoom;
        const height = defaultInflowHeight * zoom;
        const maxWidth = defaultInflowWidth * zoom;
        const offsetX = defaultOffsetX * zoom;
        const offsetY = defaultOffsetY * zoom;

        const rectOffsetX = defaultOffsetX * zoom;
        const rectOffsetY = defaultOffsetY * zoom;
        const rectWidth = maxWidth * 1.5;

        const padding = zoom * 0.65;

        const backColor = opacity(colors.bg.selected, 0.5);

        model.context.fillStyle = 'black';
        model.context.font = `${fontSize}px Inter`;
        model.context.textAlign = 'left';

        mapObjIndexed(group => {
            if (isNullOrEmpty(group)) {
                return;
            }

            const [gX, gY] = model.transform.apply([group[0].x, group[0].y]);

            const maxPlastWidth = max(map(it => model.context.measureText(it.plastName).width, group));
            const maxRadiusWidth = max(map(it => model.context.measureText(title(it.radius)).width, group));
            const maxLineWidth = maxPlastWidth + maxRadiusWidth;

            roundRect(
                model.context,
                backColor,
                gX + rectOffsetX - padding,
                gY - rectOffsetY - padding * 3.2 - height * group.length,
                rectWidth + maxLineWidth + padding,
                height * group.length + padding,
                zoom * 0.5
            );

            let n = 1;

            for (const item of group) {
                const [x, y] = model.transform.apply([item.x, item.y]);
                const name = item.plastName;
                const value = item.radius;

                if (value <= 0) {
                    continue;
                }

                model.context.save();
                model.context.beginPath();
                model.context.translate(x + offsetX + maxPlastWidth, y - offsetY - height * n);

                model.context.fillText(name, -maxPlastWidth, 0);

                model.context.font = `bold ${fontSizePercent}px Inter`;
                model.context.fillText(title(value), maxWidth, -fontSize / 10);
                model.context.closePath();
                model.context.restore();

                n++;
            }
        }, this.distribution);
    };
}
