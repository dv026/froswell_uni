import { InitMapModel } from 'common/entities/mapCanvas/mapModel';
import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { Point } from '../../../../common/entities/canvas/point';
import {
    BaseWellsCanvasLayer,
    CanvasWellPoint,
    InputWellLabel
} from '../../../../common/entities/mapCanvas/layers/baseWellsCanvasLayer';
import { WellDateLabel, WellDateEnum } from '../../../../common/entities/mapCanvas/wellDateLabel';
import { FundTypeEnum } from '../../../../common/enums/fundTypeEnum';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { shallowEqual } from '../../../../common/helpers/compare';
import { mmyyyy } from '../../../../common/helpers/date';
import { DateLabelModel } from '../../../entities/proxyMap/dateLabelModel';
import { OptimisationTitleBrief } from '../../../entities/proxyMap/optimisationTitleBrief';
import { ImaginaryCharWorkHistory, WellPoint } from '../../../entities/proxyMap/wellPoint';
import { OptimisationParamEnum } from '../../../enums/wellGrid/optimisationParam';
import { OilWellProps } from '../wells/oilWellProps';

const colorGreen = colors.colors.green;
const colorBlack = colors.typo.primary;
const colorRed = colors.colors.red;

export class WellsCanvasLayer extends BaseWellsCanvasLayer {
    public wells: ReadonlyArray<WellPoint>;
    public dateLabels: WellDateLabel[];
    public optimisationType: OptimisationParamEnum;
    public optimisation: Array<OptimisationTitleBrief>;
    public fundType: FundTypeEnum;

    public constructor(
        wells: WellPoint[],
        dateLabels: WellDateLabel[],
        fundType: FundTypeEnum,
        canvasSize: CanvasSize,
        optimisationType = null,
        optimisation = null
    ) {
        super(canvasSize);

        this.wells = wells;
        this.dateLabels = dateLabels;
        this.fundType = fundType;
        this.canvasSize = canvasSize;
        this.optimisationType = optimisationType;
        this.optimisation = optimisation;
    }

    public equals(other: WellsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.dateLabels, other.dateLabels) &&
            shallowEqual(this.fundType, other.fundType) &&
            shallowEqual(this.canvasSize, other.canvasSize) &&
            shallowEqual(this.optimisationType, other.optimisationType) &&
            shallowEqual(this.optimisation, other.optimisation)
        );
    }

    protected init(model?: InitMapModel): void {
        this.setCanvasScale(model?.scale);

        this.points = R.map((well: WellPoint): CanvasWellPoint => {
            const label = this.mapWellLabels({
                cx: this.cx(well.x),
                cy: this.cy(well.y),
                id: well.id,
                title: well.name,
                isImaginary: well.isImaginary,
                dateLabelModel:
                    well.type === WellTypeEnum.Oil || well.type === WellTypeEnum.Injection
                        ? this.dateLabelModel(
                              well.isImaginary ? FundTypeEnum.VirtualWells : this.fundType,
                              well.lastWellType,
                              this.dateLabels
                          )
                        : null
            });

            const optPresureZab = this.initOptimisation(OptimisationParamEnum.PresureZab, well.id, well.type);
            const optSkinFactor = this.initOptimisation(OptimisationParamEnum.SkinFactor, well.id, well.type);

            if (optPresureZab && optSkinFactor) {
                const optPZ = optPresureZab[1] ?? optPresureZab[0];
                const optSF = optSkinFactor[1] ?? optSkinFactor[0];

                label.coloredBottom = [
                    [optPZ.toString(), optPresureZab[1] !== optPresureZab[0] ? colorRed : colorBlack],
                    ['/', colorBlack],
                    [optSF.toString(), optSkinFactor[1] !== optSkinFactor[0] ? colorRed : colorBlack]
                ];

                label.showBottom = true;
            }

            return {
                x: this.cx(well.x),
                y: this.cy(well.y),
                id: well.id,
                title: label.title,
                bottom: label.bottom,
                showBottom: label.showBottom,
                coloredBottom: label.coloredBottom,
                horizontal: this.mapHorizontal([
                    new Point(well.x, well.y),
                    well.x2 && well.y2 ? new Point(well.x2, well.y2) : null
                ])
            };
        }, this.wells);
    }

    private initOptimisation = (
        optimisationType: OptimisationParamEnum,
        wellId: number,
        wellType: WellTypeEnum
    ): number[] => {
        if (this.optimisation && this.optimisation.length > 0) {
            const opt = R.find(
                it =>
                    it.parameter === optimisationType &&
                    it.wellId === wellId &&
                    ((!it.wellType && it.parameter === OptimisationParamEnum.SkinFactor) ||
                        (it.wellType === wellType && it.parameter === OptimisationParamEnum.PresureZab)),
                this.optimisation
            );
            if (opt) {
                return opt.newValue ? [opt.value, opt.newValue] : [opt.value];
            }
        }

        return null;
    };

    protected dateLabelModel = (
        fundType: FundTypeEnum,
        wellType: ImaginaryCharWorkHistory,
        dateLabels: WellDateLabel[]
    ): DateLabelModel => {
        if (!wellType) {
            return null;
        }

        const startDateLabel = R.any(
            it => it.type === fundType && it.param === WellDateEnum.StartDate && it.value,
            dateLabels
        );
        const closingDateLabel = R.any(
            it => it.type === fundType && it.param === WellDateEnum.ClosingDate && it.value,
            dateLabels
        );

        const startDate = startDateLabel ? wellType.startDate : null;
        const closingDate = closingDateLabel ? wellType.closingDate : null;

        return new DateLabelModel(startDate, closingDate);
    };

    protected mapWellLabels(it: OilWellProps): InputWellLabel {
        if (!it) {
            return null;
        }

        let bottom = '';
        let coloredBottom;
        if (it.dateLabelModel) {
            const startDate = it.dateLabelModel.startDate ? mmyyyy(it.dateLabelModel.startDate) : '';
            const delimiter = it.dateLabelModel.startDate && it.dateLabelModel.closingDate ? '-' : '';
            const closingDate = it.dateLabelModel.closingDate ? mmyyyy(it.dateLabelModel.closingDate) : '';

            bottom = `${startDate}${delimiter}${closingDate}`;
            coloredBottom = bottom
                ? [
                      [startDate, colorGreen],
                      [delimiter, colorBlack],
                      [closingDate, colorRed]
                  ]
                : null;
        }

        const input = new InputWellLabel();
        input.x = it.cx;
        input.y = it.cy;
        input.title = it.title;
        input.bottom = bottom;
        input.showBottom = !R.isEmpty(bottom);
        input.coloredBottom = coloredBottom;
        return input;
    }
}
