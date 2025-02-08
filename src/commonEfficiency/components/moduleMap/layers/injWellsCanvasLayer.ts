import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellPoint } from '../../../../common/entities/wellPoint';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { WellsCanvasLayer } from './wellsCanvasLayer';

export class InjWellsCanvasLayer extends WellsCanvasLayer implements MapLayer {
    public wells: WellPoint[];
    public canvasSize: CanvasSize;
    public mode: ModeMapEnum;
    public showBottomLabel?: boolean;
    public changeWell?: (id: number) => void;

    public constructor(
        canvasSize: CanvasSize,
        wells: WellPoint[],
        mode: ModeMapEnum,
        showBottomLabel: boolean,
        showOpeningMode?: boolean,
        changeWell?: (id: number) => void
    ) {
        super(canvasSize, wells, mode, showBottomLabel, showOpeningMode, changeWell);
    }

    public equals(other: InjWellsCanvasLayer): boolean {
        return super.equals(other);
    }

    public initLayer = (model?: InitMapModel): void => {
        this.init(model);
    };

    public render = (model: MapModel): void => {
        this.renderInjWells(this.points, model);
    };
}
