import React from 'react';

import * as R from 'ramda';

import { Point } from '../../../../common/entities/canvas/point';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { path } from '../../../../common/helpers/map/sizeResolver';
import { DateLabelModel } from '../../../entities/proxyMap/dateLabelModel';
import { isPressureZab, isSkinFactor, OptimisationParamEnum } from '../../../enums/wellGrid/optimisationParam';
import { DateLabel } from './labels/dateLabel';
import { PressureZabLabel } from './labels/pressureZabLabel';
import { SkinFactorLabel } from './labels/skinFactorLabel';

const offset = 250;
const step = 100;
const radius = 50;

export interface DraggableWellProps {
    cx: number;
    cy: number;
    id: number;
    title: string;
    type: WellTypeEnum;
    isImaginary: boolean;
    isDrilledFoundation: boolean;
    optimisationType: OptimisationParamEnum;
    optimisation: Array<number>;
    xx: number;
    yy: number;
    horizontal?: ReadonlyArray<Point>;
    allowDrag?: boolean;
    visible?: boolean;
    dateLabelModel?: DateLabelModel;
    toggleDragAndDrop?: (id: number, value: boolean) => void;
    changeWellPosition?: (id, x, y) => void;
    onMouseOverWell?: (id, el) => void;
}

interface DraggableWellState {
    x: number;
    y: number;
    isDragging: boolean;
}

export class DraggableWell extends React.Component<DraggableWellProps, DraggableWellState> {
    private gElement: React.RefObject<SVGGElement>;

    public constructor(props: DraggableWellProps, context: unknown) {
        super(props, context);

        this.gElement = React.createRef();
    }

    public state = {
        x: this.props.cx,
        y: this.props.cy,
        isDragging: false
    };

    public static getDerivedStateFromProps(props: DraggableWellProps, state: DraggableWellState): DraggableWellState {
        if (state.isDragging === false && (props.cx !== state.x || props.cy !== state.y)) {
            return {
                x: props.cx,
                y: props.cy,
                isDragging: false
            };
        }

        return null;
    }

    private handleMouseDown = e => {
        if (e.buttons === 1) {
            // click on left button

            this.setState({ isDragging: true });

            if (this.props.allowDrag) {
                this.props.toggleDragAndDrop(this.props.id, true);

                document.addEventListener('mousemove', this.handleMouseMove);
            }
        }
    };

    private handleMouseUp = e => {
        if (e.button === 0) {
            // click on left button
            if (this.props.allowDrag) {
                document.removeEventListener('mousemove', this.handleMouseMove);

                this.props.toggleDragAndDrop(this.props.id, false);
                this.props.changeWellPosition(this.props.id, this.state.x, this.state.y);
            }

            setTimeout(() => {
                this.setState({ isDragging: false });
            }, 500);
        }
    };

    private handleMouseMove = () => {
        this.setState({ x: this.props.xx, y: this.props.yy });
    };

    public render(): React.ReactNode {
        let tooltip = {};
        tooltip = {
            'data-for': 'status-tooltip',
            'data-tip': this.props.id,
            'data-event': 'none',
            'data-tip-disable': this.state.isDragging,
            onMouseEnter: () => {
                if (!this.state.isDragging) {
                    this.props.onMouseOverWell(this.props.id, this.gElement.current);
                }
            },
            onMouseLeave: () => {
                if (!this.state.isDragging) {
                    this.props.onMouseOverWell(null, null);
                }
            }
        };

        return (
            <g className='oil-well' {...tooltip} ref={this.gElement}>
                {this.renderHorizontal()}
                {this.wellPoint()}
            </g>
        );
    }

    private renderHorizontal(): JSX.Element {
        if (!this.props.horizontal || !this.props.horizontal.length) {
            return null;
        }

        return <path className='oil-well__horizontal' d={path(this.props.horizontal)} />;
    }

