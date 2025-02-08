import React from 'react';

import { differenceInCalendarMonths } from 'date-fns';
import * as R from 'ramda';

import colors from '../../../../../../theme/colors';
import { PropertyPlanFactLegend } from '../../../../../common/components/charts/legends/propertyPlanFactLegend';
import { lineInjectionWithRepairs, lineOil, lineOilWithRepairs } from '../../../../../common/components/charts/lines';
import * as Lines from '../../../../../common/components/charts/lines/helpers';
import { PropertyPlanFact } from '../../../../../common/components/charts/tooltips/propertyPlanFactTooltip';
import { ModeMapEnum } from '../../../../../common/enums/modeMapEnum';
import { mmyyyy } from '../../../../../common/helpers/date';
import * as Prm from '../../../../../common/helpers/parameters';
import {
    AdaptationDateINSIM,
    AdaptationINSIM,
    avgCalcPressure,
    avgCalcPressureBottomHole,
    avgCalcSkinFactor,
    avgCalcWatercut,
    avgRealInjectionAccum,
    avgRealLiqRateAccum,
    avgRealOilRateAccum,
    avgRealPressure,
    avgRealPressureBottomHole,
    avgRealWatercut,
    byAdaptationMode,
    getRepairName,
    getRepairNameInjection,
    sumCalcInjection,
    sumCalcInjectionAccum,
    sumCalcLiqRate,
    sumCalcLiqRateAccum,
    sumCalcOilRate,
    sumCalcOilRateAccum,
    sumRealInjection,
    sumRealLiqRate,
    sumRealOilRate
} from '../../../../entities/insim/well';
import { BestAdaptationEnum } from '../../../calculation/enums/bestAdaptationEnum';
import { ResultDataTypeEnum } from '../../../calculation/enums/resultDataTypeEnum';
import { ChartBuilder, ChartViewData } from '../../entities/chartBuilder';
import { modeName } from '../../helpers/modeNameManager';
import { getBestAdaptation } from './helpers';

const objectPropsToShow = ['liqrate', 'oilrate', 'injection', 'pressure', 'watercut', 'skinfactor'];
const plastPropsToShow = [
    'liqrate',
    'oilrate',
    'injection',
    'pressure',
    'pressureBottomHole',
    'watercut',
    'skinfactor'
];

export class Common implements ChartBuilder {
    private readonly _name: string;
    private readonly _bestAdaptation: BestAdaptationEnum;
    private readonly _plastId: number;
    private readonly _showRepairs: boolean;
    private readonly _modeType: ModeMapEnum;

    public constructor(
        bestAdaptation: BestAdaptationEnum,
        plastId: number = null,
        showRepairs: boolean = false,
        modeType: ModeMapEnum
    ) {
        this._name = modeName('common', plastId ?? undefined);
        this._bestAdaptation = bestAdaptation;
        this._plastId = plastId;
        this._showRepairs = showRepairs;
        this._modeType = modeType;
    }

    public name(): string {
        return this._name;
    }

    public render(
        data: AdaptationINSIM[],
        adaptationMode: ResultDataTypeEnum,
        hiddenLines: string[],
        updateLines: (l: string[] | string) => void
    ): ChartViewData {
        const byPlast = this._plastId > 0;
        const accumulated = this._modeType === ModeMapEnum.Accumulated;

        let best = getBestAdaptation(data, this._bestAdaptation);
        if (this._plastId > 0) {
            best = AdaptationINSIM.forPlast(best, this._plastId);
        }

        return {
            data: this.shapeData(best, adaptationMode, byPlast),
            domainRange: undefined,
            domainRangeRight: ['dataMin', 'dataMax'],
            legend: {
                content: () => (
                    <PropertyPlanFactLegend
                        keysToShow={plastPropsToShow}
                        hiddenLines={hiddenLines}
                        updateLines={updateLines}
                        accumulated={accumulated}
                    />
                ),
                payload: []
            },
            lines: this.renderLines(),
            rootClass: 'chart_property-plan-fact',
            tooltip: {
                payload: [],
                renderFn: () => <PropertyPlanFact keysToShow={plastPropsToShow} accumulated={accumulated} />
            },
            yLeftAxisLabel: accumulated
                ? `${Prm.accumulatedInjectionRate()}; ${Prm.accumulatedLiqRate()}`
                : `${Prm.injectionRate()}; ${Prm.liqrate()}`,
            yRightAxisLabel: byPlast
                ? `${Prm.pressureRes()}; ${Prm.pressureZab()}; ${Prm.watercut()}`
                : `${Prm.pressureRes()}; ${Prm.watercut()}; ${Prm.skinFactor()}`
        };
    }

