import React from 'react';

import { ComponentMeta, ComponentStory, Story } from '@storybook/react';

import { PredictionRange, PredictionRangeProps } from '../../../../src/calculation/components/predictionRange';
import { ParamDateOrig } from '../../../../src/common/entities/paramDateOrig';

export default {
    title: 'Proxy/Components/PredictionRange',
    component: PredictionRange
} as ComponentMeta<typeof PredictionRange>;

const Template: ComponentStory<typeof PredictionRange> = args => (
    <div style={{ width: '500px', height: '200px', padding: '15px', border: '2px dashed red' }}>
        <PredictionRange {...args} />
    </div>
);

const data: ParamDateOrig[] = [
    { date: new Date(2020, 0, 1), value: 1, valueOrig: 5 },
    { date: new Date(2020, 1, 1), value: 2, valueOrig: 5 },
    { date: new Date(2020, 2, 1), value: 3, valueOrig: 5 },
    { date: new Date(2020, 3, 1), value: 4, valueOrig: 5 },
    { date: new Date(2020, 4, 1), value: 3, valueOrig: 5 },
    { date: new Date(2020, 5, 1), value: 1, valueOrig: 5 }
];

export const Base: Story<PredictionRangeProps> = Template.bind({});
Base.args = {
    adaptation: {
        data: data,
        endDate: new Date(2020, 5, 1),
        startDate: new Date(2020, 0, 1)
    }
};
