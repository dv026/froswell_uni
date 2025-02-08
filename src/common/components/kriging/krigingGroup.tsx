import React from 'react';

type GroupProps = React.PropsWithChildren<{ text: string }>;

export const Group: React.FC<GroupProps> = ({ children, text }: GroupProps) => (
    <div className='kriging__group group'>
        <div className='group__title'>
            <div className='group__title-text'>{text}</div>
        </div>
        <div className='group__content'>{children}</div>
    </div>
);
