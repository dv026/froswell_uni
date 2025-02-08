import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellDateLabel } from '../../../../common/entities/mapCanvas/wellDateLabel';
import { FundTypeEnum } from '../../../../common/enums/fundTypeEnum';
import { WellPoint } from '../../../entities/proxyMap/wellPoint';
import { WellsCanvasLayer } from './wellsCanvasLayer';

export class OilWellsCanvasLayer extends WellsCanvasLayer implements MapLayer {
    public constructor(
        wells: WellPoint[],
        dateLabels: WellDateLabel[],
        canvasSize: CanvasSize,
        optimisationType = null,
        optimisation = null
    ) {
        super(wells, dateLabels, FundTypeEnum.ActiveStock, canvasSize, optimisationType, optimisation);
    }

    public equals(other: OilWellsCanvasLayer): boolean {
        return super.equals(other);
    }

    public initLayer = (model?: InitMapModel): void => {
        super.init(model);
    };

    public render = (model: MapModel): void => {
        this.renderOilWells(model);
    };
}
