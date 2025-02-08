import React, { FC } from 'react';

import { Button, ButtonGroup, Flex } from '@chakra-ui/react';
import { equals, map } from 'ramda';

import { DisplayModeEnum, getLabel } from '../../enums/displayModeEnum';
import { nul } from '../../helpers/ramda';

interface Props {
    disabled?: boolean;
    onChange: (v: DisplayModeEnum) => void;
    tabIndex?: number | boolean;
    value: DisplayModeEnum;
    modes: DisplayModeEnum[];
}

const modeClick = (fn: (p: DisplayModeEnum) => void, disabled: boolean, type: DisplayModeEnum) =>
    disabled ? nul : () => fn(type);

export const DisplayModes: FC<Props> = (p: Props) => (
    <Flex>
        <ButtonGroup spacing='8' variant='tabUnderline'>
            {map((mode: DisplayModeEnum) => {
                return (
                    <Button
                        key={mode}
                        isActive={equals(p.value, mode)}
                        isDisabled={p.disabled}
                        onClick={modeClick(p.onChange, p.disabled, mode)}
                    >
                        {getLabel(mode)}
                    </Button>
                );
            }, p.modes)}
        </ButtonGroup>
    </Flex>
);
