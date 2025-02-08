import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { LegendProps } from 'recharts';

import { isNullOrEmpty } from '../../../helpers/ramda';
import { valueProp } from '../../../helpers/strings';
import { cls } from '../../../helpers/styles';
import { ToggleLegendProps } from './toggleLegendProps';

import dict from '../../../helpers/i18n/dictionary/main.json';

interface PlanFactLegendProps extends LegendProps, ToggleLegendProps {
    className?: string;
    keysToShow?: string[];
    showQuantiles?: boolean;
    solderQuantiles?: boolean;
}

export class PlanFactLegend extends React.PureComponent<PlanFactLegendProps, null> {
    public render(): JSX.Element {
        return (
            <div className={cls(['legend', 'legend_columned', this.props.className])}>
                <div className='legend__column'>{this.renderQuantiles()}</div>
                <div className='legend__column'>{this.renderCell('real', i18n.t(dict.common.fact))}</div>
                <div className='legend__column'>{this.renderCell('calc', i18n.t(dict.common.calc))}</div>
            </div>
        );
    }

    private renderQuantiles(): JSX.Element {
        if (!this.props.showQuantiles) {
            return null;
        }

        if (this.props.solderQuantiles) {
            return this.renderCell('p50', 'P10, P50, P90', [valueProp('p10'), valueProp('p50'), valueProp('p90')]);
        }

        return (
            <>
                {this.renderCell('p10', 'P10')}
                {this.renderCell('p50', 'P50')}
                {this.renderCell('p90', 'P90')}
            </>
        );
    }

    private renderCell(propName: string, title: string, affectedLines: string[] = null): JSX.Element {
        if (!isNullOrEmpty(this.props.keysToShow) && !R.any(x => x === propName, this.props.keysToShow)) {
            return null;
        }

        const click = () => this.props.updateLines(affectedLines || valueProp(propName));

        return (
            <>
                <div className='legend__cell'>{title}</div>
                <div className='legend__cell'>
                    <div className={makeCls(propName, this.props.hiddenLines)} onClick={click} />
                </div>
            </>
        );
    }
}

const makeCls = (propName: string, hiddenLines: string[]) =>
    cls([
        'legend__thumb',
        `legend__thumb_${propName}`,
        R.any(x => valueProp(propName) === x, hiddenLines) ? 'legend__thumb_inactive' : null
    ]);
