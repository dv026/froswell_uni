import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { LegendProps } from 'recharts';

import * as Prm from '../../../helpers/parameters';
import { cls } from '../../../helpers/styles';
import { ToggleLegendProps } from './toggleLegendProps';

import mainDict from '../../../helpers/i18n/dictionary/main.json';

interface PropertyPlanFactLegendProps extends LegendProps, ToggleLegendProps {
    keysToShow: string[];
    accumulated?: boolean;
}

const names = {
    oilrate: Prm.oilrate(),
    liqrate: Prm.liqrate(),
    pressure: Prm.pressureRes(),
    pressureBottomHole: Prm.pressureZab(),
    injection: Prm.injectionRate(),
    watercut: Prm.watercut(),
    skinfactor: Prm.skinFactor()
};

const accumulatedNames = {
    oilrate: Prm.accumulatedOilProduction(),
    liqrate: Prm.accumulatedLiqRate(),
    pressure: Prm.pressureRes(),
    pressureBottomHole: Prm.pressureZab(),
    injection: Prm.accumulatedInjectionRate(),
    watercut: Prm.watercut(),
    skinfactor: Prm.skinFactor()
};

export class PropertyPlanFactLegend extends React.PureComponent<PropertyPlanFactLegendProps, null> {
    public render(): JSX.Element {
        return (
            <div className='legend legend_columned legend_property-plan-fact'>
                <div className='legend__column'>
                    <div className='legend__cell legend__cell_title' />
                    <div className='legend__cell legend__cell_title'>{i18n.t(mainDict.common.fact)}:</div>
                    <div className='legend__cell legend__cell_title'>{i18n.t(mainDict.common.calc)}:</div>
                </div>
                {R.map(x => this.renderColumn(x), this.props.keysToShow)}
            </div>
        );
    }

    private renderColumn(propName: string): JSX.Element {
        const clickReal = () => this.props.updateLines(makePropName(propName, true));
        const clickCalc = () => this.props.updateLines(makePropName(propName, false));

        return (
            <div key={propName} className={cls(['legend__column', `legend__column_${propName}`])}>
                <div className='legend__cell'>
                    {this.props.accumulated
                        ? accumulatedNames[R.find(x => x === propName, R.keys(accumulatedNames))]
                        : names[R.find(x => x === propName, R.keys(names))]}
                </div>
                <div className='legend__cell'>
                    <div className={makeCls(propName, false, this.props.hiddenLines)} onClick={clickReal} />
                </div>
                <div className='legend__cell'>
                    <div className={makeCls(propName, true, this.props.hiddenLines)} onClick={clickCalc} />
                </div>
            </div>
        );
    }
}

const makeCls = (id: string, isCalc: boolean, hiddenLines: string[]) =>
    cls([
        'legend__thumb',
        isCalc ? 'legend__thumb_calc' : 'legend__thumb_real',
        R.any(x => x === makePropName(id, !isCalc), hiddenLines) ? 'legend__thumb_inactive' : null
    ]);

const makePropName = (propName: string, isReal: boolean) => `${propName}${isReal ? 'Real' : 'Calc'}`;
