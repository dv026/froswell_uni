import React from 'react';

import { Input } from '@chakra-ui/react';

interface TitleProps {
    text: string | number;
    disabled: boolean;
    invalid?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Title: React.FC<TitleProps> = (p: TitleProps) => {
    const field = !p.disabled ? <Input type='text' value={p.text} onChange={p.onChange} /> : <span>{p.text}</span>;

    const validation = p.invalid ? (
        <span className='map-tt__validator'>Скважина с таким именем уже существует</span>
    ) : null;

    return (
        <div className='map-tt__title'>
            <div className='map-tt__row map-tt__row_centered'>
                Параметры скважины
                <div className='map-tt__id'>{field}</div>
            </div>
            <div className='map-tt__row map-tt__row_centered'>{validation}</div>
        </div>
    );
};
