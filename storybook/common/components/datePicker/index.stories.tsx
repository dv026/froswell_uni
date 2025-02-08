import React from 'react';

import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

import { DatePicker, DatePickerProps } from '../../../../src/common/components/datePicker';
import { nul } from '../../../../src/common/helpers/ramda';

export default {
    title: 'Common/Components/DatePicker',
    component: DatePicker
} as ComponentMeta<typeof DatePicker>;

const Template: ComponentStory<typeof DatePicker> = args => {
    return (
        <div style={{ width: '400px', height: '200px', padding: '15px', border: '2px dashed red' }}>
            <DatePicker {...args} />
        </div>
    );
};

export const Stages: Story<DatePickerProps> = Template.bind({});
Stages.args = {
    selected: null,
    onChange: nul
};