    private wellPoint() {
        const { id, title } = this.props;
        const { x, y } = this.state;

        const cx = x;
        const cy = y;

        const shortTitleStyle = {
            display: 'none'
        };

        const wellLabel = (
            <g className='well-label' transform='translate(100)'>
                <text
                    className='well-label__title top_short_title'
                    style={shortTitleStyle as React.CSSProperties}
                    x={cx + offset}
                    y={cy - step - 50}
                >
                    {title}
                </text>
                <text className='well-label__title top_title' x={cx + offset} y={cy - step} fontFamily='Roboto'>
                    <tspan>{title}</tspan>
                    {this.optimisationLabel()}
                </text>
            </g>
        );

        // todo mb
        if (this.props.isDrilledFoundation) {
            return (
                <>
                    {wellLabel}
                    <g className='oil-well' cursor='pointer' data-for='optimisation-tooltip' data-tip={id}>
                        <circle
                            className='oil-well__center'
                            r={radius}
                            cx={cx}
                            cy={cy}
                            style={{
                                transformOrigin: `${cx}px ${cy}px`,
                                stroke: 'black',
                                strokeWidth: 10,
                                fill: 'white'
                            }}
                            onMouseDown={this.handleMouseDown}
                            onMouseUp={this.handleMouseUp}
                        />
                    </g>
                </>
            );
        } else {
            if (this.props.type === WellTypeEnum.Oil) {
                return (
                    <>
                        {wellLabel}
                        <g className='oil-well' cursor='pointer' data-for='optimisation-tooltip' data-tip={id}>
                            <circle
                                className='oil-well__center'
                                r={radius}
                                cx={cx}
                                cy={cy}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                                onMouseDown={this.handleMouseDown}
                                onMouseUp={this.handleMouseUp}
                            />
                        </g>
                    </>
                );
            } else if (this.props.type === WellTypeEnum.Injection) {
                return (
                    <>
                        {wellLabel}
                        <g className='inj-well' cursor='pointer' data-for='optimisation-tooltip' data-tip={id}>
                            <path
                                className='inj-well__arrows'
                                d={this.getArrowsPath(cx, cy)}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                            />
                            <circle
                                className='inj-well__center'
                                r={radius}
                                cx={cx}
                                cy={cy}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                                onMouseDown={this.handleMouseDown}
                                onMouseUp={this.handleMouseUp}
                            />
                        </g>
                    </>
                );
            } else {
                return (
                    <>
                        {wellLabel}
                        <g className='oil-well' cursor='pointer'>
                            <circle
                                fill='gray'
                                r={radius}
                                cx={cx}
                                cy={cy}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                                onMouseDown={this.handleMouseDown}
                                onMouseUp={this.handleMouseUp}
                            />
                        </g>
                    </>
                );
            }
        }
    }

    private optimisationLabel = () => {
        const { id, optimisation, optimisationType, dateLabelModel } = this.props;
        const { x } = this.state;

        if (!optimisation) {
            return <DateLabel model={dateLabelModel} x={x + offset} />;
        }

        if (isSkinFactor(optimisationType)) {
            return <SkinFactorLabel defaultValue={optimisation[0]} value={optimisation[1]} x={x + offset} id={id} />;
        }

        if (isPressureZab(optimisationType)) {
            return <PressureZabLabel defaultValue={optimisation[0]} value={optimisation[1]} x={x + offset} id={id} />;
        }

        return null;
    };

    // todo mb double
    private getArrowsPath(cx, cy): string {
        const len = 140;
        const edgeShift = {
            across: 25,
            along: 45
        };

        const arrowTop = [
            path([
                new Point(cx, cy),
                new Point(cx, cy - len),
                new Point(cx - edgeShift.across, cy - len + edgeShift.along)
            ]),
            path([new Point(cx, cy - len), new Point(cx + edgeShift.across, cy - len + edgeShift.along)])
        ];

        const arrowLeft = [
            path([
                new Point(cx, cy),
                new Point(cx - len, cy),
                new Point(cx - len + edgeShift.along, cy + edgeShift.across)
            ]),
            path([new Point(cx - len, cy), new Point(cx - len + edgeShift.along, cy - edgeShift.across)])
        ];

        const arrowRight = [
            path([
                new Point(cx, cy),
                new Point(cx + len, cy),
                new Point(cx + len - edgeShift.along, cy + edgeShift.across)
            ]),
            path([new Point(cx + len, cy), new Point(cx + len - edgeShift.along, cy - edgeShift.across)])
        ];

        const arrowBottom = [
            path([
                new Point(cx, cy),
                new Point(cx, cy + len),
                new Point(cx - edgeShift.across, cy + len - edgeShift.along)
            ]),
            path([new Point(cx, cy + len), new Point(cx + edgeShift.across, cy + len - edgeShift.along)])
        ];

        return R.join(' ', R.flatten([arrowTop, arrowLeft, arrowRight, arrowBottom]));
    }
}
