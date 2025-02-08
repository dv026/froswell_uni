import React from 'react';

import { Input } from '@chakra-ui/react';
import * as R from 'ramda';

import { px } from '../helpers/styles';

export interface InputElementProps {
    type?: string;
    className?: string;
    disabled?: boolean;
    onChange?: (value: string | number) => void;
    defaultValue?: string;
    value?: string | number;
    validate?: boolean;
    step?: number;
    min?: number;
    max?: number;
    width?: number;
    delay?: number;
    autoFocus?: boolean;
}

interface InputState {
    value: string | number;
    queue: Array<string>;
}

export class InputElement extends React.Component<InputElementProps, InputState> {
    public constructor(props: InputElementProps, context: unknown) {
        super(props, context);

        this.state = {
            value: props.value,
            queue: []
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: InputElementProps): void {
        if (this.state.value !== nextProps.value) {
            this.setState({ value: nextProps.value.toString(), queue: [] });
        }
    }

    public render(): JSX.Element {
        if (this.props.validate) {
            // TODO: add validation for uniqueness for values and texts
        }

        const className = R.trim(`${this.props.className || ''}`);

        return (
            <Input
                type={this.props.type ? this.props.type : 'text'}
                step={this.props.step}
                min={this.props.min}
                max={this.props.max}
                style={{ width: this.props.width ? px(this.props.width) : px(80) }}
                className={className}
                defaultValue={this.props.defaultValue}
                value={this.state.value}
                autoFocus={this.props.autoFocus}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.handleChange(this.props.type === 'checkbox' ? e.target.checked : e.target.value)
                }
            />
        );
    }

    private handleChange(value) {
        let queue = this.state.queue;
        queue.push(value);

        this.setState({ value: value, queue: queue });
        setTimeout(this.triggerChange.bind(this), this.props.delay ? this.props.delay : 1500);
    }

    private triggerChange() {
        if (this.state.queue.length === 1) {
            this.props.onChange(this.state.value);
        }

        let queue = this.state.queue;
        queue.shift();
        this.setState({ queue: queue });
    }
}