    private renderLines(): JSX.Element[] {
        return [
            Lines.line(
                Lines.leftAxis(
                    Lines.liqrate(
                        Lines.calc(
                            Lines.base(
                                'liqrateCalc',
                                'line__dot_liqrate line__dot_calc',
                                colors.paramColors.liquid,
                                false
                            )
                        )
                    )
                )
            ),
            Lines.line(
                Lines.leftAxis(
                    Lines.liqrate(
                        Lines.base('liqrateReal', 'line__dot_liqrate line__dot_real', colors.paramColors.liquid, true)
                    )
                )
            ),
            this._showRepairs
                ? (lineOilWithRepairs('left', 'oilrateCalc', Prm.oilrate(), false) as JSX.Element)
                : (lineOil('left', 'oilrateCalc', false) as JSX.Element),
            lineOil('left', 'oilrateReal', true) as JSX.Element,
            this._showRepairs
                ? (lineInjectionWithRepairs('left', 'injectionCalc', Prm.injectionRate(), false) as JSX.Element)
                : Lines.line(
                      Lines.leftAxis(
                          Lines.injection(
                              Lines.calc(
                                  Lines.base(
                                      'injectionCalc',
                                      'line__dot_injection line__dot_calc',
                                      colors.paramColors.injection,
                                      false
                                  )
                              )
                          )
                      )
                  ),
            Lines.line(
                Lines.leftAxis(
                    Lines.injection(
                        Lines.base(
                            'injectionReal',
                            'line__dot_injection line__dot_real',
                            colors.paramColors.injection,
                            true
                        )
                    )
                )
            ),
            Lines.line(
                Lines.rightAxis(
                    Lines.pressure(
                        Lines.calc(
                            Lines.base(
                                'pressureCalc',
                                'line__dot_pressure line__dot_calc',
                                colors.paramColors.pressure,
                                false
                            )
                        )
                    )
                )
            ),
            Lines.line(
                Lines.dot(
                    Lines.rightAxis(
                        Lines.pressure(
                            Lines.real(
                                Lines.base(
                                    'pressureReal',
                                    'line__dot_pressure line__dot_real',
                                    colors.paramColors.pressure,
                                    true
                                )
                            )
                        )
                    )
                )
            ),
            Lines.line(
                Lines.rightAxis(
                    Lines.watercut(
                        Lines.calc(
                            Lines.base(
                                'watercutCalc',
                                'line__dot_watercut line__dot_calc',
                                colors.paramColors.watercut,
                                false
                            )
                        )
                    )
                )
            ),
            Lines.line(
                Lines.rightAxis(
                    Lines.watercut(
                        Lines.base(
                            'watercutReal',
                            'line__dot_watercut line__dot_real',
                            colors.paramColors.watercut,
                            true
                        )
                    )
                )
            ),
            Lines.line(
                Lines.rightAxis(
                    Lines.watercut(
                        Lines.calc(
                            Lines.base(
                                'pressureBottomHoleCalc',
                                'line__dot_bottomHolePressure line__dot_calc',
                                colors.paramColors.bottomHolePressure,
                                false
                            )
                        )
                    )
                )
            ),
            Lines.line(
                Lines.rightAxis(
                    Lines.watercut(
                        Lines.base(
                            'pressureBottomHoleReal',
                            'line__dot_bottomHolePressure line__dot_real',
                            colors.paramColors.bottomHolePressure,
                            true
                        )
                    )
                )
            ),
            Lines.line(
                Lines.rightAxis(
                    Lines.skinFactor(
                        Lines.base(
                            'skinfactorCalc',
                            'line__dot_skinfactor line__dot_real',
                            colors.paramColors.skinFactor,
                            true
                        )
                    )
                )
            )
        ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private shapeData(data: AdaptationINSIM, adaptationMode: ResultDataTypeEnum, byPlast: boolean): any {
        const filterFn = byAdaptationMode(adaptationMode);
        const make = (dt: Date) => {
            const current = R.find(x => x.date.getTime() === dt.getTime(), data.dates);
            const isAccumulated = this._modeType === ModeMapEnum.Accumulated;

            if (!filterFn(current)) {
                return null;
            }

            let item = {
                date: mmyyyy(dt),
                pressureReal: avgRealPressure(current),
                pressureCalc: avgCalcPressure(current),
                watercutReal: avgRealWatercut(current),
                watercutCalc: avgCalcWatercut(current),
                liqrateReal: isAccumulated ? avgRealLiqRateAccum(current) : sumRealLiqRate(current),
                liqrateCalc: isAccumulated ? sumCalcLiqRateAccum(current) : sumCalcLiqRate(current),
                oilrateReal: isAccumulated ? avgRealOilRateAccum(current) : sumRealOilRate(current),
                oilrateCalc: isAccumulated ? sumCalcOilRateAccum(current) : sumCalcOilRate(current),
                injectionReal: isAccumulated ? avgRealInjectionAccum(current) : sumRealInjection(current),
                injectionCalc: isAccumulated ? sumCalcInjectionAccum(current) : sumCalcInjection(current),
                skinfactorCalc: avgCalcSkinFactor(current),
                skinfactorReal: avgCalcSkinFactor(current),
                repairName: getRepairName(current, byPlast),
                repairNameInjection: getRepairNameInjection(current, byPlast)
            };

            item['pressureBottomHoleCalc'] = avgCalcPressureBottomHole(current);
            item['pressureBottomHoleReal'] = avgRealPressureBottomHole(current);

            return item;
        };

        // отсортированные уникальные даты из таблицы
        const uniqDates = R.sort(
            differenceInCalendarMonths,
            R.map<AdaptationDateINSIM, Date>(x => x.date, data.dates)
        ) as Date[];

        return R.pipe(R.map(make), R.reject(R.isNil))(uniqDates);
    }
}
