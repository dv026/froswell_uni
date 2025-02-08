import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellDetailedPoint } from '../../../../common/entities/mapCanvas/wellDetailedPoint';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { WellsCanvasLayer } from './wellsCanvasLayer';

export class OilWellsCanvasLayer extends WellsCanvasLayer implements MapLayer {
    public constructor(
        canvasSize: CanvasSize,
        wells: WellDetailedPoint[],
        mode: ModeMapEnum,
        showBottomLabel?: boolean,
        showOpeningMode?: boolean,
        changeWell?: (id: number) => void
    ) {
        super(canvasSize, wells, mode, showBottomLabel, showOpeningMode, changeWell);
    }

    public equals(other: OilWellsCanvasLayer): boolean {
        return super.equals(other);
    }

    public initLayer = (model?: InitMapModel): void => {
        this.init(model);
    };

    public render = (model: MapModel): void => {
        this.renderOilWells(model);
    };
}
