import React from 'react';

import * as R from 'ramda';
import { TooltipProps } from 'recharts';

import { TooltipPayload } from '../../../../vendor/types/recharts';
import { isFn, mapIndexed } from '../../../helpers/ramda';

type PropertyProps = TooltipProps<number, 'property'>;

export class PropertyTooltip extends React.PureComponent<PropertyProps> {
    public render(): JSX.Element {
        if (!this.props.active) {
            return null;
        }

        const payload = this.props.payload;

        return (
            <div className='tooltip tooltip_properties_small'>
                <div className='tooltip__line'>
                    <div>
                        {isFn(this.props.labelFormatter)
                            ? this.props.labelFormatter(this.props.label, payload)
                            : this.props.label}
                    </div>
                </div>
                {mapIndexed(
                    (x: TooltipPayload<number, string>, index: number) => this.renderProperty(x, index),
                    R.reject((it: TooltipPayload<number, string>) => it.color === 'transparent', payload ?? [])
                )}
            </div>
        );
    }

    private renderProperty(payload: TooltipPayload<number, string>, index: number): JSX.Element {
        return (
            <div key={payload.dataKey.toString()} className='tooltip__line'>
                <div style={{ color: payload.color }}>
                    {payload.name} :{' '}
                    {isFn(this.props.formatter)
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          this.props.formatter(payload.value as any, payload.name as any, payload as any, index, null)
                        : payload.value}
                </div>
            </div>
        );
    }
}
