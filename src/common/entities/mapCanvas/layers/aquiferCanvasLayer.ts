import { forEach, isNil, map } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { AquiferModel } from '../../aquiferModel';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultColor = colors.bg.black;
const defaultLineWidth = 2;
const defaultStrokeDasharray = [4, 4, 2, 4];
const aquiferRadius = 1;

class Entry {
    public points: number[][];
    public polygon: number[][];
}

export class AquiferCanvasLayer extends CommonCanvas implements MapLayer {
    public show: boolean;
    public lines: Entry[];
    public canvasSize: CanvasSize;

    public aquifers: AquiferModel[];

    public constructor(show: boolean, aquifers: AquiferModel[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.show = show;
        this.aquifers = aquifers;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.1;

    public zoomRadiusFactor = (k: number): number => k * 0.9;

    public equals(other: AquiferCanvasLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.aquifers, other.aquifers) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (): void => {
        this.lines = map((it: AquiferModel) => {
            let obj = new Entry();
            obj.points = map(x => [this.cx(x[0]), this.cy(x[1])], it.points);
            obj.polygon = map(x => [this.cx(x[0]), this.cy(x[1])], it.polygon);

            return obj;
        }, this.aquifers);
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show) {
            return;
        }

        if (isNullOrEmpty(this.lines)) {
            return;
        }

        const r = aquiferRadius + this.zoomRadiusFactor(model.transform.k);

        model.context.save();
        forEach(it => {
            model.context.beginPath();

            for (const d of it.polygon) {
                const [x, y] = model.transform.apply(d);
                model.context.lineTo(x, y);
            }

            model.context.lineWidth = this.getLineWidth(defaultLineWidth, model);
            model.context.strokeStyle = defaultColor;
            model.context.setLineDash(defaultStrokeDasharray);

            model.context.stroke();

            model.context.beginPath();

            for (const d of it.points) {
                const [x, y] = model.transform.apply(d);
                model.context.moveTo(x + r, y);
                model.context.arc(x, y, r, 0, 2 * Math.PI);
            }

            model.context.fillStyle = colors.colors.seagreen;
            model.context.fill();
        }, this.lines);
        model.context.restore();
    };

    private getLineWidth = (strokeWidth: number, model: MapModel) => {
        return model.isMinimap ? 1 : strokeWidth + this.zoomFactor(model.transform.k);
    };
}
