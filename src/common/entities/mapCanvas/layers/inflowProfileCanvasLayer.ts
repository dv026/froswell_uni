import * as R from 'ramda';
import { descend, filter, map, mapObjIndexed, prop, sortWith } from 'ramda';

import colors from '../../../../../theme/colors';
import { WellTypeEnum } from '../../../enums/wellTypeEnum';
import { roundRect } from '../../../helpers/canvas';
import { opacity } from '../../../helpers/colors';
import { shallowEqual } from '../../../helpers/compare';
import { max, round1 } from '../../../helpers/math';
import { groupByProp, isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { InitMapModel, MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultFontSize = 2.5;
const defaultFontSizePercent = 2;
const defaultInflowHeight = 2.5;
const defaultInflowWidth = 8;
const defaultOffsetX = 4;
const defaultOffsetY = 5;

const getColor = (type: WellTypeEnum) =>
    type === WellTypeEnum.Oil ? colors.paramColors.oil : colors.paramColors.injection;

interface InflowModel {
    wellId: number;
    x: number;
    y: number;
    plastName: string;
    plastNumber: number;
    value: number;
    wellType: WellTypeEnum;
}

export class InflowProfileCanvasLayer extends CommonCanvas implements MapLayer {
    public data: InflowModel[];
    public visible: boolean;
    public canvasSize: CanvasSize;

    private inflows: {
        [index: string]: InflowModel[];
    };

    public constructor(data: InflowModel[], visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.data = data;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.5 * this.canvasScale;

    private zoomLineWidth = (k: number) => k * 0.1 * this.canvasScale;

    public equals(other: InflowProfileCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.data, other.data) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        if (!this.visible) {
            return;
        }

        this.setCanvasScale(model?.scale);

        const sortByPlastNumber = list => sortWith<InflowModel>([descend(prop('plastNumber'))], list);

        this.inflows = groupByProp(
            'wellId',
            sortByPlastNumber(
                R.map(
                    (it: InflowModel) => ({
                        wellId: it.wellId,
                        x: this.cx(it.x),
                        y: this.cy(it.y),
                        plastName: it.plastName,
                        plastNumber: it.plastNumber,
                        value: it.value,
                        wellType: it.wellType
                    }),
                    filter((it: InflowModel) => it.value !== 0, this.data)
                )
            )
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.inflows || !this.visible) {
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

        const rectOffsetX = 5 * zoom;
        const rectOffsetY = 7 * zoom;
        const rectWidth = maxWidth * 1.5;
        const rectHeight = fontSize;

        const padding = zoom * 2;

        const backColor = opacity(colors.bg.selected, 0.5);

        model.context.fillStyle = 'black';
        model.context.font = `${fontSize}px Inter`;
        model.context.textAlign = 'left';

        mapObjIndexed(group => {
            if (isNullOrEmpty(group)) {
                return;
            }

            const [gX, gY] = model.transform.apply([group[0].x, group[0].y]);

            const maxPlastWidth = max(map(it => model.context.measureText(it.plastName).width, group)) * 1.1;

            roundRect(
                model.context,
                backColor,
                gX + rectOffsetX - padding,
                gY - rectOffsetY - padding - height * group.length,
                rectWidth + maxPlastWidth + padding * 2,
                rectHeight * group.length + padding * 2,
                zoom
            );

            let n = 1;

            for (const item of group) {
                const [x, y] = model.transform.apply([item.x, item.y]);
                const name = item.plastName;
                const value = item.value;
                const width = (item.value / defaultInflowWidth) * zoom;

                if (value <= 0) {
                    continue;
                }

                model.context.save();
                model.context.beginPath();
                model.context.translate(x + offsetX + maxPlastWidth, y - offsetY - height * n);

                roundRect(model.context, getColor(item.wellType), 0, 0, width, height / 4, zoom);

                model.context.fillText(name, -maxPlastWidth, height / 4);

                model.context.font = `bold ${fontSizePercent}px Inter`;
                model.context.fillText(`${round1(value)}%`, maxWidth, 0);
                model.context.closePath();
                model.context.restore();

                n++;
            }
        }, this.inflows);
    };
}
