import React from 'react';

import * as R from 'ramda';

import { Point } from '../../../../common/entities/canvas/point';
import { path } from '../../../../common/helpers/map/sizeResolver';
import { WellPointProps } from './wellPointProps';

export class BaseInjWell extends React.PureComponent<WellPointProps, null> {
    public render(): JSX.Element {
        const { cx, cy } = this.props;
        const radius = 50;

        return (
            <g
                key={this.props.id}
                className='inj-well'
                onClick={() => this.props.changeWell(this.props.id)}
                cursor='pointer'
            >
                {this.renderHorizontal()}
                <circle
                    className='inj-well__center'
                    r={radius}
                    cx={cx}
                    cy={cy}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
                <path
                    className='inj-well__arrows'
                    d={this.getArrowsPath()}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
            </g>
        );
    }

    private renderHorizontal(): JSX.Element {
        if (!this.props.horizontal || !this.props.horizontal.length) {
            return null;
        }

        return <path className='inj-well__horizontal' d={path(this.props.horizontal)} />;
    }

    private getArrowsPath(): string {
        const len = 140;
        const edgeShift = {
            across: 25,
            along: 45
        };

        const arrowTop = [
            path([
                new Point(this.props.cx, this.props.cy),
                new Point(this.props.cx, this.props.cy - len),
                new Point(this.props.cx - edgeShift.across, this.props.cy - len + edgeShift.along)
            ]),
            path([
                new Point(this.props.cx, this.props.cy - len),
                new Point(this.props.cx + edgeShift.across, this.props.cy - len + edgeShift.along)
            ])
        ];

        const arrowLeft = [
            path([
                new Point(this.props.cx, this.props.cy),
                new Point(this.props.cx - len, this.props.cy),
                new Point(this.props.cx - len + edgeShift.along, this.props.cy + edgeShift.across)
            ]),
            path([
                new Point(this.props.cx - len, this.props.cy),
                new Point(this.props.cx - len + edgeShift.along, this.props.cy - edgeShift.across)
            ])
        ];

        const arrowRight = [
            path([
                new Point(this.props.cx, this.props.cy),
                new Point(this.props.cx + len, this.props.cy),
                new Point(this.props.cx + len - edgeShift.along, this.props.cy + edgeShift.across)
            ]),
            path([
                new Point(this.props.cx + len, this.props.cy),
                new Point(this.props.cx + len - edgeShift.along, this.props.cy - edgeShift.across)
            ])
        ];

        const arrowBottom = [
            path([
                new Point(this.props.cx, this.props.cy),
                new Point(this.props.cx, this.props.cy + len),
                new Point(this.props.cx - edgeShift.across, this.props.cy + len - edgeShift.along)
            ]),
            path([
                new Point(this.props.cx, this.props.cy + len),
                new Point(this.props.cx + edgeShift.across, this.props.cy + len - edgeShift.along)
            ])
        ];

        return R.join(' ', R.flatten([arrowTop, arrowLeft, arrowRight, arrowBottom]));
    }
}
