import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellPoint } from '../../../entities/proxyMap/wellPoint';
import { WellsCanvasLayer } from './wellsCanvasLayer';

export class UnknownWellsCanvasLayer extends WellsCanvasLayer implements MapLayer {
    public constructor(wells: WellPoint[], canvasSize: CanvasSize, optimisationType = null, optimisation = null) {
        super(wells, null, null, canvasSize, optimisationType, optimisation);
    }

    public equals(other: UnknownWellsCanvasLayer): boolean {
        return super.equals(other);
    }

    public initLayer = (model?: InitMapModel): void => {
        super.init(model);
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        this.renderUnknownWells(model);
    };
}
