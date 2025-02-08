import { opacity } from 'common/helpers/colors';
import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { CommonCanvas } from '../../../../common/entities/canvas/commonCanvas';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { shallowEqual } from '../../../../common/helpers/compare';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { InterwellConnection } from '../../../entities/proxyMap/interwellConnection';

const interwellColor = opacity(colors.colors.lightPurple, 0.5);

export class InterwellConnectionsCanvasLayer extends CommonCanvas implements MapLayer {
    public show: boolean;
    public points: InterwellConnection[];
    public canvasSize: CanvasSize;

    private interwells: number[][];

    public constructor(show: boolean, points: InterwellConnection[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.show = show;
        this.points = points;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.2 * this.canvasScale;

    public equals(other: InterwellConnectionsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.points, other.points) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model?: InitMapModel): void => {
        this.setCanvasScale(model?.scale);

        this.interwells = R.map(
            it => [this.cx(it.xWell), this.cy(it.yWell), this.cx(it.xNeighbor), this.cy(it.yNeighbor)],
            this.points || []
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show) {
            return;
        }

        if (isNullOrEmpty(this.interwells)) {
            return;
        }

        model.context.save();

        for (const d of this.interwells) {
            const [x1, y1] = model.transform.apply([d[0], d[1]]);
            const [x2, y2] = model.transform.apply([d[2], d[3]]);
            model.context.beginPath();
            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);
            model.context.lineWidth = this.zoomFactor(model.transform.k);
            model.context.strokeStyle = interwellColor;
            model.context.closePath();
            model.context.stroke();
        }

        model.context.restore();
    };
}
