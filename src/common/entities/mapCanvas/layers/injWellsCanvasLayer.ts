import { shallowEqual } from 'common/helpers/compare';

import { WellPoint } from '../../../entities/wellPoint';
import { ModeMapEnum } from '../../../enums/modeMapEnum';
import { CanvasSize } from '../../canvas/canvasSize';
import { InitMapModel, MapModel } from './../mapModel';
import { MapLayer } from './mapLayer';
import { WellsCanvasLayer } from './wellsCanvasLayer';

export class InjWellsCanvasLayer extends WellsCanvasLayer implements MapLayer {
    private visible: boolean;

    public constructor(
        canvasSize: CanvasSize,
        wells: WellPoint[],
        mode: ModeMapEnum,
        showBottomLabel: boolean,
        showOpeningMode: boolean,
        changeWell?: (id: number) => void,
        visible: boolean = true
    ) {
        super(canvasSize, wells, mode, showBottomLabel, showOpeningMode, changeWell);

        this.visible = visible;
    }

    public equals(other: InjWellsCanvasLayer): boolean {
        return super.equals(other) && shallowEqual(this.visible, other.visible);
    }

    public initLayer = (model: InitMapModel): void => {
        this.init(model);
    };

    public render = (model: MapModel): void => {
        if (!this.visible) {
            return;
        }

        this.renderInjWells(this.points, model);
    };
}
