import React from 'react';

import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

import { DateRange, DateRangeProps } from '../../../../src/common/components/dateRange';
import { ParamDate } from '../../../../src/common/entities/paramDate';
import { Range } from '../../../../src/common/entities/range';
import { nul } from '../../../../src/common/helpers/ramda';

export default {
    title: 'Common/Components/DateRange',
    component: DateRange
} as ComponentMeta<typeof DateRange>;

const Template: ComponentStory<typeof DateRange> = args => (
    <>
        <div style={{ width: '500px', height: '200px', padding: '15px', border: '2px dashed red' }}>
            <DateRange {...args} />
        </div>

        <div style={{ marginTop: '100px', width: '500px', height: '80px', padding: '15px', border: '2px dashed red' }}>
            <DateRange {...args} />
        </div>

        <div style={{ marginTop: '100px', width: '500px', height: '80px', padding: '15px', border: '2px dashed red' }}>
            <DateRange {...args} size={'xs'} />
        </div>
    </>
);

const data: ParamDate[] = [
    { date: new Date(2020, 0, 1), value: 1 },
    { date: new Date(2020, 1, 1), value: 2 },
    { date: new Date(2020, 2, 1), value: 3 },
    { date: new Date(2020, 3, 1), value: 4 },
    { date: new Date(2020, 4, 1), value: 3 },
    { date: new Date(2020, 5, 1), value: 1 }
];

export const SingleDate: Story<DateRangeProps<Date>> = Template.bind({});
SingleDate.args = {
    data: data,
    limits: new Range(new Date(2020, 0, 1), new Date(2020, 5, 1)),
    current: new Date(2020, 2, 1),
    isRange: false,
    onChange: nul
};

export const RangeOfDates: Story<DateRangeProps<Range<Date>>> = Template.bind({});
RangeOfDates.args = {
    data: data,
    limits: new Range(new Date(2020, 0, 1), new Date(2020, 5, 1)),
    current: new Range(new Date(2020, 2, 1), new Date(2020, 3, 1)),
    isRange: true,
    onChange: nul,
    showEdges: { min: true, max: false }
};
