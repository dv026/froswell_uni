import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { CommonCanvas } from '../../../../common/entities/canvas/commonCanvas';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { MapModel } from '../../../../common/entities/mapCanvas/mapModel';

export class ImprovementCanvasLayer extends CommonCanvas implements MapLayer {
    private show: boolean;
    private step: number;

    private x1: number;
    private y1: number;
    private x2: number;
    private y2: number;

    public constructor(
        show: boolean,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        step: number,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        if (!show || (!minX && !maxX && !minY && maxY)) {
            return;
        }

        this.show = show;
        this.step = step;

        this.x1 = this.cx(minX || this.canvasSize.xMin);
        this.y1 = this.cy(minY || this.canvasSize.yMin);
        this.x2 = this.cx(maxX || this.canvasSize.xMax);
        this.y2 = this.cy(maxY || this.canvasSize.yMax);
    }

    private zoomFactor = (k: number) => k * 0.1;

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show) {
            return;
        }

        model.context.save();

        model.context.beginPath();
        model.context.fillStyle = 'rgba(255,255,255, 0.5)';
        model.context.closePath();
        model.context.fillRect(0, 0, model.width, model.height);

        const [x1, y1] = model.transform.apply([this.x1, this.y1]);
        const [x2, y2] = model.transform.apply([this.x2, this.y2]);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        model.context.beginPath();
        model.context.fillStyle = 'none';
        model.context.lineWidth = 1.5;
        model.context.strokeStyle = 'black';
        model.context.setLineDash([5, 5]);
        model.context.rect(x1, y1, width, height);
        model.context.closePath();
        model.context.stroke();

        model.context.translate(x1, y1);
        model.context.font = '16px Inter';
        model.context.fillStyle = '#0383BA';
        model.context.fillText(this.step, 10, 16);
        model.context.restore();
    };
}
