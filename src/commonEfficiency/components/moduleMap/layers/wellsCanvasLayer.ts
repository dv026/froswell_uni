import { InitMapModel } from 'common/entities/mapCanvas/mapModel';
import { round0 } from 'common/helpers/math';
import * as R from 'ramda';

import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import {
    BaseWellsCanvasLayer,
    CanvasWellPoint
} from '../../../../common/entities/mapCanvas/layers/baseWellsCanvasLayer';
import { OilWellPoint, WellPoint } from '../../../../common/entities/wellPoint';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { shallowEqual } from '../../../../common/helpers/compare';

export class WellsCanvasLayer extends BaseWellsCanvasLayer {
    protected wells: WellPoint[];
    protected mode: ModeMapEnum;
    protected showBottomLabel?: boolean;
    protected showOpeningMode?: boolean;
    protected changeWell?: (id: number) => void;

    public constructor(
        canvasSize: CanvasSize,
        wells: WellPoint[],
        mode: ModeMapEnum,
        showBottomLabel: boolean = true,
        showOpeningMode: boolean = false,
        changeWell?: (id: number) => void
    ) {
        super(canvasSize);

        this.wells = wells;
        this.mode = mode;
        this.showBottomLabel = showBottomLabel;
        this.showOpeningMode = showOpeningMode;
        this.changeWell = changeWell;
    }

    public equals(other: WellsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.mode, other.mode) &&
            shallowEqual(this.showBottomLabel, other.showBottomLabel) &&
            shallowEqual(this.showOpeningMode, other.showOpeningMode) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    protected init = (model: InitMapModel): void => {
        this.setCanvasScale(model?.scale);

        this.points = R.map((well: OilWellPoint): CanvasWellPoint => {
            const label = this.mapWellLabels(
                {
                    cx: this.cx(well.x),
                    cy: this.cy(well.y),
                    id: well.id,
                    title: well.name,
                    p2: Math.round(this.mode === ModeMapEnum.Accumulated ? well.donut.p2Accumulated : well.donut.p2),
                    p3: Math.round(this.mode === ModeMapEnum.Accumulated ? well.donut.p3Accumulated : well.donut.p3),
                    oilRadius: this.mode === ModeMapEnum.Accumulated ? well.donut.oilRadius : null,
                    injRadius: this.mode === ModeMapEnum.Accumulated ? well.donut.injRadius : null,
                    perfPercentage: this.showOpeningMode ? round0(well.donut.perfPercentage) : null,
                    changeWell: id => this.changeWell(id)
                },
                false
            );

            return {
                x: this.cx(well.x),
                y: this.cy(well.y),
                id: well.id,
                title: label.title,
                bottom: label.bottom,
                showBottom: label.showBottom && this.showBottomLabel,
                horizontal: this.mapHorizontal(well.horizontal)
            };
        }, this.wells);
    };
}
