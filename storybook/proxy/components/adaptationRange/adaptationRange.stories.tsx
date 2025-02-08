import React from 'react';

import { ComponentMeta, ComponentStory, Story } from '@storybook/react';

import { ParamDate } from '../../../../src/common/entities/paramDate';
import { Range } from '../../../../src/common/entities/range';
import { nul } from '../../../../src/common/helpers/ramda';
import { AdaptationRange, AdaptationRangeProps } from '../../../../src/proxy/components/adaptationRange';

export default {
    title: 'Proxy/Components/AdaptationRange',
    component: AdaptationRange
} as ComponentMeta<typeof AdaptationRange>;

const Template: ComponentStory<typeof AdaptationRange> = args => (
    <div style={{ width: '500px', height: '200px', padding: '15px', border: '2px dashed red' }}>
        <AdaptationRange {...args} />
    </div>
);

const data: ParamDate[] = [
    { date: new Date(2020, 0, 1), value: 1 },
    { date: new Date(2020, 1, 1), value: 2 },
    { date: new Date(2020, 2, 1), value: 3 },
    { date: new Date(2020, 3, 1), value: 4 },
    { date: new Date(2020, 4, 1), value: 3 },
    { date: new Date(2020, 5, 1), value: 1 }
];

export const Base: Story<AdaptationRangeProps> = Template.bind({});
Base.args = {
    data: data,
    limits: new Range(new Date(2020, 0, 1), new Date(2020, 5, 1)),
    current: new Range(new Date(2020, 2, 1), new Date(2020, 5, 1)),
    isRange: true,
    onChange: nul,
    trainingEnd: new Date(2020, 4, 1),
    onTrainingEndChange: nul
};
