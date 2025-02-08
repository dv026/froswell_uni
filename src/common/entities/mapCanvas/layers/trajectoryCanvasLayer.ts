import * as R from 'ramda';

import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { WellDetailedPoint } from '../wellDetailedPoint';
import { MapLayer } from './mapLayer';

export class TrajectoryCanvasLayer extends CommonCanvas implements MapLayer {
    //
    public wells: WellDetailedPoint[];
    public visible: boolean;
    public canvasSize: CanvasSize;

    private trajectories: number[][][];

    public constructor(wells: WellDetailedPoint[], visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.wells = wells;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.2;

    public equals(other: TrajectoryCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (): void => {
        if (!this.visible) {
            return;
        }

        this.trajectories = R.reject(
            R.isEmpty,
            R.map(it => R.uniq(R.map(t => [this.cx(t[0]), this.cy(t[1])], it.trajectories || [])), this.wells || [])
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.trajectories)) {
            return;
        }

        model.context.save();

        for (const well of this.trajectories) {
            if (!isNullOrEmpty(well)) {
                const [x1, y1] = model.transform.apply(well[0]);
                model.context.beginPath();
                model.context.moveTo(x1, y1);
                for (const t of well) {
                    const [x2, y2] = model.transform.apply(t);

                    model.context.lineTo(x2, y2);
                    model.context.lineWidth = this.zoomFactor(model.transform.k);
                    model.context.strokeStyle = 'black';
                }

                model.context.stroke();
            }
        }

        model.context.restore();
    };
}
