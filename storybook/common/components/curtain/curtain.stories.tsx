import React from 'react';

import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

import { Curtain, FoldingCurtain, FoldingCurtainProps } from '../../../../src/common/components/curtain';

export default {
    title: 'Common/Components/Curtain',
    component: FoldingCurtain
} as ComponentMeta<typeof FoldingCurtain>;

const StubContent = () => (
    <div style={{ width: '300px' }}>
        text
        <br />
        text
        <br />
        text
        <br />
        text
        <br />
        text
        <br />
    </div>
);

const StaticTemplate: ComponentStory<typeof Curtain> = args => (
    <div style={{ width: '600px', height: '600px', border: '2px dashed red', position: 'relative' }}>
        <Curtain {...args}>
            <StubContent />
        </Curtain>
    </div>
);

export const Static: Story<FoldingCurtainProps> = StaticTemplate.bind({});
Static.args = {
    position: 'bottom-left'
};

const FoldingTemplate: ComponentStory<typeof FoldingCurtain> = args => (
    <div style={{ width: '600px', height: '600px', border: '2px dashed red', position: 'relative' }}>
        <FoldingCurtain {...args}>
            <StubContent />
            <StubContent />
            <StubContent />
        </FoldingCurtain>
    </div>
);

export const Folding: Story<FoldingCurtainProps> = FoldingTemplate.bind({});
Folding.args = {
    btnLabel: 'Открыть',
    position: 'top-left'
};
