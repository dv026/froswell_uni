import React from 'react';

import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

import { DirectedStages, DirectedStagesProps } from '../../../../src/common/components/directedStages';
import { nul } from '../../../../src/common/helpers/ramda';
import { DirectedStageEnum } from '../../../../src/proxy/enums/directedStageEnum';

export default {
    title: 'Common/Components/DirectedStages',
    component: DirectedStages
} as ComponentMeta<typeof DirectedStages>;

const Template: ComponentStory<typeof DirectedStages> = args => {
    //const stage = React.useState(DirectedStageEnum.Preparation);

    return (
        <div style={{ width: '1000px', height: '200px', padding: '15px', border: '2px dashed red' }}>
            <DirectedStages {...args} />
        </div>
    );
};

const stages = [
    DirectedStageEnum.Preparation,
    DirectedStageEnum.CreateModel,
    DirectedStageEnum.WellGrid,
    DirectedStageEnum.Permeability,
    DirectedStageEnum.Calculation
];

export const Stages: Story<DirectedStagesProps> = Template.bind({});
Stages.args = {
    stages: stages,
    current: DirectedStageEnum.Preparation,
    onClick: nul
};
