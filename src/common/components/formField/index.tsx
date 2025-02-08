import React, { FC, ReactElement, PropsWithChildren } from 'react';

import { Box, Flex, FormControl, FormLabel } from '@chakra-ui/react';

import { pc } from '../../helpers/styles';

type Position = 'inline' | 'new-line';

interface Props {
    title: string;
    width?: string | number;
    ratio?: number[];
    disabled?: boolean;
    contentPosition?: Position;
}

type ContentProps = PropsWithChildren<Required<Pick<Props, 'contentPosition' | 'ratio'>>>;

export const FormField: FC<PropsWithChildren<Props>> = ({
    children,
    title,
    width,
    ratio = [60, 40],
    disabled = false,
    contentPosition = 'inline'
}) => {
    return (
        <FormControl w={width} variant='brand' display={contentPosition === 'inline' ? 'flex' : 'block'}>
            <FormLabel w={pc(ratio[0])} opacity={disabled ? 0.4 : 1} margin='5px 0'>
                {title ? `${title}:` : null}
            </FormLabel>
            <ContentContainer contentPosition={contentPosition} ratio={ratio}>
                {React.Children.map(children, (child: ReactElement) =>
                    React.cloneElement(child, {
                        disabled: child.props.disabled ?? disabled,
                        isDisabled: child.props.isDisabled ?? disabled
                    })
                )}
            </ContentContainer>
        </FormControl>
    );
};

const ContentContainer: FC<ContentProps> = ({ children, contentPosition, ratio }) =>
    contentPosition === 'inline' ? (
        <Flex w={pc(ratio[1])} alignItems='center'>
            {children}
        </Flex>
    ) : (
        <Box alignItems='center'>{children}</Box>
    );
