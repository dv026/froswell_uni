import React, { FC, ReactNode } from 'react';

import { map } from 'ramda';

import { cls } from '../../helpers/styles';
import { Tool, ToolProps } from './tool';

import css from './tools.module.less';

type Direction = 'horizontal' | 'vertical';
export interface ToolsGroupProps {
    direction: Direction;
    tools: (ToolProps & { renderContent: () => ReactNode; id: string })[];
}

export const ToolsGroup: FC<ToolsGroupProps> = ({ direction, tools }) => (
    <div className={cls(css.toolsGroup, getDirectionCls(direction))}>
        {map(
            tool => (
                <Tool tooltipText={tool.tooltipText} onClick={tool.onClick} key={tool.id}>
                    {tool.renderContent()}
                </Tool>
            ),
            tools ?? []
        )}
    </div>
);

const getDirectionCls = (direction: Direction) => (direction === 'vertical' ? css.toolsGroup_y : css.toolsGroup_x);
