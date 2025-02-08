import React, { FC } from 'react';

import { Skeleton } from '@chakra-ui/react';

interface Props {
    show?: boolean;
}

export const Spinner: FC<Props> = (props: Props) => {
    const { show = true } = props;

    if (!show) {
        return null;
    }

    return <Skeleton w='100%' h='100%' zIndex={2} />;
};
