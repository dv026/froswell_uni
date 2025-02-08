import React from 'react';

import * as R from 'ramda';
import { TooltipProps } from 'recharts';

import { cls } from '../../../helpers/styles';
import { findPayloadValue, payloadValue } from './helpers';

export interface PropertyColor {
    color: string;
    key: string;
    name: string;
}

export const makePropertyColor = (
    color: string,
    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    obj: any,
    getKey: (x) => string,
    getName: (x) => string
): PropertyColor => ({
    color: color,
    key: getKey(obj),
    name: getName(obj)
});

interface PaletteTooltipProps extends TooltipProps<number, 'palette'> {
    className?: string;
    palette: PropertyColor[];
}

export class PaletteTooltip extends React.PureComponent<PaletteTooltipProps> {
    public render(): React.ReactNode {
        const { active, payload } = this.props;

        if (!active) {
            return null;
        }

        return (
            <div className={cls(['tooltip', this.props.className])}>
                <div className='tooltip__row'>
                    <div className='tooltip__cell'>&nbsp;</div>
                    <div className='tooltip__cell tooltip__cell_label'>{this.props.label} </div>
                </div>
                {R.reject(
                    R.isNil,
                    R.map(x => this.renderProperty(x, payload), this.props.palette)
                )}
            </div>
        );
    }

    private renderProperty(propInfo: PropertyColor, payload): JSX.Element {
        if (R.isNil(findPayloadValue(propInfo.key, payload))) {
            return null;
        }

        return (
            <div key={propInfo.key} className='tooltip__row' style={{ color: propInfo.color }}>
                <div className='tooltip__cell tooltip__cell_label'>{propInfo.name}</div>
                <div className='tooltip__cell'>{payloadValue(propInfo.key, payload)}</div>
            </div>
        );
    }
}
