import colors from '../../../../../theme/colors';
import { MapSelectionType } from '../../../enums/mapSelectionType';
import { opacity } from '../../../helpers/colors';
import { eqG, perpendicular, getPoints } from '../../../helpers/geometry';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { MapModel } from '../mapModel';

const ariaFillColor = opacity(colors.typo.link, 0.05);

export class PolygonCanvasLayer {
    public showSelected: boolean;
    public canvasSize: CanvasSize;

    private selectionType: MapSelectionType;

    public constructor(showSelected: boolean, canvasSize: CanvasSize) {
        this.showSelected = showSelected;
        this.canvasSize = canvasSize;

        this.selectionType = MapSelectionType.Contour;
    }

    public setSelectionType = (type: MapSelectionType): void => {
        this.selectionType = type;
    };

    public zoomFactor = (k: number): number => k * 0.5;

    public render = (
        model: MapModel,
        polygon: number[][],
        cursorPoint: number[],
        selectedPoints: number[][],
        polygonFinished: boolean
    ): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(polygon)) {
            return;
        }

        model.context.save();

        model.context.beginPath();

        let priv = [];
        for (const d of polygon) {
            const [x, y] = model.transform.apply(d);
            model.context.lineTo(x, y);
            model.context.lineWidth = 1;
            model.context.strokeStyle = colors.typo.link;

            if (this.selectionType === MapSelectionType.Profile && !isNullOrEmpty(priv)) {
                const current = [x, y];

                const centerX = (current[0] + priv[0]) / 2;
                const centerY = (current[1] + priv[1]) / 2;

                const eq = eqG([priv[0], priv[1]], [current[0], current[1]]);
                const perp = perpendicular(eq, [centerX, centerY]);
                const point = getPoints(perp, [centerX, centerY], 2 * this.zoomFactor(model.transform.k));

                const tCenterX = (centerX + (current[0] + centerX) / 2) / 2;
                const tCenterY = (centerY + (current[1] + centerY) / 2) / 2;

                model.context.moveTo(point[0][0], point[0][1]);
                model.context.lineTo(point[1][0], point[1][1]);
                model.context.lineTo(tCenterX, tCenterY);

                model.context.fillStyle = colors.typo.link;
                model.context.fill();
            }

            model.context.moveTo(x, y);
            model.context.arc(x, y, 2, 0, 2 * Math.PI);
            model.context.fill();
            model.context.moveTo(x, y);

            priv = [x, y];
        }

        model.context.closePath();
        model.context.stroke();

        if (!isNullOrEmpty(cursorPoint) && !polygonFinished) {
            model.context.save();
            const [x1, y1] = model.transform.apply(polygon[polygon.length - 1]);
            const [x2, y2] = model.transform.apply(cursorPoint);
            model.context.beginPath();
            model.context.lineWidth = 1;
            model.context.strokeStyle = colors.typo.link;
            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);
            model.context.setLineDash([5, 5]);
            model.context.closePath();
            model.context.stroke();
            model.context.restore();
        }

        if (polygonFinished) {
            model.context.beginPath();

            for (const d of polygon) {
                const [x, y] = model.transform.apply(d);
                model.context.lineTo(x, y);
            }

            model.context.fillStyle = ariaFillColor;
            model.context.closePath();
            model.context.fill();
        }

        if (this.showSelected && !isNullOrEmpty(selectedPoints)) {
            model.context.beginPath();
            for (const d of selectedPoints) {
                const [x, y] = model.transform.apply(d);

                model.context.moveTo(x + 15, y);
                model.context.arc(x, y, 15, 0, 2 * Math.PI);
            }

            model.context.closePath();
            model.context.stroke();
        }

        model.context.restore();
    };
}
