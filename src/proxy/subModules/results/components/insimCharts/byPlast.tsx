import React from 'react';

import * as R from 'ramda';

import { PlanFactLegend } from '../../../../../common/components/charts/legends/planFactLegend';
import { QuantilesTooltip } from '../../../../../common/components/charts/tooltips/quantilesTooltip';
import { mmyyyy } from '../../../../../common/helpers/date';
import { p10, p50, p90 } from '../../../../../common/helpers/math';
import { AdaptationDateINSIM, AdaptationINSIM, byAdaptationMode } from '../../../../entities/insim/well';
import { propGetFn } from '../../../../helpers/utils';
import { BestAdaptationEnum } from '../../../calculation/enums/bestAdaptationEnum';
import { ResultDataTypeEnum } from '../../../calculation/enums/resultDataTypeEnum';
import { ChartBuilder, ChartViewData, valueProp } from '../../entities/chartBuilder';
import { baseLine, dottedLine, getBestAdaptation, implementationLine, ParameterEnum } from './helpers';

export class ByPlast implements ChartBuilder {
    private readonly _name: string;
    private readonly bestAdaptation: BestAdaptationEnum;
    private readonly dottedReal: boolean;
    private readonly unit: string;
    private readonly param: ParameterEnum;

    private readonly getCalculatedProp: (a: AdaptationDateINSIM) => number;
    private readonly getRealProp: (a: AdaptationDateINSIM) => number;

    public constructor(
        getCalculatedProp: (a: AdaptationDateINSIM) => number,
        getRealProp: (a: AdaptationDateINSIM) => number,
        param: ParameterEnum,
        name: string,
        unit: string,
        bestAdaptation: BestAdaptationEnum,
        dottedReal: boolean = false
    ) {
        this.bestAdaptation = bestAdaptation;
        this._name = name;
        this.dottedReal = dottedReal;
        this.unit = unit;
        this.param = param;

        this.getCalculatedProp = getCalculatedProp;
        this.getRealProp = getRealProp;
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
        let domainRange = undefined;

        if (this.param === ParameterEnum.Watercut) {
            domainRange = [0, 100];
        }

        return {
            data: this.shapeData(data, adaptationMode, data.length - 1),
            domainRange: domainRange,
            domainRangeRight: undefined,
            legend: {
                content: () => (
                    <PlanFactLegend
                        className={`legend_${this.param}`}
                        showQuantiles={true}
                        solderQuantiles={true}
                        hiddenLines={hiddenLines}
                        updateLines={updateLines}
                    />
                ),
                payload: []
            },
            lines: this.renderLines(data.length - 1),
            rootClass: `chart_${this.param}`,
            tooltip: {
                payload: [],
                renderFn: () => <QuantilesTooltip className={`tooltip_${this.param}`} />
            },
            yLeftAxisLabel: this.unit
        };
    }

    private renderLines(repeats: number): JSX.Element[] {
        let lines = [];

        if (repeats > 1) {
            for (let i = 0; i < repeats; i++) {
                lines.push(implementationLine(valueProp(i)));
            }

            lines.push(baseLine(valueProp('p10'), 'p10'));
            lines.push(baseLine(valueProp('p50'), 'p50'));
            lines.push(baseLine(valueProp('p90'), 'p90'));
        }

        if (this.dottedReal) {
            lines.push(dottedLine(valueProp('real'), 'real'));
        } else {
            lines.push(baseLine(valueProp('real'), 'real'));
        }

        lines.push(baseLine(valueProp('calc'), 'calc'));

        return lines;
    }

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private shapeData(data: AdaptationINSIM[], adaptationMode: ResultDataTypeEnum, repeats: number): any {
        const filterFn = byAdaptationMode(adaptationMode);
        const make = (dt: Date) => {
            const current = (adaptation: AdaptationINSIM) =>
                R.find(x => x.date.getTime() === dt.getTime(), adaptation.dates);

            if (!filterFn(current(data[data.length - 1]))) {
                return null;
            }

            let item = {
                date: mmyyyy(dt)
            };

            // исключить лучшую реализацию, т.к. она будет отрисована отдельно
            for (let i = 0; i < R.reject(propGetFn(this.bestAdaptation), data).length; i++) {
                item[valueProp(i)] = this.getCalculatedProp(current(data[i]));
            }

            const best = getBestAdaptation(data, this.bestAdaptation);

            // получить расчетное значение на определенную дату по всем реализациям
            const allImpl = R.map(x => this.getCalculatedProp(current(x)), data);

            if (repeats > 1) {
                item[valueProp('p10')] = p10(allImpl);
                item[valueProp('p50')] = p50(allImpl);
                item[valueProp('p90')] = p90(allImpl);
            }

            item[valueProp('calc')] = this.getCalculatedProp(current(best));
            item[valueProp('real')] = this.getRealProp(current(best));

            return item;
        };

        // отсортированные уникальные даты из таблицы
        const uniqDates = R.sort(
            x => x.getTime(),
            R.map<AdaptationDateINSIM, Date>(x => x.date, data[data.length - 1].dates)
        );

        return R.pipe(R.map(make), R.reject(R.isNil))(uniqDates);
    }
}
