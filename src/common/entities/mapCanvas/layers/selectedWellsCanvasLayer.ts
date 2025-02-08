import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { shallowEqual } from '../../../../common/helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas, wellRadius } from '../../canvas/commonCanvas';
import { WellPoint } from '../../wellPoint';
import { MapLayer } from './mapLayer';

export class SelectedWellsCanvasLayer extends CommonCanvas implements MapLayer {
    private wells: WellPoint[];

    private points: number[][];

    public constructor(wells: WellPoint[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.wells = wells;
    }

    public zoomFactor = (k: number): number => k * 2 + wellRadius;

    public equals(other: SelectedWellsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.wells, other.wells);
    }

    public initLayer = (): void => {
        this.points = R.map((well: WellPoint) => [this.cx(well.x), this.cy(well.y)], this.wells);
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.points)) {
            return;
        }

        for (const d of this.points) {
            const [x, y] = model.transform.apply(d);

            const r = this.zoomFactor(model.transform.k);

            model.context.beginPath();
            model.context.fillStyle = colors.map.selected;
            model.context.moveTo(x + r, y);
            model.context.arc(x, y, r, 0, 2 * Math.PI);
            model.context.closePath();
            model.context.fill();
        }
    };
}
