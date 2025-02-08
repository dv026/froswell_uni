import * as R from 'ramda';

import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { BaseWellsCanvasLayer } from '../../../../common/entities/mapCanvas/layers/baseWellsCanvasLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { shallowEqual } from '../../../../common/helpers/compare';
import { WellPoint } from '../../../entities/proxyMap/wellPoint';

const pointColor = 'rgb(180,180,180)';

export class IntermediateWellsCanvasLayer extends BaseWellsCanvasLayer {
    private show: boolean;
    private wells: WellPoint[];

    public constructor(show: boolean, wells: WellPoint[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.show = show;
        this.wells = wells;
    }

    public equals(other: IntermediateWellsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.show, other.show) && shallowEqual(this.wells, other.wells);
    }

    public initLayer = (model?: InitMapModel): void => {
        if (!this.show) {
            return;
        }

        this.setCanvasScale(model?.scale);

        this.points = R.map(
            (well: WellPoint) => ({
                x: this.cx(well.x),
                y: this.cy(well.y),
                id: well.id,
                title: well.name,
                bottom: '',
                showBottom: false,
                horizontal: []
            }),
            this.wells
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show) {
            return;
        }

        this.renderWells(this.points, model, pointColor, true);
    };
}
