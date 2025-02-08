import React from 'react';
import { Fragment } from 'react';

import * as R from 'ramda';
import { LegendProps } from 'recharts';

import { cls } from '../../../helpers/styles';
import { PropertyColor } from '../tooltips/paletteTooltip';
import { ToggleLegendProps } from './toggleLegendProps';

export interface PropertyGroupColors {
    title: string;
    colors: PropertyColor[];
}

interface PaletteGroupLegendProps extends LegendProps, ToggleLegendProps {
    groups: PropertyGroupColors[];
}

const maxInRow = 5;
export class PaletteGroupLegend extends React.PureComponent<PaletteGroupLegendProps, null> {
    public render(): JSX.Element {
        return (
            <div className='legend legend_columned legend_palette'>
                {R.map(x => this.renderRow(x), this.props.groups)}
            </div>
        );
    }

    public renderRow(group: PropertyGroupColors): JSX.Element {
        const splitted = R.splitEvery(maxInRow, group.colors);
        const splittedWithId = R.zip(splitted, R.range(0, splitted.length));

        return <>{R.map(x => this.renderSubRow(x[0], group.title, x[1]), splittedWithId)}</>;
    }

    public renderSubRow(colors: PropertyColor[], title: string, id: number): React.ReactNode {
        return (
            <Fragment key={`${title}${id}`}>
                <div className='legend__column'>
                    {!R.isNil(title) || id > 0 ? (
                        <div className='legend__cell'>{id === 0 ? `${makeTitle(title)}: ` : ''}</div>
                    ) : null}
                </div>
                {R.map(
                    x => (
                        <div key={x.key} className='legend__column'>
                            {this.renderCell(x.key, `${x.key}${title}${id}`, x.name, x.color)}
                        </div>
                    ),
                    colors
                )}
            </Fragment>
        );
    }

    public renderCell(propName: string, key: string, title: string, color: string): JSX.Element {
        const click = () => this.props.updateLines(propName);

        return (
            <>
                <div key={key} className='legend__cell'>
                    {title}
                </div>
                <div key={key} className='legend__cell'>
                    <div
                        className={makeCls(propName, this.props.hiddenLines)}
                        onClick={click}
                        style={{ backgroundColor: color, borderColor: color }}
                    />
                </div>
            </>
        );
    }
}

const makeTitle = (title: string) => (R.isNil(title) ? '' : title);

const makeCls = (propName: string, hiddenLines: string[]) =>
    cls(['legend__thumb', R.any(x => propName === x, hiddenLines) ? 'legend__thumb_inactive' : null]);
