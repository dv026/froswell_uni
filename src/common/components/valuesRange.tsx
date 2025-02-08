import React from 'react';

import { mapIndexed } from '../helpers/ramda';

interface ScaleLabel {
    text: string;
    x: number;
}

const defaultStrokeWidth = 1;
const defaultStrokeColor = 'black';
const defaultFontSize = 14;
const defaultLabelFontSize = 16;
const defaultScaleMark = 10;

export interface ValuesRangeProps {
    x: number;
    y: number;
    width: number;
    height: number;
    start: number;
    end: number;
    step: number;
    color?: string;
    label?: string;
}

export class ValuesRange extends React.Component<ValuesRangeProps, null> {
    public constructor(props: ValuesRangeProps, context: unknown) {
        super(props, context);
    }

    public render(): React.ReactNode {
        const { width, height, start, end, step, x, y, color, label } = this.props;

        let scales = [];
        let labels = [];

        const ratio = (end - start) / width;

        const labelStep = (end - start) / step;

        for (let i = start, index = 0; i <= end; i += labelStep, index++) {
            if (index === 0 || index === step || index % 2 === 0) {
                labels.push({ text: i.toString(), x: (i - start) / ratio });
            }
        }

        const actualStep = width / step;
        for (let i = 0; i <= width; i += actualStep) {
            scales.push(i);
        }

        return (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                className='values-range'
                viewBox={`${0} ${0} ${width} ${height}`}
                width={width}
                height={height}
                x={x}
                y={y}
                fill={'red'}
            >
                <g className={'labels'}>
                    {mapIndexed((it: ScaleLabel, index) => {
                        const textAnchor = index === 0 ? 'start' : index === labels.length - 1 ? 'end' : 'middle';
                        return (
                            <text
                                key={index}
                                x={it.x}
                                y={height - defaultScaleMark - defaultScaleMark / 2}
                                fontSize={defaultFontSize}
                                fill={color ?? defaultStrokeColor}
                                textAnchor={textAnchor}
                            >
                                {it.text}
                            </text>
                        );
                    }, labels)}
                    {label ? (
                        <text
                            x={x}
                            y={defaultLabelFontSize}
                            fontSize={defaultLabelFontSize}
                            fill={color ?? defaultStrokeColor}
                            textAnchor={'middle'}
                        >
                            {label}
                        </text>
                    ) : null}
                </g>
                <g className={'scales'}>
                    {mapIndexed(
                        (it: number, index) => (
                            <line
                                key={index}
                                x1={it}
                                y1={height}
                                x2={it}
                                y2={height - defaultScaleMark}
                                strokeWidth={defaultStrokeWidth}
                                stroke={defaultStrokeColor}
                            />
                        ),
                        scales
                    )}
                    <line
                        x1={0}
                        y1={height}
                        x2={width}
                        y2={height}
                        strokeWidth={defaultStrokeWidth}
                        stroke={defaultStrokeColor}
                    />
                </g>
            </svg>
        );
    }
}
