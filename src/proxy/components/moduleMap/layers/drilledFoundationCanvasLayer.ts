import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellDateLabel } from '../../../../common/entities/mapCanvas/wellDateLabel';
import { FundTypeEnum } from '../../../../common/enums/fundTypeEnum';
import { shallowEqual } from '../../../../common/helpers/compare';
import { WellPoint } from '../../../entities/proxyMap/wellPoint';
import { WellsCanvasLayer } from './wellsCanvasLayer';

export class DrilledFoundationCanvasLayer extends WellsCanvasLayer implements MapLayer {
    private show: boolean;

    public constructor(show: boolean, wells: WellPoint[], dateLabels: WellDateLabel[], canvasSize: CanvasSize) {
        super(wells, dateLabels, FundTypeEnum.DrilledFoundation, canvasSize);

        this.show = show;
    }

    public equals(other: DrilledFoundationCanvasLayer): boolean {
        return shallowEqual(this.show, other.show) && super.equals(other);
    }

    public initLayer = (model?: InitMapModel): void => {
        if (!this.show) {
            return;
        }

        super.init(model);
    };

    public render = (model: MapModel): void => {
        if (!this.show) {
            return;
        }

        this.renderDrilledWells(model);
    };
}
