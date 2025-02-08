import React from 'react';

import { IPoint } from '../../../../common/entities/canvas/point';
import { path } from '../../../../common/helpers/map/sizeResolver';
import { OilWellProps } from './oilWellProps';

export class BaseOilWell extends React.Component<OilWellProps, null> {
    public render(): JSX.Element {
        const { cx, cy } = this.props;
        const radius = 50;

        return (
            <g
                key={this.props.id}
                className='oil-well'
                onClick={() => this.props.changeWell(this.props.id)}
                cursor='pointer'
            >
                <circle
                    className='oil-well__center'
                    r={radius}
                    cx={cx}
                    cy={cy}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
                {this.renderHorizontal()}
            </g>
        );
    }

    private renderHorizontal(): JSX.Element {
        if (!this.props.horizontal || !this.props.horizontal.length) {
            return null;
        }

        return <path className='oil-well__horizontal' d={path(this.props.horizontal)} />;
    }
}

export class Node extends React.PureComponent<IPoint, IPoint> {
    private coords: IPoint;

    public state = {
        x: this.props.x,
        y: this.props.y
    };

    private handleMouseDown = e => {
        this.coords = {
            x: e.pageX,
            y: e.pageY
        };
        document.addEventListener('mousemove', this.handleMouseMove);
    };

    private handleMouseUp = () => {
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.coords = { x: 0, y: 0 };
    };

    private handleMouseMove = e => {
        const xDiff = this.coords.x - e.pageX;
        const yDiff = this.coords.y - e.pageY;

        this.coords.x = e.pageX;
        this.coords.y = e.pageY;

        this.setState({
            x: this.state.x - xDiff,
            y: this.state.y - yDiff
        });
    };

    public render(): React.ReactNode {
        const { x, y } = this.state;
        return (
            <circle
                r='50'
                cx={x}
                cy={y}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
            />
        );
    }
}
