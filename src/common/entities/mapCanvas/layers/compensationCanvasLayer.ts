import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { roundRect } from '../../../helpers/canvas';
import { opacity } from '../../../helpers/colors';
import { shallowEqual } from '../../../helpers/compare';
import { round1 } from '../../../helpers/math';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { CompensationModel } from '../compensationModel';
import { InitMapModel, MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultFontSize = 2.5;
const defaultInflowHeight = 2.5;
const defaultInflowWidth = 8;
const defaultOffsetX = 5;
const defaultOffsetY = 12;

export class CompensationCanvasLayer extends CommonCanvas implements MapLayer {
    public data: CompensationModel[];
    public color: string;
    public visible: boolean;
    public canvasSize: CanvasSize;

    private compensations: CompensationModel[];

    public constructor(data: CompensationModel[], visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.data = data;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.5 * this.canvasScale;

    private zoomLineWidth = (k: number) => k * 0.1 * this.canvasScale;

    public equals(other: CompensationCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.data, other.data) &&
            shallowEqual(this.color, other.color) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        if (!this.visible) {
            return;
        }

        this.setCanvasScale(model?.scale);

        this.compensations = R.map(
            it => ({
                wellId: it.wellId,
                x: this.cx(it.x),
                y: this.cy(it.y),
                value: it.value
            }),
            this.data
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.compensations) || !this.visible) {
            return;
        }

        if (model.transform.k < 3) {
            return;
        }

        const zoom = this.zoomFactor(model.transform.k);
        //const zoomLineWidth = this.zoomLineWidth(model.transform.k);

        const fontSize = defaultFontSize * zoom;
        const height = defaultInflowHeight * zoom;
        const offsetX = defaultOffsetX * zoom;
        const offsetY = defaultOffsetY * zoom;
        const maxWidth = defaultInflowWidth * zoom;

        const rectOffsetX = 5 * zoom;
        const rectOffsetY = 7 * zoom;

        const padding = zoom * 2;

        const backColor = opacity(colors.bg.selected, 0.5);

        for (const item of this.compensations) {
            const [x, y] = model.transform.apply([item.x, item.y]);
            const value = item.value;
            const width = (Math.min(item.value, 100) / defaultInflowWidth) * zoom;

            if (value <= 0) {
                continue;
            }

            model.context.save();
            model.context.beginPath();

            model.context.fillStyle = 'black';
            model.context.font = `${fontSize}px Inter`;

            const formatValue = `${round1(value)}%`;

            const rectWidth = maxWidth + model.context.measureText(formatValue).width * 1.5;
            const rectHeight = fontSize;

            roundRect(
                model.context,
                backColor,
                x + rectOffsetX - padding,
                y - rectOffsetY - padding - height,
                rectWidth + padding * 2,
                rectHeight + padding * 2,
                zoom
            );

            model.context.translate(x + offsetX, y - offsetY + height);

            roundRect(model.context, colors.paramColors.injection, 0, height / 2, width, height / 4, zoom);

            model.context.textAlign = 'right';
            model.context.fillText(name, -zoom, height);

            model.context.textAlign = 'left';
            model.context.fillText(formatValue, width + zoom, height);

            model.context.closePath();
            model.context.restore();
        }
    };
}
