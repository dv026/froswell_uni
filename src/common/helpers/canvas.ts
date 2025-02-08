import saveAs from 'file-saver';

import colors from '../../../theme/colors';
import { opacity } from './colors';

const DEFAULT_TEXT_COLOR = colors.typo.primary;

type Align = 'left' | 'right' | 'center';

export interface StyleTabletCanvas {
    fontsize?: number;
    align?: Align;
    color?: string;
    opacity?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: string;
    paddingX?: number;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const roundRect = (context, fillColor, x, y, w, h, r, strokeColor = null, strokeWidth = null) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    context.save();

    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();

    if (fillColor) {
        context.fillStyle = fillColor;
        context.fill();
    }

    if (strokeColor) {
        if (strokeWidth) {
            context.lineWidth = strokeWidth;
        }

        context.strokeStyle = strokeColor;
        context.stroke();
    }

    context.restore();
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const saveCanvas = canvas => {
    setTimeout(() => {
        canvas.toBlob(blob => saveAs(blob, 'export.png'), 'image/png');
    }, 300);
};

export const drawMultiline = (
    ctx: any,
    str: string,
    x: number,
    y: number,
    horizontal: boolean,
    styles: StyleTabletCanvas
) => {
    const { fontsize, align, color = DEFAULT_TEXT_COLOR } = styles;

    str.split('\n').forEach(it => {
        drawText(ctx, it, x, y, fontsize, align, horizontal, color);
        if (horizontal) {
            y += fontsize * 1.25;
        } else {
            x += fontsize;
        }
    });
};

const drawText = (
    ctx: any,
    text: string,
    x: number,
    y: number,
    fontsize: number,
    align: string,
    horizontal: boolean,
    color: string
) => {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);

    if (!horizontal) {
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
    }

    ctx.fillStyle = color ? color : DEFAULT_TEXT_COLOR;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = `${fontsize}px Inter`;
    ctx.fillText(text, 0, 0);
    ctx.closePath();
    ctx.restore();
};

export const drawTextWithBackground = (
    ctx: any,
    text: string,
    x: number,
    y: number,
    horizontal: boolean,
    styles: StyleTabletCanvas
) => {
    const { fontsize, align, fillColor, color = DEFAULT_TEXT_COLOR, opacity: opacityN = 0.1 } = styles;

    ctx.save();
    ctx.translate(x, y);

    if (!horizontal) {
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = align;
    }

    ctx.font = `${fontsize}px Inter`;

    const width = ctx.measureText(text).width * 1.1;
    const height = fontsize * 1.3;

    if (align === 'center') {
        roundRect(ctx, opacity(fillColor, opacityN), 0 - width / 2, 0 - height / 2, width, height, fontsize / 4);
    } else {
        roundRect(ctx, opacity(fillColor, opacityN), 0 - fontsize / 4, 0 - height / 2, width, height, fontsize / 4);
    }

    ctx.restore();

    ctx.save();
    ctx.translate(x, y);

    if (!horizontal) {
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = align;
    }

    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = `${fontsize}px Inter`;
    ctx.fillText(text, 0, 0);

    ctx.restore();
};
