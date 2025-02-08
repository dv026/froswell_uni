import { drawMultiline, drawTextWithBackground, StyleTabletCanvas } from 'common/helpers/canvas';

import colors from '../../../../../theme/colors';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvasTablet } from '../commonCanvasTablet';
import { TabletModel } from '../tabletModel';

const IMAGE_RATIO = 1.75;
const DEFAULT_COLOR = colors.bg.black;
const DEFAULT_LINE_WIDTH = 6;
const FONT_SIZE_TITLE = 32;
export const FONT_SIZE = 18;
const FONT_SIZE_SMALL = 15;
const FONT_SIZE_TINY = 13;

export class BaseTabletLayer extends CommonCanvasTablet {
    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);
    }

    protected zoomFactor = (k: number): number => k * 0.9;
    protected zoomTextTinySize = (k: number): number => FONT_SIZE_TINY * this.zoomFactor(k);
    protected zoomTextSmallSize = (k: number): number => FONT_SIZE_SMALL * this.zoomFactor(k);
    protected zoomTextSize = (k: number): number => FONT_SIZE * this.zoomFactor(k);
    protected zoomTextTitleSize = (k: number): number => FONT_SIZE_TITLE * this.zoomFactor(k);
    protected zoomLineSize = (k: number): number => DEFAULT_LINE_WIDTH * k * 0.1;

    protected renderRect(
        model: TabletModel,
        rect: number[],
        transform,
        fillStyle: string,
        strokeStyle: string,
        lineWidth: number = null
    ) {
        model.context.save();
        model.context.beginPath();
        model.context.rect(...this.rectangle(rect, transform));

        model.context.lineWidth = this.zoomLineSize(model.transform.k);

        if (fillStyle) {
            model.context.fillStyle = fillStyle;
            model.context.fill();
        }

        if (strokeStyle) {
            model.context.strokeStyle = strokeStyle;
            model.context.stroke();
        }

        model.context.restore();
    }

    protected rectangle(rect: number[], transform) {
        const [xmin, ymin] = transform.apply([rect[0], rect[1]]);
        const [xmax, ymax] = transform.apply([rect[2], rect[3]]);
        const width = Math.abs(xmax - xmin);
        const height = Math.abs(ymax - ymin);

        return [xmin, ymin, width, height];
    }

    protected renderText(
        model: TabletModel,
        text: string,
        x: number,
        y: number,
        horizontal: boolean,
        styles?: StyleTabletCanvas
    ) {
        const fontsize = styles?.fontsize ? styles.fontsize : this.zoomTextSize(model.transform.k);

        drawMultiline(model.context, text, x, y, horizontal, {
            ...styles,
            fontsize: fontsize
        });
    }

    protected renderCustomText(
        model: TabletModel,
        text: string,
        x: number,
        y: number,
        horizontal: boolean,
        styles: StyleTabletCanvas
    ) {
        drawMultiline(model.context, text, x, y, horizontal, styles);
    }

    protected renderTextWithBackground(
        model: TabletModel,
        text: string,
        x: number,
        y: number,
        horizontal: boolean,
        styles: StyleTabletCanvas
    ) {
        if (horizontal) {
            drawTextWithBackground(model.context, text, x, y, horizontal, styles);
        } else {
            drawTextWithBackground(model.context, text, x, y, horizontal, styles);
        }
    }

    protected renderFrame(model: TabletModel, rect: number[], color: string, background: HTMLImageElement = null) {
        const [x1, y1] = model.transform.apply([rect[0], rect[1]]);
        const [x2, y2] = model.transform.apply([rect[2], rect[3]]);

        const zoom = this.zoomFactor(model.transform.k);

        model.context.save();
        model.context.beginPath();

        model.context.moveTo(x1 + (x2 - x1) / 3, y1);
        model.context.lineTo(x1 + (x2 - x1) / 2, y1);
        model.context.lineTo(x1 + (x2 - x1) / 2, y2);
        model.context.lineTo(x1 + (x2 - x1) / 3, y2);

        model.context.lineWidth = this.zoomLineSize(model.transform.k);
        model.context.strokeStyle = color;

        model.context.stroke();
        model.context.restore();

        model.context.save();
        model.context.translate(x1 + (x2 - x1) / 3, y1 - zoom * 4);
        model.context.rotate((45 * Math.PI) / 180);
        model.context.fillStyle = color;
        model.context.fillRect(0, 0, zoom * 5, zoom * 5);
        model.context.restore();

        model.context.save();
        model.context.translate(x1 + (x2 - x1) / 3, y2 - zoom * 4);
        model.context.rotate((45 * Math.PI) / 180);
        model.context.fillStyle = color;
        model.context.fillRect(0, 0, zoom * 5, zoom * 5);
        model.context.restore();

        if (background) {
            this.renderBackground(model, rect, background);
        }
    }

    private renderBackground(model: TabletModel, rectangle: number[], img: HTMLImageElement = null) {
        const rect = this.rectangle(rectangle, model.transform);

        const pattern = model.context.createPattern(img, 'repeat-y');

        model.context.save();
        model.context.translate(rect[0] + rect[2] / 3, rect[1]);

        model.context.scale(model.transform.k / IMAGE_RATIO, model.transform.k / IMAGE_RATIO);

        model.context.fillStyle = pattern;
        model.context.fillRect(
            0,
            0,
            (rect[2] / model.transform.k) * IMAGE_RATIO,
            (rect[3] / model.transform.k) * IMAGE_RATIO
        );

        model.context.restore();
    }
}
