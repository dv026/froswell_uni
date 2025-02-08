import React, { ChangeEvent, FC, useCallback } from 'react';

import { Checkbox } from '@chakra-ui/react';

import { ItemProps } from '../item/item';

export const MultipleCheckbox: FC<ItemProps> = (props: ItemProps) => {
    const { item, onCheckbox } = props;

    const onChangeHandler = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onCheckbox(item.id, e.target.checked, item.type);
        },
        [item.id, item.type, onCheckbox]
    );

    if (!item.multipleSelection) {
        return null;
    }

    return (
        <Checkbox
            zIndex={2}
            pl={'5px'}
            isDisabled={!item.allowChecked}
            isChecked={item.selected}
            onChange={onChangeHandler}
        />
    );
};
